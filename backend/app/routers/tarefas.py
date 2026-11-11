from fastapi import APIRouter, Query

from app.dependencies import CurrentUser, DbSession
from app.schemas.base import Prioridade, StatusTarefa
from app.schemas.tarefa import TarefaCreate, TarefaOut, TarefaUpdate
from app.services import tarefa_service

router = APIRouter(prefix="/tarefas", tags=["Tarefas"])


@router.get("", response_model=list[TarefaOut])
def listar(
    db: DbSession,
    usuario: CurrentUser,
    status: StatusTarefa | None = None,
    prioridade: Prioridade | None = None,
    disciplina_id: int | None = Query(default=None, alias="disciplinaId"),
):
    return tarefa_service.listar(db, usuario, status, prioridade, disciplina_id)


@router.get("/{id}", response_model=TarefaOut)
def detalhe(id: int, db: DbSession, usuario: CurrentUser):
    return tarefa_service.obter(db, usuario, id)


@router.post("", response_model=TarefaOut, status_code=201)
def criar(dados: TarefaCreate, db: DbSession, usuario: CurrentUser):
    return tarefa_service.criar(db, usuario, dados)


@router.put("/{id}", response_model=TarefaOut)
def atualizar(id: int, dados: TarefaUpdate, db: DbSession, usuario: CurrentUser):
    return tarefa_service.atualizar(db, usuario, id, dados)


@router.delete("/{id}", status_code=204)
def remover(id: int, db: DbSession, usuario: CurrentUser):
    tarefa_service.remover(db, usuario, id)
