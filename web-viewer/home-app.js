const RELEASE = "v2.3";
const SHELL_REV = "20260927staticdeck1";
const ADHAN_VERSION = "4.4.6";
const ADHAN_URL = `https://unpkg.com/adhan@${ADHAN_VERSION}/lib/bundles/adhan.umd.min.js`;
const PRAYER_STORAGE_KEY = "hanafi-deck-prayer-settings-v1";
const FOLKHOLD_MAJLIS_URL = "https://dereksparks1982.github.io/folkhold/?from=hanafi#square";

const installButton = document.getElementById("installButton");
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

const prayerState = {
  latitude: null,
  longitude: null,
  method: "MuslimWorldLeague",
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  schedule: null,
  next: null,
  dateKey: null
};

function ensureMajlisLink() {
  const actions = document.querySelector(".actions");
  if (!actions || actions.querySelector('[data-hanafi-majlis="true"]')) return;

  const link = document.createElement("a");
  link.className = "secondary action-link";
  link.href = FOLKHOLD_MAJLIS_URL;
  link.textContent = "Majlis";
  link.dataset.hanafiMajlis = "true";
  link.setAttribute("aria-label", "Open the Majlis in Folkhold");

  const linksButton = actions.querySelector('a[href="links/"]');
  actions.insertBefore(link, linksButton || installButton || null);
}

async function startOfflineSupport() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.register(
      `sw.js?release=${encodeURIComponent(RELEASE)}&rev=${SHELL_REV}`,
      { scope:"./", updateViaCache:"none" }
    );
    registration.update().catch(() => {});
  } catch (error) {
    console.error("Service worker registration failed:", error);
  }
}

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  installPrompt = event;
  if (installButton) installButton.hidden = false;
});

installButton?.addEventListener("click", async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installButton.hidden = true;
});

window.addEventListener("appinstalled", () => {
  installPrompt = null;
  if (installButton) installButton.hidden = true;
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
  return Object.fromEntries(parts.filter(part => part.type !== "literal").map(part => [part.type, Number(part.value)]));
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
  if (!prayerSchedule) return;
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

    if (currentPrayer) currentPrayer.textContent = getCurrentPeriod(now, prayerState.schedule);
    if (nextPrayerName) nextPrayerName.textContent = prayerNameLabel(prayerState.next.name);
    if (nextPrayerTime) nextPrayerTime.textContent = formatPrayerTime(prayerState.next.time);
    if (prayerClock) prayerClock.hidden = false;
    renderPrayerSchedule();
    updatePrayerCountdown();

    const methodLabel = PRAYER_METHOD_LABELS[prayerState.method] || prayerState.method;
    if (prayerMessage) prayerMessage.textContent = `Calculated on this device using ${methodLabel}, Hanafi ʿAṣr, and timezone ${prayerState.timeZone}.`;
  } catch (error) {
    console.error(error);
    if (prayerClock) prayerClock.hidden = true;
    prayerSchedule?.replaceChildren();
    if (prayerMessage) prayerMessage.textContent = "Prayer times could not be calculated. Connect once so the calculation library can load, then try again.";
  }
}

function updatePrayerCountdown() {
  if (!prayerState.next || !prayerState.schedule) return;
  const now = new Date();
  if (zoneDateKey(now) !== prayerState.dateKey || prayerState.next.time.getTime() <= now.getTime()) {
    calculatePrayerTimes();
    return;
  }
  if (currentPrayer) currentPrayer.textContent = getCurrentPeriod(now, prayerState.schedule);
  const totalSeconds = Math.max(0, Math.floor((prayerState.next.time.getTime() - now.getTime()) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (prayerCountdown) prayerCountdown.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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
  if (prayerLocation) prayerLocation.textContent = `${sourceLabel} · ${prayerState.latitude.toFixed(3)}, ${prayerState.longitude.toFixed(3)} · ${prayerState.timeZone}`;
  savePrayerSettings();
  await calculatePrayerTimes();
}
globalThis.setPrayerLocation = setPrayerLocation;

useLocationButton?.addEventListener("click", () => {
  if (!("geolocation" in navigator)) {
    if (prayerMessage) prayerMessage.textContent = "This browser does not provide location access. Enter latitude and longitude manually below.";
    return;
  }
  useLocationButton.disabled = true;
  useLocationButton.textContent = "Finding location…";
  if (prayerMessage) prayerMessage.textContent = "Waiting for location permission…";
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
      if (prayerMessage) prayerMessage.textContent = "Location permission was not available. You can enter coordinates manually below.";
    },
    { enableHighAccuracy:false, timeout:10000, maximumAge:600000 }
  );
});

manualLocationButton?.addEventListener("click", () => {
  const latitude = Number(manualLatitude?.value);
  const longitude = Number(manualLongitude?.value);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    if (prayerMessage) prayerMessage.textContent = "Enter a valid latitude from -90 to 90 and longitude from -180 to 180.";
    return;
  }
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  setPrayerLocation(latitude, longitude, "Manual coordinates", zone);
});

prayerMethod?.addEventListener("change", () => {
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
      if (prayerMethod) prayerMethod.value = saved.method;
    }
    if (Number.isFinite(saved.latitude) && Number.isFinite(saved.longitude)) {
      prayerState.latitude = saved.latitude;
      prayerState.longitude = saved.longitude;
      prayerState.timeZone = saved.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      if (prayerLocation) prayerLocation.textContent = `Saved location · ${saved.latitude.toFixed(3)}, ${saved.longitude.toFixed(3)} · ${prayerState.timeZone}`;
      if (useLocationButton) useLocationButton.textContent = "Refresh my location";
      calculatePrayerTimes();
    }
  } catch (error) {
    console.warn("Saved prayer settings could not be restored:", error);
  }
}

ensureMajlisLink();
startOfflineSupport();
restorePrayerSettings();
prayerTimer = window.setInterval(updatePrayerCountdown, 1000);
