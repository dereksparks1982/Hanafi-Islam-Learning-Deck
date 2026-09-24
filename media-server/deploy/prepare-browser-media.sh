#!/usr/bin/env bash
set -euo pipefail

SOURCE_MANIFEST="${HANAFI_SOURCE_MANIFEST:-/etc/hanafi-media/media.tsv}"
BROWSER_MANIFEST="${HANAFI_BROWSER_MANIFEST:-/etc/hanafi-media/media.browser.tsv}"
CACHE_DIR="${HANAFI_BROWSER_CACHE:-/var/cache/hanafi-media/browser}"
ENV_FILE="${HANAFI_MEDIA_ENV:-/etc/hanafi-media/jellyfin.env}"
FFMPEG="${HANAFI_FFMPEG:-/usr/bin/ffmpeg}"
FFPROBE="${HANAFI_FFPROBE:-/usr/bin/ffprobe}"

if [[ ! -f "$SOURCE_MANIFEST" ]]; then
  echo "Missing source manifest: $SOURCE_MANIFEST" >&2
  exit 1
fi
if [[ ! -x "$FFMPEG" || ! -x "$FFPROBE" ]]; then
  echo "ffmpeg and ffprobe are required." >&2
  exit 1
fi

install -d -m 0755 "$CACHE_DIR"
tmp_manifest="$(mktemp)"
trap 'rm -f "$tmp_manifest"' EXIT

printf '# Browser-compatible Hanafi media manifest\n' >"$tmp_manifest"
printf '# Generated from %s\n' "$SOURCE_MANIFEST" >>"$tmp_manifest"

probe_codec() {
  local kind="$1" path="$2"
  "$FFPROBE" -v error -select_streams "${kind}:0" -show_entries stream=codec_name -of default=nw=1:nk=1 "$path" 2>/dev/null | head -n1
}

probe_format() {
  "$FFPROBE" -v error -show_entries format=format_name -of default=nw=1:nk=1 "$1" 2>/dev/null | head -n1
}

while IFS=$'\t' read -r media_id source_path mime_type subtitle_path extra; do
  [[ -z "${media_id:-}" || "$media_id" == \#* ]] && continue
  if [[ -n "${extra:-}" ]]; then
    echo "Invalid manifest row for $media_id" >&2
    exit 1
  fi
  if [[ ! -f "$source_path" ]]; then
    echo "Missing media file for $media_id: $source_path" >&2
    exit 1
  fi

  video_codec="$(probe_codec v "$source_path")"
  audio_codec="$(probe_codec a "$source_path")"
  format_name="$(probe_format "$source_path")"
  output_path="$source_path"

  browser_container=false
  case ",$format_name," in
    *,mov,*|*,mp4,*|*,m4a,*|*,3gp,*|*,3g2,*|*,mj2,*) browser_container=true ;;
  esac

  if [[ "$browser_container" == true && "$video_codec" == "h264" && ( -z "$audio_codec" || "$audio_codec" == "aac" ) ]]; then
    echo "PASS direct: $media_id ($video_codec/${audio_codec:-no-audio})"
  else
    output_path="$CACHE_DIR/$media_id.mp4"
    if [[ -s "$output_path" && "$output_path" -nt "$source_path" ]]; then
      echo "PASS cached: $media_id"
    else
      part="$output_path.part.mp4"
      rm -f "$part"
      echo "PREPARE: $media_id ($video_codec/${audio_codec:-no-audio}; $format_name)"

      video_args=(-c:v libx264 -preset veryfast -crf 22 -pix_fmt yuv420p)
      if [[ "$video_codec" == "h264" ]]; then
        video_args=(-c:v copy)
      fi

      audio_args=(-c:a aac -b:a 160k)
      if [[ -z "$audio_codec" ]]; then
        audio_args=(-an)
      elif [[ "$audio_codec" == "aac" ]]; then
        audio_args=(-c:a copy)
      fi

      "$FFMPEG" -y -nostdin -hide_banner \
        -i "$source_path" \
        -map 0:v:0 -map 0:a:0? -sn \
        "${video_args[@]}" \
        "${audio_args[@]}" \
        -movflags +faststart \
        "$part"
      mv -f "$part" "$output_path"
      chmod 0644 "$output_path"
      echo "PASS prepared: $media_id -> $output_path"
    fi
  fi

  printf '%s\t%s\tvideo/mp4\t%s\n' "$media_id" "$output_path" "${subtitle_path:-}" >>"$tmp_manifest"
done <"$SOURCE_MANIFEST"

install -m 0644 "$tmp_manifest" "$BROWSER_MANIFEST"

if [[ -f "$ENV_FILE" ]]; then
  if grep -q '^HANAFI_MEDIA_MANIFEST=' "$ENV_FILE"; then
    sed -i "s|^HANAFI_MEDIA_MANIFEST=.*|HANAFI_MEDIA_MANIFEST=$BROWSER_MANIFEST|" "$ENV_FILE"
  else
    printf 'HANAFI_MEDIA_MANIFEST=%s\n' "$BROWSER_MANIFEST" >>"$ENV_FILE"
  fi
fi

systemctl restart hanafi-jellyfin-bridge.service
sleep 2
curl -fsS http://127.0.0.1:8097/nougat/v1/health >/dev/null

echo
echo "PASS: Browser-compatible Hanafi media manifest installed."
echo "Manifest: $BROWSER_MANIFEST"
echo "Playback now uses seekable MP4 files instead of live chunked transcoding."
