(() => {
  "use strict";

  // The live site stays on its existing backend until an HTTPS Nougat Media
  // Core hostname is deployed and verified. At migration time, set enabled to
  // true and replace the empty baseUrl with that HTTPS origin.
  window.HANAFI_NOUGAT_MEDIA = Object.freeze({
    enabled: false,
    baseUrl: ""
  });
})();
