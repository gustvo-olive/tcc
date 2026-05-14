# Resumo de Mudanças - Versão 8

Este documento resume as implementações realizadas para resolver problemas de conectividade e adicionar um sistema de feedback inteligente baseado em conexões (edges).

## 1. Correção do Motor Estatístico (Conectividade)
- **Resolução de Conflito de Porta:** Identificado e encerrado processo que bloqueava a porta `5000`.
- **Robustez do Servidor (`backend/main.py`):**
    - Servidor agora escuta em `0.0.0.0` para maior compatibilidade de rede.
    - Adicionado endpoint de saúde (`/`) para diagnósticos rápidos.
    - Implementado tratamento de valores `NaN` para garantir que o JSON enviado ao frontend seja sempre válido.
    - Adicionado suporte a datasets vazios ou filtragens que resultem em zero linhas.
- **Frontend (`frontend/src/services/api.js`):**
    - Atualizada URL de `127.0.0.1` para `localhost` para evitar problemas de CORS em certos navegadores.

## 2. Sistema de Feedback de Conexões (Rigor Científico)
- **Lógica de Juiz (`backend/engine.py`):**
    - O `JuizEstatistico` agora analisa as **arestas (edges)** criadas pelo aluno.
    - Cada conexão é comparada com o "Gabarito de Rigor Científico".
    - **Feedback Positivo:** Confirma conexões que seguem a ordem lógica correta.
    - **Feedback Negativo:** Alerta sobre saltos metodológicos ou conexões sem sentido estatístico.
- **Relatório de Rigor (`frontend/src/pages/Canvas/FlowDesigner.jsx`):**
    - O modal de validação agora exibe uma seção dedicada a feedbacks de conexão.
    - Uso de cores e ícones (✅/❌) para guiar o aprendizado do usuário durante a montagem do fluxo.

## 3. Melhorias de Código e Estabilidade
- Corrigido bug em `engine.py` onde os pesos dos blocos eram ignorados por erro de mapeamento de chaves (`pesos` vs `mapeamento_pesos`).
- Melhorada a extração de pesos e precedências a partir de arquivos JSON de gabarito.
- Adicionadas verificações de integridade no processamento de múltiplos grupos (Q006) e dois grupos (Sexo).

---
**Status Final:** Motor estatístico online, validado e com sistema de mentoria lógica ativo.
