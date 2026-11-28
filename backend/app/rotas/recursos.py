"""CRUD de disciplinas, tarefas, projetos, trilhas e eventos."""
from .. import saidas
from ..comum import checar_disciplina, obter_do_usuario, sincronizar_etapas
from ..db import atualizar, inserir, todos
from ..erros import Erro
from ..roteador import rota
from ..validacao import PRIORIDADES, STATUS_TAREFA, TIPOS_EVENTO, F, so_alteraveis, validar


def _iso(d: dict, *campos: str) -> dict:
    """Datas/horas viram texto ISO para guardar no SQLite."""
    return {k: (v.isoformat() if k in campos and v is not None else v) for k, v in d.items()}


# ======================= Disciplinas =======================
ESQ_DISC = {"nome": F("str", req=True, min=1, max=100), "professor": F("str", nul=True, max=100),
            "cor": F("str", nul=True, max=20), "descricao": F("str", nul=True, max=2000), "trilha_ids": F("ids")}
ANUL_DISC = ("professor", "cor", "descricao")
MSG_DISC, MSG_TRILHA = "Disciplina não encontrada", "Trilha não encontrada"


def _trilhas_do_usuario(ctx, ids: list[int]) -> list[int]:
    """Só aceita trilhas do próprio usuário (senão, 404). Ignora ids repetidos."""
    validos = list(dict.fromkeys(ids))
    for i in validos:
        obter_do_usuario(ctx, "trilhas", i, MSG_TRILHA)
    return validos


@rota("GET", "/disciplinas")
def disc_listar(ctx):
    rows = todos(ctx.con, "SELECT * FROM disciplinas WHERE usuario_id = ? ORDER BY nome", (ctx.usuario["id"],))
    return [saidas.disciplina(ctx.con, d) for d in rows]


@rota("GET", "/disciplinas/{id}")
def disc_detalhe(ctx):
    return saidas.disciplina(ctx.con, obter_do_usuario(ctx, "disciplinas", ctx.params["id"], MSG_DISC))


@rota("POST", "/disciplinas")
def disc_criar(ctx):
    d = validar(ctx.corpo, ESQ_DISC)
    trilhas = _trilhas_do_usuario(ctx, d.pop("trilha_ids"))
    did = inserir(ctx.con, "disciplinas", {"usuario_id": ctx.usuario["id"], **d})
    for t in trilhas:
        ctx.con.execute("UPDATE trilhas SET disciplina_id = ? WHERE id = ?", (did, t))
    ctx.con.commit()
    return 201, saidas.disciplina(ctx.con, obter_do_usuario(ctx, "disciplinas", did, MSG_DISC))


@rota("PUT", "/disciplinas/{id}")
def disc_atualizar(ctx):
    obj = obter_do_usuario(ctx, "disciplinas", ctx.params["id"], MSG_DISC)
    d = validar(ctx.corpo, ESQ_DISC, parcial=True)
    ids = d.pop("trilha_ids", None)
    atualizar(ctx.con, "disciplinas", obj["id"], so_alteraveis(d, ANUL_DISC))
    if ids is not None:  # None = não mexe nos vínculos; lista = substitui os vínculos
        novas = _trilhas_do_usuario(ctx, ids)
        ctx.con.execute(
            f"UPDATE trilhas SET disciplina_id = NULL WHERE disciplina_id = ? AND id NOT IN ({','.join('?' * len(novas)) or 'NULL'})",
            (obj["id"], *novas))
        for t in novas:  # vincula (ou move de outra disciplina) as escolhidas
            ctx.con.execute("UPDATE trilhas SET disciplina_id = ? WHERE id = ?", (obj["id"], t))
    ctx.con.commit()
    return saidas.disciplina(ctx.con, obter_do_usuario(ctx, "disciplinas", obj["id"], MSG_DISC))


@rota("DELETE", "/disciplinas/{id}")
def disc_remover(ctx):
    obj = obter_do_usuario(ctx, "disciplinas", ctx.params["id"], MSG_DISC)
    ctx.con.execute("DELETE FROM disciplinas WHERE id = ?", (obj["id"],))  # tarefas, trilhas e eventos ficam sem disciplina
    ctx.con.commit()
    return 204, None


# ======================= Tarefas =======================
ESQ_TAREFA = {"titulo": F("str", req=True, min=1, max=200), "descricao": F("str", nul=True),
              "disciplina_id": F("int", nul=True), "prioridade": F("enum", valores=PRIORIDADES, padrao="media"),
              "prazo": F("date", req=True), "status": F("enum", valores=STATUS_TAREFA, padrao="pendente")}
MSG_TAREFA = "Tarefa não encontrada"


@rota("GET", "/tarefas")
def tarefa_listar(ctx):
    status, prio = ctx.q_enum("status", STATUS_TAREFA), ctx.q_enum("prioridade", PRIORIDADES)
    disc = ctx.q_int("disciplinaId")
    sql, p = "SELECT * FROM tarefas WHERE usuario_id = ?", [ctx.usuario["id"]]
    for coluna, valor in (("status", status), ("prioridade", prio), ("disciplina_id", disc)):
        if valor is not None:
            sql, p = sql + f" AND {coluna} = ?", [*p, valor]
    return [saidas.tarefa(t) for t in todos(ctx.con, sql + " ORDER BY prazo, id", p)]


@rota("GET", "/tarefas/{id}")
def tarefa_detalhe(ctx):
    return saidas.tarefa(obter_do_usuario(ctx, "tarefas", ctx.params["id"], MSG_TAREFA))


@rota("POST", "/tarefas")
def tarefa_criar(ctx):
    d = validar(ctx.corpo, ESQ_TAREFA)
    checar_disciplina(ctx, d["disciplina_id"])
    tid = inserir(ctx.con, "tarefas", {"usuario_id": ctx.usuario["id"], **_iso(d, "prazo")})
    ctx.con.commit()
    return 201, saidas.tarefa(obter_do_usuario(ctx, "tarefas", tid, MSG_TAREFA))


@rota("PUT", "/tarefas/{id}")
def tarefa_atualizar(ctx):
    obj = obter_do_usuario(ctx, "tarefas", ctx.params["id"], MSG_TAREFA)
    d = validar(ctx.corpo, ESQ_TAREFA, parcial=True)
    checar_disciplina(ctx, d.get("disciplina_id"))
    campos = _iso(so_alteraveis(d, ("descricao", "disciplina_id")), "prazo")
    if campos.get("status", obj["status"]) == "concluida":
        campos["em_foco"] = 0  # tarefa concluída sai do foco
    atualizar(ctx.con, "tarefas", obj["id"], campos)
    ctx.con.commit()
    return saidas.tarefa(obter_do_usuario(ctx, "tarefas", obj["id"], MSG_TAREFA))


@rota("DELETE", "/tarefas/{id}")
def tarefa_remover(ctx):
    obj = obter_do_usuario(ctx, "tarefas", ctx.params["id"], MSG_TAREFA)
    ctx.con.execute("DELETE FROM tarefas WHERE id = ?", (obj["id"],))
    ctx.con.commit()
    return 204, None


# ======================= Projetos =======================
ESQ_PROJ = {"nome": F("str", req=True, min=1, max=150), "descricao": F("str", nul=True), "data_entrega": F("date", req=True),
            "status": F("enum", valores=STATUS_TAREFA, padrao="pendente"), "etapas": F("etapas")}
MSG_PROJ = "Projeto não encontrado"


@rota("GET", "/projetos")
def proj_listar(ctx):
    rows = todos(ctx.con, "SELECT * FROM projetos WHERE usuario_id = ? ORDER BY data_entrega, id", (ctx.usuario["id"],))
    return [saidas.projeto(ctx.con, p) for p in rows]


@rota("GET", "/projetos/{id}")
def proj_detalhe(ctx):
    return saidas.projeto(ctx.con, obter_do_usuario(ctx, "projetos", ctx.params["id"], MSG_PROJ))


@rota("POST", "/projetos")
def proj_criar(ctx):
    d = validar(ctx.corpo, ESQ_PROJ)
    etapas = d.pop("etapas")
    pid = inserir(ctx.con, "projetos", {"usuario_id": ctx.usuario["id"], **_iso(d, "data_entrega")})
    sincronizar_etapas(ctx.con, "projeto_etapas", "projeto_id", pid, etapas)
    ctx.con.commit()
    return 201, saidas.projeto(ctx.con, obter_do_usuario(ctx, "projetos", pid, MSG_PROJ))


@rota("PUT", "/projetos/{id}")
def proj_atualizar(ctx):
    obj = obter_do_usuario(ctx, "projetos", ctx.params["id"], MSG_PROJ)
    d = validar(ctx.corpo, ESQ_PROJ, parcial=True)
    etapas = d.pop("etapas", None)
    atualizar(ctx.con, "projetos", obj["id"], _iso(so_alteraveis(d, ("descricao",)), "data_entrega"))
    if etapas is not None:  # se enviado, substitui a lista de etapas
        sincronizar_etapas(ctx.con, "projeto_etapas", "projeto_id", obj["id"], etapas)
    ctx.con.commit()
    return saidas.projeto(ctx.con, obter_do_usuario(ctx, "projetos", obj["id"], MSG_PROJ))


@rota("DELETE", "/projetos/{id}")
def proj_remover(ctx):
    obj = obter_do_usuario(ctx, "projetos", ctx.params["id"], MSG_PROJ)
    ctx.con.execute("DELETE FROM projetos WHERE id = ?", (obj["id"],))
    ctx.con.commit()
    return 204, None


# ======================= Trilhas =======================
ESQ_TRILHA = {"assunto": F("str", req=True, min=1, max=200), "disciplina_id": F("int", nul=True), "etapas": F("etapas")}
MSG_TR = MSG_TRILHA


@rota("GET", "/trilhas")
def trilha_listar(ctx):
    rows = todos(ctx.con, "SELECT * FROM trilhas WHERE usuario_id = ? ORDER BY id", (ctx.usuario["id"],))
    return [saidas.trilha(ctx.con, t) for t in rows]


@rota("GET", "/trilhas/{id}")
def trilha_detalhe(ctx):
    return saidas.trilha(ctx.con, obter_do_usuario(ctx, "trilhas", ctx.params["id"], MSG_TR))


@rota("POST", "/trilhas")
def trilha_criar(ctx):
    d = validar(ctx.corpo, ESQ_TRILHA)
    checar_disciplina(ctx, d["disciplina_id"])
    etapas = d.pop("etapas")
    tid = inserir(ctx.con, "trilhas", {"usuario_id": ctx.usuario["id"], **d})
    sincronizar_etapas(ctx.con, "trilha_etapas", "trilha_id", tid, etapas)
    ctx.con.commit()
    return 201, saidas.trilha(ctx.con, obter_do_usuario(ctx, "trilhas", tid, MSG_TR))


@rota("PUT", "/trilhas/{id}")
def trilha_atualizar(ctx):
    obj = obter_do_usuario(ctx, "trilhas", ctx.params["id"], MSG_TR)
    d = validar(ctx.corpo, ESQ_TRILHA, parcial=True)
    etapas = d.pop("etapas", None)
    checar_disciplina(ctx, d.get("disciplina_id"))
    atualizar(ctx.con, "trilhas", obj["id"], so_alteraveis(d, ("disciplina_id",)))  # disciplinaId null desvincula
    if etapas is not None:
        sincronizar_etapas(ctx.con, "trilha_etapas", "trilha_id", obj["id"], etapas)
    ctx.con.commit()
    return saidas.trilha(ctx.con, obter_do_usuario(ctx, "trilhas", obj["id"], MSG_TR))


@rota("DELETE", "/trilhas/{id}")
def trilha_remover(ctx):
    obj = obter_do_usuario(ctx, "trilhas", ctx.params["id"], MSG_TR)
    ctx.con.execute("DELETE FROM trilhas WHERE id = ?", (obj["id"],))
    ctx.con.commit()
    return 204, None


# ======================= Eventos (calendário) =======================
ESQ_EVENTO = {"titulo": F("str", req=True, min=1, max=200), "data": F("date", req=True),
              "tipo": F("enum", valores=TIPOS_EVENTO, padrao="evento"), "hora": F("time", nul=True),
              "duracao_min": F("int", nul=True, min=5, max=1440), "disciplina_id": F("int", nul=True),
              "descricao": F("str", nul=True, max=2000), "concluido": F("bool", padrao=False)}
ANUL_EVENTO = ("hora", "duracao_min", "disciplina_id", "descricao")  # o usuário "limpa" estes enviando null
MSG_EV = "Evento não encontrado"


def _ev_valores(d: dict) -> dict:
    d = _iso(d, "data")
    if "hora" in d and d["hora"] is not None:
        d["hora"] = d["hora"].strftime("%H:%M:%S")
    if "concluido" in d and d["concluido"] is not None:
        d["concluido"] = int(d["concluido"])
    return d


@rota("GET", "/eventos")
def ev_listar(ctx):
    """Filtros opcionais: de e ate (AAAA-MM-DD, inclusivos) e tipo."""
    de, ate, tipo = ctx.q_data("de"), ctx.q_data("ate"), ctx.q_enum("tipo", TIPOS_EVENTO)
    sql, p = "SELECT * FROM eventos WHERE usuario_id = ?", [ctx.usuario["id"]]
    if de:
        sql, p = sql + " AND data >= ?", [*p, de.isoformat()]
    if ate:
        sql, p = sql + " AND data <= ?", [*p, ate.isoformat()]
    if tipo:
        sql, p = sql + " AND tipo = ?", [*p, tipo]
    return [saidas.evento(e) for e in todos(ctx.con, sql + " ORDER BY data, hora, id", p)]


@rota("GET", "/eventos/{id}")
def ev_detalhe(ctx):
    return saidas.evento(obter_do_usuario(ctx, "eventos", ctx.params["id"], MSG_EV))


@rota("POST", "/eventos")
def ev_criar(ctx):
    d = validar(ctx.corpo, ESQ_EVENTO)
    checar_disciplina(ctx, d["disciplina_id"])
    eid = inserir(ctx.con, "eventos", {"usuario_id": ctx.usuario["id"], **_ev_valores(d)})
    ctx.con.commit()
    return 201, saidas.evento(obter_do_usuario(ctx, "eventos", eid, MSG_EV))


@rota("PUT", "/eventos/{id}")
def ev_atualizar(ctx):
    obj = obter_do_usuario(ctx, "eventos", ctx.params["id"], MSG_EV)
    d = validar(ctx.corpo, ESQ_EVENTO, parcial=True)
    checar_disciplina(ctx, d.get("disciplina_id"))
    atualizar(ctx.con, "eventos", obj["id"], _ev_valores(so_alteraveis(d, ANUL_EVENTO)))
    ctx.con.commit()
    return saidas.evento(obter_do_usuario(ctx, "eventos", obj["id"], MSG_EV))


@rota("DELETE", "/eventos/{id}")
def ev_remover(ctx):
    obj = obter_do_usuario(ctx, "eventos", ctx.params["id"], MSG_EV)
    ctx.con.execute("DELETE FROM eventos WHERE id = ?", (obj["id"],))
    ctx.con.commit()
    return 204, None
