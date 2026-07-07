const CACHE_NAME = 'room-console-github-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache the live schedule data, the GitHub API, or any non-GET request —
  // always go straight to the network so the app is never stuck showing stale data.
  const isLiveData = url.pathname.endsWith('data/schedule.json');
  const isGitHubApi = url.hostname === 'api.github.com';
  if (isLiveData || isGitHubApi || event.request.method !== 'GET') {
    event.respondWith(
      fetch(event.request).catch(() => new Response(
        JSON.stringify({ headers: [], rows: [], updatedAt: null }),
        { headers: { 'Content-Type': 'application/json' } }
      ))
    );
    return;
  }

  // App shell (HTML/CSS/JS/icons): cache-first, refresh cache in background.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(()=>{});
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
