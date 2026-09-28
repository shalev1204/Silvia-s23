#!/usr/bin/env python3
"""
Eclipse Script v3.1 — 100% Abstract Occult & Astrological Glyphs.
Every single glyph is completely divorced from Latin letterforms.
Zero accidental readability for advanced puzzle solvers like Silvia.
"""

from __future__ import annotations
import os

GLYPH_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "glyphs")

# 26 strictly abstract arcane/astronomical glyphs (viewBox: 0 0 48 64)
GLYPHS_V3: dict[str, str] = {
    # A: Astrolabe Quadrant / Apex Triangle with inner stellar pendulum
    "A": '''<polygon points="24,10 8,52 40,52" stroke="currentColor" stroke-width="2.2" fill="none"/>
<line x1="24" y1="10" x2="24" y2="44" stroke="currentColor" stroke-width="2"/>
<circle cx="24" cy="44" r="3.5" fill="currentColor"/>
<circle cx="24" cy="10" r="2.5" fill="currentColor"/>''',

    # B: Dual Crescent Moons facing outward with central axis
    "B": '''<line x1="24" y1="8" x2="24" y2="56" stroke="currentColor" stroke-width="2.5"/>
<path d="M24 16 Q10 24 24 32 Q10 40 24 48" stroke="currentColor" stroke-width="2" fill="none"/>
<path d="M24 16 Q38 24 24 32 Q38 40 24 48" stroke="currentColor" stroke-width="2" fill="none"/>
<circle cx="24" cy="32" r="3" fill="currentColor"/>''',

    # C: Concentric celestial arcs with offset star
    "C": '''<path d="M38 18 A16 16 0 0 0 14 32 A16 16 0 0 0 38 46" stroke="currentColor" stroke-width="2.5" fill="none"/>
<circle cx="26" cy="32" r="4" stroke="currentColor" stroke-width="1.8" fill="none"/>
<circle cx="10" cy="32" r="2.5" fill="currentColor"/>''',

    # D: Vertical Meridian with triple leftward parabolic orbits
    "D": '''<line x1="34" y1="10" x2="34" y2="54" stroke="currentColor" stroke-width="2.5"/>
<path d="M34 16 Q12 24 34 32 Q12 40 34 48" stroke="currentColor" stroke-width="2" fill="none"/>
<circle cx="34" cy="32" r="3" fill="currentColor"/>
<circle cx="18" cy="32" r="2.5" fill="currentColor"/>''',

    # E: Solar Equinox Disk with horizontal tangent bars & center eye
    "E": '''<circle cx="24" cy="32" r="14" stroke="currentColor" stroke-width="2" fill="none"/>
<line x1="6" y1="20" x2="42" y2="20" stroke="currentColor" stroke-width="2"/>
<line x1="6" y1="44" x2="42" y2="44" stroke="currentColor" stroke-width="2"/>
<circle cx="24" cy="32" r="4" fill="currentColor"/>''',

    # F: Alchemical Crucible with apex star and horizontal balance
    "F": '''<path d="M12 20 L36 20 L28 50 L20 50 Z" stroke="currentColor" stroke-width="2" fill="none"/>
<line x1="6" y1="20" x2="42" y2="20" stroke="currentColor" stroke-width="2"/>
<circle cx="24" cy="10" r="3" fill="currentColor"/>
<circle cx="24" cy="35" r="3" fill="currentColor"/>''',

    # G: Celestial Vortex / Triple Spiral Knot
    "G": '''<circle cx="24" cy="32" r="18" stroke="currentColor" stroke-width="2" fill="none"/>
<path d="M24 14 A9 9 0 0 1 24 32 A9 9 0 0 0 24 50" stroke="currentColor" stroke-width="2.5" fill="none"/>
<circle cx="24" cy="14" r="2.5" fill="currentColor"/>
<circle cx="24" cy="50" r="2.5" fill="currentColor"/>''',

    # H: Twin Stellar Pillars with central eclipse bridge
    "H": '''<line x1="12" y1="10" x2="12" y2="54" stroke="currentColor" stroke-width="2.5"/>
<line x1="36" y1="10" x2="36" y2="54" stroke="currentColor" stroke-width="2.5"/>
<circle cx="24" cy="32" r="8" stroke="currentColor" stroke-width="2" fill="none"/>
<circle cx="24" cy="32" r="3" fill="currentColor"/>''',

    # I: Axis Mundi with dual horizontal rings
    "I": '''<line x1="24" y1="8" x2="24" y2="56" stroke="currentColor" stroke-width="2.5"/>
<ellipse cx="24" cy="22" rx="14" ry="5" stroke="currentColor" stroke-width="1.8" fill="none"/>
<ellipse cx="24" cy="42" rx="14" ry="5" stroke="currentColor" stroke-width="1.8" fill="none"/>
<circle cx="24" cy="32" r="3" fill="currentColor"/>''',

    # J: Caduceus arc with zenith diamond
    "J": '''<path d="M34 16 Q14 20 14 36 Q14 52 28 52 Q36 52 36 42" stroke="currentColor" stroke-width="2.2" fill="none"/>
<polygon points="24,8 28,12 24,16 20,12" fill="currentColor"/>
<line x1="10" y1="26" x2="38" y2="26" stroke="currentColor" stroke-width="1.8"/>''',

    # K: Hourglass / Intersecting Celestial Cones
    "K": '''<polygon points="12,14 36,14 24,32" stroke="currentColor" stroke-width="2" fill="none"/>
<polygon points="12,50 36,50 24,32" stroke="currentColor" stroke-width="2" fill="none"/>
<circle cx="24" cy="32" r="3.5" fill="currentColor"/>''',

    # L: Stepped Ziggurat / Right Meridian Gauge
    "L": '''<path d="M14 12 L14 50 L38 50" stroke="currentColor" stroke-width="2.5" fill="none"/>
<line x1="14" y1="26" x2="28" y2="26" stroke="currentColor" stroke-width="1.8"/>
<line x1="14" y1="38" x2="34" y2="38" stroke="currentColor" stroke-width="1.8"/>
<circle cx="38" cy="50" r="3.5" fill="currentColor"/>
<circle cx="14" cy="12" r="3.5" fill="currentColor"/>''',

    # M: Dual Zenith Arches with stellar sparks
    "M": '''<path d="M8 50 Q16 14 24 34 Q32 14 40 50" stroke="currentColor" stroke-width="2.2" fill="none"/>
<circle cx="16" cy="20" r="3" fill="currentColor"/>
<circle cx="32" cy="20" r="3" fill="currentColor"/>
<circle cx="24" cy="46" r="3" fill="currentColor"/>''',

    # N: Celestial Orbit Node with diagonal axis & satellite spheres
    "N": '''<circle cx="24" cy="32" r="16" stroke="currentColor" stroke-width="2" fill="none"/>
<line x1="10" y1="18" x2="38" y2="46" stroke="currentColor" stroke-width="2.2"/>
<circle cx="10" cy="18" r="3.5" fill="currentColor"/>
<circle cx="38" cy="46" r="3.5" fill="currentColor"/>''',

    # O: The Annular Solar Eclipse (Distinct from plain circle: 4 cardinal rays & core node)
    "O": '''<circle cx="24" cy="32" r="15" stroke="currentColor" stroke-width="2.5" fill="none"/>
<circle cx="24" cy="32" r="7" fill="currentColor"/>
<line x1="24" y1="8" x2="24" y2="13" stroke="currentColor" stroke-width="2.5"/>
<line x1="24" y1="51" x2="24" y2="56" stroke="currentColor" stroke-width="2.5"/>
<line x1="0" y1="32" x2="5" y2="32" stroke="currentColor" stroke-width="2.5"/>
<line x1="43" y1="32" x2="48" y2="32" stroke="currentColor" stroke-width="2.5"/>''',

    # P: Celestial Plumb Line with counterweight and solar disk
    "P": '''<circle cx="24" cy="20" r="11" stroke="currentColor" stroke-width="2.2" fill="none"/>
<line x1="24" y1="31" x2="24" y2="56" stroke="currentColor" stroke-width="2.5"/>
<circle cx="24" cy="20" r="4" fill="currentColor"/>
<circle cx="24" cy="56" r="3.5" fill="currentColor"/>''',

    # Q: Comet Orbit with celestial dust tail
    "Q": '''<circle cx="20" cy="26" r="13" stroke="currentColor" stroke-width="2.2" fill="none"/>
<circle cx="20" cy="26" r="5" fill="currentColor"/>
<path d="M30 36 L44 50 M24 40 L36 52 M36 30 L46 40" stroke="currentColor" stroke-width="2"/>''',

    # R: Four-Point Stellar Node with diamond coordinates
    "R": '''<polygon points="24,12 36,32 24,52 12,32" stroke="currentColor" stroke-width="2" fill="none"/>
<line x1="12" y1="32" x2="36" y2="32" stroke="currentColor" stroke-width="2"/>
<line x1="24" y1="12" x2="24" y2="52" stroke="currentColor" stroke-width="2"/>
<circle cx="24" cy="32" r="4" fill="currentColor"/>''',

    # S: Triple Solar Wave / Serpentine Ecliptic with terminal stars
    "S": '''<path d="M36 14 Q10 22 24 32 Q38 42 12 50" stroke="currentColor" stroke-width="2.5" fill="none"/>
<circle cx="36" cy="14" r="3.5" fill="currentColor"/>
<circle cx="12" cy="50" r="3.5" fill="currentColor"/>
<circle cx="24" cy="32" r="2.5" fill="currentColor"/>''',

    # T: Meridian Pillar with three astronomical rings
    "T": '''<line x1="24" y1="8" x2="24" y2="56" stroke="currentColor" stroke-width="2.5"/>
<line x1="10" y1="18" x2="38" y2="18" stroke="currentColor" stroke-width="2.2"/>
<ellipse cx="24" cy="34" rx="10" ry="4" stroke="currentColor" stroke-width="1.8" fill="none"/>
<circle cx="24" cy="56" r="3.5" fill="currentColor"/>''',

    # U: Parabolic Celestial Dish with tri-focus rays
    "U": '''<path d="M8 22 Q24 54 40 22" stroke="currentColor" stroke-width="2.5" fill="none"/>
<line x1="16" y1="14" x2="16" y2="32" stroke="currentColor" stroke-width="1.8"/>
<line x1="24" y1="10" x2="24" y2="40" stroke="currentColor" stroke-width="2"/>
<line x1="32" y1="14" x2="32" y2="32" stroke="currentColor" stroke-width="1.8"/>
<circle cx="24" cy="10" r="2.5" fill="currentColor"/>''',

    # V: Inverted Celestial Wedge with horizontal meridian gauge
    "V": '''<path d="M10 16 L24 50 L38 16" stroke="currentColor" stroke-width="2.5" fill="none"/>
<line x1="14" y1="28" x2="34" y2="28" stroke="currentColor" stroke-width="2"/>
<circle cx="24" cy="50" r="3.5" fill="currentColor"/>
<circle cx="24" cy="20" r="3" fill="currentColor"/>''',

    # W: Triple Peak Stellar Crest
    "W": '''<path d="M6 22 L15 50 L24 28 L33 50 L42 22" stroke="currentColor" stroke-width="2.2" fill="none"/>
<circle cx="6" cy="22" r="2.5" fill="currentColor"/>
<circle cx="24" cy="28" r="3" fill="currentColor"/>
<circle cx="42" cy="22" r="2.5" fill="currentColor"/>''',

    # X: Eight-Point Occult Star Crossing
    "X": '''<line x1="12" y1="16" x2="36" y2="48" stroke="currentColor" stroke-width="2"/>
<line x1="36" y1="16" x2="12" y2="48" stroke="currentColor" stroke-width="2"/>
<circle cx="24" cy="32" r="8" stroke="currentColor" stroke-width="1.8" fill="none"/>
<circle cx="24" cy="32" r="3" fill="currentColor"/>''',

    # Y: Lunar Sickle with Descending Axis & tri-stars (Zero resemblance to Latin Y)
    "Y": '''<path d="M12 16 A16 16 0 0 1 36 28" stroke="currentColor" stroke-width="2.5" fill="none"/>
<line x1="24" y1="28" x2="24" y2="54" stroke="currentColor" stroke-width="2.5"/>
<line x1="14" y1="42" x2="34" y2="42" stroke="currentColor" stroke-width="2"/>
<circle cx="12" cy="16" r="3" fill="currentColor"/>
<circle cx="36" cy="28" r="3" fill="currentColor"/>
<circle cx="24" cy="54" r="3" fill="currentColor"/>''',

    # Z: Lightning Track of the Ecliptic
    "Z": '''<path d="M12 18 L36 18 L12 46 L36 46" stroke="currentColor" stroke-width="2.2" fill="none"/>
<circle cx="24" cy="32" r="4" fill="currentColor"/>
<circle cx="12" cy="18" r="2.5" fill="currentColor"/>
<circle cx="36" cy="46" r="2.5" fill="currentColor"/>''',

    # Period: Gilded Diamond Star
    ".": '''<polygon points="24,30 30,36 24,42 18,36" fill="currentColor"/>''',
    " ": "",
}


def write_glyphs() -> None:
    os.makedirs(GLYPH_DIR, exist_ok=True)
    for char, inner in GLYPHS_V3.items():
        if not inner or char == " ":
            continue
        name = "dot" if char == "." else char.lower()
        svg = (
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64">{inner}</svg>'
        )
        with open(os.path.join(GLYPH_DIR, f"ecl-{name}.svg"), "w") as f:
            f.write(svg)
    print(f"Generated {len(GLYPHS_V3)-1} abstract astrological glyphs (v3.1) in {GLYPH_DIR}")


if __name__ == "__main__":
    write_glyphs()
