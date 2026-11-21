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
