def test_cadastro_nao_devolve_senha(client):
    r = client.post("/api/auth/cadastro", json={"nome": "Ana", "email": "Ana@Example.com", "senha": "senha1234"})
    assert r.status_code == 201
    corpo = r.json()
    assert corpo["email"] == "ana@example.com"
    assert set(corpo) == {"id", "nome", "email"}


def test_email_duplicado(client, ana):
    r = client.post("/api/auth/cadastro", json={"nome": "Outra", "email": "ana@example.com", "senha": "senha1234"})
    assert r.status_code == 409
    assert isinstance(r.json()["detail"], str)


def test_login_e_me(client):
    client.post("/api/auth/cadastro", json={"nome": "Ana", "email": "ana@example.com", "senha": "senha1234"})
    r = client.post("/api/auth/login", json={"email": "ana@example.com", "senha": "senha1234"})
    assert r.status_code == 200
    dados = r.json()
    assert dados["usuario"]["nome"] == "Ana" and "senha" not in dados["usuario"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {dados['token']}"})
    assert me.status_code == 200 and me.json()["email"] == "ana@example.com"


def test_login_invalido(client, ana):
    r = client.post("/api/auth/login", json={"email": "ana@example.com", "senha": "errada123"})
    assert r.status_code == 401
    r = client.post("/api/auth/login", json={"email": "naoexiste@example.com", "senha": "senha1234"})
    assert r.status_code == 401


def test_sem_token_ou_token_invalido(client):
    assert client.get("/api/tarefas").status_code == 401
    r = client.get("/api/tarefas", headers={"Authorization": "Bearer lixo"})
    assert r.status_code == 401 and r.json() == {"detail": "Não autenticado"}


def test_validacao_422_com_detail_texto(client):
    r = client.post("/api/auth/cadastro", json={"nome": "Ana", "email": "invalido", "senha": "123"})
    assert r.status_code == 422
    assert isinstance(r.json()["detail"], str)


def test_cors_para_o_angular(client):
    r = client.options(
        "/api/auth/login",
        headers={"Origin": "http://localhost:4200", "Access-Control-Request-Method": "POST"},
    )
    assert r.headers.get("access-control-allow-origin") == "http://localhost:4200"
