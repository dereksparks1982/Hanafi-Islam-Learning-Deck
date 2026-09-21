# Qur'an Reader

This directory contains the Hanafi Learning Deck **Qur'an Reader** work for the v1.8 development cycle: a normal book-style reader, not a card expansion.

The reader is intended to become a serious, auditable study edition presented **ayah by ayah** in three layers:

1. **Arabic Qur'an text**
2. **Hanafi Learning Deck transliteration**
3. **English meaning**

The first implementation target remains **Page 1 / Surah al-Fatihah** only. The layout, typography, transliteration system, source handling, page navigation, offline behavior, and phone Web App installation must be reviewed before Page 2 begins.

## Project principles

- no advertising
- no paywall
- no required account
- no behavioral tracking
- offline/local-first reading where the browser supports it
- Arabic Qur'an text is never silently altered
- every ayah keeps its surah:ayah reference
- source provenance and version information are preserved
- transliteration is created by this project and reviewed page by page
- translation is clearly identified as a human rendering of meaning, not the Arabic Qur'an itself
- source disagreements are documented instead of hidden

## Current source plan

### Arabic

The primary Arabic reference is intended to be a verified **Hafs 'an 'Asim Madinah Mushaf** text associated with the **King Fahd Glorious Qur'an Printing Complex** tradition.

**Tanzil Uthmani** is intended as an independent verification layer rather than the sole authority. The goal is to compare the Arabic ayah by ayah and stop for investigation if authoritative sources disagree rather than silently choosing one.

The reader is intended to follow the familiar **604-page Madinah Mushaf page structure**, subject to verification of the exact page-boundary metadata used by the project.

Arabic text is to be treated as immutable after verification except through an explicit correction process supported by authoritative evidence.

### Transliteration

The transliteration layer is created by the Hanafi Learning Deck project rather than copied wholesale from another transliteration edition.

It is intended as a pronunciation and reading aid for the Hafs recitation, not merely Roman-letter substitution. The working standard accounts for long vowels, hamzah, 'ayn, emphatic letters, shaddah, hamzat al-wasl, assimilation, connected reading, and stopping where appropriate.

The current project standard is maintained in [`transliteration-rules.md`](transliteration-rules.md).

The **Quranic Arabic Corpus** may be used as a word-level verification aid, but the finished transliteration remains project-created and is reviewed page by page.

### English meaning

The preferred long-term Hanafi study reference remains **Mufti Muhammad Taqi Usmani's _The Meanings of the Noble Qur'an_**, subject to identifying the exact edition and resolving reuse rights before any bulk inclusion.

For the current Page 1 prototype, **Marmaduke Pickthall's _The Meaning of the Glorious Koran_** is used as the redistribution-safe English layer, with source information recorded directly in the Page 1 data.

The project will not present any English translation as the Qur'an itself. The Arabic remains the revealed source text; English is a human attempt to convey meaning.

## Legal and source policy

The repository's position on Qur'an access, attribution, third-party translations, copyright disagreement in contemporary fiqh, and source disputes is documented in [`../docs/LEGAL_AND_SOURCE_POLICY.md`](../docs/LEGAL_AND_SOURCE_POLICY.md).

The project does not claim ownership of the Qur'an itself. Human translators and source editions are credited, provenance is preserved, and restrictive source terms are documented rather than hidden. If a disputed human rendering must later be replaced, the project may independently prepare replacement wording rather than compromise free access to the reader.

## Web App integration

The Page 1 prototype is now integrated into the same installable **Web App** as the card library.

Current v1.8 prototype behavior includes:

- a direct **Open Qur'an Reader** entry point from the main Web App;
- responsive phone and desktop reader layout;
- Arabic / transliteration / English display controls;
- ayah references for all seven verses of al-Fatihah;
- visible provenance/source information;
- Page 1 marked as **under review**;
- Page 2 intentionally disabled;
- Page 1 reader HTML, CSS, JavaScript, and JSON included in the v1.8 service-worker shell cache for offline access after the Web App has been installed/loaded successfully.

Planned later features remain:

- page-by-page reading after Page 1 approval
- surah index
- jump to page / jump to surah
- later search
- expanded source/review metadata

## Prototype status

**Page 1 / Surah al-Fatihah is now implemented as a v1.8 candidate prototype on `feature/quran-reader`, but it is not yet approved as a completed Qur'an page.**

The current review gate is deliberate. Before Page 2 begins, Page 1 should be checked for:

1. Arabic source integrity and permanent provenance;
2. transliteration accuracy against Hafs pronunciation;
3. English alignment and attribution;
4. typography and readability on desktop and phone;
5. layer-toggle behavior;
6. offline behavior through the Web App; and
7. overall reader presentation.

No later Qur'an page should be treated as approved merely because the Page 1 renderer can technically support additional data.
