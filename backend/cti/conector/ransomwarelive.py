import requests
from opensearchpy import OpenSearch
from deep_translator import GoogleTranslator
import time

# OpenSearch Configuration
OPENSEARCH_HOST = "https://localhost:9201"
OPENSEARCH_USER = "admin"
OPENSEARCH_PASSWORD = "Soporte18*"
INDEX_NAME = "ransomwarelive"

# OpenSearch Connection
client = OpenSearch(
    hosts=[OPENSEARCH_HOST],
    http_auth=(OPENSEARCH_USER, OPENSEARCH_PASSWORD),
    use_ssl=True,
    verify_certs=False
)

# Create the index if it doesn't exist
if not client.indices.exists(index=INDEX_NAME):
    client.indices.create(index=INDEX_NAME)
    print(f"Index '{INDEX_NAME}' created.")

# Ransomware.live Base URL
BASE_URL = "https://api.ransomware.live"

# Fetch Data from an API Endpoint with Language Preference
def fetch_data(endpoint):
    """
    Fetch data from the Ransomware.live API.
    :param endpoint: The API endpoint to fetch data from.
    :return: The JSON response as a dictionary, or None if the request fails.
    """
    url = f"{BASE_URL}{endpoint}"
    headers = {"accept": "application/json"}
    try:
        response = requests.get(url, headers=headers, timeout=30)
        if response.status_code == 200:
            print(f"Data fetched successfully from {endpoint}")
            return response.json()
        elif response.status_code == 404:
            print(f"Endpoint {endpoint} not found.")
        elif response.status_code == 429:
            print(f"Rate limit exceeded for {endpoint}.")
        else:
            print(f"Failed to fetch data from {endpoint}. Status Code: {response.status_code}")
        return None
    except requests.RequestException as e:
        print(f"Error fetching data from {endpoint}: {e}")
        return None

# Translate Text to English
# Translate Text to English
def translate_to_english(text):
    """
    Translate the given text to English using GoogleTranslator with retries for improved accuracy.
    :param text: The text to translate.
    :return: Translated text in English.
    """
    try:
        # Retry mechanism for translation
        for _ in range(3):  # Attempt up to 3 times
            translated_text = GoogleTranslator(source='auto', target='en').translate(text)
            if translated_text and translated_text != text:  # Ensure translation happened
                return translated_text
        print("Translation retries exhausted or text not changed.")
    except Exception as e:
        print(f"Error translating text: {e}")
    return text  # Return the original text if translation fails


# Send Data to OpenSearch
def index_data(index_name, data):
    """
    Index data into OpenSearch.
    :param index_name: The OpenSearch index to store the data.
    :param data: The data to be indexed.
    """
    for item in data:
        # Translate summary to English
        if "summary" in item:
            item["translated_summary"] = translate_to_english(item["summary"])

        # Generate a unique ID for the document
        doc_id = item.get("id") or str(hash(str(item)))
        try:
            client.index(index=index_name, id=doc_id, body=item)
            print(f"Document indexed with ID: {doc_id}")
        except Exception as e:
            print(f"Error indexing document with ID {doc_id}: {e}")

# Fetch and Index Data
def process_endpoint(endpoint, index_name):
    """
    Process data from a specific API endpoint and index it into OpenSearch.
    :param endpoint: The API endpoint to fetch data from.
    :param index_name: The OpenSearch index to store the data.
    """
    data = fetch_data(endpoint)
    if data:
        index_data(index_name, data)
    else:
        print(f"No data found for endpoint {endpoint}")

# Main Function to Fetch Data from Various Endpoints
def main():
    """
    Main function to fetch data from multiple endpoints and index them into OpenSearch.
    """
    endpoints = [
        "/recentvictims",        # Fetch recent ransomware victims
        "/groups",               # Fetch all ransomware groups
        "/allcyberattacks",      # Fetch all cyberattacks
        "/recentcyberattacks"    # Fetch recent cyberattacks
    ]

    for endpoint in endpoints:
        print(f"Processing data from endpoint: {endpoint}")
        process_endpoint(endpoint, INDEX_NAME)
        time.sleep(1)  # Respect the API's rate limit

if __name__ == "__main__":
    main()
