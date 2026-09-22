# Current Project Handoff

## Purpose of this file

This document is the recovery point for the current development thread. It records the decisions that must survive if chat context is lost or work is resumed later.

## Repository state

Repository:

`dereksparks1982/Hanafi-Islam-Learning-Deck`

Active branch:

`main`

Current published checkpoint:

`v1.9`

Next reserved development cycles:

- `v2.0` — **Live Madrasas**
- `v2.1` — **Adhan playback**

These reservations are roadmap decisions, not automatic authorization to start either build.

The old `feature/quran-reader` and `gh-pages` workflow assumptions are obsolete. Current work is maintained directly on `main`, and the Web App is deployed through the current GitHub Pages workflow.

The published card library remains **209 cards across five independent sets**:

- Main Deck: Card 00 + Cards 1–146 = 147
- Sacred Places Expansion: 19
- 99 Names of Allah Expansion: 12
- Arabic Alphabet Expansion: 28
- Important Places of the Muslim World: 3

## Current product surfaces

Use these user-facing names:

- **Web App** = normal installable/offline GitHub Pages version
- **Tor Mirror** = `.onion` version
- **Qur'an Reader** = page-based reader/book system
- **Holy Places Explorer** = CesiumJS geographic study surface
- **Media** = project media area introduced in v1.9

The source directory remains `web-viewer/`, but user-facing documentation should call it the **Web App**.

Public Web App:

`https://dereksparks1982.github.io/Hanafi-Islam-Learning-Deck/`

Tor Mirror:

`http://hanafiiix6xddzpmjxbpns5svgoujdnjwf3ky4a72rzai5mumxm4mzqd.onion/`

## v1.9 closed — The Message (1976)

**v1.9 is officially closed and is the current published checkpoint.** Later source-quality improvements to *The Message* do not automatically reopen the release.

Current Media page:

`https://dereksparks1982.github.io/Hanafi-Islam-Learning-Deck/media/`

Completed for v1.9:

- English production of *The Message* (1976) through Google Drive embedded playback;
- separately filmed Arabic production **الرسالة / Al-Risalah (1976)**;
- **English / العربية** selection;
- current English project copy at **720p**;
- current Arabic standard copy at **360p**, with Arabic audio and Arabic subtitles burned into the picture;
- current Arabic alternate presentation at **480p**, with Arabic audio and English subtitles burned into the picture;
- the 480p Arabic alternate also contains additional explanatory text at the beginning and additional chanting/opening material, so it is not conceptually just a higher-resolution duplicate of the 360p copy;
- all three current project copies available through the public Media page;
- direct Google Drive fallback follows the selected copy;
- desktop Google Drive embedded playback retained because it works correctly;
- iPhone/iPad-specific layout and page-level full-screen workaround added so the Drive player remains usable on mobile, including a separate **Exit full screen** control;
- film information and study note;
- IMDb links for both productions;
- Wikipedia, Academy Awards, Turner Classic Movies, and Arabic-source provenance links;
- legal/source wording distinguishing project-created integration from third-party film/player content;
- root README reconciled to the v1.9 published checkpoint and opening duʿā ends with **Āmīn**;
- card-library sections made independently collapsible with local remembered state.

The current UI remains intentionally simple. The project may later refine Arabic edition-versus-quality labeling, add better source copies, or replace existing copies when genuinely better material is found. Those improvements are future Media maintenance unless explicitly assigned to a new release.

External subtitle files were not integrated into the current Google Drive embedded player. The current copies rely on subtitles already burned into the picture where present.

## Media-player attribution

The current Hanafi Learning Deck Media page uses **Google Drive embedded playback**.

It does **not** bundle VLC or libVLC.

The maintainer's separate Nougat media-player work may use VideoLAN technology, but that does not make VLC part of the current Hanafi Web App. If VLC/libVLC is later integrated directly, the applicable VideoLAN attribution and license information must be included.

## Card library navigation

All five card-set sections in the Web App are independently collapsible.

The browser remembers the open/closed state locally. Clicking a card-set navigation control should reopen the destination set when needed.

## v2.0 reservation — Live Madrasas

**v2.0 is reserved for Live Madrasas.**

The intended direction is a dedicated way to discover and watch useful live or regularly broadcast madrasa teaching with clear source identity, attribution, useful study labels, and sensible fallback behavior when feeds are offline.

Exact sources, interface, and implementation remain subject to explicit maintainer approval.

## v2.1 reservation — Adhan playback

**v2.1 is reserved for adhan playback.**

The existing prayer-time system already calculates local prayer times. v2.1 should focus on actually playing the adhan at the appropriate times while handling browser/PWA background limits honestly.

Exact audio, scheduling behavior, controls, and implementation remain subject to explicit maintainer approval.

## Prayer tools already implemented

Implemented:

- local prayer-time calculation;
- **Hanafi ʿAṣr**;
- selectable calculation methods;
- exact city lookup;
- device-location option;
- manual coordinates;
- current prayer period;
- next prayer and countdown;
- daily schedule;
- Makkah-specific prayer clock on the Makkah page.

## Holy Places Explorer

The Explorer uses CesiumJS and currently includes guided locations such as Masjid al-Haram, Mina, ʿArafāt, Muzdalifah, Jabal al-Nūr, Jabal Thawr, Masjid an-Nabawī, and Al-Aqsa Mosque.

Tor Browser compatibility is a required acceptance target.

A Tor failure caused by restricted WebGL depth-buffer/picking behavior was fixed by removing unnecessary depth-dependent operations rather than weakening Tor Browser privacy behavior.

The current viewer does not require real terrain clamping. If terrain is added later, marker placement and Tor compatibility must be retested.

## Qur'an Reader — page by page

The Qur'an Reader is a **normal page-based reader, not a card expansion**.

The first implemented construction page is Surah al-Fatihah.

The reader is a **long-running page-by-page project**. It is not a single build that is supposed to complete the entire Qur'an at once. Each page should be constructed, checked, and improved in sequence, and the work may take months.

The standard **604-page Madinah Mushaf structure** is the page framework and long-term reference structure only. It is not a promise that all 604 pages belong to one release target.

Each ayah should support:

1. Arabic Qur'an text
2. project-created transliteration
3. English meaning

Arabic Qur'an text must never be silently altered. Source/provenance decisions must remain explicit and reviewable.

## Unified card relationships

Future digital architecture should let cards link into relevant project content rather than leaving every feature isolated.

Conceptual relationship types:

- Qur'an
- places / Explorer
- hadith
- related cards
- media
- live feeds
- sources / further study

The printable PNG remains authoritative card artwork. Digital relationships are an additional study/navigation layer.

## Featured Mosques and Live Masjids

Future category:

**Featured Mosque**

This is for functioning mosques the project intentionally highlights without implying that they are sacred or historically famous.

First identified example:

- Islamic Society of Wichita — Wichita, Kansas, USA

`Live` should be treated as an attribute/badge where a reliable feed exists, not as the religious category itself.

Future live filters may include Video, Audio, Full Salah, Adhan/Recitation, Khutbah, and 24/7.

## Islamic Ruins & Lost Cities

This remains a planned historical Web App section.

First intended subject:

**Minaret of Jam / probable lost Ghurid Firuzkuh — Ghor Province, Afghanistan**

Each entry should include location, dynasty/period, significance, surviving remains, losses/destruction, preservation condition, maps, photographs where usable, and named sources.

## Existing future content work

Retained on the roadmap:

- Main Deck continuation / Everyday Islamic Speech;
- The Hanafi School: Origins, Method & Legacy;
- The Prophets of Islam;
- The Life of Prophet Muhammad ﷺ;
- continuing Important Places cards one at a time;
- deeper Arabic literacy where it directly supports Qur'an/fiqh study;
- qualified imam/scholar review;
- Islamic Ruins & Lost Cities;
- future educational games, with **Caravan Crossing** as the first selected game concept.

## Documentation / project management

The GitHub Wiki has been created and can later be polished into pages for Getting Started, Card Collections, Qur'an Reader, Prayer Tools, Makkah Live, Explorer, Media, Live Madrasas, Sources, Legal/Attribution, Roadmap, and Development History.

The same roadmap should also be represented visually in the maintainer's GitHub Project (`users/dereksparks1982/projects/1`) when project-board editing is available.

## Legal/source policy

Dedicated policy:

[`LEGAL_AND_SOURCE_POLICY.md`](LEGAL_AND_SOURCE_POLICY.md)

Core rules:

- no claim of ownership over the Qur'an itself;
- project-created original material is licensed CC BY-NC-SA 4.0 only where the project has the right to license it;
- third-party films, photos, recordings, translations, datasets, libraries, and services retain their own status/terms;
- source provenance should be preserved;
- Media embedding/hosting does not make a third-party film project property;
- the contemporary Shariah disagreement over intellectual property is documented rather than hidden;
- the project remains noncommercial and free of advertising, subscriptions, paywalls, and behavioral tracking by the Hanafi Learning Deck.

## Approval rule

Roadmap entries are plans, not automatic permission to build them.

The maintainer's explicit approval remains the gate for active implementation.
