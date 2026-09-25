(() => {
  "use strict";

  const STORAGE_PREFIX = "hanafi-dk-media:";
  const SAVE_INTERVAL_SECONDS = 5;

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
    const whole = Math.floor(seconds);
    const hours = Math.floor(whole / 3600);
    const minutes = Math.floor((whole % 3600) / 60);
    const secs = whole % 60;
    return [hours, minutes, secs].map(value => String(value).padStart(2, "0")).join(":");
  }

  class DKMediaWebPlayer {
    constructor(options) {
      this.backend = options.backend;
      this.library = Array.isArray(options.library) ? options.library : [];
      this.catalog = new Map();
      this.current = null;
      this.lastSavedSecond = -1;

      this.video = document.getElementById(options.videoId);
      this.placeholder = document.getElementById(options.placeholderId);
      this.status = document.getElementById(options.statusId);
      this.title = document.getElementById(options.titleId);
      this.edition = document.getElementById(options.editionId);
      this.mediaSelect = document.getElementById(options.mediaSelectId);
      this.subtitleSelect = document.getElementById(options.subtitleSelectId);
      this.timeline = document.getElementById(options.timelineId);
      this.timeLabel = document.getElementById(options.timeLabelId);
      this.playButton = document.getElementById(options.playButtonId);
      this.rewindButton = document.getElementById(options.rewindButtonId);
      this.forwardButton = document.getElementById(options.forwardButtonId);
      this.volume = document.getElementById(options.volumeId);
      this.volumeLabel = document.getElementById(options.volumeLabelId);
      this.speed = document.getElementById(options.speedId);
      this.fullscreenButton = document.getElementById(options.fullscreenButtonId);
      this.sourceLink = document.getElementById(options.sourceLinkId);
      this.centerPlay = document.getElementById(options.centerPlayId);
      this.playerShell = this.video.closest(".dk-media-player") || this.video;
      this.pointerHideTimer = null;

      this.populateLibrary();
      this.bindEvents();
      this.restoreGlobalPreferences();
    }

    populateLibrary() {
      this.mediaSelect.replaceChildren();
      this.library.forEach(item => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.title;
        this.mediaSelect.appendChild(option);
      });
    }

    bindEvents() {
      this.mediaSelect.addEventListener("change", () => this.loadMedia(this.mediaSelect.value));
      this.subtitleSelect.addEventListener("change", () => this.applySubtitleSelection());
      this.playButton.addEventListener("click", () => this.togglePlayback());
      if (this.centerPlay) this.centerPlay.addEventListener("click", event => { event.stopPropagation(); this.togglePlayback(); });
      this.rewindButton.addEventListener("click", () => this.seekRelative(-10));
      this.forwardButton.addEventListener("click", () => this.seekRelative(10));
      this.fullscreenButton.addEventListener("click", () => this.toggleFullscreen());

      const adjustVolumeByWheel = event => {
        event.preventDefault();
        const direction = event.deltaY < 0 ? 1 : -1;
        this.setVolume((this.video.volume * 100) + (direction * 5));
        this.showPointerTemporarily();
      };
      this.playerShell.addEventListener("wheel", adjustVolumeByWheel, { passive: false });
      this.playerShell.addEventListener("mousemove", () => this.showPointerTemporarily());
      this.playerShell.addEventListener("mouseenter", () => this.showPointerTemporarily());
      this.playerShell.addEventListener("mouseleave", () => this.clearPointerTimer());
      document.addEventListener("fullscreenchange", () => this.showPointerTemporarily());

      this.timeline.addEventListener("input", () => {
        if (!Number.isFinite(this.video.duration) || this.video.duration <= 0) return;
        this.video.currentTime = (Number(this.timeline.value) / 1000) * this.video.duration;
      });

      this.volume.addEventListener("input", () => {
        this.setVolume(Number(this.volume.value));
      });

      this.speed.addEventListener("change", () => {
        const value = Number(this.speed.value);
        this.video.playbackRate = Number.isFinite(value) ? value : 1;
        localStorage.setItem(`${STORAGE_PREFIX}speed`, String(this.video.playbackRate));
      });

      this.video.addEventListener("click", () => this.togglePlayback());
      this.video.addEventListener("dblclick", () => this.toggleFullscreen());
      this.video.addEventListener("play", () => {
        this.playButton.textContent = "||";
        if (this.centerPlay) this.centerPlay.hidden = true;
      });
      this.video.addEventListener("pause", () => {
        this.playButton.textContent = "^";
        if (this.centerPlay && this.video.src) this.centerPlay.hidden = false;
      });
      this.video.addEventListener("loadedmetadata", () => {
        this.restorePosition();
        this.refreshTime();
      });
      this.video.addEventListener("durationchange", () => this.refreshTime());
      this.video.addEventListener("timeupdate", () => {
        this.refreshTime();
        this.savePosition();
      });
      this.video.addEventListener("ended", () => {
        this.clearPosition();
        this.playButton.textContent = "^";
        if (this.centerPlay && this.video.src) this.centerPlay.hidden = false;
      });
      this.video.addEventListener("error", () => {
        const code = this.video.error ? this.video.error.code : 0;
        this.setStatus(`Playback error${code ? ` (media code ${code})` : ""}.`);
      });

      document.addEventListener("keydown", event => {
        const target = event.target;
        if (target && /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(target.tagName)) return;

        if (event.code === "Space") {
          event.preventDefault();
          this.togglePlayback();
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          this.seekRelative(-10);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          this.seekRelative(10);
        } else if (event.key.toLowerCase() === "f") {
          event.preventDefault();
          this.toggleFullscreen();
        }
      });
    }

    setVolume(value) {
      const safe = Math.max(0, Math.min(100, Number(value)));
      this.video.volume = safe / 100;
      this.volume.value = String(Math.round(safe));
      this.volumeLabel.textContent = `${Math.round(safe)}%`;
      localStorage.setItem(`${STORAGE_PREFIX}volume`, String(Math.round(safe)));
    }

    clearPointerTimer() {
      if (this.pointerHideTimer) window.clearTimeout(this.pointerHideTimer);
      this.pointerHideTimer = null;
      this.playerShell.classList.remove("dk-pointer-hidden");
    }

    showPointerTemporarily() {
      if (this.pointerHideTimer) window.clearTimeout(this.pointerHideTimer);
      this.playerShell.classList.remove("dk-pointer-hidden");
      this.pointerHideTimer = window.setTimeout(() => {
        this.playerShell.classList.add("dk-pointer-hidden");
      }, 3000);
    }

    restoreGlobalPreferences() {
      const storedVolume = Number(localStorage.getItem(`${STORAGE_PREFIX}volume`));
      const volume = Number.isFinite(storedVolume) ? Math.max(0, Math.min(100, storedVolume)) : 100;
      this.volume.value = String(volume);
      this.volumeLabel.textContent = `${Math.round(volume)}%`;
      this.video.volume = volume / 100;

      const storedSpeed = Number(localStorage.getItem(`${STORAGE_PREFIX}speed`));
      const allowedSpeeds = Array.from(this.speed.options).map(option => Number(option.value));
      const speed = allowedSpeeds.includes(storedSpeed) ? storedSpeed : 1;
      this.speed.value = String(speed);
      this.video.playbackRate = speed;
    }

    async initialize() {
      if (!(this.backend && this.backend.enabled())) {
        this.placeholder.textContent = "The public Hanafi media endpoint is currently disabled.";
        this.setStatus("Media server disabled.");
        return;
      }

      try {
        const response = await fetch(this.backend.catalogUrl(), {
          mode: "cors",
          cache: "no-store"
        });
        if (!response.ok) throw new Error(`catalog HTTP ${response.status}`);
        const payload = await response.json();
        (payload.items || []).forEach(item => this.catalog.set(item.id, item));
      } catch (error) {
        console.warn("Hanafi media catalog unavailable:", error);
      }

      const firstReady = this.library.find(item => {
        const catalogItem = this.catalog.get(item.id);
        return !catalogItem || catalogItem.ready !== false;
      }) || this.library[0];

      if (firstReady) {
        this.mediaSelect.value = firstReady.id;
        this.loadMedia(firstReady.id);
      } else {
        this.placeholder.textContent = "No media is currently listed.";
        this.setStatus("No media available.");
      }
    }

    loadMedia(mediaId) {
      const entry = this.library.find(item => item.id === mediaId);
      if (!entry) return;

      const catalogItem = this.catalog.get(mediaId);
      this.current = entry;
      this.lastSavedSecond = -1;

      this.video.pause();
      this.video.removeAttribute("src");
      Array.from(this.video.querySelectorAll("track")).forEach(track => track.remove());
      this.video.load();

      this.title.textContent = entry.title;
      this.edition.textContent = entry.edition || "Self-hosted media";
      this.sourceLink.href = entry.sourceUrl;
      this.sourceLink.textContent = entry.sourceLabel || "Source";
      this.configureSubtitles(mediaId, catalogItem);

      if (catalogItem && catalogItem.ready === false) {
        this.video.hidden = true;
        if (this.centerPlay) this.centerPlay.hidden = true;
        this.placeholder.hidden = false;
        this.placeholder.textContent = "This media file is currently unavailable on the Hanafi media server.";
        this.setStatus(`${entry.title} is listed but not currently available.`);
        return;
      }

      this.video.src = this.backend.mediaUrl(mediaId);
      this.video.hidden = false;
      if (this.centerPlay) this.centerPlay.hidden = false;
      this.placeholder.hidden = true;
      this.video.load();
      this.setStatus(`${entry.title} · self-hosted through Nougat Media Core.`);
    }

    configureSubtitles(mediaId, catalogItem) {
      this.subtitleSelect.replaceChildren();
      const off = document.createElement("option");
      off.value = "off";
      off.textContent = "Off";
      this.subtitleSelect.appendChild(off);

      let subtitles = [];
      if (catalogItem && Array.isArray(catalogItem.subtitles)) {
        subtitles = catalogItem.subtitles.filter(track => track.ready !== false);
      } else if (catalogItem && catalogItem.subtitles === true) {
        subtitles = [{ label: "Subtitles", language: "und", ready: true }];
      }

      subtitles.forEach((subtitle, index) => {
        const trackElement = document.createElement("track");
        trackElement.kind = "subtitles";
        trackElement.src = this.backend.subtitleUrl(mediaId);
        trackElement.srclang = subtitle.language || "und";
        trackElement.label = subtitle.label || `Subtitles ${index + 1}`;
        this.video.appendChild(trackElement);

        const option = document.createElement("option");
        option.value = String(index);
        option.textContent = trackElement.label;
        this.subtitleSelect.appendChild(option);
      });

      this.subtitleSelect.disabled = subtitles.length === 0;

      const saved = localStorage.getItem(`${STORAGE_PREFIX}subtitle:${mediaId}`) || "off";
      const valid = Array.from(this.subtitleSelect.options).some(option => option.value === saved);
      this.subtitleSelect.value = valid ? saved : "off";

      window.setTimeout(() => this.applySubtitleSelection(false), 0);
    }

    applySubtitleSelection(save = true) {
      const selected = this.subtitleSelect.value;
      const tracks = Array.from(this.video.textTracks || []);

      tracks.forEach((track, index) => {
        track.mode = selected !== "off" && Number(selected) === index ? "showing" : "disabled";
      });

      if (save && this.current) {
        localStorage.setItem(`${STORAGE_PREFIX}subtitle:${this.current.id}`, selected);
      }
    }

    togglePlayback() {
      if (!this.video.src) return;
      if (this.video.paused || this.video.ended) {
        const result = this.video.play();
        if (result && typeof result.catch === "function") {
          result.catch(() => this.setStatus("Press Play to start this video."));
        }
      } else {
        this.video.pause();
      }
    }

    seekRelative(seconds) {
      if (!Number.isFinite(this.video.duration) || this.video.duration <= 0) return;
      const target = Math.max(0, Math.min(this.video.duration, this.video.currentTime + seconds));
      this.video.currentTime = target;
    }

    refreshTime() {
      const duration = Number.isFinite(this.video.duration) ? this.video.duration : 0;
      const current = Number.isFinite(this.video.currentTime) ? this.video.currentTime : 0;
      this.timeline.value = duration > 0 ? String(Math.round((current / duration) * 1000)) : "0";
      this.timeLabel.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    }

    positionKey() {
      return this.current ? `${STORAGE_PREFIX}position:${this.current.id}` : "";
    }

    savePosition() {
      if (!this.current || !Number.isFinite(this.video.duration) || this.video.duration <= 0) return;
      const currentSecond = Math.floor(this.video.currentTime);
      if (currentSecond < 10 || this.video.duration - currentSecond < 10) return;
      if (this.lastSavedSecond >= 0 && currentSecond - this.lastSavedSecond < SAVE_INTERVAL_SECONDS) return;

      localStorage.setItem(this.positionKey(), String(this.video.currentTime));
      this.lastSavedSecond = currentSecond;
    }

    restorePosition() {
      if (!this.current || !Number.isFinite(this.video.duration) || this.video.duration <= 0) return;
      const saved = Number(localStorage.getItem(this.positionKey()));
      if (Number.isFinite(saved) && saved > 10 && saved < this.video.duration - 10) {
        this.video.currentTime = saved;
        this.setStatus(`${this.current.title} · resumed at ${formatTime(saved)}.`);
      }
    }

    clearPosition() {
      const key = this.positionKey();
      if (key) localStorage.removeItem(key);
    }

    toggleFullscreen() {
      const playerShell = this.video.closest(".dk-media-player") || this.video;

      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
        return;
      }

      if (playerShell.requestFullscreen) {
        const result = playerShell.requestFullscreen();
        if (result && typeof result.catch === "function") result.catch(() => {});
        return;
      }

      if (this.video.webkitEnterFullscreen) {
        this.video.webkitEnterFullscreen();
      }
    }

    setStatus(message) {
      this.status.textContent = message;
    }
  }

  window.DKMediaWebPlayer = DKMediaWebPlayer;
})();
