from datetime import date

from fastapi import APIRouter, Query

from app.dependencies import CurrentUser, DbSession
from app.schemas.briefing import BriefingOut
from app.services import briefing

router = APIRouter(prefix="/assistente", tags=["Assistente"])


@router.get("/diario", response_model=BriefingOut)
def diario(
    db: DbSession,
    usuario: CurrentUser,
    data: date | None = None,
    hora: int | None = Query(default=None, ge=0, le=23),
):
    """Mensagem do dia: o assistente lê a agenda e as tarefas e resume o que importa hoje.
    `data` (AAAA-MM-DD) e `hora` (0-23) são opcionais: o frontend manda os do navegador do usuário."""
    return briefing.montar(db, usuario, data, hora)
