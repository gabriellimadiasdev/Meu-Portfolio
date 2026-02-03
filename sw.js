const CACHE_NAME = 'gabriel-portfolio-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './src/css/reset.css',
  './src/css/vendor.css',
  './src/css/style.css',
  './src/js/modernizr.js',
  './src/js/jquery-1.11.0.min.js',
  './src/js/plugins.js',
  './src/js/script.js',
  './src/js/music-player.js',
  './src/js/cyberpunk-bg.js',
  './src/js/chatbot.js',
  './src/js/translator.js',
  './src/js/admin.js',
  // Recursos externos essenciais (Bootstrap/FontAwesome)
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js'
];

// Instalação: Cacheia os arquivos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 [PWA] Cacheando arquivos do app...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Requisição: Serve do cache se estiver offline ou carrega da rede
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna do cache se existir, senão busca na rede
        return response || fetch(event.request);
      })
  );
});