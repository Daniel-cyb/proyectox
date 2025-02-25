# -*- coding: utf-8 -*-
"""
Created on Tue Aug 20 01:01:04 2024

@author: Daniel Lopez
"""

import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import StaleElementReferenceException, NoSuchElementException, TimeoutException, WebDriverException
from webdriver_manager.chrome import ChromeDriverManager
import time
import os

# Credenciales de Twitter
username = "3175762030"
password = "Soporte18*"

# Configurar el WebDriver para Chrome
options = webdriver.ChromeOptions()
# options.add_argument('--headless')  # Ejecutar Chrome en modo headless
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

# URL de inicio de sesión en Twitter
login_url = "https://twitter.com/i/flow/login"

# Función para obtener los datos de un tweet manejando excepciones
def get_tweet_data(tweet):
    max_retries = 10
    retries = 0
    while retries < max_retries:
        try:
            tweet_link = tweet.find_element(By.XPATH, ".//a[contains(@href, '/status/')]").get_attribute('href')
            tweet_id = tweet_link.split('/')[-1]

            user_handle = tweet.find_element(By.XPATH, ".//span[contains(text(), '@')]").text
            
            # Intentar encontrar el texto del tweet
            try:
                text = tweet.find_element(By.CSS_SELECTOR, 'div[lang]').text
            except NoSuchElementException:
                text = 'No text found'
            
            # Manejar likes, replies y date opcionalmente
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
            
            # Limpiar y formatear el texto del tweet
            text = " ".join(text.split("\n")).replace(",", " ")  # Reemplazar comas y unir líneas
            return [str(tweet_id), tweet_link, user_handle, text, date, likes, replies]
        except StaleElementReferenceException:
            print("StaleElementReferenceException capturado, reintentando...")
            retries += 1
            time.sleep(1)
    print("Error al capturar los datos del tweet después de varios intentos.")
    return None

# Función principal para ejecutar el script de scraping
def scrape_tweets(search_query, max_tweets=100, max_scrolls=10):
    search_url = f"https://twitter.com/search?q={search_query}&src=typed_query&f=live"

    try:
        # Abrir la página de inicio de sesión
        driver.get(login_url)
        print("Página de inicio de sesión cargada.")

        # Esperar a que el campo de usuario esté presente y enviar el nombre de usuario
        wait = WebDriverWait(driver, 20)
        username_field = wait.until(EC.presence_of_element_located((By.NAME, 'text')))
        username_field.send_keys(username)
        username_field.send_keys(u'\ue007')  # Presionar Enter
        print("Nombre de usuario ingresado.")

        # Esperar a que el campo de contraseña esté presente y enviar la contraseña
        password_field = wait.until(EC.presence_of_element_located((By.NAME, 'password')))
        password_field.send_keys(password)
        password_field.send_keys(u'\ue007')  # Presionar Enter
        print("Contraseña ingresada.")

        # Esperar a que la autenticación termine y se redirija a la página de inicio
        wait.until(EC.url_contains('home'))
        print("Autenticación completada.")

        # Navegar a la página de búsqueda
        driver.get(search_url)
        print("Página de búsqueda cargada. Esperando la carga completa de los elementos...")

        data = []
        tweet_count = 0
        scroll_count = 0

        while tweet_count < max_tweets and scroll_count < max_scrolls:
            # Esperar hasta que los artículos estén presentes
            try:
                tweets = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'article')))
            except TimeoutException:
                print("Timeout alcanzado al esperar los tweets. Saliendo del bucle.")
                break

            print(f"Se encontraron {len(tweets)} artículos.")

            # Extraer el texto de los tweets
            for tweet in tweets:
                if tweet_count >= max_tweets:
                    break
                try:
                    tweet_data = get_tweet_data(tweet)
                    if tweet_data:
                        data.append(tweet_data)
                        tweet_count += 1
                except NoSuchElementException as e:
                    print(f"Elemento no encontrado en el tweet: {e}")

            # Realizar scroll hacia abajo para cargar más tweets
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(5)  # Esperar un poco más para que se carguen más tweets
            scroll_count += 1

        # Crear un DataFrame con los datos extraídos
        df = pd.DataFrame(data, columns=['tweet_id', 'twitter_link', 'user_handle', 'text', 'date', 'likes', 'comments'])

        # Ruta del archivo CSV
        csv_path = 'C:/Users/Daniel Lopez/Documents/devsecops/Python/twitter/tweets.csv'
        
        # Asegurarse de que el archivo no esté abierto y tenga permisos de escritura
        if os.path.exists(csv_path):
            os.remove(csv_path)  # Eliminar el archivo existente si es necesario

        # Guardar el DataFrame en un archivo CSV
        df.to_csv(csv_path, index=False, encoding='utf-8-sig')

        # Mostrar el DataFrame
        print(df)

    except WebDriverException as e:
        print(f"Se produjo una excepción de WebDriver: {e}")
    except Exception as e:
        print(f"Se produjo una excepción: {e}")

    finally:
        # Cerrar el WebDriver
        driver.quit()

# Ejecutar la función principal con el término de búsqueda "Bancoldex" y los parámetros deseados
scrape_tweets('Bancoldex', max_tweets=200, max_scrolls=10)
