"""SÓ PARA DESENVOLVIMENTO enquanto o esquema oficial do Richard não existe.
Cria as tabelas provisórias. Na versão final, o banco vem dos scripts/migrations em database/.
Uso (dentro de backend/): python -m scripts.criar_tabelas_dev
"""
import app.models  # noqa: F401  (registra os models)
from app.database import Base, engine

if __name__ == "__main__":
    Base.metadata.create_all(engine)
    print("Tabelas provisórias criadas.")
