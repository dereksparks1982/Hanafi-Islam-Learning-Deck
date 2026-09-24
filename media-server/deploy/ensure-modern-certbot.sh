#!/usr/bin/env bash
set -euo pipefail

supports_ip_certificates() {
  command -v certbot >/dev/null 2>&1 && certbot --help all 2>/dev/null | grep -q -- '--ip-address'
}

if supports_ip_certificates; then
  echo "Certbot already supports IP-address certificates: $(certbot --version 2>&1)"
  exit 0
fi

echo "The Ubuntu Certbot package is too old for IP-address certificates."
echo "Switching only Certbot to the official snap package. No account or domain is required."

if ! command -v snap >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y snapd
fi

# Avoid having /usr/bin/certbot from Ubuntu shadow the newer snap build.
sudo apt-get remove -y certbot python3-certbot || true

if snap list certbot >/dev/null 2>&1; then
  sudo snap refresh certbot
else
  sudo snap install --classic certbot
fi

sudo ln -sf /snap/bin/certbot /usr/local/bin/certbot
hash -r

if ! supports_ip_certificates; then
  echo "The installed Certbot still does not expose --ip-address." >&2
  echo "Installed version: $(certbot --version 2>&1 || true)" >&2
  exit 1
fi

echo "PASS: $(certbot --version 2>&1) supports IP-address certificates."
