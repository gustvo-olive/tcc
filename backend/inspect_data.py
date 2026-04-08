import pandas as pd
import os

def analisar_base():
    caminho = 'backend/data/enem_ma_participantes_2019_2023.csv'
    if not os.path.exists(caminho):
        print("Arquivo não encontrado!")
        return

    # Lendo apenas as primeiras 5 linhas para não travar
    df = pd.read_csv(caminho, nrows=5)
    
    print("\n📋 Colunas encontradas:")
    print(df.columns.tolist())
    
    print("\n👀 Amostra dos dados:")
    print(df.to_dict(orient='records'))

if __name__ == "__main__":
    analisar_base()