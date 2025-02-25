# -*- coding: utf-8 -*-
"""
Created on Fri Nov 22 17:24:44 2024

@author: Daniel Lopez
"""

import requests
import time
import logging
from opensearchpy import OpenSearch
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
import urllib3
from tqdm import tqdm  # Para la barra de progreso

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OpenSearch Configuration
OPENSEARCH_HOST = "https://localhost:9201"
OPENSEARCH_USER = "admin"
OPENSEARCH_PASSWORD = "Soporte18*"
INDEX_NAME = "cve_data"

# OpenSearch Connection
client = OpenSearch(
    hosts=[OPENSEARCH_HOST],
    http_auth=(OPENSEARCH_USER, OPENSEARCH_PASSWORD),
    use_ssl=True,
    verify_certs=False
)

# Define index mapping
mapping = {
    "mappings": {
        "properties": {
            "cve.id": {"type": "keyword"},
            "cve.description": {"type": "text"},
            "cve.references": {"type": "nested"},
            "cve.metrics": {"type": "nested"}
        }
    }
}

# Create the index if it doesn't exist
if not client.indices.exists(index=INDEX_NAME):
    client.indices.create(index=INDEX_NAME, body=mapping)
    logger.info(f"Índice '{INDEX_NAME}' creado con el mapeo.")

# Fetch CVE Data from NVD API
def fetch_cve_data(api_key, start_index=0, results_per_page=1000):
    url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
    params = {
        "startIndex": start_index,
        "resultsPerPage": results_per_page
    }
    headers = {
        "Accept": "application/json",
        "apiKey": api_key
    }

    session = requests.Session()
    retries = Retry(total=10, backoff_factor=5, status_forcelist=[500, 502, 503, 504])
    session.mount("https://", HTTPAdapter(max_retries=retries))

    try:
        response = session.get(url, params=params, headers=headers, timeout=300)
        if response.status_code == 200:
            vulnerabilities = response.json().get("vulnerabilities", [])
            logger.info(f"Fetched {len(vulnerabilities)} CVEs starting at index {start_index}")
            return vulnerabilities
        elif response.status_code == 404:
            logger.info("No more CVE data available. Exiting.")
            return []
        else:
            logger.error(f"Failed to fetch CVE data: {response.status_code}")
            return []
    except requests.RequestException as e:
        logger.error(f"Error al obtener datos de CVE: {e}")
        time.sleep(60)
        return []

# Index CVE Data into OpenSearch
def index_cve_data(data):
    for cve in data:
        cve_id = cve["cve"]["id"]
        try:
            client.index(index=INDEX_NAME, id=cve_id, body=cve)
            logger.info(f"Indexed CVE: {cve_id}")
        except Exception as e:
            logger.error(f"Error indexing CVE {cve_id}: {e}")

# Get the last indexed CVE ID from OpenSearch
def get_last_indexed_cve():
    try:
        query = {
            "size": 1,
            "sort": [{"cve.id.keyword": {"order": "desc"}}],
            "_source": ["cve.id"]
        }
        response = client.search(index=INDEX_NAME, body=query)
        hits = response.get("hits", {}).get("hits", [])
        if hits:
            last_cve_id = hits[0]["_source"]["cve"]["id"]
            logger.info(f"Último CVE indexado: {last_cve_id}")
            return last_cve_id
        else:
            logger.info("No se encontraron CVEs en el índice.")
            return None
    except Exception as e:
        logger.error(f"Error al consultar el último CVE indexado: {e}")
        return None

# Fetch and Index All CVEs
def main():
    api_key = "8a2940b5-a181-4051-a0ff-a4b001915577"
    last_indexed_cve = get_last_indexed_cve()
    start_index = 0
    results_per_page = 1000
    total_cves_fetched = 0

    with tqdm(desc="Fetching CVEs", unit="batch", leave=True) as progress_bar:
        while True:
            cve_data = fetch_cve_data(api_key, start_index=start_index, results_per_page=results_per_page)
            if not cve_data:
                break

            # Log IDs for debugging
            if cve_data:
                logger.info(f"First fetched CVE: {cve_data[0]['cve']['id']}")
                logger.info(f"Last fetched CVE: {cve_data[-1]['cve']['id']}")

            # Filter new CVEs if a last indexed CVE exists
            if last_indexed_cve:
                cve_data = sorted(cve_data, key=lambda x: x["cve"]["id"])
                cve_data = [cve for cve in cve_data if cve["cve"]["id"] > last_indexed_cve]
                logger.info(f"Filtered {len(cve_data)} new CVEs greater than {last_indexed_cve}")

            if cve_data:
                index_cve_data(cve_data)
                total_cves_fetched += len(cve_data)

            progress_bar.update(1)
            logger.info(f"Total CVEs fetched and indexed: {total_cves_fetched}")
            start_index += results_per_page

            if len(cve_data) < results_per_page:
                break

if __name__ == "__main__":
    main()
