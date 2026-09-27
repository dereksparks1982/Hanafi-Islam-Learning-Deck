const RELEASE = "v2.3";
const BUILD = "20260927staticdeck1";
const CACHE_PREFIX = "hanafi-deck-";
const SHELL_CACHE = `${CACHE_PREFIX}shell-${RELEASE}-${BUILD}`;
const CARD_CACHE = `${CACHE_PREFIX}cards-${RELEASE}`;
const ADHAN_LIBRARY_URL = "https://unpkg.com/adhan@4.4.6/lib/bundles/adhan.umd.min.js";

const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./ornate-buttons.css",
  "./city-picker.css",
  "./home-branding.css",
  "./mobile-background.css",
  "./home-app.js",
  "./secret-library-trigger.js",
  "./manifest.webmanifest",
  "./card-set-collapse.js",
  "./card-viewer.js",
  "./deck/",
  "./deck/index.html",
  "./deck/app.js",
  "./quran/",
  "./quran/index.html",
  "./quran/styles.css",
  "./quran/app.js",
  "./makkah/",
  "./makkah/index.html",
  "./makkah/styles.css",
  "./makkah/app.js",
  "./live/",
  "./live/index.html",
  "./media/",
  "./media/index.html",
  "./advanced-library/",
  "./advanced-library/index.html",
  "./explore/",
  "./explore/index.html",
  "./explore/styles.css",
  "./explore/app.js",
  "./links/",
  "./links/index.html",
  "./about/",
  "./about/index.html",
  "./legal/",
  "./legal/index.html",
  "./charity/",
  "./charity/index.html",
  "./assets/hanafi-learning-deck-icon-approved.png",
  "./assets/hanafi-home-background-approved.png",
  "./assets/hanafi-secret-library-lock-approved.png",
  "./assets/hanafi-secret-library-five-slot-row.avif"
];

function sameOriginKey(input) {
  const url = new URL(input, self.registration.scope);
  if (url.origin !== self.location.origin) return new Request(url.href);
  url.search = "";
  url.hash = "";
  return new Request(url.href);
}

async function fetchFresh(input) {
  return fetch(input, {
    cache: "no-store",
    credentials: "same-origin",
    redirect: "follow"
  });
}

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    for (const path of SHELL) {
      try {
        const url = new URL(path, self.registration.scope).href;
        const response = await fetchFresh(url);
        if (response.ok) await cache.put(sameOriginKey(url), response.clone());
      } catch (error) {
        console.warn("Shell preload skipped:", path, error);
      }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter(name => name.startsWith(CACHE_PREFIX) && name !== SHELL_CACHE && name !== CARD_CACHE)
        .map(name => caches.delete(name))
    );
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.disable(); } catch {}
    }
    await self.clients.claim();
  })());
});

function absoluteCardUrl(url) {
  return new URL(url, self.registration.scope).href;
}

async function countCached(urls) {
  const cache = await caches.open(CARD_CACHE);
  let cached = 0;
  for (const url of urls) {
    if (await cache.match(absoluteCardUrl(url))) cached += 1;
  }
  return cached;
}

async function tellClient(source, message) {
  if (source && "postMessage" in source) {
    source.postMessage(message);
    return;
  }
  const clients = await self.clients.matchAll({ type:"window", includeUncontrolled:true });
  clients.forEach(client => client.postMessage(message));
}

async function cacheCards(urls, source, mode = "download") {
  const cache = await caches.open(CARD_CACHE);
  let nextIndex = 0;
  let done = 0;
  let failed = 0;
  const force = mode === "refresh";

  async function worker() {
    while (true) {
      const index = nextIndex++;
      if (index >= urls.length) return;
      const requestUrl = absoluteCardUrl(urls[index]);
      try {
        const existing = await cache.match(requestUrl);
        if (force || !existing) {
          const response = await fetch(requestUrl, { cache:"reload" });
          if (!response.ok) throw new Error(`${response.status} ${requestUrl}`);
          await cache.put(requestUrl, response.clone());
        }
      } catch (error) {
        failed += 1;
        console.error("Offline card cache failed:", error);
      }
      done += 1;
      await tellClient(source, { type:"CACHE_PROGRESS", mode, done, total:urls.length, failed, release:RELEASE });
    }
  }

  await Promise.all(Array.from({ length:Math.min(4, urls.length) }, () => worker()));
  const cached = await countCached(urls);
  await tellClient(source, { type:"CACHE_COMPLETE", mode, cached, total:urls.length, failed, release:RELEASE });
}

self.addEventListener("message", event => {
  const data = event.data || {};
  if (data.release && data.release !== RELEASE) return;

  if (data.type === "CACHE_CARDS" && Array.isArray(data.urls)) {
    event.waitUntil(cacheCards(data.urls, event.source, "download"));
  }
  if (data.type === "REFRESH_CARDS" && Array.isArray(data.urls)) {
    event.waitUntil(cacheCards(data.urls, event.source, "refresh"));
  }
  if (data.type === "CACHE_STATUS" && Array.isArray(data.urls)) {
    event.waitUntil((async () => {
      const cached = await countCached(data.urls);
      await tellClient(event.source, {
        type:"CACHE_STATUS",
        cached,
        total:data.urls.length,
        complete:cached >= data.urls.length,
        release:RELEASE
      });
    })());
  }
});

async function navigationFallback(url) {
  const cache = await caches.open(SHELL_CACHE);
  const exact = await cache.match(sameOriginKey(url.href));
  if (exact) return exact;

  const home = await cache.match(sameOriginKey(new URL("./index.html", self.registration.scope).href));
  return home || Response.error();
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  if (url.href === ADHAN_LIBRARY_URL) {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL_CACHE);
      const cached = await cache.match(event.request);
      try {
        const response = await fetch(event.request, { cache:"reload" });
        if (response.ok) await cache.put(event.request, response.clone());
        return response;
      } catch {
        return cached || Response.error();
      }
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL_CACHE);
      const key = sameOriginKey(event.request.url);
      try {
        const response = await fetchFresh(event.request);
        if (!response.ok) throw new Error(`Navigation fetch failed: ${response.status}`);
        await cache.put(key, response.clone());
        return response;
      } catch {
        return navigationFallback(url);
      }
    })());
    return;
  }

  if (/\.(?:png|svg|avif|webp|jpg|jpeg)$/i.test(url.pathname)) {
    event.respondWith((async () => {
      const cardCache = await caches.open(CARD_CACHE);
      const shellCache = await caches.open(SHELL_CACHE);
      try {
        const response = await fetch(event.request, { cache:"reload" });
        if (response.ok) {
          const target = /\/cards\/|Expansion\//i.test(url.pathname) ? cardCache : shellCache;
          await target.put(event.request, response.clone());
        }
        return response;
      } catch {
        return (await cardCache.match(event.request)) || (await shellCache.match(sameOriginKey(event.request.url))) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(SHELL_CACHE);
    const key = sameOriginKey(event.request.url);
    try {
      const response = await fetchFresh(event.request);
      if (response.ok) await cache.put(key, response.clone());
      return response;
    } catch {
      return (await cache.match(key)) || Response.error();
    }
  })());
});
