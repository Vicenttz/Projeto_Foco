"""Criação/atualização do banco e das contas de teste.

Contas de teste (criadas só se ainda não existirem; desligue com SEED_DEMO=false):
  Aluno:  aluno@foco.com  / Aluno@123
  Admin:  admin@foco.com  / Admin@123
"""
from datetime import date, timedelta

from sqlalchemy import inspect, select, text
from sqlalchemy.orm import Session

from app.core.security import hash_senha
from app.database import Base, SessionLocal, engine
from app.models import Disciplina, Evento, Projeto, ProjetoEtapa, Tarefa, Trilha, TrilhaEtapa, Usuario

ALUNO = {"nome": "Aluno Teste", "email": "aluno@foco.com", "senha": "Aluno@123", "papel": "usuario"}
ADMIN = {"nome": "Administrador", "email": "admin@foco.com", "senha": "Admin@123", "papel": "admin"}


def garantir_schema() -> None:
    """Cria as tabelas que faltam e adiciona a coluna `papel` se o banco já existia sem ela."""
    import app.models  # noqa: F401  (registra os models)

    Base.metadata.create_all(engine)
    colunas = {c["name"] for c in inspect(engine).get_columns("usuarios")}
    if "papel" not in colunas:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE usuarios ADD COLUMN papel VARCHAR(20) NOT NULL DEFAULT 'usuario'"))


def _criar_usuario(db: Session, dados: dict) -> tuple[Usuario, bool]:
    existente = db.scalar(select(Usuario).where(Usuario.email == dados["email"]))
    if existente:
        return existente, False
    u = Usuario(nome=dados["nome"], email=dados["email"], senha_hash=hash_senha(dados["senha"]), papel=dados["papel"])
    db.add(u)
    db.commit()
    db.refresh(u)
    return u, True


def _dados_exemplo(db: Session, u: Usuario) -> None:
    hoje = date.today()
    d = lambda n: hoje + timedelta(days=n)  # noqa: E731

    calc = Disciplina(usuario_id=u.id, nome="Cálculo I", professor="Prof. Silva", cor="#8746eb")
    web = Disciplina(usuario_id=u.id, nome="Programação Web", professor="Prof. Costa", cor="#0ea5e9")
    bd = Disciplina(usuario_id=u.id, nome="Banco de Dados", professor="Prof. Lima", cor="#16a34a")
    db.add_all([calc, web, bd])
    db.flush()

    db.add_all([
        Tarefa(usuario_id=u.id, disciplina_id=calc.id, titulo="Lista de exercícios 3", descricao="Derivadas e limites",
               prioridade="alta", prazo=d(1), status="pendente", em_foco=True),
        Tarefa(usuario_id=u.id, disciplina_id=web.id, titulo="Protótipo da interface", descricao="Telas principais no Figma",
               prioridade="media", prazo=d(3), status="em_andamento"),
        Tarefa(usuario_id=u.id, disciplina_id=bd.id, titulo="Modelagem do DER", prioridade="baixa",
               prazo=d(-1), status="concluida"),
        Tarefa(usuario_id=u.id, disciplina_id=bd.id, titulo="Consultas SQL com JOIN", prioridade="alta",
               prazo=d(5), status="pendente"),
        Tarefa(usuario_id=u.id, disciplina_id=calc.id, titulo="Revisar integrais", prioridade="media",
               prazo=d(7), status="pendente"),
        Tarefa(usuario_id=u.id, disciplina_id=web.id, titulo="Publicar site da disciplina", prioridade="baixa",
               prazo=d(10), status="concluida"),
    ])

    p = Projeto(usuario_id=u.id, nome="Projeto FOCO", descricao="Plataforma de organização de estudos",
                data_entrega=d(21), status="em_andamento")
    p.etapas = [ProjetoEtapa(titulo=t, concluida=c, ordem=i) for i, (t, c) in enumerate(
        [("Identidade visual", True), ("Frontend", True), ("Backend", False), ("Banco de dados", False)])]
    p2 = Projeto(usuario_id=u.id, nome="Feira de Ciências", descricao="Apresentação do experimento",
                 data_entrega=d(35), status="pendente")
    p2.etapas = [ProjetoEtapa(titulo=t, concluida=False, ordem=i) for i, t in enumerate(["Pesquisa", "Montagem", "Ensaio"])]
    db.add_all([p, p2])

    t1 = Trilha(usuario_id=u.id, assunto="Fundamentos de Angular")
    t1.etapas = [TrilhaEtapa(titulo=t, concluida=c, ordem=i) for i, (t, c) in enumerate(
        [("Componentes", True), ("Rotas", True), ("Serviços HTTP", False), ("Formulários", False)])]
    t2 = Trilha(usuario_id=u.id, assunto="SQL do zero")
    t2.etapas = [TrilhaEtapa(titulo=t, concluida=c, ordem=i) for i, (t, c) in enumerate(
        [("SELECT e WHERE", True), ("JOINs", False), ("Agregações", False)])]
    db.add_all([t1, t2])

    db.add_all([
        Evento(usuario_id=u.id, titulo="Prova de Cálculo", data=d(6), tipo="evento"),
        Evento(usuario_id=u.id, titulo="Entrega do protótipo", data=d(3), tipo="entrega"),
        Evento(usuario_id=u.id, titulo="Sessão de estudo: SQL", data=d(2), tipo="estudo"),
        Evento(usuario_id=u.id, titulo="Revisão em grupo", data=d(9), tipo="tarefa"),
    ])
    db.commit()


def criar_usuarios_demo() -> None:
    with SessionLocal() as db:
        _criar_usuario(db, ADMIN)
        aluno, novo = _criar_usuario(db, ALUNO)
        if novo:
            _dados_exemplo(db, aluno)


def inicializar(seed: bool = True) -> None:
    garantir_schema()
    if seed:
        criar_usuarios_demo()
