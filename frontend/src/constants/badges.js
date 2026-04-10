// Definição central de todos os badges da plataforma
export const BADGES = [
  {
    id: 'primeiro-passo',
    nome: 'Primeiro Passo',
    descricao: 'Acessou uma trilha de estudo pela primeira vez.',
    icone: '🌱',
    raridade: 'comum',
    cor: '#10b981',
  },
  {
    id: 'explorador',
    nome: 'Explorador',
    descricao: 'Abriu o CanvasLab pela primeira vez.',
    icone: '🔍',
    raridade: 'comum',
    cor: '#3b82f6',
  },
  {
    id: 'mestre-normalidade',
    nome: 'Mestre da Normalidade',
    descricao: 'Aplicou um teste de normalidade (Shapiro-Wilk ou K-S) no Canvas.',
    icone: '📊',
    raridade: 'raro',
    cor: '#8b5cf6',
  },
  {
    id: 'cientista',
    nome: 'Cientista de Dados',
    descricao: 'Completou uma análise completa no CanvasLab.',
    icone: '🧪',
    raridade: 'raro',
    cor: '#6366f1',
  },
  {
    id: 'guardiao-rigor',
    nome: 'Guardião do Rigor',
    descricao: 'Obteve nota 80 ou mais na validação do Canvas.',
    icone: '🏛️',
    raridade: 'epico',
    cor: '#f59e0b',
  },
  {
    id: 'completista',
    nome: 'Completista',
    descricao: 'Completou todas as trilhas de um Módulo.',
    icone: '🏆',
    raridade: 'lendario',
    cor: '#ef4444',
  },
];

export const RARIDADE_LABEL = {
  comum: { label: 'Comum', cor: '#64748b' },
  raro: { label: 'Raro', cor: '#6366f1' },
  epico: { label: 'Épico', cor: '#f59e0b' },
  lendario: { label: 'Lendário', cor: '#ef4444' },
};
