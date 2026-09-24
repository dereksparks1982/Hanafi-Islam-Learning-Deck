# Hanafi media server integration

The Hanafi web app reuses only the server work already completed in **Nougat Media Plus**. It does not import the Nougat desktop UI, Games, Console, Live TV, World TV, Search, crawler, P2P, AI, security center, radio, emulators, or the rest of the application.

## Architecture

```text
Hanafi GitHub Pages web player
        |
        | HTTPS
        v
saxondesktop / Nginx
        |
        | loopback :8097
        v
Hanafi Jellyfin bridge
        |
        | loopback :8098
        v
Nougat integrated Jellyfin 10.11.11
        |
        v
/home/dereksparks1982/Videos/Hosted
```

The movies remain on `saxondesktop`. GitHub Pages contains the interface and stable media IDs, not the movie files.

## What is reused from Nougat

The deployment uses the accepted Nougat server layout rather than installing a second Jellyfin stack:

- integrated Jellyfin runtime under `components/jellyfin/runtime/jellyfin/jellyfin`;
- backend port `127.0.0.1:8098`;
- Nougat server data at `~/.local/share/reddmedia/server/data`;
- Nougat server configuration at `~/.config/reddmedia/server`;
- Nougat cache and log directories;
- Nougat private Jellyfin client session at `~/.config/reddmedia/server/client.json`;
- browser-compatible H.264/AAC delivery through Jellyfin, including transcoding when needed;
- the existing Nougat principle that Jellyfin itself stays private rather than being exposed directly to the Internet.

The Hanafi bridge exposes only items listed in `media.tsv.example`. A visitor cannot use it as a general Jellyfin browser.

## Current stable media IDs

The web app uses these IDs instead of filesystem paths:

```text
message-en-720
message-en-1080-hardsubs
risalah-ar-1080
risalah-ar-1080-hardsubs
risalah-ar-480
risalah-ar-360
lion-desert-1981
ten-commandments-1923
```

The manifest maps those IDs to the existing files under:

```text
/home/dereksparks1982/Videos/Hosted
```

`risalah-ar-1080` also maps the separate English `.srt`; the bridge converts SRT to WebVTT for the browser.

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

The public bridge listens on loopback port `8097`. Jellyfin remains on loopback port `8098`.

## Deployment on saxondesktop

The expected Nougat checkout is:

```text
/home/dereksparks1982/DKLab/Projects/Nougat Media Plus
```

From a checkout of this Hanafi repository, run:

```bash
bash media-server/deploy/enable-jellyfin-public.sh
```

The script does the following and nothing from the unrelated Nougat feature set:

1. Uses Nougat's existing integrated Jellyfin runtime. If the runtime has not been extracted yet, it runs Nougat's existing `tools/build_integrated_jellyfin_v15.sh` helper.
2. Reuses the accepted Nougat Jellyfin data/config/cache/log directories and private session.
3. Keeps Jellyfin private on `127.0.0.1:8098`.
4. Installs the small Hanafi bridge on `127.0.0.1:8097`.
5. Installs the Hanafi manifest without moving or copying the movies.
6. Places Nginx in front of the bridge for HTTPS.
7. Requests a trusted certificate directly for the machine's public IP, so no purchased domain or rented media host is required.
8. Prints `PUBLIC_BASE_URL=https://<public-ip>` when the path is ready.

The deployment script does **not** modify or commit the Hanafi Git repository. After the printed public URL passes testing, `web-viewer/media/nougat-config.js` can be pointed at it separately.

## Why HTTPS is still necessary

The Hanafi web app itself is served over HTTPS by GitHub Pages. Browsers block an HTTPS page from loading an ordinary HTTP movie stream as active mixed content. The HTTPS layer therefore protects the connection between the visitor's browser and `saxondesktop`; it is not a second hosting service.

The current deployment uses a certificate issued directly to the public IP. Let’s Encrypt made public IP-address certificates generally available in 2026. These IP certificates are short-lived, so automated renewal is required.

## Runtime files installed on saxondesktop

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

No movie file is installed into `/etc`, `/usr`, GitHub, or another host.

## Validation gate

Before enabling the public Web App configuration, verify:

```text
/nougat/v1/health                                  -> HTTP 200
/nougat/v1/catalog                                 -> mapped items report ready
/nougat/v1/media?id=message-en-720                 -> playable
/nougat/v1/media?id=risalah-ar-1080                -> playable/transcoded as needed
/nougat/v1/subtitle?id=risalah-ar-1080             -> WEBVTT
/nougat/v1/media?id=lion-desert-1981               -> playable
/nougat/v1/media?id=ten-commandments-1923          -> playable
```

Only after those checks pass should `web-viewer/media/nougat-config.js` be enabled with the printed `PUBLIC_BASE_URL`.
