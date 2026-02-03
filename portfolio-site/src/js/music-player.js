// ===== PLAYER MUSICAL COMPLETO =====
// Suporta: Músicas Locais, Spotify e YouTube

// ==== CONFIGURAÇÕES INICIAIS ====
const SPOTIFY_CLIENT_ID = 'SEU_CLIENT_ID_AQUI'; // ⚠️ SEGREDO: Client ID do Spotify
const SPOTIFY_REDIRECT_URI = window.location.origin + window.location.pathname; // URL atual
const YOUTUBE_API_KEY = 'AIzaSyBAw4LFGoeplFFQcs2V66R07jXprcxpHjc'; // ⚠️ SEGREDO: Chave de API do YouTube

// ==== VARIÁVEIS GLOBAIS ====
let currentAudio = null; // Objeto de áudio atual
let currentTrackIndex = 0; // Índice da música atual
let isPlaying = false; // Estado de reprodução
let currentSource = 'local'; // Fonte atual: 'local', 'spotify', 'youtube'
let spotifyToken = null; // Token de acesso do Spotify
let spotifyDeviceId = null; // ID do dispositivo Spotify
let youtubePlayer = null; // Player do YouTube

// ==== PLAYLIST LOCAL ====
const localPlaylist = [
    {
        title: "Don't Wake Me Up",
        artist: "RetroVision",
        file: "./src/music/RetroVision - Don't Wake Me Up [NCS Release].mp3"
    },
    {
        title: "FAVELA",
        artist: "MXZI, Deno",
        file: "./src/music/MXZI, Deno - FAVELA [NCS Release].mp3"
    }
];

// ==== INICIALIZAÇÃO ====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎵 Music Player carregado!');
    
    // Inicializa elementos
    initializeMusicPlayer();
    
    // Carrega playlist local
    loadLocalPlaylist();
    
    // Verifica se há token do Spotify na URL
    checkSpotifyAuth();
    
    // Carrega API do YouTube
    loadYouTubeAPI();

    // Verificação de segurança: Se a API já carregou antes deste script
    if (window.YT && window.YT.Player && !youtubePlayer) {
        console.log('✅ YouTube API já disponível, aguardando interação.');
    }
});

// ==== FUNÇÕES DE INICIALIZAÇÃO ====
function initializeMusicPlayer() {
    // Botão toggle do player
    const musicToggleBtn = document.querySelector('.music-toggle-btn');
    if (musicToggleBtn) {
        musicToggleBtn.addEventListener('click', togglePlayer);
    }
    
    // Botão fechar player
    const closePlayerBtn = document.querySelector('.close-player-btn');
    if (closePlayerBtn) {
        closePlayerBtn.addEventListener('click', closePlayer);
    }
    
    // Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // Controles de música
    const prevBtn = document.querySelector('.prev-btn');
    const playBtn = document.querySelector('.play-pause');
    const nextBtn = document.querySelector('.next-btn');
    
    if (prevBtn) prevBtn.addEventListener('click', previousTrack);
    if (playBtn) playBtn.addEventListener('click', togglePlay);
    if (nextBtn) nextBtn.addEventListener('click', nextTrack);
    
    // Volume
    const volumeSlider = document.querySelector('.volume-slider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            setVolume(this.value / 100);
        });
    }
    
    // Progress bar
    const progressBar = document.querySelector('.progress-bar-container');
    if (progressBar) {
        progressBar.addEventListener('click', seekTrack);
    }
    
    // Spotify login
    const spotifyLoginBtn = document.querySelector('.spotify-login-btn');
    if (spotifyLoginBtn) {
        spotifyLoginBtn.addEventListener('click', loginSpotify);
    }
    
    // YouTube search
    const youtubeSearchBtn = document.querySelector('#youtube-search-btn');
    if (youtubeSearchBtn) {
        youtubeSearchBtn.addEventListener('click', searchYouTube);
    }
    
    const youtubeSearchInput = document.querySelector('#youtube-search');
    if (youtubeSearchInput) {
        youtubeSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchYouTube();
        });
    }
}

// ==== FUNÇÕES DO PLAYER ====
function togglePlayer() {
    const player = document.querySelector('.music-player-expanded');
    if (player) {
        player.classList.toggle('active');
    }
}

function closePlayer() {
    const player = document.querySelector('.music-player-expanded');
    if (player) {
        player.classList.remove('active');
    }
}

function switchTab(tabName) {
    // Remove active de todas as tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Ativa a tab selecionada
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Atualiza fonte
    currentSource = tabName;
}

// ==== PLAYLIST LOCAL ====
function loadLocalPlaylist() {
    const playlistContainer = document.querySelector('.playlist-local');
    if (!playlistContainer) return;
    
    playlistContainer.innerHTML = '';
    
    localPlaylist.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        if (index === currentTrackIndex && currentSource === 'local') {
            item.classList.add('playing');
        }
        
        item.innerHTML = `
            <i class="fas fa-music"></i>
            <div>
                <div style="font-weight: 600; color: white;">${track.title}</div>
                <div style="font-size: 11px; color: #999;">${track.artist}</div>
            </div>
        `;
        
        item.addEventListener('click', () => playLocalTrack(index));
        playlistContainer.appendChild(item);
    });
}

function playLocalTrack(index) {
    currentTrackIndex = index;
    currentSource = 'local';
    const track = localPlaylist[index];
    
    // Parar qualquer reprodução anterior
    stopAllPlayers();
    
    // Criar novo áudio
    currentAudio = new Audio(track.file);
    
    // Event listeners
    currentAudio.addEventListener('loadedmetadata', () => {
        updateTrackInfo(track.title, track.artist);
        updateProgressBar();
    });
    
    currentAudio.addEventListener('timeupdate', updateProgressBar);
    currentAudio.addEventListener('ended', nextTrack);
    
    currentAudio.addEventListener('error', (e) => {
        console.error('❌ Erro ao carregar música:', e);
        showNotification('❌ Erro ao carregar música. Verifique se o arquivo existe.');
    });
    
    // Tocar
    currentAudio.play()
        .then(() => {
            isPlaying = true;
            updatePlayButton();
            showNowPlaying(track.title);
            updatePlaylistUI();
        })
        .catch(error => {
            console.error('❌ Erro ao tocar:', error);
            showNotification('❌ Erro ao tocar música');
        });
}

// ==== CONTROLES ====
function togglePlay() {
    if (currentSource === 'local' && currentAudio) {
        if (isPlaying) {
            currentAudio.pause();
            isPlaying = false;
        } else {
            currentAudio.play();
            isPlaying = true;
        }
        updatePlayButton();
    } else if (currentSource === 'youtube' && youtubePlayer) {
        if (isPlaying) {
            youtubePlayer.pauseVideo();
            isPlaying = false;
        } else {
            youtubePlayer.playVideo();
            isPlaying = true;
        }
        updatePlayButton();
    } else {
        // Se não tem nada tocando, toca a primeira da playlist
        playLocalTrack(0);
    }
}

function nextTrack() {
    if (currentSource === 'local') {
        currentTrackIndex = (currentTrackIndex + 1) % localPlaylist.length;
        playLocalTrack(currentTrackIndex);
    }
}

function previousTrack() {
    if (currentSource === 'local') {
        currentTrackIndex = (currentTrackIndex - 1 + localPlaylist.length) % localPlaylist.length;
        playLocalTrack(currentTrackIndex);
    }
}

function setVolume(value) {
    if (currentAudio) {
        currentAudio.volume = value;
    }
    if (youtubePlayer && youtubePlayer.setVolume) {
        youtubePlayer.setVolume(value * 100);
    }
}

function seekTrack(e) {
    if (!currentAudio) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * currentAudio.duration;
    
    currentAudio.currentTime = newTime;
}

// ==== ATUALIZAÇÕES DE UI ====
function updateTrackInfo(title, artist) {
    const titleEl = document.querySelector('.track-title');
    const artistEl = document.querySelector('.track-artist');
    
    if (titleEl) titleEl.textContent = title;
    if (artistEl) artistEl.textContent = artist;
}

function updatePlayButton() {
    const playBtn = document.querySelector('.play-pause');
    const musicToggleBtn = document.querySelector('.music-toggle-btn');
    
    if (playBtn) {
        const icon = playBtn.querySelector('i');
        if (icon) {
            icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
        }
    }
    
    if (musicToggleBtn) {
        if (isPlaying) {
            musicToggleBtn.classList.add('playing');
        } else {
            musicToggleBtn.classList.remove('playing');
        }
    }
}

function updateProgressBar() {
    if (!currentAudio) return;
    
    const progressBar = document.querySelector('.progress-bar');
    const currentTimeEl = document.querySelector('.current-time');
    const durationEl = document.querySelector('.duration');
    
    if (progressBar) {
        const percent = (currentAudio.currentTime / currentAudio.duration) * 100;
        progressBar.style.width = percent + '%';
    }
    
    if (currentTimeEl) {
        currentTimeEl.textContent = formatTime(currentAudio.currentTime);
    }
    
    if (durationEl) {
        durationEl.textContent = formatTime(currentAudio.duration);
    }
}

function updatePlaylistUI() {
    document.querySelectorAll('.playlist-item').forEach((item, index) => {
        if (index === currentTrackIndex && currentSource === 'local' && isPlaying) {
            item.classList.add('playing');
        } else {
            item.classList.remove('playing');
        }
    });
}

function showNowPlaying(title) {
    const nowPlaying = document.querySelector('.now-playing');
    if (nowPlaying) {
        nowPlaying.querySelector('span').textContent = title;
        nowPlaying.classList.add('show');
        
        setTimeout(() => {
            nowPlaying.classList.remove('show');
        }, 5000);
    }
}

function showNotification(message) {
    alert(message); // Simplificado - você pode melhorar com um toast
}

// ==== UTILITÁRIOS ====
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function stopAllPlayers() {
    // Parar áudio local
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    // Parar YouTube
    if (youtubePlayer && youtubePlayer.stopVideo) {
        youtubePlayer.stopVideo();
    }
    
    isPlaying = false;
    updatePlayButton();
}

// ==== SPOTIFY ====
function checkSpotifyAuth() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    if (params.has('access_token')) {
        spotifyToken = params.get('access_token');
        console.log('✅ Token Spotify obtido!');
        
        // Limpa URL
        window.history.replaceState(null, null, window.location.pathname);
        
        // Atualiza UI
        updateSpotifyUI(true);
        
        // Inicializa player
        initSpotifyPlayer();
    }
}

function loginSpotify() {
    const scopes = [
        'streaming',
        'user-read-email',
        'user-read-private',
        'user-read-playback-state',
        'user-modify-playback-state'
    ];
    
    const authUrl = `https://accounts.spotify.com/authorize?` +
        `client_id=${SPOTIFY_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&` +
        `scope=${encodeURIComponent(scopes.join(' '))}&` +
        `response_type=token&` +
        `show_dialog=true`;
    
    window.location.href = authUrl;
}

function initSpotifyPlayer() {
    // Carrega SDK do Spotify
    if (!window.Spotify) {
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        document.head.appendChild(script);
    }
    
    window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new Spotify.Player({
            name: 'Portfolio Player',
            getOAuthToken: cb => { cb(spotifyToken); },
            volume: 0.5
        });
        
        player.addListener('ready', ({ device_id }) => {
            console.log('✅ Spotify Player pronto!', device_id);
            spotifyDeviceId = device_id;
            updateSpotifyUI(true);
        });
        
        player.addListener('initialization_error', ({ message }) => {
            console.error('❌ Erro de inicialização:', message);
        });
        
        player.addListener('authentication_error', ({ message }) => {
            console.error('❌ Erro de autenticação:', message);
            spotifyToken = null;
            updateSpotifyUI(false);
        });
        
        player.connect();
    };
}

function updateSpotifyUI(isLoggedIn) {
    const authSection = document.querySelector('.auth-section');
    const spotifyContent = document.querySelector('.spotify-content');
    
    if (authSection && spotifyContent) {
        if (isLoggedIn) {
            authSection.style.display = 'none';
            spotifyContent.style.display = 'block';
        } else {
            authSection.style.display = 'block';
            spotifyContent.style.display = 'none';
        }
    }
}

function searchSpotify() {
    if (!spotifyToken) {
        showNotification('❌ Faça login no Spotify primeiro!');
        return;
    }
    
    const query = document.getElementById('spotify-search').value;
    if (!query) return;
    
    fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
        headers: {
            'Authorization': `Bearer ${spotifyToken}`
        }
    })
    .then(res => res.json())
    .then(data => {
        displaySpotifyResults(data.tracks.items);
    })
    .catch(err => {
        console.error('❌ Erro na busca:', err);
    });
}

function displaySpotifyResults(tracks) {
    const resultsContainer = document.querySelector('.spotify-results');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = '';
    
    tracks.forEach(track => {
        const item = document.createElement('div');
        item.className = 'result-item';
        item.innerHTML = `
            <img src="${track.album.images[2]?.url || ''}" alt="${track.name}">
            <div class="result-item-info">
                <p class="result-item-title">${track.name}</p>
                <p class="result-item-artist">${track.artists[0].name}</p>
            </div>
        `;
        
        item.addEventListener('click', () => playSpotifyTrack(track.uri));
        resultsContainer.appendChild(item);
    });
}

function playSpotifyTrack(uri) {
    if (!spotifyToken || !spotifyDeviceId) return;
    
    stopAllPlayers();
    
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${spotifyDeviceId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${spotifyToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            uris: [uri]
        })
    })
    .then(() => {
        currentSource = 'spotify';
        isPlaying = true;
        updatePlayButton();
    })
    .catch(err => {
        console.error('❌ Erro ao tocar:', err);
    });
}

// ==== YOUTUBE ====
function loadYouTubeAPI() {
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    }
}

// Define o callback globalmente apenas se ainda não existir
if (!window.onYouTubeIframeAPIReady) {
    window.onYouTubeIframeAPIReady = function() {
        console.log('✅ YouTube API carregada!');
    };
}

function searchYouTube() {
    const query = document.getElementById('youtube-search').value;
    if (!query) return;
    
    const url = `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&` +
        `maxResults=10&` +
        `q=${encodeURIComponent(query)}&` +
        `type=video&` +
        `key=${YOUTUBE_API_KEY}`;
    
    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                console.error('❌ Erro API YouTube:', data.error);
                showNotification('❌ Erro: ' + data.error.message);
                return;
            }
            if (data.items) {
                displayYouTubeResults(data.items);
            } else {
                showNotification('❌ Nenhum vídeo encontrado.');
            }
        })
        .catch(err => {
            console.error('❌ Erro na busca YouTube:', err);
            showNotification('❌ Erro ao buscar no YouTube');
        });
}

function displayYouTubeResults(videos) {
    const resultsContainer = document.getElementById('youtube-results');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = '';
    
    videos.forEach(video => {
        const item = document.createElement('div');
        item.className = 'result-item';
        item.innerHTML = `
            <img src="${video.snippet.thumbnails.default.url}" alt="${video.snippet.title}">
            <div class="result-item-info">
                <p class="result-item-title">${video.snippet.title}</p>
                <p class="result-item-artist">${video.snippet.channelTitle}</p>
            </div>
        `;
        
        item.addEventListener('click', () => playYouTubeVideo(video.id.videoId, video.snippet.title, video.snippet.channelTitle));
        resultsContainer.appendChild(item);
    });
}

function playYouTubeVideo(videoId, title, channel) {
    stopAllPlayers();
    
    // Se o player não existe, cria
    if (!youtubePlayer) {
        youtubePlayer = new YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: videoId,
            playerVars: {
                'autoplay': 1,
                'controls': 0,
                'disablekb': 1,
                'fs': 0,
                'iv_load_policy': 3,
                'modestbranding': 1,
                'playsinline': 1,
                'rel': 0,
                'showinfo': 0
            },
            events: {
                'onReady': (event) => {
                    // Garante volume inicial e desmuta
                    const volSlider = document.querySelector('.volume-slider');
                    const startVol = volSlider ? Number(volSlider.value) : 70;
                    
                    event.target.setVolume(startVol);
                    event.target.unMute();
                    event.target.playVideo();
                    
                    currentSource = 'youtube';
                    isPlaying = true;
                    updatePlayButton();
                    showNowPlaying(title);
                    updateYouTubeTabInfo(title, channel);
                },
                'onStateChange': (event) => {
                    if (event.data === YT.PlayerState.ENDED) {
                        isPlaying = false;
                        updatePlayButton();
                    } else if (event.data === YT.PlayerState.PLAYING) {
                        isPlaying = true;
                        updatePlayButton();
                    } else if (event.data === YT.PlayerState.PAUSED) {
                        isPlaying = false;
                        updatePlayButton();
                    }
                }
            }
        });
    } else {
        // Carrega novo vídeo
        youtubePlayer.loadVideoById(videoId);
        youtubePlayer.unMute(); // Garante que não está mudo
        
        // Sincroniza volume
        const volSlider = document.querySelector('.volume-slider');
        if (volSlider) {
             youtubePlayer.setVolume(Number(volSlider.value));
        }

        currentSource = 'youtube';
        isPlaying = true;
        updatePlayButton();
        showNowPlaying(title);
        updateYouTubeTabInfo(title, channel);
    }
}

function updateYouTubeTabInfo(title, channel) {
    const ytTitle = document.getElementById('youtube-track-title');
    const ytChannel = document.getElementById('youtube-track-channel');
    const ytCurrent = document.getElementById('youtube-current');

    if (ytTitle) ytTitle.textContent = title;
    if (ytChannel && channel) ytChannel.textContent = channel;
    if (ytCurrent) ytCurrent.style.display = 'block';
}

// ==== EXPORT ====
// Torna funções globais para botões inline
window.searchSpotify = searchSpotify;
window.searchYouTube = searchYouTube;

console.log('🎵 Music Player script carregado com sucesso!');
