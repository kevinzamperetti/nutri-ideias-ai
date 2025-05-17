// Espera o DOM carregar completamente antes de adicionar os event listeners
document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('nutri-form');
    const userInput = document.getElementById('user-input');
    const resultArea = document.getElementById('result-area');
    const submitButton = form.querySelector('button[type="submit"]');

    // --- Elementos para a funcionalidade do Chatbot ---
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const floatingChatButton = document.getElementById('floating-chat-button'); // Botão flutuante para abrir
    const chatbotWrapper = document.getElementById('chatbot-wrapper'); // Wrapper do chatbot
    const closeChatButtonHeader = document.getElementById('close-chat-button-header'); // Botão de fechar no cabeçalho (ID atualizado)
    const floatingCloseButton = document.getElementById('floating-close-button'); // NOVO: Botão flutuante para fechar

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

    // --- Lógica para a funcionalidade original (Formulário/Resultado) ---
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

                // Adicionar o aviso no frontend se a entrada do utilizador contiver palavras-chave
                const keywords = ['calorias', 'caloria', 'kcal', 'nutrientes', 'gramas', 'g', 'prato', 'refeição com', 'calories', 'calorie', 'fat', 'protein', 'carbohydrate']; // Adicionadas mais palavras-chave para o aviso
                const userInputLower = inputText.toLowerCase();
                const shouldShowWarning = keywords.some(keyword => userInputLower.includes(keyword));

                if (shouldShowWarning) {
                    const warningMessage = `
                        <div class="warning">
                            <p>
                                ***AVISO IMPORTANTE: As informações nutricionais fornecidas são apenas estimativas aproximadas geradas por IA. Não é um cálculo preciso de uma base de dados nutricional auditada.
                                <br><br>
                                Para valores nutricionais exatos e aconselhamento dietético personalizado, consulte uma base de dados nutricional oficial ou um profissional de saúde/nutricionista qualificado.***
                            </p>
                        </div>
                    `;
                    resultArea.innerHTML += warningMessage; // Adiciona o aviso após o conteúdo gerado pelo modelo
                }


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

    // Definir as mensagens de recusa esperadas do backend
    const offTopicResponses = new Set([
        "Desculpe, sou um assistente de nutrição e meu foco é gerar ideias de refeições e análises nutricionais. Não posso ajudar com este tópico.",
        "Sorry, I am a nutrition assistant and my focus is on generating meal ideas and nutritional analyses. I cannot help with this topic."
    ]);

    // Palavras-chave para acionar o aviso nutricional no chat (deve ser consistente com o backend)
     const warningKeywords = ['calorias', 'caloria', 'kcal', 'nutrientes', 'gramas', 'g', 'prato', 'refeição com', 'calories', 'calorie', 'fat', 'protein', 'carbohydrate'];

    // Função para adicionar uma mensagem ao chat box
    function addMessageToChat(message, sender, isHtml = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(sender === 'user' ? 'user-message' : 'model-message');

        if (isHtml) {
            messageElement.innerHTML = message;
        } else {
            messageElement.textContent = message;
        }

        chatBox.appendChild(messageElement);

        // Rolar para a mensagem mais recente
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Função para enviar uma mensagem do chat
    async function sendChatMessage() {
        const messageText = chatInput.value.trim();

        if (messageText === '') {
            return; // Não envia mensagens vazias
        }

        // Adiciona a mensagem do utilizador ao chat
        addMessageToChat(messageText, 'user'); // Sempre texto simples para o utilizador
        chatInput.value = ''; // Limpa o campo de entrada

        // Desabilita o input e o botão enquanto espera a resposta
        chatInput.disabled = true;
        sendChatBtn.disabled = true;

        // Adiciona uma mensagem de "digitando" ou carregamento do modelo
        const loadingMessageElement = document.createElement('div');
        loadingMessageElement.classList.add('message', 'model-message', 'loading');
        loadingMessageElement.textContent = '...'; // Indicador de carregamento simples
        chatBox.appendChild(loadingMessageElement);
        chatBox.scrollTop = chatBox.scrollHeight;

        // Obtém o valor do modelo selecionado
        const selectedModel = modelSelect.value;

        try {
            // Faz a requisição para o backend (reutilizando a rota /generate)
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ input_text: messageText, model_name: selectedModel })
            });

            // Remove a mensagem de carregamento
            chatBox.removeChild(loadingMessageElement);

            if (!response.ok) {
                const errorData = await response.json();
                 // Adiciona uma mensagem de erro ao chat (texto simples)
                addMessageToChat(`Erro: ${errorData.error || 'Erro desconhecido ao obter resposta.'}`, 'model', false);
                console.error('Erro na resposta do servidor:', errorData);
                return;
            }

            const data = await response.json();

            if (data.result) {
                // Verificar se a resposta é EXATAMENTE uma das mensagens de recusa
                const isExactOffTopicResponse = offTopicResponses.has(data.result.trim());

                if (isExactOffTopicResponse) {
                    // Se for a mensagem de recusa EXATA, adiciona como texto simples
                    addMessageToChat(data.result, 'model', false); // Passa false para isHtml
                } else {
                    // Se NÃO for a mensagem de recusa, é uma resposta nutricional.
                    // Adiciona a resposta principal (com parsing Markdown)
                    const formattedHtml = marked.parse(data.result);
                    addMessageToChat(formattedHtml, 'model', true); // Passa true para isHtml

                    // Verifica se deve adicionar o aviso nutricional (com base nas palavras-chave na entrada do utilizador)
                    const userInputLower = messageText.toLowerCase(); // Usar a mensagem do chat original
                    const shouldShowWarning = warningKeywords.some(keyword => userInputLower.includes(keyword));

                    if (shouldShowWarning) {
                        // O aviso já está em formato HTML (com <br><br>), então adicionamos como HTML
                        const warningMessageHtml = `
                            <div class="warning">
                                <p>
                                    ***AVISO IMPORTANTE: Esta é apenas uma estimativa aproximada gerada por IA. Não é um cálculo preciso de uma base de dados nutricional auditada.
                                    <br><br>
                                    Para valores nutricionais exatos e aconselhamento dietético personalizado, consulte uma base de dados nutricional oficial ou um profissional de saúde/nutricionista qualificado.***
                                </p>
                            </div>
                        `;
                        // Adiciona o aviso como uma nova mensagem do modelo no chat (como HTML)
                        addMessageToChat(warningMessageHtml, 'model', true); // Passa true para isHtml
                    }
                }

            } else if (data.error) {
                 // Adiciona a mensagem de erro do backend ao chat (texto simples)
                 addMessageToChat(`Erro: ${data.error}`, 'model', false);
            } else {
                 // Caso a resposta não tenha 'result' nem 'error' (texto simples)
                 addMessageToChat('Resposta inválida do servidor.', 'model', false);
            }

        } catch (error) {
            // Remove a mensagem de carregamento se ainda estiver lá
            if (chatBox.contains(loadingMessageElement)) {
                 chatBox.removeChild(loadingMessageElement);
            }
            // Adiciona uma mensagem de erro ao chat (texto simples)
            addMessageToChat(`Ocorreu um erro ao comunicar com o servidor: ${error.message}`, 'model', false);
            console.error('Erro:', error);
        } finally {
            // Reabilita o input e o botão
            chatInput.disabled = false;
            sendChatBtn.disabled = false;
            chatInput.focus(); // Coloca o foco de volta no input
             chatBox.scrollTop = chatBox.scrollHeight; // Rola para o fim novamente
        }
    }

    // Event listener para o botão de enviar do chat
    sendChatBtn.addEventListener('click', sendChatMessage);

    // Event listener para permitir enviar mensagem pressionando Enter no campo de input
    chatInput.addEventListener('keypress', (event) => {
        // Verifica se a tecla pressionada é Enter (código 13 ou 'Enter') e se Shift não está pressionado
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Previne a quebra de linha padrão do Enter
            sendChatMessage(); // Chama a função de enviar mensagem
        }
    });

    // Função para fechar o chat
    function closeChat() {
        chatbotWrapper.classList.remove('is-visible'); // Esconde o chatbot
        floatingChatButton.style.display = 'flex'; // Mostra o botão flutuante de abrir
        floatingCloseButton.style.display = 'none'; // Esconde o botão flutuante de fechar
    }

    // Event listener para o botão flutuante (mostrar chat)
    floatingChatButton.addEventListener('click', () => {
        chatbotWrapper.classList.add('is-visible'); // Adiciona a classe para mostrar
        floatingChatButton.style.display = 'none'; // Esconde o botão flutuante de abrir
        floatingCloseButton.style.display = 'flex'; // Mostra o botão flutuante de fechar
        chatInput.focus(); // Coloca o foco no input do chat
    });

    // Event listener para o botão de fechar no cabeçalho do chat
    closeChatButtonHeader.addEventListener('click', closeChat);

    // Event listener para o NOVO botão flutuante de fechar
    floatingCloseButton.addEventListener('click', closeChat);

});