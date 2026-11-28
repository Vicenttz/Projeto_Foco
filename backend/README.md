# Backend FOCO (Python puro)

API + servidor em Python, **só com a biblioteca padrão** (`http.server`, `sqlite3`, `hashlib`, `hmac`, `json`).
**Não há nada para instalar** (nenhum `pip install`, nenhum ambiente virtual): roda em qualquer máquina com Python 3.10+.
Base: `http://localhost:8000/api`. Contrato das rotas: `docs/api-contract.md`.

## Rodar
Na raiz do projeto: `python iniciar.py` (ou, aqui dentro: `python -m app.servidor 8000`).
O servidor cria o banco SQLite (`backend/foco.db`) e as contas de teste sozinho, e serve também o site (`backend/static`).

## Testes
Só para desenvolvimento (precisa do pytest): `pip install pytest` e depois, em `backend/`: `python -m pytest`.
Os testes sobem o servidor de verdade e usam um banco temporário (não tocam no `foco.db`).

## Estrutura
- `app/servidor.py` — servidor HTTP, roteamento, CORS, arquivos do site.
- `app/rotas/` — rotas (auth, recursos [disciplinas/tarefas/projetos/trilhas/eventos], foco+dashboard, assistente, admin).
- `app/validacao.py` — validação das entradas (erros 422 em `{"detail": "campo: mensagem"}`).
- `app/saidas.py` — monta os JSONs (camelCase) e calcula os progressos.
- `app/db.py` — SQLite: tabelas, migração automática de colunas novas, helpers.
- `app/seguranca.py` — senha (PBKDF2-SHA256) e token JWT (HS256).
- `app/briefing.py` — mensagem diária do assistente (regras locais; Gemini opcional).
- `app/seed.py` — contas e dados de teste · `app/config.py` — configuração (`.env` opcional, veja `.env.example`).

## Observações
- Contas criadas na versão antiga (FastAPI + bcrypt) continuam existindo; as contas de teste são convertidas
  automaticamente e as demais passam ao formato novo de senha no primeiro login (se o pacote `bcrypt` existir no
  computador). Se não existir, é só criar a conta de novo ou apagar `backend/foco.db`.
- MySQL não é mais usado: o banco é SQLite (um arquivo, zero configuração).
