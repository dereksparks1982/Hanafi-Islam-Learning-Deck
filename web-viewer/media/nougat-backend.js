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
    // Force Nougat's FFmpeg compatibility path so source-container or codec
    // differences never reach the browser. The bridge outputs H.264/AAC MP4.
    mediaUrl: id => route("/nougat/v1/transcode", id),
    subtitleUrl: id => route("/nougat/v1/subtitle", id)
  });
})();
