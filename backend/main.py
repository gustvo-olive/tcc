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

# Variável Global para manter os dados em memória (mais rápido)
df_global = None

def carregar_dados():
    global df_global
    if os.path.exists(DATA_PATH):
        print(f"\n📂 Lendo base de dados (isso pode levar alguns segundos)...")
        try:
            df_global = pd.read_csv(DATA_PATH)
            anos_disponiveis = df_global['NU_ANO'].unique().tolist()
            print(f"✅ Base carregada com sucesso! Total de linhas: {len(df_global)}")
            print(f"📅 Anos encontrados no arquivo: {anos_disponiveis}")
        except Exception as e:
            print(f"❌ Erro ao ler CSV na inicialização: {e}")
    else:
        print(f"❌ ARQUIVO NÃO ENCONTRADO em: {DATA_PATH}")

# Inicializa o carregamento
carregar_dados()

# Cria as tabelas no banco SQLite
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ENEM DataAnalytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class GrafoPayload(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

from scipy.stats import shapiro, kstest, norm, levene, kruskal
import numpy as np

# ... (manter o restante do código igual até o processar_fluxo)

@app.post("/api/processar-fluxo")
def processar_fluxo(payload: GrafoPayload, db: Session = Depends(get_db)):
    print(f"\n🚀 Processando grafo com {len(payload.nodes)} nós...")

    novo_grafo = models.GrafoSalvo(
        licao_id="trilha-inferencia",
        dados_grafo=json.dumps({"nodes": payload.nodes, "edges": payload.edges})
    )
    db.add(novo_grafo)
    db.commit()

    amostra_dados = []
    resultados_estatisticos = {}

    if df_global is not None:
        try:
            # Filtramos para 2023 e removemos notas zero (conforme seu código antigo)
            df_analise = df_global[
                (df_global['NU_ANO'] == 2023) & 
                (df_global['NOTA_GERAL'] > 0)
            ].copy()

            # 1. Preview para Tabela
            amostra_dados = df_analise.head(30).where(pd.notnull(df_analise), None).to_dict(orient='records')

            # 2. Testes de Normalidade (Shapiro ou KS baseado em N)
            notas = df_analise['NOTA_GERAL'].dropna().values
            n_total = len(notas)
            if n_total < 5000:
                stat_norm, p_norm = shapiro(notas)
                teste_norm_nome = "Shapiro-Wilk"
            else:
                mu, std = norm.fit(notas)
                stat_norm, p_norm = kstest(notas, 'norm', args=(mu, std))
                teste_norm_nome = "Kolmogorov-Smirnov"

            # 3. Levene (Variância por Renda Q006)
            grupos_renda = [group['NOTA_GERAL'].values for name, group in df_analise.groupby('Q006')]
            stat_lev, p_lev = levene(*grupos_renda)

            # 4. Kruskal-Wallis (O "Juiz")
            stat_k, p_k = kruskal(*grupos_renda)

            # 5. Epsilon-Squared (Tamanho do Efeito - Sua fórmula!)
            k_groups = len(grupos_renda)
            epsilon_sq = (stat_k - k_groups + 1) / (n_total - k_groups) if (n_total - k_groups) > 0 else 0

            resultados_estatisticos = {
                "n_total": n_total,
                "normalidade": {"teste": teste_norm_nome, "stat": round(float(stat_norm), 4), "p": float(p_norm)},
                "levene": {"stat": round(float(stat_lev), 4), "p": float(p_lev)},
                "kruskal": {"stat": round(float(stat_k), 4), "p": float(p_k)},
                "epsilon_sq": round(float(epsilon_sq), 4)
            }

            print(f"✅ Estatísticas calculadas para N={n_total}")

        except Exception as e:
            print(f"❌ Erro no processamento estatístico: {e}")

    return {
        "status": "sucesso", 
        "preview": amostra_dados,
        "estatisticas": resultados_estatisticos,
        "grafo_id": novo_grafo.id
    }


@app.get("/api/status/{process_id}")
def status_processamento(process_id: int):
    return {"status": "concluido", "process_id": process_id}

if __name__ == "__main__":
    import uvicorn
    print("\n🔥 Servidor da API iniciando em http://127.0.0.1:5000")
    uvicorn.run(app, host="127.0.0.1", port=5000)
