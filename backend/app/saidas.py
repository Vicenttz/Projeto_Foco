"""Converte linhas do banco no JSON (camelCase) que o frontend espera."""
from datetime import date, time

from .db import todos, um


def percentual(feitos: int, total: int) -> int:
    return round(100 * feitos / total) if total else 0


def hhmm(v) -> str | None:
    return str(v)[:5] if v else None


def parse_data(v) -> date:
    return date.fromisoformat(str(v)[:10])


def parse_hora(v) -> time | None:
    return time.fromisoformat(str(v)) if v else None


def usuario(u) -> dict:
    return {"id": u["id"], "nome": u["nome"], "email": u["email"], "papel": u["papel"] or "usuario"}


def tarefa(t) -> dict:
    return {"id": t["id"], "titulo": t["titulo"], "descricao": t["descricao"], "disciplinaId": t["disciplina_id"],
            "prioridade": t["prioridade"], "prazo": str(t["prazo"])[:10], "status": t["status"]}


def evento(e) -> dict:
    return {"id": e["id"], "titulo": e["titulo"], "data": str(e["data"])[:10], "tipo": e["tipo"], "hora": hhmm(e["hora"]),
            "duracaoMin": e["duracao_min"], "disciplinaId": e["disciplina_id"], "descricao": e["descricao"],
            "concluido": bool(e["concluido"])}


def _etapas(con, tabela: str, fk: str, pai_id: int) -> list[dict]:
    rows = todos(con, f"SELECT id, titulo, concluida FROM {tabela} WHERE {fk} = ? ORDER BY ordem, id", (pai_id,))
    return [{"id": r["id"], "titulo": r["titulo"], "concluida": bool(r["concluida"])} for r in rows]


def projeto(con, p) -> dict:
    etapas = _etapas(con, "projeto_etapas", "projeto_id", p["id"])
    return {"id": p["id"], "nome": p["nome"], "descricao": p["descricao"], "dataEntrega": str(p["data_entrega"])[:10],
            "progresso": percentual(sum(e["concluida"] for e in etapas), len(etapas)), "status": p["status"], "etapas": etapas}


def trilha(con, t) -> dict:
    etapas = _etapas(con, "trilha_etapas", "trilha_id", t["id"])
    return {"id": t["id"], "assunto": t["assunto"], "disciplinaId": t["disciplina_id"],
            "progresso": percentual(sum(e["concluida"] for e in etapas), len(etapas)), "etapas": etapas}


def disciplina(con, d) -> dict:
    """progresso: com trilhas vinculadas (e etapas nelas) = % das etapas concluídas; senão, % de tarefas concluídas."""
    t = um(con, "SELECT COUNT(*) AS n, COALESCE(SUM(status = 'concluida'), 0) AS ok FROM tarefas WHERE disciplina_id = ?", (d["id"],))
    trilhas, total_et, ok_et = [], 0, 0
    for tr in todos(con, "SELECT id, assunto FROM trilhas WHERE disciplina_id = ? ORDER BY id", (d["id"],)):
        e = um(con, "SELECT COUNT(*) AS n, COALESCE(SUM(concluida), 0) AS ok FROM trilha_etapas WHERE trilha_id = ?", (tr["id"],))
        total_et, ok_et = total_et + e["n"], ok_et + e["ok"]
        trilhas.append({"id": tr["id"], "assunto": tr["assunto"], "progresso": percentual(e["ok"], e["n"])})
    progresso = percentual(ok_et, total_et) if total_et else percentual(t["ok"], t["n"])
    return {"id": d["id"], "nome": d["nome"], "professor": d["professor"], "cor": d["cor"], "descricao": d["descricao"],
            "progresso": progresso, "totalTarefas": t["n"], "tarefasConcluidas": t["ok"],
            "totalEtapas": total_et, "etapasConcluidas": ok_et, "trilhas": trilhas}
