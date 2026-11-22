# Estrutura do frontend (`frontend/src/app`)
- `core/`: `http/api.service.ts` (cliente HTTP central), `theme/` (aparência completa), `auth/` (login, interceptor JWT), `auth.guard.ts` (auth, visitante, admin), `ui/` (toast, confete).
- `shared/`: componentes reutilizáveis `foco-icon`, `foco-logo`, `foco-progress`, `foco-badge`, `foco-empty-state`.
- `layouts/main-layout`: sidebar + header (menu responsivo, alternância de tema).
- `pages/`: login, cadastro, dashboard, disciplinas, tarefas, projetos, trilhas, calendario, foco, assistente (lazy loading).
- `services/`: um serviço por recurso, já apontando para os endpoints propostos.
- `models/index.ts`: interfaces TypeScript.
- Os mocks foram removidos: todas as telas consomem a API.
- Design system: `src/styles/tokens.css` (variáveis) e `src/styles.css` (classes globais `.btn`, `.card`, `.field`, `.grid`). Componentes usam só variáveis `--color-*`, nunca HEX.
- `environments/environment.ts`: `apiUrl` (`/api`, relativo; `ng serve` usa `proxy.conf.json`). Sem credenciais.
