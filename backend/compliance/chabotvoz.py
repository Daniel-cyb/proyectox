import pyttsx3
import speech_recognition as sr
from ollama import generate

# Inicializar el motor de texto a voz
engine = pyttsx3.init()

# Función para hablar en voz alta
def speak_text(text):
    engine.say(text)
    engine.runAndWait()  # Esto asegura que la función espera hasta que la voz termine

# Función para escuchar la voz del usuario y convertirla a texto
def listen_to_voice():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Escuchando...")
        recognizer.adjust_for_ambient_noise(source)  # Ajustar por ruido ambiental
        audio = recognizer.listen(source)
        
        try:
            # Convertir la voz en texto
            query_text = recognizer.recognize_google(audio, language="es-ES")  # Cambia el idioma si lo necesitas
            print(f"Escuché: {query_text}")
            return query_text
        except sr.UnknownValueError:
            print("No pude entender lo que dijiste.")
            speak_text("No pude entender lo que dijiste. Por favor, intenta de nuevo.")
            return None
        except sr.RequestError as e:
            print(f"Error al solicitar el servicio de reconocimiento de voz; {e}")
            speak_text("Hubo un error al conectarse con el servicio de reconocimiento de voz.")
            return None

# Generar respuesta directamente sin interacción con OpenSearch
def generate_response(query_text):
    # Te preparo un prompt para que LLaMA 3.2 identifique lo que quieres saber
    prompt = f"""
    Pregunta: {query_text}
    
    Instrucciones: Por favor, responde a la pregunta anterior de manera clara y precisa. Si es una pregunta general, proporciona una respuesta natural basada en tu conocimiento.
    """
    
    # Le pido a LLaMA 3.2 que me ayude con la respuesta basada en lo que te interesa
    response = generate(
        model="llama3.2",
        prompt=prompt
    )
    
    # Te muestro solo la respuesta relevante
    return response['response']

# Aquí comienza todo el flujo, te escucho y te doy una respuesta basada en lo que me preguntes
def main():
    while True:
        # Escuchar la voz del usuario
        query_text = listen_to_voice()

        # Verifica si el usuario dijo "salir" para finalizar
        if query_text and query_text.lower() == 'salir':
            print("¡Hasta pronto!")
            speak_text("Hasta pronto")
            break

        # Si no se entendió la voz, vuelve a pedir input
        if not query_text:
            continue

        # Genero una respuesta directamente desde LLaMA 3.2
        response = generate_response(query_text)
        print("\nAquí está tu respuesta:")
        print(response)  # Te muestro solo la respuesta generada

        # Hablar la respuesta
        speak_text(response)

        # Después de hablar, vuelve a escuchar
        print("Te escucho de nuevo...")

if __name__ == '__main__':
    main()
