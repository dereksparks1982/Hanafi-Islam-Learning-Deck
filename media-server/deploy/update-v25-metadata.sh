#!/usr/bin/env bash
set -euo pipefail

REPO="dereksparks1982/Hanafi-Islam-Learning-Deck"
REF="${HANAFI_REPO_REF:-main}"
RAW_BASE="https://raw.githubusercontent.com/$REPO/$REF"
PUBLIC_ROOT="${HANAFI_PUBLIC_MEDIA_ROOT:-/home/dereksparks1982/Videos/Hosted}"
ENV_FILE="/etc/hanafi-media/jellyfin.env"
BRIDGE_DST="/usr/local/bin/hanafi-jellyfin-bridge"
STABLE_DST="/usr/local/bin/hanafi-jellyfin-bridge-stable.py"
POSTER_CACHE="${HANAFI_POSTER_CACHE:-/tmp/hanafi-media-posters}"
TMPD="$(mktemp -d)"
trap 'rm -rf "$TMPD"' EXIT

curl -fsSL "$RAW_BASE/server/hanafi-jellyfin-bridge" -o "$TMPD/hanafi-jellyfin-bridge"
curl -fsSL "$RAW_BASE/server/hanafi-jellyfin-bridge-stable.py" -o "$TMPD/hanafi-jellyfin-bridge-stable.py"
python3 -m py_compile "$TMPD/hanafi-jellyfin-bridge" "$TMPD/hanafi-jellyfin-bridge-stable.py"

sudo -n install -m 0755 "$TMPD/hanafi-jellyfin-bridge" "$BRIDGE_DST"
sudo -n install -m 0644 "$TMPD/hanafi-jellyfin-bridge-stable.py" "$STABLE_DST"

sudo -n test -f "$ENV_FILE"
sudo -n cat "$ENV_FILE" > "$TMPD/jellyfin.env"
python3 - "$TMPD/jellyfin.env" "$PUBLIC_ROOT" "$POSTER_CACHE" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
updates = {
    'HANAFI_PUBLIC_MEDIA_ROOT': sys.argv[2],
    'HANAFI_POSTER_CACHE': sys.argv[3],
}
lines = path.read_text(encoding='utf-8').splitlines()
seen = set()
out = []
for line in lines:
    if '=' in line and not line.lstrip().startswith('#'):
        key = line.split('=', 1)[0]
        if key in updates:
            out.append(f'{key}={updates[key]}')
            seen.add(key)
            continue
    out.append(line)
for key, value in updates.items():
    if key not in seen:
        out.append(f'{key}={value}')
path.write_text('\n'.join(out) + '\n', encoding='utf-8')
PY
sudo -n install -m 0644 "$TMPD/jellyfin.env" "$ENV_FILE"

python3 - "$TMPD/jellyfin.env" <<'PY'
import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

values = {}
for raw in Path(sys.argv[1]).read_text(encoding='utf-8').splitlines():
    if '=' in raw and not raw.lstrip().startswith('#'):
        key, value = raw.split('=', 1)
        values[key] = value

base = values.get('HANAFI_JELLYFIN_URL', 'http://127.0.0.1:8098').rstrip('/')
state_path = os.path.expanduser(values.get('HANAFI_NOUGAT_CLIENT_STATE', '~/.config/reddmedia/server/client.json'))
public_root = os.path.realpath(values.get('HANAFI_PUBLIC_MEDIA_ROOT', '~/Videos/Hosted'))
try:
    token = str(json.loads(Path(state_path).read_text(encoding='utf-8')).get('AccessToken', '')).strip()
except Exception:
    token = ''

if not token:
    print('WARN: Jellyfin token unavailable; local scan and poster fallback remain active.')
    raise SystemExit(0)

def request(path, method='GET'):
    req = urllib.request.Request(
        base + path,
        method=method,
        headers={'Accept': 'application/json', 'X-Emby-Token': token},
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        body = response.read()
        if not body:
            return None
        return json.loads(body.decode('utf-8'))

try:
    folders = request('/Library/VirtualFolders') or []
    locations = {
        os.path.realpath(location)
        for folder in folders
        for location in (folder.get('Locations') or [])
        if location
    }
    if public_root not in locations:
        query = urllib.parse.urlencode(
            [
                ('name', 'Hanafi Public Media'),
                ('collectionType', 'movies'),
                ('paths', public_root),
                ('refreshLibrary', 'true'),
            ]
        )
        request('/Library/VirtualFolders?' + query, method='POST')
        print('Added Hosted as a Jellyfin movie library for automatic metadata/artwork.')
    else:
        print('Hosted is already a Jellyfin library path.')
    request('/Library/Refresh', method='POST')
except Exception as exc:
    print(f'WARN: Jellyfin library metadata setup could not complete: {exc}')
PY

sudo -n systemctl restart hanafi-jellyfin-bridge.service
for attempt in $(seq 1 20); do
  if curl -fsS --max-time 5 http://127.0.0.1:8097/nougat/v1/health >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done

printf 'SERVICE=%s\n' "$(systemctl is-active hanafi-jellyfin-bridge.service)"
curl -fsS --max-time 20 http://127.0.0.1:8097/nougat/v1/health | python3 -m json.tool
curl -fsS --max-time 60 http://127.0.0.1:8097/nougat/v1/catalog | python3 -m json.tool
