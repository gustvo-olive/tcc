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
          { tipo: "missao", valor: "Sua jornada completa: \n1. Carregar Microdados \n2. Boxplot \n3. K-S ou Shapiro (conforme o N) \n4. Se p > 0.05 -> ANOVA + Tukey \n5. Se p < 0.05 -> Kruskal-Wallis + Dunn \n6. Calcular η² ou ε²." }
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
  }
};
