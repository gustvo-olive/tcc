export const MODULOS = [
  { id: 1, titulo: 'Módulo 1: Curadoria e Tratamento', desc: 'Limpeza e preparação de dados.', icone: '🧹', cor: '#0ea5e9', status: 'Em breve' },
  { id: 2, titulo: 'Módulo 2: Análise Inferencial', desc: 'Investigue hipóteses educacionais com rigor estatístico.', icone: '📈', cor: '#6366f1', status: 'Ativo' },
  { id: 3, titulo: 'Módulo 3: Modelagem e Predição', desc: 'Machine Learning aplicado ao ENEM.', icone: '🤖', cor: '#8b5cf6', status: 'Em breve' }
];

export const TRILHAS_MODULO_2 = [
  { 
    id: 'trilha-multiplos-grupos', 
    titulo: 'Comparação de Múltiplos Grupos', 
    desc: 'Escola Pública vs Privada vs Federal: quem ganha na nota? Aprenda o fluxo completo de ANOVA e Kruskal-Wallis.',
    icone: '🏫',
    objetivo: 'Dominar o pipeline de comparação de 3 ou mais amostras.'
  },
  { 
    id: 'trilha-dois-grupos', 
    titulo: 'Comparação de Dois Grupos', 
    desc: 'Homens vs Mulheres ou Cotistas vs Não-Cotistas. Domine Teste T e Mann-Whitney.',
    icone: '⚖️',
    objetivo: 'Aprender a investigar diferenças entre duas realidades.'
  },
  { 
    id: 'trilha-associacao', 
    titulo: 'Relações e Associações', 
    desc: 'A renda afeta a nota? O tipo de escola afeta a escolha da língua? Explore Correlação e Qui-Quadrado.',
    icone: '🔗',
    objetivo: 'Entender como variáveis se influenciam.'
  }
];

export const UI_STYLES = {
  btnStyle: { padding: '8px 12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', fontWeight: '600', color: '#334155', fontSize: '12px' },
  ctrlBtnStyle: { width: '40px', height: '40px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
};
