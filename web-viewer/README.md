# Hanafi Learning Deck Web Viewer

This directory contains the installable, local-first **Web Viewer** for the approved Hanafi Learning Deck card images.

Current scope is intentionally narrow:

- browse the current five card sets;
- explicit **Download for Offline Use** control;
- cache the current 209 approved card images on request;
- Home Screen installation support on compatible devices;
- no account, advertising, tracking, search, quizzes, audio, or Scholar Mode.

The authoritative card PNGs remain in their existing repository directories. The Web Viewer references those files without modifying them.

GitHub Pages deployment is handled by `.github/workflows/deploy-web-viewer-pages.yml`, which stages the Web Viewer plus the authoritative card-image directories into the live `gh-pages` publishing branch.
