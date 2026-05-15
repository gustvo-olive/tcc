import React, { useState, useEffect } from 'react';
import DataTable from '../../components/ui/DataTable';
import { buscarDadosUsuario } from '../../services/api';

const InteractiveGrid = ({ licaoId, voltarAoMenu }) => {
  const [data, setData] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulação de carregamento de dados sujos
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Por enquanto, vamos simular que pegamos a base mini_enem_sujo.csv
        // Em um cenário real, o backend retornaria isso via API
        const mockData = Array.from({ length: 15 }, (_, i) => ({
          ID: i + 1,
          NOME: `Estudante ${i + 1}`,
          IDADE: i === 5 ? 250 : (15 + i),
          NOTA_GERAL: i === 10 ? 9999 : (400 + i * 10),
          SITUACAO: i % 5 === 0 ? 'AUSENTE' : 'OK'
        }));
        setData(mockData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const applyAction = (actionName, filterFn) => {
    const newData = data.filter(filterFn);
    setData(newData);
    setHistory([...history, { name: actionName, timestamp: new Date().toLocaleTimeString() }]);
    setSelectedColumn(null);
  };

  const undoLastAction = () => {
    if (history.length === 0) return;
    // Para um "Desfazer" real, precisaríamos guardar estados anteriores dos dados
    alert("Funcionalidade de Desfazer (Undo) em desenvolvimento!");
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* Barra Lateral de Receitas (Inspirada no Power Query) */}
      <div style={{ width: '300px', background: 'white', borderRight: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <button onClick={voltarAoMenu} style={{ padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' }}>⬅ Voltar ao Menu</button>
        
        <h3 style={{ fontSize: '14px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>📋 Passos Aplicados</h3>
        <div style={{ flex: 1, overflowY: 'auto', marginTop: '10px' }}>
          <div style={{ padding: '10px', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '5px', marginBottom: '8px', fontSize: '13px' }}>
            📥 Base Carregada (Original)
          </div>
          {history.map((step, i) => (
            <div key={i} style={{ padding: '10px', background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '5px', marginBottom: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
              <span>✨ {step.name}</span>
              <small style={{ color: '#94a3b8' }}>{step.timestamp}</small>
            </div>
          ))}
        </div>

        <button 
          onClick={undoLastAction}
          disabled={history.length === 0}
          style={{ padding: '10px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ↩ Desfazer Último Passo
        </button>
      </div>

      {/* Área Central: Grid Interativo */}
      <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, color: '#1e293b' }}>Laboratório de Curadoria de Dados</h2>
            <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Clique nos cabeçalhos para limpar os dados.</p>
          </div>
          <div style={{ background: '#1e293b', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold' }}>
            Registros Atuais: {data.length}
          </div>
        </div>

        <div style={{ flex: 1, background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
           {/* Custom Header for Interactive Grid */}
           <div style={{ background: '#f8fafc', padding: '10px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '10px' }}>
              {data.length > 0 && Object.keys(data[0]).map(col => (
                <button 
                  key={col}
                  onClick={() => setSelectedColumn(col)}
                  style={{ 
                    padding: '5px 12px', 
                    background: selectedColumn === col ? '#3b82f6' : 'white', 
                    color: selectedColumn === col ? 'white' : '#475569',
                    border: '1px solid #cbd5e1', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {col} ▾
                </button>
              ))}
           </div>

           <div style={{ flex: 1, overflow: 'auto' }}>
              {loading ? (
                <div style={{ padding: '50px', textAlign: 'center' }}>Carregando dados...</div>
              ) : (
                <DataTable data={data} />
              )}
           </div>
        </div>

        {/* Menu Flutuante de Ações (Aparece ao selecionar coluna) */}
        {selectedColumn && (
          <div style={{ background: '#1e293b', color: 'white', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
            <div style={{ borderRight: '1px solid #475569', paddingRight: '20px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Coluna Selecionada</span>
              <strong>{selectedColumn}</strong>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              {selectedColumn === 'IDADE' && (
                <button 
                  onClick={() => applyAction('Filtrou Idades > 120', d => d.IDADE <= 120)}
                  style={{ padding: '8px 15px', background: '#ef4444', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  🧹 Remover Idades Impossíveis (>120)
                </button>
              )}
              {selectedColumn === 'NOTA_GERAL' && (
                <button 
                  onClick={() => applyAction('Limpou Notas > 1000', d => d.NOTA_GERAL <= 1000)}
                  style={{ padding: '8px 15px', background: '#ef4444', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  🧹 Remover Erros de Digitação (>1000)
                </button>
              )}
              {selectedColumn === 'SITUACAO' && (
                <button 
                  onClick={() => applyAction('Filtrou apenas Presentes', d => d.SITUACAO === 'OK')}
                  style={{ padding: '8px 15px', background: '#3b82f6', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  🚫 Manter apenas 'OK' (Remover Ausentes)
                </button>
              )}
              <button 
                onClick={() => setSelectedColumn(null)}
                style={{ padding: '8px 15px', background: 'transparent', border: '1px solid #475569', borderRadius: '5px', color: 'white', cursor: 'pointer' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveGrid;
