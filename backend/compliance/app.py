import os
import urllib3
from opensearchpy import OpenSearch
from langchain.embeddings import OllamaEmbeddings
from flask import Flask, request, jsonify

# Deshabilitar advertencias SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = Flask(__name__)

# Conexión a OpenSearch con verificación de SSL desactivada
def connect_to_opensearch():
    host = 'https://localhost:9201'
    auth = ('admin', 'Soporte18*')  # Credenciales de OpenSearch
    client = OpenSearch(
        hosts=[host],
        http_auth=auth,
        use_ssl=True,
        verify_certs=False,  # Desactivar verificación de certificados SSL
    )
    return client

# Inicializar el modelo de embeddings con Ollama (LLaMA 3.1)
def get_embeddings(text):
    embedding_model = OllamaEmbeddings(model="llama3.1")
    embeddings = embedding_model.embed_query(text)
    return embeddings

# Endpoint para buscar en los documentos
@app.route('/api/chatsearch', methods=['POST'])
def chat_search():
    try:
        data = request.json
        query = data.get("query", "")

        if not query:
            return jsonify({"error": "La consulta está vacía"}), 400

        client = connect_to_opensearch()

        # Generar embeddings para la consulta
        query_vector = get_embeddings(query)

        # Realizar la consulta KNN en OpenSearch
        search_body = {
            "size": 5,  # Limita a 5 resultados
            "query": {
                "knn": {
                    "content_vector": {
                        "vector": query_vector,
                        "k": 5
                    }
                }
            }
        }

        response = client.search(index="documents_index", body=search_body)

        # Procesar los resultados
        results = []
        for hit in response['hits']['hits']:
            results.append({
                "document": hit["_source"]["content"],
                "score": hit["_score"]
            })

        return jsonify({"results": results}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5011, debug=True)
