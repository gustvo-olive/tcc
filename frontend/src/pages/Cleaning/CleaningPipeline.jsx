import React, { useState, useEffect } from 'react';
import { enviarGrafoParaProcessamento } from '../../services/api';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Tooltip from '../../components/ui/Tooltip';
import { unlockBadge } from '../../services/badgeService';
import { TOOLTIPS } from '../../constants/tooltips';

const CleaningPipeline = ({ licaoId, voltarAoMenu }) => {
  const [steps, setSteps] = useState([]);
  const [estatisticas, setEstatisticas] = useState({ saude: 60, n_original: 500, n_atual: 500, erros_criticos: 0, trash_preview: [], removidos: 0 });
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('validos');
  const [showFullTable, setShowFullTable] = useState(false);
  const [configNode, setConfigNode] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const columns = preview && preview.length > 0 ? Object.keys(preview[0]) : [];

  const getAvailableBlocks = () => {
    if (licaoId === 'trilha-engenharia') {
      return [
        { id: 'media_ponderada', label: '🧮 Média Ponderada', color: '#0ea5e9', desc: 'Cria NOTA_FINAL.', default_config: { peso1: 1, peso2: 2 } },
        { id: 'binning_idade', label: '🎂 Categorizar Idade', color: '#3b82f6', desc: 'Cria FAIXA_ETARIA.', default_config: { limite_jovem: 25, limite_adulto: 60 } },
        { id: 'normalizar', label: '📏 Normalizar Notas', color: '#6366f1', desc: 'Escala 0 a 1.', default_config: { coluna: '' } }
      ];
    }
    if (licaoId === 'trilha-amostragem') {
      return [
        { id: 'amostra_simples', label: '🎲 Amostra Aleatória', color: '#f59e0b', desc: 'Sorteio de registros.', default_config: { n: 500 } },
        { id: 'amostra_estratificada', label: '⚖️ Amostra Estratificada', color: '#ec4899', desc: 'Mantém proporções.', default_config: { n: 500, coluna: 'TP_ESCOLA' } }
      ];
    }
    return [
      { id: 'nulos', label: '🧹 Remover Nulos', color: '#0ea5e9', desc: 'Elimina NaN.', default_config: { colunas: [] } },
      { id: 'ausentes', label: '🚫 Filtrar Ausentes', color: '#3b82f6', desc: 'Remove SITUACAO != OK.' },
      { id: 'outliers', label: '🎯 Limpar Outliers', color: '#6366f1', desc: 'Remove extremos.', default_config: { idade_max: 120, nota_max: 1000 } },
      { id: 'duplicatas', label: '👥 Remover Duplicatas', color: '#8b5cf6', desc: 'Remove repetidos.' },
      { id: 'padronizar', label: '⚙️ Padronizar Dados', color: '#a855f7', desc: 'Datas e Moedas.', default_config: { colunas: [], formato_renda: 'moeda' } },
      { id: 'imputar', label: '🧪 Imputar Dados', color: '#ec4899', desc: 'Preenche buracos.', default_config: { coluna: '', metodo: 'mediana' } }
    ];
  };

  const AVAILABLE_BLOCKS = getAvailableBlocks();

  const addStep = (block) => {
    if (steps.find(s => s.id === block.id)) return;
    const isReady = !block.default_config;
    setSteps([...steps, { ...block, active: true, ready: isReady, config: JSON.parse(JSON.stringify(block.default_config || {})) }]);
  };

  const handleUpdateConfig = (id, newConfig) => {
    setSteps(steps.map(s => s.id === id ? { ...s, config: newConfig, ready: true } : s));
    setConfigNode(null);
  };

  const finalizarPipeline = () => { setIsFinished(true); unlockBadge('completista'); };

  useEffect(() => {
    const runPipeline = async () => {
      setLoading(true);
      const readySteps = steps.filter(s => s.ready);
      const mockNodes = readySteps.map(s => ({ id: s.id, data: { label: s.label, config: s.config } }));
      mockNodes.unshift({ id: 'node-base', data: { label: 'Base' } });
      try {
        const res = await enviarGrafoParaProcessamento(mockNodes, [], licaoId);
        if (res.estatisticas) setEstatisticas(res.estatisticas);
        if (res.preview) setPreview(res.preview);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    runPipeline();
  }, [steps, licaoId]);

  const dataToDisplay = activeTab === 'validos' ? (showFullTable ? preview : (preview || []).slice(0, 50)) : (estatisticas.trash_preview || []);

  // Helper para renderizar Barras de Representatividade
  const DistributionChart = ({ data, title, column }) => {
    if (!data || data.length === 0) return null;
    const counts = data.reduce((acc, curr) => {
        const val = curr[column] || 'Indefinido';
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {});
    const total = data.length;

    return (
        <div style={{ flex: 1, padding: '10px' }}>
            <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#64748b' }}>{title} ({column})</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(counts).map(([label, count]) => {
                    const pct = Math.round((count / total) * 100);
                    return (
                        <div key={label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '3px' }}>
                                <span>{label}</span>
                                <span style={{ fontWeight: 'bold' }}>{pct}%</span>
                            </div>
                            <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: '#3b82f6', borderRadius: '3px' }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '320px', background: 'white', borderRight: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button onClick={voltarAoMenu} style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>⬅ Menu</button>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <h3 style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '15px' }}>Ferramentas</h3>
          {AVAILABLE_BLOCKS.map(block => {
            const tip = TOOLTIPS[block.id] || { conceito: '', quando: '' };
            return (
              <Tooltip key={block.id} conceito={tip.conceito} quando={tip.quando}>
                <button onClick={() => addStep(block)} disabled={steps.find(s => s.id === block.id)} style={{ width: '100%', padding: '12px 15px', background: 'white', border: `1px solid ${block.color}40`, borderRadius: '12px', textAlign: 'left', cursor: 'pointer', marginBottom: '8px', opacity: steps.find(s => s.id === block.id) ? 0.4 : 1 }}>
                  <div style={{ fontWeight: 'bold', color: block.color, fontSize: '13px' }}>{block.label}</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>{block.desc}</div>
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER */}
        <div style={{ padding: '20px 40px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '40px' }}>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>🌡️ INTEGRIDADE</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: estatisticas.saude > 80 ? '#10b981' : '#f59e0b' }}>{estatisticas.saude}%</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${estatisticas.saude}%`, height: '100%', background: estatisticas.saude > 80 ? '#10b981' : '#f59e0b', transition: 'width 1s ease' }}></div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 'bold' }}>{estatisticas.n_atual}</div><div style={{ fontSize: '9px', color: '#94a3b8' }}>VÁLIDOS</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>{estatisticas.erros_criticos}</div><div style={{ fontSize: '9px', color: '#94a3b8' }}>ERROS</div></div>
            </div>
        </div>

        <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '450px', background: '#1e293b', color: 'white', padding: '15px 25px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold' }}>📥 Entrada</div>
            
            {steps.map((step) => (
              <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div style={{ width: '2px', height: '25px', background: '#cbd5e1' }}></div>
                <div style={{ width: '500px', background: 'white', borderLeft: `5px solid ${step.color}`, borderRadius: '12px', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{step.label}</div>
                        <div style={{ fontSize: '10px', color: step.ready ? '#10b981' : '#f59e0b' }}>{step.ready ? '✅ Ativo' : '⚠️ Aguardando Configuração'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {step.default_config && (
                            <button onClick={() => setConfigNode(JSON.parse(JSON.stringify(step)))} style={{ background: step.ready ? '#f1f5f9' : '#fff7ed', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⚙️ {step.ready ? 'Ajustar' : 'Configurar'}</button>
                        )}
                        <button onClick={() => setSteps(steps.filter(s => s.id !== step.id))} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '11px' }}>Remover</button>
                    </div>
                </div>
              </div>
            ))}

            {/* CARD DE AMOSTRAGEM COM GRÁFICOS */}
            {steps.some(s => s.id.includes('amostra') && s.ready) && (
                <div style={{ width: '600px', marginTop: '30px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '25px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>📊 Painel de Representatividade</h4>
                    
                    <div style={{ display: 'flex', gap: '30px', marginBottom: '25px' }}>
                        <div style={{ flex: 1, background: '#f8fafc', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 'bold', marginBottom: '5px' }}>BASE ORIGINAL</div>
                            <div style={{ fontSize: '20px', fontWeight: '900', color: '#94a3b8' }}>{estatisticas.n_original}</div>
                        </div>
                        <div style={{ flex: 1, background: '#f0f9ff', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid #bae6fd' }}>
                            <div style={{ fontSize: '9px', color: '#0369a1', fontWeight: 'bold', marginBottom: '5px' }}>AMOSTRA ATUAL</div>
                            <div style={{ fontSize: '20px', fontWeight: '900', color: '#0ea5e9' }}>{estatisticas.n_atual}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <DistributionChart data={preview} title="Proporção na Amostra" column="TP_ESCOLA" />
                        <DistributionChart data={preview} title="Estado Civil" column="ESTADO_CIVIL" />
                    </div>

                    <div style={{ marginTop: '20px', padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '11px', color: '#166534', lineHeight: '1.4' }}>
                        💡 <strong>Dica Científica:</strong> Compare estes gráficos com a descrição da base na Teoria. Se as barras estiverem em proporções muito diferentes da realidade, sua amostra pode estar enviesada!
                    </div>
                </div>
            )}

            {estatisticas.saude === 100 && !isFinished && (
                <button onClick={finalizarPipeline} style={{ marginTop: '30px', padding: '15px 40px', background: '#10b981', color: 'white', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' }}>🏁 Finalizar & Exportar</button>
            )}
            {isFinished && (
                <div style={{ marginTop: '30px', background: '#dcfce7', padding: '20px', borderRadius: '12px', border: '2px solid #10b981', textAlign: 'center' }}>
                    <div style={{ fontSize: '30px' }}>🏆</div>
                    <div style={{ fontWeight: 'bold', color: '#065f46' }}>Curadoria Concluída!</div>
                </div>
            )}
        </div>

        {/* TABELA */}
        <div style={{ height: '300px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <button onClick={() => setActiveTab('validos')} style={{ background: 'none', border: 'none', color: activeTab === 'validos' ? '#3b82f6' : '#94a3b8', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>✅ VÁLIDOS ({estatisticas.n_atual})</button>
                    <button onClick={() => setActiveTab('lixo')} style={{ background: 'none', border: 'none', color: activeTab === 'lixo' ? '#ef4444' : '#94a3b8', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>🗑️ REMOVIDOS ({estatisticas.removidos})</button>
                </div>
                <button onClick={() => setShowFullTable(!showFullTable)} style={{ padding: '3px 10px', fontSize: '11px', cursor: 'pointer' }}>{showFullTable ? 'Reduzir' : 'Ver 500'}</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
                {dataToDisplay.length > 0 ? <DataTable data={dataToDisplay} /> : <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Sem dados.</div>}
            </div>
        </div>

        {/* MODAL CONFIG */}
        <Modal isOpen={!!configNode} onClose={() => setConfigNode(null)} title={`Configurar: ${configNode?.label}`}>
            {configNode?.id === 'amostra_simples' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>Extraia um subconjunto aleatório.</p>
                    <label style={{ fontSize: '11px', fontWeight: 'bold' }}>TAMANHO (N)</label>
                    <input type="number" value={configNode.config.n} onChange={(e) => setConfigNode({...configNode, config: {...configNode.config, n: parseInt(e.target.value) || 500}})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <button onClick={() => handleUpdateConfig(configNode.id, configNode.config)} style={{ background: configNode.color, color: 'white', padding: '10px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Gerar Amostra</button>
                </div>
            )}
            {configNode?.id === 'amostra_estratificada' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>Mantenha as proporções de um grupo.</p>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold' }}>N</label>
                            <input type="number" value={configNode.config.n} onChange={(e) => setConfigNode({...configNode, config: {...configNode.config, n: parseInt(e.target.value) || 500}})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold' }}>GRUPO</label>
                            <select value={configNode.config.coluna} onChange={(e) => setConfigNode({...configNode, config: {...configNode.config, coluna: e.target.value}})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', background: 'white' }}>
                                <option value="TP_ESCOLA">Escola</option>
                                <option value="ESTADO_CIVIL">Estado Civil</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={() => handleUpdateConfig(configNode.id, configNode.config)} style={{ background: configNode.color, color: 'white', padding: '10px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Gerar Amostra</button>
                </div>
            )}
            {configNode?.id === 'media_ponderada' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>Crie a <strong>NOTA_FINAL</strong> (Mat e Red).</p>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}><label style={{ fontSize: '11px', fontWeight: 'bold' }}>PESO MAT</label><input type="number" value={configNode.config.peso1} onChange={(e) => setConfigNode({...configNode, config: {...configNode.config, peso1: parseInt(e.target.value) || 1}})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0' }} /></div>
                        <div style={{ flex: 1 }}><label style={{ fontSize: '11px', fontWeight: 'bold' }}>PESO RED</label><input type="number" value={configNode.config.peso2} onChange={(e) => setConfigNode({...configNode, config: {...configNode.config, peso2: parseInt(e.target.value) || 1}})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0' }} /></div>
                    </div>
                    <button onClick={() => handleUpdateConfig(configNode.id, configNode.config)} style={{ background: '#0ea5e9', color: 'white', padding: '10px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Gerar</button>
                </div>
            )}
            {configNode?.id === 'binning_idade' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>Crie a <strong>FAIXA_ETARIA</strong>.</p>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}><label style={{ fontSize: '11px', fontWeight: 'bold' }}>JOVEM ATÉ</label><input type="number" value={configNode.config.limite_jovem} onChange={(e) => setConfigNode({...configNode, config: {...configNode.config, limite_jovem: parseInt(e.target.value)}})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0' }} /></div>
                        <div style={{ flex: 1 }}><label style={{ fontSize: '11px', fontWeight: 'bold' }}>ADULTO ATÉ</label><input type="number" value={configNode.config.limite_adulto} onChange={(e) => setConfigNode({...configNode, config: {...configNode.config, limite_adulto: parseInt(e.target.value)}})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0' }} /></div>
                    </div>
                    <button onClick={() => handleUpdateConfig(configNode.id, configNode.config)} style={{ background: '#3b82f6', color: 'white', padding: '10px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Categorizar</button>
                </div>
            )}
            {configNode?.id === 'normalizar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>Escala 0-1.</p>
                    <select value={configNode.config.coluna} onChange={(e) => setConfigNode({...configNode, config: {...configNode.config, coluna: e.target.value}})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0' }}>
                        <option value="">Selecione...</option>
                        {columns.filter(c => c.includes('NOTA')).map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                    <button onClick={() => handleUpdateConfig(configNode.id, configNode.config)} disabled={!configNode.config.coluna} style={{ background: '#6366f1', color: 'white', padding: '10px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Normalizar</button>
                </div>
            )}
            {configNode?.id === 'nulos' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>Selecione as colunas.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {columns.map(col => (
                            <label key={col} style={{ fontSize: '11px', display: 'flex', gap: '5px' }}><input type="checkbox" checked={configNode.config.colunas.includes(col)} onChange={(e) => {
                                const newCols = e.target.checked ? [...configNode.config.colunas, col] : configNode.config.colunas.filter(c => c !== col);
                                setConfigNode({...configNode, config: {...configNode.config, colunas: newCols}});
                            }} /> {col}</label>
                        ))}
                    </div>
                    <button onClick={() => handleUpdateConfig(configNode.id, configNode.config)} style={{ background: '#0ea5e9', color: 'white', padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Salvar</button>
                </div>
            )}
            {configNode?.id === 'padronizar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>Datas e moedas.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {columns.map(col => (
                            <label key={col} style={{ fontSize: '12px', display: 'flex', gap: '5px' }}><input type="checkbox" checked={configNode.config.colunas.includes(col)} onChange={(e) => {
                                const newCols = e.target.checked ? [...configNode.config.colunas, col] : configNode.config.colunas.filter(c => c !== col);
                                setConfigNode({...configNode, config: {...configNode.config, colunas: newCols}});
                            }} /> {col}</label>
                        ))}
                    </div>
                    <button onClick={() => handleUpdateConfig(configNode.id, configNode.config)} style={{ background: '#a855f7', color: 'white', padding: '10px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Salvar</button>
                </div>
            )}
        </Modal>
      </div>
    </div>
  );
};

export default CleaningPipeline;
