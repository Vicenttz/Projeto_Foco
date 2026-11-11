import os

# Antes de importar o app: os testes usam SQLite em memória e nunca tocam no MySQL.
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["SECRET_KEY"] = "chave-de-teste-com-mais-de-trinta-e-dois-caracteres"

import pytest
from fastapi.testclient import TestClient

import app.models  # noqa: F401,E402
from app.database import Base, engine  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(autouse=True)
def banco_limpo():
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)


@pytest.fixture
def client():
    return TestClient(app)


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
