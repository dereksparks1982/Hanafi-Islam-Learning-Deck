# Hanafi Learning Deck Web App

This directory contains the installable, local-first **Web App** for the Hanafi Learning Deck. The implementation directory remains `web-viewer/`; the user-facing product is the **Web App**.

## Current release state

- **Accepted published checkpoint:** **v2.4 — closed and accepted**
- **Active build:** **v2.5 — automatic public Media metadata and artwork onboarding**
- **v2.5 status:** candidate built, awaiting live runtime validation
- **Source branch:** `main` only
- **Deployment:** GitHub Pages through `.github/workflows/deploy-web-viewer-pages.yml`

## Current Web App surfaces

The current Web App includes:

- the 222-resource card library and offline-capable study support;
- Hanafi prayer-time tools;
- Qur'an Reader foundation;
- Makkah Live & Prayer Clock;
- Holy Places Explorer;
- Live, Links, Media, Charity, About, and Legal sections;
- **Majlis**, a direct doorway from Hanafi into Folkhold's community gathering space;
- the locked Advanced Learner Library;
- the current approved Home identity and devotional opening.

## Majlis and Folkhold

Hanafi and Folkhold remain separate complementary projects rather than being merged into one codebase. Hanafi is the learning, fiqh, worship, reference, and beneficial-knowledge side; Folkhold provides the broader community and gathering space.

The Home action row places **Majlis** immediately after **Media**. It opens Folkhold's Village Square using the source-aware route:

`https://dereksparks1982.github.io/folkhold/?from=hanafi#square`

The name **Majlis** was chosen deliberately because it means a gathering or sitting place without presenting this project as an accredited religious council. **Shura** was not used for that reason.

The `from=hanafi` marker is a breadcrumb for the companion project. A later Folkhold-side slice is intended to recognize that origin and offer a contextual **← Hanafi** route while preserving Folkhold's normal navigation. That return control is separate future work and is not part of the current Hanafi button change.

## Media

The accepted public Media player is exactly one DK Media-based browser player. The eight v2.4 public films were confirmed playing at closeout:

1. Al-Risalah (1976)
2. Aao Hajj Karein (2012)
3. Joseph in the Land of Egypt (1914)
4. Lion of the Desert (1981)
5. Pakistan (1950)
6. The Message (1976)
7. The Soviets and Islam (1972)
8. The Ten Commandments (1923)

v2.5 is removing the per-title hand-wiring process. The active candidate obtains public catalog metadata and poster state from the Hanafi bridge, uses the existing Nougat-integrated Jellyfin metadata/provider system, and creates future public movie cards from catalog records.

The accepted v2.4 playback bridge is preserved separately as `../server/hanafi-jellyfin-bridge-stable.py`; v2.5 layers discovery/metadata/poster behavior on top rather than replacing the known-working playback core.

Detailed build state: [`../docs/V2.5_MEDIA_METADATA_AUTOMATION_PLAN.md`](../docs/V2.5_MEDIA_METADATA_AUTOMATION_PLAN.md).

## Deployment boundary

GitHub Pages contains the Web App, not the movie files. Public movie payloads remain on saxondesktop and are delivered through HTTPS/Nginx to the local Hanafi bridge and Nougat-integrated Jellyfin backend.

The one-time v2.5 runtime transition helper is:

`../media-server/deploy/update-v25-metadata.sh`

Once that transition is accepted, placing a correctly named movie under the public Hosted library is intended to be the onboarding action. A future movie should not require another individual edit to the Web App's Media index, movie page, or public manifest.

## Project rules

The authoritative repository rules are in [`../docs/COMPANY_BIBLE.md`](../docs/COMPANY_BIBLE.md) and the current recovery state is in [`../docs/CURRENT_HANDOFF.md`](../docs/CURRENT_HANDOFF.md).

Third-party films, streams, imagery, libraries, and external services remain subject to their own source and licensing terms. See [`../docs/LEGAL_AND_SOURCE_POLICY.md`](../docs/LEGAL_AND_SOURCE_POLICY.md).
