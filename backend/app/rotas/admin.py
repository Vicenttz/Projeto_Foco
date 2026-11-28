"""Área administrativa: só para usuários com papel "admin"."""
from .. import saidas
from ..db import todos, um
from ..erros import Erro
from ..roteador import rota


def _contar(ctx, tabela: str, where: str = "", p=()) -> int:
    return um(ctx.con, f"SELECT COUNT(*) AS n FROM {tabela} {where}", p)["n"]


def _por_usuario(ctx, tabela: str) -> dict[int, int]:
    return {r["usuario_id"]: r["n"] for r in todos(ctx.con, f"SELECT usuario_id, COUNT(*) AS n FROM {tabela} GROUP BY usuario_id")}


def _admin_out(u, tarefas=0, discs=0, projs=0) -> dict:
    criado = str(u["criado_em"]).replace(" ", "T") if u["criado_em"] else None
    return {"id": u["id"], "nome": u["nome"], "email": u["email"], "papel": u["papel"], "criadoEm": criado,
            "totalTarefas": tarefas, "totalDisciplinas": discs, "totalProjetos": projs}


@rota("GET", "/admin/resumo", auth="admin")
def resumo(ctx):
    return {
        "totalUsuarios": _contar(ctx, "usuarios"), "totalAdmins": _contar(ctx, "usuarios", "WHERE papel = ?", ("admin",)),
        "totalTarefas": _contar(ctx, "tarefas"), "tarefasConcluidas": _contar(ctx, "tarefas", "WHERE status = ?", ("concluida",)),
        "totalDisciplinas": _contar(ctx, "disciplinas"), "totalProjetos": _contar(ctx, "projetos"),
        "totalTrilhas": _contar(ctx, "trilhas"), "totalEventos": _contar(ctx, "eventos"),
    }


@rota("GET", "/admin/usuarios", auth="admin")
def listar_usuarios(ctx):
    tarefas, discs, projs = _por_usuario(ctx, "tarefas"), _por_usuario(ctx, "disciplinas"), _por_usuario(ctx, "projetos")
    return [_admin_out(u, tarefas.get(u["id"], 0), discs.get(u["id"], 0), projs.get(u["id"], 0))
            for u in todos(ctx.con, "SELECT * FROM usuarios ORDER BY id")]


@rota("PUT", "/admin/usuarios/{id}", auth="admin")
def alterar_papel(ctx):
    papel = ctx.corpo.get("papel")
    if papel not in ("usuario", "admin"):
        raise Erro(422, "papel: deve ser um de: usuario, admin")
    alvo = um(ctx.con, "SELECT * FROM usuarios WHERE id = ?", (ctx.params["id"],))
    if alvo is None:
        raise Erro(404, "Usuário não encontrado")
    if alvo["id"] == ctx.usuario["id"] and papel != "admin":
        raise Erro(422, "Você não pode remover o seu próprio acesso de administrador")
    ctx.con.execute("UPDATE usuarios SET papel = ? WHERE id = ?", (papel, alvo["id"]))
    ctx.con.commit()
    return _admin_out(um(ctx.con, "SELECT * FROM usuarios WHERE id = ?", (alvo["id"],)))


@rota("DELETE", "/admin/usuarios/{id}", auth="admin")
def remover_usuario(ctx):
    alvo = um(ctx.con, "SELECT * FROM usuarios WHERE id = ?", (ctx.params["id"],))
    if alvo is None:
        raise Erro(404, "Usuário não encontrado")
    if alvo["id"] == ctx.usuario["id"]:
        raise Erro(422, "Você não pode excluir a sua própria conta")
    for tabela in ("eventos", "trilhas", "projetos", "tarefas", "disciplinas"):  # apaga também os dados do usuário
        ctx.con.execute(f"DELETE FROM {tabela} WHERE usuario_id = ?", (alvo["id"],))
    ctx.con.execute("DELETE FROM usuarios WHERE id = ?", (alvo["id"],))
    ctx.con.commit()
    return 204, None
