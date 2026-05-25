const CACHE_NAME = "ayas-design-v1";
const assets = ["/", "/index.html", "/style.css", "/app.js"];

// Քեշավորում ենք հիմնական ֆայլերը
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assets);
    })
  );
});

// Աշխատեցնում ենք կայքը քեշից, երբ ինտերնետ չկա
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});
