#!/usr/bin/env python3
import json
import mimetypes
import os
import sys
import threading
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

# Thin public bridge over the server work already built into Nougat Media Plus.
# Nougat keeps Jellyfin private on loopback:8098; this service exposes only the
# small manifest selected for the Hanafi Learning Deck web player.
BIND = os.environ.get('HANAFI_MEDIA_BIND', '127.0.0.1')
PORT = int(os.environ.get('HANAFI_MEDIA_PORT', '8097'))
MANIFEST = os.environ.get('HANAFI_MEDIA_MANIFEST', '/etc/hanafi-media/media.tsv')
ALLOWED_ORIGIN = os.environ.get('HANAFI_MEDIA_CORS_ORIGIN', 'https://dereksparks1982.github.io')
JELLYFIN_URL = os.environ.get('HANAFI_JELLYFIN_URL', 'http://127.0.0.1:8098').rstrip('/')
TOKEN_OVERRIDE = os.environ.get('HANAFI_JELLYFIN_TOKEN', '').strip()
NOUGAT_CLIENT_STATE = os.path.expanduser(
    os.environ.get('HANAFI_NOUGAT_CLIENT_STATE', '~/.config/reddmedia/server/client.json')
)


def jellyfin_token():
    if TOKEN_OVERRIDE:
        return TOKEN_OVERRIDE
    try:
        with open(NOUGAT_CLIENT_STATE, 'r', encoding='utf-8') as fh:
            return str(json.load(fh).get('AccessToken', '')).strip()
    except (OSError, ValueError, TypeError):
        return ''


def parse_manifest(path):
    items = {}
    with open(path, 'r', encoding='utf-8') as fh:
        for lineno, raw in enumerate(fh, 1):
            line = raw.rstrip('\r\n')
            if not line or line.startswith('#'):
                continue
            fields = line.split('\t')
            if len(fields) < 2 or not fields[0] or not fields[1]:
                raise RuntimeError(f'Invalid manifest row at line {lineno}')
            media_id = fields[0]
            file_path = fields[1]
            content_type = fields[2] if len(fields) > 2 and fields[2] else (
                mimetypes.guess_type(file_path)[0] or 'video/mp4'
            )
            subtitle_path = fields[3] if len(fields) > 3 else ''
            items[media_id] = {
                'id': media_id,
                'path': file_path,
                'content_type': content_type,
                'subtitle_path': subtitle_path,
                'jellyfin': None,
            }
    if not items:
        raise RuntimeError('Media manifest contains no playable items')
    return items


class State:
    def __init__(self):
        self.items = parse_manifest(MANIFEST)
        self.lock = threading.Lock()

    def request_json(self, path):
        token = jellyfin_token()
        if not token:
            raise RuntimeError(
                'Nougat Jellyfin session is unavailable; expected its private client state at '
                + NOUGAT_CLIENT_STATE
            )
        req = urllib.request.Request(
            JELLYFIN_URL + path,
            headers={
                'Accept': 'application/json',
                'X-Emby-Token': token,
            },
        )
        with urllib.request.urlopen(req, timeout=20) as response:
            return json.load(response)

    def refresh(self):
        query = urllib.parse.urlencode({
            'Recursive': 'true',
            'Fields': 'Path,MediaSources',
            'IncludeItemTypes': 'Movie,Video',
            'Limit': '10000',
        })
        payload = self.request_json('/Items?' + query)
        by_path = {}
        for item in payload.get('Items', []):
            path = item.get('Path')
            if path:
                by_path[os.path.normcase(os.path.normpath(path))] = item

        resolved = 0
        with self.lock:
            for entry in self.items.values():
                match = by_path.get(os.path.normcase(os.path.normpath(entry['path'])))
                entry['jellyfin'] = match
                if match:
                    resolved += 1
        return resolved

    def get(self, media_id):
        with self.lock:
            item = self.items.get(media_id)
            return dict(item) if item else None

    def all_public(self):
        with self.lock:
            return [
                {
                    'id': value['id'],
                    'type': value['content_type'],
                    'subtitles': bool(value['subtitle_path']),
                    'ready': bool(value['jellyfin']),
                }
                for value in self.items.values()
            ]


STATE = State()


def vtt_from_srt(text):
    text = text.lstrip('\ufeff')
    lines = []
    for line in text.splitlines():
        if ' --> ' in line:
            line = line.replace(',', '.')
        lines.append(line)
    return 'WEBVTT\n\n' + '\n'.join(lines) + '\n'


class Handler(BaseHTTPRequestHandler):
    server_version = 'Hanafi-Nougat-Jellyfin'

    def log_message(self, fmt, *args):
        sys.stderr.write('%s - - [%s] %s\n' % (
            self.address_string(), self.log_date_time_string(), fmt % args
        ))

    def cors(self):
        self.send_header('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
        self.send_header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Range, Content-Type')
        self.send_header(
            'Access-Control-Expose-Headers',
            'Accept-Ranges, Content-Range, Content-Length'
        )
        self.send_header('Vary', 'Origin')

    def json_response(self, status, payload, head=False):
        body = json.dumps(payload, separators=(',', ':')).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.cors()
        self.end_headers()
        if not head:
            self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.cors()
        self.end_headers()

    def do_HEAD(self):
        self.handle_request(head=True)

    def do_GET(self):
        self.handle_request(head=False)

    def handle_request(self, head=False):
        parsed = urllib.parse.urlsplit(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        media_id = params.get('id', [''])[0]

        if parsed.path == '/nougat/v1/health':
            try:
                resolved = STATE.refresh()
                self.json_response(200, {
                    'ok': True,
                    'product': 'Hanafi Learning Deck',
                    'service': 'Nougat integrated Jellyfin bridge',
                    'backend': '127.0.0.1:8098',
                    'resolved': resolved,
                    'total': len(STATE.items),
                }, head)
            except Exception as exc:
                self.json_response(503, {'ok': False, 'error': str(exc)}, head)
            return

        if parsed.path == '/nougat/v1/catalog':
            try:
                STATE.refresh()
            except Exception:
                pass
            self.json_response(200, {
                'ok': True,
                'service': 'Nougat integrated Jellyfin bridge',
                'items': STATE.all_public(),
            }, head)
            return

        if parsed.path in ('/nougat/v1/media', '/nougat/v1/transcode'):
            self.stream_media(media_id, head)
            return

        if parsed.path == '/nougat/v1/subtitle':
            self.stream_subtitle(media_id, head)
            return

        if parsed.path == '/robots.txt':
            body = b'User-agent: *\nDisallow: /\n'
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            if not head:
                self.wfile.write(body)
            return

        self.json_response(404, {'ok': False, 'error': 'Unknown route.'}, head)

    def ensure_item(self, media_id):
        item = STATE.get(media_id)
        if not item:
            return None, 'Unknown media id.'
        if not item.get('jellyfin'):
            try:
                STATE.refresh()
            except Exception as exc:
                return None, f'Jellyfin lookup failed: {exc}'
            item = STATE.get(media_id)
        if not item or not item.get('jellyfin'):
            return None, 'This mapped file is not currently indexed by Jellyfin.'
        return item, ''

    def stream_media(self, media_id, head):
        item, error = self.ensure_item(media_id)
        if error:
            status = 404 if (
                'not currently indexed' in error or error == 'Unknown media id.'
            ) else 502
            self.json_response(status, {'ok': False, 'error': error}, head)
            return

        token = jellyfin_token()
        if not token:
            self.json_response(503, {'ok': False, 'error': 'Nougat Jellyfin session is unavailable.'}, head)
            return

        jellyfin_item = item['jellyfin']
        item_id = jellyfin_item.get('Id')
        if not item_id:
            self.json_response(502, {'ok': False, 'error': 'Jellyfin item has no ID.'}, head)
            return

        media_source_id = ''
        sources = jellyfin_item.get('MediaSources') or []
        if sources:
            media_source_id = sources[0].get('Id') or ''

        # This is the same browser-compatibility role Nougat already performs:
        # let Jellyfin stream-copy when possible and transcode to H.264/AAC MP4
        # when the source format is not directly browser-friendly.
        query = {
            'static': 'false',
            'VideoCodec': 'h264',
            'AudioCodec': 'aac',
            'AudioChannels': '2',
            'MaxWidth': '1920',
            'MaxHeight': '1080',
            'EnableAutoStreamCopy': 'true',
            'AllowVideoStreamCopy': 'true',
            'AllowAudioStreamCopy': 'true',
            'api_key': token,
        }
        if media_source_id:
            query['MediaSourceId'] = media_source_id

        target = (
            f"{JELLYFIN_URL}/Videos/{urllib.parse.quote(item_id)}/stream.mp4?"
            f"{urllib.parse.urlencode(query)}"
        )
        headers = {'X-Emby-Token': token}
        if self.headers.get('Range'):
            headers['Range'] = self.headers['Range']
        if self.headers.get('If-Range'):
            headers['If-Range'] = self.headers['If-Range']

        request = urllib.request.Request(
            target,
            method='HEAD' if head else 'GET',
            headers=headers,
        )
        try:
            upstream = urllib.request.urlopen(request, timeout=60)
        except urllib.error.HTTPError as exc:
            upstream = exc
        except Exception as exc:
            self.json_response(502, {
                'ok': False,
                'error': f'Jellyfin stream failed: {exc}',
            }, head)
            return

        try:
            self.send_response(upstream.status)
            for name in (
                'Content-Type', 'Content-Length', 'Content-Range',
                'Accept-Ranges', 'ETag', 'Last-Modified'
            ):
                value = upstream.headers.get(name)
                if value:
                    self.send_header(name, value)
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.send_header('Connection', 'close')
            self.cors()
            self.end_headers()
            if not head:
                while True:
                    chunk = upstream.read(256 * 1024)
                    if not chunk:
                        break
                    self.wfile.write(chunk)
        finally:
            upstream.close()

    def stream_subtitle(self, media_id, head):
        item = STATE.get(media_id)
        if not item:
            self.json_response(404, {'ok': False, 'error': 'Unknown media id.'}, head)
            return
        subtitle = item.get('subtitle_path') or ''
        if not subtitle or not os.path.isfile(subtitle):
            self.json_response(404, {
                'ok': False,
                'error': 'No local subtitle track is configured for this item.',
            }, head)
            return
        data = Path(subtitle).read_text(encoding='utf-8', errors='replace')
        if subtitle.lower().endswith('.srt'):
            data = vtt_from_srt(data)
        body = data.encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'text/vtt; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'public, max-age=3600')
        self.cors()
        self.end_headers()
        if not head:
            self.wfile.write(body)


def main():
    try:
        resolved = STATE.refresh()
        print(
            f'Nougat Jellyfin bridge resolved {resolved}/{len(STATE.items)} manifest items.',
            flush=True,
        )
    except Exception as exc:
        print(
            f'Bridge started but initial Nougat/Jellyfin catalog refresh failed: {exc}',
            file=sys.stderr,
            flush=True,
        )
    server = ThreadingHTTPServer((BIND, PORT), Handler)
    print(f'Hanafi media bridge listening on http://{BIND}:{PORT}', flush=True)
    server.serve_forever()


if __name__ == '__main__':
    main()
