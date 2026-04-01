export const MODULOS = [
  { 
    id: 1, 
    titulo: 'Módulo 1: Curadoria e Tratamento', 
    desc: 'Aprenda a limpar, transformar e preparar os microdados do ENEM para análise, lidando com valores ausentes e outliers.', 
    icone: '🧹', 
    cor: '#0ea5e9',
    status: 'Em breve'
  },
  { 
    id: 2, 
    titulo: 'Módulo 2: Análise Inferencial', 
    desc: 'Descubra padrões escondidos. Teste hipóteses sobre a educação brasileira usando a estatística de forma visual.', 
    icone: '📈', 
    cor: '#6366f1',
    status: 'Ativo'
  },
  { 
    id: 3, 
    titulo: 'Módulo 3: Modelagem e Predição', 
    desc: 'Use algoritmos de Machine Learning para prever o desempenho dos alunos com base no contexto socioeconômico.', 
    icone: '🤖', 
    cor: '#8b5cf6',
    status: 'Em breve'
  }
];

// Refatorado de "Trilhas" para "Lições" (Foco Pedagógico e Scaffolding)
export const LICOES_MODULO_2 = [
  { 
    id: 1, 
    titulo: '1. Comparando Duas Realidades', 
    desc: 'Introdução ao Teste T. Homens e Mulheres têm o mesmo desempenho no ENEM? Aprenda a comparar as médias de dois grupos.', 
    objetivo: 'Compreender a diferença entre médias e o conceito de significância estatística (p-valor).',
    icone: '⚖️', 
    cor: '#2563eb' 
  },
  { 
    id: 2, 
    titulo: '2. Quando a Curva não é Normal', 
    desc: 'Teste de Mann-Whitney. O que fazer quando os dados não seguem um padrão previsível (distribuição normal)?', 
    objetivo: 'Entender a diferença entre testes paramétricos e não-paramétricos.',
    icone: '📉', 
    cor: '#8b5cf6' 
  },
  { 
    id: 3, 
    titulo: '3. Múltiplos Grupos (Paramétrico)', 
    desc: 'ANOVA. Alunos de escolas públicas, privadas e federais têm médias diferentes?', 
    objetivo: 'Aprender a comparar mais de dois grupos simultaneamente sem perder o rigor estatístico.',
    icone: '🏫', 
    cor: '#10b981' 
  },
  { 
    id: 4, 
    titulo: '4. Relações Categóricas', 
    desc: 'Qui-Quadrado. Existe relação entre o tipo de escola e a escolha de língua estrangeira (Inglês/Espanhol)?', 
    objetivo: 'Analisar variáveis qualitativas e suas associações.',
    icone: '🔠', 
    cor: '#f59e0b' 
  },
  { 
    id: 5, 
    titulo: '5. Força de Associação', 
    desc: 'Correlação de Pearson. Quem tira nota alta em Matemática tende a ir bem em Ciências da Natureza?', 
    objetivo: 'Medir a força e a direção da relação linear entre variáveis contínuas.',
    icone: '🔗', 
    cor: '#ef4444' 
  },
  { 
    id: 6, 
    titulo: '6. Desafio Final: A Influência da Renda', 
    desc: 'Kruskal-Wallis. A renda familiar afeta o desempenho geral no ENEM? Monte o fluxo completo de análise.', 
    objetivo: 'Consolidar o aprendizado em um problema real e complexo, sem apoio direto (redução de scaffolding).',
    icone: '🎓', 
    cor: '#3b82f6',
    isPBL: true // Identifica que esta é uma atividade prática de montagem no Canvas
  }
];

export const UI_STYLES = {
  btnStyle: { padding: '8px 12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', fontWeight: '600', color: '#334155', fontSize: '12px' },
  ctrlBtnStyle: { width: '40px', height: '40px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
};
