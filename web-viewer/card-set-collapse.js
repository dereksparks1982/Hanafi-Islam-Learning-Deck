(() => {
  const STORAGE_KEY = "hanafi-deck-card-set-collapse-v1";

  const style = document.createElement("style");
  style.textContent = `
    .set-heading { align-items: center; }
    .set-heading h2 { flex: 1 1 auto; min-width: 0; }
    .set-toggle {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .75rem;
      margin: 0;
      padding: .2rem 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: var(--text);
      text-align: left;
      font-family: Georgia, "Times New Roman", serif;
      font-size: inherit;
      font-weight: inherit;
    }
    .set-toggle:hover .set-toggle-title,
    .set-toggle:focus-visible .set-toggle-title { color: var(--gold); }
    .set-toggle:focus-visible { outline: 2px solid var(--gold); outline-offset: 5px; }
    .set-toggle-chevron {
      flex: 0 0 auto;
      color: var(--gold);
      font-family: system-ui, sans-serif;
      font-size: 1.05rem;
      line-height: 1;
    }
    .card-grid[hidden] { display: none !important; }
  `;
  document.head.appendChild(style);

  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch {
    saved = {};
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // Collapsing still works if local storage is unavailable.
    }
  }

  function setCollapsed(section, collapsed, persist = true) {
    const grid = section.querySelector(".card-grid");
    const button = section.querySelector(".set-toggle");
    const chevron = section.querySelector(".set-toggle-chevron");
    if (!grid || !button || !chevron) return;

    grid.hidden = collapsed;
    button.setAttribute("aria-expanded", String(!collapsed));
    button.title = `${collapsed ? "Expand" : "Collapse"} ${button.dataset.setTitle}`;
    chevron.textContent = collapsed ? "▸" : "▾";

    if (persist) {
      saved[section.id] = collapsed;
      saveState();
    }
  }

  document.querySelectorAll(".set-section").forEach(section => {
    const heading = section.querySelector(".set-heading");
    const title = heading?.querySelector("h2");
    const grid = section.querySelector(".card-grid");
    if (!heading || !title || !grid) return;

    const titleText = title.textContent.trim();
    const gridId = `${section.id}-cards`;
    grid.id = gridId;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "set-toggle";
    button.dataset.setTitle = titleText;
    button.setAttribute("aria-controls", gridId);

    const titleSpan = document.createElement("span");
    titleSpan.className = "set-toggle-title";
    titleSpan.textContent = titleText;

    const chevron = document.createElement("span");
    chevron.className = "set-toggle-chevron";
    chevron.setAttribute("aria-hidden", "true");

    button.append(titleSpan, chevron);
    title.replaceChildren(button);

    const initialCollapsed = saved[section.id] === true;
    setCollapsed(section, initialCollapsed, false);

    button.addEventListener("click", () => {
      setCollapsed(section, button.getAttribute("aria-expanded") === "true");
    });
  });

  document.querySelectorAll("#setNav a[href^='#']").forEach(link => {
    link.addEventListener("click", () => {
      const id = link.getAttribute("href").slice(1);
      const section = document.getElementById(id);
      if (!section) return;
      setCollapsed(section, false);
    });
  });
})();
