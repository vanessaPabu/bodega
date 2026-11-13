/*
 * Guarda la app en el equipo para que abra sin señal.
 * - La página, los scripts y las librerías (código de barras, Excel) se guardan al instalar.
 * - Con señal siempre se trae la versión nueva; sin señal se usa la guardada.
 * - Los datos (Supabase) no pasan por aquí: los maneja la app (src/offline.js).
 */
const VERSION = 'bodega-v3';
const BASE = self.registration.scope;

async function guardarTodo() {
  const cache = await caches.open(VERSION);
  const urls = new Set([BASE, BASE + 'cliente.js', BASE + 'manifest.webmanifest', BASE + 'icono-192.png', BASE + 'icono-512.png']);
  try {
    // Lee la página para guardar también sus scripts, estilos y librerías
    const html = await (await fetch(BASE, { cache: 'no-store' })).text();
    for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      const u = new URL(m[1], BASE);
      if (/\.(js|css|png|svg|webmanifest|woff2?)(\?|$)/.test(u.pathname) || u.hostname.includes('fonts.googleapis.com')) urls.add(u.href);
    }
  } catch (e) { /* sin señal al instalar: se guarda lo que se pueda después */ }
  await Promise.all([...urls].map(u => cache.add(new Request(u, { mode: new URL(u).origin === location.origin ? 'same-origin' : 'no-cors' })).catch(() => {})));
}

self.addEventListener('install', ev => { ev.waitUntil(guardarTodo().then(() => self.skipWaiting())); });

self.addEventListener('activate', ev => {
  ev.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

// Primero internet (con límite de tiempo); si no hay, lo guardado
async function redPrimero(req, espera) {
  const cache = await caches.open(VERSION);
  try {
    const res = await Promise.race([
      // no-cache: siempre le pregunta al servidor si hay versión nueva (si no cambió, igual es rápido)
      fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }),
      new Promise((_, mal) => setTimeout(() => mal(new Error('lento')), espera))
    ]);
    if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
    return res;
  } catch (e) {
    const g = await cache.match(req, { ignoreSearch: true });
    if (g) return g;
    if (req.mode === 'navigate') { const p = await cache.match(BASE); if (p) return p; }
    throw e;
  }
}

// Lo que nunca cambia (archivos con huella, librerías con versión): lo guardado primero
async function guardadoPrimero(req) {
  const cache = await caches.open(VERSION);
  const g = await cache.match(req);
  if (g) return g;
  const res = await fetch(req);
  if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
  return res;
}

self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.hostname.endsWith('supabase.co') || u.hostname.endsWith('supabase.in')) return; // datos: los maneja la app
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return;

  if (req.mode === 'navigate') return ev.respondWith(redPrimero(req, 4000));
  if (u.origin === location.origin) {
    if (u.pathname.includes('/assets/')) return ev.respondWith(guardadoPrimero(req));
    return ev.respondWith(redPrimero(req, 4000));
  }
  if (/cdn\.jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(u.hostname)) {
    return ev.respondWith(guardadoPrimero(req));
  }
});