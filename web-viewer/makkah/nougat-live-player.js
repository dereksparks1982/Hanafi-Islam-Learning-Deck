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
  let lastProgressTime = 0;
  let lastCurrentTime = -1;
  let startedPlaying = false;
  let switching = false;

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

  function destroyPlayback() {
    window.clearTimeout(retryTimer);
    window.clearInterval(watchdogTimer);
    watchdogTimer = 0;

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

  async function attemptAutoplay() {
    player.muted = true;
    player.defaultMuted = true;
    player.autoplay = true;
    player.playsInline = true;

    try {
      await player.play();
      setStatus('Live Makkah video is playing. It starts muted so browsers allow autoplay; use the speaker control for sound.');
    } catch (error) {
      console.warn('Nougat live autoplay was blocked:', error);
      setStatus('The live stream is loaded. Press Play if this browser blocked autoplay.');
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

      if (startedPlaying && !player.paused && now - lastProgressTime > 9000) {
        failOver('The live feed stopped advancing.');
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
    player.addEventListener('loadedmetadata', attemptAutoplay, { once:true });
    player.load();
  }

  function attachHlsJs(url) {
    setBadge('CONNECTING', 'connecting');
    setStatus(`Connecting Nougat Web Player to ${currentSource().name}…`);

    hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 60,
      maxBufferLength: 45,
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 10,
      manifestLoadingMaxRetry: 4,
      levelLoadingMaxRetry: 4,
      fragLoadingMaxRetry: 6,
      manifestLoadingRetryDelay: 800,
      levelLoadingRetryDelay: 800,
      fragLoadingRetryDelay: 500
    });

    hls.on(window.Hls.Events.MEDIA_ATTACHED, () => {
      hls.loadSource(url);
    });

    hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
      attemptAutoplay();
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
    setStatus(`Live Makkah video is playing through ${currentSource().name}. It starts muted so browsers allow autoplay; use the speaker control for sound.`);
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
      setStatus('Live feed buffering. Nougat will switch sources automatically if it does not recover.');
    }
  });

  player.addEventListener('stalled', () => {
    setBadge('BUFFERING', 'connecting');
    setStatus('The live feed stalled. Nougat is watching it and will switch sources if needed.');
  });

  player.addEventListener('error', () => {
    if (hls || switching) return;
    failOver('That live source could not be played.');
  });

  retryButton.addEventListener('click', () => startPlayer(true));

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && player.paused && startedPlaying) attemptAutoplay();
  });

  startPlayer(true);
})();