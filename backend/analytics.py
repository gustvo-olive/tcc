import pandas as pd
import numpy as np
import os
from scipy.stats import shapiro, kstest, levene, kruskal, ttest_ind, mannwhitneyu, pearsonr, chi2_contingency
from typing import List, Dict, Any

class AnalizadorEstatistico:
    """
    Motor de processamento de dados e estatística.
    Encapsula toda a lógica de Pandas e SciPy.
    """
    
    def __init__(self, data_path: str, mini_enem_path: str, assoc_path: str):
        self.DATA_PATH = data_path
        self.MINI_ENEM_PATH = mini_enem_path
        self.ASSOC_PATH = assoc_path
        self.df_global = None
        self.carregar_base_principal()

    def carregar_base_principal(self):
        if os.path.exists(self.DATA_PATH):
            try:
                self.df_global = pd.read_csv(self.DATA_PATH)
                print(f"✅ [Analytics] Base Principal carregada: {len(self.df_global)} linhas.")
            except Exception as e:
                print(f"❌ [Analytics] Erro base principal: {e}")

    def processar_limpeza(self, nodes: List[Dict]) -> Dict:
        if not os.path.exists(self.MINI_ENEM_PATH):
            raise FileNotFoundError(f"Arquivo não encontrado: {self.MINI_ENEM_PATH}")
        
        df_original = pd.read_csv(self.MINI_ENEM_PATH)
        df = df_original.copy()
        n_original = len(df)
        
        labels_ativos = [n.get('data', {}).get('label', '').lower() for n in nodes]
        configs = {n.get('data', {}).get('label', '').lower(): n.get('data', {}).get('config', {}) for n in nodes}
        
        # 1. Remoção de Nulos
        if any("remover nulos" in l for l in labels_ativos):
            c = next((v for k, v in configs.items() if "remover nulos" in k), {})
            cols = c.get('colunas', ['NOTA_GERAL', 'IDADE', 'TP_SEXO'])
            if not cols: cols = ['NOTA_GERAL', 'IDADE', 'TP_SEXO']
            df = df.dropna(subset=cols)
        
        # 2. Tratamento de Outliers
        if any("limpar outliers" in l for l in labels_ativos) or any("tratar outliers" in l for l in labels_ativos):
            c = next((v for k, v in configs.items() if "outliers" in k), {})
            idade_max = c.get('idade_max', 120)
            nota_max = c.get('nota_max', 1000)
            df = df[(df['IDADE'] >= 0) & (df['IDADE'] <= idade_max)]
            df = df[(df['NOTA_GERAL'].isna()) | (df['NOTA_GERAL'] <= nota_max)]
            
        # 3. Filtro de Presença
        if any("filtrar ausentes" in l for l in labels_ativos):
            df = df[df['SITUACAO'] == 'OK']

        # 4. Remoção de Duplicatas
        if any("remover duplicatas" in l for l in labels_ativos):
            df = df.drop_duplicates()
        
        # 5. Padronização Genérica (Datas e Moeda)
        if any("padronizar dados" in l for l in labels_ativos):
            c = next((v for k, v in configs.items() if "padronizar" in k), {})
            cols_to_pad = c.get('colunas', [])
            
            if not cols_to_pad:
                cols_to_pad = [col for col in ['DATA_INSCRICAO', 'RENDA_BRUTA'] if col in df.columns]

            for col in cols_to_pad:
                if 'DATA' in col.upper():
                    def robust_date_parse(val):
                        if not isinstance(val, str): return val
                        for fmt in ("%d/%m/%y", "%d/%m/%Y", "%Y-%m-%d"):
                            try: return pd.to_datetime(val, format=fmt).strftime('%d/%m/%Y')
                            except: continue
                        try: return pd.to_datetime(val).strftime('%d/%m/%Y')
                        except: return None
                    df[col] = df[col].apply(robust_date_parse)
                
                elif 'RENDA' in col.upper() or 'VALOR' in col.upper() or 'NOTA' in col.upper():
                    def fix_currency(val):
                        if isinstance(val, str):
                            clean_val = val.replace('R$', '').replace('.', '').replace(',', '.').strip()
                            try: return float(clean_val)
                            except: return np.nan
                        return float(val) if val is not None else np.nan
                    
                    if col == 'RENDA_BRUTA':
                        df['RENDA_NUM'] = df[col].apply(fix_currency)
                        df[col] = df['RENDA_NUM'].apply(lambda x: f"{x:,.2f}".replace('.', 'X').replace(',', '.').replace('X', ',') if pd.notnull(x) else None)
                    else:
                        df[col] = df[col].apply(fix_currency)

        # 6. Imputação de Dados (Nova Funcionalidade)
        if any("imputar dados" in l for l in labels_ativos):
            c = next((v for k, v in configs.items() if "imputar" in k), {})
            col_alvo = c.get('coluna')
            metodo = c.get('metodo', 'mediana')
            
            if col_alvo and col_alvo in df.columns:
                # Garante que a coluna é numérica para o cálculo
                if 'RENDA_BRUTA' in col_alvo: # Caso especial: usa o valor numérico
                    temp_col = df['RENDA_BRUTA'].apply(lambda x: float(str(x).replace('R$', '').replace('.', '').replace(',', '.')) if pd.notnull(x) else np.nan)
                    val_fill = temp_col.mean() if metodo == 'media' else temp_col.median()
                    df[col_alvo] = df[col_alvo].fillna(f"R$ {val_fill:,.2f}".replace('.', 'X').replace(',', '.').replace('X', ','))
                else:
                    try:
                        val_fill = df[col_alvo].mean() if metodo == 'media' else df[col_alvo].median()
                        df[col_alvo] = df[col_alvo].fillna(val_fill)
                    except:
                        pass # Ignora se a coluna não for numérica

        # 7. Agrupamento de Línguas
        if any("agrupar línguas" in l for l in labels_ativos):
            map_linguas = {'ingles': 'INGLÊS', 'inglês': 'INGLÊS', 'ing': 'INGLÊS', 'espanhol': 'ESPANHOL', 'esp': 'ESPANHOL'}
            df['LINGUA'] = df['LINGUA'].astype(str).str.lower().str.strip().replace(map_linguas).str.upper()

        df_trash = df_original[~df_original.index.isin(df.index)]
        trash_preview = df_trash.head(20).where(pd.notnull(df_trash), None).to_dict(orient='records')

        erros_restantes = df['NOTA_GERAL'].isna().sum()
        c_out = next((v for k, v in configs.items() if "outliers" in k), {'idade_max': 120, 'nota_max': 1000})
        erros_restantes += len(df[(df['IDADE'] < 0) | (df['IDADE'] > c_out.get('idade_max', 120))])
        erros_restantes += df.duplicated().sum()
        
        # Penaliza apenas se colunas críticas não foram padronizadas
        if not any("padronizar" in l for l in labels_ativos):
            erros_restantes += 30
        
        saude = max(0, min(100, 100 - (erros_restantes * 1.5)))
        
        return {
            "preview": df.head(500).where(pd.notnull(df), None).to_dict(orient='records'),
            "estatisticas": {
                "n_original": n_original, "n_atual": len(df), "removidos": n_original - len(df),
                "saude": round(saude, 1), "erros_criticos": int(erros_restantes),
                "trash_preview": trash_preview, "trilha": "tratamento"
            }
        }

    def processar_associacao(self) -> Dict:
        if not os.path.exists(self.ASSOC_PATH):
            raise FileNotFoundError(f"Arquivo não encontrado: {self.ASSOC_PATH}")
        
        df_assoc = pd.read_csv(self.ASSOC_PATH)
        r_p, p_p = pearsonr(df_assoc['HORAS_ESTUDO'], df_assoc['NOTA_EXAME'])
        contingencia = pd.crosstab(df_assoc['TP_ESCOLA'], df_assoc['ACESSO_INTERNET'])
        chi2, p_chi2, _, _ = chi2_contingency(contingencia)
        n = len(df_assoc)
        v_cramer = np.sqrt(chi2 / (n * (min(contingencia.shape) - 1)))
        
        return {
            "preview": df_assoc.head(50).where(pd.notnull(df_assoc), None).to_dict(orient='records'),
            "estatisticas": {
                "n_total": n, "pearson": {"r": round(float(r_p), 4), "p": float(p_p)},
                "chi2": {"stat": round(float(chi2), 4), "p": float(p_chi2), "tabela": contingencia.to_dict()},
                "v_cramer": round(float(v_cramer), 4), "boxplot_group": "TP_ESCOLA"
            }
        }

    def processar_inferencia(self, licao_id: str) -> Dict:
        # Define qual base usar: DIDÁTICA (Associação) ou REAL (ENEM)
        is_assoc = "trilha-associacao" in licao_id
        
        if is_assoc:
            if not os.path.exists(self.ASSOC_PATH):
                raise FileNotFoundError(f"Arquivo não encontrado: {self.ASSOC_PATH}")
            df_analise = pd.read_csv(self.ASSOC_PATH)
            target_col = 'NOTA_EXAME'
            group_col = 'TP_ESCOLA'
        else:
            if self.df_global is None:
                return {"preview": [], "estatisticas": {}}
            df_analise = self.df_global[(self.df_global['NU_ANO'] == 2023) & (self.df_global['NOTA_GERAL'] > 0)].copy()
            target_col = 'NOTA_GERAL'
            group_col = 'TP_SEXO' if licao_id == 'trilha-dois-grupos' else 'Q006'
        
        if licao_id == "trilha-dois-grupos" or (is_assoc and "pearson" in licao_id):
            # Lógica para 2 grupos ou correlação numérica
            if is_assoc:
                # Na associação, não temos grupos binários fixos, usamos a base toda para normalidade
                dados_norm = df_analise[target_col]
            else:
                homens = df_analise[df_analise['TP_SEXO'] == 'M']['NOTA_GERAL']
                mulheres = df_analise[df_analise['TP_SEXO'] == 'F']['NOTA_GERAL']
                dados_norm = df_analise['NOTA_GERAL']

            mu, std = dados_norm.mean(), dados_norm.std()
            stat_ks, p_ks = kstest(dados_norm, 'norm', args=(mu, std))
            
            amostra_shapiro = dados_norm.sample(min(len(dados_norm), 5000))
            stat_sw, p_sw = shapiro(amostra_shapiro)
            
            # Resultados básicos de normalidade (sempre inclusos)
            stats_res = {
                "n_total": len(df_analise),
                "ks": {"stat": round(float(stat_ks), 4), "p": float(p_ks)},
                "shapiro": {"stat": round(float(stat_sw), 4), "p": float(p_sw)},
                "boxplot_group": group_col
            }

            if not is_assoc:
                # Testes específicos de comparação para trilha de 2 grupos real
                stat_lev, p_lev = levene(homens, mulheres)
                stat_t, p_t = ttest_ind(homens, mulheres)
                stat_u, p_u = mannwhitneyu(homens, mulheres)
                n1, n2 = len(homens), len(mulheres)
                s1, s2 = homens.var(), mulheres.var()
                pooled_std = np.sqrt(((n1-1)*s1 + (n2-1)*s2) / (n1+n2-2)) if (n1+n2-2) > 0 else 1
                d_cohen = (homens.mean() - mulheres.mean()) / pooled_std
                
                stats_res.update({
                    "levene": {"stat": round(float(stat_lev), 4), "p": float(p_lev)},
                    "teste_t": {"stat": round(float(stat_t), 4), "p": float(p_t)},
                    "mann_whitney": {"stat": round(float(stat_u), 4), "p": float(p_u)},
                    "d_cohen": round(float(d_cohen), 4)
                })
            else:
                # Testes específicos para Associação (Pearson)
                r_p, p_p = pearsonr(df_analise['HORAS_ESTUDO'], df_analise['NOTA_EXAME'])
                stats_res.update({
                    "pearson": {"r": round(float(r_p), 4), "p": float(p_p)}
                })

            return {
                "preview": df_analise.head(50).where(pd.notnull(df_analise), None).to_dict(orient='records'),
                "estatisticas": stats_res
            }
        
        elif licao_id == "trilha-associacao-chi2":
            # Caso especial: Qui-Quadrado (Categorias)
            contingencia = pd.crosstab(df_analise['TP_ESCOLA'], df_analise['ACESSO_INTERNET'])
            chi2, p_chi2, _, _ = chi2_contingency(contingencia)
            n = len(df_analise)
            v_cramer = np.sqrt(chi2 / (n * (min(contingencia.shape) - 1)))
            
            return {
                "preview": df_analise.head(50).where(pd.notnull(df_analise), None).to_dict(orient='records'),
                "estatisticas": {
                    "n_total": n,
                    "chi2": {"stat": round(float(chi2), 4), "p": float(p_chi2), "tabela": contingencia.to_dict()},
                    "v_cramer": round(float(v_cramer), 4),
                    "boxplot_group": "TP_ESCOLA"
                }
            }
        else:
            # Múltiplos Grupos (ANOVA/Kruskal) real do ENEM
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

            return {
                "preview": df_analise.head(30).where(pd.notnull(df_analise), None).to_dict(orient='records'),
                "estatisticas": {
                    "n_total": n_total,
                    "ks": {"stat": round(float(stat_ks), 4), "p": float(p_ks)},
                    "levene": {"stat": round(float(stat_lev), 4), "p": float(p_lev)},
                    "kruskal": {"stat": round(float(stat_k), 4), "p": float(p_k)},
                    "epsilon_sq": round(float(epsilon_sq), 4),
                    "dunn_map": dunn_results,
                    "boxplot_group": "Q006"
                }
            }
