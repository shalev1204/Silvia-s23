#!/usr/bin/env python3
"""
build_desert_odyssey_pages.py
=============================
Masterwork Renaissance manuscript renderers for the pages of the
16-Sheet / 32-Face Journal (Two-Act Desert Odyssey):
  1. Sheet 09 · Cara B (Page 09 Back): The High Plateaus & Wind Bearings (Lore)
  2. Sheet 10 · Cara A (Page 10 Front): Game D1 — The Sandstone Labyrinth
  3. Sheet 10 · Cara B (Page 10 Back): The Solstice Horizon (Lore)
  4. Sheet 11 · Cara A (Page 11 Front): Game D2 — The Desert Lexicon & Sun Compass
  5. Sheet 11 · Cara B (Page 11 Back): Game D3 — The Polybius Stele of Cairn III
  6. Sheet 12 · Cara A (Page 12 Front): Game D4 — The Sun Monolith Alignment
  7. Sheet 12 · Cara B (Page 12 Back): Brink of the Great Fault (Lore)
  8. Sheet 13 · Cara A (Page 13 Front): The Deep Wash & Sentry (Lore)
  9. Sheet 14 · Cara B (Page 14 Back): Game D5 — The Whispering Chasm Maze
 10. Sheet 15 · Cara A (Page 15 Front): The Salt Playa & Vaults (Lore)
 11. Sheet 15 · Cara B (Page 15 Back): Game D6 — The Oasis Clepsydra & 4 Wells
 12. Sheet 16 · Cara A (Page 16 Front): Game D7 — Gates of the Oracle (Tower II)

Aesthetic & Technical Standards:
  - Pure 2B Graphite Palette: RGB(46, 42, 38).
  - Authentic Renaissance Da Vinci / Kepler Draftsmanship.
  - Strict 6-ring binder punch hole clearances:
      * Cara A (Front): 0 pixels in X < 165 px (content begins X >= 220 px).
      * Cara B (Back): 0 pixels in X > 1583 px (content ends X <= 1490 px).
  - High-resolution 300 DPI A5 Canvas: 1748 x 2480 px.
  - Zero Text / Drawing Collisions.
"""

import os
import sys
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from scripts.journal.geometry import CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX

GRAPHITE_COLOR = (46, 42, 38)
FONT_PATH = os.path.join(PROJECT_ROOT, "assets", "fonts", "Fondamento.ttf")


# -------------------------------------------------------------------------
# GRAPHITE RENDERING UTILITIES
# -------------------------------------------------------------------------

def blit_rgba(target: np.ndarray, src: np.ndarray, x: int, y: int) -> None:
    """Blits an RGBA source onto target canvas with alpha blending."""
    th, tw = target.shape[:2]
    sh, sw = src.shape[:2]
    x1, y1 = max(0, x), max(0, y)
    x2, y2 = min(tw, x + sw), min(th, y + sh)
    if x2 <= x1 or y2 <= y1:
        return
    sx1, sy1 = x1 - x, y1 - y
    sx2, sy2 = sx1 + (x2 - x1), sy1 + (y2 - y1)
    src_alpha = src[sy1:sy2, sx1:sx2, 3].astype(float) / 255.0
    tgt_alpha = target[y1:y2, x1:x2, 3].astype(float) / 255.0
    out_alpha = src_alpha + tgt_alpha * (1.0 - src_alpha)
    nz = out_alpha > 0.0
    for c in range(3):
        target[y1:y2, x1:x2, c][nz] = np.clip(
            (src[sy1:sy2, sx1:sx2, c][nz] * src_alpha[nz] +
             target[y1:y2, x1:x2, c][nz] * tgt_alpha[nz] * (1.0 - src_alpha[nz])) / out_alpha[nz],
            0, 255
        ).astype(np.uint8)
    target[y1:y2, x1:x2, 3] = (out_alpha * 255.0).astype(np.uint8)


def render_pencil_text(
    text: str,
    font_path: str = FONT_PATH,
    font_size: int = 36,
    gc: tuple = GRAPHITE_COLOR,
    seed: int = 42
) -> tuple[np.ndarray, int]:
    """Renders text with authentic graphite pencil grain and pressure texture."""
    if not text:
        return None, 0
    scale = 3
    font = ImageFont.truetype(font_path, int(font_size * scale))
    dummy = Image.new("RGBA", (10, 10))
    d_dummy = ImageDraw.Draw(dummy)
    bbox = d_dummy.textbbox((0, 0), text, font=font)
    w_tot = bbox[2] + 40 * scale
    h_tot = int(font_size * 2.8 * scale)
    img = Image.new("RGBA", (w_tot, h_tot), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    base_y = int(font_size * 1.9 * scale)
    d.text((10 * scale, base_y), text, font=font, anchor="ls", fill=(255, 255, 255, 255))
    arr = np.array(img)
    alpha = arr[:, :, 3].astype(float)
    np.random.seed(seed)
    grain = np.random.normal(0, 12, alpha.shape)
    alpha_textured = np.where(alpha > 15, np.clip(alpha * 0.92 + grain, 30, 245), alpha).astype(np.uint8)
    w_out, h_out = arr.shape[1] // scale, arr.shape[0] // scale
    res_alpha = cv2.resize(alpha_textured, (w_out, h_out), interpolation=cv2.INTER_AREA)
    res = np.zeros((res_alpha.shape[0], res_alpha.shape[1], 4), dtype=np.uint8)
    for c in range(3):
        res[:, :, c] = gc[c]
    res[:, :, 3] = res_alpha
    return res, base_y // scale


def draw_sketchy_line(
    canvas: np.ndarray,
    p1: tuple,
    p2: tuple,
    gc: tuple = GRAPHITE_COLOR,
    alpha_base: int = 155,
    passes: int = 2,
    seed: int = 42
) -> None:
    """Draws an organic, multi-stroke pencil line with hand-drawn wobble."""
    np.random.seed(seed)
    p1 = np.array(p1, dtype=float)
    p2 = np.array(p2, dtype=float)
    length = np.linalg.norm(p2 - p1)
    if length < 1.0:
        return
    n_steps = max(2, int(length / 14))
    for p in range(passes):
        pts = []
        for i in range(n_steps + 1):
            t = i / float(n_steps)
            base = p1 + t * (p2 - p1)
            offset = np.random.normal(0, 0.45)
            tang = np.array([-(p2 - p1)[1], (p2 - p1)[0]])
            tang = tang / (np.linalg.norm(tang) + 1e-6)
            pt = base + tang * offset
            pts.append((int(round(pt[0])), int(round(pt[1]))))
        alpha = int(np.clip(alpha_base + np.random.randint(-25, 25), 40, 240))
        for i in range(len(pts) - 1):
            cv2.line(canvas, pts[i], pts[i + 1], (*gc, alpha), 1, cv2.LINE_AA)


def draw_hatch_area(
    canvas: np.ndarray,
    rect: tuple,
    angle_deg: float = 45.0,
    spacing: int = 7,
    gc: tuple = GRAPHITE_COLOR,
    alpha: int = 90
) -> None:
    """Fills a rectangle with fine Renaissance pencil hatching."""
    rx, ry, rw, rh = rect
    rad = np.deg2rad(angle_deg)
    cos_a, sin_a = np.cos(rad), np.sin(rad)
    diag = int(np.hypot(rw, rh))
    cx, cy = rx + rw // 2, ry + rh // 2

    # Clip mask
    mask = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX), dtype=np.uint8)
    cv2.rectangle(mask, (rx, ry), (rx + rw, ry + rh), 255, -1)

    layer = np.zeros_like(canvas)
    for off in range(-diag, diag, spacing):
        x0 = int(cx + off * -sin_a - diag * cos_a)
        y0 = int(cy + off * cos_a - diag * sin_a)
        x1 = int(cx + off * -sin_a + diag * cos_a)
        y1 = int(cy + off * cos_a + diag * sin_a)
        cv2.line(layer, (x0, y0), (x1, y1), (*gc, alpha), 1, cv2.LINE_AA)

    layer_masked = cv2.bitwise_and(layer, layer, mask=mask)
    blit_rgba(canvas, layer_masked, 0, 0)


def wrap_text(text: str, font_path: str, font_size: int, max_width: int) -> list[str]:
    """Splits text into lines that comfortably fit within max_width."""
    font = ImageFont.truetype(font_path, font_size)
    dummy = Image.new("RGBA", (10, 10))
    draw = ImageDraw.Draw(dummy)
    words = text.split()
    lines = []
    current_line = []
    for word in words:
        test_line = " ".join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=font)
        w = bbox[2] - bbox[0]
        if w <= max_width or not current_line:
            current_line.append(word)
        else:
            lines.append(" ".join(current_line))
            current_line = [word]
    if current_line:
        lines.append(" ".join(current_line))
    return lines


def draw_pencil_compass_rose(
    canvas: np.ndarray,
    cx: int,
    cy: int,
    r: int,
    gc: tuple = GRAPHITE_COLOR,
    seed: int = 501
) -> None:
    """Renders a 16-point Renaissance wind rose / compass rose with graphite shading."""
    np.random.seed(seed)
    cv2.circle(canvas, (cx, cy), r, (*gc, 185), 2, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), r - 10, (*gc, 120), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), r - 22, (*gc, 140), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), int(r * 0.42), (*gc, 170), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), 8, (*gc, 210), -1)

    # 16-point star points
    for idx in range(16):
        deg = idx * 22.5
        rad = np.deg2rad(deg)
        r_tip = r - 10 if idx % 4 == 0 else (int(r * 0.78) if idx % 2 == 0 else int(r * 0.62))
        px = int(round(cx + r_tip * np.cos(rad)))
        py = int(round(cy + r_tip * np.sin(rad)))

        # Next and prev shoulder points
        rad_prev = np.deg2rad(deg - 11.25)
        rad_next = np.deg2rad(deg + 11.25)
        r_base = int(r * 0.38)
        bx1 = int(round(cx + r_base * np.cos(rad_prev)))
        by1 = int(round(cy + r_base * np.sin(rad_prev)))
        bx2 = int(round(cx + r_base * np.cos(rad_next)))
        by2 = int(round(cy + r_base * np.sin(rad_next)))

        pts_half1 = np.array([[cx, cy], [px, py], [bx1, by1]], dtype=np.int32)
        cv2.fillPoly(canvas, [pts_half1], (*gc, 130 if idx % 2 == 0 else 70), cv2.LINE_AA)
        cv2.polylines(canvas, [pts_half1], True, (*gc, 190), 1, cv2.LINE_AA)

        pts_half2 = np.array([[cx, cy], [px, py], [bx2, by2]], dtype=np.int32)
        cv2.polylines(canvas, [pts_half2], True, (*gc, 160), 1, cv2.LINE_AA)

    # Cardinal labels (N, E, S, W)
    cardinals = [(0, "E"), (90, "S"), (180, "W"), (270, "N")]
    for deg, letter in cardinals:
        rad = np.deg2rad(deg)
        tx = int(round(cx + (r + 18) * np.cos(rad))) - 10
        ty = int(round(cy + (r + 18) * np.sin(rad))) + 10
        t_img, _ = render_pencil_text(letter, FONT_PATH, font_size=24, gc=gc, seed=seed + deg)
        if t_img is not None:
            blit_rgba(canvas, t_img, tx, ty - 20)


def draw_sketchy_rect(
    canvas: np.ndarray,
    rect: tuple,
    gc: tuple = GRAPHITE_COLOR,
    alpha_base: int = 160,
    passes: int = 2,
    seed: int = 42
) -> None:
    """Draws an organic, multi-stroke rectangle with hand-drawn wobble."""
    x1, y1, x2, y2 = rect
    draw_sketchy_line(canvas, (x1, y1), (x2, y1), gc=gc, alpha_base=alpha_base, passes=passes, seed=seed)
    draw_sketchy_line(canvas, (x2, y1), (x2, y2), gc=gc, alpha_base=alpha_base, passes=passes, seed=seed + 1)
    draw_sketchy_line(canvas, (x2, y2), (x1, y2), gc=gc, alpha_base=alpha_base, passes=passes, seed=seed + 2)
    draw_sketchy_line(canvas, (x1, y2), (x1, y1), gc=gc, alpha_base=alpha_base, passes=passes, seed=seed + 3)


def draw_da_vinci_wagon_wheel(
    canvas: np.ndarray,
    cx: int,
    cy: int,
    r: int = 68,
    gc: tuple = GRAPHITE_COLOR,
    seed: int = 1050
) -> None:
    """Draws a Da Vinci mechanical study of an iron-tired spoked wagon wheel."""
    np.random.seed(seed)
    # Iron tire rim
    cv2.circle(canvas, (cx, cy), r, (*gc, 205), 3, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), r - 5, (*gc, 130), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), r - 14, (*gc, 175), 2, cv2.LINE_AA)
    # Iron tire studs/rivets
    for deg in range(0, 360, 30):
        rad = np.deg2rad(deg)
        rx = int(round(cx + (r - 10) * np.cos(rad)))
        ry = int(round(cy + (r - 10) * np.sin(rad)))
        cv2.circle(canvas, (rx, ry), 2, (*gc, 210), -1)
    # Heavy wooden hub
    cv2.circle(canvas, (cx, cy), int(r * 0.34), (*gc, 195), 2, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), int(r * 0.18), (*gc, 220), -1)
    # 12 Tapered wooden spokes
    for deg in range(0, 360, 30):
        rad = np.deg2rad(deg)
        x_in = int(round(cx + int(r * 0.34) * np.cos(rad)))
        y_in = int(round(cy + int(r * 0.34) * np.sin(rad)))
        x_out = int(round(cx + (r - 14) * np.cos(rad)))
        y_out = int(round(cy + (r - 14) * np.sin(rad)))
        draw_sketchy_line(canvas, (x_in, y_in), (x_out, y_out), gc=gc, alpha_base=165, passes=1, seed=seed + deg)
    # Split hickory axle sketch
    draw_sketchy_line(canvas, (cx - 12, cy - int(r * 0.55)), (cx + 12, cy - int(r * 0.55)), gc=gc, alpha_base=170, passes=1, seed=seed + 99)
    draw_sketchy_line(canvas, (cx - 12, cy + int(r * 0.55)), (cx + 12, cy + int(r * 0.55)), gc=gc, alpha_base=170, passes=1, seed=seed + 100)


# -------------------------------------------------------------------------
# 1. SHEET 09 · CARA B: THE HIGH PLATEAUS & WIND BEARINGS
# -------------------------------------------------------------------------


def render_sheet09_back_lore(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 9 · Cara B (Lore: High Plateaus & Wind Bearings) — Cara B: X <= 1490."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    x_left, x_right = 160, 1480
    max_w = x_right - x_left
    body_fs, line_sp = 35, 52

    # 1. Header
    t_title, b_t = render_pencil_text("The High Plateaus", FONT_PATH, font_size=64, gc=gc, seed=901)
    blit_rgba(canvas, t_title, x_left + 10, 80 - b_t)
    t_sub, b_s = render_pencil_text("Field Log · Northern Sandstone Terraces & Wind Bearings", FONT_PATH, font_size=28, gc=gc, seed=902)
    blit_rgba(canvas, t_sub, x_left + 12, 140 - b_s)
    draw_sketchy_line(canvas, (x_left, 165), (x_right, 165), gc=gc, alpha_base=160, passes=2, seed=903)

    # 2. Section I: The Constant Gale
    cur_y = 210
    t_h1, b_h1 = render_pencil_text("I. The Constant Gale", FONT_PATH, font_size=38, gc=gc, seed=910)
    blit_rgba(canvas, t_h1, x_left + 10, cur_y - b_h1)
    cur_y += 46
    draw_sketchy_line(canvas, (x_left + 10, cur_y - 8), (x_left + 420, cur_y - 8), gc=gc, alpha_base=130, passes=1, seed=911)

    p1 = ("Across these elevated tablelands, the northern wind never ceases. It shears through the red rock at "
          "exactly 348 degrees North-Northwest, whistling across the open plains like an ancient subterranean flute. "
          "In my topographical survey, every weathered juniper and desert cedar bends in strict obedience to this single azimuth.")
    for line in wrap_text(p1, FONT_PATH, body_fs, max_w - 20):
        t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=body_fs, gc=gc, seed=915 + cur_y)
        blit_rgba(canvas, t_l, x_left + 15, cur_y - b_l)
        cur_y += line_sp

    # 3. Masterwork Aeolian Wind Compass & Cairn III Drawing
    cur_y += 28
    diag_cy = cur_y + 310
    cx_rose = x_left + 320
    draw_pencil_compass_rose(canvas, cx=cx_rose, cy=diag_cy, r=220, gc=gc, seed=920)

    # Dominant Gale Arrow (348° NNW)
    gale_rad = np.deg2rad(348 - 90)
    gx1 = cx_rose
    gy1 = diag_cy
    gx2 = int(round(cx_rose + 260 * np.cos(gale_rad)))
    gy2 = int(round(diag_cy + 260 * np.sin(gale_rad)))
    draw_sketchy_line(canvas, (gx1, gy1), (gx2, gy2), gc=gc, alpha_base=230, passes=3, seed=925)
    cv2.circle(canvas, (gx2, gy2), 6, (*gc, 230), -1)

    t_gale, _ = render_pencil_text("GALE: 348° NNW", FONT_PATH, font_size=23, gc=gc, seed=926)
    blit_rgba(canvas, t_gale, gx2 - 80, gy2 - 32)

    # Fluid dynamic wind streamlines
    for stream_idx in range(6):
        sy = diag_cy - 180 + stream_idx * 70
        pts_stream = []
        for sx in range(cx_rose + 120, x_right - 60, 24):
            wave = np.sin((sx - cx_rose) * 0.015) * 18.0 + np.cos((sx - cx_rose) * 0.035) * 8.0
            pts_stream.append((sx, int(round(sy + wave))))
        for i in range(len(pts_stream) - 1):
            cv2.line(canvas, pts_stream[i], pts_stream[i + 1], (*gc, 110 + stream_idx * 15), 1, cv2.LINE_AA)

    # Detailed Sketch of Cairn III & Brass Benchmark Plate
    cx_cairn = x_left + 940
    cy_cairn = diag_cy + 40
    # Drystone pyramid
    pts_cairn = np.array([
        [cx_cairn, cy_cairn - 130],
        [cx_cairn + 150, cy_cairn + 90],
        [cx_cairn - 150, cy_cairn + 90]
    ], dtype=np.int32)
    cv2.polylines(canvas, [pts_cairn], True, (*gc, 175), 2, cv2.LINE_AA)
    # Shading layers of stone
    for slab_y in range(cy_cairn - 100, cy_cairn + 90, 24):
        w_slab = int((slab_y - (cy_cairn - 130)) * 0.8)
        cv2.line(canvas, (cx_cairn - w_slab, slab_y), (cx_cairn + w_slab, slab_y), (*gc, 140), 1, cv2.LINE_AA)
        draw_sketchy_line(canvas, (cx_cairn - w_slab, slab_y), (cx_cairn + w_slab, slab_y), gc=gc, alpha_base=130, passes=1, seed=930 + slab_y)

    # Brass benchmark plate inset
    cv2.circle(canvas, (cx_cairn, cy_cairn + 115), 28, (*gc, 190), 2, cv2.LINE_AA)
    cv2.circle(canvas, (cx_cairn, cy_cairn + 115), 22, (*gc, 130), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx_cairn, cy_cairn + 115), 5, (*gc, 210), -1)
    t_cairn_lbl, _ = render_pencil_text("CAIRN III · BENCHMARK PLATE", FONT_PATH, font_size=21, gc=gc, seed=935)
    blit_rgba(canvas, t_cairn_lbl, cx_cairn - 135, cy_cairn + 155)

    cur_y = diag_cy + 245

    # 4. Section II: The Benchmark Plate of Cairn III
    t_h2, b_h2 = render_pencil_text("II. The Benchmark Plate of Cairn III", FONT_PATH, font_size=38, gc=gc, seed=940)
    blit_rgba(canvas, t_h2, x_left + 10, cur_y - b_h2)
    cur_y += 46
    draw_sketchy_line(canvas, (x_left + 10, cur_y - 8), (x_left + 480, cur_y - 8), gc=gc, alpha_base=130, passes=1, seed=941)

    p2 = ("At the eastern bluff where the plateau drops vertically into the wash, our predecessors built Cairn III. "
          "It is no mere heap of rubble: cemented into bedrock sits an engraved brass benchmark plate. "
          "Calibrating your quadrant here reveals the geodetic sighting ray toward Mesa del Sol.")
    for line in wrap_text(p2, FONT_PATH, body_fs, max_w - 20):
        t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=body_fs, gc=gc, seed=945 + cur_y)
        blit_rgba(canvas, t_l, x_left + 15, cur_y - b_l)
        cur_y += line_sp

    # 5. Section III: The Broken Caravan Tracks
    cur_y += 24
    t_h3, b_h3 = render_pencil_text("III. The Broken Caravan Tracks", FONT_PATH, font_size=38, gc=gc, seed=950)
    blit_rgba(canvas, t_h3, x_left + 10, cur_y - b_h3)
    cur_y += 46
    draw_sketchy_line(canvas, (x_left + 10, cur_y - 8), (x_left + 460, cur_y - 8), gc=gc, alpha_base=130, passes=1, seed=951)

    p3 = ("The red sand preserves faint, hurried wheel-ruts. The raiders who carried the stolen Astrolabe came this way, "
          "their draught beasts strained by the heavy brass mechanism. Follow their iron-shod tracks into the Sandstone Labyrinth.")
    for line in wrap_text(p3, FONT_PATH, body_fs, max_w - 20):
        t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=body_fs, gc=gc, seed=955 + cur_y)
        blit_rgba(canvas, t_l, x_left + 15, cur_y - b_l)
        cur_y += line_sp

    draw_sketchy_line(canvas, (x_left, 2370), (x_right, 2370), gc=gc, alpha_base=145, passes=2, seed=999)
    return canvas


# -------------------------------------------------------------------------
# 2. SHEET 10 · CARA A: GAME D1 — THE SANDSTONE LABYRINTH
# -------------------------------------------------------------------------

def render_sheet10_front_d1(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 10 · Cara A (Game D1: The Sandstone Labyrinth) — Cara A: X >= 220."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    x_left, x_right = 220, 1580
    max_w = x_right - x_left

    # 1. Header
    t_title, b_t = render_pencil_text("The Sandstone Labyrinth", FONT_PATH, font_size=64, gc=gc, seed=1001)
    blit_rgba(canvas, t_title, x_left + 10, 80 - b_t)
    t_sub, b_s = render_pencil_text("Game D1 · Tracking the Raider Caravans across the High Terraces", FONT_PATH, font_size=28, gc=gc, seed=1002)
    blit_rgba(canvas, t_sub, x_left + 12, 140 - b_s)
    draw_sketchy_line(canvas, (x_left, 165), (x_right, 165), gc=gc, alpha_base=160, passes=2, seed=1003)

    # 2. Section I: Expedition Objective
    cur_y = 210
    t_h1, b_h1 = render_pencil_text("I. Expedition Objective", FONT_PATH, font_size=38, gc=gc, seed=1010)
    blit_rgba(canvas, t_h1, x_left + 10, cur_y - b_h1)
    cur_y += 46
    draw_sketchy_line(canvas, (x_left + 10, cur_y - 8), (x_left + 380, cur_y - 8), gc=gc, alpha_base=130, passes=1, seed=1011)

    obj = ("Navigate the treacherous fissure network across the northern plateaus. Follow the tracks of the raiders' "
           "wagons between the natural sandstone arches and identify the true crossing before the winds erase all trace.")
    for line in wrap_text(obj, FONT_PATH, 35, max_w - 20):
        t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=35, gc=gc, seed=1015 + cur_y)
        blit_rgba(canvas, t_l, x_left + 15, cur_y - b_l)
        cur_y += 50

    # 3. Masterwork Sandstone Labyrinth Puzzle
    cur_y += 24
    maze_y0 = cur_y
    maze_w = 1260
    maze_h = 1040
    maze_x0 = (x_left + x_right - maze_w) // 2

    # Draw stone frame border
    cv2.rectangle(canvas, (maze_x0, maze_y0), (maze_x0 + maze_w, maze_y0 + maze_h), (*gc, 180), 2, cv2.LINE_AA)
    cv2.rectangle(canvas, (maze_x0 + 8, maze_y0 + 8), (maze_x0 + maze_w - 8, maze_y0 + maze_h - 8), (*gc, 110), 1, cv2.LINE_AA)

    # 15x13 Intricate Sandstone Archway Grid
    cols, rows = 15, 13
    cw = maze_w // cols
    ch = maze_h // rows

    # Sandstone pillars & corridors pattern
    np.random.seed(1042)
    # Fill subtle sandstone grain in the backdrop
    draw_hatch_area(canvas, (maze_x0 + 10, maze_y0 + 10, maze_w - 20, maze_h - 20), angle_deg=35.0, spacing=14, gc=gc, alpha=35)

    # Rock pillar obstacles (blocks)
    rock_pillars = [
        (1, 1), (1, 3), (1, 5), (1, 7), (1, 9), (1, 11), (1, 13),
        (3, 2), (3, 4), (3, 6), (3, 8), (3, 10), (3, 12),
        (5, 1), (5, 3), (5, 7), (5, 9), (5, 11), (5, 13),
        (7, 2), (7, 4), (7, 6), (7, 8), (7, 10), (7, 12),
        (9, 1), (9, 3), (9, 5), (9, 7), (9, 11), (9, 13),
        (11, 2), (11, 4), (11, 6), (11, 8), (11, 10), (11, 12),
    ]
    for pr, pc in rock_pillars:
        px = maze_x0 + pc * cw + 6
        py = maze_y0 + pr * ch + 6
        pw = cw - 12
        ph = ch - 12
        cv2.rectangle(canvas, (px, py), (px + pw, py + ph), (*gc, 160), 1, cv2.LINE_AA)
        draw_hatch_area(canvas, (px, py, pw, ph), angle_deg=45.0, spacing=5, gc=gc, alpha=90)
        draw_sketchy_line(canvas, (px, py), (px + pw, py), gc=gc, alpha_base=180, passes=1, seed=1050 + pr * 10 + pc)

    # Four Grand Sandstone Archway Checkpoints with Ancient Nomadic Glyphs: [M], [A], [Z], [E]
    archways = [
        (2, 5, "M", "Arch of the Falcon"),
        (5, 5, "A", "Mesa Fissure"),
        (8, 9, "Z", "Pillar of the Sun"),
        (10, 3, "E", "Cairn II Gate")
    ]
    for ar, ac, letter, name in archways:
        ax = maze_x0 + ac * cw + cw // 2
        ay = maze_y0 + ar * ch + ch // 2
        # Arch stone circle
        cv2.circle(canvas, (ax, ay), 32, (*gc, 200), 2, cv2.LINE_AA)
        cv2.circle(canvas, (ax, ay), 26, (*gc, 120), 1, cv2.LINE_AA)
        t_glyph, _ = render_pencil_text(letter, FONT_PATH, font_size=32, gc=gc, seed=1060 + ord(letter))
        blit_rgba(canvas, t_glyph, ax - 12, ay - 20)
        t_nm, _ = render_pencil_text(name, FONT_PATH, font_size=18, gc=gc, seed=1070 + ord(letter))
        blit_rgba(canvas, t_nm, ax - 65, ay + 36)

    # Raider Wagon Rut Trail (curved dashed lines showing wheel-ruts through valid corridors)
    waypoints = [
        (maze_x0 + 10, maze_y0 + ch // 2),  # Entrance
        (maze_x0 + 2 * cw, maze_y0 + ch // 2),
        (maze_x0 + 5 * cw + cw // 2, maze_y0 + 2 * ch + ch // 2),  # Arch M
        (maze_x0 + 5 * cw + cw // 2, maze_y0 + 5 * ch + ch // 2),  # Arch A
        (maze_x0 + 9 * cw + cw // 2, maze_y0 + 5 * ch + ch // 2),
        (maze_x0 + 9 * cw + cw // 2, maze_y0 + 8 * ch + ch // 2),  # Arch Z
        (maze_x0 + 3 * cw + cw // 2, maze_y0 + 8 * ch + ch // 2),
        (maze_x0 + 3 * cw + cw // 2, maze_y0 + 10 * ch + ch // 2), # Arch E
        (maze_x0 + 14 * cw + cw // 2, maze_y0 + 12 * ch + ch // 2), # Exit
        (maze_x0 + maze_w - 10, maze_y0 + 12 * ch + ch // 2),
    ]
    for i in range(len(waypoints) - 1):
        wp1, wp2 = waypoints[i], waypoints[i + 1]
        # Dual wagon ruts (offset by 6px)
        dx = wp2[0] - wp1[0]
        dy = wp2[1] - wp1[1]
        dist = np.hypot(dx, dy)
        if dist > 0:
            nx = -dy / dist * 6.0
            ny = dx / dist * 6.0
            p1_a = (int(wp1[0] + nx), int(wp1[1] + ny))
            p2_a = (int(wp2[0] + nx), int(wp2[1] + ny))
            p1_b = (int(wp1[0] - nx), int(wp1[1] - ny))
            p2_b = (int(wp2[0] - nx), int(wp2[1] - ny))
            draw_sketchy_line(canvas, p1_a, p2_a, gc=gc, alpha_base=130, passes=1, seed=1080 + i)
            draw_sketchy_line(canvas, p1_b, p2_b, gc=gc, alpha_base=130, passes=1, seed=1090 + i)

    # Entrance & Exit Markers
    t_ent, _ = render_pencil_text("ENTRANCE ➔ [Watchtower VI · 112° E]", FONT_PATH, font_size=23, gc=gc, seed=1101)
    blit_rgba(canvas, t_ent, maze_x0 + 10, maze_y0 - 34)
    t_ext, _ = render_pencil_text("EXIT ➔ [To Cairn II & Mesa del Sol]", FONT_PATH, font_size=23, gc=gc, seed=1102)
    blit_rgba(canvas, t_ext, maze_x0 + maze_w - 380, maze_y0 + maze_h + 10)

    cur_y = maze_y0 + maze_h + 45

    # 4. Section II: Rules & Mechanical Wagon Study
    t_h2, b_h2 = render_pencil_text("II. Rules of the Waste & Caravan Anatomy", FONT_PATH, font_size=38, gc=gc, seed=1110)
    blit_rgba(canvas, t_h2, x_left + 10, cur_y - b_h2)
    cur_y += 46
    draw_sketchy_line(canvas, (x_left + 10, cur_y - 8), (x_left + 540, cur_y - 8), gc=gc, alpha_base=130, passes=1, seed=1111)

    # Da Vinci Wagon Wheel Mechanical Study at left
    wheel_cx = x_left + 115
    wheel_cy = cur_y + 110
    draw_da_vinci_wagon_wheel(canvas, wheel_cx, wheel_cy, r=72, gc=gc, seed=1115)
    t_wh_lbl, _ = render_pencil_text("ROTA FERRATA", FONT_PATH, font_size=18, gc=gc, seed=1116)
    blit_rgba(canvas, t_wh_lbl, wheel_cx - 58, wheel_cy + 82)
    t_ax_lbl, _ = render_pencil_text("Raider Axle Study", FONT_PATH, font_size=16, gc=gc, seed=1117)
    blit_rgba(canvas, t_ax_lbl, wheel_cx - 55, wheel_cy + 104)

    # Rules text in right block
    text_x = x_left + 240
    text_w = x_right - text_x
    rules = [
        "Follow the wagon wheel-ruts through the sandstone corridors without doubling back across loose scree.",
        "Each archway passed yields a directional glyph: record their sequence in your Cipher Ledger.",
        "The true exit aligns precisely with Cairn II and the 348° NNW solar azimuth of the northern tableland."
    ]
    rule_y = cur_y
    for r in rules:
        r_lines = wrap_text(f"✦  {r}", FONT_PATH, 30, text_w)
        for rl in r_lines:
            t_r, _ = render_pencil_text(rl, FONT_PATH, font_size=30, gc=gc, seed=1120 + rule_y)
            blit_rgba(canvas, t_r, text_x, rule_y)
            rule_y += 42
        rule_y += 6

    # 5. Deduction Ledger Worksheet for Silvia
    ws_y = cur_y + 240
    cv2.rectangle(canvas, (x_left + 10, ws_y), (x_right - 10, ws_y + 160), (*gc, 160), 1, cv2.LINE_AA)
    draw_hatch_area(canvas, (x_left + 12, ws_y + 2, x_right - x_left - 24, 156), angle_deg=45.0, spacing=12, gc=gc, alpha=25)

    t_ws_title, _ = render_pencil_text("ARCHWAY GLYPH RECOVERY LEDGER", FONT_PATH, font_size=24, gc=gc, seed=1130)
    blit_rgba(canvas, t_ws_title, x_left + 30, ws_y + 20)

    # 4 Carved Stone Letter Cartouches
    b_w, b_h = 90, 85
    b_gap = 25
    b_start_x = x_left + 35
    b_y = ws_y + 55

    arch_labels = ["Arch I", "Arch II", "Arch III", "Arch IV"]
    for b_idx in range(4):
        bx = b_start_x + b_idx * (b_w + b_gap)
        draw_sketchy_rect(canvas, (bx, b_y, bx + b_w, b_y + b_h), gc=gc, alpha_base=180, passes=2, seed=1140 + b_idx)
        t_lbl, _ = render_pencil_text(arch_labels[b_idx], FONT_PATH, font_size=18, gc=gc, seed=1150 + b_idx)
        blit_rgba(canvas, t_lbl, bx + (b_w - t_lbl.shape[1]) // 2, b_y + b_h + 6)

    # Exit Azimuth Box on Right
    az_bx = x_right - 440
    az_by = b_y
    draw_sketchy_rect(canvas, (az_bx, az_by, az_bx + 410, az_by + b_h), gc=gc, alpha_base=180, passes=2, seed=1160)
    t_az_hdr, _ = render_pencil_text("CARAVAN EXIT BEARING", FONT_PATH, font_size=20, gc=gc, seed=1161)
    blit_rgba(canvas, t_az_hdr, az_bx + 20, az_by + 16)
    t_az_val, _ = render_pencil_text("348° NNW  (To Cairn II)", FONT_PATH, font_size=26, gc=gc, seed=1162)
    blit_rgba(canvas, t_az_val, az_bx + 20, az_by + 48)

    draw_sketchy_line(canvas, (x_left, 2370), (x_right, 2370), gc=gc, alpha_base=145, passes=2, seed=1199)
    return canvas


# -------------------------------------------------------------------------
# 3. SHEET 10 · CARA B: THE SOLSTICE HORIZON
# -------------------------------------------------------------------------

def render_sheet10_back_lore(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 10 · Cara B (Lore: Solstice Horizon & Solar Noon) — Cara B: X <= 1490."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    x_left, x_right = 160, 1480
    max_w = x_right - x_left
    body_fs, line_sp = 35, 52

    # 1. Header
    t_title, b_t = render_pencil_text("The Solstice Horizon", FONT_PATH, font_size=64, gc=gc, seed=1201)
    blit_rgba(canvas, t_title, x_left + 10, 80 - b_t)
    t_sub, b_s = render_pencil_text("Solar Geometry & Meridian Shadows of Mesa del Sol", FONT_PATH, font_size=28, gc=gc, seed=1202)
    blit_rgba(canvas, t_sub, x_left + 12, 140 - b_s)
    draw_sketchy_line(canvas, (x_left, 165), (x_right, 165), gc=gc, alpha_base=160, passes=2, seed=1203)

    # 2. Section I: The Meridian Shadow
    cur_y = 210
    t_h1, b_h1 = render_pencil_text("I. The Meridian Shadow", FONT_PATH, font_size=38, gc=gc, seed=1210)
    blit_rgba(canvas, t_h1, x_left + 10, cur_y - b_h1)
    cur_y += 46
    draw_sketchy_line(canvas, (x_left + 10, cur_y - 8), (x_left + 420, cur_y - 8), gc=gc, alpha_base=130, passes=1, seed=1211)

    p1 = ("When the sun reaches solar noon above the Great Mesa, the shadow cast by the jagged rim contracts to its "
          "absolute minimum. It is at this exact moment that the terrestrial dial functions: shadows do not merely "
          "indicate time, but point toward buried subterranean conduits and water siphons carved into bedrock.")
    for line in wrap_text(p1, FONT_PATH, body_fs, max_w - 20):
        t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=body_fs, gc=gc, seed=1215 + cur_y)
        blit_rgba(canvas, t_l, x_left + 15, cur_y - b_l)
        cur_y += line_sp

    # 3. Masterwork Solar Meridian & Mesa Diagram
    cur_y += 24
    diag_cy = cur_y + 300
    cx_mid = (x_left + x_right) // 2

    # Mesa del Sol Profile Elevation
    pts_mesa = [
        (x_left + 80, diag_cy + 120),
        (x_left + 240, diag_cy - 40),
        (x_right - 240, diag_cy - 40),
        (x_right - 80, diag_cy + 120)
    ]
    for i in range(len(pts_mesa) - 1):
        cv2.line(canvas, pts_mesa[i], pts_mesa[i + 1], (*gc, 185), 2, cv2.LINE_AA)
        draw_sketchy_line(canvas, pts_mesa[i], pts_mesa[i + 1], gc=gc, alpha_base=160, passes=1, seed=1220 + i)

    # Mesa cliff hatching
    draw_hatch_area(canvas, (x_left + 240, diag_cy - 40, x_right - x_left - 480, 160), angle_deg=65.0, spacing=9, gc=gc, alpha=70)

    # Gnomon needle atop the mesa
    gnomon_x = cx_mid - 120
    gnomon_y_top = diag_cy - 180
    gnomon_y_base = diag_cy - 40
    cv2.line(canvas, (gnomon_x, gnomon_y_base), (gnomon_x, gnomon_y_top), (*gc, 220), 3, cv2.LINE_AA)
    cv2.circle(canvas, (gnomon_x, gnomon_y_top), 6, (*gc, 230), -1)

    # Solstice Sun Rays & Angle Arc
    sun_x = gnomon_x - 380
    sun_y = gnomon_y_top - 160
    # Sun burst
    cv2.circle(canvas, (sun_x, sun_y), 24, (*gc, 210), 2, cv2.LINE_AA)
    cv2.circle(canvas, (sun_x, sun_y), 8, (*gc, 230), -1)
    for s_deg in range(0, 360, 30):
        s_rad = np.deg2rad(s_deg)
        cv2.line(canvas,
                 (int(sun_x + 30 * np.cos(s_rad)), int(sun_y + 30 * np.sin(s_rad))),
                 (int(sun_x + 52 * np.cos(s_rad)), int(sun_y + 52 * np.sin(s_rad))),
                 (*gc, 170), 1, cv2.LINE_AA)

    # Solar Ray through Gnomon Tip
    ray_x_end = gnomon_x + 280
    ray_y_end = gnomon_y_base
    draw_sketchy_line(canvas, (sun_x, sun_y), (ray_x_end, ray_y_end), gc=gc, alpha_base=180, passes=2, seed=1230)
    # Cast shadow on mesa top
    cv2.line(canvas, (gnomon_x, gnomon_y_base), (ray_x_end, ray_y_end), (*gc, 230), 4, cv2.LINE_AA)
    t_shad, _ = render_pencil_text("Meridian Shadow (Minimum: 194° SSW)", FONT_PATH, font_size=22, gc=gc, seed=1235)
    blit_rgba(canvas, t_shad, gnomon_x + 20, gnomon_y_base - 28)

    # Angle arc (θ = 60° Solstice)
    cv2.ellipse(canvas, (gnomon_x, gnomon_y_top), (70, 70), 0, 20, 68, (*gc, 160), 1, cv2.LINE_AA)
    t_theta, _ = render_pencil_text("θ = 60° Solstice", FONT_PATH, font_size=20, gc=gc, seed=1240)
    blit_rgba(canvas, t_theta, gnomon_x + 45, gnomon_y_top + 45)

    # Horizon degree ticks below mesa
    for h_tick in range(x_left + 120, x_right - 120, 48):
        cv2.line(canvas, (h_tick, diag_cy + 130), (h_tick, diag_cy + 144), (*gc, 130), 1, cv2.LINE_AA)

    cur_y = diag_cy + 195

    # 4. Section II: Thermal Silence & Sandstone Whispers
    t_h2, b_h2 = render_pencil_text("II. Thermal Silence", FONT_PATH, font_size=38, gc=gc, seed=1250)
    blit_rgba(canvas, t_h2, x_left + 10, cur_y - b_h2)
    cur_y += 46
    draw_sketchy_line(canvas, (x_left + 10, cur_y - 8), (x_left + 360, cur_y - 8), gc=gc, alpha_base=130, passes=1, seed=1251)

    p2 = ("Between the fourth hour of morning and the eighth of afternoon, the furnace heat suppresses every sound. "
          "The birds fall still; the wind drops to a trembling murmur. It is in this thermal silence that the sandstone speaks—"
          "faint cracking sounds echoing from the fractures beneath our boots like the ticking of an immense clock.")
    for line in wrap_text(p2, FONT_PATH, body_fs, max_w - 20):
        t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=body_fs, gc=gc, seed=1255 + cur_y)
        blit_rgba(canvas, t_l, x_left + 15, cur_y - b_l)
        cur_y += line_sp

    # 5. Section III: The Warning of Hermes
    cur_y += 24
    t_h3, b_h3 = render_pencil_text("III. The Warning of Hermes", FONT_PATH, font_size=38, gc=gc, seed=1260)
    blit_rgba(canvas, t_h3, x_left + 10, cur_y - b_h3)
    cur_y += 46
    draw_sketchy_line(canvas, (x_left + 10, cur_y - 8), (x_left + 440, cur_y - 8), gc=gc, alpha_base=130, passes=1, seed=1261)

    p3 = ("Hermes cautions us: do not venture beyond the northern bluff without calculating the shadow angle. "
          "A single misstep upon the crumbling sandstone shelf will send man and beast into the abyss. "
          "Follow only the shadow that aligns with the Al-Qibla heading.")
    for line in wrap_text(p3, FONT_PATH, body_fs, max_w - 20):
        t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=body_fs, gc=gc, seed=1265 + cur_y)
        blit_rgba(canvas, t_l, x_left + 15, cur_y - b_l)
        cur_y += line_sp

    draw_sketchy_line(canvas, (x_left, 2370), (x_right, 2370), gc=gc, alpha_base=145, passes=2, seed=1299)
    return canvas


# -------------------------------------------------------------------------
# 4. SHEET 11 · CARA A: GAME D2 — THE DESERT LEXICON & AL-QIBLA
# -------------------------------------------------------------------------

def render_sheet11_front_d2(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 11 · Cara A (Game D2: The Desert Lexicon & Al-Qibla) — Cara A: X >= 220."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    x_left, x_right = 220, 1580
    max_w = x_right - x_left

    # 1. Header
    t_title, b_t = render_pencil_text("The Desert Lexicon", FONT_PATH, font_size=64, gc=gc, seed=2101)
    blit_rgba(canvas, t_title, x_left + 10, 80 - b_t)
    t_sub, b_s = render_pencil_text("Game D2 · Ancient Nomad Crossword & The Al-Qibla Sun Compass", FONT_PATH, font_size=28, gc=gc, seed=2102)
    blit_rgba(canvas, t_sub, x_left + 12, 140 - b_s)
    draw_sketchy_line(canvas, (x_left, 165), (x_right, 165), gc=gc, alpha_base=160, passes=2, seed=2103)

    # 2. Crossword Grid (Left) & Al-Qibla Instrument (Right)
    # Words in the grid
    across_words = [
        (2, 1, "SIROCCO"),    # 2. Across
        (6, 3, "NOMAD"),      # 3. Across
        (9, 4, "OASIS"),      # 6. Across
        (11, 5, "ECLIPSE"),   # 8. Across
        (13, 5, "HORIZON"),   # 9. Across
    ]
    down_words = [
        (0, 3, "CARAVAN"),    # 1. Down
        (2, 1, "SPHINX"),     # 2. Down
        (6, 5, "MIRAGE"),     # 4. Down
        (7, 10, "DUNES"),     # 5. Down
        (9, 8, "SPIRIT"),     # 7. Down
    ]

    cell_sz = 52
    gx0 = x_left + 15
    gy0 = 205

    active_cells = {}
    for r0, c0, w in across_words:
        for i, ch in enumerate(w):
            active_cells[(r0, c0 + i)] = ch
    for r0, c0, w in down_words:
        for i, ch in enumerate(w):
            active_cells[(r0 + i, c0)] = ch

    # Master Key Cells (P-H-O-E-N-I-X)
    key_circles = {
        (11, 9): "1",   # P
        (13, 5): "2",   # H
        (2, 4):  "3",   # O
        (10, 10): "4",  # E
        (6, 3):  "5",   # N
        (9, 7):  "6",   # I
        (7, 1):  "7",   # X
    }

    # Draw stone crossword cells
    for (r, c) in active_cells:
        x1 = gx0 + c * cell_sz
        y1 = gy0 + r * cell_sz
        x2 = x1 + cell_sz
        y2 = y1 + cell_sz

        draw_sketchy_rect(canvas, (x1, y1, x2, y2), gc=gc, alpha_base=175, passes=1, seed=2200 + r * 15 + c)
        # Inner masonry relief
        cv2.rectangle(canvas, (x1 + 3, y1 + 3), (x2 - 3, y2 - 3), (*gc, 70), 1, cv2.LINE_AA)

        if (r, c) in key_circles:
            mid_x, mid_y = (x1 + x2) // 2, (y1 + y2) // 2
            cv2.circle(canvas, (mid_x, mid_y), cell_sz // 2 - 4, (*gc, 190), 2, cv2.LINE_AA)
            cv2.circle(canvas, (mid_x, mid_y), cell_sz // 2 - 8, (*gc, 120), 1, cv2.LINE_AA)
            t_kn, _ = render_pencil_text(key_circles[(r, c)], FONT_PATH, font_size=16, gc=gc, seed=2250 + int(key_circles[(r, c)]))
            blit_rgba(canvas, t_kn, x2 - 17, y2 - 19)

    # Word starting numbers
    starts = {
        (0, 3): "1", (2, 1): "2", (6, 3): "3", (6, 5): "4",
        (7, 10): "5", (9, 4): "6", (9, 8): "7", (11, 5): "8", (13, 5): "9",
    }
    for (r, c), num in starts.items():
        x1 = gx0 + c * cell_sz
        y1 = gy0 + r * cell_sz
        t_num, _ = render_pencil_text(num, FONT_PATH, font_size=18, gc=gc, seed=2280 + r * 10 + c)
        blit_rgba(canvas, t_num, x1 + 5, y1 + 3)

    # Right side: Masterwork Renaissance Al-Qibla Sun Compass Instrument
    inst_cx = x_left + 990
    inst_cy = gy0 + 380
    inst_r = 215

    # Graduated outer brass dial
    cv2.circle(canvas, (inst_cx, inst_cy), inst_r, (*gc, 200), 2, cv2.LINE_AA)
    cv2.circle(canvas, (inst_cx, inst_cy), inst_r - 8, (*gc, 130), 1, cv2.LINE_AA)
    cv2.circle(canvas, (inst_cx, inst_cy), inst_r - 20, (*gc, 180), 1, cv2.LINE_AA)
    cv2.circle(canvas, (inst_cx, inst_cy), int(inst_r * 0.44), (*gc, 160), 1, cv2.LINE_AA)
    cv2.circle(canvas, (inst_cx, inst_cy), 8, (*gc, 220), -1)

    # 360° graduation marks
    for deg in range(0, 360, 10):
        rad = np.deg2rad(deg)
        is_card = deg % 90 == 0
        is_maj = deg % 30 == 0
        len_t = 18 if is_card else (12 if is_maj else 7)
        p1 = (int(round(inst_cx + (inst_r - len_t) * np.cos(rad))), int(round(inst_cy + (inst_r - len_t) * np.sin(rad))))
        p2 = (int(round(inst_cx + inst_r * np.cos(rad))), int(round(inst_cy + inst_r * np.sin(rad))))
        cv2.line(canvas, p1, p2, (*gc, 200 if is_card else 120), 2 if is_card else 1, cv2.LINE_AA)

    # 16-point wind rose star
    for idx in range(16):
        deg = idx * 22.5
        rad = np.deg2rad(deg)
        r_tip = inst_r - 24 if idx % 4 == 0 else int(inst_r * 0.72)
        px = int(round(inst_cx + r_tip * np.cos(rad)))
        py = int(round(inst_cy + r_tip * np.sin(rad)))
        rad_prev = np.deg2rad(deg - 11.25)
        r_base = int(inst_r * 0.42)
        bx = int(round(inst_cx + r_base * np.cos(rad_prev)))
        by = int(round(inst_cy + r_base * np.sin(rad_prev)))
        pts = np.array([[inst_cx, inst_cy], [px, py], [bx, by]], dtype=np.int32)
        if idx % 2 == 0:
            cv2.fillPoly(canvas, [pts], (*gc, 90), cv2.LINE_AA)
        cv2.polylines(canvas, [pts], True, (*gc, 160), 1, cv2.LINE_AA)

    # Prominent Al-Qibla Shadow Vector: 194° SSW (Al-Qibla Azimuth to Sanctuary)
    qibla_rad = np.deg2rad(194 - 90)
    qibla_len = inst_r + 25
    qx_end = int(round(inst_cx + qibla_len * np.cos(qibla_rad)))
    qy_end = int(round(inst_cy + qibla_len * np.sin(qibla_rad)))
    draw_sketchy_line(canvas, (inst_cx, inst_cy), (qx_end, qy_end), gc=gc, alpha_base=240, passes=3, seed=2300)
    cv2.circle(canvas, (qx_end, qy_end), 6, (*gc, 235), -1)

    t_qibla_lbl, _ = render_pencil_text("AL-QIBLA · 194° SSW", FONT_PATH, font_size=22, gc=gc, seed=2305)
    blit_rgba(canvas, t_qibla_lbl, qx_end - 145, qy_end + 12)
    t_qibla_sub, _ = render_pencil_text("Vector to the Desert Oracle", FONT_PATH, font_size=18, gc=gc, seed=2306)
    blit_rgba(canvas, t_qibla_sub, qx_end - 135, qy_end + 38)

    # Instrument label top
    t_inst_title, _ = render_pencil_text("GNOMON AL-QIBLA", FONT_PATH, font_size=20, gc=gc, seed=2310)
    blit_rgba(canvas, t_inst_title, inst_cx - 75, inst_cy - inst_r - 28)

    # 3. Section II: Clues of the Nomad Elders
    clue_y0 = gy0 + 15 * cell_sz + 40
    draw_sketchy_line(canvas, (x_left, clue_y0), (x_right, clue_y0), gc=gc, alpha_base=150, passes=2, seed=2400)
    clue_y0 += 32

    t_h2, b_h2 = render_pencil_text("II. Clues of the Nomad Elders", FONT_PATH, font_size=36, gc=gc, seed=2401)
    blit_rgba(canvas, t_h2, x_left + 10, clue_y0 - b_h2)
    clue_y0 += 40

    # Two columns for clues
    col_w = max_w // 2 - 25
    c1_x = x_left + 10
    c2_x = x_left + max_w // 2 + 15

    # Across Column
    t_ac_hdr, b_ah = render_pencil_text("Across (The Lateral Trails)", FONT_PATH, font_size=26, gc=gc, seed=2410)
    blit_rgba(canvas, t_ac_hdr, c1_x, clue_y0 - b_ah)

    across_clues = [
        ("2.", "The blistering south-easterly wind that sweeps the dunes and erases all travelers' footsteps."),
        ("3.", "The eternal wanderer whose only roof is the starry vault and the desert horizon."),
        ("6.", "A verdant sanctuary where hidden subterranean springs quench the thirst of weary pilgrims."),
        ("8.", "The sacred occultation when the noon sun is crowned in darkness by the celestial disk."),
        ("9.", "The boundless circle where burning desert sands meet the eternal vault of heaven.")
    ]
    cur_ac_y = clue_y0 + 38
    for n, desc in across_clues:
        t_n, b_n = render_pencil_text(n, FONT_PATH, font_size=22, gc=gc, seed=2420 + cur_ac_y)
        blit_rgba(canvas, t_n, c1_x, cur_ac_y - b_n)
        lines = wrap_text(desc, FONT_PATH, 20, col_w - 40)
        line_y = cur_ac_y
        for l in lines:
            t_l, b_l = render_pencil_text(l, FONT_PATH, font_size=20, gc=gc, seed=2425 + line_y)
            blit_rgba(canvas, t_l, c1_x + 36, line_y - b_l)
            line_y += 28
        cur_ac_y = max(cur_ac_y + 60, line_y + 6)

    # Down Column
    t_dn_hdr, b_dh = render_pencil_text("Down (The Vertical Meridians)", FONT_PATH, font_size=26, gc=gc, seed=2450)
    blit_rgba(canvas, t_dn_hdr, c2_x, clue_y0 - b_dh)

    down_clues = [
        ("1.", "The solemn march of laden camels and merchants navigating by nocturnal stars."),
        ("2.", "The stone guardian of ancient dynasties, keeping silent watch over the golden sands."),
        ("4.", "The shimmering illusion of non-existent waters conjured by heat above the scorched basin."),
        ("5.", "The shifting hills of golden powder, sculpted and reshaped by the midnight breeze."),
        ("7.", "The unseen whisperer of the desert expanse, whistling through the sandstone canyons.")
    ]
    cur_dn_y = clue_y0 + 38
    for n, desc in down_clues:
        t_n, b_n = render_pencil_text(n, FONT_PATH, font_size=22, gc=gc, seed=2460 + cur_dn_y)
        blit_rgba(canvas, t_n, c2_x, cur_dn_y - b_n)
        lines = wrap_text(desc, FONT_PATH, 20, col_w - 40)
        line_y = cur_dn_y
        for l in lines:
            t_l, b_l = render_pencil_text(l, FONT_PATH, font_size=20, gc=gc, seed=2465 + line_y)
            blit_rgba(canvas, t_l, c2_x + 36, line_y - b_l)
            line_y += 28
        cur_dn_y = max(cur_dn_y + 60, line_y + 6)

    # 4. Section III: The Desert Sigil (Master Key Cartouche)
    sig_y = max(cur_ac_y, cur_dn_y) + 30
    draw_sketchy_line(canvas, (x_left, sig_y), (x_right, sig_y), gc=gc, alpha_base=150, passes=2, seed=2500)
    sig_y += 30

    t_h3, b_h3 = render_pencil_text("III. The Desert Sigil (Assemble the circled letters in order 1 to 7):", FONT_PATH, font_size=32, gc=gc, seed=2505)
    blit_rgba(canvas, t_h3, x_left + 10, sig_y - b_h3)
    sig_y += 45

    # 7 Large Answer Stone Tablets for PHOENIX
    k_sz = 94
    k_gap = 32
    total_kw = 7 * k_sz + 6 * k_gap
    k_x0 = x_left + (max_w - total_kw) // 2

    for i in range(7):
        kx = k_x0 + i * (k_sz + k_gap)
        draw_sketchy_rect(canvas, (kx, sig_y, kx + k_sz, sig_y + k_sz), gc=gc, alpha_base=185, passes=2, seed=2510 + i)
        cv2.rectangle(canvas, (kx + 4, sig_y + 4), (kx + k_sz - 4, sig_y + k_sz - 4), (*gc, 70), 1, cv2.LINE_AA)
        t_idx, _ = render_pencil_text(str(i + 1), FONT_PATH, font_size=24, gc=gc, seed=2530 + i)
        blit_rgba(canvas, t_idx, kx + k_sz // 2 - t_idx.shape[1] // 2, sig_y + k_sz + 14)

    sig_y += k_sz + 55
    t_sig_note, _ = render_pencil_text("The 7-letter sacred sigil unlocks the keyed Polybius Stele at Cairn III.", FONT_PATH, font_size=22, gc=gc, seed=2550)
    blit_rgba(canvas, t_sig_note, x_left + (max_w - t_sig_note.shape[1]) // 2, sig_y)

    draw_sketchy_line(canvas, (x_left, 2370), (x_right, 2370), gc=gc, alpha_base=145, passes=2, seed=2599)
    return canvas


# -------------------------------------------------------------------------
# 5. SHEET 11 · CARA B: GAME D3 — THE POLYBIUS STELE OF CAIRN III
# -------------------------------------------------------------------------

def render_sheet11_back_d3(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 11 · Cara B (Game D3: The Polybius Stele of Cairn III) — Cara B: X <= 1480."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    x_left, x_right = 160, 1480
    max_w = x_right - x_left

    # 1. Header
    t_title, b_t = render_pencil_text("The Polybius Stele", FONT_PATH, font_size=64, gc=gc, seed=3101)
    blit_rgba(canvas, t_title, x_left + 10, 80 - b_t)
    t_sub, b_s = render_pencil_text("Game D3 · Nomadic Cipher Tablet of Cairn III & The Double Sight", FONT_PATH, font_size=28, gc=gc, seed=3102)
    blit_rgba(canvas, t_sub, x_left + 12, 140 - b_s)
    draw_sketchy_line(canvas, (x_left, 165), (x_right, 165), gc=gc, alpha_base=160, passes=2, seed=3103)

    # 2. Arched Sandstone Stele Monument with Cairn III Vignette
    # Left vignette: Cairn III architectural study
    cairn_cx = x_left + 80
    cairn_cy = 380
    pts_cairn = np.array([
        [cairn_cx, cairn_cy - 120],
        [cairn_cx + 70, cairn_cy + 80],
        [cairn_cx - 70, cairn_cy + 80]
    ], dtype=np.int32)
    cv2.polylines(canvas, [pts_cairn], True, (*gc, 180), 2, cv2.LINE_AA)
    for sy in range(cairn_cy - 90, cairn_cy + 80, 20):
        w_slab = int((sy - (cairn_cy - 120)) * 0.5)
        cv2.line(canvas, (cairn_cx - w_slab, sy), (cairn_cx + w_slab, sy), (*gc, 130), 1, cv2.LINE_AA)
    # Brass benchmark circle
    cv2.circle(canvas, (cairn_cx, cairn_cy + 105), 18, (*gc, 200), 2, cv2.LINE_AA)
    cv2.circle(canvas, (cairn_cx, cairn_cy + 105), 4, (*gc, 220), -1)
    t_cairn_lbl, _ = render_pencil_text("CAIRN III", FONT_PATH, font_size=18, gc=gc, seed=3120)
    blit_rgba(canvas, t_cairn_lbl, cairn_cx - 32, cairn_cy + 132)

    # Central Arched Polybius Stele
    st_x1 = x_left + 175
    st_x2 = x_right - 25
    st_y1 = 195
    st_y2 = 790
    st_mid_x = (st_x1 + st_x2) // 2

    # Semicircular arch top
    cv2.ellipse(canvas, (st_mid_x, st_y1 + 45), ((st_x2 - st_x1) // 2, 48), 0, 180, 360, (*gc, 200), 2, cv2.LINE_AA)
    draw_sketchy_line(canvas, (st_x1, st_y1 + 45), (st_x1, st_y2), gc=gc, alpha_base=200, passes=2, seed=3130)
    draw_sketchy_line(canvas, (st_x2, st_y1 + 45), (st_x2, st_y2), gc=gc, alpha_base=200, passes=2, seed=3131)
    draw_sketchy_line(canvas, (st_x1, st_y2), (st_x2, st_y2), gc=gc, alpha_base=200, passes=2, seed=3132)
    # Inner border
    cv2.rectangle(canvas, (st_x1 + 14, st_y1 + 55), (st_x2 - 14, st_y2 - 14), (*gc, 110), 1, cv2.LINE_AA)

    # Keyed Polybius Grid (Key: P H O E N I X)
    polybius_grid = [
        ["P", "H", "O", "E", "N"],
        ["I", "X", "A", "B", "C"],
        ["D", "F", "G", "K", "L"],
        ["M", "Q", "R", "S", "T"],
        ["U", "V", "W", "Y", "Z"],
    ]
    romans = ["I", "II", "III", "IV", "V"]

    rh_w = 75
    pg_cw = 185
    pg_ch = 95
    pg_x0 = st_x1 + 65
    pg_y0 = st_y1 + 60

    # Column Headers (I..V)
    for c_idx, rom in enumerate(romans):
        cx = pg_x0 + rh_w + c_idx * pg_cw + pg_cw // 2
        t_rom, _ = render_pencil_text(rom, FONT_PATH, font_size=36, gc=gc, seed=3140 + c_idx)
        blit_rgba(canvas, t_rom, cx - t_rom.shape[1] // 2, pg_y0 + 12)

    # Row Headers and Cells
    for r_idx, row in enumerate(polybius_grid):
        ry = pg_y0 + 50 + r_idx * pg_ch + pg_ch // 2
        t_rrom, _ = render_pencil_text(romans[r_idx], FONT_PATH, font_size=36, gc=gc, seed=3150 + r_idx)
        blit_rgba(canvas, t_rrom, pg_x0 + rh_w // 2 - t_rrom.shape[1] // 2, ry - t_rrom.shape[0] // 2)

        for c_idx, letter in enumerate(row):
            cx = pg_x0 + rh_w + c_idx * pg_cw
            cy = pg_y0 + 50 + r_idx * pg_ch
            draw_sketchy_rect(canvas, (cx, cy, cx + pg_cw, cy + pg_ch), gc=gc, alpha_base=160, passes=1, seed=3160 + r_idx * 10 + c_idx)
            t_let, _ = render_pencil_text(letter, FONT_PATH, font_size=46, gc=gc, seed=3180 + r_idx * 10 + c_idx)
            blit_rgba(canvas, t_let, cx + (pg_cw - t_let.shape[1]) // 2, cy + (pg_ch - t_let.shape[0]) // 2)

    # 3. Section II: The Law of the Inverted Mirage (Double Sight)
    cur_y = st_y2 + 35
    draw_sketchy_line(canvas, (x_left, cur_y), (x_right, cur_y), gc=gc, alpha_base=150, passes=2, seed=3200)
    cur_y += 30

    t_h2, b_h2 = render_pencil_text("II. The Law of the Inverted Mirage (Double Sight)", FONT_PATH, font_size=36, gc=gc, seed=3205)
    blit_rgba(canvas, t_h2, x_left + 10, cur_y - b_h2)
    cur_y += 44

    rules = [
        "1. Solar Stanzas (Odd: I, III, V): Direct stone reading — coordinates are strictly (Row, Column).",
        "2. Lunar Stanzas (Even: II, IV, VI): Inverted by desert heat mirage — coordinates are (Column, Row)."
    ]
    for r in rules:
        t_r, _ = render_pencil_text(f"✦  {r}", FONT_PATH, font_size=30, gc=gc, seed=3210 + cur_y)
        blit_rgba(canvas, t_r, x_left + 15, cur_y)
        cur_y += 42

    # 4. Section III: Scribed Coordinates of the Desert Pillars
    cur_y += 15
    draw_sketchy_line(canvas, (x_left, cur_y), (x_right, cur_y), gc=gc, alpha_base=150, passes=2, seed=3300)
    cur_y += 30

    t_h3, b_h3 = render_pencil_text("III. The Scribed Coordinates of the Desert Pillars", FONT_PATH, font_size=36, gc=gc, seed=3305)
    blit_rgba(canvas, t_h3, x_left + 10, cur_y - b_h3)
    cur_y += 44

    stanzas = [
        ("I.", "(IV, IV)   (IV, V)   (II, III)   (IV, III)   (IV, IV)", "5 Letters"),
        ("II.", "(III, III)   (I, V)   (I, II)   (I, III)   (IV, I)", "5 Letters"),
        ("III.", "(IV, V)   (I, II)   (I, III)   (IV, IV)   (I, IV)", "5 Letters"),
        ("IV.", "(III, V)   (II, I)   (III, I)", "3 Letters"),
        ("V.", "(IV, IV)   (I, IV)   (I, IV)   (III, IV)", "4 Letters"),
        ("VI.", "(V, IV)   (III, IV)   (I, V)   (V, IV)   (II, I)", "5 Letters"),
    ]

    for num, glyphs, count in stanzas:
        t_n, b_n = render_pencil_text(num, FONT_PATH, font_size=30, gc=gc, seed=3310 + cur_y)
        blit_rgba(canvas, t_n, x_left + 15, cur_y - b_n)
        t_gl, b_gl = render_pencil_text(glyphs, FONT_PATH, font_size=30, gc=gc, seed=3320 + cur_y)
        blit_rgba(canvas, t_gl, x_left + 95, cur_y - b_gl)
        t_cnt, b_ct = render_pencil_text(f"[ {count} ]", FONT_PATH, font_size=24, gc=gc, seed=3330 + cur_y)
        blit_rgba(canvas, t_cnt, x_right - 180, cur_y - b_ct)
        cur_y += 50

    # 5. Section IV: Decoded Nomadic Proverb Worksheet
    cur_y += 10
    draw_sketchy_line(canvas, (x_left, cur_y), (x_right, cur_y), gc=gc, alpha_base=150, passes=2, seed=3400)
    cur_y += 30

    t_h4, b_h4 = render_pencil_text("IV. The Decoded Nomadic Proverb (Inscribe into stone):", FONT_PATH, font_size=32, gc=gc, seed=3405)
    blit_rgba(canvas, t_h4, x_left + 10, cur_y - b_h4)
    cur_y += 40

    box_w, box_h = 54, 66
    letter_gap = 10

    # Line 1: Word 1 (5: STARS), Word 2 (5: GUIDE), Word 3 (5: THOSE)
    line1_words = [("I. STARS", 5), ("II. GUIDE", 5), ("III. THOSE", 5)]
    word_gap1 = 60
    total_w1 = sum(cnt * box_w + (cnt - 1) * letter_gap for _, cnt in line1_words) + (len(line1_words) - 1) * word_gap1
    cur_x1 = x_left + (max_w - total_w1) // 2

    for w_idx, (roman_lbl, cnt) in enumerate(line1_words):
        w_start = cur_x1
        for l_idx in range(cnt):
            bx = cur_x1
            draw_sketchy_rect(canvas, (bx, cur_y, bx + box_w, cur_y + box_h), gc=gc, alpha_base=170, passes=2, seed=3420 + w_idx * 10 + l_idx)
            cur_x1 += box_w + letter_gap
        cur_x1 -= letter_gap
        w_center = (w_start + cur_x1) // 2
        t_lbl, _ = render_pencil_text(f"[ {roman_lbl} ]", FONT_PATH, font_size=20, gc=gc, seed=3430 + w_idx)
        blit_rgba(canvas, t_lbl, w_center - t_lbl.shape[1] // 2, cur_y + box_h + 8)
        cur_x1 += word_gap1

    cur_y += box_h + 50

    # Line 2: Word 4 (3: WHO), Word 5 (4: SEEK), Word 6 (5: TRUTH)
    line2_words = [("IV. WHO", 3), ("V. SEEK", 4), ("VI. TRUTH", 5)]
    word_gap2 = 65
    total_w2 = sum(cnt * box_w + (cnt - 1) * letter_gap for _, cnt in line2_words) + (len(line2_words) - 1) * word_gap2
    cur_x2 = x_left + (max_w - total_w2) // 2

    for w_idx, (roman_lbl, cnt) in enumerate(line2_words):
        w_start = cur_x2
        for l_idx in range(cnt):
            bx = cur_x2
            draw_sketchy_rect(canvas, (bx, cur_y, bx + box_w, cur_y + box_h), gc=gc, alpha_base=170, passes=2, seed=3450 + w_idx * 10 + l_idx)
            cur_x2 += box_w + letter_gap
        cur_x2 -= letter_gap
        w_center = (w_start + cur_x2) // 2
        t_lbl, _ = render_pencil_text(f"[ {roman_lbl} ]", FONT_PATH, font_size=20, gc=gc, seed=3460 + w_idx)
        blit_rgba(canvas, t_lbl, w_center - t_lbl.shape[1] // 2, cur_y + box_h + 8)
        cur_x2 += word_gap2

    draw_sketchy_line(canvas, (x_left, 2370), (x_right, 2370), gc=gc, alpha_base=145, passes=2, seed=3499)
    return canvas


# -------------------------------------------------------------------------
# 6. SHEET 12 · CARA A: GAME D4 — THE SUN MONOLITH ALIGNMENT
# -------------------------------------------------------------------------

def render_sheet12_front_d4(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 12 · Cara A (Game D4: The Sun Monolith Alignment) — Cara A: X >= 220."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    x_left, x_right = 220, 1580
    max_w = x_right - x_left

    # 1. Header
    t_title, b_t = render_pencil_text("The Sun Monolith", FONT_PATH, font_size=64, gc=gc, seed=4101)
    blit_rgba(canvas, t_title, x_left + 10, 80 - b_t)
    t_sub, b_s = render_pencil_text("Game D4 · Solar Azimuth Alignment & Stargazer Equations", FONT_PATH, font_size=28, gc=gc, seed=4102)
    blit_rgba(canvas, t_sub, x_left + 12, 140 - b_s)
    draw_sketchy_line(canvas, (x_left, 165), (x_right, 165), gc=gc, alpha_base=160, passes=2, seed=4103)

    # 2. Section I: Expedition Objective
    cur_y = 210
    t_h1, b_h1 = render_pencil_text("I. Expedition Objective", FONT_PATH, font_size=38, gc=gc, seed=4110)
    blit_rgba(canvas, t_h1, x_left + 10, cur_y - b_h1)
    cur_y += 46
    draw_sketchy_line(canvas, (x_left + 10, cur_y - 8), (x_left + 380, cur_y - 8), gc=gc, alpha_base=130, passes=1, seed=4111)

    obj = ("Calibrate the shadow cast by the solitary Sun Monolith atop Mesa del Sol. Intersect its shadow tip with "
           "the 348 degree vector from Cairn III to reveal the hidden fissure descending into the southern canyon.")
    for line in wrap_text(obj, FONT_PATH, 35, max_w - 20):
        t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=35, gc=gc, seed=4115 + cur_y)
        blit_rgba(canvas, t_l, x_left + 15, cur_y - b_l)
        cur_y += 50

    # 3. Masterwork Architectural Drawing: Sun Monolith Elevation & Geodetic Quadrant
    cur_y += 20
    diag_cy = cur_y + 360

    # Left: Monolith Elevation
    mono_cx = x_left + 280
    mono_top_w = 46
    mono_bot_w = 110
    mono_h = 420
    mono_y0 = diag_cy - 210
    mono_y1 = diag_cy + 210

    # Stepped plinth bedrock
    cv2.rectangle(canvas, (mono_cx - 95, mono_y1), (mono_cx + 95, mono_y1 + 35), (*gc, 185), 2, cv2.LINE_AA)
    cv2.rectangle(canvas, (mono_cx - 130, mono_y1 + 35), (mono_cx + 130, mono_y1 + 65), (*gc, 165), 2, cv2.LINE_AA)
    draw_hatch_area(canvas, (mono_cx - 130, mono_y1 + 35, 260, 30), angle_deg=45.0, spacing=8, gc=gc, alpha=70)

    # Tapered obelisk body
    pts_obelisk = np.array([
        [mono_cx - mono_top_w // 2, mono_y0 + 40],
        [mono_cx + mono_top_w // 2, mono_y0 + 40],
        [mono_cx + mono_bot_w // 2, mono_y1],
        [mono_cx - mono_bot_w // 2, mono_y1]
    ], dtype=np.int32)
    cv2.polylines(canvas, [pts_obelisk], True, (*gc, 205), 2, cv2.LINE_AA)
    # Pyramidion apex
    pts_apex = np.array([
        [mono_cx - mono_top_w // 2, mono_y0 + 40],
        [mono_cx, mono_y0],
        [mono_cx + mono_top_w // 2, mono_y0 + 40]
    ], dtype=np.int32)
    cv2.polylines(canvas, [pts_apex], True, (*gc, 220), 2, cv2.LINE_AA)

    # Shading on right facet
    draw_hatch_area(canvas, (mono_cx, mono_y0 + 40, mono_bot_w // 2, mono_h - 40), angle_deg=65.0, spacing=6, gc=gc, alpha=90)
    # Brass gnomon needle
    cv2.line(canvas, (mono_cx, mono_y0), (mono_cx, mono_y0 - 50), (*gc, 235), 3, cv2.LINE_AA)
    cv2.circle(canvas, (mono_cx, mono_y0 - 50), 6, (*gc, 240), -1)

    t_mono_lbl, _ = render_pencil_text("OBELISCUS SOLARIS · MESA DEL SOL", FONT_PATH, font_size=19, gc=gc, seed=4120)
    blit_rgba(canvas, t_mono_lbl, mono_cx - 140, mono_y1 + 80)

    # Right: Geodetic Vector Protractor & Intersection Chart
    quad_cx = x_left + 880
    quad_cy = diag_cy
    quad_r = 250

    cv2.ellipse(canvas, (quad_cx, quad_cy), (quad_r, quad_r), 0, 180, 360, (*gc, 185), 2, cv2.LINE_AA)
    cv2.ellipse(canvas, (quad_cx, quad_cy), (quad_r - 16, quad_r - 16), 0, 180, 360, (*gc, 120), 1, cv2.LINE_AA)
    cv2.circle(canvas, (quad_cx, quad_cy), 6, (*gc, 220), -1)

    # Degree marks every 10°
    for deg in range(180, 361, 10):
        rad = np.deg2rad(deg)
        x1 = int(round(quad_cx + quad_r * np.cos(rad)))
        y1 = int(round(quad_cy + quad_r * np.sin(rad)))
        x2 = int(round(quad_cx + (quad_r - 14) * np.cos(rad)))
        y2 = int(round(quad_cy + (quad_r - 14) * np.sin(rad)))
        cv2.line(canvas, (x1, y1), (x2, y2), (*gc, 140 if deg % 30 == 0 else 90), 1, cv2.LINE_AA)

    # 348° Vector from Cairn III
    rad_348 = np.deg2rad(348 - 90)
    v_x = int(round(quad_cx + quad_r * np.cos(rad_348)))
    v_y = int(round(quad_cy + quad_r * np.sin(rad_348)))
    draw_sketchy_line(canvas, (quad_cx, quad_cy), (v_x, v_y), gc=gc, alpha_base=225, passes=2, seed=4130)
    cv2.circle(canvas, (v_x, v_y), 6, (*gc, 230), -1)
    t_v348, _ = render_pencil_text("VECTOR 348° NNW", FONT_PATH, font_size=20, gc=gc, seed=4131)
    blit_rgba(canvas, t_v348, v_x - 30, v_y - 30)

    # 194° Al-Qibla Sanctuary Azimuth
    rad_194 = np.deg2rad(194 - 90)
    q_x = int(round(quad_cx + (quad_r - 20) * np.cos(rad_194)))
    q_y = int(round(quad_cy + (quad_r - 20) * np.sin(rad_194)))
    draw_sketchy_line(canvas, (quad_cx, quad_cy), (q_x, q_y), gc=gc, alpha_base=215, passes=2, seed=4135)
    t_v194, _ = render_pencil_text("AL-QIBLA 194° SSW", FONT_PATH, font_size=20, gc=gc, seed=4136)
    blit_rgba(canvas, t_v194, q_x - 170, q_y + 15)

    # Stargazer Inscription Stone Tablet (NO NUMERICAL SPOILERS!)
    tab_x0 = quad_cx + 150
    tab_y0 = diag_cy - 175
    tab_w = 275
    tab_h = 210
    draw_sketchy_rect(canvas, (tab_x0, tab_y0, tab_x0 + tab_w, tab_y0 + tab_h), gc=gc, alpha_base=180, passes=2, seed=4140)
    draw_hatch_area(canvas, (tab_x0 + 4, tab_y0 + 4, tab_w - 8, tab_h - 8), angle_deg=45.0, spacing=8, gc=gc, alpha=35)

    t_tab_hdr, _ = render_pencil_text("STARGAZER STELE", FONT_PATH, font_size=20, gc=gc, seed=4141)
    blit_rgba(canvas, t_tab_hdr, tab_x0 + 20, tab_y0 + 20)
    t_eq1, _ = render_pencil_text("[ R ] × 2 = [ F ]", FONT_PATH, font_size=26, gc=gc, seed=4142)
    blit_rgba(canvas, t_eq1, tab_x0 + 38, tab_y0 + 70)
    t_eq2, _ = render_pencil_text("Δ = [ F ] - [ R ]", FONT_PATH, font_size=26, gc=gc, seed=4143)
    blit_rgba(canvas, t_eq2, tab_x0 + 40, tab_y0 + 118)
    t_eq3, _ = render_pencil_text("Bearing: 348° - (Δ × 10°)", FONT_PATH, font_size=19, gc=gc, seed=4144)
    blit_rgba(canvas, t_eq3, tab_x0 + 18, tab_y0 + 168)

    cur_y = diag_cy + 250

    # 4. Section II: Rules & Geodetic Alignment Ledger (ZERO SPOILERS)
    t_h2, b_h2 = render_pencil_text("II. Rules & Geodetic Alignment Ledger", FONT_PATH, font_size=38, gc=gc, seed=4150)
    blit_rgba(canvas, t_h2, x_left + 10, cur_y - b_h2)
    cur_y += 46
    draw_sketchy_line(canvas, (x_left + 10, cur_y - 8), (x_left + 520, cur_y - 8), gc=gc, alpha_base=130, passes=1, seed=4151)

    rules = [
        "Align the gnomon shadow along the solar meridian to calculate the true noon differential.",
        "Calculate [ F ] from your Cipher Ledger using the Stargazer equation: [ R ] × 2 = [ F ].",
        "The intersection of 348° NNW and 194° SSW pinpoints the broken wagons at the brink of the Great Fault."
    ]
    for r in rules:
        t_r, _ = render_pencil_text(f"✦  {r}", FONT_PATH, font_size=31, gc=gc, seed=4160 + cur_y)
        blit_rgba(canvas, t_r, x_left + 15, cur_y)
        cur_y += 44

    # Worksheet blanks for Silvia (Completely spoiler-free!)
    cur_y += 18
    cv2.rectangle(canvas, (x_left + 15, cur_y), (x_right - 15, cur_y + 115), (*gc, 160), 1, cv2.LINE_AA)
    draw_hatch_area(canvas, (x_left + 17, cur_y + 2, x_right - x_left - 34, 111), angle_deg=45.0, spacing=12, gc=gc, alpha=20)

    t_ws1, _ = render_pencil_text("Deduction Ledger:   [ R ] = [  __  ]    ·    [ F ] = [  __  ]    ·    Δ = [  __  ]", FONT_PATH, font_size=32, gc=gc, seed=4170)
    blit_rgba(canvas, t_ws1, x_left + 35, cur_y + 24)
    t_ws2, _ = render_pencil_text("Fault Brink Intersection: [ 194° SSW ]  ➔  The Descent into the Chasm is Unlocked.", FONT_PATH, font_size=24, gc=gc, seed=4171)
    blit_rgba(canvas, t_ws2, x_left + 35, cur_y + 70)

    draw_sketchy_line(canvas, (x_left, 2370), (x_right, 2370), gc=gc, alpha_base=145, passes=2, seed=4199)
    return canvas


# -------------------------------------------------------------------------
# 5. SHEET 12 · CARA B: BRINK OF THE GREAT FAULT
# -------------------------------------------------------------------------

def render_sheet12_back_lore(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 12 · Cara B (Lore: Brink of the Great Fault) — Cara B: X <= 1490."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    x_left, x_right = 160, 1480
    max_w = x_right - x_left
    body_fs, line_sp = 35, 52

    # 1. Header
    t_title, b_t = render_pencil_text("Brink of the Great Fault", FONT_PATH, font_size=64, gc=gc, seed=1501)
    blit_rgba(canvas, t_title, x_left + 10, 80 - b_t)
    t_sub, b_s = render_pencil_text("The Abandoned Wagons & Descent into the Subterranean Gorge", FONT_PATH, font_size=28, gc=gc, seed=1502)
    blit_rgba(canvas, t_sub, x_left + 12, 140 - b_s)
    draw_sketchy_line(canvas, (x_left, 165), (x_right, 165), gc=gc, alpha_base=160, passes=2, seed=1503)

    # 2. Section I: The Smashed Axles
    cur_y = 210
    t_h1, b_h1 = render_pencil_text("I. The Smashed Axles", FONT_PATH, font_size=38, gc=gc, seed=1510)
    blit_rgba(canvas, t_h1, x_left + 10, cur_y - b_h1)
    cur_y += 46
    draw_sketchy_line(canvas, (x_left + 10, cur_y - 8), (x_left + 380, cur_y - 8), gc=gc, alpha_base=130, passes=1, seed=1511)

    p1 = ("At the absolute edge of the northern plateau, where the ground falls vertically three hundred paces into "
          "the canyon floor, we found their transport carts. Two heavy baggage wagons, their hickory axles split in two, "
          "abandoned amid shattered packing crates. They could haul their stolen plunder no further on wheels.")
    for line in wrap_text(p1, FONT_PATH, body_fs, max_w - 20):
        t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=body_fs, gc=gc, seed=1515 + cur_y)
        blit_rgba(canvas, t_l, x_left + 15, cur_y - b_l)
        cur_y += line_sp

    # 3. Masterwork Drawing: Cliff Edge, Shattered Wagon, and Abyss
    cur_y += 24
    diag_cy = cur_y + 300
    cx_mid = (x_left + x_right) // 2

    # Vertical cliff line on left
    cliff_x = x_left + 460
    cliff_y0 = diag_cy - 190
    cliff_y1 = diag_cy + 190

    # Plateau rim on left
    cv2.line(canvas, (x_left + 40, cliff_y0), (cliff_x, cliff_y0), (*gc, 195), 2, cv2.LINE_AA)
    # Precipice drop
    cv2.line(canvas, (cliff_x, cliff_y0), (cliff_x - 40, cliff_y1), (*gc, 210), 2, cv2.LINE_AA)
    # Cliff rock strata
    for cy_strata in range(cliff_y0 + 20, cliff_y1, 28):
        cv2.line(canvas, (cliff_x - 30, cy_strata), (cliff_x + 80, cy_strata), (*gc, 120), 1, cv2.LINE_AA)
    draw_hatch_area(canvas, (cliff_x - 40, cliff_y0, 80, cliff_y1 - cliff_y0), angle_deg=75.0, spacing=8, gc=gc, alpha=90)

    # Shattered Raider Wagon on the rim
    wg_x = x_left + 220
    wg_y = cliff_y0 - 15
    # Wagon bed
    cv2.rectangle(canvas, (wg_x - 90, wg_y - 50), (wg_x + 70, wg_y), (*gc, 185), 2, cv2.LINE_AA)
    # Broken hickory wheel tilted
    cv2.ellipse(canvas, (wg_x - 60, wg_y + 15), (38, 22), 28, 0, 360, (*gc, 190), 2, cv2.LINE_AA)
    # Broken spokes
    for sp_deg in range(0, 360, 45):
        sp_rad = np.deg2rad(sp_deg)
        cv2.line(canvas, (wg_x - 60, wg_y + 15),
                 (int(wg_x - 60 + 34 * np.cos(sp_rad)), int(wg_y + 15 + 20 * np.sin(sp_rad))),
                 (*gc, 140), 1, cv2.LINE_AA)
    # Splintered axle pole
    cv2.line(canvas, (wg_x + 70, wg_y - 25), (wg_x + 150, wg_y - 5), (*gc, 200), 2, cv2.LINE_AA)
    # Shattered crates
    cv2.rectangle(canvas, (wg_x + 95, wg_y - 20), (wg_x + 135, wg_y + 10), (*gc, 150), 1, cv2.LINE_AA)

    t_wg_lbl, _ = render_pencil_text("ABANDONED RAIDER WAGON · BRINK OF THE FAULT", FONT_PATH, font_size=20, gc=gc, seed=1520)
    blit_rgba(canvas, t_wg_lbl, x_left + 50, cliff_y0 + 35)

    # Boot footprints descending down the scree path into the canyon
    pts_trail = [
        (cliff_x - 10, cliff_y0 + 10),
        (cliff_x + 40, cliff_y0 + 60),
        (cliff_x + 110, cliff_y0 + 110),
        (cliff_x + 220, cliff_y0 + 150),
        (x_right - 120, cliff_y1 - 20)
    ]
    for i in range(len(pts_trail) - 1):
        pt1, pt2 = pts_trail[i], pts_trail[i + 1]
        draw_sketchy_line(canvas, pt1, pt2, gc=gc, alpha_base=140, passes=1, seed=1525 + i)
        # Footprint mark
        cv2.circle(canvas, pt2, 4, (*gc, 190), -1)

    t_trail_lbl, _ = render_pencil_text("DESCENT TRAIL ➔ [INTO THE WHISPERING CHASM]", FONT_PATH, font_size=21, gc=gc, seed=1530)
    blit_rgba(canvas, t_trail_lbl, x_right - 460, cliff_y1 + 10)

    cur_y = diag_cy + 220

    # 4. Section II: Footprints into the Chasm
    t_h2, b_h2 = render_pencil_text("II. Footprints into the Chasm", FONT_PATH, font_size=38, gc=gc, seed=1540)
    blit_rgba(canvas, t_h2, x_left + 10, cur_y - b_h2)
    cur_y += 46
    draw_sketchy_line(canvas, (x_left + 10, cur_y - 8), (x_left + 460, cur_y - 8), gc=gc, alpha_base=130, passes=1, seed=1541)

    p2 = ("From the wreckage, heavy booted tracks lead down the scree slope into the Whispering Chasm. "
          "The raiders carried the brass Astrolabe by hand, cradled in coarse burlap, descending into the dark gorge "
          "where no wagon or beast can follow. Hermes and I have tightened our packs; the highland trek is concluded.")
    for line in wrap_text(p2, FONT_PATH, body_fs, max_w - 20):
        t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=body_fs, gc=gc, seed=1545 + cur_y)
        blit_rgba(canvas, t_l, x_left + 15, cur_y - b_l)
        cur_y += line_sp

    # 5. Section III: The Southern Gate Awaits
    cur_y += 24
    t_h3, b_h3 = render_pencil_text("III. The Southern Gate Awaits", FONT_PATH, font_size=38, gc=gc, seed=1550)
    blit_rgba(canvas, t_h3, x_left + 10, cur_y - b_h3)
    cur_y += 46
    draw_sketchy_line(canvas, (x_left + 10, cur_y - 8), (x_left + 440, cur_y - 8), gc=gc, alpha_base=130, passes=1, seed=1551)

    p3 = ("Look across the gulf, Silvia: Sheet 13B and 14A form the great subterranean floor of the desert. "
          "Beyond the acoustic maze of the canyon lies the Sunken Oasis and Tower II. Step boldly down the scree.")
    for line in wrap_text(p3, FONT_PATH, body_fs, max_w - 20):
        t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=body_fs, gc=gc, seed=1555 + cur_y)
        blit_rgba(canvas, t_l, x_left + 15, cur_y - b_l)
        cur_y += line_sp

    draw_sketchy_line(canvas, (x_left, 2370), (x_right, 2370), gc=gc, alpha_base=145, passes=2, seed=1599)
    return canvas


# -------------------------------------------------------------------------
# 6. SHEET 13 · CARA A: THE DEEP WASH & SENTRY
# -------------------------------------------------------------------------

def render_sheet13_front_lore(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 13 · Cara A (Lore: The Deep Wash & Sentry) — Cara A: X >= 220."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    x_left, x_right = 220, 1580
    max_w = x_right - x_left
    body_fs, line_sp = 35, 52

    # 1. Header
    t_title, b_t = render_pencil_text("The Deep Wash & Sentry", FONT_PATH, font_size=64, gc=gc, seed=1601)
    blit_rgba(canvas, t_title, x_left + 10, 80 - b_t)
    t_sub, b_s = render_pencil_text("Field Log · Southern Canyon Descent & The Sentry Mesa", FONT_PATH, font_size=28, gc=gc, seed=1602)
    blit_rgba(canvas, t_sub, x_left + 12, 140 - b_s)
    draw_sketchy_line(canvas, (x_left, 165), (x_right, 165), gc=gc, alpha_base=160, passes=2, seed=1603)

    # 2. Section I: Into the Subterranean Shadow
    cur_y = 210
    t_h1, b_h1 = render_pencil_text("I. Into the Subterranean Shadow", FONT_PATH, font_size=38, gc=gc, seed=1610)
    blit_rgba(canvas, t_h1, x_left + 10, cur_y - b_h1)
    cur_y += 46
    draw_sketchy_line(canvas, (x_left + 10, cur_y - 8), (x_left + 460, cur_y - 8), gc=gc, alpha_base=130, passes=1, seed=1611)

    p1 = ("Stepping down from the plateau into the floor of the Great Wash is like entering an immense stone cathedral. "
          "The sandstone bluffs rise sheer on either flank, shutting out the furnace wind and leaving only a cool, echoing dusk "
          "that smells of ancient mud and mineral salt. Water flowed here ten centuries ago; now only echoes remain.")
    for line in wrap_text(p1, FONT_PATH, body_fs, max_w - 20):
        t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=body_fs, gc=gc, seed=1615 + cur_y)
        blit_rgba(canvas, t_l, x_left + 15, cur_y - b_l)
        cur_y += line_sp

    # 3. Masterwork Drawing: Canyon Gorge & Cairn IV
    cur_y += 24
    diag_cy = cur_y + 300
    cx_mid = (x_left + x_right) // 2

    # Left & Right Sheer Canyon Walls framing the gorge
    cv2.line(canvas, (x_left + 80, diag_cy - 190), (x_left + 220, diag_cy + 190), (*gc, 195), 2, cv2.LINE_AA)
    cv2.line(canvas, (x_right - 80, diag_cy - 190), (x_right - 220, diag_cy + 190), (*gc, 195), 2, cv2.LINE_AA)
    draw_hatch_area(canvas, (x_left + 40, diag_cy - 190, 160, 380), angle_deg=75.0, spacing=8, gc=gc, alpha=85)
    draw_hatch_area(canvas, (x_right - 200, diag_cy - 190, 160, 380), angle_deg=105.0, spacing=8, gc=gc, alpha=85)

    # Acoustic wave reflection arcs rebounding off the walls
    for wave_r in range(70, 320, 48):
        cv2.ellipse(canvas, (cx_mid, diag_cy + 20), (wave_r, int(wave_r * 0.42)), 0, 180, 360, (*gc, 120), 1, cv2.LINE_AA)

    # Cairn IV at the choke point
    cairn_x = cx_mid
    cairn_y = diag_cy + 70
    pts_c4 = np.array([
        [cairn_x, cairn_y - 95],
        [cairn_x + 90, cairn_y + 60],
        [cairn_x - 90, cairn_y + 60]
    ], dtype=np.int32)
    cv2.polylines(canvas, [pts_c4], True, (*gc, 180), 2, cv2.LINE_AA)
    for sy in range(cairn_y - 70, cairn_y + 60, 20):
        w_s = int((sy - (cairn_y - 95)) * 0.7)
        cv2.line(canvas, (cairn_x - w_s, sy), (cairn_x + w_s, sy), (*gc, 140), 1, cv2.LINE_AA)

    # Cold campfire ring
    cv2.ellipse(canvas, (cairn_x + 130, cairn_y + 45), (42, 18), 0, 0, 360, (*gc, 160), 1, cv2.LINE_AA)
    t_c4_lbl, _ = render_pencil_text("CAIRN IV · SENTRY OF THE WASH", FONT_PATH, font_size=20, gc=gc, seed=1625)
    blit_rgba(canvas, t_c4_lbl, cairn_x - 130, cairn_y + 90)

    cur_y = diag_cy + 215

    # 4. Section II: The Sentry of the Canyon
    t_h2, b_h2 = render_pencil_text("II. The Sentry of the Canyon", FONT_PATH, font_size=38, gc=gc, seed=1630)
    blit_rgba(canvas, t_h2, x_left + 10, cur_y - b_h2)
    cur_y += 46
    draw_sketchy_line(canvas, (x_left + 10, cur_y - 8), (x_left + 440, cur_y - 8), gc=gc, alpha_base=130, passes=1, seed=1631)

    p2 = ("Guarding the choke point where the gorge narrows to fifty paces stands Cairn IV. Here the raiders rested "
          "their load; their campfire embers are cold, but their trail through the Terraces of the Jackal is unmistakable. "
          "They passed within touching distance of the sentinel stone, heading directly into the Whispering Chasm.")
    for line in wrap_text(p2, FONT_PATH, body_fs, max_w - 20):
        t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=body_fs, gc=gc, seed=1635 + cur_y)
        blit_rgba(canvas, t_l, x_left + 15, cur_y - b_l)
        cur_y += line_sp

    # 5. Section III: The Whispering Floor
    cur_y += 24
    t_h3, b_h3 = render_pencil_text("III. The Whispering Floor", FONT_PATH, font_size=38, gc=gc, seed=1640)
    blit_rgba(canvas, t_h3, x_left + 10, cur_y - b_h3)
    cur_y += 46
    draw_sketchy_line(canvas, (x_left + 10, cur_y - 8), (x_left + 400, cur_y - 8), gc=gc, alpha_base=130, passes=1, seed=1641)

    p3 = ("Listen closely to the canyon walls. The wind descending from the northern rim forms acoustic vortices, "
          "producing spoken words in the sandstone. Silvia, consult Sheet 14B carefully: only the Law of the Canyon Walkers "
          "and the six relic cairns M-I-R-A-G-E will guide Hermes through the labyrinth.")
    for line in wrap_text(p3, FONT_PATH, body_fs, max_w - 20):
        t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=body_fs, gc=gc, seed=1645 + cur_y)
        blit_rgba(canvas, t_l, x_left + 15, cur_y - b_l)
        cur_y += line_sp

    draw_sketchy_line(canvas, (x_left, 2370), (x_right, 2370), gc=gc, alpha_base=145, passes=2, seed=1699)
    return canvas


# -------------------------------------------------------------------------
# 7. SHEET 15 · CARA A: THE SALT PLAYA & VAULTS
# -------------------------------------------------------------------------

def render_sheet15_front_lore(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 15 · Cara A (Lore: The Salt Playa & Vaults) — Cara A: X >= 220."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    x_left, x_right = 220, 1580
    max_w = x_right - x_left
    body_fs, line_sp = 35, 52

    # 1. Header
    t_title, b_t = render_pencil_text("The Salt Playa & Vaults", FONT_PATH, font_size=64, gc=gc, seed=1701)
    blit_rgba(canvas, t_title, x_left + 10, 80 - b_t)
    t_sub, b_s = render_pencil_text("Hydraulics of the Ancient Engineers · The Sunken Oasis", FONT_PATH, font_size=28, gc=gc, seed=1702)
    blit_rgba(canvas, t_sub, x_left + 12, 140 - b_s)
    draw_sketchy_line(canvas, (x_left, 165), (x_right, 165), gc=gc, alpha_base=160, passes=2, seed=1703)

    # 2. Section I: The White Horizon
    cur_y = 210
    t_h1, b_h1 = render_pencil_text("I. The White Horizon", FONT_PATH, font_size=38, gc=gc, seed=1710)
    blit_rgba(canvas, t_h1, x_left + 10, cur_y - b_h1)
    cur_y += 46
    draw_sketchy_line(canvas, (x_left + 10, cur_y - 8), (x_left + 360, cur_y - 8), gc=gc, alpha_base=130, passes=1, seed=1711)

    p1 = ("Emerging from the canyon fractures, the desert opens into an expanse of blinding white salt. The heat "
          "creates shimmering mirages of vast lakes, yet beneath the crystalline crust lies a marvel of ancient "
          "hydraulic engineering: four subterranean cisterns carved directly from bedrock and fed by deep artesian springs.")
    for line in wrap_text(p1, FONT_PATH, body_fs, max_w - 20):
        t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=body_fs, gc=gc, seed=1715 + cur_y)
        blit_rgba(canvas, t_l, x_left + 15, cur_y - b_l)
        cur_y += line_sp

    # 3. Masterwork Hydraulic Siphons & Cisterns Diagram
    cur_y += 24
    diag_cy = cur_y + 300
    cx_mid = (x_left + x_right) // 2

    # Four Subterranean Cistern Vaults (Falcon, Jackal, Scarab, Serpent)
    guardians = [("Falcon", "AIR"), ("Jackal", "DUNES"), ("Scarab", "EARTH"), ("Serpent", "WATER")]
    cist_w = 230
    cist_h = 240
    cist_gap = 48
    start_x = cx_mid - int(2 * cist_w + 1.5 * cist_gap)

    for c_idx, (g_name, g_elem) in enumerate(guardians):
        c_x = start_x + c_idx * (cist_w + cist_gap)
        c_y = diag_cy - 70

        # Cistern stone chamber
        cv2.rectangle(canvas, (c_x, c_y), (c_x + cist_w, c_y + cist_h), (*gc, 180), 2, cv2.LINE_AA)
        # Vaulted arch ceiling
        cv2.ellipse(canvas, (c_x + cist_w // 2, c_y), (cist_w // 2, 35), 0, 180, 360, (*gc, 185), 2, cv2.LINE_AA)

        # Water level hatching
        water_h = 70 + c_idx * 30
        draw_hatch_area(canvas, (c_x + 4, c_y + cist_h - water_h, cist_w - 8, water_h - 4), angle_deg=0.0, spacing=6, gc=gc, alpha=90)

        # Inverted Siphon Pipe connecting chambers
        if c_idx < 3:
            pipe_x1 = c_x + cist_w
            pipe_x2 = pipe_x1 + cist_gap
            pipe_y = c_y + 80
            cv2.line(canvas, (pipe_x1, pipe_y), (pipe_x2, pipe_y), (*gc, 200), 3, cv2.LINE_AA)
            cv2.line(canvas, (pipe_x1, pipe_y + 12), (pipe_x2, pipe_y + 12), (*gc, 150), 1, cv2.LINE_AA)

        # Guardian Medallion circle
        cv2.circle(canvas, (c_x + cist_w // 2, c_y + 55), 30, (*gc, 190), 1, cv2.LINE_AA)
        cv2.circle(canvas, (c_x + cist_w // 2, c_y + 55), 24, (*gc, 130), 1, cv2.LINE_AA)
        t_g1, _ = render_pencil_text(g_name, FONT_PATH, font_size=20, gc=gc, seed=1720 + c_idx)
        blit_rgba(canvas, t_g1, c_x + 24, c_y + 44)
        t_g2, _ = render_pencil_text(f"[{g_elem}]", FONT_PATH, font_size=16, gc=gc, seed=1730 + c_idx)
        blit_rgba(canvas, t_g2, c_x + 32, c_y + cist_h + 10)

    t_diag_lbl, _ = render_pencil_text("THE FOUR BALANCED CISTERNS OF THE OASIS CLEPSYDRA", FONT_PATH, font_size=21, gc=gc, seed=1739)
    blit_rgba(canvas, t_diag_lbl, cx_mid - 250, diag_cy + 215)

    cur_y = diag_cy + 250

    # 4. Section II: The Four Guardian Siphons
    t_h2, b_h2 = render_pencil_text("II. The Four Guardian Siphons", FONT_PATH, font_size=38, gc=gc, seed=1740)
    blit_rgba(canvas, t_h2, x_left + 10, cur_y - b_h2)
    cur_y += 46
    draw_sketchy_line(canvas, (x_left + 10, cur_y - 8), (x_left + 460, cur_y - 8), gc=gc, alpha_base=130, passes=1, seed=1741)

    p2 = ("Each cistern is guarded by an animal totem: Falcon, Jackal, Scarab, and Serpent. Balanced by lead siphon "
          "tubes, they hold fresh mineral water. But the siphons only flow when the four seekers, arrival hours, and relics "
          "are matched in perfect harmony upon Sheet 15B. Key XXX releases thirty measures of life-giving water.")
    for line in wrap_text(p2, FONT_PATH, body_fs, max_w - 20):
        t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=body_fs, gc=gc, seed=1745 + cur_y)
        blit_rgba(canvas, t_l, x_left + 15, cur_y - b_l)
        cur_y += line_sp

    # 5. Section III: Replenishing the Expedition
    cur_y += 24
    t_h3, b_h3 = render_pencil_text("III. Replenishing the Expedition", FONT_PATH, font_size=38, gc=gc, seed=1750)
    blit_rgba(canvas, t_h3, x_left + 10, cur_y - b_h3)
    cur_y += 46
    draw_sketchy_line(canvas, (x_left + 10, cur_y - 8), (x_left + 460, cur_y - 8), gc=gc, alpha_base=130, passes=1, seed=1751)

    p3 = ("Before Hermes can cross the salt flats to the Sunken Sanctuary, all four water vessels must be filled. "
          "Inspect the logic matrix on Sheet 15B: solve the seekers' puzzle and enter Key XXX into the Clepsydra dial.")
    for line in wrap_text(p3, FONT_PATH, body_fs, max_w - 20):
        t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=body_fs, gc=gc, seed=1755 + cur_y)
        blit_rgba(canvas, t_l, x_left + 15, cur_y - b_l)
        cur_y += line_sp

    draw_sketchy_line(canvas, (x_left, 2370), (x_right, 2370), gc=gc, alpha_base=145, passes=2, seed=1799)
    return canvas


# -------------------------------------------------------------------------
# 8. SHEET 16 · CARA A: GAME D7 — GATES OF THE ORACLE (TOWER II)
# -------------------------------------------------------------------------

# -------------------------------------------------------------------------
# 8. SHEET 14 · CARA B: GAME D5 — THE WHISPERING CHASM MAZE
# -------------------------------------------------------------------------

def render_sheet14_back_d5(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 14 · Cara B (Game D5: The Whispering Chasm Maze) — Cara B: X <= 1480."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    x_left, x_right = 180, 1480

    # 1. Header (Cara B: right margin strictly safe at X <= 1480)
    t_title, b_t = render_pencil_text("The Whispering Chasm", FONT_PATH, font_size=64, gc=gc, seed=2101)
    blit_rgba(canvas, t_title, x_left + 10, 80 - b_t)
    t_sub, b_s = render_pencil_text("Game D5 · Topographical Canyon Labyrinth & The Six Relic Cairns", FONT_PATH, font_size=28, gc=gc, seed=2102)
    blit_rgba(canvas, t_sub, x_left + 12, 140 - b_s)
    draw_sketchy_line(canvas, (x_left, 165), (x_right, 165), gc=gc, alpha_base=160, passes=2, seed=2103)

    # 2. Renaissance Acoustic Vortex Vignette & Setting
    t_vign, _ = render_pencil_text("Vortex Acusticus in Muris Arenaceis · Leonardo da Vinci Study", FONT_PATH, font_size=18, gc=gc, seed=2105)
    blit_rgba(canvas, t_vign, x_left + 15, 182)

    # Acoustic wave arcs reflecting against sandstone strata (X=860..1440, Y=175..240)
    for wave_x in range(920, 1420, 75):
        cv2.ellipse(canvas, (wave_x, 212), (32, 14), 0, 0, 360, (*gc, 110), 1, cv2.LINE_AA)
        cv2.line(canvas, (wave_x - 30, 212), (wave_x + 30, 212), (*gc, 80), 1, cv2.LINE_AA)
    t_ac_note, _ = render_pencil_text("Sonus refractus per fissuras... vox calami in saxo", FONT_PATH, font_size=16, gc=gc, seed=2108)
    blit_rgba(canvas, t_ac_note, 1020, 226)

    # 3. Maze Generation (Intricate 25x25 Grid with 231-step winding path & cycle shortcuts)
    h_cells, w_cells = 25, 25
    maze = np.ones((h_cells, w_cells), dtype=int)
    rng = np.random.default_rng(252)

    stack = [(1, 1)]
    maze[1, 1] = 0
    while stack:
        cr, cc = stack[-1]
        neighbors = []
        for dr, dc in [(-2, 0), (2, 0), (0, -2), (0, 2)]:
            nr, nc = cr + dr, cc + dc
            if 0 < nr < h_cells - 1 and 0 < nc < w_cells - 1 and maze[nr, nc] == 1:
                neighbors.append((nr, nc, cr + dr // 2, cc + dc // 2))
        if neighbors:
            idx = rng.integers(len(neighbors))
            nr, nc, wr, wc = neighbors[idx]
            maze[wr, wc] = 0
            maze[nr, nc] = 0
            stack.append((nr, nc))
        else:
            stack.pop()

    # Open Entrance (1, 0) and Exit (23, 24)
    maze[1, 0] = 0
    maze[h_cells - 2, w_cells - 1] = 0

    # Strategic cycle & shortcut doors
    extra_doors = [
        (2, 1),    # Massive early shortcut (step 1 -> 147)
        (22, 23),  # Massive late shortcut to exit (step 91 -> 229)
        (10, 5),   # Mid-west cross loop
        (18, 9),   # Southern canyon loop
        (6, 17),   # East cross loop
        (14, 21),  # South-east canyon loop
    ]
    for r, c in extra_doors:
        maze[r, c] = 0

    # Maze drawing bounds (980x980 px, cell size 39.2 px)
    mx0, my0 = 265, 255
    mw, mh = 980, 980
    cell_w = mw / w_cells
    cell_h = mh / h_cells

    # Outer Labyrinth Frame with physical openings for Entrance and Exit
    draw_sketchy_line(canvas, (mx0 - 8, my0 - 8), (mx0 + mw + 8, my0 - 8), gc=gc, alpha_base=200, passes=2, seed=2200)
    draw_sketchy_line(canvas, (mx0 - 8, my0 + mh + 8), (mx0 + mw + 8, my0 + mh + 8), gc=gc, alpha_base=200, passes=2, seed=2201)

    # Left wall (with open portal at row 1)
    y_ent_top = int(round(my0 + cell_h * 1))
    y_ent_bot = int(round(my0 + cell_h * 2))
    draw_sketchy_line(canvas, (mx0 - 8, my0 - 8), (mx0 - 8, y_ent_top), gc=gc, alpha_base=200, passes=2, seed=2202)
    draw_sketchy_line(canvas, (mx0 - 8, y_ent_bot), (mx0 - 8, my0 + mh + 8), gc=gc, alpha_base=200, passes=2, seed=2203)
    draw_sketchy_line(canvas, (mx0 - 8, y_ent_top), (mx0, y_ent_top), gc=gc, alpha_base=180, passes=1, seed=2204)
    draw_sketchy_line(canvas, (mx0 - 8, y_ent_bot), (mx0, y_ent_bot), gc=gc, alpha_base=180, passes=1, seed=2205)

    # Right wall (with open exit at row 23)
    y_ext_top = int(round(my0 + cell_h * (h_cells - 2)))
    y_ext_bot = int(round(my0 + cell_h * (h_cells - 1)))
    draw_sketchy_line(canvas, (mx0 + mw + 8, my0 - 8), (mx0 + mw + 8, y_ext_top), gc=gc, alpha_base=200, passes=2, seed=2206)
    draw_sketchy_line(canvas, (mx0 + mw + 8, y_ext_bot), (mx0 + mw + 8, my0 + mh + 8), gc=gc, alpha_base=200, passes=2, seed=2207)
    draw_sketchy_line(canvas, (mx0 + mw, y_ext_top), (mx0 + mw + 8, y_ext_top), gc=gc, alpha_base=180, passes=1, seed=2208)
    draw_sketchy_line(canvas, (mx0 + mw, y_ext_bot), (mx0 + mw + 8, y_ext_bot), gc=gc, alpha_base=180, passes=1, seed=2209)

    # Render Canyon Walls with Topographical Hachures
    for r in range(h_cells):
        for c in range(w_cells):
            if maze[r, c] == 1:
                cx1 = int(round(mx0 + c * cell_w))
                cy1 = int(round(my0 + r * cell_h))
                cx2 = int(round(mx0 + (c + 1) * cell_w))
                cy2 = int(round(my0 + (r + 1) * cell_h))

                draw_sketchy_rect(canvas, (cx1, cy1, cx2, cy2), gc=gc, alpha_base=150, passes=1, seed=2300 + r * 30 + c)

                for hy in range(cy1 + 5, cy2 - 3, 10):
                    draw_sketchy_line(canvas, (cx1 + 4, hy), (cx2 - 4, hy), gc=gc, alpha_base=85, passes=1, seed=2400 + hy * 7 + c)

    # Entrance & Exit Banners
    t_ent, b_ent = render_pencil_text("North Portal ->", FONT_PATH, font_size=21, gc=gc, seed=2501)
    blit_rgba(canvas, t_ent, mx0 - t_ent.shape[1] - 14, int(my0 + cell_h * 1.5 - b_ent // 2))

    t_ext, b_ext = render_pencil_text("-> Sunken Oasis", FONT_PATH, font_size=21, gc=gc, seed=2502)
    blit_rgba(canvas, t_ext, mx0 + mw + 14, int(my0 + cell_h * (h_cells - 1.5) - b_ext // 2))

    # Inscribed Relic Cairns
    # 6 TRUE Cairns on the 231-step Master Path (M-I-R-A-G-E in traversal sequence)
    true_cairns = [
        ("M", (7, 9)),   # step 31
        ("I", (9, 23)),  # step 71
        ("R", (11, 13)), # step 111
        ("A", (7, 1)),   # step 151
        ("G", (15, 13)), # step 191
        ("E", (21, 15)), # step 215
    ]

    # 3 DECOY Cairns with false runes placed in seductive dead ends
    decoy_cairns = [
        ("T", (13, 5)),
        ("K", (19, 19)),
        ("S", (3, 17)),
    ]

    for idx, (letter, (cr, cc)) in enumerate(true_cairns + decoy_cairns, 1):
        center_x = int(round(mx0 + (cc + 0.5) * cell_w))
        center_y = int(round(my0 + (cr + 0.5) * cell_h))

        cv2.circle(canvas, (center_x, center_y), 13, (*gc, 210), 1, cv2.LINE_AA)
        cv2.circle(canvas, (center_x, center_y), 16, (*gc, 110), 1, cv2.LINE_AA)

        for a in range(0, 360, 45):
            rad = np.deg2rad(a)
            p1 = (int(round(center_x + 13 * np.cos(rad))), int(round(center_y + 13 * np.sin(rad))))
            p2 = (int(round(center_x + 17 * np.cos(rad))), int(round(center_y + 17 * np.sin(rad))))
            cv2.line(canvas, p1, p2, (*gc, 120), 1, cv2.LINE_AA)

        t_let, b_l = render_pencil_text(letter, FONT_PATH, font_size=18, gc=gc, seed=2600 + idx)
        blit_rgba(canvas, t_let, center_x - t_let.shape[1] // 2, center_y - t_let.shape[0] // 2)

    # Decoy Hazard Inscriptions at Real Dead Ends
    decoys = [
        ("Sands of Thirst", (13, 23)),
        ("Blind Chasm", (23, 1)),
        ("Salt Basin", (23, 11)),
        ("The Dry Well", (11, 1)),
    ]
    for d_txt, (dr, dc) in decoys:
        dx = int(round(mx0 + (dc + 0.5) * cell_w))
        dy = int(round(my0 + (dr + 0.5) * cell_h))
        t_d, _ = render_pencil_text(d_txt, FONT_PATH, font_size=11, gc=gc, seed=2700 + dr)
        blit_rgba(canvas, t_d, dx - t_d.shape[1] // 2, dy - t_d.shape[0] // 2)

    # 4. Instructions & Deduction Field (The Law of the Canyon Walkers)
    draw_sketchy_line(canvas, (x_left, 1285), (x_right, 1285), gc=gc, alpha_base=140, passes=2, seed=2801)

    t_lore1, b_l1 = render_pencil_text("The Law of the Canyon Walkers:", FONT_PATH, font_size=32, gc=gc, seed=2802)
    blit_rgba(canvas, t_lore1, x_left + 10, 1340 - b_l1)

    rules = [
        "1. Never retrace your steps: no corridor or junction may be trodden or crossed more than once.",
        "2. Beware the swift path: the shortest way to the Oasis is a deceitful lure that skips the relics.",
        "3. You must discover and collect all six sacred runes in strict sequence before reaching the Oasis.",
        "4. Ponder each turning with care; entering a blind gorge or missing a rune will doom your passage."
    ]
    cur_ry = 1385
    for r_idx, r_text in enumerate(rules):
        t_rule, b_r = render_pencil_text(r_text, FONT_PATH, font_size=26, gc=gc, seed=2810 + r_idx)
        blit_rgba(canvas, t_rule, x_left + 15, cur_ry - b_r)
        cur_ry += 46

    # 5. Answer Field (The Nomad's Passphrase)
    draw_sketchy_line(canvas, (x_left, 1595), (x_right, 1595), gc=gc, alpha_base=140, passes=2, seed=2901)

    t_pass_hdr, b_ph = render_pencil_text("The Nomad's Passphrase (The Six Relic Cairns):", FONT_PATH, font_size=32, gc=gc, seed=2902)
    blit_rgba(canvas, t_pass_hdr, x_left + 10, 1650 - b_ph)

    t_sub_p, b_sp = render_pencil_text("Inscribe the six sacred runes in strict order of discovery:", FONT_PATH, font_size=25, gc=gc, seed=2903)
    blit_rgba(canvas, t_sub_p, x_left + 15, 1700 - b_sp)

    # 6 Large Answer Boxes (MIRAGE) — Centered within [x_left, x_right]
    b_sz = 92
    b_h = 94
    b_gap = 36
    total_w = 6 * b_sz + 5 * b_gap
    b_x0 = (x_left + x_right - total_w) // 2
    b_y0 = 1750

    for i in range(6):
        bx = b_x0 + i * (b_sz + b_gap)
        draw_sketchy_rect(canvas, (bx, b_y0, bx + b_sz, b_y0 + b_h), gc=gc, alpha_base=180, passes=2, seed=2950 + i)
        t_idx, _ = render_pencil_text(str(i + 1), FONT_PATH, font_size=25, gc=gc, seed=2970 + i)
        blit_rgba(canvas, t_idx, bx + b_sz // 2 - t_idx.shape[1] // 2, b_y0 + b_h + 16)

    # Cartographer's note
    t_note_c, _ = render_pencil_text("✦ Verified across the Salt Flats to align the Ancient Hydraulic Siphons ✦", FONT_PATH, font_size=23, gc=gc, seed=2985)
    blit_rgba(canvas, t_note_c, (x_left + x_right - t_note_c.shape[1]) // 2, 1920)

    draw_sketchy_line(canvas, (x_left, 2370), (x_right, 2370), gc=gc, alpha_base=145, passes=2, seed=2999)
    return canvas


# -------------------------------------------------------------------------
# 9. SHEET 15 · CARA B: GAME D6 — THE OASIS CLEPSYDRA
# -------------------------------------------------------------------------

def render_sheet15_back_d6(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 15 · Cara B (Game D6: The Oasis Clepsydra & 4 Wells) — Cara B: X <= 1480."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    x_left, x_right = 180, 1480

    # 1. Header (Cara B: right margin strictly safe at X <= 1480)
    t_title, b_t = render_pencil_text("The Oasis Clepsydra", FONT_PATH, font_size=64, gc=gc, seed=3101)
    blit_rgba(canvas, t_title, x_left + 10, 80 - b_t)
    t_sub, b_s = render_pencil_text("Game D6 · Subterranean Water Clocks & The Four Seekers", FONT_PATH, font_size=28, gc=gc, seed=3102)
    blit_rgba(canvas, t_sub, x_left + 12, 140 - b_s)
    draw_sketchy_line(canvas, (x_left, 165), (x_right, 165), gc=gc, alpha_base=160, passes=2, seed=3103)

    # 2. Renaissance Da Vinci Hydraulic Study Vignette
    # Water vessel, float rack with escapement gear, and balanced siphon schematic
    clep_x, clep_y = x_left + 40, 185
    # Cylindrical bronze tank
    cv2.rectangle(canvas, (clep_x, clep_y), (clep_x + 95, clep_y + 115), (*gc, 185), 2, cv2.LINE_AA)
    # Water surface hatching
    draw_hatch_area(canvas, (clep_x + 4, clep_y + 45, 87, 65), angle_deg=0.0, spacing=6, gc=gc, alpha=85)
    # Float and vertical toothed rack
    cv2.ellipse(canvas, (clep_x + 47, clep_y + 45), (32, 12), 0, 0, 360, (*gc, 200), 1, cv2.LINE_AA)
    cv2.line(canvas, (clep_x + 47, clep_y + 45), (clep_x + 47, clep_y - 15), (*gc, 210), 2, cv2.LINE_AA)
    # Toothed gear engaged with rack
    cv2.circle(canvas, (clep_x + 65, clep_y - 12), 16, (*gc, 190), 1, cv2.LINE_AA)
    for ga in range(0, 360, 45):
        grad = np.deg2rad(ga)
        gpx = int(round(clep_x + 65 + 16 * np.cos(grad)))
        gpy = int(round(clep_y - 12 + 16 * np.sin(grad)))
        cv2.line(canvas, (clep_x + 65, clep_y - 12), (gpx, gpy), (*gc, 150), 1, cv2.LINE_AA)
    # Balanced siphon tube discharging water
    cv2.line(canvas, (clep_x + 85, clep_y + 35), (clep_x + 125, clep_y + 35), (*gc, 180), 2, cv2.LINE_AA)
    cv2.line(canvas, (clep_x + 125, clep_y + 35), (clep_x + 125, clep_y + 105), (*gc, 180), 2, cv2.LINE_AA)
    for drop_y in range(clep_y + 115, clep_y + 140, 10):
        cv2.circle(canvas, (clep_x + 125, drop_y), 2, (*gc, 190), -1)

    t_clep_lbl, _ = render_pencil_text("Clepsydra Siphonis · Leonardo da Vinci", FONT_PATH, font_size=18, gc=gc, seed=3110)
    blit_rgba(canvas, t_clep_lbl, clep_x + 150, 190)
    t_clep_sub, _ = render_pencil_text("Motus aquae aequabilis per siphonem... scala horarum sub aqua.", FONT_PATH, font_size=16, gc=gc, seed=3112)
    blit_rgba(canvas, t_clep_sub, clep_x + 150, 220)

    # Narrative intro
    p_intro = ("Four ancient cisterns sustain the Sunken Oasis, each calibrated to an artesian water clock. "
               "Four seekers arrived from the dunes bearing sacred instruments. Correlate their testimonies to "
               "deduce who came to each well and at what hour.")
    for l_idx, line in enumerate(wrap_text(p_intro, FONT_PATH, 24, x_right - clep_x - 150)):
        t_pi, _ = render_pencil_text(line, FONT_PATH, font_size=24, gc=gc, seed=3115 + l_idx)
        blit_rgba(canvas, t_pi, clep_x + 150, 255 + l_idx * 32)

    # 3. Grand Full-Width Logic Deduction Matrix (180..1440, 350..670)
    seekers = ["Cartographer", "Alchemist", "Nomad", "Astronomer"]
    wells = ["Falcon", "Jackal", "Scarab", "Serpent"]
    hours = ["Hr III", "Hr VI", "Hr IX", "Hr XII"]
    relics = ["Astrolabe", "Scarab", "Sandglass", "Dagger"]

    grid_x0 = x_left
    grid_y0 = 430
    label_w = 250
    c_w = 84
    c_h = 68

    # Category Super-Headers
    sup_hdr = [
        ("WELLS", grid_x0 + label_w, grid_x0 + label_w + 4 * c_w),
        ("ARRIVAL HOURS", grid_x0 + label_w + 4 * c_w, grid_x0 + label_w + 8 * c_w),
        ("SACRED RELICS", grid_x0 + label_w + 8 * c_w, grid_x0 + label_w + 12 * c_w),
    ]
    for cat_name, x_start, x_end in sup_hdr:
        t_cat, _ = render_pencil_text(cat_name, FONT_PATH, font_size=20, gc=gc, seed=3250 + x_start)
        cx_mid = (x_start + x_end) // 2
        blit_rgba(canvas, t_cat, cx_mid - t_cat.shape[1] // 2, grid_y0 - 65)
        draw_sketchy_line(canvas, (x_start + 10, grid_y0 - 42), (x_end - 10, grid_y0 - 42), gc=gc, alpha_base=130, passes=1, seed=3260 + x_start)

    # Column Sub-Headers (Wells)
    for j, w_name in enumerate(wells):
        t_w, _ = render_pencil_text(w_name, FONT_PATH, font_size=19, gc=gc, seed=3300 + j)
        blit_rgba(canvas, t_w, grid_x0 + label_w + j * c_w + (c_w - t_w.shape[1]) // 2, grid_y0 - 32)

    # Column Sub-Headers (Hours)
    for j, h_name in enumerate(hours):
        t_h, _ = render_pencil_text(h_name, FONT_PATH, font_size=19, gc=gc, seed=3310 + j)
        blit_rgba(canvas, t_h, grid_x0 + label_w + (4 + j) * c_w + (c_w - t_h.shape[1]) // 2, grid_y0 - 32)

    # Column Sub-Headers (Relics)
    for j, r_name in enumerate(relics):
        t_r, _ = render_pencil_text(r_name, FONT_PATH, font_size=18, gc=gc, seed=3320 + j)
        blit_rgba(canvas, t_r, grid_x0 + label_w + (8 + j) * c_w + (c_w - t_r.shape[1]) // 2, grid_y0 - 32)

    # Row headers & horizontal lines
    for i, s_name in enumerate(seekers):
        ry = grid_y0 + i * c_h
        t_s, _ = render_pencil_text(f"The {s_name}", FONT_PATH, font_size=25, gc=gc, seed=3330 + i)
        blit_rgba(canvas, t_s, grid_x0 + 12, ry + (c_h - t_s.shape[0]) // 2)

        draw_sketchy_line(canvas, (grid_x0, ry), (grid_x0 + label_w + 12 * c_w, ry), gc=gc, alpha_base=140, passes=1, seed=3350 + i)

    # Top & bottom border lines of grid
    draw_sketchy_line(canvas, (grid_x0, grid_y0), (grid_x0 + label_w + 12 * c_w, grid_y0), gc=gc, alpha_base=200, passes=2, seed=3358)
    draw_sketchy_line(canvas, (grid_x0, grid_y0 + 4 * c_h), (grid_x0 + label_w + 12 * c_w, grid_y0 + 4 * c_h), gc=gc, alpha_base=200, passes=2, seed=3360)

    # Vertical column lines
    draw_sketchy_line(canvas, (grid_x0, grid_y0), (grid_x0, grid_y0 + 4 * c_h), gc=gc, alpha_base=190, passes=2, seed=3365)
    draw_sketchy_line(canvas, (grid_x0 + label_w, grid_y0 - 38), (grid_x0 + label_w, grid_y0 + 4 * c_h), gc=gc, alpha_base=220, passes=2, seed=3370)

    for col in range(1, 13):
        cx = grid_x0 + label_w + col * c_w
        is_major = col in [4, 8, 12]
        thickness = 2 if is_major else 1
        alpha = 220 if is_major else 115
        top_y = grid_y0 - 65 if is_major else grid_y0 - 38
        cv2.line(canvas, (cx, top_y), (cx, grid_y0 + 4 * c_h), (*gc, alpha), thickness, cv2.LINE_AA)

    # 4. Deduction Clues (The Five Testimonies of the Shadow Index)
    draw_sketchy_line(canvas, (x_left, 745), (x_right, 745), gc=gc, alpha_base=140, passes=1, seed=3400)

    t_clue_hdr, b_ch = render_pencil_text("The Five Testimonies of the Shadow Index:", FONT_PATH, font_size=31, gc=gc, seed=3401)
    blit_rgba(canvas, t_clue_hdr, x_left + 10, 795 - b_ch)

    clues = [
        ("I.", "The traveler bearing the Brass Astrolabe arrived at their well exactly three shadow-hours", "before the arrival of the Nomad."),
        ("II.", "The seeker at the Well of the Jackal arrived earlier in the day than The Cartographer,", "but was never seen in possession of the Obsidian Dagger."),
        ("III.", "The arrival at the Well of the Falcon occurred strictly later than that at the Well of the Scarab,", "though neither of these two arrivals took place at Hour XII."),
        ("IV.", "The Astronomer carried the Gold Scarab and reached the Well of the Serpent,", "yet their camel was not unburdened until the ninth shadow-hour or later."),
        ("V.", "The Alchemist possessed the Silver Sandglass, and quenched their thirst at an earlier hour", "than the seeker who carried the Brass Astrolabe.")
    ]

    for i, (num, l1, l2) in enumerate(clues):
        y_top = 850 + i * 98
        t_n, b_n = render_pencil_text(num, FONT_PATH, font_size=25, gc=gc, seed=3410 + i * 3)
        blit_rgba(canvas, t_n, x_left + 12, y_top - b_n)

        t_l1, b_l1 = render_pencil_text(l1, FONT_PATH, font_size=23, gc=gc, seed=3420 + i * 3)
        blit_rgba(canvas, t_l1, x_left + 65, y_top - b_l1)
        t_l2, b_l2 = render_pencil_text(l2, FONT_PATH, font_size=23, gc=gc, seed=3421 + i * 3)
        blit_rgba(canvas, t_l2, x_left + 65, y_top + 30 - b_l2)

    # 5. Answer Ledger (The Oasis Registry)
    draw_sketchy_line(canvas, (x_left, 1375), (x_right, 1375), gc=gc, alpha_base=140, passes=1, seed=3500)

    t_led_hdr, b_lh = render_pencil_text("The Oasis Registry (Transcribe the Verified Seekers):", FONT_PATH, font_size=31, gc=gc, seed=3501)
    blit_rgba(canvas, t_led_hdr, x_left + 10, 1425 - b_lh)

    profiles = [
        "1.  The Cartographer :  Relic [ ______________ ]   |   Well [ ______________ ]   |   Arrival [ _________ ]",
        "2.  The Alchemist    :  Relic [ ______________ ]   |   Well [ ______________ ]   |   Arrival [ _________ ]",
        "3.  The Nomad        :  Relic [ ______________ ]   |   Well [ ______________ ]   |   Arrival [ _________ ]",
        "4.  The Astronomer   :  Relic [ ______________ ]   |   Well [ ______________ ]   |   Arrival [ _________ ]",
    ]

    for i, p_txt in enumerate(profiles):
        y_pos = 1495 + i * 85
        t_p, b_p = render_pencil_text(p_txt, FONT_PATH, font_size=24, gc=gc, seed=3510 + i)
        blit_rgba(canvas, t_p, x_left + 15, y_pos - b_p)

    # 6. Clepsydra Constant & Hydraulic Water Key
    draw_sketchy_line(canvas, (x_left, 1870), (x_right, 1870), gc=gc, alpha_base=140, passes=1, seed=3600)

    t_vhdr, b_vh = render_pencil_text("The Clepsydra Constant (The Water Key):", FONT_PATH, font_size=31, gc=gc, seed=3601)
    blit_rgba(canvas, t_vhdr, x_left + 10, 1920 - b_vh)

    t_vtxt, _ = render_pencil_text("Sum the four arrival hours deduced above. Inscribe their total in Roman numerals to set the siphon dial:", FONT_PATH, font_size=23, gc=gc, seed=3602)
    blit_rgba(canvas, t_vtxt, x_left + 15, 1945)

    # Formula row
    t_vsum, b_vs = render_pencil_text("Sum of Arrival Hours = [ __________________ ] (in Roman Numerals) = [ _______ ] Hours.", FONT_PATH, font_size=24, gc=gc, seed=3603)
    blit_rgba(canvas, t_vsum, x_left + 25, 2030 - b_vs)

    # 3 Roman Numeral Answer Boxes for KEY XXX
    k_sz = 86
    k_h = 88
    k_gap = 28
    k_tot = 3 * k_sz + 2 * k_gap
    k_x0 = (x_left + x_right - k_tot) // 2
    k_y0 = 2075

    t_klbl, _ = render_pencil_text("WATER CIPHER KEY (ROMAN):", FONT_PATH, font_size=22, gc=gc, seed=3610)
    blit_rgba(canvas, t_klbl, k_x0 - t_klbl.shape[1] - 30, k_y0 + 30)

    for ki in range(3):
        kx = k_x0 + ki * (k_sz + k_gap)
        draw_sketchy_rect(canvas, (kx, k_y0, kx + k_sz, k_y0 + k_h), gc=gc, alpha_base=180, passes=2, seed=3620 + ki)

    t_c_note, _ = render_pencil_text("✦ Key II of the Sunken Oracle Portal · Unlocks Dial II on Sheet 16A ✦", FONT_PATH, font_size=22, gc=gc, seed=3630)
    blit_rgba(canvas, t_c_note, (x_left + x_right - t_c_note.shape[1]) // 2, 2225)

    draw_sketchy_line(canvas, (x_left, 2370), (x_right, 2370), gc=gc, alpha_base=145, passes=2, seed=3699)
    return canvas


# -------------------------------------------------------------------------
# 10. SHEET 16 · CARA A: GAME D7 — GATES OF THE ORACLE (TOWER II)
# -------------------------------------------------------------------------

def render_sheet16_front_oracle(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 16 · Cara A (Game D7: Gates of the Oracle · Tower II) — Cara A: X >= 220."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    x_left, x_right = 220, 1580
    max_w = x_right - x_left

    # 1. Header (Cara A: left margin strictly safe at X >= 220)
    t_title, b_t = render_pencil_text("Gates of the Oracle", FONT_PATH, font_size=64, gc=gc, seed=4801)
    blit_rgba(canvas, t_title, x_left + 10, 80 - b_t)
    t_sub, b_s = render_pencil_text("Game D7 · Threshold of Tower II & Triangulation of the Three Towers", FONT_PATH, font_size=28, gc=gc, seed=4802)
    blit_rgba(canvas, t_sub, x_left + 12, 140 - b_s)
    draw_sketchy_line(canvas, (x_left, 165), (x_right, 165), gc=gc, alpha_base=160, passes=2, seed=4803)

    # 2. Section I: Expedition Objective
    cur_y = 210
    t_h1, b_h1 = render_pencil_text("I. The Final Threshold", FONT_PATH, font_size=38, gc=gc, seed=4810)
    blit_rgba(canvas, t_h1, x_left + 10, cur_y - b_h1)
    cur_y += 46
    draw_sketchy_line(canvas, (x_left + 10, cur_y - 8), (x_left + 420, cur_y - 8), gc=gc, alpha_base=130, passes=1, seed=4811)

    obj = ("Unseal the great bronze and sandstone portal of Tower II, the Sunken Sanctuary of the Desert Oracle. "
           "Insert the three master keys deduced from the desert journey to align the ancient gears and awaken the Hermit.")
    for line in wrap_text(obj, FONT_PATH, 35, max_w - 20):
        t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=35, gc=gc, seed=4815 + cur_y)
        blit_rgba(canvas, t_l, x_left + 15, cur_y - b_l)
        cur_y += 50

    # 3. Masterwork Drawing: The Monumental Portal & Three Towers Triangulation
    cur_y += 20
    diag_cy = cur_y + 360

    # Architectural Portal Elevation (Left Side)
    portal_w = 680
    portal_h = 520
    portal_x0 = x_left + 30
    portal_y0 = diag_cy - 240

    # Sandstone outer frame
    cv2.rectangle(canvas, (portal_x0, portal_y0), (portal_x0 + portal_w, portal_y0 + portal_h), (*gc, 200), 3, cv2.LINE_AA)
    # Fluted columns
    cv2.rectangle(canvas, (portal_x0 + 10, portal_y0 + 20), (portal_x0 + 60, portal_y0 + portal_h), (*gc, 160), 1, cv2.LINE_AA)
    cv2.rectangle(canvas, (portal_x0 + portal_w - 60, portal_y0 + 20), (portal_x0 + portal_w - 10, portal_y0 + portal_h), (*gc, 160), 1, cv2.LINE_AA)

    # Arched portal vault
    cv2.ellipse(canvas, (portal_x0 + portal_w // 2, portal_y0 + 140), (portal_w // 2 - 80, 110), 0, 180, 360, (*gc, 210), 2, cv2.LINE_AA)

    # Three Master Key Dials (Mechanical concentric rings for key insertion)
    dials = [
        (portal_x0 + 190, portal_y0 + 260, "I", "DIAL I: SIGIL RING"),
        (portal_x0 + portal_w // 2, portal_y0 + 210, "II", "DIAL II: WATER KEY"),
        (portal_x0 + portal_w - 190, portal_y0 + 260, "III", "DIAL III: BEARING RING")
    ]
    for dx, dy, num, lbl in dials:
        cv2.circle(canvas, (dx, dy), 52, (*gc, 190), 2, cv2.LINE_AA)
        cv2.circle(canvas, (dx, dy), 42, (*gc, 130), 1, cv2.LINE_AA)
        cv2.circle(canvas, (dx, dy), 8, (*gc, 220), -1)
        # Dial notches
        for na in range(0, 360, 30):
            nrad = np.deg2rad(na)
            nx1 = int(round(dx + 42 * np.cos(nrad)))
            ny1 = int(round(dy + 42 * np.sin(nrad)))
            nx2 = int(round(dx + 52 * np.cos(nrad)))
            ny2 = int(round(dy + 52 * np.sin(nrad)))
            cv2.line(canvas, (nx1, ny1), (nx2, ny2), (*gc, 150), 1, cv2.LINE_AA)

        t_num, _ = render_pencil_text(num, FONT_PATH, font_size=26, gc=gc, seed=4820 + ord(num[0]))
        blit_rgba(canvas, t_num, dx - 8, dy - 18)
        t_lbl, _ = render_pencil_text(lbl, FONT_PATH, font_size=17, gc=gc, seed=4825 + ord(num[0]))
        blit_rgba(canvas, t_lbl, dx - 85, dy + 62)

    # Right Side: Triangulation Map of the Three Ancient Towers
    tri_cx = x_left + 1040
    tri_cy = diag_cy - 30
    tri_r = 230

    cv2.circle(canvas, (tri_cx, tri_cy), tri_r, (*gc, 165), 1, cv2.LINE_AA)
    cv2.circle(canvas, (tri_cx, tri_cy), tri_r - 12, (*gc, 110), 1, cv2.LINE_AA)

    # 3 Towers positions
    t1 = (tri_cx, tri_cy - 160)               # Tower I: Observatory
    t2 = (tri_cx - 150, tri_cy + 120)          # Tower II: Desert Oracle
    t3 = (tri_cx + 150, tri_cy + 120)          # Tower III: Coastal Stage

    draw_sketchy_line(canvas, t1, t2, gc=gc, alpha_base=190, passes=2, seed=4830)
    draw_sketchy_line(canvas, t2, t3, gc=gc, alpha_base=190, passes=2, seed=4831)
    draw_sketchy_line(canvas, t3, t1, gc=gc, alpha_base=190, passes=2, seed=4832)

    towers = [
        (t1, "TOWER I · OBSERVATORY"),
        (t2, "TOWER II · DESERT ORACLE"),
        (t3, "TOWER III · COASTAL STAGE")
    ]
    for (tx, ty), tname in towers:
        cv2.circle(canvas, (tx, ty), 10, (*gc, 220), -1)
        cv2.circle(canvas, (tx, ty), 18, (*gc, 190), 2, cv2.LINE_AA)
        t_nm, _ = render_pencil_text(tname, FONT_PATH, font_size=19, gc=gc, seed=4840 + tx)
        blit_rgba(canvas, t_nm, tx - 110, ty + (22 if ty > tri_cy else -36))

    # Center intersection point (The Secret 4th Convergence Point)
    c_pt = (tri_cx, tri_cy + 25)
    cv2.circle(canvas, c_pt, 7, (*gc, 240), -1)
    draw_sketchy_line(canvas, t1, c_pt, gc=gc, alpha_base=150, passes=1, seed=4850)
    draw_sketchy_line(canvas, t2, c_pt, gc=gc, alpha_base=150, passes=1, seed=4851)
    draw_sketchy_line(canvas, t3, c_pt, gc=gc, alpha_base=150, passes=1, seed=4852)
    t_conv, _ = render_pencil_text("✦ THE 4TH CONVERGENCE POINT", FONT_PATH, font_size=19, gc=gc, seed=4855)
    blit_rgba(canvas, t_conv, c_pt[0] - 130, c_pt[1] + 16)

    cur_y = diag_cy + 265

    # 4. Section II: Activation Verification Ledger (Spoiler-Free for Silvia to solve)
    t_h2, b_h2 = render_pencil_text("II. Portal Key Insertion Ledger", FONT_PATH, font_size=38, gc=gc, seed=4860)
    blit_rgba(canvas, t_h2, x_left + 10, cur_y - b_h2)
    cur_y += 46
    draw_sketchy_line(canvas, (x_left + 10, cur_y - 8), (x_left + 500, cur_y - 8), gc=gc, alpha_base=130, passes=1, seed=4861)

    key_prompts = [
        ("Dial I (Desert Sigil)", "The 7-letter sacred keyword discovered across the Northern sands (Game D2 & Cairn III):", "Insert Sigil I: [ __________________________________ ]"),
        ("Dial II (Hydraulic Key)", "The total arrival hours of the Four Seekers in Roman numerals (Game D6):", "Insert Key II:  [ __________________________________ ]"),
        ("Dial III (Geodetic Vector)", "The true azimuth bearing vector triangulated from the Sun Monolith (Game D4):", "Insert Vector III: [ __________________________________ ]")
    ]
    for kp_name, kp_desc, kp_field in key_prompts:
        t_pn, _ = render_pencil_text(f"✦  {kp_name}: {kp_desc}", FONT_PATH, font_size=25, gc=gc, seed=4870 + cur_y)
        blit_rgba(canvas, t_pn, x_left + 15, cur_y)
        cur_y += 34
        t_pf, _ = render_pencil_text(f"     {kp_field}", FONT_PATH, font_size=26, gc=gc, seed=4875 + cur_y)
        blit_rgba(canvas, t_pf, x_left + 15, cur_y)
        cur_y += 48

    # Final Activation Verification Box (Empty fields for Silvia to transcribe)
    cur_y += 10
    cv2.rectangle(canvas, (x_left + 15, cur_y), (x_right - 15, cur_y + 115), (*gc, 180), 2, cv2.LINE_AA)
    t_fin1, _ = render_pencil_text("KEYS ALIGNED: Dial I: [ ____________ ]  ·  Dial II: [ ________ ]  ·  Dial III: [ ________ ]", FONT_PATH, font_size=28, gc=gc, seed=4880)
    blit_rgba(canvas, t_fin1, x_left + 35, cur_y + 24)
    t_fin2, _ = render_pencil_text("STATUS: WHEN THREE MASTER KEYS ALIGN ➔ TOWER II SANCTUARY UNSEALED ✦", FONT_PATH, font_size=25, gc=gc, seed=4881)
    blit_rgba(canvas, t_fin2, x_left + 35, cur_y + 70)

    draw_sketchy_line(canvas, (x_left, 2370), (x_right, 2370), gc=gc, alpha_base=145, passes=2, seed=4899)
    return canvas

