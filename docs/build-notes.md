# Build Notes

Technical notes for repository maintenance live here so solved problems stay solved.

## Binary image upload: preferred method for an already-final image

When the final PNG/JPG already exists locally and **must not be redesigned**, prefer a direct Git blob upload instead of rebuilding the image in GitHub Actions.

1. Verify the final local image before upload: dimensions, file type, and SHA-256.
2. Base64-encode the existing bytes without modifying the artwork.
3. Create the Git blob with the GitHub Git Data API using `encoding: base64`.
4. Fetch the current `main` head and tree immediately before the repository write.
5. Create a new tree based on the current tree, pointing the desired repository path at the new image blob.
6. Create a commit whose parent is the current `main` head.
7. Fast-forward `main` to the new commit with force disabled.
8. Fetch the repository file/tree afterward and verify the path, blob SHA, size, and commit.

This is the preferred route for an approved final card because the upload does not redraw or reinterpret the image.

### Important Places asset rule

For `Important-Places-Expansion/`, an approved card image is uploaded **as supplied**. No alternate photograph, crop, border, typography, generated replacement, or other visual substitution is allowed unless the maintainer explicitly requests it.

The workflow is one card at a time:

**candidate preview → maintainer review → explicit approval → exact-image upload → verification → next card**

## Fallback: one-time GitHub Actions image operation

Use a temporary GitHub Actions workflow only when an image already in the repository needs a controlled transformation that normal text-file tools cannot perform.

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
- do not swap photographs;
- do not reinterpret the request.

Verify first, upload the approved binary, verify again.
