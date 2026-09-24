# Hanafi Nougat Media Core

This directory contains the small HTTP media-serving layer extracted from the Nougat Media Plus web-player design. It intentionally excludes the Nougat desktop UI, Jellyfin integration, games, console runtime, Live TV, P2P, crawler, security center, AI components, and other application features.

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
sudo apt install build-essential cmake curl
cmake -S media-server -B build/media-server -DCMAKE_BUILD_TYPE=Release
cmake --build build/media-server --parallel
```

The executable is:

```text
build/media-server/hanafi-nougat-media-server
```

## Quick local deployment

From the repository root, the local deployment helper builds the server, installs the executable, copies the current manifest into `/etc/hanafi-media`, installs the systemd unit, starts it, and performs local health/catalog checks:

```bash
bash media-server/deploy/install-local.sh
```

After the service is running, the fuller smoke test checks every configured media ID for HTTP byte-range support and verifies SRT-to-WebVTT subtitle conversion:

```bash
bash media-server/deploy/smoke-test.sh
```

To test a deployed HTTPS endpoint later:

```bash
bash media-server/deploy/smoke-test.sh https://media.example.com
```

Replace the example hostname only after a real media hostname has been chosen and configured.

## Current media library

The current movie library on `saxondesktop` is stored outside Git at:

```text
/home/dereksparks1982/Videos/Hosted
```

The repository contains no movie files. `media.tsv.example` maps stable public IDs to the current local filenames. Copy it to the private runtime manifest:

```bash
sudo install -d -m 0755 /etc/hanafi-media
sudo cp media-server/media.tsv.example /etc/hanafi-media/media.tsv
```

The format is tab-separated:

```text
id    absolute-media-path    MIME-type    optional-subtitle-path
```

Current stable IDs are:

- `message-en-720`
- `message-en-1080-hardsubs`
- `risalah-ar-1080`
- `risalah-ar-1080-hardsubs`
- `risalah-ar-480`
- `risalah-ar-360`
- `lion-desert-1981`
- `ten-commandments-1923`

`risalah-ar-1080` uses the no-subtitle Arabic 1080p video with the separate English `.srt`. The server converts that subtitle file to browser-compatible WebVTT in memory. The hard-subbed 1080p copies remain separate IDs because their English subtitles are already burned into the picture.

If a listed file is not present yet, that ID will return a clean 404 instead of exposing a filesystem path.

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

## systemd

`deploy/hanafi-nougat-media.service.example` runs the server as `dereksparks1982` so it can read the existing library without copying gigabytes into another directory. The service keeps the home directory read-only and explicitly treats the Hosted library and runtime configuration as read-only.

Intended runtime layout:

```text
/usr/local/bin/hanafi-nougat-media-server
/etc/hanafi-media/media.tsv
/home/dereksparks1982/Videos/Hosted/<movie folders>
```

The media files remain where they already are.

## Public HTTPS

The GitHub Pages app is HTTPS, so a plain HTTP media URL would be blocked by browsers as mixed content. Keep the C++ service on `127.0.0.1:8096` and expose it through HTTPS.

`deploy/Caddyfile.example` is the reverse-proxy template. The remaining deployment-specific value is the real public media hostname. Once that hostname points to this server and ports 80/443 are reachable, Caddy can obtain TLS and proxy requests to the local Nougat service.

The server itself does not need root privileges and should not bind directly to ports 80 or 443.

## Migration gate

Do **not** remove the live Google Drive fallback until the HTTPS media hostname is reachable and these checks pass:

```text
/nougat/v1/health                                  returns 200
/nougat/v1/media?id=message-en-720                 supports byte ranges
/nougat/v1/media?id=message-en-1080-hardsubs       supports byte ranges when the file exists
/nougat/v1/media?id=risalah-ar-1080                supports byte ranges
/nougat/v1/subtitle?id=risalah-ar-1080             returns WEBVTT
/nougat/v1/media?id=lion-desert-1981               supports byte ranges
/nougat/v1/media?id=ten-commandments-1923          supports byte ranges
```

After those checks pass:

1. put the HTTPS media origin into `web-viewer/media/nougat-config.js`;
2. set `enabled: true`;
3. verify playback and seeking from GitHub Pages on desktop and mobile;
4. remove the Drive iframe, Drive IDs, and Drive fallback code from the Media page.

At that point normal movie playback is direct Hanafi/Nougat streaming and does not require Google login or a Google media embed.
