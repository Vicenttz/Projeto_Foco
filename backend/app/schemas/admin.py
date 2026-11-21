from datetime import datetime
from typing import Literal

from app.schemas.base import CamelModel


class AdminUsuarioOut(CamelModel):
    id: int
    nome: str
    email: str
    papel: str
    criado_em: datetime | None = None
    total_tarefas: int = 0
    total_disciplinas: int = 0
    total_projetos: int = 0


class AdminUsuarioUpdate(CamelModel):
    papel: Literal["usuario", "admin"]


class AdminResumo(CamelModel):
    total_usuarios: int
    total_admins: int
    total_tarefas: int
    tarefas_concluidas: int
    total_disciplinas: int
    total_projetos: int
    total_trilhas: int
    total_eventos: int
