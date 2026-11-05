// Service Worker — Game Daman
// Menyimpan semua aset secara lokal agar game berjalan 100% offline

const CACHE_NAME = 'daman-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './game.js',
    './style.css',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

// Install: simpan semua aset ke cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate: hapus cache lama jika ada versi baru
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch: selalu ambil dari cache dulu (offline-first)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request);
        })
    );
});

