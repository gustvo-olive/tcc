import pandas as pd
import numpy as np
import os

def gerar_dados_didaticos():
    data_dir = 'backend/data'
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)

    # 1. Dataset para Trilha de Limpeza (Mini ENEM Sujo)
    # 500 linhas com desafios complexos de engenharia de dados
    print("🧹 Gerando mini_enem_sujo.csv (500 linhas com desafios complexos)...")
    n = 500
    idades = np.random.randint(15, 60, size=n).tolist()
    notas = np.random.randint(300, 950, size=n).astype(float).tolist()
    situacao = ['OK'] * n
    nomes = [f'Estudante {i}' for i in range(1, n+1)]
    sexo = np.random.choice(['M', 'F'], size=n).tolist()
    
    # NOVAS COLUNAS PARA DESAFIOS COMPLEXOS
    # Dates: Formatos mistos (YYYY-MM-DD e DD/MM/YY)
    datas = []
    for i in range(n):
        if i % 3 == 0: datas.append(f"2023-05-{np.random.randint(10, 28)}")
        else: datas.append(f"{np.random.randint(10, 28)}/05/23")
    
    # Categorias Inconsistentes
    linguas = []
    for i in range(n):
        opcoes = ['Inglês', 'ingles', 'Ingles', 'ING', 'Espanhol', 'espanhol', 'ESP']
        linguas.append(np.random.choice(opcoes))
        
    # Moeda/Renda Mista
    rendas = []
    for i in range(n):
        val = np.random.randint(1000, 8000)
        if i % 4 == 0: rendas.append(f"R$ {val}")
        elif i % 4 == 1: rendas.append(f"{val},00")
        else: rendas.append(float(val))

    # Injetando "sujeira" pedagógica clássica
    for i in range(0, n, 40): # Erros de Idade
        idades[i] = 250 if i % 80 == 0 else -5
        
    for i in range(5, n, 30): # Erros de Nota
        notas[i] = 9999.0 if i % 60 == 0 else np.nan
        
    df_sujo = pd.DataFrame({
        'ID': range(1, n+1),
        'NOME': nomes,
        'IDADE': idades,
        'NOTA_GERAL': notas,
        'TP_SEXO': sexo,
        'DATA_INSCRICAO': datas,
        'LINGUA': linguas,
        'RENDA_BRUTA': rendas,
        'SITUACAO': situacao
    })

    # Adicionando Duplicatas Explícitas (10 linhas repetidas)
    duplicatas = df_sujo.head(10).copy()
    df_sujo = pd.concat([df_sujo, duplicatas], ignore_index=True)

    df_sujo.to_csv(f'{data_dir}/mini_enem_sujo.csv', index=False)

    # 2. Dataset para Trilha de Associação (Didático)
    # Relação clara entre Horas de Estudo e Nota (Pearson)
    # Relação clara entre Escola e Internet (Qui-Quadrado)
    print("📈 Gerando base_associacao_didatica.csv (500 linhas)...")
    n_assoc = 500
    
    # Pearson: Correlação Forte Positiva
    # Usamos distribuição normal pura sem clipping agressivo para passar nos testes
    horas = np.random.normal(6.0, 1.5, n_assoc)
    # Garante apenas que não temos valores negativos absurdos, mas sem achatar a calda
    horas = np.maximum(0.5, horas) 
    
    # Nota depende das horas + erro normal
    # Reduzimos o erro para manter a linearidade forte e a normalidade da nota
    nota = (horas * 80) + np.random.normal(0, 25, n_assoc) + 100
    # Clipping apenas nos extremos reais do ENEM para não distorcer a curva
    nota = np.clip(nota, 10, 990)
    
    # Qui-Quadrado: Dependência óbvia entre Tipo de Escola e Acesso à Internet
    escola = np.random.choice(['Pública', 'Privada'], size=n_assoc, p=[0.75, 0.25])
    internet = []
    for esc in escola:
        if esc == 'Privada':
            # 98% das privadas têm internet
            internet.append(np.random.choice(['Sim', 'Não'], p=[0.98, 0.02]))
        else:
            # Apenas 45% das públicas têm internet (neste cenário fictício)
            internet.append(np.random.choice(['Sim', 'Não'], p=[0.45, 0.55]))

    df_assoc = pd.DataFrame({
        'ID': range(1, n_assoc+1),
        'HORAS_ESTUDO': np.round(horas, 1),
        'NOTA_EXAME': np.round(nota, 1),
        'TP_ESCOLA': escola,
        'ACESSO_INTERNET': internet
    })
    # Mantendo Q006 apenas como um "alias" invisível se necessário para algum gráfico legado,
    # mas o ideal é que os widgets usem as colunas novas.
    df_assoc['Q006'] = df_assoc['TP_ESCOLA'].map({'Pública': 'A', 'Privada': 'Q'})
    
    df_assoc.to_csv(f'{data_dir}/base_associacao_didatica.csv', index=False)
    
    print("✅ Datasets didáticos de 500 linhas gerados com sucesso!")

if __name__ == "__main__":
    gerar_dados_didaticos()
