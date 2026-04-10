import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * @param {string} conceito - "O que é" o bloco
 * @param {string} quando - "Quando usar" o bloco
 */
const Tooltip = ({ conceito, quando, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const wrapperRef = useRef(null);

  const handleMouseEnter = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setCoords({ left: rect.right + 14, top: rect.top + rect.height / 2 });
    }
    setIsVisible(true);
  };

  return (
    <>
      <div
        ref={wrapperRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
        style={{ display: 'block', width: '100%' }}
      >
        {children}
      </div>

      {isVisible && (conceito || quando) && createPortal(
        <div style={{
          position: 'fixed',
          left: `${coords.left}px`,
          top: `${coords.top}px`,
          transform: 'translateY(-50%)',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          fontSize: '12px',
          borderRadius: '8px',
          zIndex: 99999,
          width: '210px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4)',
          pointerEvents: 'none',
          overflow: 'hidden',
          border: '1px solid #1e293b',
        }}>
          {/* Seta */}
          <div style={{
            position: 'absolute', top: '50%', right: '100%',
            transform: 'translateY(-50%)',
            borderWidth: '7px', borderStyle: 'solid',
            borderColor: 'transparent #0f172a transparent transparent'
          }} />

          {/* Seção: Conceito */}
          {conceito && (
            <div style={{ padding: '10px 12px', borderBottom: quando ? '1px solid #1e293b' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', background: '#6366f1', color: 'white', padding: '1px 6px', borderRadius: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📖 Conceito
                </span>
              </div>
              <p style={{ margin: 0, color: '#cbd5e1', lineHeight: '1.5' }}>{conceito}</p>
            </div>
          )}

          {/* Seção: Quando Usar */}
          {quando && (
            <div style={{ padding: '10px 12px', background: '#1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', background: '#10b981', color: 'white', padding: '1px 6px', borderRadius: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ✅ Use quando
                </span>
              </div>
              <p style={{ margin: 0, color: '#cbd5e1', lineHeight: '1.5' }}>{quando}</p>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;
