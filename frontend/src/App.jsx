import React, { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

// Páginas
import ModuleSelection from './pages/ModuleSelection/ModuleSelection';
import Dashboard from './pages/Dashboard/Dashboard';
import FlowDesigner from './pages/Canvas/FlowDesigner';
import Theory from './pages/Theory/Theory';

export default function App() {
  const [paginaAtual, setPaginaAtual] = useState('selecao-modulo');
  const [moduloSelecionado, setModuloSelecionado] = useState(null);
  const [licaoAtual, setLicaoAtual] = useState(null);

  // 1. Navegação: Home -> Dashboard do Módulo
  const handleSelecionarModulo = (moduloId) => {
    setModuloSelecionado(moduloId);
    if (moduloId === 1 || moduloId === 2) {
      setPaginaAtual('dashboard');
    }
  };

  // 2. Navegação: Dashboard -> Teoria (ou direto pro Canvas se for o Desafio Final)
  const handleAcessarLicao = (licaoId) => {
    setLicaoAtual(licaoId);
    // Na nossa estrutura, a lição 6 é o Desafio (PBL), o ideal é que ele veja a instrução no Theory antes, 
    // ou vá direto pro Canvas. Aqui, vamos mandar todos para Theory primeiro para contextualização.
    setPaginaAtual('teoria');
  };

  // 3. Navegação: Teoria -> Canvas (Laboratório)
  const handleIrParaCanvas = (licaoId) => {
    setPaginaAtual('canvas');
  };

  return (
    <ReactFlowProvider>
      {/* 1. Seleção de Módulos (Home) */}
      {paginaAtual === 'selecao-modulo' && (
        <ModuleSelection aoSelecionarModulo={handleSelecionarModulo} />
      )}
      
      {/* 2. Dashboard de Lições do Módulo */}
      {paginaAtual === 'dashboard' && (
        <Dashboard 
          moduloId={moduloSelecionado}
          acessarLicao={handleAcessarLicao} 
          voltarParaModulos={() => setPaginaAtual('selecao-modulo')}
        />
      )}

      {/* 3. Tela de Contexto / Teoria (O "Andaime") */}
      {paginaAtual === 'teoria' && (
        <Theory 
          licaoId={licaoAtual}
          voltarAoDashboard={() => setPaginaAtual('dashboard')}
          irParaCanvas={handleIrParaCanvas}
        />
      )}

      {/* 4. Laboratório (Canvas - Onde o aluno monta o fluxo estatístico) */}
      {paginaAtual === 'canvas' && (
        <FlowDesigner 
          licaoId={licaoAtual}
          voltarAoMenu={() => setPaginaAtual('teoria')} 
        />
      )}
    </ReactFlowProvider>
  );
}
