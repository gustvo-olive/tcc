import React, { useState } from 'react';

const Tooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px',
          background: 'rgba(15, 23, 42, 0.95)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500',
          whiteSpace: 'nowrap',
          zIndex: 100,
          pointerEvents: 'none',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          animation: 'tooltipFadeIn 0.2s ease-out forwards'
        }}>
          {text}
          {/* Seta do tooltip */}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '5px',
            borderStyle: 'solid',
            borderColor: 'rgba(15, 23, 42, 0.95) transparent transparent transparent'
          }} />
        </div>
      )}

      <style>{`
        @keyframes tooltipFadeIn {
          from { opacity: 0; transform: translate(-50%, 5px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};

export default Tooltip;
