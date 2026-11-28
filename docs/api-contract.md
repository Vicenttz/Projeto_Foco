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

`User` = `{id, nome, email, papel}` (`papel`: `usuario` | `admin`). Senha e hash nunca são devolvidos. E-mail repetido no cadastro: 409.

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
- `progresso` é **calculado pelo backend** e ignorado se enviado: projetos e trilhas = % de etapas concluídas; disciplinas = % das etapas concluídas nas trilhas vinculadas (se houver trilhas com etapas); sem trilhas, % de tarefas concluídas da disciplina.
- Projetos e trilhas incluem `etapas[]`. Em POST/PUT, `etapas` é a lista completa: item com `id` existente é atualizado, sem `id` é criado, ausente é removido. Se `etapas` não for enviado no PUT, não muda.
- Excluir uma disciplina não apaga suas tarefas: elas ficam com `disciplinaId: null`.
- Concluir uma tarefa a tira do foco.
- Enums: prioridade `baixa|media|alta`; status `pendente|em_andamento|concluida`; tipo de evento `prova|estudo|entrega|tarefa|evento`.
- Defaults no POST: tarefa `prioridade=media`, `status=pendente`; evento `tipo=evento`, `concluido=false`; projeto `status=pendente`. `prazo`, `dataEntrega` e `data` são obrigatórios.

## Calendário interativo: provas e estudos (`/eventos`)
Além de `id`, `titulo`, `data` e `tipo`, o evento tem campos opcionais (todos `null`/ausentes nos eventos antigos):

| Campo | Tipo | Descrição |
|---|---|---|
| `hora` | `"HH:MM"` ou null | Horário. Sem hora = dia inteiro. Aceita também `"HH:MM:SS"` e `""` (vira null) |
| `duracaoMin` | inteiro (5 a 1440) ou null | Duração em minutos (útil nas sessões de estudo) |
| `disciplinaId` | inteiro ou null | Disciplina do usuário (de outro usuário: **404**). Excluir a disciplina limpa este campo |
| `descricao` | texto (até 2000) ou null | Observações |
| `concluido` | boolean (padrão false) | Marca a sessão de estudo/entrega como feita |

- `GET /eventos` aceita filtros opcionais `?de=AAAA-MM-DD&ate=AAAA-MM-DD&tipo=prova` e vem ordenado por data e hora (sem hora primeiro).
- No `PUT`, enviar `null` em `hora`, `duracaoMin`, `disciplinaId` ou `descricao` **limpa** o campo. Para reagendar basta `PUT {data}`.
- Mudança de contrato: o tipo `prova` é novo. O frontend ganhou os campos acima em `models/index.ts` (`CalendarEvent`).

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

## Administração (só `papel = admin`; usuário comum recebe 403)
| Método | Rota | Descrição |
|---|---|---|
| GET | /admin/resumo | Totais da plataforma (usuários, tarefas, disciplinas, projetos, trilhas, eventos) |
| GET | /admin/usuarios | Lista usuários com contagem de tarefas/disciplinas/projetos |
| PUT | /admin/usuarios/{id} | `{papel: "usuario"\|"admin"}`. Não permite remover o próprio acesso (422) |
| DELETE | /admin/usuarios/{id} | Exclui o usuário e todos os dados dele (204). Não permite excluir a si mesmo (422) |

## IA (Richard)
`POST /assistente/mensagem {texto}` -> `{texto}`. **Provisório** (o Richard substitui `routers/assistente.py`): perguntas sobre hoje, agenda,
calendário, provas, estudos, semana ou prazos respondem com o resumo da agenda; as demais recebem uma resposta fixa. Requer login.

### Mensagem do dia (NOVO): a IA lê o calendário
`GET /assistente/diario?data=AAAA-MM-DD&hora=0-23` (os dois parâmetros são opcionais; o frontend manda os do navegador do usuário).
```json
{
  "data": "2026-06-10", "saudacao": "Bom dia, Ana!",
  "texto": "Hoje na sua agenda: Estudo de SQL às 19:00.\nProva de Cálculo é em 3 dias (sáb, 13/06, às 14:00). Ainda não há estudo agendado para ela.",
  "hoje": [{"id": 1, "tipo": "estudo", "titulo": "Estudo de SQL", "data": "2026-06-10", "hora": "19:00", "quando": "hoje", "disciplina": "Banco de Dados"}],
  "proximos": ["Destaque (até 5 compromissos futuros)"],
  "sugestoes": [{"texto": "Agendar estudo para Prova de Cálculo", "rota": "/calendario", "query": {"novo": "estudo", "data": "2026-06-11", "disciplinaId": "1"}}],
  "geradoPor": "regras"
}
```
- O backend lê as provas, estudos e entregas dos próximos 21 dias e as tarefas do usuário. Avisa de provas próximas, se **falta agendar estudo** antes de cada prova (sessões concluídas não contam), entregas da semana, tarefas atrasadas e o foco atual.
- `sugestoes` só **sugerem**: `rota` + `query` abrem a tela já pré-preenchida (ex.: `/calendario?novo=estudo&data=...&disciplinaId=...`). A IA nunca cria nem altera dados sozinha.
- `geradoPor`: `regras` (padrão, texto montado localmente, nada sai do computador) ou `gemini` (com `GEMINI_API_KEY` no `.env`, o texto é reescrito pela IA; **a agenda do usuário é enviada ao Google** e, se a chamada falhar, volta a `regras`). Os fatos (`hoje`, `proximos`) vêm sempre das regras.
- Frontend: a mensagem aparece sozinha na primeira entrada do dia (botão de brilho no topo reabre) e abre a conversa do Assistente.

## Erros
Sempre `{ "detail": "mensagem" }`: 401 (sem token/token inválido/login errado), 404 (não encontrado ou de outro usuário), 409 (e-mail já cadastrado),
403 (rota só de admin), 422 (validação; `detail` é um texto, ex.: `"email: value is not a valid email address"`).

## Disciplinas e trilhas (vínculo opcional)
- `Discipline`: `id, nome, professor?, cor?, descricao?, progresso, totalTarefas, tarefasConcluidas, totalEtapas, etapasConcluidas, trilhas[{id, assunto, progresso}]`.
- POST/PUT `/disciplinas` aceitam `descricao` e `trilhaIds: number[]` (no PUT, a lista substitui os vínculos; sem o campo, não muda). Uma trilha pertence a no máximo uma disciplina.
- `Trail` ganhou `disciplinaId?`. POST/PUT `/trilhas` aceitam `disciplinaId` (`null` desvincula). Disciplina ou trilha de outro usuário = 404.
- Excluir a disciplina não apaga as trilhas nem as tarefas (ficam sem disciplina).
