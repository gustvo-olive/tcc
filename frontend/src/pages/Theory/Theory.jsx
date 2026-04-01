import React from 'react';
import { LICOES_MODULO_2 } from '../../constants/data';

const Theory = ({ licaoId, voltarAoDashboard, irParaCanvas }) => {
  const licao = LICOES_MODULO_2.find(l => l.id === licaoId);

  if (!licao) return <p>Lição não encontrada.</p>;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ background: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <button 
          onClick={voltarAoDashboard}
          style={{ background: '#f1f5f9', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}
        >
          ← Voltar para Lições
        </button>
        <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px' }}>
          {licao.icone} {licao.titulo}
        </h2>
        <div style={{ width: '100px' }}></div> {/* Spacer para centralizar */}
      </nav>

      <div style={{ maxWidth: '800px', margin: '40px auto', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#1e293b', fontSize: '32px', marginBottom: '10px' }}>Contexto da Investigação</h1>
        <p style={{ fontSize: '18px', color: '#475569', lineHeight: '1.6', marginBottom: '30px' }}>
          {licao.desc}
        </p>

        <div style={{ background: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '20px', borderRadius: '0 8px 8px 0', marginBottom: '40px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#166534' }}>🎯 Objetivo de Aprendizagem</h3>
          <p style={{ margin: 0, color: '#15803d', lineHeight: '1.5' }}>{licao.objetivo}</p>
        </div>

        <h2 style={{ color: '#1e293b', fontSize: '24px', marginBottom: '15px' }}>O que você precisa saber:</h2>
        <div style={{ color: '#475569', lineHeight: '1.8', marginBottom: '40px' }}>
          <p>
            Nesta etapa, você está sendo exposto à teoria necessária para resolver este problema. 
            Como proposto pela <strong>Teoria da Carga Cognitiva</strong>, não queremos que você se preocupe com código Python agora.
          </p>
          <p>
            Entenda primeiro o conceito estatístico. Assim que você se sentir confortável com a ideia de <em>Hipótese Nula (H0)</em> e <em>P-Valor</em>, 
            poderá usar nossa ferramenta visual para testar essas ideias diretamente na base de dados do ENEM.
          </p>
          {/* Aqui futuramente você pode injetar o conteúdo teórico em Markdown vindo de um banco de dados */}
          <div style={{ padding: '20px', background: '#e2e8f0', borderRadius: '8px', textAlign: 'center', marginTop: '20px' }}>
            [Área reservada para o texto didático, fórmulas simplificadas e gráficos estáticos de exemplo]
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            {licao.isPBL ? 'Esta é uma missão prática avançada (Sem Andaimes).' : 'Pronto para testar esse conhecimento?'}
          </p>
          
          <button 
            onClick={() => irParaCanvas(licao.id)}
            style={{ 
              background: '#2563eb', 
              color: 'white', 
              border: 'none', 
              padding: '15px 30px', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: 'bold', 
              fontSize: '16px',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
            }}
          >
            Ir para o Laboratório (Canvas) →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Theory;
