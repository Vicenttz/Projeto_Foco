"""Helpers compartilhados. Regra central: cada usuário só enxerga os próprios dados (senão, 404)."""
from .db import atualizar, inserir, todos, um
from .erros import Erro, nao_encontrado


def obter_do_usuario(ctx, tabela: str, id: int, msg: str):
    linha = um(ctx.con, f"SELECT * FROM {tabela} WHERE id = ? AND usuario_id = ?", (id, ctx.usuario["id"]))
    if linha is None:
        raise nao_encontrado(msg)
    return linha


def checar_disciplina(ctx, disciplina_id) -> None:
    if disciplina_id is not None:
        obter_do_usuario(ctx, "disciplinas", disciplina_id, "Disciplina não encontrada")


def sincronizar_etapas(con, tabela: str, fk: str, pai_id: int, itens: list[dict]) -> None:
    """Substitui as etapas do pai. Itens com id existente são atualizados; sem id, criados; ausentes, removidos."""
    atuais = {r["id"] for r in todos(con, f"SELECT id FROM {tabela} WHERE {fk} = ?", (pai_id,))}
    mantidos = {i["id"] for i in itens if i["id"] in atuais}
    for antigo in atuais - mantidos:
        con.execute(f"DELETE FROM {tabela} WHERE id = ?", (antigo,))
    for ordem, item in enumerate(itens):
        valores = {"titulo": item["titulo"], "concluida": int(item["concluida"]), "ordem": ordem}
        if item["id"] in atuais:
            atualizar(con, tabela, item["id"], valores)
        else:
            inserir(con, tabela, {fk: pai_id, **valores})
