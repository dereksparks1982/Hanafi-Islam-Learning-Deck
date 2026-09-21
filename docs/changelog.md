# Changelog

## v1.7 — Web Viewer, offline access, and closeout fixes

- Closed the **v1.7** checkpoint at **209 cards across five independent sets**.
- Published the live **Web Viewer** at `https://dereksparks1982.github.io/Hanafi-Islam-Learning-Deck/` with the current card library, set navigation, offline download, and deck refresh controls.
- Added install metadata and Home Screen support so the Web Viewer can open like an app on supported devices without requiring an App Store listing.
- Added explicit iPhone instructions for the Safari path: **••• → Share → Add to Home Screen → Open as Web App → Add**.
- Standardized public-facing documentation on the plain-language name **Web Viewer** rather than technical PWA terminology.
- Renamed the implementation directory from `pwa/` to `web-viewer/` and renamed the Pages deployment workflow to `.github/workflows/deploy-web-viewer-pages.yml` so repository naming matches the user-facing name.
- Retained the dedicated `gh-pages` publishing branch solely for the live Web Viewer while keeping `main` as the authoritative project branch.
- Added the **Tor Mirror** as an alternate access path while documenting that Tor Browser may restrict offline app storage.
- Corrected Main Deck Card 1 so **Prophet Muhammad ﷺ** includes the honorific in source and artwork.
- Added Arabic-font fallback rendering for **ﷺ** so the honorific displays correctly instead of appearing as a missing-glyph square.
- Rebuilt the affected Card 1 artwork, printable Sheet 1, and main contact sheet after the correction.
- Republished the Web Viewer after the Card 1 correction and verified the published Card 1 bytes matched the authoritative `main` copy.
- Standardized the displayed height of all six root README card previews so GitHub's mobile app presents the mixed card formats at a consistent visual size.
- Kept the project status explicit: the deck remains an educational study aid undergoing continued manual audit and pending qualified imam/scholar review.

## v1.6.4 — Abu Hanifa Mosque

- Added the approved **Important Places Card 3: Abu Hanifa Mosque — Baghdad, Iraq**.
- Published the card only after maintainer preview approval using the established Important Places one-card-at-a-time workflow.
- Used a real 2024 photograph of Abu Hanifa Mosque by **Ali.tinbo** from Wikimedia Commons under **CC BY-SA 4.0**, with attribution retained in the expansion documentation.
- Preserved the approved Important Places visual language: cream card, mosque-category red outer border, gold inner border, English/location left, Arabic and transliteration right, large real photograph, historical sections, and source line.
- Replaced **Lal Masjid** with **Abu Hanifa Mosque** in the root README showcase while keeping Lal Masjid in the Important Places expansion.
- Updated the visible project checkpoint to **v1.6.4** and the current library to **209 cards across five sets**, counting the Main Deck Card 00 frontispiece plus numbered Cards 1–146.
- Removed the temporary publishing workflow after Card 3 was rendered, verified at **1024×1536**, committed, and confirmed in the repository.

## v1.6.3 — Language reinforcement, access, and Sacred Places repair

- Closed the v1.6.3 checkpoint at **208 numbered cards across five independent sets**.
- Added the approved **Important Places Card 2: Chinguetti Mosque — Chinguetti, Mauritania**.
- Expanded title bars across the card library to reinforce **English + Latin transliteration + Arabic** through repeated exposure while studying.
- Repaired header collisions on Sacred Places Cards **1, 2, 4, 6, 10, 14, and 16** without changing their photographs, body text, borders, numbering, or category colors.
- Rebuilt only the Sacred Places printable sheets affected by those repairs and refreshed the Sacred Places contact sheet.
- Updated the title-building tool so future Sacred Places rebuilds reserve enough space between multi-line English titles and transliteration.
- Added a dedicated **Recommended learning links** section to the main README.
- Added the verified Hanafi salah/prayer tutorial playlist and retained both credited Language Simp Arabic-learning links on their original creator channels.
- Added the project web-viewer port as another way to study the deck beyond the raw repository/card files.
- Documented the successful **checkpointed repair workflow** in `docs/build-notes.md`: verify current main, isolate scope, repair locally, visually inspect, publish narrowly, verify, clean up, then continue.
- Added a dedicated acknowledgment of Allah at the beginning of the project README using the basmalah, praise of Allah, and salawat upon the Messenger of Allah ﷺ.
- Added **Card 00** as an unnumbered-on-artwork frontispiece displaying the Beautiful Names of Allah before the numbered lessons begin.
- Expanded **Main Deck Card 1 — ALLAH** so the large gold name remains central while the card now explains why Muslims call God Allah, distinguishes *ilāh* from Allah, connects the name to the God worshipped by the prophets, and anchors the explanation in Qur’an 20:14 and Surah al-Ikhlāṣ.
- **v1.6.4 is reserved for the next Important Places card.**

## v1.6 — Important Places begins

- Opened the **Important Places of the Muslim World** expansion as an active set.
- Approved **Card 1: Lal Masjid — Islamabad, Pakistan**.
- Established a strict one-card-at-a-time workflow for technically detailed photographic cards: preview, maintainer screening, explicit approval, exact-image upload, verification, then the next card.
- Added Arabic title labels at the far right of the main-deck headers on **145 of 146 cards**; Card 2 remains intentionally English-only.
- Preserved the existing card bodies pixel-for-pixel below the header while making the bilingual-header update.
- Added `source/main_deck_arabic_headers.json` so the Arabic header wording can be reviewed directly and corrected without hunting through image files.
- Rebuilt the 37 printable main-deck sheets and contact sheet from the updated cards.
- Added a `docs/` hub for the Company Bible, roadmap, changelog, and build/image-upload notes.
- Consolidated the solved binary-image workflow into `docs/build-notes.md`.
- Refreshed the main README around the project's current mission, present state, learning path, and future expansions.

## v1.5 — Arabic Alphabet Expansion

- Added the independent **28-card Arabic Alphabet Expansion**.
- Added pronunciation guidance, articulation notes, joining forms, example words, common-error warnings, printable sheets, source notes, QA material, manifest, and editable source/build files.
- Added the credited Language Simp pronunciation-video link as an external learning resource rather than copying/rehosting the video.
- Added a phone-friendly scrolling card view and later made displayed cards tap-to-open for full-resolution pinch zoom.
- Added the optional decorative card-back workflow and documented the successful precision-image repair method.

## v1.4 R3 — 99 Names of Allah

- Published the independent **12-card 99 Names of Allah Expansion**.
- Retained all 99 Names, nine Names per study card.
- Preserved Arabic, transliteration, concise English meanings, and source notes.
- Standardized the expansion's low-ink title/header treatment and printable sheets.

## v1.4 R2 — Sacred Places

- Converted Sacred Places from historical deck-wide numbering to an independent **Cards 1–19** expansion.
- Retained the approved large photographic artwork.
- Applied the v1.4 card-frame standard.
- Kept the expansion separate from the main deck.

## v1.4 R1 — Main Deck replacement

- Replaced the obsolete 145-card main deck with the current **146-card Main Deck**.
- Grouped multipart study sequences consecutively.
- Consolidated eating guidance into Cards 144–146.
- Rebuilt printable sheets, manifests, source numbering, and QA material.

## v1.3 — 99 Names foundation

- Added the 99 Names expansion structure and guide.
- Added all 99 Names with Arabic, transliteration, concise English study meanings, and source notes.

## v1.2 — Sacred Places foundation

- Added the 19-card Sacred Places expansion.
- Added the Sacred Places color key.
- Added 18 location cards covering major sacred, Hajj, Madinah, Al-Aqsa, and Seerah-related sites.

## v1.0 — Base Deck

- First public baseline.
- 145 cards.
- Added the Hanafi-school introduction, source lines, large headers, layout cleanup, movement descriptions, and a correction workflow for future imam/scholar review.
