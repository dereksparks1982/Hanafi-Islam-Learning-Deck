# Kingdom of Heaven Private Media Playback Repair

**Date:** 2026-09-26  
**Status:** Working locally on `saxondesktop`; do not claim every remote browser/device path is verified from this record alone.  
**Scope:** `kingdom-of-heaven-2005` only.

## Problem

The Private Media bridge was routing private movies through the live FFmpeg path. That was wrong for the converted Kingdom of Heaven file because the file is already a browser-compatible H.264/AAC MP4. Feeding the finished MP4 back through the live fragmented/chunked FFmpeg stream caused browser playback failure, including media code 4 during testing.

## Final media file

The owner deleted the old MKV. The current and only configured Kingdom of Heaven source is:

```text
/home/dereksparks1982/Videos/Private Hosted/Kingdom of Heaven 2005 DC Roadshow Version 1080p H264 AAC.mp4
```

Manifest identity remains:

```text
kingdom-of-heaven-2005
```

MIME type:

```text
video/mp4
```

## Source repair

`media-server/jellyfin_bridge.py` now treats Kingdom of Heaven as a direct local-file playback case:

```python
if media_id == 'kingdom-of-heaven-2005':
    self.stream_local_file(item, head)
else:
    self.stream_ffmpeg(item, head)
```

This is intentionally narrow. The other Private Media titles keep their existing behavior until the owner separately authorizes changes to them.

`media-server/private-media.tsv.example` points `kingdom-of-heaven-2005` to the finished H.264/AAC MP4 above.

## Protected-runtime deployment method that worked

The authoritative GitHub source does not automatically replace the protected running bridge under `/usr/local/bin` on `saxondesktop`. The successful repair used one controlled deployment operation that:

1. Created a temporary working directory.
2. Verified that the converted MP4 was readable.
3. Downloaded the authoritative `jellyfin_bridge.py` and `private-media.tsv.example` from exact Git commit `6107eeaae125a94cb68d09452052fc0d37af0afd`.
4. Ran `python3 -m py_compile` on the downloaded bridge before installation.
5. Verified that the bridge contained the Kingdom of Heaven direct-file guard.
6. Verified that the private manifest contained the H.264/AAC MP4 path.
7. Installed the bridge as `/usr/local/bin/hanafi-jellyfin-bridge` with mode `0755`.
8. Installed the private manifest as `/etc/hanafi-media/private-media.tsv` with mode `0644`.
9. Restarted the existing `hanafi-jellyfin-bridge.service`.
10. Waited for `http://127.0.0.1:8097/nougat/v1/private/catalog` to become available.
11. Requested bytes `0-1023` of Kingdom of Heaven through the normal HTTPS Private Media endpoint with the Hanafi GitHub Pages origin header.
12. Required every verification below to pass before printing the success message.

## Verification gates that passed

The successful range request required:

```text
HTTP 206 Partial Content
Content-Type: video/mp4
Accept-Ranges: bytes
X-Hanafi-Stream-Mode: nougat-byte-range
1024 response bytes for Range: bytes=0-1023
```

The terminal operation finished with:

```text
KINGDOM OF HEAVEN PLAYBACK PATH: WORKING
```

Two early `curl` connection failures to `127.0.0.1:8097` occurred while the bridge service was restarting. They were startup retry noise, not the final result. The later catalog and byte-range checks passed.

## Why this works

The browser now receives the already-converted MP4 as a normal seekable file using HTTP byte ranges. Kingdom of Heaven is no longer re-transcoded through the live FFmpeg private-media path.

Working chain:

```text
Private Media movie page
        |
        v
/nougat/v1/private/media?id=kingdom-of-heaven-2005
        |
        v
hanafi-jellyfin-bridge
        |
        v
stream_local_file(...)
        |
        v
H.264/AAC MP4 with HTTP byte ranges
```

## Current acceptance boundary

- Owner confirmed Kingdom of Heaven is working locally after deployment.
- The bridge/range path passed the explicit 206/MP4/Accept-Ranges/Nougat-byte-range checks.
- The old MKV is gone and is not a fallback.
- No claim is made here that every external browser/device has been re-tested.
- No change to the Private Library lock, PIN/entrance flow, approved background, Books behavior, or unrelated media titles is part of this repair.
