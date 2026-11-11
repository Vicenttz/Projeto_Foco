from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.routers import assistente, auth, dashboard, disciplinas, eventos, foco, projetos, tarefas, trilhas

app = FastAPI(title="FOCO API", version="0.1.0", description="API do FOCO. Docs em /docs.")

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


for r in (auth, disciplinas, tarefas, projetos, trilhas, eventos, foco, dashboard, assistente):
    app.include_router(r.router, prefix="/api")
