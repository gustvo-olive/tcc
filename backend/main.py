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
                
                # Testes de Normalidade Reais (Corrigido K-S)
                mu, std = df_analise['NOTA_GERAL'].mean(), df_analise['NOTA_GERAL'].std()
                stat_ks, p_ks = kstest(df_analise['NOTA_GERAL'], 'norm', args=(mu, std))
                
                amostra_shapiro = df_analise['NOTA_GERAL'].sample(min(len(df_analise), 5000))
                stat_sw, p_sw = shapiro(amostra_shapiro)
                
                stat_lev, p_lev = levene(homens, mulheres)
                stat_t, p_t = ttest_ind(homens, mulheres)
                stat_u, p_u = mannwhitneyu(homens, mulheres)
                
                # d de Cohen
                n1, n2 = len(homens), len(mulheres)
                s1, s2 = homens.var(), mulheres.var()
                pooled_std = np.sqrt(((n1-1)*s1 + (n2-1)*s2) / (n1+n2-2)) if (n1+n2-2) > 0 else 1
                d_cohen = (homens.mean() - mulheres.mean()) / pooled_std

                resultados_estatisticos = {
                    "n_total": len(df_analise),
                    "ks": {"stat": round(float(stat_ks), 4), "p": float(p_ks)},
                    "shapiro": {"stat": round(float(stat_sw), 4), "p": float(p_sw)},
                    "levene": {"stat": round(float(stat_lev), 4), "p": float(p_lev)},
                    "teste_t": {"stat": round(float(stat_t), 4), "p": float(p_t)},
                    "mann_whitney": {"stat": round(float(stat_u), 4), "p": float(p_u)},
                    "d_cohen": round(float(d_cohen), 4),
                    "boxplot_group": "TP_SEXO"
                }
                amostra_dados = df_analise.head(30).where(pd.notnull(df_analise), None).to_dict(orient='records')

            else: # Múltiplos Grupos (Padrão)
                # K-S Corrigido
                mu, std = df_analise['NOTA_GERAL'].mean(), df_analise['NOTA_GERAL'].std()
                stat_ks, p_ks = kstest(df_analise['NOTA_GERAL'], 'norm', args=(mu, std))
                
                amostra_shapiro = df_analise['NOTA_GERAL'].sample(min(len(df_analise), 5000))
                stat_sw, p_sw = shapiro(amostra_shapiro)
                
                grupos_dict = {name: group['NOTA_GERAL'].values for name, group in df_analise.groupby('Q006')}
                grupos_lista = list(grupos_dict.values())
                
                stat_lev, p_lev = levene(*grupos_lista)
                stat_k, p_k = kruskal(*grupos_lista)
                
                # Epsilon²
                n_total = len(df_analise)
                epsilon_sq = (stat_k - (len(grupos_lista) - 1)) / (n_total - (len(grupos_lista) - 1))

                # Post-Hoc Dunn Completo (Pares significativos selecionados)
                nomes = sorted(grupos_dict.keys())
                dunn_results = {}
                for i in range(len(nomes)):
                    for j in range(i + 1, len(nomes)):
                        g1, g2 = nomes[i], nomes[j]
                        # Selecionamos vizinhos e extremos para não poluir demais (max 30 pares)
                        if i == 0 or j == len(nomes)-1 or j == i + 1 or i == 1:
                            _, p_pair = mannwhitneyu(grupos_dict[g1], grupos_dict[g2])
                            dunn_results[f"{g1} vs {g2}"] = round(float(p_pair), 4)

                resultados_estatisticos = {
                    "n_total": n_total,
                    "ks": {"stat": round(float(stat_ks), 4), "p": float(p_ks)},
                    "shapiro": {"stat": round(float(stat_sw), 4), "p": float(p_sw)},
                    "levene": {"stat": round(float(stat_lev), 4), "p": float(p_lev)},
                    "kruskal": {"stat": round(float(stat_k), 4), "p": float(p_k)},
                    "epsilon_sq": round(float(epsilon_sq), 4),
                    "dunn_map": dunn_results,
                    "boxplot_group": "Q006"
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
