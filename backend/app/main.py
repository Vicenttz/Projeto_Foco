<<<<<<< HEAD
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from app.core.config import get_settings
from app.routers import admin, assistente, auth, dashboard, disciplinas, eventos, foco, projetos, tarefas, trilhas
from app.services import seed


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Ao iniciar: cria as tabelas (se faltarem) e as contas de teste (se SEED_DEMO=true).
    seed.inicializar(seed=get_settings().SEED_DEMO)
    yield


app = FastAPI(title="FOCO API", version="0.2.0", description="API do FOCO. Docs em /docs.", lifespan=lifespan)
=======
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.routers import assistente, auth, dashboard, disciplinas, eventos, foco, projetos, tarefas, trilhas

app = FastAPI(title="FOCO API", version="0.1.0", description="API do FOCO. Docs em /docs.")
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origins_list,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def erro_validacao(request: Request, exc: RequestValidationError):
    """422 no formato {"detail": "mensagem"}, como combinado com o frontend."""
    mensagens = []
    for erro in exc.errors():
        campo = ".".join(str(p) for p in erro["loc"] if p not in ("body", "query", "path"))
        mensagens.append(f"{campo}: {erro['msg']}" if campo else erro["msg"])
    return JSONResponse(status_code=422, content={"detail": "; ".join(mensagens)})


@app.get("/api/health", tags=["Sistema"])
def health():
    return {"status": "ok"}


<<<<<<< HEAD
for r in (auth, disciplinas, tarefas, projetos, trilhas, eventos, foco, dashboard, assistente, admin):
    app.include_router(r.router, prefix="/api")


# ---- Frontend (Angular já compilado) servido pela própria API: um único comando roda tudo ----
_FRONT = Path(get_settings().FRONTEND_DIR)


@app.get("/{caminho:path}", include_in_schema=False)
def frontend(caminho: str):
    if caminho.startswith("api/") or caminho == "api":
        raise HTTPException(status_code=404, detail="Rota não encontrada")
    index = _FRONT / "index.html"
    if not index.is_file():
        return JSONResponse(
            status_code=200,
            content={
                "mensagem": "API do FOCO no ar, mas o frontend compilado não foi encontrado.",
                "docs": "/docs",
                "como_resolver": "Rode `python iniciar.py --rebuild` (precisa do Node.js) ou use `ng serve` em frontend/.",
            },
        )
    alvo = (_FRONT / caminho).resolve()
    if caminho and alvo.is_file() and _FRONT.resolve() in alvo.parents:
        return FileResponse(alvo)
    return FileResponse(index)  # rotas do Angular (/dashboard, /login...) caem no index.html
=======
for r in (auth, disciplinas, tarefas, projetos, trilhas, eventos, foco, dashboard, assistente):
    app.include_router(r.router, prefix="/api")
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
