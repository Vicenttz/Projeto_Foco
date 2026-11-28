from datetime import datetime, timezone

from .. import saidas
from ..db import inserir, um
from ..erros import Erro
from ..roteador import rota
from ..seguranca import MAX_SENHA_BYTES, criar_token, hash_antigo, hash_senha, verificar_senha
from ..validacao import F, validar

_HASH_FALSO = None  # gasta o mesmo tempo quando o e-mail não existe (não revela quais e-mails têm conta)


@rota("POST", "/auth/cadastro", auth=None)
def cadastro(ctx):
    d = validar(ctx.corpo, {"nome": F("str", req=True, min=1, max=100), "email": F("email", req=True),
                            "senha": F("str", req=True, min=8)})
    if len(d["senha"].encode("utf-8")) > MAX_SENHA_BYTES:
        raise Erro(422, f"senha: deve ter no máximo {MAX_SENHA_BYTES} bytes")
    nome = d["nome"].strip()
    if not nome:
        raise Erro(422, "nome: não pode ficar em branco")
    email = d["email"].lower()
    if um(ctx.con, "SELECT 1 FROM usuarios WHERE email = ?", (email,)):
        raise Erro(409, "E-mail já cadastrado")
    uid = inserir(ctx.con, "usuarios", {"nome": nome, "email": email, "senha_hash": hash_senha(d["senha"]), "papel": "usuario",
                                         "criado_em": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S.%f")})
    ctx.con.commit()
    return 201, saidas.usuario(um(ctx.con, "SELECT * FROM usuarios WHERE id = ?", (uid,)))


@rota("POST", "/auth/login", auth=None)
def login(ctx):
    global _HASH_FALSO
    d = validar(ctx.corpo, {"email": F("email", req=True), "senha": F("str", req=True)})
    u = um(ctx.con, "SELECT * FROM usuarios WHERE email = ?", (d["email"].lower(),))
    if _HASH_FALSO is None:
        _HASH_FALSO = hash_senha("senha-falsa-para-tempo-constante")
    ok = verificar_senha(d["senha"], u["senha_hash"] if u else _HASH_FALSO)
    if u is None or not ok:
        raise Erro(401, "E-mail ou senha inválidos")
    if hash_antigo(u["senha_hash"]):  # conta criada na versão antiga: passa para o novo formato de hash
        ctx.con.execute("UPDATE usuarios SET senha_hash = ? WHERE id = ?", (hash_senha(d["senha"]), u["id"]))
        ctx.con.commit()
    return {"token": criar_token(u["id"]), "usuario": saidas.usuario(u)}


@rota("GET", "/auth/me")
def me(ctx):
    return saidas.usuario(ctx.usuario)
