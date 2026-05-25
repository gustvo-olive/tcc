/**
 * Serviço de Integração com o Backend (Python/FastAPI)
 * Responsável por enviar a estrutura do Grafo e gerenciar autenticação.
 */

const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Helper para obter o ID do usuário logado
const getUserId = () => localStorage.getItem('tcc_user_id');

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const userId = getUserId();
  if (userId) {
    headers['X-User-Id'] = userId;
  }
  return headers;
};

export const loginUsuario = async (email, senha) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
    if (!response.ok) throw new Error('Credenciais inválidas');
    const data = await response.json();
    localStorage.setItem('tcc_user_id', data.usuario_id);
    localStorage.setItem('tcc_user_nome', data.nome);
    return data;
  } catch (error) {
    console.error("Erro no login:", error);
    throw error;
  }
};

export const registrarUsuario = async (nome, email, senha) => {
  try {
    const response = await fetch(`${API_BASE_URL}/registrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha }),
    });
    if (!response.ok) throw new Error('Erro ao registrar usuário');
    const data = await response.json();
    localStorage.setItem('tcc_user_id', data.usuario_id);
    localStorage.setItem('tcc_user_nome', data.nome);
    return data;
  } catch (error) {
    console.error("Erro no registro:", error);
    throw error;
  }
};

export const enviarGrafoParaProcessamento = async (nodes, edges, licaoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/processar-fluxo`, {
      method: 'POST',
      headers: getHeaders(),
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
    const userId = getUserId();
    if (!userId) return null;

    const response = await fetch(`${API_BASE_URL}/usuario/dados-completos`, {
      headers: getHeaders()
    });
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
      headers: getHeaders(),
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
      headers: getHeaders(),
      body: JSON.stringify({ badge_id: badgeId }),
    });
    return await response.json();
  } catch (error) {
    console.warn("Erro ao salvar badge no backend:", error);
  }
};
