#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MANIFEST_SRC="$REPO_ROOT/media-server/media.tsv.example"
BRIDGE_SRC="$REPO_ROOT/media-server/jellyfin_bridge.py"
CONFIG_JS="$REPO_ROOT/web-viewer/media/nougat-config.js"
SERVICE_FILE="/etc/systemd/system/hanafi-jellyfin-bridge.service"
ENV_FILE="/etc/hanafi-media/jellyfin.env"
MANIFEST_DST="/etc/hanafi-media/media.tsv"
NGINX_FILE="/etc/nginx/sites-available/hanafi-jellyfin"
NGINX_LINK="/etc/nginx/sites-enabled/hanafi-jellyfin"

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || return 1
}

if ! need_cmd curl || ! need_cmd python3 || ! need_cmd nginx || ! need_cmd certbot; then
  sudo apt-get update
  sudo apt-get install -y curl python3 nginx certbot miniupnpc
fi

if ! curl -fsS http://127.0.0.1:8096/System/Info/Public >/dev/null; then
  echo "Jellyfin is not answering on http://127.0.0.1:8096." >&2
  echo "Start Jellyfin first, then run this script again." >&2
  exit 1
fi

read -rp "Jellyfin username: " JELLYFIN_USER
read -rsp "Jellyfin password: " JELLYFIN_PASSWORD
echo

auth_payload="$(python3 - "$JELLYFIN_USER" "$JELLYFIN_PASSWORD" <<'PY'
import json, sys
print(json.dumps({"Username": sys.argv[1], "Pw": sys.argv[2]}))
PY
)"

auth_response="$(curl -fsS \
  -X POST http://127.0.0.1:8096/Users/AuthenticateByName \
  -H 'Content-Type: application/json' \
  -H 'Authorization: MediaBrowser Client="Hanafi Learning Deck", Device="saxondesktop", DeviceId="hanafi-deploy", Version="2.1"' \
  --data "$auth_payload")"

JELLYFIN_TOKEN="$(python3 -c 'import json,sys; print(json.load(sys.stdin).get("AccessToken", ""))' <<<"$auth_response")"
if [[ -z "$JELLYFIN_TOKEN" ]]; then
  echo "Jellyfin login did not return an access token." >&2
  exit 1
fi

PUBLIC_IP="$(curl -4fsS https://api.ipify.org)"
if [[ ! "$PUBLIC_IP" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Could not determine a public IPv4 address." >&2
  exit 1
fi

LAN_IP="$(hostname -I | awk '{print $1}')"
if command -v upnpc >/dev/null 2>&1 && [[ -n "$LAN_IP" ]]; then
  upnpc -a "$LAN_IP" 80 80 TCP >/dev/null 2>&1 || true
  upnpc -a "$LAN_IP" 443 443 TCP >/dev/null 2>&1 || true
fi

sudo install -d -m 0755 /etc/hanafi-media
sudo install -m 0755 "$BRIDGE_SRC" /usr/local/bin/hanafi-jellyfin-bridge
sudo install -m 0644 "$MANIFEST_SRC" "$MANIFEST_DST"

sudo tee "$ENV_FILE" >/dev/null <<EOF
HANAFI_MEDIA_BIND=127.0.0.1
HANAFI_MEDIA_PORT=8097
HANAFI_MEDIA_MANIFEST=$MANIFEST_DST
HANAFI_MEDIA_CORS_ORIGIN=https://dereksparks1982.github.io
HANAFI_JELLYFIN_URL=http://127.0.0.1:8096
HANAFI_JELLYFIN_TOKEN=$JELLYFIN_TOKEN
EOF
sudo chmod 0600 "$ENV_FILE"

sudo tee "$SERVICE_FILE" >/dev/null <<'EOF'
[Unit]
Description=Hanafi Jellyfin media bridge
After=network-online.target jellyfin.service
Wants=network-online.target

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
ReadOnlyPaths=/home/dereksparks1982/Videos/Hosted /etc/hanafi-media

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now hanafi-jellyfin-bridge.service
sleep 1
curl -fsS http://127.0.0.1:8097/nougat/v1/health >/dev/null

if ! certbot --help all 2>/dev/null | grep -q -- '--ip-address'; then
  echo "Your Certbot is too old for free IP-address certificates. Certbot 5.4+ is required." >&2
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
sudo chmod 0755 /etc/letsencrypt/renewal-hooks/pre/hanafi-stop-nginx /etc/letsencrypt/renewal-hooks/post/hanafi-start-nginx

cat > "$CONFIG_JS" <<EOF
(() => {
  "use strict";

  // Direct, self-hosted Jellyfin media gateway on saxondesktop.
  // No rented media host and no registered domain are required.
  window.HANAFI_NOUGAT_MEDIA = Object.freeze({
    enabled: true,
    baseUrl: "https://$PUBLIC_IP"
  });
})();
EOF

cd "$REPO_ROOT"
git add web-viewer/media/nougat-config.js
git commit -m "Enable direct Jellyfin media gateway at $PUBLIC_IP" || true
git push

echo
echo "Jellyfin -> Hanafi web player is configured for https://$PUBLIC_IP"
echo "If the certificate request failed, forward TCP ports 80 and 443 in your router to $LAN_IP and run this script again."
