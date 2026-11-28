"""Hash de senha (PBKDF2-SHA256) e tokens JWT (HS256), só com a biblioteca padrão."""
import base64
import hashlib
import hmac
import json
import secrets
import time

from .config import cfg

MAX_SENHA_BYTES = 72  # mantido do projeto anterior (limite do bcrypt)


def _b64(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode("ascii")


def _unb64(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


# ---------------- senha ----------------
def hash_senha(senha: str) -> str:
    sal = secrets.token_bytes(16)
    it = cfg.PBKDF2_ITER
    h = hashlib.pbkdf2_hmac("sha256", senha.encode("utf-8"), sal, it)
    return f"pbkdf2_sha256${it}${_b64(sal)}${_b64(h)}"


def hash_antigo(senha_hash: str) -> bool:
    """Hash bcrypt de versões antigas do projeto (FastAPI)."""
    return senha_hash.startswith("$2")


def verificar_senha(senha: str, senha_hash: str) -> bool:
    dados = senha.encode("utf-8")
    if len(dados) > MAX_SENHA_BYTES:
        return False
    if hash_antigo(senha_hash):  # só funciona se o pacote bcrypt existir; senão, falha com segurança
        try:
            import bcrypt  # type: ignore

            return bcrypt.checkpw(dados, senha_hash.encode("utf-8"))
        except Exception:  # noqa: BLE001
            return False
    try:
        algoritmo, it, sal, esperado = senha_hash.split("$")
        if algoritmo != "pbkdf2_sha256":
            return False
        h = hashlib.pbkdf2_hmac("sha256", dados, _unb64(sal), int(it))
        return hmac.compare_digest(_b64(h), esperado)
    except (ValueError, TypeError):
        return False


# ---------------- JWT ----------------
def _assinar(msg: bytes) -> str:
    return _b64(hmac.new(cfg.SECRET_KEY.encode("utf-8"), msg, hashlib.sha256).digest())


def criar_token(usuario_id: int) -> str:
    cab = _b64(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    exp = int(time.time()) + cfg.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    corpo = _b64(json.dumps({"sub": str(usuario_id), "exp": exp}, separators=(",", ":")).encode())
    return f"{cab}.{corpo}.{_assinar(f'{cab}.{corpo}'.encode())}"


def ler_token(token: str) -> int | None:
    """Devolve o id do usuário do token, ou None se for inválido/expirado."""
    try:
        cab, corpo, assinatura = token.split(".")
        if not hmac.compare_digest(_assinar(f"{cab}.{corpo}".encode()), assinatura):
            return None
        if json.loads(_unb64(cab)).get("alg") != "HS256":
            return None
        payload = json.loads(_unb64(corpo))
        if int(payload["exp"]) < time.time():
            return None
        return int(payload["sub"])
    except (ValueError, KeyError, TypeError):
        return None
