import sqlite3
import json

def verificar_banco():
    # Conecta ao banco de dados
    conn = sqlite3.connect('enem_data_analytics.db')
    cursor = conn.cursor()

    try:
        # Busca todos os grafos salvos
        cursor.execute("SELECT id, licao_id, dados_grafo FROM grafos_salvos")
        rows = cursor.fetchall()

        if not rows:
            print("\n📭 O banco de dados está vazio. Envie um grafo pelo Canvas primeiro!")
            return

        print(f"\n✅ Encontrados {len(rows)} grafos salvos:\n")
        for row in rows:
            id_grafo, licao, dados_json = row
            dados = json.loads(dados_json)
            num_nodes = len(dados.get('nodes', []))
            num_edges = len(dados.get('edges', []))
            
            print(f"🆔 ID: {id_grafo}")
            print(f"📚 Lição: {licao}")
            print(f"🧱 Estrutura: {num_nodes} nós e {num_edges} conexões")
            print("-" * 30)

    except sqlite3.OperationalError:
        print("\n❌ A tabela 'grafos_salvos' ainda não foi criada. Rode a API (main.py) primeiro!")
    finally:
        conn.close()

if __name__ == "__main__":
    verificar_banco()