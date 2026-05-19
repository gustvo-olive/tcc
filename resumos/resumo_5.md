# Resumo 5 — Sessão de Rigor e Expansão Metodológica

**Data:** 10/04/2026  
**Sessão:** Refatoração do Juiz, Expansão de Trilhas e Integração de Rigor

---

## 🏗️ 1. O Juiz Algorítmico 2.0 (`backend/engine.py`)

### Motivação
A lógica de correção estava misturada às rotas da API, dificultando a manutenção e permitindo notas altas para fluxos desconectados (análises "mágicas" sem base de dados).

### O que foi feito
- **Isolamento de Lógica:** Criada a classe `JuizEstatistico` em um arquivo próprio para validar o rigor científico.
- **Rigor de Rastreabilidade (DFS):** O sistema agora percorre o grafo a partir da "Base de Dados". Blocos que não fazem parte do caminho lógico são ignorados na pontuação.
- **Penalidade Drástica:** Implementamos um **teto de 30 pontos** para qualquer fluxograma que não conecte a "Base" ao nó de "Sucesso" (Conclusão), forçando o aluno a manter a integridade do pipeline.
- **Motor Híbrido:** O Juiz agora tenta carregar gabaritos em JSON (`gabarito_*.json`) antes de recorrer aos pesos padrão no código.

---

## 🎓 2. Expansão Pedagógica (Scaffolding)

### Motivação
As trilhas de "Dois Grupos" e "Associação" estavam incompletas, e faltavam pressupostos críticos como o **Teste de Levene**.

### O que foi feito em `lessonsContent.js`
- **Múltiplos Grupos:** Adicionada fase sobre **Homocedasticidade (Levene)** e como ela atua como "porteiro" para a ANOVA.
- **Trilha de Dois Grupos (Gênero e Escola):** Expandida de 3 para **8 fases**, seguindo o rigor completo:
  1. Hipóteses H0/H1
  2. Exploração via Boxplot
  3. Porteiros (Normalidade K-S + Levene)
  4. Bifurcação Paramétrico vs Não-Paramétrico
  5. Detalhamento do **Teste T-Student**
  6. Detalhamento do **Mann-Whitney U**
  7. Magnitude via **d de Cohen**
  8. Missão Final no Canvas

---

## 🎨 3. Evolução do Canvas e Integração

### O que foi feito em `FlowDesigner.jsx`
- **Novos Blocos Funcionais:** Adicionados botões para **Teste T**, **Mann-Whitney**, **d de Cohen** e **Levene**.
- **Fusão de Branches:** Integramos as novas ferramentas com os **Tooltips** (Portal-based), **Tutoriais** e **Badges** desenvolvidos pelo outro colaborador.
- **Contexto de Lição:** O frontend agora envia o `licaoId` no `submitHypothesis`, permitindo que o backend aplique o gabarito estatístico correto para cada desafio.
- **Widgets Inteligentes:** O `abrirWidget` (⚙️) foi atualizado para interpretar e exibir resultados de Teste T, Mann-Whitney e escalas de impacto do d de Cohen.

---

## 📊 4. Motor Estatístico Real (`main.py`)

- **Cálculos Reais:** O backend agora processa os Microdados do ENEM 2023 em tempo real para as novas trilhas:
  - **Comparação:** T-Student e Mann-Whitney (Gênero).
  - **Associação:** Pearson, Spearman (Renda vs Nota) e Qui-Quadrado (Escola vs Acesso à Internet).
  - **Limpeza:** Cálculo de impacto de remoção de nulos/zeros.

---

## 📍 Próximos Passos (Sessão 6)

1. **Gabaritos JSON:** Criar e testar o arquivo `gabarito_trilha-dois-grupos.json` para validar a nova trilha.
2. **Refinamento de Decisão:** Adicionar lógica na `engine.py` para verificar se o aluno escolheu o teste correto (ex: se os dados não são normais e o aluno escolheu Teste T, a nota deve ser penalizada).
3. **Persistência SQLite:** Implementar o salvamento das notas e badges no banco de dados para garantir a continuidade do progresso do aluno.
