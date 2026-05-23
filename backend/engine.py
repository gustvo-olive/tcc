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
        
        # O ponto de partida deve ser o nó do tipo 'input' (a pergunta)
        self.id_inicio = self._find_node_id_by_type("input") or self._find_node_id_by_label("Base")
        
        if self.id_inicio:
            self._run_dfs(self.id_inicio)

    def _find_node_id_by_type(self, node_type: str) -> str:
        for n in self.nodes:
            if n.get('type') == node_type:
                return n.get('id')
        return None

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
                "lista_labels": ["📊 Base de Dados", "⚖️ Kolmogorov-Smirnov", "⚖️ Teste de Levene", "🧮 Kruskal-Wallis", "📏 Epsilon²", "🏆 Sucesso"],
                "pesos": {"📊 Base de Dados": 10, "⚖️ Kolmogorov-Smirnov": 10, "⚖️ Teste de Levene": 10, "🧮 Kruskal-Wallis": 20, "📏 Epsilon²": 5, "🏆 Sucesso": 10},
                "precedencias": {"🧮 Kruskal-Wallis": ["⚖️ Teste de Levene"], "🏆 Sucesso": ["🧮 Kruskal-Wallis"]},
                "soma_total_pesos": 65
            },
            "trilha-dois-grupos": {
                "lista_labels": ["📊 Base de Dados", "⚖️ Kolmogorov-Smirnov", "🧮 Mann-Whitney", "📏 d de Cohen", "🏆 Sucesso"],
                "pesos": {"📊 Base de Dados": 10, "⚖️ Kolmogorov-Smirnov": 10, "🧮 Mann-Whitney": 20, "📏 d de Cohen": 5, "🏆 Sucesso": 10},
                "precedencias": {"🧮 Mann-Whitney": ["⚖️ Kolmogorov-Smirnov"], "🏆 Sucesso": ["🧮 Mann-Whitney"]},
                "soma_total_pesos": 55
            },
            "trilha-associacao-pearson": {
                "lista_labels": ["📊 Base de Dados", "🧮 Contar N", "⚖️ Shapiro-Wilk", "🧮 Pearson (r)", "🏆 Sucesso"],
                "pesos": {"📊 Base de Dados": 10, "🧮 Contar N": 5, "⚖️ Shapiro-Wilk": 10, "🧮 Pearson (r)": 20, "🏆 Sucesso": 10},
                "precedencias": {"🧮 Pearson (r)": ["⚖️ Shapiro-Wilk"], "🏆 Sucesso": ["🧮 Pearson (r)"]},
                "soma_total_pesos": 55
            },
            "trilha-associacao-chi2": {
                "lista_labels": ["📊 Base de Dados", "🧮 Qui-Quadrado (χ²)", "🏆 Sucesso"],
                "pesos": {"📊 Base de Dados": 10, "🧮 Qui-Quadrado (χ²)": 20, "🏆 Sucesso": 10},
                "precedencias": {"🏆 Sucesso": ["🧮 Qui-Quadrado (χ²)"]},
                "soma_total_pesos": 40
            }
        }
        return defaults.get(self.licao_id, defaults["trilha-multiplos-grupos"])

    def _extrair_pesos_do_flow_json(self, flow_data: Dict) -> Dict:
        """ Extrai labels, dependências e atribui pesos por importância """
        nos_esperados = {} # id -> label
        mapeamento_pesos = {} # id -> peso (para garantir soma correta)
        
        # Categorias de peso
        CRITICOS = ["teste t", "mann-whitney", "anova", "kruskal", "pearson", "spearman", "qui-quadrado"]
        ESSENCIAIS = ["microdados", "base", "kolmogorov", "shapiro", "levene", "sucesso", "normal?", "n > 5000?", "boxplot", "dispersão", "cramer"]
        
        for node in flow_data["nodes"]:
            label = node.get('data', {}).get('label', '')
            node_type = node.get('type', '')
            
            if label and "🎯" not in label and "DESAFIO" not in label and node_type != "input":
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
        
        if not self.id_inicio:
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
                            msg = self._get_pedagogical_error(label_esperada)
                            erros.append(f"⚖️ Rigor: {msg}")
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
        # Em PBL, se o aluno chegou ao Sucesso com rigor (sem erros), a nota deve ser alta.
        if soma_total_gabarito > 0:
            nota_percentual = int((pontos_aluno / soma_total_gabarito) * 100)
        else:
            nota_percentual = 0
        
        # Bônus de Conclusão: Se chegou ao Sucesso sem erros de rigor, nota mínima 100
        id_sucesso = self._find_node_id_by_label("Sucesso")
        if id_sucesso and id_sucesso in self.nos_alcancaveis and not erros:
            nota_percentual = 100

        # Penalidade Crítica: Se não chegar ao Sucesso, teto de 30%
        if not id_sucesso or id_sucesso not in self.nos_alcancaveis:
            nota_percentual = min(nota_percentual, 30)
            if not any("Pipeline incompleto" in e for e in erros):
                erros.append("Pipeline incompleto: O fluxo não conclui com o nó de Sucesso. O objetivo da ciência é chegar a uma conclusão fundamentada!")

        return {
            "status": "concluido" if nota_percentual >= 60 else "erro_metodologico",
            "nota": min(nota_percentual, 100),
            "acertos": acertos,
            "erros": erros,
            "alertas": alertas,
            "patente": self._get_patente(nota_percentual)
        }

    def _get_pedagogical_error(self, label: str) -> str:
        messages = {
            "teste t": "Você tentou rodar o Teste T sem antes verificar a Normalidade ou Homocedasticidade. Testes paramétricos exigem que os pressupostos sejam validados primeiro!",
            "anova": "A ANOVA exige que você verifique a Normalidade e a Homocedasticidade (Levene) dos grupos antes de realizar a comparação das médias.",
            "kruskal-wallis": "Lembre-se de verificar a Homocedasticidade (Levene) antes de rodar o Kruskal-Wallis para garantir que a comparação entre os grupos seja válida.",
            "mann-whitney": "O Mann-Whitney é um teste não-paramétrico, mas ainda assim é essencial verificar a distribuição dos dados (K-S) antes de prosseguir.",
            "epsilon²": "O cálculo do tamanho do efeito (Epsilon²) deve vir obrigatoriamente após a confirmação de uma diferença significativa no teste de hipótese.",
            "d de cohen": "O d de Cohen deve ser calculado apenas após encontrar um p-valor significativo no teste de comparação de grupos (Teste T ou Mann-Whitney).",
            "sucesso": "O nó de Sucesso representa a conclusão da sua investigação e só deve ser conectado após todos os testes e pressupostos necessários.",
            "kolmogorov-smirnov": "Antes de testar a normalidade, certifique-se de que a base de dados foi carregada e o N foi contado corretamente.",
            "shapiro-wilk": "O teste de Shapiro-Wilk deve ser precedido pelo carregamento dos dados e análise do tamanho da amostra (N)."
        }
        
        lower_label = label.lower()
        for key, msg in messages.items():
            if key in lower_label:
                return msg
        return f"O bloco '{label}' foi conectado fora da ordem lógica do método científico."

    def _get_patente(self, nota: int) -> str:
        if nota >= 95: return "Mestre da Estatística 🏆"
        if nota >= 70: return "Cientista de Dados 📊"
        if nota >= 40: return "Pesquisador Júnior 📑"
        return "Analista Iniciante 🧪"
