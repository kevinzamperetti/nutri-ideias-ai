// Espera o DOM carregar completamente antes de adicionar os event listeners
document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('nutri-form');
    const userInput = document.getElementById('user-input');
    const resultArea = document.getElementById('result-area');
    const submitButton = form.querySelector('button[type="submit"]');
    const modelSelect = document.getElementById('model-select');
    const tooltipDiv = document.querySelector('.tooltip');

    // Dicionário de descrições de modelos (deve corresponder ao AVAILABLE_MODELS no app.py, script.js e index.html)
    const modelDescriptions = {
        'gemini-2.0-flash': 'Modelo mais rápido e económico, ideal para respostas rápidas.',
        'gemini-2.0-flash-exp': 'Versão experimental do Flash, pode ter novidades.',
    };

    // Função para atualizar o texto do tooltip
    function updateModelDescription() {
        const selectedModel = modelSelect.value;
        const description = modelDescriptions[selectedModel] || 'Informação sobre este modelo não disponível.';
        tooltipDiv.innerHTML = `${description}`;
    }

    // Atualiza o tooltip inicial ao carregar a página
    updateModelDescription();

    // Adiciona um event listener para o evento 'change' no seletor de modelo
    modelSelect.addEventListener('change', updateModelDescription);

    // Adiciona um event listener para o evento de 'submit' do formulário
    form.addEventListener('submit', async (event) => {
        // Previne o comportamento padrão de recarregar a página ao submeter o formulário
        event.preventDefault();

        // Obtém o texto inserido pelo utilizador
        const inputText = userInput.value.trim();

        // Obtém o valor do modelo selecionado
        const selectedModel = modelSelect.value;

        // Verifica se o campo de entrada não está vazio
        if (inputText === '') {
            resultArea.innerHTML = '<p style="color: red;">Por favor, insira sua solicitação.</p>';
            return;
        }

        // Limpa a área de resultado, mostra uma mensagem de carregamento e desabilita botão enquanto aguarda resposta
        resultArea.innerHTML = '<p>A gerar resposta...</p>';
        submitButton.disabled = true;

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Inclui o texto do utilizador e o modelo selecionado no corpo da requisição JSON
                body: JSON.stringify({ input_text: inputText, model_name: selectedModel })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro no servidor: ${response.status} - ${errorData.error || 'Erro desconhecido. Por favor, tente novamente.'}`);
            }

            const data = await response.json();

            if (data.result) {
                // Converter o texto Markdown para HTML usando marked.js
                const formattedHtml = marked.parse(data.result);

                // Exibe o resultado formatado em HTML na área de resultado
                resultArea.innerHTML = formattedHtml;

            } else if (data.error) {
                 resultArea.innerHTML = `<p style="color: red;">Erro: ${data.error}</p>`;
            } else {
                 resultArea.innerHTML = '<p style="color: red;">Resposta inválida do servidor. Por favor, tente novamente.</p>';
            }

        } catch (error) {
            // Captura e exibe quaisquer erros que ocorram durante a requisição ou processamento
            console.error('Erro:', error);
            resultArea.innerHTML = `<p style="color: red;">Ocorreu um erro ao comunicar com o servidor: ${error.message}</p>`;
        } finally {
            submitButton.disabled = false; // Habilita o botão após a resposta
        }
    });
});
