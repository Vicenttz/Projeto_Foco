# Estrutura do frontend (`frontend/src/app`)
- `core/`: `http/api.service.ts` (cliente HTTP central), `theme/` (claro/escuro), `auth.guard.ts` (placeholder).
- `shared/`: componentes reutilizáveis `foco-icon`, `foco-logo`, `foco-progress`, `foco-badge`, `foco-empty-state`.
- `layouts/main-layout`: sidebar + header (menu responsivo, alternância de tema).
- `pages/`: login, cadastro, dashboard, disciplinas, tarefas, projetos, trilhas, calendario, foco, assistente (lazy loading).
- `services/`: um serviço por recurso, já apontando para os endpoints propostos.
- `models/index.ts`: interfaces TypeScript.
- `mocks/mock-data.ts`: dados fictícios, só para visualização. Remover ao integrar.
- Design system: `src/styles/tokens.css` (variáveis) e `src/styles.css` (classes globais `.btn`, `.card`, `.field`, `.grid`). Componentes usam só variáveis `--color-*`, nunca HEX.
- `environments/environment.ts`: `apiUrl` (http://localhost:8000/api). Sem credenciais.
