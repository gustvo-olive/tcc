import React, { useState, useEffect } from 'react';
import { enviarGrafoParaProcessamento } from '../../services/api';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { unlockBadge } from '../../services/badgeService';

const CleaningPipeline = ({ licaoId, voltarAoMenu }) => {
  const [steps, setSteps] = useState([]);
  const [estatisticas, setEstatisticas] = useState({ saude: 60, n_atual: 500, erros_criticos: 20, trash_preview: [] });
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('validos');
  const [showFullTable, setShowFullTable] = useState(false);
  const [configNode, setConfigNode] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  // Colunas disponíveis na base (extraídas do preview)
  const columns = preview.length > 0 ? Object.keys(preview[0]) : [];

  // Opções de Blocos de Limpeza
  const AVAILABLE_BLOCKS = [
    { id: 'nulos', label: '🧹 Remover Nulos', color: '#0ea5e9', desc: 'Elimina linhas com dados faltantes (NaN).', default_config: { colunas: [] } },
    { id: 'ausentes', label: '🚫 Filtrar Ausentes', color: '#3b82f6', desc: 'Remove candidatos com SITUACAO != OK.' },
    { id: 'outliers', label: '🎯 Limpar Outliers', color: '#6366f1', desc: 'Remove idades > 120 e notas > 1000.', default_config: { idade_max: 120, nota_max: 1000 } },
    { id: 'duplicatas', label: '👥 Remover Duplicatas', color: '#8b5cf6', desc: 'Remove registros idênticos repetidos.' },
    { id: 'padronizar', label: '⚙️ Padronizar Dados', color: '#a855f7', desc: 'Uniformiza formatos de datas ou moeda.', default_config: { colunas: [], formato_renda: 'moeda' } },
    { id: 'imputar', label: '🧪 Imputar Dados', color: '#ec4899', desc: 'Preenche nulos com a Média ou Mediana.', default_config: { coluna: '', metodo: 'mediana' } },
    { id: 'linguas', label: '🗣️ Agrupar Línguas', color: '#f59e0b', desc: 'Corrige variações (ex: Inglês, ING, ingles).' },
  ];

  const addStep = (block) => {
    if (steps.find(s => s.id === block.id)) return;
    // Se o bloco tem configuração obrigatória, ele começa como 'ready: false'
    const isReady = !block.default_config;
    setSteps([...steps, { ...block, active: true, ready: isReady, config: block.default_config || {} }]);
  };

  const removeStep = (id) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const handleUpdateConfig = (id, newConfig) => {
    setSteps(steps.map(s => s.id === id ? { ...s, config: newConfig, ready: true } : s));
    setConfigNode(null);
  };

  const finalizarPipeline = () => {
    setIsFinished(true);
    unlockBadge('completista');
  };

  // Sincroniza com o Backend toda vez que o pipeline muda
  useEffect(() => {
    const runPipeline = async () => {
      setLoading(true);
      // Filtra apenas passos que já foram configurados ou que não exigem config
      const readySteps = steps.filter(s => s.ready);
      
      const mockNodes = readySteps.map(s => ({ 
        id: s.id, 
        data: { label: s.label, config: s.config } 
      }));
      mockNodes.unshift({ id: 'node-base', data: { label: '📊 Base ENEM (Suja)' } });

      try {
        const res = await enviarGrafoParaProcessamento(mockNodes, [], licaoId);
        if (res.status === 'erro') {
          console.error("Erro no Backend:", res.mensagem);
          return;
        }
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

  const dataToDisplay = activeTab === 'validos' ? (showFullTable ? preview : preview.slice(0, 50)) : (estatisticas.trash_preview || []);

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
                📥 Entrada: Base de Dados (Suja)
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
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    opacity: step.ready ? 1 : 0.8
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ fontSize: '20px' }}>{step.label.split(' ')[0]}</div>
                        <div>
                            <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '14px' }}>{step.label.split(' ').slice(1).join(' ')}</div>
                            <div style={{ fontSize: '10px', color: step.ready ? '#10b981' : '#f59e0b', fontWeight: '500' }}>
                                {step.ready ? 'Processamento ativo' : '⚠️ Aguardando configuração'}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {step.default_config && (
                            <button 
                                onClick={() => setConfigNode(step)}
                                style={{ background: step.ready ? '#f1f5f9' : '#fff7ed', color: step.ready ? '#475569' : '#c2410c', border: step.ready ? '1px solid #e2e8f0' : '1px solid #fdba74', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
                            >
                                {step.ready ? '⚙️ Ajustar' : '⚙️ Configurar'}
                            </button>
                        )}
                        <button 
                            onClick={() => removeStep(step.id)}
                            style={{ background: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '10px' }}
                        >
                            Remover
                        </button>
                    </div>
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

            {estatisticas.saude === 100 && !isFinished && (
                <div style={{ marginTop: '30px' }}>
                    <button 
                        onClick={finalizarPipeline}
                        style={{ padding: '15px 40px', background: '#10b981', color: 'white', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)', fontSize: '16px' }}
                    >
                        🏁 Finalizar Curadoria & Exportar
                    </button>
                </div>
            )}

            {isFinished && (
                <div style={{ marginTop: '30px', background: '#dcfce7', padding: '20px 40px', borderRadius: '12px', border: '2px solid #10b981', textAlign: 'center', animation: 'badgeAppear 0.5s ease' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏆</div>
                    <h3 style={{ color: '#065f46', margin: '0' }}>Curadoria Concluída!</h3>
                    <p style={{ color: '#047857', fontSize: '13px', margin: '10px 0 0 0' }}>Sua base de dados está 100% limpa e pronta para análises inferenciais.</p>
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

        {/* MODAL DE CONFIGURAÇÃO */}
        <Modal 
            isOpen={!!configNode} 
            onClose={() => setConfigNode(null)} 
            title={`Configurar: ${configNode?.label}`}
        >
            {configNode?.id === 'nulos' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>Selecione as colunas que devem ser verificadas. Se houver um valor nulo em qualquer uma dessas colunas, a linha será removida.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                        {columns.map(col => (
                            <label key={col} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={configNode.config.colunas.includes(col)}
                                    onChange={(e) => {
                                        const newCols = e.target.checked 
                                            ? [...configNode.config.colunas, col]
                                            : configNode.config.colunas.filter(c => c !== col);
                                        setConfigNode({ ...configNode, config: { ...configNode.config, colunas: newCols } });
                                    }}
                                />
                                {col}
                            </label>
                        ))}
                    </div>
                    <button 
                        onClick={() => handleUpdateConfig(configNode.id, configNode.config)}
                        style={{ alignSelf: 'flex-end', padding: '10px 25px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Salvar Configuração
                    </button>
                </div>
            )}

            {configNode?.id === 'outliers' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>Defina os limites máximos permitidos para as colunas de Idade e Nota Geral.</p>
                    <div style={{ display: 'flex', gap: '30px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>IDADE MÁXIMA</label>
                            <input 
                                type="number" 
                                value={configNode.config.idade_max}
                                onChange={(e) => setConfigNode({ ...configNode, config: { ...configNode.config, idade_max: parseInt(e.target.value) } })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>NOTA MÁXIMA</label>
                            <input 
                                type="number" 
                                value={configNode.config.nota_max}
                                onChange={(e) => setConfigNode({ ...configNode, config: { ...configNode.config, nota_max: parseInt(e.target.value) } })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>
                    </div>
                    <button 
                        onClick={() => handleUpdateConfig(configNode.id, configNode.config)}
                        style={{ alignSelf: 'flex-end', padding: '10px 25px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Salvar Configuração
                    </button>
                </div>
            )}

            {configNode?.id === 'padronizar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>Selecione as colunas que possuem formatos inconsistentes. O sistema aplicará a melhor conversão para cada tipo.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                        {columns.map(col => (
                            <label key={col} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', padding: '10px', background: (col === 'DATA_INSCRICAO' || col === 'RENDA_BRUTA') ? '#f0f9ff' : 'transparent', borderRadius: '8px', border: (col === 'DATA_INSCRICAO' || col === 'RENDA_BRUTA') ? '1px solid #bae6fd' : '1px solid transparent' }}>
                                <input 
                                    type="checkbox" 
                                    checked={configNode.config.colunas.includes(col)}
                                    onChange={(e) => {
                                        const newCols = e.target.checked 
                                            ? [...configNode.config.colunas, col]
                                            : configNode.config.colunas.filter(c => c !== col);
                                        setConfigNode({ ...configNode, config: { ...configNode.config, colunas: newCols } });
                                    }}
                                />
                                {col} {(col === 'DATA_INSCRICAO' || col === 'RENDA_BRUTA') && '✨'}
                            </label>
                        ))}
                    </div>

                    {configNode.config.colunas.includes('RENDA_BRUTA') && (
                        <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '10px' }}>FORMATO DA RENDA</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {[
                                    { id: 'moeda', label: 'R$ 1.234,56' },
                                    { id: 'float', label: '1234.56' },
                                    { id: 'inteiro', label: '1234' }
                                ].map(f => (
                                    <button 
                                        key={f.id}
                                        onClick={() => setConfigNode({ ...configNode, config: { ...configNode.config, formato_renda: f.id } })}
                                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', background: configNode.config.formato_renda === f.id ? '#e0f2fe' : 'white', color: configNode.config.formato_renda === f.id ? '#0369a1' : '#64748b', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={() => handleUpdateConfig(configNode.id, configNode.config)}
                        style={{ alignSelf: 'flex-end', padding: '10px 25px', background: '#a855f7', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Salvar Configuração
                    </button>
                </div>
            )}

            {configNode?.id === 'imputar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>A Imputação permite preencher valores faltantes sem precisar deletar a linha inteira. Recomendado para variáveis numéricas como Notas ou Idade.</p>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>COLUNA ALVO</label>
                            <select 
                                value={configNode.config.coluna}
                                onChange={(e) => setConfigNode({ ...configNode, config: { ...configNode.config, coluna: e.target.value } })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}
                            >
                                <option value="">Selecione uma coluna...</option>
                                {columns.map(col => <option key={col} value={col}>{col}</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>MÉTODO</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    onClick={() => setConfigNode({ ...configNode, config: { ...configNode.config, metodo: 'media' } })}
                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: configNode.config.metodo === 'media' ? '#f0f9ff' : 'white', color: configNode.config.metodo === 'media' ? '#0ea5e9' : '#64748b', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    Média
                                </button>
                                <button 
                                    onClick={() => setConfigNode({ ...configNode, config: { ...configNode.config, metodo: 'mediana' } })}
                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: configNode.config.metodo === 'mediana' ? '#f0f9ff' : 'white', color: configNode.config.metodo === 'mediana' ? '#0ea5e9' : '#64748b', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    Mediana
                                </button>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleUpdateConfig(configNode.id, configNode.config)}
                        disabled={!configNode.config.coluna}
                        style={{ alignSelf: 'flex-end', padding: '10px 25px', background: '#ec4899', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: configNode.config.coluna ? 'pointer' : 'not-allowed', opacity: configNode.config.coluna ? 1 : 0.5 }}
                    >
                        Salvar Configuração
                    </button>
                </div>
            )}
        </Modal>
      </div>
    </div>
  );
};

export default CleaningPipeline;
