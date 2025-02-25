import os
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import StaleElementReferenceException, NoSuchElementException, TimeoutException, WebDriverException
from webdriver_manager.chrome import ChromeDriverManager
import time
from opensearchpy import OpenSearch

# Cargar las variables de entorno desde el archivo .env
dotenv_path = 'C:/Users/Daniel Lopez/Documents/devsecops/React/proyectox/logxai-frontend/.env'
load_dotenv(dotenv_path)

# Obtener la URL de la base de datos desde las variables de entorno
DATABASE_URL = os.getenv('DATABASE_URL')

# Asegúrate de que la URL utilice el driver correcto: 'mysql+pymysql://'
if 'mysql://' in DATABASE_URL and 'pymysql' not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace('mysql://', 'mysql+pymysql://')

# Crear el engine de SQLAlchemy
engine = create_engine(DATABASE_URL)

# Crear una sesión de SQLAlchemy
Session = sessionmaker(bind=engine)
session = Session()

# Conectar a OpenSearch
def connect_opensearch():
    host = 'https://localhost:9201'
    auth = ('admin', 'Soporte18*')
    
    client = OpenSearch(
        hosts=[host],
        http_compress=True,
        http_auth=auth,
        use_ssl=True,
        verify_certs=False,
        ssl_show_warn=False
    )
    return client

os_client = connect_opensearch()

# Obtener las marcas monitoreadas de la base de datos
def get_monitored_brands():
    try:
        result = session.execute(text("SELECT brandName FROM BrandingMonitoring"))
        brands = result.fetchall()
        unique_brands = set(row[0] for row in brands if row[0] and len(row[0]) > 1)
        return list(unique_brands)
    except Exception as e:
        print(f"Error al obtener marcas: {e}")
        return []
    finally:
        session.close()

# Crear un índice con un mapeo personalizado en OpenSearch
def create_index_if_not_exists(index_name, client):
    if not client.indices.exists(index=index_name):
        body = {
            "mappings": {
                "properties": {
                    "tweet_id": {"type": "keyword"},
                    "twitter_link": {"type": "text"},
                    "user_handle": {"type": "text"},
                    "text": {"type": "text"},
                    "date": {"type": "date"},
                    "likes": {"type": "integer"},
                    "comments": {"type": "integer"},
                    "brand": {"type": "keyword"}
                }
            }
        }
        client.indices.create(index=index_name, body=body)
        print(f"Índice '{index_name}' creado con éxito.")
    else:
        print(f"Índice '{index_name}' ya existe.")

# Configuración para el scraping de Twitter
username = "3175762030"
password = "Soporte18*"
options = webdriver.ChromeOptions()
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
login_url = "https://twitter.com/i/flow/login"

# Función para obtener los datos de un tweet
def get_tweet_data(tweet):
    max_retries = 10
    retries = 0
    while retries < max_retries:
        try:
            tweet_link = tweet.find_element(By.XPATH, ".//a[contains(@href, '/status/')]").get_attribute('href')
            tweet_id = tweet_link.split('/')[-1]
            user_handle = tweet.find_element(By.XPATH, ".//span[contains(text(), '@')]").text

            try:
                text = tweet.find_element(By.CSS_SELECTOR, 'div[lang]').text
            except NoSuchElementException:
                text = 'No text found'

            try:
                likes = tweet.find_element(By.XPATH, ".//div[@data-testid='like']").text
            except NoSuchElementException:
                likes = '0'

            try:
                replies = tweet.find_element(By.XPATH, ".//div[@data-testid='reply']").text
            except NoSuchElementException:
                replies = '0'

            try:
                date = tweet.find_element(By.XPATH, ".//time").get_attribute("datetime")
            except NoSuchElementException:
                date = 'N/A'

            text = " ".join(text.split("\n")).replace(",", " ")
            return [str(tweet_id), tweet_link, user_handle, text, date, likes, replies]
        except StaleElementReferenceException:
            retries += 1
            time.sleep(1)
    return None

# Función principal para ejecutar el scraping
def scrape_tweets(brand, max_tweets=100, max_scrolls=10):
    search_url = f"https://twitter.com/search?q={brand}&src=typed_query&f=live"
    try:
        driver.get(login_url)
        wait = WebDriverWait(driver, 20)
        username_field = wait.until(EC.presence_of_element_located((By.NAME, 'text')))
        username_field.send_keys(username)
        username_field.send_keys(u'\ue007')

        password_field = wait.until(EC.presence_of_element_located((By.NAME, 'password')))
        password_field.send_keys(password)
        password_field.send_keys(u'\ue007')
        wait.until(EC.url_contains('home'))

        driver.get(search_url)

        data = []
        tweet_count = 0
        scroll_count = 0

        while tweet_count < max_tweets and scroll_count < max_scrolls:
            try:
                tweets = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'article')))
            except TimeoutException:
                break

            for tweet in tweets:
                if tweet_count >= max_tweets:
                    break
                tweet_data = get_tweet_data(tweet)
                if tweet_data:
                    tweet_data.append(brand)  # Añadir la marca a los datos del tweet
                    data.append(tweet_data)
                    tweet_count += 1

            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(5)
            scroll_count += 1

        df = pd.DataFrame(data, columns=['tweet_id', 'twitter_link', 'user_handle', 'text', 'date', 'likes', 'comments', 'brand'])
        enviar_a_opensearch(df)
        print(df)

    except WebDriverException as e:
        print(f"Se produjo una excepción de WebDriver: {e}")

# Función para enviar los datos a OpenSearch
def enviar_a_opensearch(df):
    index_name = 'tweets'
    create_index_if_not_exists(index_name, os_client)

    for index, row in df.iterrows():
        document = row.to_dict()
        os_client.index(index=index_name, body=document)

# Función para ejecutar el análisis de sentimientos
def analizar_sentimientos():
    print("Ejecutando análisis de sentimientos...")

    # Aquí se implementaría la lógica para realizar el análisis de sentimientos
    # sobre los tweets indexados en OpenSearch.
    # Por ejemplo, podrías leer los tweets de OpenSearch, ejecutar el análisis y
    # guardar los resultados en un nuevo índice de OpenSearch.

# Obtener marcas monitoreadas y ejecutar el scraping para cada una con una pausa de 5 minutos
brands = get_monitored_brands()

if brands:
    for brand in brands:
        print(f"Realizando scraping para la marca: {brand}")
        scrape_tweets(brand, max_tweets=100, max_scrolls=5)
        
        print(f"Esperando 30 segundos antes de continuar con la siguiente marca...")
        time.sleep(30)  # 5 minutos = 300 segundos

    # Cerrar el navegador después de procesar todas las marcas
    driver.quit()

    # Ejecutar análisis de sentimientos una vez que todas las marcas hayan sido procesadas
    analizar_sentimientos()
else:
    print("No hay marcas monitoreadas disponibles.")
