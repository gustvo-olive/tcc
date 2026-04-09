import React, { useState, useEffect, useRef } from 'react';
import { MISSOES } from '../../constants/missions';
import { useToast } from '../../contexts/ToastContext';
import { useAchievement } from '../../contexts/AchievementContext';

const MissionTracker = ({ licaoId, nodes, edges }) => {
  const [isRetracted, setIsRetracted] = useState(false);
  const missao = MISSOES[licaoId];

  if (!missao) {
    return (
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '340px',
        zIndex: 10,
        background: 'rgba(59, 130, 246, 0.9)',
        color: 'white',
        padding: '8px 15px',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '14px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        🔥 Modo Desafio: Sem dicas (Scaffolding reduzido)
      </div>
    );
  }

  const passoAtualIndex = missao.passos.findIndex(p => !p.condicao(nodes, edges));
  const isFinalizado = passoAtualIndex === -1;
  const passoExibido = isFinalizado ? null : missao.passos[passoAtualIndex];

  const toast = useToast();
  const { unlockBadge } = useAchievement();
  const alreadyToasted = useRef(false);

  useEffect(() => {
    if (isFinalizado && !alreadyToasted.current) {
      toast.success("Incrível! Você concluiu a missão.", 5000);
      alreadyToasted.current = true;
      
      // Unlock das badges correspondentes
      if (licaoId === 1) unlockBadge('MISSION_1_COMPLETE');
      else if (licaoId === 2) unlockBadge('MISSION_2_COMPLETE');
      
    } else if (!isFinalizado) {
      // reseta se o usuario deletar blocos e voltar de passo
      alreadyToasted.current = false;
    }
  }, [isFinalizado, toast]);

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '340px', // para não sobrepor a sidebar
      zIndex: 10,
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.4)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      borderRadius: '12px',
      width: isRetracted ? 'auto' : '320px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden'
    }}>
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
          padding: '12px 15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'white',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🎯</span>
          {!isRetracted && <h3 style={{ margin: 0, fontSize: '15px' }}>{missao.titulo}</h3>}
        </div>
        <button 
          onClick={() => setIsRetracted(!isRetracted)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            padding: '4px 8px',
            fontSize: '12px',
            fontWeight: 'bold',
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          {isRetracted ? 'Expandir' : 'Ocultar'}
        </button>
      </div>

      {!isRetracted && (
        <div style={{ padding: '20px' }}>
          {isFinalizado ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏆</div>
              <h4 style={{ margin: '0 0 10px 0', color: '#16a34a', fontSize: '18px' }}>Missão Cumprida!</h4>
              <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
                Você completou todos os passos desta lição com sucesso. O Andaime (Scaffolding) fez o seu papel.
              </p>
            </div>
          ) : (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <span style={{ 
                  background: '#e0f2fe', 
                  color: '#0369a1', 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  fontSize: '11px', 
                  fontWeight: 'bold' 
                }}>
                  Passo {passoAtualIndex + 1} de {missao.passos.length}
                </span>
                
                {/* Progress bar miniature */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  {missao.passos.map((p, i) => (
                    <div 
                      key={p.id}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: i < passoAtualIndex ? '#10b981' : (i === passoAtualIndex ? '#3b82f6' : '#cbd5e1')
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <p style={{ 
                margin: 0, 
                color: '#1e293b', 
                fontSize: '14px', 
                lineHeight: '1.6',
                fontWeight: '500'
              }}>
                {passoExibido.instrucao}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MissionTracker;
