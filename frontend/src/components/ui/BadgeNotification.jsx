import React, { useState, useEffect } from 'react';
import { RARIDADE_LABEL } from '../../constants/badges';

/**
 * Toast animado que aparece quando um badge é desbloqueado.
 * Escuta o evento global 'badge-unlocked' disparado pelo badgeService.
 */
const BadgeNotification = () => {
  const [badge, setBadge] = useState(null);
  const [visible, setVisible] = useState(false);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      setBadge(e.detail);
      setVisible(true);
      setSaindo(false);

      // Começa a saída após 3.5s
      const timerSaida = setTimeout(() => setSaindo(true), 3500);
      // Remove após animação de saída (500ms)
      const timerRemove = setTimeout(() => setVisible(false), 4000);

      return () => {
        clearTimeout(timerSaida);
        clearTimeout(timerRemove);
      };
    };

    window.addEventListener('badge-unlocked', handler);
    return () => window.removeEventListener('badge-unlocked', handler);
  }, []);

  if (!visible || !badge) return null;

  const raridade = RARIDADE_LABEL[badge.raridade] || RARIDADE_LABEL.comum;

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      left: '30px',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      border: `2px solid ${badge.cor}`,
      borderRadius: '16px',
      padding: '16px 22px',
      boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 20px ${badge.cor}55`,
      maxWidth: '340px',
      animation: saindo
        ? 'badgeSlideOut 0.5s ease-in forwards'
        : 'badgeSlideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      cursor: 'pointer',
    }}
      onClick={() => { setSaindo(true); setTimeout(() => setVisible(false), 500); }}
    >
      <style>{`
        @keyframes badgeSlideIn {
          from { transform: translateX(-120%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes badgeSlideOut {
          from { transform: translateX(0);     opacity: 1; }
          to   { transform: translateX(-120%); opacity: 0; }
        }
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.15); }
        }
      `}</style>

      {/* Ícone do badge */}
      <div style={{
        fontSize: '42px',
        lineHeight: 1,
        animation: 'badgePulse 1.5s ease-in-out infinite',
        flexShrink: 0,
      }}>
        {badge.icone}
      </div>

      {/* Texto */}
      <div>
        <div style={{
          fontSize: '10px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: badge.cor,
          marginBottom: '4px',
        }}>
          🏅 Conquista Desbloqueada!
        </div>
        <div style={{ fontSize: '16px', fontWeight: '800', color: '#f8fafc', marginBottom: '3px' }}>
          {badge.nome}
        </div>
        <div style={{
          display: 'inline-block',
          fontSize: '10px',
          fontWeight: '700',
          color: 'white',
          background: raridade.cor,
          padding: '2px 8px',
          borderRadius: '20px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {raridade.label}
        </div>
      </div>
    </div>
  );
};

export default BadgeNotification;
