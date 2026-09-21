# Qur'an Reader

This directory is the beginning of the Hanafi Learning Deck **Qur'an Reader**: a normal book-style reader, not a card expansion.

The reader is intended to become a serious, auditable study edition presented **ayah by ayah** in three layers:

1. **Arabic Qur'an text**
2. **Hanafi Learning Deck transliteration**
3. **English meaning**

The first implementation target remains **Page 1 / Surah al-Fatihah** only. The layout, typography, transliteration system, source handling, page navigation, offline behavior, and phone Web App installation should be reviewed before Page 2 begins.

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

The transliteration layer will be created by the Hanafi Learning Deck project rather than copied wholesale from another transliteration edition.

It is intended as a pronunciation and reading aid for the Hafs recitation, not merely Roman-letter substitution. The standard should account for matters such as long vowels, hamzah, 'ayn, emphatic letters, shaddah, hamzat al-wasl, assimilation, connected reading, and stopping where appropriate.

The **Quranic Arabic Corpus** may be used as a word-level verification aid, but the finished transliteration remains project-created and is reviewed page by page.

### English meaning

The present preferred primary study rendering is **Mufti Muhammad Taqi Usmani's _The Meanings of the Noble Qur'an_**, because the project is intentionally Hanafi-oriented and his translation is closely connected to that scholarly tradition.

Before bulk inclusion, the exact edition and source must be identified and documented. Other respected English translations, including Saheeh International and historical/public-domain translations such as Marmaduke Pickthall, may be used as comparison sources when wording requires review.

The project will not pretend that any English translation is the Qur'an itself. The Arabic remains the revealed source text; English is a human attempt to convey meaning.

## Legal and source policy

The repository's position on Qur'an access, attribution, third-party translations, copyright disagreement in contemporary fiqh, and source disputes is documented in [`../docs/LEGAL_AND_SOURCE_POLICY.md`](../docs/LEGAL_AND_SOURCE_POLICY.md).

The project does not claim ownership of the Qur'an itself. Human translators and source editions are credited, provenance is preserved, and restrictive source terms are documented rather than hidden. If a disputed human rendering must later be replaced, the project may independently prepare replacement wording rather than compromise free access to the reader.

## Web App target

The Qur'an Reader is intended to become part of the same installable **Web App** as the card library, so a learner can place the project on a phone Home Screen and open it in an app-style standalone window without an App Store installation.

Planned reader features include:

- page-by-page reading
- surah index
- jump to page / jump to surah
- ayah references
- responsive phone and desktop layout
- offline reading after required data has been cached
- Arabic / transliteration / English display controls
- later search and source/review metadata

## Prototype status

**Development is currently paused at the documentation stage. No Page 1 reader implementation has been approved as complete.**

When development resumes, source rules should be finalized first, then Page 1 / Surah al-Fatihah should be built and reviewed before the project scales to later pages.
