"""Testes do backend (biblioteca padrão): sobem o servidor de verdade numa porta livre e falam com ele por HTTP."""
import http.client
import json
import os
import tempfile
import threading
from pathlib import Path

# Antes de importar o app: banco temporário (nunca toca no foco.db) e hash de senha rápido.
_TMP = Path(tempfile.mkdtemp(prefix="foco-testes-"))
os.environ["FOCO_DB"] = str(_TMP / "teste.db")
os.environ["SECRET_KEY"] = "chave-de-teste-com-mais-de-trinta-e-dois-caracteres"
os.environ["FOCO_PBKDF2_ITER"] = "1000"
os.environ["GEMINI_API_KEY"] = ""
os.environ["SEED_DEMO"] = "false"

import pytest  # noqa: E402

from app import seed  # noqa: E402
from app.config import cfg  # noqa: E402
from app.servidor import criar_servidor  # noqa: E402


class Resposta:
    def __init__(self, status: int, corpo: bytes, headers):
        self.status_code, self.content, self.headers = status, corpo, headers

    @property
    def text(self) -> str:
        return self.content.decode("utf-8")

    def json(self):
        return json.loads(self.content.decode("utf-8"))


class Cliente:
    def __init__(self, porta: int):
        self.porta = porta

    def request(self, metodo, url, json=None, headers=None):  # noqa: A002
        corpo = None if json is None else __import__("json").dumps(json).encode("utf-8")
        cab = {"Content-Type": "application/json", **(headers or {})}
        con = http.client.HTTPConnection("127.0.0.1", self.porta, timeout=20)
        try:
            con.request(metodo, url, body=corpo, headers=cab)
            r = con.getresponse()
            return Resposta(r.status, r.read(), r.headers)
        finally:
            con.close()

    def get(self, url, headers=None): return self.request("GET", url, headers=headers)
    def post(self, url, json=None, headers=None): return self.request("POST", url, json, headers)  # noqa: A002
    def put(self, url, json=None, headers=None): return self.request("PUT", url, json, headers)  # noqa: A002
    def delete(self, url, headers=None): return self.request("DELETE", url, headers=headers)
    def options(self, url, headers=None): return self.request("OPTIONS", url, headers=headers)


@pytest.fixture(scope="session", autouse=True)
def servidor():
    srv = criar_servidor(0)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    yield srv
    srv.shutdown()
    srv.server_close()


@pytest.fixture(autouse=True)
def banco_limpo():
    Path(cfg.DB_PATH).unlink(missing_ok=True)
    seed.garantir_schema()
    yield


@pytest.fixture
def client(servidor):
    return Cliente(servidor.server_address[1])


@pytest.fixture
def criar_usuario(client):
    """Cadastra e faz login; devolve os headers de autorização."""

    def _criar(nome="Ana", email="ana@example.com", senha="senha1234"):
        r = client.post("/api/auth/cadastro", json={"nome": nome, "email": email, "senha": senha})
        assert r.status_code == 201, r.text
        r = client.post("/api/auth/login", json={"email": email, "senha": senha})
        assert r.status_code == 200, r.text
        return {"Authorization": f"Bearer {r.json()['token']}"}

    return _criar


@pytest.fixture
def ana(criar_usuario):
    return criar_usuario()


@pytest.fixture
def bruno(criar_usuario):
    return criar_usuario("Bruno", "bruno@example.com")
