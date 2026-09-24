#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="${1:-$PWD}"
MEDIA_ROOT="/home/dereksparks1982/Videos/Hosted"
BUILD_DIR="$REPO_ROOT/build/media-server"
SERVER_BIN="$BUILD_DIR/hanafi-nougat-media-server"
MANIFEST_SOURCE="$REPO_ROOT/media-server/media.tsv.example"
SERVICE_SOURCE="$REPO_ROOT/media-server/deploy/hanafi-nougat-media.service.example"

required_files=(
  "$MEDIA_ROOT/Al-Risalah/The Message (1976).nosubs.mp4"
  "$MEDIA_ROOT/Al-Risalah/The.Message.1976.1080p.WEB-DL.DD5.1.H264.nosubs.mkv"
  "$MEDIA_ROOT/Al-Risalah/The.Message.1976.1080p.BluRay.x264.AAC5.1.englishsubs.srt"
  "$MEDIA_ROOT/Al-Risalah/The.Message.1976.1080p.BluRay.x264.AAC5.1.arabic.englishsubs.mp4"
  "$MEDIA_ROOT/Al-Risalah/Al-Risalah-1976-Arabic-480p.english.subs.mp4"
  "$MEDIA_ROOT/Al-Risalah/Al-Risalah-1976-Arabic.360p.nosubs.mp4"
  "$MEDIA_ROOT/Lion of The Desert/Lion-of-the-Desert-1981.nosubs.mp4"
  "$MEDIA_ROOT/The Ten Commandments/The Ten Commandments (1923).mp4"
)

optional_english_1080="$MEDIA_ROOT/Al-Risalah/The.Message.1976.English.1080p.hardsubs.mp4"

printf 'Checking Hosted media library...\n'
missing=0
for file in "${required_files[@]}"; do
  if [[ -f "$file" ]]; then
    printf '  OK  %s\n' "$file"
  else
    printf '  MISSING  %s\n' "$file" >&2
    missing=1
  fi
done

if [[ -f "$optional_english_1080" ]]; then
  printf '  OK  %s\n' "$optional_english_1080"
else
  printf '  OPTIONAL NOT PRESENT  %s\n' "$optional_english_1080"
fi

if (( missing != 0 )); then
  printf '\nRequired Hosted files are missing. Nothing was installed.\n' >&2
  exit 2
fi

printf '\nBuilding Hanafi Nougat Media Core...\n'
cmake -S "$REPO_ROOT/media-server" -B "$BUILD_DIR" -DCMAKE_BUILD_TYPE=Release
cmake --build "$BUILD_DIR" --parallel

printf '\nInstalling runtime files...\n'
sudo install -m 0755 "$SERVER_BIN" /usr/local/bin/hanafi-nougat-media-server
sudo install -d -m 0755 /etc/hanafi-media
sudo install -m 0644 "$MANIFEST_SOURCE" /etc/hanafi-media/media.tsv
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
printf 'Public HTTPS still requires the real media hostname before the Web App can switch away from Drive.\n'
