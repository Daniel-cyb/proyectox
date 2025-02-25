import os
import pdfplumber
import urllib3
from opensearchpy import OpenSearch
from langchain.embeddings import OllamaEmbeddings
from tqdm import tqdm  # Barra de progreso
import numpy as np  # Necesario para promediar vectores
import logging  # Para manejo de logs

# Deshabilitar advertencias SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Conexión a OpenSearch con verificación de SSL desactivada
def connect_to_opensearch():
    host = 'https://localhost:9201'
    auth = ('admin', 'Soporte18*')  # Credenciales de OpenSearch
    try:
        client = OpenSearch(
            hosts=[host],
            http_auth=auth,
            use_ssl=True,
            verify_certs=False,  # Desactivar verificación de certificados SSL
        )
        logging.info("Conexión a OpenSearch exitosa.")
        return client
    except Exception as e:
        logging.error(f"Error al conectar con OpenSearch: {e}")
        return None

# Crear el índice con soporte para KNN
def create_index_with_knn(client, index_name):
    index_body = {
        "settings": {
            "index": {
                "knn": True  # Habilitar KNN en este índice
            }
        },
        "mappings": {
            "properties": {
                "content": {
                    "type": "text"
                },
                "content_vector": {
                    "type": "knn_vector",
                    "dimension": 4096  # Cambiar a la dimensión adecuada según tu modelo de embeddings
                }
            }
        }
    }
    
    try:
        response = client.indices.create(index=index_name, body=index_body, ignore=400)
        if 'acknowledged' in response:
            logging.info(f"Índice '{index_name}' creado correctamente.")
        else:
            logging.info(f"El índice '{index_name}' ya existe.")
        return response
    except Exception as e:
        logging.error(f"Error al crear el índice '{index_name}': {e}")
        return None

# Función para extraer el texto del PDF
def extract_text_from_pdf(pdf_path):
    try:
        with pdfplumber.open(pdf_path) as pdf:
            num_pages = len(pdf.pages)
            text = ''
            for page_num in tqdm(range(num_pages), desc=f"Extrayendo texto del PDF {pdf_path}"):
                page_text = pdf.pages[page_num].extract_text()
                if page_text:
                    text += page_text
                else:
                    logging.warning(f"Página {page_num + 1} del PDF '{pdf_path}' no contiene texto.")
        logging.info(f"Texto extraído del documento: {pdf_path}\n{text[:500]}...")
        return text
    except Exception as e:
        logging.error(f"Error al extraer texto del PDF '{pdf_path}': {e}")
        return None

# Inicializar el modelo de embeddings con Ollama (LLaMA 3.1)
def get_embeddings(text):
    try:
        embedding_model = OllamaEmbeddings(model="llama3.1")
        # Dividimos el texto en partes si es demasiado largo
        text_parts = [text[i:i + 1000] for i in range(0, len(text), 1000)]

        embeddings = []
        for part in tqdm(text_parts, desc="Generando embeddings"):
            embedding = embedding_model.embed_query(part)
            if embedding:
                embeddings.append(embedding)
                logging.info(f"Longitud del vector de embeddings para la parte: {len(embedding)}")
            else:
                logging.warning("No se pudo generar el embedding para esta parte del texto.")

        # Si hay múltiples embeddings, promediamos los vectores para obtener un solo vector de longitud 4096
        if len(embeddings) > 1:
            combined_embedding = np.mean(embeddings, axis=0)  # Promediar los vectores
            logging.info(f"Vector combinado generado con longitud: {len(combined_embedding)}")
            return combined_embedding
        elif len(embeddings) == 1:
            return embeddings[0]
        else:
            logging.warning("No se generaron embeddings para el texto.")
            return None
    except Exception as e:
        logging.error(f"Error al generar embeddings: {e}")
        return None

# Función para indexar el texto en OpenSearch junto con su vector
def index_document_in_opensearch(client, index_name, doc_id, document_text):
    vector = get_embeddings(document_text)  # Generar el vector usando el modelo de embeddings
    
    if vector is None or not isinstance(vector, np.ndarray):
        logging.error(f"No se generó un vector válido para el documento {doc_id}, no se indexará.")
        return
    
    if len(vector) != 4096:
        logging.error(f"La longitud del vector para el documento {doc_id} es incorrecta. Longitud: {len(vector)}")
        return

    document_body = {
        'content': document_text,
        'content_vector': vector.tolist()  # Convertimos el vector a lista para JSON
    }
    
    try:
        response = client.index(index=index_name, id=doc_id, body=document_body)
        logging.info(f"Documento {doc_id} indexado con éxito.")
        return response
    except Exception as e:
        logging.error(f"Error al indexar el documento {doc_id}: {e}")
        return None

# Procesar los PDFs y enviarlos a OpenSearch
def process_pdfs_in_directory(directory_path, client, index_name):
    files = [file_name for file_name in os.listdir(directory_path) if file_name.endswith('.pdf')]
    for file_name in tqdm(files, desc="Procesando archivos PDF"):
        pdf_path = os.path.join(directory_path, file_name)
        doc_id = file_name  # ID basado en el nombre del archivo
        text = extract_text_from_pdf(pdf_path)
        if text:
            logging.info(f"Indexando documento: {file_name}")
            index_document_in_opensearch(client, index_name, doc_id, text)

def main():
    client = connect_to_opensearch()
    if client:
        index_name = "documents_index"
        # Crear el índice con soporte para KNN
        create_index_with_knn(client, index_name)

        # Procesar los PDFs y enviarlos a OpenSearch
        directory_path = "C:/Users/Daniel Lopez/Documents/devsecops/React/dev_proyectox/backend/uploads"
        process_pdfs_in_directory(directory_path, client, index_name)

if __name__ == '__main__':
    main()
