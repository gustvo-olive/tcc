import React from 'react';
import { useAchievement } from '../../contexts/AchievementContext';

const AchievementsModal = ({ onClose }) => {
  const { getFullBadgeData, resetBadges } = useAchievement();
  const badges = getFullBadgeData();

  const globais = badges.filter(b => b.unlocked).length;
  const porcentagem = Math.round((globais / badges.length) * 100);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        color: 'white',
        width: '600px',
        maxWidth: '90%',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header Modal */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 25px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🏆 Mural de Conquistas
            </h2>
            <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
              Progresso global: {porcentagem}% ({globais} de {badges.length})
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '25px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          {badges.map(b => (
            <div key={b.id} style={{
              display: 'flex',
              gap: '15px',
              padding: '15px',
              background: b.unlocked ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)',
              borderRadius: '12px',
              border: b.unlocked ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255,255,255,0.05)',
              opacity: b.unlocked ? 1 : 0.6,
              transition: 'transform 0.2s',
              cursor: 'default'
            }}>
              <div style={{
                fontSize: '40px',
                filter: b.unlocked ? 'none' : 'grayscale(100%)',
                opacity: b.unlocked ? 1 : 0.2
              }}>
                {b.icon}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h4 style={{ margin: '0 0 5px 0', color: b.unlocked ? '#10b981' : '#64748b', fontSize: '15px' }}>
                  {b.unlocked ? b.title : '???'}
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
                  {b.unlocked ? b.desc : 'Continue explorando as missões e a teoria para revelar esta conquista misteriosa.'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '15px 25px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end' }}>
             <button onClick={resetBadges} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}>
                Zerar Conquistas
             </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementsModal;
