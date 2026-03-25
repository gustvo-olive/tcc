import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Background,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  useReactFlow, // Importamos a ferramenta que controla a câmera!
  ReactFlowProvider // Necessário para a câmera funcionar
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ==========================================
// 1. NÓ: LOSANGO (AGORA COM SIM E NÃO!)
// ==========================================
const ConditionNode = ({ data }) => {
  return (
    <div style={{ width: 100, height: 100, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* ENTRADA */}
      <Handle type="target" position={Position.Top} id="top" style={{ background: '#333', width: '10px', height: '10px' }} />
      
      {/* SAÍDA ESQUERDA (NÃO) - Bolinha vermelha */}
      <Handle type="source" position={Position.Left} id="nao" style={{ background: '#ef4444', width: '12px', height: '12px', left: '-6px' }} />
      <div style={{ position: 'absolute', left: '-30px', color: '#ef4444', fontWeight: 'bold', fontSize: '13px', textShadow: '1px 1px 0 #fff' }}>Não</div>

      {/* SAÍDA DIREITA (SIM) - Bolinha verde */}
      <Handle type="source" position={Position.Right} id="sim" style={{ background: '#10b981', width: '12px', height: '12px', right: '-6px' }} />
      <div style={{ position: 'absolute', right: '-30px', color: '#10b981', fontWeight: 'bold', fontSize: '13px', textShadow: '1px 1px 0 #fff' }}>Sim</div>

      {/* SAÍDA BAIXO (Neutro) */}
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: '#333', width: '10px', height: '10px' }} />

      {/* FORMATO DO LOSANGO */}
      <div style={{ position: 'absolute', width: '80%', height: '80%', background: '#eab308', transform: 'rotate(45deg)', borderRadius: '8px', zIndex: -1, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}></div>
      <div style={{ color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '11px', zIndex: 1, padding: '5px' }}>{data.label}</div>
    </div>
  );
};

// ==========================================
// 2. NÓ: OVAL (FIM DA LINHA)
// ==========================================
const EndNode = ({ data }) => {
  return (
    <div style={{ padding: '10px 20px', background: data.color || '#ef4444', color: 'white', fontWeight: 'bold', borderRadius: '50px', textAlign: 'center', border: '2px solid rgba(0,0,0,0.2)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', minWidth: '120px', fontSize: '13px' }}>
      <Handle type="target" position={Position.Top} style={{ background: '#333', width: '10px', height: '10px' }} />
      {data.label}
    </div>
  );
};

// ==========================================
// 3. CONTROLES DE CÂMERA ( )
// ==========================================
const CustomControls = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow(); // Pegamos os controles reais
  return (
    <Panel position="bottom-left" style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '15px' }}>
      <button onClick={() => zoomIn({ duration: 300 })} style={ctrlBtnStyle} title="Aproximar">➕</button>
      <button onClick={() => zoomOut({ duration: 300 })} style={ctrlBtnStyle} title="Afastar">➖</button>
      <button onClick={() => fitView({ duration: 300 })} style={ctrlBtnStyle} title="Centralizar Mapa">🗺️</button>
    </Panel>
  );
};

// ==========================================
// 4. A APLICAÇÃO PRINCIPAL
// ==========================================
const initialNodes = [
  { id: 'pergunta-1', position: { x: 250, y: 30 }, data: { label: '🎯 Missão 1: A Renda Familiar afeta a Nota do ENEM?' }, type: 'input', draggable: false, style: { background: '#1e293b', color: 'white', fontWeight: 'bold', width: 400, borderRadius: '8px', padding: '15px', textAlign: 'center' } }
];

function FlowDesigner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLocked, setIsLocked] = useState(false);

  const nodeTypes = useMemo(() => ({ condition: ConditionNode, end: EndNode }), []);
  
  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { strokeWidth: 2, stroke: '#64748b' } }, eds)), [setEdges]);

  // Esta é a função que conserta o bug de apagar blocos!
  const addBlock = (label, color, tipo = 'default') => {
    const newNode = {
      id: `node-${Date.now()}`, 
      position: { x: Math.random() * 100 + 150, y: Math.random() * 100 + 150 },
      data: { label, color },
      type: tipo,
      style: (tipo === 'default') ? { background: color, color: 'white', fontWeight: 'bold', borderRadius: '8px', padding: '10px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px' } : undefined
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const submitHypothesis = async () => {
    // 1. Empacotamos o estado atual do Grafo (Nós na tela e Linhas conectadas)
    const payloadParaPython = {
      elementos: nodes.map(n => ({ id: n.id, nome: n.data.label, tipo: n.type })),
      conexoes: edges.map(e => ({ 
        origem_id: e.source, 
        saida_utilizada: e.sourceHandle, // Diz se saiu do 'sim', 'nao' ou 'bottom'
        destino_id: e.target 
      }))
    };

    console.log("📦 Pacote pronto para envio:", payloadParaPython);
    
    // Alerta temporário apenas para você saber que a função rodou
    alert("Grafo compilado! Abra o Console (F12) para ver o JSON que será enviado para o FastAPI em Python.");

    /* ============= ÁREA DE COMUNICAÇÃO COM O BACK-END =============
    Quando a sua API estiver pronta, o código acima será substituído por algo assim:

    try {
      const response = await fetch('http://localhost:8000/api/avaliar-trilha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadParaPython)
      });
      const resultado = await response.json();
      
      // Recebe a nota e o Feedback do Python e mostra na tela
      alert(resultado.feedback_guiado); 
      atualizarXP(resultado.xp_ganho);
      
    } catch (error) {
      console.error("Erro ao conectar com o Python:", error);
    }
    ==============================================================
    */
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '320px', background: '#f8fafc', padding: '15px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px' }}>🛠️ Ferramentas</h2>
          <p style={{ fontSize: '12px', color: '#64748b' }}>Construa a lógica visual da análise.</p>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '2px 0' }} />

        {/* 1. DADOS E EXPLORAÇÃO */}
        <h4 style={{ margin: '0', color: '#475569', fontSize: '13px' }}>1. Exploração (EDA)</h4>
        <button onClick={() => addBlock('📊 Microdados ENEM', '#2563eb')} style={btnStyle}>+ Base ENEM 2023</button>
        <button onClick={() => addBlock('👁️ Ver Tabela (Head)', '#0891b2')} style={btnStyle}>+ Visualizar Tabela</button>
        <button onClick={() => addBlock('🧮 Contar Amostras (N)', '#0891b2')} style={btnStyle}>+ Descobrir "N"</button>
        <button onClick={() => addBlock('📉 Histograma', '#0891b2')} style={btnStyle}>+ Ver Distribuição</button>
        <button onClick={() => addBlock('N > 5000?', '#eab308', 'condition')} style={btnStyle}>+ Condição: N &gt; 5000?</button>

        {/* 2. PREMISSAS (NORMALIDADE) */}
        <h4 style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '13px' }}>2. Testes de Normalidade</h4>
        <button onClick={() => addBlock('É Normal?', '#eab308', 'condition')} style={btnStyle}>+ Condição: É Normal?</button>
        <button onClick={() => addBlock('⚖️ Kolmogorov (N Alto)', '#8b5cf6')} style={btnStyle}>+ Kolmogorov-Smirnov</button>
        <button onClick={() => addBlock('⚖️ Shapiro (N Baixo)', '#a855f7')} style={btnStyle}>+ Shapiro-Wilk</button>

        {/* 3. INFERÊNCIA */}
        <h4 style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '13px' }}>3. Inferência (Testes Globais)</h4>
        <button onClick={() => addBlock('A Curva é Normal?', '#eab308', 'condition')} style={btnStyle}>+ Condição: É Normal?</button>
        <button onClick={() => addBlock('🧮 ANOVA (Paramétrico)', '#ef4444')} style={btnStyle}>+ ANOVA (Paramétrico)</button>
        <button onClick={() => addBlock('🧮 Kruskal-Wallis', '#16a34a')} style={btnStyle}>+ Kruskal-Wallis</button>

        {/* 4. SIGNIFICÂNCIA */}
        <h4 style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '13px' }}>4. Avaliação de Significância</h4>
        <button onClick={() => addBlock('P-valor < 0.05?', '#eab308', 'condition')} style={btnStyle}>+ Condição: P-valor &lt; 0.05?</button>

        {/* 5. TAMANHO DO EFEITO */}
        <h4 style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '13px' }}>5. Tamanho do Efeito (Força)</h4>
        <button onClick={() => addBlock('📏 Epsilon² (Kruskal)', '#0f766e')} style={btnStyle}>+ Epsilon² (Kruskal-Wallis)</button>
        <button onClick={() => addBlock('📏 Eta² (ANOVA)', '#0f766e')} style={btnStyle}>+ Eta² (ANOVA)</button>

        {/* 6. POST-HOC */}
        <h4 style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '13px' }}>6. Post-Hoc (Quem é diferente?)</h4>
        <button onClick={() => addBlock('🔥 Heatmap de Dunn', '#d97706')} style={btnStyle}>+ Post-Hoc de Dunn</button>
        <button onClick={() => addBlock('📊 Post-Hoc de Tukey', '#d97706')} style={btnStyle}>+ Post-Hoc de Tukey</button>

        {/* 7. CONCLUSÃO */}
        <h4 style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '13px' }}>7. Conclusão</h4>
        <button onClick={() => addBlock('🛑 Fim: Aceitar H0 (p ≥ 0.05)', '#94a3b8', 'end')} style={btnStyle}>+ Fim: Aceitar H0</button>
        <button onClick={() => addBlock('🏆 Fim: Análise Concluída', '#10b981', 'end')} style={btnStyle}>+ Fim: Sucesso</button>
      </div>

      {/* CANVAS */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} nodesDraggable={!isLocked} fitView>
          <Panel position="top-right" style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setIsLocked(!isLocked)} style={{ padding: '10px 15px', background: isLocked ? '#ef4444' : '#e2e8f0', color: isLocked ? 'white' : 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isLocked ? '🔒 Destravar' : '🔓 Travar'}
            </button>
            <button onClick={submitHypothesis} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              🚀 Validar Hipótese
            </button>
          </Panel>

          {/* Adicionando nossos novos controles no Canvas */}
          <CustomControls />
          
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
          <Background variant="dots" gap={15} size={2} color="#cbd5e1" />
        </ReactFlow>
      </div>
    </div>
  );
}

// Para usar o useReactFlow, toda a aplicação precisa estar envolvida neste Provider!
export default function App() {
  return (
    <ReactFlowProvider>
      <FlowDesigner />
    </ReactFlowProvider>
  );
}

// Estilos dos botões
const btnStyle = { padding: '8px 12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', fontWeight: '600', color: '#334155', fontSize: '12px' };
const ctrlBtnStyle = { width: '40px', height: '40px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };