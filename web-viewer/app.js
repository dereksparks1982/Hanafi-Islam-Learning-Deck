const RELEASE = "v1.8";

const main = Array.from({length:147}, (_, i) => `cards/card_${String(i).padStart(3, "0")}.png`);
const sacredSlugs = [
  "sacred_places_expansion_color_key","masjid_al-haram","the_kabah_visual_guide","maqam_ibrahim","zamzam",
  "safa_and_marwah","mina","arafat","muzdalifah","masjid_an-nabawi","the_rawdah","jannat_al-baqi",
  "masjid_quba","masjid_al-qiblatayn","al-masjid_al-aqsa","dome_of_the_rock","jabal_al-nur_and_cave_hira",
  "cave_thawr","mount_uhud"
];
const sacred = sacredSlugs.map((slug, i) => `Sacred-Places-Expansion/card_${String(i + 1).padStart(3, "0")}_${slug}.png`);
const nameSlugs = [
  "99_names_expansion_guide","names_01_09","names_10_18","names_19_27","names_28_36","names_37_45",
  "names_46_54","names_55_63","names_64_72","names_73_81","names_82_90","names_91_99"
];
const names = nameSlugs.map((slug, i) => `99-Names-of-Allah-Expansion/card_${String(i + 1).padStart(3, "0")}_${slug}.png`);
const arabicSlugs = ["alif","ba","ta","tha","jim","ha","kha","dal","dhal","ra","zay","sin","shin","sad","dad","ta","za","ayn","ghayn","fa","qaf","kaf","lam","mim","nun","ha","waw","ya"];
const arabic = arabicSlugs.map((slug, i) => `Arabic-Alphabet-Expansion/cards/card_${String(i + 1).padStart(3, "0")}_${slug}.png`);
const important = [
  "Important-Places-Expansion/card_001_lal_masjid.png",
  "Important-Places-Expansion/card_002_chinguetti_mosque.png",
  "Important-Places-Expansion/card_003_abu_hanifa_mosque.png"
];

const SETS = [
  { id:"main-deck", title:"Main Deck", files:main },
  { id:"sacred-places", title:"Sacred Places Expansion", files:sacred },
  { id:"names-of-allah", title:"99 Names of Allah Expansion", files:names },
  { id:"arabic-alphabet", title:"Arabic Alphabet Expansion", files:arabic },
  { id:"important-places", title:"Important Places of the Muslim World", files:important }
];

function releaseUrl(path) {
  return `${path}?release=${encodeURIComponent(RELEASE)}`;
}

const CARD_URLS = SETS.flatMap(set => set.files).map(releaseUrl);
const TOTAL_CARDS = CARD_URLS.length;

const library = document.getElementById("library");
const setNav = document.getElementById("setNav");
const offlineButton = document.getElementById("offlineButton");
const refreshButton = document.getElementById("refreshButton");
const installButton = document.getElementById("installButton");
const status = document.getElementById("status");
let installPrompt = null;

function humanize(path) {
  return path.split("/").pop().replace(/\.png$/i, "").replace(/^card_\d+_?/, "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function label(set, index, path) {
  if (set.id === "main-deck") return index === 0 ? "Card 00" : `Card ${index}`;
  const detail = humanize(path);
  return `Card ${index + 1}${detail ? ` · ${detail}` : ""}`;
}

function render() {
  for (const set of SETS) {
    const nav = document.createElement("a");
    nav.href = `#${set.id}`;
    nav.textContent = set.title;
    setNav.appendChild(nav);

    const section = document.createElement("section");
    section.className = "set-section";
    section.id = set.id;
    section.innerHTML = `<div class="set-heading"><h2>${set.title}</h2><span>${set.files.length} cards</span></div>`;
    const grid = document.createElement("div");
    grid.className = "card-grid";

    set.files.forEach((path, index) => {
      const versioned = releaseUrl(path);
      const link = document.createElement("a");
      link.className = "card-link";
      link.href = versioned;
      link.target = "_blank";
      link.rel = "noopener";

      const img = document.createElement("img");
      img.src = versioned;
      img.alt = label(set, index, path);
      img.loading = "lazy";
      img.decoding = "async";

      const text = document.createElement("span");
      text.className = "card-label";
      text.textContent = label(set, index, path);
      link.append(img, text);
      grid.appendChild(link);
    });

    section.appendChild(grid);
    library.appendChild(section);
  }
}

function showOfflineState(cached, message = "") {
  refreshButton.disabled = false;
  if (cached >= TOTAL_CARDS) {
    offlineButton.textContent = "Available Offline";
    offlineButton.disabled = true;
    status.textContent = message || `All ${TOTAL_CARDS} ${RELEASE} cards are stored on this device for offline study.`;
  } else {
    offlineButton.textContent = "Download for Offline Use";
    offlineButton.disabled = false;
    status.textContent = message || (cached ? `${cached} of ${TOTAL_CARDS} ${RELEASE} cards are stored offline.` : `The ${RELEASE} app shell is ready. Card images are not yet fully stored offline.`);
  }
}

async function getWorker() {
  const registration = await navigator.serviceWorker?.ready;
  return navigator.serviceWorker?.controller || registration?.active || null;
}

async function startOfflineSupport() {
  if (!("serviceWorker" in navigator)) {
    status.textContent = "This browser does not support offline app storage.";
    offlineButton.disabled = true;
    refreshButton.disabled = true;
    return;
  }
  try {
    const registration = await navigator.serviceWorker.register(`sw.js?release=${encodeURIComponent(RELEASE)}`, { scope:"./" });
    const ready = await navigator.serviceWorker.ready;
    const worker = navigator.serviceWorker.controller || registration.active || ready.active;
    refreshButton.disabled = false;
    worker?.postMessage({ type:"CACHE_STATUS", urls:CARD_URLS, release:RELEASE });
  } catch (error) {
    console.error(error);
    status.textContent = "Offline setup could not start in this browser.";
    offlineButton.disabled = true;
    refreshButton.disabled = true;
  }
}

navigator.serviceWorker?.addEventListener("message", event => {
  const data = event.data || {};
  if (data.type === "CACHE_STATUS") showOfflineState(data.cached || 0);
  if (data.type === "CACHE_PROGRESS") {
    offlineButton.disabled = true;
    refreshButton.disabled = true;
    const verb = data.mode === "refresh" ? "Updating" : "Downloading";
    if (data.mode === "refresh") refreshButton.textContent = `${verb} ${data.done} / ${data.total}`;
    else offlineButton.textContent = `${verb} ${data.done} / ${data.total}`;
    status.textContent = data.failed ? `${data.failed} card download(s) need retrying.` : `${verb} card ${data.done} of ${data.total}…`;
  }
  if (data.type === "CACHE_COMPLETE") {
    refreshButton.textContent = "Update Deck";
    const message = data.mode === "refresh"
      ? (data.failed ? `Deck update finished with ${data.failed} card download(s) needing retry.` : `Offline deck refreshed to ${RELEASE}.`)
      : "";
    showOfflineState(data.cached || 0, message);
  }
});

offlineButton.addEventListener("click", async () => {
  const worker = await getWorker();
  if (!worker) {
    status.textContent = "Offline storage is still starting. Try again in a moment.";
    return;
  }
  offlineButton.disabled = true;
  refreshButton.disabled = true;
  offlineButton.textContent = "Starting download…";
  worker.postMessage({ type:"CACHE_CARDS", urls:CARD_URLS, release:RELEASE });
});

refreshButton.addEventListener("click", async () => {
  const worker = await getWorker();
  if (!worker) {
    status.textContent = "Deck updating is still starting. Try again in a moment.";
    return;
  }
  offlineButton.disabled = true;
  refreshButton.disabled = true;
  refreshButton.textContent = "Starting update…";
  status.textContent = `Checking all ${TOTAL_CARDS} cards for the current ${RELEASE} release…`;
  worker.postMessage({ type:"REFRESH_CARDS", urls:CARD_URLS, release:RELEASE });
});

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installButton.hidden = true;
});

window.addEventListener("appinstalled", () => {
  installPrompt = null;
  installButton.hidden = true;
});

render();
startOfflineSupport();
