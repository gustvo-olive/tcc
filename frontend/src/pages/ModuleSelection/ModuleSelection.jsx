import React from 'react';
import { MODULOS } from '../../constants/data';

const ModuleSelection = ({ aoSelecionarModulo }) => {
  const nomeUsuario = localStorage.getItem('tcc_user_nome') || 'Estudante';

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ background: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>📊</span> ENEM DataAnalytics
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ color: '#64748b', fontSize: '14px' }}>Olá, <strong>{nomeUsuario}</strong></span>
          <button 
            onClick={handleLogout}
            style={{ 
              background: 'none', 
              border: '1px solid #cbd5e1', 
              padding: '5px 12px', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '12px',
              color: '#64748b'
            }}
          >
            Sair
          </button>
        </div>
      </nav>

      <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '42px', margin: '0 0 15px 0' }}>Escolha sua Jornada</h1>
        <p style={{ fontSize: '18px', color: '#cbd5e1', maxWidth: '700px', margin: '0 auto' }}>
          Do tratamento bruto dos microdados até a descoberta de padrões estatísticos complexos. 
          Qual etapa do projeto vamos abordar hoje?
        </p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '-40px auto 40px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
        {MODULOS.map((modulo) => (
          <div 
            key={modulo.id} 
            style={{ 
              background: 'white', 
              borderRadius: '16px', 
              padding: '40px', 
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.2s',
              cursor: modulo.status === 'Ativo' ? 'pointer' : 'default',
              opacity: modulo.status === 'Ativo' ? 1 : 0.8
            }}
            onClick={() => modulo.status === 'Ativo' && aoSelecionarModulo(modulo.id)}
            onMouseEnter={(e) => modulo.status === 'Ativo' && (e.currentTarget.style.transform = 'translateY(-5px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>{modulo.icone}</div>
            <h3 style={{ fontSize: '24px', margin: '0 0 15px 0', color: '#1e293b' }}>{modulo.titulo}</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '25px', flex: 1 }}>{modulo.desc}</p>
            
            <div style={{ 
              padding: '10px 20px', 
              borderRadius: '20px', 
              fontSize: '14px', 
              fontWeight: 'bold',
              backgroundColor: modulo.status === 'Ativo' ? modulo.cor : '#e2e8f0',
              color: modulo.status === 'Ativo' ? 'white' : '#64748b'
            }}>
              {modulo.status === 'Ativo' ? 'INICIAR AGORA →' : 'EM DESENVOLVIMENTO'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModuleSelection;
