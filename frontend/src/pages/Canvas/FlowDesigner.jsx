import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Background,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ConditionNode, EndNode, ToolNode } from '../../components/flow/CustomNodes';
import CustomControls from '../../components/flow/CustomControls';
import { UI_STYLES } from '../../constants/data';
import { TRILHAS_CONTENT } from '../../constants/lessonsContent';
import { enviarGrafoParaProcessamento } from '../../services/api';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';

// --- CONSTANTES FORA DO COMPONENTE PARA ESTABILIDADE ---
const DIC_RENDA_COMPLETO = {
  'A': 'A: Nenhuma Renda', 'B': 'B: Até R$ 998,00', 'C': 'C: R$ 998 - R$ 1.497',
  'D': 'D: R$ 1.497 - R$ 1.996', 'E': 'E: R$ 1.996 - R$ 2.495', 'F': 'F: R$ 2.495 - R$ 2.994',
  'G': 'G: R$ 2.994 - R$ 3.992', 'H': 'H: R$ 3.992 - R$ 4.990', 'I': 'I: R$ 4.990 - R$ 5.988',
  'J': 'J: R$ 5.988 - R$ 6.986', 'K': 'K: R$ 6.986 - R$ 7.984', 'L': 'L: R$ 7.984 - R$ 8.982',
  'M': 'M: R$ 8.982 - R$ 9.980', 'N': 'N: R$ 9.980 - R$ 11.976', 'O': 'O: R$ 11.976 - R$ 14.970',
  'P': 'P: R$ 14.970 - R$ 19.960', 'Q': 'Q: Mais de R$ 19.960'
};

const nodeTypes = { 
  condition: ConditionNode, 
  end: EndNode,
  tool: ToolNode 
};

function FlowDesigner({ licaoId, voltarAoMenu }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [enviando, setEnviando] = useState(false);
  
  const [dadosReais, setDadosReais] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [modalConfig, setModalConfig] = useState({ titulo: '', conteudo: null });

  // Widget para Resultados de Testes Estatísticos
  const WidgetTesteEstatistico = ({ nome, estatistica, pValor, interpretacao, cor }) => (
    <div style={{ padding: '20px', borderLeft: `6px solid ${cor}`, background: '#f8fafc', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>{nome}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Estatística</span>
          <strong style={{ fontSize: '20px', color: '#1e293b' }}>{estatistica}</strong>
        </div>
        <div style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>P-Valor</span>
          <strong style={{ fontSize: '20px', color: parseFloat(pValor) < 0.05 ? '#ef4444' : '#10b981' }}>{pValor}</strong>
        </div>
      </div>
      <div style={{ background: parseFloat(pValor) < 0.05 ? '#fef2f2' : '#f0fdf4', padding: '15px', borderRadius: '8px', border: `1px solid ${parseFloat(pValor) < 0.05 ? '#fee2e2' : '#dcfce7'}` }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}><strong>Resultado:</strong> {interpretacao}</p>
      </div>
    </div>
  );

  // Componente de Boxplot
  const BoxPlotRenda = ({ dados, colunaNota }) => {
    if (!dados || dados.length === 0) return <p>Sem dados.</p>;
    const categoriasENEM = Object.keys(DIC_RENDA_COMPLETO).sort();
    const grupos = {};
    dados.forEach(d => {
      const cat = d['Q006'] || 'Q';
      if (!grupos[cat]) grupos[cat] = [];
      if (d[colunaNota]) grupos[cat].push(d[colunaNota]);
    });

    return (
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ color: '#1e293b', marginBottom: '20px' }}>📊 Distribuição de {colunaNota} por Renda</h4>
        <div style={{ overflowX: 'auto', paddingBottom: '20px' }}>
          <div style={{ minWidth: '850px', height: '300px', position: 'relative', display: 'flex', alignItems: 'flex-end', paddingLeft: '50px', borderLeft: '2px solid #cbd5e1', borderBottom: '2px solid #cbd5e1' }}>
            {[0, 250, 500, 750, 1000].map(val => (
              <div key={val} style={{ position: 'absolute', bottom: `${val * 0.25}px`, left: '-45px', width: '100%', borderTop: '1px dashed #e2e8f0', display: 'flex' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>{val}</span>
              </div>
            ))}
            {categoriasENEM.map(cat => {
              const notas = (grupos[cat] || []).sort((a, b) => a - b);
              if (notas.length === 0) return <div key={cat} style={{ flex: 1 }}></div>;
              const q1 = notas[Math.floor(notas.length * 0.25)];
              const median = notas[Math.floor(notas.length * 0.5)];
              const q3 = notas[Math.floor(notas.length * 0.75)];
              const min = notas[0];
              const max = notas[notas.length - 1];
              return (
                <div key={cat} style={{ flex: 1, height: '100%', position: 'relative', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: '1px', background: '#475569', height: `${(max - min) * 0.25}px`, position: 'absolute', bottom: `${min * 0.25}px` }}></div>
                  <div style={{ width: '25px', background: 'rgba(99, 102, 241, 0.8)', border: '1px solid #4338ca', height: `${(q3 - q1) * 0.25}px`, position: 'absolute', bottom: `${q1 * 0.25}px`, zIndex: 2 }}>
                    <div style={{ width: '100%', height: '2px', background: 'white', position: 'absolute', top: `${(q3 - median) * 0.25}px` }}></div>
                  </div>
                  <div style={{ position: 'absolute', bottom: '-60px', width: '80px', textAlign: 'right', transform: 'rotate(-45deg)', fontSize: '9px' }}>
                    <strong>{cat}</strong>: {DIC_RENDA_COMPLETO[cat].split(':')[1]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const abrirWidget = useCallback((label, dadosAtuais, stats) => {
    let conteudo = null;
    const lowerLabel = label.toLowerCase();

    if (lowerLabel.includes('tabela')) {
      conteudo = <DataTable data={dadosAtuais} />;
    } 
    else if (lowerLabel.includes('distribuição') || lowerLabel.includes('boxplot')) {
      conteudo = <BoxPlotRenda dados={dadosAtuais} colunaNota="NOTA_GERAL" />;
    }
    else if (lowerLabel.includes('shapiro') || lowerLabel.includes('kolmogorov')) {
      conteudo = (
        <WidgetTesteEstatistico 
          nome={stats?.normalidade?.teste || "Teste de Normalidade"}
          estatistica={`W/D = ${stats?.normalidade?.stat || "0.00"}`}
          pValor={stats?.normalidade?.p || 0}
          interpretacao={stats?.normalidade?.p < 0.05 ? "Distribuição Não-Normal. Siga para caminhos não-paramétricos." : "Distribuição Normal. Pode usar ANOVA."}
          cor="#8b5cf6"
        />
      );
    }
    else if (lowerLabel.includes('levene')) {
      conteudo = (
        <WidgetTesteEstatistico 
          nome="Teste de Levene"
          estatistica={`F = ${stats?.levene?.stat || "0.00"}`}
          pValor={stats?.levene?.p || 0}
          interpretacao={stats?.levene?.p < 0.05 ? "Variâncias Heterogêneas." : "Variâncias Homogêneas atendidas!"}
          cor="#f97316"
        />
      );
    }
    else if (lowerLabel.includes('epsilon') || lowerLabel.includes('tamanho')) {
      const e = stats?.epsilon_sq || 0;
      const interpretar = (val) => {
        if (val < 0.01) return { t: "Desprezível", c: "#94a3b8" };
        if (val < 0.08) return { t: "Pequeno", c: "#3b82f6" };
        if (val < 0.26) return { t: "Médio", c: "#f59e0b" };
        return { t: "Grande", c: "#ef4444" };
      };
      const res = interpretar(e);
      conteudo = (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <h3>Tamanho do Efeito (Epsilon²)</h3>
          <div style={{ fontSize: '64px', fontWeight: 'bold', color: res.c, margin: '20px 0' }}>{e.toFixed(4)}</div>
          <div style={{ padding: '10px 25px', background: res.c, color: 'white', borderRadius: '50px', display: 'inline-block', fontWeight: 'bold' }}>Impacto {res.t}</div>
        </div>
      );
    }
    else if (lowerLabel.includes('dunn') || lowerLabel.includes('tukey')) {
      conteudo = (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h3>Post-Hoc: Mapa de Diferenças</h3>
          <div style={{ height: '200px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            [Heatmap de Significância Real]
          </div>
          <p style={{ marginTop: '10px', fontSize: '13px' }}>Cores escuras indicam que os pares de renda são estatisticamente diferentes.</p>
        </div>
      );
    }
    else if (lowerLabel.includes('contar') || lowerLabel.includes('n')) {
      conteudo = (
        <div style={{ textAlign: 'center', padding: '30px' }}>
           <h2 style={{ fontSize: '48px' }}>N = {stats?.n_total?.toLocaleString() || dadosAtuais.length}</h2>
           <p>Alunos analisados em 2023</p>
        </div>
      );
    }

    setModalConfig({ titulo: `Análise: ${label}`, conteudo });
    setModalAberto(true);
  }, []);

  useEffect(() => {
    let textoMissao = '🎯 Missão: Investigue a Hipótese';
    if (licaoId && TRILHAS_CONTENT[licaoId]) {
      const trilha = TRILHAS_CONTENT[licaoId];
      const ultimaFase = trilha.fases[trilha.fases.length - 1];
      const blocoMissao = ultimaFase?.conteudo?.find(c => c.tipo === 'missao');
      textoMissao = blocoMissao ? blocoMissao.valor : `🎯 Missão: ${trilha.titulo}`;
    }

    setNodes([{ 
      id: 'pergunta-1', position: { x: 250, y: 30 }, 
      data: { label: textoMissao, onConfig: () => abrirWidget('Missão', [], null) }, 
      type: 'input', draggable: false, 
      style: { background: '#000000', color: '#ffffff', fontWeight: 'bold', width: 450, borderRadius: '8px', padding: '15px', textAlign: 'center', fontSize: '14px', border: '3px solid #6366f1' } 
    }]);
    setEdges([]);
  }, [licaoId]);

  useEffect(() => {
    if (dadosReais.length > 0 || estatisticas) {
      setNodes((nds) => nds.map((node) => ({
        ...node,
        data: { ...node.data, onConfig: () => abrirWidget(node.data.label || 'Bloco', dadosReais, estatisticas) }
      })));
    }
  }, [dadosReais, estatisticas]);

  const onConnect = useCallback((params) => 
    setEdges((eds) => addEdge({ ...params, animated: true, style: { strokeWidth: 2, stroke: '#64748b' } }, eds)), 
    [setEdges]
  );

  const addBlock = (label, color, tipo = 'default', icon = '⚙️') => {
    const newNode = {
      id: `node-${Date.now()}`, 
      position: { x: Math.random() * 100 + 150, y: Math.random() * 100 + 150 },
      data: { label, color, icon, onConfig: () => abrirWidget(label, dadosReais, estatisticas) },
      type: tipo,
      style: (tipo === 'default') ? { background: color, color: 'white', fontWeight: 'bold', borderRadius: '8px', padding: '10px', fontSize: '13px' } : undefined
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const submitHypothesis = async () => {
    setEnviando(true);
    try {
      const response = await enviarGrafoParaProcessamento(nodes, edges);
      if (response.preview) {
        setDadosReais(response.preview);
        setEstatisticas(response.estatisticas);
        alert("✅ Análise concluída com sucesso!");
      }
    } catch (error) {
      alert("Erro ao conectar com o motor estatístico.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* SIDEBAR COMPLETA RESTAURADA */}
      <div style={{ width: '320px', background: '#f8fafc', padding: '15px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
        <button onClick={voltarAoMenu} style={{ padding: '10px', background: '#e2e8f0', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>⬅ Voltar</button>
        
        <h4 style={{ margin: '0', color: '#475569', fontSize: '12px' }}>1. EXPLORAÇÃO (EDA)</h4>
        <button onClick={() => addBlock('📊 Microdados ENEM', '#2563eb', 'tool', '📊')} style={UI_STYLES.btnStyle}>+ Base ENEM 2023</button>
        <button onClick={() => addBlock('👁️ Ver Tabela', '#0891b2', 'tool', '👁️')} style={UI_STYLES.btnStyle}>+ Visualizar Tabela</button>
        <button onClick={() => addBlock('🧮 Contar N', '#0891b2', 'tool', '🔢')} style={UI_STYLES.btnStyle}>+ Descobrir "N"</button>
        <button onClick={() => addBlock('📉 Boxplot de Renda', '#0891b2', 'tool', '📈')} style={UI_STYLES.btnStyle}>+ Ver Distribuição</button>
        <button onClick={() => addBlock('N > 5000?', '#eab308', 'condition')} style={UI_STYLES.btnStyle}>+ Condição: N &gt; 5000?</button>

        <h4 style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '12px' }}>2. PRESSUPOSTOS</h4>
        <button onClick={() => addBlock('⚖️ Teste de Levene', '#f97316', 'tool', '⚖️')} style={UI_STYLES.btnStyle}>+ Teste de Levene</button>
        <button onClick={() => addBlock('⚖️ Kolmogorov-Smirnov', '#8b5cf6', 'tool', '📊')} style={UI_STYLES.btnStyle}>+ Kolmogorov-Smirnov</button>
        <button onClick={() => addBlock('⚖️ Shapiro-Wilk', '#a855f7', 'tool', '📈')} style={UI_STYLES.btnStyle}>+ Shapiro-Wilk</button>

        <h4 style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '12px' }}>3. INFERÊNCIA</h4>
        <button onClick={() => addBlock('É Normal?', '#eab308', 'condition')} style={UI_STYLES.btnStyle}>+ Condição: É Normal?</button>
        <button onClick={() => addBlock('🧮 ANOVA', '#ef4444', 'tool', '🧮')} style={UI_STYLES.btnStyle}>+ ANOVA</button>
        <button onClick={() => addBlock('🧮 Kruskal-Wallis', '#16a34a', 'tool', '📉')} style={UI_STYLES.btnStyle}>+ Kruskal-Wallis</button>

        <h4 style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '12px' }}>4. SIGNIFICÂNCIA</h4>
        <button onClick={() => addBlock('P < 0.05?', '#eab308', 'condition')} style={UI_STYLES.btnStyle}>+ Condição: P-valor &lt; 0.05?</button>

        <h4 style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '12px' }}>5. TAMANHO DO EFEITO</h4>
        <button onClick={() => addBlock('📏 Epsilon²', '#0f766e', 'tool', '📏')} style={UI_STYLES.btnStyle}>+ Epsilon-Squared</button>
        <button onClick={() => addBlock('📏 Eta²', '#0f766e', 'tool', '📏')} style={UI_STYLES.btnStyle}>+ Eta-Squared</button>

        <h4 style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '12px' }}>6. POST-HOC</h4>
        <button onClick={() => addBlock('🔥 Heatmap de Dunn', '#d97706', 'tool', '🔥')} style={UI_STYLES.btnStyle}>+ Teste de Dunn</button>
        <button onClick={() => addBlock('📊 Teste de Tukey', '#d97706', 'tool', '📊')} style={UI_STYLES.btnStyle}>+ Teste de Tukey</button>

        <h4 style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '12px' }}>7. CONCLUSÃO</h4>
        <button onClick={() => addBlock('🛑 Aceitar H0', '#94a3b8', 'end')} style={UI_STYLES.btnStyle}>+ Fim: Aceitar H0</button>
        <button onClick={() => addBlock('🏆 Sucesso', '#10b981', 'end')} style={UI_STYLES.btnStyle}>+ Fim: Sucesso</button>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} nodesDraggable={!isLocked} fitView>
          <Panel position="top-right" style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setIsLocked(!isLocked)} style={{ padding: '10px', background: isLocked ? '#ef4444' : '#e2e8f0', borderRadius: '5px' }}>{isLocked ? '🔒' : '🔓'}</button>
            <button onClick={submitHypothesis} disabled={enviando} style={{ padding: '10px 20px', background: enviando ? '#94a3b8' : '#10b981', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
              {enviando ? '⏳ ...' : '🚀 Validar'}
            </button>
          </Panel>
          <CustomControls />
          <Background variant="dots" gap={15} size={2} color="#cbd5e1" />
        </ReactFlow>
      </div>

      <Modal isOpen={modalAberto} onClose={() => setModalAberto(false)} title={modalConfig.titulo}>
        {modalConfig.conteudo}
      </Modal>
    </div>
  );
}

export default FlowDesigner;
