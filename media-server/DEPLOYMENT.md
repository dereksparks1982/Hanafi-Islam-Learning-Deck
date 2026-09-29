# Hanafi Media Server Integration

## Current release state

- **Accepted public checkpoint:** **v2.4 — closed and accepted**
- **Active build:** **v2.5 — automatic public Media metadata and artwork onboarding**
- **v2.5 status:** candidate built, awaiting live runtime validation
- **Repository branch:** `main` only

The Hanafi Web App reuses only the server/media infrastructure needed from **Nougat Media Plus**. Jellyfin remains private backend infrastructure; the visible player is the accepted single DK Media browser player.

## Architecture

```text
Hanafi GitHub Pages Web App
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
/home/dereksparks1982/Videos/Hosted
```

Movie files remain on `saxondesktop`. GitHub stores the interface, bridge/server source, stable IDs, examples, and deployment tooling, not the movie payloads.

## Accepted v2.4 playback boundary

v2.4 closed with all eight public films confirmed playing by the maintainer. The exact accepted bridge implementation is preserved byte-for-byte at:

```text
server/hanafi-jellyfin-bridge-stable.py
```

The active v2.5 bridge at:

```text
server/hanafi-jellyfin-bridge
```

imports that stable core and layers public discovery, metadata, and artwork behavior on top. Do not replace the stable core merely to change metadata behavior.

The rejected bridge implementation that overrode `BaseHTTPRequestHandler.handle()` with an incompatible signature must never be restored.

## Current public v2.4 library

The eight current public films are:

1. Al-Risalah (1976)
2. Aao Hajj Karein (2012)
3. Joseph in the Land of Egypt (1914)
4. Lion of the Desert (1981)
5. Pakistan (1950)
6. The Message (1976)
7. The Soviets and Islam (1972)
8. The Ten Commandments (1923)

Current explicit public IDs include:

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

Al-Risalah currently maps to:

```text
/home/dereksparks1982/Videos/Hosted/Al-Risalah (1976)/Al-Risala.1976.Arabic-English.Hardsubs.mp4
```

Its earlier failure was a stale folder path after the folder rename, not an unsupported-media condition.

## v2.5 automatic movie onboarding

v2.5 is intended to replace the per-title hand-edit process with the same general scanner/provider/cache model used by mature media servers.

The candidate flow is:

```text
correctly named Hosted movie folder
        |
        v
public library scan + title/year parsing
        |
        v
Nougat-integrated Jellyfin movie library
        |
        v
Jellyfin metadata/image providers
        |
        v
Hanafi catalog metadata + poster endpoint
        |
        v
Web App card + movie page
        |
        v
existing stable DK Media playback
```

A normal movie folder should use the conventional form:

```text
Movie Name (Year)
```

The v2.5 bridge assigns deterministic automatic IDs to newly discovered movies, while preserving every explicit v2.4 stable ID.

### Metadata exposed to the Web App

The public catalog may expose safe normalized fields such as:

- title;
- original title;
- production year;
- overview;
- runtime;
- provider IDs;
- poster availability;
- readiness/index state.

Local filesystem paths, Jellyfin credentials, and the Jellyfin management interface are not exposed to the Web App.

### Poster priority

For public Media, the v2.5 poster route uses this order:

1. an existing explicit/manual artwork choice in the Web App;
2. conventional local movie-folder artwork such as `poster.jpg`, `folder.jpg`, or `cover.jpg`;
3. Jellyfin Primary artwork supplied by its configured metadata/image provider;
4. a cached FFmpeg video-frame fallback when no provider/local poster is available.

Manual/locked artwork remains an override and must not be silently replaced by automatic refreshes.

## v2.5 bridge endpoints

The existing playback endpoints remain, and v2.5 adds poster delivery:

```text
GET  /nougat/v1/health
GET  /nougat/v1/catalog
GET  /nougat/v1/media?id=<stable-or-auto-id>
GET  /nougat/v1/transcode?id=<stable-or-auto-id>
GET  /nougat/v1/subtitle?id=<stable-id>
GET  /nougat/v1/poster?id=<stable-or-auto-id>
HEAD /nougat/v1/...
OPTIONS /nougat/v1/...
```

The bridge listens on `127.0.0.1:8097`. Nougat-integrated Jellyfin remains on `127.0.0.1:8098`.

## One-time v2.5 runtime transition

The permanent v2.5 updater is:

```text
media-server/deploy/update-v25-metadata.sh
```

It is a **one-time candidate deployment/update helper**, not a command that must be run for every new movie. It:

1. obtains the v2.5 wrapper and accepted v2.4 stable playback core from the selected repository revision;
2. syntax-checks both before installation;
3. installs both beside each other under `/usr/local/bin`;
4. records the Hosted public root and writable poster-cache location in the existing `/etc/hanafi-media/jellyfin.env`;
5. checks the existing Nougat-integrated Jellyfin libraries and registers the Hosted root as a **movies** library if it is not already present;
6. requests a normal Jellyfin library refresh;
7. restarts only the existing `hanafi-jellyfin-bridge.service`;
8. verifies the live health endpoint and prints the live catalog.

After that one-time transition is accepted, **placing a correctly named movie in the Hosted library is intended to be the onboarding action**. Adding a movie should not require another individual edit to `web-viewer/media/index.html`, `web-viewer/media/movie.html`, or `media-server/media.tsv.example`.

## Existing runtime files on saxondesktop

The established runtime uses files including:

```text
/usr/local/bin/hanafi-jellyfin-bridge
/usr/local/bin/hanafi-jellyfin-bridge-stable.py
/usr/local/bin/hanafi-nougat-jellyfin-ensure
/etc/hanafi-media/media.tsv
/etc/hanafi-media/private-media.tsv
/etc/hanafi-media/jellyfin.env
/etc/hanafi-media/public-base-url
/etc/systemd/system/hanafi-nougat-jellyfin.service
/etc/systemd/system/hanafi-jellyfin-bridge.service
/etc/nginx/sites-available/hanafi-jellyfin
```

The v2.5 updater sets a writable transient poster fallback cache through `HANAFI_POSTER_CACHE`. Provider artwork remains primarily managed by the existing Jellyfin metadata/image system.

## Existing full deployment helper

`media-server/deploy/enable-jellyfin-public.sh` is the established full-server setup path from earlier releases. During the v2.5 candidate phase it is **not** the v2.5 metadata transition helper and should not be substituted for `update-v25-metadata.sh` when validating the v2.5 candidate.

The full clean-install helper can be reconciled with the v2.5 wrapper/stable pair after v2.5 is accepted. Do not use that future cleanup as a reason to alter the known-working v2.4 runtime during candidate validation.

## Player and private-library boundaries

The public Media page continues to use exactly one browser `<video>` player. v2.5 does not authorize stacked players, a second visible Jellyfin UI, or an extra generic Play panel.

The Advanced Learner/Private Library is outside the v2.5 public metadata scope and must retain its current behavior.

## v2.5 validation gate

v2.5 remains a candidate until live testing on saxondesktop confirms all of the following:

1. all eight accepted v2.4 public movies still play;
2. the four v2.4 additions receive automatic artwork through the new metadata/poster path;
3. a newly added correctly named Hosted movie is discovered without a per-title Web App or manifest edit;
4. the generated public card opens a normal movie page and plays through the existing DK Media path;
5. manual/locked artwork remains an override;
6. Private Library behavior is unchanged.

Repository source alone is not proof that the v2.5 runtime is live. Acceptance requires the protected runtime copy to be deployed and verified by the maintainer.
