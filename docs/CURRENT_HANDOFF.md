# Current Project Handoff

## Purpose of this file

This document is the recovery point for the current development thread. It records the decisions that must survive if chat context is lost or work is resumed later.

## Repository state

Repository:

`dereksparks1982/Hanafi-Islam-Learning-Deck`

Active branch:

`main`

Current development cycle:

`v1.9`

Current published checkpoint:

`v1.8`

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

## Current v1.9 focus — The Message (1976)

The v1.9 cycle is intentionally narrow.

Current Media page:

`https://dereksparks1982.github.io/Hanafi-Islam-Learning-Deck/media/`

Implemented:

- English version of *The Message* (1976) through Google Drive embedded playback;
- Arabic production **الرسالة / Al-Risalah (1976)** wired as a separate viewing choice;
- **English / العربية** selector;
- Arabic project copy uses Arabic audio with Arabic subtitles visible in the picture;
- film information and study note;
- IMDb links for both versions;
- Wikipedia, Academy Awards, Turner Classic Movies, and Arabic-source provenance links;
- legal/source wording distinguishing project-created integration from third-party film/player content;
- README updated for v1.9 and opening duʿā now ends with **Āmīn**.

Important verification item:

- the Arabic Google Drive file must be publicly viewable by an ordinary visitor before v1.9 is considered fully closed. The Drive file ID currently used by the Web App is `1aQTonzadJL55H9rw_RhBEo-FAMK0kAvN`.

## Media-player attribution

The current Hanafi Learning Deck Media page uses **Google Drive embedded playback**.

It does **not** bundle VLC or libVLC.

The maintainer's separate Nougat media-player work may use VideoLAN technology, but that does not make VLC part of the current Hanafi Web App. If VLC/libVLC is later integrated directly, the applicable VideoLAN attribution and license information must be included.

## Card library navigation

All five card-set sections in the Web App are independently collapsible.

The browser remembers the open/closed state locally. Clicking a card-set navigation control should reopen the destination set when needed.

## Prayer tools

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

Future work includes adhan support and honest handling of browser/PWA background limitations.

## Holy Places Explorer

The Explorer uses CesiumJS and currently includes guided locations such as Masjid al-Haram, Mina, ʿArafāt, Muzdalifah, Jabal al-Nūr, Jabal Thawr, Masjid an-Nabawī, and Al-Aqsa Mosque.

Tor Browser compatibility is a required acceptance target.

A Tor failure caused by restricted WebGL depth-buffer/picking behavior was fixed by removing unnecessary depth-dependent operations rather than weakening Tor Browser privacy behavior.

The current viewer does not require real terrain clamping. If terrain is added later, marker placement and Tor compatibility must be retested.

## Qur'an Reader

The Qur'an Reader is a **normal page-based reader, not a card expansion**.

The first implemented construction page is Surah al-Fatihah. The goal remains the complete standard **604-page Madinah Mushaf structure**.

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

The GitHub Wiki has been created and can later be polished into pages for Getting Started, Card Collections, Qur'an Reader, Prayer Tools, Makkah Live, Explorer, Media, Sources, Legal/Attribution, Roadmap, and Development History.

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
