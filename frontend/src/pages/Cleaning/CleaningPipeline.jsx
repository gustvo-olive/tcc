import React, { useState, useEffect } from 'react';
import { enviarGrafoParaProcessamento } from '../../services/api';
import DataTable from '../../components/ui/DataTable';

const CleaningPipeline = ({ licaoId, voltarAoMenu }) => {
  const [steps, setSteps] = useState([]);
  const [estatisticas, setEstatisticas] = useState({ saude: 60, n_atual: 500, erros_criticos: 20, trash_preview: [] });
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('validos');
  const [showFullTable, setShowFullTable] = useState(false);

  // Opções de Blocos de Limpeza
  const AVAILABLE_BLOCKS = [
    { id: 'nulos', label: '🧹 Remover Nulos', color: '#0ea5e9', desc: 'Elimina linhas com dados faltantes (NaN).' },
    { id: 'ausentes', label: '🚫 Filtrar Ausentes', color: '#3b82f6', desc: 'Remove candidatos com SITUACAO != OK.' },
    { id: 'outliers', label: '🎯 Limpar Outliers', color: '#6366f1', desc: 'Remove idades > 120 e notas > 1000.' },
    { id: 'duplicatas', label: '👥 Remover Duplicatas', color: '#8b5cf6', desc: 'Remove registros idênticos repetidos.' },
    { id: 'datas', label: '📅 Padronizar Datas', color: '#a855f7', desc: 'Uniformiza formatos DD/MM/YY e ISO.' },
    { id: 'moeda', label: '💰 Padronizar Moeda', color: '#10b981', desc: 'Converte R$ e vírgulas para numérico.' },
    { id: 'linguas', label: '🗣️ Agrupar Línguas', color: '#f59e0b', desc: 'Corrige variações (ex: Inglês, ING, ingles).' },
  ];

  const addStep = (block) => {
    if (steps.find(s => s.id === block.id)) return;
    setSteps([...steps, { ...block, active: true }]);
  };

  const removeStep = (id) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  // Sincroniza com o Backend toda vez que o pipeline muda
  useEffect(() => {
    const runPipeline = async () => {
      setLoading(true);
      const mockNodes = steps.map(s => ({ id: s.id, data: { label: s.label } }));
      mockNodes.unshift({ id: 'node-base', data: { label: '📊 Base ENEM (Suja)' } });

      try {
        const res = await enviarGrafoParaProcessamento(mockNodes, [], licaoId);
        if (res.estatisticas) setEstatisticas(res.estatisticas);
        if (res.preview) setPreview(res.preview);
      } catch (err) {
        console.error("Erro no pipeline:", err);
      } finally {
        setLoading(false);
      }
    };
    runPipeline();
  }, [steps, licaoId]);

  const dataToDisplay = activeTab === 'validos' ? (showFullTable ? preview : preview.slice(0, 50)) : estatisticas.trash_preview;

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* 1. BARRA LATERAL: FERRAMENTAS */}
      <div style={{ width: '320px', background: 'white', borderRight: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button onClick={voltarAoMenu} style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>⬅ Voltar ao Menu</button>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <h3 style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Caixa de Ferramentas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {AVAILABLE_BLOCKS.map(block => (
              <button 
                key={block.id}
                onClick={() => addStep(block)}
                disabled={steps.find(s => s.id === block.id)}
                style={{ 
                  padding: '12px 15px', 
                  background: steps.find(s => s.id === block.id) ? '#f8fafc' : 'white', 
                  border: steps.find(s => s.id === block.id) ? '1px solid #e2e8f0' : `1px solid ${block.color}40`, 
                  borderRadius: '12px', 
                  textAlign: 'left',
                  cursor: steps.find(s => s.id === block.id) ? 'default' : 'pointer',
                  opacity: steps.find(s => s.id === block.id) ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: 'bold', color: block.color, fontSize: '13px' }}>{block.label}</div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{block.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. ÁREA CENTRAL: PIPELINE E PREVIEW */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER COM MONITOR DE SAÚDE */}
        <div style={{ padding: '20px 40px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '40px' }}>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>🌡️ INTEGRIDADE DOS DADOS</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: (estatisticas.saude > 80 ? '#10b981' : '#f59e0b') }}>{estatisticas.saude}%</span>
                </div>
                <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${estatisticas.saude}%`, height: '100%', background: estatisticas.saude > 80 ? '#10b981' : (estatisticas.saude > 50 ? '#f59e0b' : '#ef4444'), transition: 'width 1s ease-in-out' }}></div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '30px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>{estatisticas.n_atual}</div>
                    <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 'bold' }}>LINHAS VÁLIDAS</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>{estatisticas.erros_criticos}</div>
                    <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 'bold' }}>ERROS CRÍTICOS</div>
                </div>
            </div>
        </div>

        {/* WORKFLOW BUILDER (PIPELINE) */}
        <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            <div style={{ width: '450px', background: '#1e293b', color: 'white', padding: '15px 25px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                📥 Entrada: Microdados ENEM (Base Suja)
            </div>

            {steps.map((step, index) => (
              <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div style={{ width: '2px', height: '25px', background: '#cbd5e1' }}></div>
                <div style={{ 
                    width: '500px', 
                    background: 'white', 
                    border: `1px solid ${step.color}40`, 
                    borderLeft: `5px solid ${step.color}`,
                    borderRadius: '12px', 
                    padding: '12px 20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ fontSize: '20px' }}>{step.label.split(' ')[0]}</div>
                        <div>
                            <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '14px' }}>{step.label.split(' ').slice(1).join(' ')}</div>
                            <div style={{ fontSize: '10px', color: '#10b981', fontWeight: '500' }}>Processamento ativo</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => removeStep(step.id)}
                        style={{ background: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '10px' }}
                    >
                        Remover
                    </button>
                </div>
              </div>
            ))}

            {steps.length < AVAILABLE_BLOCKS.length && (
              <>
                <div style={{ width: '2px', height: '25px', background: '#cbd5e1', borderStyle: 'dashed' }}></div>
                <div style={{ width: '400px', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                    Arraste ou clique em uma ferramenta para adicionar o próximo passo
                </div>
              </>
            )}

            {estatisticas.saude === 100 && (
                <div style={{ marginTop: '30px' }}>
                    <button style={{ padding: '15px 40px', background: '#10b981', color: 'white', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)', fontSize: '16px' }}>
                        🏁 Finalizar Curadoria & Exportar
                    </button>
                </div>
            )}
        </div>

        {/* PREVIEW DA TABELA (DRAWER INFERIOR) */}
        <div style={{ height: '300px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <button 
                        onClick={() => setActiveTab('validos')}
                        style={{ background: 'none', border: 'none', padding: '5px 0', borderBottom: activeTab === 'validos' ? '2px solid #3b82f6' : 'none', color: activeTab === 'validos' ? '#3b82f6' : '#94a3b8', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                    >
                        ✅ DADOS VÁLIDOS ({estatisticas.n_atual})
                    </button>
                    <button 
                        onClick={() => setActiveTab('lixo')}
                        style={{ background: 'none', border: 'none', padding: '5px 0', borderBottom: activeTab === 'lixo' ? '2px solid #ef4444' : 'none', color: activeTab === 'lixo' ? '#ef4444' : '#94a3b8', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                    >
                        🗑️ REMOVIDOS ({estatisticas.removidos})
                    </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {loading && <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 'bold' }}>⚡ CALCULANDO...</span>}
                    <button 
                        onClick={() => setShowFullTable(!showFullTable)}
                        style={{ padding: '5px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', color: '#475569' }}
                    >
                        {showFullTable ? 'Mostrar apenas 50' : 'Ver Tabela Completa (500)'}
                    </button>
                </div>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
                {dataToDisplay.length > 0 ? (
                    <DataTable data={dataToDisplay} />
                ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                        {activeTab === 'lixo' ? 'Nenhum registro foi removido ainda.' : 'Carregando dados...'}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CleaningPipeline;
