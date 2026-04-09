export const MISSOES = {
  1: {
    titulo: "Missão 1: O Primeiro Contato",
    passos: [
      {
        id: 1,
        instrucao: "Toda análise começa pelos dados. Adicione o bloco 'Base ENEM 2023' ao Canvas clicando no botão da barra lateral.",
        condicao: (nodes, edges) => nodes.some(n => n.data?.label === "📊 Microdados ENEM")
      },
      {
        id: 2,
        instrucao: "Ótimo! Nosso banco de dados está na mesa. Agora, adicione o bloco 'Contar Amostras (N)' para sabermos o tamanho da nossa amostra.",
        condicao: (nodes, edges) => nodes.some(n => n.data?.label === "🧮 Contar Amostras (N)")
      },
      {
        id: 3,
        instrucao: "Ligue o bloco da Base ENEM ao bloco de Contar Amostras. (Arraste uma linha do ponto do primeiro bloco para o segundo).",
        condicao: (nodes, edges) => {
           const temBase = nodes.find(n => n.data?.label === "📊 Microdados ENEM");
           const temContagem = nodes.find(n => n.data?.label === "🧮 Contar Amostras (N)");
           if(!temBase || !temContagem) return false;
           // Valida se há um edge ligando os dois
           return edges.some(e => e.source === temBase.id && e.target === temContagem.id);
        }
      },
      {
        id: 4,
        instrucao: "Excelente! Adicione e conecte a Condição 'N > 5000?' ao fluxo. Isso ajudará a decidir o teste futuro.",
        condicao: (nodes, edges) => nodes.some(n => n.data?.label === "N > 5000?")
      }
    ]
  },
  2: {
    titulo: "Missão 2: Testes de Normalidade",
    passos: [
      {
        id: 1,
        instrucao: "Adicione a Condição 'É Normal?' ao fluxo e o teste 'Kolmogorov-Smirnov' (Pois temos muitas amostras no ENEM!).",
        condicao: (nodes, edges) => nodes.some(n => n.data?.label === "É Normal?") && nodes.some(n => n.data?.label === "⚖️ Kolmogorov (N Alto)")
      }
    ]
  },
  3: {
    titulo: "Missão 3: Inferência Direta",
    passos: [
      {
        id: 1,
        instrucao: "Na lição 3 vimos sobre múltiplos grupos. O ENEM não é normal. Tente adicionar o teste 'Kruskal-Wallis'.",
        condicao: (nodes, edges) => nodes.some(n => n.data?.label === "🧮 Kruskal-Wallis")
      }
    ]
  }
};
