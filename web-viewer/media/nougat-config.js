(() => {
  "use strict";

  // Direct self-hosted media gateway on saxondesktop.
  // The Hanafi web player keeps the public UI; Nougat's integrated Jellyfin
  // backend provides the media stream from the owner's local library.
  window.HANAFI_NOUGAT_MEDIA = Object.freeze({
    enabled: true,
    baseUrl: "https://97.201.65.144"
  });
})();
