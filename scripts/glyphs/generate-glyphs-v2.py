#!/usr/bin/env python3
"""Eclipse Script v2 — abstract glyphs that do NOT resemble Latin letters."""

from __future__ import annotations
import os

GLYPH_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "glyphs")

# Each glyph: unique abstract symbol (eclipse / star / sand motifs) — NOT letter-shaped
GLYPHS: dict[str, str] = {
    "A": '<path d="M24 8 Q8 32 24 56 Q40 32 24 8" stroke="#2c1810" stroke-width="3.5" fill="none"/><circle cx="24" cy="32" r="4" fill="#2c1810"/>',
    "B": '<circle cx="24" cy="32" r="20" stroke="#2c1810" stroke-width="3" fill="none"/><path d="M24 12 L24 52" stroke="#2c1810" stroke-width="3"/><circle cx="32" cy="24" r="3" fill="#2c1810"/>',
    "C": '<path d="M8 32 Q24 8 40 32 Q24 56 8 32" stroke="#2c1810" stroke-width="3" fill="none"/><circle cx="24" cy="32" r="2" fill="#2c1810"/>',
    "D": '<path d="M12 16 Q36 16 36 32 Q36 48 12 48" stroke="#2c1810" stroke-width="3.5" fill="none"/><circle cx="12" cy="32" r="3" fill="#2c1810"/>',
    "E": '<line x1="10" y1="32" x2="38" y2="32" stroke="#2c1810" stroke-width="3"/><line x1="24" y1="14" x2="24" y2="50" stroke="#2c1810" stroke-width="3"/><circle cx="10" cy="32" r="4" fill="#2c1810"/><circle cx="38" cy="32" r="4" fill="#2c1810"/>',
    "F": '<path d="M14 48 L24 10 L34 48" stroke="#2c1810" stroke-width="3" fill="none"/><circle cx="24" cy="10" r="3" fill="#2c1810"/>',
    "G": '<circle cx="24" cy="32" r="18" stroke="#2c1810" stroke-width="3" fill="none"/><path d="M24 14 L24 32 L34 32" stroke="#2c1810" stroke-width="3" fill="none"/>',
    "H": '<circle cx="14" cy="32" r="8" fill="#2c1810"/><circle cx="34" cy="32" r="8" fill="none" stroke="#2c1810" stroke-width="3"/><path d="M14 32 Q24 18 34 32" stroke="#2c1810" stroke-width="2" fill="none"/>',
    "I": '<circle cx="24" cy="12" r="3" fill="#2c1810"/><circle cx="24" cy="32" r="5" stroke="#2c1810" stroke-width="2" fill="none"/><circle cx="24" cy="52" r="3" fill="#2c1810"/>',
    "J": '<path d="M32 14 Q32 44 24 52 Q16 58 10 50" stroke="#2c1810" stroke-width="3" fill="none"/><circle cx="32" cy="14" r="3" fill="#2c1810"/>',
    "K": '<line x1="24" y1="10" x2="24" y2="54" stroke="#2c1810" stroke-width="3"/><line x1="24" y1="32" x2="38" y2="14" stroke="#2c1810" stroke-width="3"/><line x1="24" y1="32" x2="10" y2="50" stroke="#2c1810" stroke-width="3"/>',
    "L": '<path d="M10 14 L10 48 L38 48" stroke="#2c1810" stroke-width="3" fill="none"/><circle cx="38" cy="48" r="4" fill="#2c1810"/>',
    "M": '<path d="M8 48 L8 20 L24 38 L40 20 L40 48" stroke="#2c1810" stroke-width="3" fill="none"/><circle cx="24" cy="38" r="2.5" fill="#2c1810"/>',
    "N": '<circle cx="12" cy="48" r="4" fill="#2c1810"/><circle cx="36" cy="16" r="4" fill="#2c1810"/><path d="M12 48 L36 16" stroke="#2c1810" stroke-width="3"/>',
    "O": '<circle cx="24" cy="32" r="20" stroke="#2c1810" stroke-width="3.5" fill="none"/><circle cx="30" cy="32" r="14" fill="#2c1810"/>',
    "P": '<circle cx="18" cy="28" r="14" stroke="#2c1810" stroke-width="3" fill="none"/><line x1="18" y1="42" x2="18" y2="54" stroke="#2c1810" stroke-width="3"/><circle cx="34" cy="20" r="3" fill="#2c1810"/>',
    "Q": '<circle cx="24" cy="30" r="18" stroke="#2c1810" stroke-width="3" fill="none"/><circle cx="28" cy="30" r="12" fill="#2c1810"/><path d="M36 42 L44 54" stroke="#2c1810" stroke-width="3"/>',
    "R": '<path d="M12 48 L12 16 L28 16 Q38 16 38 28 Q38 38 28 38 L12 48" stroke="#2c1810" stroke-width="3" fill="none"/><circle cx="38" cy="44" r="3" fill="#2c1810"/>',
    "S": '<path d="M34 18 Q14 18 14 32 Q14 46 34 46" stroke="#2c1810" stroke-width="3.5" fill="none"/><circle cx="34" cy="18" r="2.5" fill="#2c1810"/>',
    "T": '<line x1="8" y1="18" x2="40" y2="18" stroke="#2c1810" stroke-width="3"/><line x1="24" y1="18" x2="24" y2="52" stroke="#2c1810" stroke-width="3"/><circle cx="24" cy="52" r="3" fill="#2c1810"/>',
    "U": '<path d="M10 18 L10 40 Q10 52 24 52 Q38 52 38 40 L38 18" stroke="#2c1810" stroke-width="3" fill="none"/>',
    "V": '<path d="M8 18 L24 52 L40 18" stroke="#2c1810" stroke-width="3.5" fill="none"/><circle cx="24" cy="52" r="3" fill="#2c1810"/>',
    "W": '<path d="M6 18 L14 52 L24 32 L34 52 L42 18" stroke="#2c1810" stroke-width="3" fill="none"/>',
    "X": '<path d="M10 14 L38 50 M38 14 L10 50" stroke="#2c1810" stroke-width="3"/><circle cx="24" cy="32" r="5" stroke="#2c1810" stroke-width="2" fill="none"/>',
    "Y": '<path d="M8 18 L24 34 L40 18 M24 34 L24 52" stroke="#2c1810" stroke-width="3" fill="none"/><circle cx="24" cy="34" r="2.5" fill="#2c1810"/>',
    "Z": '<path d="M10 18 H38 L10 50 H38" stroke="#2c1810" stroke-width="3" fill="none"/><circle cx="24" cy="34" r="2" fill="#2c1810"/>',
    ".": '<circle cx="24" cy="40" r="4" fill="#2c1810"/>',
    " ": "",
}

PROPHECY_DEFAULT = (
    "THIS WHOLE ADVENTURE IS MY WAY OF SAYING I LOVE YOU. "
    "YOU WERE NEVER ONLY THE SEEKER YOU WERE ALWAYS THE TREASURE."
)


def write_glyphs() -> None:
    os.makedirs(GLYPH_DIR, exist_ok=True)
    for char, inner in GLYPHS.items():
        if not inner or char == " ":
            continue
        name = "dot" if char == "." else char.lower()
        svg = (
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64">{inner}</svg>'
        )
        with open(os.path.join(GLYPH_DIR, f"ecl-{name}.svg"), "w") as f:
            f.write(svg)
    print(f"Wrote {len(GLYPHS)-1} glyphs to {GLYPH_DIR}")


if __name__ == "__main__":
    write_glyphs()
