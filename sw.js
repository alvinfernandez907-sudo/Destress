const CACHE_NAME = "pos-cache-v1";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// ── Install: cache static assets ──────────────────────────────────────────────
self.addEventListener("install", function (event) {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ── Activate: clean up old caches ─────────────────────────────────────────────
self.addEventListener("activate", function (event) {
  console.log("[SW] Activated.");
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// ── Fetch: network-first for Firebase, cache-first for static ─────────────────
self.addEventListener("fetch", function (event) {
  var url = event.request.url;

  // Always let Firebase/Google requests go straight to network — never cache them
  if (
    url.indexOf("firebase") !== -1 ||
    url.indexOf("firestore") !== -1 ||
    url.indexOf("googleapis") !== -1 ||
    url.indexOf("gstatic") !== -1 ||
    url.indexOf("firebaseapp") !== -1 ||
    url.indexOf("cloudfunctions") !== -1
  ) {
    return; // pass through, no interception
  }

  // For everything else: try network first, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then(function (networkResponse) {
        // Update cache with fresh response
        var responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(function () {
        // Network failed — serve from cache
        return caches.match(event.request).then(function (cached) {
          return cached || new Response("Offline — please check your connection.", {
            status: 503,
            headers: { "Content-Type": "text/plain" }
          });
        });
      })
  );
});