import json
from opensearchpy import OpenSearch
import urllib3
from langchain.embeddings import OllamaEmbeddings
from ollama import generate

# Deshabilitar advertencias SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Conexión a OpenSearch con verificación de SSL desactivada
def connect_to_opensearch():
    host = 'https://localhost:9201'
    auth = ('admin', 'Soporte18*')  # Credenciales de OpenSearch
    client = OpenSearch(
        hosts=[host],
        http_auth=auth,
        use_ssl=True,
        verify_certs=False,
    )
    return client

# Búsqueda semántica
def search_documents_semantic(client, index_name, query_text):
    # El vector del query debe ser generado por el modelo de embeddings
    embedding_model = OllamaEmbeddings(model="llama3.1")
    query_vector = embedding_model.embed_query(query_text)

    search_body = {
        "size": 5,  # Limita el número de resultados
        "query": {
            "knn": {
                "content_vector": {
                    "vector": query_vector,
                    "k": 5  # Número de resultados KNN más cercanos
                }
            }
        }
    }
    
    # Realizar la consulta KNN
    try:
        response = client.search(index=index_name, body=search_body)
        return response
    except Exception as e:
        print(f"Error en la búsqueda semántica: {e}")
        return None

# Generar respuesta basada en los documentos recuperados
def generate_response_from_documents(documents, query_text):
    # Combina el contenido de los documentos en un contexto
    context = "\n".join([doc["_source"]["content"] for doc in documents])
    
    # Crea un prompt para LLaMA 3.1 que identifique la intención
    prompt = f"""
    Contexto:
    {context}

    Pregunta: {query_text}
    
    Instrucciones: Identifica la intención de la pregunta anterior. Si la pregunta es sobre:
    - "cuántas veces" o "apariciones", responde con el número de veces que una palabra o frase aparece en el texto.
    - Si es para mostrar "resultados" o "fragmentos", presenta un resumen o fragmentos de los resultados.
    - Si es una pregunta general, proporciona una respuesta natural basada en el contexto.
    """
    
    # Genera una respuesta con LLaMA 3.1 que identifique la intención
    response = generate(
        model="llama3.1",
        prompt=prompt
    )
    
    # Extrae y retorna solo la respuesta del modelo
    return response['response']

def main():
    client = connect_to_opensearch()
    index_name = "documents_index"
    
    while True:
        query_text = input("Por favor, ingresa tu consulta (o escribe 'salir' para terminar): ")
        if query_text.lower() == 'salir':
            break

        # Realiza la búsqueda semántica
        semantic_search_results = search_documents_semantic(client, index_name, query_text)

        # Muestra los resultados de la búsqueda semántica
        if semantic_search_results:
            documents = semantic_search_results['hits']['hits']
            
            # Genera una respuesta basada en los documentos recuperados, identificando la intención de la pregunta
            response = generate_response_from_documents(documents, query_text)
            print("\nRespuesta Generada:")
            print(response)  # Solo imprime la respuesta generada
        else:
            print("No se encontraron resultados en la búsqueda semántica.")

if __name__ == '__main__':
    main()
