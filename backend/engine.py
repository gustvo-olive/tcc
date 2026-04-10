import json
import os
from typing import List, Dict, Any

class JuizEstatistico:
    """
    O 'Juiz Algorítmico' responsável por validar o rigor científico do fluxograma.
    Pode carregar gabaritos externos em JSON ou usar padrões internos.
    """
    
    def __init__(self, nodes: List[Dict], edges: List[Dict], licao_id: str):
        self.nodes = nodes
        self.edges = edges
        self.licao_id = licao_id
        self.adj = self._build_adjacency_list()
        self.nos_alcancaveis = set()
        self.id_base = self._find_node_id_by_label("Microdados") or self._find_node_id_by_label("Base")
        
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
            label = n.get('data', {}).get('label', '')
            if fragment.lower() in label.lower():
                return n.get('id')
        return None

    def carregar_config_gabarito(self) -> Dict:
        """
        Tenta carregar o gabarito de um arquivo JSON. 
        Se não existir, retorna a configuração padrão para a trilha.
        """
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        path_gabarito = os.path.join(BASE_DIR, f'gabarito_{self.licao_id}.json')
        
        if os.path.exists(path_gabarito):
            try:
                with open(path_gabarito, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # Se o JSON for o formato do React Flow, extraímos apenas os pesos
                    if "nodes" in data and isinstance(data["nodes"], list):
                        return self._extrair_pesos_do_flow_json(data)
                    return data
            except: pass

        # Padrões Internos (Andaime de Segurança)
        defaults = {
            "trilha-multiplos-grupos": {
                "essenciais": {"Microdados": 15, "Kolmogorov": 15, "Kruskal-Wallis": 15, "🏆 Sucesso": 15},
                "bonus": {"Levene": 10, "Epsilon": 10, "Dunn": 10, "Tabela": 10}
            },
            "trilha-dois-grupos": {
                "essenciais": {"Microdados": 15, "Kolmogorov": 15, "Mann-Whitney": 15, "🏆 Sucesso": 15},
                "bonus": {"Levene": 10, "d de Cohen": 10, "Teste T": 10, "Tabela": 10}
            },
            "trilha-associacao": {
                "essenciais": {"Microdados": 15, "Pearson": 10, "Spearman": 10, "Qui-Quadrado": 15, "🏆 Sucesso": 10},
                "bonus": {"V de Cramer": 10, "Boxplot": 10, "Tabela": 10}
            },
            "trilha-limpeza": {
                "essenciais": {"Microdados": 30, "Tabela": 30, "Contar N": 40},
                "bonus": {}
            }
        }
        return defaults.get(self.licao_id, defaults["trilha-multiplos-grupos"])

    def _extrair_pesos_do_flow_json(self, flow_data: Dict) -> Dict:
        """ Converte um export do React Flow em um formato de pesos para o Juiz """
        # Lógica simplificada: cada nó de ferramenta vale um pouco
        pesos = {"essenciais": {}, "bonus": {}}
        for node in flow_data["nodes"]:
            label = node.get('data', {}).get('label', '')
            if any(x in label for x in ["Microdados", "Kruskal", "ANOVA", "Sucesso", "Pearson", "Qui-Quadrado"]):
                pesos["essenciais"][label] = 15
            else:
                pesos["bonus"][label] = 10
        return pesos

    def validar(self) -> Dict[str, Any]:
        acertos = []
        erros = []
        alertas = []
        nota = 0
        
        if not self.id_base:
            return {"status": "erro_metodologico", "nota": 0, "erros": ["Base de Dados não encontrada!"], "patente": "Iniciante 🧪"}

        config = self.carregar_config_gabarito()

        # Validar Essenciais
        for label_key, pts in config.get("essenciais", {}).items():
            node_id = self._find_node_id_by_label(label_key)
            if node_id:
                if node_id in self.nos_alcancaveis:
                    nota += pts
                    acertos.append(f"✓ {label_key} conectado.")
                else:
                    erros.append(f"✗ O bloco '{label_key}' está solto!")
            else:
                alertas.append(f"! Falta o bloco: {label_key}")

        # Validar Bônus
        for label_key, pts in config.get("bonus", {}).items():
            node_id = self._find_node_id_by_label(label_key)
            if node_id and node_id in self.nos_alcancaveis:
                nota += pts
                acertos.append(f"✓ BÔNUS: {label_key} integrado.")

        # Penalidade de Desconexão (Caminho para o Sucesso)
        id_sucesso = self._find_node_id_by_label("Sucesso") or self._find_node_id_by_label("H0")
        if not id_sucesso or id_sucesso not in self.nos_alcancaveis:
            if self.licao_id != "trilha-limpeza":
                erros.append("Fluxo não alcança uma conclusão válida.")
                nota = min(nota, 30)

        # Patente
        patente = "Analista Iniciante 🧪"
        if nota > 90: patente = "Mestre da Estatística 🏆"
        elif nota > 70: patente = "Cientista de Dados 📊"
        elif nota > 40: patente = "Pesquisador Júnior 📑"

        return {
            "status": "concluido" if nota >= 60 else "erro_metodologico",
            "nota": min(nota, 100),
            "acertos": acertos,
            "erros": erros,
            "alertas": alertas,
            "patente": patente
        }
