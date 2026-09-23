#!/usr/bin/env bash
set -euo pipefail

REPO_SSH="git@github.com:dereksparks1982/Hanafi-Islam-Learning-Deck.git"
ONION_ROOT="/var/www/hanafi-deck"
ONION_URL="http://hanafiiix6xddzpmjxbpns5svgoujdnjwf3ky4a72rzai5mumxm4mzqd.onion/"
LOCAL_HTTP="http://127.0.0.1:8080"
STAMP_FILE="$ONION_ROOT/.source-main-sha"

TMP_ROOT="$(mktemp -d)"
trap 'rm -rf "$TMP_ROOT"' EXIT

SOURCE="$TMP_ROOT/repo"
SITE="$TMP_ROOT/site"

echo "=== Hanafi Learning Deck Tor Mirror Update ==="
echo "Source: main"
echo "Target: $ONION_ROOT"

echo
echo "[1/6] Checking the current main commit over SSH..."
REMOTE_SHA="$(git ls-remote --heads "$REPO_SSH" main | awk '{print $1}')"
if [[ -z "$REMOTE_SHA" ]]; then
  echo "ERROR: could not resolve main from $REPO_SSH" >&2
  exit 1
fi

echo "Remote main: $REMOTE_SHA"

CURRENT_SHA=""
if sudo test -f "$STAMP_FILE"; then
  CURRENT_SHA="$(sudo cat "$STAMP_FILE" 2>/dev/null || true)"
fi

if [[ "$CURRENT_SHA" == "$REMOTE_SHA" ]]; then
  echo "Mirror stamp already matches main. Verifying the local service before skipping rebuild..."
  if curl -fsS "$LOCAL_HTTP/" | grep -q "Hanafi Learning Deck" \
    && curl -fsS "$LOCAL_HTTP/quran/" >/dev/null \
    && curl -fsS "$LOCAL_HTTP/makkah/" >/dev/null \
    && curl -fsS "$LOCAL_HTTP/explore/" >/dev/null \
    && curl -fsS "$LOCAL_HTTP/media/" >/dev/null \
    && curl -fsS "$LOCAL_HTTP/live/" >/dev/null; then
    echo "PASS: Tor mirror is already current and all v2.0 routes respond locally."
    exit 0
  fi
  echo "NOTE: commit stamp matches, but local verification failed. Rebuilding mirror."
fi

echo
echo "[2/6] Fetching a clean copy of main over SSH..."
git clone --quiet --depth 1 --branch main "$REPO_SSH" "$SOURCE"
cd "$SOURCE"
SOURCE_SHA="$(git rev-parse HEAD)"

if [[ "$SOURCE_SHA" != "$REMOTE_SHA" ]]; then
  echo "ERROR: cloned main does not match the commit resolved in step 1." >&2
  exit 1
fi

echo "[3/6] Validating current Web App..."
if command -v node >/dev/null 2>&1; then
  node --check web-viewer/app.js
  node --check web-viewer/sw.js
  node --check web-viewer/quran/app.js
  node --check web-viewer/makkah/app.js
  node --check web-viewer/explore/app.js
  echo "PASS: JavaScript syntax checks"
else
  echo "NOTE: Node.js is not installed on this host; skipping optional JavaScript syntax checks."
  echo "      GitHub Pages CI remains the JavaScript validation gate."
fi

python3 -m json.tool web-viewer/manifest.webmanifest >/dev/null
python3 -m json.tool web-viewer/quran/data/page-001.json >/dev/null

python3 - <<'PY'
from pathlib import Path

main = [Path(f"cards/card_{i:03d}.png") for i in range(147)]
sacred = list(Path("Sacred-Places-Expansion").glob("card_*.png"))
names = list(Path("99-Names-of-Allah-Expansion").glob("card_*.png"))
arabic = list(Path("Arabic-Alphabet-Expansion/cards").glob("card_*.png"))
important = list(Path("Important-Places-Expansion").glob("card_*.png"))

assert all(p.is_file() for p in main), "main deck card missing"
counts = [len(main), len(sacred), len(names), len(arabic), len(important)]
assert counts == [147, 19, 12, 28, 3], counts
assert sum(counts) == 209, sum(counts)

for required in (
    Path("web-viewer/index.html"),
    Path("web-viewer/quran/index.html"),
    Path("web-viewer/makkah/index.html"),
    Path("web-viewer/explore/index.html"),
    Path("web-viewer/media/index.html"),
    Path("web-viewer/live/index.html"),
):
    assert required.is_file(), f"missing Web App page: {required}"

print("PASS: current 209-card library and all v2.0 Web App routes")
PY

echo "[4/6] Building the same static site layout used by GitHub Pages..."
mkdir -p "$SITE"
cp -a web-viewer/. "$SITE/"
cp -a cards "$SITE/cards"
cp -a Sacred-Places-Expansion "$SITE/Sacred-Places-Expansion"
cp -a 99-Names-of-Allah-Expansion "$SITE/99-Names-of-Allah-Expansion"
mkdir -p "$SITE/Arabic-Alphabet-Expansion"
cp -a Arabic-Alphabet-Expansion/cards "$SITE/Arabic-Alphabet-Expansion/cards"
cp -a Important-Places-Expansion "$SITE/Important-Places-Expansion"
touch "$SITE/.nojekyll"

echo "[5/6] Replacing the Tor mirror with the current main build..."
sudo mkdir -p "$ONION_ROOT"
sudo rsync -a --delete "$SITE/" "$ONION_ROOT/"
printf '%s\n' "$SOURCE_SHA" | sudo tee "$STAMP_FILE" >/dev/null
sudo nginx -t
sudo systemctl reload nginx

echo "[6/6] Verifying the local Tor-facing web service..."
curl -fsS "$LOCAL_HTTP/" | grep -q "Hanafi Learning Deck"
curl -fsS "$LOCAL_HTTP/quran/" >/dev/null
curl -fsS "$LOCAL_HTTP/makkah/" >/dev/null
curl -fsS "$LOCAL_HTTP/explore/" >/dev/null
curl -fsS "$LOCAL_HTTP/media/" >/dev/null
curl -fsS "$LOCAL_HTTP/live/" >/dev/null

echo
echo "PASS: Tor mirror now serves commit $SOURCE_SHA from main."
echo "Onion: $ONION_URL"
echo "Tor hidden-service keys and Tor configuration were not changed."
