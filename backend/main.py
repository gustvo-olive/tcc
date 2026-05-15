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

# Inicialização de Dados Básicos
@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        if not db.query(models.Usuario).first():
            user = models.Usuario(nome="Estudante Padrão")
            db.add(user)
            db.commit()
            print("👤 Usuário padrão criado!")
    finally:
        db.close()

class GrafoPayload(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    licao_id: str = "trilha-multiplos-grupos"

class ProgressoFasePayload(BaseModel):
    licao_id: str
    fase_atual: int

class BadgePayload(BaseModel):
    badge_id: str

@app.get("/api/usuario/dados-completos")
def get_dados_usuario(db: Session = Depends(get_db)):
    user = db.query(models.Usuario).first()
    if not user: raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    progressos = {p.licao_id: {"fase": p.fase_atual, "nota": p.nota_maxima} for p in user.progressos}
    badges = [b.badge_id for b in user.badges]
    
    return {
        "nome": user.nome,
        "progressos": progressos,
        "badges": badges
    }

@app.post("/api/usuario/progresso")
def atualizar_progresso(payload: ProgressoFasePayload, db: Session = Depends(get_db)):
    user = db.query(models.Usuario).first()
    prog = db.query(models.ProgressoTrilha).filter_by(usuario_id=user.id, licao_id=payload.licao_id).first()
    
    if not prog:
        prog = models.ProgressoTrilha(usuario_id=user.id, licao_id=payload.licao_id, fase_atual=payload.fase_atual)
        db.add(prog)
    else:
        prog.fase_atual = max(prog.fase_atual, payload.fase_atual)
    
    db.commit()
    return {"status": "sucesso", "fase_atual": prog.fase_atual}

@app.post("/api/usuario/badge")
def destravar_badge(payload: BadgePayload, db: Session = Depends(get_db)):
    user = db.query(models.Usuario).first()
    if not db.query(models.BadgeDesbloqueado).filter_by(usuario_id=user.id, badge_id=payload.badge_id).first():
        novo_badge = models.BadgeDesbloqueado(usuario_id=user.id, badge_id=payload.badge_id)
        db.add(novo_badge)
        db.commit()
        return {"status": "desbloqueado", "badge_id": payload.badge_id}
    return {"status": "ja_existia"}

@app.post("/api/processar-fluxo")
def processar_fluxo(payload: GrafoPayload, db: Session = Depends(get_db)):
    print(f"\n🚀 Validando fluxo: {payload.licao_id}")
    user = db.query(models.Usuario).first()

    # 1. Salva o histórico
    novo_grafo = models.GrafoSalvo(
        usuario_id=user.id if user else None,
        licao_id=payload.licao_id, 
        dados_grafo=json.dumps({"nodes": payload.nodes, "edges": payload.edges})
    )
    db.add(novo_grafo)
    db.commit()

    # 2. Processamento Estatístico
    amostra_dados = []
    resultados_estatisticos = {}

    try:
        if payload.licao_id == "trilha-limpeza":
            df_original = pd.read_csv('backend/data/mini_enem_sujo.csv')
            df = df_original.copy()
            n_original = len(df)
            
            # Identifica operações de limpeza
            labels_ativos = [n.get('data', {}).get('label', '').lower() for n in payload.nodes]
            
            # 1. Remoção de Nulos
            if any("remover nulos" in l for l in labels_ativos):
                df = df.dropna(subset=['NOTA_GERAL', 'IDADE', 'TP_SEXO'])
            
            # 2. Tratamento de Outliers (Idade e Nota)
            if any("limpar outliers" in l for l in labels_ativos) or any("tratar outliers" in l for l in labels_ativos):
                df = df[(df['IDADE'] >= 0) & (df['IDADE'] <= 120)]
                df = df[(df['NOTA_GERAL'].isna()) | (df['NOTA_GERAL'] <= 1000)]
                
            # 3. Filtro de Presença
            if any("filtrar ausentes" in l for l in labels_ativos):
                df = df[df['SITUACAO'] == 'OK']

            # 4. Remoção de Duplicatas
            if any("remover duplicatas" in l for l in labels_ativos):
                df = df.drop_duplicates()
            
            # 5. Padronização de Datas
            if any("padronizar datas" in l for l in labels_ativos):
                def robust_date_parse(val):
                    if not isinstance(val, str): return val
                    for fmt in ("%d/%m/%y", "%d/%m/%Y", "%Y-%m-%d"):
                        try: return pd.to_datetime(val, format=fmt).strftime('%d/%m/%Y')
                        except: continue
                    # Fallback para o parse automático do pandas se os formatos fixos falharem
                    try: return pd.to_datetime(val).strftime('%d/%m/%Y')
                    except: return None
                df['DATA_INSCRICAO'] = df['DATA_INSCRICAO'].apply(robust_date_parse)

            # 6. Padronização de Moeda (RENDA_BRUTA)
            if any("padronizar moeda" in l for l in labels_ativos):
                def fix_currency(val):
                    if isinstance(val, str):
                        clean_val = val.replace('R$', '').replace('.', '').replace(',', '.').strip()
                        try: return float(clean_val)
                        except: return np.nan
                    return float(val) if val is not None else np.nan
                
                # Converte para float para cálculos internos
                df['RENDA_NUM'] = df['RENDA_BRUTA'].apply(fix_currency)
                # Formata de volta para a visualização com vírgula e 2 casas decimais
                df['RENDA_BRUTA'] = df['RENDA_NUM'].apply(lambda x: f"{x:,.2f}".replace('.', 'X').replace(',', '.').replace('X', ',') if pd.notnull(x) else None)

            # 7. Agrupamento de Categorias (LINGUA)
            if any("agrupar línguas" in l for l in labels_ativos):
                map_linguas = {
                    'ingles': 'INGLÊS', 'inglês': 'INGLÊS', 'ing': 'INGLÊS',
                    'espanhol': 'ESPANHOL', 'esp': 'ESPANHOL'
                }
                df['LINGUA'] = df['LINGUA'].astype(str).str.lower().str.strip().replace(map_linguas).str.upper()

            # Captura de "Lixo" (Linhas que foram removidas)
            df_trash = df_original[~df_original.index.isin(df.index)]
            trash_preview = df_trash.head(20).where(pd.notnull(df_trash), None).to_dict(orient='records')

            # Cálculo de Saúde Refinado
            erros_restantes = 0
            erros_restantes += df['NOTA_GERAL'].isna().sum()
            erros_restantes += len(df[(df['IDADE'] < 0) | (df['IDADE'] > 120)])
            erros_restantes += df.duplicated().sum()
            
            # Penaliza se não padronizou as datas ou moedas (checa tipos e formatos)
            if not any("padronizar datas" in l for l in labels_ativos): 
                erros_restantes += 15
            if not any("padronizar moeda" in l for l in labels_ativos):
                erros_restantes += 15
            
            saude = 100 - (erros_restantes * 1.5)
            saude = max(0, min(100, saude))

            resultados_estatisticos = {
                "n_original": n_original,
                "n_atual": len(df),
                "removidos": n_original - len(df),
                "saude": round(saude, 1),
                "erros_criticos": int(erros_restantes),
                "trash_preview": trash_preview,
                "trilha": "tratamento"
            }
            # Retornamos os primeiros 50 por padrão, mas a base completa se o aluno pedir (simulado aqui enviando mais)
            amostra_dados = df.head(500).where(pd.notnull(df), None).to_dict(orient='records')

        elif payload.licao_id == "trilha-associacao":
            df_assoc = pd.read_csv('backend/data/base_associacao_didatica.csv')
            r_p, p_p = pearsonr(df_assoc['HORAS_ESTUDO'], df_assoc['NOTA_EXAME'])
            contingencia = pd.crosstab(df_assoc['TP_ESCOLA'], df_assoc['ACESSO_INTERNET'])
            chi2, p_chi2, _, _ = chi2_contingency(contingencia)
            n = len(df_assoc)
            v_cramer = np.sqrt(chi2 / (n * (min(contingencia.shape) - 1)))

            resultados_estatisticos = {
                "n_total": n,
                "pearson": {"r": round(float(r_p), 4), "p": float(p_p)},
                "chi2": {"stat": round(float(chi2), 4), "p": float(p_chi2)},
                "v_cramer": round(float(v_cramer), 4),
                "boxplot_group": "TP_ESCOLA"
            }
            amostra_dados = df_assoc.head(50).where(pd.notnull(df_assoc), None).to_dict(orient='records')

        else:
            # Trilhas de Inferência Reais (ENEM)
            if df_global is not None:
                df_analise = df_global[(df_global['NU_ANO'] == 2023) & (df_global['NOTA_GERAL'] > 0)].copy()
                
                if payload.licao_id == "trilha-dois-grupos":
                    homens = df_analise[df_analise['TP_SEXO'] == 'M']['NOTA_GERAL']
                    mulheres = df_analise[df_analise['TP_SEXO'] == 'F']['NOTA_GERAL']
                    
                    mu, std = df_analise['NOTA_GERAL'].mean(), df_analise['NOTA_GERAL'].std()
                    stat_ks, p_ks = kstest(df_analise['NOTA_GERAL'], 'norm', args=(mu, std))
                    
                    amostra_shapiro = df_analise['NOTA_GERAL'].sample(min(len(df_analise), 5000))
                    stat_sw, p_sw = shapiro(amostra_shapiro)
                    
                    stat_lev, p_lev = levene(homens, mulheres)
                    stat_t, p_t = ttest_ind(homens, mulheres)
                    stat_u, p_u = mannwhitneyu(homens, mulheres)
                    
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
                else:
                    # Múltiplos Grupos (ANOVA/Kruskal)
                    mu, std = df_analise['NOTA_GERAL'].mean(), df_analise['NOTA_GERAL'].std()
                    stat_ks, p_ks = kstest(df_analise['NOTA_GERAL'], 'norm', args=(mu, std))
                    
                    grupos_dict = {name: group['NOTA_GERAL'].values for name, group in df_analise.groupby('Q006')}
                    grupos_lista = list(grupos_dict.values())
                    
                    stat_lev, p_lev = levene(*grupos_lista)
                    stat_k, p_k = kruskal(*grupos_lista)
                    
                    n_total = len(df_analise)
                    epsilon_sq = (stat_k - (len(grupos_lista) - 1)) / (n_total - (len(grupos_lista) - 1))

                    nomes = sorted(grupos_dict.keys())
                    dunn_results = {}
                    for i in range(len(nomes)):
                        for j in range(i + 1, len(nomes)):
                            if i == 0 or j == len(nomes)-1 or j == i + 1:
                                g1, g2 = nomes[i], nomes[j]
                                _, p_pair = mannwhitneyu(grupos_dict[g1], grupos_dict[g2])
                                dunn_results[f"{g1} vs {g2}"] = round(float(p_pair), 4)

                    resultados_estatisticos = {
                        "n_total": n_total,
                        "ks": {"stat": round(float(stat_ks), 4), "p": float(p_ks)},
                        "levene": {"stat": round(float(stat_lev), 4), "p": float(p_lev)},
                        "kruskal": {"stat": round(float(stat_k), 4), "p": float(p_k)},
                        "epsilon_sq": round(float(epsilon_sq), 4),
                        "dunn_map": dunn_results,
                        "boxplot_group": "Q006"
                    }
                    amostra_dados = df_analise.head(30).where(pd.notnull(df_analise), None).to_dict(orient='records')

    except Exception as e:
        print(f"❌ Erro estatístico: {e}")

    # 3. Validação via Juiz
    juiz = JuizEstatistico(payload.nodes, payload.edges, payload.licao_id)
    validacao = juiz.validar()
    
    # 4. Atualiza Nota Máxima
    if validacao["status"] == "concluido" and user:
        prog = db.query(models.ProgressoTrilha).filter_by(usuario_id=user.id, licao_id=payload.licao_id).first()
        if prog:
            prog.nota_maxima = max(prog.nota_maxima, validacao["nota"])
            db.commit()

    # Preparação Final para JSON (Garante que não existam NaNs/Infs ou tipos Numpy)
    def clean_for_json(obj):
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
        elif pd.isna(obj): # Captura NaT, NaN e outros nulos do pandas
            return None
        return obj

    response_data = {
        "status": "sucesso",
        "preview": clean_for_json(amostra_dados),
        "estatisticas": clean_for_json(resultados_estatisticos),
        "validacao": clean_for_json(validacao)
    }

    return response_data

@app.get("/api/status/{process_id}")
def status_processamento(process_id: int):
    return {"status": "concluido", "process_id": process_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)
