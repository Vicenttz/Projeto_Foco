# Arquitetura
Frontend Angular (SPA) -> HTTP/JSON -> Backend FastAPI -> MySQL. O backend também chama a Gemini API (a chave fica só no servidor, nunca no frontend).
- Frontend (Davi): interface, rotas, estado de tela. Sem regras de negócio.
- Backend (Yan): autenticação JWT, validação, regras de negócio, CRUD.
- Banco e IA (Richard): modelagem MySQL, serviços de IA. A IA só sugere; o estudante aceita, edita ou ignora.
