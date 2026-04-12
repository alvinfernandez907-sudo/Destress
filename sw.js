self.addEventListener("install", function (event) {
  console.log("Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  console.log("Service Worker activated");
  event.waitUntil(self.clients.claim());
});

// No caching yet.
// Do not intercept Firebase / Firestore / Auth / Google requests.
self.addEventListener("fetch", function (event) {
  var url = event.request.url;

  if (
    url.indexOf("firebase") !== -1 ||
    url.indexOf("firestore") !== -1 ||
    url.indexOf("googleapis") !== -1 ||
    url.indexOf("gstatic") !== -1
  ) {
    return;
  }

  return;
});