// ===== SISTEMA DE ADMINISTRAÇÃO COM SUPABASE (POSTGRESQL) =====

// 1. Configuração do Supabase
// Substitua pelos dados do seu projeto no Supabase (Settings > API)
const SUPABASE_URL = 'SUA_URL_DO_SUPABASE_AQUI';
const SUPABASE_KEY = 'SUA_ANON_KEY_AQUI';

// Inicializa o cliente
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// 2. Inicialização
document.addEventListener('DOMContentLoaded', function() {
    if (!supabase) {
        console.error('Supabase não foi carregado. Verifique o script no HTML.');
        return;
    }
    loadProjects();
    setupAdminEvents();
    checkSession();
});

// 3. Carregar Projetos do Banco de Dados
async function loadProjects() {
    const container = document.getElementById('admin-projects-list');
    // Tenta encontrar o container principal de projetos se o de admin não existir
    const mainContainer = container || document.getElementById('projects-container');
    
    if (!mainContainer) return;

    // Busca projetos no Supabase ordenados por criação (mais recentes primeiro)
    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao carregar projetos:', error);
        mainContainer.innerHTML = '<p class="text-white text-center">Erro ao carregar projetos.</p>';
        return;
    }

    mainContainer.innerHTML = '';

    if (!projects || projects.length === 0) {
        mainContainer.innerHTML = '<p class="text-white-50 text-center">Nenhum projeto encontrado no banco de dados.</p>';
        return;
    }

    projects.forEach(proj => {
        const description = proj.description || proj.desc || '';
        const html = `
            <div class="col-md-6 p-3">
                <div class="project-content position-relative bg-black rounded h-100">
                    <img class="project-img img-fluid w-100" src="${proj.img || 'https://placehold.co/600x400/1e1e1e/FFF?text=Sem+Imagem'}" alt="${proj.title}" style="object-fit: cover; height: 300px; opacity: 0.7;">
                    <div class="project-description p-4 position-absolute bottom-0 start-0 w-100" style="background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);">
                        <h5 class="text-white fw-bold">${proj.title}</h5>
                        <p class="text-white-50 small mb-2"><i class="fas fa-code text-primary"></i> ${proj.tech}</p>
                        <p class="text-white-50 small">${description}</p>
                        <div class="d-flex gap-2 mt-3">
                            <a href="${proj.demo}" target="_blank" class="btn btn-sm btn-light rounded-pill px-3">
                                <i class="fas fa-eye"></i> Ver Demo
                            </a>
                            <a href="${proj.github}" target="_blank" class="btn btn-sm btn-outline-light rounded-pill px-3">
                                <i class="fab fa-github"></i> Código
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        mainContainer.innerHTML += html;
    });
}

// 4. Verificar Sessão
function checkSession() {
    const role = localStorage.getItem('portfolio_user_role');
    const path = window.location.pathname;
    
    // Se estiver na página de login (admin.html) e já tiver role -> vai pro dashboard
    if (path.includes('admin.html') && role) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Se estiver no dashboard e NÃO tiver role -> vai pro login
    if (path.includes('dashboard.html')) {
        if (!role) {
            window.location.href = 'admin.html';
        } else {
            handleDashboardRole(role);
        }
    }
}

function handleDashboardRole(role) {
    const form = document.getElementById('add-project-form');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (role === 'teste') {
        if(submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-lock"></i> Adição Bloqueada (Modo RH)';
        }
        // Opcional: Adicionar aviso visual para modo teste
    }
}

// 5. Eventos
function setupAdminEvents() {
    const btnLogin = document.getElementById('btn-admin-login');
    const modalElement = document.getElementById('adminModal');
    // Verifica se o Bootstrap está carregado antes de criar o modal
    const modal = (window.bootstrap && modalElement) ? new bootstrap.Modal(modalElement) : null;
    
    if(btnLogin && modal) {
        btnLogin.addEventListener('click', () => {
            modal.show();
        });
    }

    const btnDoLogin = document.getElementById('btn-do-login');
    if(btnDoLogin) {
        btnDoLogin.addEventListener('click', () => {
            const emailInput = document.getElementById('admin-email').value.trim();
            const passwordInput = document.getElementById('admin-password').value.trim();
            const email = emailInput.toLowerCase();

            if(!email || !passwordInput) {
                alert('Preencha e-mail e senha!');
                return;
            }

            if (email === 'teste' || email === 'recrutador') {
                localStorage.setItem('portfolio_user_role', 'teste');
                alert('👋 Olá, Recrutador! Acesso de visualização liberado.');
                window.location.href = 'dashboard.html';
            } else {
                supabase.auth.signInWithPassword({
                    email: email,
                    password: passwordInput,
                }).then(({ data, error }) => {
                    if (error) {
                        alert('❌ Erro no login: ' + error.message);
                    } else {
                        localStorage.setItem('portfolio_user_role', 'admin');
                        alert('✅ Bem-vindo, Gabriel! Acesso total liberado.');
                        window.location.href = 'dashboard.html';
                    }
                });
            }
        });
    }

    const form = document.getElementById('add-project-form');
    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const role = localStorage.getItem('portfolio_user_role');
            if (role !== 'admin') {
                alert('⛔ Apenas o administrador pode adicionar projetos.');
                return;
            }

            const newProject = {
                title: document.getElementById('proj-title').value,
                tech: document.getElementById('proj-tech').value,
                description: document.getElementById('proj-desc').value, // Mapeia para 'description'
                img: document.getElementById('proj-img').value,
                demo: document.getElementById('proj-demo').value,
                github: document.getElementById('proj-github').value
            };

            const { error } = await supabase
                .from('projects')
                .insert([newProject]);

            if (error) {
                alert('❌ Erro ao salvar no banco: ' + error.message);
            } else {
                alert('🚀 Projeto salvo no PostgreSQL com sucesso!');
                loadProjects();
                form.reset();
                if(modal) modal.hide();
            }
        });
    }

    const btnLogout = document.getElementById('btn-logout');
    if(btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('portfolio_user_role');
            window.location.href = 'admin.html';
        });
    }
}
