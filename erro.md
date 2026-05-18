{
  "nodes": [
    {
      "id": "pergunta-1",
      "position": {
        "x": 250,
        "y": 30
      },
      "data": {
        "label": "Sua tarefa: \n1. Carregar a Base de Associação \n2. Testar a Normalidade \n3. Rodar a Correlação de Pearson \n4. Interpretar se o r é positivo e forte."
      },
      "type": "input",
      "draggable": false,
      "style": {
        "background": "#000000",
        "color": "#ffffff",
        "fontWeight": "bold",
        "width": 450,
        "borderRadius": "8px",
        "padding": "15px",
        "textAlign": "center",
        "fontSize": "14px",
        "border": "3px solid #6366f1"
      },
      "measured": {
        "width": 450,
        "height": 99
      }
    },
    {
      "id": "node-1779135668625",
      "position": {
        "x": 392.72806090866175,
        "y": 181.5309598000166
      },
      "data": {
        "label": "📊 Microdados ENEM",
        "color": "#2563eb",
        "icon": "📊"
      },
      "type": "tool",
      "measured": {
        "width": 205,
        "height": 95
      },
      "selected": false,
      "dragging": false
    },
    {
      "id": "node-1779135677281",
      "position": {
        "x": 443.6402300984479,
        "y": 324.7077118541081
      },
      "data": {
        "label": "👁️ Ver Tabela",
        "color": "#0891b2",
        "icon": "👁️"
      },
      "type": "tool",
      "measured": {
        "width": 159,
        "height": 95
      },
      "selected": false,
      "dragging": false
    },
    {
      "id": "node-1779135699314",
      "position": {
        "x": 163.5522868158548,
        "y": 208.77836814270856
      },
      "data": {
        "label": "📉 Boxplot de Renda",
        "color": "#0891b2",
        "icon": "📈"
      },
      "type": "tool",
      "measured": {
        "width": 201,
        "height": 95
      }
    },
    {
      "id": "node-1779135710026",
      "position": {
        "x": 438.646631200923,
        "y": 461.4720478609031
      },
      "data": {
        "label": "🧮 Contar N",
        "color": "#0891b2",
        "icon": "🔢"
      },
      "type": "tool",
      "measured": {
        "width": 154,
        "height": 95
      },
      "selected": false,
      "dragging": false
    },
    {
      "id": "node-1779135729338",
      "position": {
        "x": 420.6575628009032,
        "y": 610.1820984160391
      },
      "data": {
        "label": "⚖️ Shapiro-Wilk",
        "color": "#a855f7",
        "icon": "📈"
      },
      "type": "tool",
      "measured": {
        "width": 175,
        "height": 95
      },
      "selected": false,
      "dragging": false
    },
    {
      "id": "node-1779135745731",
      "position": {
        "x": 425.81366376607184,
        "y": 788.7416379307565
      },
      "data": {
        "label": "🧮 Pearson (r)",
        "color": "#ef4444",
        "icon": "📈"
      },
      "type": "tool",
      "measured": {
        "width": 163,
        "height": 95
      },
      "selected": false,
      "dragging": false
    },
    {
      "id": "node-1779135758275",
      "position": {
        "x": 437.1930517176388,
        "y": 977.2704261614778
      },
      "data": {
        "label": "🏆 Sucesso",
        "color": "#10b981",
        "icon": "⚙️"
      },
      "type": "end",
      "measured": {
        "width": 120,
        "height": 44
      },
      "selected": true,
      "dragging": false
    }
  ],
  "edges": [
    {
      "source": "pergunta-1",
      "target": "node-1779135668625",
      "animated": true,
      "style": {
        "strokeWidth": 2,
        "stroke": "#64748b"
      },
      "id": "xy-edge__pergunta-1-node-1779135668625"
    },
    {
      "source": "node-1779135668625",
      "target": "node-1779135677281",
      "animated": true,
      "style": {
        "strokeWidth": 2,
        "stroke": "#64748b"
      },
      "id": "xy-edge__node-1779135668625-node-1779135677281"
    },
    {
      "source": "node-1779135677281",
      "target": "node-1779135710026",
      "animated": true,
      "style": {
        "strokeWidth": 2,
        "stroke": "#64748b"
      },
      "id": "xy-edge__node-1779135677281-node-1779135710026"
    },
    {
      "source": "node-1779135710026",
      "target": "node-1779135729338",
      "animated": true,
      "style": {
        "strokeWidth": 2,
        "stroke": "#64748b"
      },
      "id": "xy-edge__node-1779135710026-node-1779135729338"
    },
    {
      "source": "node-1779135729338",
      "target": "node-1779135745731",
      "animated": true,
      "style": {
        "strokeWidth": 2,
        "stroke": "#64748b"
      },
      "id": "xy-edge__node-1779135729338-node-1779135745731"
    },
    {
      "source": "node-1779135745731",
      "target": "node-1779135758275",
      "animated": true,
      "style": {
        "strokeWidth": 2,
        "stroke": "#64748b"
      },
      "id": "xy-edge__node-1779135745731-node-1779135758275"
    }
  ],
  "metadata": {
    "licaoId": "trilha-associacao-pearson",
    "criadoEm": "2026-05-18T20:22:50.059Z"
  }
}