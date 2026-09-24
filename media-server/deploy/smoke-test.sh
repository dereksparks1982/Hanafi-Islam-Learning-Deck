#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:8096}"

printf 'Health... '
curl --fail --silent --show-error "$BASE_URL/nougat/v1/health" >/dev/null
printf 'PASS\n'

printf 'Catalog... '
curl --fail --silent --show-error "$BASE_URL/nougat/v1/catalog" >/dev/null
printf 'PASS\n'

check_range() {
  local id="$1"
  local headers
  headers="$(mktemp)"
  trap 'rm -f "$headers"' RETURN
  curl --fail --silent --show-error \
    -D "$headers" \
    -o /dev/null \
    -H 'Range: bytes=0-1023' \
    "$BASE_URL/nougat/v1/media?id=$id"
  grep -qi '^HTTP/.* 206 ' "$headers"
  grep -qi '^Accept-Ranges: bytes' "$headers"
  grep -qi '^Content-Range: bytes 0-1023/' "$headers"
  rm -f "$headers"
  trap - RETURN
}

for id in \
  message-en-720 \
  message-en-1080-hardsubs \
  risalah-ar-1080 \
  risalah-ar-1080-hardsubs \
  risalah-ar-480 \
  risalah-ar-360 \
  lion-desert-1981 \
  ten-commandments-1923
do
  printf 'Range streaming %-30s ... ' "$id"
  check_range "$id"
  printf 'PASS\n'
done

printf 'Subtitle conversion risalah-ar-1080 ... '
subtitle="$(curl --fail --silent --show-error "$BASE_URL/nougat/v1/subtitle?id=risalah-ar-1080")"
case "$subtitle" in
  WEBVTT*) printf 'PASS\n' ;;
  *) printf 'FAIL\n' >&2; exit 1 ;;
esac

printf 'All Nougat Media Core smoke tests passed.\n'
