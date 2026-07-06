export const TRILHAS_CONTENT = {
  'trilha-multiplos-grupos': {
    titulo: "Comparação de Múltiplos Grupos",
    fases: [
      {
        id: 1,
        titulo: "Fase 1: Exploração Visual",
        conteudo: [
          { tipo: "texto", valor: "Antes de aplicar qualquer teste, o BOXPLOT é seu melhor amigo. Ele mostra a mediana, os quartis e os 'outliers' (pontos fora da curva) de cada tipo de escola ou faixa de renda." },
          { tipo: "dica", valor: "💡 Olhe para a linha central da caixa (mediana). Se as linhas de diferentes grupos não estão alinhadas, há uma forte chance de que os grupos sejam desiguais." }
        ]
      },
      {
        id: 2,
        titulo: "Fase 2: Testes de Normalidade (O Tamanho da Amostra Importa)",
        conteudo: [
          { tipo: "texto", valor: "Para saber se os dados seguem a 'Curva de Sino', escolhemos o teste baseado no tamanho da sua amostra (N):" },
          { tipo: "conceito", titulo: "Amostras Pequenas (N < 5000)", valor: "Use o Teste de Shapiro-Wilk. Ele é o mais poderoso e preciso para amostras menores." },
          { tipo: "conceito", titulo: "Amostras Grandes (N ≥ 5000)", valor: "Use o Teste de Kolmogorov-Smirnov (K-S). Como o ENEM tem milhões de dados, este será seu teste padrão na maioria das vezes!" },
          { tipo: "alerta", valor: "🚨 REGRA: Se o P-valor desses testes for menor que 0.05, seus dados NÃO são normais. Isso te obriga a buscar caminhos não-paramétricos!" }
        ]
      },
      {
        id: 3,
        titulo: "Fase 3: Teste de Levene (O Porteiro da ANOVA)",
        conteudo: [
          { tipo: "texto", valor: "Antes de decidir pela ANOVA, precisamos checar a HOMOCEDASTICIDADE (Variâncias Iguais). Imagine comparar a altura de crianças com a de adultos; a variação nos grupos é muito diferente?" },
          { tipo: "conceito", titulo: "Teste de Levene", valor: "Ele testa se a dispersão (espalhamento) dos dados é a mesma em todos os grupos." },
          { tipo: "alerta", valor: "🚨 REGRA: Se o P-valor do Levene for < 0.05, as variâncias são HETEROGÊNEAS (Desiguais). Nesse caso, a ANOVA tradicional falha e você deve ir para o Kruskal-Wallis!" }
        ]
      },
      {
        id: 4,
        titulo: "Fase 4: A Bifurcação de Decisão",
        conteudo: [
          { tipo: "texto", valor: "Agora você cruza os dois portões (Normalidade + Levene) para escolher seu motor:" },
          { 
            tipo: "hipoteses", 
            h0: "ROTA A (ANOVA): Use se os dados forem NORMAIS E as variâncias forem IGUAIS (P > 0.05 no Levene).", 
            h1: "ROTA B (Kruskal-Wallis): Use se a normalidade FALHAR OU se as variâncias forem DESIGUAIS." 
          }
        ]
      },
      {
        id: 5,
        titulo: "Fase 5: Rota A - ANOVA (Paramétrica)",
        conteudo: [
          { tipo: "texto", valor: "A ANOVA (Análise de Variância) compara se a variação entre os grupos é maior do que a variação 'bagunçada' dentro de cada grupo." },
          { tipo: "formula", valor: "F = \\frac{\\text{Variância Entre Grupos}}{\\text{Variância Dentro dos Grupos}}", legenda: "Se F for alto e P < 0.05, pelo menos um grupo tem média diferente." },
          { tipo: "conceito", titulo: "Post-Hoc de Tukey", valor: "Se a ANOVA der positivo, usamos o Teste de Tukey para comparar os pares (ex: Pública vs Privada) e ver quem é o destaque." }
        ]
      },
      {
        id: 6,
        titulo: "Fase 6: Rota B - Kruskal-Wallis (Não-Paramétrica)",
        conteudo: [
          { tipo: "texto", valor: "Quando os dados do ENEM estão 'tortos' (muitos zeros ou notas mil), a média engana. O Kruskal-Wallis ignora os valores brutos e foca na ordem das notas." },
          { tipo: "conceito", titulo: "Ranking (Postos)", valor: "Imagine colocar todos os alunos em uma fila única. O teste vê se os alunos de escola 'Federal' estão acumulados no fim da fila (notas altas)." },
          { tipo: "conceito", titulo: "Post-Hoc de Dunn", valor: "É o par do Kruskal-Wallis. Usamos o Teste de Dunn para descobrir quais grupos de renda são realmente diferentes entre si." }
        ]
      },
      {
        id: 7,
        titulo: "Fase 7: Tamanho do Efeito (Magnitude)",
        conteudo: [
          { tipo: "texto", valor: "Não basta ser diferente, tem que ser RELEVANTE. O p-valor não diz o tamanho da desigualdade." },
          { tipo: "conceito", titulo: "Eta Quadrado (η²)", valor: "Para ANOVA. Diz quantos % da nota é explicada pelo grupo (ex: 'O tipo de escola explica 20% da nota do aluno')." },
          { tipo: "conceito", titulo: "Epsilon Quadrado (ε²)", valor: "A medida equivalente para o Kruskal-Wallis." }
        ]
      },
      {
        id: 8,
        titulo: "Fase 8: Missão Final no Canvas",
        conteudo: [
          { tipo: "missao", valor: "DESAFIO: O nível de renda impacta o desempenho dos alunos no ENEM 2023?" }
        ]
      }
    ]
  },
  'trilha-dois-grupos': {
    titulo: "Comparação de Dois Grupos (Gênero e Escola)",
    fases: [
      {
        id: 1,
        titulo: "Fase 1: O Duelo de Grupos",
        conteudo: [
          { tipo: "texto", valor: "Diferente da trilha anterior, aqui focamos em apenas DOIS grupos. O objetivo é saber se há uma vantagem estatística de um sobre o outro." },
          { tipo: "hipoteses", h0: "Os dois grupos têm o mesmo desempenho (Ex: Homens = Mulheres).", h1: "Existe uma diferença significativa entre eles." },
          { tipo: "dica", valor: "💡 No ENEM, costumamos comparar Homens vs Mulheres (TP_SEXO) ou Escola Pública vs Privada (TP_ESCOLA)." }
        ]
      },
      {
        id: 2,
        titulo: "Fase 2: Exploração e Boxplot",
        conteudo: [
          { tipo: "texto", valor: "Antes de rodar testes, veja a 'cara' da diferença. No Boxplot, se as caixas de dois grupos estão em alturas muito diferentes, sua hipótese H1 ganha força!" },
          { tipo: "conceito", titulo: "Visualizando Gênero", valor: "No ENEM, as notas de Matemática costumam ter distribuições diferentes entre homens e mulheres. O Boxplot revelará isso instantaneamente." }
        ]
      },
      {
        id: 3,
        titulo: "Fase 3: Os Porteiros (Normalidade e Levene)",
        conteudo: [
          { tipo: "texto", valor: "Antes de rodar o teste de comparação, você precisa passar pelos porteiros:" },
          { tipo: "conceito", titulo: "Normalidade (N < 5000)", valor: "Use o Teste de Shapiro-Wilk. Ele verifica se os dados de cada grupo seguem a distribution normal." },
          { tipo: "conceito", titulo: "Normalidade (N ≥ 5000)", valor: "Use o Kolmogorov-Smirnov (K-S). Para grandes volumes de dados (ENEM), ele é o padrão." },
          { tipo: "conceito", titulo: "Variância (Levene)", valor: "O Teste de Levene aqui é crucial. Se as variâncias forem diferentes, o Teste T padrão pode mentir. Fique atento ao P-valor!" }
        ]
      },
      {
        id: 4,
        titulo: "Fase 4: A Bifurcação (Paramétrico vs Não-Paramétrico)",
        conteudo: [
          { tipo: "texto", valor: "Chegou a hora de escolher o motor da sua comparação:" },
          { tipo: "hipoteses", h0: "Caminho A (Teste T): Use se os dados forem NORMAIS.", h1: "Caminho B (Mann-Whitney): Use se a normalidade falhar." },
          { tipo: "alerta", valor: "🚨 DICA: Em Redação, onde há muitos zeros e notas mil, o Mann-Whitney costuma ser mais honesto que o Teste T." }
        ]
      },
      {
        id: 5,
        titulo: "Fase 5: Teste T de Student",
        conteudo: [
          { tipo: "texto", valor: "O Teste T compara se a distância entre as médias dos dois grupos é 'grande o suficiente' para não ser por acaso." },
          { tipo: "formula", valor: "t = \\frac{\\bar{x}_1 - \\bar{x}_2}{\\sqrt{\\frac{s_1^2}{n_1} + \\frac{s_2^2}{n_2}}}", legenda: "Se t for alto e P < 0.05, os grupos são diferentes." }
        ]
      },
      {
        id: 6,
        titulo: "Fase 6: Mann-Whitney U",
        conteudo: [
          { tipo: "texto", valor: "O Mann-Whitney não liga para médias. Ele coloca todos os alunos em um ranking e vê se um grupo (ex: Mulheres) está sistematicamente 'acima' do outro no ranking." },
          { tipo: "dica", valor: "💡 Ele é imune a valores extremos (outliers). Se um aluno tirou 1000 e outro zero, o ranking amortece esse impacto." }
        ]
      },
      {
        id: 7,
        titulo: "Fase 7: Magnitude (d de Cohen)",
        conteudo: [
          { tipo: "texto", valor: "A diferença é estatística, mas é grande? O 'd de Cohen' mede quantas unidades de desvio padrão separam os grupos." },
          { tipo: "conceito", titulo: "Escala de Cohen", valor: "0.2 (Pequeno), 0.5 (Médio), 0.8 (Grande). No ENEM, mesmo efeitos 'Pequenos' podem ser socialmente gigantes!" }
        ]
      },
      {
        id: 8,
        titulo: "Fase 8: Missão Final",
        conteudo: [
          { tipo: "missao", valor: "DESAFIO: Existe diferença significativa entre a nota de REDAÇÃO de Homens e Mulheres no ENEM 2023?" }
        ]
      }
    ]
  },
  'trilha-associacao-pearson': {
    titulo: "Desafio: Renda vs Desempenho (Pearson)",
    fases: [
      {
        id: 1,
        titulo: "Fase 1: O Questionamento PBL",
        conteudo: [
          { tipo: "missao", valor: "QUESTÃO: Existe uma relação linear entre a Renda Familiar do aluno e a sua Nota Final?" },
          { tipo: "texto", valor: "Neste desafio, você deve usar a estatística para provar se, à medida que a renda sobe, a nota também sobe de forma proporcional." },
          { tipo: "dica", valor: "💡 Pense: se descobrirmos que a renda dita a nota, o que isso diz sobre a igualdade de oportunidades no ENEM?" }
        ]
      },
      {
        id: 2,
        titulo: "Fase 2: Exploração Visual (Scatter Plot)",
        conteudo: [
          { tipo: "texto", valor: "Antes de calcular números, olhamos o gráfico. O Gráfico de Dispersão mostra a 'nuvem' de pontos formada pelas duas variáveis." },
          { tipo: "conceito", titulo: "Tendência Linear", valor: "Se os pontos formam uma subida da esquerda para a direita, a correlação é positiva. Se estiverem aleatórios, pode não haver relação nenhuma." }
        ]
      },
      {
        id: 3,
        titulo: "Fase 3: O Pedágio da Normalidade",
        conteudo: [
          { tipo: "texto", valor: "O r de Pearson é um teste 'Paramétrico'. Ele exige que os dados sigam a Distribuição Normal (Curva de Sino)." },
          { tipo: "conceito", titulo: "Shapiro ou Kolmogorov?", valor: "Use Shapiro-Wilk para amostras menores (N < 5000) e Kolmogorov-Smirnov para grandes volumes. Se o P-valor for > 0.05, a porta está aberta para o Pearson!" },
          { tipo: "alerta", valor: "🚨 Se a normalidade falhar, o rigor científico exige o uso do r de Spearman." }
        ]
      },
      {
        id: 4,
        titulo: "Fase 4: A Força da Relação (r de Pearson)",
        conteudo: [
          { tipo: "texto", valor: "O coeficiente 'r' diz o quanto uma variável 'explica' a outra. Ele varia de -1 a +1." },
          { tipo: "formula", valor: "r = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum (x_i - \\bar{x})^2 \\sum (y_i - \\bar{y})^2}}", legenda: "r = 1 (Relação Perfeita), r = 0 (Sem Relação)." }
        ]
      },
      {
        id: 5,
        titulo: "Fase 5: Significância (P < 0.05)",
        conteudo: [
          { tipo: "texto", valor: "Um 'r' alto não vale nada se for fruto do acaso. O P-valor testa a probabilidade de estarmos enganados." },
          { tipo: "alerta", valor: "🚨 REGRA: Só aceitamos a correlação se o P-valor for menor que 0.05. Isso significa que temos 95% de certeza que a relação é real." }
        ]
      },
      {
        id: 6,
        titulo: "Missão no Canvas Lab",
        conteudo: [
          { tipo: "missao", valor: "Sua jornada: \n1. Carregar Base \n2. Ver Dispersão \n3. Testar Normalidade \n4. Calcular Pearson \n5. Validar P-valor." }
        ]
      }
    ]
  },
  'trilha-associacao-chi2': {
    titulo: "Desafio: Desigualdade Digital (Qui-Quadrado)",
    fases: [
      {
        id: 1,
        titulo: "Fase 1: O Questionamento PBL",
        conteudo: [
          { tipo: "missao", valor: "QUESTÃO: O acesso à internet depende do tipo de escola (Pública ou Privada)?" },
          { tipo: "texto", valor: "Aqui não lidamos com notas (números), mas com Categorias (Sim/Não, Pública/Privada). Queremos saber se esses grupos estão 'amarrados' entre si." }
        ]
      },
      {
        id: 2,
        titulo: "Fase 2: A Tabela de Contingência",
        conteudo: [
          { tipo: "texto", valor: "Para ver a associação, cruzamos os dados em uma tabela de dupla entrada." },
          { tipo: "conceito", titulo: "Frequência Observada", valor: "É a contagem real: quantos alunos da pública NÃO têm internet? Se esse número for muito alto em relação ao esperado, há associação." }
        ]
      },
      {
        id: 3,
        titulo: "Fase 3: O Teste Qui-Quadrado (χ²)",
        conteudo: [
          { tipo: "texto", valor: "O Qui-Quadrado mede a distância entre a realidade e o que seria esperado se não houvesse relação nenhuma." },
          { tipo: "formula", valor: "\\chi^2 = \\sum \\frac{(O_i - E_i)^2}{E_i}", legenda: "O = Observado, E = Esperado." }
        ]
      },
      {
        id: 4,
        titulo: "Fase 4: Intensidade (V de Cramer)",
        conteudo: [
          { tipo: "texto", valor: "Diferente da comparação de médias, o Qui-Quadrado não diz se a relação é forte. Para isso, usamos o V de Cramer." },
          { tipo: "conceito", titulo: "Interpretando o V", valor: "0.1 (Fraco), 0.3 (Moderado), > 0.5 (Forte). No ENEM, você encontrará associações que são reais (P < 0.05) mas podem ter intensidades variadas." }
        ]
      },
      {
        id: 5,
        titulo: "Missão no Canvas Lab",
        conteudo: [
          { tipo: "missao", valor: "Sua jornada: \n1. Carregar Base \n2. Rodar Qui-Quadrado \n3. Analisar Tabela Visual \n4. Calcular Magnitude com V de Cramer." }
        ]
      }
    ]
  },
  'trilha-engenharia': {
    titulo: "Engenharia de Atributos: O Poder da Transformação",
    fases: [
      {
        id: 1,
        titulo: "Fase 1: Além dos Dados Brutos",
        conteudo: [
          { tipo: "missao", valor: "QUESTÃO PBL: Como converter o desempenho individual em indicadores de impacto para o governo?" },
          { tipo: "texto", valor: "Um Engenheiro de Dados não apenas limpa; ele cria inteligência. Muitas vezes, a resposta que buscamos não está nos dados originais, mas em uma combinação deles." },
          { tipo: "conceito", titulo: "Engenharia de Atributos", valor: "É o processo de criar novas variáveis (colunas) para destacar padrões. Ex: Em vez de olhar apenas idade, olhar para 'Gerações'." }
        ]
      },
      {
        id: 2,
        titulo: "Fase 2: O Peso da Verdade (Média Ponderada)",
        conteudo: [
          { tipo: "texto", valor: "No ENEM, cada universidade dá pesos diferentes. Se quisermos criar um 'Score de Humanas', a Redação deve valer mais que a Matemática." },
          { tipo: "formula", valor: "Nota_{Final} = \\frac{(Mat \\times P_1) + (Red \\times P_2)}{P_1 + P_2}", legenda: "Onde P representa o peso de cada matéria." },
          { tipo: "dica", valor: "💡 Use pesos maiores para a matéria que você considera mais decisiva na sua pesquisa." }
        ]
      },
      {
        id: 3,
        titulo: "Fase 3: Agrupando para Entender (Binning)",
        conteudo: [
          { tipo: "texto", valor: "Analisar idades individuais (17, 18, 19...) pode ser confuso. É mais poderoso comparar grupos sociais como 'Jovens Estudantes' vs 'Adultos em Requalificação'." },
          { tipo: "conceito", titulo: "Binning (Categorização)", valor: "Transforma variáveis contínuas (números) em categorias discretas (texto). Isso reduz o ruído e facilita a criação de gráficos de barras." }
        ]
      },
      {
        id: 4,
        titulo: "Fase 4: Falando a Mesma Língua (Normalização)",
        conteudo: [
          { tipo: "texto", valor: "Como comparar uma prova de 0 a 1000 com uma de 0 a 10? A Normalização Min-Max 'esmaga' os dados para a escala 0 a 1." },
          { tipo: "formula", valor: "X_{norm} = \\frac{x - min(X)}{max(x) - min(X)}", legenda: "Isso garante que nenhuma variável domine a outra por ter números maiores." },
          { tipo: "alerta", valor: "🚨 A normalização é obrigatória se você for usar modelos de Inteligência Artificial futuramente!" }
        ]
      },
      {
        id: 5,
        titulo: "Missão Final no Pipeline",
        conteudo: [
          { tipo: "missao", valor: "Sua jornada de Engenharia: \n1. Gere a NOTA_FINAL com pesos customizados \n2. Transforme a IDADE em FAIXA_ETARIA \n3. Crie uma versão NORMALIZADA das suas notas para futura IA." }
        ]
      }
    ]
  },
  'trilha-amostragem': {
    titulo: "Técnicas de Amostragem: O Atalho Científico",
    fases: [
      {
        id: 1,
        titulo: "Fase 1: O Labirinto do Big Data",
        conteudo: [
          { tipo: "missao", valor: "QUESTÃO PBL: Como pesquisar uma população de 4 milhões usando apenas 500 registros sem perder a verdade?" },
          { tipo: "texto", valor: "Processar o ENEM inteiro trava computadores comuns. A solução é a AMOSTRAGEM: extrair uma parte que 'copia' o comportamento do todo." }
        ]
      },
      {
        id: 2,
        titulo: "Fase 2: O Sorteio Puro (Amostra Aleatória)",
        conteudo: [
          { tipo: "texto", valor: "É como um sorteio. Pegamos 500 nomes ao acaso. É rápido, mas perigoso se grupos minoritários (como indígenas ou idosos) ficarem de fora por sorte." }
        ]
      },
      {
        id: 3,
        titulo: "Fase 3: O Espelho da Realidade (Amostragem Estratificada)",
        conteudo: [
          { tipo: "texto", valor: "Se 80% do Brasil usa escola pública, sua amostra DEVE ter 80% de escola pública. A estratificação divide a base em 'fatias' antes de sortear." },
          { tipo: "conceito", titulo: "Estratificação", valor: "Garante que a proporção das categorias na amostra seja idêntica à da população original." },
          { tipo: "alerta", valor: "🚨 Sem estratificação, seus resultados podem sofrer VIÉS e levar a conclusões erradas sobre a sociedade." }
        ]
      },
      {
        id: 4,
        titulo: "Missão Final no Pipeline",
        conteudo: [
          { tipo: "missao", valor: "Sua jornada de Amostragem: \n1. Extraia uma fatia aleatória da base de 50k \n2. Refine usando Estratificação por Tipo de Escola \n3. Prove que a amostra representa bem a base gigante." }
        ]
      }
    ]
  },
  'trilha-limpeza': {
    titulo: "Limpeza de Microdados",
    fases: [
      {
        id: 1,
        titulo: "Fase 1: O Garimpo de Dados",
        conteudo: [
          { tipo: "missao", valor: "QUESTÃO PBL: Quanto do seu resultado final é 'ruído' causado por dados mal preenchidos?" },
          { tipo: "texto", valor: "Bases de dados reais são sujas: têm nulos, erros de digitação e candidatos que nem foram fazer a prova. Analisar dados sujos é como construir uma casa na areia." }
        ]
      },
      {
        id: 2,
        titulo: "Fase 2: A Cirurgia dos Nulos",
        conteudo: [
          { tipo: "conceito", titulo: "Remover vs Imputação", valor: "Remover joga dados fora. Imputar preenche os vazios com a Média. Qual o impacto disso na sua confiança estatística?" },
          { tipo: "dica", valor: "💡 Só remova se a informação faltante for o coração da sua pesquisa (como a Nota)." }
        ]
      },
      {
        id: 3,
        titulo: "Fase 3: O Mistério das Datas e Moedas",
        conteudo: [
          { tipo: "texto", valor: "O computador não entende 'R$ 1.000' ou '12/05/23' como números. A Padronização converte esses textos para formatos que permitem cálculos matemáticos." }
        ]
      },
      {
        id: 4,
        titulo: "Missão Final no Pipeline",
        conteudo: [
          { tipo: "missao", valor: "Sua jornada de Curadoria: \n1. Elimine os candidatos ausentes \n2. Limpe os nulos e duplicatas \n3. Padronize a Renda para formato numérico para permitir médias futuras." }
        ]
      }
    ]
  }
};
