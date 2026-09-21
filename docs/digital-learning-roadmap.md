# Digital Learning Roadmap

## Purpose

The physical cards remain valuable for schools, madrasas, mosques, classrooms, institutions, families, and learners who prefer printed material. The digital edition should remove the need for an individual learner to carry hundreds of physical cards while preserving the same authoritative card content.

The digital system should feel like the Hanafi Learning Deck itself, not a generic flash-card app wrapped around image files.

## Core rule

The repository's approved card PNGs and reviewed source material remain authoritative. Digital interfaces are study layers built on top of them.

No digital feature should silently rewrite religious content.

## 1. Offline installable Web Viewer

Continue developing the **Web Viewer** as the project's installable, local-first digital study surface:

- place it on a phone or tablet Home Screen where the browser/platform supports that behavior;
- cache the complete card library for offline use;
- open without an Internet connection after the offline library is downloaded;
- update the deck when the learner chooses;
- no advertising;
- no tracking required;
- no account required for basic study;
- retain a compact travel mode so the complete text/card collection can live on a phone without carrying the printed deck.

A visible **Download for Offline Use** control should make the offline state obvious rather than relying on browser behavior the learner cannot see.

On iPhone, the Web Viewer should clearly explain Apple's installation path: **Safari → ••• → Share → Add to Home Screen → Open as Web App → Add**.

## 2. Scholar Mode

Every card should have an optional scholarly/source drawer containing, where applicable:

- exact Qur'an reference;
- hadith collection/reference;
- named Hanafi fiqh source;
- Arabic source text when appropriate;
- transliteration notes;
- translation notes;
- known legitimate differences;
- card revision/version;
- date last reviewed;
- review status.

Normal study mode remains clean. Scholar Mode exposes the evidence beneath the card without crowding the artwork.

## 3. Review-status system

Cards should be capable of carrying independent review states such as:

- Maintainer checked
- Arabic checked
- Hanafi fiqh checked
- Hadith/source checked
- Qualified imam/scholar reviewed
- Correction pending

The interface should never imply scholarly approval that has not actually occurred.

A project-level dashboard can summarize the current state, for example:

`209 cards • maintainer/review counts generated from real metadata`

Counts must be generated from real metadata, never hand-written marketing numbers.

## 4. Imam / scholar review dashboard

Provide a dedicated review interface designed for someone checking many cards efficiently:

- filter by unreviewed cards;
- filter by fiqh, Arabic, Qur'an, hadith, history, or general content;
- open card and sources side by side;
- mark approved / correction needed / question;
- enter a correction note;
- preserve reviewer name, role, date, and exact reviewed version when permission is given;
- export unresolved corrections.

The reviewer should not need to understand GitHub to review the deck.

## 5. Imam Review Pack generator

Generate a printable or digital review packet containing for every selected card:

- card image;
- card number and title;
- exact teaching text;
- Arabic and transliteration;
- source list;
- current review status;
- fields for Approved / Correction needed / Comment;
- version and date.

This can be used by an imam who prefers paper, PDF, or a simple document rather than the web interface.

## 6. QR / deep-link bridge between print and digital

Every physical card can eventually have a stable digital URL and optional QR code.

Scanning a printed card should open that exact card in the Web Viewer, not merely the project's front page.

The digital page can then provide:

- full-resolution card;
- larger Arabic;
- sources;
- audio;
- related cards;
- correction/revision history;
- study exercises.

QR codes should be introduced only in a way that does not ruin the approved visual design of existing cards.

## 7. Arabic Learning Mode

Allow the learner to control how much help is visible:

- Arabic only;
- Arabic + transliteration;
- Arabic + English;
- all three;
- tap an Arabic expression to reveal pronunciation guidance;
- hide transliteration after recognition improves;
- optional word-by-word breakdown for selected Qur'an and duʿā material.

This directly supports the title-bar principle already adopted by the project: repeated Arabic exposure should slowly turn unfamiliar script into recognized language.

## 8. Audio layer

Where appropriate, cards may gain optional audio for:

- Arabic letters and sounds;
- Qur'anic passages;
- duʿā;
- adhkār;
- common Islamic expressions;
- pronunciation comparisons.

For sacred text and religious formulas, final audio should come from an appropriate human reciter/speaker or another source explicitly approved for the project rather than being treated casually as generic generated speech.

Audio must remain optional so the complete core deck still works silently and offline.

## 9. Memorization and spaced repetition

The Web Viewer should support active recall rather than only browsing images.

Possible exercise types:

- show Arabic, recall the meaning;
- show English, recall the Arabic phrase;
- hide transliteration until requested;
- identify the correct situation for a duʿā;
- put salah actions in order;
- select the correct reply to a greeting or sneeze;
- identify a sacred/important place from an image;
- recall Names of Allah;
- recognize Arabic letters and joining forms.

Use a local spaced-repetition queue so missed material returns more often and mastered material appears less frequently.

Progress should be stored locally by default and should not require an account.

## 10. Guided study paths

Provide curated paths through the existing cards, for example:

- New Muslim: first week
- Learn wudu
- Learn one complete rakʿah
- Learn the five prayers
- Daily duʿā essentials
- Everyday Islamic speech
- Learn to read the Arabic alphabet
- 99 Names study path
- Hajj places
- Hanafi foundations

Study paths reference existing authoritative cards rather than creating conflicting duplicate teaching text.

## 11. Search, filters, and related cards

Search should understand:

- English title/content;
- Arabic;
- Latin transliteration;
- card number;
- topic;
- source/reference;
- expansion/set.

Useful filters include salah, purification, duʿā, travel, sickness, janazah, Arabic, sacred places, Important Places, Hanafi fiqh, and review status.

Cards should offer **Related Cards** links so sequences are easy to follow without memorizing numbers.

## 12. Classroom / institution mode

A school or institution should be able to use the same project differently from an individual traveler.

Possible tools:

- full-screen classroom presentation mode;
- choose a lesson and display cards in order;
- printable lesson packs;
- printable worksheets and answer sheets generated from approved material;
- teacher-selected card sets;
- kiosk mode for a classroom tablet or library terminal;
- QR handouts that open a specific study path;
- printable 2×2 card sheets using the existing print pipeline.

## 13. Physical-print companion tools

Keep physical production first-class even as digital becomes more capable:

- card-size print sheets;
- front/back alignment guides;
- expansion-specific print packs;
- low-ink options where appropriate;
- institution packs containing cards, source notes, lesson suggestions, and review status;
- checksums/manifests for archival or professional printing.

## 14. Revision history and corrections

A learner or reviewer should be able to answer:

- What changed on this card?
- Why did it change?
- Which source justified the correction?
- Which version first contained the correction?

The Web Viewer can expose a human-readable revision history generated from maintained metadata rather than requiring the user to inspect Git commits.

## 15. Privacy and portability principles

The deck should be useful in a masjid, classroom, airplane, rural area, or another country without depending on a cloud account.

Preferred defaults:

- offline capable;
- local progress storage;
- export/import personal study progress if desired;
- no required account;
- no advertisements;
- no behavioral tracking;
- no dependency on a commercial service merely to read the cards.

## Suggested development order

Do not try to build all of this in one release.

### Phase A — Portable foundation
1. installable/offline Web Viewer;
2. search and filters;
3. stable per-card URLs;
4. local bookmarks/progress;
5. guided study paths.

### Phase B — Learning engine
1. Arabic display controls;
2. memorization mode;
3. spaced repetition;
4. related-card navigation;
5. optional audio framework.

### Phase C — Scholarly transparency
1. Scholar Mode source drawer;
2. per-card review metadata;
3. project review dashboard;
4. correction/revision history;
5. imam review interface.

### Phase D — Physical/digital bridge
1. review-pack generator;
2. QR/deep links;
3. classroom presentation mode;
4. institution/teacher print tools.

## Approval rule

These features are approved as the project's **digital direction**, not as permission to make an uncontrolled bulk build.

Each implementation should still follow the repository's normal workflow: define scope, build one coherent checkpoint, verify it, obtain maintainer approval where required, and only then move to the next feature group.
