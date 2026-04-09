import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Adiciona um novo toast
  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Helpers para facilitar a chamada
  const toast = {
    info: (msg, dur) => addToast(msg, 'info', dur),
    success: (msg, dur) => addToast(msg, 'success', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    achievement: (msg, dur) => addToast(msg, 'achievement', dur)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Container de Toasts Globais */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none' // Não bloqueia cliques onde os toasts não estão
      }}>
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Sub-componente de UI para cada Toast individual
const ToastItem = ({ toast, onRemove }) => {
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    // Escuta antes de ser desmontado
    return () => setIsHiding(true);
  }, []);

  const getStyleObj = (type) => {
    switch (type) {
      case 'achievement':
        return { 
          bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))', 
          icon: '🏆', 
          color: '#fff', 
          border: 'rgba(252, 211, 77, 0.8)',
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.6), inset 0 0 10px rgba(252, 211, 77, 0.3)'
        };
      case 'success':
        return { bg: 'rgba(22, 163, 74, 0.9)', icon: '✅', color: '#fff', border: 'rgba(34, 197, 94, 0.5)' };
      case 'error':
        return { bg: 'rgba(220, 38, 38, 0.9)', icon: '❌', color: '#fff', border: 'rgba(239, 68, 68, 0.5)' };
      case 'warning':
        return { bg: 'rgba(234, 179, 8, 0.9)', icon: '⚠️', color: '#fff', border: 'rgba(250, 204, 21, 0.5)' };
      case 'info':
      default:
        return { bg: 'rgba(56, 189, 248, 0.9)', icon: 'ℹ️', color: '#fff', border: 'rgba(14, 165, 233, 0.5)' };
    }
  };

  const styleObj = getStyleObj(toast.type);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: styleObj.bg,
        color: styleObj.color,
        padding: '12px 20px',
        borderRadius: '10px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${styleObj.border}`,
        backdropFilter: 'blur(8px)',
        pointerEvents: 'auto', // O container tem none, mas o toast precisa ter auto (caso queira clicar pra dispensar)
        cursor: 'pointer',
        animation: isHiding ? 'toastOut 0.3s forwards' : 'toastIn 0.3s forwards',
        transformOrigin: 'bottom right'
      }}
      onClick={onRemove}
    >
      <span style={{ fontSize: '18px' }}>{styleObj.icon}</span>
      <span style={{ fontWeight: styleObj.boxShadow ? '700' : '500', fontSize: '14px', textShadow: styleObj.boxShadow ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none' }}>
        {toast.message}
      </span>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(20px) scale(0.95); }
        }
      `}</style>
    </div>
  );
};
