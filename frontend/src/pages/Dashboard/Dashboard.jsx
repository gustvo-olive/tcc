import React from 'react';
import { TRILHAS_MODULO_2 } from '../../constants/data';

const Dashboard = ({ acessarLicao, voltarParaModulos }) => {
  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ background: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={voltarParaModulos}
            style={{ background: '#f1f5f9', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}
          >
            ← Voltar
          </button>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>📈</span> Módulo 2: Análise Inferencial
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', color: '#475569' }}>
          🎓 Aluno <span style={{ fontSize: '12px' }}>▼</span>
        </div>
      </nav>

      <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', padding: '60px 20px', textAlign: 'center', boxShadow: 'inset 0 -5px 15px rgba(0,0,0,0.2)' }}>
        <h1 style={{ fontSize: '42px', margin: '0 0 10px 0', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Trilhas de Investigação</h1>
        <p style={{ fontSize: '18px', color: '#cbd5e1', margin: '0 auto', maxWidth: '800px', lineHeight: '1.6' }}>
          Escolha um tipo de problema estatístico para investigar nos microdados do ENEM. Cada trilha guiará você por todas as fases de uma análise real.
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
          {TRILHAS_MODULO_2.map((trilha) => (
            <div key={trilha.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0' }}>
              <div style={{ padding: '40px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '50px' }}>{trilha.icone}</div>
                  <h3 style={{ margin: 0, color: '#1e293b', fontSize: '22px', lineHeight: '1.2' }}>{trilha.titulo}</h3>
                </div>
                <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '15px', lineHeight: '1.6' }}>
                  {trilha.desc}
                </p>
                <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px', fontSize: '14px', color: '#0369a1', border: '1px solid #e0f2fe' }}>
                  <strong>Objetivo:</strong> {trilha.objetivo}
                </div>
              </div>
              <button 
                onClick={() => acessarLicao(trilha.id)} 
                style={{ 
                  background: '#6366f1', 
                  color: 'white', 
                  border: 'none', 
                  padding: '20px', 
                  fontWeight: 'bold', 
                  fontSize: '16px', 
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#4f46e5'}
                onMouseOut={(e) => e.currentTarget.style.background = '#6366f1'}
              >
                INICIAR TRILHA EM FASES →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
