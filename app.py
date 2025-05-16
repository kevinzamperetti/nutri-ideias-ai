import os
import google.generativeai as genai
from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv

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

        # Valida se o modelo selecionado é válido e inicializa o modelo
        if model_name not in AVAILABLE_MODELS:
             return jsonify({"error": f"Modelo '{model_name}' não é válido ou não está disponível."}), 400

        try:
            # Inicializa o modelo selecionado dinamicamente
            model = genai.GenerativeModel(model_name)

            # --- Prompt ---
            prompt = """
            Você é um assistente de nutrição focado em dar ideias de refeições e análises gerais.
            Gere sugestões criativas de refeições ou analise o prato descrito com base na entrada do utilizador.
            Apresente as sugestões de forma clara, com nomes de pratos e uma breve descrição.
            **Use formatação Markdown** para destacar informações importantes, como:
            - Nomes de pratos em **negrito**.
            - Listas para organizar itens ou pontos.
            - Use itálico (*texto*) para notas adicionais.

            Se o utilizador descrever um prato com quantidades, forneça uma **estimativa muito aproximada** das calorias e um comentário sobre o balanço nutricional geral. **Formate a estimativa de calorias em negrito.**
            Mas na resposta não precisa me dizer que está a utilizar formatação em Markdown ou que está respeitando o meu pedido. Simplesmente dê a resposta para a pergunta recebida.
            **IMPORTANTE: Responda também no idioma que receber a pergunta, ou seja, se reecber em inglês, responda em inglês, se receber em português, responda em português. Você é capaz de identificar o idioma e traduzir a resposta.**
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
