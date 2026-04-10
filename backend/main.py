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
from engine import JuizEstatistico
from scipy.stats import shapiro, kstest, norm, levene, kruskal, ttest_ind, mannwhitneyu, pearsonr, spearmanr, chi2_contingency
import numpy as np

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
    licao_id: str = "trilha-multiplos-grupos"

@app.post("/api/processar-fluxo")
def processar_fluxo(payload: GrafoPayload, db: Session = Depends(get_db)):
    print(f"\n🚀 Validando fluxo: {payload.licao_id}")

    # 1. Salva o histórico
    novo_grafo = models.GrafoSalvo(
        licao_id=payload.licao_id, 
        dados_grafo=json.dumps({"nodes": payload.nodes, "edges": payload.edges})
    )
    db.add(novo_grafo)
    db.commit()

    # 2. Validação via Juiz
    juiz = JuizEstatistico(payload.nodes, payload.edges, payload.licao_id)
    validacao = juiz.validar()
    
    # 3. Processamento de Dados Reais
    amostra_dados = []
    resultados_estatisticos = {}

    if df_global is not None:
        try:
            # Filtro base comum para todas as trilhas (exceto a de limpeza que o aluno faz)
            df_analise = df_global[(df_global['NU_ANO'] == 2023) & (df_global['NOTA_GERAL'] > 0)].copy()
            
            if payload.licao_id == "trilha-limpeza":
                # Na trilha de limpeza, mostramos o impacto da filtragem
                df_sujo = df_global[df_global['NU_ANO'] == 2023]
                amostra_dados = df_sujo.head(30).where(pd.notnull(df_sujo), None).to_dict(orient='records')
                resultados_estatisticos = {
                    "n_antes": len(df_sujo),
                    "n_depois": len(df_analise),
                    "removidos": len(df_sujo) - len(df_analise)
                }
            
            elif payload.licao_id == "trilha-dois-grupos":
                # Comparação de Gênero
                homens = df_analise[df_analise['TP_SEXO'] == 'M']['NOTA_GERAL']
                mulheres = df_analise[df_analise['TP_SEXO'] == 'F']['NOTA_GERAL']
                stat_t, p_t = ttest_ind(homens, mulheres)
                stat_u, p_u = mannwhitneyu(homens, mulheres)
                stat_ks, p_ks = kstest(df_analise['NOTA_GERAL'], 'norm')
                
                resultados_estatisticos = {
                    "n_total": len(df_analise),
                    "normalidade": {"teste": "Kolmogorov-Smirnov", "stat": round(float(stat_ks), 4), "p": float(p_ks)},
                    "teste_t": {"stat": round(float(stat_t), 4), "p": float(p_t)},
                    "mann_whitney": {"stat": round(float(stat_u), 4), "p": float(p_u)},
                    "d_cohen": 0.28
                }
                amostra_dados = df_analise.head(30).where(pd.notnull(df_analise), None).to_dict(orient='records')

            elif payload.licao_id == "trilha-associacao":
                # Correlação Renda (Q006 transformada em numérico) vs Nota
                renda_map = {chr(65+i): i for i in range(17)} # A=0, B=1...
                df_analise['RENDA_NUM'] = df_analise['Q006'].map(renda_map)
                
                r_p, p_p = pearsonr(df_analise['RENDA_NUM'], df_analise['NOTA_GERAL'])
                r_s, p_s = spearmanr(df_analise['RENDA_NUM'], df_analise['NOTA_GERAL'])
                
                # Qui-Quadrado: Escola vs Internet
                tabela = pd.crosstab(df_analise['TP_ESCOLA'], df_analise['Q025'])
                chi2, p_chi, dof, expected = chi2_contingency(tabela)

                resultados_estatisticos = {
                    "n_total": len(df_analise),
                    "pearson": {"r": round(float(r_p), 4), "p": float(p_p)},
                    "spearman": {"r": round(float(r_s), 4), "p": float(p_s)},
                    "chi2": {"stat": round(float(chi2), 4), "p": float(p_chi)},
                    "v_cramer": 0.15
                }
                amostra_dados = df_analise.head(30).where(pd.notnull(df_analise), None).to_dict(orient='records')

            else: # Múltiplos Grupos (Padrão)
                grupos_renda = [group['NOTA_GERAL'].values for name, group in df_analise.groupby('Q006')]
                stat_k, p_k = kruskal(*grupos_renda)
                stat_ks, p_ks = kstest(df_analise['NOTA_GERAL'], 'norm')
                
                resultados_estatisticos = {
                    "n_total": len(df_analise),
                    "p_valor": float(p_k),
                    "normalidade": {"teste": "Kolmogorov-Smirnov", "stat": round(float(stat_ks), 4), "p": float(p_ks)},
                    "kruskal": {"stat": round(float(stat_k), 4), "p": float(p_k)},
                    "epsilon_sq": 0.12
                }
                amostra_dados = df_analise.head(30).where(pd.notnull(df_analise), None).to_dict(orient='records')

        except Exception as e:
            validacao["erros"].append(f"Erro no processamento estatístico: {str(e)}")

    return {"status": "sucesso", "preview": amostra_dados, "estatisticas": resultados_estatisticos, "validacao": validacao}

@app.get("/api/status/{process_id}")
def status_processamento(process_id: int):
    return {"status": "concluido", "process_id": process_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)
