# FOCO

Plataforma web de organização e produtividade para estudantes: disciplinas, tarefas, projetos, trilhas de aprendizagem, calendário interativo (provas e estudos), foco com temporizador e um assistente de IA que lê a agenda e manda a mensagem do dia.

> O FOCO não decide como o estudante deve estudar. Ele oferece ferramentas e inteligência para que o próprio estudante consiga se organizar melhor.

**Tecnologias:** Angular 19 (frontend) · Python puro, só biblioteca padrão (backend) · SQLite (banco) · JWT + PBKDF2 (login).

---

## ▶ Como rodar (um comando só)

**Requisito:** [Python 3.10+](https://www.python.org/downloads/) (no Windows, marque *"Add Python to PATH"* ao instalar).
**Node.js não é necessário** para usar o projeto: o site já vem compilado em `backend/static`.

| Sistema | Comando |
|---|---|
| Windows | dê dois cliques em **`iniciar.bat`** (ou `python iniciar.py`) |
| Linux / Mac | `python3 iniciar.py` (ou `./iniciar.sh`) |

Ele **não instala nada** (o backend usa só a biblioteca padrão do Python): cria o banco e abre **http://localhost:8000** no navegador.
O site, a API e o banco rodam **juntos, no mesmo processo**: não precisa subir backend e frontend separados.

Opções: `--porta 9000` · `--sem-navegador` · `--rebuild` (recompila o Angular; precisa de Node.js).

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

- **SQLite** em `backend/foco.db`, criado sozinho. Zero configuração (o MySQL da versão antiga não é mais usado).
- A chave JWT é gerada sozinha em `backend/.secret_key` (ou defina `SECRET_KEY` no `.env`).
- Para zerar tudo: pare o servidor e apague `backend/foco.db`.

## 🧱 Estrutura

```
iniciar.py / .bat / .sh   inicia tudo
backend/                  Python puro: app/servidor.py, rotas/, db, validacao, saidas · tests/ · static/ (site compilado)
frontend/                 Angular 19: src/app/{core,layouts,pages,services,shared,models}, src/styles
database/                 reservado para scripts/migrations oficiais
docs/                     contrato da API, arquitetura, identidade visual, andamento
```
Contrato da API: `docs/api-contract.md`. Teste rápido: `http://localhost:8000/api/health`.

## 🛠 Desenvolvimento

**Editar o frontend com recarga automática** (2 terminais):
```bash
python iniciar.py --sem-navegador --dev      # terminal 1: API em :8000
cd frontend && npm install && npm start      # terminal 2: site em http://localhost:4200 (proxy /api → :8000)
```
Antes de commitar mudanças do frontend, recompile para atualizar `backend/static`: `python iniciar.py --rebuild` (ou `cd frontend && npm run build`).

**Testes do backend** (SQLite em memória, não tocam no seu banco):
```bash
pip install pytest                               # só para os testes
cd backend && python -m pytest
```

## 🔐 Segurança (resumo)

Senhas com PBKDF2-SHA256 · login por JWT · cada usuário só enxerga os próprios dados (outro usuário = 404) · rotas `/api/admin/*` exigem papel `admin` (403) · o cadastro público sempre cria usuário comum.

## 🌿 Fluxo no GitHub

Ninguém trabalha direto na `main`: branches `feature/...`, commits pequenos e Pull Request. Atualize `docs/andamento.md` a cada entrega.
