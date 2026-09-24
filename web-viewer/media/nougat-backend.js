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

  window.HanafiNougatBackend = Object.freeze({
    enabled,
    healthUrl: () => route("/nougat/v1/health"),
    catalogUrl: () => route("/nougat/v1/catalog"),
    // Browser playback uses seekable MP4 delivery. Incompatible source files
    // are prepared once on saxondesktop into browser-compatible H.264/AAC MP4.
    mediaUrl: id => route("/nougat/v1/media", id),
    subtitleUrl: id => route("/nougat/v1/subtitle", id)
  });
})();
