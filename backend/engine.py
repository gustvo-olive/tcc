import json
from typing import List, Dict, Any

class JuizEstatistico:
    """
    O 'Juiz Algorítmico' responsável por validar o rigor científico do fluxograma.
    Ele utiliza DFS para verificar a rastreabilidade e lógica sequencial.
    """
    
    def __init__(self, nodes: List[Dict], edges: List[Dict]):
        self.nodes = nodes
        self.edges = edges
        self.adj = self._build_adjacency_list()
        self.nos_alcancaveis = set()
        self.id_base = self._find_node_id_by_label("Microdados")
        
        if self.id_base:
            self._run_dfs(self.id_base)

    def _build_adjacency_list(self) -> Dict[str, List[str]]:
        adj = {n.get('id'): [] for n in self.nodes}
        for edge in self.edges:
            src, tgt = edge.get('source'), edge.get('target')
            if src in adj:
                adj[src].append(tgt)
        return adj

    def _run_dfs(self, start_id: str):
        stack = [start_id]
        while stack:
            curr = stack.pop()
            if curr not in self.nos_alcancaveis:
                self.nos_alcancaveis.add(curr)
                stack.extend(self.adj.get(curr, []))

    def _find_node_id_by_label(self, fragment: str) -> str:
        for n in self.nodes:
            if fragment.lower() in n.get('data', {}).get('label', '').lower():
                return n.get('id')
        return None

    def validar(self) -> Dict[str, Any]:
        """
        Executa a validação rigorosa e retorna o boletim de desempenho.
        """
        acertos = []
        erros = []
        alertas = []
        nota = 0
        
        # 1. Verificação de Conexão com a Base (Obrigatório)
        if not self.id_base:
            return {
                "status": "erro_metodologico",
                "nota": 0,
                "erros": ["Base de Dados não encontrada no Canvas!"],
                "patente": "Analista Iniciante 🧪"
            }

        # 2. Definição de Pesos (Rigoroso)
        # Se o nó não for alcançável a partir da base, ele vale 0.
        config_pontuacao = {
            "essenciais": {
                "Microdados": 15,
                "Kolmogorov": 15,
                "Kruskal-Wallis": 15,
                "Sucesso": 15
            },
            "bonus": {
                "Levene": 10,
                "Epsilon": 10,
                "Dunn": 10,
                "Tabela": 10
            }
        }

        # Validar Essenciais
        for label_key, pts in config_pontuacao["essenciais"].items():
            node_id = self._find_node_id_by_label(label_key)
            if node_id:
                if node_id in self.nos_alcancaveis:
                    nota += pts
                    acertos.append(f"✓ {label_key} conectado corretamente.")
                else:
                    erros.append(f"✗ O bloco '{label_key}' está solto! Dados não fluem até ele.")
            else:
                alertas.append(f"! Falta o bloco essencial: {label_key}")

        # Validar Bônus
        for label_key, pts in config_pontuacao["bonus"].items():
            node_id = self._find_node_id_by_label(label_key)
            if node_id and node_id in self.nos_alcancaveis:
                nota += pts
                acertos.append(f"✓ BÔNUS: {label_key} integrado.")

        # 3. Penalidade Crítica: O "Caminho da Vitória"
        # Se o nó de Sucesso não é alcançável pela Base, a nota sofre um corte de 50%
        id_sucesso = self._find_node_id_by_label("Sucesso")
        if not id_sucesso or id_sucesso not in self.nos_alcancaveis:
            erros.append("CRÍTICO: A análise não chega a uma conclusão válida (Fluxo Quebrado).")
            nota = min(nota, 30) # Teto de 30 pontos se não houver conclusão conectada

        # 4. Determinar Patente
        patente = "Analista Iniciante 🧪"
        if nota > 90: patente = "Mestre da Estatística 🏆"
        elif nota > 70: patente = "Cientista de Dados 📊"
        elif nota > 40: patente = "Pesquisador Júnior 📑"

        return {
            "status": "concluido" if nota >= 60 else "erro_metodologico",
            "nota": nota,
            "acertos": acertos,
            "erros": erros,
            "alertas": alertas,
            "patente": patente
        }
