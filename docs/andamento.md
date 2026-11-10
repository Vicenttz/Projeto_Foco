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
