import React from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";

export const ConditionNode = ({ data }) => {
  return (
    <div
      style={{
        width: 100,
        height: 100,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ background: "#333", width: "10px", height: "10px" }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="nao"
        style={{
          background: "#ef4444",
          width: "12px",
          height: "12px",
          left: "-6px",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "-30px",
          color: "#ef4444",
          fontWeight: "bold",
          fontSize: "13px",
          textShadow: "1px 1px 0 #fff",
        }}
      >
        Não
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="sim"
        style={{
          background: "#10b981",
          width: "12px",
          height: "12px",
          right: "-6px",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "-30px",
          color: "#10b981",
          fontWeight: "bold",
          fontSize: "13px",
          textShadow: "1px 1px 0 #fff",
        }}
      >
        Sim
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ background: "#333", width: "10px", height: "10px" }}
      />
      <div
        style={{
          position: "absolute",
          width: "80%",
          height: "80%",
          background: "#eab308",
          transform: "rotate(45deg)",
          borderRadius: "8px",
          zIndex: -1,
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        }}
      ></div>
      <div
        style={{
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
          fontSize: "11px",
          zIndex: 1,
          padding: "5px",
        }}
      >
        {data.label}
      </div>
    </div>
  );
};

export const EndNode = ({ data }) => {
  return (
    <div
      style={{
        padding: "10px 20px",
        background: data.color || "#ef4444",
        color: "white",
        fontWeight: "bold",
        borderRadius: "50px",
        textAlign: "center",
        border: "2px solid rgba(0,0,0,0.2)",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        minWidth: "120px",
        fontSize: "13px",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#333", width: "10px", height: "10px" }}
      />
      {data.label}
    </div>
  );
};

export const TableNode = ({ data, id }) => {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        minWidth: "300px",
        fontFamily: "system-ui, sans-serif"
      }}
    >
      <Handle type="target" position={Position.Top} id="in" />
      <div 
        style={{ 
          background: data.color || "#0891b2", 
          color: "white", 
          padding: "8px 12px",
          fontWeight: "bold",
          fontSize: "13px"
        }}
      >
        {data.label}
      </div>
      <div 
        /* Class 'nodrag' is crucial to allow selecting and scrolling inside the node */
        className="nodrag"
        style={{ padding: "10px", overflowX: "auto", maxHeight: "150px", overflowY: "auto" }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#f1f5f9", color: "#475569" }}>
              <th style={{ padding: "4px" }}>NU_INSCRICAO</th>
              <th style={{ padding: "4px" }}>NU_NOTA_MT</th>
              <th style={{ padding: "4px" }}>TP_ESCOLA</th>
              <th style={{ padding: "4px" }}>Q006 (Renda)</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 210001, nota: 740.2, esc: "Privada", renda: "E" },
              { id: 210002, nota: 420.5, esc: "Pública", renda: "B" },
              { id: 210003, nota: 610.0, esc: "Pública", renda: "C" },
              { id: 210004, nota: 812.3, esc: "Privada", renda: "G" },
              { id: 210005, nota: 550.8, esc: "Pública", renda: "C" }
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "4px" }}>{row.id}</td>
                <td style={{ padding: "4px" }}>{row.nota}</td>
                <td style={{ padding: "4px" }}>{row.esc}</td>
                <td style={{ padding: "4px" }}>{row.renda}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8', marginTop: '5px' }}>
          Simulação (Mock) de Dados .CSV
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="out" />
    </div>
  );
};

export const ParametrizedNode = ({ data, id }) => {
  const { updateNodeData } = useReactFlow();

  const handleSelectChange = (field, value) => {
    updateNodeData(id, { [field]: value });
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        minWidth: "220px",
        fontFamily: "system-ui, sans-serif"
      }}
    >
      <Handle type="target" position={Position.Top} id="in" />
      <div 
        style={{ 
          background: data.color || "#ef4444", 
          color: "white", 
          padding: "8px 12px",
          fontWeight: "bold",
          fontSize: "13px"
        }}
      >
        {data.label}
      </div>
      <div 
        className="nodrag"
        style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: "600", color: "#475569" }}>{data.param1Label || "Variável Dependente"}</label>
          <select 
            value={data.param1 || ""}
            onChange={(e) => handleSelectChange('param1', e.target.value)}
            style={{ 
              padding: "4px", 
              borderRadius: "4px", 
              border: "1px solid #cbd5e1", 
              fontSize: "11px",
              background: "#f8fafc",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="" disabled>Selecione...</option>
            <option value="NU_NOTA_MT">Matemática (NU_NOTA_MT)</option>
            <option value="NU_NOTA_CH">Ciências Humanas (NU_NOTA_CH)</option>
            <option value="NU_NOTA_CN">Ciências Natureza (NU_NOTA_CN)</option>
            <option value="NU_NOTA_LC">Linguagens (NU_NOTA_LC)</option>
            <option value="NU_NOTA_REDACAO">Redação (NU_NOTA_REDACAO)</option>
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: "600", color: "#475569" }}>{data.param2Label || "Fator Agrupador"}</label>
          <select 
            value={data.param2 || ""}
            onChange={(e) => handleSelectChange('param2', e.target.value)}
            style={{ 
              padding: "4px", 
              borderRadius: "4px", 
              border: "1px solid #cbd5e1", 
              fontSize: "11px",
              background: "#f8fafc",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="" disabled>Selecione...</option>
            <option value="TP_ESCOLA">Tipo de Escola (TP_ESCOLA)</option>
            <option value="TP_SEXO">Sexo (TP_SEXO)</option>
            <option value="Q006">Renda Familiar (Q006)</option>
            <option value="SG_UF_RESIDENCIA">UF (SG_UF_RESIDENCIA)</option>
          </select>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="out" />
    </div>
  );
};
