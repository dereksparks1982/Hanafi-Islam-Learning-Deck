(() => {
  'use strict';

  const STREAMS = [
    {
      name: 'Saudi Qur’an TV · Globecast',
      url: 'https://cdnamd-hls-globecast.akamaized.net/live/ramdisk/saudi_quran/hls1/saudi_quran.m3u8'
    },
    {
      name: 'Saudi Qur’an TV · GPCDN',
      url: 'https://owrcovcrpy.gpcdn.net/bpk-tv/1713/output/index.m3u8'
    },
    {
      name: 'Saudi Qur’an TV · Globecast Roku',
      url: 'https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8'
    },
    {
      name: 'Saudi Qur’an TV · Holol backup',
      url: 'https://win.holol.com/live/quran/master.m3u8'
    }
  ];

  const player = document.getElementById('nougatLivePlayer');
  const status = document.getElementById('nougatPlayerStatus');
  const retryButton = document.getElementById('nougatRetryButton');
  const liveBadge = document.getElementById('nougatLiveBadge');
  const sourceLabel = document.getElementById('nougatSourceLabel');

  if (!player || !status || !retryButton || !liveBadge) return;

  let hls = null;
  let sourceIndex = 0;
  let retryTimer = 0;
  let watchdogTimer = 0;
  let startupTimer = 0;
  let lastProgressTime = 0;
  let lastCurrentTime = -1;
  let startedPlaying = false;
  let switching = false;

  const STARTUP_BUFFER_SECONDS = 12;
  const STALL_FAILOVER_MS = 16000;

  function currentSource() {
    return STREAMS[sourceIndex];
  }

  function cacheBusted(url) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}nougat_live=${Date.now()}`;
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function setBadge(text, state = '') {
    liveBadge.textContent = text;
    liveBadge.dataset.state = state;
  }

  function updateSourceLabel() {
    if (sourceLabel) sourceLabel.textContent = currentSource().name;
  }

  function bufferedAhead() {
    try {
      const current = Number(player.currentTime || 0);
      for (let i = 0; i < player.buffered.length; i += 1) {
        if (current >= player.buffered.start(i) - 0.25 && current <= player.buffered.end(i) + 0.25) {
          return Math.max(0, player.buffered.end(i) - current);
        }
      }
    } catch (_) {}
    return 0;
  }

  function destroyPlayback() {
    window.clearTimeout(retryTimer);
    window.clearTimeout(startupTimer);
    window.clearInterval(watchdogTimer);
    watchdogTimer = 0;
    startupTimer = 0;

    if (hls) {
      try { hls.destroy(); } catch (_) {}
      hls = null;
    }

    try { player.pause(); } catch (_) {}
    player.removeAttribute('src');
    player.load();
    startedPlaying = false;
    lastProgressTime = Date.now();
    lastCurrentTime = -1;
  }

  async function attemptAutoplay(force = false) {
    player.muted = true;
    player.defaultMuted = true;
    player.autoplay = true;
    player.playsInline = true;

    const cushion = bufferedAhead();
    if (!force && cushion > 0 && cushion < STARTUP_BUFFER_SECONDS) {
      setBadge('BUFFERING', 'connecting');
      setStatus(`Building a playback cushion before starting… ${Math.floor(cushion)}s buffered.`);
      window.clearTimeout(startupTimer);
      startupTimer = window.setTimeout(() => attemptAutoplay(false), 700);
      return;
    }

    try {
      await player.play();
      setStatus('Live Makkah video is playing with a larger buffer cushion. It starts muted so browsers allow autoplay; use the speaker control for sound.');
    } catch (error) {
      console.warn('Nougat live autoplay was blocked:', error);
      setStatus('The live stream is buffered and ready. Press Play if this browser blocked autoplay.');
    }
  }

  function startWatchdog() {
    window.clearInterval(watchdogTimer);
    lastProgressTime = Date.now();
    lastCurrentTime = player.currentTime || 0;

    watchdogTimer = window.setInterval(() => {
      if (document.hidden || switching) return;

      const now = Date.now();
      const current = Number(player.currentTime || 0);

      if (!player.paused && Math.abs(current - lastCurrentTime) > 0.2) {
        lastCurrentTime = current;
        lastProgressTime = now;
        return;
      }

      if (startedPlaying && !player.paused && now - lastProgressTime > STALL_FAILOVER_MS) {
        failOver('The live feed stopped advancing long enough to exhaust its buffer.');
      }
    }, 2000);
  }

  function failOver(reason) {
    if (switching) return;
    switching = true;

    const previous = currentSource().name;
    sourceIndex = (sourceIndex + 1) % STREAMS.length;
    const next = currentSource().name;

    setBadge('SWITCHING FEED', 'connecting');
    setStatus(`${reason} Switching automatically from ${previous} to ${next}…`);

    window.setTimeout(() => {
      switching = false;
      startPlayer(false);
    }, 500);
  }

  function attachNativeHls(url) {
    setBadge('CONNECTING', 'connecting');
    setStatus(`Connecting Nougat Web Player to ${currentSource().name}…`);
    player.src = url;
    player.addEventListener('canplay', () => attemptAutoplay(false), { once:true });
    player.load();
  }

  function attachHlsJs(url) {
    setBadge('CONNECTING', 'connecting');
    setStatus(`Connecting Nougat Web Player to ${currentSource().name}…`);

    hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: false,
      startFragPrefetch: true,
      capLevelToPlayerSize: true,
      backBufferLength: 45,
      maxBufferLength: 90,
      maxMaxBufferLength: 180,
      maxBufferSize: 120 * 1000 * 1000,
      maxBufferHole: 1.5,
      liveSyncDurationCount: 5,
      liveMaxLatencyDurationCount: 20,
      maxLiveSyncPlaybackRate: 1.05,
      maxStarvationDelay: 6,
      maxLoadingDelay: 6,
      abrBandWidthFactor: 0.8,
      abrBandWidthUpFactor: 0.65,
      manifestLoadingMaxRetry: 6,
      levelLoadingMaxRetry: 6,
      fragLoadingMaxRetry: 10,
      manifestLoadingRetryDelay: 500,
      levelLoadingRetryDelay: 500,
      fragLoadingRetryDelay: 350
    });

    hls.on(window.Hls.Events.MEDIA_ATTACHED, () => {
      hls.loadSource(url);
    });

    hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
      setBadge('BUFFERING', 'connecting');
      setStatus('Stream connected. Nougat is building a larger live buffer before playback…');
    });

    hls.on(window.Hls.Events.BUFFER_APPENDED, () => {
      if (!startedPlaying) attemptAutoplay(false);
    });

    hls.on(window.Hls.Events.ERROR, (_event, data) => {
      if (!data?.fatal) return;

      if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
        setBadge('RECOVERING', 'connecting');
        setStatus('Nougat is recovering the live video decoder…');
        try {
          hls.recoverMediaError();
          return;
        } catch (_) {}
      }

      console.warn('Fatal HLS error; moving to backup stream:', data);
      failOver('That live source stopped responding.');
    });

    hls.attachMedia(player);
  }

  function startPlayer(resetToFirst = false) {
    if (resetToFirst) sourceIndex = 0;
    destroyPlayback();
    updateSourceLabel();

    retryButton.disabled = true;
    retryButton.textContent = 'Connecting…';

    const url = cacheBusted(currentSource().url);
    const nativeHls = player.canPlayType('application/vnd.apple.mpegurl') && 'ManagedMediaSource' in window;

    if (nativeHls) {
      attachNativeHls(url);
    } else if (window.Hls && window.Hls.isSupported()) {
      attachHlsJs(url);
    } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
      attachNativeHls(url);
    } else {
      setBadge('UNSUPPORTED', 'error');
      setStatus('This browser cannot play HLS video. Use one of the external live links below.');
    }

    window.setTimeout(() => {
      retryButton.disabled = false;
      retryButton.textContent = 'Retry Stream';
    }, 1200);
  }

  player.addEventListener('playing', () => {
    startedPlaying = true;
    lastProgressTime = Date.now();
    lastCurrentTime = player.currentTime || 0;
    setBadge('LIVE', 'live');
    setStatus(`Live Makkah video is playing through ${currentSource().name}. Nougat is keeping a larger buffer behind playback for smoother viewing.`);
    startWatchdog();
  });

  player.addEventListener('timeupdate', () => {
    if (player.currentTime !== lastCurrentTime) {
      lastCurrentTime = player.currentTime;
      lastProgressTime = Date.now();
    }
  });

  player.addEventListener('ended', () => {
    failOver('That source ended instead of continuing live.');
  });

  player.addEventListener('waiting', () => {
    if (startedPlaying) {
      setBadge('BUFFERING', 'connecting');
      const cushion = bufferedAhead();
      setStatus(`Live feed is refilling its buffer${cushion > 0 ? ` (${Math.floor(cushion)}s available)` : ''}. Nougat will switch sources automatically if it cannot recover.`);
      try { hls?.startLoad(); } catch (_) {}
    }
  });

  player.addEventListener('stalled', () => {
    setBadge('BUFFERING', 'connecting');
    setStatus('The live feed stalled briefly. Nougat is aggressively refilling the buffer before switching sources.');
    try { hls?.startLoad(); } catch (_) {}
  });

  player.addEventListener('error', () => {
    if (hls || switching) return;
    failOver('That live source could not be played.');
  });

  retryButton.addEventListener('click', () => startPlayer(true));

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && player.paused && startedPlaying) attemptAutoplay(true);
  });

  startPlayer(true);
})();