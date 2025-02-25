import requests
from bs4 import BeautifulSoup

# Configurar las solicitudes para usar el proxy de Tor
session = requests.Session()
session.proxies = {
    'http': 'socks5h://127.0.0.1:9050',
    'https': 'socks5h://127.0.0.1:9050'
}

# Intentar scraping en un sitio .onion
def scrape_onion_site(url, keyword):
    try:
        print(f"Intentando acceder a {url}...")
        response = session.get(url)
        if response.status_code == 200:
            print(f"Acceso a {url} exitoso.")
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Verificar si se encontraron resultados
            no_results = soup.find(id='noResults')
            if no_results and 'couldn\'t find results' in no_results.text:
                print(f"No se encontraron resultados para '{keyword}'")
            else:
                # Si no se encontró el mensaje de "no results", mostrar el contenido
                print("Resultados de búsqueda disponibles:")
                print(soup.get_text()[:2000])  # Imprimir primeros 2000 caracteres para verificación
            
        else:
            print(f"Error: {response.status_code} al intentar acceder a {url}")
    except Exception as e:
        print(f"Error scraping {url}: {e}")

# URL de ejemplo en la dark web
onion_url = 'http://juhanurmihxlp77nkq76byazcldy2hlmovfu2epvl5ankdibsot4csyd.onion/search/?q=jalasoft'

# Palabra clave para buscar
keyword = 'jalasoft'

# Realizar scraping de prueba
scrape_onion_site(onion_url, keyword)