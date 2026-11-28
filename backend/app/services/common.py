"""Helpers compartilhados. Regra central: cada usuário só enxerga os próprios dados (senão, 404)."""
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Usuario


def obter_do_usuario(db: Session, modelo, obj_id: int, usuario: Usuario, mensagem: str):
    obj = db.get(modelo, obj_id)
    if obj is None or obj.usuario_id != usuario.id:
        raise HTTPException(status_code=404, detail=mensagem)
    return obj


def listar_do_usuario(db: Session, modelo, usuario: Usuario, *filtros, ordem=(), opcoes=()):
    stmt = select(modelo).where(modelo.usuario_id == usuario.id, *filtros)
    if opcoes:
        stmt = stmt.options(*opcoes)
    if ordem:
        stmt = stmt.order_by(*ordem)
    return list(db.scalars(stmt).all())


def aplicar_atualizacao(obj, dados: dict, anulaveis: tuple[str, ...] = ()) -> None:
    """Atualização parcial: campos obrigatórios enviados como null são ignorados."""
    for campo, valor in dados.items():
        if valor is None and campo not in anulaveis:
            continue
        setattr(obj, campo, valor)


def sincronizar_etapas(pai, relacao: str, itens, classe_etapa) -> None:
    """Substitui as etapas do pai. Itens com id existente são atualizados; sem id, criados; ausentes, removidos."""
    atuais = {e.id: e for e in getattr(pai, relacao)}
    novas = []
    for ordem, item in enumerate(itens):
        etapa = atuais.get(item.id) if item.id is not None else None
        if etapa is None:
            etapa = classe_etapa()
        etapa.titulo = item.titulo
        etapa.concluida = item.concluida
        etapa.ordem = ordem
        novas.append(etapa)
    setattr(pai, relacao, novas)
