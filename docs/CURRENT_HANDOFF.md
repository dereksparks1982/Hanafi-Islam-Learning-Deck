# Current Project Handoff

## Repository state

Repository: `dereksparks1982/Hanafi-Islam-Learning-Deck`  
Active and only branch: `main`

Current accepted and published checkpoint: **v2.4 — closed and accepted**.

Active owner-authorized build: **v2.5 — automatic public Media metadata and artwork onboarding**.

Governing rules: [`COMPANY_BIBLE.md`](COMPANY_BIBLE.md). Stop means stop. No branch other than `main` may be created. Version changes, closeouts, and acceptance remain owner-controlled.

## Current card/library state

The project has **222 published card resources across five independent sets**:

- Main Deck: Card 00 + Cards 1–146 + Index I-1 through I-13 = 160 resources
- Sacred Places Expansion: 19
- 99 Names of Allah Expansion: 12
- Arabic Alphabet Expansion: 28
- Important Places of the Muslim World: 3

The 13 index cards are glossary/reference cards and do not renumber the established Main Deck lesson cards.

## Current Web App state

The approved current Web App family includes:

- approved Hanafi Learning Deck icon and Home background;
- devotional Home opening and current information density;
- separate Deck page and current no-stale-layout launch/cache behavior;
- local Hanafi prayer tools;
- Qur'an Reader foundation;
- Makkah Live & Prayer Clock;
- Holy Places Explorer;
- Live, Links, Media, Charity, About, and Legal;
- locked Advanced Learner Library and current five-slot private-library entrance flow.

Rejected UI experiments are not baselines and must not be restored.

## Media architecture

Current public chain:

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
Nougat-integrated Jellyfin
        |
        v
local Hosted media files
```

Movie files remain on the maintainer's machine. GitHub carries interface/server code, stable public IDs, manifest examples, and documentation, not the movie payloads.

The current accepted player is exactly one DK Media-based Web player. Preserve its existing playback controls and do not return to stacked players or add extra Play panels.

## v2.4 public Media state

Eight public films are present and the maintainer confirmed that all eight play:

1. Al-Risalah (1976)
2. Aao Hajj Karein (2012)
3. Joseph in the Land of Egypt (1914)
4. Lion of the Desert (1981)
5. Pakistan (1950)
6. The Message (1976)
7. The Soviets and Islam (1972)
8. The Ten Commandments (1923)

Current checked-in public manifest IDs include:

```text
ten-commandments-1923
the-message-1976-english
the-message-1976-urdu
al-risala-1976-arabic-english-hardsubs
lion-of-the-desert-1981
aao-hajj-karein-2012
joseph-in-the-land-of-egypt-1914
pakistan-1950
the-soviets-and-islam-1972
```

Al-Risalah's current local file is:

`/home/dereksparks1982/Videos/Hosted/Al-Risalah (1976)/Al-Risala.1976.Arabic-English.Hardsubs.mp4`

It is playable. Its previous failure was a stale folder path after the folder was renamed, not an unsupported-media problem.

The bridge source restored at the end of v2.4 is the stable manifest-based implementation at `server/hanafi-jellyfin-bridge`. Do not reintroduce the rejected handler implementation that overrode `BaseHTTPRequestHandler.handle()` with an incompatible signature.

## Current artwork limitation

The four movies added in v2.4 play but do not yet have automatically resolved box art:

- Aao Hajj Karein (2012)
- Joseph in the Land of Egypt (1914)
- Pakistan (1950)
- The Soviets and Islam (1972)

The existing `artwork-manager.js` supports IndexedDB caching, local artwork, manual URLs/files, cropping, and locked selections. Its current TMDb search code is browser-side and is not a proper authenticated automatic provider path. Do not solve v2.5 by hardcoding four more poster URLs.

## v2.5 authorized build

The owner explicitly authorized moving to v2.5 for a Plex/Emby/Jellyfin-style metadata pipeline.

Required target:

1. detect a correctly named movie placed under the public Hosted library;
2. parse title/year and provider IDs where available;
3. use the existing Nougat-integrated Jellyfin metadata/provider system first;
4. obtain normalized title, original title, year, overview, runtime, provider IDs, and primary poster state from the server where available;
5. expose safe metadata and poster delivery through the Hanafi bridge without exposing credentials or filesystem paths;
6. cache metadata/posters;
7. create the Web App movie card and dedicated movie page automatically;
8. retain local/manual artwork as overrides and preserve locked manual choices;
9. preserve all eight v2.4 working movies and the one-player DK Media architecture;
10. require no individual hand edit to `web-viewer/media/index.html`, `web-viewer/media/movie.html`, or `media-server/media.tsv.example` for future correctly named movies.

Primary design reference: Jellyfin's scanner + remote metadata provider + remote image provider flow, with Plex/Emby used as behavioral references for the same general mature-media-server pattern.

Detailed active plan: [`V2.5_MEDIA_METADATA_AUTOMATION_PLAN.md`](V2.5_MEDIA_METADATA_AUTOMATION_PLAN.md).

## Terminal/deployment boundary

The authoritative bridge source lives in the repository. Protected runtime deployment on saxondesktop uses the existing `/usr/local/bin/hanafi-jellyfin-bridge` and existing `hanafi-jellyfin-bridge.service`.

When a terminal command is required, it must be one complete non-interactive physical command line, must return directly to the shell, must not use `read`, `exit`, `logout`, a pager/editor, a heredoc, a trailing continuation backslash, or anything that can leave a `>`/`:` continuation state or ask the maintainer for further input.

Do not claim a repository bridge change is live until the protected runtime copy is actually deployed and verified.
