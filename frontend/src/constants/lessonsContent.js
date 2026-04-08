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
        titulo: "Fase 3: A Bifurcação de Decisão",
        conteudo: [
          { tipo: "texto", valor: "Agora você decide qual 'motor' estatístico vai usar. Existem dois caminhos:" },
          { 
            tipo: "hipoteses", 
            h0: "ROTA A (ANOVA): Use se os dados forem NORMAIS e as variâncias iguais. É o teste mais potente.", 
            h1: "ROTA B (Kruskal-Wallis): Use se a normalidade FALHAR. É o teste mais seguro e robusto." 
          },
          { tipo: "texto", valor: "Ambos testam a mesma coisa: 'Os grupos são diferentes?'. Mas a ANOVA olha para as Médias, enquanto o Kruskal-Wallis olha para os Rankings." }
        ]
      },
      {
        id: 4,
        titulo: "Fase 4: Rota A - ANOVA (Paramétrica)",
        conteudo: [
          { tipo: "texto", valor: "A ANOVA (Análise de Variância) compara se a variação entre os grupos é maior do que a variação 'bagunçada' dentro de cada grupo." },
          { tipo: "formula", valor: "F = \\frac{\\text{Variância Entre Grupos}}{\\text{Variância Dentro dos Grupos}}", legenda: "Se F for alto e P < 0.05, pelo menos um grupo tem média diferente." },
          { tipo: "conceito", titulo: "Post-Hoc de Tukey", valor: "Se a ANOVA der positivo, usamos o Teste de Tukey para comparar os pares (ex: Pública vs Privada) e ver quem é o destaque." }
        ]
      },
      {
        id: 5,
        titulo: "Fase 5: Rota B - Kruskal-Wallis (Não-Paramétrica)",
        conteudo: [
          { tipo: "texto", valor: "Quando os dados do ENEM estão 'tortos' (muitos zeros ou notas mil), a média engana. O Kruskal-Wallis ignora os valores brutos e foca na ordem das notas." },
          { tipo: "conceito", titulo: "Ranking (Postos)", valor: "Imagine colocar todos os alunos em uma fila única. O teste vê se os alunos de escola 'Federal' estão acumulados no fim da fila (notas altas)." },
          { tipo: "conceito", titulo: "Post-Hoc de Dunn", valor: "É o par do Kruskal-Wallis. Usamos o Teste de Dunn para descobrir quais grupos de renda são realmente diferentes entre si." }
        ]
      },
      {
        id: 6,
        titulo: "Fase 6: Tamanho do Efeito (Magnitude)",
        conteudo: [
          { tipo: "texto", valor: "Não basta ser diferente, tem que ser RELEVANTE. O p-valor não diz o tamanho da desigualdade." },
          { tipo: "conceito", titulo: "Eta Quadrado (η²)", valor: "Para ANOVA. Diz quantos % da nota é explicada pelo grupo (ex: 'O tipo de escola explica 20% da nota do aluno')." },
          { tipo: "conceito", titulo: "Epsilon Quadrado (ε²)", valor: "A medida equivalente para o Kruskal-Wallis." }
        ]
      },
      {
        id: 7,
        titulo: "Fase 7: Missão Final no Canvas",
        conteudo: [
          { tipo: "missao", valor: "DESAFIO: O nível de renda impacta o desempenho dos alunos no ENEM 2023?" }
        ]
      }

    ]
  },
  'trilha-dois-grupos': {
    titulo: "Comparação de Dois Grupos",
    fases: [
      {
        id: 1,
        titulo: "Fase 1: Contexto e Hipótese",
        conteudo: [
          { tipo: "texto", valor: "Queremos saber se alunos de diferentes gêneros ou estados têm desempenhos diferentes em uma única prova." },
          { tipo: "hipoteses", h0: "Não há diferença entre os dois grupos.", h1: "Existe uma diferença significativa." }
        ]
      },
      {
        id: 2,
        titulo: "Fase 2: Escolha do Teste",
        conteudo: [
          { tipo: "conceito", titulo: "Teste T vs Mann-Whitney", valor: "Se os dados forem normais, use Teste T (Paramétrico). Se houver muitos valores extremos (outliers), use Mann-Whitney (Não-Paramétrico)." }
        ]
      },
      {
        id: 3,
        titulo: "Fase 3: Execução no Laboratório",
        conteudo: [
          { tipo: "missao", valor: "Sua missão: Comparar a nota de Redação entre Homens e Mulheres.\n1. Carregue os Microdados\n2. Verifique a Normalidade\n3. Escolha entre Teste T ou Mann-Whitney\n4. Interprete o P-Valor." }
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


