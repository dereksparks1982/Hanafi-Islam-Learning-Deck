#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="hanafi-onion-mirror-update.service"
TIMER_NAME="hanafi-onion-mirror-update.timer"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UPDATER="$REPO_ROOT/update-onion-mirror.sh"
RUN_USER="${SUDO_USER:-$USER}"
RUN_HOME="$(getent passwd "$RUN_USER" | cut -d: -f6)"

if [[ ! -f "$UPDATER" ]]; then
  echo "ERROR: update-onion-mirror.sh was not found beside this installer." >&2
  exit 1
fi

if [[ -z "$RUN_HOME" ]]; then
  echo "ERROR: could not determine the home directory for $RUN_USER." >&2
  exit 1
fi

# The updater deliberately runs as the normal project owner so GitHub SSH uses
# that user's SSH configuration. The updater itself uses sudo for the web-root
# and nginx steps, so unattended sudo must already be available.
if ! sudo -n true 2>/dev/null; then
  echo "ERROR: unattended sudo is not available for $RUN_USER." >&2
  echo "The automatic Tor updater will not be installed because systemd cannot answer a sudo password prompt." >&2
  exit 1
fi

SERVICE_FILE="$(mktemp)"
TIMER_FILE="$(mktemp)"
trap 'rm -f "$SERVICE_FILE" "$TIMER_FILE"' EXIT

cat >"$SERVICE_FILE" <<EOF
[Unit]
Description=Update Hanafi Learning Deck Tor mirror from GitHub main
Wants=network-online.target
After=network-online.target tor@default.service nginx.service

[Service]
Type=oneshot
User=$RUN_USER
Environment="HOME=$RUN_HOME"
WorkingDirectory=$REPO_ROOT
ExecStart=/usr/bin/bash "$UPDATER"
EOF

cat >"$TIMER_FILE" <<'EOF'
[Unit]
Description=Check Hanafi Learning Deck Tor mirror for main updates

[Timer]
OnBootSec=2min
OnUnitActiveSec=5min
AccuracySec=30s
Persistent=true
Unit=hanafi-onion-mirror-update.service

[Install]
WantedBy=timers.target
EOF

sudo install -m 0644 "$SERVICE_FILE" "/etc/systemd/system/$SERVICE_NAME"
sudo install -m 0644 "$TIMER_FILE" "/etc/systemd/system/$TIMER_NAME"
sudo systemctl daemon-reload
sudo systemctl enable --now "$TIMER_NAME"

# Run one update immediately so installation verifies the complete path now,
# rather than waiting for the first timer tick.
sudo systemctl start "$SERVICE_NAME"

echo
echo "PASS: automatic Tor mirror updates are installed."
echo "Timer: $TIMER_NAME"
echo "Schedule: on boot, then every 5 minutes."
echo "Source: GitHub main via update-onion-mirror.sh"
echo
sudo systemctl status "$TIMER_NAME" --no-pager -l
