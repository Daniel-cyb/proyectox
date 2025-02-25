     import os
import pandas as pd
from langchain_community.llms import Ollama

# Ruta al archivo de dominios
DOMAINS_FILE = r"C:\Users\Daniel Lopez\Documents\devsecops\React\proyectox\logxai-services\logxai-cti\conector\domains.txt"

# Inicializar Llama 3.2
llama = Ollama(model="llama3.2", temperature=0.7)

# Función para generar permutaciones iniciales (manual)
def generate_initial_permutations(base_domain):
    tlds = [".com", ".net", ".org", ".co", ".biz"]
    base_name = base_domain.split(".")[0]
    permutations = set()

    # Cambios comunes
    permutations.add(base_domain)
    permutations.update([base_name + tld for tld in tlds])  # Cambiar TLDs
    permutations.add(base_name.replace("o", "0") + ".com")  # Reemplazar letras
    permutations.add(base_name.replace("o", "0") + ".co")
    permutations.add(base_name + "123.com")  # Agregar números
    permutations.add(base_name + "-secure.com")  # Agregar prefijos
    permutations.add("secure-" + base_name + ".com")
    permutations.add(base_name[:-1] + ".com")  # Omitir letras
    permutations.add(base_name + ".info")  # Cambiar TLD a .info
    permutations.add(base_name + ".gov")  # TLD gubernamental

    return list(permutations)

# Función para enriquecer las permutaciones con IA
def generate_domain_permutations_with_ai(base_domain, initial_permutations):
    try:
        prompt = (
            f"El dominio '{base_domain}' podría ser suplantado con variaciones. "
            "Ya tenemos estas permutaciones: "
            f"{', '.join(initial_permutations[:5])}... "
            "Por favor genera 30 permutaciones adicionales que incluyan errores tipográficos, TLD alternativos, "
            "reemplazo de caracteres visualmente similares y agregados comunes como 'secure-', '-login', etc."
        )
        print(f"Solicitando permutaciones adicionales a Llama 3.2 para el dominio: {base_domain}")
        response = llama.invoke(prompt, timeout=60)
        
        # Procesar la respuesta de la IA
        ai_permutations = response.split("\n")
        ai_permutations = [perm.strip() for perm in ai_permutations if perm.strip()]
        print(f"Permutaciones generadas por IA: {len(ai_permutations)}")
        return ai_permutations
    except Exception as e:
        print(f"Error generando permutaciones con IA: {e}")
        return []

# Función para cargar dominios registrados en un DataFrame
def load_domains_to_dataframe(file_path):
    if not os.path.exists(file_path):
        print(f"Archivo no encontrado: {file_path}")
        return pd.DataFrame(columns=["domain"])
    
    print("Cargando dominios registrados en un DataFrame...")
    try:
        df = pd.read_csv(file_path, header=None, names=["domain"], dtype=str)
        print(f"Total de dominios cargados: {len(df)}")
        return df
    except Exception as e:
        print(f"Error al cargar el archivo: {e}")
        return pd.DataFrame(columns=["domain"])

# Función para buscar coincidencias usando pandas
def find_matching_domains(permutations, df_domains):
    print("Buscando coincidencias...")
    return df_domains[df_domains["domain"].isin(permutations)]

# Main
if __name__ == "__main__":
    # Entrada del usuario
    base_domain = input("Ingresa el dominio a analizar (ejemplo: bancodebogota.com): ").strip()

    # Generar permutaciones iniciales
    print("Generando permutaciones iniciales...")
    initial_permutations = generate_initial_permutations(base_domain)

    # Enriquecer las permutaciones con IA
    print("Enriqueciendo permutaciones con IA...")
    ai_permutations = generate_domain_permutations_with_ai(base_domain, initial_permutations)

    # Combinar permutaciones manuales y generadas por IA
    all_permutations = list(set(initial_permutations + ai_permutations))

    # Mostrar permutaciones generadas
    print("\nPermutaciones generadas:")
    for perm in all_permutations[:30]:  # Mostrar las primeras 30 permutaciones
        print(perm)

    # Cargar dominios registrados en un DataFrame
    df_domains = load_domains_to_dataframe(DOMAINS_FILE)

    # Buscar coincidencias
    matches_df = find_matching_domains(all_permutations, df_domains)

    # Mostrar resultados
    if not matches_df.empty:
        print("\nDominios coincidentes encontrados:")
        print(matches_df)
    else:
        print("No se encontraron coincidencias.")
