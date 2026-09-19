/**
 * Service worker for the telepastoring PWA.
 *
 * Strategy:
 * - Navigations: network-first, falling back to the cached page so the app
 *   still opens offline. Auth pages are never cached — a stale login screen
 *   is worse than an offline error.
 * - /_next/static: cache-first. In a production build these URLs are
 *   content-hashed, so a cached hit is always correct. (The worker is not
 *   registered in development, where they are not.)
 * - Icons and the manifest: stale-while-revalidate. Their URLs never change,
 *   so cache-first would freeze them at whatever version was seen first.
 * - Everything else (API, Server Actions): network only — pastoral-care data
 *   must never be served stale from a cache.
 */
// Bump on any change to caching behaviour: activate() deletes every cache
// that doesn't carry the current version.
const VERSION = "v3";
const SHELL_CACHE = `shell-${VERSION}`;
const STATIC_CACHE = `static-${VERSION}`;
/**
 * The offline page is a Next page: its HTML alone is not enough, because it
 * hydrates, and if its JS chunks aren't cached the app swaps it for Next's
 * "This page couldn't load" screen. So cache the HTML *and* every build asset
 * it references. A later deploy keeps working: the old HTML still points at the
 * old chunks, which stay in the static cache alongside it.
 */
async function precacheOfflinePage() {
  const response = await fetch("/offline", { cache: "reload" });
  if (!response.ok || response.redirected) return;

  const shell = await caches.open(SHELL_CACHE);
  await shell.put("/offline", response.clone());

  const html = await response.text();
  const assets = new Set(html.match(/\/_next\/static\/[^"'\s)\\]+/g) ?? []);
  const staticCache = await caches.open(STATIC_CACHE);
  await Promise.all(
    [...assets].map((url) => staticCache.add(url).catch(() => {})),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheOfflinePage().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== STATIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Never touch auth or data endpoints.
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Same-origin navigations are cached so the app opens offline.
          if (
            response.ok &&
            !response.redirected &&
            !url.pathname.startsWith("/admin")
          ) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offline = await caches.match("/offline");
          return (
            offline ??
            new Response("You are offline.", {
              status: 503,
              headers: { "Content-Type": "text/plain" },
            })
          );
        }),
    );
    return;
  }

  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const fresh = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached ?? fresh;
      }),
    );
    return;
  }

  // Cache-first for content-hashed build output.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
