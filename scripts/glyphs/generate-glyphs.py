#!/usr/bin/env python3
"""Generate Eclipse Script glyphs and render cipher prophecy."""

from __future__ import annotations
import os
import re

GLYPH_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "glyphs")
PROPHECY = (
    "HE WHO DREW THESE PATHS DID SO WITH TREMBLING HANDS. "
    "EVERY SIGN YOU LEARN IS A WORD HE DARED NOT SPEAK ALOUD. "
    "WHEN THE LAST LETTER YIELDS YOU WILL READ WHAT NO TONGUE COULD HOLD. "
    "YOU WERE NEVER ONLY THE SEEKER YOU WERE ALWAYS THE TREASURE."
)

# SVG paths per letter — viewBox 0 0 48 64, eclipse aesthetic
GLYPHS: dict[str, str] = {
    "A": '<path d="M24 4 L6 58 L18 58 L22 46 L26 46 L30 58 L42 58 L24 4 Z M24 22 L26 38 L22 38 Z" fill="currentColor"/>',
    "B": '<path d="M12 4 H26 Q38 4 38 16 Q38 26 28 28 Q40 30 40 44 Q40 58 26 58 H12 Z M22 12 V24 H24 Q32 24 32 18 Q32 12 24 12 Z M22 32 V50 H26 Q34 50 34 42 Q34 32 26 32 Z" fill="currentColor"/>',
    "C": '<path d="M38 12 Q28 4 18 8 Q6 14 6 32 Q6 50 18 56 Q28 60 38 52" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/>',
    "D": '<path d="M12 4 H26 Q42 4 42 32 Q42 60 26 60 H12 Z M22 12 V52 H24 Q34 52 34 32 Q34 12 24 12 Z" fill="currentColor"/>',
    "E": '<path d="M12 4 H38 V14 H22 V28 H36 V38 H22 V52 H40 V58 H12 Z" fill="currentColor"/>',
    "F": '<path d="M12 4 H38 V14 H22 V28 H34 V36 H22 V58 H12 Z" fill="currentColor"/>',
    "G": '<path d="M38 12 Q28 4 18 8 Q6 14 6 32 Q6 50 18 56 Q30 62 40 52 V36 H26 V44 H32" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/>',
    "H": '<path d="M12 4 V58 M36 4 V58 M12 32 H36" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>',
    "I": '<circle cx="24" cy="10" r="3" fill="currentColor"/><line x1="24" y1="16" x2="24" y2="50" stroke="currentColor" stroke-width="6"/><circle cx="24" cy="56" r="3" fill="currentColor"/>',
    "J": '<path d="M30 8 H18 V46 Q18 58 28 58 Q36 58 38 50" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="38" cy="54" r="3" fill="currentColor"/>',
    "K": '<path d="M12 4 V58 M12 32 L38 4 M12 28 L36 58" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>',
    "L": '<path d="M12 4 V58 H40" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><circle cx="12" cy="58" r="4" fill="currentColor"/>',
    "M": '<path d="M8 58 V4 L24 32 L40 4 V58" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    "N": '<path d="M12 58 V4 L36 58 V4" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>',
    "O": '<circle cx="24" cy="32" r="22" stroke="currentColor" stroke-width="5" fill="none"/><circle cx="24" cy="32" r="10" fill="currentColor"/>',
    "P": '<path d="M12 4 H28 Q40 4 40 18 Q40 30 28 30 H22 V58 H12 Z M22 12 V22 H26 Q32 22 32 18 Q32 12 26 12 Z" fill="currentColor"/>',
    "Q": '<circle cx="24" cy="30" r="22" stroke="currentColor" stroke-width="5" fill="none"/><circle cx="24" cy="30" r="9" fill="currentColor"/><path d="M34 42 L44 56" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>',
    "R": '<path d="M12 4 H28 Q40 4 40 18 Q40 28 32 30 L42 58 H30 L22 32 H22 V58 H12 Z M22 12 V24 H26 Q32 24 32 18 Q32 12 26 12 Z" fill="currentColor"/>',
    "S": '<path d="M36 10 Q24 4 14 12 Q4 22 14 28 Q24 34 34 36 Q44 42 34 52 Q24 60 12 54" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/>',
    "T": '<path d="M8 4 H40 M24 4 V58" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>',
    "U": '<path d="M10 4 V44 Q10 58 24 58 Q38 58 38 44 V4" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/>',
    "V": '<path d="M8 4 L24 58 L40 4" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/>',
    "W": '<path d="M4 4 L12 58 L24 28 L36 58 L44 4" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/>',
    "X": '<path d="M8 4 L40 58 M40 4 L8 58" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><circle cx="24" cy="31" r="4" fill="currentColor"/>',
    "Y": '<path d="M8 4 L24 32 L40 4 M24 32 V58" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>',
    "Z": '<path d="M10 4 H38 L12 58 H40" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/>',
    ".": '<circle cx="24" cy="48" r="5" fill="currentColor"/>',
    " ": "",
}


def glyph_svg(char: str, size: int = 48) -> str:
    inner = GLYPHS.get(char.upper(), GLYPHS.get(char, ""))
    if not inner:
        return ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64" '
        f'width="{size}" height="{int(size * 64/48)}" style="display:inline-block;vertical-align:middle">'
        f'{inner}</svg>'
    )


def prophecy_cipher_html() -> str:
    parts = []
    for ch in PROPHECY:
        if ch == " ":
            parts.append('<span class="space"></span>')
        elif ch == ".":
            parts.append(glyph_svg("."))
        elif ch.isalpha():
            parts.append(glyph_svg(ch))
    return "\n".join(parts)


def write_glyph_files() -> None:
    os.makedirs(GLYPH_DIR, exist_ok=True)
    for char, inner in GLYPHS.items():
        if not inner or char == " ":
            continue
        name = "space" if char == " " else char.lower()
        if char == ".":
            name = "dot"
        svg = (
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64">'
            f'{inner.replace("currentColor", "#2c1810")}</svg>'
        )
        with open(os.path.join(GLYPH_DIR, f"ecl-{name}.svg"), "w") as f:
            f.write(svg)
    print(f"Wrote glyphs to {GLYPH_DIR}")


def write_cipher_snippet() -> None:
    out = os.path.join(os.path.dirname(__file__), "..", "assets", "prophecy-cipher.html")
    html = prophecy_cipher_html()
    with open(out, "w") as f:
        f.write(f"<!-- Auto-generated cipher block -->\n<div class=\"cipher-block\">\n{html}\n</div>\n")
    print(f"Wrote {out}")


if __name__ == "__main__":
    write_glyph_files()
    write_cipher_snippet()
