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

@app.post("/api/processar-fluxo")
def processar_fluxo(payload: GrafoPayload, db: Session = Depends(get_db)):
    print(f"\n🚀 Validando fluxo: {len(payload.nodes)} nós e {len(payload.edges)} conexões...")

    # 1. Salva o histórico
    novo_grafo = models.GrafoSalvo(licao_id="trilha-multiplos-grupos", dados_grafo=json.dumps({"nodes": payload.nodes, "edges": payload.edges}))
    db.add(novo_grafo)
    db.commit()

    # 2. Inicializa Resposta
    validacao = {"status": "incompleto", "erros": [], "acertos": [], "nota": 0, "patente": "Iniciante"}
    amostra_dados = []
    resultados_estatisticos = {}
    
    # --- ALGORITMO DE RASTREABILIDADE (DFS) ---
    adj = {n.get('id'): [] for n in payload.nodes}
    for edge in payload.edges:
        src, tgt = edge.get('source'), edge.get('target')
        if src in adj: adj[src].append(tgt)

    id_base = next((n.get('id') for n in payload.nodes if "Microdados" in n.get('data', {}).get('label', '')), None)
     nos_alcancaveis = set()
    if id_base:
        stack = [id_base]
        while stack:
            curr = stack.pop()
            if curr not in nos_alcancaveis:
                nos_alcancaveis.add(curr)
                stack.extend(adj.get(curr, []))

    gabarito = carregar_gabarito()
    nota = 0

    if df_global is not None:
        try:
            df_analise = df_global[(df_global['NU_ANO'] == 2023) & (df_global['NOTA_GERAL'] > 0)].copy()
            amostra_dados = df_analise.head(30).where(pd.notnull(df_analise), None).to_dict(orient='records')
            
            if gabarito:
                # 1. ESSENCIAIS (15 pts cada = 60)
                essenciais = {"Microdados ENEM": 15, "Kruskal-Wallis": 15, "Kolmogorov": 15, "🏆 Sucesso": 15}
                for node in payload.nodes:
                    label, node_id = node.get('data', {}).get('label', ''), node.get('id')
                    for peca, pts in essenciais.items():
                        if pts > 0 and peca in label:
                            if node_id in nos_alcancaveis:
                                validacao["acertos"].append(f"{peca}: Conectado corretamente.")
                                nota += pts
                                essenciais[peca] = 0 
                            else:
                                validacao["erros"].append(f"O bloco '{peca}' está solto ou isolado!")

                # 2. BÔNUS (10 pts cada = 40)
                bonus = {"Teste de Levene": 10, "Epsilon": 10, "Heatmap de Dunn": 10, "Ver Tabela": 10}
                for node in payload.nodes:
                    label, node_id = node.get('data', {}).get('label', ''), node.get('id')
                    for peca, pts in bonus.items():
                        if pts > 0 and peca in label and node_id in nos_alcancaveis:
                            validacao["acertos"].append(f"BÔNUS: {peca} integrado.")
                            nota += pts
                            bonus[peca] = 0

                # 3. INTEGRIDADE DO CAMINHO
                id_sucesso = next((n.get('id') for n in payload.nodes if "Sucesso" in n.get('data', {}).get('label', '')), None)
                if id_sucesso and id_sucesso in nos_alcancaveis:
                    validacao["acertos"].append("Cadeia lógica completa: Dados ➔ Conclusão.")
                else:
                    validacao["erros"].append("Fluxo incompleto: A Base de Dados não alcança a Conclusão.")
                    nota -= 20

                if nota < 0: nota = 0
                if nota > 100: nota = 100

                # Patentes
                if nota <= 40: validacao["patente"] = "Analista Iniciante 🧪"
                elif nota <= 70: validacao["patente"] = "Pesquisador Júnior 📑"
                elif nota <= 90: validacao["patente"] = "Cientista de Dados 📊"
                else: validacao["patente"] = "Mestre da Estatística 🏆"

                validacao["nota"] = nota
                validacao["status"] = "concluido" if nota >= 60 and (id_sucesso in nos_alcancaveis) else "erro_metodologico"
            
            # --- CÁLCULOS ---
            grupos_renda = [group['NOTA_GERAL'].values for name, group in df_analise.groupby('Q006')]
            stat_k, p_k = kruskal(*grupos_renda)
            resultados_estatisticos = {"n_total": len(df_analise), "p_valor": float(p_k), "conclusao_estatistica": "H1 Rejeitada", "kruskal": {"stat": round(float(stat_k), 4), "p": float(p_k)}}

        except Exception as e:
            validacao["erros"].append(f"Erro: {str(e)}")

    return {"status": "sucesso", "preview": amostra_dados, "estatisticas": resultados_estatisticos, "validacao": validacao}

@app.get("/api/status/{process_id}")
def status_processamento(process_id: int):
    return {"status": "concluido", "process_id": process_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)
