# Resumo 7 — Persistência, Didática e Exportação (12/05/2026)

Esta sessão consolidou a infraestrutura de dados do TCC, migrando para persistência real e criando um ambiente de aprendizado mais controlado para iniciantes.

---

## 🏗️ 1. Persistência SQLite (Fim do localStorage puro)
- **Modelos de Dados:** Implementação de tabelas no backend (`models.py`) para `usuarios`, `progresso_trilhas` e `badges_desbloqueados`.
- **Sincronização:** O `App.jsx` agora busca os dados do SQLite na inicialização e popula o `localStorage`, garantindo que o progresso não se perca ao limpar o cache do navegador.
- **Endpoints:** Criados caminhos no FastAPI para salvar progresso e destravar badges em tempo real.

## 📊 2. Datasets Didáticos (Redução de Carga Cognitiva)
- **Gerador de Dados:** Criado o script `backend/generate_didactic_data.py` para gerar bases controladas.
- **Trilha de Limpeza:** `mini_enem_sujo.csv` (50 linhas) com erros propositais como idades impossíveis (250 anos) e notas absurdas (9999).
- **Trilha de Associação:** `base_associacao_didatica.csv` (100 linhas) com correlações de Pearson fortes ($r \approx 0.9$) e associações de Qui-Quadrado óbvias entre Tipo de Escola e Acesso à Internet.
- **Lógica de Seleção:** O backend agora troca automaticamente o arquivo `.csv` carregado dependendo da trilha selecionada pelo aluno.

## 🐍 3. Ferramentas de Exportação
- **Exportar Script Python:** Implementada funcionalidade que gera um arquivo `.py` funcional com o código Pandas/SciPy correspondente ao fluxograma visual do aluno.
- **Limpeza de UI:** Removido o botão de exportar PNG devido à baixa qualidade do print e para evitar poluição visual, priorizando o script Python.

## 🧮 4. Expansão Estatística
- **Trilha de Associação:** Implementada lógica para **Pearson**, **Spearman**, **Qui-Quadrado** e **V de Cramer**.

---

## 🚀 Próximos Passos
1. **Refinar Datasets Didáticos:**
   - Adicionar mais "ruído pedagógico" aos CSVs (mais casos de valores nulos e categorias erradas).
   - Criar uma história/contexto para esses dados no painel lateral de "Missão".
2. **Widgets de Associação:** 
   - Melhorar a visualização dos resultados de Qui-Quadrado (exibir a tabela de contingência no modal).
3. **Dashboard de Progresso:**
   - Criar uma visão visual no Dashboard que consuma as notas e progressos salvos no SQLite.
4. **Trilha de Predição:**
   - Marcar como "Em breve" ou "Construindo" conforme orientação da professora, mas manter o espaço reservado na UI.

---
*Assinado: Gemini CLI (Engenheiro de Software Sênior)*
