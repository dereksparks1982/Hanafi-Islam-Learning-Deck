# Project Documentation

This folder is the home for the Hanafi Learning Deck's development, legal, planning, release, and operating documents.

The project began as a small personal card set and has grown into a broader Hanafi Islamic learning project. Documentation is treated as part of the build itself so important source, legal, design, review, deployment, and recovery decisions are not lost between development sessions.

## Start here

- [`CURRENT_HANDOFF.md`](CURRENT_HANDOFF.md) — **current recovery point**: accepted release, Web App surfaces, Media architecture, server state, Advanced Learner Library rules, and next-work boundaries.
- [`V2.1_CLOSEOUT.md`](V2.1_CLOSEOUT.md) — detailed record of what was accepted and closed in v2.1.
- [`COMPANY_BIBLE.md`](COMPANY_BIBLE.md) — governing rules for changes to this repository.
- [`roadmap.md`](roadmap.md) — current checkpoint and longer-term plans. Roadmap entries are not automatic build authorization.
- [`LEGAL_AND_SOURCE_POLICY.md`](LEGAL_AND_SOURCE_POLICY.md) — Qur'an/source/copyright policy, third-party material rules, Media/self-hosting distinctions, and the documented Shariah disagreement over intellectual property.
- [`changelog.md`](changelog.md) — release/checkpoint history.
- [`build-notes.md`](build-notes.md) — technical notes and solved build/repair/deployment procedures.
- [`main-deck-continuation.md`](main-deck-continuation.md) — concept plan for future Main Deck continuation focused on everyday Islamic expressions and when to use them.
- [`digital-learning-roadmap.md`](digital-learning-roadmap.md) — broader digital-learning direction.
- [`../quran/README.md`](../quran/README.md) — Qur'an Reader architecture, source plan, and page-by-page construction rules.
- [`../media-server/DEPLOYMENT.md`](../media-server/DEPLOYMENT.md) — current self-hosted Hanafi/Nougat Media deployment architecture.

## Content and scholarly review

Content sourcing and scholarly review remain distinct from development mechanics:

- [`../AUDIT_AND_SOURCES.md`](../AUDIT_AND_SOURCES.md) — audit and source notes.
- [`../IMAM_REVIEW_NOTES.md`](../IMAM_REVIEW_NOTES.md) — corrections and imam/scholar review notes.
- Expansion-specific source notes remain inside their own expansion folders.

The separation is intentional:

- `docs/` records **how the project is governed, built, licensed, planned, resumed, deployed, and maintained**;
- audit/source files record **what the educational material teaches and why particular claims are supported**;
- Qur'an Reader documentation records **which textual sources are used, how they are verified, and how the reader is assembled**;
- `media-server/` records **how the self-hosted media path is deployed and tested**.

## Current documentation checkpoint

Published baseline: **v2.1 — closed**

Active branch: **`main`**

No later public version number has been assigned.

The v2.1 closeout preserves the following accepted state:

- **209 cards across five independent sets**;
- installable/offline-capable **Web App**;
- approved v2.1 Hanafi visual identity, Home background, mobile background treatment, and Amarante display-heading treatment;
- local prayer calculations with **Hanafi ʿAṣr**;
- page-by-page **Qur'an Reader**;
- **Makkah Live & Prayer Clock**;
- Cesium-based **Holy Places Explorer**;
- v2.0 **Live** directory retained;
- **About**, **Legal**, and **Charity** Web App areas;
- gated **Advanced Learner Library** shell, with its hidden unlock details intentionally omitted from public documentation;
- self-hosted **Media** architecture using the Hanafi bridge and selected Nougat/Jellyfin backend work;
- the accepted **DK Media single-player Web player**, with one video element and library-driven source switching;
- external subtitle support for one configured sidecar subtitle per media item, including SRT-to-WebVTT conversion;
- `.onion` **Tor Mirror** as an alternate deployment of the same `main` project;
- Tor-mirror update tooling;
- dedicated legal/copyright/source policy;
- reusable media-server build/smoke-test workflow;
- the normal approval gate for every new build or substantial change.

The old Google Drive iframe Media implementation is historical and must not be described as the current player.

The additional Arabic/English hard-sub temporary copy being downloaded during v2.1 closeout is not part of the closed manifest. It remains later Media work after the completed file is confirmed and the maintainer authorizes its addition.

If context is lost, **read `CURRENT_HANDOFF.md` and `V2.1_CLOSEOUT.md` before doing anything else**.
