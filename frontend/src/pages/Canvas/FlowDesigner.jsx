import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Background,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ConditionNode, EndNode, ToolNode } from '../../components/flow/CustomNodes';
import CustomControls from '../../components/flow/CustomControls';
import { UI_STYLES } from '../../constants/data';
import { TRILHAS_CONTENT } from '../../constants/lessonsContent';
import { enviarGrafoParaProcessamento } from '../../services/api';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import Tooltip from '../../components/ui/Tooltip';
import CanvasTutorial from '../../components/ui/CanvasTutorial';
import { toPng } from 'html-to-image';
import { unlockBadge } from '../../services/badgeService';

// --- CONSTANTES FORA DO COMPONENTE PARA ESTABILIDADE ---
const DIC_RENDA_COMPLETO = {
  'A': 'A: Nenhuma Renda', 'B': 'B: Até R$ 998,00', 'C': 'C: R$ 998 - R$ 1.497',
  'D': 'D: R$ 1.497 - R$ 1.996', 'E': 'E: R$ 1.996 - R$ 2.495', 'F': 'F: R$ 2.495 - R$ 2.994',
  'G': 'G: R$ 2.994 - R$ 3.992', 'H': 'H: R$ 3.992 - R$ 4.990', 'I': 'I: R$ 4.990 - R$ 5.988',
  'J': 'J: R$ 5.988 - R$ 6.986', 'K': 'K: R$ 6.986 - R$ 7.984', 'L': 'L: R$ 7.984 - R$ 8.982',
  'M': 'M: R$ 8.982 - R$ 9.980', 'N': 'N: R$ 9.980 - R$ 11.976', 'O': 'O: R$ 11.976 - R$ 14.970',
  'P': 'P: R$ 14.970 - R$ 19.960', 'Q': 'Q: Mais de R$ 19.960'
};

const nodeTypes = { 
  condition: ConditionNode, 
  end: EndNode,
  tool: ToolNode 
};

function FlowDesigner({ licaoId, voltarAoMenu }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [enviando, setEnviando] = useState(false);
  
  const [dadosReais, setDadosReais] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [modalConfig, setModalConfig] = useState({ titulo: '', conteudo: null });

  const { screenToFlowPosition } = useReactFlow();

  // Widget para Resultados de Testes Estatísticos
  const WidgetTesteEstatistico = ({ nome, estatistica, pValor, interpretacao, cor }) => (
    <div style={{ padding: '20px', borderLeft: `6px solid ${cor}`, background: '#f8fafc', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>{nome}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Estatística</span>
          <strong style={{ fontSize: '20px', color: '#1e293b' }}>{estatistica}</strong>
        </div>
        <div style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>P-Valor</span>
          <strong style={{ fontSize: '20px', color: parseFloat(pValor) < 0.05 ? '#ef4444' : '#10b981' }}>{pValor}</strong>
        </div>
      </div>
      <div style={{ background: parseFloat(pValor) < 0.05 ? '#fef2f2' : '#f0fdf4', padding: '15px', borderRadius: '8px', border: `1px solid ${parseFloat(pValor) < 0.05 ? '#fee2e2' : '#dcfce7'}` }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}><strong>Resultado:</strong> {interpretacao}</p>
      </div>
    </div>
  );

  // Componente de Boxplot
  // Boxplot Dinâmico (Adaptativo para Renda ou Sexo)
  const DynamicBoxPlot = ({ dados, groupKey }) => {
    if (!dados || dados.length === 0) return <p>Sem dados.</p>;
    
    const DIC_SEXO = { 'M': 'Masculino', 'F': 'Feminino' };
    
    // Agrupar dados e calcular estatísticas
    const grupos = {};
    dados.forEach(d => {
      const val = d[groupKey];
      if (val === null || val === undefined) return;
      if (!grupos[val]) grupos[val] = [];
      
      // Tenta pegar a nota de diferentes colunas possíveis (ENEM vs Didático)
      const nota = d['NOTA_GERAL'] !== undefined ? d['NOTA_GERAL'] : d['NOTA_EXAME'];
      if (nota !== undefined && nota !== null) grupos[val].push(nota);
    });

    // Ordenar categorias existentes (remove vazias)
    const categoriasAtivas = Object.keys(grupos).sort();
    
    return (
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ color: '#1e293b', marginBottom: '20px' }}>📊 Distribuição por {groupKey === 'TP_SEXO' ? 'Sexo' : 'Renda'}</h4>
        <div style={{ overflowX: 'auto', paddingBottom: '20px' }}>
          <div style={{ minWidth: Math.max(categoriasAtivas.length * 60, 400) + 'px', height: '300px', position: 'relative', display: 'flex', alignItems: 'flex-end', paddingLeft: '50px', borderLeft: '2px solid #cbd5e1', borderBottom: '2px solid #cbd5e1' }}>
            {[0, 250, 500, 750, 1000].map(val => (
              <div key={val} style={{ position: 'absolute', bottom: `${val * 0.25}px`, left: '-45px', width: '100%', borderTop: '1px dashed #e2e8f0', display: 'flex' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>{val}</span>
              </div>
            ))}
            {categoriasAtivas.map(cat => {
              const notas = grupos[cat].sort((a, b) => a - b);
              if (notas.length === 0) return null;
              const q1 = notas[Math.floor(notas.length * 0.25)];
              const median = notas[Math.floor(notas.length * 0.5)];
              const q3 = notas[Math.floor(notas.length * 0.75)];
              const min = notas[0];
              const max = notas[notas.length - 1];
              const label = groupKey === 'TP_SEXO' ? (DIC_SEXO[cat] || cat) : cat;
              
              return (
                <div key={cat} style={{ flex: 1, height: '100%', position: 'relative', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: '1px', background: '#475569', height: `${(max - min) * 0.25}px`, position: 'absolute', bottom: `${min * 0.25}px` }}></div>
                  <div style={{ width: '30px', background: groupKey === 'TP_SEXO' ? (cat === 'M' ? '#3b82f6' : '#ec4899') : 'rgba(99, 102, 241, 0.8)', border: '1px solid #4338ca', height: `${(q3 - q1) * 0.25}px`, position: 'absolute', bottom: `${q1 * 0.25}px`, zIndex: 2 }}>
                    <div style={{ width: '100%', height: '2px', background: 'white', position: 'absolute', top: `${(q3 - median) * 0.25}px` }}></div>
                  </div>
                  <div style={{ position: 'absolute', bottom: '-40px', textAlign: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Componente de Gráfico de Dispersão (SVG)
  const ScatterPlot = ({ dados }) => {
    if (!dados || dados.length === 0) return <p>Sem dados.</p>;
    
    // Filtra dados válidos para associação (Renda vs Nota)
    const validData = dados.filter(d => d.HORAS_ESTUDO !== null && d.NOTA_EXAME !== null);
    if (validData.length === 0) return <p>A base atual não possui colunas numéricas compatíveis.</p>;

    const maxX = Math.max(...validData.map(d => d.HORAS_ESTUDO));
    const maxY = 1000; // Teto do ENEM
    
    return (
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ color: '#1e293b', marginBottom: '20px' }}>📈 Relação: Horas de Estudo vs Nota do Exame</h4>
        <svg width="100%" height="300" viewBox="0 0 400 300" style={{ overflow: 'visible' }}>
          {/* Eixos */}
          <line x1="40" y1="260" x2="380" y2="260" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="40" y1="20" x2="40" y2="260" stroke="#cbd5e1" strokeWidth="2" />
          
          {/* Pontos */}
          {validData.slice(0, 100).map((d, i) => (
            <circle 
              key={i} 
              cx={40 + (d.HORAS_ESTUDO / maxX) * 320} 
              cy={260 - (d.NOTA_EXAME / maxY) * 240} 
              r="3" 
              fill="#6366f1" 
              opacity="0.6" 
            />
          ))}
          
          {/* Legendas */}
          <text x="210" y="290" textAnchor="middle" fontSize="10" fill="#94a3b8">Horas de Estudo (X)</text>
          <text x="10" y="150" textAnchor="middle" fontSize="10" fill="#94a3b8" transform="rotate(-90 10,150)">Nota Final (Y)</text>
        </svg>
        <div style={{ marginTop: '20px', fontSize: '12px', color: '#1e40af', background: '#e0f2fe', padding: '15px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
          <strong>💡 Por que este gráfico é importante?</strong><br />
          Antes de calcular a correlação, você deve observar se os pontos seguem uma tendência linear (uma linha subindo ou descendo). Se os pontos estiverem aleatórios, o Pearson não terá sentido!
        </div>
      </div>
    );
  };

  // Gráfico de Barras Agrupadas (Proporcional)
  const StackedBarChart = ({ stats }) => {
    const data = stats?.chi2?.tabela;
    if (!data) return <p style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Aguardando processamento do Qui-Quadrado...</p>;

    const categoriasX = Object.keys(data);
    const legendasY = Object.keys(Object.values(data)[0]);
    const cores = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b'];

    return (
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ color: '#1e293b', marginBottom: '20px', textAlign: 'center' }}>📊 Proporção por Categoria</h4>
        <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '40px', padding: '0 40px', borderBottom: '2px solid #cbd5e1' }}>
          {categoriasX.map(cat => {
            const valores = Object.values(data[cat]);
            const total = valores.reduce((a, b) => a + b, 0);
            
            return (
              <div key={cat} style={{ flex: 1, display: 'flex', flexDirection: 'column-reverse', height: '100%', position: 'relative' }}>
                {valores.map((val, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      width: '100%', 
                      height: `${(val / total) * 100}%`, 
                      background: cores[i % cores.length],
                      transition: 'height 0.5s ease'
                    }} 
                    title={`${legendasY[i]}: ${val} (${((val/total)*100).toFixed(1)}%)`}
                  />
                ))}
                <div style={{ position: 'absolute', bottom: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  {cat}
                </div>
              </div>
            );
          })}
        </div>
        {/* Legenda */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '40px', flexWrap: 'wrap' }}>
          {legendasY.map((l, i) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', background: cores[i % cores.length], borderRadius: '2px' }} />
              <span style={{ fontSize: '11px', color: '#64748b' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const abrirWidget = useCallback((label, dadosAtuais, stats) => {
    let conteudo = null;
    const lowerLabel = label.toLowerCase();

    if (lowerLabel.includes('tabela de contingência')) {
      const tabela = stats?.chi2?.tabela;
      conteudo = tabela ? (
        <div style={{ padding: '10px' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#475569', fontSize: '14px', textAlign: 'center' }}>📊 Frequências Observadas (Cruzamento)</h4>
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '10px', textAlign: 'left', color: '#64748b' }}>Variável</th>
                  {Object.keys(Object.values(tabela)[0]).map(col => (
                    <th key={col} style={{ borderBottom: '2px solid #e2e8f0', padding: '10px', textAlign: 'center', color: '#64748b' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(tabela).map(([row, cols]) => (
                  <tr key={row}>
                    <td style={{ borderBottom: '1px solid #f1f5f9', padding: '10px', fontWeight: 'bold', color: '#1e293b' }}>{row}</td>
                    {Object.values(cols).map((val, i) => (
                      <td key={i} style={{ borderBottom: '1px solid #f1f5f9', padding: '10px', textAlign: 'center' }}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : <p style={{ textAlign: 'center', color: '#94a3b8' }}>Aguardando análise de associação...</p>;
    }
    else if (lowerLabel.includes('barras agrupadas')) {
      conteudo = <StackedBarChart stats={stats} />;
    }
    else if (lowerLabel.includes('tabela') || lowerLabel.includes('base')) {
      conteudo = <DataTable data={dadosAtuais} />;
    } 
    else if (lowerLabel.includes('dispersão')) {
      conteudo = <ScatterPlot dados={dadosAtuais} />;
    }
    else if (lowerLabel.includes('distribuição') || lowerLabel.includes('boxplot')) {
      conteudo = <DynamicBoxPlot dados={dadosAtuais} groupKey={stats?.boxplot_group || 'Q006'} />;
    }
    else if (lowerLabel.includes('shapiro') || lowerLabel.includes('kolmogorov')) {
      const isKS = lowerLabel.includes('kolmogorov');
      const s = isKS ? stats?.ks : stats?.shapiro;
      conteudo = (
        <WidgetTesteEstatistico 
          nome={isKS ? "Kolmogorov-Smirnov (Grandes Amostras)" : "Shapiro-Wilk (Pequenas Amostras)"}
          estatistica={`Estatística = ${s?.stat || "0.00"}`}
          pValor={s?.p || 0}
          interpretacao={s?.p < 0.05 ? "Distribuição NÃO é Normal (P < 0.05). Siga para caminhos não-paramétricos." : "Distribuição segue a curva Normal (P > 0.05). Você pode usar testes paramétricos."}
          cor={isKS ? "#8b5cf6" : "#a855f7"}
        />
      );
    }
    else if (lowerLabel.includes('levene')) {
      conteudo = (
        <WidgetTesteEstatistico 
          nome="Teste de Levene (Variância)"
          estatistica={`F = ${stats?.levene?.stat || "0.00"}`}
          pValor={stats?.levene?.p || 0}
          interpretacao={stats?.levene?.p < 0.05 ? "Variâncias Heterogêneas (Desiguais). Use testes robustos ou não-paramétricos." : "Variâncias Homogêneas (Iguais). Pressuposto para ANOVA/Teste T atendido!"}
          cor="#f97316"
        />
      );
    }
    else if (lowerLabel.includes('epsilon') || lowerLabel.includes('tamanho') || lowerLabel.includes('eta') || lowerLabel.includes('cohen') || lowerLabel.includes('cramer')) {
      let valor = 0;
      let nomeEfeito = "Tamanho do Efeito";
      
      if (lowerLabel.includes('epsilon')) { valor = stats?.epsilon_sq || 0; nomeEfeito = "Epsilon²"; }
      else if (lowerLabel.includes('eta')) { valor = stats?.eta_sq || 0; nomeEfeito = "Eta²"; }
      else if (lowerLabel.includes('cohen')) { valor = stats?.d_cohen || 0; nomeEfeito = "d de Cohen"; }
      else if (lowerLabel.includes('cramer')) { valor = stats?.v_cramer || 0; nomeEfeito = "V de Cramer"; }

      const interpretar = (val, tipo) => {
        val = Math.abs(val);
        if (tipo.includes('cohen')) {
            if (val < 0.2) return { t: "Inexpressivo", c: "#94a3b8", v: 0 };
            if (val < 0.5) return { t: "Pequeno", c: "#3b82f6", v: 1 };
            if (val < 0.8) return { t: "Médio", c: "#f59e0b", v: 2 };
            return { t: "Grande", c: "#ef4444", v: 3 };
        }
        if (val < 0.1) return { t: "Desprezível", c: "#94a3b8", v: 0 };
        if (val < 0.3) return { t: "Fraco", c: "#3b82f6", v: 1 };
        if (val < 0.5) return { t: "Moderado", c: "#f59e0b", v: 2 };
        return { t: "Forte", c: "#ef4444", v: 3 };
      };
      
      const res = interpretar(valor, lowerLabel);
      const escala = lowerLabel.includes('cohen') 
        ? ["< 0.2: Pequeno", "0.2 - 0.5: Médio", "0.5 - 0.8: Grande", "> 0.8: Muito Grande"]
        : ["< 0.1: Desprezível", "0.1 - 0.3: Fraco", "0.3 - 0.5: Moderado", "> 0.5: Forte"];

      conteudo = (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <h3 style={{ color: '#64748b', margin: 0 }}>{nomeEfeito} (Magnitude)</h3>
          <div style={{ fontSize: '72px', fontWeight: 'bold', color: res.c, margin: '15px 0' }}>{valor.toFixed(4)}</div>
          <div style={{ padding: '10px 25px', background: res.c, color: 'white', borderRadius: '50px', display: 'inline-block', fontWeight: 'bold', marginBottom: '30px' }}>Impacto {res.t}</div>
          
          <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
             <h4 style={{ color: '#475569', fontSize: '14px', marginBottom: '15px' }}>📏 Escala de Interpretação:</h4>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {escala.map((item, index) => (
                  <div key={index} style={{ 
                    padding: '10px 5px', 
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    background: res.v === index ? res.c : '#f8fafc',
                    color: res.v === index ? 'white' : '#64748b',
                    border: res.v === index ? `1px solid ${res.c}` : '1px solid #e2e8f0',
                    transition: 'all 0.3s ease'
                  }}>
                    {item}
                  </div>
                ))}
             </div>
          </div>
        </div>
      );
    }
    else if (lowerLabel.includes('teste t') || lowerLabel.includes('mann-whitney') || lowerLabel.includes('kruskal') || lowerLabel.includes('anova')) {
      let s = null;
      let nome = "Teste de Hipótese";
      let cor = "#6366f1";
      
      if (lowerLabel.includes('teste t')) { s = stats?.teste_t; nome = "Teste T (Student)"; cor = "#ef4444"; }
      else if (lowerLabel.includes('mann-whitney')) { s = stats?.mann_whitney; nome = "Mann-Whitney U"; cor = "#16a34a"; }
      else if (lowerLabel.includes('kruskal')) { s = stats?.kruskal; nome = "Kruskal-Wallis"; cor = "#10b981"; }
      else if (lowerLabel.includes('anova')) { s = stats?.anova; nome = "ANOVA (F)"; cor = "#ef4444"; }

      conteudo = (
        <WidgetTesteEstatistico 
          nome={nome}
          estatistica={`Estatística = ${s?.stat || "0.00"}`}
          pValor={s?.p || 0}
          interpretacao={s?.p < 0.05 ? "Diferença SIGNIFICATIVA (P < 0.05). Rejeitamos H0." : "Sem diferença significativa (P > 0.05). Aceitamos H0."}
          cor={cor}
        />
      );
    }
    else if (lowerLabel.includes('pearson') || lowerLabel.includes('spearman')) {
      const isP = lowerLabel.includes('pearson');
      const s = isP ? stats?.pearson : stats?.spearman;
      conteudo = (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <h3>Correlação de {isP ? 'Pearson (r)' : 'Spearman (ρ)'}</h3>
          <div style={{ fontSize: '64px', fontWeight: 'bold', color: '#6366f1', margin: '20px 0' }}>{s?.r || "0.00"}</div>
          <p>P-valor: <strong>{s?.p?.toFixed(4) || "0.0000"}</strong></p>
          <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
            {Math.abs(s?.r) > 0.5 ? "🚀 Correlação Forte!" : "🐌 Correlação Fraca."}
            <br />
            {s?.r > 0 ? "📈 Relação Positiva (ambas crescem)." : "📉 Relação Negativa."}
          </div>
        </div>
      );
    }
    else if (lowerLabel.includes('qui-quadrado')) {
      conteudo = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <WidgetTesteEstatistico 
            nome="Teste Qui-Quadrado (χ²)"
            estatistica={`χ² = ${stats?.chi2?.stat || "0.00"}`}
            pValor={stats?.chi2?.p || 0}
            interpretacao={stats?.chi2?.p < 0.05 ? "Há ASSOCIAÇÃO significativa entre as variáveis (P < 0.05). Rejeitamos H0." : "Sem evidência de associação significativa (P > 0.05). Aceitamos H0."}
            cor="#8b5cf6"
          />
        </div>
      );
    }
    else if (lowerLabel.includes('dunn') || lowerLabel.includes('tukey')) {
      const map = stats?.dunn_map || {};
      conteudo = (
        <div style={{ padding: '10px' }}>
          <h3 style={{ textAlign: 'center', color: '#1e293b' }}>{lowerLabel.includes('dunn') ? 'Post-Hoc de Dunn' : 'Post-Hoc de Tukey'}</h3>
          <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', marginBottom: '20px' }}>Comparações par-a-par detalhadas:</p>
          
          <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Pares Comparados</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e2e8f0' }}>P-Valor</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>Sig.</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(map).length > 0 ? Object.entries(map).map(([par, p], i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#fcfcfc', borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', color: '#475569' }}>{par}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: p < 0.05 ? '#ef4444' : '#10b981' }}>{p.toFixed(4)}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{p < 0.05 ? '✅' : '❌'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Nenhum dado processado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: '15px', fontSize: '11px', color: '#94a3b8' }}>✅ = Diferença estatisticamente significativa (P &lt; 0.05).</p>
        </div>
      );
    }
    else if (lowerLabel.includes('contar') || lowerLabel.includes('n')) {
      const nTotal = (stats && stats.n_total) ? stats.n_total.toLocaleString() : (dadosAtuais ? dadosAtuais.length : 0);
      conteudo = (
        <div style={{ textAlign: 'center', padding: '30px' }}>
           <h2 style={{ fontSize: '56px', fontWeight: '900', color: '#1e293b' }}>N = {nTotal}</h2>
           <p style={{ fontSize: '18px', color: '#64748b' }}>Alunos analisados na amostra 2023</p>
           <div style={{ marginTop: '20px', height: '10px', width: '100%', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: '#3b82f6' }}></div>
           </div>
        </div>
      );
    }
    else if (lowerLabel.includes('remover') || lowerLabel.includes('filtrar') || lowerLabel.includes('tratar') || lowerLabel.includes('padronizar') || lowerLabel.includes('agrupar')) {
      conteudo = (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '50px', marginBottom: '10px' }}>🧹</div>
          <h3 style={{ color: '#1e293b' }}>Operação: {label}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
            <div style={{ background: '#fef2f2', padding: '15px', borderRadius: '8px', border: '1px solid #fee2e2' }}>
              <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold' }}>REMOVIDOS</span>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>{stats?.removidos || 0}</div>
            </div>
            <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px', border: '1px solid #dcfce7' }}>
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold' }}>REMANESCENTES</span>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>{stats?.n_atual || 0}</div>
            </div>
          </div>
        </div>
      );
    }

    setModalConfig({ titulo: `Análise: ${label}`, conteudo });
    setModalAberto(true);
  }, []);

  // Efeito para carregar dados iniciais automaticamente
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const response = await enviarGrafoParaProcessamento([], [], licaoId);
        if (response.preview) {
          setDadosReais(response.preview);
          setEstatisticas(response.estatisticas);
        }
      } catch (err) {
        console.warn("Falha ao pré-carregar dados:", err);
      }
    };
    carregarDadosIniciais();
  }, [licaoId]);

  useEffect(() => {
    let textoMissao = '🎯 Missão: Investigue a Hipótese';
    if (licaoId && TRILHAS_CONTENT[licaoId]) {
      const trilha = TRILHAS_CONTENT[licaoId];
      const ultimaFase = trilha.fases[trilha.fases.length - 1];
      const blocoMissao = ultimaFase?.conteudo?.find(c => c.tipo === 'missao');
      textoMissao = blocoMissao ? blocoMissao.valor : `🎯 Missão: ${trilha.titulo}`;
    }

    setNodes([{ 
      id: 'pergunta-1', position: { x: 250, y: 30 }, 
      data: { label: textoMissao, onConfig: () => abrirWidget('Missão', dadosReais, estatisticas) }, 
      type: 'input', draggable: false, 
      style: { background: '#000000', color: '#ffffff', fontWeight: 'bold', width: 450, borderRadius: '8px', padding: '15px', textAlign: 'center', fontSize: '14px', border: '3px solid #6366f1' } 
    }]);
    setEdges([]);
  }, [licaoId]);

  useEffect(() => {
    if (dadosReais.length > 0 || estatisticas) {
      setNodes((nds) => nds.map((node) => ({
        ...node,
        data: { ...node.data, onConfig: () => abrirWidget(node.data.label || 'Bloco', dadosReais, estatisticas) }
      })));
    }
  }, [dadosReais, estatisticas]);

  const onConnect = useCallback((params) => 
    setEdges((eds) => addEdge({ ...params, animated: true, style: { strokeWidth: 2, stroke: '#64748b' } }, eds)), 
    [setEdges]
  );

  const addBlock = (label, color, tipo = 'default', icon = '⚙️') => {
    const center = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    const newNode = {
      id: `node-${Date.now()}`, 
      position: { x: center.x - 75, y: center.y - 50 },
      data: { label, color, icon, onConfig: () => abrirWidget(label, dadosReais, estatisticas) },
      type: tipo,
      style: (tipo === 'default') ? { background: color, color: 'white', fontWeight: 'bold', borderRadius: '8px', padding: '10px', fontSize: '13px' } : undefined
    };
    setNodes((nds) => [...nds, newNode]);

    // Badge: Mestre da Normalidade
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('shapiro') || lowerLabel.includes('kolmogorov')) {
      unlockBadge('mestre-normalidade');
    }
  };

  const submitHypothesis = async () => {
    setEnviando(true);
    try {
      const response = await enviarGrafoParaProcessamento(nodes, edges, licaoId);
      console.log("✅ Resposta do Servidor:", response);

      if (response.status === 'erro') {
        alert(`Erro no Motor Estatístico: ${response.mensagem}`);
        setEnviando(false);
        return;
      }

      if (response.preview) {
        setDadosReais(response.preview);
        setEstatisticas(response.estatisticas);
        
        if (response.validacao) {
          const { status, erros, acertos, nota, patente } = response.validacao;
          
          if (status === "concluido") {
            // Badges do Canvas
            unlockBadge('cientista');
            if (nota >= 80) unlockBadge('guardiao-rigor');
            const partesPatente = patente.split(' ');
            const emojiPatente = partesPatente[partesPatente.length - 1];
            
            setModalConfig({
              titulo: "📊 Relatório de Rigor Científico",
              conteudo: (
                <div style={{ textAlign: 'center', padding: '10px' }}>
                   <div style={{ fontSize: '60px', marginBottom: '10px' }}>{emojiPatente}</div>
                   <h2 style={{ color: '#10b981', margin: '0' }}>{patente}</h2>
                   <div style={{ margin: '20px 0', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', height: '25px', position: 'relative' }}>
                      <div style={{ width: `${nota}%`, background: '#10b981', height: '100%', transition: 'width 1s ease-in-out' }}></div>
                      <span style={{ position: 'absolute', top: '2px', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold', fontSize: '14px' }}>Nota: {nota}/100</span>
                   </div>
                   
                   <div style={{ textAlign: 'left', background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#475569' }}>📑 Itens Identificados:</h4>
                      {acertos.map((acc, i) => (
                        <div key={i} style={{ fontSize: '13px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#10b981' }}>✓</span> {acc}
                        </div>
                      ))}
                   </div>
                   <p style={{ marginTop: '15px', fontSize: '12px', color: '#94a3b8' }}>Parabéns! Sua análise seguiu os padrões científicos exigidos.</p>
                </div>
              )
            });
            setModalAberto(true);
          } else if (status === "erro_metodologico") {
            setModalConfig({
              titulo: "⚠️ Erro Metodológico Detectado",
              conteudo: (
                <div style={{ padding: '10px' }}>
                   <p>Sua análise contém inconsistências estatísticas:</p>
                   <div style={{ background: '#fef2f2', padding: '15px', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                      {erros.map((err, i) => <div key={i} style={{ color: '#ef4444', marginBottom: '8px' }}>❌ {err}</div>)}
                   </div>
                   <p style={{ marginTop: '15px', fontSize: '14px' }}>Dica: O ENEM tem N &gt; 5000 e os dados não são normais.</p>
                </div>
              )
            });
            setModalAberto(true);
          }
        }
      }
    } catch (error) {
      console.error("Erro na validação:", error);
      alert("Erro ao conectar com o motor estatístico.");
    } finally {
      setEnviando(false);
    }
  };

  const exportToPng = () => {
    const el = document.querySelector('.react-flow');
    if (!el) return;
    const panel = el.querySelector('.react-flow__panel.top-right');
    if (panel) panel.style.display = 'none';
    toPng(el, { backgroundColor: '#f8fafc' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `fluxograma_enem_${licaoId || 'analise'}.png`;
        link.href = dataUrl;
        link.click();
        if (panel) panel.style.display = 'flex';
        unlockBadge('primeira-foto');
      })
      .catch((err) => {
        console.error('Erro ao gerar PNG:', err);
        if (panel) panel.style.display = 'flex';
      });
  };

  const exportToPython = () => {
    const isAssoc = licaoId === 'trilha-associacao';
    const isLimpeza = licaoId === 'trilha-limpeza';
    const fileName = isAssoc ? 'base_associacao_didatica.csv' : (isLimpeza ? 'mini_enem_sujo.csv' : 'enem_ma_participantes_2019_2023.csv');

    let code = `\"\"\"
Script gerado pelo StatFlow - CanvasLab
Data: ${new Date().toLocaleString()}
Trilha: ${licaoId}
\"\"\"

import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
import seaborn as sns

# 1. Carregamento e Preparação
print(\"🚀 Iniciando Análise...\")
# Nota: Certifique-se de ter o arquivo CSV no mesmo diretório
try:
    df = pd.read_csv('${fileName}')
    # Filtragem básica apenas para base real do ENEM
    if '${fileName}' == 'enem_ma_participantes_2019_2023.csv':
        df_analise = df[(df['NU_ANO'] == 2023) & (df['NOTA_GERAL'] > 0)].copy()
    else:
        df_analise = df.copy()
    print(f\"✅ Dados carregados: {len(df_analise)} registros.\")
except Exception as e:
    print(f\"❌ Erro ao carregar dados: {e}\")
    exit()

`;

    // Mapeamento simples de blocos para trechos de código
    nodes.forEach(node => {
      const label = node.data.label ? node.data.label.toLowerCase() : '';
      const targetCol = isAssoc ? 'NOTA_EXAME' : 'NOTA_GERAL';

      if (label.includes('shapiro')) {
        code += `\n# Pressuposto: Normalidade (Shapiro-Wilk)\nstat, p = stats.shapiro(df_analise['${targetCol}'].dropna().sample(min(len(df_analise), 5000)))\nprint(f\"📊 Shapiro-Wilk: p-valor = {p:.4f}\")\n`;
      } else if (label.includes('kolmogorov')) {
        code += `\n# Pressuposto: Normalidade (K-S)\nmu, std = df_analise['${targetCol}'].mean(), df_analise['${targetCol}'].std()\nstat, p = stats.kstest(df_analise['${targetCol}'].dropna(), 'norm', args=(mu, std))\nprint(f\"📊 Kolmogorov-Smirnov: p-valor = {p:.4f}\")\n`;
      } else if (label.includes('levene')) {
        const groupCol = isAssoc ? 'TP_ESCOLA' : 'Q006';
        code += `\n# Pressuposto: Homocedasticidade (Levene)\ngrupos = [group['${targetCol}'].values for name, group in df_analise.groupby('${groupCol}')]\nstat, p = stats.levene(*grupos)\nprint(f\"📊 Teste de Levene: p-valor = {p:.4f}\")\n`;
      } else if (label.includes('kruskal')) {
        const groupCol = isAssoc ? 'TP_ESCOLA' : 'Q006';
        code += `\n# Inferência: Kruskal-Wallis (Não-Paramétrico)\ngrupos = [group['${targetCol}'].values for name, group in df_analise.groupby('${groupCol}')]\nstat, p = stats.kruskal(*grupos)\nprint(f\"🧪 Kruskal-Wallis: H = {stat:.2f}, p-valor = {p:.4e}\")\n`;
      } else if (label.includes('anova')) {
        const groupCol = isAssoc ? 'TP_ESCOLA' : 'Q006';
        code += `\n# Inferência: ANOVA (Paramétrico)\ngrupos = [group['${targetCol}'].values for name, group in df_analise.groupby('${groupCol}')]\nstat, p = stats.f_oneway(*grupos)\nprint(f\"🧪 ANOVA: F = {stat:.2f}, p-valor = {p:.4e}\")\n`;
      } else if (label.includes('pearson')) {
        if (isAssoc) {
          code += `\n# Associação: Correlação de Pearson\nr, p = stats.pearsonr(df_analise['HORAS_ESTUDO'], df_analise['NOTA_EXAME'])\nprint(f\"📈 Correlação de Pearson: r = {r:.4f}, p = {p:.4f}\")\n`;
        } else {
          code += `\n# Associação: Correlação de Pearson\nrenda_map = {chr(65+i): i for i in range(17)}\ndf_analise['RENDA_NUM'] = df_analise['Q006'].map(renda_map)\nr, p = stats.pearsonr(df_analise['RENDA_NUM'], df_analise['NOTA_GERAL'])\nprint(f\"📈 Correlação de Pearson: r = {r:.4f}, p = {p:.4f}\")\n`;
        }
      } else if (label.includes('qui-quadrado')) {
        if (isAssoc) {
          code += `\n# Associação: Qui-Quadrado\ncontingencia = pd.crosstab(df_analise['TP_ESCOLA'], df_analise['ACESSO_INTERNET'])\nchi2, p, dof, ex = stats.chi2_contingency(contingencia)\nprint(f\"🎲 Qui-Quadrado: chi2 = {chi2:.4f}, p = {p:.4f}\")\n`;
        } else {
          code += `\n# Associação: Qui-Quadrado\ncontingencia = pd.crosstab(df_analise['TP_ESCOLA'], df_analise['TP_SEXO'])\nchi2, p, dof, ex = stats.chi2_contingency(contingencia)\nprint(f\"🎲 Qui-Quadrado: chi2 = {chi2:.4f}, p = {p:.4f}\")\n`;
        }
      } else if (label.includes('boxplot')) {
        const groupCol = isAssoc ? 'TP_ESCOLA' : 'Q006';
        code += `\n# Visualização: Boxplot\nplt.figure(figsize=(12, 6))\nsns.boxplot(x='${groupCol}', y='${targetCol}', data=df_analise.sort_values('${groupCol}'))\nplt.title('Distribuição de Notas por ${groupCol}')\nplt.show()\n`;
      }
    });

    code += `\nprint(\"\\n✅ Análise concluída!\")`;

    const blob = new Blob([code], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analise_enem_${licaoId}.py`;
    link.click();
  };

  const exportGoldStandard = () => {
    const data = { nodes, edges, metadata: { licaoId, criadoEm: new Date().toISOString() } };
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `gabarito_${licaoId || 'analise'}.json`;
    link.click();
  };

  const importGoldStandard = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (json.nodes && json.edges) {
          setNodes(json.nodes);
          setEdges(json.edges);
        }
      } catch (err) { alert("Erro ao importar JSON."); }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '320px', background: '#f8fafc', padding: '15px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', overflowX: 'visible' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <button onClick={voltarAoMenu} style={{ padding: '8px 12px', background: '#e2e8f0', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', color: '#475569', fontSize: '13px' }}>⬅ Voltar</button>
          <div style={{ fontWeight: 'bold', color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            🎓 {localStorage.getItem('tcc_user_nome') || 'Estudante'}
          </div>
        </div>
        
        <h4 style={{ margin: '0', color: '#475569', fontSize: '12px' }}>1. EXPLORAÇÃO (EDA)</h4>
        <Tooltip 
          conceito={licaoId.includes('trilha-associacao') ? "Carrega a base controlada para estudos de correlação e associação." : (licaoId === 'trilha-limpeza' ? "Carrega uma amostra com erros propositais para treinamento de limpeza." : "Carrega a base de dados dos Microdados do ENEM 2023 para o Lab.")} 
          quando="Deve ser sempre o primeiro bloco do seu fluxo."
        >
          <button 
            onClick={() => {
              const label = licaoId.includes('trilha-associacao') ? '📊 Base de Associação' : (licaoId === 'trilha-limpeza' ? '📊 Base ENEM (Suja)' : '📊 Base de Dados');
              addBlock(label, '#2563eb', 'tool', '📊');
            }} 
            style={UI_STYLES.btnStyle}
          >
            {licaoId.includes('trilha-associacao') ? '+ Base de Associação' : (licaoId === 'trilha-limpeza' ? '+ Base Suja (500 lin)' : '+ Base de Dados')}
          </button>
        </Tooltip>
        {licaoId.includes('trilha-associacao') && (
          <Tooltip conceito="Gera um Gráfico de Dispersão (Scatter Plot) para visualizar a relação entre duas variáveis numéricas." quando="Quiser ver se os dados seguem uma tendência linear antes de calcular o Pearson.">
            <button onClick={() => addBlock('📈 Gráfico de Dispersão', '#6366f1', 'tool', '📈')} style={UI_STYLES.btnStyle}>+ Gráfico de Dispersão</button>
          </Tooltip>
        )}
        
        <Tooltip conceito="Exibe os dados brutos carregados em uma tabela de amostra." quando="Quiser inspecionar como os dados estão estruturados."><button onClick={() => addBlock('👁️ Ver Tabela', '#0891b2', 'tool', '👁️')} style={UI_STYLES.btnStyle}>+ Visualizar Tabela</button></Tooltip>
        <Tooltip conceito="Conta e exibe o número total de registros (N) da base." quando="Precisar confirmar o tamanho da amostra antes de decidir qual teste usar."><button onClick={() => addBlock('🧮 Contar N', '#0891b2', 'tool', '🔢')} style={UI_STYLES.btnStyle}>+ Descobrir "N"</button></Tooltip>
        
        {licaoId !== 'trilha-limpeza' && (
          <>
            <Tooltip conceito={`Gera um Boxplot comparando a distribuição das notas por ${licaoId === 'trilha-dois-grupos' ? 'gênero' : 'faixas de renda'}.`} quando="Quiser visualizar a dispersão dos dados antes de qualquer teste.">
              <button 
                onClick={() => {
                  const label = licaoId === 'trilha-dois-grupos' ? '📉 Boxplot de Gênero' : '📉 Boxplot de Renda';
                  addBlock(label, '#0891b2', 'tool', '📈');
                }} 
                style={UI_STYLES.btnStyle}
              >
                + Ver Distribuição
              </button>
            </Tooltip>
            <Tooltip conceito="Ponto de decisão: a amostra possui mais de 5.000 registros?" quando="Após contar o N para decidir se o Teorema do Limite Central se aplica."><button onClick={() => addBlock('N > 5000?', '#eab308', 'condition')} style={UI_STYLES.btnStyle}>+ Condição: N &gt; 5000?</button></Tooltip>

            <h4 style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '12px' }}>2. PRESSUPOSTOS</h4>
            <Tooltip conceito="Testa se a variância (dispersão) dos grupos é homogênea." quando="Antes de rodar uma ANOVA, para validar o pressuposto de homocedasticidade."><button onClick={() => addBlock('⚖️ Teste de Levene', '#f97316', 'tool', '⚖️')} style={UI_STYLES.btnStyle}>+ Teste de Levene</button></Tooltip>
            <Tooltip conceito="Compara a distribuição dos dados com uma distribuição normal teórica." quando="Para testar normalidade em amostras grandes (N > 50)."><button onClick={() => addBlock('⚖️ Kolmogorov-Smirnov', '#8b5cf6', 'tool', '📊')} style={UI_STYLES.btnStyle}>+ Kolmogorov-Smirnov</button></Tooltip>
            <Tooltip conceito="Teste de normalidade mais sensível e preciso." quando="Para amostras menores (N &lt; 50). Mais rigoroso que o K-S."><button onClick={() => addBlock('⚖️ Shapiro-Wilk', '#a855f7', 'tool', '📈')} style={UI_STYLES.btnStyle}>+ Shapiro-Wilk</button></Tooltip>

            <h4 style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '12px' }}>3. INFERÊNCIA</h4>
            {licaoId.includes('associacao') && (
              <>
                <Tooltip conceito="Cruza as frequências de duas variáveis categóricas em uma grade." quando="Quiser ver quantos alunos de cada tipo de escola têm ou não internet."><button onClick={() => addBlock('📊 Tabela de Contingência', '#0891b2', 'tool', '📊')} style={UI_STYLES.btnStyle}>+ Tabela de Contingência</button></Tooltip>
                <Tooltip conceito="Visualiza a proporção de cada categoria através de barras coloridas." quando="Para uma comparação visual rápida entre grupos categóricos."><button onClick={() => addBlock('📊 Barras Agrupadas', '#6366f1', 'tool', '📊')} style={UI_STYLES.btnStyle}>+ Gráfico de Barras</button></Tooltip>
              </>
            )}

            {(licaoId.includes('pearson') || !licaoId.includes('associacao')) && (
              <>
                <Tooltip conceito="Mede a força e direção da relação linear entre duas variáveis contínuas." quando="Ambas as variáveis forem normais e a relação for linear (ex: Renda vs Nota)."><button onClick={() => addBlock('🧮 Pearson (r)', '#ef4444', 'tool', '📈')} style={UI_STYLES.btnStyle}>+ Pearson (Linear)</button></Tooltip>
                <Tooltip conceito="Mede a relação de postos (rank) entre duas variáveis, não exigindo normalidade." quando="Os dados não forem normais ou a relação não for linear."><button onClick={() => addBlock('🧮 Spearman (ρ)', '#16a34a', 'tool', '📉')} style={UI_STYLES.btnStyle}>+ Spearman (Postos)</button></Tooltip>
              </>
            )}
            
            {(licaoId.includes('chi2') || !licaoId.includes('associacao')) && (
              <>
                <Tooltip conceito="Ponto de decisão: todas as células da tabela possuem mais de 5 registros esperados?" quando="Para garantir a validade do teste de Qui-Quadrado."><button onClick={() => addBlock('Freq. Esperada > 5?', '#eab308', 'condition')} style={UI_STYLES.btnStyle}>+ Condição: N &gt; 5?</button></Tooltip>
                <Tooltip conceito="Testa se existe associação significativa entre duas variáveis categóricas." quando="Quiser saber se o tipo de escola (Pública/Privada) está associado ao acesso à internet."><button onClick={() => addBlock('🧮 Qui-Quadrado (χ²)', '#d97706', 'tool', '🎲')} style={UI_STYLES.btnStyle}>+ Qui-Quadrado</button></Tooltip>
                <Tooltip conceito="Alternativa exata ao Qui-Quadrado para amostras pequenas ou tabelas desbalanceadas." quando="As frequências esperadas forem menores que 5."><button onClick={() => addBlock('🧮 Teste de Fisher', '#d97706', 'tool', '🧪')} style={UI_STYLES.btnStyle}>+ Teste de Fisher</button></Tooltip>
              </>
            )}

            <Tooltip conceito="Ponto de decisão: os dados seguem uma distribuição normal?" quando="Após rodar o Shapiro-Wilk ou K-S, para escolher o caminho certo."><button onClick={() => addBlock('É Normal?', '#eab308', 'condition')} style={UI_STYLES.btnStyle}>+ Condição: É Normal?</button></Tooltip>
            <Tooltip conceito="Teste paramétrico que compara as médias de 3 ou mais grupos." quando="Os dados forem normalmente distribuídos e as variâncias forem homogêneas."><button onClick={() => addBlock('🧮 ANOVA', '#ef4444', 'tool', '🧮')} style={UI_STYLES.btnStyle}>+ ANOVA</button></Tooltip>
            <Tooltip conceito="Alternativa não-paramétrica à ANOVA, baseada em postos (ranks)." quando="Os dados não forem normais — caso do ENEM com N muito grande."><button onClick={() => addBlock('🧮 Kruskal-Wallis', '#16a34a', 'tool', '📉')} style={UI_STYLES.btnStyle}>+ Kruskal-Wallis</button></Tooltip>
            <Tooltip conceito="Teste paramétrico para comparar as médias de APENAS DOIS grupos (ex: Homens vs Mulheres)." quando="Os dados forem normais e você tiver apenas dois grupos para comparar."><button onClick={() => addBlock('🧮 Teste T', '#ef4444', 'tool', '⚖️')} style={UI_STYLES.btnStyle}>+ Teste T (2 Grupos)</button></Tooltip>
            <Tooltip conceito="Teste não-paramétrico para comparar dois grupos independentes." quando="Os dados de dois grupos NÃO forem normais — muito comum no ENEM."><button onClick={() => addBlock('🧮 Mann-Whitney', '#16a34a', 'tool', '📉')} style={UI_STYLES.btnStyle}>+ Mann-Whitney</button></Tooltip>

            <h4 style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '12px' }}>4. SIGNIFICÂNCIA</h4>
            <Tooltip conceito="Ponto de decisão: o p-valor do teste foi menor que 0,05?" quando="Após rodar o teste de inferência para checar se há diferença real."><button onClick={() => addBlock('P < 0.05?', '#eab308', 'condition')} style={UI_STYLES.btnStyle}>+ Condição: P-valor &lt; 0.05?</button></Tooltip>

            <h4 style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '12px' }}>5. TAMANHO DO EFEITO</h4>
            <Tooltip conceito="Mede a magnitude da diferença encontrada pelo Kruskal-Wallis." quando="Após confirmar significância (p &lt; 0.05) usando o caminho não-paramétrico."><button onClick={() => addBlock('📏 Epsilon²', '#0f766e', 'tool', '📏')} style={UI_STYLES.btnStyle}>+ Epsilon-Squared</button></Tooltip>
            <Tooltip conceito="Mede a magnitude da diferença encontrada pela ANOVA." quando="Após confirmar significância (p &lt; 0.05) usando o caminho paramétrico."><button onClick={() => addBlock('📏 Eta²', '#0f766e', 'tool', '📏')} style={UI_STYLES.btnStyle}>+ Eta-Squared</button></Tooltip>
            <Tooltip conceito="Mede a magnitude da diferença entre dois grupos em unidades de desvio padrão." quando="Após testes de dois grupos (Teste T ou Mann-Whitney) significativos."><button onClick={() => addBlock('📏 d de Cohen', '#0f766e', 'tool', '📏')} style={UI_STYLES.btnStyle}>+ d de Cohen</button></Tooltip>
            <Tooltip conceito="Mede a intensidade da associação entre variáveis categóricas encontrada no Qui-Quadrado." quando="Após o teste de Qui-Quadrado ser significativo (p < 0.05)."><button onClick={() => addBlock('📏 V de Cramer', '#0f766e', 'tool', '📏')} style={UI_STYLES.btnStyle}>+ V de Cramer</button></Tooltip>

            <h4 style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '12px' }}>6. POST-HOC</h4>
            <Tooltip conceito="Identifica quais pares de grupos são estatisticamente diferentes." quando="Após o Kruskal-Wallis ser significativo, para saber quem difere de quem."><button onClick={() => addBlock('🔥 Heatmap de Dunn', '#d97706', 'tool', '🔥')} style={UI_STYLES.btnStyle}>+ Teste de Dunn</button></Tooltip>
            <Tooltip conceito="Comparação par-a-par de médias após a ANOVA." quando="Após a ANOVA ser significativa, para detalhar quais grupos diferem."><button onClick={() => addBlock('📊 Teste de Tukey', '#d97706', 'tool', '📊')} style={UI_STYLES.btnStyle}>+ Teste de Tukey</button></Tooltip>
          </>
        )}

        {licaoId === 'trilha-limpeza' && (
          <>
            <h4 style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '12px' }}>2. CURADORIA</h4>
            <Tooltip conceito="Remove linhas com valores nulos (NaN) em colunas críticas." quando="Dados faltantes podem invalidar cálculos estatísticos."><button onClick={() => addBlock('🧹 Remover Nulos', '#0ea5e9', 'tool', '🧹')} style={UI_STYLES.btnStyle}>+ Filtrar Nulos</button></Tooltip>
            <Tooltip conceito="Remove candidatos que não compareceram à prova." quando="Focar a análise apenas no desempenho real."><button onClick={() => addBlock('🧹 Filtrar Ausentes', '#0ea5e9', 'tool', '🚫')} style={UI_STYLES.btnStyle}>+ Remover Ausentes</button></Tooltip>
            <Tooltip conceito="Elimina valores impossíveis (Idades > 120, Notas > 1000)." quando="Corrigir erros grosseiros de digitação ou sensores."><button onClick={() => addBlock('🧹 Tratar Outliers', '#0ea5e9', 'tool', '🎯')} style={UI_STYLES.btnStyle}>+ Limpar Outliers</button></Tooltip>
            <Tooltip conceito="Remove registros idênticos repetidos na base." quando="Evitar viés por contagem duplicada de um mesmo evento."><button onClick={() => addBlock('🧹 Remover Duplicatas', '#0ea5e9', 'tool', '👥')} style={UI_STYLES.btnStyle}>+ Remover Duplicatas</button></Tooltip>
            <Tooltip conceito="Converte datas em formatos mistos para o padrão internacional (ISO)." quando="Datas como 10/05/23 e 2023-05-10 precisam ser iguais."><button onClick={() => addBlock('🧹 Padronizar Datas', '#0ea5e9', 'tool', '📅')} style={UI_STYLES.btnStyle}>+ Padronizar Datas</button></Tooltip>
            <Tooltip conceito="Cria um novo arquivo CSV com os dados limpos." quando="For o passo final da sua curadoria."><button onClick={() => addBlock('💾 Exportar CSV', '#10b981', 'tool', '💾')} style={UI_STYLES.btnStyle}>+ Exportar Limpo</button></Tooltip>
          </>
        )}

        <h4 style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '12px' }}>7. CONCLUSÃO</h4>
        <Tooltip conceito="Encerra o fluxo sem rejeitar a hipótese nula." quando="O p-valor for maior que 0.05 (sem diferença significativa entre grupos)."><button onClick={() => addBlock('🛑 Aceitar H0', '#94a3b8', 'end')} style={UI_STYLES.btnStyle}>+ Fim: Aceitar H0</button></Tooltip>
        <Tooltip conceito="Encerra o fluxo rejeitando H0 com rigor metodológico completo." quando="Todo o caminho científico foi seguido e a diferença foi confirmada."><button onClick={() => addBlock('🏆 Sucesso', '#10b981', 'end')} style={UI_STYLES.btnStyle}>+ Fim: Sucesso</button></Tooltip>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} nodesDraggable={!isLocked} fitView>
          <Panel position="top-right" style={{ display: "flex", gap: "10px" }}>
            <input type="file" id="import-json" style={{ display: 'none' }} accept=".json" onChange={importGoldStandard} />
            <button onClick={() => document.getElementById('import-json').click()} style={{ padding: '10px 15px', background: '#475569', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>📤 Importar</button>
            <button onClick={exportGoldStandard} style={{ padding: '10px 15px', background: '#334155', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>📥 Exportar</button>
            <button onClick={exportToPython} style={{ padding: '10px 15px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>🐍 Exportar Script</button>
            <button onClick={() => setIsLocked(!isLocked)} style={{ padding: '10px', background: isLocked ? '#ef4444' : '#e2e8f0', borderRadius: '5px' }}>{isLocked ? '🔒' : '🔓'}</button>
            <button onClick={submitHypothesis} disabled={enviando} style={{ padding: '10px 20px', background: enviando ? '#94a3b8' : '#10b981', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
              {enviando ? '⏳ ...' : '🚀 Validar'}
            </button>
          </Panel>
          <CustomControls />
          <Background variant="dots" gap={15} size={2} color="#cbd5e1" />
        </ReactFlow>
        <CanvasTutorial />
      </div>

      <Modal isOpen={modalAberto} onClose={() => setModalAberto(false)} title={modalConfig.titulo}>
        {modalConfig.conteudo}
      </Modal>
    </div>
  );
}

export default FlowDesigner;
