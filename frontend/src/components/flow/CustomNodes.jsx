import React from 'react';
import { Handle, Position } from '@xyflow/react';

export const ConditionNode = ({ data }) => {
  return (
    <div style={{ width: 100, height: 100, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Handle type="target" position={Position.Top} id="top" style={{ background: '#333', width: '10px', height: '10px' }} />
      <Handle type="source" position={Position.Left} id="nao" style={{ background: '#ef4444', width: '12px', height: '12px', left: '-6px' }} />
      <div style={{ position: 'absolute', left: '-30px', color: '#ef4444', fontWeight: 'bold', fontSize: '13px', textShadow: '1px 1px 0 #fff' }}>Não</div>
      <Handle type="source" position={Position.Right} id="sim" style={{ background: '#10b981', width: '12px', height: '12px', right: '-6px' }} />
      <div style={{ position: 'absolute', right: '-30px', color: '#10b981', fontWeight: 'bold', fontSize: '13px', textShadow: '1px 1px 0 #fff' }}>Sim</div>
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: '#333', width: '10px', height: '10px' }} />
      <div style={{ position: 'absolute', width: '80%', height: '80%', background: '#eab308', transform: 'rotate(45deg)', borderRadius: '8px', zIndex: -1, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}></div>
      <div style={{ color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '11px', zIndex: 1, padding: '5px' }}>{data.label}</div>
    </div>
  );
};

export const EndNode = ({ data }) => {
  return (
    <div style={{ padding: '10px 20px', background: data.color || '#ef4444', color: 'white', fontWeight: 'bold', borderRadius: '50px', textAlign: 'center', border: '2px solid rgba(0,0,0,0.2)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', minWidth: '120px', fontSize: '13px' }}>
      <Handle type="target" position={Position.Top} style={{ background: '#333', width: '10px', height: '10px' }} />
      {data.label}
    </div>
  );
};

export const ToolNode = ({ data }) => {
  return (
    <div style={{ 
      padding: '12px 20px', 
      background: 'white', 
      border: `2px solid ${data.color || '#6366f1'}`, 
      borderRadius: '10px', 
      display: 'flex', 
      flexDirection: 'column',
      gap: '8px', 
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      minWidth: '150px'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: '#333' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ fontSize: '20px' }}>{data.icon || '⚙️'}</div>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>{data.label}</div>
      </div>
      
      {data.onConfig && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            data.onConfig();
          }}
          style={{ 
            marginTop: '5px',
            padding: '4px 8px', 
            background: '#f1f5f9', 
            border: '1px solid #e2e8f0', 
            borderRadius: '4px', 
            fontSize: '10px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#475569'
          }}
        >
          ⚙️ Configurar / Ver
        </button>
      )}
      
      <Handle type="source" position={Position.Bottom} style={{ background: '#333' }} />
    </div>
  );
};
