#!/usr/bin/env python3
import hashlib
import json
import mimetypes
import re
import os
import subprocess
import sys
import threading
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

# Small public media bridge extracted from Nougat Media Plus server work.
# Jellyfin stays private on loopback:8098. The manifest is authoritative for
# the small Hanafi library, so playback still works when Jellyfin has not yet
# indexed those exact paths. Browser-friendly files use Nougat-style byte-range
# delivery; incompatible containers fall back to local FFmpeg transcoding.
BIND = os.environ.get('HANAFI_MEDIA_BIND', '127.0.0.1')
PORT = int(os.environ.get('HANAFI_MEDIA_PORT', '8097'))
MANIFEST = os.environ.get('HANAFI_MEDIA_MANIFEST', '/etc/hanafi-media/media.tsv')
PRIVATE_ROOT = Path(os.path.expanduser(os.environ.get('HANAFI_PRIVATE_MEDIA_ROOT', '~/Videos/Private Hosted'))).resolve()
PRIVATE_MANIFEST = os.environ.get('HANAFI_PRIVATE_MEDIA_MANIFEST', '/etc/hanafi-media/private-media.tsv')
VIDEO_EXTS = {'.mp4', '.m4v', '.webm', '.ogv', '.ogg', '.mov', '.mkv', '.avi', '.ts', '.m2ts'}
ALLOWED_ORIGIN = os.environ.get('HANAFI_MEDIA_CORS_ORIGIN', 'https://dereksparks1982.github.io')
JELLYFIN_URL = os.environ.get('HANAFI_JELLYFIN_URL', 'http://127.0.0.1:8098').rstrip('/')
TOKEN_OVERRIDE = os.environ.get('HANAFI_JELLYFIN_TOKEN', '').strip()
NOUGAT_CLIENT_STATE = os.path.expanduser(
    os.environ.get('HANAFI_NOUGAT_CLIENT_STATE', '~/.config/reddmedia/server/client.json')
)
FFMPEG = os.environ.get('HANAFI_FFMPEG', '/usr/bin/ffmpeg')


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


def private_slug(text):
    value = re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')
    return value or hashlib.sha256(text.encode('utf-8')).hexdigest()[:16]

def private_title(path):
    name = path.stem.replace('_', ' ').replace('.', ' ')
    return re.sub(r'\\s+', ' ', name).strip() or path.stem

def private_items():
    try:
        return parse_manifest(PRIVATE_MANIFEST)
    except (OSError, RuntimeError):
        return {}


def extension_lower(path):
    return os.path.splitext(path)[1].lower()


def browser_direct_preferred(path):
    return extension_lower(path) in {'.mp4', '.m4v', '.webm', '.ogv', '.ogg'}


def media_content_type(path, configured=''):
    if configured:
        return configured
    extension = extension_lower(path)
    return {
        '.mp4': 'video/mp4',
        '.m4v': 'video/mp4',
        '.webm': 'video/webm',
        '.ogv': 'video/ogg',
        '.ogg': 'video/ogg',
        '.mov': 'video/quicktime',
        '.mkv': 'video/x-matroska',
        '.avi': 'video/x-msvideo',
        '.ts': 'video/mp2t',
        '.m2ts': 'video/mp2t',
    }.get(extension, 'application/octet-stream')


def parse_range(value, size):
    if not value:
        return None
    if not value.startswith('bytes=') or ',' in value or size <= 0:
        return False
    spec = value[6:]
    if '-' not in spec:
        return False
    first_text, last_text = spec.split('-', 1)
    try:
        if not first_text:
            if not last_text:
                return False
            suffix = int(last_text)
            if suffix <= 0:
                return False
            count = min(suffix, size)
            return size - count, size - 1
        first = int(first_text)
        if first < 0 or first >= size:
            return False
        if not last_text:
            return first, size - 1
        last = int(last_text)
        if last < first:
            return False
        return first, min(last, size - 1)
    except ValueError:
        return False


class State:
    def __init__(self):
        self.items = parse_manifest(MANIFEST)
        self.lock = threading.Lock()

    def request_json(self, path):
        token = jellyfin_token()
        if not token:
            raise RuntimeError('Nougat Jellyfin session is unavailable')
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
        try:
            payload = self.request_json('/Items?' + query)
        except Exception:
            payload = {'Items': []}

        by_path = {}
        for item in payload.get('Items', []):
            path = item.get('Path')
            if path:
                by_path[os.path.normcase(os.path.normpath(path))] = item

        indexed = 0
        with self.lock:
            for entry in self.items.values():
                match = by_path.get(os.path.normcase(os.path.normpath(entry['path'])))
                entry['jellyfin'] = match
                if match:
                    indexed += 1
        return indexed

    def get(self, media_id):
        with self.lock:
            item = self.items.get(media_id)
            return dict(item) if item else None

    def all_public(self):
        with self.lock:
            result = []
            for value in self.items.values():
                local_ready = os.path.isfile(value['path'])
                result.append({
                    'id': value['id'],
                    'type': value['content_type'],
                    'subtitles': bool(value['subtitle_path']),
                    'ready': local_ready or bool(value['jellyfin']),
                    'local': local_ready,
                    'jellyfinIndexed': bool(value['jellyfin']),
                })
            return result


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
    server_version = 'Hanafi-Nougat-Media'
    protocol_version = 'HTTP/1.1'

    def log_message(self, fmt, *args):
        sys.stderr.write('%s - - [%s] %s\n' % (
            self.address_string(), self.log_date_time_string(), fmt % args
        ))

    def cors(self):
        self.send_header('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
        self.send_header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Range, Content-Type, Authorization')
        self.send_header(
            'Access-Control-Expose-Headers',
            'Accept-Ranges, Content-Range, Content-Length, X-Hanafi-Stream-Mode'
        )
        self.send_header('Vary', 'Origin')

    def json_response(self, status, payload, head=False):
        body = json.dumps(payload, separators=(',', ':')).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Connection', 'close')
        self.cors()
        self.end_headers()
        if not head:
            self.wfile.write(body)
        self.close_connection = True

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Content-Length', '0')
        self.send_header('Connection', 'close')
        self.cors()
        self.end_headers()
        self.close_connection = True

    def do_HEAD(self):
        self.handle_request(head=True)

    def do_GET(self):
        self.handle_request(head=False)

    def handle_request(self, head=False):
        parsed = urllib.parse.urlsplit(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        media_id = params.get('id', [''])[0]

        if parsed.path == '/nougat/v1/health':
            indexed = STATE.refresh()
            items = STATE.all_public()
            available = sum(1 for item in items if item['ready'])
            self.json_response(200 if available else 503, {
                'ok': available > 0,
                'product': 'Hanafi Learning Deck',
                'service': 'Nougat extracted media server',
                'backend': '127.0.0.1:8098',
                'available': available,
                'jellyfinIndexed': indexed,
                'total': len(items),
            }, head)
            return

        if parsed.path == '/nougat/v1/catalog':
            STATE.refresh()
            self.json_response(200, {
                'ok': True,
                'service': 'Nougat extracted media server',
                'items': STATE.all_public(),
            }, head)
            return

        if parsed.path == '/nougat/v1/private/catalog':
            items = [{'id': x['id'], 'title': x['title'], 'filename': x['filename'], 'type': x['content_type'], 'ready': os.path.isfile(x['path'])} for x in private_items().values()]
            self.json_response(200, {'ok': True, 'items': items}, head)
            return

        if parsed.path == '/nougat/v1/private/media':
            item = private_items().get(media_id)
            if not item:
                self.json_response(404, {'ok': False, 'error': 'Unknown private media id.'}, head)
                return
            if browser_direct_preferred(item['path']):
                self.stream_local_file(item, head)
            else:
                self.stream_ffmpeg(item, head)
            return

        if parsed.path == '/nougat/v1/media':
            self.stream_media(media_id, head, force_transcode=False)
            return

        if parsed.path == '/nougat/v1/transcode':
            self.stream_media(media_id, head, force_transcode=True)
            return

        if parsed.path == '/nougat/v1/subtitle':
            self.stream_subtitle(media_id, head)
            return

        if parsed.path == '/robots.txt':
            body = b'User-agent: *\nDisallow: /\n'
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.send_header('Connection', 'close')
            self.end_headers()
            if not head:
                self.wfile.write(body)
            self.close_connection = True
            return

        self.json_response(404, {'ok': False, 'error': 'Unknown route.'}, head)

    def stream_media(self, media_id, head, force_transcode=False):
        item = STATE.get(media_id)
        if not item:
            self.json_response(404, {'ok': False, 'error': 'Unknown media id.'}, head)
            return

        path = item['path']
        if os.path.isfile(path):
            if force_transcode or not browser_direct_preferred(path):
                self.stream_ffmpeg(item, head)
            else:
                self.stream_local_file(item, head)
            return

        if not item.get('jellyfin'):
            STATE.refresh()
            item = STATE.get(media_id)
        if item and item.get('jellyfin'):
            self.stream_jellyfin(item, head)
            return

        self.json_response(404, {
            'ok': False,
            'error': 'The selected media file is unavailable on saxondesktop.',
        }, head)

    def stream_local_file(self, item, head):
        path = item['path']
        try:
            size = os.path.getsize(path)
        except OSError:
            self.json_response(404, {'ok': False, 'error': 'Media file is unavailable.'}, head)
            return

        parsed = parse_range(self.headers.get('Range', ''), size)
        if parsed is False:
            self.send_response(416)
            self.send_header('Content-Range', f'bytes */{size}')
            self.send_header('Content-Length', '0')
            self.send_header('Connection', 'close')
            self.cors()
            self.end_headers()
            self.close_connection = True
            return

        if parsed is None:
            first, last = 0, max(size - 1, 0)
            status = 200
        else:
            first, last = parsed
            status = 206
        length = 0 if size == 0 else last - first + 1

        self.send_response(status)
        self.send_header('Content-Type', media_content_type(path, item.get('content_type', '')))
        self.send_header('Content-Length', str(length))
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Cache-Control', 'private, max-age=0')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Hanafi-Stream-Mode', 'nougat-byte-range')
        if status == 206:
            self.send_header('Content-Range', f'bytes {first}-{last}/{size}')
        self.send_header('Connection', 'close')
        self.cors()
        self.end_headers()

        if not head and length:
            try:
                with open(path, 'rb') as fh:
                    fh.seek(first)
                    remaining = length
                    while remaining > 0:
                        chunk = fh.read(min(256 * 1024, remaining))
                        if not chunk:
                            break
                        self.wfile.write(chunk)
                        remaining -= len(chunk)
            except (OSError, BrokenPipeError, ConnectionResetError):
                pass
        self.close_connection = True

    def stream_ffmpeg(self, item, head):
        if not os.path.isfile(FFMPEG) or not os.access(FFMPEG, os.X_OK):
            self.json_response(503, {'ok': False, 'error': 'FFmpeg is unavailable.'}, head)
            return

        if head:
            self.send_response(200)
            self.send_header('Content-Type', 'video/mp4')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Hanafi-Stream-Mode', 'nougat-ffmpeg')
            self.send_header('Connection', 'close')
            self.cors()
            self.end_headers()
            self.close_connection = True
            return

        command = [
            FFMPEG,
            '-nostdin', '-hide_banner', '-loglevel', 'error',
            '-i', item['path'],
            '-map', '0:v:0?', '-map', '0:a:0?', '-sn',
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23',
            '-pix_fmt', 'yuv420p',
            '-c:a', 'aac', '-b:a', '160k',
            '-movflags', '+frag_keyframe+empty_moov+default_base_moof',
            '-f', 'mp4', 'pipe:1',
        ]
        try:
            process = subprocess.Popen(
                command,
                stdin=subprocess.DEVNULL,
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
            )
        except OSError as exc:
            self.json_response(500, {'ok': False, 'error': f'Could not start FFmpeg: {exc}'}, head)
            return

        self.send_response(200)
        self.send_header('Content-Type', 'video/mp4')
        self.send_header('Transfer-Encoding', 'chunked')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Hanafi-Stream-Mode', 'nougat-ffmpeg')
        self.send_header('Connection', 'close')
        self.cors()
        self.end_headers()

        try:
            assert process.stdout is not None
            while True:
                chunk = process.stdout.read(64 * 1024)
                if not chunk:
                    break
                self.wfile.write(f'{len(chunk):X}\r\n'.encode('ascii'))
                self.wfile.write(chunk)
                self.wfile.write(b'\r\n')
                self.wfile.flush()
            self.wfile.write(b'0\r\n\r\n')
            self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, OSError):
            try:
                process.terminate()
            except OSError:
                pass
        finally:
            if process.stdout:
                process.stdout.close()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
        self.close_connection = True

    def stream_jellyfin(self, item, head):
        token = jellyfin_token()
        jellyfin_item = item.get('jellyfin') or {}
        item_id = jellyfin_item.get('Id')
        if not token or not item_id:
            self.json_response(503, {'ok': False, 'error': 'Nougat Jellyfin session is unavailable.'}, head)
            return

        media_source_id = ''
        sources = jellyfin_item.get('MediaSources') or []
        if sources:
            media_source_id = sources[0].get('Id') or ''
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
        request = urllib.request.Request(target, method='HEAD' if head else 'GET', headers=headers)
        try:
            upstream = urllib.request.urlopen(request, timeout=60)
        except urllib.error.HTTPError as exc:
            upstream = exc
        except Exception as exc:
            self.json_response(502, {'ok': False, 'error': f'Jellyfin stream failed: {exc}'}, head)
            return

        try:
            self.send_response(upstream.status)
            for name in ('Content-Type', 'Content-Length', 'Content-Range', 'Accept-Ranges', 'ETag', 'Last-Modified'):
                value = upstream.headers.get(name)
                if value:
                    self.send_header(name, value)
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.send_header('X-Hanafi-Stream-Mode', 'jellyfin')
            self.send_header('Connection', 'close')
            self.cors()
            self.end_headers()
            if not head:
                while True:
                    chunk = upstream.read(256 * 1024)
                    if not chunk:
                        break
                    self.wfile.write(chunk)
        except (BrokenPipeError, ConnectionResetError, OSError):
            pass
        finally:
            upstream.close()
        self.close_connection = True

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
        self.send_header('Connection', 'close')
        self.cors()
        self.end_headers()
        if not head:
            self.wfile.write(body)
        self.close_connection = True


def main():
    indexed = STATE.refresh()
    available = sum(1 for item in STATE.all_public() if item['ready'])
    print(
        f'Hanafi/Nougat media bridge ready: {available}/{len(STATE.items)} files available, '
        f'{indexed} currently indexed by Jellyfin.',
        flush=True,
    )
    server = ThreadingHTTPServer((BIND, PORT), Handler)
    print(f'Hanafi media bridge listening on http://{BIND}:{PORT}', flush=True)
    server.serve_forever()


if __name__ == '__main__':
    main()
