#!/usr/bin/env bash
set -euo pipefail

# Install the already-built Hanafi Nougat Media Core as a per-user systemd
# service. Run configure-hosted-library.sh first so the private manifest exists.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BUILD_DIR="${BUILD_DIR:-$REPO_ROOT/build/media-server}"
SERVER_SOURCE="$BUILD_DIR/hanafi-nougat-media-server"
SERVER_DEST="$HOME/.local/bin/hanafi-nougat-media-server"
MANIFEST_PATH="${MANIFEST_PATH:-$HOME/.config/hanafi-media/media.tsv}"
UNIT_DIR="$HOME/.config/systemd/user"
UNIT_PATH="$UNIT_DIR/hanafi-nougat-media.service"

if [[ ! -x "$SERVER_SOURCE" ]]; then
  echo "Missing built server: $SERVER_SOURCE" >&2
  echo "Run media-server/deploy/configure-hosted-library.sh first." >&2
  exit 2
fi
if [[ ! -f "$MANIFEST_PATH" ]]; then
  echo "Missing private media manifest: $MANIFEST_PATH" >&2
  echo "Run media-server/deploy/configure-hosted-library.sh first." >&2
  exit 2
fi

mkdir -p "$HOME/.local/bin" "$UNIT_DIR"
install -m 0755 "$SERVER_SOURCE" "$SERVER_DEST"

cat > "$UNIT_PATH" <<EOF
[Unit]
Description=Hanafi Nougat Media Core
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=$HOME/.config/hanafi-media
Environment=HANAFI_MEDIA_BIND=127.0.0.1
Environment=HANAFI_MEDIA_PORT=8096
Environment=HANAFI_MEDIA_MANIFEST=$MANIFEST_PATH
Environment=HANAFI_MEDIA_CORS_ORIGIN=https://dereksparks1982.github.io
ExecStart=$SERVER_DEST
Restart=on-failure
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable --now hanafi-nougat-media.service

for _ in {1..30}; do
  if curl -fsS http://127.0.0.1:8096/nougat/v1/health >/dev/null 2>&1; then
    break
  fi
  sleep .1
done

curl -fsS http://127.0.0.1:8096/nougat/v1/health | grep -q '"ok":true'

echo "PASS: Hanafi Nougat Media Core is running as a user service."
echo "Unit: $UNIT_PATH"
echo "Binary: $SERVER_DEST"
echo "Manifest: $MANIFEST_PATH"
