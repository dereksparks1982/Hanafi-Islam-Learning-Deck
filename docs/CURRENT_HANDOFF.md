# Current Project Handoff

## Purpose of this file

This document is the recovery point for the current development thread. It records the decisions that must survive if chat context is lost or work is resumed later.

**Active feature development is paused. Documentation work only has been performed at this checkpoint.**

## Repository state

Repository:

`dereksparks1982/Hanafi-Islam-Learning-Deck`

Published baseline:

`main` at v1.7

Development branch:

`feature/quran-reader`

The feature branch is intentionally isolated from `main`. Do not merge it or publish a new release without explicit maintainer approval.

The published card library remains **209 cards across five independent sets**:

- Main Deck: Card 00 + Cards 1–146 = 147
- Sacred Places Expansion: 19
- 99 Names of Allah Expansion: 12
- Arabic Alphabet Expansion: 28
- Important Places of the Muslim World: 3

## What the project has become

The project began as a small personal set of cards for learning Islam. As study progressed, the maintainer encountered the established Sunni schools of law and chose to build from a consistent **Hanafi** framework rather than unknowingly mix rulings.

That choice expanded the project from simple cards into a broader Islamic learning system concerned with:

- Hanafi fiqh and source accuracy
- Arabic literacy
- Qur'an study
- hadith and legal sourcing
- Islamic jurisprudence and the reasoning behind rulings
- sacred and historical places
- mobile/offline access
- transparent review and correction
- future prayer-time tools
- Islamic history/ruins material
- later educational games

The cards remain important, but they are no longer the complete scope of the project.

## Canonical product terminology

Use these names in user-facing project documentation:

- **Web App** = normal installable/offline GitHub Pages version
- **Tor Mirror** = `.onion` version

The source directory is currently named `web-viewer/`, but the user-facing product should be called the **Web App**.

The Qur'an Reader is a **reader/book/tome**, not a card deck or card expansion.

## Published Web App

Public Web App:

`https://dereksparks1982.github.io/Hanafi-Islam-Learning-Deck/`

Tor Mirror:

`http://hanafiiix6xddzpmjxbpns5svgoujdnjwf3ky4a72rzai5mumxm4mzqd.onion/`

The Web App must remain installable on supported phones through Home Screen installation and open in a standalone app-style window. No native App Store package is required for this goal.

## Qur'an Reader plan

The Qur'an Reader is the next implementation priority after documentation/source rules are settled.

### Presentation

Each ayah should appear as one study unit:

1. Arabic
2. Hanafi Learning Deck transliteration
3. English meaning

The reader should follow normal page-based book presentation rather than create thousands of cards.

### First prototype

Build **only Page 1 / Surah al-Fatihah first**.

Review before Page 2:

- Arabic typography
- ayah boundaries/references
- transliteration rules
- English alignment
- responsive phone layout
- desktop layout
- previous/next navigation
- jump-to-page and jump-to-surah structure
- offline caching
- source/provenance presentation
- Home Screen / standalone Web App behavior

Do not scale to the rest of the Qur'an until Page 1 is accepted.

### Arabic source architecture

Current intended approach:

- primary reference: verified **Hafs 'an 'Asim Madinah Mushaf** text associated with the King Fahd Glorious Qur'an Printing Complex tradition
- independent verification: **Tanzil Uthmani**
- page structure: standard **604-page Madinah Mushaf** structure, after exact page metadata is verified

Never silently alter Qur'anic Arabic. If authoritative references disagree, stop on that ayah and investigate.

### Transliteration

Create the transliteration in-project, page by page.

It should function as a pronunciation/reading aid for Hafs recitation and account for matters such as:

- long vowels
- hamzah and 'ayn
- emphatic letters
- shaddah
- hamzat al-wasl
- assimilation
- connected reading
- stopping where appropriate

The Quranic Arabic Corpus may be used as a word-level verification aid, but the finished transliteration should be project-created and reviewed.

### English meaning

Current preferred primary study rendering:

**Mufti Muhammad Taqi Usmani, _The Meanings of the Noble Qur'an_**

Before bulk inclusion, identify and document the exact edition/source.

Use other respected translations for comparison where needed, including Saheeh International and historical/public-domain translations such as Marmaduke Pickthall.

Do not describe any English translation as the Qur'an itself. The Arabic Qur'an is the revealed source; translation is human interpretation/rendering of meaning.

## Legal, copyright, and source policy

Dedicated policy:

[`LEGAL_AND_SOURCE_POLICY.md`](LEGAL_AND_SOURCE_POLICY.md)

The root README now contains a dedicated **Legal, licensing, copyright, and source policy** section and displays the **CC BY-NC-SA 4.0** license badge.

Core distinctions:

- the project does not claim ownership of the Qur'an itself;
- project-created original material is © 2026 Derek Sparks and licensed CC BY-NC-SA 4.0 where the project has the right to license it;
- third-party material does not automatically inherit the project's license;
- human translations, photographs, recordings, datasets, typography, metadata, and software are separate human works and should retain attribution/provenance;
- the project documents the contemporary Shariah disagreement over intellectual property rather than pretending there is one unanimous position;
- one documented position rejects the modern treatment of intangible knowledge as privately monopolizable property;
- another contemporary position, including major fiqh bodies, recognizes copyright and related rights under Shariah;
- restrictive terms should be documented rather than concealed;
- if a disputed human translation later becomes unusable, the project may replace it with an independently prepared rendering rather than compromise free access to the study material.

The Qur'an Reader should have no advertising, paywall, subscription, required account, or behavioral tracking.

## Prayer-time feature plan

A persistent prayer clock is approved for the roadmap.

### Local prayer clock

The Web App should eventually:

- request device location with permission;
- calculate prayer times for the user's local area;
- default to **Hanafi Asr**;
- provide manual location fallback;
- allow appropriate prayer-calculation method settings because Fajr/Isha conventions vary;
- show current prayer period;
- show next prayer;
- show a continuously ticking countdown;
- show the day's prayer schedule;
- roll automatically to the next prayer;
- use the user's local timezone;
- continue counting independently of any video player;
- where practical, keep calculated times/countdown working offline after location/settings are known.

### Makkah prayer clock

The live-feed page should separately show:

- current Makkah prayer period
- next Makkah prayer
- live countdown
- Makkah daily schedule
- Makkah timezone independent of user location

The timer is page UI, not part of the embedded stream. Pausing the live video must not pause the prayer countdown.

## Islamic Ruins & Lost Cities

This is a planned **historical Web App section, not a card expansion**.

First intended subject:

**Minaret of Jam / probable lost Ghurid Firuzkuh, Ghor Province, Afghanistan**

The entry should cover the remote river setting, Ghurid history, surviving minaret, remains of the wider settlement, erosion/flood/structural danger, and documented preservation status. Do not invent a specific collapse year.

Candidate later subjects include:

- Ancient Merv, Turkmenistan
- Samarra Archaeological City, Iraq
- Qal'at Bani Hammad, Algeria
- ruined caravan cities
- abandoned madrasas/manuscript centers
- forgotten observatories
- lost libraries
- fortresses/frontier settlements
- endangered minarets and mosques
- buried or partly excavated Islamic cities

Each article should document location, dynasty/period, what stood there, why it mattered, what survives, what disappeared, preservation status, maps, photographs where usable, and named sources.

## Educational arcade-game roadmap

Games are a later phase and must **not interrupt the Qur'an Reader build**.

Use classic gameplay concepts with original implementation/assets. Do not copy protected ROM art/audio/code.

Current concepts:

1. **Caravan Crossing** — Frogger-style crossing mechanics. First selected game prototype.
2. **Minaret Mosaic** — Q*bert-style tile-hopping mechanics.
3. **House of Knowledge** — maze/collection mechanics.
4. **Manuscript Restorer** — Breakout-style mechanics.
5. **Defender of the Library** — fixed-shooter mechanics with abstract/nonhuman hazards.
6. **Sabil** — Tapper-style water-service mechanics.
7. **City of Scholars** — excavation/tunneling mechanics inspired by Dig Dug.
8. **Crescent Observatory** — precision/astronomy mechanics.

Religious sensitivity:

- do not depict Prophet Muhammad ﷺ;
- do not make salah, Qur'an recitation, Hajj rites, or other sacred worship into irreverent score mechanics;
- prefer historical/environmental settings;
- do not cast real religious/ethnic communities as game enemies.

## Existing future content work

Still retained on the roadmap:

- Main Deck continuation, Everyday Islamic Speech, Cards 147–170 concept
- The Hanafi School: Origins, Method & Legacy
- The Prophets of Islam
- The Life of Prophet Muhammad ﷺ
- continuing Important Places cards one at a time
- deeper Arabic literacy material where it directly supports Qur'an/fiqh study
- manual audit and eventual qualified scholar/imam review

## Resume order

When the maintainer explicitly says to resume active development, follow this order unless he changes it:

1. verify/document Qur'an sources and transliteration rules;
2. build and review Page 1 / Surah al-Fatihah;
3. integrate the Qur'an Reader into the installable Web App and verify phone/offline behavior;
4. implement local and Makkah prayer-time architecture;
5. begin Islamic Ruins & Lost Cities with Jam/Firuzkuh;
6. return to approved card/deeper-study work;
7. eventually prototype Caravan Crossing.

## Stop condition

At this handoff checkpoint, **do not continue implementation work automatically**. The requested task was to update the README, roadmap, legal/source documentation, and preserve the current plan in GitHub. Further building requires a new explicit instruction from the maintainer.
