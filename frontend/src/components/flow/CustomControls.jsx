import React from 'react';
import { Panel, useReactFlow } from '@xyflow/react';
import { UI_STYLES } from '../../constants/data';

const CustomControls = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  return (
    <Panel position="bottom-left" style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '15px' }}>
      <button onClick={() => zoomIn({ duration: 300 })} style={UI_STYLES.ctrlBtnStyle} title="Aproximar">➕</button>
      <button onClick={() => zoomOut({ duration: 300 })} style={UI_STYLES.ctrlBtnStyle} title="Afastar">➖</button>
      <button onClick={() => fitView({ duration: 300 })} style={UI_STYLES.ctrlBtnStyle} title="Centralizar Mapa">🗺️</button>
    </Panel>
  );
};

export default CustomControls;
