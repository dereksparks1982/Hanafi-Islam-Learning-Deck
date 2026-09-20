const SHELL_CACHE = "hanafi-deck-shell-20260920a";
const CARD_CACHE = "hanafi-deck-cards-20260920a";
const SHELL = ["./", "./index.html", "./styles.css", "./app.js", "./manifest.webmanifest", "./icon.svg", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keep = new Set([SHELL_CACHE, CARD_CACHE]);
    const names = await caches.keys();
    await Promise.all(names.filter(name => !keep.has(name)).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

function absoluteCardUrl(url) {
  return new URL(url, self.location.href).href;
}

async function countCached(urls) {
  const cache = await caches.open(CARD_CACHE);
  let cached = 0;
  for (const url of urls) {
    if (await cache.match(absoluteCardUrl(url), { ignoreSearch: true })) cached += 1;
  }
  return cached;
}

async function tellClient(source, message) {
  if (source && "postMessage" in source) {
    source.postMessage(message);
    return;
  }
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  clients.forEach(client => client.postMessage(message));
}

async function cacheCards(urls, source) {
  const cache = await caches.open(CARD_CACHE);
  let nextIndex = 0;
  let done = 0;
  let failed = 0;

  async function worker() {
    while (true) {
      const index = nextIndex++;
      if (index >= urls.length) return;
      const requestUrl = absoluteCardUrl(urls[index]);
      try {
        const existing = await cache.match(requestUrl, { ignoreSearch: true });
        if (!existing) {
          const response = await fetch(requestUrl, { cache: "reload" });
          if (!response.ok) throw new Error(`${response.status} ${requestUrl}`);
          await cache.put(requestUrl, response.clone());
        }
      } catch (error) {
        failed += 1;
        console.error("Offline card cache failed:", error);
      }
      done += 1;
      await tellClient(source, { type: "CACHE_PROGRESS", done, total: urls.length, failed });
    }
  }

  await Promise.all(Array.from({ length: Math.min(4, urls.length) }, () => worker()));
  const cached = await countCached(urls);
  await tellClient(source, { type: "CACHE_COMPLETE", cached, total: urls.length, failed });
}

self.addEventListener("message", event => {
  const data = event.data || {};
  if (data.type === "CACHE_CARDS" && Array.isArray(data.urls)) {
    event.waitUntil(cacheCards(data.urls, event.source));
  }
  if (data.type === "CACHE_STATUS" && Array.isArray(data.urls)) {
    event.waitUntil((async () => {
      const cached = await countCached(data.urls);
      await tellClient(event.source, {
        type: "CACHE_STATUS",
        cached,
        total: data.urls.length,
        complete: cached >= data.urls.length
      });
    })());
  }
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const network = await fetch(event.request);
        const cache = await caches.open(SHELL_CACHE);
        cache.put("./index.html", network.clone());
        return network;
      } catch {
        return (await caches.match("./index.html")) || (await caches.match("./"));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok && /\.(?:png|svg|css|js|webmanifest)$/i.test(url.pathname)) {
        const target = /\.png$/i.test(url.pathname) ? CARD_CACHE : SHELL_CACHE;
        const cache = await caches.open(target);
        cache.put(event.request, response.clone());
      }
      return response;
    } catch {
      return Response.error();
    }
  })());
});
