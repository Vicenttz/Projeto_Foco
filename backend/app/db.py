"""Banco SQLite (módulo sqlite3 da biblioteca padrão). Datas ficam como texto ISO (AAAA-MM-DD / HH:MM:SS)."""
import sqlite3

from .config import cfg

SCHEMA = """
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY, nome VARCHAR(100) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL, papel VARCHAR(20) NOT NULL DEFAULT 'usuario', criado_em DATETIME NOT NULL);
CREATE TABLE IF NOT EXISTS disciplinas (
  id INTEGER PRIMARY KEY, usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL, professor VARCHAR(100), cor VARCHAR(20), descricao TEXT);
CREATE TABLE IF NOT EXISTS tarefas (
  id INTEGER PRIMARY KEY, usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  disciplina_id INTEGER REFERENCES disciplinas(id) ON DELETE SET NULL, titulo VARCHAR(200) NOT NULL, descricao TEXT,
  prioridade VARCHAR(10) NOT NULL DEFAULT 'media', prazo DATE NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'pendente',
  em_foco BOOLEAN NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS projetos (
  id INTEGER PRIMARY KEY, usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(150) NOT NULL, descricao TEXT, data_entrega DATE NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'pendente');
CREATE TABLE IF NOT EXISTS projeto_etapas (
  id INTEGER PRIMARY KEY, projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  titulo VARCHAR(200) NOT NULL, concluida BOOLEAN NOT NULL DEFAULT 0, ordem INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS trilhas (
  id INTEGER PRIMARY KEY, usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  assunto VARCHAR(200) NOT NULL, disciplina_id INTEGER REFERENCES disciplinas(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS trilha_etapas (
  id INTEGER PRIMARY KEY, trilha_id INTEGER NOT NULL REFERENCES trilhas(id) ON DELETE CASCADE,
  titulo VARCHAR(200) NOT NULL, concluida BOOLEAN NOT NULL DEFAULT 0, ordem INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS eventos (
  id INTEGER PRIMARY KEY, usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo VARCHAR(200) NOT NULL, data DATE NOT NULL, tipo VARCHAR(20) NOT NULL DEFAULT 'evento', hora TIME,
  duracao_min INTEGER, disciplina_id INTEGER REFERENCES disciplinas(id) ON DELETE SET NULL, descricao TEXT,
  concluido BOOLEAN NOT NULL DEFAULT 0);
"""
# Colunas que bancos criados por versões antigas ainda não têm (migração simples e automática).
COLUNAS_NOVAS = {
    "usuarios": {"papel": "VARCHAR(20) NOT NULL DEFAULT 'usuario'"},
    "disciplinas": {"descricao": "TEXT"},
    "trilhas": {"disciplina_id": "INTEGER"},
    "eventos": {"hora": "TIME", "duracao_min": "INTEGER", "disciplina_id": "INTEGER", "descricao": "TEXT",
                "concluido": "BOOLEAN NOT NULL DEFAULT 0"},
}


def conectar() -> sqlite3.Connection:
    con = sqlite3.connect(cfg.DB_PATH, timeout=15)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys=ON")  # o SQLite só respeita CASCADE/SET NULL com isto ligado
    return con


def garantir_schema() -> None:
    """Cria as tabelas que faltam e adiciona colunas novas em bancos já existentes."""
    con = conectar()
    try:
        con.executescript(SCHEMA)
        for tabela, colunas in COLUNAS_NOVAS.items():
            existentes = {r["name"] for r in con.execute(f"PRAGMA table_info({tabela})")}
            for nome, definicao in colunas.items():
                if nome not in existentes:
                    con.execute(f"ALTER TABLE {tabela} ADD COLUMN {nome} {definicao}")
        con.commit()
    finally:
        con.close()


def um(con, sql: str, params=()):
    return con.execute(sql, params).fetchone()


def todos(con, sql: str, params=()) -> list:
    return con.execute(sql, params).fetchall()


def inserir(con, tabela: str, valores: dict) -> int:
    cols = ", ".join(valores)
    marcas = ", ".join("?" for _ in valores)
    return con.execute(f"INSERT INTO {tabela} ({cols}) VALUES ({marcas})", tuple(valores.values())).lastrowid


def atualizar(con, tabela: str, id: int, valores: dict) -> None:
    if valores:
        sets = ", ".join(f"{c} = ?" for c in valores)
        con.execute(f"UPDATE {tabela} SET {sets} WHERE id = ?", (*valores.values(), id))
