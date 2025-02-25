import pandas as pd
from opensearchpy import OpenSearch
import json

import pandas as pd

# Intenta cargarlo como archivo Excel directamente
file_path = 'C:/Users/Daniel Lopez/Documents/devsecops/soa.xlsx'
df = pd.read_excel(file_path, engine='openpyxl')
print(df.head())

# Reemplazar los NaN con una cadena vacía
df = df.fillna('')

# Convertir a JSON
json_data = df.to_dict(orient='records')

# Conectar a OpenSearch
client = OpenSearch(
    hosts=["https://localhost:9201"],
    http_auth=('admin', 'Soporte18*'),
    use_ssl=True,
    verify_certs=False
)

# Crear un índice
index_name = 'soa_iso_27001'
client.indices.create(index=index_name, ignore=400)

# Cargar los datos en OpenSearch
for record in json_data:
    client.index(index=index_name, body=record)

print("Carga de datos completada.")
