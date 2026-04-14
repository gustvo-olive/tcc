# Resumo da Sessão 1 - Frontend ENEM DataAnalytics

Este documento resume as implementações realizadas no dia 01/04/2026 para o projeto de TCC.

## 🏗️ 1. Arquitetura e Organização
- **Migração para Feature-Based:** O código foi extraído do `App.jsx` para pastas especializadas:
  - `src/pages`: `ModuleSelection`, `Dashboard`, `Theory`, `Canvas`.
  - `src/components/flow`: Nós customizados e controles do React Flow.
  - `src/constants`: Dados estáticos e conteúdo didático dissociados da lógica.
- **Roteamento Inteligente:** O `App.jsx` agora atua como um gerenciador de estados de navegação.

## 🎓 2. Motor Pedagógico (Scaffolding)
- **Wizard de Fases:** Implementação de navegação por etapas dentro das trilhas.
- **Visual Scaffolding:** Uso de blocos coloridos para Hipóteses (H0/H1), Alertas, Dicas e Missões.
- **Renderização de Fórmulas:** Integração do `react-katex` para exibir equações estatísticas em LaTeX.
- **Glossário Lateral:** Barra permanente com conceitos fundamentais (A Tríade do Rigor).

## 📊 3. Conteúdo Estatístico (Morettin & Bussab)
- **Trilha de Múltiplos Grupos:**
  - Explicação do Pipeline Inferencial completo.
  - **Normalidade Dual:** Diferenciação entre Shapiro-Wilk ($N < 5000$) e Kolmogorov-Smirnov ($N \ge 5000$).
  - **Bifurcação ANOVA vs Kruskal-Wallis:** Mapa de decisão baseado nos pressupostos.
  - **Magnitude:** Introdução do Tamanho do Efeito ($\eta^2$ e $\epsilon^2$).
  - **Post-Hoc:** Detalhamento dos testes de Tukey e Dunn.

## 🛠️ 4. Correções e Melhorias
- **Bug da Tela Branca:** Corrigidas as importações e variáveis renomeadas (`LICOES` -> `TRILHAS`).
- **Visibilidade:** Limpeza do `index.css` e imposição de cores escuras para leitura em fundos claros.
- **Navegação:** Correção do botão "Voltar" em trilhas sem conteúdo ou com erros de carregamento.

---

## 🚀 Próximos Passos (Sessão 2)

1.  **Trilha de Associações:** Finalizar o conteúdo didático para Correlação de Pearson e Qui-Quadrado.
2.  **Módulo 1 (Curadoria):** Iniciar a interface para o pipeline de tratamento de dados (Limpeza, Outliers, Amostragem).
3.  **Persistência de Progresso:** Implementar `localStorage` para salvar quais fases o aluno já concluiu.
4.  **Integração Backend:** Começar a preparar o `src/services/api.js` para enviar o grafo do Canvas para o Python.
5.  **Refinamento do Canvas:** Adicionar novos blocos visuais correspondentes às novas ferramentas (Levene, Dunn, K-S).

---
*Assinado: Gemini CLI (Engenheiro de Software Sênior)*
