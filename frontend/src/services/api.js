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

export const buscarStatusProcessamento = async (processId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/status/${processId}`);
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar status:", error);
    throw error;
  }
};
