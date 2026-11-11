from fastapi import APIRouter

from app.dependencies import CurrentUser, DbSession
from app.schemas.disciplina import DisciplinaCreate, DisciplinaUpdate, DisciplinaOut
from app.services import disciplina_service

router = APIRouter(prefix="/disciplinas", tags=["Disciplinas"])


@router.get("", response_model=list[DisciplinaOut])
def listar(db: DbSession, usuario: CurrentUser):
    return disciplina_service.listar(db, usuario)


@router.get("/{id}", response_model=DisciplinaOut)
def detalhe(id: int, db: DbSession, usuario: CurrentUser):
    return disciplina_service.obter(db, usuario, id)


@router.post("", response_model=DisciplinaOut, status_code=201)
def criar(dados: DisciplinaCreate, db: DbSession, usuario: CurrentUser):
    return disciplina_service.criar(db, usuario, dados)


@router.put("/{id}", response_model=DisciplinaOut)
def atualizar(id: int, dados: DisciplinaUpdate, db: DbSession, usuario: CurrentUser):
    return disciplina_service.atualizar(db, usuario, id, dados)


@router.delete("/{id}", status_code=204)
def remover(id: int, db: DbSession, usuario: CurrentUser):
    disciplina_service.remover(db, usuario, id)
