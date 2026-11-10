# FOCO

Plataforma web de organização e produtividade para estudantes: disciplinas, tarefas, projetos, trilhas de aprendizagem, calendário e um assistente de IA.
> O FOCO não decide como o estudante deve estudar. Ele oferece ferramentas e inteligência para que o próprio estudante consiga se organizar melhor.

## Tecnologias
Frontend: Angular 19 + TypeScript. Futuro: Python/FastAPI, MySQL, Gemini API.

## Estrutura
```
frontend/   Angular (Davi)        backend/  FastAPI (Yan)
database/   MySQL (Richard)       docs/     documentação
```

## Rodar o frontend
```bash
cd frontend
npm install
npm start        # http://localhost:4200
```

## Fluxo no GitHub
Ninguém trabalha na `main`. Branches: `feature/frontend-foundation` (Davi), `feature/backend-api` (Yan), `feature/database-ai` (Richard). Commits pequenos e Pull Request para a `main`. Atualize `docs/andamento.md` a cada entrega.
