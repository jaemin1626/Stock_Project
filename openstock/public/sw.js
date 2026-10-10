const CACHE = 'openstock-shell-v1';
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['/analysis-offline.html', '/analysis-icon.svg']))); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('openstock-shell-') && key !== CACHE).map(key => caches.delete(key))))); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== 'GET' || event.request.mode !== 'navigate' || !/^\/(themes|flows|etfs|company)(\/|$)/.test(url.pathname)) return;
  event.respondWith(fetch(event.request).catch(() => caches.match('/analysis-offline.html')));
});
