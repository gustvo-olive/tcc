import streamlit as st
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
from scipy.stats import shapiro, levene, kruskal, kstest, norm
import scikit_posthocs as sp
from utils.carregar_dados import carregar_dados_enem_participantes

# --- 1. CONFIGURAÇÃO DA PÁGINA E ESTADO ---
st.set_page_config(page_title="Trilha: Inferência Estatística", layout="wide", page_icon="🎓")

# Inicializa o controle de fases da trilha e o placar (Gamificação)
if 'fase_trilha' not in st.session_state:
    st.session_state.fase_trilha = 1  # Começa na fase 1
    
if 'xp_detetive' not in st.session_state:
    st.session_state.xp_detetive = 0  # Inicia o jogo com 0 XP

def proxima_fase(fase_atual):
    if st.session_state.fase_trilha == fase_atual:
        st.session_state.fase_trilha += 1
        st.rerun()

# --- 2. CARREGAMENTO E FILTROS (SIDEBAR) ---
st.sidebar.header("🎛️ Configuração do Estudo")

# Barra de Progresso e Placar
progresso = (st.session_state.fase_trilha / 6) 
st.sidebar.progress(progresso)
st.sidebar.caption(f"Progresso da Trilha: Fase {st.session_state.fase_trilha}/6")

# ---- NOVO: PLACAR DE XP ----
st.sidebar.divider()
st.sidebar.metric("🏆 XP do Detetive", f"{st.session_state.xp_detetive} pts")
st.sidebar.divider()
# ----------------------------

try:
    df_completo = carregar_dados_enem_participantes()
except Exception as e:
    st.error(f"Erro ao carregar dados: {e}")
    st.stop()

DIC_NOTAS = {
    'Média Geral': 'NOTA_GERAL', 'Matemática': 'NU_NOTA_MT', 'Redação': 'NU_NOTA_REDACAO',
    'Ciências da Natureza': 'NU_NOTA_CN', 'Ciências Humanas': 'NU_NOTA_CH', 'Linguagens': 'NU_NOTA_LC'
}
DIC_RENDA = {'A': 'A (Sem Renda)', 'Q': 'Q (Rica)'}

# 1. CRIAÇÃO DOS WIDGETS (Sem on_change, vamos controlar manualmente)
ano_selecionado = st.sidebar.selectbox("📅 Ano", sorted(df_completo['NU_ANO'].unique()))
tipo_nota_label = st.sidebar.selectbox("📚 Disciplina", list(DIC_NOTAS.keys()))
coluna_selecionada = DIC_NOTAS[tipo_nota_label]

# ==============================================================================
# 🆕 O VIGILANTE DE FILTROS (Lógica "Bulletproof")
# ==============================================================================
# Cria uma "Assinatura" do filtro atual
filtro_atual_signature = f"{ano_selecionado}_{tipo_nota_label}"

# Se não existir assinatura anterior, cria
if 'filtro_anterior' not in st.session_state:
    st.session_state['filtro_anterior'] = filtro_atual_signature

# SE O FILTRO MUDOU:
if st.session_state['filtro_anterior'] != filtro_atual_signature:
    # 1. Limpa os dados estatísticos antigos da memória
    keys_para_limpar = ['p_kruskal', 'h_kruskal', 'dunn_df']
    for key in keys_para_limpar:
        if key in st.session_state:
            del st.session_state[key]
            
    # 2. Atualiza a assinatura para a nova
    st.session_state['filtro_anterior'] = filtro_atual_signature
    
    # 3. Força o recarregamento da página para garantir que tudo limpo seja reprocessado
    st.rerun()
# ==============================================================================

# Filtragem dos dados
df_analise = df_completo[
    (df_completo['NU_ANO'] == ano_selecionado) &
    (df_completo['Q006'].notna()) &
    (df_completo[coluna_selecionada].notna()) & 
    (df_completo['NU_NOTA_REDACAO'] != 0)
].copy()
st.title(f"🎓 Trilha de Inferência: A Renda afeta a nota de {tipo_nota_label}?")

if df_analise.empty:
    st.warning("Dados insuficientes para os filtros selecionados.")
    st.stop()

grupos = [d[coluna_selecionada].values for _, d in df_analise.groupby('Q006')]

# --- 3. DICIONÁRIO COMPLETO (NECESSÁRIO PARA A TABELA) ---
# Atualize seu DIC_RENDA anterior para este completo, senão a tabela ficará com "NaN" nas descrições
DIC_RENDA_COMPLETO = {
    'A': 'A: Nenhuma Renda', 'B': 'B: Até R$ 998,00', 'C': 'C: R$ 998 - R$ 1.497',
    'D': 'D: R$ 1.497 - R$ 1.996', 'E': 'E: R$ 1.996 - R$ 2.495', 'F': 'F: R$ 2.495 - R$ 2.994',
    'G': 'G: R$ 2.994 - R$ 3.992', 'H': 'H: R$ 3.992 - R$ 4.990', 'I': 'I: R$ 4.990 - R$ 5.988',
    'J': 'J: R$ 5.988 - R$ 6.986', 'K': 'K: R$ 6.986 - R$ 7.984', 'L': 'L: R$ 7.984 - R$ 8.982',
    'M': 'M: R$ 8.982 - R$ 9.980', 'N': 'N: R$ 9.980 - R$ 11.976', 'O': 'O: R$ 11.976 - R$ 14.970',
    'P': 'P: R$ 14.970 - R$ 19.960', 'Q': 'Q: Mais de R$ 19.960'
}

# ==============================================================================
# FASE 1: O PANORAMA (TABELA E A DISPARIDADE)
# ==============================================================================
st.header("1️⃣ Fase 1: O Panorama Inicial")

st.markdown(f"""
Nossa pergunta principal é: **Existe um abismo educacional entre as classes sociais?**

Abaixo, resumimos as notas de {tipo_nota_label} para cada grupo de renda.
Observe os números frios antes de olharmos os gráficos.
""")

# --- PREPARAÇÃO DA TABELA ---
# (O código de preparação da tabela df_resumo continua igual ao anterior)
df_resumo = df_analise.groupby('Q006')[coluna_selecionada].agg(['mean', 'median', 'count']).reset_index()
df_resumo['Descricao'] = df_resumo['Q006'].map(DIC_RENDA_COMPLETO)
df_resumo = df_resumo[['Q006', 'Descricao', 'count', 'mean', 'median']]

# --- EXIBIÇÃO DA TABELA ---
st.subheader("📋 Tabela de Desempenho por Renda")
st.dataframe(
    df_resumo,
    hide_index=True,
    use_container_width=True,
    column_config={
        "Q006": st.column_config.TextColumn("Grupo"),
        "Descricao": st.column_config.TextColumn("Descrição da Renda ℹ️", width="medium"),
        "mean": st.column_config.NumberColumn("Média", format="%.2f ⭐"),
        "median": st.column_config.NumberColumn("Mediana", format="%.2f 🎯"),
        "count": st.column_config.NumberColumn("Alunos", format="%d 👤")
    }
)

# --- A PERGUNTA PRINCIPAL (FOCO NA DIFERENÇA DE GRUPOS) ---
st.divider()
st.subheader("🤔 O que os dados dizem?")

col_perg, col_insight = st.columns([2, 1])

with col_perg:
    # Pegando valores reais para ajudar na comparação mental do aluno
    nota_A = df_resumo[df_resumo['Q006']=='A']['mean'].values[0]
    nota_Q = df_resumo[df_resumo['Q006']=='Q']['mean'].values[0]
    
    st.markdown(f"""
    Compare a **Média do Grupo A** (Sem Renda) com a **Média do Grupo Q** (Mais Ricos).
    
    * Nota A: **{nota_A:.1f}**
    * Nota Q: **{nota_Q:.1f}**
    
    Existe uma tendência clara aqui?
    """)
    
    # Verifica se o usuário já respondeu a esta fase (para travar o rádio e não dar XP infinito)
    ja_respondeu_fase1 = st.session_state.get('fase1_concluida', False)
    
    pergunta_tabela = st.radio(
        "Qual padrão você identifica?",
        ["As notas parecem aleatórias, não vejo padrão.", 
         "As notas aumentam conforme a renda aumenta.", 
         "As notas diminuem conforme a renda aumenta."],
        index=None,
        key="quiz_fase1",
        disabled=ja_respondeu_fase1 # Desabilita se já respondeu
    )

    # Botão de Confirmação (Só aparece se ele ainda não respondeu)
    if not ja_respondeu_fase1:
        if st.button("Confirmar Observação 🔒"):
            if pergunta_tabela: # Garante que ele selecionou algo
                st.session_state.fase1_concluida = True
                if pergunta_tabela == "As notas aumentam conforme a renda aumenta.":
                    st.session_state.xp_detetive += 10
                    st.session_state.fase1_acertou = True
                else:
                    # Se errou, não ganha XP
                    st.session_state.fase1_acertou = False
                st.rerun()
            else:
                st.warning("Selecione uma opção antes de confirmar!")

with col_insight:
    # Mostra o feedback SÓ DEPOIS que ele confirmou
    if ja_respondeu_fase1:
        if st.session_state.get('fase1_acertou'):
            st.success("🎯 **Exato! (+10 XP)**")
            st.markdown("""
            Parece haver uma correlação positiva forte.
            
            **Nota Técnica:**
            Repare também que a Média e a Mediana não são exatamente iguais. 
            Isso será importante na Fase 2 para escolhermos o teste estatístico correto!
            """)
            if not st.session_state.get('baloes_fase1_vistos'):
                st.balloons()
                st.session_state.baloes_fase1_vistos = True
        else:
            # AQUI ENTRA A FALHA GUIADA!
            st.error("❌ **Observação Incorreta (0 XP)**")
            st.markdown(f"""
            Se você olhar de perto, a nota do **Grupo A ({nota_A:.1f})** é bem menor que a do **Grupo Q ({nota_Q:.1f})**.
            
            **Ação do Sistema:**
            Para não iniciarmos a investigação com uma premissa falsa, o sistema interveio. A tendência real é que as notas **aumentam** com a renda. Vamos prosseguir com essa constatação validada.
            """)

# 🔍 TOOLTIP FASE 1
with st.expander("🔎 Ver Código Python (Pandas GroupBy)"):
    st.code(f"""
# Para criar a tabela resumo, agrupamos os dados pela coluna de Renda (Q006)
# e calculamos média, mediana e contagem para a coluna de notas.

df_resumo = df.groupby('Q006')['{coluna_selecionada}'].agg(['mean', 'median', 'count'])

# O reset_index transforma o índice 'Q006' de volta em uma coluna normal
df_resumo = df_resumo.reset_index()
    """, language='python')

# --- BOTÃO DE AÇÃO FASE 1 -> 2 ---
# Agora o botão só aparece DEPOIS que o usuário confirmou a resposta (certa ou errada)
if st.session_state.fase_trilha == 1 and st.session_state.get('fase1_concluida', False):
    st.write("---")
    st.markdown("A tabela sugere uma diferença. Vamos ver se o **Gráfico** confirma isso visualmente?")
    if st.button("Ver Gráfico (Boxplot) ➡️"):
        proxima_fase(1)

# ==============================================================================
# FASE 2: A INSPEÇÃO VISUAL (ANTIGA FASE 1)
# ==============================================================================
if st.session_state.fase_trilha >= 2:
    st.divider()
    st.header("2️⃣ Fase 2: Visualizando a Distribuição")
    
    st.markdown("""
    A tabela mostrou os números, agora o **Boxplot** mostra o comportamento.
    * A linha preta dentro da caixa é a **Mediana** (que vimos na tabela).
    """)

    # Layout: Gráfico grande
    fig, ax = plt.subplots(figsize=(12, 6))

    # Boxplot LIMPO (Sem triângulo de média, como combinamos)
    sns.boxplot(
        data=df_analise, 
        x='Q006', 
        y=coluna_selecionada, 
        order=sorted(df_analise['Q006'].unique()), 
        palette='viridis', 
        showfliers=False,      # Sem outliers
        showmeans=False,       # <--- SEM A MÉDIA (TRIÂNGULO)
        ax=ax
    )

    ax.set_title(f"Escada Social: {tipo_nota_label} por Renda", fontsize=14)
    ax.set_xlabel("Classe Social (A=Mais Pobre -> Q=Mais Rica)", fontsize=12)
    ax.set_ylabel("Nota", fontsize=12)

    st.pyplot(fig)

    # 🔍 TOOLTIP FASE 2 (ADICIONADA AQUI)
    with st.expander("🔎 Ver Código Python (Seaborn Boxplot)"):
        st.code(f"""
import seaborn as sns
import matplotlib.pyplot as plt

# Criamos uma figura para o gráfico
plt.figure(figsize=(12, 6))

# O Seaborn facilita muito a criação de Boxplots complexos
sns.boxplot(
    data=df, 
    x='Q006',                # Eixo X: As categorias de Renda
    y='{coluna_selecionada}', # Eixo Y: A nota que estamos analisando
    showfliers=False,        # Importante: Ocultamos os 'outliers' (pontos extremos) para limpar o visual
    palette='viridis'        # Esquema de cores
)

plt.title("Distribuição das Notas por Classe Social")
plt.show()
        """, language='python')

    st.markdown("### 🕵️ Desafio Visual")
    ja_respondeu_fase2 = st.session_state.get('fase2_concluida', False)
    
    pergunta_boxplot = st.radio(
        "Olhando o Boxplot acima, o que acontece com a linha preta (Mediana) à medida que caminhamos da classe A para a Q?",
        ["Ela se mantém reta, indicando notas iguais.", 
         "Ela sobe, formando uma 'escada' de notas maiores.", 
         "Ela desce, indicando notas menores para os mais ricos."],
        index=None,
        key="quiz_fase2",
        disabled=ja_respondeu_fase2
    )

    # Botão de Confirmação (Só aparece se ele ainda não respondeu)
    if not ja_respondeu_fase2:
        if st.button("Confirmar Análise Visual 🔒"):
            if pergunta_boxplot:
                st.session_state.fase2_concluida = True
                if pergunta_boxplot == "Ela sobe, formando uma 'escada' de notas maiores.":
                    st.session_state.xp_detetive += 10
                    st.session_state.fase2_acertou = True
                else:
                    st.session_state.fase2_acertou = False
                st.rerun()
            else:
                st.warning("Selecione uma opção antes de confirmar!")

    # Feedback pós-resposta
    if ja_respondeu_fase2:
        if st.session_state.get('fase2_acertou'):
            st.success("🎯 **Excelente visão de Detetive! (+10 XP)**")
            st.markdown("A 'escadinha' visual é o nosso primeiro indício forte de que a renda afeta o desempenho.")
        else:
            # A FALHA GUIADA DA FASE 2
            st.error("❌ **Análise Visual Incorreta (0 XP)**")
            st.markdown("""
            **Ação do Sistema:** Observe que as caixas mais à direita (Rendas mais altas) estão fisicamente posicionadas mais acima no eixo Y (Notas). 
            
            O sistema registrará que **existe uma tendência visual de alta** para podermos testar isso matematicamente.
            """)

    # --- BOTÃO DE AÇÃO FASE 2 -> 3 ---
    # Só aparece DEPOIS que ele respondeu e confirmou
    if st.session_state.fase_trilha == 2 and st.session_state.get('fase2_concluida', False):
        st.write("---")
        if st.button("Validar com Estatística (Fase 3) ➡️"):
            proxima_fase(2)


# ==============================================================================
# FASE 3: AS REGRAS DO JOGO (PREMISSAS E TESTES)
# ==============================================================================
if st.session_state.fase_trilha >= 3:
    st.divider()
    st.header("3️⃣ Fase 3: A Escolha da Ferramenta")
    
    st.markdown("""
    Visualmente vimos uma diferença. Agora precisamos provar matematicamente.
    Mas **cuidado**: Só podemos usar certos testes se os dados seguirem a **Curva Normal**.
    """)

    # 1. MOSTRAR O TAMANHO DA AMOSTRA (O DADO CRUCIAL)
    n_total = len(df_analise)
    st.info(f"📊 **Tamanho da sua Amostra (N):** {n_total} alunos")

    st.markdown("Dependendo da quantidade de dados, usamos um 'termômetro' diferente para medir a normalidade.")

    # 2. QUIZ: QUAL TESTE DE NORMALIDADE USAR?
    col_perg_norm, col_res_norm = st.columns([1, 1])
    
    with col_perg_norm:
        st.subheader("🤔 Qual teste usar?")
        escolha_norm = st.radio(
            "Baseado no tamanho da amostra (N), qual teste é mais adequado?",
            [
                "Shapiro-Wilk (Mais preciso, ideal para N < 5.000)", 
                "Kolmogorov-Smirnov (Mais robusto, ideal para N > 5.000)"
            ],
            index=None,
            key="quiz_norm"
        )

    # Lógica de Validação do Quiz 1
    acertou_teste_norm = False
    p_norm = None # Inicializa variável

    with col_res_norm:
        if escolha_norm:
            # Regra: Scipy recomenda Shapiro para N < 5000. Acima disso, K-S.
            if n_total < 5000 and "Shapiro" in escolha_norm:
                st.success("✅ **Correto!** Para amostras menores/médias, o Shapiro é o 'padrão ouro'.")
                acertou_teste_norm = True
                # Roda Shapiro
                stat, p_norm = shapiro(df_analise[coluna_selecionada])
                nome_teste_usado = "Shapiro-Wilk"

            elif n_total >= 5000 and "Kolmogorov" in escolha_norm:
                st.success("✅ **Correto!** O Shapiro perde precisão com muitos dados. O K-S é melhor aqui.")
                acertou_teste_norm = True
                # Roda K-S
                media, desvio = norm.fit(df_analise[coluna_selecionada])
                stat, p_norm = kstest(df_analise[coluna_selecionada], 'norm', args=(media, desvio))
                nome_teste_usado = "Kolmogorov-Smirnov"
            
            else:
                st.error("❌ **Não é o ideal.**")
                if n_total < 5000:
                    st.caption("Sua amostra é pequena o suficiente para usar o Shapiro, que é mais sensível.")
                else:
                    st.caption("Sua amostra é gigante! O Shapiro pode engasgar ou dar falso-positivo. Use o K-S.")

    # 3. EXIBIÇÃO DO RESULTADO E SEGUNDA DECISÃO (ANOVA VS KRUSKAL)
    if acertou_teste_norm and p_norm is not None:
        st.write("---")
        st.subheader("📉 Resultado da Normalidade")
        
        c1, c2 = st.columns(2)
        c1.metric(f"Teste: {nome_teste_usado}", f"P-valor: {p_norm:.4e}")
        
        is_normal = p_norm > 0.05
        if is_normal:
            c2.success("Os dados são Normais (P > 0.05)")
        else:
            c2.warning("Os dados **NÃO** são Normais (P < 0.05)")

        st.markdown("Agora, a decisão final: Qual teste de comparação devemos rodar?")
        
        # Quiz 2: Escolha do Teste Final
        escolha_final = st.radio(
            "Selecione o teste adequado:",
            ["ANOVA (Para dados Normais)", "Kruskal-Wallis (Para dados Não-Normais)"],
            index=None,
            key="quiz_final"
        )

        # 🔍 TOOLTIP FASE 3 (ADICIONADA AQUI)
        with st.expander("🔎 Ver Código Python (Testes de Normalidade)"):
            st.code("""
from scipy.stats import shapiro, kstest, norm

# 1. Escolha do Teste baseado no tamanho (N)
if len(dados) < 5000:
    stat, p = shapiro(dados) # Shapiro-Wilk
else:
    # Kolmogorov-Smirnov comparando com a curva normal teórica
    media, desvio = norm.fit(dados)
    stat, p = kstest(dados, 'norm', args=(media, desvio))

# 2. Decisão Automática
if p > 0.05:
    print("Normalidade Aceita -> Podemos usar ANOVA")
else:
    print("Normalidade Rejeitada -> Devemos usar Kruskal-Wallis")
            """, language='python')

        # --- BOTÃO DE AÇÃO FASE 3 -> 4 ---
        if st.session_state.fase_trilha == 3: # (Ajuste o número da fase conforme seu contador)
            if escolha_final:
                if (is_normal and "ANOVA" in escolha_final) or (not is_normal and "Kruskal" in escolha_final):
                    st.success("🎯 **Na mosca!** Você escolheu a ferramenta certa para o formato dos seus dados.")
                    st.write("---")
                    if st.button("Rodar o Teste Final ➡️"):
                        proxima_fase(3) # Vai para a fase de ver os resultados finais
                else:
                    if not is_normal and "ANOVA" in escolha_final:
                        st.error("🛑 **Perigo!** A ANOVA assume que os dados formam um sino perfeito. Como vimos acima, seus dados não são normais. Use a alternativa robusta!")
                    elif is_normal and "Kruskal" in escolha_final:
                        st.warning("⚠️ Você até poderia usar o Kruskal, mas a ANOVA seria mais potente (tem mais 'poder de fogo') para dados normais.")

# ==============================================================================
# FASE 4: O TESTE DE FATO (KRUSKAL-WALLIS)
# ==============================================================================
if st.session_state.fase_trilha >= 4:
    st.divider()
    st.header("4️⃣ Fase 4: O Veredito do Juiz")
    
    st.markdown("""
    Já checamos a Normalidade e vimos que ela falhou.
    Agora, invocamos o **Teste de Kruskal-Wallis**.
    """)

    # --- LÓGICA DE RECÁLCULO AUTOMÁTICO ---
    if 'p_kruskal' not in st.session_state:
        stat_k, p_k = kruskal(*grupos)
        st.session_state['p_kruskal'] = p_k
        st.session_state['h_kruskal'] = stat_k
        st.toast("Dados estatísticos atualizados!", icon="🔄")
    
    # Recupera valores
    p_k = st.session_state['p_kruskal']
    stat_k = st.session_state['h_kruskal']

    c1, c2 = st.columns(2)
    with c1:
        st.metric("Estatística H", f"{stat_k:.2f}")
    with c2:
        st.metric("P-Valor", f"{p_k:.4e}")
        if p_k < 0.05:
            st.success("✅ **Significativo (P < 0.05)**")
        else:
            st.error("❌ **Não Significativo (P > 0.05)**")

    with st.expander("📖 O que esses números significam?"):
        st.markdown("""
        * **P-valor:** É a chance de a diferença ser sorte. Zero = Diferença real.
        * **Estatística H:** Pontuação da diferença baseada nos rankings.
        """)

    # 🔍 TOOLTIP FASE 4 (ADICIONADA AQUI)
    with st.expander("🔎 Ver Código Python (Kruskal-Wallis)"):
        st.code("""
from scipy.stats import kruskal

# 'grupos' é uma lista de arrays (lista de listas), onde cada item são as notas de uma renda.
# O asterisco (*) serve para 'desempacotar' a lista como argumentos individuais.
stat, p = kruskal(*grupos)

if p < 0.05:
    print(f"Rejeitamos a hipótese nula! Existe diferença. (p={p})")
else:
    print("Não há evidências de diferença.")
        """, language='python')

    # --- O DESAFIO DA MÉTRICA (QUIZ) ---
    if st.session_state.fase_trilha == 4:
        if p_k < 0.05:
            st.write("---")
            st.subheader("🧠 Desafio: Escolha a Métrica de Efeito")
            st.markdown("""
            O P-valor disse que **existe** diferença. Agora precisamos medir **o tamanho** dela.
            
            Como nossos dados **não são normais** e temos **vários grupos** (A, B, C...), qual é a régua correta para medir essa intensidade?
            """)
            
            metrica_escolhida = st.radio(
                "Selecione a ferramenta adequada:",
                [
                    "A) Cohen's d",
                    "B) Eta-squared (η²)",
                    "C) Epsilon-squared (ε²)",
                    "D) Rank-Biserial"
                ],
                index=None,
                key="quiz_efeito"
            )
            
            # Feedback Educativo
            if metrica_escolhida:
                if "Cohen's d" in metrica_escolhida:
                    st.error("❌ **Incorreto.**")
                    st.info("""
                    **Por que não?**
                    O *Cohen's d* serve para comparar apenas **2 grupos** (ex: Homem vs Mulher) e assume que os dados são Normais (Paramétrico). 
                    Aqui temos muitos grupos e dados não-normais.
                    """)
                
                elif "Eta-squared" in metrica_escolhida:
                    st.error("❌ **Quase...**")
                    st.info("""
                    **Por que não?**
                    O *Eta-squared* é ótimo para comparar vários grupos, mas ele é "casado" com a **ANOVA** (Paramétrico).
                    Como estamos usando Kruskal-Wallis, precisamos de uma versão adaptada aos rankings.
                    """)
                
                elif "Rank-Biserial" in metrica_escolhida:
                    st.error("❌ **Na trave!**")
                    st.info("""
                    **Por que não?**
                    Você acertou que é uma métrica para dados não-normais (rankings)! 
                    
                    Porém, a *Rank-Biserial* compara apenas **2 grupos** (Par-a-Par). 
                    Como aqui temos 17 faixas de renda (A até Q), ela não dá conta.
                    """)

                elif "Epsilon-squared" in metrica_escolhida:
                    st.balloons()
                    st.success("✅ **Correto!**")
                    st.markdown("""
                    **Por que sim?**
                    O *Epsilon-squared* é desenhado especificamente para o **Kruskal-Wallis**.
                    Ele calcula o quanto a classificação (ranking) da renda explica a variação das notas, sem depender da média ou desvio padrão.
                    """)
                    
                    # SÓ LIBERA O BOTÃO SE ACERTAR
                    if st.button("Calcular Epsilon-Squared ➡️"):
                        proxima_fase(4)
        else:
            st.warning("Como não há diferença estatística, a análise encerra aqui. 🎉")

# ==============================================================================
# FASE 5: A INTENSIDADE (EPSILON-SQUARED)
# ==============================================================================
if st.session_state.fase_trilha >= 5:
    st.divider()
    st.header("5️⃣ Fase 5: O Tamanho da Diferença")
    
    st.markdown("""
    Na estatística moderna (Data Science), o P-valor não é suficiente.
    Precisamos do **Epsilon-Squared ($\epsilon^2$)**. Ele mede o "grau de influência" da renda sobre a nota.
    
    * **0%:** A renda não explica nada.
    * **100%:** A renda explica totalmente a nota.
    """)

    # --- CÁLCULOS ---
    stat_k = st.session_state['h_kruskal']
    n_total = len(df_analise)
    k_groups = len(grupos)

    # Proteção contra divisão por zero (caso raro onde n = k)
    denominador = n_total - k_groups
    if denominador == 0:
        epsilon_sq = 0.0
    else:
        # Fórmula: (H - k + 1) / (n - k)
        epsilon_sq = (stat_k - k_groups + 1) / denominador
    
    # Interpretação baseada em literatura comum para ciências sociais/humanas
    def interpretar_epsilon(e):
        if e < 0.01: return "Desprezível", "gray"
        if e < 0.08: return "Pequeno", "blue"
        if e < 0.26: return "Médio", "orange"
        return "Grande", "red"

    txt_efeito, cor_efeito = interpretar_epsilon(epsilon_sq)

    # --- VISUALIZAÇÃO ---
    col_metric, col_bar = st.columns([1, 2])
    
    with col_metric:
        st.metric(
            label="Epsilon-Squared ($\epsilon^2$)", 
            value=f"{epsilon_sq:.4f}", 
            delta=txt_efeito,
            delta_color="normal" # normal respeita as cores padrão (verde/vermelho) ou podemos customizar
        )
    
    with col_bar:
        st.write("Termômetro de Importância:")
        # Normalização visual: O efeito raramente passa de 0.30 em dados reais.
        # Se usarmos 1.0 como teto, a barra fica sempre vazia. 
        # Aqui, 0.30 preenche a barra toda.
        progresso_visual = min(epsilon_sq / 0.30, 1.0) 
        
        st.progress(progresso_visual)
        st.caption(f"A Renda explica cerca de **{epsilon_sq*100:.1f}%** da variação nas notas.")

    if txt_efeito == "Desprezível":
        st.warning("⚠️ Apesar de existir diferença estatística (P < 0.05), ela é muito fraca na prática.")
    else:
        st.success(f"✅ Temos uma influência considerada **{txt_efeito.upper()}**.")

    # --- TOOLTIP DE CÓDIGO (O QUE FOI PEDIDO) ---
    with st.expander("🔎 Ver Código Python (Cálculo do Effect Size)"):
        st.code(f"""
# 1. Recuperamos os dados do teste anterior
                
# H = stat_k  # Estatística Kruskal-Wallis
# n = n_total     # Total de alunos
# k = k_groups    # Número de grupos (faixas de renda)

# 2. Aplicamos a fórmula do Epsilon-Squared
# Fórmula: (H - k + 1) / (n - k)
epsilon_sq = (stat_k - k_groups + 1) / (n_total - k_groups)

print('Resultado: epsilon_sq:.4f')

        """, language="python")

    # --- BOTÃO DE AÇÃO FASE 5 -> 6 ---
    if st.session_state.fase_trilha == 5:
        st.write("---")
        st.markdown("Última pergunta: **Quais** classes sociais são diferentes entre si?")
        if st.button("Revelar Mapa de Calor (Post-Hoc) ➡️"):
            proxima_fase(5)

# ==============================================================================
# FASE 6: O DETALHE FINAL E A CONCLUSÃO
# ==============================================================================
if st.session_state.fase_trilha >= 6:
    st.divider()
    st.header("6️⃣ Fase 6: Quem é diferente de quem?")
    
    # 1. EXPLICAÇÃO TEÓRICA
    st.markdown("""
    ### 🕵️ O trabalho de detetive
    O teste anterior (Kruskal-Wallis) nos disse apenas: *"Sim, as notas mudam conforme a renda"*.
    Mas ele não nos disse **quais** classes específicas são diferentes.
    
    * Será que a Classe **A** é diferente da **B**?
    * Ou será que a Classe **A** só é diferente lá na frente, comparada com a **Q**?
    
    Para descobrir isso, rodamos o **Teste de Dunn**. Ele faz uma "batalha naval": compara a Classe A contra a B, depois A contra C... até testar **todas as combinações possíveis**.
    """)

    # 2. LÓGICA AUTOMÁTICA (Cálculo com Cache na Sessão)
    # Verifica se já calculamos para não travar o app recarregando
    if 'dunn_df' not in st.session_state:
        with st.spinner("Realizando comparações par-a-par (Bonferroni)..."):
            try:
                # Importante: Certifique-se que 'coluna_selecionada' e 'Q006' (ou a coluna de grupo) existem
                dunn_df_novo = sp.posthoc_dunn(
                    df_analise, 
                    val_col=coluna_selecionada, # Ex: 'NU_NOTA_MT'
                    group_col='Q006',           # Coluna de Grupos (Renda)
                    p_adjust='bonferroni'       # Correção rigorosa de P-valor
                )
                st.session_state['dunn_df'] = dunn_df_novo
            except Exception as e:
                st.error(f"Erro no cálculo do Post-Hoc: {e}")
                st.stop()
    
    dunn_df = st.session_state['dunn_df']

    # 3. VISUALIZAÇÃO CORRIGIDA (AZUL REVERSO)
    st.subheader("🗺️ Mapa de Calor das Diferenças")
    
    col_map, col_instrucao = st.columns([2, 1])
    
    with col_map:
        fig_d, ax_d = plt.subplots(figsize=(10, 8))
        
        # Máscara para esconder a diagonal (comparar A com A é inútil)
        mask = np.eye(len(dunn_df), dtype=bool)

        sns.heatmap(
            dunn_df, 
            cmap='Blues_r',    # Azul Escuro = P-valor baixo (Diferença) | Branco = P-valor alto (Igualdade)
            mask=mask, 
            cbar_kws={'label': 'P-valor (Quanto mais escuro, maior a certeza da diferença)'},
            ax=ax_d,
            vmin=0, vmax=0.05, # Foca o gradiente apenas na zona de significância (0 a 5%)
            linewidths=0.5,
            linecolor='lightgray',
            square=True        # Mantém os quadrados proporcionais
        )
        ax_d.set_title("Onde há Azul, há Diferença", fontsize=14)
        ax_d.set_xlabel("Classe de Renda")
        ax_d.set_ylabel("Classe de Renda")
        plt.xticks(rotation=45) # Melhora leitura se houver muitas classes
        st.pyplot(fig_d)

    with col_instrucao:
        st.info("💡 **Como ler este mapa?**")
        st.markdown("""
        * **🟦 Azul Escuro:** P-valor perto de 0. **Diferença Brutal.** (Certeza Absoluta que as médias são distintas).
        * **🟦 Azul Claro:** P-valor perto de 0.05. **Diferença Leve.**
        * **⬜ Branco/Vazio:** P-valor > 0.05. **Estatisticamente Iguais.**
        
        **Teste Rápido:**
        Olhe o cruzamento da **Renda A** com a **Renda Q** (extremos).
        Se estiver **Azul Escuro**, provamos estatisticamente o abismo social.
        """)

    # --- TOOLTIP DE CÓDIGO (NOVO) ---
    with st.expander("🔎 Ver Código Python (Teste de Dunn & Heatmap)"):
        st.code("""
import scikit_posthocs as sp
import seaborn as sns

# 1. Executa o Teste de Dunn (Post-Hoc)
# p_adjust='bonferroni': Ajusta o P-valor para ser mais rigoroso 
# e evitar "falsos positivos" ao fazer muitos testes ao mesmo tempo.
dunn_matrix = sp.posthoc_dunn(
    df, 
    val_col='nota', 
    group_col='renda', 
    p_adjust='bonferroni'
)

# 2. Configura o Mapa de Calor (Heatmap)
# cmap='Blues_r': 'r' significa reverso. 
# Valores baixos (P<0.05) ficam escuros (Azul).
# Valores altos (P>0.05) ficam claros (Branco).
sns.heatmap(
    dunn_matrix, 
    cmap='Blues_r', 
    vmin=0, vmax=0.05  # Corta a escala visual em 5%
)
        """, language="python")

    # ==========================================================================
    # 🏁 O RELATÓRIO FINAL
    # ==========================================================================
    st.divider()
    st.subheader("📝 Conclusão da Análise")

    # Cálculos para o texto dinâmico
    media_A = df_analise[df_analise['Q006'] == 'A'][coluna_selecionada].mean()
    media_Q = df_analise[df_analise['Q006'] == 'Q'][coluna_selecionada].mean()
    gap_pontos = media_Q - media_A
    
    # Recupera o Epsilon
    stat_k = st.session_state.get('h_kruskal', 0)
    n_total = len(df_analise)
    k_groups = len(grupos)
    epsilon_sq = (stat_k - k_groups + 1) / (n_total - k_groups)
    
    # Texto condicional
    if epsilon_sq > 0.15:
        tipo_card = "error" 
        termo_conclusao = "uma desigualdade alarmante"
    elif epsilon_sq > 0.05:
        tipo_card = "warning"
        termo_conclusao = "uma desigualdade considerável"
    else:
        tipo_card = "success"
        termo_conclusao = "uma desigualdade leve"

    texto_conclusao = f"""
    ### 📌 Veredito: {ano_selecionado} - {tipo_nota_label}
    
    Aplicando o teste de Kruskal-Wallis em **{n_total:,}** alunos, detectamos **{termo_conclusao}** ($\epsilon^2$={epsilon_sq:.3f}).
    
    **O Abismo em Números:**
    * Média da Base (A): **{media_A:.1f}**
    * Média do Topo (Q): **{media_Q:.1f}**
    * **Diferença:** **{gap_pontos:.1f} pontos**.
    
    O mapa de calor acima mostra visualmente como as classes se distanciam. Quanto mais "azul" o mapa, mais generalizada é a desigualdade entre os grupos.
    """

    if tipo_card == "error":
        st.error(texto_conclusao)
    elif tipo_card == "warning":
        st.warning(texto_conclusao)
    else:
        st.success(texto_conclusao)

    st.write("---")
    if st.button("🔄 Nova Análise (Reiniciar)", type="primary"):
        for key in list(st.session_state.keys()):
            del st.session_state[key]
        st.rerun()