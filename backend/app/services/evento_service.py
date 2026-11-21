from sqlalchemy.orm import Session

from app.models import Evento, Usuario
from app.schemas.evento import EventoCreate, EventoUpdate
from app.services.common import aplicar_atualizacao, listar_do_usuario, obter_do_usuario

MSG = "Evento não encontrado"


def listar(db: Session, u: Usuario):
    return listar_do_usuario(db, Evento, u, ordem=(Evento.data, Evento.id))


def obter(db: Session, u: Usuario, id: int) -> Evento:
    return obter_do_usuario(db, Evento, id, u, MSG)


def criar(db: Session, u: Usuario, dados: EventoCreate) -> Evento:
    obj = Evento(usuario_id=u.id, **dados.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def atualizar(db: Session, u: Usuario, id: int, dados: EventoUpdate) -> Evento:
    obj = obter(db, u, id)
    aplicar_atualizacao(obj, dados.model_dump(exclude_unset=True))
    db.commit()
    db.refresh(obj)
    return obj


def remover(db: Session, u: Usuario, id: int) -> None:
    db.delete(obter(db, u, id))
    db.commit()
