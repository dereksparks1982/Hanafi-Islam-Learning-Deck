#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/../.." && pwd)"
BUILD_DIR="$REPO_ROOT/build/media-server"
SERVICE_SOURCE="$SCRIPT_DIR/hanafi-nougat-media.service.example"
MANIFEST_SOURCE="$REPO_ROOT/media-server/media.tsv.example"

printf 'Building Hanafi Nougat Media Core...\n'
cmake -S "$REPO_ROOT/media-server" -B "$BUILD_DIR" -DCMAKE_BUILD_TYPE=Release
cmake --build "$BUILD_DIR" --parallel

printf 'Installing server and runtime configuration...\n'
sudo install -D -m 0755 "$BUILD_DIR/hanafi-nougat-media-server" /usr/local/bin/hanafi-nougat-media-server
sudo install -d -m 0755 /etc/hanafi-media
sudo install -m 0644 "$MANIFEST_SOURCE" /etc/hanafi-media/media.tsv
sudo install -m 0644 "$SERVICE_SOURCE" /etc/systemd/system/hanafi-nougat-media.service

printf 'Starting service...\n'
sudo systemctl daemon-reload
sudo systemctl enable --now hanafi-nougat-media.service

printf '\nService status:\n'
sudo systemctl --no-pager --full status hanafi-nougat-media.service || true

printf '\nLocal health check:\n'
curl --fail --silent --show-error http://127.0.0.1:8096/nougat/v1/health
printf '\n\nLocal catalog:\n'
curl --fail --silent --show-error http://127.0.0.1:8096/nougat/v1/catalog
printf '\n\nNougat Media Core local deployment complete.\n'
printf 'Public Web App playback still requires an HTTPS reverse-proxy hostname before nougat-config.js is enabled.\n'
