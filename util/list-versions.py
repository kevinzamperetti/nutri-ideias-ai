import google.generativeai as genai
import os
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# Carrega a chave da API que foi gerada no Google AI Studio
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("A variável de ambiente GOOGLE_API_KEY não está configurada.")

genai.configure(api_key=GOOGLE_API_KEY)

print("Modelos disponíveis:")
for model in genai.list_models():
  print(f"- Nome: {model.name}")
  print(f"  Suporta GenerateContent: {'generateContent' in model.supported_generation_methods}")
  print("-" * 20)

