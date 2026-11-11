from pydantic import EmailStr, Field, field_validator

from app.core.security import MAX_SENHA_BYTES
from app.schemas.base import CamelModel


class UserCreate(CamelModel):
    nome: str = Field(min_length=1, max_length=100)
    email: EmailStr
    senha: str = Field(min_length=8)

    @field_validator("senha")
    @classmethod
    def _senha_tamanho(cls, v: str) -> str:
        if len(v.encode("utf-8")) > MAX_SENHA_BYTES:
            raise ValueError(f"deve ter no máximo {MAX_SENHA_BYTES} bytes")
        return v

    @field_validator("nome")
    @classmethod
    def _nome_limpo(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("não pode ficar em branco")
        return v


class UserLogin(CamelModel):
    email: EmailStr
    senha: str


class UserOut(CamelModel):  # nunca inclui senha nem hash
    id: int
    nome: str
    email: str


class LoginOut(CamelModel):
    token: str
    usuario: UserOut
