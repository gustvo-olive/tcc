# Resumo da Sessão 9 — Pipeline de Limpeza e Refinamento de Dados (14/05/2026)

Esta sessão marcou uma evolução pedagógica significativa no projeto, diferenciando a experiência de **Curadoria de Dados** da **Análise Inferencial**.

---

## 🏗️ 1. Nova Interface: Workflow Builder (Pipeline Linear)
- **Mudança de Paradigma:** Substituímos o Canvas de blocos livre pelo **Cleaning Pipeline** para o Módulo 1. Agora, o aluno monta uma "linha de montagem" vertical de passos.
- **Motivação:** A limpeza de dados é inerentemente linear. O novo visual é mais profissional (estilo Alteryx/Power Query) e reduz a carga cognitiva, evitando o emaranhado de setas desnecessárias.

## 🌡️ 2. Monitor de Saúde e Integridade dos Dados
- **Feedback em Tempo Real:** Implementamos um Dashboard no topo do Lab que mostra a **Saúde da Amostra (%)** e o contador de **Erros Críticos**.
- **Motor de Execução Vivo:** Diferente do Canvas de Inferência, cada passo adicionado no Pipeline é executado **de verdade** no backend (Pandas). O aluno vê a saúde subir e a tabela se transformar instantaneamente.

## 🧹 3. Refinamento de Curadoria Técnica
- **Bases de Dados Complexas:** Geramos novos datasets com 500 linhas contendo:
    - Datas em formatos mistos (ISO vs Brasileiro).
    - Moedas sujas (R$, pontos de milhar, vírgulas).
    - Categorias inconsistentes (Inglês, ING, ingles).
    - Duplicatas e Outliers reais.
- **Auditoria de "Lixo":** Criamos a aba **"Removidos"** na prévia de dados, permitindo que o aluno audite o que o seu pipeline está descartando.

## 🛠️ 4. Correções de Infraestrutura
- **Conversor JSON Robusto:** Corrigimos erros de conexão causados por valores `NaN`, `NaT` e tipos `Numpy.int64`, garantindo que o FastAPI sempre retorne dados válidos.
- **Sincronização de Labels:** Resolvemos o bug onde o backend não reconhecia blocos renomeados na interface.

---

## 🚀 Próximos Passos (Aumentando a Complexidade)

Atualmente, o pipeline é resolvido "clicando em ordem". Para tornar o desafio digno de um TCC e exigir raciocínio do aluno, planejamos:

1.  **⚙️ Widgets de Configuração:** Em vez de apenas clicar no botão, o aluno precisará abrir a engrenagem do bloco para configurar:
    - *Ex:* No "Remover Nulos", escolher **quais** colunas ele quer limpar.
    - *Ex:* No "Tratar Outliers", definir o **limite superior e inferior** (Z-Score ou valor fixo).
2.  **🔗 Dependências Lógicas:** Fazer com que a ordem importe drasticamente. 
    - *Ex:* Tentar "Padronizar Moeda" em uma coluna que ainda tem nulos pode gerar erros que o aluno precisa resolver.
3.  **📉 Gráficos de Impacto:** Adicionar mini-histogramas dentro de cada passo do pipeline para mostrar a distribuição antes e depois daquela limpeza específica.
4.  **🏆 Desafios de Eficiência:** Premiar o aluno que limpa a base removendo o **mínimo** de linhas possível (excluindo apenas o erro e não a linha toda, se possível).

---
*Assinado: Gemini CLI (Engenheiro de Software Sênior)*
