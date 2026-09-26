const RELEASE = "v2.3";
const CACHE_PREFIX = "hanafi-deck-";
const SHELL_REV = "20260925-private-media-match-1";
const SHELL_CACHE = `${CACHE_PREFIX}shell-${RELEASE}-${SHELL_REV}`;
const CARD_CACHE = `${CACHE_PREFIX}cards-${RELEASE}`;
const ADHAN_LIBRARY_URL = "https://unpkg.com/adhan@4.4.6/lib/bundles/adhan.umd.min.js";
const SHELL = [
  "./",
  `./index.html?release=${RELEASE}`,
  `./styles.css?release=${RELEASE}`,
  `./mobile-background.css?rev=20260923mobile2`,
  `./app.js?release=${RELEASE}`,
  `./card-viewer.js?release=${RELEASE}`,
  `./secret-library-trigger.js?rev=20260924b`,
  `./manifest.webmanifest?release=${RELEASE}`,
  `./assets/hanafi-learning-deck-icon-approved.png?rev=20260923a`,
  `./quran/index.html?release=${RELEASE}`,
  `./quran/styles.css?release=${RELEASE}`,
  `./quran/app.js?release=${RELEASE}`,
  `./quran/data/page-001.json?release=${RELEASE}`,
  `./makkah/index.html?release=${RELEASE}`,
  `./makkah/styles.css?release=${RELEASE}`,
  `./makkah/app.js?release=${RELEASE}`,
  `./live/index.html?release=${RELEASE}`,
  `./media/index.html?release=${RELEASE}`,
  `./advanced-library/index.html?release=${RELEASE}&rev=${SHELL_REV}`,
  `./explore/index.html?release=${RELEASE}`,
  `./explore/styles.css?release=${RELEASE}`,
  `./explore/app.js?release=${RELEASE}`,
  `./about/index.html?release=${RELEASE}`,
  `./legal/index.html?release=${RELEASE}`,
  `./charity/index.html?release=${RELEASE}`
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await cache.addAll(SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keep = new Set([SHELL_CACHE, CARD_CACHE]);
    const names = await caches.keys();
    await Promise.all(
      names
        .filter(name => name.startsWith(CACHE_PREFIX) && !keep.has(name))
        .map(name => caches.delete(name))
    );
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

async function fetchFresh(requestUrl) {
  return fetch(requestUrl, { cache:"reload" });
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
          const response = await fetchFresh(requestUrl);
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

async function offlineNavigationFallback(url) {
  const routes = [
    ["quran", `./quran/index.html?release=${RELEASE}`],
    ["makkah", `./makkah/index.html?release=${RELEASE}`],
    ["live", `./live/index.html?release=${RELEASE}`],
    ["media", `./media/index.html?release=${RELEASE}`],
    ["explore", `./explore/index.html?release=${RELEASE}`],
    ["about", `./about/index.html?release=${RELEASE}`],
    ["legal", `./legal/index.html?release=${RELEASE}`],
    ["charity", `./charity/index.html?release=${RELEASE}`]
  ];

  for (const [route, cachedPath] of routes) {
    if (url.pathname.endsWith(`/${route}/`) || url.pathname.endsWith(`/${route}/index.html`)) {
      return (await caches.match(cachedPath)) ||
        (await caches.match(`./index.html?release=${RELEASE}`)) ||
        (await caches.match("./"));
    }
  }

  return (await caches.match(`./index.html?release=${RELEASE}`)) || (await caches.match("./"));
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  if (url.href === ADHAN_LIBRARY_URL) {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL_CACHE);
      const cached = await cache.match(event.request);
      try {
        const response = await fetch(event.request, { cache:"no-cache" });
        if (response.ok) await cache.put(event.request, response.clone());
        return response;
      } catch {
        return cached || Response.error();
      }
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;

  /* Mobile background CSS is always network-first so installed iOS/Android apps
     wait for the current framing rules instead of painting an older cached copy. */
  if (url.pathname.endsWith("/mobile-background.css")) {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL_CACHE);
      try {
        const response = await fetch(event.request, { cache:"no-cache" });
        if (response.ok) await cache.put(event.request, response.clone());
        return response;
      } catch {
        return (await cache.match(event.request)) || Response.error();
      }
    })());
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        return await fetch(event.request, { cache:"no-cache" });
      } catch {
        return offlineNavigationFallback(url);
      }
    })());
    return;
  }

  if (/\.png$/i.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CARD_CACHE);
      try {
        const response = await fetch(event.request, { cache:"reload" });
        if (response.ok) await cache.put(event.request, response.clone());
        return response;
      } catch {
        return (await cache.match(event.request)) || Response.error();
      }
    })());
    return;
  }

  /* App shell assets are network-first. Cache is fallback only, never first paint. */
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    try {
      const response = await fetch(event.request, { cache:"no-cache" });
      if (response.ok && /\.(?:svg|css|js|json|webmanifest)$/i.test(url.pathname)) {
        const cache = await caches.open(SHELL_CACHE);
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch {
      return cached || Response.error();
    }
  })());
});