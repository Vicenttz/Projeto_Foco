from fastapi import APIRouter

from app.dependencies import CurrentUser, DbSession
from app.schemas.trilha import TrilhaCreate, TrilhaUpdate, TrilhaOut
from app.services import trilha_service

router = APIRouter(prefix="/trilhas", tags=["Trilhas"])


@router.get("", response_model=list[TrilhaOut])
def listar(db: DbSession, usuario: CurrentUser):
    return trilha_service.listar(db, usuario)


@router.get("/{id}", response_model=TrilhaOut)
def detalhe(id: int, db: DbSession, usuario: CurrentUser):
    return trilha_service.obter(db, usuario, id)


@router.post("", response_model=TrilhaOut, status_code=201)
def criar(dados: TrilhaCreate, db: DbSession, usuario: CurrentUser):
    return trilha_service.criar(db, usuario, dados)


@router.put("/{id}", response_model=TrilhaOut)
def atualizar(id: int, dados: TrilhaUpdate, db: DbSession, usuario: CurrentUser):
    return trilha_service.atualizar(db, usuario, id, dados)


@router.delete("/{id}", status_code=204)
def remover(id: int, db: DbSession, usuario: CurrentUser):
    trilha_service.remover(db, usuario, id)
