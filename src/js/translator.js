// ===== SISTEMA DE TRADUÇÃO AUTOMÁTICA =====
// Traduz o portfolio para qualquer idioma automaticamente

// ==== CONFIGURAÇÕES ====
const TRANSLATION_METHOD = 'google-widget'; // 'google-widget' (gratis) ou 'google-api' (paga)
const GOOGLE_TRANSLATE_API_KEY = 'AIzaSyBAw4LFGoeplFFQcs2V66R07jXprcxpHjc'; // ⚠️ SEGREDO: Configure sua chave aqui se usar API paga
const DEFAULT_LANGUAGE = 'pt'; // Português Brasileiro

// Idiomas disponíveis
// Lista expandida com principais idiomas suportados pelo Google Translate
const LANGUAGES = {
    'af': { name: 'Afrikaans', flag: 'fi fi-za' },
    'sq': { name: 'Albanian', flag: 'fi fi-al' },
    'am': { name: 'Amharic', flag: 'fi fi-et' },
    'ar': { name: 'Arabic', flag: 'fi fi-sa' },
    'hy': { name: 'Armenian', flag: 'fi fi-am' },
    'az': { name: 'Azerbaijani', flag: 'fi fi-az' },
    'eu': { name: 'Basque', flag: 'fi fi-es-pv' },
    'be': { name: 'Belarusian', flag: 'fi fi-by' },
    'bn': { name: 'Bengali', flag: 'fi fi-bd' },
    'bs': { name: 'Bosnian', flag: 'fi fi-ba' },
    'bg': { name: 'Bulgarian', flag: 'fi fi-bg' },
    'ca': { name: 'Catalan', flag: 'fi fi-es-ct' },
    'ceb': { name: 'Cebuano', flag: 'fi fi-ph' },
    'ny': { name: 'Chichewa', flag: 'fi fi-mw' },
    'zh-CN': { name: 'Chinese (Simplified)', flag: 'fi fi-cn' },
    'zh-TW': { name: 'Chinese (Traditional)', flag: 'fi fi-tw' },
    'co': { name: 'Corsican', flag: 'fi fi-fr' },
    'hr': { name: 'Croatian', flag: 'fi fi-hr' },
    'cs': { name: 'Czech', flag: 'fi fi-cz' },
    'da': { name: 'Czech', flag: 'fi fi-dk' },
    'nl': { name: 'Dutch', flag: 'fi fi-nl' },
    'en': { name: 'English', flag: 'fi fi-us' },
    'eo': { name: 'Esperanto', flag: 'fi fi-xx' },
    'et': { name: 'Estonian', flag: 'fi fi-ee' },
    'tl': { name: 'Filipino', flag: 'fi fi-ph' },
    'fi': { name: 'Finnish', flag: 'fi fi-fi' },
    'fr': { name: 'French', flag: 'fi fi-fr' },
    'fy': { name: 'Frisian', flag: 'fi fi-nl' },
    'gl': { name: 'Galician', flag: 'fi fi-es-ga' },
    'ka': { name: 'Georgian', flag: 'fi fi-ge' },
    'de': { name: 'German', flag: 'fi fi-de' },
    'el': { name: 'Greek', flag: 'fi fi-gr' },
    'gu': { name: 'Gujarati', flag: 'fi fi-in' },
    'ht': { name: 'Haitian Creole', flag: 'fi fi-ht' },
    'ha': { name: 'Hausa', flag: 'fi fi-ng' },
    'haw': { name: 'Hawaiian', flag: 'fi fi-us' },
    'iw': { name: 'Hebrew', flag: 'fi fi-il' },
    'hi': { name: 'Hindi', flag: 'fi fi-in' },
    'hmn': { name: 'Hmong', flag: 'fi fi-cn' },
    'hu': { name: 'Hungarian', flag: 'fi fi-hu' },
    'is': { name: 'Icelandic', flag: 'fi fi-is' },
    'ig': { name: 'Igbo', flag: 'fi fi-ng' },
    'id': { name: 'Indonesian', flag: 'fi fi-id' },
    'ga': { name: 'Irish', flag: 'fi fi-ie' },
    'it': { name: 'Italian', flag: 'fi fi-it' },
    'ja': { name: 'Japanese', flag: 'fi fi-jp' },
    'jw': { name: 'Javanese', flag: 'fi fi-id' },
    'kn': { name: 'Kannada', flag: 'fi fi-in' },
    'kk': { name: 'Kazakh', flag: 'fi fi-kz' },
    'km': { name: 'Khmer', flag: 'fi fi-kh' },
    'ko': { name: 'Korean', flag: 'fi fi-kr' },
    'ku': { name: 'Kurdish (Kurmanji)', flag: 'fi fi-tr' },
    'ky': { name: 'Kyrgyz', flag: 'fi fi-kg' },
    'lo': { name: 'Lao', flag: 'fi fi-la' },
    'la': { name: 'Latin', flag: 'fi fi-va' },
    'lv': { name: 'Latvian', flag: 'fi fi-lv' },
    'lt': { name: 'Lithuanian', flag: 'fi fi-lt' },
    'lb': { name: 'Luxembourgish', flag: 'fi fi-lu' },
    'mk': { name: 'Macedonian', flag: 'fi fi-mk' },
    'mg': { name: 'Malagasy', flag: 'fi fi-mg' },
    'ms': { name: 'Malay', flag: 'fi fi-my' },
    'ml': { name: 'Malayalam', flag: 'fi fi-in' },
    'mt': { name: 'Maltese', flag: 'fi fi-mt' },
    'mi': { name: 'Maori', flag: 'fi fi-nz' },
    'mr': { name: 'Marathi', flag: 'fi fi-in' },
    'mn': { name: 'Mongolian', flag: 'fi fi-mn' },
    'my': { name: 'Myanmar (Burmese)', flag: 'fi fi-mm' },
    'ne': { name: 'Nepali', flag: 'fi fi-np' },
    'no': { name: 'Norwegian', flag: 'fi fi-no' },
    'ps': { name: 'Pashto', flag: 'fi fi-af' },
    'fa': { name: 'Persian', flag: 'fi fi-ir' },
    'pl': { name: 'Polish', flag: 'fi fi-pl' },
    'pt': { name: 'Portuguese', flag: 'fi fi-pt' },
    'pa': { name: 'Punjabi', flag: 'fi fi-pk' },
    'ro': { name: 'Romanian', flag: 'fi fi-ro' },
    'ru': { name: 'Russian', flag: 'fi fi-ru' },
    'sm': { name: 'Samoan', flag: 'fi fi-ws' },
    'gd': { name: 'Scots Gaelic', flag: 'fi fi-gb-sct' },
    'sr': { name: 'Serbian', flag: 'fi fi-rs' },
    'st': { name: 'Sesotho', flag: 'fi fi-ls' },
    'sn': { name: 'Shona', flag: 'fi fi-zw' },
    'sd': { name: 'Sindhi', flag: 'fi fi-pk' },
    'si': { name: 'Sinhala', flag: 'fi fi-lk' },
    'sk': { name: 'Slovak', flag: 'fi fi-sk' },
    'sl': { name: 'Slovenian', flag: 'fi fi-si' },
    'so': { name: 'Somali', flag: 'fi fi-so' },
    'es': { name: 'Spanish', flag: 'fi fi-es' },
    'su': { name: 'Sundanese', flag: 'fi fi-id' },
    'sw': { name: 'Swahili', flag: 'fi fi-ke' },
    'sv': { name: 'Swedish', flag: 'fi fi-se' },
    'tg': { name: 'Tajik', flag: 'fi fi-tj' },
    'ta': { name: 'Tamil', flag: 'fi fi-in' },
    'te': { name: 'Telugu', flag: 'fi fi-in' },
    'th': { name: 'Thai', flag: 'fi fi-th' },
    'tr': { name: 'Turkish', flag: 'fi fi-tr' },
    'uk': { name: 'Ukrainian', flag: 'fi fi-ua' },
    'ur': { name: 'Urdu', flag: 'fi fi-pk' },
    'uz': { name: 'Uzbek', flag: 'fi fi-uz' },
    'vi': { name: 'Vietnamese', flag: 'fi fi-vn' },
    'cy': { name: 'Welsh', flag: 'fi fi-gb-wls' },
    'xh': { name: 'Xhosa', flag: 'fi fi-za' },
    'yi': { name: 'Yiddish', flag: 'fi fi-il' },
    'yo': { name: 'Yoruba', flag: 'fi fi-ng' },
    'zu': { name: 'Zulu', flag: 'fi fi-za' }
};

// Dicionário de Tradução Manual (Interface Principal)
const UI_TRANSLATIONS = {
    'pt': {
        'nav-home': 'Home',
        'nav-about': 'Sobre',
        'nav-dev': 'DEV',
        'nav-projects': 'Projetos',
        'nav-contact': 'Contato',
        'nav-videos': 'Vídeos',
        'nav-streams': 'Streams',
        'nav-spirituality': 'Espiritualidade',
        'nav-pharmacy': 'Farmacêutico',
        'nav-agenda': 'Minha Agenda',
        'btn-download-cv': 'Baixar Currículo',
        'btn-contact': 'Entre em Contato',
        'btn-whatsapp': 'WhatsApp',
        'hero-role': 'Desenvolvedor Front-End | Estudante de Sistemas de Informação',
        'hero-location': 'Praia Grande, SP | Disponível para trabalhoo presencial, hibrido e remoto
    },
    'en': {
        'nav-home': 'Home',
        'nav-about': 'About',
        'nav-dev': 'DEV',
        'nav-projects': 'Projects',
        'nav-contact': 'Contact',
        'nav-videos': 'Videos',
        'nav-streams': 'Streams',
        'nav-spirituality': 'Spirituality',
        'nav-pharmacy': 'Pharmacist',
        'nav-agenda': 'My Calendar',
        'btn-download-cv': 'Download CV',
        'btn-contact': 'Get in Touch',
        'btn-whatsapp': 'WhatsApp',
        'hero-role': 'Front-End Developer | Information Systems Student',
        'hero-location': 'Praia Grande, SP | Available for remote'
    },
    'es': {
        'nav-home': 'Inicio',
        'nav-about': 'Sobre Mí',
        'nav-dev': 'DEV',
        'nav-projects': 'Proyectos',
        'nav-contact': 'Contacto',
        'nav-videos': 'Videos',
        'nav-streams': 'Streams',
        'nav-spirituality': 'Espiritualidad',
        'nav-pharmacy': 'Farmacéutico',
        'nav-agenda': 'Mi Agenda',
        'btn-download-cv': 'Descargar CV',
        'btn-contact': 'Ponerse en Contacto',
        'btn-whatsapp': 'WhatsApp'
    }
};

// ==== INICIALIZAÇÃO ====
let currentLanguage = DEFAULT_LANGUAGE;
let isTranslatorReady = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌍 Translator carregado!');
    
    // Carrega CSS de bandeiras (Flag Icons) para garantir compatibilidade com Windows
    const flagStyle = document.createElement('link');
    flagStyle.rel = 'stylesheet';
    flagStyle.href = 'https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.6.6/css/flag-icons.min.css';
    document.head.appendChild(flagStyle);

    // Cria botão de idiomas
    createLanguageSelector();
    
    // Inicializa método de tradução
    if (TRANSLATION_METHOD === 'google-widget') {
        initGoogleTranslateWidget();
    } else if (TRANSLATION_METHOD === 'google-api') {
        initGoogleTranslateAPI();
    }
    
    // Detecta idioma do navegador
    detectBrowserLanguage();
    
    // Atualiza links iniciais
    updateCVLinks(currentLanguage);
});

// ==== MÉTODO 1: GOOGLE TRANSLATE WIDGET (GRÁTIS) ====
function initGoogleTranslateWidget() {
    // Carrega script do Google Translate
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);
    
    // Função callback (necessária)
    window.googleTranslateElementInit = function() {
        new google.translate.TranslateElement({
            pageLanguage: 'pt',
            // includedLanguages: Object.keys(LANGUAGES).join(','), // Comentado para permitir todos os idiomas
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
        }, 'google_translate_element');
        
        console.log('✅ Google Translate Widget inicializado!');
        isTranslatorReady = true;
    };
}

// ==== MÉTODO 2: GOOGLE TRANSLATE API (PAGA) ====
async function translateWithAPI(text, targetLang) {
    if (!GOOGLE_TRANSLATE_API_KEY || GOOGLE_TRANSLATE_API_KEY === 'SUA_CHAVE_GOOGLE_AQUI') {
        console.error('❌ Configure GOOGLE_TRANSLATE_API_KEY');
        return text;
    }
    
    try {
        const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: text,
                source: 'pt',
                target: targetLang,
                format: 'text'
            })
        });
        
        if (!response.ok) {
            throw new Error('Erro na API de tradução');
        }
        
        const data = await response.json();
        return data.data.translations[0].translatedText;
    } catch (error) {
        console.error('❌ Erro na tradução:', error);
        return text;
    }
}

function initGoogleTranslateAPI() {
    console.log('✅ Google Translate API configurada');
    isTranslatorReady = true;
}

// ==== FUNÇÃO PÚBLICA DE TRADUÇÃO (PARA O MIKA E OUTROS SCRIPTS) ====
window.translateText = async function(text) {
    return await translateWithAPI(text, currentLanguage);
};

// ==== FUNÇÃO DE BUSCA NO MENU DE IDIOMAS ====
function filterLanguages() {
    const input = document.querySelector('.language-search-input');
    const filter = input.value.toUpperCase();
    const itemsContainer = document.querySelector('.language-menu-items');
    const items = itemsContainer.querySelectorAll('.language-item');

    for (let i = 0; i < items.length; i++) {
        const nameSpan = items[i].querySelector('.name');
        if (nameSpan) {
            const txtValue = nameSpan.textContent || nameSpan.innerText;
            items[i].style.display = txtValue.toUpperCase().indexOf(filter) > -1
                ? 'flex'
                : 'none';
        }
    }
}

// ==== SELETOR DE IDIOMA ====
function createLanguageSelector() {
    // Cria container
    const container = document.createElement('div');
    container.id = 'language-selector';
    container.className = 'language-selector';
    
    // Botão principal
    const button = document.createElement('button');
    button.className = 'language-btn';
    button.innerHTML = `
        <span class="current-flag ${LANGUAGES[currentLanguage] ? LANGUAGES[currentLanguage].flag : 'fi fi-xx'}"></span>
        <span class="current-lang">${LANGUAGES[currentLanguage] ? LANGUAGES[currentLanguage].name : currentLanguage.toUpperCase()}</span>
        <i class="fas fa-chevron-down"></i>
    `;
    button.addEventListener('click', toggleLanguageMenu);
    
    // Menu dropdown
    const menu = document.createElement('div');
    menu.className = 'language-menu';
    menu.id = 'language-menu';

    // Caixa de busca
    const searchBox = document.createElement('div');
    searchBox.className = 'language-search-box';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Select language';
    searchInput.className = 'language-search-input';
    searchInput.addEventListener('keyup', filterLanguages);
    searchBox.appendChild(searchInput);
    menu.appendChild(searchBox);

    // Container para os itens (para permitir scroll independente da busca)
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'language-menu-items';

    // Adiciona idiomas ao menu
    Object.entries(LANGUAGES).forEach(([code, lang]) => {
        const item = document.createElement('div');
        item.className = 'language-item';
        item.dataset.lang = code; // Adiciona data-attribute para fácil seleção
        if (code === currentLanguage) item.classList.add('active');
        
        item.innerHTML = `
            <span class="flag ${lang.flag}"></span>
            <span class="name">${lang.name}</span>
        `;
        item.addEventListener('click', () => changeLanguage(code));
        itemsContainer.appendChild(item);
    });
    
    menu.appendChild(itemsContainer);
    container.appendChild(button);
    container.appendChild(menu);
    
    // Adiciona ao body
    document.body.appendChild(container);
    
    // Adiciona CSS
    addLanguageSelectorStyles();
    
    // Container oculto do Google Translate Widget
    const googleDiv = document.createElement('div');
    googleDiv.id = 'google_translate_element';
    // Esconde visualmente mas mantém no DOM para o script funcionar corretamente
    googleDiv.style.position = 'absolute';
    googleDiv.style.top = '-9999px';
    googleDiv.style.visibility = 'hidden';
    document.body.appendChild(googleDiv);
}

function toggleLanguageMenu() {
    const menu = document.getElementById('language-menu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

function changeLanguage(langCode) {
    if (langCode === currentLanguage) {
        toggleLanguageMenu();
        return;
    }
    
    currentLanguage = langCode;
    
    // Atualiza botão
    const flag = document.querySelector('.current-flag');
    const name = document.querySelector('.current-lang');
    if (flag) flag.className = `current-flag ${LANGUAGES[langCode] ? LANGUAGES[langCode].flag : 'fi fi-xx'}`;
    if (name) name.textContent = LANGUAGES[langCode] ? LANGUAGES[langCode].name : langCode.toUpperCase();
    
    // Atualiza menu
    document.querySelectorAll('.language-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const newActiveItem = document.querySelector(`.language-item[data-lang="${langCode}"]`);
    if (newActiveItem) {
        newActiveItem.classList.add('active');
    }
    
    // Fecha menu
    toggleLanguageMenu();
    
    // Traduz página
    translatePage(langCode);
    
    // Traduz Interface Manualmente
    translateUI(langCode);
    
    // Atualiza Currículos
    updateCVLinks(langCode);
}

function translatePage(targetLang) {
    if (targetLang === 'pt') {
        // Volta para português (recarrega página)
        window.location.href = window.location.pathname;
        return;
    }
    
    if (TRANSLATION_METHOD === 'google-widget') {
        // Usa Google Translate Widget
        const select = document.querySelector('.goog-te-combo');
        if (select) {
            select.value = targetLang;
            select.dispatchEvent(new Event('change'));
            console.log(`🌍 Traduzindo para ${targetLang}...`);
        } else {
            console.error('❌ Widget do Google Translate não encontrado');
        }
    } else if (TRANSLATION_METHOD === 'google-api') {
        // Usa Google Translate API
        translateAllContent(targetLang);
    }
}

// ==== TRADUÇÃO DE INTERFACE (MANUAL) ====
function translateUI(lang) {
    const translations = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS['en']; // Fallback para inglês
    if (!translations) return;

    // Traduz elementos com atributo data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
            el.textContent = translations[key];
        }
    });
}

// ==== GERENCIAMENTO DE CURRÍCULOS (ATS & LOCALIDADE) ====
function updateCVLinks(lang) {
    const cvButtons = document.querySelectorAll('.cv-download-btn');
    const isPharmacyPage = window.location.pathname.includes('pharmacy.html');
    
    // Define o tipo de currículo baseado na página
    const cvType = isPharmacyPage ? 'pharmacy' : 'fullstack';
    
    // Mapeamento de arquivos (Você deve criar esses arquivos na pasta src/cv/)
    // Ex: src/cv/cv-fullstack-pt.pdf
    const fileName = `cv-${cvType}-${lang}.pdf`;
    const filePath = `./src/cv/${fileName}`;
    
    // Fallback para PT se o arquivo específico não existir (lógica simplificada)
    // Na prática, o navegador tentará baixar o arquivo definido no href
    
    cvButtons.forEach(btn => {
        btn.href = filePath;
        
        // Nome amigável para download (ATS Friendly)
        const name = isPharmacyPage ? 'Gabriel_Lima_Pharmacist' : 'Gabriel_Lima_Developer';
        const langSuffix = lang.toUpperCase();
        btn.setAttribute('download', `${name}_CV_${langSuffix}.pdf`);
        
        // Atualiza texto do botão se necessário
        const translations = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS['en'];
        if (translations && translations['btn-download-cv']) {
            btn.innerHTML = `<i class="fas fa-download me-2"></i> ${translations['btn-download-cv']}`;
        }
    });
}

// ==== TRADUÇÃO MANUAL (PARA API) ====
async function translateAllContent(targetLang) {
    // Elementos a serem traduzidos
    const selectors = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'li', 'td', 'th', 'div',
        'button:not(.language-btn):not(.chat-toggle-btn):not(.music-toggle-btn):not(.close-player-btn)',
        'label', 'input[placeholder]', 'textarea[placeholder]',
        '.nav-link', '.dropdown-item', '.card-title', '.card-text',
        '.bot-message', '.user-message' // Inclui mensagens do chat existentes
    ];
    
    const elements = document.querySelectorAll(selectors.join(', '));
    
    console.log(`🌍 Traduzindo ${elements.length} elementos...`);
    
    for (const element of elements) {
        // Ignora elementos vazios ou do chatbot/player
        if (!element.textContent.trim() ||
            element.closest('.chat-body') ||
            element.closest('.music-player-expanded') ||
            element.closest('#language-selector')) {
            continue;
        }
        
        const originalText = element.textContent;
        const translatedText = await translateWithAPI(originalText, targetLang);
        element.textContent = translatedText;
    }
    
    console.log('✅ Tradução concluída!');
}

// ==== DETECTAR IDIOMA DO NAVEGADOR ====
function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0]; // 'pt-BR' -> 'pt'
    
    // Se o idioma do navegador está disponível e não é português
    if (langCode !== 'pt') {
        console.log(`🌍 Idioma detectado: ${langCode}`);
        
        // Pergunta ao usuário se quer traduzir
        setTimeout(() => {
            if (confirm(`Detectamos que seu idioma é ${LANGUAGES[langCode] ? LANGUAGES[langCode].name : langCode.toUpperCase()}. Deseja traduzir a página?`)) {
                changeLanguage(langCode);
            }
        }, 2000);
    }
}

// ==== ESTILOS DO SELETOR ====
function addLanguageSelectorStyles() {
    if (document.getElementById('language-selector-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'language-selector-styles';
    style.textContent = `
        /* Seletor de Idiomas */
        .language-selector {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9990;
        }
        
        .language-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 15px;
            background: white;
            border: 2px solid #ddd;
            border-radius: 25px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            color: #333;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .language-btn:hover {
            border-color: #667eea;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            transform: translateY(-2px);
        }
        
        .language-btn .current-flag {
            font-size: 20px;
        }
        
        .language-btn i {
            font-size: 12px;
            color: #999;
            transition: transform 0.3s;
        }
        
        .language-menu.active + .language-btn i {
            transform: rotate(180deg);
        }
        
        .language-menu {
            position: absolute;
            top: 50px;
            right: 0;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            padding: 10px;
            min-width: 200px;
            max-height: 400px;
            overflow-y: auto;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
        }

        .language-search-box {
            padding: 5px;
            border-bottom: 1px solid #eee;
        }

        .language-search-input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
        }
        
        .language-menu.active {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
            display: flex;
            flex-direction: column;
        }
        
        .language-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .language-item:hover {
            background: #f5f5f5;
        }
        
        .language-item.active {
            background: #667eea;
            color: white;
        }
        
        .language-item .flag {
            font-size: 20px;
        }
        
        .language-item .name {
            font-size: 14px;
            font-weight: 500;
        }
        
        /* Scrollbar customizada */
        .language-menu-items::-webkit-scrollbar {
            width: 6px;
        }
        
        .language-menu-items::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
        }
        
        .language-menu-items::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
        }
        
        .language-menu-items::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
        
        /* Oculta barra do Google Translate */
        .goog-te-banner-frame {
            display: none !important;
        }
        
        body {
            top: 0 !important;
        }
        
        /* Mobile */
        @media (max-width: 768px) {
            .language-selector {
                top: 10px;
                right: 10px;
            }
            
            .language-btn {
                padding: 8px 12px;
                font-size: 12px;
            }
            
            .language-btn .current-lang {
                display: none; /* Mostra apenas bandeira no mobile */
            }
            
            .language-menu {
                right: 0;
                min-width: 180px;
            }
        }
    `;
    document.head.appendChild(style);
}

// ==== FECHAR MENU AO CLICAR FORA ====
document.addEventListener('click', function(e) {
    const selector = document.getElementById('language-selector');
    const menu = document.getElementById('language-menu');
    
    if (selector && menu && !selector.contains(e.target)) {
        menu.classList.remove('active');
    }
});

// Torna funções globais
window.changeLanguage = changeLanguage;
window.detectBrowserLanguage = detectBrowserLanguage;

console.log('🌍 Sistema de tradução carregado com sucesso!');
console.log(`🌐 Método: ${TRANSLATION_METHOD}`);
console.log(`🗣️ Idiomas disponíveis: ${Object.keys(LANGUAGES).length}`);
