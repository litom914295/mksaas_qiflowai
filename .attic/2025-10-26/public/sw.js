self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // 仅缓存GET请求
  if (req.method !== 'GET') return;

  event.respondWith(
    (async () => {
      try {
        const network = await fetch(req);
        return network;
      } catch {
        // 网络失败时可返回空响应或离线页（可扩展）
        return new Response('', { status: 200 });
      }
    })()
  );
});
