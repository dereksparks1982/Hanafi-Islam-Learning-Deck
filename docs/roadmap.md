# Hanafi Learning Deck — Roadmap

## Current development cycle: v1.9

The project currently contains **209 cards across five independent sets**:

- **Main Deck:** 147 cards total, consisting of the Card 00 frontispiece plus numbered Cards 1–146
- **Sacred Places Expansion:** Cards 1–19
- **99 Names of Allah Expansion:** Cards 1–12
- **Arabic Alphabet Expansion:** Cards 1–28
- **Important Places of the Muslim World:** Cards 1–3 approved, expansion in progress

The project remains a **Hanafi study aid pending qualified imam/scholar review**. A full manual audit remains part of the work.

All current development is kept on **`main`**. The old feature-branch / `gh-pages` planning language is obsolete. GitHub Pages is built from the current `main` Web App workflow.

## What is already working

The project is now larger than the printed deck. Current implemented study surfaces include:

- the installable **Web App**;
- the 209-card library with independently collapsible card-set sections;
- offline card caching/update support where the browser permits it;
- local prayer-time calculation with **Hanafi ʿAṣr**;
- exact city lookup, device location, and manual-coordinate prayer calculation;
- **Makkah Live & Prayer Clock**;
- the **Holy Places Explorer** using CesiumJS;
- Tor Browser compatibility for the Explorer after removing unnecessary depth-buffer picking behavior;
- the page-based **Qur'an Reader** foundation with Surah al-Fatihah implemented as the first construction page;
- the **Media** area introduced in v1.9.

The Tor mirror is an alternate access path to the same project, not a separate development branch.

## v1.9 — Media: The Message (1976)

The v1.9 cycle is intentionally narrow. Its job is to establish the first Media entry cleanly before the Media area grows further.

Current v1.9 work:

- English version of *The Message* (1976) streamed through Google Drive;
- Arabic production **الرسالة / Al-Risalah (1976)** added as a separate viewing choice;
- **English / العربية** selector on the Media page;
- current English project copy presented at **720p**;
- current Arabic project copy presented at **360p** with Arabic audio and Arabic subtitles visible in the picture;
- film information and a clear study note distinguishing historical drama from Qur'an, hadith, fiqh, and sourced Seerah;
- links to relevant film-information sources and Arabic-copy provenance;
- README updated for v1.9;
- legal/source policy updated to cover films, external hosting, Google Drive playback, source provenance, and the distinction between project-created integration and third-party media;
- VLC/Nougat attribution wording kept accurate: the current Hanafi Media page uses a Google Drive embed and does **not** bundle VLC/libVLC.

Both selected movie copies have been tested from the public Web App and currently play successfully. Higher-quality copies may replace the current files later if suitable sources are found, without changing the basic English/Arabic selector design.

## v2.0 — Live Madrasas

**v2.0 is reserved for Live Madrasas.**

The goal is to create a dedicated way to discover and watch useful live or regularly broadcast madrasa teaching without mixing that work into v1.9.

Planned considerations include:

- verified madrasa identity and location;
- public live or scheduled teaching feeds;
- clear source links and attribution;
- useful labels such as live video, audio, lesson, Qur'an, fiqh, Arabic, or other study categories where appropriate;
- reliable fallbacks when a stream is offline;
- no advertising inserted by the Hanafi Learning Deck;
- links back into relevant cards, Qur'an pages, places, or sources when there is a genuine study relationship.

The exact interface and source list remain subject to the normal approval gate.

## v2.1 — Adhan playing

**v2.1 is reserved for adhan playback.**

The existing prayer-time system already calculates local prayer times and countdowns. v2.1 should focus on actually playing the adhan at the appropriate prayer times while documenting platform limits honestly.

Planned work includes:

- user-controlled adhan enable/disable;
- local prayer-time integration;
- appropriate handling of Fajr versus other prayers if separate audio is used;
- volume/playback controls;
- selected human adhan recording with clear provenance and permission/licensing information;
- investigation of the most reliable background/native scheduling path available;
- honest fallback behavior where browsers or PWAs cannot guarantee closed-app playback.

## Unified card-to-content relationships

A major future direction is to make cards doorways into the rest of the learning system instead of leaving every feature isolated.

Conceptual relationship model:

```text
CARD
  id
  set
  title
  links:
    quran[]
    places[]
    hadith[]
    cards[]
    media[]
    live[]
    sources[]
```

This relationship layer can eventually power:

- relevant Qur'an passages;
- Holy Places Explorer locations;
- live feeds;
- media entries;
- hadith and named sources;
- related cards;
- further-reading links;
- QR/deep-link bridges from printed cards;
- digital “related study” panels.

The printable PNG remains the authoritative card artwork. Digital relationships are an added navigation/study layer rather than a replacement for the card image.

## Featured Mosques

A future card/category concept is **Featured Mosque**.

This category is for functioning mosques the project intentionally highlights without implying that the mosque is sacred, uniquely holy, or historically famous.

A mosque may also carry attributes such as **Live** when a reliable public stream exists.

First identified example:

- **Islamic Society of Wichita — Wichita, Kansas, USA**

The project may note its particular significance to the maintainer if that personal context is intentionally made public.

## Live Masjids

A future live-media layer can organize reliable mosque streams by useful attributes rather than making “live” itself a religious category.

Possible filters include:

- Video
- Audio
- Full Salah
- Adhan / Recitation
- Khutbah
- 24/7

Where relevant, a Featured Mosque or other place entry should link directly to its live feed.

A remote livestream is a study/viewing resource; it should not be presented as making a remote viewer part of the local congregational prayer.

## Qur'an Reader — long-running page-by-page project

The Qur'an Reader is a **normal book-style reader, not a card expansion**.

Each ayah is intended to appear as a layered study unit:

1. Arabic Qur'an text
2. project-created transliteration
3. English meaning

The reader is a **page-by-page project**. It is not a single build in which the entire Qur'an will suddenly be completed. Each page should be constructed, checked, and improved in sequence, and the work may continue for months.

Surah al-Fatihah is the first implemented construction page. The familiar **604-page Madinah Mushaf structure** is the page framework and long-term reference structure, not a promise that all 604 pages are the next release target.

Planned reader development includes, over time:

- continuing one page at a time;
- surah index;
- page/surah navigation;
- search when enough content exists to make it useful;
- bookmarks;
- Arabic-only / transliteration / English display controls;
- local offline reading;
- source and review metadata;
- revision history;
- optional approved human recitation/pronunciation audio where licensing and authenticity are suitable.

Arabic source text must never be silently altered. Source/provenance rules live in the Qur'an documentation and legal/source policy.

## Prayer tools after v2.1

The local prayer-time system is already implemented in the Web App with selectable calculation methods and Hanafi ʿAṣr.

After the dedicated v2.1 adhan work, later prayer improvements can include continued comparison against trusted local timetables and refinements to platform-specific scheduling as needed.

Local prayer calculations must remain separate from the Makkah live-page clock.

## Holy Places Explorer

The Cesium-based Explorer currently provides guided locations including Masjid al-Haram, Mina, ʿArafāt, Muzdalifah, Jabal al-Nūr, Jabal Thawr, Masjid an-Nabawī, and Al-Aqsa Mosque.

Planned directions include:

- linking relevant cards directly to Explorer locations;
- adding appropriate Important Places where geographic exploration adds value;
- preserving Tor Browser compatibility as an acceptance requirement;
- maintaining attribution for CesiumJS, imagery providers, and the MIT-licensed God's Eye View concepts used as technical inspiration.

The current viewer does not require depth-dependent terrain picking. If real terrain is added later, marker placement and Tor compatibility must be retested rather than blindly restoring clamp-to-ground behavior.

## Islamic Ruins & Lost Cities

This is a **separate historical section, not automatically a card expansion**.

The purpose is to document endangered, ruined, abandoned, buried, or partly lost places from Muslim history.

Each entry should ideally contain:

- name and local/Arabic name where appropriate;
- present location;
- dynasty/period;
- what originally stood there;
- why the place mattered to Muslim history;
- what survives today;
- what disappeared or was destroyed;
- reason for decline/abandonment when known;
- preservation condition and current threats;
- maps/location context;
- photographs where usable;
- named sources.

First planned feature:

- **Minaret of Jam / probable lost Ghurid Firuzkuh — Ghor Province, Afghanistan**

Later candidates include Ancient Merv, Samarra Archaeological City, Qal'at Bani Hammad, ruined caravan cities, abandoned madrasas/manuscript centers, forgotten observatories, lost libraries, Muslim fortresses/frontier settlements, endangered minarets/mosques, and buried or partly excavated Islamic cities.

## Important Places of the Muslim World

This card expansion covers places important to Muslim history, scholarship, culture, politics, or architecture **without automatically claiming special religious sanctity**.

Approved current cards:

- **Card 1: Lal Masjid — Islamabad, Pakistan**
- **Card 2: Chinguetti Mosque — Chinguetti, Mauritania**
- **Card 3: Abu Hanifa Mosque — Baghdad, Iraq**

The one-card-at-a-time review gate remains in force. No later Important Places card is assigned merely because it appears on a candidate list.

## Main Deck continuation — Everyday Islamic Speech

The Main Deck is intended eventually to continue beyond Card 146 with short Arabic expressions Muslims use in daily life and guidance on when to say them.

The working concept includes material such as:

- Bismillah
- Alhamdulillah
- In sha' Allah
- Ma sha' Allah
- Subhanallah
- Allahu Akbar
- Astaghfirullah
- La ilaha illa Allah
- La hawla wa la quwwata illa billah
- Hasbunallahu wa ni'ma al-Wakil
- Inna lillahi wa inna ilayhi raji'un
- Jazakallahu khayran
- Barakallahu fik
- salam and its reply
- Sunnah sneezing exchange
- Āmīn
- salawat on Prophet Muhammad ﷺ
- common Companion and scholar honorifics
- Yalla versus Ya Allah
- Allahu a'lam
- seriousness of Wallahi and other oaths
- A'udhu billah

These are planned cards, not part of the current published 209-card library.

## Planned expansions

### The Hanafi School — Origins, Method & Legacy

A detailed expansion devoted to the madhhab itself, including Imam Abu Hanifa, Kufa, teachers/students, Abu Yusuf, Muhammad al-Shaybani, Zufar, later jurists, legal principles, major books, development of authoritative positions, historical spread, and study paths.

### The Prophets of Islam

A carefully sourced expansion covering prophets named in the Qur'an, their peoples, major events, Qur'anic passages, lessons, relevant locations, and a clear distinction between Qur'anic material, sound hadith, and later reports.

### The Life of Prophet Muhammad ﷺ

A detailed chronological Seerah expansion from birth to death, with important events receiving their own cards where sources support it.

**Visual rule:** Prophet Muhammad ﷺ will not be depicted. No face, body, silhouette, shadow, outline, or stand-in figure will represent him. Locations, landscapes, maps, architecture, objects, manuscripts, routes, timelines, and environmental scenes should be used instead.

## Educational games

Games remain a later track and should not displace core study tools.

Current concepts include:

1. **Caravan Crossing** — first selected prototype; crossing/travel mechanics through markets, roads, rivers, caravan routes, mountain passes, and city gates.
2. **Minaret Mosaic** — geometric tile-hopping mechanics.
3. **House of Knowledge** — maze/collection mechanics with a library theme.
4. **Manuscript Restorer** — manuscript-recovery arcade mechanics.
5. **Defender of the Library** — fixed-shooter mechanics using abstract/nonhuman hazards.
6. **Sabil** — service mechanics centered on distributing water.
7. **City of Scholars** — archaeology/tunneling mechanics.
8. **Crescent Observatory** — astronomy/precision mechanics.

Religious sensitivity rules remain mandatory: do not depict Prophet Muhammad ﷺ, do not turn sacred worship into irreverent score mechanics, and do not cast real peoples or religious communities as game enemies.

## Documentation, Wiki, and project tracking

The repository README should remain a concise public front door. Detailed documentation belongs in `docs/`, the Qur'an source notes, expansion notes, and the GitHub Wiki.

The GitHub Wiki can eventually provide polished pages for:

- Home / Getting Started
- Card Collections
- Qur'an Reader
- Prayer Tools
- Makkah Live
- Holy Places Explorer
- Media
- Featured Mosques / Live Masjids
- Live Madrasas
- Sources & Review
- Legal / Attribution
- Roadmap
- Development History

The same roadmap should also be represented visually in the maintainer's GitHub Project so current, completed, and future work can be seen without reading the entire Markdown roadmap.

## Legal and source policy

The project has a dedicated legal/source document:

[`LEGAL_AND_SOURCE_POLICY.md`](LEGAL_AND_SOURCE_POLICY.md)

Core rules include:

- the project does not claim ownership of the Qur'an itself;
- human translations, transliterations, photographs, datasets, typography, code, films, recordings, and other third-party work are tracked separately;
- translators and sources should be credited clearly;
- source provenance and version information should be preserved;
- the documented contemporary Shariah disagreement over intellectual-property rights is acknowledged rather than hidden;
- public-domain, permissively licensed, or openly redistributable sources are preferred when they meet the scholarly standard;
- third-party media does not become project property because it is hosted, embedded, linked, or presented inside project-created UI;
- the core project remains free of advertising, subscriptions, behavioral tracking, and commercial paywalls.

The repository's CC BY-NC-SA license applies to project-created material only to the extent the project has the right to license it.

## Audit and scholarly review

The repository should continue to be manually reviewed card by card, page by page, and source by source.

Priorities:

- verify Hanafi fiqh claims against named Hanafi sources;
- check Qur'an and hadith references;
- check Arabic, transliteration, and English meaning;
- distinguish firm rulings from legitimate differences;
- remove vague sourcing;
- identify layout or legibility problems;
- collect corrections before changing cards in bulk;
- seek qualified imam/scholar review, especially for legal material.

The project is increasingly concerned not only with **what** a Hanafi ruling is but also **why**, what evidence and legal principles are used, where legitimate disagreement exists, and how conclusions are sourced. It remains a learning project, not a fatwa service.

## Approval rule

Roadmap entries are plans, not automatic authorization to build them.

Implementation remains subject to the normal project approval gate. A future item does not become an active build merely because it appears here.
