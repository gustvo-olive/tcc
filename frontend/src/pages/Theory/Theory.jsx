import React from 'react';
import { LICOES_MODULO_2 } from '../../constants/data';
import { LESSONS_CONTENT } from '../../constants/lessonsContent';

const Theory = ({ licaoId, voltarAoDashboard, irParaCanvas }) => {
  const licao = LICOES_MODULO_2.find(l => l.id === licaoId);
  const conteudoDidatico = LESSONS_CONTENT[licaoId];

  if (!licao) return <p>Lição não encontrada.</p>;

  // Renderizador de Blocos de Conteúdo
  const renderBlock = (block, index) => {
    switch (block.tipo) {
      case 'texto':
        return <p key={index} style={{ fontSize: '18px', color: '#475569', lineHeight: '1.6', marginBottom: '20px' }}>{block.valor}</p>;
      
      case 'hipoteses':
        return (
          <div key={index} style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
            <div style={{ flex: 1, background: '#f1f5f9', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #94a3b8' }}>
              <strong style={{ display: 'block', color: '#475569', marginBottom: '5px' }}>H0 (Hipótese Nula)</strong>
              <p style={{ margin: 0, fontSize: '14px', color: '#1e293b' }}>{block.h0}</p>
            </div>
            <div style={{ flex: 1, background: '#e0f2fe', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #0ea5e9' }}>
              <strong style={{ display: 'block', color: '#0369a1', marginBottom: '5px' }}>H1 (Alternativa)</strong>
              <p style={{ margin: 0, fontSize: '14px', color: '#1e293b' }}>{block.h1}</p>
            </div>
          </div>
        );

      case 'conceito':
        return (
          <div key={index} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '25px', borderRadius: '12px', marginBottom: '25px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '18px' }}>📖 {block.titulo}</h3>
            <p style={{ margin: 0, color: '#334155', lineHeight: '1.5' }}>{block.valor}</p>
          </div>
        );

      case 'alerta':
        return (
          <div key={index} style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '15px 20px', borderRadius: '0 8px 8px 0', marginBottom: '25px', color: '#92400e', fontWeight: '500' }}>
            {block.valor}
          </div>
        );

      case 'dica':
        return (
          <div key={index} style={{ background: '#f0f9ff', border: '1px dashed #0ea5e9', padding: '15px 20px', borderRadius: '8px', marginBottom: '25px', color: '#0369a1', fontSize: '15px' }}>
            {block.valor}
          </div>
        );

      case 'missao':
        return (
          <div key={index} style={{ background: '#1e293b', color: 'white', padding: '25px', borderRadius: '12px', marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#38bdf8' }}>🚀 Sua Missão no Laboratório</h3>
            <p style={{ margin: 0, lineHeight: '1.8', color: '#cbd5e1', whiteSpace: 'pre-line' }}>{block.valor}</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ background: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={voltarAoDashboard} style={{ background: '#f1f5f9', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>← Voltar</button>
        <h2 style={{ margin: 0, color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>{licao.icone}</span> {licao.titulo}
        </h2>
        <div style={{ width: '100px' }}></div>
      </nav>

      <div style={{ display: 'flex', maxWidth: '1200px', margin: '40px auto', gap: '30px', padding: '0 20px' }}>
        
        {/* Lado Esquerdo: Conteúdo Principal */}
        <div style={{ flex: 1, background: 'white', padding: '50px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          <header style={{ marginBottom: '40px', borderBottom: '1px solid #f1f5f9', paddingBottom: '30px' }}>
            <h1 style={{ color: '#0f172a', fontSize: '32px', marginBottom: '15px', lineHeight: '1.2' }}>{conteudoDidatico?.titulo_secao}</h1>
            <div style={{ background: '#f8fafc', padding: '15px 20px', borderRadius: '8px', borderLeft: '4px solid #6366f1' }}>
              <strong style={{ color: '#4338ca', fontSize: '12px', textTransform: 'uppercase' }}>Objetivo Pedagógico</strong>
              <p style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '15px' }}>{licao.objetivo}</p>
            </div>
          </header>

          <article>
            {conteudoDidatico?.conteudo.map((block, idx) => renderBlock(block, idx))}
          </article>

          <footer style={{ marginTop: '50px', paddingTop: '30px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center' }}>
            <button onClick={() => irParaCanvas(licao.id)} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '18px 40px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}>
              Ir para o Laboratório →
            </button>
          </footer>
        </div>

        {/* Lado Direito: Glossário Rápido (O Scaffolding Permanente) */}
        <aside style={{ width: '300px', flexShrink: 0 }}>
          <div style={{ background: '#1e293b', color: 'white', padding: '25px', borderRadius: '16px', position: 'sticky', top: '100px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#38bdf8', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>🛠️ Glossário de Apoio</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <strong style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Teste de Normalidade</strong>
              <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>Verifica se os dados seguem a curva de sino. Se p &gt; 0.05 no Shapiro-Wilk, os dados são normais.</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <strong style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Post-Hoc</strong>
              <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>Usado após a ANOVA ou Kruskal-Wallis para descobrir EXATAMENTE quais grupos são diferentes entre si.</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <strong style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Tamanho do Efeito</strong>
              <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>Indica a força da diferença prática na vida real, além da matemática.</p>
            </div>

            <div style={{ background: '#334155', padding: '12px', borderRadius: '8px', marginTop: '20px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>Dúvida conceitual? <br/>Consulte seu professor no Canvas!</p>
            </div>
          </div>
        </aside>

      </div>
      <div style={{ height: '50px' }}></div>
    </div>
  );
};

export default Theory;
