const ADHAN_VERSION = "4.4.6";
const ADHAN_URL = `https://unpkg.com/adhan@${ADHAN_VERSION}/lib/bundles/adhan.umd.min.js`;
const MAKKAH = { latitude:21.4225, longitude:39.8262, timeZone:"Asia/Riyadh" };

const makkahLocalTime = document.getElementById("makkahLocalTime");
const makkahCurrentPrayer = document.getElementById("makkahCurrentPrayer");
const makkahNextPrayerName = document.getElementById("makkahNextPrayerName");
const makkahNextPrayerTime = document.getElementById("makkahNextPrayerTime");
const makkahCountdown = document.getElementById("makkahCountdown");
const makkahSchedule = document.getElementById("makkahSchedule");
const makkahClockMessage = document.getElementById("makkahClockMessage");

let schedule = null;
let nextPrayer = null;
let dateKey = null;
let adhanLoadPromise = null;

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

function partsForZone(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone:MAKKAH.timeZone,
    year:"numeric",
    month:"2-digit",
    day:"2-digit"
  }).formatToParts(date);
  return Object.fromEntries(parts.filter(part => part.type !== "literal").map(part => [part.type, Number(part.value)]));
}

function calculationDate(date) {
  const { year, month, day } = partsForZone(date);
  return new Date(year, month - 1, day);
}

function makkahDateKey(date = new Date()) {
  const { year, month, day } = partsForZone(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatMakkahTime(date, seconds = false) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone:MAKKAH.timeZone,
    hour:"numeric",
    minute:"2-digit",
    second:seconds ? "2-digit" : undefined,
    hour12:true
  }).format(date);
}

function displayPrayerName(name) {
  return name === "Asr" ? "ʿAṣr" : name;
}

function currentPeriod(now) {
  if (!schedule) return "—";
  const ms = now.getTime();
  if (ms >= schedule.fajr.getTime() && ms < schedule.sunrise.getTime()) return "Fajr";
  if (ms >= schedule.sunrise.getTime() && ms < schedule.dhuhr.getTime()) return "Between Fajr & Dhuhr";
  if (ms >= schedule.dhuhr.getTime() && ms < schedule.asr.getTime()) return "Dhuhr";
  if (ms >= schedule.asr.getTime() && ms < schedule.maghrib.getTime()) return "ʿAṣr";
  if (ms >= schedule.maghrib.getTime() && ms < schedule.isha.getTime()) return "Maghrib";
  return "Isha";
}

function chooseNext(now, tomorrowFajr) {
  const prayers = [
    { name:"Fajr", time:schedule.fajr },
    { name:"Dhuhr", time:schedule.dhuhr },
    { name:"Asr", time:schedule.asr },
    { name:"Maghrib", time:schedule.maghrib },
    { name:"Isha", time:schedule.isha }
  ];
  return prayers.find(prayer => prayer.time.getTime() > now.getTime()) || { name:"Fajr", time:tomorrowFajr };
}

function renderSchedule() {
  makkahSchedule.replaceChildren();
  const entries = [
    ["Fajr", schedule.fajr],
    ["Sunrise", schedule.sunrise],
    ["Dhuhr", schedule.dhuhr],
    ["ʿAṣr", schedule.asr],
    ["Maghrib", schedule.maghrib],
    ["Isha", schedule.isha]
  ];

  entries.forEach(([name, time]) => {
    const row = document.createElement("div");
    row.className = "prayer-schedule-row";
    const label = document.createElement("span");
    label.textContent = name;
    const value = document.createElement("strong");
    value.textContent = formatMakkahTime(time);
    row.append(label, value);
    makkahSchedule.appendChild(row);
  });
}

async function calculateMakkahTimes() {
  try {
    await ensureAdhan();
    const now = new Date();
    const date = calculationDate(now);
    const tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const coordinates = new window.adhan.Coordinates(MAKKAH.latitude, MAKKAH.longitude);
    const params = window.adhan.CalculationMethod.UmmAlQura();
    const times = new window.adhan.PrayerTimes(coordinates, date, params);
    const tomorrowTimes = new window.adhan.PrayerTimes(coordinates, tomorrow, params);

    schedule = {
      fajr:times.fajr,
      sunrise:times.sunrise,
      dhuhr:times.dhuhr,
      asr:times.asr,
      maghrib:times.maghrib,
      isha:times.isha
    };
    nextPrayer = chooseNext(now, tomorrowTimes.fajr);
    dateKey = makkahDateKey(now);

    renderSchedule();
    makkahCurrentPrayer.textContent = currentPeriod(now);
    makkahNextPrayerName.textContent = displayPrayerName(nextPrayer.name);
    makkahNextPrayerTime.textContent = formatMakkahTime(nextPrayer.time);
    makkahClockMessage.textContent = "Calculated on this device for Makkah using the Umm al-Qura method. The countdown is independent of the live stream.";
    updateClock();
  } catch (error) {
    console.error(error);
    makkahClockMessage.textContent = "The Makkah clock could not start. Connect once so the prayer-time calculation library can load, then reopen this page.";
  }
}

function updateClock() {
  const now = new Date();
  makkahLocalTime.textContent = formatMakkahTime(now, true);

  if (!schedule || !nextPrayer) return;
  if (makkahDateKey(now) !== dateKey || nextPrayer.time.getTime() <= now.getTime()) {
    calculateMakkahTimes();
    return;
  }

  makkahCurrentPrayer.textContent = currentPeriod(now);
  const totalSeconds = Math.max(0, Math.floor((nextPrayer.time.getTime() - now.getTime()) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  makkahCountdown.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

calculateMakkahTimes();
window.setInterval(updateClock, 1000);
