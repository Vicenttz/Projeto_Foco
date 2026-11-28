from datetime import datetime, timezone

from app import db, seed
from app.seguranca import hash_senha


def _admin(client):
    con = db.conectar()
    db.inserir(con, "usuarios", {"nome": "Chefe", "email": "chefe@example.com", "senha_hash": hash_senha("senha1234"),
                                 "papel": "admin", "criado_em": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")})
    con.commit()
    con.close()
    r = client.post("/api/auth/login", json={"email": "chefe@example.com", "senha": "senha1234"})
    return {"Authorization": f"Bearer {r.json()['token']}"}


def test_usuario_comum_nao_acessa_admin(client, ana):
    assert client.get("/api/admin/usuarios", headers=ana).status_code == 403
    assert client.get("/api/admin/resumo", headers=ana).status_code == 403


def test_admin_lista_resumo_e_altera_papel(client, ana):
    h = _admin(client)
    usuarios = client.get("/api/admin/usuarios", headers=h).json()
    assert {u["email"] for u in usuarios} == {"ana@example.com", "chefe@example.com"}
    assert client.get("/api/admin/resumo", headers=h).json()["totalUsuarios"] == 2
    ana_id = next(u["id"] for u in usuarios if u["email"] == "ana@example.com")
    r = client.put(f"/api/admin/usuarios/{ana_id}", headers=h, json={"papel": "admin"})
    assert r.status_code == 200 and r.json()["papel"] == "admin"


def test_admin_nao_remove_a_si_mesmo(client):
    h = _admin(client)
    meu_id = client.get("/api/auth/me", headers=h).json()["id"]
    assert client.delete(f"/api/admin/usuarios/{meu_id}", headers=h).status_code == 422
    assert client.put(f"/api/admin/usuarios/{meu_id}", headers=h, json={"papel": "usuario"}).status_code == 422


def test_admin_exclui_usuario_e_dados(client, ana):
    client.post("/api/disciplinas", headers=ana, json={"nome": "Física"})
    h = _admin(client)
    ana_id = next(u["id"] for u in client.get("/api/admin/usuarios", headers=h).json() if u["email"] == "ana@example.com")
    assert client.delete(f"/api/admin/usuarios/{ana_id}", headers=h).status_code == 204
    assert client.post("/api/auth/login", json={"email": "ana@example.com", "senha": "senha1234"}).status_code == 401


def test_contas_de_teste_funcionam(client):
    seed.inicializar(seed=True)
    seed.inicializar(seed=True)  # idempotente: rodar duas vezes não duplica
    aluno = client.post("/api/auth/login", json={"email": "aluno@foco.com", "senha": "Aluno@123"})
    admin = client.post("/api/auth/login", json={"email": "admin@foco.com", "senha": "Admin@123"})
    assert aluno.status_code == 200 and aluno.json()["usuario"]["papel"] == "usuario"
    assert admin.status_code == 200 and admin.json()["usuario"]["papel"] == "admin"
    h = {"Authorization": f"Bearer {aluno.json()['token']}"}
    dash = client.get("/api/dashboard", headers=h).json()
    assert dash["resumoTarefas"]["total"] == 6 and len(dash["disciplinas"]) == 3
    assert client.get("/api/admin/usuarios", headers=h).status_code == 403


def test_frontend_nao_engole_rotas_da_api(client):
    assert client.get("/api/rota-inexistente").status_code == 404
    assert client.get("/dashboard").status_code == 200  # rota do Angular (ou aviso, se não compilado)
