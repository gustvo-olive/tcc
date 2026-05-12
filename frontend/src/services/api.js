/**
 * Serviço de Integração com o Backend (Python/Flask ou FastAPI)
 * Responsável por enviar a estrutura do Grafo (Nodes/Edges) do React Flow
 * para execução do pipeline estatístico.
 */

const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const enviarGrafoParaProcessamento = async (nodes, edges, licaoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/processar-fluxo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nodes, edges, licao_id: licaoId }),
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao enviar grafo para o backend:", error);
    throw error;
  }
};

export const buscarDadosUsuario = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/usuario/dados-completos`);
    if (!response.ok) throw new Error('Falha ao carregar dados do usuário');
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    return null;
  }
};

export const salvarProgressoNoBackend = async (licaoId, faseAtual) => {
  try {
    const response = await fetch(`${API_BASE_URL}/usuario/progresso`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licao_id: licaoId, fase_atual: faseAtual }),
    });
    return await response.json();
  } catch (error) {
    console.warn("Erro ao salvar progresso no backend (offline?):", error);
  }
};

export const salvarBadgeNoBackend = async (badgeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/usuario/badge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ badge_id: badgeId }),
    });
    return await response.json();
  } catch (error) {
    console.warn("Erro ao salvar badge no backend:", error);
  }
};
