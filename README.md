# StatFlow

StatFlow é uma aplicação web interativa projetada para o ensino e aprendizado prático de Ciência de Dados e Estatística. A ferramenta utiliza uma interface visual baseada em nós e fluxos (com React Flow) no frontend e um motor de execução estatística robusto (FastAPI/Python) no backend.

---

## 📁 Estrutura do Projeto

O projeto é dividido em duas partes principais:

*   **`backend/`**: API desenvolvida com FastAPI (Python), responsável por processar as análises estatísticas, validação pedagógica e gerenciar o banco de dados SQLite.
*   **`frontend/`**: Interface web em React (Vite) utilizando React Flow para visualização do pipeline e design do fluxo.

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
    *O frontend estará acessível em: `http://localhost:5173` (ou no endereço exibido no terminal).*

---

## ⚙️ Tecnologias Utilizadas

*   **Frontend**: React, Vite, React Flow (@xyflow/react), KaTeX.
*   **Backend**: FastAPI, Uvicorn, SQLite, SQLAlchemy, Pandas, NumPy, SciPy.
