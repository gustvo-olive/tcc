import json
import os
import traceback
from typing import List, Dict, Any

from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import engine, SessionLocal, Base
import models
from engine import JuizEstatistico
from analytics import AnalizadorEstatistico

# Caminhos Robustos
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'enem_ma_participantes_2019_2023.csv')
MINI_ENEM_PATH = os.path.join(BASE_DIR, 'data', 'mini_enem_sujo.csv')
ASSOC_PATH = os.path.join(BASE_DIR, 'data', 'base_associacao_didatica.csv')

# Instancia o Motor de Analytics
analytics = AnalizadorEstatistico(DATA_PATH, MINI_ENEM_PATH, ASSOC_PATH)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ENEM DataAnalytics API")

# Configuração de CORS robusta
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# Schemas Pydantic
class UsuarioBase(BaseModel):
    email: str
    senha: str

class UsuarioRegistro(UsuarioBase):
    nome: str

class GrafoPayload(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    licao_id: str = "trilha-multiplos-grupos"

class ProgressoFasePayload(BaseModel):
    licao_id: str
    fase_atual: int

class BadgePayload(BaseModel):
    badge_id: str

# Endpoints de Autenticação
@app.post("/api/registrar")
def registrar(payload: UsuarioRegistro, db: Session = Depends(get_db)):
    if db.query(models.Usuario).filter_by(email=payload.email).first():
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    novo_usuario = models.Usuario(nome=payload.nome, email=payload.email, senha=payload.senha)
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return {"status": "sucesso", "usuario_id": novo_usuario.id, "nome": novo_usuario.nome}

@app.post("/api/login")
def login(payload: UsuarioBase, db: Session = Depends(get_db)):
    user = db.query(models.Usuario).filter_by(email=payload.email, senha=payload.senha).first()
    if not user:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    return {"status": "sucesso", "usuario_id": user.id, "nome": user.nome}

@app.get("/api/usuario/dados-completos")
def get_dados_usuario(x_user_id: Optional[int] = Header(None), db: Session = Depends(get_db)):
    if not x_user_id: raise HTTPException(status_code=401, detail="Não autenticado")
    user = db.query(models.Usuario).filter_by(id=x_user_id).first()
    if not user: raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    progressos = {p.licao_id: {"fase": p.fase_atual, "nota": p.nota_maxima} for p in user.progressos}
    badges = [b.badge_id for b in user.badges]
    
    return {
        "nome": user.nome,
        "progressos": progressos,
        "badges": badges
    }

@app.post("/api/usuario/progresso")
def atualizar_progresso(payload: ProgressoFasePayload, x_user_id: Optional[int] = Header(None), db: Session = Depends(get_db)):
    if not x_user_id: raise HTTPException(status_code=401, detail="Não autenticado")
    user = db.query(models.Usuario).filter_by(id=x_user_id).first()
    if not user: raise HTTPException(status_code=404, detail="Usuário não encontrado")

    prog = db.query(models.ProgressoTrilha).filter_by(usuario_id=user.id, licao_id=payload.licao_id).first()
    
    if not prog:
        prog = models.ProgressoTrilha(usuario_id=user.id, licao_id=payload.licao_id, fase_atual=payload.fase_atual)
        db.add(prog)
    else:
        prog.fase_atual = max(prog.fase_atual, payload.fase_atual)
    
    db.commit()
    return {"status": "sucesso", "fase_atual": prog.fase_atual}

@app.post("/api/usuario/badge")
def destravar_badge(payload: BadgePayload, x_user_id: Optional[int] = Header(None), db: Session = Depends(get_db)):
    if not x_user_id: raise HTTPException(status_code=401, detail="Não autenticado")
    user = db.query(models.Usuario).filter_by(id=x_user_id).first()
    if not user: raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if not db.query(models.BadgeDesbloqueado).filter_by(usuario_id=user.id, badge_id=payload.badge_id).first():
        novo_badge = models.BadgeDesbloqueado(usuario_id=user.id, badge_id=payload.badge_id)
        db.add(novo_badge)
        db.commit()
        return {"status": "desbloqueado", "badge_id": payload.badge_id}
    return {"status": "ja_existia"}

# Helper para limpar NaNs e tipos Numpy para o JSON
def clean_for_json(obj):
    import numpy as np
    import pandas as pd
    if isinstance(obj, dict):
        return {k: clean_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_for_json(i) for i in obj]
    elif isinstance(obj, (float, np.floating)):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return float(obj)
    elif isinstance(obj, (int, np.integer)):
        return int(obj)
    elif isinstance(obj, np.ndarray):
        return clean_for_json(obj.tolist())
    elif pd.isna(obj) or obj is None: 
        return None
    return obj

@app.post("/api/processar-fluxo")
def processar_fluxo(payload: GrafoPayload, x_user_id: Optional[int] = Header(None), db: Session = Depends(get_db)):
    try:
        print(f"\n🚀 [API] Processando: {payload.licao_id}")
        if not x_user_id: raise HTTPException(status_code=401, detail="Não autenticado")
        user = db.query(models.Usuario).filter_by(id=x_user_id).first()

        # 1. Salva o histórico
        novo_grafo = models.GrafoSalvo(
            usuario_id=user.id if user else None,
            licao_id=payload.licao_id, 
            dados_grafo=json.dumps({"nodes": payload.nodes, "edges": payload.edges})
        )
        db.add(novo_grafo)
        db.commit()

        # 2. Executa Motor de Analytics
        if payload.licao_id == "trilha-limpeza":
            res = analytics.processar_limpeza(payload.nodes)
        elif payload.licao_id == "trilha-engenharia":
            res = analytics.processar_limpeza(payload.nodes, base_type="feat")
        elif payload.licao_id == "trilha-amostragem":
            res = analytics.processar_limpeza(payload.nodes, base_type="sampling")
        else:
            res = analytics.processar_inferencia(payload.licao_id)

        # 3. Validação Pedagógica (O Juiz)
        juiz = JuizEstatistico(payload.nodes, payload.edges, payload.licao_id)
        validacao = juiz.validar()
        
        # 4. Atualiza Nota Máxima
        if validacao["status"] == "concluido" and user:
            prog = db.query(models.ProgressoTrilha).filter_by(usuario_id=user.id, licao_id=payload.licao_id).first()
            if prog:
                prog.nota_maxima = max(prog.nota_maxima, validacao["nota"])
                db.commit()

        return {
            "status": "sucesso",
            "preview": clean_for_json(res.get("preview", [])),
            "estatisticas": clean_for_json(res.get("estatisticas", {})),
            "validacao": clean_for_json(validacao)
        }

    except Exception as e:
        print(f"❌ ERRO CRÍTICO NO BACKEND:\n{traceback.format_exc()}")
        return {"status": "erro", "mensagem": str(e)}

@app.get("/api/status/{process_id}")
def status_processamento(process_id: int):
    return {"status": "concluido", "process_id": process_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)
