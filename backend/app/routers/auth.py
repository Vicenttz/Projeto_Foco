from fastapi import APIRouter

from app.dependencies import CurrentUser, DbSession
from app.schemas.usuario import LoginOut, UserCreate, UserLogin, UserOut
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/cadastro", response_model=UserOut, status_code=201)
def cadastro(dados: UserCreate, db: DbSession):
    return auth_service.cadastrar(db, dados)


@router.post("/login", response_model=LoginOut)
def login(dados: UserLogin, db: DbSession):
    token, usuario = auth_service.autenticar(db, dados)
    return LoginOut(token=token, usuario=UserOut.model_validate(usuario))


@router.get("/me", response_model=UserOut)
def me(usuario: CurrentUser):
    return usuario
