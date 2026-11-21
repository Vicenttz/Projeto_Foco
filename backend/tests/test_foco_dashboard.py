from datetime import date, timedelta


def _tarefa(client, h, titulo, prioridade="media", prazo="2026-11-20", status="pendente"):
    r = client.post("/api/tarefas", json={"titulo": titulo, "prioridade": prioridade, "prazo": prazo, "status": status}, headers=h)
    return r.json()


def test_foco_ordena_por_prioridade_e_permite_escolher(client, ana):
    baixa = _tarefa(client, ana, "baixa", "baixa", "2026-11-10")
    alta = _tarefa(client, ana, "alta", "alta", "2026-11-30")
    _tarefa(client, ana, "feita", "alta", "2026-11-01", "concluida")

    foco = client.get("/api/foco", headers=ana).json()
    assert [t["titulo"] for t in foco["prioridades"]] == ["alta", "baixa"]
    assert foco["atual"]["id"] == alta["id"] and foco["progresso"] == 0

    foco = client.put(f"/api/foco/{baixa['id']}", headers=ana).json()
    assert foco["atual"]["id"] == baixa["id"]

    client.put(f"/api/tarefas/{baixa['id']}", json={"status": "em_andamento"}, headers=ana)
    assert client.get("/api/foco", headers=ana).json()["progresso"] == 50

    assert client.delete("/api/foco", headers=ana).status_code == 204
    assert client.get("/api/foco", headers=ana).json()["atual"]["id"] == alta["id"]


def test_foco_nao_aceita_tarefa_concluida(client, ana):
    feita = _tarefa(client, ana, "feita", status="concluida")
    assert client.put(f"/api/foco/{feita['id']}", headers=ana).status_code == 422


def test_dashboard(client, ana):
    _tarefa(client, ana, "a", "alta", status="concluida")
    _tarefa(client, ana, "b", "media", "2026-11-15", "em_andamento")
    _tarefa(client, ana, "c", "baixa", "2026-11-12")
    client.post("/api/disciplinas", json={"nome": "Cálculo"}, headers=ana)
    client.post("/api/projetos", json={"nome": "Ativo", "dataEntrega": "2026-12-05"}, headers=ana)
    client.post("/api/projetos", json={"nome": "Pronto", "dataEntrega": "2026-12-05", "status": "concluida"}, headers=ana)
    amanha = (date.today() + timedelta(days=1)).isoformat()
    ontem = (date.today() - timedelta(days=1)).isoformat()
    client.post("/api/eventos", json={"titulo": "Futuro", "data": amanha}, headers=ana)
    client.post("/api/eventos", json={"titulo": "Passado", "data": ontem}, headers=ana)

    d = client.get("/api/dashboard", headers=ana).json()
    assert d["usuario"]["email"] == "ana@example.com"
    assert d["resumoTarefas"] == {"total": 3, "pendentes": 2, "emAndamento": 1, "concluidas": 1, "percentualConcluidas": 33}
    assert [t["titulo"] for t in d["proximasTarefas"]] == ["c", "b"]  # por prazo, sem concluídas
    assert d["focoAtual"]["titulo"] == "b"  # media > baixa
    assert [p["nome"] for p in d["projetosAtivos"]] == ["Ativo"]
    assert [e["titulo"] for e in d["proximosEventos"]] == ["Futuro"]
    assert len(d["disciplinas"]) == 1


def test_dashboard_vazio(client, ana):
    d = client.get("/api/dashboard", headers=ana).json()
    assert d["focoAtual"] is None and d["resumoTarefas"]["total"] == 0


def test_assistente_provisorio(client, ana):
    assert client.post("/api/assistente/mensagem", json={"texto": "oi"}, headers=ana).status_code == 200
    assert client.post("/api/assistente/mensagem", json={"texto": "oi"}).status_code == 401
