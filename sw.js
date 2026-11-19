const CACHE = "oracao-v7";
const FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, {cache: "reload"})))));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Sempre tenta a versão mais nova da internet (sem cache do navegador); sem internet, usa a cópia guardada.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const same = new URL(req.url).origin === self.location.origin;
  const net = same ? fetch(req, {cache: "no-cache"}) : fetch(req);
  e.respondWith(net.then(r => { if (r && (r.ok || r.type === "opaque")) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })
    .catch(() => caches.match(req).then(r => r || caches.match("./index.html"))));
});
