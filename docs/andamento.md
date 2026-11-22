# Andamento
## Feito (Davi, branch feature/frontend-foundation)
Projeto Angular 19, design system com cores do Figma (claro/escuro), 10 telas, layout responsivo, componentes compartilhados, rotas com lazy loading, serviços e modelos, mocks, documentação.
## Funciona
Navegação entre telas e alternância de tema. Dados são MOCK.
## Falta
- Valores pendentes do Figma (espaçamentos, raios, sombras) e formas decorativas de fundo.
- Formulários/modais de criar e editar (botões existem, sem ação). Calendário mensal em grade.
- Substituir mocks pelos serviços; validações de formulário; estados de carregamento/erro.
## Preparado para integração
`ApiService`, serviços por recurso, `authGuard` placeholder, `environment.apiUrl`.
## Decisões para os outros
- Yan: confirmar endpoints/nomes de campos em `api-contract.md`; implementar auth e o guard.
- Richard: modelagem a partir de `models/index.ts`; formato das respostas de IA.

## Backend (Yan, branch feature/backend-api) - etapa 1
### Feito
FastAPI em `backend/` (routers, services, models, schemas, core): cadastro, login (bcrypt + JWT), `/auth/me`, CRUD de disciplinas, tarefas, projetos (com etapas), trilhas (com etapas) e eventos, foco/prioridades, dashboard, `/assistente` provisório, CORS para `localhost:4200`, erros em `{"detail": ...}`, testes pytest (incluindo isolamento entre usuários). Contrato revisado em `docs/api-contract.md`.
### Decisões
- Nomes de campos do frontend mantidos (camelCase via alias do Pydantic). Nenhum campo foi renomeado.
- Criação retorna 201 (o contrato original não definia). Edição é parcial (o frontend envia `Partial<>`).
- `progresso` calculado pelo backend (etapas concluídas; tarefas concluídas da disciplina). **Pendente: confirmar com o Richard** se será calculado ou armazenado.
- E-mail duplicado: 409.
- Endpoints novos propostos: `/foco` e `/dashboard` (ver contrato). **Davi: avisar se o formato não atende as telas.**
### Provisório
- Models SQLAlchemy em `backend/app/models/` são PROVISÓRIOS (`database/` ainda está vazio). Substituir pelo esquema oficial do Richard. As tabelas provisórias são criadas por `python -m scripts.criar_tabelas_dev` (apenas desenvolvimento; não usar `create_all()` na versão final).
- `/assistente/mensagem` devolve resposta fixa; o Richard substitui `routers/assistente.py` e cria `services/ai/`.
### Falta
- Integração de auth no frontend (authGuard, interceptor do token, chamadas de login/cadastro), em commits separados e com aviso ao Davi.
- Trocar models pelo esquema oficial do Richard; testar com MySQL real; rodar frontend + API juntos.

## Integração completa (frontend + backend + banco)
### Corrigido
- Backend não subia sem `.env` (e exigia MySQL): agora usa SQLite por padrão e gera a chave JWT sozinho (`app/core/config.py`).
- `authInterceptor` nunca era registrado, então o token JWT não era enviado: registrado em `app.config.ts`.
- Datas em inglês e "hoje" errado à noite (UTC): locale pt-BR e `isoLocal()`.
### Feito
- Banco: SQLite padrão / MySQL opcional; criação automática de tabelas e coluna `papel`; contas de teste (aluno e admin) + dados de exemplo (`services/seed.py`).
- Perfis: papel `usuario`/`admin`, rotas `/api/admin/*`, `adminGuard`, painel admin.
- Todas as telas usam a API (mocks removidos), com criar/editar/excluir, calendário mensal, foco com temporizador.
- Visual novo: tema customizável (aba Aparência), vidro, gradientes, fundo animado, ilustrações SVG, confete.
- Um comando roda tudo (`iniciar.py`): a API serve o frontend compilado (`backend/static`).
### Falta
- Substituir os models provisórios pelo esquema oficial do Richard (se houver) e integrar a Gemini no assistente.
- Recuperação de senha; remover os botões de conta de teste da tela de login antes de produção.

## Calendário interativo + mensagem diária da IA (Yan)
### Feito
- Calendário reformulado (`pages/calendario`): visões mês/semana, agendar **provas** e **sessões de estudo** (horário, duração, disciplina, observações), arrastar compromissos para reagendar, marcar estudo como feito, filtro por tipo, painel do dia, próximas provas com contagem regressiva e horas de estudo agendadas.
- Eventos ganharam `prova` e os campos `hora`, `duracaoMin`, `disciplinaId`, `descricao`, `concluido` (contrato em `docs/api-contract.md`). Bancos já existentes são migrados sozinhos (`seed._adicionar_colunas`); a conta de teste antiga é atualizada com uma prova e um estudo.
- Mensagem do dia (`GET /assistente/diario`, `services/briefing.py`): o assistente lê a agenda e as tarefas, avisa de provas, cobra estudo não agendado e sugere ações (que abrem o calendário pré-preenchido). Pop-up na primeira entrada do dia, botão no topo e abertura do chat do Assistente.
- O chat provisório (`/assistente/mensagem`) passou a responder perguntas de agenda com o mesmo resumo.
### Decisões e riscos
- O texto padrão é montado por **regras** (determinístico, sem enviar dados a terceiros). A reescrita pelo Gemini é opcional (`GEMINI_API_KEY`) e **ainda não foi testada contra a API real**; o Richard pode trocar por `services/ai/`.
- A mensagem do dia fica guardada no navegador até o calendário mudar (invalida o cache).
- Arquivos do Davi alterados: `calendario.component.ts` (reescrito), `assistente.component.ts`, `main-layout.component.ts` (botão + pop-up), `models/index.ts` e `core/util/data.ts`. **Davi: revisar.**
### Falta
- Lembretes fora do app (notificação do navegador/e-mail) e edição de horário arrastando na semana. Os testes novos estão em `backend/tests/test_calendario.py`.
