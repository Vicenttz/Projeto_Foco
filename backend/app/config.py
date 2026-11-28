"""Configuração. Funciona SEM nenhum arquivo .env: usa SQLite (backend/foco.db) e gera uma chave secreta local.

Para mudar algo, crie backend/.env (linhas CHAVE=valor) ou defina variáveis de ambiente. Veja .env.example.
"""
import os
import secrets
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]  # pasta backend/


def _ler_env_file() -> dict[str, str]:
    arq, dados = BASE_DIR / ".env", {}
    if arq.is_file():
        for linha in arq.read_text(encoding="utf-8-sig").splitlines():
            linha = linha.strip()
            if linha and not linha.startswith("#") and "=" in linha:
                k, v = linha.split("=", 1)
                dados[k.strip()] = v.strip().strip("\"'")
    return dados


def _chave_local() -> str:
    """Gera (uma única vez) e reaproveita uma chave secreta guardada em backend/.secret_key."""
    arq = BASE_DIR / ".secret_key"
    try:
        if arq.exists() and arq.read_text(encoding="utf-8").strip():
            return arq.read_text(encoding="utf-8").strip()
        chave = secrets.token_urlsafe(48)
        arq.write_text(chave, encoding="utf-8")
        return chave
    except OSError:  # pasta sem permissão de escrita: chave só desta execução (logins caem ao reiniciar)
        return secrets.token_urlsafe(48)


class Config:
    def __init__(self) -> None:
        env = {**_ler_env_file(), **os.environ}
        g = lambda k, padrao="": env.get(k, padrao)  # noqa: E731
        self.DB_PATH: str = g("FOCO_DB") or str(BASE_DIR / "foco.db")
        self.SECRET_KEY: str = g("SECRET_KEY") or _chave_local()
        self.ACCESS_TOKEN_EXPIRE_MINUTES: int = int(g("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
        # Só importa se o Angular rodar separado (ng serve, porta 4200).
        self.CORS_ORIGINS: list[str] = [o.strip() for o in g("CORS_ORIGINS", "http://localhost:4200").split(",") if o.strip()]
        # Cria as contas de teste (aluno e admin) na primeira execução. Desligue em produção.
        self.SEED_DEMO: bool = g("SEED_DEMO", "true").lower() not in ("false", "0", "no", "nao", "não")
        self.FRONTEND_DIR: str = g("FRONTEND_DIR") or str(BASE_DIR / "static")
        self.PBKDF2_ITER: int = int(g("FOCO_PBKDF2_ITER", "310000"))
        # OPCIONAL: com uma chave do Gemini, a mensagem diária é reescrita pela IA (a agenda é enviada ao Google).
        self.GEMINI_API_KEY: str = g("GEMINI_API_KEY")
        self.GEMINI_MODEL: str = g("GEMINI_MODEL", "gemini-2.0-flash")


cfg = Config()
