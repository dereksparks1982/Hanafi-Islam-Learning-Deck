# Project Documentation

This folder is the home for the Hanafi Learning Deck's development, legal, planning, and operating documents.

The project began as a small personal card set and has grown into a broader Hanafi Islamic learning project. Documentation is treated as part of the build itself so important source, legal, design, review, deployment, and recovery decisions are not lost between development sessions.

## Start here

- [`CURRENT_HANDOFF.md`](CURRENT_HANDOFF.md) — **current recovery point**: repository state, current release, Web App surfaces, Tor mirror, Qur'an Reader, prayer tools, Media, Live, and exact project direction.
- [`COMPANY_BIBLE.md`](COMPANY_BIBLE.md) — governing rules for changes to this repository.
- [`roadmap.md`](roadmap.md) — current checkpoint, approved direction, and longer-term expansion plans.
- [`LEGAL_AND_SOURCE_POLICY.md`](LEGAL_AND_SOURCE_POLICY.md) — Qur'an/source/copyright policy, third-party material rules, and the documented Shariah disagreement over intellectual property.
- [`changelog.md`](changelog.md) — release/checkpoint history.
- [`build-notes.md`](build-notes.md) — technical notes and solved build/repair procedures.
- [`main-deck-continuation.md`](main-deck-continuation.md) — concept plan for future Main Deck continuation focused on everyday Islamic expressions and when to use them.
- [`digital-learning-roadmap.md`](digital-learning-roadmap.md) — digital study direction for the installable Web App, review tools, Arabic learning, spaced repetition, QR/deep links, classroom use, and other features.
- [`../quran/README.md`](../quran/README.md) — Qur'an Reader architecture, source plan, and page-by-page construction rules.

## Content and scholarly review

Content sourcing and scholarly review remain distinct from development mechanics:

- [`../AUDIT_AND_SOURCES.md`](../AUDIT_AND_SOURCES.md) — audit and source notes.
- [`../IMAM_REVIEW_NOTES.md`](../IMAM_REVIEW_NOTES.md) — corrections and imam/scholar review notes.
- Expansion-specific source notes remain inside their own expansion folders.

The separation is intentional:

- `docs/` records **how the project is governed, built, licensed, planned, resumed, deployed, and maintained**;
- audit/source files record **what the educational material teaches and why particular claims are supported**;
- the Qur'an Reader documentation records **which textual sources are used, how they are verified, and how the reader is assembled**.

## Current documentation checkpoint

Published baseline: **v2.0**

Active branch: **`main`**

**v2.0 is closed.** It added the Live Madrasas & Masjids discovery surface and completed the current Web App release cycle.

The next development cycle is **v2.1 — Font Identity & Web App UI overhaul**. Planned work includes the new Hanafi Learning Deck visual identity, richer Web App styling, display-font experimentation, redesigned controls, improved desktop information density, more prominent prayer information, card-to-study links where appropriate, and the planned Advanced Learner Library interface. These roadmap items still require the normal explicit approval gate before implementation.

Adhan playback remains future work and is no longer assigned to v2.1.

At this checkpoint the project documentation should preserve:

- the **209-card library across five independent sets**;
- the installable/offline **Web App**;
- local prayer calculations with **Hanafi ʿAṣr**;
- the page-by-page **Qur'an Reader**;
- **Makkah Live & Prayer Clock**;
- the Cesium-based **Holy Places Explorer**;
- the **Media** section;
- the **Live Madrasas & Masjids** directory introduced for v2.0;
- the `.onion` **Tor Mirror** as an alternate deployment of the same `main` project;
- automatic Tor-mirror checks from GitHub `main` through the host-side systemd timer;
- the dedicated legal/copyright/source policy;
- future Islamic Ruins & Lost Cities work;
- future educational game concepts;
- the normal approval gate for every new build or substantial change.

If context is lost, **read `CURRENT_HANDOFF.md` before doing anything else**.
