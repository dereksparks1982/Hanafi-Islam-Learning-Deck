# Image Upload and Binary Image Fixes on GitHub

This note documents the fast method that worked for `card-back/CardBack.png` when a binary image needed to be changed in GitHub but the normal text-file GitHub tools were not suitable for editing the PNG directly.

## Fast method: one-time GitHub Actions workflow

Use a temporary GitHub Actions workflow that:

1. checks out the repository
2. installs the image tool needed, usually Pillow for PNG/JPG work
3. makes only the intended pixel-level change
4. commits the binary image back to the repository
5. pushes the result to `main`
6. is deleted immediately after the successful run

This is especially useful when the image already exists in the repository and only a precise binary edit is needed.

## Exact card-back fix that worked

The card-back problem was **not** the rounded green/gold border. The problem was that the PNG canvas itself had transparent rounded outer corners, making the whole card appear rounded.

The correct fix was to leave every existing opaque artwork pixel alone and replace only the transparent area outside the card with solid white.

The Pillow code used was:

```python
from PIL import Image

p = 'card-back/CardBack.png'
im = Image.open(p).convert('RGBA')

# Solid white rectangular canvas.
bg = Image.new('RGBA', im.size, (255, 255, 255, 255))

# Composite the existing artwork over the white canvas.
# Existing opaque artwork stays unchanged.
bg.alpha_composite(im)

# Save as a normal rectangular RGB PNG.
bg.convert('RGB').save(p, 'PNG', optimize=True)
```

### Why this worked

- The **outer image/canvas corners became square 90-degree corners**.
- The **rounded decorative green and gold border stayed rounded**.
- The center artwork, spacing, proportions, colors, and already-opaque pixels were not redesigned.
- Only transparency was removed by filling it with white.

The successful image commit was:

`8d1f12f8d794831c8ba7862c5e7a840aa8981f60` — `Square card back outer corners only`

## Reusable workflow template

Create a temporary file such as:

`.github/workflows/one-time-image-fix.yml`

```yaml
name: One-time image fix

on:
  push:
    branches: [ main ]
    paths:
      - '.github/workflows/one-time-image-fix.yml'

permissions:
  contents: write

jobs:
  fix:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.x'

      - name: Install Pillow
        run: python -m pip install pillow

      - name: Make the image change
        run: |
          python - <<'PY'
          from PIL import Image

          p = 'path/to/image.png'
          im = Image.open(p).convert('RGBA')

          # Put only the required image operation here.

          im.save(p)
          PY

      - name: Commit image
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add path/to/image.png
          if git diff --cached --quiet; then
            echo "No image change needed"
          else
            git commit -m "Update image"
            git push
          fi
```

After the workflow succeeds:

- verify the target image path, SHA, and size on GitHub
- confirm the visible result
- delete the temporary workflow so the repository stays clean

## Important rule for precision fixes

When the user says **only one visual thing should change**, do not redraw, regenerate, restyle, resize, recolor, or reinterpret the image. Use a pixel-preserving operation that touches only the requested property.

For the card-back example, the rule was:

> Square the **image canvas corners only**. Keep the **rounded decorative border** exactly as it is.

## When to use another method

If a completely new local binary image already exists and can be uploaded directly as a Git blob, that is preferable to rebuilding it. The one-time workflow method is most useful when the image is already in the repository and needs a controlled transformation or when ordinary text-oriented file tools cannot perform the binary edit cleanly.
