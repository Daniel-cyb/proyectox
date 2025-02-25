# -*- coding: utf-8 -*-
"""
Created on Thu Nov 21 16:40:49 2024

@author: Daniel Lopez
"""

# -*- coding: utf-8 -*-
"""
Created on Thu Nov 21 16:12:32 2024
@author: Daniel Lopez
"""

import requests
import pandas as pd
from opensearchpy import OpenSearch
import urllib3
import xml.etree.ElementTree as ET

# Configuración de la API
TOKEN = '4a946bef9c0e2fe98f8ce72a52584d15'  # Reemplaza con tu token de acceso
TYPE = 'dailyupdate-detailed'  # Cambia según la información requerida (e.g., dailyupdate, malware)
FORMAT = 'json'  # Cambia a 'xml' si prefieres ese formato
API_URL = f'https://domains-monitor.com/api/v1/{TOKEN}/{TYPE}/{FORMAT}/'

# Configuración de OpenSearch
OPENSEARCH_HOST = 'https://localhost:9201'  # Reemplaza con la URL de tu instancia de OpenSearch
OPENSEARCH_USER = 'admin'  # Reemplaza con tu usuario de OpenSearch
OPENSEARCH_PASS = 'Soporte18*'  # Reemplaza con tu contraseña de OpenSearch
INDEX_NAME = 'domain-list'

# Desactivar advertencias de conexiones inseguras
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Función para descargar los datos desde la API
def download_domain_data():
    try:
        response = requests.get(API_URL)
        response.raise_for_status()
        print("Datos descargados exitosamente.")
        return response.json() if FORMAT == 'json' else response.text
    except Exception as e:
        raise ConnectionError(f"Error al descargar los datos de la API: {e}")

# Función para procesar datos en formato JSON
def process_json_data(data):
    try:
        df = pd.DataFrame(data)
        if df.empty or 'domain' not in df.columns:
            raise ValueError("El formato de datos JSON no contiene las columnas esperadas.")
        return df
    except Exception as e:
        raise ValueError(f"Error al procesar datos JSON: {e}")

# Función para procesar datos en formato XML
def process_xml_data(data):
    try:
        root = ET.fromstring(data)
        rows = []
        for record in root.findall('domain'):
            rows.append({
                'domain': record.findtext('name'),
                'ip': record.findtext('ip'),
                'country': record.findtext('country'),
                'date': record.findtext('date')
            })
        df = pd.DataFrame(rows)
        if df.empty or 'domain' not in df.columns:
            raise ValueError("El formato de datos XML no contiene las columnas esperadas.")
        return df
    except Exception as e:
        raise ValueError(f"Error al procesar datos XML: {e}")

# Función para cargar datos en OpenSearch
def load_data_to_opensearch(df):
    try:
        client = OpenSearch(
            hosts=[OPENSEARCH_HOST],
            http_auth=(OPENSEARCH_USER, OPENSEARCH_PASS),
            use_ssl=True,
            verify_certs=False
        )

        # Crear el índice si no existe
        if not client.indices.exists(index=INDEX_NAME):
            client.indices.create(index=INDEX_NAME)
            print(f"Índice '{INDEX_NAME}' creado.")

        # Insertar documentos en OpenSearch
        for _, row in df.iterrows():
            doc = row.to_dict()
            doc_id = doc.get('domain', str(_))  # Usar el dominio como ID único
            client.index(index=INDEX_NAME, id=doc_id, body=doc)
        print(f"{len(df)} documentos cargados en OpenSearch.")
    except Exception as e:
        raise ConnectionError(f"Error al cargar datos en OpenSearch: {e}")

# Proceso principal
if __name__ == '__main__':
    try:
        print("Descargando datos de la API...")
        raw_data = download_domain_data()

        print("Procesando los datos...")
        if FORMAT == 'json':
            df = process_json_data(raw_data)
        elif FORMAT == 'xml':
            df = process_xml_data(raw_data)
        else:
            raise ValueError("Formato de datos no soportado. Usa 'json' o 'xml'.")

        if df.empty:
            print("El DataFrame está vacío. Verifica el formato de los datos descargados.")
        else:
            print("Primeras filas del DataFrame procesado:")
            print(df.head())
            print("Cargando datos en OpenSearch...")
            load_data_to_opensearch(df)
            print("Proceso completado exitosamente.")
    except Exception as e:
        print(f"Se produjo un error: {e}")
