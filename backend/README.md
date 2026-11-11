# Backend FOCO (FastAPI)

API em Python/FastAPI. Base: `http://localhost:8000/api`. Documentação automática: `http://localhost:8000/docs`.

## Instalar
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac
pip install -r requirements-dev.txt
copy .env.example .env         # Linux/Mac: cp .env.example .env  (e preencha DATABASE_URL e SECRET_KEY)
```
O `venv/` e o `.env` NÃO vão para o GitHub.

## Banco (desenvolvimento)
Crie um banco vazio no MySQL (ex.: `CREATE DATABASE foco CHARACTER SET utf8mb4;`) e, enquanto o esquema oficial do Richard
não existe, crie as tabelas provisórias:
```bash
python -m scripts.criar_tabelas_dev
```

## Rodar
```bash
uvicorn app.main:app --reload --port 8000
```

## Testes
```bash
pytest
```
Os testes usam SQLite em memória (não tocam no MySQL).

## Estrutura
`app/routers` (rotas) · `app/services` (regras) · `app/models` (SQLAlchemy, provisório) · `app/schemas` (Pydantic, JSON camelCase)
· `app/core` (config e segurança) · `app/dependencies.py` (usuário autenticado).
Arquivos do Richard: `app/routers/assistente.py` (hoje provisório) e `app/services/ai/`.
