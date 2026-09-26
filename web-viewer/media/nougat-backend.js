(() => {
  "use strict";

  const config = window.HANAFI_NOUGAT_MEDIA || {};

  function isXbox() {
    return /Xbox/i.test((window.navigator && window.navigator.userAgent) || "");
  }

  function normalizedBaseUrl() {
    const configured = isXbox() && typeof config.xboxBaseUrl === "string"
      ? config.xboxBaseUrl
      : config.baseUrl;
    const value = typeof configured === "string" ? configured.trim() : "";
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
    // Browser playback uses seekable MP4 delivery. Incompatible source files
    // are prepared once on saxondesktop into browser-compatible H.264/AAC MP4.
    mediaUrl: id => route("/nougat/v1/media", id),
    subtitleUrl: id => route("/nougat/v1/subtitle", id)
  });
})();
