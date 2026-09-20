/* سرویس‌ورکر ساده: صفحه و آیکن‌ها را کش می‌کند تا برنامه بدون اینترنت هم باز شود.
   داده‌های زنده (قیمت/خبر/هوا) هرگز از این کش خوانده نمی‌شوند؛ فقط پوسته‌ی صفحه. */
const CACHE = 'sabhad-shell-v1';
const SHELL = [
  './',
  './sabhad.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // فقط فایل‌های خودمان؛ درخواست‌های قیمت/خبر/هوا دست‌نخورده می‌مانند
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
