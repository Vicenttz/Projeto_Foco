from fastapi import APIRouter

from app.dependencies import CurrentUser, DbSession
from app.schemas.foco import FocoOut
from app.services import foco_service

router = APIRouter(prefix="/foco", tags=["Foco e prioridades"])


@router.get("", response_model=FocoOut)
def obter(db: DbSession, usuario: CurrentUser):
    return foco_service.obter(db, usuario)


@router.put("/{tarefa_id}", response_model=FocoOut)
def definir(tarefa_id: int, db: DbSession, usuario: CurrentUser):
    return foco_service.definir(db, usuario, tarefa_id)


@router.delete("", status_code=204)
def limpar(db: DbSession, usuario: CurrentUser):
    foco_service.limpar(db, usuario)
