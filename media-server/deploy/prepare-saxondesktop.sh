#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="${1:-$PWD}"
MEDIA_ROOT="/home/dereksparks1982/Videos/Hosted"
BUILD_DIR="$REPO_ROOT/build/media-server"
SERVER_BIN="$BUILD_DIR/hanafi-nougat-media-server"
PRIVATE_MANIFEST="$HOME/.config/hanafi-media/media.tsv"
SERVICE_SOURCE="$REPO_ROOT/media-server/deploy/hanafi-nougat-media.service.example"
CONFIGURE_SCRIPT="$REPO_ROOT/media-server/deploy/configure-hosted-library.sh"

printf 'Preparing Hanafi Nougat Media Core against %s...\n' "$MEDIA_ROOT"
HOSTED_ROOT="$MEDIA_ROOT" MANIFEST_PATH="$PRIVATE_MANIFEST" bash "$CONFIGURE_SCRIPT"

printf '\nInstalling server binary and runtime manifest...\n'
sudo install -m 0755 "$SERVER_BIN" /usr/local/bin/hanafi-nougat-media-server
sudo install -d -m 0755 /etc/hanafi-media
sudo install -m 0644 "$PRIVATE_MANIFEST" /etc/hanafi-media/media.tsv
sudo install -m 0644 "$SERVICE_SOURCE" /etc/systemd/system/hanafi-nougat-media.service

printf '\nStarting service...\n'
sudo systemctl daemon-reload
sudo systemctl enable --now hanafi-nougat-media.service

printf '\nHealth check...\n'
curl --fail --silent --show-error http://127.0.0.1:8096/nougat/v1/health
printf '\n\nCatalog...\n'
curl --fail --silent --show-error http://127.0.0.1:8096/nougat/v1/catalog
printf '\n\nRange test...\n'
curl --fail --silent --show-error \
  -H 'Range: bytes=0-1023' \
  -o /dev/null \
  -D - \
  'http://127.0.0.1:8096/nougat/v1/media?id=message-en-720' \
  | grep -E 'HTTP/|Accept-Ranges:|Content-Range:'

printf '\nSubtitle test...\n'
curl --fail --silent --show-error \
  'http://127.0.0.1:8096/nougat/v1/subtitle?id=risalah-ar-1080' \
  | head -n 1 \
  | grep '^WEBVTT$'

printf '\nLocal Nougat media service is installed and responding on 127.0.0.1:8096.\n'
printf 'Movies remain in %s; they are not copied into Git or /srv.\n' "$MEDIA_ROOT"
printf 'Public HTTPS still requires the real media hostname before the Web App can enable the backend.\n'
