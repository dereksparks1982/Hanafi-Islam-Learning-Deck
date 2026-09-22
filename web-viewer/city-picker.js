(() => {
  const citySearch = document.getElementById("citySearch");
  const citySearchButton = document.getElementById("citySearchButton");
  const cityResults = document.getElementById("cityResults");
  const useLocationButton = document.getElementById("useLocationButton");
  const manualLocationButton = document.getElementById("manualLocationButton");
  const prayerLocation = document.getElementById("prayerLocation");
  const prayerMessage = document.getElementById("prayerMessage");

  if (!citySearch || !citySearchButton || !cityResults || !prayerLocation || !prayerMessage) return;

  const CITY_SELECTION_KEY = "hanafi-deck-prayer-city-v1";

  function cityLabel(place) {
    const parts = [place.name, place.admin1, place.country].filter(Boolean);
    return [...new Set(parts)].join(", ");
  }

  function clearSavedCity() {
    try {
      localStorage.removeItem(CITY_SELECTION_KEY);
    } catch (error) {
      console.warn("Saved city label could not be cleared:", error);
    }
  }

  function saveCity(place, label) {
    try {
      localStorage.setItem(CITY_SELECTION_KEY, JSON.stringify({
        label,
        latitude: Number(place.latitude),
        longitude: Number(place.longitude),
        timeZone: place.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
      }));
    } catch (error) {
      console.warn("Selected city could not be saved locally:", error);
    }
  }

  function restoreCityLabel() {
    try {
      const saved = JSON.parse(localStorage.getItem(CITY_SELECTION_KEY) || "null");
      if (!saved?.label) return;
      citySearch.value = saved.label;
      const zone = saved.timeZone || "local time zone";
      prayerLocation.textContent = `Selected city: ${saved.label} · Time zone: ${zone}`;
    } catch (error) {
      console.warn("Saved city label could not be restored:", error);
    }
  }

  function showMessage(message) {
    cityResults.hidden = false;
    cityResults.replaceChildren();
    const item = document.createElement("p");
    item.className = "city-result-message";
    item.textContent = message;
    cityResults.appendChild(item);
  }

  async function selectCity(place) {
    const latitude = Number(place.latitude);
    const longitude = Number(place.longitude);
    const timeZone = place.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const label = cityLabel(place);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || typeof globalThis.setPrayerLocation !== "function") {
      prayerMessage.textContent = "That city could not be applied to the prayer clock.";
      return;
    }

    saveCity(place, label);
    citySearch.value = label;
    cityResults.hidden = true;
    cityResults.replaceChildren();

    await globalThis.setPrayerLocation(latitude, longitude, label, timeZone);
    prayerLocation.textContent = `Selected city: ${label} · ${latitude.toFixed(4)}, ${longitude.toFixed(4)} · Time zone: ${timeZone}`;
  }

  async function findCity() {
    const query = citySearch.value.trim();
    if (query.length < 2) {
      showMessage("Enter a city name, or a city plus state/country.");
      return;
    }

    citySearchButton.disabled = true;
    citySearchButton.textContent = "Searching…";
    showMessage("Looking up cities…");

    try {
      const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
      url.searchParams.set("name", query);
      url.searchParams.set("count", "8");
      url.searchParams.set("language", "en");
      url.searchParams.set("format", "json");

      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const results = Array.isArray(data.results) ? data.results : [];

      if (!results.length) {
        showMessage("No matching city was found. Try adding the state or country.");
        return;
      }

      cityResults.replaceChildren();
      results.slice(0, 6).forEach(place => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "city-result";

        const name = document.createElement("strong");
        name.textContent = cityLabel(place);
        const details = document.createElement("span");
        const zone = place.timezone ? ` · ${place.timezone}` : "";
        details.textContent = `${Number(place.latitude).toFixed(4)}, ${Number(place.longitude).toFixed(4)}${zone}`;

        button.append(name, details);
        button.addEventListener("click", () => selectCity(place));
        cityResults.appendChild(button);
      });
      cityResults.hidden = false;
    } catch (error) {
      console.error(error);
      showMessage("City lookup is unavailable right now. Device location or manual coordinates still work.");
    } finally {
      citySearchButton.disabled = false;
      citySearchButton.textContent = "Find city";
    }
  }

  citySearchButton.addEventListener("click", findCity);
  citySearch.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      findCity();
    }
  });

  useLocationButton?.addEventListener("click", clearSavedCity, { capture:true });
  manualLocationButton?.addEventListener("click", clearSavedCity, { capture:true });

  restoreCityLabel();
})();