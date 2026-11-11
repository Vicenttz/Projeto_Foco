from datetime import date

from pydantic import Field

from app.schemas.base import CamelModel, Prioridade, StatusTarefa


class TarefaCreate(CamelModel):
    titulo: str = Field(min_length=1, max_length=200)
    descricao: str | None = None
    disciplina_id: int | None = None
    prioridade: Prioridade = "media"
    prazo: date
    status: StatusTarefa = "pendente"


class TarefaUpdate(CamelModel):
    titulo: str | None = Field(default=None, min_length=1, max_length=200)
    descricao: str | None = None
    disciplina_id: int | None = None
    prioridade: Prioridade | None = None
    prazo: date | None = None
    status: StatusTarefa | None = None


class TarefaOut(CamelModel):
    id: int
    titulo: str
    descricao: str | None = None
    disciplina_id: int | None = None
    prioridade: Prioridade
    prazo: date
    status: StatusTarefa
