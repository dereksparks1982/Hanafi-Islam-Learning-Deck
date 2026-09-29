# Project Documentation

This folder contains the Hanafi Learning Deck's operating rules, release records, recovery handoff, roadmap, legal/source policy, build notes, and active development plans.

## Current state

- **Accepted published checkpoint:** **v2.4 — closed and accepted**
- **Active build:** **v2.5 — automatic public Media metadata and artwork onboarding**
- **v2.5 status:** candidate built, awaiting live runtime validation
- **Active and only branch:** `main`
- **Published card resources:** 222 across five sets

## Read in this order before project work

1. [`COMPANY_BIBLE.md`](COMPANY_BIBLE.md) — governing operating law and approval gates.
2. [`CURRENT_HANDOFF.md`](CURRENT_HANDOFF.md) — current recovery point and live project state.
3. [`roadmap.md`](roadmap.md) — accepted checkpoint, active authorized work, and future direction.
4. [`changelog.md`](changelog.md) — release/checkpoint history.
5. The release/build record relevant to the requested work.

## Current release and build records

- [`V2.4_CLOSEOUT.md`](V2.4_CLOSEOUT.md) — accepted v2.4 closeout, including the eight-film public Media state and stable playback boundary.
- [`V2.5_MEDIA_METADATA_AUTOMATION_PLAN.md`](V2.5_MEDIA_METADATA_AUTOMATION_PLAN.md) — active Plex/Emby/Jellyfin-style automatic movie metadata/artwork build.
- [`V2.3_MEDIA_ARTWORK_PLAN.md`](V2.3_MEDIA_ARTWORK_PLAN.md) — v2.3 artwork-manager record.
- [`V2.2_CLOSEOUT.md`](V2.2_CLOSEOUT.md) and [`V2.1_CLOSEOUT.md`](V2.1_CLOSEOUT.md) — earlier accepted checkpoints.

## Current Media documentation

- [`../media-server/DEPLOYMENT.md`](../media-server/DEPLOYMENT.md) — self-hosted Hanafi/Nougat Media architecture and current v2.5 metadata candidate.
- [`../media-server/deploy/update-v25-metadata.sh`](../media-server/deploy/update-v25-metadata.sh) — one-time v2.5 runtime transition helper. After that transition, adding a correctly named Hosted movie is intended to be automatic rather than a per-title deployment task.

The v2.4 accepted playback bridge is preserved byte-for-byte in `../server/hanafi-jellyfin-bridge-stable.py`. The active v2.5 wrapper layers discovery, metadata, and artwork on top of that stable playback implementation.

## Other important documentation

- [`LEGAL_AND_SOURCE_POLICY.md`](LEGAL_AND_SOURCE_POLICY.md) — Qur'an/source/copyright policy, third-party material rules, and Media/self-hosting distinctions.
- [`build-notes.md`](build-notes.md) — technical notes and solved build/repair procedures.
- [`main-deck-continuation.md`](main-deck-continuation.md) — future Main Deck continuation concepts.
- [`digital-learning-roadmap.md`](digital-learning-roadmap.md) — broader digital-learning direction.
- [`../quran/README.md`](../quran/README.md) — Qur'an Reader architecture, source plan, and page-by-page construction rules.
- [`../AUDIT_AND_SOURCES.md`](../AUDIT_AND_SOURCES.md) — educational-content audit/source notes.
- [`../IMAM_REVIEW_NOTES.md`](../IMAM_REVIEW_NOTES.md) — correction and imam/scholar review notes.

## Recovery rule

If context is lost, start with the **Company Bible** and **Current Handoff**. Do not infer the live runtime state from repository code alone. Repository changes to the media bridge are not considered live until saxondesktop has been updated and verified.
