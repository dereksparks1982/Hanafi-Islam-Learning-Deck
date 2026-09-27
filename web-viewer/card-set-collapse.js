(() => {
  const STORAGE_KEY = "hanafi-deck-card-set-collapse-v1";
  const DISPLAY_TITLES = {
    "sacred-places": "Sacred Places",
    "names-of-allah": "99 Names of Allah",
    "arabic-alphabet": "Arabic Alphabet",
    "important-places": "Important Places"
  };
  const INDEX_CARD_PATHS = Array.from({ length: 6 }, (_, i) => `cards/card_I${String(i + 1).padStart(2, "0")}.svg`);

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

  function appendIndexCards() {
    const section = document.getElementById("main-deck");
    const grid = section?.querySelector(".card-grid");
    if (!section || !grid || grid.querySelector("[data-index-card]")) return;

    INDEX_CARD_PATHS.forEach((path, index) => {
      const versioned = `${path}?release=v2.3&rev=20260927index1`;
      const cardLabel = `Index I-${index + 1}`;

      const link = document.createElement("a");
      link.className = "card-link";
      link.href = versioned;
      link.target = "_blank";
      link.rel = "noopener";
      link.dataset.indexCard = String(index + 1);

      const img = document.createElement("img");
      img.src = versioned;
      img.alt = cardLabel;
      img.loading = "lazy";
      img.decoding = "async";

      const text = document.createElement("span");
      text.className = "card-label";
      text.textContent = cardLabel;

      link.append(img, text);
      grid.appendChild(link);
    });

    const count = section.querySelector(".set-heading > span");
    if (count) count.textContent = `${grid.querySelectorAll(".card-link").length} cards`;
  }

  appendIndexCards();

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

    const titleText = DISPLAY_TITLES[section.id] || title.textContent.trim();
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
    const id = link.getAttribute("href").slice(1);
    if (DISPLAY_TITLES[id]) link.textContent = DISPLAY_TITLES[id];

    link.addEventListener("click", () => {
      const section = document.getElementById(id);
      if (!section) return;
      setCollapsed(section, false);
    });
  });

  document.getElementById("setNav")?.classList.remove("card-layout-pending");
  document.getElementById("library")?.classList.remove("card-layout-pending");
})();
