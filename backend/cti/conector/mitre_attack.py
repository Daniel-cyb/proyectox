import requests
from stix2 import (
    AttackPattern, Campaign, CourseOfAction, IntrusionSet,
    Malware, Tool, ThreatActor, Relationship, ExternalReference
)
from datetime import datetime
import uuid
from opensearchpy import OpenSearch
import urllib3

# Desactivar advertencias de SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# URL de los datos de MITRE ATT&CK en formato STIX 2.1
MITRE_ATTACK_URL = "https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/enterprise-attack/enterprise-attack.json"

# Configuración de OpenSearch
OPENSEARCH_HOST = "https://localhost:9201"
OPENSEARCH_USER = "admin"
OPENSEARCH_PASSWORD = "Soporte18*"
INDEX_NAME = "mitre_attack"

# Conexión a OpenSearch
client = OpenSearch(
    hosts=[OPENSEARCH_HOST],
    http_auth=(OPENSEARCH_USER, OPENSEARCH_PASSWORD),
    use_ssl=True,
    verify_certs=False
)

# Crear el índice si no existe
if not client.indices.exists(index=INDEX_NAME):
    client.indices.create(index=INDEX_NAME)
    print(f"Índice '{INDEX_NAME}' creado.")

# Función para obtener los datos desde GitHub
def fetch_mitre_data():
    response = requests.get(MITRE_ATTACK_URL)
    response.raise_for_status()
    return response.json().get("objects", [])

# Función para generar un ID válido con el prefijo adecuado
def generate_valid_id(stix_type, provided_id):
    if not provided_id or not provided_id.startswith(f"{stix_type}--"):
        return f"{stix_type}--{uuid.uuid4()}"
    return provided_id

# Función para procesar y cargar los datos en OpenSearch
def process_and_load_mitre_data(mitre_data):
    total_objects = len(mitre_data)
    loaded_count = 0

    for i, item in enumerate(mitre_data):
        stix_object = None
        stix_type = item.get("type", "unknown")

        # Ignorar tipos personalizados
        if stix_type.startswith("x-mitre-"):
            print(f"Ignorando tipo personalizado: {stix_type}")
            continue

        # Generar un ID válido
        item_id = generate_valid_id(stix_type, item.get("id"))

        try:
            # Procesar objetos según su tipo
            if stix_type == "attack-pattern":
                stix_object = AttackPattern(
                    id=item_id,
                    name=item.get("name", "N/A"),
                    description=item.get("description", ""),
                    created=item.get("created", datetime.utcnow().isoformat()),
                    modified=item.get("modified", datetime.utcnow().isoformat()),
                    labels=item.get("labels", []),
                    external_references=[
                        ExternalReference(source_name=ref.get("source_name"), url=ref.get("url"))
                        for ref in item.get("external_references", [])
                        if ref.get("url")
                    ]
                )
            elif stix_type == "relationship":
                # Validar referencias de tipo no personalizado
                source_ref = item.get("source_ref", "N/A")
                target_ref = item.get("target_ref", "N/A")
                if source_ref.startswith("x-mitre-") or target_ref.startswith("x-mitre-"):
                    print(f"Ignorando relación con referencias personalizadas: {source_ref} -> {target_ref}")
                    continue
                stix_object = Relationship(
                    id=item_id,
                    source_ref=source_ref,
                    target_ref=target_ref,
                    relationship_type=item.get("relationship_type", "N/A"),
                    description=item.get("description", ""),
                    created=item.get("created", datetime.utcnow().isoformat()),
                    modified=item.get("modified", datetime.utcnow().isoformat())
                )
            elif stix_type == "malware":
                stix_object = Malware(
                    id=item_id,
                    name=item.get("name", "N/A"),
                    description=item.get("description", ""),
                    created=item.get("created", datetime.utcnow().isoformat()),
                    modified=item.get("modified", datetime.utcnow().isoformat()),
                    labels=item.get("labels", []),
                    is_family=item.get("is_family", False),
                    external_references=[
                        ExternalReference(source_name=ref.get("source_name"), url=ref.get("url"))
                        for ref in item.get("external_references", [])
                        if ref.get("url")
                    ]
                )
            elif stix_type == "campaign":
                stix_object = Campaign(
                    id=item_id,
                    name=item.get("name", "N/A"),
                    description=item.get("description", ""),
                    created=item.get("created", datetime.utcnow().isoformat()),
                    modified=item.get("modified", datetime.utcnow().isoformat()),
                    labels=item.get("labels", []),
                    external_references=[
                        ExternalReference(source_name=ref.get("source_name"), url=ref.get("url"))
                        for ref in item.get("external_references", [])
                        if ref.get("url")
                    ]
                )
            else:
                print(f"Tipo no procesado: {stix_type}")

            # Cargar el objeto en OpenSearch si fue creado
            if stix_object:
                client.index(index=INDEX_NAME, id=stix_object.id, body=stix_object.serialize())
                loaded_count += 1

            # Mostrar progreso
            print(f"[{i + 1}/{total_objects}] Progreso: {((i + 1) / total_objects) * 100:.2f}% - Documentos cargados: {loaded_count}")

        except Exception as e:
            print(f"Error procesando {stix_type} con ID {item_id}: {e}")

    print(f"\nCargados exitosamente {loaded_count} de {total_objects} documentos.")

# Obtener datos de MITRE ATT&CK y cargarlos en OpenSearch
try:
    print("Descargando datos de MITRE ATT&CK...")
    mitre_data = fetch_mitre_data()
    print(f"Total de objetos en el JSON: {len(mitre_data)}")
    print("Procesando y cargando datos en OpenSearch...")
    process_and_load_mitre_data(mitre_data)
    print("Carga completada.")
except Exception as e:
    print(f"Error durante el procesamiento: {e}")

