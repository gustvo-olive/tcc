from sqlalchemy import Column, Integer, String, Text
from database import Base

class GrafoSalvo(Base):
    __tablename__ = "grafos_salvos"

    id = Column(Integer, primary_key=True, index=True)
    licao_id = Column(String, index=True)
    
    # Armazenaremos os dados do React Flow como uma string JSON
    dados_grafo = Column(Text) 