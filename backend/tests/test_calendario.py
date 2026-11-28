"""Calendário interativo (provas e estudos) e mensagem diária do assistente."""
import json
from datetime import date

from app import config, db, seed

HOJE = "2026-06-10"  # quarta-feira; a mensagem diária aceita ?data= para os testes serem estáveis


def _ev(client, h, **kw):
    r = client.post("/api/eventos", json={"titulo": "x", "data": HOJE, **kw}, headers=h)
    assert r.status_code == 201, r.text
    return r.json()


def _disc(client, h, nome="Cálculo I"):
    return client.post("/api/disciplinas", json={"nome": nome}, headers=h).json()


def _diario(client, h, hora=9):
    r = client.get(f"/api/assistente/diario?data={HOJE}&hora={hora}", headers=h)
    assert r.status_code == 200, r.text
    return r.json()


# ---------------- eventos ----------------
def test_prova_completa_em_camelcase(client, ana):
    d = _disc(client, ana)
    e = _ev(client, ana, titulo="Prova de Cálculo", tipo="prova", hora="14:30", duracaoMin=120,
            disciplinaId=d["id"], descricao="Capítulos 1 a 4")
    assert e["tipo"] == "prova" and e["hora"] == "14:30" and e["duracaoMin"] == 120
    assert e["disciplinaId"] == d["id"] and e["descricao"] == "Capítulos 1 a 4" and e["concluido"] is False


def test_evento_simples_continua_valido(client, ana):
    e = _ev(client, ana, titulo="Revisão", tipo="evento")
    assert e["hora"] is None and e["duracaoMin"] is None and e["disciplinaId"] is None and e["concluido"] is False


def test_hora_com_segundos_e_hora_vazia(client, ana):
    assert _ev(client, ana, hora="09:00:00")["hora"] == "09:00"
    assert _ev(client, ana, hora="")["hora"] is None


def test_validacoes(client, ana):
    assert client.post("/api/eventos", json={"titulo": "x", "data": HOJE, "tipo": "festa"}, headers=ana).status_code == 422
    r = client.post("/api/eventos", json={"titulo": "x", "data": HOJE, "duracaoMin": 1}, headers=ana)
    assert r.status_code == 422 and isinstance(r.json()["detail"], str)


def test_disciplina_de_outro_usuario_da_404(client, ana, bruno):
    d = _disc(client, ana)
    assert client.post("/api/eventos", json={"titulo": "x", "data": HOJE, "disciplinaId": d["id"]}, headers=bruno).status_code == 404
    meu = _ev(client, bruno)
    assert client.put(f"/api/eventos/{meu['id']}", json={"disciplinaId": d["id"]}, headers=bruno).status_code == 404


def test_put_parcial_e_limpar_campos(client, ana):
    d = _disc(client, ana)
    e = _ev(client, ana, titulo="Estudo", tipo="estudo", hora="19:00", duracaoMin=60, disciplinaId=d["id"])
    r = client.put(f"/api/eventos/{e['id']}", json={"concluido": True}, headers=ana).json()
    assert r["concluido"] is True and r["hora"] == "19:00" and r["titulo"] == "Estudo"
    r = client.put(f"/api/eventos/{e['id']}", json={"hora": None, "disciplinaId": None}, headers=ana).json()
    assert r["hora"] is None and r["disciplinaId"] is None and r["duracaoMin"] == 60
    r = client.put(f"/api/eventos/{e['id']}", json={"data": "2026-06-12"}, headers=ana).json()  # arrastar para outro dia
    assert r["data"] == "2026-06-12"


def test_ordem_e_filtros(client, ana):
    _ev(client, ana, titulo="tarde", hora="15:00", tipo="estudo")
    _ev(client, ana, titulo="dia todo")
    _ev(client, ana, titulo="manhã", hora="08:00", tipo="estudo")
    _ev(client, ana, titulo="prova", data="2026-06-13", tipo="prova")
    nomes = lambda url: [e["titulo"] for e in client.get(url, headers=ana).json()]  # noqa: E731
    assert nomes("/api/eventos") == ["dia todo", "manhã", "tarde", "prova"]
    assert nomes("/api/eventos?tipo=prova") == ["prova"]
    assert nomes("/api/eventos?de=2026-06-11") == ["prova"]
    assert nomes("/api/eventos?ate=2026-06-10") == ["dia todo", "manhã", "tarde"]


def test_excluir_disciplina_limpa_o_evento(client, ana):
    d = _disc(client, ana)
    e = _ev(client, ana, disciplinaId=d["id"])
    assert client.delete(f"/api/disciplinas/{d['id']}", headers=ana).status_code == 204
    assert client.get(f"/api/eventos/{e['id']}", headers=ana).json()["disciplinaId"] is None


def test_migracao_adiciona_colunas_em_banco_antigo():
    con = db.conectar()
    con.execute("DROP TABLE eventos")
    con.execute("CREATE TABLE eventos (id INTEGER PRIMARY KEY, usuario_id INTEGER NOT NULL, "
                "titulo VARCHAR(200) NOT NULL, data DATE NOT NULL, tipo VARCHAR(20) NOT NULL)")
    con.commit()
    con.close()
    seed.garantir_schema()
    con = db.conectar()
    cols = {c["name"] for c in con.execute("PRAGMA table_info(eventos)")}
    con.close()
    assert {"hora", "duracao_min", "disciplina_id", "descricao", "concluido"} <= cols


# ---------------- mensagem diária ----------------
def test_diario_exige_login_e_valida_parametros(client, ana):
    assert client.get("/api/assistente/diario").status_code == 401
    assert client.get("/api/assistente/diario?hora=25", headers=ana).status_code == 422
    assert client.get("/api/assistente/diario?data=ontem", headers=ana).status_code == 422


def test_diario_agenda_livre_e_saudacao(client, ana):
    b = _diario(client, ana, hora=9)
    assert b["saudacao"] == "Bom dia, Ana!" and b["geradoPor"] == "regras" and b["hoje"] == []
    assert "agenda de hoje está livre" in b["texto"]
    assert b["sugestoes"][0]["query"] == {"novo": "estudo", "data": HOJE}
    assert _diario(client, ana, hora=15)["saudacao"].startswith("Boa tarde")
    assert _diario(client, ana, hora=21)["saudacao"].startswith("Boa noite")


def test_diario_prova_sem_estudo_sugere_agendar(client, ana):
    d = _disc(client, ana)
    _ev(client, ana, titulo="Prova de Cálculo", data="2026-06-13", tipo="prova", hora="14:00", disciplinaId=d["id"])
    b = _diario(client, ana)
    assert "Prova de Cálculo é em 3 dias" in b["texto"] and "Ainda não há estudo agendado" in b["texto"]
    s = b["sugestoes"][0]
    assert s["rota"] == "/calendario"
    assert s["query"] == {"novo": "estudo", "data": "2026-06-11", "disciplinaId": str(d["id"])}
    assert b["proximos"][0]["quando"] == "em 3 dias" and b["proximos"][0]["disciplina"] == "Cálculo I"


def test_diario_com_estudo_agendado_nao_cobra(client, ana):
    d = _disc(client, ana)
    _ev(client, ana, titulo="Prova", data="2026-06-13", tipo="prova", disciplinaId=d["id"])
    est = _ev(client, ana, titulo="Estudar", data="2026-06-11", tipo="estudo", disciplinaId=d["id"])
    b = _diario(client, ana)
    assert "Você já agendou 1 sessão de estudo" in b["texto"] and b["sugestoes"] == []
    client.put(f"/api/eventos/{est['id']}", json={"concluido": True}, headers=ana)  # concluída não conta
    assert len(_diario(client, ana)["sugestoes"]) == 1


def test_diario_lista_hoje_e_isola_usuarios(client, ana, bruno):
    _ev(client, ana, titulo="Estudo de SQL", tipo="estudo", hora="19:00")
    _ev(client, bruno, titulo="Segredo do Bruno", tipo="prova")
    b = _diario(client, ana)
    assert "Hoje na sua agenda: Estudo de SQL às 19:00." in b["texto"]
    assert b["hoje"][0]["hora"] == "19:00" and b["hoje"][0]["quando"] == "hoje"
    assert "Segredo" not in json.dumps(b)


def test_diario_menciona_tarefas_atrasadas(client, ana):
    client.post("/api/tarefas", json={"titulo": "Lista 3", "prazo": "2026-06-01"}, headers=ana)
    b = _diario(client, ana)
    assert "1 tarefa atrasada" in b["texto"] and any(s["rota"] == "/tarefas" for s in b["sugestoes"])


def test_diario_com_gemini_usa_a_agenda_e_cai_nas_regras_se_falhar(client, ana, monkeypatch):
    import urllib.request

    capturado = {}

    class Resp:
        def __init__(self, corpo): self.corpo = corpo
        def read(self): return self.corpo
        def __enter__(self): return self
        def __exit__(self, *a): return False

    def ok(req, timeout=0):
        capturado["req"] = req
        return Resp(json.dumps({"candidates": [{"content": {"parts": [{"text": "Texto da IA"}]}}]}).encode())

    def falha(req, timeout=0):
        raise OSError("sem rede")

    _ev(client, ana, titulo="Prova de Cálculo", data="2026-06-13", tipo="prova")
    monkeypatch.setattr(config.cfg, "GEMINI_API_KEY", "chave-falsa")
    monkeypatch.setattr(urllib.request, "urlopen", ok)
    b = _diario(client, ana)
    assert b["geradoPor"] == "gemini" and b["texto"] == "Texto da IA" and b["proximos"]
    prompt = json.loads(capturado["req"].data)["contents"][0]["parts"][0]["text"]
    assert "Prova de Cálculo" in prompt
    monkeypatch.setattr(urllib.request, "urlopen", falha)
    assert _diario(client, ana)["geradoPor"] == "regras"


def test_chat_enxerga_o_calendario(client, ana):
    _ev(client, ana, titulo="Estudo de SQL", data=date.today().isoformat(), tipo="estudo", hora="19:00")
    r = client.post("/api/assistente/mensagem", json={"texto": "O que tenho hoje?"}, headers=ana)
    assert r.status_code == 200 and "Estudo de SQL" in r.json()["texto"]
    r = client.post("/api/assistente/mensagem", json={"texto": "oi"}, headers=ana)
    assert "em desenvolvimento" in r.json()["texto"]
