<<<<<<< HEAD
"""Cria as tabelas e as contas de teste manualmente (a API já faz isso sozinha ao iniciar).
Uso (dentro de backend/): python -m scripts.criar_tabelas_dev
"""
from app.services.seed import inicializar

if __name__ == "__main__":
    inicializar(seed=True)
    print("Banco pronto. Contas de teste: aluno@foco.com / Aluno@123  e  admin@foco.com / Admin@123")
=======
"""SÓ PARA DESENVOLVIMENTO enquanto o esquema oficial do Richard não existe.
Cria as tabelas provisórias. Na versão final, o banco vem dos scripts/migrations em database/.
Uso (dentro de backend/): python -m scripts.criar_tabelas_dev
"""
import app.models  # noqa: F401  (registra os models)
from app.database import Base, engine

if __name__ == "__main__":
    Base.metadata.create_all(engine)
    print("Tabelas provisórias criadas.")
>>>>>>> 12b45406a4e2c88ad2859f63e82f6d5ce74d09ca
