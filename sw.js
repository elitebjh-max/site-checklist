/* ?ㅽ봽?쇱씤 吏???쒕퉬?ㅼ썙而???https 濡?諛고룷?덉쓣 ?뚮쭔 ?ъ슜??   ?ㅽ듃?뚰겕 ?곗꽑(理쒖떊 踰꾩쟾 諛섏쁺) + 3珥??덉뿉 ?묐떟 ?놁쑝硫?罹먯떆 ?ъ슜(吏?섏링 ???듭떊 遺덇? 援ъ뿭) */
const CACHE = 'wrsc-v3';
const FILES = ['index.html', 'site_checklist.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const net = fetch(req).then(res => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    });
    const timeout = new Promise(r => setTimeout(r, 3000));
    try {
      const res = await Promise.race([net, timeout]);
      if (res) return res;
    } catch(err) {}
    const hit = await cache.match(req, {ignoreSearch: true});
    return hit || net;
  })());
});
