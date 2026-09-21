# Qur'an Reader

This directory is the beginning of the Hanafi Learning Deck **Qur'an Reader**: a normal book-style reader, not a card expansion.

Each ayah is presented as one three-layer study unit:

1. **Arabic Qur'an text**
2. **Hanafi Learning Deck transliteration**
3. **English meaning — Marmaduke Pickthall**

The first build contains only **Page 1 / Surah al-Fatihah** so the layout, typography, transliteration system, source handling, and installable Web App behavior can be reviewed before the rest of the Qur'an is assembled.

## Project principles

- no advertising
- no paywall
- no required account
- no behavioral tracking
- offline/local-first reading where the browser supports it
- Arabic text is never silently altered
- transliteration is created by this project and reviewed page by page
- English text uses a redistribution-safe source
- every ayah keeps its surah:ayah reference

## Sources

### Arabic

The production Arabic source is intended to be the **Tanzil Uthmani Qur'an text, version 1.1**, copied verbatim under Tanzil's Creative Commons Attribution 3.0 terms. Tanzil requires attribution, a link back to Tanzil, and prohibits changing its Qur'an text.

The Page 1 prototype Arabic has been checked against the Uthmani display for Surah al-Fatihah on Quran.com while the repository import pipeline for the Tanzil source is being prepared. Before this reader is merged as a completed Qur'an edition, the Arabic layer must be replaced or byte-verified against the chosen Tanzil source file and then treated as immutable source text.

Tanzil: https://tanzil.net/

### English

The English layer uses **Marmaduke Pickthall, _The Meaning of the Glorious Koran_**. Project Gutenberg eBook #16955 includes Pickthall's translation and marks the work public domain in the United States.

Project Gutenberg: https://www.gutenberg.org/ebooks/16955

### Transliteration

The transliteration layer is created by the Hanafi Learning Deck project. It is not copied wholesale from another transliteration edition. The working standard is documented in [`transliteration-rules.md`](transliteration-rules.md).

## Prototype status

**Page 1 is a prototype under review.** The Arabic, transliteration, English alignment, typography, navigation, and phone installation behavior should all be reviewed before Page 2 begins.
