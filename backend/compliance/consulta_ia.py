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
    embedding_model = OllamaEmbeddings(model="llama||3.1")
    embeddings = embedding_model.embed_query(text)
    return embeddings

# Realizar una búsqueda semántica en OpenSearch
def search_documents_semantic(client, index_name, query_text):
    query_vector = get_embeddings(query_text)  # Obtener embeddings de la consulta
    search_body = {
        "size": 3,  # Número de resultados que deseas devolver
        "query": {
            "knn": {
                "content_vector": {
                    "vector": query_vector,
                    "k": 3  # Número de vecinos más cercanos a devolver
                }
            }
        }
    }
    response = client.search(index=index_name, body=search_body)
    return response

# Endpoint para recibir consultas desde el chat
@app.route('/chat', methods=['POST'])
def chat():
    query_text = request.json.get('message')  # Obtener el mensaje del chat (consulta)
    
    # Conectar a OpenSearch y buscar documentos relevantes
    client = connect_to_opensearch()
    index_name = 'documents_index'
    search_results = search_documents_semantic(client, index_name, query_text)
    
    # Procesar los resultados de la búsqueda
    results = []
    for hit in search_results['hits']['hits']:
        result = {
            'document': hit['_id'],
            'score': hit['_score'],
            'content': hit['_source']['content'][:500]  # Fragmento del contenido
        }
        results.append(result)
    
    return jsonify(results)  # Devolver los resultados en formato JSON

if __name__ == '__main__':
    app.run(port=3052)
