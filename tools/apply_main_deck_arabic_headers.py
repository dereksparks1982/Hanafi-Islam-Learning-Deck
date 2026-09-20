#!/usr/bin/env python3

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, features
import json
import math
import numpy as np

W, H = 1000, 1400
M = 48
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_AR = "/usr/share/fonts/truetype/noto/NotoNaskhArabic-Regular.ttf"
ARABIC_GREEN = (8, 55, 38)
BLACK = (0, 0, 0)
COLORS = {
    "black": (0, 0, 0),
    "red": (178, 0, 0),
    "green": (0, 105, 55),
    "gold": (150, 105, 0),
    "blue": (0, 80, 165),
    "purple": (105, 45, 145),
    "orange": (190, 85, 0),
    "teal": (0, 105, 115),
    "maroon": (125, 25, 55),
}


def font(path, size):
    return ImageFont.truetype(path, size=size, layout_engine=ImageFont.Layout.RAQM)


def text_width(draw, text, fnt, direction=None):
    box = draw.textbbox((0, 0), text, font=fnt, direction=direction)
    return box[2] - box[0]


def wrap_words(draw, text, fnt, max_width):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        candidate = word if not current else current + " " + word
        if text_width(draw, candidate, fnt) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def original_line_count(draw, number, title):
    full = f"{number}. {title}"
    fnt = font(FONT_B, 48)
    lines = wrap_words(draw, full, fnt, W - 2 * (M + 14))
    return 1 if len(lines) <= 1 else 2


def fit_english(draw, text, max_width, max_lines):
    for size in range(48, 27, -1):
        fnt = font(FONT_B, size)
        lines = wrap_words(draw, text, fnt, max_width)
        if len(lines) <= max_lines:
            return fnt, lines
    fnt = font(FONT_B, 28)
    lines = wrap_words(draw, text, fnt, max_width)
    return fnt, lines[:max_lines]


def fit_arabic(draw, text, max_width, max_height=70):
    for size in range(52, 25, -1):
        fnt = font(FONT_AR, size)
        box = draw.textbbox((0, 0), text, font=fnt, direction="rtl")
        width = box[2] - box[0]
        height = box[3] - box[1]
        if width <= max_width and height <= max_height:
            return fnt
    return font(FONT_AR, 26)


def load_cards():
    cards = []
    for source in sorted(Path("source").glob("cards_*.json")):
        cards.extend(json.loads(source.read_text(encoding="utf-8")))
    if len(cards) != 146:
        raise SystemExit(f"Expected 146 main-deck cards, found {len(cards)}")
    return cards


def update_card(card):
    arabic = card.get("header_arabic")
    if not arabic:
        return False

    number = int(card["n"])
    path = Path("cards") / f"card_{number:03d}.png"
    original = Image.open(path).convert("RGB")
    before = np.array(original)
    image = original.copy()
    draw = ImageDraw.Draw(image)

    line_count = original_line_count(draw, number, card["title"])
    divider_y = 186 if line_count == 1 else 240

    # Replace only the interior header text area. Borders and every pixel below
    # the header remain untouched.
    draw.rectangle((42, 40, W - 42, divider_y - 4), fill="white")

    full_title = f"{number}. {card['title']}"
    left_x = M + 14
    right_x = W - M - 10
    arabic_box_width = 300
    gap = 18
    english_max_width = (right_x - arabic_box_width - gap) - left_x
    english_font, english_lines = fit_english(
        draw, full_title, english_max_width, line_count
    )

    if line_count == 1:
        english_y = 49
        arabic_y = 50
        tag_y = 130
    else:
        english_y = 45
        arabic_y = 48
        tag_y = 181

    for index, line in enumerate(english_lines):
        draw.text((left_x, english_y + index * 55), line, font=english_font, fill=BLACK)

    arabic_font = fit_arabic(draw, arabic, arabic_box_width)
    draw.text(
        (right_x, arabic_y),
        arabic,
        font=arabic_font,
        fill=ARABIC_GREEN,
        anchor="ra",
        direction="rtl",
    )

    tag = card.get("tag", "")
    if tag:
        tag_font = font(FONT_B, 24)
        color = COLORS[card.get("color", "black")]
        draw.text((right_x, tag_y), tag, font=tag_font, fill=color, anchor="ra")

    draw.line((M, divider_y, W - M, divider_y), fill=BLACK, width=3)

    after = np.array(image)
    # The divider itself is redrawn. Starting two rows below it, every pixel
    # must remain byte-identical in RGB values.
    if np.any(before[divider_y + 2 :] != after[divider_y + 2 :]):
        raise SystemExit(f"Body-pixel preservation check failed for card {number:03d}")

    image.save(path, "PNG", optimize=True)
    return True


def rebuild_sheets(card_count):
    sheets_dir = Path("sheets")
    sheets_dir.mkdir(exist_ok=True)
    for old in sheets_dir.glob("sheet_*.png"):
        old.unlink()

    sheet_w, sheet_h = 2060, 2860
    thumb_w, thumb_h = 970, 1358
    gap_x, gap_y = 40, 40
    start_x, start_y = 40, 52

    for sheet_index in range(math.ceil(card_count / 4)):
        sheet = Image.new("RGB", (sheet_w, sheet_h), "white")
        for j in range(4):
            index = sheet_index * 4 + j
            if index >= card_count:
                break
            card = Image.open(Path("cards") / f"card_{index + 1:03d}.png").convert("RGB")
            card = card.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
            col, row = j % 2, j // 2
            sheet.paste(
                card,
                (start_x + col * (thumb_w + gap_x), start_y + row * (thumb_h + gap_y)),
            )
        sheet.save(sheets_dir / f"sheet_{sheet_index + 1:02d}.png", "PNG", optimize=True)


def rebuild_contact_sheet(cards):
    cols, cell_w, cell_h = 8, 180, 252
    rows = math.ceil(len(cards) / cols)
    contact = Image.new("RGB", (cols * cell_w, rows * cell_h), "white")
    for index, card_data in enumerate(cards):
        image = Image.open(Path("cards") / f"card_{int(card_data['n']):03d}.png").convert("RGB")
        image.thumbnail((cell_w - 6, cell_h - 6), Image.Resampling.LANCZOS)
        x = (index % cols) * cell_w + (cell_w - image.width) // 2
        y = (index // cols) * cell_h + (cell_h - image.height) // 2
        contact.paste(image, (x, y))
    contact.save("contact_sheet.png", "PNG", optimize=True)


def main():
    if not features.check("raqm"):
        raise SystemExit("Pillow RAQM support is required for trustworthy Arabic shaping.")
    for required in (FONT_B, FONT_AR):
        if not Path(required).exists():
            raise SystemExit(f"Required font missing: {required}")

    cards = load_cards()
    updated = 0
    for card in cards:
        if update_card(card):
            updated += 1

    if updated != 145:
        raise SystemExit(f"Expected Arabic headers on 145 cards, updated {updated}")

    rebuild_sheets(len(cards))
    rebuild_contact_sheet(cards)
    print(f"PASS: Arabic header added to {updated} of {len(cards)} main-deck cards.")
    print("PASS: body pixels below each header preserved exactly.")
    print("PASS: printable sheets and contact sheet rebuilt from updated cards.")


if __name__ == "__main__":
    main()
