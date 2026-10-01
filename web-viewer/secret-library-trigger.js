(() => {
  "use strict";

  const actions = document.querySelector(".actions");
  if (actions) {
    const actionLinks = Array.from(actions.querySelectorAll("a.action-link"));
    const legalLink = actionLinks.find(link => link.textContent.trim() === "Legal");
    if (legalLink) legalLink.href = "legal/";

    const existingMajlis = actionLinks.find(link => link.textContent.trim() === "Majlis");
    if (!existingMajlis) {
      const majlisLink = document.createElement("a");
      majlisLink.className = "secondary action-link";
      majlisLink.href = "https://dereksparks1982.github.io/folkhold/?from=hanafi#square";
      majlisLink.textContent = "Majlis";
      majlisLink.setAttribute("aria-label", "Open Majlis in Folkhold");
      const mediaLink = actionLinks.find(link => link.textContent.trim() === "Media");
      if (mediaLink) mediaLink.insertAdjacentElement("afterend", majlisLink);
      else actions.insertBefore(majlisLink, actions.querySelector("button") || null);
    }

    const existingCharity = actionLinks.find(link => link.textContent.trim() === "Charity");
    if (!existingCharity) {
      const charityLink = document.createElement("a");
      charityLink.className = "secondary action-link";
      charityLink.href = "charity/";
      charityLink.textContent = "Charity";
      const aboutLink = actionLinks.find(link => link.textContent.trim() === "About");
      actions.insertBefore(charityLink, aboutLink || actions.querySelector("button") || null);
    }
  }

  const trigger = document.querySelector(".home-brand-icon");
  if (!trigger) return;

  const REQUIRED_ACTIVATIONS = 7;
  const RESET_AFTER_MS = 8000;
  const KEY_PARTS = ["1", "4", "9", "5", "7"];
  let count = 0;
  let resetTimer = null;

  const style = document.createElement("style");
  style.textContent = `
    .secret-library-lock-overlay[hidden] { display: none !important; }
    .secret-library-lock-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483600;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
      background: #010906;
      overscroll-behavior: contain;
    }
    body.secret-library-lock-open { overflow: hidden !important; }
    .secret-library-lock-stage {
      position: relative;
      flex: 0 0 auto;
      width: min(100vw, 150dvh);
      max-width: 1536px;
      aspect-ratio: 3 / 2;
      background: #03130e;
    }
    .secret-library-lock-art {
      position: absolute;
      inset: 0;
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      user-select: none;
      -webkit-user-drag: none;
    }
    .secret-library-lock-five-slot-row {
      position: absolute;
      left: 22.1354%;
      top: 52.2461%;
      width: 55.6641%;
      height: 20.0195%;
      display: block;
      object-fit: fill;
      pointer-events: none;
      user-select: none;
      -webkit-user-drag: none;
    }
    .secret-key-input {
      position: absolute;
      top: 58.2%;
      width: 6.45%;
      height: 10.2%;
      margin: 0;
      padding: 0;
      border: 0 !important;
      border-radius: 0;
      outline: none !important;
      background: transparent !important;
      background-color: transparent !important;
      -webkit-appearance: none;
      appearance: none;
      color: #f1d98d;
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(1.3rem, 4.2vw, 4rem);
      line-height: 1;
      text-align: center;
      text-shadow: 0 2px 5px rgba(0,0,0,.65);
      box-shadow: none !important;
      caret-color: #f1d98d;
    }
    .secret-key-input:focus,
    .secret-key-input:focus-visible {
      border: 0 !important;
      outline: none !important;
      background: transparent !important;
      background-color: transparent !important;
      box-shadow: none !important;
    }
    .secret-key-1 { left: 25.10%; }
    .secret-key-2 { left: 35.45%; }
    .secret-key-3 { left: 46.58%; }
    .secret-key-4 { left: 57.59%; }
    .secret-key-5 { left: 68.38%; }
    .secret-library-unlock-hit {
      position: absolute;
      left: 34.6%;
      top: 74.2%;
      width: 30.8%;
      height: 10.2%;
      border: 0;
      padding: 0;
      background: transparent;
      cursor: pointer;
    }
    .secret-library-unlock-hit:focus-visible {
      outline: .18vw solid rgba(241,217,141,.8);
      outline-offset: -.35vw;
      border-radius: 18%;
    }
    .secret-library-lock-status {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    .secret-library-lock-stage.secret-lock-error {
      animation: secretLockShake .28s linear;
    }
    @keyframes secretLockShake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-.5%); }
      75% { transform: translateX(.5%); }
    }
    @media (prefers-reduced-motion: reduce) {
      .secret-library-lock-stage.secret-lock-error { animation: none; }
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement("div");
  overlay.className = "secret-library-lock-overlay";
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Advanced Learner Library entrance");
  overlay.innerHTML = `
    <div class="secret-library-lock-stage">
      <img class="secret-library-lock-art" src="assets/hanafi-secret-library-lock-approved.png?rev=20260927fiveslot1" alt="Advanced Learner Library locked entrance">
      <img class="secret-library-lock-five-slot-row" src="assets/hanafi-secret-library-five-slot-row.avif?rev=20260927fiveslot1" alt="" aria-hidden="true">
      <form class="secret-library-lock-form" autocomplete="off">
        <input class="secret-key-input secret-key-1" aria-label="First number" inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="off">
        <input class="secret-key-input secret-key-2" aria-label="Second number" inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="off">
        <input class="secret-key-input secret-key-3" aria-label="Third number" inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="off">
        <input class="secret-key-input secret-key-4" aria-label="Fourth number" inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="off">
        <input class="secret-key-input secret-key-5" aria-label="Fifth number" inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="off">
        <button class="secret-library-unlock-hit" type="submit" aria-label="Unlock Advanced Learner Library"></button>
        <p class="secret-library-lock-status" role="status" aria-live="polite"></p>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  const stage = overlay.querySelector(".secret-library-lock-stage");
  const form = overlay.querySelector(".secret-library-lock-form");
  const inputs = Array.from(overlay.querySelectorAll(".secret-key-input"));
  const status = overlay.querySelector(".secret-library-lock-status");

  const reset = () => {
    count = 0;
    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }
  };

  const clearKey = () => {
    inputs.forEach(input => { input.value = ""; });
  };

  const openLock = () => {
    clearKey();
    status.textContent = "";
    overlay.hidden = false;
    document.body.classList.add("secret-library-lock-open");
    requestAnimationFrame(() => inputs[0].focus({ preventScroll: true }));
  };

  const closeLock = () => {
    overlay.hidden = true;
    document.body.classList.remove("secret-library-lock-open");
    clearKey();
  };

  const rejectKey = () => {
    status.textContent = "The numbers are not in the correct order.";
    stage.classList.remove("secret-lock-error");
    void stage.offsetWidth;
    stage.classList.add("secret-lock-error");
    clearKey();
    inputs[0].focus({ preventScroll: true });
  };

  inputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "").slice(0, 1);
      if (input.value.length === 1 && inputs[index + 1]) {
        inputs[index + 1].focus({ preventScroll: true });
      }
    });

    input.addEventListener("keydown", event => {
      if (event.key === "Backspace" && !input.value && inputs[index - 1]) {
        inputs[index - 1].focus({ preventScroll: true });
      }
    });
  });

  inputs[0].addEventListener("paste", event => {
    const digits = (event.clipboardData?.getData("text") || "").replace(/\D/g, "");
    if (digits.length !== 5) return;
    event.preventDefault();
    inputs.forEach((input, index) => { input.value = digits[index]; });
    inputs[4].focus({ preventScroll: true });
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    const candidate = inputs.map(input => input.value);
    const correct = KEY_PARTS.every((part, index) => candidate[index] === part);
    if (!correct) {
      rejectKey();
      return;
    }

    sessionStorage.setItem("hanafi-advanced-library-unlocked", "1");
    window.location.assign("advanced-library/");
  });

  trigger.addEventListener("click", () => {
    count += 1;

    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(reset, RESET_AFTER_MS);

    if (count >= REQUIRED_ACTIVATIONS) {
      reset();
      openLock();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !overlay.hidden) closeLock();
  });
})();
