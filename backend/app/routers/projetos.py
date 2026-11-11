from fastapi import APIRouter

from app.dependencies import CurrentUser, DbSession
from app.schemas.projeto import ProjetoCreate, ProjetoUpdate, ProjetoOut
from app.services import projeto_service

router = APIRouter(prefix="/projetos", tags=["Projetos"])


@router.get("", response_model=list[ProjetoOut])
def listar(db: DbSession, usuario: CurrentUser):
    return projeto_service.listar(db, usuario)


@router.get("/{id}", response_model=ProjetoOut)
def detalhe(id: int, db: DbSession, usuario: CurrentUser):
    return projeto_service.obter(db, usuario, id)


@router.post("", response_model=ProjetoOut, status_code=201)
def criar(dados: ProjetoCreate, db: DbSession, usuario: CurrentUser):
    return projeto_service.criar(db, usuario, dados)


@router.put("/{id}", response_model=ProjetoOut)
def atualizar(id: int, dados: ProjetoUpdate, db: DbSession, usuario: CurrentUser):
    return projeto_service.atualizar(db, usuario, id, dados)


@router.delete("/{id}", status_code=204)
def remover(id: int, db: DbSession, usuario: CurrentUser):
    projeto_service.remover(db, usuario, id)
