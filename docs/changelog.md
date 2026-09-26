## v2.3 — Media artwork manager and movie-library refinement

- Closed and accepted by maintainer on 2026-09-25.
- Added the movie artwork-management workflow with automatic, selected, URL, and local artwork handling plus persistent IndexedDB storage.
- Established film-first movie cards and dedicated movie pages while preserving the accepted single DK Media player.
- Added local Movie Cards folder matching and manual artwork controls.
- Locked the movie-card fit rule: when source artwork does not fit the enclosure, clone/recreate the artwork at the correct card dimensions rather than repeatedly fighting it with CSS crop/zoom. Finished artwork must have no white bars and must preserve important title/artwork content.
- Locked cache behavior: deliberate artwork changes receive a new cacheKey; the current revision is cached locally so updates appear promptly without repeated remote downloads.
- Documented Plex-style metadata/artwork direction and future movie/TV-ready artwork architecture.
- Retained poster binaries outside GitHub by default.

# Changelog

## v2.2 — Media library and player refinement — closed

- Closed and accepted on 2026-09-25.
- Established the film-first poster-card/list Media library and dedicated film pages.
- Grouped The Message English and Urdu editions under one film while keeping Al-Risalah as its distinct Arabic production.
- Expanded the current library to Al-Risalah, Lion of the Desert, The Message, and The Ten Commandments (1923).
- Added IndexedDB artwork caching, film-specific artwork sources, and per-film crop/position handling.
- Corrected Al-Risalah artwork separation, Lion of the Desert framing, and The Ten Commandments artwork resolution.
- Refined the DK Media player to centered **<< / ^ / >>** transport, 10-second rewind/forward, wheel volume, fullscreen custom controls, and inactivity hiding without a separate center-screen Play overlay.
- Assigned **v2.3** as the next planned build, beginning with a Plex-inspired Media artwork/metadata manager plan.


## v2.1 — Web App identity, advanced library, and self-hosted Media — closed

- **Officially closed v2.1** as the current accepted and published checkpoint on 2026-09-25.
- Established the current Hanafi Learning Deck Web App visual family with the approved project icon, Home background, corrected mobile background treatment, revised Home branding/density, and Amarante display typography for the approved Home title/heading treatment.
- Kept the Home page as the canonical visible `v2.1` version surface.
- Added/consolidated dedicated **About**, **Legal**, and **Charity** areas and redirected older Contact/Zakat routes into the current structure.
- Kept voluntary Patreon project support in the Charity context rather than on the Home page, and did not present project support as Zakat.
- Replaced the old Google Drive iframe Media architecture with a self-hosted path from GitHub Pages through HTTPS/Nginx to the Hanafi media bridge and the selected Nougat/Jellyfin backend work on the maintainer's own computer.
- Kept movie payloads off GitHub and exposed only manifest-listed stable media IDs through the Hanafi bridge.
- Reused useful Nougat server work including HTTP byte-range delivery, local-file fallback, Jellyfin integration, FFmpeg H.264/AAC fallback, health/catalog endpoints, and SRT-to-WebVTT subtitle conversion.
- Did **not** import Nougat's Games, Live TV, World TV, Search, P2P, AI, radio, security tooling, or tactical/military desktop Player UI into Hanafi.
- Adopted the separate **DK Media Player** project as the behavioral/design base for the Hanafi browser player.
- Replaced the rejected stacked-player layout with **one video player total** whose media selector changes the source loaded into that one player.
- Added DK-style Web playback behavior including Play/Pause, −10 seconds, +30 seconds, seek timeline/time display, volume, playback speed, fullscreen, keyboard controls, remembered volume/speed, per-title resume position, and selected-source information.
- Added external sidecar subtitle playback for the currently configured single optional subtitle file per media item. SRT files are converted to WebVTT by the bridge and exposed by the player as an on/off subtitle choice.
- Recorded that multiple named external subtitle tracks per single media item are **not** a completed v2.1 feature.
- Current checked-in Media test entries at closeout are `ten-commandments-1923` and `the-message-1976-english`.
- Confirmed during v2.1 development that the public self-hosted route works end to end after the router destination was corrected to the actual reserved LAN address; *The Ten Commandments* played through the public Web App path.
- Added/reconciled media-server deployment, Certbot/IP-certificate, service, preparation, and smoke-test tooling around the accepted self-hosted architecture.
- Hardened the Tor mirror update path and added automatic mirror-update installation support.
- Updated the Company Bible, handoff, documentation index, build notes, legal/source policy, roadmap, deployment notes, QA record, and root README for the accepted v2.1 state.
- Removed obsolete one-time GitHub Actions workflows left from old Media and repair operations. The persistent Pages deployment and reusable media-server build/smoke-test workflow remain.
- The temporary Arabic/English hard-sub *The Message* YouTube copy that was still downloading at closeout was **not** added to the v2.1 manifest. It remains later Media work after the completed file is confirmed and explicitly authorized.
- No later public version number was assigned by the v2.1 closeout.

## v2.0 — Live Madrasas, Masjids & Islamic discovery — closed

- **Officially closed v2.0** as the Live discovery release before v2.1 work began.
- Added a dedicated **Live** Web App area instead of mixing live teaching and mosque resources into unrelated pages.
- Organized the published directory into **Madrasas**, **Masjids**, and **Islamic TV & discovery** groups.
- Began the Madrasa group with SeekersGuidance live classes and retained source links rather than presenting external platforms as project-owned content.
- Included Masjid al-Haram through the project's Makkah page and selected mosque live resources.
- Included Islam Channel Live and open discovery links with clear distinction between project-curated access and external religious instruction.
- Kept the rule that a remote mosque livestream is a viewing/study resource and does not make a remote viewer part of the local congregational prayer.
- Brought the Qur'an Reader, Makkah Live, Holy Places Explorer, Media, card previews, prayer schedule, navigation, offline shell, and visible versioning into the v2.0 release family.
- Preserved the no-advertising principle across the Live directory while acknowledging that external sites retain their own content, policies, and advertising behavior.
- Hardened the Tor mirror updater for the v2.0 Web App state.

## v1.9 — Media: The Message (1976)

- **Officially closed v1.9** as the current published checkpoint after the Media page was confirmed working on desktop and iPhone.
- Added the dedicated `/media/` route and linked it from the main Web App.
- Added separate viewing choices for the English production and the separately filmed Arabic production **الرسالة / Al-Risalah (1976)**.
- Added an **English / العربية** selector and current copy selector that switches the Google Drive embedded player and direct fallback link without changing the rest of the page.
- Current project copies are:
  - **English production · 720p**;
  - **Arabic standard copy · 360p**, Arabic audio with Arabic subtitles burned into the picture;
  - **Arabic alternate presentation · 480p**, Arabic audio with English subtitles burned into the picture, additional explanatory text at the beginning, and additional chanting/opening material.
- Recorded that the Arabic 480p alternate is not conceptually just a higher-resolution duplicate of the Arabic 360p copy because their presentation/timeline content differs.
- Confirmed current copies are available from the public Web App through Google Drive embedded playback.
- Kept desktop playback on the normal Google Drive player because it was already working correctly.
- Added an iPhone/iPad-specific layout workaround for Google's embedded player so the video and controls remain usable on smaller screens.
- Added page-level mobile full-screen handling with a separate **Exit full screen** control after the native/direct-video approach proved unreliable with the current Google Drive-hosted files.
- Kept **Open selected copy in Google Drive** as a separate fallback instead of using the player/full-screen control as a Drive-navigation shortcut.
- Added film information, cast/runtime context, a study note, and links to IMDb, Wikipedia, the Academy Awards, Turner Classic Movies, and Arabic-copy provenance.
- Kept the religious-source distinction explicit: the film is historical drama, not Qur'an, hadith, fiqh, a fatwa, or a substitute for sourced Seerah study.
- Updated the legal/source policy for third-party films, external hosting, Google Drive playback, provenance, and the distinction between project-created integration and third-party media.
- Kept VLC/Nougat attribution accurate for the v1.9 implementation: that Media page used a **Google Drive embed** and did **not** bundle VLC or libVLC.
- External `.srt` subtitle files were not integrated into the v1.9 Google Drive embedded player; those copies relied on subtitles already burned into the video where present.
- Better source copies of *The Message* could be added later without automatically reopening the v1.9 checkpoint.
- Added **Āmīn** to the closing line of the opening duʿā in the root README.
- Added independently collapsible card-set sections to the Web App so users no longer need to scroll through every card to reach another set; the local open/closed state is remembered by the browser.
- Reconciled current documentation with the `main`-only workflow and current Web App features.
- Reserved later roadmap milestones at the time; those reservations were subsequently superseded by the actual v2.0 and v2.1 release work.
- Clarified that the Qur'an Reader is a **long-running page-by-page project** that may take months rather than a single release intended to complete the entire Qur'an at once.

## v1.8 — Qur'an Reader, prayer tools, Makkah Live, and Holy Places Explorer

- Closed the **v1.8** checkpoint with the Web App expanded beyond card browsing into a broader Islamic learning surface.
- Integrated the first Qur'an Reader construction page, **Surah al-Fatihah**, with Arabic, project transliteration, English meaning, and display controls.
- Established the Qur'an Reader as a normal page-based reader rather than a card expansion.
- Added local prayer-time calculation with **Hanafi ʿAṣr**, current/next prayer information, countdowns, and daily schedule support.
- Added exact city lookup, device-location support, and manual-coordinate prayer calculation.
- Added **Makkah Live & Prayer Clock** as a dedicated Web App route.
- Added the CesiumJS-based **Holy Places Explorer** with guided Islamic locations and links back into the wider Web App.
- Preserved Tor Browser compatibility by removing unnecessary depth-buffer/picking behavior that hardened browsers could reject.
- Consolidated current Web App work on **`main`** and retired the old feature-branch / `gh-pages` development assumptions.
- Kept the Tor mirror as an alternate access path to the same project rather than a separate development branch.

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
