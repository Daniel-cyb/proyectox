# -*- coding: utf-8 -*-
"""
Created on Thu Nov 21 11:45:13 2024

@author: Daniel Lopez
"""

import requests
import pandas as pd
from stix2 import ObservationExpression, EqualityComparisonExpression, ObjectPath
from datetime import datetime
import uuid
import re
from opensearchpy import OpenSearch

# Variables de configuración
THREATFOX_API_KEY = "e3e245cd2beda0e6c751c136995f81f0d5e1d49e9d95d198"
THREATFOX_BASE_URL = "https://threatfox-api.abuse.ch/api/v1/"
HEADERS = {
    "Auth-Key": THREATFOX_API_KEY,
    "Content-Type": "application/json"
}
INDEX_NAME = "cti_stix2"

# Conexión a OpenSearch
client = OpenSearch(
    hosts=["https://localhost:9201"],
    http_auth=('admin', 'Soporte18*'),
    use_ssl=True,
    verify_certs=False
)

# Crear el índice si no existe
if not client.indices.exists(index=INDEX_NAME):
    client.indices.create(index=INDEX_NAME)
    print(f"Índice '{INDEX_NAME}' creado.")

# Mapeo de tipos de indicadores a sus atributos en STIX
PATTERN_MAPPING = {
    "ip": ["value"],
    "domain": ["value"],
    "sha256_hash": ["hashes", "SHA-256"]
}

# Función para obtener datos de ThreatFox
def fetch_iocs(days=7):
    payload = {"query": "get_iocs", "days": days}
    response = requests.post(THREATFOX_BASE_URL, headers=HEADERS, json=payload)
    response.raise_for_status()
    data = response.json()
    return data.get("data", [])

# Función para generar patrones STIX para indicadores
def generate_stix_pattern(indicator_type, indicator_value):
    if indicator_type in PATTERN_MAPPING:
        lhs = ObjectPath(indicator_type.lower(), PATTERN_MAPPING[indicator_type])
        return EqualityComparisonExpression(lhs, indicator_value)
    return None

# Función para extraer IOCs de indicadores
def extract_ioc(indicator_pattern):
    match = re.search(r"= '([^']+)'", indicator_pattern)
    return match.group(1) if match else None

# Función para convertir datos a un DataFrame
def convert_to_dataframe(iocs):
    data = []
    for ioc in iocs:
        stix_pattern = generate_stix_pattern(ioc["ioc_type"], ioc["ioc"])
        if stix_pattern:
            indicator_id = "indicator--" + str(uuid.uuid4())
            row = {
                "Indicator ID": indicator_id,
                "Indicator Type": ioc["ioc_type"],
                "Indicator Value": ioc["ioc"],
                "Indicator Pattern": str(stix_pattern),
                "Threat Name": ioc.get("threat_type", ""),
                "Confidence": ioc.get("confidence", ""),
                "Reference URL": ioc.get("malware", ""),
                "Timestamp": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ")
            }
            data.append(row)
    return pd.DataFrame(data)

# Función para cargar datos en OpenSearch
def load_data_to_opensearch(df):
    for _, record in df.iterrows():
        doc_id = record["Indicator ID"]
        body = record.dropna().to_dict()
        client.index(index=INDEX_NAME, id=doc_id, body=body)
    print("Datos cargados en OpenSearch.")

# Proceso principal
iocs = fetch_iocs(days=7)
if iocs:
    df = convert_to_dataframe(iocs)
    if not df.empty:
        load_data_to_opensearch(df)
        print("Carga completada. Primeras filas del DataFrame:")
        print(df.head())
    else:
        print("No se encontraron datos para convertir.")
else:
    print("No se obtuvieron datos de ThreatFox.")
