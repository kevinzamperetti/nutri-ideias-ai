# Nutri Ideias AI ✨

![Logo NutriIdeias AI](/static/images/nutri-ideias-ai-logo.png)

Bem-vindo ao repositório do **Nutri Ideias AI**! 👋 Este projeto é uma aplicação web simples e inovadora que atua como o seu assistente de nutrição pessoal, impulsionado pela inteligência artificial de ponta do Google Gemini.

## 🚀 Aceda à Aplicação Online

O **Nutri Ideias AI** está disponível online através do seguinte endereço:
👉 [https://nutri-ideias-ai.onrender.com/](https://nutri-ideias-ai.onrender.com/)

**Nota:** Esta aplicação está hospedada em um servidor gratuito, o que significa que o primeiro acesso após um período de inatividade pode levar alguns segundos até o servidor "acordar" 😴 e o site ficar disponível. Agradecemos a sua paciência! 🙏

## 💡 Utilidade e Objetivo do Projeto

O **Nutri Ideias AI** foi criado para simplificar e enriquecer a sua jornada nutricional. O objetivo principal é fornecer ideias criativas de refeições, sugestões de cardápio e análises nutricionais aproximadas de pratos, tudo baseado nas suas preferências e ingredientes disponíveis. Chega de indecisão na hora de planear as suas refeições! 🥗

Além disso, o projeto visa **estreitar a sua relação** com a nutrição, oferecendo uma forma **mais pessoal e interativa** de obter informações e inspiração.

## 💬 Conheça o Nosso Chatbot Nutricional!

Para um **atendimento ainda mais pessoal** e para **estreitar a sua relação** com a nutrição, o Nutri Ideias AI conta com um **chatbot especializado**! 🤖 Converse diretamente com um assistente virtual experiente para tirar dúvidas rápidas, pedir sugestões específicas ou simplesmente ter uma interação mais dinâmica sobre os seus hábitos alimentares.

Com o chatbot, a sua experiência torna-se **mais próxima** e adaptada às suas necessidades em tempo real. Experimente esta forma conveniente de aceder a ideias e informações nutricionais!

## ✨ Criatividade e Eficácia

Este projeto destaca-se pela sua abordagem criativa e eficácia em fornecer informações nutricionais acessíveis e uma experiência de utilizador aprimorada:

* **Integração Poderosa com Google Gemini:** Utiliza a flexibilidade e capacidade dos modelos Gemini para entender os seus pedidos e gerar respostas relevantes e úteis sobre nutrição, tanto no formato de formulário quanto no chat.

* **Seleção Dinâmica de Modelos:** Permite escolher entre diferentes modelos Gemini disponíveis, dando a flexibilidade de experimentar e selecionar o modelo que melhor se adapta às suas necessidades e ao tipo de interação desejada (formulário ou chat).

* **Respostas Formatadas e Claras:** As respostas são apresentadas de forma organizada e formatada usando Markdown (negrito, listas), tornando a leitura e compreensão das sugestões e análises muito mais fácil, tanto na área de resultados quanto nas mensagens do chat.

* **Chatbot Interativo:** Oferece uma interface de chat amigável para conversas em tempo real, proporcionando um **atendimento mais direto e pessoal**.

* **Foco no Objetivo do projeto e Idiomas:** Graças à lógica implementada no backend, a aplicação foca-se em responder apenas a questões relacionadas com nutrição e tenta responder no idioma em que a pergunta foi feita, proporcionando uma experiência mais direcionada e amigável. Atualmente os idiomas suportados são português (como idioma principal) e inglês. 🌍

## ⚙️ Configuração e Execução Local

Para ter o Nutri Ideias AI a correr na sua máquina local, siga os passos abaixo:

### Pré-requisitos

* Python 3.7+
* Git
* Uma chave de API do Google AI Studio (obtenha uma em <https://aistudio.google.com/app/apikey>) 🔑

### Passos

1.  **Clone o Repositório:**

    ```bash
    git clone [https://github.com/kevinzamperetti/nutri-ideias-ai.git](https://github.com/kevinzamperetti/nutri-ideias-ai.git)
    cd nutri-ideias-ai
    ```

2.  **Crie e Ative um Ambiente Virtual (Recomendado):**
    É **altamente recomendado** criar um ambiente virtual para isolar as dependências do seu projeto de outros projetos Python na sua máquina. Isso evita conflitos entre diferentes versões de bibliotecas. **Se preferir não usar um ambiente virtual, pode pular este passo e o próximo (Passo 4).**

    * Crie o ambiente virtual:

        ```bash
        python -m venv venv
        ```

3.  **Ative o Ambiente Virtual:**

    * No Windows:

        ```bash
        .\venv\Scripts\activate
        ```

    * No macOS e Linux:

        ```bash
        source venv/bin/activate
        ```

4.  **Instale as Dependências:**
    Certifique-se de que tem um ficheiro `requirements.txt` na raiz do seu projeto com as dependências necessárias. O conteúdo mínimo deve incluir:

    ```
    Flask==3.0.3
    google-generativeai==0.5.1
    python-dotenv==1.0.0
    langdetect
    ```

    Instale as dependências usando pip. **Execute este comando com o ambiente virtual ativo (se optou por usá-lo).**

    ```bash
    pip install -r requirements.txt
    ```

    *(Nota: A biblioteca `markdown` não é estritamente necessária para a funcionalidade atual, pois o parsing de Markdown para exibição é feito no frontend com `marked.js`. No entanto, pode incluí-la no `requirements.txt` para compatibilidade geral ou se planear processar Markdown no backend no futuro.)*

5.  **Configure a Chave de API:**

    * Crie um ficheiro chamado `.env` na raiz do seu projeto (na mesma pasta que `app.py`).

    * Adicione a seguinte linha ao ficheiro `.env`, substituindo `SUA_CHAVE_DE_API_AQUI` pela sua chave real do Google AI Studio:

        ```dotenv
        GOOGLE_API_KEY=SUA_CHAVE_DE_API_AQUI
        ```

    * **Importante:** Nunca partilhe o seu ficheiro `.env` ou a sua chave de API publicamente. Adicione `.env` ao seu ficheiro `.gitignore`. 🔒

6.  **Execute a Aplicação:**
    Escolha uma das opções abaixo para executar a aplicação:

    * **Opção Recomendada (se executou os passos 2 e 3 para criar um Ambiente Virtual):**

        ```bash
        flask run
        ```

    * **Opção Alternativa:** Se você optou por não criar e ativar um ambiente virtual (pulou os Passos 2 e 3), pode tentar executar o ficheiro Python diretamente. **No entanto, isto não é recomendado para desenvolvimento ou projetos com muitas dependências, pois pode causar conflitos com outras bibliotecas instaladas globalmente.** Execute este comando na raiz do projeto:

        ```bash
        python .\app.py
        ```

7.  **Aceda à Aplicação:**
    Abra o seu navegador e vá para `http://127.0.0.1:5000/`. 🌐

## 🤝 Contribuições

Contribuições são super bem-vindas! 🎉 Se tiver ideias para melhorar o projeto, encontrar um bug 🐛, ou quiser adicionar novas funcionalidades ✨, sinta-se à vontade para abrir uma "issue" ou enviar um "pull request". Ficarei feliz em avaliar e colaborar!

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Consulte o ficheiro `LICENSE` para mais detalhes.

Esperamos que o **Nutri Ideias AI** seja uma ferramenta útil e interessante para si na sua jornada por uma nutrição mais saudável e informada! 😊