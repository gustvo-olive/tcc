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
        titulo: "Fase 2: Testes de Normalidade (O Tamanho Importa!)",
        conteudo: [
          { tipo: "texto", valor: "Para saber se os dados seguem a 'Curva de Sino', escolhemos o teste baseado no tamanho da sua amostra (N):" },
          { tipo: "conceito", titulo: "Amostras Pequenas (N < 5000)", valor: "Use o Teste de Shapiro-Wilk. Ele é muito sensível e preciso para poucos dados." },
          { tipo: "conceito", titulo: "Amostras Grandes (N ≥ 5000)", valor: "Use o Teste de Kolmogorov-Smirnov (K-S). Como o ENEM tem milhões de dados, este será seu teste padrão na maioria das vezes!" },
          { tipo: "alerta", valor: "🚨 REGRA: Se o P-valor desses testes for menor que 0.05, seus dados NÃO são normais. Isso te obriga a mudar de rota!" }
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
        titulo: "Fase 2: Normalidade e Homocedasticidade",
        conteudo: [
          { tipo: "texto", valor: "Assim como em múltiplos grupos, aqui também temos 'porteiros':" },
          { tipo: "conceito", titulo: "Normalidade (K-S)", valor: "Como o ENEM tem N > 5000, o Kolmogorov-Smirnov dirá se os dados seguem a curva de sino." },
          { tipo: "conceito", titulo: "Variância (Levene)", valor: "O Teste de Levene aqui é crucial para o Teste T. Se as variâncias forem diferentes, usamos uma correção chamada 'Welch'." }
        ]
      },
      {
        id: 3,
        titulo: "Fase 3: T-Student (O Caminho Clássico)",
        conteudo: [
          { tipo: "texto", valor: "Se os seus dados forem NORMAIS, o Teste T para amostras independentes é a escolha ideal. Ele compara as médias dos dois grupos." },
          { tipo: "formula", valor: "t = \\frac{\\bar{x}_1 - \\bar{x}_2}{SE}", legenda: "Mede a distância entre as médias em unidades de erro padrão." }
        ]
      },
      {
        id: 4,
        titulo: "Fase 4: Mann-Whitney U (A Alternativa Robusta)",
        conteudo: [
          { tipo: "texto", valor: "Se a normalidade falhar (comum em Redação ou Matemática), usamos o Mann-Whitney. Ele não olha para a média, mas para quem 'ganha' mais duelos de notas na amostra." },
          { tipo: "dica", valor: "💡 Ele é excelente quando temos notas 'mil' ou 'zero' que puxariam a média para longe da realidade." }
        ]
      },
      {
        id: 5,
        titulo: "Fase 5: Magnitude (d de Cohen)",
        conteudo: [
          { tipo: "texto", valor: "A diferença é estatística, mas é grande? O 'd de Cohen' mede quantas unidades de desvio padrão separam os grupos." },
          { tipo: "conceito", titulo: "Escala de Cohen", valor: "0.2 (Pequeno), 0.5 (Médio), 0.8 (Grande)." }
        ]
      },
      {
        id: 6,
        titulo: "Fase 6: Missão Final",
        conteudo: [
          { tipo: "missao", valor: "DESAFIO: Existe diferença significativa entre a nota de REDAÇÃO de Homens e Mulheres no ENEM 2023?" }
        ]
      }
    ]
  },
  'trilha-associacao': {
    titulo: "Relações e Associações entre Variáveis",
    fases: [
      {
        id: 1,
        titulo: "Fase 1: Caminhando Juntos ou Separados?",
        conteudo: [
          { tipo: "texto", valor: "Diferente da comparação de grupos, aqui buscamos entender como duas variáveis se comportam em conjunto. Existem dois grandes caminhos no ENEM:" },
          { tipo: "conceito", titulo: "Correlação (Numérico vs Numérico)", valor: "Ex: 'Quanto maior a renda familiar, maior a nota de redação?'. Usamos quando as duas variáveis são números contínuos." },
          { tipo: "conceito", titulo: "Associação (Categoria vs Categoria)", valor: "Ex: 'A escolha da Língua Estrangeira (Inglês/Espanhol) depende do Tipo de Escola?'. Usamos para categorias nominais." }
        ]
      },
      {
        id: 2,
        titulo: "Fase 2: Correlação de Pearson (O Caminho Paramétrico)",
        conteudo: [
          { tipo: "texto", valor: "Para variáveis que seguem a distribuição normal, usamos o r de Pearson. Ele mede a força e a direção da relação linear." },
          { tipo: "formula", valor: "r = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum (x_i - \\bar{x})^2 \\sum (y_i - \\bar{y})^2}}", legenda: "r varia de -1 a +1. Próximo de 0 significa 'sem relação'." },
          { tipo: "alerta", valor: "⚠️ IMPORTANTE: Correlação não é Causalidade! Só porque variáveis caminham juntas, não significa que uma CAUSA a outra." }
        ]
      },
      {
        id: 3,
        titulo: "Fase 3: Spearman (Quando a Normalidade Falha)",
        conteudo: [
          { tipo: "texto", valor: "Se os seus dados do ENEM tiverem muitos outliers ou não forem normais, o r de Pearson vai te enganar. Nesse caso, usamos o r de Spearman (Não-Paramétrico)." },
          { tipo: "dica", valor: "💡 O Spearman transforma os valores em rankings (posições) antes de calcular a relação. É muito mais robusto para dados 'bagunçados'." }
        ]
      },
      {
        id: 4,
        titulo: "Fase 4: Qui-Quadrado (A Tabela de Contingência)",
        conteudo: [
          { tipo: "texto", valor: "Para associar categorias (ex: Raça vs Acesso à Internet), montamos uma tabela cruzada e usamos o Teste de Qui-Quadrado ($ \\chi^2 $)." },
          { tipo: "conceito", titulo: "Independência", valor: "O teste verifica se as proporções observadas são muito diferentes das proporções esperadas caso não houvesse relação nenhuma." },
          { tipo: "formula", valor: "\\chi^2 = \\sum \\frac{(O_i - E_i)^2}{E_i}", legenda: "O = Observado, E = Esperado. Se o P-valor < 0.05, as variáveis estão associadas!" }
        ]
      },
      {
        id: 5,
        titulo: "Fase 5: Magnitude (V de Cramer)",
        conteudo: [
          { tipo: "texto", valor: "Assim como na comparação de grupos, o P-valor aqui só diz se a associação existe. Para saber se ela é FORTE, usamos o V de Cramer." },
          { tipo: "conceito", titulo: "V de Cramer", valor: "Varia de 0 a 1. \n- < 0.1: Desprezível \n- 0.1 a 0.3: Fraca \n- > 0.5: Forte associação." }
        ]
      },
      {
        id: 6,
        titulo: "Fase 6: Missão Final no Canvas",
        conteudo: [
          { tipo: "missao", valor: "Sua jornada de associação: \n1. Definir as duas variáveis \n2. Se Numéricas -> Testar Normalidade -> Pearson ou Spearman \n3. Se Categorias -> Qui-Quadrado \n4. Calcular a Magnitude (r ou V de Cramer)." }
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


