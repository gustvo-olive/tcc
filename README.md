# StatFlow: Um Sistema de Tutoria Inteligente No-Code para o Ensino de Estatística

O **StatFlow** é um Sistema de Tutoria Inteligente (STI) *No-Code* desenvolvido como Trabalho de Conclusão de Curso (TCC) no Bacharelado Interdisciplinar em Ciência e Tecnologia da Universidade Federal do Maranhão (UFMA). 

O principal objetivo da plataforma é reduzir a sobrecarga cognitiva (teoria CLT) de estudantes iniciantes no aprendizado de Estatística e Ciência de Dados, substituindo a escrita manual de códigos complexos por abordagens de programação visual e fornecendo feedback metodológico imediato por meio de um **Juiz Estatístico**.

---

## 👥 Autores e Orientação
*   **Discentes**: Gustavo de Oliveira Rego Morais & Ricardo Breno Aguiar Gonçalves
*   **Orientadora**: Profa. Dra. Alana de Araújo Oliveira Meireles Teixeira
*   **Instituição**: Universidade Federal do Maranhão (UFMA) - 2026

---

## 🧠 Características Principais

*   **Sistema de Tutoria Inteligente (STI)**: Provê mediação pedagógica ativa e *scaffolding* (andaimes cognitivos) através de fundamentação teórica integrada e trilhas baseadas em Aprendizagem Baseada em Problemas (PBL).
*   **Interfaces de Programação Visual (No-Code)**:
    *   **Pipeline Sequencial Linear (Módulo 1)**: Interface guiada passo a passo para curadoria, tratamento de dados, engenharia de atributos e técnicas de amostragem.
    *   **CanvasLab (Módulo 2)**: Canvas interativo baseado em grafos para estruturação de testes estatísticos de hipóteses e análises de associação.
*   **Juiz Estatístico**: Algoritmo no backend baseado em Busca em Profundidade (DFS) que analisa a topologia do fluxo desenhado pelo estudante, garantindo o rigor metodológico (ex: bloqueando testes paramétricos caso pressupostos obrigatórios como normalidade e homocedasticidade não tenham sido validados previamente) e emitindo feedback corretivo detalhado em tempo real.
*   **Gamificação**: Engajamento sustentado via atribuição de notas de qualidade de grafo (Score), pontos de experiência (XP), patentes acadêmicas progressivas e desbloqueio de insígnias (*badges*) persistidas em banco de dados SQLite local.
*   **Bases de Dados Didatizadas baseadas no ENEM**: Utiliza dados sintéticos didáticos inspirados nos microdados reais do ENEM/INEP para simular problemas práticos do cenário educacional brasileiro.

---

## 📁 Estrutura do Projeto

O ecossistema é construído de forma desacoplada em arquitetura cliente-servidor:
*   **`backend/`**: API desenvolvida com FastAPI (Python), responsável por processar as rotinas estatísticas (usando Pandas, NumPy e SciPy), persistência de dados local (SQLite/SQLAlchemy) e orquestração do Juiz Estatístico.
*   **`frontend/`**: Interface reativa em React.js (Vite) utilizando `@xyflow/react` para renderização interativa do canvas e blocos visuais, e KaTeX para formatação de fórmulas matemáticas.

---

## 🛠️ Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:
*   [Python 3.10+](https://www.python.org/downloads/)
*   [Node.js (versão 18+)](https://nodejs.org/)
*   Gerenciador de pacotes `npm` (instalado junto com o Node.js)

---

## 🚀 Como Rodar o Backend

Siga os passos abaixo em um terminal:

1.  **Navegue até a pasta do backend:**
    ```bash
    cd backend
    ```

2.  **Crie e ative um ambiente virtual (Recomendado):**
    *   **No Windows:**
        ```bash
        python -m venv venv
        venv\Scripts\activate
        ```
    *   **No Linux/macOS:**
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```

3.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Inicie o servidor da API:**
    ```bash
    python main.py
    ```
    *A API estará rodando por padrão em `http://127.0.0.1:5000`.*
    *Você pode acessar a documentação interativa (Swagger UI) em: `http://127.0.0.1:5000/docs`.*

---

## 💻 Como Rodar o Frontend

Abra um **novo terminal** e siga os passos abaixo:

1.  **Navegue até a pasta do frontend:**
    ```bash
    cd frontend
    ```

2.  **Instale as dependências do Node:**
    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    *O frontend estará acessível em: `http://localhost:5173`.*

---

## ⚙️ Tecnologias Utilizadas

*   **Frontend**: React (Vite), React Flow (`@xyflow/react`), KaTeX, CSS Vanilla.
*   **Backend**: FastAPI, Uvicorn, SQLite, SQLAlchemy, Pandas, NumPy, SciPy.
