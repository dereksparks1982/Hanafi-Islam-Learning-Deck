# Qur'an Reader

This directory contains the Hanafi Learning Deck **Qur'an Reader**: a normal book-style reader, not a card expansion.

The reader began during the v1.8 development cycle and is intended to remain a **long-running page-by-page project** rather than a single release that attempts to complete the entire Qur'an at once.

Each ayah is presented as a three-layer study unit:

1. **Arabic Qur'an text**
2. **Hanafi Learning Deck transliteration**
3. **English meaning**

**Page 1 / Surah al-Fatihah** is the first implemented construction page. Later pages are to be added one at a time, with source, transliteration, presentation, and review work continuing as the reader grows. This process may take months and is not tied to one version-number deadline.

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

## Page-by-page construction rule

The familiar **604-page Madinah Mushaf structure** is used as the page framework and long-term reference structure. It is **not** a commitment to build all 604 pages in one release or in one uninterrupted bulk operation.

The working method is:

1. prepare the next page;
2. verify the Arabic source text and page boundaries;
3. prepare and check the project transliteration;
4. align the English meaning and attribution;
5. review the page on phone and desktop;
6. record corrections and provenance;
7. then continue to the next page when ready.

A renderer being technically capable of displaying later pages does not make those pages complete or reviewed.

## Current source plan

### Arabic

The primary Arabic reference is intended to be a verified **Hafs 'an 'Asim Madinah Mushaf** text associated with the **King Fahd Glorious Qur'an Printing Complex** tradition.

**Tanzil Uthmani** is intended as an independent verification layer rather than the sole authority. The goal is to compare the Arabic ayah by ayah and stop for investigation if authoritative sources disagree rather than silently choosing one.

The reader follows the familiar **604-page Madinah Mushaf page structure**, subject to verification of the exact page-boundary metadata used by the project.

Arabic text is to be treated as immutable after verification except through an explicit correction process supported by authoritative evidence.

### Transliteration

The transliteration layer is created by the Hanafi Learning Deck project rather than copied wholesale from another transliteration edition.

It is intended as a pronunciation and reading aid for the Hafs recitation, not merely Roman-letter substitution. The working standard accounts for long vowels, hamzah, 'ayn, emphatic letters, shaddah, hamzat al-wasl, assimilation, connected reading, and stopping where appropriate.

The current project standard is maintained in [`transliteration-rules.md`](transliteration-rules.md).

The **Quranic Arabic Corpus** may be used as a word-level verification aid, but the finished transliteration remains project-created and is reviewed page by page.

### English meaning

The preferred long-term Hanafi study reference remains **Mufti Muhammad Taqi Usmani's _The Meanings of the Noble Qur'an_**, subject to identifying the exact edition and resolving reuse rights before any inclusion of that human translation.

For the current Page 1 implementation, **Marmaduke Pickthall's _The Meaning of the Glorious Koran_** is used as the redistribution-safe English layer, with source information recorded directly in the Page 1 data.

The project will not present any English translation as the Qur'an itself. The Arabic remains the revealed source text; English is a human attempt to convey meaning.

## Legal and source policy

The repository's position on Qur'an access, attribution, third-party translations, copyright disagreement in contemporary fiqh, and source disputes is documented in [`../docs/LEGAL_AND_SOURCE_POLICY.md`](../docs/LEGAL_AND_SOURCE_POLICY.md).

The project does not claim ownership of the Qur'an itself. Human translators and source editions are credited, provenance is preserved, and restrictive source terms are documented rather than hidden. If a disputed human rendering must later be replaced, the project may independently prepare replacement wording rather than compromise free access to the reader.

## Web App integration

The Qur'an Reader is integrated into the same installable **Web App** as the card library.

Current implemented behavior includes:

- a direct **Open Qur'an Reader** entry point from the main Web App;
- responsive phone and desktop reader layout;
- Arabic / transliteration / English display controls;
- ayah references for all seven verses of al-Fatihah;
- visible provenance/source information;
- Page 1 presented as the first construction/review page;
- reader HTML, CSS, JavaScript, and current page data included in the Web App's offline shell where supported.

Planned development, added gradually as the page-by-page work continues, includes:

- later Qur'an pages one at a time;
- surah index;
- jump to page / jump to surah;
- search when enough pages exist to make it useful;
- expanded source/review metadata;
- bookmarks and other reading tools where approved.

## Current status

**Page 1 / Surah al-Fatihah is the first implemented Qur'an Reader page on `main`.**

It remains subject to continued checking of:

1. Arabic source integrity and permanent provenance;
2. transliteration accuracy against Hafs pronunciation;
3. English alignment and attribution;
4. typography and readability on desktop and phone;
5. layer-toggle behavior;
6. offline behavior through the Web App; and
7. overall reader presentation.

Later pages should be treated the same way: constructed and reviewed page by page, not bulk-declared complete.
