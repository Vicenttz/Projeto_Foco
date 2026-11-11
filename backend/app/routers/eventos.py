from fastapi import APIRouter

from app.dependencies import CurrentUser, DbSession
from app.schemas.evento import EventoCreate, EventoUpdate, EventoOut
from app.services import evento_service

router = APIRouter(prefix="/eventos", tags=["Eventos"])


@router.get("", response_model=list[EventoOut])
def listar(db: DbSession, usuario: CurrentUser):
    return evento_service.listar(db, usuario)


@router.get("/{id}", response_model=EventoOut)
def detalhe(id: int, db: DbSession, usuario: CurrentUser):
    return evento_service.obter(db, usuario, id)


@router.post("", response_model=EventoOut, status_code=201)
def criar(dados: EventoCreate, db: DbSession, usuario: CurrentUser):
    return evento_service.criar(db, usuario, dados)


@router.put("/{id}", response_model=EventoOut)
def atualizar(id: int, dados: EventoUpdate, db: DbSession, usuario: CurrentUser):
    return evento_service.atualizar(db, usuario, id, dados)


@router.delete("/{id}", status_code=204)
def remover(id: int, db: DbSession, usuario: CurrentUser):
    evento_service.remover(db, usuario, id)
