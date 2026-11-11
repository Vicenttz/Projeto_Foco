from sqlalchemy.orm import Session, selectinload

from app.models import Disciplina, Usuario
from app.schemas.disciplina import DisciplinaCreate, DisciplinaUpdate
from app.services.common import aplicar_atualizacao, listar_do_usuario, obter_do_usuario

MSG = "Disciplina não encontrada"


def listar(db: Session, u: Usuario):
    return listar_do_usuario(db, Disciplina, u, ordem=(Disciplina.nome,), opcoes=(selectinload(Disciplina.tarefas),))


def obter(db: Session, u: Usuario, id: int) -> Disciplina:
    return obter_do_usuario(db, Disciplina, id, u, MSG)


def criar(db: Session, u: Usuario, dados: DisciplinaCreate) -> Disciplina:
    obj = Disciplina(usuario_id=u.id, **dados.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def atualizar(db: Session, u: Usuario, id: int, dados: DisciplinaUpdate) -> Disciplina:
    obj = obter(db, u, id)
    aplicar_atualizacao(obj, dados.model_dump(exclude_unset=True), anulaveis=("professor", "cor"))
    db.commit()
    db.refresh(obj)
    return obj


def remover(db: Session, u: Usuario, id: int) -> None:
    db.delete(obter(db, u, id))  # tarefas da disciplina ficam sem disciplina (disciplina_id = NULL)
    db.commit()
