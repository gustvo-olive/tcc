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
                    if "nodes" in data:
                        return self._extrair_pesos_do_flow_json(data)
                    return data
            except: pass

        # Padrões de Segurança (Caso o JSON falhe ou não exista)
        # Seguem a nova lógica: Críticos (20), Essenciais (10), Suporte (5)
        defaults = {
            "trilha-multiplos-grupos": {
                "lista_labels": ["📊 Microdados ENEM", "⚖️ Kolmogorov-Smirnov", "⚖️ Teste de Levene", "🧮 Kruskal-Wallis", "📏 Epsilon²", "🏆 Sucesso"],
                "pesos": {"📊 Microdados ENEM": 10, "⚖️ Kolmogorov-Smirnov": 10, "⚖️ Teste de Levene": 10, "🧮 Kruskal-Wallis": 20, "📏 Epsilon²": 5, "🏆 Sucesso": 10},
                "precedencias": {"🧮 Kruskal-Wallis": ["⚖️ Teste de Levene"], "🏆 Sucesso": ["🧮 Kruskal-Wallis"]},
                "soma_total_pesos": 65
            },
            "trilha-dois-grupos": {
                "lista_labels": ["📊 Microdados ENEM", "⚖️ Kolmogorov-Smirnov", "🧮 Mann-Whitney", "📏 d de Cohen", "🏆 Sucesso"],
                "pesos": {"📊 Microdados ENEM": 10, "⚖️ Kolmogorov-Smirnov": 10, "🧮 Mann-Whitney": 20, "📏 d de Cohen": 5, "🏆 Sucesso": 10},
                "precedencias": {"🧮 Mann-Whitney": ["⚖️ Kolmogorov-Smirnov"], "🏆 Sucesso": ["🧮 Mann-Whitney"]},
                "soma_total_pesos": 55
            }
        }
        return defaults.get(self.licao_id, defaults["trilha-multiplos-grupos"])

    def _extrair_pesos_do_flow_json(self, flow_data: Dict) -> Dict:
        """ Extrai labels, dependências e atribui pesos por importância """
        nos_esperados = {} # id -> label
        mapeamento_pesos = {} # id -> peso (para garantir soma correta)
        
        # Categorias de peso
        CRITICOS = ["teste t", "mann-whitney", "anova", "kruskal", "pearson", "qui-quadrado"]
        ESSENCIAIS = ["microdados", "base", "kolmogorov", "shapiro", "levene", "sucesso", "normal?", "n > 5000?"]
        
        for node in flow_data["nodes"]:
            label = node.get('data', {}).get('label', '')
            if label and "🎯" not in label and "DESAFIO" not in label:
                nid = node['id']
                nos_esperados[nid] = label
                
                # Atribuição de peso baseada no tipo de ferramenta
                lower_label = label.lower()
                peso = 5 # Suporte por padrão
                if any(c in lower_label for c in CRITICOS): peso = 20
                elif any(e in lower_label for e in ESSENCIAIS): peso = 10
                
                mapeamento_pesos[nid] = peso

        # Mapear Precedência
        precedencias = {}
        for edge in flow_data["edges"]:
            src, tgt = edge['source'], edge['target']
            if tgt in nos_esperados:
                label_pai = nos_esperados.get(src)
                if label_pai:
                    if nos_esperados[tgt] not in precedencias:
                        precedencias[nos_esperados[tgt]] = []
                    precedencias[nos_esperados[tgt]].append(label_pai)
        
        return {
            "lista_labels": list(nos_esperados.values()),
            "precedencias": precedencias,
            "mapeamento_pesos": list(mapeamento_pesos.values()),
            "soma_total_pesos": sum(mapeamento_pesos.values())
        }

    def validar(self) -> Dict[str, Any]:
        acertos = []
        erros = []
        alertas = []
        pontos_aluno = 0
        
        if not self.id_base:
            return {"status": "erro_metodologico", "nota": 0, "erros": ["Base de Dados não encontrada!"], "patente": "Iniciante 🧪"}

        config = self.carregar_config_gabarito()
        lista_labels_esperadas = config.get("lista_labels", [])
        precedencias = config.get("precedencias", {})
        pesos_lista = config.get("mapeamento_pesos", [])
        soma_total_gabarito = config.get("soma_total_pesos", 0)

        adj_inversa_aluno = {n['id']: [] for n in self.nodes}
        for edge in self.edges:
            adj_inversa_aluno[edge['target']].append(edge['source'])

        ids_computados_aluno = set()

        # Percorrer o CHECKLIST do GABARITO (usando zip para manter o peso atrelado à posição)
        for i, label_esperada in enumerate(lista_labels_esperadas):
            encontrou_correto = False
            peso_deste_bloco = pesos_lista[i] if i < len(pesos_lista) else 5
            
            for node in self.nodes:
                node_label = node.get('data', {}).get('label', '')
                node_id = node['id']
                
                if label_esperada.lower() in node_label.lower() and node_id not in ids_computados_aluno:
                    
                    # 1. Verificar Conexão
                    if node_id not in self.nos_alcancaveis:
                        erros.append(f"✗ O bloco '{label_esperada}' está solto!")
                        encontrou_correto = True 
                        break
                    
                    # 2. Verificar Precedência (Ordem Lógica)
                    pais_esperados = precedencias.get(label_esperada, [])
                    if pais_esperados:
                        ids_pais_reais = adj_inversa_aluno.get(node_id, [])
                        labels_pais_reais = [next((n.get('data', {}).get('label', '').lower() for n in self.nodes if n['id'] == pid), '') for pid in ids_pais_reais]
                        
                        if not any(any(p_esp.lower() in pr for pr in labels_pais_reais) for p_esp in pais_esperados):
                            erros.append(f"⚖️ Rigor: '{label_esperada}' foi conectado fora de ordem!")
                            encontrou_correto = True
                            break

                    # Sucesso no Bloco!
                    pontos_aluno += peso_deste_bloco
                    acertos.append(f"✓ {label_esperada}")
                    ids_computados_aluno.add(node_id)
                    encontrou_correto = True
                    break
            
            if not encontrou_correto:
                alertas.append(f"! Falta o bloco: {label_esperada}")

        # Cálculo da PORCENTAGEM REAL
        nota_percentual = int((pontos_aluno / soma_total_gabarito) * 100) if soma_total_gabarito > 0 else 0
        
        # Teto de Segurança
        nota_percentual = min(nota_percentual, 100)

        # Penalidade Crítica: Se não chegar ao Sucesso, teto de 30%
        id_sucesso = self._find_node_id_by_label("Sucesso")
        if not id_sucesso or id_sucesso not in self.nos_alcancaveis:
            nota_percentual = min(nota_percentual, 30)
            erros.append("Pipeline incompleto: O fluxo não conclui com o nó de Sucesso.")

        return {
            "status": "concluido" if nota_percentual >= 60 else "erro_metodologico",
            "nota": nota_percentual,
            "acertos": acertos,
            "erros": erros,
            "alertas": alertas,
            "patente": self._get_patente(nota_percentual)
        }

    def _get_patente(self, nota: int) -> str:
        if nota >= 95: return "Mestre da Estatística 🏆"
        if nota >= 70: return "Cientista de Dados 📊"
        if nota >= 40: return "Pesquisador Júnior 📑"
        return "Analista Iniciante 🧪"
