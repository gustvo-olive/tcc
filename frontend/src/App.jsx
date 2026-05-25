import React, { useState, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { unlockBadge } from './services/badgeService';
import { buscarDadosUsuario } from './services/api';
import BadgeNotification from './components/ui/BadgeNotification';

// Páginas
import Login from './pages/Login/Login';
import ModuleSelection from './pages/ModuleSelection/ModuleSelection';
import Dashboard from './pages/Dashboard/Dashboard';
import FlowDesigner from './pages/Canvas/FlowDesigner';
import Theory from './pages/Theory/Theory';
import CleaningPipeline from './pages/Cleaning/CleaningPipeline';

export default function App() {
  const [autenticado, setAutenticado] = useState(!!localStorage.getItem('tcc_user_id'));
  const [paginaAtual, setPaginaAtual] = useState('selecao-modulo');
  const [moduloSelecionado, setModuloSelecionado] = useState(null);
  const [licaoAtual, setLicaoAtual] = useState(null);

  // Sincronização Inicial com o Backend
  useEffect(() => {
    if (autenticado) {
      syncDados();
    }
  }, [autenticado]);

  async function syncDados() {
    const dados = await buscarDadosUsuario();
    if (dados) {
      // Sincroniza Badges
      if (dados.badges) {
        localStorage.setItem('tcc_badges_unlocked', JSON.stringify(dados.badges));
      }
      // Sincroniza Progressos
      if (dados.progressos) {
        Object.entries(dados.progressos).forEach(([id, info]) => {
          localStorage.setItem(`progresso-${id}`, info.fase.toString());
          localStorage.setItem(`nota-${id}`, info.nota.toString());
        });
      }
      console.log("🔄 Sincronização com SQLite concluída!");
    }
  }

  const handleLoginSucesso = () => {
    setAutenticado(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setAutenticado(false);
    setPaginaAtual('selecao-modulo');
  };

  if (!autenticado) {
    return <Login onLoginSucesso={handleLoginSucesso} />;
  }

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
    setPaginaAtual('teoria');
    unlockBadge('primeiro-passo');
  };

  // 3. Navegação: Teoria -> Canvas (Laboratório)
  const handleIrParaCanvas = (licaoId) => {
    setPaginaAtual('canvas');
    unlockBadge('explorador');
  };

  return (
    <>
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

      {/* 4. Laboratório (Canvas ou Pipeline Linear dependendo do contexto) */}
      {paginaAtual === 'canvas' && (
        ['trilha-limpeza', 'trilha-engenharia', 'trilha-amostragem'].includes(licaoAtual) ? (
          <CleaningPipeline 
            licaoId={licaoAtual}
            voltarAoMenu={() => setPaginaAtual('teoria')} 
          />
        ) : (
          <FlowDesigner 
            licaoId={licaoAtual}
            voltarAoMenu={() => setPaginaAtual('teoria')} 
          />
        )
      )}
    </ReactFlowProvider>
    <BadgeNotification />
    </>
  );
}
