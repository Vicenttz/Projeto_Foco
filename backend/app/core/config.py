"""Configuração do backend.

Funciona SEM nenhum arquivo .env: usa SQLite (arquivo foco.db) e gera uma chave secreta local.
Para usar MySQL (ou outra chave), crie backend/.env a partir do .env.example.
"""
import secrets
from functools import lru_cache
from pathlib import Path

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]  # pasta backend/


def _chave_local() -> str:
    """Gera (uma única vez) e reaproveita uma chave secreta guardada em backend/.secret_key."""
    arq = BASE_DIR / ".secret_key"
    if arq.exists() and arq.read_text(encoding="utf-8").strip():
        return arq.read_text(encoding="utf-8").strip()
    chave = secrets.token_urlsafe(48)
    arq.write_text(chave, encoding="utf-8")
    return chave


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = f"sqlite:///{(BASE_DIR / 'foco.db').as_posix()}"
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    # Lista separada por vírgulas. Só importa se o Angular rodar separado (ng serve, porta 4200).
    CORS_ORIGINS: str = "http://localhost:4200"
    # Cria as contas de teste (aluno e admin) na primeira execução. Desligue em produção.
    SEED_DEMO: bool = True
    # Pasta com o frontend já compilado (servido pela própria API).
    FRONTEND_DIR: str = str(BASE_DIR / "static")
    # OPCIONAL: com uma chave do Gemini, a mensagem diária é reescrita pela IA (a agenda do usuário é enviada ao Google).
    # Sem chave, o assistente usa regras locais e nada sai do seu computador.
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"

    @model_validator(mode="after")
    def _chave(self):
        if not self.SECRET_KEY:
            self.SECRET_KEY = _chave_local()
        return self

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
