def test_tarefa_crud_camelcase(client, ana):
    disc = client.post("/api/disciplinas", json={"nome": "Cálculo I", "professor": "Silva"}, headers=ana).json()
    r = client.post(
        "/api/tarefas",
        json={"titulo": "Lista 3", "disciplinaId": disc["id"], "prioridade": "alta", "prazo": "2026-11-12", "status": "pendente"},
        headers=ana,
    )
    assert r.status_code == 201
    t = r.json()
    assert t["disciplinaId"] == disc["id"] and t["prazo"] == "2026-11-12"
    assert "disciplina_id" not in t

    r = client.put(f"/api/tarefas/{t['id']}", json={"status": "concluida"}, headers=ana)
    assert r.status_code == 200 and r.json()["status"] == "concluida" and r.json()["titulo"] == "Lista 3"

    assert client.get(f"/api/tarefas?status=concluida&disciplinaId={disc['id']}", headers=ana).json()[0]["id"] == t["id"]
    assert client.get("/api/tarefas?status=pendente", headers=ana).json() == []

    r = client.delete(f"/api/tarefas/{t['id']}", headers=ana)
    assert r.status_code == 204 and r.content == b""
    assert client.get(f"/api/tarefas/{t['id']}", headers=ana).status_code == 404


def test_enum_invalido_422(client, ana):
    r = client.post("/api/tarefas", json={"titulo": "x", "prioridade": "urgente", "prazo": "2026-11-12"}, headers=ana)
    assert r.status_code == 422 and isinstance(r.json()["detail"], str)


def test_disciplina_progresso_calculado_e_delete_mantem_tarefas(client, ana):
    d = client.post("/api/disciplinas", json={"nome": "BD"}, headers=ana).json()
    for status in ("concluida", "pendente"):
        client.post("/api/tarefas", json={"titulo": "t", "disciplinaId": d["id"], "prazo": "2026-11-20", "status": status}, headers=ana)
    assert client.get(f"/api/disciplinas/{d['id']}", headers=ana).json()["progresso"] == 50
    assert client.delete(f"/api/disciplinas/{d['id']}", headers=ana).status_code == 204
    tarefas = client.get("/api/tarefas", headers=ana).json()
    assert len(tarefas) == 2 and all(t["disciplinaId"] is None for t in tarefas)


def test_projeto_com_etapas_e_progresso(client, ana):
    r = client.post(
        "/api/projetos",
        json={"nome": "FOCO", "dataEntrega": "2026-12-05", "etapas": [{"titulo": "A", "concluida": True}, {"titulo": "B"}]},
        headers=ana,
    )
    assert r.status_code == 201
    p = r.json()
    assert p["progresso"] == 50 and [e["titulo"] for e in p["etapas"]] == ["A", "B"]

    etapas = [{"id": p["etapas"][0]["id"], "titulo": "A", "concluida": True}, {"titulo": "C", "concluida": True}]
    r = client.put(f"/api/projetos/{p['id']}", json={"etapas": etapas}, headers=ana)
    novo = r.json()
    assert novo["progresso"] == 100 and [e["titulo"] for e in novo["etapas"]] == ["A", "C"]
    assert novo["etapas"][0]["id"] == p["etapas"][0]["id"]
    assert client.delete(f"/api/projetos/{p['id']}", headers=ana).status_code == 204


def test_trilha_e_evento(client, ana):
    r = client.post("/api/trilhas", json={"assunto": "Angular", "etapas": [{"titulo": "Rotas", "concluida": True}]}, headers=ana)
    assert r.status_code == 201 and r.json()["progresso"] == 100
    r = client.post("/api/eventos", json={"titulo": "Prova", "data": "2026-11-18", "tipo": "evento"}, headers=ana)
    assert r.status_code == 201 and r.json()["tipo"] == "evento"
    assert len(client.get("/api/trilhas", headers=ana).json()) == 1
    assert len(client.get("/api/eventos", headers=ana).json()) == 1


def test_isolamento_entre_usuarios(client, ana, bruno):
    t = client.post("/api/tarefas", json={"titulo": "Da Ana", "prazo": "2026-11-12"}, headers=ana).json()
    d = client.post("/api/disciplinas", json={"nome": "Da Ana"}, headers=ana).json()
    p = client.post("/api/projetos", json={"nome": "Da Ana", "dataEntrega": "2026-12-01"}, headers=ana).json()
    tr = client.post("/api/trilhas", json={"assunto": "Da Ana"}, headers=ana).json()
    e = client.post("/api/eventos", json={"titulo": "Da Ana", "data": "2026-11-30"}, headers=ana).json()

    for rota, obj in (("tarefas", t), ("disciplinas", d), ("projetos", p), ("trilhas", tr), ("eventos", e)):
        url = f"/api/{rota}/{obj['id']}"
        assert client.get(url, headers=bruno).status_code == 404
        assert client.put(url, json={}, headers=bruno).status_code == 404
        assert client.delete(url, headers=bruno).status_code == 404
        assert client.get(f"/api/{rota}", headers=bruno).json() == []
        assert client.get(url, headers=ana).status_code == 200  # continua existindo para a dona

    # Bruno não pode usar a disciplina da Ana numa tarefa dele
    r = client.post("/api/tarefas", json={"titulo": "x", "disciplinaId": d["id"], "prazo": "2026-11-12"}, headers=bruno)
    assert r.status_code == 404
    # nem colocar a tarefa da Ana em foco
    assert client.put(f"/api/foco/{t['id']}", headers=bruno).status_code == 404


def _trilha(client, h, assunto="SQL", etapas=(("a", True), ("b", False)), **extra):
    corpo = {"assunto": assunto, "etapas": [{"titulo": t, "concluida": c} for t, c in etapas], **extra}
    return client.post("/api/trilhas", json=corpo, headers=h).json()


def test_disciplina_com_descricao_e_trilhas_vinculadas(client, ana):
    t1 = _trilha(client, ana, "SQL")
    d = client.post("/api/disciplinas", headers=ana,
                    json={"nome": "BD", "descricao": "Modelagem e SQL", "trilhaIds": [t1["id"]]}).json()
    assert d["descricao"] == "Modelagem e SQL"
    assert [t["id"] for t in d["trilhas"]] == [t1["id"]] and d["totalEtapas"] == 2 and d["etapasConcluidas"] == 1
    assert d["progresso"] == 50
    assert client.get(f"/api/trilhas/{t1['id']}", headers=ana).json()["disciplinaId"] == d["id"]


def test_progresso_da_disciplina_sobe_ao_concluir_etapas_da_trilha(client, ana):
    d = client.post("/api/disciplinas", json={"nome": "BD"}, headers=ana).json()
    t = _trilha(client, ana, "SQL", etapas=(("a", False), ("b", False), ("c", False), ("d", False)), disciplinaId=d["id"])
    assert client.get(f"/api/disciplinas/{d['id']}", headers=ana).json()["progresso"] == 0
    etapas = [{**e, "concluida": i < 3} for i, e in enumerate(t["etapas"])]
    client.put(f"/api/trilhas/{t['id']}", json={"etapas": etapas}, headers=ana)
    assert client.get(f"/api/disciplinas/{d['id']}", headers=ana).json()["progresso"] == 75
    lista = client.get("/api/disciplinas", headers=ana).json()
    assert lista[0]["progresso"] == 75 and lista[0]["trilhas"][0]["progresso"] == 75


def test_disciplina_sem_trilha_continua_usando_tarefas(client, ana):
    d = client.post("/api/disciplinas", json={"nome": "BD"}, headers=ana).json()
    client.post("/api/tarefas", json={"titulo": "t", "disciplinaId": d["id"], "prazo": "2026-11-20", "status": "concluida"}, headers=ana)
    assert client.get(f"/api/disciplinas/{d['id']}", headers=ana).json()["progresso"] == 100


def test_trocar_e_remover_vinculos_e_excluir_disciplina_mantem_trilha(client, ana):
    t1, t2 = _trilha(client, ana, "A"), _trilha(client, ana, "B")
    d = client.post("/api/disciplinas", json={"nome": "BD", "trilhaIds": [t1["id"]]}, headers=ana).json()
    d = client.put(f"/api/disciplinas/{d['id']}", json={"trilhaIds": [t2["id"]]}, headers=ana).json()
    assert [t["id"] for t in d["trilhas"]] == [t2["id"]]
    assert client.get(f"/api/trilhas/{t1['id']}", headers=ana).json()["disciplinaId"] is None
    assert client.put(f"/api/disciplinas/{d['id']}", json={"nome": "BD2"}, headers=ana).json()["trilhas"][0]["id"] == t2["id"]
    assert client.put(f"/api/trilhas/{t2['id']}", json={"disciplinaId": None}, headers=ana).json()["disciplinaId"] is None
    assert client.get(f"/api/disciplinas/{d['id']}", headers=ana).json()["trilhas"] == []
    client.put(f"/api/trilhas/{t2['id']}", json={"disciplinaId": d["id"]}, headers=ana)
    assert client.delete(f"/api/disciplinas/{d['id']}", headers=ana).status_code == 204
    assert client.get(f"/api/trilhas/{t2['id']}", headers=ana).json()["disciplinaId"] is None


def test_nao_vincula_trilha_ou_disciplina_de_outro_usuario(client, ana, bruno):
    t = _trilha(client, ana, "da Ana")
    d = client.post("/api/disciplinas", json={"nome": "da Ana"}, headers=ana).json()
    assert client.post("/api/disciplinas", json={"nome": "x", "trilhaIds": [t["id"]]}, headers=bruno).status_code == 404
    assert client.post("/api/trilhas", json={"assunto": "x", "disciplinaId": d["id"]}, headers=bruno).status_code == 404
