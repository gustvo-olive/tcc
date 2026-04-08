import React from 'react';

const DataTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Nenhum dado para exibir.</div>;
  }

  const columns = Object.keys(data[0]);

  return (
    <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
        <thead style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
          <tr>
            {columns.map((col) => (
              <th key={col} style={{ padding: '12px 15px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
              {columns.map((col) => (
                <td key={col} style={{ padding: '12px 15px', color: '#1e293b' }}>
                  {row[col] !== null ? row[col].toString() : 'null'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
