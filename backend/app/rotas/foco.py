"""Foco, prioridades e dashboard."""
from datetime import date

from .. import saidas
from ..comum import obter_do_usuario
from ..db import todos
from ..erros import Erro
from ..roteador import rota

LIMITE = 5
_PROGRESSO = {"pendente": 0, "em_andamento": 50, "concluida": 100}


def prioridades(ctx) -> list:
    """Tarefas não concluídas: prioridade (alta > média > baixa), depois prazo mais próximo."""
    return todos(ctx.con, """SELECT * FROM tarefas WHERE usuario_id = ? AND status != 'concluida'
        ORDER BY CASE prioridade WHEN 'alta' THEN 0 WHEN 'media' THEN 1 ELSE 2 END, prazo, id""", (ctx.usuario["id"],))


def escolher_atual(lista: list):
    """Foco escolhido pelo usuário; se não houver, a tarefa mais prioritária."""
    return next((t for t in lista if t["em_foco"]), lista[0] if lista else None)


def _montar(ctx) -> dict:
    lista = prioridades(ctx)
    atual = escolher_atual(lista)
    return {"atual": saidas.tarefa(atual) if atual else None,
            "progresso": _PROGRESSO[atual["status"]] if atual else 0,
            "prioridades": [saidas.tarefa(t) for t in lista]}


@rota("GET", "/foco")
def foco_obter(ctx):
    return _montar(ctx)


@rota("PUT", "/foco/{id}")
def foco_definir(ctx):
    tarefa = obter_do_usuario(ctx, "tarefas", ctx.params["id"], "Tarefa não encontrada")
    if tarefa["status"] == "concluida":
        raise Erro(422, "Tarefa concluída não pode ser o foco")
    ctx.con.execute("UPDATE tarefas SET em_foco = 0 WHERE usuario_id = ?", (ctx.usuario["id"],))
    ctx.con.execute("UPDATE tarefas SET em_foco = 1 WHERE id = ?", (tarefa["id"],))
    ctx.con.commit()
    return _montar(ctx)


@rota("DELETE", "/foco")
def foco_limpar(ctx):
    ctx.con.execute("UPDATE tarefas SET em_foco = 0 WHERE usuario_id = ?", (ctx.usuario["id"],))
    ctx.con.commit()
    return 204, None


@rota("GET", "/dashboard")
def dashboard(ctx):
    uid = ctx.usuario["id"]
    tarefas = todos(ctx.con, "SELECT * FROM tarefas WHERE usuario_id = ?", (uid,))
    total = len(tarefas)
    concluidas = sum(1 for t in tarefas if t["status"] == "concluida")
    em_andamento = sum(1 for t in tarefas if t["status"] == "em_andamento")
    abertas = sorted((t for t in tarefas if t["status"] != "concluida"), key=lambda t: (t["prazo"], t["id"]))
    atual = escolher_atual(prioridades(ctx))
    disciplinas = todos(ctx.con, "SELECT * FROM disciplinas WHERE usuario_id = ? ORDER BY nome", (uid,))
    projetos = todos(ctx.con, "SELECT * FROM projetos WHERE usuario_id = ? AND status != 'concluida' ORDER BY data_entrega, id", (uid,))
    eventos = todos(ctx.con, "SELECT * FROM eventos WHERE usuario_id = ? AND data >= ? ORDER BY data, id LIMIT ?",
                    (uid, date.today().isoformat(), LIMITE))
    return {
        "usuario": saidas.usuario(ctx.usuario),
        "focoAtual": saidas.tarefa(atual) if atual else None,
        "resumoTarefas": {"total": total, "pendentes": total - concluidas, "emAndamento": em_andamento,
                          "concluidas": concluidas, "percentualConcluidas": saidas.percentual(concluidas, total)},
        "proximasTarefas": [saidas.tarefa(t) for t in abertas[:LIMITE]],
        "disciplinas": [saidas.disciplina(ctx.con, d) for d in disciplinas],
        "projetosAtivos": [saidas.projeto(ctx.con, p) for p in projetos],
        "proximosEventos": [saidas.evento(e) for e in eventos],
    }
