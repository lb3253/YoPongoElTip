// Offline support for Yo Pongo El Tip.
// Saves the app's files on the phone the first time it opens, so it keeps
// working with no signal. Change CACHE_NAME whenever you release a new version
// so phones pick up the new files.
const CACHE_NAME = 'el-tip-v1.3.0';

const FILES = [
    './',
    './index.html',
    './manifest.json',
    './logo.webp',
    './marg.webp',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES))
            .then(() => self.skipWaiting())
    );
});

// Remove files saved by older versions
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(names => Promise.all(
                names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

// Show the saved copy right away, and quietly refresh it in the background
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    if (new URL(event.request.url).origin !== self.location.origin) return;

    event.respondWith(
        caches.open(CACHE_NAME).then(cache =>
            cache.match(event.request, { ignoreSearch: true }).then(cached => {
                const fresh = fetch(event.request)
                    .then(response => {
                        if (response.ok) cache.put(event.request, response.clone());
                        return response;
                    })
                    .catch(() => cached);
                return cached || fresh;
            })
        )
    );
});
