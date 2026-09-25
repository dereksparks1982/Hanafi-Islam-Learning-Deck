# Hanafi media server integration

The Hanafi Web App reuses only the server/media infrastructure needed from **Nougat Media Plus**. It does not import the Nougat desktop UI, Games, Console, Live TV, World TV, Search, crawler, P2P, AI, security center, radio, emulators, tactical Player UI, or the rest of the application.

The visible browser player is the v2.1 **DK Media single-player Web implementation**. Nougat/Jellyfin stays underneath it as backend infrastructure.

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
Nougat integrated Jellyfin 10.11.11
        |
        v
local Hosted media files
```

The movies remain on `saxondesktop`. GitHub Pages contains the interface and stable media IDs, not the movie files.

## Player boundary

The v2.1 Media page uses exactly **one browser `<video>` element**.

The media selector changes the source loaded into that one player. New titles should be added to the library/manifest and fed into the same player rather than creating another player panel.

The Web player carries forward useful DK Media behavior such as Play/Pause, seeking, rewind/forward, volume, speed, fullscreen, keyboard controls, remembered preferences, resume state, and external-subtitle selection.

## What is reused from Nougat

The deployment uses the accepted Nougat server layout rather than installing a second Jellyfin stack:

- integrated Jellyfin runtime under `components/jellyfin/runtime/jellyfin/jellyfin`;
- backend port `127.0.0.1:8098`;
- Nougat server data at `~/.local/share/reddmedia/server/data`;
- Nougat server configuration at `~/.config/reddmedia/server`;
- Nougat cache and log directories;
- Nougat private Jellyfin client session at `~/.config/reddmedia/server/client.json`;
- browser-compatible H.264/AAC delivery/transcoding where needed;
- the principle that Jellyfin itself stays private rather than being exposed directly to the Internet;
- HTTP Range delivery concepts and local-file fallback used by the narrow Hanafi bridge.

The Hanafi bridge exposes only items listed in the installed manifest. A visitor cannot use it as a general Jellyfin browser.

## Current v2.1 stable media IDs

At v2.1 closeout the checked-in example manifest contains exactly these current test entries:

```text
ten-commandments-1923
the-message-1976-english
```

The English *The Message* test entry maps to:

```text
/home/dereksparks1982/Videos/Hosted/Al-Risalah/The.Message.1976.YouTube.mp4
```

The Ten Commandments test entry currently maps to the prepared browser-compatible cache path recorded in `media.tsv.example`.

The additional temporary Arabic/English hard-sub *The Message* copy that was still downloading when v2.1 closed is **not** part of this manifest. Do not add a `.part` file or infer a final filename from an incomplete download.

## Manifest format

The current manifest is tab-separated:

```text
id<TAB>absolute media path<TAB>MIME type<TAB>optional subtitle path
```

The fourth field is one optional sidecar subtitle file for that media item.

Current v2.1 therefore supports **one optional external subtitle path per media item**. Multiple named sidecar subtitle tracks per one media item are not yet part of the manifest/catalog format.

If the configured subtitle is `.srt`, the bridge converts it to WebVTT for browser playback.

## Hanafi bridge endpoints

```text
GET  /nougat/v1/health
GET  /nougat/v1/catalog
GET  /nougat/v1/media?id=<stable-id>
GET  /nougat/v1/transcode?id=<stable-id>
GET  /nougat/v1/subtitle?id=<stable-id>
HEAD /nougat/v1/...
OPTIONS /nougat/v1/...
```

The Hanafi bridge listens on loopback port `8097`. Jellyfin remains on loopback port `8098`.

### Direct local delivery

For browser-direct media, the bridge provides seekable byte-range delivery and returns the appropriate `Content-Range`, `Content-Length`, and `Accept-Ranges` behavior.

This path is preferred when the local file is already suitable for browser playback.

### Compatibility/transcode delivery

For incompatible containers or a forced transcode route, the bridge can use FFmpeg/Jellyfin to produce browser-compatible H.264/AAC MP4 delivery.

Jellyfin remains a backend helper, not the public Web interface.

### Subtitle delivery

```text
/nougat/v1/subtitle?id=<stable-id>
```

When the configured sidecar is SRT, the bridge converts comma timestamp separators to WebVTT form and serves `text/vtt` to the browser.

The DK Media Web player then exposes the configured subtitle as an on/off selection.

## Deployment on saxondesktop

The expected Nougat checkout is:

```text
/home/dereksparks1982/DKLab/Projects/Nougat Media Plus
```

From a checkout of this Hanafi repository, the established deployment helper is:

```bash
bash media-server/deploy/enable-jellyfin-public.sh
```

The helper is designed to:

1. use Nougat's existing integrated Jellyfin runtime;
2. reuse the accepted Nougat Jellyfin data/config/cache/log directories and private session;
3. keep Jellyfin private on `127.0.0.1:8098`;
4. install the small Hanafi bridge on `127.0.0.1:8097`;
5. install the Hanafi manifest without moving or copying the movies into GitHub;
6. place Nginx in front of the bridge for HTTPS;
7. use the configured certificate/public endpoint;
8. expose the resulting public base URL for the Web App configuration.

The deployment helper does **not** authorize a GitHub version change and does not make unrelated Nougat features part of Hanafi.

## Why HTTPS is necessary

The Hanafi Web App itself is served over HTTPS by GitHub Pages. A secure page cannot reliably load ordinary insecure HTTP active media. Nginx therefore provides the HTTPS front end for the connection from a visitor's browser to `saxondesktop`.

The HTTPS layer is transport for the user's own server. It is not a separate rented media host.

## Current network fact preserved from v2.1 validation

During v2.1 testing, the media services themselves were healthy but public playback failed until the router destination was corrected to the machine's actual reserved LAN address.

After the router destination was corrected, the public Web App successfully played *The Ten Commandments* through the self-hosted path.

Future troubleshooting should therefore diagnose current routing, server state, and HTTP evidence rather than assuming a codec/Safari failure from old symptoms.

## Runtime files installed on saxondesktop

The established deployment can use files such as:

```text
/usr/local/bin/hanafi-jellyfin-bridge
/usr/local/bin/hanafi-nougat-jellyfin-ensure
/etc/hanafi-media/media.tsv
/etc/hanafi-media/jellyfin.env
/etc/hanafi-media/public-base-url
/etc/systemd/system/hanafi-nougat-jellyfin.service
/etc/systemd/system/hanafi-jellyfin-bridge.service
/etc/nginx/sites-available/hanafi-jellyfin
```

No movie file is installed into `/etc`, `/usr`, GitHub, or another media host by this deployment.

## Validation gate

For the current v2.1 manifest, useful checks are:

```text
/nougat/v1/health                                      -> HTTP 200 when mapped media is available
/nougat/v1/catalog                                     -> current mapped items report ready
/nougat/v1/media?id=ten-commandments-1923              -> playable and seekable
/nougat/v1/media?id=the-message-1976-english            -> playable and seekable
/nougat/v1/subtitle?id=<item-with-configured-subtitle>  -> WEBVTT
```

A subtitle endpoint returning 404 for a media item with no configured subtitle is expected behavior, not a server failure.

Only completed final media files should be added to the installed manifest. Never point a stable ID at an in-progress `.part` download.

## Persistent CI

`.github/workflows/media-server-build.yml` is a reusable persistent workflow. It builds the standalone media-server component and smoke-tests health, HTTP Range behavior, and SRT-to-WebVTT subtitle conversion.

Obsolete one-time Media repair workflows were removed during the v2.1 closeout.
