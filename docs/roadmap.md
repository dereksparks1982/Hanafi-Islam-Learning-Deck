# Hanafi Learning Deck — Roadmap

## Current checkpoint: v1.7

The published project currently contains **209 cards across five independent sets**:

- **Main Deck:** 147 cards total, consisting of the Card 00 frontispiece plus numbered Cards 1–146
- **Sacred Places Expansion:** Cards 1–19
- **99 Names of Allah Expansion:** Cards 1–12
- **Arabic Alphabet Expansion:** Cards 1–28
- **Important Places of the Muslim World:** Cards 1–3 approved, expansion in progress

The project remains a **Hanafi study aid pending imam/scholar review**. A full manual word-by-word audit is also underway.

The project is no longer only a deck of cards. It began as a small personal set of cards for learning Islam, then expanded when the maintainer encountered the different Sunni schools of law and chose a consistent Hanafi framework. From there it grew into a broader Islamic learning project covering fiqh, worship, Arabic, Qur'an study, sacred and historical places, digital learning, source review, and planned educational tools.

The project now supports or plans multiple study surfaces: printable cards, mobile-friendly galleries, the installable offline **Web App**, the **Tor Mirror**, a Qur'an reader, Islamic history/ruins material, prayer-time tools, and later educational games.

## Documentation-only checkpoint

Active feature development is **paused** at this checkpoint. The purpose of the current branch is to preserve the decisions below before further implementation begins.

Current development branch:

`feature/quran-reader`

`main` remains the published v1.7 baseline until an explicitly reviewed build is ready.

When work resumes, the first implementation priority is the Qur'an Reader prototype described below. No unrelated feature build should jump ahead of that without explicit approval.

## v1.7 — Web App and closeout

v1.7 established the current live **Web App**, offline card download and refresh support, Home Screen installation support, explicit iPhone installation instructions, the Tor Mirror access path, and the current 209-card library.

The implementation directory is `web-viewer/`. The live Web App is published through the dedicated `gh-pages` branch while `main` remains the authoritative project branch.

The Web App must remain installable on supported phones so a learner can place it on the Home Screen and open it in a standalone app-style window without requiring an App Store package.

## Major planned work: Qur'an Reader

The Qur'an Reader is a **normal book-style reader, not a card expansion**.

Each ayah is intended to appear as one three-layer study unit:

1. Arabic Qur'an text
2. project-created transliteration
3. English meaning

### Source architecture

Current intended source stack:

- **Arabic primary reference:** verified Hafs 'an 'Asim Madinah Mushaf text associated with the King Fahd Glorious Qur'an Printing Complex tradition
- **Arabic independent verification:** Tanzil Uthmani
- **Page structure:** standard 604-page Madinah Mushaf structure, with exact page-boundary metadata verified before use
- **Transliteration:** original Hanafi Learning Deck transliteration, reviewed page by page
- **Transliteration aid:** Quranic Arabic Corpus may be used as a word-level verification tool
- **Primary English study rendering:** Mufti Muhammad Taqi Usmani, exact edition/source to be documented before bulk inclusion
- **English comparison sources:** respected translations such as Saheeh International and historical/public-domain renderings such as Marmaduke Pickthall when useful for checking difficult wording

The Arabic Qur'an is never silently altered. If authoritative Arabic references disagree, work stops on that ayah until the difference is understood.

### Prototype rule

Only **Page 1 / Surah al-Fatihah** should be implemented first.

The Page 1 prototype must establish and review:

- Arabic typography
- transliteration rules
- English alignment
- ayah references
- responsive phone layout
- larger desktop layout
- previous/next navigation
- jump-to-page / jump-to-surah structure
- offline caching behavior
- installable Web App behavior
- source/provenance display

Page 2 should not begin until the Page 1 design and source method are accepted.

### Longer-term reader features

After the prototype is approved, planned features include:

- all 604 Madinah Mushaf pages
- surah index
- search
- bookmarks
- Arabic-only / transliteration / English display controls
- local offline reading
- source and review metadata
- revision history
- optional approved human recitation/pronunciation audio where licensing and authenticity are suitable

Detailed Qur'an notes live in [`../quran/README.md`](../quran/README.md).

## Planned prayer-time system

The Web App should eventually include a prayer-time system inspired by the persistent countdown visible on the Makkah live-feed page.

### Local prayer countdown

The main Web App should be able to:

- request the user's location with permission;
- calculate local prayer times for that location;
- use **Hanafi Asr** as the project default;
- provide a manual city/location fallback if location permission is denied;
- allow appropriate prayer-calculation settings because Fajr/Isha conventions vary by region and authority;
- show the current prayer period;
- show the next prayer name;
- show a live countdown to the next prayer;
- show the day's full prayer timetable;
- automatically roll to the next prayer when the countdown reaches zero;
- respect the local timezone;
- continue counting even if an embedded video is paused.

Where practical, calculated prayer times and the countdown should continue to work offline after location/settings are known.

### Makkah countdown on the live-feed page

The Makkah live-feed page should separately show:

- the current Makkah prayer period;
- the next Makkah prayer;
- a live Makkah countdown;
- the Makkah daily prayer schedule;
- Makkah's own timezone regardless of the user's location.

The prayer clock must be page UI, independent of the live video player, so pausing or muting the feed does not stop the timer.

## Planned section: Islamic Ruins & Lost Cities

This is a **separate historical section, not a card expansion**.

The purpose is to document endangered, ruined, abandoned, buried, or partly lost places from Muslim history around the world.

Each entry should ideally contain:

- name and local/Arabic name where appropriate
- present location
- dynasty/period
- what originally stood there
- why the place mattered to Muslim history
- what survives today
- what disappeared or was destroyed
- reason for decline/abandonment when known
- preservation condition and current threats
- maps/location context
- photographs where usable
- named sources

### First planned feature

**Minaret of Jam / probable lost Ghurid Firuzkuh — Ghor Province, Afghanistan**

The Jam entry should cover the remote river-valley setting, the Ghurid period, the surviving minaret, evidence of the broader lost settlement, structural lean/erosion/flood danger, and preservation status without inventing a collapse timetable.

### Candidate later subjects

- Ancient Merv, Turkmenistan
- Samarra Archaeological City, Iraq
- Qal'at Bani Hammad, Algeria
- ruined caravan cities
- abandoned madrasas and manuscript centers
- forgotten observatories
- lost libraries
- Muslim fortresses and frontier settlements
- endangered minarets and mosques
- buried or partly excavated Islamic cities

This section may ultimately become one of the major historical arms of the Web App.

## Planned educational arcade games

Games are a future track and should **not interrupt the current Qur'an Reader build**.

The guiding rule is to use classic gameplay ideas while creating original code, names, maps, art, music, sound effects, timing, characters, and other expressive assets.

Current concepts:

1. **Caravan Crossing** — Frogger-style crossing mechanics. Travel through markets, roads, rivers, caravan routes, mountain passes, city gates, and similar environments. Safe destinations can include a masjid, madrasa, caravanserai, library, or city gate. Educational material should be light and never interrupt the game loop. This is the first selected game concept.
2. **Minaret Mosaic** — Q*bert-style tile-hopping mechanics built around geometric/architectural patterns.
3. **House of Knowledge** — maze/collection mechanics with a library and scholarship theme.
4. **Manuscript Restorer** — Breakout-style mechanics themed around recovering or restoring manuscript pages.
5. **Defender of the Library** — fixed-shooter mechanics using abstract/nonhuman hazards rather than casting real peoples or religious groups as enemies.
6. **Sabil** — Tapper-style service mechanics centered on distributing water.
7. **City of Scholars** — excavation/tunneling mechanics inspired by Dig Dug, reworked as archaeology/history rather than combat.
8. **Crescent Observatory** — precision/astronomy mechanics involving observation, timing, and celestial study.

Religious sensitivity rules:

- do not depict Prophet Muhammad ﷺ;
- do not turn salah, Qur'an recitation, Hajj rites, or other sacred worship into irreverent score mechanics;
- use respectful historical/environmental settings;
- use neutral environmental or abstract hazards rather than vilifying real communities.

## Legal and source policy

The project now has a dedicated legal/source document:

[`LEGAL_AND_SOURCE_POLICY.md`](LEGAL_AND_SOURCE_POLICY.md)

Important principles include:

- the project does not claim ownership of the Qur'an itself;
- human translations, transliterations, photographs, datasets, typography, code, and other third-party work are tracked separately;
- translators and sources should be credited clearly;
- source provenance and version information should be preserved;
- the repository acknowledges the documented contemporary Shariah disagreement over intellectual-property rights rather than pretending there is one unanimous Islamic position;
- public-domain, permissively licensed, or openly redistributable sources are preferred when they meet the scholarly standard;
- restrictive terms attached to a strong scholarly source are documented rather than hidden;
- source disputes should be answered transparently and, if necessary, disputed human wording can be replaced by independently prepared material;
- the Qur'an reader remains free of advertising, subscriptions, behavioral tracking, and commercial paywalls.

The repository's CC BY-NC-SA license applies to project-created material only to the extent the project has the right to license it. It does not automatically relicense third-party material.

## v1.6.x — Important Places of the Muslim World

This card expansion is for Muslim places that are historically, intellectually, culturally, politically, or architecturally important **without automatically claiming special religious sanctity**.

### Working method

Because the cards are visually and historically detailed, they are built **one card at a time**:

1. research the next subject;
2. choose the strongest visually representative image available for the card;
3. build one candidate card in the established photographic card style;
4. show the candidate before publication;
5. the maintainer screens the photograph, wording, border, layout, Arabic, sources, and overall visual quality;
6. only an explicitly approved card is uploaded;
7. then work begins on the next card.

### Approved cards

- **Card 1: Lal Masjid — Islamabad, Pakistan**
- **Card 2: Chinguetti Mosque — Chinguetti, Mauritania**
- **Card 3: Abu Hanifa Mosque — Baghdad, Iraq**

Approved final images are authoritative and must be uploaded unchanged unless the maintainer explicitly requests a revision.

No later Important Places card is assigned until the maintainer explicitly chooses the next subject.

## Planned Main Deck continuation — Everyday Islamic Speech

The Main Deck will eventually continue beyond Card 146 with a sequence teaching short Arabic expressions Muslims use throughout everyday life and **when to say them**.

The current concept runs from **Cards 147–170** and includes:

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
- the salam and its reply
- the Sunnah sneezing exchange
- Amin
- salawat on Prophet Muhammad ﷺ
- common Companion and scholar honorifics
- **Yalla versus Ya Allah**
- Allahu a'lam
- the seriousness of Wallahi and other oaths
- A'udhu billah

The detailed concept and review requirements live in [`main-deck-continuation.md`](main-deck-continuation.md).

These cards are not yet part of the published Main Deck. Arabic, transliteration, Qur'an/hadith sourcing, Hanafi legal detail, layout, and derived print materials must be reviewed before publication.

## Audit and scholarly review

The repository is being manually reviewed card by card, every word and every source.

Priorities:

- verify Hanafi fiqh claims against named Hanafi sources;
- check Qur'an and hadith references;
- check Arabic, transliteration, and English meaning;
- distinguish firm rulings from legitimate differences;
- remove vague sourcing;
- identify layout or legibility problems;
- collect corrections before changing cards in bulk;
- seek qualified imam/scholar review, especially for legal material.

The project is increasingly concerned not only with **what** a Hanafi ruling is but also **why**, what evidence and legal principle are used, where legitimate disagreement exists, and how conclusions are sourced. It remains a learning project, not a fatwa service.

## Planned expansion: The Hanafi School — Origins, Method & Legacy

A high-detail expansion devoted to the madhhab itself, including:

- Kufa and the scholarly environment in which the school developed
- Imam Abu Hanifa
- his teachers and students
- Abu Yusuf, Muhammad al-Shaybani, Zufar, and later transmitters
- Qur'an, Sunnah, ijma', qiyas, istihsan, and recognized legal principles
- major Hanafi books and jurists
- how authoritative positions developed
- historical spread through Muslim lands
- the Ottoman world, Central Asia, South Asia, Afghanistan, the Balkans, and elsewhere
- misconceptions about Hanafi fiqh
- a study path from beginner material toward advanced study

The number of cards will be determined by the material rather than an arbitrary cap.

## Planned expansion: The Prophets of Islam

A carefully sourced expansion covering the prophets named in the Qur'an, with attention to their peoples, major events, Qur'anic passages, lessons, relevant locations, chronology where evidence supports it, and a clear distinction between Qur'anic material, sound hadith, and later historical reports.

## Planned expansion: The Life of Prophet Muhammad ﷺ

A detailed chronological sirah expansion from birth to death. Important events should receive their own cards when the sources support doing so rather than compressing the life of the Prophet ﷺ into a tiny summary set.

Planned coverage includes childhood, Khadijah رضي الله عنها, the first revelation, early Muslims, persecution, Abyssinia, the boycott, Ta'if, Isra' and Mi'raj, 'Aqabah, Hijrah, Madinah, Badr, Uhud, the Trench, Hudaybiyyah, Khaybar, Mu'tah, the Conquest of Makkah, Hunayn, Tabuk, the Farewell Hajj, final illness, death, burial, and other well-attested events.

**Visual rule:** Prophet Muhammad ﷺ will not be depicted. No face, body, silhouette, shadow, outline, or stand-in figure will represent him. Cards will use locations, landscapes, maps, architecture, objects, manuscripts, routes, timelines, and environmental scenes instead.

## Arabic literacy

The Arabic Alphabet Expansion exists because learning to read Arabic opens the door to studying Qur'an, hadith, fiqh, classical texts, manuscripts, and Islamic scholarship in the language in which much of that tradition was written.

Future Arabic-learning material may be considered when it directly supports that study mission. The present approved Arabic set remains the 28-card alphabet expansion.

## Mobile and web learning

The physical cards remain first-class for schools, madrasas, mosques, classrooms, institutions, and learners who prefer paper, while an individual learner should eventually be able to carry the project's major study tools on a phone.

The detailed digital plan lives in [`digital-learning-roadmap.md`](digital-learning-roadmap.md).

Approved directions include:

- an installable offline **Web App**;
- card search, filters, deep links, bookmarks, and guided study paths;
- Qur'an Reader integration;
- local and Makkah prayer countdowns;
- Arabic-only / transliteration / English display controls;
- memorization and local spaced repetition;
- optional approved human pronunciation/recitation audio;
- Scholar Mode with source drawers and review metadata;
- a transparent review-status dashboard;
- an imam/scholar review interface;
- an Imam Review Pack generator;
- QR/deep-link bridges from printed cards to digital pages;
- classroom presentation and institution tools;
- printable lesson and study packs built from approved material;
- human-readable revision/correction history;
- offline/local-first progress with no required account, advertising, or behavioral tracking;
- Islamic Ruins & Lost Cities historical pages;
- later educational arcade games.

These directions should be implemented in controlled phases rather than as one uncontrolled bulk build.

## Numbering rule

Each card expansion begins at **Card 1** and keeps independent numbering. New cards append to that expansion after approval. The Main Deck is the exception because it is a single continuing sequence: future Main Deck cards continue after Card 146.

The Qur'an Reader, Islamic Ruins & Lost Cities, prayer-time tools, and games are **not card expansions** and do not use card numbering.

## Resume order

When active development resumes, the intended order is:

1. verify/document the Qur'an source stack and transliteration rules;
2. build and review Qur'an Page 1 / Surah al-Fatihah;
3. integrate the Qur'an Reader into the installable Web App and confirm phone behavior;
4. add the local/Makkah prayer-time architecture after the reader foundation is stable;
5. begin Islamic Ruins & Lost Cities with the Minaret of Jam / Firuzkuh feature;
6. return to additional card expansions and other Web App learning tools as approved;
7. treat **Caravan Crossing** as the first educational arcade-game prototype when the project reaches the games phase.
