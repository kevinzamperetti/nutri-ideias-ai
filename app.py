import os
import google.generativeai as genai
from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv
from langdetect import detect, LangDetectException

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# Carrega a chave da API que foi gerada no Google AI Studio
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("A variável de ambiente GOOGLE_API_KEY não está configurada.")

genai.configure(api_key=GOOGLE_API_KEY)

# Modelos suportados atualmente. As chaves devem corresponder aos 'value' do select existente no index.html
AVAILABLE_MODELS = {
    'gemini-2.0-flash': 'Modelo mais rápido e económico, ideal para respostas rápidas.',
    'gemini-2.0-flash-exp': 'Versão experimental do Flash, pode ter novidades.',
}

app = Flask(__name__)

# Palavras-chave para uma verificação básica de tópico de nutrição (em português e inglês)
NUTRITION_KEYWORDS = [
    'oi', 'olá', 'me ajude', 'ajuda', 'hi', 'hello',
    'refeição', 'refeições', 'café da manhã', 'almoço', 'jantar', 'lanche',
    'nutrição', 'nutricional', 'dieta', 'calorias', 'caloria', 'kcal', 'gordura',
    'proteína', 'carboidrato', 'vitaminas', 'minerais', 'ingredientes', 'prato',
    'receita', 'comer', 'alimentos', 'saudável', 'balanceado', 'peso', 'emagrecer',
    'engordar', 'food', 'meal', 'meals', 'breakfast', 'lunch', 'dinner', 'snack',
    'nutrition', 'nutritional', 'diet', 'calories', 'calorie', 'fat', 'protein',
    'carbohydrate', 'vitamins', 'minerals', 'ingredients', 'dish', 'recipe',
    'eat', 'foods', 'healthy', 'balanced', 'weight', 'lose weight', 'gain weight',
    'vegetariano', 'vegano', 'vegetables', 'vegan', 'vegetarian', 'frutas', 'fruits',
    'vegetais', 'legumes', 'grãos', 'cereais', 'dairy', 'laticínios', 'açúcar', 'sugar',
    'sal', 'salt', 'fibras', 'fibra', 'fiber', 'hidratação', 'hydration', 'água', 'water',
    'suplementos', 'supplements', 'alergia', 'alergias', 'allergy', 'allergies', 'intolerância',
    'intolerance', 'doença celíaca', 'celiac disease', 'diabetes', 'colesterol', 'cholesterol',
    'hipertensão', 'hypertension', 'coração', 'heart', 'digestão', 'digestion', 'metabolismo',
    'metabolism', 'energia', 'energy', 'desempenho', 'performance', 'recuperação', 'recovery',
    'musculação', 'bodybuilding', 'exercício', 'exercise', 'treino', 'training', 'pré-treino',
    'pós-treino', 'pre-workout', 'post-workout', 'jejum', 'fasting', 'orgânico', 'organic',
    'processado', 'processed', 'natural', 'artificial', 'gosto', 'sabor', 'taste', 'flavor',
    'preparar', 'cozinhar', 'prepare', 'cook', 'cozinha', 'kitchen', 'ingrediente', 'ingredient'
]

# Mensagens de recusa para tópicos fora de nutrição (em português e inglês)
OFF_TOPIC_RESPONSES = {
    'pt': "Desculpe, sou um assistente de nutrição e meu foco é gerar ideias de refeições e análises nutricionais. Não posso ajudar com este tópico.",
    'en': "Sorry, I am a nutrition assistant and my focus is on generating meal ideas and nutritional analyses. I cannot help with this topic."
}

# Rota principal que renderiza o arquivo HTML
@app.route('/')
def index():
    return render_template('index.html')

# Rota para gerar conteúdo com base na entrada do utilizador
@app.route('/generate', methods=['POST'])
def generate_content():
    
    if request.method == 'POST' and request.is_json:
        data = request.get_json()
        user_input = data.get('input_text', '')
        # Obtém o nome do modelo selecionado da requisição
        model_name = data.get('model_name', 'gemini-2.0-flash') # Valor padrão caso não seja enviado

        if not user_input:
            return jsonify({"error": "Nenhum texto de entrada fornecido."}), 400

        # Detecção de idioma e filtragem das keywords
        detected_lang = 'pt'
        try:
            # Tenta detetar o idioma da entrada do utilizador
            detected_lang = detect(user_input)
            # Verifica se o idioma detetado é suportado para as mensagens de recusa
            if detected_lang not in OFF_TOPIC_RESPONSES:
                 detected_lang = 'pt' # Volta para português se o idioma não for suportado
        except LangDetectException:
            # Se a deteção falhar (ex: texto muito curto), usa o idioma padrão
            detected_lang = 'pt'

        # Verifica se a entrada contém palavras-chave de nutrição
        # Esta é uma verificação simples e pode não ser perfeita
        is_nutrition_related = any(word in user_input.lower() for word in NUTRITION_KEYWORDS)

        # Se a entrada não parecer relacionada a nutrição, retorna a mensagem de recusa
        if not is_nutrition_related:
            # Retorna a mensagem de recusa no idioma detetado
            return jsonify({"result": OFF_TOPIC_RESPONSES.get(detected_lang, OFF_TOPIC_RESPONSES['pt'])}) # Usa get com fallback para inglês

        # Valida se o modelo selecionado é válido e inicializa o modelo
        if model_name not in AVAILABLE_MODELS:
             return jsonify({"error": f"Modelo '{model_name}' não é válido ou não está disponível."}), 400

        try:
            # Inicializa o modelo selecionado dinamicamente
            model = genai.GenerativeModel(model_name)

            # --- Prompt ---
            prompt = """
            You are a nutrition assistant focused on providing meal ideas and general analyses.
            Based on the user's input, generate creative meal suggestions or analyze the described dish.

            Present suggestions clearly, with dish names and a brief description.
            **Use Markdown formatting** for nutrition-related responses, such as:
            - Dish names in **bold**.
            - Lists to organize items or points.
            - Use italics (*text*) for additional notes.

            If the user describes a dish with quantities, provide a **very approximate estimate** of calories and a comment on the overall nutritional balance. **Format the calorie estimate in bold.**

            Do NOT mention that you are using Markdown or following instructions. Just provide the direct response.
            """

            # Gera o conteúdo usando o modelo Gemini com a estrutura de mensagens
            # A primeira mensagem é o prompt para o Gemini e a segunda é a entrada do utilizador
            response = model.generate_content([prompt, user_input])

            # Retorna o texto gerado pelo Gemini
            return jsonify({"result": response.text})

        except Exception as e:
            # Trata possíveis erros na chamada da API (incluindo inicialização do modelo)
            return jsonify({"error": f"Ocorreu um erro ao gerar o conteúdo: {e}"}), 500

    else:
        # Retorna erro se a requisição não for POST ou não for JSON
        return jsonify({"error": "Método não permitido ou formato de requisição inválido."}), 405

# Executa a aplicação Flask
if __name__ == '__main__':
    # Pode utilizar o parâmetro "debug=True" em ambiente de desenvolvimento para auxílio/debug
    app.run()
