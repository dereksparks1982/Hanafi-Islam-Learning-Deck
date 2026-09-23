#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="hanafi-onion-mirror-update.service"
TIMER_NAME="hanafi-onion-mirror-update.timer"
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_UPDATER="$SOURCE_DIR/update-onion-mirror.sh"
INSTALL_DIR="/usr/local/lib/hanafi-learning-deck"
INSTALLED_UPDATER="$INSTALL_DIR/update-onion-mirror.sh"
RUN_USER="${SUDO_USER:-$USER}"
RUN_HOME="$(getent passwd "$RUN_USER" | cut -d: -f6)"
RUN_UID="$(id -u "$RUN_USER")"
SSH_AGENT_SOCKET="/run/user/$RUN_UID/gcr/ssh"

if [[ ! -f "$SOURCE_UPDATER" ]]; then
  echo "ERROR: update-onion-mirror.sh was not found beside this installer." >&2
  exit 1
fi

if [[ -z "$RUN_HOME" ]]; then
  echo "ERROR: could not determine the home directory for $RUN_USER." >&2
  exit 1
fi

if [[ ! -S "$SSH_AGENT_SOCKET" ]]; then
  echo "ERROR: the desktop SSH agent socket is not available at $SSH_AGENT_SOCKET." >&2
  echo "Log into the desktop session so the GCR SSH agent is running, then rerun this installer." >&2
  exit 1
fi

# The service runs as the normal project owner and deliberately reuses that
# user's GCR SSH agent. This matches the SSH path verified interactively for
# GitHub access without copying or exposing private keys.
if ! sudo -n true 2>/dev/null; then
  echo "ERROR: unattended sudo is not available for $RUN_USER." >&2
  echo "The automatic Tor updater will not be installed because systemd cannot answer a sudo password prompt." >&2
  exit 1
fi

SERVICE_FILE="$(mktemp)"
TIMER_FILE="$(mktemp)"
trap 'rm -f "$SERVICE_FILE" "$TIMER_FILE"' EXIT

sudo install -d -m 0755 "$INSTALL_DIR"
sudo install -m 0755 "$SOURCE_UPDATER" "$INSTALLED_UPDATER"

cat >"$SERVICE_FILE" <<EOF
[Unit]
Description=Update Hanafi Learning Deck Tor mirror from GitHub main
Wants=network-online.target
After=network-online.target tor@default.service nginx.service
ConditionPathIsSocket=$SSH_AGENT_SOCKET

[Service]
Type=oneshot
User=$RUN_USER
Environment="HOME=$RUN_HOME"
Environment="SSH_AUTH_SOCK=$SSH_AGENT_SOCKET"
WorkingDirectory=$RUN_HOME
ExecStart=/usr/bin/bash "$INSTALLED_UPDATER"
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

# Verify the complete automatic path immediately instead of waiting for the
# first timer tick.
sudo systemctl start "$SERVICE_NAME"

echo
echo "PASS: automatic Tor mirror updates are installed."
echo "Timer: $TIMER_NAME"
echo "Schedule: on boot, then every 5 minutes."
echo "Installed updater: $INSTALLED_UPDATER"
echo "SSH agent: $SSH_AGENT_SOCKET"
echo "Source: GitHub main via SSH"
echo
sudo systemctl status "$TIMER_NAME" --no-pager -l
