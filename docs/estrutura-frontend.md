# Estrutura do frontend (`frontend/src/app`)
<<<<<<< HEAD
- `core/`: `http/api.service.ts` (cliente HTTP central), `theme/` (aparência completa), `auth/` (login, interceptor JWT), `auth.guard.ts` (auth, visitante, admin), `ui/` (toast, confete).
=======
- `core/`: `http/api.service.ts` (cliente HTTP central), `theme/` (claro/escuro), `auth.guard.ts` (placeholder).
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
- `shared/`: componentes reutilizáveis `foco-icon`, `foco-logo`, `foco-progress`, `foco-badge`, `foco-empty-state`.
- `layouts/main-layout`: sidebar + header (menu responsivo, alternância de tema).
- `pages/`: login, cadastro, dashboard, disciplinas, tarefas, projetos, trilhas, calendario, foco, assistente (lazy loading).
- `services/`: um serviço por recurso, já apontando para os endpoints propostos.
- `models/index.ts`: interfaces TypeScript.
<<<<<<< HEAD
- Os mocks foram removidos: todas as telas consomem a API.
- Design system: `src/styles/tokens.css` (variáveis) e `src/styles.css` (classes globais `.btn`, `.card`, `.field`, `.grid`). Componentes usam só variáveis `--color-*`, nunca HEX.
- `environments/environment.ts`: `apiUrl` (`/api`, relativo; `ng serve` usa `proxy.conf.json`). Sem credenciais.
=======
- `mocks/mock-data.ts`: dados fictícios, só para visualização. Remover ao integrar.
- Design system: `src/styles/tokens.css` (variáveis) e `src/styles.css` (classes globais `.btn`, `.card`, `.field`, `.grid`). Componentes usam só variáveis `--color-*`, nunca HEX.
- `environments/environment.ts`: `apiUrl` (http://localhost:8000/api). Sem credenciais.
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
