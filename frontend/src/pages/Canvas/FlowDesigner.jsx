import React, { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Background,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { ConditionNode, EndNode, TableNode, ParametrizedNode } from "../../components/flow/CustomNodes";
import CustomControls from "../../components/flow/CustomControls";
import MissionTracker from "../../components/flow/MissionTracker";
import { UI_STYLES } from "../../constants/data";
import { useToast } from "../../contexts/ToastContext";
import Tooltip from "../../components/ui/Tooltip";

const initialNodes = [
  {
    id: "pergunta-1",
    position: { x: 250, y: 30 },
    data: { label: "🎯 Missão 1: A Renda Familiar afeta a Nota do ENEM?" },
    type: "input",
    draggable: false,
    style: {
      background: "#1e293b",
      color: "white",
      fontWeight: "bold",
      width: 400,
      borderRadius: "8px",
      padding: "15px",
      textAlign: "center",
    },
  },
];

function FlowDesigner({ licaoId, voltarAoMenu }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLocked, setIsLocked] = useState(false);
  const toast = useToast();

  const nodeTypes = useMemo(
    () => ({ condition: ConditionNode, end: EndNode, table: TableNode, parametrized: ParametrizedNode }),
    [],
  );

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { strokeWidth: 2, stroke: "#64748b" },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  const deleteSelected = () => {
    setNodes((nds) => nds.filter((n) => !n.selected && n.id !== "pergunta-1"));
    setEdges((eds) => eds.filter((e) => !e.selected));
    toast.info("Item(s) excluído(s).");
  };

  const addBlock = (label, color, tipo = "default") => {
    const newNode = {
      id: `node-${Date.now()}`,
      position: { x: Math.random() * 100 + 150, y: Math.random() * 100 + 150 },
      data: { label, color },
      type: tipo,
      style:
        tipo === "default"
          ? {
              background: color,
              color: "white",
              fontWeight: "bold",
              borderRadius: "8px",
              padding: "10px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              fontSize: "13px",
            }
          : undefined,
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const submitHypothesis = async () => {
    const payloadParaPython = {
      elementos: nodes.map((n) => ({
        id: n.id,
        nome: n.data.label,
        tipo: n.type,
        parametros: n.type === 'parametrized' ? { dependente: n.data.param1, agrupador: n.data.param2 } : undefined
      })),
      conexoes: edges.map((e) => ({
        origem_id: e.source,
        saida_utilizada: e.sourceHandle,
        destino_id: e.target,
      })),
    };
    console.log("📦 Pacote pronto para envio:", payloadParaPython);
    toast.success("Grafo compilado e validado! Abra o Console (F12) para ver o Payload JSON.");
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* SIDEBAR DO CANVAS */}
      <div
        style={{
          width: "320px",
          background: "#f8fafc",
          padding: "15px",
          borderRight: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          overflowY: "auto",
        }}
      >
        <button
          onClick={voltarAoMenu}
          style={{
            padding: "10px",
            background: "#e2e8f0",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          ⬅ Voltar ao Menu
        </button>

        <div>
          <h2 style={{ margin: 0, color: "#0f172a", fontSize: "20px" }}>
            🛠️ Ferramentas
          </h2>
          <p style={{ fontSize: "12px", color: "#64748b" }}>
            Construa a lógica visual da análise.
          </p>
        </div>
        <hr
          style={{
            border: "none",
            borderTop: "1px solid #e2e8f0",
            margin: "2px 0",
          }}
        />

        <h4 style={{ margin: "0", color: "#475569", fontSize: "13px" }}>
          1. Exploração (EDA)
        </h4>
        <Tooltip text="Inicia a trilha de dados com a base principal">
          <button onClick={() => addBlock("📊 Microdados ENEM", "#2563eb")} style={UI_STYLES.btnStyle}>+ Base ENEM 2023</button>
        </Tooltip>
        <Tooltip text="Visualiza as 5 primeiras linhas da tabela de dados">
          <button onClick={() => addBlock("👁️ Ver Tabela (Head)", "#0891b2", "table")} style={UI_STYLES.btnStyle}>+ Visualizar Tabela</button>
        </Tooltip>
        <Tooltip text="Obter 'N', o total de observações na base">
          <button onClick={() => addBlock("🧮 Contar Amostras (N)", "#0891b2")} style={UI_STYLES.btnStyle}>+ Descobrir "N"</button>
        </Tooltip>
        <Tooltip text="Ver a distribuição das notas de matemática, por exemplo">
          <button onClick={() => addBlock("📉 Histograma", "#0891b2")} style={UI_STYLES.btnStyle}>+ Ver Distribuição</button>
        </Tooltip>
        <Tooltip text="Decisão estatística baseada no número de amostras">
          <button onClick={() => addBlock("N > 5000?", "#eab308", "condition")} style={UI_STYLES.btnStyle}>+ Condição: N &gt; 5000?</button>
        </Tooltip>

        <h4 style={{ margin: "5px 0 0 0", color: "#475569", fontSize: "13px" }}>
          2. Testes de Normalidade
        </h4>
        <Tooltip text="Passo para verificar se os dados formam a curva do sino">
          <button onClick={() => addBlock("É Normal?", "#eab308", "condition")} style={UI_STYLES.btnStyle}>+ Condição: É Normal?</button>
        </Tooltip>
        <Tooltip text="Usado em amostras grandes (>50)">
          <button onClick={() => addBlock("⚖️ Kolmogorov (N Alto)", "#8b5cf6")} style={UI_STYLES.btnStyle}>+ Kolmogorov-Smirnov</button>
        </Tooltip>
        <Tooltip text="Melhor para amostras pequenas (<50)">
          <button onClick={() => addBlock("⚖️ Shapiro (N Baixo)", "#a855f7")} style={UI_STYLES.btnStyle}>+ Shapiro-Wilk</button>
        </Tooltip>

        <h4 style={{ margin: "5px 0 0 0", color: "#475569", fontSize: "13px" }}>
          3. Inferência (Testes Globais)
        </h4>
        <Tooltip text="Decide o teste com base na normalidade provada">
          <button onClick={() => addBlock("A Curva é Normal?", "#eab308", "condition")} style={UI_STYLES.btnStyle}>+ Condição: É Normal?</button>
        </Tooltip>
        <Tooltip text="Compara a média de +3 grupos normais (Ex: Tipo de escola x Nota)">
          <button onClick={() => addBlock("🧮 ANOVA (Paramétrico)", "#ef4444", "parametrized")} style={UI_STYLES.btnStyle}>+ ANOVA (Paramétrico)</button>
        </Tooltip>
        <Tooltip text="Alternativa não-paramétrica quando não há normalidade">
          <button onClick={() => addBlock("🧮 Kruskal-Wallis", "#16a34a", "parametrized")} style={UI_STYLES.btnStyle}>+ Kruskal-Wallis</button>
        </Tooltip>

        <h4 style={{ margin: "5px 0 0 0", color: "#475569", fontSize: "13px" }}>
          4. Avaliação de Significância
        </h4>
        <Tooltip text="Rejeitamos a Hipótese Nula se P < 0.05">
          <button onClick={() => addBlock("P-valor < 0.05?", "#eab308", "condition")} style={UI_STYLES.btnStyle}>+ Condição: P-valor &lt; 0.05?</button>
        </Tooltip>

        <h4 style={{ margin: "5px 0 0 0", color: "#475569", fontSize: "13px" }}>
          5. Tamanho do Efeito (Força)
        </h4>
        <Tooltip text="A diferença existe, mas quão forte ela é em dados não-normais?">
          <button onClick={() => addBlock("📏 Epsilon² (Kruskal)", "#0f766e")} style={UI_STYLES.btnStyle}>+ Epsilon² (Kruskal-Wallis)</button>
        </Tooltip>
        <Tooltip text="Força da diferença na ANOVA">
          <button onClick={() => addBlock("📏 Eta² (ANOVA)", "#0f766e")} style={UI_STYLES.btnStyle}>+ Eta² (ANOVA)</button>
        </Tooltip>

        <h4 style={{ margin: "5px 0 0 0", color: "#475569", fontSize: "13px" }}>
          6. Post-Hoc (Quem é diferente?)
        </h4>
        <Tooltip text="Descobre especificamente quais grupos diferem (Kruskal)">
          <button onClick={() => addBlock("🔥 Heatmap de Dunn", "#d97706")} style={UI_STYLES.btnStyle}>+ Post-Hoc de Dunn</button>
        </Tooltip>
        <Tooltip text="Compara de pares todos contra todos (ANOVA)">
          <button onClick={() => addBlock("📊 Post-Hoc de Tukey", "#d97706")} style={UI_STYLES.btnStyle}>+ Post-Hoc de Tukey</button>
        </Tooltip>

        <h4 style={{ margin: "5px 0 0 0", color: "#475569", fontSize: "13px" }}>
          7. Conclusão
        </h4>
        <Tooltip text="Não há evidências para dizer que há diferença nas notas">
          <button onClick={() => addBlock("🛑 Fim: Aceitar H0 (p ≥ 0.05)", "#94a3b8", "end")} style={UI_STYLES.btnStyle}>+ Fim: Aceitar H0</button>
        </Tooltip>
        <Tooltip text="Resultados significativos encontrados!">
          <button onClick={() => addBlock("🏆 Fim: Análise Concluída", "#10b981", "end")} style={UI_STYLES.btnStyle}>+ Fim: Sucesso</button>
        </Tooltip>
      </div>

      {/* ÁREA DE DESENHO DO CANVAS */}
      <div style={{ flex: 1, position: "relative" }}>
        <MissionTracker licaoId={licaoId} nodes={nodes} edges={edges} />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          nodesDraggable={!isLocked}
          fitView
        >
          <Panel position="top-right" style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={deleteSelected}
              style={{
                padding: "10px 15px",
                background: "white",
                color: "#ef4444",
                border: "1px solid #ef4444",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            >
              🗑️ Excluir Selecionado
            </button>
            <button
              onClick={() => setIsLocked(!isLocked)}
              style={{
                padding: "10px 15px",
                background: isLocked ? "#ef4444" : "#e2e8f0",
                color: isLocked ? "white" : "black",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {isLocked ? "🔒 Destravar" : "🔓 Travar"}
            </button>
            <button
              onClick={submitHypothesis}
              style={{
                padding: "10px 20px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            >
              🚀 Validar Hipótese
            </button>
          </Panel>
          <CustomControls />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
          <Background variant="dots" gap={15} size={2} color="#cbd5e1" />
        </ReactFlow>
      </div>
    </div>
  );
}

export default FlowDesigner;
