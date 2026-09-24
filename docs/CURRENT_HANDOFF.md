# Current Project Handoff

## Purpose of this file

This document is the recovery point for the current development thread. It records the decisions that must survive if chat context is lost or work is resumed later.

## Repository state

Repository:

`dereksparks1982/Hanafi-Islam-Learning-Deck`

Active branch:

`main`

Current accepted and published checkpoint:

`v2.1`

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
- **Media** = project media area
- **Advanced Learner Library / Secret Library** = restricted advanced-study area under active development

The source directory remains `web-viewer/`, but user-facing documentation should call it the **Web App**.

Public Web App:

`https://dereksparks1982.github.io/Hanafi-Islam-Learning-Deck/`

Tor Mirror:

`http://hanafiiix6xddzpmjxbpns5svgoujdnjwf3ky4a72rzai5mumxm4mzqd.onion/`

## v2.1 accepted-state protections

The current accepted state is the baseline for new work.

- The Home page carries the canonical visible version marker, currently **v2.1**.
- The approved Home background and app emblem remain accepted assets.
- The devotional opening on Home is intended to present each invocation in the order **Arabic → transliteration → English meaning**. Arabic is gold and the block should use a consistent typographic system.
- The Media / *The Message* player is **locked**. Do not alter its accepted desktop iframe behavior, iPhone/iPad scaling workaround, full-screen handling, Exit-full-screen handling, or sizing while doing unrelated work.
- The *The Message* source/provenance block was intentionally removed because the maintainer cannot account for the provenance of every project copy and does not want to imply certainty that is not available.
- Future Media additions go around the accepted player rather than through it unless the maintainer explicitly requests a player change.

## Media — The Message (1976)

Current Media page:

`https://dereksparks1982.github.io/Hanafi-Islam-Learning-Deck/media/`

Implemented:

- English production of *The Message* (1976) through Google Drive embedded playback;
- separately filmed Arabic production **الرسالة / Al-Risalah (1976)**;
- **English / العربية** selection;
- multiple project copies selectable through the page;
- direct Google Drive fallback follows the selected copy;
- desktop Google Drive embedded playback retained because it works correctly;
- iPhone/iPad-specific player layout and page-level full-screen workaround retained because it is required for correct mobile control placement and usability;
- a separate **Exit full screen** control on the mobile workaround;
- film information and study note;
- Video / Audio Media tabs.

The accepted player code is now considered fragile and locked. Do not replace the iPhone-specific implementation with a superficially cleaner responsive iframe implementation: that regression previously moved Google Drive controls to the wrong place and broke accepted behavior.

External subtitle files are not integrated into the current Google Drive embedded player. Current copies rely on subtitles already present in the video where applicable.

## Media-player attribution

The current Hanafi Learning Deck Media page uses **Google Drive embedded playback**.

It does **not** bundle VLC or libVLC.

The maintainer's separate Nougat media-player work may use VideoLAN technology, but that does not make VLC part of the current Hanafi Web App. If VLC/libVLC is later integrated directly, the applicable VideoLAN attribution and license information must be included.

## Card library navigation

All five card-set sections in the Web App are independently collapsible.

The browser remembers the open/closed state locally. Clicking a card-set navigation control should reopen the destination set when needed.

## Advanced Learner Library / Secret Library

This is an approved direction now entering implementation.

Purpose:

- provide a separate environment for advanced, difficult, controversial, comparative, or research-oriented material;
- keep the ordinary learning path inviting and uncluttered;
- preserve the same source and review discipline used elsewhere in the project.

Visual direction:

- emerald, black-green, and gold scholarly library environment;
- Islamic arches and geometric lattice;
- bookshelves and stacked classical books;
- hanging lanterns;
- writing desk details such as ink, quill, scrolls, or manuscripts where appropriate;
- visually related to the main Hanafi Learning Deck identity, but recognizably its own deeper library space;
- the **locked gate** appears over the library environment;
- after a correct research key, the gate disappears and the user remains in the same library environment rather than being sent to an unrelated generic page.

Secrecy rule:

- public docs may name and describe the Advanced Learner Library;
- public docs must **not publish the hidden access gesture, click/tap count, research key, or equivalent unlock secret** unless the maintainer explicitly orders publication;
- source code necessarily contains client-side implementation details and is not a security boundary. The feature is an easter-egg/research gate, not protection for sensitive personal or confidential data.

Current implementation work is authorized for the hidden access path, gate, unlocked shell, and supporting visuals. Content population remains a separate future task unless specifically approved.

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
- future educational games, with **Caravan Crossing** as the first selected game concept;
- Advanced Learner Library content after its access shell and visual environment are accepted.

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
- source provenance should be preserved where provenance is actually known;
- do not invent or imply provenance for a project copy when it cannot be reliably accounted for;
- Media embedding/hosting does not make a third-party film project property;
- the contemporary Shariah disagreement over intellectual property is documented rather than hidden;
- the project remains noncommercial and free of advertising, subscriptions, paywalls, and behavioral tracking by the Hanafi Learning Deck.

## Approval rule

Roadmap entries are plans, not automatic permission to build them.

The maintainer's explicit approval remains the gate for active implementation.
