from sqlalchemy.orm import Session, selectinload

from app.models import Trilha, TrilhaEtapa, Usuario
from app.schemas.trilha import TrilhaCreate, TrilhaUpdate
from app.services.common import aplicar_atualizacao, listar_do_usuario, obter_do_usuario, sincronizar_etapas

MSG = "Trilha não encontrada"


def listar(db: Session, u: Usuario):
    return listar_do_usuario(db, Trilha, u, ordem=(Trilha.id,), opcoes=(selectinload(Trilha.etapas),))


def obter(db: Session, u: Usuario, id: int) -> Trilha:
    return obter_do_usuario(db, Trilha, id, u, MSG)


def criar(db: Session, u: Usuario, dados: TrilhaCreate) -> Trilha:
    obj = Trilha(usuario_id=u.id, assunto=dados.assunto)
    db.add(obj)
    sincronizar_etapas(obj, "etapas", dados.etapas, TrilhaEtapa)
    db.commit()
    db.refresh(obj)
    return obj


def atualizar(db: Session, u: Usuario, id: int, dados: TrilhaUpdate) -> Trilha:
    obj = obter(db, u, id)
    aplicar_atualizacao(obj, dados.model_dump(exclude_unset=True, exclude={"etapas"}))
    if dados.etapas is not None:
        sincronizar_etapas(obj, "etapas", dados.etapas, TrilhaEtapa)
    db.commit()
    db.refresh(obj)
    return obj


def remover(db: Session, u: Usuario, id: int) -> None:
    db.delete(obter(db, u, id))
    db.commit()
