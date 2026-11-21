# Contrato da API (revisado e confirmado pelo Yan)
Base: `http://localhost:8000/api`. JSON em **camelCase**, datas em ISO 8601 (`YYYY-MM-DD`). Autenticação: `Authorization: Bearer <JWT>`
(todas as rotas exigem token, exceto `/auth/cadastro` e `/auth/login`). Campos seguem `frontend/src/app/models/index.ts`.
Documentação interativa: `http://localhost:8000/docs`.

## Auth
| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| POST | /auth/cadastro | {nome, email, senha} (senha: 8+ caracteres) | 201 User |
| POST | /auth/login | {email, senha} | 200 {token, usuario: User} |
| GET | /auth/me | - | User |

`User` = `{id, nome, email}`. Senha e hash nunca são devolvidos. E-mail repetido no cadastro: 409.

## Recursos (CRUD). Cada um filtra pelo usuário autenticado
Rotas: `/disciplinas`, `/tarefas`, `/projetos`, `/trilhas`, `/eventos`.
| Método | Rota | Descrição | Sucesso |
|---|---|---|---|
| GET | /{recurso} | Lista (tarefas aceitam `?status=&prioridade=&disciplinaId=`) | 200 |
| GET | /{recurso}/{id} | Detalhe | 200 |
| POST | /{recurso} | Cria (corpo = modelo sem `id`) | **201** |
| PUT | /{recurso}/{id} | Atualiza. **Parcial**: só os campos enviados mudam | 200 |
| DELETE | /{recurso}/{id} | Remove | 204 (sem corpo) |

Recurso de outro usuário ou inexistente: **404**.

Detalhes:
- `progresso` é **calculado pelo backend** e ignorado se enviado: projetos e trilhas = % de etapas concluídas; disciplinas = % de tarefas concluídas da disciplina.
- Projetos e trilhas incluem `etapas[]`. Em POST/PUT, `etapas` é a lista completa: item com `id` existente é atualizado, sem `id` é criado, ausente é removido. Se `etapas` não for enviado no PUT, não muda.
- Excluir uma disciplina não apaga suas tarefas: elas ficam com `disciplinaId: null`.
- Concluir uma tarefa a tira do foco.
- Enums: prioridade `baixa|media|alta`; status `pendente|em_andamento|concluida`; tipo de evento `tarefa|entrega|evento|estudo`.
- Defaults no POST: tarefa `prioridade=media`, `status=pendente`; evento `tipo=evento`; projeto `status=pendente`. `prazo`, `dataEntrega` e `data` são obrigatórios.

## Foco e prioridades (NOVO, proposta)
| Método | Rota | Descrição |
|---|---|---|
| GET | /foco | `{atual: Task\|null, progresso, prioridades: Task[]}` |
| PUT | /foco/{tarefaId} | Define a tarefa em foco; devolve o mesmo formato do GET (concluída: 422) |
| DELETE | /foco | Remove a escolha manual (204); volta a valer a mais prioritária |

- `prioridades`: tarefas não concluídas ordenadas por prioridade (alta, media, baixa) e depois por prazo.
- `atual`: a tarefa escolhida via PUT; se nenhuma foi escolhida, a primeira de `prioridades`.
- `progresso` do foco: 0 (pendente), 50 (em_andamento) ou 100 (concluida).

## Dashboard (NOVO, proposta)
`GET /dashboard` devolve tudo da tela inicial em uma chamada:
```json
{
  "usuario": {"id": 1, "nome": "Ana", "email": "ana@exemplo.com"},
  "focoAtual": "Task | null",
  "resumoTarefas": {"total": 3, "pendentes": 2, "emAndamento": 1, "concluidas": 1, "percentualConcluidas": 33},
  "proximasTarefas": "Task[] (até 5, não concluídas, por prazo)",
  "disciplinas": "Discipline[]",
  "projetosAtivos": "Project[] (status diferente de concluida)",
  "proximosEventos": "CalendarEvent[] (até 5, de hoje em diante)"
}
```
`pendentes` = tudo que não está concluído (inclui em andamento), igual à conta que o dashboard do frontend já faz.

## IA (Richard)
`POST /assistente/mensagem {texto}` -> `{texto}`. **Provisório**: devolve uma resposta fixa (requer login). O Richard substitui `routers/assistente.py`.
Sugestões de tarefas/calendário: formato a definir. A IA nunca altera dados sozinha.

## Erros
Sempre `{ "detail": "mensagem" }`: 401 (sem token/token inválido/login errado), 404 (não encontrado ou de outro usuário), 409 (e-mail já cadastrado),
422 (validação; `detail` é um texto, ex.: `"email: value is not a valid email address"`). 403 não é usado hoje.
