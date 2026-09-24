(() => {
  "use strict";

  const trigger = document.querySelector(".home-brand-icon");
  if (!trigger) return;

  const REQUIRED_ACTIVATIONS = 7;
  const RESET_AFTER_MS = 8000;
  let count = 0;
  let resetTimer = null;

  const reset = () => {
    count = 0;
    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }
  };

  trigger.addEventListener("click", () => {
    count += 1;

    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(reset, RESET_AFTER_MS);

    if (count >= REQUIRED_ACTIVATIONS) {
      reset();
      window.location.assign("advanced-library/");
    }
  });
})();
