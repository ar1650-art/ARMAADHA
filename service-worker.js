const CACHE_NAME = "b-arch-class-fund-shell-v1";
const APP_SHELL = ["./", "./index.html", "./config.js", "./manifest.webmanifest"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  // Never cache Apps Script API requests or non-GET requests (payments/expenses).
  if (event.request.method !== "GET" || url.hostname.includes("google.com") || url.hostname.includes("googleusercontent.com")) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
