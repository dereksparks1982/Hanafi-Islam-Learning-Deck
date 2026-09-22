(() => {
  'use strict';

  const STREAM_URL = 'https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8';
  const player = document.getElementById('nougatLivePlayer');
  const status = document.getElementById('nougatPlayerStatus');
  const retryButton = document.getElementById('nougatRetryButton');
  const liveBadge = document.getElementById('nougatLiveBadge');

  if (!player || !status || !retryButton || !liveBadge) return;

  let hls = null;
  let retryTimer = 0;
  let startedPlaying = false;

  function setStatus(message) {
    status.textContent = message;
  }

  function setBadge(text, state = '') {
    liveBadge.textContent = text;
    liveBadge.dataset.state = state;
  }

  function clearPlayer() {
    window.clearTimeout(retryTimer);
    if (hls) {
      try { hls.destroy(); } catch (_) {}
      hls = null;
    }
    player.pause();
    player.removeAttribute('src');
    player.load();
    startedPlaying = false;
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

  function attachNativeHls() {
    setBadge('CONNECTING', 'connecting');
    setStatus('Connecting Nougat Web Player directly to the Makkah HLS stream…');
    player.src = STREAM_URL;
    player.addEventListener('loadedmetadata', attemptAutoplay, { once:true });
    player.load();
  }

  function attachHlsJs() {
    setBadge('CONNECTING', 'connecting');
    setStatus('Connecting Nougat Web Player to the Makkah HLS stream…');

    hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90,
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 10,
      maxBufferLength: 30
    });

    hls.on(window.Hls.Events.MEDIA_ATTACHED, () => {
      hls.loadSource(STREAM_URL);
    });

    hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
      attemptAutoplay();
    });

    hls.on(window.Hls.Events.ERROR, (_event, data) => {
      if (!data?.fatal) return;

      if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
        setBadge('RECONNECTING', 'connecting');
        setStatus('The live feed dropped. Nougat is reconnecting automatically…');
        window.clearTimeout(retryTimer);
        retryTimer = window.setTimeout(() => {
          try { hls?.startLoad(); } catch (_) { startPlayer(); }
        }, 1500);
        return;
      }

      if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
        setBadge('RECOVERING', 'connecting');
        setStatus('Nougat is recovering the live video decoder…');
        try {
          hls.recoverMediaError();
        } catch (_) {
          startPlayer();
        }
        return;
      }

      console.error('Fatal HLS error:', data);
      setBadge('STREAM ERROR', 'error');
      setStatus('The direct Makkah stream is unavailable right now. Use Retry Stream or one of the backup links below.');
      try { hls.destroy(); } catch (_) {}
      hls = null;
    });

    hls.attachMedia(player);
  }

  function startPlayer() {
    clearPlayer();
    retryButton.disabled = true;
    retryButton.textContent = 'Connecting…';

    const canPlayNative = player.canPlayType('application/vnd.apple.mpegurl') || player.canPlayType('application/x-mpegURL');

    if (canPlayNative) {
      attachNativeHls();
    } else if (window.Hls && window.Hls.isSupported()) {
      attachHlsJs();
    } else {
      setBadge('UNSUPPORTED', 'error');
      setStatus('This browser cannot play the HLS live feed. Use one of the external live links below.');
    }

    window.setTimeout(() => {
      retryButton.disabled = false;
      retryButton.textContent = 'Retry Stream';
    }, 1000);
  }

  player.addEventListener('playing', () => {
    startedPlaying = true;
    setBadge('LIVE', 'live');
    setStatus('Live Makkah video is playing. It starts muted so browsers allow autoplay; use the speaker control for sound.');
  });

  player.addEventListener('waiting', () => {
    if (startedPlaying) {
      setBadge('BUFFERING', 'connecting');
      setStatus('Live feed buffering…');
    }
  });

  player.addEventListener('stalled', () => {
    setBadge('BUFFERING', 'connecting');
    setStatus('The stream stalled briefly. Nougat is waiting for the live feed…');
  });

  player.addEventListener('error', () => {
    if (hls) return;
    setBadge('STREAM ERROR', 'error');
    setStatus('The direct Makkah stream could not be played. Use Retry Stream or one of the backup links below.');
  });

  retryButton.addEventListener('click', startPlayer);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && player.paused && startedPlaying) attemptAutoplay();
  });

  startPlayer();
})();