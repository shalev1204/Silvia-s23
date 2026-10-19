#!/usr/bin/env python3
"""Bakes the two textures that drive the 3D "unlit" Grand Desert Map in the Hub.

Input : web/assets/maps/grand_desert_map_overview.webp  (the Journal map, parchment + ink)
Output: web/assets/maps/desert_relief_ink.webp     ink-only line art (no paper, no punch holes)
        web/assets/maps/desert_relief_height.png   smooth pseudo-elevation (ink density, blurred)

The Hub never shows the parchment: it renders the ink as dark-blue relief on black and
lights it up only where Hermes has walked (see web/assets/js/desert-map-3d.js).
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "web/assets/maps/grand_desert_map_overview.webp"
OUT_INK = ROOT / "web/assets/maps/desert_relief_ink.webp"
OUT_HEIGHT = ROOT / "web/assets/maps/desert_relief_height.png"

# Binder punch holes of the Journal spread (native 1748x2480 pixels).
HOLE_X = (840, 906)
HOLE_Y = (182, 295, 411, 838, 951, 1063, 1411, 1524, 1639, 2063, 2178, 2291)
HOLE_R = 27


def norm(a: np.ndarray, lo_p: float = 1.0, hi_p: float = 99.5) -> np.ndarray:
    lo, hi = np.percentile(a, [lo_p, hi_p])
    return np.clip((a - lo) / max(hi - lo, 1e-6), 0.0, 1.0)


def main() -> None:
    lum = Image.open(SRC).convert("L")
    w, h = lum.size

    # Local paper level -> ink density in 0..1
    paper = lum.filter(ImageFilter.MaxFilter(21)).filter(ImageFilter.GaussianBlur(28))
    a = np.asarray(lum, dtype=np.float32)
    p = np.asarray(paper, dtype=np.float32)
    ink = np.clip((p - a) / (p * 0.62 + 1e-3), 0.0, 1.0)
    ink = np.clip((ink - 0.06) * 1.35, 0.0, 1.0) ** 0.85

    holes = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(holes)
    for x in HOLE_X:
        for y in HOLE_Y:
            d.ellipse((x - HOLE_R, y - HOLE_R, x + HOLE_R, y + HOLE_R), fill=255)
    holes = holes.filter(ImageFilter.GaussianBlur(2))
    keep = 1.0 - np.asarray(holes, dtype=np.float32) / 255.0
    ink *= keep

    ink_img = Image.fromarray((ink * 255).astype(np.uint8), "L")
    ink_img.save(OUT_INK, "WEBP", quality=90, method=6)

    # Pseudo-elevation: dense hatching = rock and cliffs, empty paper = sand and playa.
    def blur(r: float) -> np.ndarray:
        return np.asarray(ink_img.filter(ImageFilter.GaussianBlur(r)), dtype=np.float32) / 255.0

    height = 0.50 * norm(blur(9)) + 0.38 * norm(blur(38)) + 0.12 * norm(blur(110))
    height = norm(height, 1.0, 99.0) ** 1.12
    height_img = Image.fromarray((height * 255).astype(np.uint8), "L")
    height_img = height_img.resize((w // 2, h // 2), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
    height_img.save(OUT_HEIGHT, "PNG", optimize=True)

    print("ink    ", OUT_INK.name, OUT_INK.stat().st_size // 1024, "KB", ink_img.size)
    print("height ", OUT_HEIGHT.name, OUT_HEIGHT.stat().st_size // 1024, "KB", height_img.size)


if __name__ == "__main__":
    main()
