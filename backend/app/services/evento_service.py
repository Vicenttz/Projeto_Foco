from datetime import date

from sqlalchemy.orm import Session

from app.models import Disciplina, Evento, Usuario
from app.schemas.evento import EventoCreate, EventoUpdate
from app.services.common import aplicar_atualizacao, listar_do_usuario, obter_do_usuario

MSG = "Evento não encontrado"
# Campos que o usuário pode "limpar" enviando null (os demais ignoram null no PUT parcial).
ANULAVEIS = ("hora", "duracao_min", "disciplina_id", "descricao")


def _checar_disciplina(db: Session, u: Usuario, disciplina_id: int | None) -> None:
    if disciplina_id is not None:
        obter_do_usuario(db, Disciplina, disciplina_id, u, "Disciplina não encontrada")


def listar(db: Session, u: Usuario, de: date | None = None, ate: date | None = None, tipo: str | None = None):
    filtros = []
    if de:
        filtros.append(Evento.data >= de)
    if ate:
        filtros.append(Evento.data <= ate)
    if tipo:
        filtros.append(Evento.tipo == tipo)
    return listar_do_usuario(db, Evento, u, *filtros, ordem=(Evento.data, Evento.hora, Evento.id))


def obter(db: Session, u: Usuario, id: int) -> Evento:
    return obter_do_usuario(db, Evento, id, u, MSG)


def criar(db: Session, u: Usuario, dados: EventoCreate) -> Evento:
    _checar_disciplina(db, u, dados.disciplina_id)
    obj = Evento(usuario_id=u.id, **dados.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def atualizar(db: Session, u: Usuario, id: int, dados: EventoUpdate) -> Evento:
    obj = obter(db, u, id)
    campos = dados.model_dump(exclude_unset=True)
    _checar_disciplina(db, u, campos.get("disciplina_id"))
    aplicar_atualizacao(obj, campos, anulaveis=ANULAVEIS)
    db.commit()
    db.refresh(obj)
    return obj


def remover(db: Session, u: Usuario, id: int) -> None:
    db.delete(obter(db, u, id))
    db.commit()
