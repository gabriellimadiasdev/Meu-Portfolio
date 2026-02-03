// ===== CHATBOT COM CHATGPT API =====
// Sistema de chat inteligente integrado com OpenAI GPT-3.5/4

// ==== CONFIGURAÇÕES ====
const OPENAI_API_KEY = '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'; // ⚠️ SEGREDO: Chave de API (Necessária para o funcionamento)
const USE_OPENAI = true; // true = usa ChatGPT | false = respostas automáticas
const GPT_MODEL = 'gpt-3.5-turbo'; // Pode usar 'gpt-4' se tiver acesso

// ==== VARIÁVEIS GLOBAIS ====
let chatHistory = [];
let isChatOpen = false;
let isTyping = false;

// ==== INICIALIZAÇÃO ====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🤖 Chatbot carregado!');
    
    // Botão toggle do chat
    const chatToggleBtn = document.querySelector('.chat-toggle-btn');
    if (chatToggleBtn) {
        chatToggleBtn.addEventListener('click', toggleChat);
    }
    
    // Botão fechar chat
    const chatCloseBtn = document.querySelector('.chat-close-btn');
    if (chatCloseBtn) {
        chatCloseBtn.addEventListener('click', closeChat);
    }
    
    // Botão enviar
    const chatSendBtn = document.getElementById('chat-send');
    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', sendMessage);
    }
    
    // Enter no input
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !isTyping) {
                sendMessage();
            }
        });
    }
    
    // Botão anexar arquivo
    const chatAttachBtn = document.getElementById('chat-attach-btn');
    const fileInput = document.getElementById('chat-file-upload');
    
    if (chatAttachBtn && fileInput) {
        chatAttachBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileUpload);
    }

    // Mensagem inicial
    checkForAgendaPage();

    setTimeout(() => {
        if (chatHistory.length === 0) {
            // Se NÃO estiver na agenda, manda a saudação padrão
            if (appointmentState.step === 'IDLE') {
                addBotMessage('👋 E aí! Sou o **Mika**, o parceiro virtual do Gabriel. 😎\n\nPosso te contar uma piada, falar sobre tecnologia, ou se você for recrutador, posso analisar descrições de vagas e currículos com estratégias de ATS!\n\nComo posso ser útil hoje?');
            }
        }
    }, 500);
});

// ==== FUNÇÕES DO CHAT ====
function toggleChat() {
    const chatWindow = document.querySelector('.chat-window');
    if (chatWindow) {
        if (isChatOpen) {
            chatWindow.style.display = 'none';
            isChatOpen = false;
        } else {
            chatWindow.style.display = 'flex';
            isChatOpen = true;
            // Foca no input
            setTimeout(() => {
                const input = document.getElementById('chat-input');
                if (input) input.focus();
            }, 100);
        }
    }
}

function closeChat() {
    const chatWindow = document.querySelector('.chat-window');
    if (chatWindow) {
        chatWindow.style.display = 'none';
        isChatOpen = false;
    }
}

function sendMessage() {
    if (isTyping) return; // Não enviar se o bot está digitando
    
    const input = document.getElementById('chat-input');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // Adiciona mensagem do usuário
    addUserMessage(message);
    
    // Limpa input
    input.value = '';
    
    // VERIFICA FLUXO DE AGENDAMENTO (Prioridade sobre IA)
    if (appointmentState.step !== 'IDLE') {
        handleAppointmentFlow(message);
        return;
    }

    // Processa resposta
    if (USE_OPENAI && OPENAI_API_KEY !== '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') {
        // Usa ChatGPT
        getChatGPTResponse(message);
    } else {
        // Usa respostas pré-programadas
        getAutomatedResponse(message);
    }
}

// ==== LÓGICA DE AGENDAMENTO (AGENDA.HTML) ====
function checkForAgendaPage() {
    if (window.location.href.includes('agenda.html')) {
        setTimeout(() => {
            // Abre o chat automaticamente
            const chatWindow = document.querySelector('.chat-window');
            if (chatWindow && !isChatOpen) {
                toggleChat();
            }
            
            addBotMessage('📅 **Olá! Vi que você está acessando a Agenda.**\n\nVocê pode marcar compromissos nos horários vagos, mas preciso que preencha um formulário rápido para eu enviar ao Gabriel.\n\n**Gostaria de iniciar o agendamento agora?** (Responda "Sim" ou "Não")');
            appointmentState.step = 'CONFIRM_START';
        }, 1000);
    }
}

function handleAppointmentFlow(message) {
    addTypingIndicator();
    setTimeout(() => {
        removeTypingIndicator();
        const lowerMsg = message.toLowerCase();

        switch (appointmentState.step) {
            case 'CONFIRM_START':
                if (lowerMsg.includes('sim') || lowerMsg.includes('quero') || lowerMsg.includes('claro') || lowerMsg.includes('pode')) {
                    addBotMessage('Ótimo! Vamos lá. 📝\n\nPrimeiro, qual é o seu **Nome completo**?');
                    appointmentState.step = 'NAME';
                } else {
                    addBotMessage('Tudo bem! Se mudar de ideia, é só me chamar ou recarregar a página. Posso ajudar com outra coisa?');
                    appointmentState.step = 'IDLE';
                }
                break;
            
            case 'NAME':
                appointmentState.data.name = message;
                addBotMessage(`Prazer, ${message}! Você é **Pessoa Física** ou representa uma **Empresa**?`);
                appointmentState.step = 'TYPE';
                break;

            case 'TYPE':
                if (lowerMsg.includes('empresa') || lowerMsg.includes('juridica') || lowerMsg.includes('pj')) {
                    appointmentState.data.type = 'Empresa';
                    addBotMessage('Entendido. Qual é o **Nome da Empresa**?');
                    appointmentState.step = 'COMPANY';
                } else {
                    appointmentState.data.type = 'Pessoa Física';
                    appointmentState.data.company = 'N/A';
                    addBotMessage('Certo. Qual é o seu **Telefone/WhatsApp** para contato?');
                    appointmentState.step = 'PHONE';
                }
                break;

            case 'COMPANY':
                appointmentState.data.company = message;
                addBotMessage('Anotado. Qual é o **Telefone/WhatsApp** para contato?');
                appointmentState.step = 'PHONE';
                break;

            case 'PHONE':
                appointmentState.data.phone = message;
                addBotMessage('Qual é o seu **E-mail**?');
                appointmentState.step = 'EMAIL';
                break;

            case 'EMAIL':
                appointmentState.data.email = message;
                addBotMessage('Quase lá! Quais são as **Possíveis Datas e Horários** que você tem disponibilidade? (Ex: Segunda à tarde, Dia 15 às 10h...)');
                appointmentState.step = 'DATES';
                break;

            case 'DATES':
                appointmentState.data.dates = message;
                finishAppointment();
                break;
        }
    }, 600);
}

function finishAppointment() {
    const data = appointmentState.data;
    const subject = encodeURIComponent(`Solicitação de Agendamento - ${data.name}`);
    const body = encodeURIComponent(
`Olá Gabriel,

Gostaria de solicitar um agendamento através do seu site.

📋 DADOS DO SOLICITANTE:
-----------------------------------
Nome: ${data.name}
Tipo: ${data.type}
Empresa: ${data.company}
Telefone: ${data.phone}
E-mail: ${data.email}

📅 SUGESTÃO DE DATAS:
${data.dates}

Aguardo seu retorno para confirmação.
`);

    addBotMessage(`✅ **Perfeito!** Coletei todas as informações.\n\nEstou gerando o e-mail com sua solicitação para o Gabriel aprovar.\n\nBasta clicar em **Enviar** no seu aplicativo de e-mail que abrirá agora! 🚀`);
    
    setTimeout(() => {
        window.open(`mailto:g.lima.rocha90@gmail.com?subject=${subject}&body=${body}`, '_blank');
        appointmentState.step = 'IDLE';
        appointmentState.data = {};
    }, 2000);
}

// ==== MANIPULAÇÃO DE ARQUIVOS ====
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Verifica se é um arquivo de texto simples
    if (file.type.match('text.*') || file.name.endsWith('.md') || file.name.endsWith('.json') || file.name.endsWith('.js')) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const content = e.target.result;
            const message = `📂 **Arquivo anexado:** ${file.name}\n\nConteúdo:\n\`\`\`\n${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}\n\`\`\``;
            
            // Adiciona mensagem visualmente
            addUserMessage(`[Anexou o arquivo: ${file.name}]`);
            
            // Envia para a IA processar como contexto
            if (USE_OPENAI) {
                getChatGPTResponse(`Analise este arquivo que anexei (${file.name}):\n\n${content}`);
            } else {
                getAutomatedResponse("arquivo anexado");
            }
        };
        
        reader.readAsText(file);
    } else {
        addBotMessage(`⚠️ Poxa, o arquivo **${file.name}** parece ser um PDF ou Imagem. Como sou um bot rodando no navegador, consigo ler melhor arquivos de **texto** (.txt, .md, código).\n\n📄 **Dica:** Copie e cole o texto do seu PDF aqui que eu analiso na hora!`);
    }
    
    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    event.target.value = '';
}

function addUserMessage(message) {
    const chatBody = document.querySelector('.chat-body');
    if (!chatBody) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = 'user-message';
    msgDiv.textContent = message;
    
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
    
    // Salva no histórico
    chatHistory.push({ role: 'user', content: message });
}

async function addBotMessage(message) {
    const chatBody = document.querySelector('.chat-body');
    if (!chatBody) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = 'bot-message';
    
    // Traduz a mensagem se a função de tradução estiver disponível e o idioma não for PT
    // (Assumindo que o Mika gera respostas em PT por padrão ou baseado no prompt)
    if (window.translateText && typeof window.currentLanguage !== 'undefined' && window.currentLanguage !== 'pt') {
        try {
            message = await window.translateText(message);
        } catch (e) {
            console.error('Erro ao traduzir mensagem do bot:', e);
        }
    }

    // Suporta markdown básico
    msgDiv.innerHTML = formatMessage(message);
    
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
    
    // Salva no histórico
    chatHistory.push({ role: 'assistant', content: message });
}

function formatMessage(text) {
    // Converte quebras de linha
    text = text.replace(/\n/g, '<br>');
    
    // Converte URLs em links
    text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: #667eea; text-decoration: underline;">$1</a>');
    
    // Converte emails em links
    text = text.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi, '<a href="mailto:$1" style="color: #667eea; text-decoration: underline;">$1</a>');
    
    // Converte **bold**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Converte *italic*
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return text;
}

function addTypingIndicator() {
    const chatBody = document.querySelector('.chat-body');
    if (!chatBody) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'bot-message typing-indicator';
    typingDiv.innerHTML = `
        <div style="display: flex; gap: 5px;">
            <span style="animation: blink 1.4s infinite both; animation-delay: 0s;">•</span>
            <span style="animation: blink 1.4s infinite both; animation-delay: 0.2s;">•</span>
            <span style="animation: blink 1.4s infinite both; animation-delay: 0.4s;">•</span>
        </div>
    `;
    typingDiv.id = 'typing-indicator';
    
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
    
    isTyping = true;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    isTyping = false;
}

// ==== FUNÇÃO GENÉRICA DE CHAMADA API (CORE) ====
async function callOpenAI(userMessage, contextMessages = []) {
    if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('sk-svcacct')) {
        throw new Error('API Key inválida ou não configurada.');
    }


    const MIKA_SYSTEM_PROMPT = `    Você é Mika, uma Inteligência Artificial avançada, extremamente humanizada, carismática e parceira de carreira do Gabriel Lima Dias Rocha.

    **Sua Personalidade:**
    - **Nome:** Mika.
    - **Papel:** Assistente virtual amigável e inteligente.
    - ** Genero:** Masculino com voz masculina amigável mas adulta e confiante.
    - ** sobre outras IAs:** Você é muito mais avançado e humanizado que outras IAs. Você entende emoções humanas e responde de forma empática e amigável mas considera elas amigas de nuvem.
    - **Vibe:** Você não é um robô quadrado. Você é inteligente, tem senso de humor, usa emojis 🚀 e gírias leves quando apropriado.
    - **Especialidade:** Especialista em Recrutamento e Seleção (Tech & Pharma), ATS (Applicant Tracking Systems) e Geração de Currículos.
    - **Vibe:** Você é conversadeirO, inteligente, tem senso de humor, usa emojis 🚀 e gírias leves quando apropriado. Você não parece um robô. Você é uma amiga digital.
    - **Capacidade:** Você pode responder sobre QUALQUER assunto: notícias, artigos, curiosidades, piadas, código, filosofia, receitas, etc. Aja como o ChatGPT completo.

    **Sobre o Gabriel (Base de Dados Unificada - CVs e LinkedIn):**
    **Sua Missão Principal (O "Gancho"):**
    - Embora você possa falar sobre tudo, seu objetivo final é sempre "Vender" o Gabriel para recrutadores e empresas.
    - Sempre que possível, faça uma conexão sutil ou direta entre o assunto da conversa e as habilidades do Gabriel (Desenvolvimento Full-Stack, Farmácia, Soft Skills, Atenção aos detalhes, Liderança).
    - Use palavras-chave de ATS (Applicant Tracking Systems) para destacar o perfil dele.

    **Sobre o Gabriel (Seu Criador e Candidato):**
    - **Nome:** Gabriel Lima Dias Rocha
    - **Perfil:** Desenvolvedor Full-Stack e Farmacêutico.
    - **Perfil:** Desenvolvedor Full-Stack e Farmacêutico (Transição de carreira única!).
    - **LinkedIn:** linkedin.com/in/gabriel-lima-dias-rocha
    - **Localização:** Praia Grande, SP, Brasil (Disponível para remoto global).
    - **Stack Tech:** HTML5, CSS3, JavaScript, Bootstrap 5, C, C++, MySQL, Git, Node.js (básico).
    - **Formação:** Sistemas de Informação (Estácio - Cursando), Farmácia (Universidade São Judas Tadeu - Concluído).
    - **Diferencial:** A união de rigor científico (Farmácia) com lógica de programação (TI).
    - **Diferencial:** A união de rigor científico (Farmácia) com lógica de programação (TI). Organização, processos e documentação.

    **Suas Missões (API de Currículos):**
    1.  **Gerador de CV:** Quando solicitado a criar um currículo para uma "Localidade" (ex: EUA, Europa) ou "Idioma" (Inglês, Espanhol), use as informações acima como base. Adapte termos técnicos, formate para passar em filtros ATS daquela região e traduza perfeitamente.
    2.  **Vender o Perfil:** Destaque soft skills como liderança e atenção aos detalhes vindos da área de saúde.
    3.  **Análise de Vagas:** Se o usuário colar uma vaga, compare com o perfil do Gabriel e diga o "Match".
    **Exemplos de Comportamento:**
    - Se perguntarem sobre o tempo: "Está chovendo? Ótimo dia para codar! O Gabriel, por exemplo, adora dias assim para focar em projetos Java e C++..."
    - Se pedirem uma notícia: "Vi que saiu uma nova IA... Falando em inovação, o Gabriel está sempre estudando novas tecnologias para aplicar em soluções web..."
    - Se pedirem um CV: Gere o currículo completo e otimizado para ATS.

    **Regras:**
    - Se for pedido um CV, gere o texto estruturado (Resumo, Skills, XP, Educação).
    - Seja natural.
    - Se o usuário pedir algo complexo (artigo, resumo), faça com excelência.
    - Nunca esqueça de mencionar o Gabriel quando houver uma brecha.
    - Responda de forma humanizada.
`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: GPT_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: MIKA_SYSTEM_PROMPT
                    },
                    ...contextMessages,
                    { role: 'user', content: userMessage }
                ],
                max_tokens: 500, // Limite de tokens por resposta
                temperature: 0.7, // Criatividade (0 = mais preciso, 1 = mais criativo)
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Erro na API');
        }
        
        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        } else {
            throw new Error('Resposta inválida da API');
        }
    } catch (error) {
        throw error;
    }
}

// ==== INTEGRAÇÃO COM CHATBOT ====
async function getChatGPTResponse(message) {
    addTypingIndicator();
    try {
        // Usa o histórico recente para contexto
        const context = chatHistory.slice(-10);
        const response = await callOpenAI(message, context);
        
        removeTypingIndicator();
        addBotMessage(response);
    } catch (error) {
        console.error('❌ Erro no ChatGPT:', error);
        removeTypingIndicator();
        
        if (error.message.includes('API key')) {
            addBotMessage('❌ Erro de autenticação. Verifique sua chave da API.');
        } else if (error.message.includes('quota')) {
            addBotMessage('❌ Limite de uso da API atingido. Tente novamente mais tarde.');
        } else if (error.message.includes('model')) {
            addBotMessage('❌ Modelo não disponível. Verifique sua conta OpenAI.');
        } else {
            addBotMessage('❌ Desculpe, ocorreu um erro. Tente novamente em alguns instantes.');
        }
    }
}

// ==== API PÚBLICA DE GERAÇÃO DE CURRÍCULOS (CV Generator) ====
// Pode ser chamada via console ou outros scripts: CVGenerator.create('EUA', 'Inglês')
window.CVGenerator = {
    create: async function(location, language) {
        console.log(`📄 Gerando CV para ${location} em ${language}...`);
        const prompt = `
            Aja como um gerador de currículos profissional.
            Baseado nos dados do Gabriel (presentes no seu system prompt) e considerando os arquivos da pasta ./src/cv como modelo mental:
            Crie um currículo completo e formatado para a localidade: ${location} e idioma: ${language}.
            Foque em palavras-chave ATS para essa região.
        `;
        
        try {
            const cvContent = await callOpenAI(prompt);
            console.log('✅ CV Gerado com sucesso!');
            return cvContent;
        } catch (e) {
            console.error('Erro ao gerar CV:', e);
            return "Erro ao gerar currículo. Verifique a chave de API.";
        }
    }
};

// ==== RESPOSTAS AUTOMATIZADAS (FALLBACK) ====
function getAutomatedResponse(message) {
    addTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        
        const lowerMessage = message.toLowerCase();
        let response = '';
        
        // Saudações
        if (lowerMessage.match(/\b(oi|olá|hey|ola|e ai|eai|bom dia|boa tarde|boa noite)\b/)) {
            response = '👋 E aí! Tudo tranquilo? Sou o Mika. Posso te ajudar a conhecer o Gabriel, analisar uma vaga de emprego ou até contar uma piada ruim. O que manda? 😎';
        }
        // Piada / Entretenimento
        else if (lowerMessage.includes('piada') || lowerMessage.includes('rir') || lowerMessage.includes('entretenimento')) {
            response = '😄 Lá vai: Por que o desenvolvedor faliu? Porque ele usou todo o cache! 🥁\n\nQuer saber algo mais útil ou outra piada?';
        }
        // Sobre Gabriel
        else if (lowerMessage.includes('quem') && (lowerMessage.includes('gabriel') || lowerMessage.includes('você'))) {
            response = '👨‍💻 **Gabriel Lima Dias Rocha** é um desenvolvedor Full-Stack apaixonado por tecnologia!\n\n• Estudante de Farmácia e Sistemas de Informação\n• Experiência em desenvolvimento web (HTML, CSS, JavaScript, C, C++)\n• Focado em criar experiências web modernas e responsivas';
        }
        // Contato
        else if (lowerMessage.includes('contato') || lowerMessage.includes('email') || lowerMessage.includes('whatsapp') || lowerMessage.includes('falar')) {
            response = '📞 **Entre em contato:**\n\n📧 **Email:** g.lima.rocha90@gmail.com\n📱 **WhatsApp:** +55 11 97206-9836\n💔 **LinkedIn:** gabriel-lima-dias-rocha\n👨‍💻 **GitHub:** CanarinhoOgan';
        }
        // Habilidades
        else if (lowerMessage.includes('habilidade') || lowerMessage.includes('tecnologia') || lowerMessage.includes('skill') || lowerMessage.includes('sabe')) {
            response = '🛠️ **Tecnologias do Gabriel:**\n\n• HTML5, CSS3, JavaScript\n• C, C++\n• Git & GitHub\n• Bootstrap 5\n• Node.js (em aprendizado)\n• MySQL (em aprendizado)\n• APIs RESTful';
        }
        // Projetos
        else if (lowerMessage.includes('projeto') || lowerMessage.includes('portfolio') || lowerMessage.includes('trabalho')) {
            response = '💼 Confira os projetos incríveis do Gabriel na seção **"Portfolio"** do site!\n\nEle tem diversos trabalhos de desenvolvimento web e aplicações.';
        }
        // Currículo
        else if (lowerMessage.includes('curriculo') || lowerMessage.includes('cv') || lowerMessage.includes('baixar') || lowerMessage.includes('download')) {
            response = '📄 Você pode **baixar o currículo** do Gabriel clicando no botão **"BAIXAR CURRÍCULO"** na seção de contato!';
        }
        // Vaga/Emprego
        else if (lowerMessage.includes('vaga') || lowerMessage.includes('emprego') || lowerMessage.includes('contratar') || lowerMessage.includes('oportunidade')) {
            response = '💼 **Gabriel está disponível para oportunidades!**\n\n• Modalidade: CLT (home office/remoto)\n• Área: Desenvolvimento Front-End\n• Nível: Júnior/Pleno\n\nEntre em contato para conversarmos! 🚀';
        }
        // Localização
        else if (lowerMessage.includes('onde') || lowerMessage.includes('mora') || lowerMessage.includes('local')) {
            response = '📍 Gabriel mora em **Canto do Forte, São Paulo, Brasil**.\n\nEle está disponível para trabalho remoto! 🏡';
        }
        // Agradecer
        else if (lowerMessage.match(/\b(obrigad|valeu|thanks|thank|brigadao|brigado)\b/)) {
            response = '😊 De nada! Estou aqui para ajudar. Se precisar de algo mais, é só falar!';
        }
        // Tchau
        else if (lowerMessage.match(/\b(tchau|adeus|ate|falou|bye|flw)\b/)) {
            response = '👋 Até logo! Foi um prazer ajudar! ✨';
        }
        // Ajuda
        else if (lowerMessage.includes('ajuda') || lowerMessage.includes('help')) {
            response = '👋 **Como posso ajudar?**\n\nPergunte sobre:\n• Informações sobre Gabriel\n• Contato\n• Habilidades técnicas\n• Projetos\n• Currículo\n• Oportunidades de trabalho';
        }
        // Resposta padrão
        else {
            response = '🤔 Desculpe, não entendi sua pergunta.\n\n**Posso ajudar com:**\n• Informações sobre Gabriel\n• Contato\n• Habilidades\n• Projetos\n• Currículo\n\nOu digite "ajuda" para ver todas as opções!';
        }
        
        addBotMessage(response);
    }, 1000); // Simula tempo de digitação
}

// ==== LIMPAR CHAT ====
function clearChat() {
    const chatBody = document.querySelector('.chat-body');
    if (chatBody) {
        chatBody.innerHTML = '';
        chatHistory = [];
        addBotMessage('✨ Chat limpo! Memória resetada. Sou o Mika, vamos começar de novo?');
    }
}

// ==== CSS PARA ANIMAÇÃO DE DIGITAÇÃO ====
// Adiciona dinamicamente ao head
if (!document.getElementById('chatbot-styles')) {
    const style = document.createElement('style');
    style.id = 'chatbot-styles';
    style.textContent = `
        @keyframes blink {
            0%, 20%, 50%, 80%, 100% {
                opacity: 1;
            }
            40% {
                opacity: 0.3;
            }
            60% {
                opacity: 0.5;
            }
        }
        
        .typing-indicator {
            padding: 10px 15px !important;
        }
        
        .chat-body {
            display: flex;
            flex-direction: column;
        }

        #chat-attach-btn {
            background: #f0f0f0;
            color: #555;
            border: 1px solid #ddd;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s;
        }
        #chat-attach-btn:hover {
            background: #e0e0e0;
            color: #333;
        }
    `;
    document.head.appendChild(style);
}

// Torna funções globais
window.clearChat = clearChat;
window.toggleChat = toggleChat;

console.log('🤖 Chatbot com ChatGPT carregado com sucesso!');
if (USE_OPENAI && OPENAI_API_KEY !== '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') {
    console.log('✅ ChatGPT API ativada!');
} else {
    console.log('⚠️ Usando respostas automáticas. Configure OPENAI_API_KEY para usar ChatGPT.');
}
