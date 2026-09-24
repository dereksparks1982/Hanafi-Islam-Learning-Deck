#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MANIFEST_SRC="$REPO_ROOT/media-server/media.tsv.example"
BRIDGE_SRC="$REPO_ROOT/media-server/jellyfin_bridge.py"

NOUGAT_ROOT="${NOUGAT_ROOT:-/home/dereksparks1982/DKLab/Projects/Nougat Media Plus}"
NOUGAT_RUNTIME="$NOUGAT_ROOT/components/jellyfin/runtime/jellyfin/jellyfin"
NOUGAT_BUILD="$NOUGAT_ROOT/tools/build_integrated_jellyfin_v15.sh"
NOUGAT_DATA="/home/dereksparks1982/.local/share/reddmedia/server/data"
NOUGAT_CONFIG="/home/dereksparks1982/.config/reddmedia/server"
NOUGAT_CACHE="/home/dereksparks1982/.cache/reddmedia/server"
NOUGAT_LOG="/home/dereksparks1982/.local/share/reddmedia/server/log"
NOUGAT_CLIENT_STATE="$NOUGAT_CONFIG/client.json"

MEDIA_DIR="/etc/hanafi-media"
MANIFEST_DST="$MEDIA_DIR/media.tsv"
ENV_FILE="$MEDIA_DIR/jellyfin.env"
PUBLIC_URL_FILE="$MEDIA_DIR/public-base-url"
BRIDGE_SERVICE="/etc/systemd/system/hanafi-jellyfin-bridge.service"
BACKEND_SERVICE="/etc/systemd/system/hanafi-nougat-jellyfin.service"
ENSURE_BACKEND="/usr/local/bin/hanafi-nougat-jellyfin-ensure"
NGINX_FILE="/etc/nginx/sites-available/hanafi-jellyfin"
NGINX_LINK="/etc/nginx/sites-enabled/hanafi-jellyfin"

need_cmd() {
  command -v "$1" >/dev/null 2>&1
}

for required in "$MANIFEST_SRC" "$BRIDGE_SRC"; do
  if [[ ! -f "$required" ]]; then
    echo "Missing required Hanafi media file: $required" >&2
    exit 1
  fi
done

# Pull only Nougat's already-integrated Jellyfin runtime. Nothing from Games,
# Live TV, AI, Search, P2P, Console, or the desktop UI is installed here.
if [[ ! -x "$NOUGAT_RUNTIME" ]]; then
  if [[ ! -x "$NOUGAT_BUILD" ]]; then
    echo "Nougat's integrated Jellyfin runtime is missing and its build helper was not found:" >&2
    echo "  $NOUGAT_BUILD" >&2
    exit 1
  fi
  echo "Building the existing Nougat integrated Jellyfin runtime only..."
  bash "$NOUGAT_BUILD"
fi

if [[ ! -x "$NOUGAT_RUNTIME" ]]; then
  echo "Nougat Jellyfin runtime was not produced: $NOUGAT_RUNTIME" >&2
  exit 1
fi

if ! need_cmd curl || ! need_cmd python3 || ! need_cmd nginx || ! need_cmd certbot || ! need_cmd upnpc; then
  sudo apt-get update
  sudo apt-get install -y curl python3 nginx certbot miniupnpc
fi

mkdir -p "$NOUGAT_DATA" "$NOUGAT_CONFIG" "$NOUGAT_CACHE" "$NOUGAT_LOG"

# Reuse Nougat's accepted private-backend layout: Jellyfin on loopback port 8098,
# no remote Jellyfin exposure, no automatic Jellyfin port mapping.
python3 - "$NOUGAT_CONFIG/network.xml" <<'PY'
from pathlib import Path
import re
import sys

path = Path(sys.argv[1])
path.parent.mkdir(parents=True, exist_ok=True)
if path.exists():
    xml = path.read_text(encoding='utf-8', errors='replace')
else:
    xml = '''<?xml version="1.0" encoding="utf-8"?>
<NetworkConfiguration xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <BaseUrl />
  <EnableHttps>false</EnableHttps>
  <RequireHttps>false</RequireHttps>
  <CertificatePath />
  <CertificatePassword />
  <InternalHttpPort>8098</InternalHttpPort>
  <InternalHttpsPort>8920</InternalHttpsPort>
  <PublicHttpPort>8098</PublicHttpPort>
  <PublicHttpsPort>8920</PublicHttpsPort>
  <AutoDiscovery>false</AutoDiscovery>
  <EnableIPv4>true</EnableIPv4>
  <EnableIPv6>false</EnableIPv6>
  <EnableRemoteAccess>false</EnableRemoteAccess>
  <LocalNetworkSubnets />
  <LocalNetworkAddresses><string>127.0.0.1</string></LocalNetworkAddresses>
  <KnownProxies />
  <IgnoreVirtualInterfaces>true</IgnoreVirtualInterfaces>
  <VirtualInterfaceNames><string>veth</string></VirtualInterfaceNames>
  <EnablePublishedServerUriByRequest>false</EnablePublishedServerUriByRequest>
  <PublishedServerUriBySubnet />
  <RemoteIPFilter />
  <IsRemoteIPFilterBlacklist>false</IsRemoteIPFilterBlacklist>
</NetworkConfiguration>
'''

def element(name, value):
    global xml
    pattern = rf'<{name}>.*?</{name}>'
    replacement = f'<{name}>{value}</{name}>'
    if re.search(pattern, xml, flags=re.S):
        xml = re.sub(pattern, replacement, xml, count=1, flags=re.S)
        return
    empty = rf'<{name}\s*/>'
    if re.search(empty, xml):
        xml = re.sub(empty, replacement, xml, count=1)
        return
    raise SystemExit(f'Could not update {name} in {path}')

element('InternalHttpPort', '8098')
element('PublicHttpPort', '8098')
element('EnableRemoteAccess', 'false')
element('LocalNetworkAddresses', '<string>127.0.0.1</string>')
path.write_text(xml, encoding='utf-8')
PY

sudo tee "$ENSURE_BACKEND" >/dev/null <<EOF
#!/usr/bin/env bash
set -euo pipefail
if curl -fsS http://127.0.0.1:8098/health >/dev/null 2>&1; then
  exit 0
fi
mkdir -p "$NOUGAT_DATA" "$NOUGAT_CONFIG" "$NOUGAT_CACHE" "$NOUGAT_LOG"
setsid env NOUGAT_MEDIA_SERVER_OWNER=hanafi-learning-deck \
  "$NOUGAT_RUNTIME" \
  --datadir "$NOUGAT_DATA" \
  --configdir "$NOUGAT_CONFIG" \
  --cachedir "$NOUGAT_CACHE" \
  --logdir "$NOUGAT_LOG" \
  --nowebclient \
  --ffmpeg /usr/bin/ffmpeg \
  --service \
  --package-name "Nougat Media Suite integrated Jellyfin" \
  >>"$NOUGAT_LOG/jellyfin.log" 2>&1 </dev/null &
for attempt in \$(seq 1 60); do
  if curl -fsS http://127.0.0.1:8098/health >/dev/null 2>&1; then
    exit 0
  fi
  sleep 0.5
done
echo "Nougat integrated Jellyfin did not become ready on 127.0.0.1:8098." >&2
exit 1
EOF
sudo chmod 0755 "$ENSURE_BACKEND"

sudo tee "$BACKEND_SERVICE" >/dev/null <<'EOF'
[Unit]
Description=Ensure Nougat integrated Jellyfin backend for Hanafi media
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/hanafi-nougat-jellyfin-ensure
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now hanafi-nougat-jellyfin.service
curl -fsS http://127.0.0.1:8098/health >/dev/null

if [[ ! -s "$NOUGAT_CLIENT_STATE" ]]; then
  echo "Nougat's private Jellyfin client session is not present at:" >&2
  echo "  $NOUGAT_CLIENT_STATE" >&2
  echo "The existing Nougat server data was left untouched." >&2
  exit 1
fi

if ! python3 - "$NOUGAT_CLIENT_STATE" <<'PY'
import json
import sys
with open(sys.argv[1], 'r', encoding='utf-8') as fh:
    data = json.load(fh)
raise SystemExit(0 if data.get('AccessToken') else 1)
PY
then
  echo "Nougat's private Jellyfin client state does not contain an access token." >&2
  exit 1
fi

sudo install -d -m 0755 "$MEDIA_DIR"
sudo install -m 0755 "$BRIDGE_SRC" /usr/local/bin/hanafi-jellyfin-bridge
sudo install -m 0644 "$MANIFEST_SRC" "$MANIFEST_DST"

sudo tee "$ENV_FILE" >/dev/null <<EOF
HOME=/home/dereksparks1982
HANAFI_MEDIA_BIND=127.0.0.1
HANAFI_MEDIA_PORT=8097
HANAFI_MEDIA_MANIFEST=$MANIFEST_DST
HANAFI_MEDIA_CORS_ORIGIN=https://dereksparks1982.github.io
HANAFI_JELLYFIN_URL=http://127.0.0.1:8098
HANAFI_NOUGAT_CLIENT_STATE=$NOUGAT_CLIENT_STATE
EOF
sudo chmod 0644 "$ENV_FILE"

sudo tee "$BRIDGE_SERVICE" >/dev/null <<'EOF'
[Unit]
Description=Hanafi web player bridge to Nougat integrated Jellyfin
After=network-online.target hanafi-nougat-jellyfin.service
Wants=network-online.target hanafi-nougat-jellyfin.service

[Service]
Type=simple
User=dereksparks1982
Group=dereksparks1982
EnvironmentFile=/etc/hanafi-media/jellyfin.env
ExecStart=/usr/bin/python3 /usr/local/bin/hanafi-jellyfin-bridge
Restart=on-failure
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only
ReadOnlyPaths=/home/dereksparks1982/Videos/Hosted /home/dereksparks1982/.config/reddmedia/server /etc/hanafi-media

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now hanafi-jellyfin-bridge.service
for attempt in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:8097/nougat/v1/health >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done
curl -fsS http://127.0.0.1:8097/nougat/v1/health >/dev/null

PUBLIC_IP="$(curl -4fsS https://api.ipify.org)"
if [[ ! "$PUBLIC_IP" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Could not determine a public IPv4 address." >&2
  exit 1
fi

LAN_IP="$(hostname -I | awk '{print $1}')"
if [[ -n "$LAN_IP" ]]; then
  upnpc -a "$LAN_IP" 80 80 TCP >/dev/null 2>&1 || true
  upnpc -a "$LAN_IP" 443 443 TCP >/dev/null 2>&1 || true
fi

if ! certbot --help all 2>/dev/null | grep -q -- '--ip-address'; then
  echo "Certbot 5.4 or newer is required for a trusted certificate directly on an IP address." >&2
  echo "No domain or paid host is required, but this machine's Certbot is too old." >&2
  exit 1
fi

sudo systemctl stop nginx || true
if [[ ! -s "/etc/letsencrypt/live/$PUBLIC_IP/fullchain.pem" ]]; then
  sudo certbot certonly --standalone \
    --preferred-profile shortlived \
    --ip-address "$PUBLIC_IP" \
    --non-interactive --agree-tos --register-unsafely-without-email
fi

sudo tee "$NGINX_FILE" >/dev/null <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $PUBLIC_IP;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    server_name $PUBLIC_IP;

    ssl_certificate /etc/letsencrypt/live/$PUBLIC_IP/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$PUBLIC_IP/privkey.pem;

    location /nougat/ {
        proxy_pass http://127.0.0.1:8097;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Range \$http_range;
        proxy_set_header If-Range \$http_if_range;
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_read_timeout 3600s;
    }

    location = /robots.txt {
        proxy_pass http://127.0.0.1:8097/robots.txt;
    }
}
EOF

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf "$NGINX_FILE" "$NGINX_LINK"
sudo nginx -t
sudo systemctl enable --now nginx

sudo install -d -m 0755 /etc/letsencrypt/renewal-hooks/pre /etc/letsencrypt/renewal-hooks/post
sudo tee /etc/letsencrypt/renewal-hooks/pre/hanafi-stop-nginx >/dev/null <<'EOF'
#!/usr/bin/env bash
systemctl stop nginx || true
EOF
sudo tee /etc/letsencrypt/renewal-hooks/post/hanafi-start-nginx >/dev/null <<'EOF'
#!/usr/bin/env bash
systemctl start nginx || true
EOF
sudo chmod 0755 \
  /etc/letsencrypt/renewal-hooks/pre/hanafi-stop-nginx \
  /etc/letsencrypt/renewal-hooks/post/hanafi-start-nginx

printf 'https://%s\n' "$PUBLIC_IP" | sudo tee "$PUBLIC_URL_FILE" >/dev/null

echo
echo "PASS: Nougat server core is feeding the Hanafi web bridge."
echo "PUBLIC_BASE_URL=https://$PUBLIC_IP"
echo "The movies remain on this computer; the public web player receives them through Jellyfin."
echo "No Nougat UI, Games, Live TV, Search, AI, P2P, or other Nougat features were copied into Hanafi."
echo "If public certificate validation failed, make sure TCP 80 and 443 reach this computer and run this script again."
