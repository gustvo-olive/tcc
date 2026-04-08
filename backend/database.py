from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Configuração do banco de dados SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./enem_data_analytics.db"

# create_engine gerencia a conexão
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# SessionLocal será a fábrica de sessões do banco de dados
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para criarmos os modelos do SQLAlchemy
Base = declarative_base()