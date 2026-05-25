from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, default="Estudante")
    email = Column(String, unique=True, index=True)
    senha = Column(String)

    # Relacionamentos
    progressos = relationship("ProgressoTrilha", back_populates="usuario")
    badges = relationship("BadgeDesbloqueado", back_populates="usuario")
    grafos = relationship("GrafoSalvo", back_populates="usuario")

class ProgressoTrilha(Base):
    __tablename__ = "progresso_trilhas"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    licao_id = Column(String, index=True)
    fase_atual = Column(Integer, default=0)
    nota_maxima = Column(Integer, default=0)
    ultima_atualizacao = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    usuario = relationship("Usuario", back_populates="progressos")

class BadgeDesbloqueado(Base):
    __tablename__ = "badges_desbloqueados"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    badge_id = Column(String, index=True)
    data_desbloqueio = Column(DateTime, default=datetime.datetime.utcnow)

    usuario = relationship("Usuario", back_populates="badges")

class GrafoSalvo(Base):
    __tablename__ = "grafos_salvos"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    licao_id = Column(String, index=True)
    dados_grafo = Column(Text)
    data_criacao = Column(DateTime, default=datetime.datetime.utcnow)

    usuario = relationship("Usuario", back_populates="grafos")
 