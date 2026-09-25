# Current Project Handoff

## Purpose of this file

This document is the recovery point for the current development thread. Read it before resuming work after context loss.

## Repository state

Repository:

`dereksparks1982/Hanafi-Islam-Learning-Deck`

Active branch:

`main`

Current accepted and published checkpoint:

**v2.1 — closed**

No later public version number is assigned. Do not invent or advance a version until the maintainer explicitly authorizes it.

Detailed release record:

[`V2.1_CLOSEOUT.md`](V2.1_CLOSEOUT.md)

The published card library remains **209 cards across five independent sets**:

- Main Deck: Card 00 + Cards 1–146 = 147
- Sacred Places Expansion: 19
- 99 Names of Allah Expansion: 12
- Arabic Alphabet Expansion: 28
- Important Places of the Muslim World: 3

## Governing rules

Read [`COMPANY_BIBLE.md`](COMPANY_BIBLE.md) before changing the repository.

Critical rules:

- discussion is not build authorization;
- explicit maintainer approval defines scope;
- **stop means stop**;
- version changes require explicit authorization;
- rejected candidates are not baselines;
- the current accepted Media player is locked unless the maintainer explicitly reopens it;
- temporary one-time workflows must be removed after use.

## Current product surfaces

User-facing names:

- **Web App** = normal GitHub Pages version
- **Tor Mirror** = `.onion` mirror of the same current project
- **Qur'an Reader** = page-based reader/book system
- **Holy Places Explorer** = CesiumJS geographic study surface
- **Media** = self-hosted project media area
- **Live** = madrasas, masjids, and Islamic live/discovery area
- **Charity** = giving/support directory
- **About** and **Legal** = project information and legal/contact surfaces

The implementation directory remains `web-viewer/`, but public documentation should call it the **Web App**.

Public Web App:

`https://dereksparks1982.github.io/Hanafi-Islam-Learning-Deck/`

Tor Mirror:

`http://hanafiiix6xddzpmjxbpns5svgoujdnjwf3ky4a72rzai5mumxm4mzqd.onion/`

## v2.1 accepted visual state

v2.1 established the current Web App visual family.

Accepted elements include:

- approved Hanafi Learning Deck icon;
- approved Home background;
- corrected mobile background treatment;
- **Amarante** display typography for the approved Home title/heading treatment;
- revised Home branding and density;
- current devotional opening and project principle;
- Home page as the canonical visible `v2.1` version surface;
- About, Legal, Charity, Live, Makkah, Explorer, Qur'an, Media, and card-study pages inside the same Web App family.

Rejected button experiments are not baselines. Do not recreate or reapply rejected styling merely because related files or old commits still exist in history.

## Media — current v2.1 architecture

The old Google Drive iframe player is historical. It is **not** the current accepted implementation.

Current architecture:

```text
GitHub Pages Hanafi Web App
        |
        | HTTPS
        v
saxondesktop / Nginx
        |
        | loopback :8097
        v
Hanafi media bridge
        |
        | loopback :8098
        v
Nougat integrated Jellyfin
        |
        v
local Hosted media files
```

Important points:

- movie files remain on the maintainer's own machine;
- Media card artwork is film-specific: Al-Risalah uses Arabic-production artwork, The Message retains its English-production artwork, Lion of the Desert has a per-film crop adjustment to remove the source image's white top strip, and The Ten Commandments (1923) resolves its poster through the Wikimedia Commons API before local caching;
- GitHub contains interface/server code and stable IDs, not the movie payloads;
- Jellyfin stays backend infrastructure and is not the visible player;
- the bridge exposes only manifest-listed IDs;
- useful Nougat server/range/transcoding work is reused;
- Nougat's tactical/military desktop player UI is **not** used in Hanafi.

### Accepted player

The current accepted player is the **DK Media single-player Web implementation**. The maintainer explicitly reopened its controls on **2026-09-25** to align interaction with Nougat conventions.

The Media home page is film-first: poster cards by default plus a compact list view. Both views open the same dedicated film page. Editions/languages are selected inside that page and feed exactly **one** `<video>` player.

Current approved player behavior:

- Nougat transport language is **<<  <  ^  >  >>**; **^ is Play** and must not be replaced with the conventional right-pointing triangle.
- The current movie-page transport uses the applicable **<< / ^ / >>** controls.
- **<<** seeks backward 10 seconds and **>>** seeks forward 10 seconds.
- Keyboard Left/Right also seek 10 seconds.
- The **<< / ^ / >>** transport group is centered beneath the video in both normal and fullscreen layouts.
- Do **not** place a separate Play/^ overlay over the video picture. The video surface itself remains clickable to toggle play/pause.
- Mouse wheel anywhere over the player, including the volume control, changes volume in 5% steps. The slider can still be dragged.
- The mouse pointer auto-hides after 3 seconds of inactivity over the player.
- In fullscreen the same custom controls remain available; pointer and controls auto-hide after 3 seconds of inactivity and return on pointer movement.
- Timeline/time display, playback speed, fullscreen, remembered volume/speed, per-title resume position and external subtitle selection remain supported.

Do not return to stacked video players. Do not restore +30-second seeking or textual `-10s / Play / +30s` transport buttons.

## Current Media manifest at v2.1 closeout

Current checked-in test entries:

```text
ten-commandments-1923
the-message-1976-english
```

The English *The Message* file is mapped to:

`/home/dereksparks1982/Videos/Hosted/Al-Risalah/The.Message.1976.YouTube.mp4`

The additional temporary Arabic/English hard-sub YouTube copy being downloaded during closeout is **not yet part of the manifest**. Do not add a `.part` file or guess its final state. Wait for the maintainer to confirm the completed download before any later Media addition.

## Subtitle state

The v2.1 bridge supports one optional external subtitle path per media item.

- `.srt` is converted to browser-compatible WebVTT by the bridge;
- the DK Media Web player exposes the configured subtitle as an on/off choice;
- this allows one video master plus a separate subtitle file instead of requiring a duplicate video with burned-in subtitles.

Do not claim multiple named external subtitle tracks per item as completed v2.1 functionality. That is future work unless explicitly authorized.

## Public media-server state reached in v2.1

The self-hosted path was proven end to end during v2.1 development.

Known operational design:

- Hanafi bridge: `127.0.0.1:8097`
- Nougat integrated Jellyfin: `127.0.0.1:8098`
- Nginx provides the public HTTPS front end
- browser playback uses byte-range delivery when directly compatible
- FFmpeg/Jellyfin fallback remains available for incompatible media
- CORS is restricted to the Hanafi GitHub Pages origin

The router destination was corrected during testing and *The Ten Commandments* successfully played through the public path. Do not reopen the old Safari/Range diagnosis unless a new playback failure actually occurs.


The gated advanced-study library shell is implemented.



## Charity / support

The Web App has a dedicated Charity area.

- voluntary project support belongs there rather than on Home;
- Patreon is not to be added to the GitHub project page merely because it exists in the Web App;
- project support is not presented as Zakat;
- the no-advertising principle remains in force.

## Prayer tools

Implemented:

- local prayer-time calculation;
- **Hanafi ʿAṣr**;
- selectable calculation methods;
- exact city lookup;
- device-location option;
- manual coordinates;
- current prayer period;
- next prayer and countdown;
- daily schedule;
- Makkah-specific prayer clock on the Makkah page.

Adhan playback remains future work and is **not** automatically assigned to a version.

## Holy Places Explorer

The Explorer uses CesiumJS and includes guided Islamic locations such as Masjid al-Haram, Mina, ʿArafāt, Muzdalifah, Jabal al-Nūr, Jabal Thawr, Masjid an-Nabawī, and Al-Aqsa Mosque.

Tor Browser compatibility remains an acceptance target. Do not restore unnecessary depth-dependent operations that previously broke hardened/Tor browsing behavior.

## Qur'an Reader

The Qur'an Reader is a normal page-based reader, not a card expansion.

Surah al-Fatihah is the first implemented construction page. The familiar 604-page Madinah Mushaf structure is the long-term page framework, not a single-release promise.

Each ayah layer is intended to support:

1. Arabic Qur'an text
2. project-created transliteration
3. English meaning

Arabic Qur'an text must never be silently altered.

## Current future directions

Retained future work includes:

- continued page-by-page Qur'an Reader construction;
- card-to-content relationships;
- Main Deck continuation / Everyday Islamic Speech;
- Important Places cards one at a time;
- The Hanafi School: Origins, Method & Legacy;
- The Prophets of Islam;
- The Life of Prophet Muhammad ﷺ;
- Islamic Ruins & Lost Cities;
- qualified imam/scholar review;
- educational games, with Caravan Crossing as the first selected concept;
- future Media additions and better source copies;
- optional future expansion from one external subtitle track to multiple named tracks;
- future adhan/audio work.

Roadmap entries are plans, not permission to build them.

## Legal/source policy

Dedicated policy:

[`LEGAL_AND_SOURCE_POLICY.md`](LEGAL_AND_SOURCE_POLICY.md)

Core rules:

- no claim of ownership over the Qur'an itself;
- project-created original material is licensed CC BY-NC-SA 4.0 only where the project has the right to license it;
- third-party films, photos, recordings, translations, datasets, libraries, and services retain their own status/terms;
- hosting or self-hosting a project copy does not make the underlying film project property;
- provenance should be recorded where actually known and should not be invented where it is not;
- the project remains noncommercial and free of advertising, subscriptions, paywalls, and behavioral tracking by the Hanafi Learning Deck.

## Recovery order

If work resumes after context loss:

1. read `docs/COMPANY_BIBLE.md`;
2. read this file;
3. read `docs/V2.1_CLOSEOUT.md`;
4. fetch the current affected source files before proposing or changing anything;
5. get explicit approval for the next build scope.
