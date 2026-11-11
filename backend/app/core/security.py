"""Hash de senha (bcrypt) e tokens JWT."""
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core.config import get_settings

MAX_SENHA_BYTES = 72  # limite do bcrypt


def hash_senha(senha: str) -> str:
    return bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verificar_senha(senha: str, senha_hash: str) -> bool:
    dados = senha.encode("utf-8")
    if len(dados) > MAX_SENHA_BYTES:
        return False
    try:
        return bcrypt.checkpw(dados, senha_hash.encode("utf-8"))
    except ValueError:
        return False


def criar_token(usuario_id: int) -> str:
    s = get_settings()
    expira = datetime.now(timezone.utc) + timedelta(minutes=s.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(usuario_id), "exp": expira}, s.SECRET_KEY, algorithm=s.ALGORITHM)


def ler_token(token: str) -> int | None:
    """Devolve o id do usuário do token, ou None se for inválido/expirado."""
    s = get_settings()
    try:
        payload = jwt.decode(token, s.SECRET_KEY, algorithms=[s.ALGORITHM])
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None
