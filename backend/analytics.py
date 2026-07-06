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
        self.BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        self.FEAT_PATH = os.path.join(self.BASE_DIR, 'data', 'base_engenharia_atributos.csv')
        self.SAMPLING_PATH = os.path.join(self.BASE_DIR, 'data', 'base_amostragem_gigante.csv')
        self.df_global = None
        self.carregar_base_principal()

    def carregar_base_principal(self):
        if os.path.exists(self.DATA_PATH):
            try:
                self.df_global = pd.read_csv(self.DATA_PATH)
                print(f"✅ [Analytics] Base Principal carregada: {len(self.df_global)} linhas.")
            except Exception as e:
                print(f"❌ [Analytics] Erro base principal: {e}")

    def processar_limpeza(self, nodes: List[Dict], base_type: str = "suja") -> Dict:
        # Define qual base carregar
        path_map = {
            "suja": self.MINI_ENEM_PATH,
            "feat": self.FEAT_PATH,
            "sampling": self.SAMPLING_PATH
        }
        target_path = path_map.get(base_type, self.MINI_ENEM_PATH)
        
        if not os.path.exists(target_path):
            raise FileNotFoundError(f"Arquivo não encontrado: {target_path}")
        
        df_original = pd.read_csv(target_path)
        df = df_original.copy()
        n_original = len(df)
        
        # PROCESSAMENTO SEQUENCIAL: Segue a ordem das ferramentas no pipeline
        for node in nodes:
            node_id = node.get('id')
            c = node.get('data', {}).get('config', {})

            # 1. Remoção de Nulos (id: 'nulos')
            if node_id == 'nulos':
                cols = c.get('colunas', [])
                if not cols: cols = [col for col in ['NOTA_GERAL', 'NOTA_MATEMATICA', 'NOTA_REDACAO', 'IDADE'] if col in df.columns]
                df = df.dropna(subset=cols)
            
            # 2. Tratamento de Outliers (id: 'outliers')
            elif node_id == 'outliers':
                idade_max = c.get('idade_max', 120)
                nota_max = c.get('nota_max', 1000)
                if 'IDADE' in df.columns:
                    df = df[(df['IDADE'] >= 0) & (df['IDADE'] <= idade_max)]
                # Tenta limpar a nota principal disponível
                col_nota = next((col for col in ['NOTA_GERAL', 'NOTA_MATEMATICA', 'NOTA_FINAL'] if col in df.columns), None)
                if col_nota:
                    df = df[(df[col_nota].isna()) | (df[col_nota] <= nota_max)]
                
            # 3. Filtro de Presença (id: 'ausentes')
            elif node_id == 'ausentes':
                if 'SITUACAO' in df.columns:
                    df = df[df['SITUACAO'] == 'OK']

            # 4. Remoção de Duplicatas (id: 'duplicatas')
            elif node_id == 'duplicatas':
                df = df.drop_duplicates()
            
            # 5. Padronização Genérica (id: 'padronizar')
            elif node_id == 'padronizar':
                cols_to_pad = c.get('colunas', [])
                formato_renda = c.get('formato_renda', 'moeda')
                if not cols_to_pad:
                    cols_to_pad = [col for col in ['DATA_INSCRICAO', 'RENDA_BRUTA', 'LINGUA'] if col in df.columns]

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
                        
                        vals_float = df[col].apply(fix_currency)
                        if formato_renda == 'moeda':
                            df[col] = vals_float.apply(lambda x: f"R$ {x:,.2f}".replace('.', 'X').replace(',', '.').replace('X', ',') if pd.notnull(x) else None)
                        elif formato_renda == 'float':
                            df[col] = vals_float
                        elif formato_renda == 'inteiro':
                            df[col] = vals_float.apply(lambda x: int(x) if pd.notnull(x) else None)
                    
                    elif 'LINGUA' in col.upper() or 'IDIOMA' in col.upper():
                        def clean_lang(val):
                            if pd.isnull(val): return val
                            v = str(val).lower().strip()
                            if 'ing' in v or 'ingl' in v:
                                return 'INGLÊS'
                            elif 'esp' in v:
                                return 'ESPANHOL'
                            return str(val).upper()
                        df[col] = df[col].apply(clean_lang)

            # 6. Imputação de Dados (id: 'imputar')
            elif node_id == 'imputar':
                col_alvo = c.get('coluna')
                metodo = c.get('metodo', 'mediana')
                if col_alvo and col_alvo in df.columns:
                    if 'RENDA_BRUTA' in col_alvo:
                        temp_col = df['RENDA_BRUTA'].apply(lambda x: float(str(x).replace('R$', '').replace('.', '').replace(',', '.')) if pd.notnull(x) else np.nan)
                        val_fill = temp_col.mean() if metodo == 'media' else temp_col.median()
                        df[col_alvo] = df[col_alvo].fillna(f"R$ {val_fill:,.2f}".replace('.', 'X').replace(',', '.').replace('X', ','))
                    else:
                        try:
                            val_fill = df[col_alvo].mean() if metodo == 'media' else df[col_alvo].median()
                            df[col_alvo] = df[col_alvo].fillna(val_fill)
                        except: pass

            # 7. Média Ponderada (id: 'media_ponderada')
            elif node_id == 'media_ponderada':
                col1, peso1 = c.get('col1', 'NOTA_MATEMATICA'), c.get('peso1', 1)
                col2, peso2 = c.get('col2', 'NOTA_REDACAO'), c.get('peso2', 1)
                if col1 in df.columns and col2 in df.columns:
                    df['NOTA_FINAL'] = (df[col1] * peso1 + df[col2] * peso2) / (peso1 + peso2)
                    df['NOTA_FINAL'] = df['NOTA_FINAL'].round(2)

            # 8. Categorizar Idade (id: 'binning_idade')
            elif node_id == 'binning_idade':
                col_idade = c.get('coluna', 'IDADE')
                lim_j = c.get('limite_jovem', 25)
                lim_a = c.get('limite_adulto', 60)
                if col_idade in df.columns:
                    def categorizar(idade):
                        if idade <= lim_j: return "Jovem"
                        if idade <= lim_a: return "Adulto"
                        return "Idoso/Sênior"
                    df['FAIXA_ETARIA'] = df[col_idade].apply(categorizar)

            # 9. Normalizar Notas (id: 'normalizar')
            elif node_id == 'normalizar':
                col = c.get('coluna')
                if col and col in df.columns:
                    mi, ma = df[col].min(), df[col].max()
                    if ma > mi:
                        new_col = f"{col}_NORM"
                        df[new_col] = (df[col] - mi) / (ma - mi)
                        df[new_col] = df[new_col].round(4)

            # 10. Amostragem Aleatória (id: 'amostra_simples')
            elif node_id == 'amostra_simples':
                n_sample = min(c.get('n', 500), len(df))
                df = df.sample(n=n_sample)

            # 11. Amostragem Estratificada (id: 'amostra_estratificada')
            elif node_id == 'amostra_estratificada':
                n_total = min(c.get('n', 500), len(df))
                col_estrato = c.get('coluna', 'TP_ESCOLA')
                if col_estrato in df.columns:
                    df = df.groupby(col_estrato, group_keys=False).apply(lambda x: x.sample(int(np.rint(n_total*len(x)/len(df))))).sample(frac=1).reset_index(drop=True)

            # 12. Agrupamento de Línguas (id: 'linguas')
            elif node_id == 'linguas':
                map_linguas = {'ingles': 'INGLÊS', 'inglês': 'INGLÊS', 'ing': 'INGLÊS', 'espanhol': 'ESPANHOL', 'esp': 'ESPANHOL'}
                if 'LINGUA' in df.columns:
                    df['LINGUA'] = df['LINGUA'].astype(str).str.lower().str.strip().replace(map_linguas).str.upper()

        df_trash = df_original[~df_original.index.isin(df.index)]
        trash_preview = df_trash.head(20).where(pd.notnull(df_trash), None).to_dict(orient='records')

        # Cálculo de Saúde Adaptativo
        erros_restantes = 0
        possiveis_notas = ['NOTA_GERAL', 'NOTA_MATEMATICA', 'NOTA_FINAL']
        col_nota = next((c for c in possiveis_notas if c in df.columns), None)
        if col_nota:
            erros_restantes += df[col_nota].isna().sum()
        if 'IDADE' in df.columns:
            erros_restantes += len(df[(df['IDADE'] < 0) | (df['IDADE'] > 120)])
        erros_restantes += df.duplicated().sum()
        if base_type == "suja" and not any(n.get('id') == 'padronizar' for n in nodes):
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
