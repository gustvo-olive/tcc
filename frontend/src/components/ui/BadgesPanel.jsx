import React, { useState, useEffect } from 'react';
import { BADGES, RARIDADE_LABEL } from '../../constants/badges';
import { getUnlockedBadges } from '../../services/badgeService';

const BadgesPanel = () => {
  const [unlocked, setUnlocked] = useState([]);

  const refresh = () => setUnlocked(getUnlockedBadges());

  useEffect(() => {
    refresh();
    // Atualiza o painel quando um badge novo é desbloqueado
    const handler = () => refresh();
    window.addEventListener('badge-unlocked', handler);
    return () => window.removeEventListener('badge-unlocked', handler);
  }, []);

  const totalUnlocked = unlocked.length;
  const total = BADGES.length;
  const pct = Math.round((totalUnlocked / total) * 100);

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '30px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      marginTop: '30px',
    }}>
      <style>{`
        @keyframes badgeAppear {
          from { transform: scale(0.7); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>

      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '20px' }}>🏅 Suas Conquistas</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
            {totalUnlocked} de {total} badges desbloqueados
          </p>
        </div>
        {/* Barra de progresso das conquistas */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#6366f1' }}>{pct}%</div>
          <div style={{ width: '120px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', transition: 'width 0.8s ease', borderRadius: '3px' }} />
          </div>
        </div>
      </div>

      {/* Grade de badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px' }}>
        {BADGES.map((badge) => {
          const isDesbloqueado = unlocked.includes(badge.id);
          const raridade = RARIDADE_LABEL[badge.raridade];

          return (
            <div
              key={badge.id}
              title={isDesbloqueado ? badge.descricao : '???'}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '18px 12px',
                borderRadius: '12px',
                border: isDesbloqueado ? `2px solid ${badge.cor}` : '2px solid #e2e8f0',
                background: isDesbloqueado ? `${badge.cor}15` : '#f8fafc',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
                animation: isDesbloqueado ? 'badgeAppear 0.4s ease' : 'none',
                boxShadow: isDesbloqueado ? `0 4px 12px ${badge.cor}30` : 'none',
              }}
              onMouseEnter={(e) => {
                if (isDesbloqueado) {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 10px 20px ${badge.cor}40`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = isDesbloqueado ? `0 4px 12px ${badge.cor}30` : 'none';
              }}
            >
              <div style={{
                fontSize: '36px',
                filter: isDesbloqueado ? 'none' : 'grayscale(1) opacity(0.3)',
                transition: 'filter 0.3s',
              }}>
                {badge.icone}
              </div>

              <div style={{
                fontSize: '12px',
                fontWeight: '700',
                color: isDesbloqueado ? '#1e293b' : '#94a3b8',
                textAlign: 'center',
                lineHeight: '1.2',
              }}>
                {isDesbloqueado ? badge.nome : '???'}
              </div>

              {/* Badge de raridade */}
              <div style={{
                fontSize: '9px',
                fontWeight: '700',
                color: isDesbloqueado ? 'white' : '#94a3b8',
                background: isDesbloqueado ? raridade.cor : '#e2e8f0',
                padding: '2px 7px',
                borderRadius: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {raridade.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgesPanel;
