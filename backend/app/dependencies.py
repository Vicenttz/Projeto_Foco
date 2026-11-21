from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import ler_token
from app.database import get_db
from app.models import Usuario

_bearer = HTTPBearer(auto_error=False)

DbSession = Annotated[Session, Depends(get_db)]


def get_current_user(
    db: DbSession,
    cred: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> Usuario:
    erro = HTTPException(status_code=401, detail="Não autenticado", headers={"WWW-Authenticate": "Bearer"})
    if cred is None:
        raise erro
    usuario_id = ler_token(cred.credentials)
    if usuario_id is None:
        raise erro
    usuario = db.get(Usuario, usuario_id)
    if usuario is None:
        raise erro
    return usuario


CurrentUser = Annotated[Usuario, Depends(get_current_user)]
