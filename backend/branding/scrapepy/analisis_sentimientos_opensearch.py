# -*- coding: utf-8 -*-
"""
Script para análisis de sentimientos utilizando LLaMA 3.1 con Ollama y OpenSearch
Valida la existencia del índice antes de intentar leer o crear los deltas.

@author: Daniel Lopez
"""

import pandas as pd
from opensearchpy import OpenSearch, helpers
import re
import concurrent.futures
from langchain_community.llms import Ollama  # Ollama para LLaMA 3.1
import time
import urllib3

# Desactivar advertencias de verificación SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Función para conectar a OpenSearch
def connect_to_opensearch():
    host = 'https://localhost:9201'
    auth = ('admin', 'Soporte18*')  # Credenciales de OpenSearch

    client = OpenSearch(
        hosts=[host],
        http_compress=True,  # Compresión de datos
        http_auth=auth,
        use_ssl=True,  # Usar HTTPS
        verify_certs=False,  # No verificar los certificados SSL
        ssl_show_warn=False  # No mostrar advertencias de SSL
    )
    return client

# Verificar si el índice existe, si no, crearlo
def create_index_if_not_exists(index_name):
    if not os_client.indices.exists(index=index_name):
        print(f"El índice {index_name} no existe. Creando el índice...")
        body = {
            "mappings": {
                "properties": {
                    "tweet_id": {"type": "keyword"},
                    "twitter_link": {"type": "text"},
                    "user_handle": {"type": "text"},
                    "text": {"type": "text"},
                    "date": {"type": "date"},
                    "likes": {"type": "integer"},
                    "comments": {"type": "integer"},
                    "brand": {"type": "keyword"},
                    "sentiment": {"type": "keyword"},
                    "score": {"type": "float"},
                    "valencia": {"type": "text"},  # Nueva columna
                    "tono": {"type": "text"},      # Nueva columna
                    "intensidad": {"type": "text"}, # Nueva columna
                    "proposito": {"type": "text"},  # Nueva columna
                    "contextualizacion": {"type": "text"}, # Nueva columna
                }
            }
        }
        os_client.indices.create(index=index_name, body=body)
        print(f"Índice {index_name} creado.")
    else:
        print(f"Índice {index_name} ya existe.")

# Conectar a OpenSearch
os_client = connect_to_opensearch()

# Nombre del índice de origen y destino
source_index = 'tweets'
destination_index = 'tweets_sentimientos'

# Verificar o crear el índice de destino
create_index_if_not_exists(destination_index)

# Leer los datos del índice de OpenSearch
def read_opensearch_index(index_name):
    query = {
        "query": {
            "match_all": {}
        }
    }
    response = os_client.search(index=index_name, body=query, size=10000)  # Limitar a 10,000 documentos
    docs = [hit["_source"] for hit in response["hits"]["hits"]]
    return pd.DataFrame(docs)

# Función para obtener los tweets que no tienen análisis de sentimientos (deltas)
def get_deltas(df_source, df_destination):
    # Obtener los tweet_id de ambos índices
    source_ids = set(df_source['tweet_id'].unique())
    destination_ids = set(df_destination['tweet_id'].unique())
    
    # Identificar los tweets que están en el índice fuente, pero no en el índice destino (deltas)
    delta_ids = source_ids - destination_ids
    df_deltas = df_source[df_source['tweet_id'].isin(delta_ids)]
    
    return df_deltas

print(f"Leyendo datos del índice '{source_index}' en OpenSearch...")
df_source = read_opensearch_index(source_index)

print(f"Leyendo datos del índice '{destination_index}' en OpenSearch...")
df_destination = read_opensearch_index(destination_index)

# Obtener solo los deltas (nuevos tweets que no tienen análisis de sentimientos)
df_deltas = get_deltas(df_source, df_destination)
print(f"Total de tweets nuevos para análisis de sentimientos: {len(df_deltas)}")

# Convertir NaN en la columna 'text' a cadenas vacías utilizando .loc para evitar el warning
df_deltas.loc[:, 'text'] = df_deltas['text'].fillna('')

# Función para eliminar hashtags del texto
def remove_hashtags(text):
    return re.sub(r'#\w+', '', text)

# Aplicar la eliminación de hashtags antes del análisis de sentimientos utilizando .loc
print("Eliminando hashtags de los nuevos tweets...")
df_deltas.loc[:, 'text'] = df_deltas['text'].apply(remove_hashtags)

# Inicializar LLaMA 3.1 a través de Ollama
llm_model = Ollama(model="llama3.1", temperature=0)

# Función para analizar sentimientos y características adicionales
def analyze_sentiment_llama(text):
    try:
        prompt = f"Analiza el sentimiento de este texto y proporciona los siguientes aspectos: valencia, tono, intensidad, propósito, contextualización.\nTexto: {text}"
        print(f"Analizando sentimiento para el texto: {text[:50]}...")  # Mostrar los primeros 50 caracteres
        response = llm_model.invoke(prompt, timeout=30)

        # Interpretar la respuesta de LLaMA
        sentiment = response.strip().lower()

        # Aquí puedes usar palabras clave para detectar los diferentes aspectos
        sentiment_label = "neutral"
        sentiment_score = 3
        valencia = tono = intensidad = proposito = contextualizacion = "desconocido"

        # Interpretar respuesta (puedes hacer ajustes aquí según la respuesta de LLaMA)
        if "muy negativo" in sentiment:
            sentiment_label = "muy negativo"
            sentiment_score = 1
        elif "negativo" in sentiment:
            sentiment_label = "negativo"
            sentiment_score = 2
        elif "positivo" in sentiment:
            sentiment_label = "positivo"
            sentiment_score = 4
        elif "muy positivo" in sentiment:
            sentiment_label = "muy positivo"
            sentiment_score = 5

        # Asignar otros atributos según la respuesta de LLaMA
        if "valencia" in sentiment:
            valencia = "alta"
        if "tono" in sentiment:
            tono = "sarcasmo"
        if "intensidad" in sentiment:
            intensidad = "moderada"
        if "propósito" in sentiment:
            proposito = "informativo"
        if "contextualización" in sentiment:
            contextualizacion = "relevante"

        return sentiment_label, sentiment_score, valencia, tono, intensidad, proposito, contextualizacion
    except Exception as e:
        print(f"Error analizando sentimiento para el texto: {text[:50]}... Error: {e}")
        return "error", 0, "error", "error", "error", "error", "error"

# Analizar sentimientos en paralelo
print("Analizando sentimientos...")

def process_text(text):
    return analyze_sentiment_llama(text)

# Mostrar el progreso
total_tweets = len(df_deltas)
if total_tweets == 0:
    print("No hay nuevos tweets para procesar.")
else:
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        results = []
        for i, result in enumerate(executor.map(process_text, df_deltas['text'])):
            results.append(result)
            progress = (i + 1) / total_tweets * 100
            print(f"Progreso: {progress:.2f}% completado")

    # Añadir los resultados de sentimiento y puntuación al DataFrame
    df_deltas['sentiment'], df_deltas['score'], df_deltas['valencia'], df_deltas['tono'], df_deltas['intensidad'], df_deltas['proposito'], df_deltas['contextualizacion'] = zip(*results)

    # Agregar una columna para la marca que se está monitoreando
    df_deltas['monitored_brand'] = "TuMarca"  # Aquí puedes pasar la marca que estás monitoreando

    # Cargar los datos procesados (deltas) a OpenSearch
    print("Cargando los nuevos tweets analizados en OpenSearch...")

    def generate_opensearch_docs(df):
        for index, row in df.iterrows():
            yield {
                "_index": destination_index,
                "_id": row['tweet_id'],
                "_source": row.to_dict(),
            }

    try:
        success, failed = helpers.bulk(os_client, generate_opensearch_docs(df_deltas), raise_on_error=False)
        print(f"Documentos exitosamente indexados: {success}")
        if failed:
            print("Errores en los documentos:")
            for error in failed:
                print(error)
    except Exception as e:
        print(f"Error al cargar los datos en OpenSearch: {e}")

    # Mostrar resultados del DataFrame
    print(df_deltas)
