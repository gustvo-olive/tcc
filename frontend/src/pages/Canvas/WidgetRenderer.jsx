import React from 'react';
import DataTable from '../../components/ui/DataTable';

export function WidgetTesteEstatistico({ nome, estatistica, pValor, interpretacao, cor }) {
  return (
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
}

export function DynamicBoxPlot({ dados, groupKey }) {
  if (!dados || dados.length === 0) return <p>Sem dados.</p>;

  const DIC_SEXO = { 'M': 'Masculino', 'F': 'Feminino' };
  const DIC_RENDA = {
    'A': 'A: Nenhuma Renda', 'B': 'B: Até R$ 998', 'C': 'C: R$ 998 - R$ 1.497',
    'D': 'D: R$ 1.497 - R$ 1.996', 'E': 'E: R$ 1.996 - R$ 2.495', 'F': 'F: R$ 2.495 - R$ 2.994',
    'G': 'G: R$ 2.994 - R$ 3.992', 'H': 'H: R$ 3.992 - R$ 4.990', 'I': 'I: R$ 4.990 - R$ 5.988',
    'J': 'J: R$ 5.988 - R$ 6.986', 'K': 'K: R$ 6.986 - R$ 7.984', 'L': 'L: R$ 7.984 - R$ 8.982',
    'M': 'M: R$ 8.982 - R$ 9.980', 'N': 'N: R$ 9.980 - R$ 11.976', 'O': 'O: R$ 11.976 - R$ 14.970',
    'P': 'P: R$ 14.970 - R$ 19.960', 'Q': 'Q: Mais de R$ 19.960'
  };

  const grupos = {};
  dados.forEach(d => {
    const val = d[groupKey];
    if (val === null || val === undefined) return;
    if (!grupos[val]) grupos[val] = [];
    const nota = d['NOTA_GERAL'] !== undefined ? d['NOTA_GERAL'] : d['NOTA_EXAME'];
    if (nota !== undefined && nota !== null) grupos[val].push(nota);
  });

  const categoriasAtivas = Object.keys(grupos).sort();

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <h4 style={{ color: '#1e293b', marginBottom: '20px' }}>
        📊 Distribuição por {groupKey === 'TP_SEXO' ? 'Sexo' : groupKey === 'Q006' ? 'Renda' : groupKey}
      </h4>
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
            const label = DIC_SEXO[cat] || DIC_RENDA[cat] || cat;

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
}

export function ScatterPlot({ dados }) {
  if (!dados || dados.length === 0) return <p>Sem dados.</p>;

  const validData = dados.filter(d => d.HORAS_ESTUDO !== null && d.NOTA_EXAME !== null);
  if (validData.length === 0) return <p>A base atual não possui colunas numéricas compatíveis.</p>;

  const maxX = Math.max(...validData.map(d => d.HORAS_ESTUDO));
  const maxY = 1000;

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <h4 style={{ color: '#1e293b', marginBottom: '20px' }}>📈 Relação: Horas de Estudo vs Nota do Exame</h4>
      <svg width="100%" height="300" viewBox="0 0 400 300" style={{ overflow: 'visible' }}>
        <line x1="40" y1="260" x2="380" y2="260" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="40" y1="20" x2="40" y2="260" stroke="#cbd5e1" strokeWidth="2" />
        {validData.slice(0, 100).map((d, i) => (
          <circle key={i} cx={40 + (d.HORAS_ESTUDO / maxX) * 320} cy={260 - (d.NOTA_EXAME / maxY) * 240} r="3" fill="#6366f1" opacity="0.6" />
        ))}
        <text x="210" y="290" textAnchor="middle" fontSize="10" fill="#94a3b8">Horas de Estudo (X)</text>
        <text x="10" y="150" textAnchor="middle" fontSize="10" fill="#94a3b8" transform="rotate(-90 10,150)">Nota Final (Y)</text>
      </svg>
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '10px', borderRadius: '8px' }}>
        💡 <strong>Dica PBL:</strong> Se os pontos seguem uma direção (ex: subindo da esquerda para a direita), existe uma correlação positiva!
      </div>
    </div>
  );
}

export function ContingencyTable({ tabela }) {
  return (
    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
      <h4 style={{ margin: '0 0 15px 0', color: '#475569', fontSize: '14px', textAlign: 'center' }}>📊 Tabela de Contingência</h4>
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
  );
}

export function PostHocTable({ map }) {
  return (
    <div style={{ padding: '10px' }}>
      <h3 style={{ textAlign: 'center', color: '#1e293b' }}>Post-Hoc</h3>
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

export function EffectSizeWidget({ valor, nomeEfeito, lowerLabel }) {
  const interpretar = (val, tipo) => {
    val = Math.abs(val);
    if (tipo.includes('cohen')) {
      if (val < 0.2) return { t: "Inexpressivo", c: "#94a3b8" };
      if (val < 0.5) return { t: "Pequeno", c: "#3b82f6" };
      if (val < 0.8) return { t: "Médio", c: "#f59e0b" };
      return { t: "Grande", c: "#ef4444" };
    }
    if (val < 0.1) return { t: "Desprezível", c: "#94a3b8" };
    if (val < 0.3) return { t: "Fraco", c: "#3b82f6" };
    if (val < 0.5) return { t: "Moderado", c: "#f59e0b" };
    return { t: "Forte", c: "#ef4444" };
  };
  const res = interpretar(valor, lowerLabel);
  return (
    <div style={{ textAlign: 'center', padding: '30px' }}>
      <h3 style={{ color: '#64748b', margin: 0 }}>{nomeEfeito} (Magnitude)</h3>
      <div style={{ fontSize: '72px', fontWeight: 'bold', color: res.c, margin: '15px 0' }}>{valor.toFixed(4)}</div>
      <div style={{ padding: '10px 25px', background: res.c, color: 'white', borderRadius: '50px', display: 'inline-block', fontWeight: 'bold' }}>Impacto {res.t}</div>
      {lowerLabel.includes('cohen') && (
        <div style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          <h4 style={{ color: '#475569', fontSize: '14px', marginBottom: '10px' }}>📏 Tabela de Referência (Cohen):</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '11px' }}>
            <div style={{ padding: '5px', background: valor < 0.2 ? '#f1f5f9' : 'transparent', border: valor < 0.2 ? '1px solid #cbd5e1' : 'none' }}>0.2: Pequeno</div>
            <div style={{ padding: '5px', background: (valor >= 0.2 && valor < 0.5) ? '#f1f5f9' : 'transparent', border: (valor >= 0.2 && valor < 0.5) ? '1px solid #cbd5e1' : 'none' }}>0.5: Médio</div>
            <div style={{ padding: '5px', background: (valor >= 0.5) ? '#f1f5f9' : 'transparent', border: (valor >= 0.5) ? '1px solid #cbd5e1' : 'none' }}>0.8: Grande</div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CleaningStatsWidget({ stats, label }) {
  return (
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
      <div style={{ marginTop: '25px', padding: '15px', background: '#f8fafc', borderRadius: '8px', textAlign: 'left', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#475569' }}>🔍 Impacto na Qualidade:</h4>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
          Esta ação reduziu a "sujeira" da base. A saúde atual da amostra é de <strong>{stats?.saude || 0}%</strong>.
          {stats?.erros_criticos > 0 ? ` Ainda restam ${stats.erros_criticos} inconsistências graves.` : ' Excelente! Não detectamos mais erros críticos nesta amostra.'}
        </p>
      </div>
    </div>
  );
}

export function NCountWidget({ stats, dados }) {
  const nTotal = (stats && stats.n_total) ? stats.n_total.toLocaleString() : (dados ? dados.length : 0);
  return (
    <div style={{ textAlign: 'center', padding: '30px' }}>
      <h2 style={{ fontSize: '56px', fontWeight: '900', color: '#1e293b' }}>N = {nTotal}</h2>
      <p style={{ fontSize: '18px', color: '#64748b' }}>Alunos analisados na amostra 2023</p>
      <div style={{ marginTop: '20px', height: '10px', width: '100%', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ width: '100%', height: '100%', background: '#3b82f6' }}></div>
      </div>
    </div>
  );
}

export function CorrelationWidget({ stats, lowerLabel }) {
  const isP = lowerLabel.includes('pearson');
  const s = isP ? stats?.pearson : stats?.spearman;
  return (
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

export function ChiSquareWidget({ stats }) {
  const tabela = stats?.chi2?.tabela;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <WidgetTesteEstatistico
        nome="Teste Qui-Quadrado (χ²)"
        estatistica={`χ² = ${stats?.chi2?.stat || "0.00"}`}
        pValor={stats?.chi2?.p || 0}
        interpretacao={stats?.chi2?.p < 0.05 ? "Há ASSOCIAÇÃO significativa entre as variáveis (P < 0.05). Rejeitamos H0." : "Sem evidência de associação significativa (P > 0.05). Aceitamos H0."}
        cor="#8b5cf6"
      />
      {tabela && <ContingencyTable tabela={tabela} />}
    </div>
  );
}

export function ResultModalContent({ validacao }) {
  const { status, erros, acertos, nota, patente } = validacao;
  const partesPatente = patente.split(' ');
  const emojiPatente = partesPatente[partesPatente.length - 1];

  if (status === "concluido") {
    return (
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
    );
  }

  return (
    <div style={{ padding: '10px' }}>
      <p>Sua análise contém inconsistências estatísticas:</p>
      <div style={{ background: '#fef2f2', padding: '15px', borderRadius: '8px', border: '1px solid #fee2e2' }}>
        {erros.map((err, i) => <div key={i} style={{ color: '#ef4444', marginBottom: '8px' }}>❌ {err}</div>)}
      </div>
      <p style={{ marginTop: '15px', fontSize: '14px' }}>Dica: O ENEM tem N &gt; 5000 e os dados não são normais.</p>
    </div>
  );
}
