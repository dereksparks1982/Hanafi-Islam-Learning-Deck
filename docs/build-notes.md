# Build Notes

Technical notes for repository maintenance live here so solved problems stay solved.

## Binary image upload: approved final images

When the final PNG/JPG already exists and **must not be redesigned**, the goal is to transfer its existing bytes to GitHub, not recreate the artwork.

### Method A — direct Git blob

When the GitHub tool can accept the complete file bytes as base64, use the Git Data API directly:

1. Verify the local image first: dimensions, file type, byte size, and SHA-256.
2. Base64-encode the **existing bytes** without opening/resaving the image.
3. Create the Git blob using `encoding: base64`.
4. Fetch the current `main` head and tree immediately before the write.
5. Create a new tree based on the current tree, pointing the target repository path at the new blob.
6. Create a commit whose parent is the current `main` head.
7. Fast-forward `main` to the new commit with force disabled.
8. Fetch the repository tree and verify path, blob SHA, size, and commit.

### Method B — exact-file bridge + one-time workflow

Use this when the approved local binary is too large or awkward to pass directly through a text-oriented GitHub connector. This is the method that successfully uploaded **Important Places Card 1 — Lal Masjid** byte-for-byte.

1. Verify the approved local file and record its byte size and SHA-256.
2. Upload the existing file bytes **without conversion** to temporary connector storage.
3. Fetch that raw connector file as a streamed file reference to obtain its short-lived signed download URL.
4. Create a temporary GitHub Actions workflow that:
   - checks out `main`;
   - downloads that signed URL directly to the final repository path;
   - checks the exact expected byte size;
   - checks the exact expected SHA-256;
   - refuses to commit if either check fails;
   - commits only the approved image.
5. Wait for the workflow to complete successfully.
6. Fetch the Git tree and verify the image path, Git blob SHA, and size.
7. For an additional byte-for-byte check, calculate the local Git blob SHA as `SHA1("blob <size>\0" + file_bytes)` and confirm it matches GitHub's blob SHA.
8. Delete the temporary GitHub Actions workflow.
9. Delete the temporary connector-storage copy.

### Lal Masjid Card 1 proof

Approved source file:

- byte size: `2503124`
- SHA-256: `5a0f1919f835b67cce146503159af32073a32c860246f9706e71b9b16b8cc347`
- Git blob SHA calculated from the exact local bytes: `867f1c5d80d9725d75f08a2acc482e92782131c2`

GitHub verification after upload returned the same:

- `Important-Places-Expansion/card_001_lal_masjid.png`
- size `2503124`
- blob `867f1c5d80d9725d75f08a2acc482e92782131c2`

That matching Git blob SHA proves the repository file is the same binary file that was approved, not a re-render, recompressed PNG, alternate photograph, or regenerated card.

### Important Places asset rule

For `Important-Places-Expansion/`, an approved card image is uploaded **as supplied**. No alternate photograph, crop, border, typography, generated replacement, compression/re-save, or other visual substitution is allowed unless the maintainer explicitly requests it.

The workflow is one card at a time:

**candidate preview → maintainer review → explicit approval → exact-image upload → verification → next card**

## Checkpointed repair workflow

The v1.6.3 Sacred Places header repair showed a faster and more reliable way to handle a multi-file visual fix without timing out or accidentally broadening scope.

Instead of attempting discovery, transformation, upload, documentation, and cleanup as one long operation, break the job into independently verifiable checkpoints:

1. **Fetch current `main` first.** Never work from a remembered commit when the repository may have moved.
2. **Identify the exact affected files.** Make a closed list before touching anything. For the v1.6.3 repair this was Sacred Places Cards 1, 2, 4, 6, 10, 14, and 16.
3. **Verify the local source against GitHub.** Confirm the local files correspond to the current repository versions before modifying them.
4. **Perform one narrow transformation locally.** Preserve all unrelated pixels/content and change only the requested property.
5. **Visually inspect the repaired set before publishing.** A contact sheet or side-by-side review is faster and safer than discovering layout mistakes after upload.
6. **Publish the smallest coherent group.** Upload only the repaired cards and the derived sheets/contact sheet that actually depend on them.
7. **Verify the repository after the write.** Confirm the commit, changed paths, current `main`, and any expected binary sizes/blobs.
8. **Remove temporary workflow machinery immediately.** One-time GitHub Actions files are tools, not permanent project files.
9. **Only then move to documentation or the next task.** Report each completed checkpoint before starting another substantial operation.

This method is preferred for future multi-file repairs because it reduces timeout risk, makes failures easy to locate, prevents duplicate work, and gives the maintainer a clear progress trail.

## Fallback: one-time GitHub Actions image operation

Use a temporary GitHub Actions workflow to **modify** an existing repository image only when a controlled transformation is actually requested and normal text-file tools cannot perform it.

The successful card-back repair followed this pattern:

1. check out the repository;
2. install Pillow;
3. perform only the required pixel-level operation;
4. commit the binary image;
5. push the result to `main`;
6. verify the image;
7. delete the temporary workflow immediately afterward.

### Card-back example

The card-back problem was not the rounded green/gold decorative border. The PNG canvas itself had transparent rounded outer corners. The correct repair preserved every existing opaque artwork pixel and replaced only the transparent outside area with solid white.

```python
from PIL import Image

p = 'card-back/CardBack.png'
im = Image.open(p).convert('RGBA')

bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
bg.alpha_composite(im)
bg.convert('RGB').save(p, 'PNG', optimize=True)
```

The successful image commit was:

`8d1f12f8d794831c8ba7862c5e7a840aa8981f60` — `Square card back outer corners only`

The rule demonstrated by that fix is simple: **when only one visual property is supposed to change, touch only that property.**

## Precision-image rule

When the maintainer says an image is approved or says that nothing else should change:

- do not redraw;
- do not regenerate;
- do not restyle;
- do not resize;
- do not recolor;
- do not crop;
- do not swap photographs;
- do not recompress or re-save the file if an exact binary upload is requested;
- do not reinterpret the request.

Verify first, transfer the approved binary, verify again.

## Current self-hosted Media path

The current Media system, established in v2.1 and retained through v2.3, replaced the old Google Drive iframe path with a self-hosted architecture built from selected Nougat Media Plus server work.

Accepted flow:

```text
GitHub Pages Web App
    -> HTTPS public endpoint
    -> Nginx on saxondesktop
    -> Hanafi bridge 127.0.0.1:8097
    -> Nougat integrated Jellyfin 127.0.0.1:8098 when useful
    -> local Hosted media files
```

### Solved deployment facts

- Keep Jellyfin on loopback. Do not expose the Jellyfin UI directly.
- The Hanafi bridge is the narrow public interface and only exposes manifest-listed IDs.
- Nginx is the HTTPS front end because GitHub Pages cannot load insecure HTTP active media from an HTTPS page.
- Direct-compatible local files use HTTP Range delivery so browser seeking works.
- Incompatible media can fall back to FFmpeg/Jellyfin H.264/AAC MP4 delivery.
- CORS is restricted to the Hanafi GitHub Pages origin.
- The service can work even when Jellyfin has not indexed the exact file because the manifest/local-file path is authoritative.
- The router must forward to the machine's **actual reserved LAN address**. During v2.1, playback failed until the router destination was corrected; after that correction the public stream played.

Do not revive old Safari/codec theories when the evidence points to routing. Diagnose the current failure from current evidence first.

## Current DK Media Web player

The browser player is based on the separate DK Media Player project, but it is a Web implementation rather than the desktop Python/libVLC executable.

Accepted rules:

- exactly **one** browser `<video>` element;
- media selector changes the source loaded into that one player;
- do not create one player per movie;
- retain Play/Pause, −10 seconds, +30 seconds, seek, time display, volume, speed, fullscreen, keyboard controls, and resume behavior;
- source information follows the selected media item;
- useful Nougat backend work stays underneath the player but Nougat's tactical desktop player UI is not imported.

The current player code lives in:

`web-viewer/media/dk-media-player.js`

## External subtitle handling

Current manifest format has one optional subtitle path per media item:

```text
id<TAB>absolute media path<TAB>MIME type<TAB>optional subtitle path
```

If the sidecar file is `.srt`, `jellyfin_bridge.py` converts timestamps to WebVTT form and serves it as `text/vtt` through:

```text
/nougat/v1/subtitle?id=<media-id>
```

The DK Media Web player exposes that configured subtitle as an **Off / Subtitles** choice.

This is the preferred model when one clean video can be reused with a downloaded subtitle file. Do not create duplicate video files merely to burn in a subtitle unless there is another reason to preserve that edition.

Multiple named sidecar subtitle tracks per single media item are not part of closed v2.1. Do not document or advertise them as complete until the server manifest/catalog format is actually extended.

## Media download completion rule

When `yt-dlp` is still downloading, do **not** add the target to the runtime manifest until the final file exists.

A `.part` file is not a completed Media entry. Wait for the maintainer to confirm completion, then verify the exact final filename before adding it.

This rule applies to the Arabic/English hard-sub temporary *The Message* copy that was still downloading when v2.1 was closed.

## v2.1 closeout hygiene

One-time workflows are temporary tools, not product files. The v2.1 closeout removed obsolete one-time workflows left from earlier repairs and old Google Drive Media experiments.

Persistent workflows retained are the normal Pages deployment workflow and the reusable media-server build/smoke-test workflow.

Detailed closeout record:

[`V2.1_CLOSEOUT.md`](V2.1_CLOSEOUT.md)
