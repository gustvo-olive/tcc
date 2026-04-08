import React, { useState, useEffect } from 'react';
import { TRILHAS_MODULO_1, TRILHAS_MODULO_2 } from '../../constants/data';
import { TRILHAS_CONTENT } from '../../constants/lessonsContent';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

const Theory = ({ licaoId, voltarAoDashboard, irParaCanvas }) => {
  const [faseAtualIdx, setFaseAtualIdx] = useState(0);
  const trilha = TRILHAS_MODULO_2.find(t => t.id === licaoId) || TRILHAS_MODULO_1.find(t => t.id === licaoId);
  const conteudoDidatico = TRILHAS_CONTENT[licaoId];

  useEffect(() => {
    // Carregar progresso salvo
    const progressoSalvo = localStorage.getItem(`progresso-${licaoId}`);
    if (progressoSalvo) {
      setFaseAtualIdx(parseInt(progressoSalvo, 10));
    } else {
      setFaseAtualIdx(0);
    }
  }, [licaoId]);

  const proximaFase = () => {
    if (conteudoDidatico && faseAtualIdx < conteudoDidatico.fases.length - 1) {
      const novoIdx = faseAtualIdx + 1;
      setFaseAtualIdx(novoIdx);
      // Salvar progresso
      localStorage.setItem(`progresso-${licaoId}`, novoIdx.toString());
      window.scrollTo(0, 0);
    } else {
      irParaCanvas(licaoId);
    }
  };

  const faseAnterior = () => {
    if (faseAtualIdx > 0) {
      setFaseAtualIdx(faseAtualIdx - 1);
      window.scrollTo(0, 0);
    }
  };

  const renderBlock = (block, index) => {
    const textStyle = { fontSize: '18px', color: '#334155', lineHeight: '1.6', marginBottom: '20px' };
    
    switch (block.tipo) {
      case 'texto': return <p key={index} style={textStyle}>{block.valor}</p>;
      case 'formula': return (
        <div key={index} style={{ padding: '25px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px', textAlign: 'center', color: '#0f172a' }}>
          <BlockMath math={block.valor} />
          {block.legenda && <p style={{ fontSize: '14px', color: '#64748b', marginTop: '15px', fontStyle: 'italic' }}>{block.legenda}</p>}
        </div>
      );
      case 'hipoteses': return (
        <div key={index} style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          <div style={{ flex: 1, background: '#f1f5f9', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #94a3b8' }}>
            <strong style={{ display: 'block', color: '#475569', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase' }}>H0 (Hipótese Nula)</strong>
            <p style={{ margin: 0, fontSize: '15px', color: '#1e293b', fontWeight: '500' }}>{block.h0}</p>
          </div>
          <div style={{ flex: 1, background: '#e0f2fe', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #0ea5e9' }}>
            <strong style={{ display: 'block', color: '#0369a1', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase' }}>H1 (Alternativa)</strong>
            <p style={{ margin: 0, fontSize: '15px', color: '#1e293b', fontWeight: '500' }}>{block.h1}</p>
          </div>
        </div>
      );
      case 'conceito': return (
        <div key={index} style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '25px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#0f172a' }}>📖 {block.titulo}</h3>
          <p style={{ margin: 0, lineHeight: '1.6', color: '#334155' }}>{block.valor}</p>
        </div>
      );
      case 'alerta': return <div key={index} style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '15px 20px', borderRadius: '0 8px 8px 0', marginBottom: '25px', color: '#92400e', fontWeight: '500' }}>{block.valor}</div>;
      case 'dica': return <div key={index} style={{ background: '#f0f9ff', border: '1px dashed #0ea5e9', padding: '15px 20px', borderRadius: '8px', marginBottom: '25px', color: '#0369a1', fontSize: '15px' }}>{block.valor}</div>;
      case 'missao': return <div key={index} style={{ background: '#1e293b', color: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px' }}><h3 style={{ margin: '0 0 15px 0', color: '#38bdf8', fontSize: '20px' }}>🚀 Missão Final</h3><p style={{ margin: 0, lineHeight: '1.8', color: '#cbd5e1', whiteSpace: 'pre-line' }}>{block.valor}</p></div>;
      default: return null;
    }
  };

  const totalFases = conteudoDidatico ? (conteudoDidatico.fases?.length || 0) : 0;
  const faseAtual = (conteudoDidatico && conteudoDidatico.fases) ? conteudoDidatico.fases[faseAtualIdx] : null;

  // Se a lição existe mas as fases não, ou se houve erro no carregamento
  if (licaoId && !trilha) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'system-ui' }}>
        <h2>⚠️ Erro de Carregamento</h2>
        <p>A lição "{licaoId}" não foi encontrada no mapeamento de dados.</p>
        <button onClick={voltarAoDashboard} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer' }}>Voltar ao Dashboard</button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ background: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={voltarAoDashboard} style={{ background: '#f1f5f9', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>← Voltar</button>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{trilha?.icone} {trilha?.titulo}</h2>
        <div style={{ color: '#64748b', fontWeight: 'bold' }}>{conteudoDidatico ? `Fase ${faseAtualIdx + 1} de ${totalFases}` : 'Em breve'}</div>
      </nav>

      {conteudoDidatico && totalFases > 0 && (
        <div style={{ width: '100%', height: '6px', background: '#e2e8f0' }}>
          <div style={{ width: `${((faseAtualIdx + 1) / totalFases) * 100}%`, height: '100%', background: '#6366f1', transition: 'width 0.3s' }}></div>
        </div>
      )}

      <div style={{ display: 'flex', maxWidth: '1200px', margin: '40px auto', gap: '30px', padding: '0 20px' }}>
        <div style={{ flex: 1, background: 'white', padding: '50px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          {conteudoDidatico && faseAtual ? (
            <>
              <header style={{ marginBottom: '40px' }}>
                <h1 style={{ color: '#0f172a', fontSize: '36px', margin: 0 }}>{faseAtual.titulo}</h1>
              </header>
              <article>{faseAtual.conteudo.map((block, idx) => renderBlock(block, idx))}</article>
              <footer style={{ marginTop: '50px', paddingTop: '30px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={faseAnterior} disabled={faseAtualIdx === 0} style={{ padding: '15px 30px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', cursor: faseAtualIdx === 0 ? 'default' : 'pointer', opacity: faseAtualIdx === 0 ? 0.5 : 1, fontWeight: 'bold' }}>Anterior</button>
                <button onClick={proximaFase} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '15px 40px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>{faseAtualIdx === totalFases - 1 ? 'Iniciar Laboratório (Canvas) →' : 'Próxima Fase →'}</button>
              </footer>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <h2 style={{ color: '#1e293b' }}>📖 Conteúdo em Preparação</h2>
              <p style={{ color: '#64748b' }}>Estamos organizando as fases desta investigação pedagógica para a trilha <strong>{licaoId}</strong>.</p>
              <button onClick={voltarAoDashboard} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', marginTop: '20px', fontWeight: 'bold' }}>Voltar ao Dashboard</button>
            </div>
          )}
        </div>

        {conteudoDidatico && totalFases > 0 && (
          <aside style={{ width: '300px' }}>
            <div style={{ background: '#1e293b', color: 'white', padding: '25px', borderRadius: '16px', position: 'sticky', top: '100px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#38bdf8' }}>Fluxo de Aprendizado</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {conteudoDidatico.fases.map((f, i) => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: i <= faseAtualIdx ? 1 : 0.4 }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: i === faseAtualIdx ? '#6366f1' : (i < faseAtualIdx ? '#10b981' : '#334155'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white' }}>{i < faseAtualIdx ? '✓' : i + 1}</div>
                    <span style={{ fontSize: '13px', fontWeight: i === faseAtualIdx ? 'bold' : 'normal', color: i === faseAtualIdx ? 'white' : '#cbd5e1' }}>{f.titulo.split(':')[1] || f.titulo}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
      <div style={{ height: '50px' }}></div>
    </div>
  );
};


export default Theory;
