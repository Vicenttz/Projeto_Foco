from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import criar_token, hash_senha, verificar_senha
from app.models import Usuario
from app.schemas.usuario import UserCreate, UserLogin

# Hash usado para gastar o mesmo tempo quando o e-mail não existe (evita revelar quais e-mails têm conta).
_HASH_FALSO = hash_senha("senha-falsa-para-tempo-constante")


def cadastrar(db: Session, dados: UserCreate) -> Usuario:
    email = dados.email.lower()
    if db.scalar(select(Usuario).where(Usuario.email == email)):
        raise HTTPException(status_code=409, detail="E-mail já cadastrado")
    usuario = Usuario(nome=dados.nome, email=email, senha_hash=hash_senha(dados.senha))
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


def autenticar(db: Session, dados: UserLogin) -> tuple[str, Usuario]:
    usuario = db.scalar(select(Usuario).where(Usuario.email == dados.email.lower()))
    ok = verificar_senha(dados.senha, usuario.senha_hash if usuario else _HASH_FALSO)
    if usuario is None or not ok:
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")
    return criar_token(usuario.id), usuario
