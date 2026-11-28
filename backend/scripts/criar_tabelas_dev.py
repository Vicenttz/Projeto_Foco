"""Cria as tabelas e as contas de teste manualmente (o servidor já faz isso sozinho ao iniciar).
Uso (dentro de backend/): python -m scripts.criar_tabelas_dev
"""
from app.seed import inicializar

if __name__ == "__main__":
    inicializar(seed=True)
    print("Banco pronto. Contas de teste: aluno@foco.com / Aluno@123  e  admin@foco.com / Admin@123")
