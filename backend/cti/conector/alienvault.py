import requests
import pandas as pd
from stix2 import ObservationExpression, EqualityComparisonExpression, ObjectPath
from datetime import datetime
import uuid
import time
import re
from opensearchpy import OpenSearch

# Variables de configuración
ALIENVAULT_API_KEY = "aa12e079e00852c172ee4c3e5a1e953145d4e371214a057025124cde7f95daf9"
ALIENVAULT_BASE_URL = "https://otx.alienvault.com/api/v1"
HEADERS = {
    "X-OTX-API-KEY": ALIENVAULT_API_KEY,
    "Content-Type": "application/json"
}
index_name = "cti_stix2"

# Conexión a OpenSearch
client = OpenSearch(
    hosts=["https://localhost:9201"],
    http_auth=('admin', 'Soporte18*'),
    use_ssl=True,
    verify_certs=False
)

# Crear el índice si no existe
if not client.indices.exists(index=index_name):
    client.indices.create(index=index_name)
    print(f"Índice '{index_name}' creado.")

# Mapeo de tipos de indicadores a sus atributos en STIX
PATTERN_MAPPING = {
    "IPv4": ["value"],
    "domain": ["value"],
    "FileHash-SHA256": ["hashes", "SHA-256"]
}

# Función para obtener datos desde AlienVault con paginación (limitado a 10 páginas)
def fetch_all_pulses(batch_size=50, max_pages=10):
    pulses = []
    page = 1
    while page <= max_pages:
        print(f"Fetching page {page}...")
        url = f"{ALIENVAULT_BASE_URL}/pulses/subscribed?page={page}&limit={batch_size}"
        response = requests.get(url, headers=HEADERS)
        
        if response.status_code == 429:
            print("Rate limit reached. Waiting before retrying...")
            time.sleep(60)
            continue

        response.raise_for_status()
        page_data = response.json().get("results", [])
        
        if not page_data:
            print("No more data to fetch.")
            break

        pulses.extend(page_data)
        page += 1
    return {"results": pulses}

# Función para generar patrones STIX para indicadores
def generate_stix_pattern(indicator_type, indicator_value):
    if indicator_type in PATTERN_MAPPING:
        lhs = ObjectPath(indicator_type.lower(), PATTERN_MAPPING[indicator_type])
        return EqualityComparisonExpression(lhs, indicator_value)
    return None

# Función para extraer el valor de IOC de 'Indicator Pattern'
def extract_ioc(indicator_pattern):
    match = re.search(r"= '([^']+)'", indicator_pattern)
    if match:
        return match.group(1)
    return None

# Función para convertir datos a un DataFrame
def convert_to_dataframe(pulse_data):
    data = []

    for pulse in pulse_data:
        threat_actor_id = "threat-actor--" + str(uuid.uuid4())
        threat_actor_name = pulse["name"]
        threat_actor_desc = pulse["description"]
        confidence = pulse.get("confidence", "Medium")
        labels = pulse.get("tags", [])
        external_references = [f"https://otx.alienvault.com/pulse/{pulse['id']}"]

        # Dividir las etiquetas en columnas individuales
        label_columns = {f"Label_{i+1}": label for i, label in enumerate(labels)}

        for indicator in pulse.get("indicators", []):
            pattern = None
            stix_expression = generate_stix_pattern(indicator["type"], indicator["indicator"])
            if stix_expression:
                pattern = ObservationExpression(stix_expression)
            else:
                print(f"Warning: Unsupported indicator type '{indicator['type']}' - Skipping.")

            if pattern:
                # Extraer el valor de IOC
                ioc_value = extract_ioc(str(pattern))

                row = {
                    "Threat Actor ID": threat_actor_id,
                    "Threat Actor Name": threat_actor_name,
                    "Threat Actor Description": threat_actor_desc,
                    "Confidence": confidence,
                    "External References": ", ".join(external_references),
                    "Indicator ID": "indicator--" + str(uuid.uuid4()),
                    "Indicator Type": indicator["type"],
                    "Indicator Pattern": str(pattern),
                    "IOC": ioc_value,  # Columna adicional con el valor extraído
                    "Indicator Description": indicator.get("description", ""),
                    "Timestamp": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ")
                }
                
                row.update(label_columns)
                data.append(row)

    df = pd.DataFrame(data)
    return df

# Función para cargar datos en OpenSearch
def load_data_to_opensearch(df):
    for _, record in df.iterrows():
        doc_id = record["Indicator ID"]
        # Convertir el registro a un diccionario y quitar NaN
        body = record.dropna().to_dict()
        client.index(index=index_name, id=doc_id, body=body)
    print("Datos cargados en OpenSearch.")

# Obtener los datos desde AlienVault, convertirlos y cargar en OpenSearch
pulses = fetch_all_pulses(max_pages=10)
df = convert_to_dataframe(pulses["results"])
load_data_to_opensearch(df)

# Ver las primeras filas del DataFrame en la consola
print(df.head())
