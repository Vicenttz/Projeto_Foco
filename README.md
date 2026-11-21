# FOCO

<<<<<<< HEAD
Plataforma web de organização e produtividade para estudantes: disciplinas, tarefas, projetos, trilhas de aprendizagem, calendário, foco com temporizador e um assistente de IA.

> O FOCO não decide como o estudante deve estudar. Ele oferece ferramentas e inteligência para que o próprio estudante consiga se organizar melhor.

**Tecnologias:** Angular 19 (frontend) · Python/FastAPI (backend) · SQLite por padrão, MySQL opcional (banco) · JWT + bcrypt (login).

---

## ▶ Como rodar (um comando só)

**Requisito:** [Python 3.10+](https://www.python.org/downloads/) (no Windows, marque *"Add Python to PATH"* ao instalar).
**Node.js não é necessário** para usar o projeto: o site já vem compilado em `backend/static`.

| Sistema | Comando |
|---|---|
| Windows | dê dois cliques em **`iniciar.bat`** (ou `python iniciar.py`) |
| Linux / Mac | `python3 iniciar.py` (ou `./iniciar.sh`) |

Na primeira vez ele cria o ambiente virtual, instala as dependências, cria o banco e abre **http://localhost:8000** no navegador.
O site, a API e o banco rodam **juntos, no mesmo processo**: não precisa subir backend e frontend separados.

Opções: `--porta 9000` · `--sem-navegador` · `--dev` (recarrega a API ao editar) · `--rebuild` (recompila o Angular; precisa de Node.js).

## 👤 Contas de teste

Criadas automaticamente na primeira execução (também aparecem como botões na tela de login):

| Perfil | E-mail | Senha | O que vê |
|---|---|---|---|
| Aluno | `aluno@foco.com` | `Aluno@123` | Dados de exemplo (disciplinas, tarefas, projetos, trilhas, eventos) |
| Administrador | `admin@foco.com` | `Admin@123` | Tudo do aluno + **Painel admin** (estatísticas, promover/remover usuários) |

> ⚠ Em produção, desative com `SEED_DEMO=false` no `.env`, **troque as senhas** e remova os botões de teste de `frontend/src/app/pages/login`.

## 🎨 Personalização

Menu **Aparência** (ou o ícone de paleta no topo): temas prontos, modo claro/escuro/automático, 7 paletas + cor própria, estilo dos cards (vidro/sólido/contorno), fundo (bolhas/grade/pontos/liso), fonte, arredondamento e animações. Fica salvo no navegador.

## 🗄 Banco de dados

- **Padrão: SQLite** em `backend/foco.db`, criado sozinho. Zero configuração.
- **MySQL (opcional):** crie o banco (`CREATE DATABASE foco CHARACTER SET utf8mb4;`), copie `backend/.env.example` para `backend/.env` e preencha `DATABASE_URL=mysql+pymysql://USUARIO:SENHA@localhost:3306/foco`. As tabelas são criadas na inicialização.
- A chave JWT é gerada sozinha em `backend/.secret_key` (ou defina `SECRET_KEY` no `.env`).
- Para zerar tudo: pare o servidor e apague `backend/foco.db`.

## 🧱 Estrutura

```
iniciar.py / .bat / .sh   inicia tudo
backend/                  FastAPI: app/routers, services, models, schemas, core · tests/ · static/ (site compilado)
frontend/                 Angular 19: src/app/{core,layouts,pages,services,shared,models}, src/styles
database/                 reservado para scripts/migrations oficiais (MySQL)
docs/                     contrato da API, arquitetura, identidade visual, andamento
```
API interativa: `http://localhost:8000/docs`. Contrato: `docs/api-contract.md`.

## 🛠 Desenvolvimento

**Editar o frontend com recarga automática** (2 terminais):
```bash
python iniciar.py --sem-navegador --dev      # terminal 1: API em :8000
cd frontend && npm install && npm start      # terminal 2: site em http://localhost:4200 (proxy /api → :8000)
```
Antes de commitar mudanças do frontend, recompile para atualizar `backend/static`: `python iniciar.py --rebuild` (ou `cd frontend && npm run build`).

**Testes do backend** (SQLite em memória, não tocam no seu banco):
```bash
cd backend && venv/Scripts/python -m pytest      # Windows
cd backend && venv/bin/python -m pytest          # Linux/Mac
```

## 🔐 Segurança (resumo)

Senhas com bcrypt · login por JWT · cada usuário só enxerga os próprios dados (outro usuário = 404) · rotas `/api/admin/*` exigem papel `admin` (403) · o cadastro público sempre cria usuário comum.

## 🌿 Fluxo no GitHub

Ninguém trabalha direto na `main`: branches `feature/...`, commits pequenos e Pull Request. Atualize `docs/andamento.md` a cada entrega.
=======
Plataforma web de organização e produtividade para estudantes: disciplinas, tarefas, projetos, trilhas de aprendizagem, calendário e um assistente de IA.
> O FOCO não decide como o estudante deve estudar. Ele oferece ferramentas e inteligência para que o próprio estudante consiga se organizar melhor.

## Tecnologias
Frontend: Angular 19 + TypeScript. Futuro: Python/FastAPI, MySQL, Gemini API.

## Estrutura
```
frontend/   Angular (Davi)        backend/  FastAPI (Yan)
database/   MySQL (Richard)       docs/     documentação
```

## Rodar o frontend
```bash
cd frontend
npm install
npm start        # http://localhost:4200
```

## Fluxo no GitHub
Ninguém trabalha na `main`. Branches: `feature/frontend-foundation` (Davi), `feature/backend-api` (Yan), `feature/database-ai` (Richard). Commits pequenos e Pull Request para a `main`. Atualize `docs/andamento.md` a cada entrega.
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
