/* 오프라인 지원 서비스워커 — https 로 배포했을 때만 사용됨
   네트워크 우선(최신 버전 반영) + 3초 안에 응답 없으면 캐시 사용(지하층 등 통신 불가 구역) */
const CACHE = 'wrsc-v1';
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
