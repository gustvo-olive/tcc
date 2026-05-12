import pandas as pd
import numpy as np
import os

def gerar_dados_didaticos():
    data_dir = 'backend/data'
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)

    # 1. Dataset para Trilha de Limpeza (Mini ENEM Sujo)
    # 50 linhas com erros propositais
    print("🧹 Gerando mini_enem_sujo.csv...")
    n = 50
    dados_sujos = {
        'ID': range(1, n+1),
        'NOME': [f'Estudante {i}' for i in range(1, n+1)],
        'IDADE': np.random.randint(15, 50, size=n).tolist(),
        'NOTA_GERAL': np.random.randint(300, 900, size=n).astype(float).tolist(),
        'TP_SEXO': np.random.choice(['M', 'F'], size=n).tolist(),
        'SITUACAO': ['OK'] * n
    }
    
    # Injetando sujeira
    dados_sujos['IDADE'][5] = 250        # Outlier impossível
    dados_sujos['NOTA_GERAL'][10] = 9999 # Erro de digitação
    dados_sujos['NOTA_GERAL'][15] = np.nan # Dado faltante
    dados_sujos['SITUACAO'][20] = 'ERRO' # Categoria para filtrar
    
    df_sujo = pd.DataFrame(dados_sujos)
    df_sujo.to_csv(f'{data_dir}/mini_enem_sujo.csv', index=False)

    # 2. Dataset para Trilha de Associação (Didático)
    # Relação clara entre Horas de Estudo e Nota (Pearson)
    # Relação clara entre Escola e Internet (Qui-Quadrado)
    print("📈 Gerando base_associacao_didatica.csv...")
    n_assoc = 100
    
    # Pearson: Correlação Forte Positiva
    horas = np.random.uniform(2, 10, n_assoc)
    nota = (horas * 80) + np.random.normal(0, 30, n_assoc) + 100
    
    # Qui-Quadrado: Dependência óbvia
    escola = np.random.choice(['Pública', 'Privada'], size=n_assoc, p=[0.7, 0.3])
    internet = []
    for esc in escola:
        if esc == 'Privada':
            internet.append(np.random.choice(['Sim', 'Não'], p=[0.95, 0.05]))
        else:
            internet.append(np.random.choice(['Sim', 'Não'], p=[0.40, 0.60]))

    df_assoc = pd.DataFrame({
        'ID': range(1, n_assoc+1),
        'HORAS_ESTUDO': np.round(horas, 1),
        'NOTA_EXAME': np.round(nota, 1),
        'TP_ESCOLA': escola,
        'ACESSO_INTERNET': internet,
        'Q006': np.random.choice(['A', 'B', 'C', 'D'], size=n_assoc) # Para manter compatibilidade com widgets
    })
    df_assoc.to_csv(f'{data_dir}/base_associacao_didatica.csv', index=False)
    
    print("✅ Datasets didáticos gerados com sucesso!")

if __name__ == "__main__":
    gerar_dados_didaticos()
