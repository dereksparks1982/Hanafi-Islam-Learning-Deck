(() => {
  "use strict";

  const config = window.HANAFI_NOUGAT_MEDIA || {};

  function normalizedBaseUrl() {
    const value = typeof config.baseUrl === "string" ? config.baseUrl.trim() : "";
    return value.replace(/\/+$/, "");
  }

  function enabled() {
    return config.enabled === true && /^https:\/\//i.test(normalizedBaseUrl());
  }

  function route(path, id) {
    const base = normalizedBaseUrl();
    if (!base) return "";
    const query = id ? `?id=${encodeURIComponent(id)}` : "";
    return `${base}${path}${query}`;
  }

  function runtimeLabel(seconds) {
    const n = Number(seconds) || 0;
    if (!n) return "";
    const hours = Math.floor(n / 3600);
    const minutes = Math.round((n % 3600) / 60);
    return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  async function publicCatalog() {
    if (!enabled()) return [];
    const response = await fetch(route("/nougat/v1/catalog"), { cache: "no-store" });
    if (!response.ok) throw new Error(`Media catalog ${response.status}`);
    const payload = await response.json();
    return Array.isArray(payload.items) ? payload.items : [];
  }

  window.HanafiPrivateNougatBackend = Object.freeze({
    enabled,
    healthUrl: () => route("/nougat/v1/health"),
    catalogUrl: () => route("/nougat/v1/private/catalog"),
    mediaUrl: id => route("/nougat/v1/private/media", id),
    subtitleUrl: id => route("/nougat/v1/private/subtitle", id)
  });

  window.HanafiNougatBackend = Object.freeze({
    enabled,
    healthUrl: () => route("/nougat/v1/health"),
    catalogUrl: () => route("/nougat/v1/catalog"),
    mediaUrl: id => route("/nougat/v1/media", id),
    subtitleUrl: id => route("/nougat/v1/subtitle", id),
    posterUrl: id => route("/nougat/v1/poster", id),
    publicCatalog
  });

  const params = new URLSearchParams(window.location.search);
  const dynamicMedia = params.get("media");
  const privateMedia = params.get("private") === "1";

  if (!privateMedia) {
    document.addEventListener("DOMContentLoaded", async () => {
      const panel = document.getElementById("editionPanel");
      if (dynamicMedia && panel) panel.hidden = true;
      if (!enabled()) return;
      try {
        const select = document.getElementById("mediaSelect");
        const mediaId = dynamicMedia || select?.value || "";
        if (!mediaId) return;
        const items = await publicCatalog();
        const item = items.find(x => x.id === mediaId);
        if (!item) return;

        const displayTitle = item.year ? `${item.title} (${item.year})` : (item.title || "Movie");
        const title = document.getElementById("title");
        const synopsis = document.getElementById("synopsis");
        const details = document.getElementById("details");
        const facts = document.getElementById("facts");

        if (dynamicMedia && title) title.textContent = displayTitle;
        if (dynamicMedia) document.title = `${displayTitle} · Hanafi Learning Deck`;
        if (synopsis && item.overview && !synopsis.textContent.trim()) synopsis.textContent = item.overview;

        const factValues = [];
        if (item.year) factValues.push(String(item.year));
        const runtime = runtimeLabel(item.runtimeSeconds);
        if (runtime) factValues.push(runtime);
        if (item.originalTitle && item.originalTitle !== item.title) factValues.push(item.originalTitle);
        if (facts && factValues.length && (dynamicMedia || facts.children.length <= 1)) {
          facts.replaceChildren(...factValues.map(value => {
            const span = document.createElement("span");
            span.className = "fact";
            span.textContent = value;
            return span;
          }));
        }

        if (details && !details.textContent.trim()) {
          const ids = item.providerIds && typeof item.providerIds === "object"
            ? Object.entries(item.providerIds).filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`)
            : [];
          const parts = [];
          if (item.originalTitle && item.originalTitle !== item.title) parts.push(`Original title: ${item.originalTitle}.`);
          if (runtime) parts.push(`Runtime: ${runtime}.`);
          if (ids.length) parts.push(`Provider IDs: ${ids.join(" · ")}.`);
          if (parts.length) details.textContent = parts.join(" ");
        }
      } catch (error) {
        console.warn("Automatic movie metadata unavailable:", error);
      }
    }, { once: true });
  }
})();
