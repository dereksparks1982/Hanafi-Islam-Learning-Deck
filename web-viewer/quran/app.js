const RELEASE = "v1.8";
const PAGE = 1;
const DATA_URL = `data/page-${String(PAGE).padStart(3, "0")}.json?release=${encodeURIComponent(RELEASE)}`;

const ayahList = document.getElementById("ayahList");
const sourceList = document.getElementById("sourceList");
const reviewStatus = document.getElementById("reviewStatus");
const showArabic = document.getElementById("showArabic");
const showTransliteration = document.getElementById("showTransliteration");
const showEnglish = document.getElementById("showEnglish");

function textNode(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = text;
  return el;
}

function renderAyahs(data) {
  ayahList.replaceChildren();

  data.ayahs.forEach((ayah, index) => {
    const article = document.createElement("article");
    article.className = "ayah";
    article.dataset.ref = ayah.ref;

    const ref = document.createElement("div");
    ref.className = "ayah-ref";
    ref.append(
      textNode("span", "", ayah.ref),
      textNode("span", "", `Āyah ${index + 1} of ${data.surah.ayah_count}`)
    );

    const arabic = textNode("div", "layer arabic", ayah.arabic);
    arabic.lang = "ar";
    arabic.dir = "rtl";
    arabic.dataset.layer = "arabic";

    const transliteration = textNode("div", "layer transliteration", ayah.transliteration);
    transliteration.dataset.layer = "transliteration";

    const english = textNode("div", "layer english", ayah.english);
    english.dataset.layer = "english";

    article.append(ref, arabic, transliteration, english);
    ayahList.appendChild(article);
  });

  applyLayerVisibility();
}

function renderSources(data) {
  sourceList.replaceChildren();

  const ordered = [
    ["Arabic", data.sources.arabic],
    ["Transliteration", data.sources.transliteration],
    ["English meaning", data.sources.english]
  ];

  ordered.forEach(([heading, source]) => {
    const card = document.createElement("article");
    card.className = "source-card";

    const title = document.createElement("strong");
    title.textContent = `${heading}: ${source.label}`;
    card.appendChild(title);

    if (source.note) card.appendChild(textNode("p", "", source.note));
    if (source.license_note) card.appendChild(textNode("p", "", source.license_note));

    if (source.url) {
      const p = document.createElement("p");
      const link = document.createElement("a");
      link.href = source.url;
      link.textContent = "Source / reference";
      link.target = source.url.startsWith("http") ? "_blank" : "_self";
      if (link.target === "_blank") link.rel = "noopener";
      p.appendChild(link);
      card.appendChild(p);
    }

    sourceList.appendChild(card);
  });

  reviewStatus.textContent = data.status === "prototype-under-review" ? "Under review" : data.status;
}

function applyLayerVisibility() {
  document.querySelectorAll('[data-layer="arabic"]').forEach(el => {
    el.hidden = !showArabic.checked;
  });
  document.querySelectorAll('[data-layer="transliteration"]').forEach(el => {
    el.hidden = !showTransliteration.checked;
  });
  document.querySelectorAll('[data-layer="english"]').forEach(el => {
    el.hidden = !showEnglish.checked;
  });
}

async function loadPage() {
  try {
    const response = await fetch(DATA_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    if (data.page !== PAGE || data.surah?.number !== 1 || data.ayahs?.length !== 7) {
      throw new Error("Unexpected Page 1 data shape");
    }

    renderAyahs(data);
    renderSources(data);
  } catch (error) {
    console.error(error);
    ayahList.replaceChildren(textNode("p", "error", "Page 1 could not be loaded. If you are offline, open the Web App once while connected so the v1.8 reader files can be stored on this device."));
    reviewStatus.textContent = "Load error";
  }
}

[showArabic, showTransliteration, showEnglish].forEach(control => {
  control.addEventListener("change", applyLayerVisibility);
});

loadPage();
