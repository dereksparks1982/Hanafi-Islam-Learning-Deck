const RELEASE = "v1.8";
const ADHAN_VERSION = "4.4.6";
const ADHAN_URL = `https://unpkg.com/adhan@${ADHAN_VERSION}/lib/bundles/adhan.umd.min.js`;
const PRAYER_STORAGE_KEY = "hanafi-deck-prayer-settings-v1";

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

const PRAYER_METHOD_LABELS = {
  MuslimWorldLeague: "Muslim World League",
  MoonsightingCommittee: "Moonsighting Committee",
  NorthAmerica: "ISNA / North America",
  Karachi: "University of Islamic Sciences, Karachi",
  Egyptian: "Egyptian General Authority of Survey",
  UmmAlQura: "Umm al-Qura, Makkah",
  Turkey: "Diyanet / Turkey",
  Dubai: "Dubai",
  Kuwait: "Kuwait",
  Qatar: "Qatar",
  Singapore: "Singapore",
  Tehran: "Tehran"
};

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

const useLocationButton = document.getElementById("useLocationButton");
const manualLocationButton = document.getElementById("manualLocationButton");
const manualLatitude = document.getElementById("manualLatitude");
const manualLongitude = document.getElementById("manualLongitude");
const prayerMethod = document.getElementById("prayerMethod");
const prayerLocation = document.getElementById("prayerLocation");
const prayerClock = document.getElementById("prayerClock");
const currentPrayer = document.getElementById("currentPrayer");
const nextPrayerName = document.getElementById("nextPrayerName");
const nextPrayerTime = document.getElementById("nextPrayerTime");
const prayerCountdown = document.getElementById("prayerCountdown");
const prayerSchedule = document.getElementById("prayerSchedule");
const prayerMessage = document.getElementById("prayerMessage");

let installPrompt = null;
let adhanLoadPromise = null;
let prayerTimer = null;

const prayerState = {
  latitude: null,
  longitude: null,
  method: "MuslimWorldLeague",
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  schedule: null,
  next: null,
  dateKey: null
};

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

function ensureAdhan() {
  if (window.adhan) return Promise.resolve(window.adhan);
  if (adhanLoadPromise) return adhanLoadPromise;

  adhanLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = ADHAN_URL;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => window.adhan ? resolve(window.adhan) : reject(new Error("Adhan JS loaded without its global API."));
    script.onerror = () => reject(new Error("Adhan JS could not be loaded."));
    document.head.appendChild(script);
  });

  return adhanLoadPromise;
}

function partsForZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year:"numeric",
    month:"2-digit",
    day:"2-digit"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.filter(part => part.type !== "literal").map(part => [part.type, Number(part.value)]));
  return values;
}

function dateForZone(date, timeZone) {
  const { year, month, day } = partsForZone(date, timeZone);
  return new Date(year, month - 1, day);
}

function zoneDateKey(date = new Date()) {
  const { year, month, day } = partsForZone(date, prayerState.timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatPrayerTime(date) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: prayerState.timeZone,
    hour:"numeric",
    minute:"2-digit"
  }).format(date);
}

function makePrayerParameters() {
  const factory = window.adhan?.CalculationMethod?.[prayerState.method];
  if (typeof factory !== "function") throw new Error(`Unknown calculation method: ${prayerState.method}`);
  const params = factory();
  params.madhab = window.adhan.Madhab.Hanafi;
  return params;
}

function getCurrentPeriod(now, schedule) {
  const ms = now.getTime();
  if (ms >= schedule.fajr.getTime() && ms < schedule.sunrise.getTime()) return "Fajr";
  if (ms >= schedule.sunrise.getTime() && ms < schedule.dhuhr.getTime()) return "Between Fajr & Dhuhr";
  if (ms >= schedule.dhuhr.getTime() && ms < schedule.asr.getTime()) return "Dhuhr";
  if (ms >= schedule.asr.getTime() && ms < schedule.maghrib.getTime()) return "ʿAṣr";
  if (ms >= schedule.maghrib.getTime() && ms < schedule.isha.getTime()) return "Maghrib";
  return "Isha";
}

function prayerNameLabel(name) {
  return name === "Asr" ? "ʿAṣr" : name;
}

function renderPrayerSchedule() {
  prayerSchedule.replaceChildren();
  if (!prayerState.schedule) return;

  const entries = [
    ["Fajr", prayerState.schedule.fajr],
    ["Sunrise", prayerState.schedule.sunrise],
    ["Dhuhr", prayerState.schedule.dhuhr],
    ["ʿAṣr", prayerState.schedule.asr],
    ["Maghrib", prayerState.schedule.maghrib],
    ["Isha", prayerState.schedule.isha]
  ];

  entries.forEach(([name, time]) => {
    const row = document.createElement("div");
    row.className = "prayer-schedule-row";
    const label = document.createElement("span");
    label.textContent = name;
    const value = document.createElement("strong");
    value.textContent = formatPrayerTime(time);
    row.append(label, value);
    prayerSchedule.appendChild(row);
  });
}

function chooseNextPrayer(now, schedule, tomorrowFajr) {
  const prayers = [
    { name:"Fajr", time:schedule.fajr },
    { name:"Dhuhr", time:schedule.dhuhr },
    { name:"Asr", time:schedule.asr },
    { name:"Maghrib", time:schedule.maghrib },
    { name:"Isha", time:schedule.isha }
  ];
  return prayers.find(prayer => prayer.time.getTime() > now.getTime()) || { name:"Fajr", time:tomorrowFajr };
}

async function calculatePrayerTimes() {
  if (!Number.isFinite(prayerState.latitude) || !Number.isFinite(prayerState.longitude)) return;

  try {
    await ensureAdhan();
    const coordinates = new window.adhan.Coordinates(prayerState.latitude, prayerState.longitude);
    const params = makePrayerParameters();
    const now = new Date();
    const calculationDate = dateForZone(now, prayerState.timeZone);
    const tomorrowDate = new Date(calculationDate.getFullYear(), calculationDate.getMonth(), calculationDate.getDate() + 1);
    const times = new window.adhan.PrayerTimes(coordinates, calculationDate, params);
    const tomorrowTimes = new window.adhan.PrayerTimes(coordinates, tomorrowDate, params);

    prayerState.schedule = {
      fajr: times.fajr,
      sunrise: times.sunrise,
      dhuhr: times.dhuhr,
      asr: times.asr,
      maghrib: times.maghrib,
      isha: times.isha
    };
    prayerState.next = chooseNextPrayer(now, prayerState.schedule, tomorrowTimes.fajr);
    prayerState.dateKey = zoneDateKey(now);

    currentPrayer.textContent = getCurrentPeriod(now, prayerState.schedule);
    nextPrayerName.textContent = prayerNameLabel(prayerState.next.name);
    nextPrayerTime.textContent = formatPrayerTime(prayerState.next.time);
    prayerClock.hidden = false;
    renderPrayerSchedule();
    updatePrayerCountdown();

    const methodLabel = PRAYER_METHOD_LABELS[prayerState.method] || prayerState.method;
    prayerMessage.textContent = `Calculated on this device using ${methodLabel}, Hanafi ʿAṣr, and timezone ${prayerState.timeZone}.`;
  } catch (error) {
    console.error(error);
    prayerClock.hidden = true;
    prayerSchedule.replaceChildren();
    prayerMessage.textContent = "Prayer times could not be calculated. Connect once so the calculation library can load, then try again.";
  }
}

function updatePrayerCountdown() {
  if (!prayerState.next || !prayerState.schedule) return;

  const now = new Date();
  if (zoneDateKey(now) !== prayerState.dateKey || prayerState.next.time.getTime() <= now.getTime()) {
    calculatePrayerTimes();
    return;
  }

  currentPrayer.textContent = getCurrentPeriod(now, prayerState.schedule);
  const totalSeconds = Math.max(0, Math.floor((prayerState.next.time.getTime() - now.getTime()) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  prayerCountdown.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function savePrayerSettings() {
  try {
    localStorage.setItem(PRAYER_STORAGE_KEY, JSON.stringify({
      latitude: prayerState.latitude,
      longitude: prayerState.longitude,
      method: prayerState.method,
      timeZone: prayerState.timeZone
    }));
  } catch (error) {
    console.warn("Prayer settings could not be saved locally:", error);
  }
}

async function setPrayerLocation(latitude, longitude, sourceLabel, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC") {
  prayerState.latitude = Number(latitude);
  prayerState.longitude = Number(longitude);
  prayerState.timeZone = timeZone;
  prayerLocation.textContent = `${sourceLabel} · ${prayerState.latitude.toFixed(3)}, ${prayerState.longitude.toFixed(3)} · ${prayerState.timeZone}`;
  savePrayerSettings();
  await calculatePrayerTimes();
}

useLocationButton.addEventListener("click", () => {
  if (!("geolocation" in navigator)) {
    prayerMessage.textContent = "This browser does not provide location access. Enter latitude and longitude manually below.";
    return;
  }

  useLocationButton.disabled = true;
  useLocationButton.textContent = "Finding location…";
  prayerMessage.textContent = "Waiting for location permission…";

  navigator.geolocation.getCurrentPosition(
    position => {
      useLocationButton.disabled = false;
      useLocationButton.textContent = "Refresh my location";
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      setPrayerLocation(position.coords.latitude, position.coords.longitude, "Device location", zone);
    },
    error => {
      console.warn(error);
      useLocationButton.disabled = false;
      useLocationButton.textContent = "Use my location";
      prayerMessage.textContent = "Location permission was not available. You can enter coordinates manually below.";
    },
    { enableHighAccuracy:false, timeout:10000, maximumAge:600000 }
  );
});

manualLocationButton.addEventListener("click", () => {
  const latitude = Number(manualLatitude.value);
  const longitude = Number(manualLongitude.value);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    prayerMessage.textContent = "Enter a valid latitude from -90 to 90 and longitude from -180 to 180.";
    return;
  }
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  setPrayerLocation(latitude, longitude, "Manual coordinates", zone);
});

prayerMethod.addEventListener("change", () => {
  prayerState.method = prayerMethod.value;
  savePrayerSettings();
  calculatePrayerTimes();
});

function restorePrayerSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(PRAYER_STORAGE_KEY) || "null");
    if (!saved) return;
    if (saved.method && PRAYER_METHOD_LABELS[saved.method]) {
      prayerState.method = saved.method;
      prayerMethod.value = saved.method;
    }
    if (Number.isFinite(saved.latitude) && Number.isFinite(saved.longitude)) {
      prayerState.latitude = saved.latitude;
      prayerState.longitude = saved.longitude;
      prayerState.timeZone = saved.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      prayerLocation.textContent = `Saved location · ${saved.latitude.toFixed(3)}, ${saved.longitude.toFixed(3)} · ${prayerState.timeZone}`;
      useLocationButton.textContent = "Refresh my location";
      calculatePrayerTimes();
    }
  } catch (error) {
    console.warn("Saved prayer settings could not be restored:", error);
  }
}

render();
startOfflineSupport();
restorePrayerSettings();
prayerTimer = window.setInterval(updatePrayerCountdown, 1000);
