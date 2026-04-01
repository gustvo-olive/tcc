export const LESSONS_CONTENT = {
  1: {
    titulo_secao: "O Poder da Diferença: Teste T de Student",
    conteudo: [
      {
        tipo: "texto",
        valor: "Imagine que você quer saber se o gênero do estudante afeta a nota média na Redação do ENEM. Não basta olhar para as médias simples de homens e mulheres e dizer 'uma é maior'. Precisamos saber se essa diferença é estatisticamente real."
      },
      {
        tipo: "hipoteses",
        h0: "Não há diferença real entre as médias (a diferença é fruto do acaso).",
        h1: "Há uma diferença estatisticamente significativa entre os grupos."
      },
      {
        tipo: "conceito",
        titulo: "O que é o P-Valor?",
        valor: "É a probabilidade de estarmos errados ao dizer que os grupos são diferentes. Se p < 0.05, aceitamos a H1 (Diferença real)."
      },
      {
        tipo: "alerta",
        valor: "🔍 ANTES DE TESTAR: Seus dados devem ser 'Normais'. Use o Teste de Shapiro-Wilk no Canvas para verificar se o histograma parece um sino."
      },
      {
        tipo: "conceito",
        titulo: "Tamanho do Efeito (Cohen's d)",
        valor: "O p-valor diz 'SE' há diferença. O Tamanho do Efeito diz 'O QUANTO' essa diferença é importante na vida real. Um efeito de 0.2 é pequeno; 0.8 é grande!"
      },
      {
        tipo: "missao",
        valor: "Sua missão: Comparar médias de Redação entre gêneros (Masculino vs Feminino)."
      }
    ]
  },
  2: {
    titulo_secao: "Análise sem Distribuição: Mann-Whitney",
    conteudo: [
      {
        tipo: "texto",
        valor: "Quando os dados não seguem uma curva normal (estão muito 'tortos'), o Teste T não funciona bem. É aqui que entra o Mann-Whitney."
      },
      {
        tipo: "conceito",
        titulo: "Por que usar testes não-paramétricos?",
        valor: "Diferente do Teste T, o Mann-Whitney não olha para a média bruta, mas para o 'ranking' (quem tirou a maior nota, a segunda maior, etc). Isso protege sua análise contra valores extremos (outliers)."
      },
      {
        tipo: "dica",
        valor: "💡 Use este teste quando o seu Histograma mostrar notas muito concentradas em um extremo (muitos zeros ou muitos mil)."
      }
    ]
  },
  3: {
    titulo_secao: "Comparando Três ou Mais Mundos: ANOVA",
    conteudo: [
      {
        tipo: "texto",
        valor: "E se quisermos comparar o desempenho de alunos de 3 tipos de escola: Pública, Privada e Federal? Se fizermos vários Testes T (Pública vs Privada, Privada vs Federal...), aumentamos a chance de erro. A ANOVA resolve isso de uma vez."
      },
      {
        tipo: "hipoteses",
        h0: "Todas as médias são iguais entre os tipos de escola.",
        h1: "Pelo menos um tipo de escola tem uma média diferente dos outros."
      },
      {
        tipo: "conceito",
        titulo: "O que é Post-Hoc (Tukey)?",
        valor: "Se a ANOVA der p < 0.05, ela diz: 'Alguém é diferente'. O Teste Post-Hoc de Tukey é como um VAR no futebol: ele analisa dupla por dupla para nos dizer EXATAMENTE quem é o diferente."
      },
      {
        tipo: "alerta",
        valor: "📊 Tamanho do Efeito: Na ANOVA, usamos o 'Eta Quadrado' (η²) para medir a força dessa diferença."
      }
    ]
  },
  4: {
    titulo_secao: "Relações Categóricas: Qui-Quadrado",
    conteudo: [
      {
        tipo: "texto",
        valor: "Aqui não comparamos médias, mas frequências (contagens). Por exemplo: 'A escolha da língua estrangeira (Inglês ou Espanhol) depende do tipo de escola?'"
      },
      {
        tipo: "conceito",
        titulo: "Tabelas de Contingência",
        valor: "O Qui-Quadrado compara o que 'observamos' na realidade com o que seria 'esperado' se não houvesse relação nenhuma entre as variáveis."
      },
      {
        tipo: "hipoteses",
        h0: "As variáveis são independentes (não há relação).",
        h1: "As variáveis estão associadas (há uma relação)."
      }
    ]
  },
  5: {
    titulo_secao: "Força de Associação: Correlação",
    conteudo: [
      {
        tipo: "texto",
        valor: "Quanto mais um aluno tira em Matemática, mais ele tira em Ciências da Natureza? A correlação mede essa 'sintonia' entre as notas."
      },
      {
        tipo: "conceito",
        titulo: "O Coeficiente 'r' de Pearson",
        valor: "Varia de -1 a 1. \n- Próximo de 1: Quando uma nota sobe, a outra sobe também. \n- Próximo de -1: Quando uma sobe, a outra desce. \n- Zero: Não há relação."
      },
      {
        tipo: "dica",
        valor: "⚡ CUIDADO: Correlação não é causalidade! Duas notas podem estar correlacionadas, mas isso não significa que uma 'causou' a outra."
      }
    ]
  },
  6: {
    titulo_secao: "Desafio Integrador: O Peso da Renda",
    conteudo: [
      {
        tipo: "texto",
        valor: "Agora você vai usar o Kruskal-Wallis para analisar a Renda Familiar. Como a renda é dividida em muitas classes (A, B, C...) e as notas raramente são normais, este é o teste perfeito."
      },
      {
        tipo: "conceito",
        titulo: "Post-Hoc de Dunn",
        valor: "Como o Kruskal-Wallis é não-paramétrico, o Post-Hoc usado é o de Dunn. Ele vai te mostrar se a diferença real está entre a Classe A e a Classe E, ou se a Classe B e C são parecidas."
      },
      {
        tipo: "missao",
        valor: "Monte o fluxo: Dados ENEM -> Teste de Normalidade -> Kruskal-Wallis -> Post-Hoc de Dunn -> Heatmap de Diferenças."
      }
    ]
  }
};
