# Resumo 4 — Sessão de Melhorias do CanvasLab

**Data:** 2026-04-10  
**Sessão:** Tutorial, Tooltips e Sistema de Badges

---

## 1. Tutorial do CanvasLab (Carrossel)

### Motivação
O aluno não tinha nenhuma instrução de como usar o laboratório de fluxo estatístico, tornando a curva de aprendizado desnecessariamente alta.

### O que foi feito

**`src/components/ui/CanvasTutorial.jsx`** — Criado/reescrito

- Tutorial removido do painel lateral e transformado em um **botão flutuante circular (FAB)** `❓` posicionado no canto inferior direito do Canvas.
- Ao clicar, abre um Modal com um **carrossel de 5 passos** explicativos:
  1. Boas-vindas e conceito do CanvasLab
  2. Ferramentas do painel lateral
  3. Como conectar blocos
  4. Como usar o botão de engrenagem (⚙️) para inspecionar resultados
  5. Como usar o botão 🚀 Validar
- Navegação via botões **"Anterior"** / **"Próximo"** / **"Concluir"**
- Dots indicadores clicáveis para saltar entre passos

**`src/pages/Canvas/FlowDesigner.jsx`** — Modificado

- `<CanvasTutorial />` movido do painel esquerdo para dentro do `div` do ReactFlow (área principal), renderizado sobre o canvas como elemento absoluto.

---

## 2. Tooltips Estruturados nos Blocos

### Motivação
Os botões do painel não ofereciam nenhum contexto sobre *o que é* e *quando usar* cada ferramenta estatística.

### O que foi feito

**`src/components/ui/Tooltip.jsx`** — Criado/reescrito (2 versões)

- **v1:** Tooltip simples com `text` prop e posicionamento relativo (limitado pelo `overflow: hidden` do painel).
- **v2 (final):** Refatorado com **React Portal** (`createPortal`) para escapar do overflow do painel, usando `getBoundingClientRect()` para posicionamento `fixed` preciso.
- Suporta duas props semânticas:
  - `conceito` — badge roxo **"📖 Conceito"**: o que é aquele bloco
  - `quando` — badge verde **"✅ Use quando"**: a condição para aplicá-lo
- Visual dark premium com seta lateral apontando para o botão de origem

**`src/pages/Canvas/FlowDesigner.jsx`** — Modificado

- Todos os 15 botões no painel envolvidos em `<Tooltip conceito="..." quando="..." />` com conteúdo específico para cada ferramenta:

| Seção | Blocos com Tooltip |
|---|---|
| Exploração | Base ENEM, Ver Tabela, Contar N, Boxplot, N > 5000? |
| Pressupostos | Levene, Kolmogorov-Smirnov, Shapiro-Wilk |
| Inferência | É Normal?, ANOVA, Kruskal-Wallis |
| Significância | P < 0.05? |
| Tamanho do Efeito | Epsilon², Eta² |
| Post-Hoc | Dunn, Tukey |
| Conclusão | Aceitar H0, Sucesso |

---

## 3. Sistema de Badges/Conquistas

### Motivação
A plataforma não tinha nenhuma recompensa ou gamificação para motivar o progresso do aluno.

### Arquitetura

```
Evento de usuário
  → unlockBadge('id')          ← services/badgeService.js
    → localStorage persistido
    → CustomEvent 'badge-unlocked' despachado
      → BadgeNotification.jsx  ← Toast animado
      → BadgesPanel.jsx        ← Painel atualiza
```

Sem Context API — comunicação via `CustomEvent` + `localStorage`.

### Arquivos criados

**`src/constants/badges.js`**
- 6 badges definidos com: `id`, `nome`, `descricao`, `icone`, `raridade`, `cor`
- 4 níveis de raridade: Comum, Raro, Épico, Lendário

**`src/services/badgeService.js`**
- `getUnlockedBadges()` — lê `localStorage`
- `isUnlocked(id)` — booleano
- `unlockBadge(id)` — persiste e dispara `CustomEvent` (idempotente: ignora se já desbloqueado)

**`src/components/ui/BadgeNotification.jsx`**
- Toast animado com slide-in da esquerda ao receber o evento `badge-unlocked`
- Ícone do badge com animação de pulso CSS
- Exibe nome, raridade colorida e cor de borda do badge
- Auto-fecha em 4s; clicável para fechar manualmente

**`src/components/ui/BadgesPanel.jsx`**
- Grade responsiva de todos os badges no Dashboard
- Bloqueados: ícone em silhueta cinza, nome `???`
- Desbloqueados: animação de escala, borda e sombra colorida, hover elevado
- Barra de progresso geral (`X de 6 desbloqueados`)

### Arquivos modificados

**`src/App.jsx`**
- `<BadgeNotification />` adicionado globalmente fora do `ReactFlowProvider`
- `unlockBadge('primeiro-passo')` dispara ao acessar qualquer trilha
- `unlockBadge('explorador')` dispara ao entrar no CanvasLab

**`src/pages/Dashboard/Dashboard.jsx`**
- `<BadgesPanel />` adicionado abaixo da grade de trilhas
- `unlockBadge('completista')` dispara quando 100% de progresso em todas as trilhas do módulo

**`src/pages/Canvas/FlowDesigner.jsx`**
- `unlockBadge('mestre-normalidade')` dispara ao adicionar Shapiro-Wilk ou Kolmogorov-Smirnov
- `unlockBadge('cientista')` dispara ao completar validação com sucesso
- `unlockBadge('guardiao-rigor')` dispara quando nota da validação ≥ 80

### Tabela de badges

| Badge | Ícone | Raridade | Trigger |
|---|---|---|---|
| Primeiro Passo | 🌱 | Comum | Acessar qualquer trilha |
| Explorador | 🔍 | Comum | Abrir o CanvasLab |
| Mestre da Normalidade | 📊 | Raro | Usar Shapiro-Wilk ou K-S |
| Cientista de Dados | 🧪 | Raro | Validação concluída |
| Guardião do Rigor | 🏛️ | Épico | Nota ≥ 80 na validação |
| Completista | 🏆 | Lendário | 100% em todas as trilhas do módulo |

---

## 4. Correções de Build

| Arquivo | Erro | Correção |
|---|---|---|
| `FlowDesigner.jsx` | `>` literal dentro de JSX (`N > 5000`) | Substituído por `&gt;` |
| `CanvasTutorial.jsx` | Atributo `style` duplicado nos dots do carrossel | Unificado em um único objeto `style` |
