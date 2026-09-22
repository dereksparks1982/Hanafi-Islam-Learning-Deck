# Hanafi Learning Deck Web App

This directory contains the installable, local-first **Web App** for the Hanafi Learning Deck.

The directory name remains `web-viewer/` for implementation continuity, but the user-facing product is the **Web App**.

## Current v1.9 capabilities

- browse the current five card sets;
- collapse or expand each card set independently;
- remember the local collapsed/expanded state;
- explicit **Download for Offline Use** and deck-refresh controls;
- cache the current 209 approved card images on request;
- Home Screen installation support on compatible devices;
- local prayer-time calculation with **Hanafi ʿAṣr**;
- exact city lookup, device-location use, and manual coordinates;
- Qur'an Reader entry point;
- Makkah Live & Prayer Clock;
- Cesium-based Holy Places Explorer;
- Media section, beginning with *The Message* (1976), with English and Arabic viewing choices;
- no account, advertising, commercial paywall, or behavioral tracking by the Hanafi Learning Deck.

The authoritative card PNGs remain in their existing repository directories. The Web App references those files without modifying them.

## Deployment

GitHub Pages deployment is handled by `.github/workflows/deploy-web-viewer-pages.yml` from **`main`**. The project no longer uses a separate development or `gh-pages` branch as the working source of truth.

The Tor mirror is an alternate access path to the same Web App and is updated separately through the repository's Tor-mirror update script.

## Media playback

The current v1.9 movie page uses **Google Drive embedded playback**. It does not bundle VLC or libVLC. Any future Nougat/VLC integration must carry the appropriate VideoLAN/VLC attribution and licensing information.

Third-party films, streams, imagery, libraries, and external services remain subject to their own source and licensing terms. See [`../docs/LEGAL_AND_SOURCE_POLICY.md`](../docs/LEGAL_AND_SOURCE_POLICY.md).
