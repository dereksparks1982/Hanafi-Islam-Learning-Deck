(() => {
  const links = Array.from(document.querySelectorAll(".card-link"));
  if (!links.length) return;

  const style = document.createElement("style");
  style.textContent = `
    .card-viewer-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483000;
      display: grid;
      grid-template-rows: auto minmax(0,1fr);
      padding-top: env(safe-area-inset-top, 0px);
      padding-right: env(safe-area-inset-right, 0px);
      padding-bottom: env(safe-area-inset-bottom, 0px);
      padding-left: env(safe-area-inset-left, 0px);
      background: #071b15;
      color: #f7f1df;
    }
    .card-viewer-overlay[hidden] { display: none !important; }
    .card-viewer-toolbar {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .75rem;
      padding: .75rem;
      border-bottom: 1px solid rgba(216,181,96,.28);
      background: rgba(7,27,21,.98);
    }
    .card-viewer-toolbar button {
      flex: 0 0 auto;
      min-height: 44px;
      border-radius: 999px;
      padding: .7rem 1rem;
      border: 1px solid rgba(216,181,96,.4);
      background: rgba(255,255,255,.05);
      color: #f7f1df;
      font-weight: 800;
    }
    .card-viewer-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #d8b560;
      font-weight: 800;
      text-align: right;
    }
    .card-viewer-stage {
      min-height: 0;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
      touch-action: pan-x pan-y pinch-zoom;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 1rem .75rem calc(1rem + env(safe-area-inset-bottom, 0px));
    }
    .card-viewer-stage img {
      display: block;
      width: min(100%, 900px);
      height: auto;
      max-width: none;
      border-radius: 12px;
      background: #f5f0e5;
      box-shadow: 0 18px 50px rgba(0,0,0,.45);
    }
    @media (max-width: 520px) {
      .card-viewer-toolbar { padding: .65rem .5rem; }
      .card-viewer-toolbar button { padding: .65rem .85rem; }
      .card-viewer-label { font-size: .85rem; }
      .card-viewer-stage { padding-top: .65rem; }
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement("section");
  overlay.className = "card-viewer-overlay";
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Card viewer");
  overlay.innerHTML = `
    <div class="card-viewer-toolbar">
      <button type="button" class="card-viewer-close">← Back to cards</button>
      <span class="card-viewer-label"></span>
    </div>
    <div class="card-viewer-stage">
      <img alt="">
    </div>
  `;
  document.body.appendChild(overlay);

  const closeButton = overlay.querySelector(".card-viewer-close");
  const label = overlay.querySelector(".card-viewer-label");
  const image = overlay.querySelector("img");
  const stage = overlay.querySelector(".card-viewer-stage");
  let previousOverflow = "";
  let viewerHistoryEntry = false;

  function closeViewer(fromHistory = false) {
    if (overlay.hidden) return;
    overlay.hidden = true;
    image.removeAttribute("src");
    label.textContent = "";
    stage.scrollTop = 0;
    document.body.style.overflow = previousOverflow;
    closeButton.blur();

    if (!fromHistory && viewerHistoryEntry && location.hash === "#card-view") {
      viewerHistoryEntry = false;
      history.back();
    } else {
      viewerHistoryEntry = false;
    }
  }

  function openViewer(link) {
    const cardLabel = link.querySelector(".card-label")?.textContent?.trim() || "Card";
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    label.textContent = cardLabel;
    image.src = link.href;
    image.alt = cardLabel;
    stage.scrollTop = 0;
    overlay.hidden = false;
    closeButton.focus({ preventScroll: true });

    if (location.hash !== "#card-view") {
      history.pushState({ hanafiCardViewer: true }, "", "#card-view");
      viewerHistoryEntry = true;
    }
  }

  links.forEach(link => {
    link.removeAttribute("target");
    link.removeAttribute("rel");
    link.addEventListener("click", event => {
      if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openViewer(link);
    });
  });

  closeButton.addEventListener("click", () => closeViewer(false));
  window.addEventListener("popstate", () => {
    if (!overlay.hidden) closeViewer(true);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !overlay.hidden) closeViewer(false);
  });
})();
