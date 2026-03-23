import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// 1. O Bloco Inicial: A Pergunta Problema (Fixo e inamovível)
const initialNodes = [
  {
    id: 'pergunta-1',
    position: { x: 250, y: 50 },
    data: { label: '🎯 Missão 1: A Renda Familiar (Q006) afeta a Nota de Matemática no ENEM?' },
    type: 'input',
    draggable: false, // Esse bloco nunca se move
    style: { background: '#1e293b', color: 'white', fontWeight: 'bold', width: 400, borderRadius: '8px', padding: '15px', textAlign: 'center' }
  }
];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLocked, setIsLocked] = useState(false);

  // Função para conectar as peças
  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), [setEdges]);

  // Função simplificada para adicionar blocos ao Canvas clicando na Sidebar
  const addBlock = (label, color, tipo = 'default') => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 200 },
      data: { label },
      type: tipo,
      style: { background: color, color: 'white', fontWeight: 'bold', borderRadius: '8px', padding: '10px' }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // Trava ou destrava todos os blocos (menos a pergunta)
  const toggleLock = () => setIsLocked(!isLocked);

  // Simula a validação da hipótese (Backend)
  const submitHypothesis = () => {
    alert("Enviando arquitetura para o Python validar... (Aqui entrará a sua lógica de gamificação/erro)");
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* SIDEBAR DE FERRAMENTAS (O Inventário) */}
      <div style={{ width: '280px', background: '#f8fafc', padding: '20px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a' }}>🛠️ Ferramentas</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Adicione as etapas para responder à pergunta central.</p>
        </div>

        <div style={{ background: '#e2e8f0', height: '1px' }}></div>

        {/* Categoria: Dados */}
        <h4 style={{ margin: '5px 0', color: '#475569' }}>1. Fontes de Dados</h4>
        <button onClick={() => addBlock('📊 Microdados ENEM (Amostra)', '#2563eb')} style={btnStyle}>+ ENEM 2023</button>
        <button onClick={() => addBlock('📊 Censo Escolar', '#3b82f6')} style={btnStyle}>+ Censo Escolar</button>

        {/* Categoria: Testes de Normalidade */}
        <h4 style={{ margin: '5px 0', color: '#475569' }}>2. Suposições (N > 5000)</h4>
        <button onClick={() => addBlock('⚖️ Kolmogorov-Smirnov (Certo)', '#8b5cf6')} style={btnStyle}>+ Kolmogorov-Smirnov</button>
        <button onClick={() => addBlock('⚖️ Shapiro-Wilk (Erro N alto)', '#a855f7')} style={btnStyle}>+ Shapiro-Wilk</button>

        {/* Categoria: Inferência */}
        <h4 style={{ margin: '5px 0', color: '#475569' }}>3. Teste de Hipótese</h4>
        <button onClick={() => addBlock('🧮 Kruskal-Wallis (Não-Param)', '#16a34a')} style={btnStyle}>+ Kruskal-Wallis</button>
        <button onClick={() => addBlock('🧮 ANOVA (Paramétrico)', '#ef4444')} style={btnStyle}>+ ANOVA</button>

        {/* Categoria: Resultados */}
        <h4 style={{ margin: '5px 0', color: '#475569' }}>4. Visualização</h4>
        <button onClick={() => addBlock('🔥 Heatmap (Post-Hoc Dunn)', '#d97706', 'output')} style={btnStyle}>+ Gráfico Heatmap</button>
      </div>

      {/* ÁREA DO CANVAS (Onde a mágica acontece) */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodesDraggable={!isLocked} // A mágica do seu cadeado acontece aqui!
          fitView
        >
          {/* Painel Customizado (Topo Direita) */}
          <Panel position="top-right" style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={toggleLock} 
              style={{ padding: '10px 15px', background: isLocked ? '#ef4444' : '#e2e8f0', color: isLocked ? 'white' : 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isLocked ? '🔒 Destravar Mapa' : '🔓 Travar Mapa'}
            </button>
            <button 
              onClick={submitHypothesis}
              style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              🚀 Validar Hipótese
            </button>
          </Panel>

          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}

// Estilo auxiliar para os botões da Sidebar não poluírem o código principal
const btnStyle = {
  padding: '10px',
  background: 'white',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  cursor: 'pointer',
  textAlign: 'left',
  fontWeight: '500',
  color: '#334155',
  transition: '0.2s'
};