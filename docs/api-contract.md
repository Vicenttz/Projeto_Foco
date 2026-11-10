# Contrato da API (PROPOSTA, a revisar e confirmar pelo Yan)
Base: `http://localhost:8000/api`. JSON. Autenticação futura: `Authorization: Bearer <JWT>`. Campos seguem `frontend/src/app/models/index.ts`.

## Auth
| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| POST | /auth/cadastro | {nome, email, senha} | User |
| POST | /auth/login | {email, senha} | {token, usuario: User} |
| GET | /auth/me | - | User |

## Recursos (CRUD). Cada um filtra pelo usuário autenticado
Rotas: `/disciplinas`, `/tarefas`, `/projetos`, `/trilhas`, `/eventos`.
| Método | Rota | Descrição |
|---|---|---|
| GET | /{recurso} | Lista (tarefas aceitam ?status=&prioridade=&disciplinaId=) |
| GET | /{recurso}/{id} | Detalhe |
| POST | /{recurso} | Cria (corpo = modelo sem `id`) |
| PUT | /{recurso}/{id} | Atualiza |
| DELETE | /{recurso}/{id} | Remove |

Projetos incluem `etapas[]`; trilhas incluem `etapas[]`.

## IA (Richard)
POST /assistente/mensagem {texto} -> {texto}. Sugestões de tarefas/calendário: formato a definir. A IA nunca altera dados sozinha.

## Erros
Sugestão: `{ "detail": "mensagem" }` com status HTTP adequado.
