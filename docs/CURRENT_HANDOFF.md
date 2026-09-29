# Current Project Handoff

## Repository state

Repository: `dereksparks1982/Hanafi-Islam-Learning-Deck`  
Active and only branch: `main`

Current accepted and published checkpoint: **v2.4 — closed and accepted**.

Active owner-authorized build: **v2.5 — automatic public Media metadata and artwork onboarding**.

v2.5 is currently a **candidate awaiting live runtime validation**. It is not closed or accepted yet.

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

## Stable playback boundary

The exact accepted v2.4 playback implementation is preserved at:

`server/hanafi-jellyfin-bridge-stable.py`

The v2.5 `server/hanafi-jellyfin-bridge` imports that stable core and layers only public discovery, metadata, and poster behavior on top. Do not reintroduce the rejected implementation that overrode `BaseHTTPRequestHandler.handle()` with an incompatible signature.

## v2.5 candidate behavior

The current candidate is intended to remove per-movie hand wiring. It:

- scans `/home/dereksparks1982/Videos/Hosted` for future public movie folders;
- derives deterministic automatic IDs and parses `Movie Name (Year)`;
- preserves all explicit v2.4 IDs;
- uses the existing Nougat-integrated Jellyfin movie-library/provider system for normalized metadata and primary images;
- exposes safe metadata in `/nougat/v1/catalog`;
- exposes poster delivery at `/nougat/v1/poster?id=<media-id>`;
- uses poster priority: explicit/manual browser artwork, local movie-folder artwork, Jellyfin primary image, then a cached FFmpeg frame fallback;
- creates future Media cards from catalog records without another hardcoded Web App film entry;
- fills dynamic movie pages with provider metadata when available;
- leaves the accepted DK Media playback path underneath the metadata layer.

The permanent one-time runtime transition helper is:

`media-server/deploy/update-v25-metadata.sh`

It installs both bridge files, configures the Hosted root and writable poster cache, registers Hosted as a Jellyfin **movies** library if necessary, requests a library refresh, restarts only the existing bridge service, and prints live health/catalog results.

Once that one-time v2.5 runtime transition is accepted, **adding a movie to Hosted is supposed to be the onboarding action**. The user should not have to hand-edit `index.html`, `movie.html`, or `media.tsv.example` for each new correctly named movie.

Detailed candidate plan: [`V2.5_MEDIA_METADATA_AUTOMATION_PLAN.md`](V2.5_MEDIA_METADATA_AUTOMATION_PLAN.md).

## v2.5 acceptance gate

Do not close v2.5 until live validation confirms:

1. all eight accepted v2.4 films still play;
2. the four v2.4 additions receive automatic artwork through the new metadata/poster route;
3. a newly added correctly named Hosted movie appears automatically without a per-title Web App or manifest edit;
4. manual/locked artwork remains an override;
5. Private Library behavior is unchanged.

## Terminal/deployment boundary

Protected runtime deployment on saxondesktop uses the existing `/usr/local/bin/hanafi-jellyfin-bridge` and existing `hanafi-jellyfin-bridge.service`.

When a terminal command is required, it must be one complete non-interactive physical command line, must return directly to the shell, must not use `read`, `exit`, `logout`, a pager/editor, a heredoc, a trailing continuation backslash, or anything that can leave a `>`/`:` continuation state or ask the maintainer for further input.

Do not claim a repository bridge change is live until the protected runtime copy is actually deployed and verified.
