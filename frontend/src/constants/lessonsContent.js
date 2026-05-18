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
          { tipo: "conceito", titulo: "Normalidade (N < 5000)", valor: "Use o Teste de Shapiro-Wilk. Ele verifica se os dados de cada grupo seguem a distribuição normal." },
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
    titulo: "Desafio 1: Renda vs Desempenho (Pearson)",
    fases: [
      {
        id: 1,
        titulo: "O Questionamento PBL",
        conteudo: [
          { tipo: "missao", valor: "QUESTÃO: Existe uma relação linear entre a Renda Familiar do aluno e a sua Nota Final?" },
          { tipo: "texto", valor: "Neste desafio, você deve usar a estatística para provar se, à medida que a renda sobe, a nota também sobe de forma proporcional." }
        ]
      },
      {
        id: 2,
        titulo: "Ferramenta de Escolha: Pearson",
        conteudo: [
          { tipo: "texto", valor: "Como Renda e Nota são valores numéricos contínuos, a ferramenta ideal é o r de Pearson." },
          { tipo: "dica", valor: "💡 Lembre-se: O Pearson exige que as variáveis sigam a distribuição normal. Verifique isso antes!" }
        ]
      },
      {
        id: 3,
        titulo: "Missão no Canvas",
        conteudo: [
          { tipo: "missao", valor: "Sua tarefa: \n1. Carregar a Base de Associação \n2. Testar a Normalidade \n3. Rodar a Correlação de Pearson \n4. Interpretar se o r é positivo e forte." }
        ]
      }
    ]
  },
  'trilha-associacao-chi2': {
    titulo: "Desafio 2: Desigualdade Digital (Qui-Quadrado)",
    fases: [
      {
        id: 1,
        titulo: "O Questionamento PBL",
        conteudo: [
          { tipo: "missao", valor: "QUESTÃO: O acesso à internet depende do tipo de escola (Pública ou Privada)?" },
          { tipo: "texto", valor: "Não estamos falando de notas aqui, mas de CATEGORIAS. Queremos saber se ser de escola privada aumenta as chances de ter internet em casa." }
        ]
      },
      {
        id: 2,
        titulo: "Ferramenta de Escolha: Qui-Quadrado (χ²)",
        conteudo: [
          { tipo: "texto", valor: "Para cruzar duas categorias (Tipo de Escola vs Internet), usamos o teste de Qui-Quadrado e a Tabela de Contingência." },
          { tipo: "conceito", titulo: "V de Cramer", valor: "Não esqueça de calcular o V de Cramer para ver se essa associação é forte ou apenas uma pequena tendência." }
        ]
      },
      {
        id: 3,
        titulo: "Missão no Canvas",
        conteudo: [
          { tipo: "missao", valor: "Sua tarefa: \n1. Carregar a Base de Associação \n2. Adicionar o bloco de Qui-Quadrado \n3. Analisar a Tabela de Contingência no widget \n4. Confirmar a associação com o P-valor < 0.05." }
        ]
      }
    ]
  },
  'trilha-limpeza': {
    titulo: "Limpeza e Curadoria de Dados",
    fases: [
      {
        id: 1,
        titulo: "Fase 1: O Caos dos Microdados",
        conteudo: [
          { tipo: "texto", valor: "O ENEM gera milhões de linhas. Muitas delas estão incompletas ou trazem candidatos que faltaram à prova. Analisar esses dados sem limpeza gera conclusões erradas." },
          { tipo: "alerta", valor: "🚨 Candidatos com nota 'Zero' podem ser apenas faltantes, não necessariamente alunos que não sabem o conteúdo. Precisamos decidir o que fazer com eles!" }
        ]
      },
      {
        id: 2,
        titulo: "Fase 2: Valores Nulos (Missing Data)",
        conteudo: [
          { tipo: "texto", valor: "Em estatística, chamamos dados faltantes de 'NaN' ou 'Null'. No ENEM, isso acontece quando o aluno não preencheu o questionário socioeconômico." },
          { tipo: "conceito", titulo: "Remover vs Imputar", valor: "Você pode apagar a linha (Remover) ou tentar preencher com a média (Imputar). Para o TCC, a remoção criteriosa é o caminho mais seguro." }
        ]
      },
      {
        id: 3,
        titulo: "Fase 3: Missão de Curadoria",
        conteudo: [
          { tipo: "missao", valor: "Sua primeira tarefa de curadoria: \n1. Filtrar apenas candidatos presentes (TP_PRESENCA = 1) \n2. Remover linhas onde a Nota de Matemática é Nula \n3. Exportar a base limpa para o Módulo de Análise." }
        ]
      }
    ]
  }
};
