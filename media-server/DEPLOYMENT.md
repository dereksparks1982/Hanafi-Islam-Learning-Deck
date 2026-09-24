# Hanafi Nougat Media Core

This directory contains only the small HTTP media-serving layer extracted from the Nougat Media Plus web-player design. It intentionally excludes the Nougat desktop UI, Jellyfin integration, games, console runtime, Live TV, P2P, crawler, security center, AI components, and other application features.

## What it provides

- Direct HTTP video delivery with byte-range requests for seeking.
- Stable media IDs so the web app never needs filesystem paths.
- External subtitle delivery as WebVTT.
- Automatic conversion of configured `.srt` subtitle files to WebVTT in memory.
- CORS headers for the Hanafi Learning Deck GitHub Pages origin.
- A small health endpoint for deployment checks.
- Loopback-only binding by default so TLS can be handled by a reverse proxy such as Caddy.

## Build

Ubuntu/Debian requirements:

```bash
sudo apt install build-essential cmake
cmake -S media-server -B build/media-server -DCMAKE_BUILD_TYPE=Release
cmake --build build/media-server --parallel
```

The executable is:

```text
build/media-server/hanafi-nougat-media-server
```

## Media manifest

Copy `media.tsv.example` to a private runtime location such as:

```text
/etc/hanafi-media/media.tsv
```

The format is tab-separated:

```text
id    absolute-media-path    MIME-type    optional-subtitle-path
```

The repository template defines these stable IDs:

- `message-en-720`
- `risalah-ar-1080`
- `risalah-ar-480`
- `risalah-ar-360`

The 1080p Arabic row can point to the external English `.srt`. The server exposes it as browser-compatible WebVTT. The web app can therefore offer both “1080p · No subtitles” and “1080p · Subtitles” while using one video file.

## Runtime settings

Environment variables:

```text
HANAFI_MEDIA_BIND          default: 127.0.0.1
HANAFI_MEDIA_PORT          default: 8096
HANAFI_MEDIA_MANIFEST      default: media.tsv
HANAFI_MEDIA_CORS_ORIGIN   default: https://dereksparks1982.github.io
```

Example:

```bash
HANAFI_MEDIA_MANIFEST=/etc/hanafi-media/media.tsv \
./hanafi-nougat-media-server
```

## Endpoints

```text
GET /nougat/v1/health
GET /nougat/v1/catalog
GET /nougat/v1/media?id=<stable-id>
GET /nougat/v1/subtitle?id=<stable-id>
```

`HEAD` is supported for the same routes. `OPTIONS` is supported for browser CORS preflight.

Example range request:

```bash
curl -i -H 'Range: bytes=0-1048575' \
  'http://127.0.0.1:8096/nougat/v1/media?id=risalah-ar-1080'
```

A valid range returns HTTP `206 Partial Content`, `Accept-Ranges: bytes`, and `Content-Range`.

## Public HTTPS

The GitHub Pages app is HTTPS, so a plain HTTP media URL would be blocked by browsers as mixed content. Keep the C++ service on `127.0.0.1:8096` and expose it through HTTPS.

`deploy/Caddyfile.example` is the reverse-proxy template. Replace `media.example.com` with the actual media hostname and point its DNS at the server. Caddy can then terminate TLS and proxy requests to the local Nougat-derived service.

The server itself does not need to run as root and should not bind directly to ports 80 or 443.

## systemd

`deploy/hanafi-nougat-media.service.example` is a hardened service template. The intended filesystem layout is:

```text
/usr/local/bin/hanafi-nougat-media-server
/etc/hanafi-media/media.tsv
/srv/hanafi-media/<video and subtitle files>
```

The service account only needs read access to `/srv/hanafi-media` and the manifest.

## Migration rule

Do not switch the live Hanafi Media page away from Google Drive until the HTTPS media hostname is reachable and these checks pass:

```text
/nougat/v1/health                      returns 200
/nougat/v1/media?id=message-en-720     supports byte ranges
/nougat/v1/media?id=risalah-ar-1080    supports byte ranges
/nougat/v1/subtitle?id=risalah-ar-1080 returns WEBVTT
```

Once those checks pass, the web app only needs the HTTPS base URL. No Drive file IDs are needed after migration.
