import React, { useEffect, useState } from 'react';
import { MODULOS, TRILHAS_MODULO_1, TRILHAS_MODULO_2 } from '../../constants/data';
import { TRILHAS_CONTENT } from '../../constants/lessonsContent';
import BadgesPanel from '../../components/ui/BadgesPanel';
import { unlockBadge } from '../../services/badgeService';

const Dashboard = ({ moduloId, acessarLicao, voltarParaModulos }) => {
  const [progreessos, setProgressos] = useState({});
  const modulo = MODULOS.find(m => m.id === moduloId);
  const trilhas = moduloId === 1 ? TRILHAS_MODULO_1 : TRILHAS_MODULO_2;

  useEffect(() => {
    const novosProgressos = {};
    let todasCompletas = true;
    trilhas.forEach(trilha => {
      const salvo = localStorage.getItem(`progresso-${trilha.id}`);
      if (salvo) {
        const faseAtual = parseInt(salvo, 10);
        const totalFases = TRILHAS_CONTENT[trilha.id]?.fases.length || 1;
        const pct = Math.round(((faseAtual + 1) / totalFases) * 100);
        novosProgressos[trilha.id] = pct;
        if (pct < 100) todasCompletas = false;
      } else {
        novosProgressos[trilha.id] = 0;
        todasCompletas = false;
      }
    });
    setProgressos(novosProgressos);
    if (todasCompletas && trilhas.length > 0) unlockBadge('completista');
  }, [trilhas]);

  const badgesUnlocked = JSON.parse(localStorage.getItem('tcc_badges_unlocked') || '[]');
  const badgesCount = badgesUnlocked.length;

  const getPatente = (progress) => {
    if (progress >= 90) return "Mestre da Estatística 🏆";
    if (progress >= 60) return "Cientista de Dados 📊";
    if (progress >= 30) return "Pesquisador Júnior 📑";
    return "Analista Iniciante 🧪";
  };

  const overallProgress = trilhas.length > 0 
    ? Object.values(progreessos).reduce((a, b) => a + b, 0) / trilhas.length 
    : 0;

  const nomeUsuario = localStorage.getItem('tcc_user_nome') || 'Estudante';

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
            <span style={{ fontSize: '24px' }}>{modulo?.icone}</span> {modulo?.titulo}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', color: '#475569' }}>
          🎓 {nomeUsuario} <span style={{ fontSize: '12px' }}>▼</span>
        </div>
      </nav>

      <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', padding: '60px 20px', textAlign: 'center', boxShadow: 'inset 0 -5px 15px rgba(0,0,0,0.2)' }}>
        <h1 style={{ fontSize: '42px', margin: '0 0 10px 0', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Trilhas de Investigação</h1>
        <p style={{ fontSize: '18px', color: '#cbd5e1', margin: '0 auto', maxWidth: '800px', lineHeight: '1.6' }}>
          Escolha um tipo de problema para investigar nos microdados do ENEM. Cada trilha guiará você por todas as fases de uma análise real.
        </p>
      </div>

      {/* 2. PERFIL DO CIENTISTA */}
      <div style={{ maxWidth: '1200px', margin: '-40px auto 40px', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '25px 40px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', border: '4px solid #e2e8f0' }}>
                    {getPatente(overallProgress).split(' ').pop()}
                </div>
                <div>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Patente Atual</div>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#1e293b' }}>{getPatente(overallProgress)}</div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '50px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' }}>Conquistas</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#6366f1' }}>{badgesCount}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' }}>XP Módulo</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>{Math.round(overallProgress * 10)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' }}>Conclusão</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#f59e0b' }}>{Math.round(overallProgress)}%</div>
                </div>
            </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
          {trilhas.map((trilha) => (
            <div key={trilha.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0' }}>
              <div style={{ padding: '40px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '50px' }}>{trilha.icone}</div>
                  <h3 style={{ margin: 0, color: '#1e293b', fontSize: '22px', lineHeight: '1.2' }}>{trilha.titulo}</h3>
                </div>
                <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '15px', lineHeight: '1.6' }}>
                  {trilha.desc}
                </p>
                <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px', fontSize: '14px', color: '#0369a1', border: '1px solid #e0f2fe', marginBottom: '20px' }}>
                  <strong>Objetivo:</strong> {trilha.objetivo}
                </div>

                {progreessos[trilha.id] > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>
                      <span>Progresso</span>
                      <span>{progreessos[trilha.id]}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${progreessos[trilha.id]}%`, height: '100%', background: '#10b981', transition: 'width 0.3s' }}></div>
                    </div>
                  </div>
                )}
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
                INICIAR TRILHA EM FASES &rarr;
              </button>
            </div>
          ))}
        </div>
        <BadgesPanel />
      </div>
    </div>
  );
};

export default Dashboard;
