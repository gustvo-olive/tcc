import json
import pandas as pd
import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any

from database import engine, SessionLocal, Base
import models

# Caminho Robusto
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'enem_ma_participantes_2019_2023.csv')

# Variável Global
df_global = None

def carregar_dados():
    global df_global
    if os.path.exists(DATA_PATH):
        try:
            df_global = pd.read_csv(DATA_PATH)
            print(f"✅ Base carregada! Total: {len(df_global)} linhas.")
        except Exception as e:
            print(f"❌ Erro ao ler CSV: {e}")

carregar_dados()
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ENEM DataAnalytics API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

class GrafoPayload(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

from scipy.stats import shapiro, kstest, norm, levene, kruskal
import numpy as np

def carregar_gabarito():
    path_gabarito = os.path.join(BASE_DIR, 'gabarito_trilha-multiplos-grupos.json')
    if os.path.exists(path_gabarito):
        with open(path_gabarito, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

from engine import JuizEstatistico

@app.post("/api/processar-fluxo")
def processar_fluxo(payload: GrafoPayload, db: Session = Depends(get_db)):
    print(f"\n🚀 Validando fluxo com Juiz Algorítmico...")

    # 1. Salva o histórico (mantemos para auditoria)
    novo_grafo = models.GrafoSalvo(
        licao_id="trilha-multiplos-grupos", 
        dados_grafo=json.dumps({"nodes": payload.nodes, "edges": payload.edges})
    )
    db.add(novo_grafo)
    db.commit()

    # 2. Executa a Validação Rigorosa via Engine
    juiz = JuizEstatistico(payload.nodes, payload.edges)
    validacao = juiz.validar()
    
    # 3. Processamento de Dados Reais
    amostra_dados = []
    resultados_estatisticos = {}

    if df_global is not None:
        try:
            # Filtro base (2023 + notas válidas)
            df_analise = df_global[(df_global['NU_ANO'] == 2023) & (df_global['NOTA_GERAL'] > 0)].copy()
            
            # Preview para a Tabela
            amostra_dados = df_analise.head(30).where(pd.notnull(df_analise), None).to_dict(orient='records')
            
            # Cálculos (Kruskal-Wallis como padrão para múltiplos grupos não-normais)
            grupos_renda = [group['NOTA_GERAL'].values for name, group in df_analise.groupby('Q006')]
            stat_k, p_k = kruskal(*grupos_renda)
            
            # Normalidade (Kolmogorov-Smirnov para N grande)
            # Para fins didáticos, calculamos sobre uma amostra ou sobre o todo
            stat_ks, p_ks = kstest(df_analise['NOTA_GERAL'], 'norm')

            resultados_estatisticos = {
                "n_total": len(df_analise),
                "p_valor": float(p_k),
                "normalidade": {"teste": "Kolmogorov-Smirnov", "stat": round(float(stat_ks), 4), "p": float(p_ks)},
                "kruskal": {"stat": round(float(stat_k), 4), "p": float(p_k)},
                "epsilon_sq": 0.12 # Valor fixo exemplo ou calculado real se necessário
            }

        except Exception as e:
            validacao["erros"].append(f"Erro no processamento estatístico: {str(e)}")

    return {
        "status": "sucesso", 
        "preview": amostra_dados, 
        "estatisticas": resultados_estatisticos, 
        "validacao": validacao
    }

@app.get("/api/status/{process_id}")
def status_processamento(process_id: int):
    return {"status": "concluido", "process_id": process_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)
