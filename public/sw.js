// Service Worker de VecinoClaro — PWA para residentes
const CACHE_VERSION = "vecinoclaro-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;
const OFFLINE_URL = "/offline.html";

const APP_SHELL = [
  "/", "/manifest.json", "/logo-vecinoclaro.png",
  "/icon-192.png", "/icon-512.png", "/icon-192-maskable.png", "/icon-512-maskable.png",
  "/apple-touch-icon.png", "/favicon-32.png", "/favicon-16.png",
  "/vecinoclaro.apk", "/offline.html",
];

const CACHEABLE_API_PATTERNS = [
  /\/api\/bcv/, /\/api\/me$/, /\/api\/condominium$/, /\/api\/announcements/,
  /\/api\/invoices/, /\/api\/residents\/me$/, /\/api\/notifications/, /\/api\/polls/, /\/api\/directory/,
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()).catch(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.pathname.startsWith("/_next/webpack-hmr") || url.pathname.includes("chrome-extension") || (url.protocol !== "http:" && url.protocol !== "https:")) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then((response) => { const clone = response.clone(); caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone)); return response; }).catch(async () => { const cached = await caches.match(request); if (cached) return cached; const offline = await caches.match(OFFLINE_URL); return offline || caches.match("/"); }));
    return;
  }

  const isApiCacheable = CACHEABLE_API_PATTERNS.some((pattern) => pattern.test(url.pathname));
  if (url.pathname.startsWith("/api/") && isApiCacheable) {
    event.respondWith(fetch(request).then((response) => { if (response.ok) { const clone = response.clone(); caches.open(API_CACHE).then((cache) => cache.put(request, clone)); } return response; }).catch(() => caches.match(request)));
    return;
  }

  event.respondWith(caches.match(request).then((cached) => { if (cached) return cached; return fetch(request).then((response) => { if (response.ok && response.type === "basic") { const clone = response.clone(); caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone)); } return response; }).catch(() => cached); }));
});

self.addEventListener("message", (event) => { if (event.data === "SKIP_WAITING") self.skipWaiting(); });

self.addEventListener("push", (event) => {
  let payload = { title: "VecinoClaro", body: "Tienes una nueva notificación" };
  try { payload = event.data ? event.data.json() : payload; } catch { payload = { title: "VecinoClaro", body: event.data?.text() ?? payload.body }; }
  const options = { body: payload.body, icon: "/icon-192.png", badge: "/icon-192.png", vibrate: [100, 50, 100], data: payload.data || { url: "/" }, tag: payload.tag || "vecinoclaro-notification", requireInteraction: payload.requireInteraction || false };
  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => { for (const client of clients) { if (client.url.includes(targetUrl) && "focus" in client) return client.focus(); } if (clients.length > 0 && clients[0] && "focus" in clients[0]) { clients[0].navigate(targetUrl); return clients[0].focus(); } if (self.clients.openWindow) return self.clients.openWindow(targetUrl); }));
});
