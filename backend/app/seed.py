"""Criação/atualização do banco e das contas de teste.

Contas de teste (criadas só se ainda não existirem; desligue com SEED_DEMO=false):
  Aluno:  aluno@foco.com  / Aluno@123
  Admin:  admin@foco.com  / Admin@123
"""
from datetime import date, datetime, time, timedelta, timezone

from . import db
from .db import inserir, um
from .seguranca import hash_antigo, hash_senha, verificar_senha

ALUNO = {"nome": "Aluno Teste", "email": "aluno@foco.com", "senha": "Aluno@123", "papel": "usuario"}
ADMIN = {"nome": "Administrador", "email": "admin@foco.com", "senha": "Admin@123", "papel": "admin"}


def garantir_schema() -> None:
    db.garantir_schema()


def _criar_usuario(con, dados: dict) -> tuple[int, bool]:
    existente = um(con, "SELECT id, senha_hash FROM usuarios WHERE email = ?", (dados["email"],))
    if existente:
        if hash_antigo(existente["senha_hash"]) and not verificar_senha(dados["senha"], existente["senha_hash"]):
            # Conta de teste criada pela versão antiga (hash bcrypt): como a senha é pública, passa para o formato novo.
            con.execute("UPDATE usuarios SET senha_hash = ? WHERE id = ?", (hash_senha(dados["senha"]), existente["id"]))
            con.commit()
        return existente["id"], False
    uid = inserir(con, "usuarios", {"nome": dados["nome"], "email": dados["email"], "senha_hash": hash_senha(dados["senha"]),
                                     "papel": dados["papel"], "criado_em": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S.%f")})
    con.commit()
    return uid, True


def _etapas(con, tabela: str, fk: str, pai: int, itens) -> None:
    for ordem, (titulo, ok) in enumerate(itens):
        inserir(con, tabela, {fk: pai, "titulo": titulo, "concluida": int(ok), "ordem": ordem})


def _dados_exemplo(con, uid: int) -> None:
    hoje = date.today()
    d = lambda n: (hoje + timedelta(days=n)).isoformat()  # noqa: E731

    calc = inserir(con, "disciplinas", {"usuario_id": uid, "nome": "Cálculo I", "professor": "Prof. Silva", "cor": "#8746eb",
                                         "descricao": "Limites, derivadas e integrais. Prova no fim do mês."})
    web = inserir(con, "disciplinas", {"usuario_id": uid, "nome": "Programação Web", "professor": "Prof. Costa", "cor": "#0ea5e9",
                                        "descricao": "Front-end com Angular e consumo de APIs."})
    bd = inserir(con, "disciplinas", {"usuario_id": uid, "nome": "Banco de Dados", "professor": "Prof. Lima", "cor": "#16a34a",
                                       "descricao": "Modelagem relacional e consultas SQL."})

    tarefas = [
        (calc, "Lista de exercícios 3", "Derivadas e limites", "alta", d(1), "pendente", 1),
        (web, "Protótipo da interface", "Telas principais no Figma", "media", d(3), "em_andamento", 0),
        (bd, "Modelagem do DER", None, "baixa", d(-1), "concluida", 0),
        (bd, "Consultas SQL com JOIN", None, "alta", d(5), "pendente", 0),
        (calc, "Revisar integrais", None, "media", d(7), "pendente", 0),
        (web, "Publicar site da disciplina", None, "baixa", d(10), "concluida", 0),
    ]
    for disc, titulo, desc, prio, prazo, status, foco in tarefas:
        inserir(con, "tarefas", {"usuario_id": uid, "disciplina_id": disc, "titulo": titulo, "descricao": desc,
                                  "prioridade": prio, "prazo": prazo, "status": status, "em_foco": foco})

    p = inserir(con, "projetos", {"usuario_id": uid, "nome": "Projeto FOCO", "descricao": "Plataforma de organização de estudos",
                                   "data_entrega": d(21), "status": "em_andamento"})
    _etapas(con, "projeto_etapas", "projeto_id", p, [("Identidade visual", True), ("Frontend", True), ("Backend", False), ("Banco de dados", False)])
    p2 = inserir(con, "projetos", {"usuario_id": uid, "nome": "Feira de Ciências", "descricao": "Apresentação do experimento",
                                    "data_entrega": d(35), "status": "pendente"})
    _etapas(con, "projeto_etapas", "projeto_id", p2, [("Pesquisa", False), ("Montagem", False), ("Ensaio", False)])

    t1 = inserir(con, "trilhas", {"usuario_id": uid, "assunto": "Fundamentos de Angular", "disciplina_id": web})
    _etapas(con, "trilha_etapas", "trilha_id", t1, [("Componentes", True), ("Rotas", True), ("Serviços HTTP", False), ("Formulários", False)])
    t2 = inserir(con, "trilhas", {"usuario_id": uid, "assunto": "SQL do zero", "disciplina_id": bd})
    _etapas(con, "trilha_etapas", "trilha_id", t2, [("SELECT e WHERE", True), ("JOINs", False), ("Agregações", False)])

    eventos = [
        ("Prova de Cálculo", d(6), "prova", "14:00:00", 120, calc, "Capítulos 1 a 4: limites, derivadas e integrais."),
        ("Entrega do protótipo", d(3), "entrega", None, None, web, None),
        ("Estudo: SQL com JOIN", d(2), "estudo", "19:00:00", 60, bd, None),
        ("Revisão em grupo", d(9), "tarefa", None, None, None, None),
    ]
    for titulo, data, tipo, hora, dur, disc, desc in eventos:
        inserir(con, "eventos", {"usuario_id": uid, "titulo": titulo, "data": data, "tipo": tipo, "hora": hora,
                                  "duracao_min": dur, "disciplina_id": disc, "descricao": desc})
    con.commit()


def _atualizar_agenda_demo(con, uid: int) -> None:
    """Contas de teste criadas antes do calendário novo: converte a 'Prova' em prova de verdade (com hora)
    e agenda uma sessão de estudo. Só roda se o aluno ainda não tem nenhuma prova."""
    if um(con, "SELECT 1 FROM eventos WHERE usuario_id = ? AND tipo = 'prova'", (uid,)):
        return
    calc = um(con, "SELECT id FROM disciplinas WHERE usuario_id = ? AND nome = 'Cálculo I'", (uid,))
    antiga = um(con, "SELECT * FROM eventos WHERE usuario_id = ? AND titulo = 'Prova de Cálculo'", (uid,))
    if antiga is not None:
        disc = calc["id"] if calc else None
        con.execute("UPDATE eventos SET tipo = 'prova', hora = '14:00:00', duracao_min = 120, disciplina_id = ? WHERE id = ?",
                    (disc, antiga["id"]))
        data_estudo = (date.fromisoformat(str(antiga["data"])[:10]) - timedelta(days=2)).isoformat()
        inserir(con, "eventos", {"usuario_id": uid, "titulo": "Estudo: revisão de integrais", "data": data_estudo,
                                  "tipo": "estudo", "hora": "19:00:00", "duracao_min": 90, "disciplina_id": disc})
        con.commit()


def criar_usuarios_demo() -> None:
    con = db.conectar()
    try:
        _criar_usuario(con, ADMIN)
        aluno, novo = _criar_usuario(con, ALUNO)
        if novo:
            _dados_exemplo(con, aluno)
        else:
            _atualizar_agenda_demo(con, aluno)
    finally:
        con.close()


def inicializar(seed: bool = True) -> None:
    garantir_schema()
    if seed:
        criar_usuarios_demo()
