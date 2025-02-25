import os
import time
from opensearchpy import OpenSearch, helpers
import urllib3

# Desactivar advertencias de verificación SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Función para conectar a OpenSearch con configuración ajustada
def connect_to_opensearch():
    host = 'https://localhost:9201'
    auth = ('admin', 'Soporte18*')  # Credenciales de OpenSearch

    client = OpenSearch(
        hosts=[host],
        http_compress=True,  # Compresión de datos
        http_auth=auth,
        use_ssl=True,  # Usar HTTPS
        verify_certs=False,  # No verificar certificados SSL
        ssl_show_warn=False,  # No mostrar advertencias de SSL
        timeout=60,  # Aumentar tiempo de espera a 60 segundos
        max_retries=5,  # Intentar reintentos automáticos
        retry_on_timeout=True
    )
    return client

# Función para cargar los datos al índice con manejo de lotes y reintentos
def load_domains_to_index(file_path, index_name, batch_size=500):
    client = connect_to_opensearch()

    # Crear el índice si no existe
    if not client.indices.exists(index=index_name):
        client.indices.create(index=index_name)
        print(f"Índice '{index_name}' creado.")

    # Leer el archivo línea por línea y procesar en lotes
    actions = []
    with open(file_path, 'r', encoding='utf-8') as file:
        for i, line in enumerate(file, start=1):
            clean_domain = line.strip()  # Eliminar espacios y saltos de línea
            if clean_domain:  # Validar que no esté vacío
                actions.append({
                    "_index": index_name,
                    "_source": {"domain": clean_domain}
                })

            # Enviar lotes de documentos al índice
            if len(actions) >= batch_size:
                retry_bulk(client, actions)  # Usar función de reintento
                print(f"Lote de {batch_size} documentos cargado.")
                actions = []  # Vaciar la lista de acciones para el siguiente lote

        # Cargar los documentos restantes
        if actions:
            retry_bulk(client, actions)  # Cargar el último lote
            print(f"Lote final de {len(actions)} documentos cargado.")

    print("Carga de dominios completada.")

# Función para manejar reintentos al cargar lotes en OpenSearch
def retry_bulk(client, actions, retries=3):
    for attempt in range(retries):
        try:
            helpers.bulk(client, actions)
            return  # Si tiene éxito, salir de la función
        except Exception as e:
            print(f"Error en el intento {attempt + 1}: {e}")
            time.sleep(2 ** attempt)  # Tiempo de espera exponencial entre reintentos
    raise Exception("Error tras múltiples reintentos. Revisa los datos o el servidor.")

# Función para dividir archivos grandes si es necesario
def split_file(file_path, lines_per_file):
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    base_name = os.path.splitext(file_path)[0]
    for i in range(0, len(lines), lines_per_file):
        part_path = f"{base_name}_part{i // lines_per_file}.txt"
        with open(part_path, 'w', encoding='utf-8') as out_file:
            out_file.writelines(lines[i:i + lines_per_file])
        print(f"Archivo dividido: {part_path}")

# Ruta del archivo y nombre del índice
file_path = r'C:\Users\Daniel Lopez\Documents\devsecops\React\proyectox\logxai-services\logxai-cti\conector\domains.txt'
index_name = 'domains'

# Opcional: Dividir el archivo si es muy grande
# split_file(file_path, 10000)  # Dividir en partes de 10,000 líneas si es necesario

# Cargar los datos al índice
load_domains_to_index(file_path, index_name, batch_size=500)
