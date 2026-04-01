import React from 'react';
import { LICOES_MODULO_2 } from '../../constants/data';

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
        <h1 style={{ fontSize: '42px', margin: '0 0 10px 0', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Trilha de Aprendizagem</h1>
        <p style={{ fontSize: '18px', color: '#cbd5e1', margin: '0 auto', maxWidth: '800px', lineHeight: '1.6' }}>
          Neste módulo, você aprenderá a investigar os dados do ENEM. Começaremos com forte apoio teórico (Scaffolding) e, aos poucos, você construirá seus próprios fluxos de análise.
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          {LICOES_MODULO_2.map((licao) => (
            <div key={licao.id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', border: licao.isPBL ? '2px solid #3b82f6' : '1px solid #e2e8f0' }}>
              {licao.isPBL && (
                 <div style={{ background: '#3b82f6', color: 'white', textAlign: 'center', padding: '5px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                   Desafio Prático Integrador
                 </div>
              )}
              <div style={{ padding: '30px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ fontSize: '40px' }}>{licao.icone}</div>
                  <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px', lineHeight: '1.3' }}>{licao.titulo}</h3>
                </div>
                <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
                  {licao.desc}
                </p>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', fontSize: '13px', color: '#475569' }}>
                  <strong>Objetivo:</strong> {licao.objetivo}
                </div>
              </div>
              <button 
                onClick={() => acessarLicao(licao.id)} 
                style={{ 
                  background: licao.isPBL ? '#2563eb' : '#f1f5f9', 
                  color: licao.isPBL ? 'white' : '#0f172a', 
                  border: 'none', 
                  padding: '18px', 
                  fontWeight: 'bold', 
                  fontSize: '14px', 
                  cursor: 'pointer',
                  borderTop: '1px solid #e2e8f0',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => { if(!licao.isPBL) e.currentTarget.style.background = '#e2e8f0'; }}
                onMouseOut={(e) => { if(!licao.isPBL) e.currentTarget.style.background = '#f1f5f9'; }}
              >
                {licao.isPBL ? 'INICIAR DESAFIO (CANVAS)' : 'ACESSAR CONTEXTO'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
