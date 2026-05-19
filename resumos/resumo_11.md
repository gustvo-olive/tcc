# Resumo da Sessão 11 — Rigor Estatístico e Refino do Juiz (19/05/2026)

Esta sessão focou em elevar o rigor científico das trilhas de associação e corrigir a lógica de pontuação do motor estatístico.

---

## 🏗️ 1. Organização do Projeto
- **Pasta /resumos:** Criada uma pasta dedicada para armazenar todos os logs de progresso do projeto, limpando a raiz do diretório.

## ⚖️ 2. Evolução Teórica (Pearson)
- **Ajuste de Fronteira:** O limite do teste de **Shapiro-Wilk** foi atualizado para até **5.000 amostras**, alinhando o sistema com as práticas modernas de Ciência de Dados (SciPy).
- **Desvio de Lógica:** Implementado o fluxo ramificado no Gabarito:
    - Se N > 5000 -> Kolmogorov-Smirnov.
    - Se N <= 5000 -> Shapiro-Wilk.
    - Se Normal -> Pearson.
    - Se Não-Normal -> Spearman.
- **Gráfico de Dispersão:** Adicionada dica pedagógica explicando a importância da validação visual de linearidade antes do cálculo do r.

## 🛠️ 3. Correção do "Bug dos 95 pontos"
- **Novo Ponto de Rastreio:** O `engine.py` foi refatorado para iniciar a verificação de "alcance" a partir do nó de **Pergunta (Input)** em vez da Base. Isso eliminou a penalidade de 5 pontos que ocorria em fluxos perfeitamente conectados.
- **Rigor Híbrido:** O Juiz agora aceita tanto o caminho paramétrico quanto o não-paramétrico, desde que a decisão seja baseada no teste de normalidade.

## 📍 4. Onde Paramos?
- O sistema está com o **Módulo 3 (Associação)** tecnicamente pronto e validado.
- Os gabaritos de Pearson e Qui-Quadrado estão operacionais com nota 100/100.
- **Próxima Sessão:** Iniciar a criação dos **Desafios Reais** do Módulo 3 (ex: "Desafio da Desigualdade Digital") e expandir a base teórica no frontend para acompanhar esses fluxos complexos.

---
*Assinado: Gemini CLI (Engenheiro de Software Sênior)*
