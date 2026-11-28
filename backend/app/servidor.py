"""Servidor HTTP (biblioteca padrão): API em /api/* e o site Angular já compilado (backend/static)."""
import json
import mimetypes
import re
import sys
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlsplit

from . import db, seed
from .config import cfg
from .erros import Erro
from .roteador import ROTAS, Contexto
from .seguranca import ler_token

from .rotas import admin, assistente, auth, foco, recursos  # noqa: F401  (registram as rotas)

# O Windows às vezes mapeia .js para text/plain (via registro), e o navegador recusa o módulo. Fixamos os tipos.
TIPOS = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
         ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
         ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".ico": "image/x-icon", ".webp": "image/webp",
         ".woff": "font/woff", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".map": "application/json"}
_HASHEADO = re.compile(r"-[A-Z0-9]{8}\.(js|css)$")  # arquivos do build do Angular (nome muda a cada versão)


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "FOCO"

    def log_message(self, *args):  # sem ruído no terminal
        pass

    # ---------- resposta ----------
    def _cors(self) -> list[tuple[str, str]]:
        origem = self.headers.get("Origin")
        if origem and origem in cfg.CORS_ORIGINS:
            return [("Access-Control-Allow-Origin", origem), ("Vary", "Origin")]
        return []

    def _enviar(self, status: int, corpo: bytes = b"", tipo: str | None = None, extras=()) -> None:
        self.send_response(status)
        if tipo:
            self.send_header("Content-Type", tipo)
        self.send_header("Content-Length", str(len(corpo)))
        self.send_header("X-Content-Type-Options", "nosniff")
        for k, v in (*self._cors(), *extras):
            self.send_header(k, v)
        self.end_headers()
        if self.command != "HEAD" and status not in (204, 304):
            self.wfile.write(corpo)

    def _json(self, status: int, dados, extras=()) -> None:
        if status == 204:
            return self._enviar(204, extras=extras)
        self._enviar(status, json.dumps(dados, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8", extras)

    # ---------- entrada ----------
    def do_GET(self): self._tratar()
    def do_HEAD(self): self._tratar()
    def do_POST(self): self._tratar()
    def do_PUT(self): self._tratar()
    def do_DELETE(self): self._tratar()
    def do_PATCH(self): self._tratar()

    def do_OPTIONS(self):  # pré-voo de CORS (só importa se o Angular rodar separado, em ng serve)
        extras = [("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"),
                  ("Access-Control-Allow-Headers", self.headers.get("Access-Control-Request-Headers") or "*"),
                  ("Access-Control-Max-Age", "600")]
        self._enviar(200, b"", extras=extras)

    def _tratar(self) -> None:
        try:
            url = urlsplit(self.path)
            caminho = unquote(url.path)
            if caminho == "/api" or caminho.startswith("/api/"):
                self._api(caminho.rstrip("/") or "/api", {k: v[-1] for k, v in parse_qs(url.query).items()})
            elif self.command in ("GET", "HEAD"):
                self._estatico(caminho)
            else:
                self._json(405, {"detail": "Method Not Allowed"})
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass  # o navegador fechou a conexão
        except Exception:  # noqa: BLE001
            traceback.print_exc()
            try:
                self._json(500, {"detail": "Erro interno do servidor"})
            except OSError:
                pass

    # ---------- API ----------
    def _corpo_json(self) -> dict:
        n = int(self.headers.get("Content-Length") or 0)
        if n <= 0:
            return {}
        if n > 5_000_000:
            raise Erro(413, "Corpo da requisição grande demais")
        try:
            dados = json.loads(self.rfile.read(n).decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            raise Erro(422, "JSON inválido") from None
        if not isinstance(dados, dict):
            raise Erro(422, "O corpo deve ser um objeto JSON")
        return dados

    def _usuario(self, con):
        nao_auth = Erro(401, "Não autenticado", {"WWW-Authenticate": "Bearer"})
        cab = self.headers.get("Authorization", "")
        partes = cab.split(" ", 1)
        if len(partes) != 2 or partes[0].lower() != "bearer":
            raise nao_auth
        uid = ler_token(partes[1].strip())
        u = db.um(con, "SELECT * FROM usuarios WHERE id = ?", (uid,)) if uid is not None else None
        if u is None:
            raise nao_auth
        return u

    def _api(self, caminho: str, query: dict) -> None:
        corpo_bruto = None
        try:
            if caminho == "/api/health":
                return self._json(200, {"status": "ok"})
            candidatas = [(m, r.match(caminho), fn, a) for m, r, fn, a in ROTAS if r.match(caminho)]
            if not candidatas:
                raise Erro(404, "Rota não encontrada")
            escolhida = next((c for c in candidatas if c[0] == self.command), None)
            if escolhida is None:
                raise Erro(405, "Method Not Allowed")
            _, achou, fn, nivel = escolhida
            con = db.conectar()
            try:
                ctx = Contexto(con=con, query=query, params={k: int(v) for k, v in achou.groupdict().items()})
                if nivel:
                    ctx.usuario = self._usuario(con)
                    if nivel == "admin" and ctx.usuario["papel"] != "admin":
                        raise Erro(403, "Acesso restrito a administradores")
                if self.command in ("POST", "PUT", "PATCH"):
                    ctx.corpo = self._corpo_json()
                resultado = fn(ctx)
            except Exception:
                con.rollback()
                raise
            finally:
                con.close()
            status, dados = resultado if isinstance(resultado, tuple) else (200, resultado)
            self._json(status, dados)
        except Erro as e:
            self._json(e.status, {"detail": e.detail}, list(e.headers.items()))

    # ---------- site compilado ----------
    def _estatico(self, caminho: str) -> None:
        raiz = Path(cfg.FRONTEND_DIR).resolve()
        index = raiz / "index.html"
        if not index.is_file():
            return self._json(200, {"mensagem": "API do FOCO no ar, mas o frontend compilado não foi encontrado.",
                                    "como_resolver": "Rode `python iniciar.py --rebuild` (precisa do Node.js) ou use `ng serve` em frontend/."})
        alvo = (raiz / caminho.lstrip("/")).resolve()
        if not (caminho not in ("", "/") and alvo.is_file() and raiz in alvo.parents):
            alvo = index  # rotas do Angular (/dashboard, /login...) caem no index.html
        dados = alvo.read_bytes()
        extras = [("Cache-Control", "public, max-age=31536000, immutable" if _HASHEADO.search(alvo.name) else "no-cache")]
        tipo = TIPOS.get(alvo.suffix.lower()) or mimetypes.guess_type(alvo.name)[0] or "application/octet-stream"
        self._enviar(200, dados, tipo, extras)


class Servidor(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def criar_servidor(porta: int, host: str = "127.0.0.1") -> Servidor:
    return Servidor((host, porta), Handler)


def main(porta: int = 8000, host: str = "127.0.0.1") -> None:
    seed.inicializar(seed=cfg.SEED_DEMO)  # cria as tabelas (se faltarem) e as contas de teste
    srv = criar_servidor(porta, host)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        srv.server_close()


if __name__ == "__main__":
    main(int(sys.argv[1]) if len(sys.argv) > 1 else 8000)
