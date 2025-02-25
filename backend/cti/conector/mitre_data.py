import requests
import pandas as pd
import json
from datetime import datetime
import uuid

# URL de los datos de MITRE ATT&CK en formato STIX en GitHub
MITRE_ATTACK_URL = "https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/enterprise-attack/enterprise-attack.json"

# Función para obtener los datos desde GitHub
def fetch_mitre_data():
    response = requests.get(MITRE_ATTACK_URL)
    response.raise_for_status()
    return response.json().get("objects", [])

# Función para convertir datos de MITRE a un DataFrame
def convert_mitre_to_dataframe(mitre_data):
    # Lista para almacenar los datos en formato tabular
    data = []

    for item in mitre_data:
        # Identificar el tipo de objeto y extraer los campos relevantes
        object_type = item.get("type", "unknown")
        name = item.get("name", "N/A")
        description = item.get("description", "")
        created = item.get("created", "")
        modified = item.get("modified", "")
        labels = item.get("labels", [])
        external_references = [ref.get("url") for ref in item.get("external_references", []) if ref.get("url")]

        # Limitar la longitud de la descripción para mejorar la legibilidad en el CSV
        if len(description) > 100:
            description = description[:100] + "..."

        data.append({
            "ID": item.get("id", "N/A"),
            "Object Type": object_type,
            "Name": name,
            "Description": description,
            "Created": created,
            "Modified": modified,
            "Labels": ", ".join(labels),  # Convertir lista a cadena de texto separada por comas
            "External References": ", ".join(external_references),
            "Timestamp": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        })

    # Convertir la lista de datos a un DataFrame
    df = pd.DataFrame(data)
    return df

# Obtener los datos desde GitHub y convertirlos a un DataFrame
mitre_data = fetch_mitre_data()
df = convert_mitre_to_dataframe(mitre_data)

# Guardar el DataFrame en un archivo CSV para revisarlo, con delimitador y escapado mejorados
df.to_csv("mitre_attack_data.csv", index=False, sep=",", quotechar='"', encoding="utf-8", lineterminator="\n")
print("Data saved to mitre_attack_data.csv")

# Ver las primeras filas del DataFrame en la consola
print(df.head())

