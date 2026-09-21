# Offline PWA study surface

This directory is an installable, local-first viewer for the approved Hanafi Learning Deck card images.

Current scope is intentionally narrow:

- installable PWA shell;
- browse the current five card sets;
- explicit **Download for Offline Use** control;
- cache the current 209 approved card images on request;
- no account, advertising, tracking, search, quizzes, audio, or Scholar Mode.

The authoritative card PNGs remain in their existing repository directories. The PWA references those files without modifying them.

GitHub Pages deployment is handled by `.github/workflows/deploy-pwa-pages.yml`, which stages the PWA plus the authoritative card-image directories into the Pages artifact.
