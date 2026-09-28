#!/usr/bin/env python3
"""
build_page04_05.py
==================
Production builder for Journal Sheets 4 & 5 (Pages 6 to 9 — The Astrolabe Codex).
Silvia's 23rd Birthday Treasure Hunt.

Structure:
- Hoja 4 · Cara A (Page 6, holes on LEFT: X < 165 px):
    * The Astrolabe of Distant Light — Ancient lore, celestial geometry & armillary sphere.
    * The Suspension Throne (Armilla) with plumb bob & Three Rules of the Outer Dial.
    * Astronomical epoch table & solstitial declination curve.
- Hoja 4 · Cara B (Page 7, holes on RIGHT: X > 1583 px):
    * Anatomy of the Artifact — Leonardo da Vinci exploded technical dissection.
    * Detailed Mater (limbus & kursi), Tympan (almucantars), Rete (zodiac & guide stars),
      Alidade (sighting vanes), and Horse Wedge (al-faras).
    * Synchronized left descriptions and right callouts + cross-section assembly cutaway.
- Hoja 5 · Cara A (Page 8, holes on LEFT: X < 165 px):
    * The Midnight Calibration — Grand nocturnal planisphere with constellations & Milky Way.
    * Four-step field calibration procedure with sketch icons.
    * Expanded 6-row observation log for Silvia with comfortable writing slots.
    * Spherical trigonometry zenith angle diagram.
- Hoja 5 · Cara B (Page 9, holes on RIGHT: X > 1583 px):
    * Field Log: The Desert Frontier — Young Cartographer's personal 1998 expedition journal (28 years before the Call).
    * Brass 90° Surveyor's Altitude Quadrant with 30° plumb line & Geodetic Triangulation Study.
    * Da Vinci style Desert Canyon Panorama with geological strata, circumpolar trails, Watchtower VI, and Three Cairns.
    * Dual Canonical Path Seals (The Constellation Path & The Desert Path: Sky to Sand) and signature 'The Cartographer'.

Typography:
- Large, comfortably readable cursive handwriting at 300 DPI (A5 format).
- Page titles: 60–66 px (~15–16 pt).
- Subtitles: 42–46 px (~11–12 pt).
- Body text: 35–38 px (~9–10 pt).
- Labels and notes: 30–34 px (~7.5–8.5 pt).
- Absolute zero collisions between lines and text baselines.
"""

import os
import sys
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from scripts.journal.geometry import mm_to_px, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX
from scripts.journal.pdf_builder import PDFBuilder


GRAPHITE_COLOR = (46, 42, 38)
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FONT_PATH = os.path.join(PROJECT_ROOT, 'assets', 'fonts', 'MarckScript.ttf')


def blit_rgba(target: np.ndarray, src: np.ndarray, x: int, y: int) -> None:
    """Safely blits an RGBA image onto target canvas with alpha blending."""
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


def draw_sketchy_line(
    canvas: np.ndarray,
    p1: tuple,
    p2: tuple,
    gc: tuple = GRAPHITE_COLOR,
    alpha_base: int = 180,
    passes: int = 2,
    seed: int = 42
) -> None:
    """Draws a subtle, multi-pass hand-drawn pencil line with organic tremor."""
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


def render_pencil_text(
    text: str,
    font_path: str = FONT_PATH,
    font_size: int = 40,
    gc: tuple = GRAPHITE_COLOR,
    seed: int = 42
) -> tuple:
    """Renders text in 2B pencil cursive texture."""
    if not text:
        return None, 0
    scale = 3
    font = ImageFont.truetype(font_path, int(font_size * scale))
    dummy = Image.new('RGBA', (10, 10))
    d_dummy = ImageDraw.Draw(dummy)
    bbox = d_dummy.textbbox((0, 0), text, font=font)
    w_tot = bbox[2] + 40 * scale
    h_tot = int(font_size * 2.8 * scale)
    img = Image.new('RGBA', (w_tot, h_tot), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    base_y = int(font_size * 1.9 * scale)
    d.text((10 * scale, base_y), text, font=font, anchor='ls', fill=(255, 255, 255, 255))

    arr = np.array(img)
    alpha = arr[:, :, 3].astype(float)
    np.random.seed(seed)
    grain = np.random.normal(0, 10, alpha.shape)
    textured = np.where(alpha > 10, np.clip(alpha * 0.90 + grain, 35, 240), alpha).astype(np.uint8)
    res_alpha = cv2.resize(textured, (arr.shape[1] // scale, arr.shape[0] // scale), interpolation=cv2.INTER_AREA)

    res = np.zeros((res_alpha.shape[0], res_alpha.shape[1], 4), dtype=np.uint8)
    for c in range(3):
        res[:, :, c] = gc[c]
    res[:, :, 3] = res_alpha
    return res, base_y // scale


def render_pencil_text_diagonal(
    text: str,
    font_path: str = FONT_PATH,
    font_size: int = 30,
    angle_deg: float = 0.0,
    gc: tuple = GRAPHITE_COLOR,
    seed: int = 42
) -> np.ndarray:
    """Renders text rotated diagonally with pencil grain."""
    img, _ = render_pencil_text(text, font_path, font_size, gc, seed)
    if img is None:
        return None
    if abs(angle_deg) < 0.1:
        return img
    pil_img = Image.fromarray(img)
    rotated = pil_img.rotate(angle_deg, resample=Image.BICUBIC, expand=True)
    return np.array(rotated)


def create_handdrawn_divider(width: int, gc: tuple = GRAPHITE_COLOR, seed: int = 42) -> np.ndarray:
    """Creates an elegant hand-drawn horizontal rule with central diamond ornament."""
    h = 36
    div_img = np.zeros((h, width, 4), dtype=np.uint8)
    mid_y = h // 2
    cx = width // 2

    draw_sketchy_line(div_img, (0, mid_y), (cx - 36, mid_y), gc, alpha_base=180, passes=2, seed=seed)
    draw_sketchy_line(div_img, (cx + 36, mid_y), (width, mid_y), gc, alpha_base=180, passes=2, seed=seed + 1)

    pts_diamond = np.array([
        [cx, mid_y - 7],
        [cx + 14, mid_y],
        [cx, mid_y + 7],
        [cx - 14, mid_y]
    ], np.int32)
    cv2.fillPoly(div_img, [pts_diamond], (*gc, 205))
    cv2.polylines(div_img, [pts_diamond], True, (*gc, 235), 1, cv2.LINE_AA)

    cv2.circle(div_img, (cx - 26, mid_y), 3, (*gc, 180), -1)
    cv2.circle(div_img, (cx + 26, mid_y), 3, (*gc, 180), -1)
    return div_img


# -------------------------------------------------------------------------
# FACE 4A: THE ASTROLABE OF DISTANT LIGHT (LORE & CELESTIAL PROJECTION)
# -------------------------------------------------------------------------

def draw_armillary_sphere(canvas: np.ndarray, cx: int, cy: int, r: int, gc: tuple = GRAPHITE_COLOR, seed: int = 401) -> None:
    """
    Renders a rich, Renaissance-style armillary sphere / stereographic projection
    with graduated meridian ring, celestial equator, solstitial colure, and sighting ray.
    """
    np.random.seed(seed)

    # 1. Outer Solstitial Colure & Horizon Ring
    cv2.circle(canvas, (cx, cy), r, (*gc, 185), 2, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), r - 12, (*gc, 120), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), r - 22, (*gc, 95), 1, cv2.LINE_AA)

    # Outer degree ticks (every 5° and 15°)
    for deg in range(0, 360, 5):
        rad = np.deg2rad(deg)
        l_tick = 12 if deg % 15 == 0 else 6
        x1 = int(round(cx + r * np.cos(rad)))
        y1 = int(round(cy + r * np.sin(rad)))
        x2 = int(round(cx + (r - l_tick) * np.cos(rad)))
        y2 = int(round(cy - (r - l_tick) * np.sin(rad)))
        cv2.line(canvas, (x1, y1), (x2, y2), (*gc, 140 if deg % 15 == 0 else 90), 1, cv2.LINE_AA)

    # 2. Celestial Equator (oblique ellipse)
    cv2.ellipse(canvas, (cx, cy), (r - 24, int((r - 24) * 0.46)), -22, 0, 360, (*gc, 175), 1, cv2.LINE_AA)
    cv2.ellipse(canvas, (cx, cy), (r - 30, int((r - 30) * 0.46)), -22, 0, 360, (*gc, 105), 1, cv2.LINE_AA)

    # 3. Ecliptic Band (tilted 23.5 degrees)
    cv2.ellipse(canvas, (cx, cy), (r - 24, int((r - 24) * 0.62)), 24, 0, 360, (*gc, 190), 2, cv2.LINE_AA)
    cv2.ellipse(canvas, (cx, cy), (r - 38, int((r - 38) * 0.62)), 24, 0, 360, (*gc, 125), 1, cv2.LINE_AA)

    # Zodiac hatching along the ecliptic band
    for d in range(0, 360, 30):
        drad = np.deg2rad(d)
        dx1 = int(round(cx + (r - 24) * np.cos(drad)))
        dy1 = int(round(cy + int((r - 24) * 0.62) * np.sin(drad)))
        dx2 = int(round(cx + (r - 38) * np.cos(drad)))
        dy2 = int(round(cy + int((r - 38) * 0.62) * np.sin(drad)))
        cv2.line(canvas, (dx1, dy1), (dx2, dy2), (*gc, 140), 1, cv2.LINE_AA)

    # 4. Polar Axis and Center Pivot
    axis_rad = np.deg2rad(68)
    ax1 = int(round(cx - (r + 18) * np.cos(axis_rad)))
    ay1 = int(round(cy - (r + 18) * np.sin(axis_rad)))
    ax2 = int(round(cx + (r + 18) * np.cos(axis_rad)))
    ay2 = int(round(cy + (r + 18) * np.sin(axis_rad)))
    draw_sketchy_line(canvas, (ax1, ay1), (ax2, ay2), gc, alpha_base=160, passes=2, seed=seed + 10)
    cv2.circle(canvas, (cx, cy), 5, (*gc, 210), -1)

    # 5. Desert Horizon Baseline with Sanctuary Silhouette
    hy_base = cy + int(r * 0.40)
    pts_horizon = []
    for x in range(cx - int(r * 0.88), cx + int(r * 0.88), 12):
        rel = (x - cx) / float(r)
        dune = np.sin(rel * 4.5) * 12.0 + np.cos(rel * 9.0) * 5.0
        pts_horizon.append((x, int(round(hy_base + dune))))

    for i in range(len(pts_horizon) - 1):
        cv2.line(canvas, pts_horizon[i], pts_horizon[i + 1], (*gc, 150), 1, cv2.LINE_AA)

    # Ruined Sanctuary Tower silhouette on the horizon
    tw_x = cx + int(r * 0.32)
    tw_y = hy_base - 28
    cv2.rectangle(canvas, (tw_x - 10, tw_y), (tw_x + 10, hy_base + 6), (*gc, 175), 1, cv2.LINE_AA)
    cv2.line(canvas, (tw_x - 14, tw_y), (tw_x + 14, tw_y), (*gc, 190), 1, cv2.LINE_AA)
    cv2.circle(canvas, (tw_x, tw_y - 8), 6, (*gc, 160), 1, cv2.LINE_AA)

    # 6. Sighting Vector to Zenith Star (+38° 12')
    v_start = (cx, cy)
    v_end = (cx + r + 45, cy - r + 10)
    draw_sketchy_line(canvas, v_start, v_end, gc, alpha_base=190, passes=2, seed=seed + 20)
    cv2.circle(canvas, v_end, 5, (*gc, 230), -1)

    for d in range(0, 360, 45):
        srad = np.deg2rad(d)
        sx2 = int(round(v_end[0] + 12 * np.cos(srad)))
        sy2 = int(round(v_end[1] + 12 * np.sin(srad)))
        cv2.line(canvas, v_end, (sx2, sy2), (*gc, 180), 1, cv2.LINE_AA)


def draw_renaissance_throne_and_plumb_bob(
    canvas: np.ndarray,
    cx: int,
    cy: int,
    gc: tuple = GRAPHITE_COLOR,
    seed: int = 450
) -> None:
    """
    Renders an authentic, highly detailed Renaissance masterwork technical drawing
    of the astrolabe suspension throne (kursi), shackle (armilla), silk plumb line,
    and precision-turned brass plumb bob (perpendiculum) with calibration arc.
    """
    np.random.seed(seed)

    # 1. SUSPENSION RING & SWIVEL SHACKLE (Armilla suspensoria)
    ring_cy = cy - 145
    r_out, r_mid, r_in = 46, 38, 28

    cv2.circle(canvas, (cx, ring_cy), r_out, (*gc, 195), 2, cv2.LINE_AA)
    cv2.circle(canvas, (cx, ring_cy), r_mid, (*gc, 130), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, ring_cy), r_in, (*gc, 175), 1, cv2.LINE_AA)

    # Rope-twist radial engraving along the ring bevel
    for deg in range(0, 360, 15):
        rad = np.deg2rad(deg)
        x1 = int(round(cx + r_in * np.cos(rad)))
        y1 = int(round(ring_cy + r_in * np.sin(rad)))
        x2 = int(round(cx + r_out * np.cos(rad + 0.12)))
        y2 = int(round(ring_cy + r_out * np.sin(rad + 0.12)))
        cv2.line(canvas, (x1, y1), (x2, y2), (*gc, 120), 1, cv2.LINE_AA)

    # Top shackle clevis & suspension pivot
    shackle_top = ring_cy - r_out - 12
    cv2.rectangle(canvas, (cx - 9, shackle_top), (cx + 9, ring_cy - r_out + 2), (*gc, 190), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, shackle_top + 5), 4, (*gc, 220), -1)
    cv2.circle(canvas, (cx, shackle_top - 12), 10, (*gc, 185), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, shackle_top - 12), 5, (*gc, 140), 1, cv2.LINE_AA)

    # Bottom swivel clevis block attaching to throne crest
    sw_top = ring_cy + r_in
    sw_bot = cy - 88
    cv2.rectangle(canvas, (cx - 12, sw_top), (cx + 12, sw_bot), (*gc, 185), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx - 15, sw_bot), (cx + 15, sw_bot), (*gc, 210), 2, cv2.LINE_AA)
    cv2.circle(canvas, (cx, (sw_top + sw_bot) // 2), 5, (*gc, 225), -1)

    # 2. RENAISSANCE THRONE (KURSI) ARCHITECTURAL BRACKET
    left_outer = np.array([
        [cx - 15, cy - 88],
        [cx - 35, cy - 94],
        [cx - 65, cy - 90],
        [cx - 96, cy - 72],
        [cx - 108, cy - 50],
        [cx - 94, cy - 30],
        [cx - 72, cy - 26],
        [cx - 95, cy - 8],
        [cx - 122, cy + 10],
        [cx - 138, cy + 28]
    ], np.int32)

    right_outer = np.array([
        [cx + 15, cy - 88],
        [cx + 35, cy - 94],
        [cx + 65, cy - 90],
        [cx + 96, cy - 72],
        [cx + 108, cy - 50],
        [cx + 94, cy - 30],
        [cx + 72, cy - 26],
        [cx + 95, cy - 8],
        [cx + 122, cy + 10],
        [cx + 138, cy + 28]
    ], np.int32)

    cv2.polylines(canvas, [left_outer], False, (*gc, 205), 2, cv2.LINE_AA)
    cv2.polylines(canvas, [right_outer], False, (*gc, 205), 2, cv2.LINE_AA)

    # Inner offset contours for cast-bronze relief
    left_inner = left_outer.copy()
    left_inner[:, 0] += 6
    left_inner[:, 1] += 5
    right_inner = right_outer.copy()
    right_inner[:, 0] -= 6
    right_inner[:, 1] += 5
    cv2.polylines(canvas, [left_inner], False, (*gc, 135), 1, cv2.LINE_AA)
    cv2.polylines(canvas, [right_inner], False, (*gc, 135), 1, cv2.LINE_AA)

    # Foliated pierced trefoils / openwork voids inside wings
    for sign in [-1, 1]:
        vox = cx + sign * 78
        voy = cy - 48
        cv2.circle(canvas, (vox, voy), 9, (*gc, 185), 1, cv2.LINE_AA)
        cv2.circle(canvas, (vox + sign * 8, voy - 7), 5, (*gc, 150), 1, cv2.LINE_AA)
        cv2.circle(canvas, (vox + sign * 8, voy + 7), 5, (*gc, 150), 1, cv2.LINE_AA)
        cv2.circle(canvas, (vox, voy), 2, (*gc, 210), -1)

    # Delicate cross-hatching inside scrollwork channels
    for h_y in range(cy - 82, cy + 20, 8):
        for sign in [-1, 1]:
            x_start = cx + sign * 25
            x_end = cx + sign * (45 + (h_y - (cy - 82)) // 2)
            cv2.line(canvas, (x_start, h_y), (x_end, h_y + 4), (*gc, 65), 1, cv2.LINE_AA)

    # Central Cartouche / Rosette Medallion
    med_y = cy - 48
    cv2.circle(canvas, (cx, med_y), 18, (*gc, 195), 2, cv2.LINE_AA)
    cv2.circle(canvas, (cx, med_y), 13, (*gc, 125), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, med_y), 4, (*gc, 230), -1)
    for pet in range(0, 360, 45):
        prad = np.deg2rad(pet)
        px1 = int(round(cx + 4 * np.cos(prad)))
        py1 = int(round(med_y + 4 * np.sin(prad)))
        px2 = int(round(cx + 13 * np.cos(prad)))
        py2 = int(round(med_y + 13 * np.sin(prad)))
        cv2.line(canvas, (px1, py1), (px2, py2), (*gc, 165), 1, cv2.LINE_AA)

    # Base mounting flange (Mater rim interface)
    cv2.line(canvas, (cx - 148, cy + 28), (cx + 148, cy + 28), (*gc, 215), 2, cv2.LINE_AA)
    cv2.line(canvas, (cx - 144, cy + 36), (cx + 144, cy + 36), (*gc, 150), 1, cv2.LINE_AA)
    for rx_off in [-115, -45, 45, 115]:
        cv2.circle(canvas, (cx + rx_off, cy + 32), 4, (*gc, 200), -1)
        cv2.circle(canvas, (cx + rx_off, cy + 32), 4, (*gc, 235), 1, cv2.LINE_AA)
        cv2.line(canvas, (cx + rx_off - 3, cy + 32), (cx + rx_off + 3, cy + 32), (*gc, 120), 1, cv2.LINE_AA)

    # 3. SUSPENSION CORD & JEWELER'S KNOT (Funiculus sericus)
    knot_y = cy - 22
    cv2.circle(canvas, (cx, knot_y), 5, (*gc, 210), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, knot_y), 2, (*gc, 240), -1)
    cv2.ellipse(canvas, (cx - 4, knot_y + 3), (6, 3), 20, 0, 360, (*gc, 195), 1, cv2.LINE_AA)
    cv2.ellipse(canvas, (cx + 4, knot_y + 3), (6, 3), -20, 0, 360, (*gc, 195), 1, cv2.LINE_AA)

    plumb_end_y = cy + 218
    draw_sketchy_line(canvas, (cx, knot_y + 6), (cx, plumb_end_y), gc, alpha_base=185, passes=2, seed=seed + 15)

    for ty in range(cy + 50, cy + 200, 25):
        cv2.line(canvas, (cx - 4, ty), (cx + 4, ty), (*gc, 130), 1, cv2.LINE_AA)
        cv2.circle(canvas, (cx + 8, ty), 1, (*gc, 160), -1)

    # 4. TURNED BRASS PLUMB BOB (Perpendiculum)
    bob_top = plumb_end_y
    cv2.circle(canvas, (cx, bob_top + 6), 6, (*gc, 205), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, bob_top + 6), 3, (*gc, 150), 1, cv2.LINE_AA)

    neck_y1 = bob_top + 12
    neck_y2 = neck_y1 + 14
    cv2.rectangle(canvas, (cx - 6, neck_y1), (cx + 6, neck_y2), (*gc, 190), 1, cv2.LINE_AA)
    for kn in range(neck_y1 + 3, neck_y2, 3):
        cv2.line(canvas, (cx - 6, kn), (cx + 6, kn), (*gc, 135), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx - 9, neck_y2), (cx + 9, neck_y2), (*gc, 215), 2, cv2.LINE_AA)

    y_profile = [
        (neck_y2, 7),
        (neck_y2 + 8, 12),
        (neck_y2 + 18, 17),
        (neck_y2 + 28, 18),
        (neck_y2 + 40, 14),
        (neck_y2 + 52, 9),
        (neck_y2 + 64, 4),
        (neck_y2 + 76, 1),
    ]
    needle_tip_y = neck_y2 + 76

    left_body = [(cx - w, y) for y, w in y_profile]
    right_body = [(cx + w, y) for y, w in reversed(y_profile)]
    bob_poly = np.array(left_body + right_body, np.int32)

    cv2.fillPoly(canvas, [bob_poly], (*gc, 190))
    cv2.polylines(canvas, [bob_poly], True, (*gc, 230), 1, cv2.LINE_AA)

    for gy_off in [10, 20, 32, 46, 58]:
        gy = neck_y2 + gy_off
        w_at_g = int(np.interp(gy, [y for y, _ in y_profile], [w for _, w in y_profile]))
        cv2.ellipse(canvas, (cx, gy), (w_at_g - 1, 3), 0, 0, 180, (*gc, 115), 1, cv2.LINE_AA)

    for hy in range(neck_y2 + 6, neck_y2 + 68, 4):
        w_at_h = int(np.interp(hy, [y for y, _ in y_profile], [w for _, w in y_profile]))
        if w_at_h > 4:
            cv2.line(canvas, (cx + 2, hy), (cx + w_at_h - 2, hy), (*gc, 220), 1, cv2.LINE_AA)

    cv2.line(canvas, (cx, needle_tip_y), (cx, needle_tip_y + 6), (*gc, 240), 1, cv2.LINE_AA)
    needle_tip_final = needle_tip_y + 6

    # 5. MERIDIAN GRADUATION ARC (Index graduum)
    arc_cy = neck_y2 + 28
    arc_r = needle_tip_final - arc_cy + 8

    cv2.ellipse(canvas, (cx, arc_cy), (arc_r, arc_r), 0, 64, 116, (*gc, 175), 1, cv2.LINE_AA)
    cv2.ellipse(canvas, (cx, arc_cy), (arc_r + 8, arc_r + 8), 0, 64, 116, (*gc, 115), 1, cv2.LINE_AA)

    for d_deg in range(-24, 25, 2):
        d_rad = np.deg2rad(90 + d_deg)
        t_len = 8 if d_deg == 0 else (6 if d_deg % 10 == 0 else 3)
        ax1 = int(round(cx + (arc_r - 2) * np.cos(d_rad)))
        ay1 = int(round(arc_cy + (arc_r - 2) * np.sin(d_rad)))
        ax2 = int(round(cx + (arc_r + t_len) * np.cos(d_rad)))
        ay2 = int(round(arc_cy + (arc_r + t_len) * np.sin(d_rad)))
        alpha_t = 220 if d_deg == 0 else (170 if d_deg % 10 == 0 else 110)
        cv2.line(canvas, (ax1, ay1), (ax2, ay2), (*gc, alpha_t), 1, cv2.LINE_AA)

    cv2.circle(canvas, (cx, arc_cy + arc_r + 14), 2, (*gc, 210), -1)

    # 6. ELEGANT CALLOUT ANNOTATIONS WITH LEADER LINES
    draw_sketchy_line(canvas, (cx - 48, ring_cy - 10), (cx - 95, ring_cy - 25), gc, alpha_base=120, passes=1, seed=seed + 21)
    cv2.circle(canvas, (cx - 48, ring_cy - 10), 2, (*gc, 180), -1)
    t_arm, _ = render_pencil_text("Armilla suspensoria", FONT_PATH, font_size=23, gc=gc, seed=seed + 22)
    if t_arm is not None:
        blit_rgba(canvas, t_arm, cx - 215, ring_cy - 40)

    draw_sketchy_line(canvas, (cx + 96, cy - 70), (cx + 130, cy - 80), gc, alpha_base=120, passes=1, seed=seed + 23)
    cv2.circle(canvas, (cx + 96, cy - 70), 2, (*gc, 180), -1)
    t_kur, _ = render_pencil_text("Kursi caelata", FONT_PATH, font_size=23, gc=gc, seed=seed + 24)
    if t_kur is not None:
        blit_rgba(canvas, t_kur, cx + 138, cy - 95)

    draw_sketchy_line(canvas, (cx - 18, neck_y2 + 25), (cx - 75, neck_y2 + 35), gc, alpha_base=120, passes=1, seed=seed + 25)
    cv2.circle(canvas, (cx - 18, neck_y2 + 25), 2, (*gc, 180), -1)
    t_per, _ = render_pencil_text("Perpendiculum", FONT_PATH, font_size=23, gc=gc, seed=seed + 26)
    if t_per is not None:
        blit_rgba(canvas, t_per, cx - 210, neck_y2 + 20)

    t_idx, _ = render_pencil_text("Meridian datum 0*", FONT_PATH, font_size=22, gc=gc, seed=seed + 27)
    if t_idx is not None:
        blit_rgba(canvas, t_idx, cx + 22, arc_cy + arc_r + 4)


def render_face_4a(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """
    Renders Hoja 4 · Cara A (Page 6, holes on LEFT: X < 165 px).
    - Header: 'The Astrolabe' (font_size=66) + hand-drawn divider.
    - Upper Left: Ancient Lore & Investigation notes at readable font_size=37.
    - Upper Right: Grand Armillary Sphere with horizon integration (cx=1340, cy=690, R=220).
    - Lower Left: Detailed Renaissance Suspension Throne & Plumb Bob (cx=410, cy=1380).
    - Lower Right: Three Rules of the Outer Dial (font_size=33) + Epoch calculations.
    - Bottom: Cartographer's axiom & Latitude datum.
    """
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. Header & Divider
    t_img, base_out = render_pencil_text("The Astrolabe", FONT_PATH, font_size=66, gc=gc, seed=401)
    if t_img is not None:
        blit_rgba(canvas, t_img, 240, 195 - base_out)

    div = create_handdrawn_divider(width=1340, gc=gc, seed=402)
    blit_rgba(canvas, div, 240, 250 - div.shape[0] // 2)

    # 2. Grand Armillary Sphere on Right (shifted right to guarantee zero overlap)
    sphere_cx, sphere_cy, sphere_r = 1340, 690, 220
    draw_armillary_sphere(canvas, cx=sphere_cx, cy=sphere_cy, r=sphere_r, gc=gc, seed=403)

    diag_arm = render_pencil_text_diagonal(
        "Line of sight  —  Zenith (+38* 12')",
        FONT_PATH, font_size=30, angle_deg=-20.0, gc=gc, seed=405
    )
    if diag_arm is not None:
        blit_rgba(canvas, diag_arm, sphere_cx - 160, sphere_cy - sphere_r - 40)

    t_sphere, _ = render_pencil_text("Projection of the Celestial Sphere", FONT_PATH, font_size=32, gc=gc, seed=406)
    if t_sphere is not None:
        blit_rgba(canvas, t_sphere, sphere_cx - 170, sphere_cy + sphere_r + 20)

    # 3. Main Lore & Investigation Text (Left side, X in [240, 990])
    lore_paragraphs = [
        "For three centuries, the Order believed the ancient",
        "sanctuary was sealed by key or word of mouth.",
        "They were mistaken. The great threshold yields",
        "only to the sacred geometry of heaven.",
        "",
        "This instrument—the Astrolabe—is the true key.",
        "Forged from cold brass and meteorite alloy,",
        "its plates capture authentic movement of stars",
        "upon a single stereographic plane.",
        "",
        "Whoever aligns its rings with the midnight horizon can",
        "uncover the hidden bearings of the desert vaults.",
        "I recorded its anatomy here before the riders crossed",
        "the perimeter valley. Study every plate with care."
    ]

    for line_idx, p_text in enumerate(lore_paragraphs):
        if not p_text:
            continue
        py = 315 + line_idx * 50
        p_img, _ = render_pencil_text(p_text, FONT_PATH, font_size=37, gc=gc, seed=420 + line_idx * 11)
        if p_img is not None:
            blit_rgba(canvas, p_img, 240, py)

    # 4. Mid Section Divider at Y=1060
    sub_div = create_handdrawn_divider(width=1340, gc=gc, seed=408)
    blit_rgba(canvas, sub_div, 240, 1060)

    # 5. Lower Left: Renaissance Suspension Throne (Armilla) with Plumb Bob
    throne_cx, throne_cy = 410, 1380
    draw_renaissance_throne_and_plumb_bob(canvas, cx=throne_cx, cy=throne_cy, gc=gc, seed=450)

    lbl_throne, _ = render_pencil_text("The Suspension Throne (Armilla)", FONT_PATH, font_size=32, gc=gc, seed=452)
    if lbl_throne is not None:
        blit_rgba(canvas, lbl_throne, throne_cx - lbl_throne.shape[1] // 2, throne_cy + 345)

    lbl_throne_sub1, _ = render_pencil_text("Suspended by silk thread", FONT_PATH, font_size=27, gc=gc, seed=453)
    if lbl_throne_sub1 is not None:
        blit_rgba(canvas, lbl_throne_sub1, throne_cx - lbl_throne_sub1.shape[1] // 2, throne_cy + 380)

    lbl_throne_sub2, _ = render_pencil_text("for true vertical plumb", FONT_PATH, font_size=27, gc=gc, seed=454)
    if lbl_throne_sub2 is not None:
        blit_rgba(canvas, lbl_throne_sub2, throne_cx - lbl_throne_sub2.shape[1] // 2, throne_cy + 412)

    # 16-point azimuth compass rose accent below throne
    rcx, rcy, rr = throne_cx, 1935, 68
    cv2.circle(canvas, (rcx, rcy), rr, (*gc, 130), 1, cv2.LINE_AA)
    cv2.circle(canvas, (rcx, rcy), int(rr * 0.4), (*gc, 100), 1, cv2.LINE_AA)
    for deg in range(0, 360, 45):
        rad = np.deg2rad(deg)
        tx = int(round(rcx + rr * np.cos(rad)))
        ty = int(round(rcy + rr * np.sin(rad)))
        draw_sketchy_line(canvas, (rcx, rcy), (tx, ty), gc, alpha_base=140, passes=1, seed=455 + deg)

    t_zen, _ = render_pencil_text("Meridian alignment zero", FONT_PATH, font_size=28, gc=gc, seed=458)
    if t_zen is not None:
        blit_rgba(canvas, t_zen, rcx - 110, rcy + rr + 18)

    # 6. Lower Right: Three Rules of the Outer Dial & Epoch Table
    notes_x = 760
    t_rule_head, _ = render_pencil_text("Three Rules of the Outer Dial", FONT_PATH, font_size=44, gc=gc, seed=460)
    if t_rule_head is not None:
        blit_rgba(canvas, t_rule_head, notes_x, 1120)

    rules_text = [
        "I.   Never force the rete when the desert wind rises.",
        "     The fine pointers bend under grit; once warped,",
        "     a star bearing can mislead by a dozen leagues.",
        "",
        "II.  The central pin locks with an iron horse wedge.",
        "     If the wedge slips, the altitude circles decouple",
        "     from the true horizon of the sanctuary.",
        "",
        "III. Trust the shadows at noon, but trust the pointers",
        "     at midnight. When Vega reaches zenith, the gate",
        "     alignment reveals its true direction."
    ]

    for r_idx, r_line in enumerate(rules_text):
        if not r_line:
            continue
        ry = 1180 + r_idx * 44
        r_img, _ = render_pencil_text(r_line, FONT_PATH, font_size=33, gc=gc, seed=470 + r_idx * 9)
        if r_img is not None:
            blit_rgba(canvas, r_img, notes_x, ry)

    # Epoch Table & Solstitial Declination Notes
    draw_sketchy_line(canvas, (notes_x, 1720), (1520, 1720), gc, alpha_base=120, passes=1, seed=480)
    t_epoch, _ = render_pencil_text("Aequatio Temporis  —  Epoch of Observation", FONT_PATH, font_size=32, gc=gc, seed=482)
    if t_epoch is not None:
        blit_rgba(canvas, t_epoch, notes_x, 1735)

    t_dec, _ = render_pencil_text("Solar declination: delta = 23* 27' . sin(lambda)", FONT_PATH, font_size=30, gc=gc, seed=484)
    if t_dec is not None:
        blit_rgba(canvas, t_dec, notes_x, 1780)

    t_dec2, _ = render_pencil_text("Solstitial limit: maximum elevation h = 75* 15'", FONT_PATH, font_size=29, gc=gc, seed=486)
    if t_dec2 is not None:
        blit_rgba(canvas, t_dec2, notes_x, 1822)

    # 7. Bottom Footers
    axiom, _ = render_pencil_text("\"To hold the sky in one's hand is to master the path beneath one's feet.\"", FONT_PATH, font_size=34, gc=gc, seed=490)
    if axiom is not None:
        blit_rgba(canvas, axiom, 380, 2120)

    datum_foot, _ = render_pencil_text("Latitude datum: 38* 12' 04\" N  —  Meridian of the First Tower", FONT_PATH, font_size=29, gc=gc, seed=495)
    if datum_foot is not None:
        blit_rgba(canvas, datum_foot, 480, 2195)

    return canvas


# -------------------------------------------------------------------------
# FACE 4B: ANATOMY & EXPLODED TECHNICAL DISSECTION (DA VINCI MASTERPIECE)
# -------------------------------------------------------------------------

def draw_exploded_astrolabe(canvas: np.ndarray, cx: int, gc: tuple = GRAPHITE_COLOR, seed: int = 501) -> None:
    """
    Renders an authentic, museum-grade Da Vinci / Renaissance technical exploded view
    of the 5 astrolabe components aligned along a vertical axis line (cx=780):
      1. The Mater (casing & 360* limbus with deep recessed bed & kursi bracket)
      2. The Tympan (horizon plate for Lat. 38* 12' with almucantars, azimuths, and tropics)
      3. The Rete (openwork star web with zodiac ecliptic band, 6 sculpted flame pointers, and tracery)
      4. The Alidade (tapered sighting rule with perspective pinules, dual apertures, and scales)
      5. The Horse Wedge (finely chiseled Renaissance horse head clavus with slotted wedge pin)
    """
    np.random.seed(seed)

    # 0. Central alignment vertical axis line (subtle dashed construction line)
    for y_dash in range(310, 2080, 18):
        cv2.line(canvas, (cx, y_dash), (cx, y_dash + 10), (*gc, 85), 1, cv2.LINE_AA)

    # Directional explosion indicator arrows along axis
    for y_arr in [725, 1145, 1545, 1920]:
        cv2.line(canvas, (cx - 5, y_arr - 6), (cx, y_arr), (*gc, 130), 1, cv2.LINE_AA)
        cv2.line(canvas, (cx + 5, y_arr - 6), (cx, y_arr), (*gc, 130), 1, cv2.LINE_AA)

    # -------------------------------------------------------------------------
    # 1. THE MATER (cy ≈ 530, R = 175)
    # -------------------------------------------------------------------------
    cy1, r1 = 530, 175

    # A. Top Kursi bracket (throne mount) on Mater rim
    kursi_w, kursi_h = 72, 38
    ky_base = cy1 - r1
    # Scrolled decorative bracket ears
    cv2.ellipse(canvas, (cx - 36, ky_base - 14), (22, 16), -25, 0, 360, (*gc, 185), 1, cv2.LINE_AA)
    cv2.ellipse(canvas, (cx + 36, ky_base - 14), (22, 16), 25, 0, 360, (*gc, 185), 1, cv2.LINE_AA)
    # Suspension shackle ring
    cv2.circle(canvas, (cx, ky_base - 32), 24, (*gc, 200), 2, cv2.LINE_AA)
    cv2.circle(canvas, (cx, ky_base - 32), 15, (*gc, 140), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, ky_base - 32), 5, (*gc, 220), -1)
    # Mounting rivets attaching throne to mater rim
    for rx_off in [-48, -20, 20, 48]:
        cv2.circle(canvas, (cx + rx_off, ky_base + 6), 3, (*gc, 195), -1)
        cv2.line(canvas, (cx + rx_off - 2, ky_base + 6), (cx + rx_off + 2, ky_base + 6), (*gc, 100), 1, cv2.LINE_AA)

    # B. Outer bronze casing rims
    cv2.circle(canvas, (cx, cy1), r1, (*gc, 215), 2, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy1), r1 - 8, (*gc, 140), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy1), r1 - 18, (*gc, 170), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy1), r1 - 30, (*gc, 210), 2, cv2.LINE_AA)  # Internal rim drop edge

    # C. Limbus graduations: 360 degrees & 24 equal hours
    for deg in range(0, 360, 5):
        rad = np.deg2rad(deg)
        if deg % 30 == 0:
            l_tick = 18
            alpha_tick = 200
        elif deg % 15 == 0:
            l_tick = 12
            alpha_tick = 160
        else:
            l_tick = 6
            alpha_tick = 110
        x1 = int(round(cx + r1 * np.cos(rad)))
        y1 = int(round(cy1 + r1 * np.sin(rad)))
        x2 = int(round(cx + (r1 - l_tick) * np.cos(rad)))
        y2 = int(round(cy1 + (r1 - l_tick) * np.sin(rad)))
        cv2.line(canvas, (x1, y1), (x2, y2), (*gc, alpha_tick), 1, cv2.LINE_AA)

    # 4 Cardinal dots on limbus (N, E, S, W)
    for c_deg in [0, 90, 180, 270]:
        c_rad = np.deg2rad(c_deg)
        cd_x = int(round(cx + (r1 - 9) * np.cos(c_rad)))
        cd_y = int(round(cy1 + (r1 - 9) * np.sin(c_rad)))
        cv2.circle(canvas, (cd_x, cd_y), 2, (*gc, 210), -1)

    # D. Recessed bed cross-hatching (depth of hollow cavity)
    r_bed = r1 - 30
    for h_off in range(-r_bed + 14, r_bed - 14, 12):
        chord = int(np.sqrt(max(0, r_bed**2 - h_off**2)))
        # Soft pencil shading lines
        cv2.line(canvas, (cx - chord + 4, cy1 + h_off), (cx + chord - 4, cy1 + h_off), (*gc, 48), 1, cv2.LINE_AA)

    # Inner circular drop-shadow ring indicating recessed lip
    cv2.circle(canvas, (cx, cy1), r_bed - 3, (*gc, 90), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy1), r_bed - 6, (*gc, 60), 1, cv2.LINE_AA)

    # Center axis bore & brass bushing ring
    cv2.circle(canvas, (cx, cy1), 12, (*gc, 160), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy1), 6, (*gc, 230), -1)

    # -------------------------------------------------------------------------
    # 2. THE TYMPAN (cy ≈ 950, R = 155)
    # -------------------------------------------------------------------------
    cy2, r2 = 950, 155

    # A. Alignment tab (denticulus) at top
    cv2.rectangle(canvas, (cx - 7, cy2 - r2 - 10), (cx + 7, cy2 - r2 + 2), (*gc, 210), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx - 4, cy2 - r2 - 7), (cx + 4, cy2 - r2 - 7), (*gc, 180), 1, cv2.LINE_AA)

    # B. Outer plate boundary & degree graduation border
    cv2.circle(canvas, (cx, cy2), r2, (*gc, 205), 2, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy2), r2 - 7, (*gc, 130), 1, cv2.LINE_AA)
    for deg in range(0, 360, 10):
        rad = np.deg2rad(deg)
        l_tk = 6 if deg % 30 == 0 else 3
        tx1 = int(round(cx + r2 * np.cos(rad)))
        ty1 = int(round(cy2 + r2 * np.sin(rad)))
        tx2 = int(round(cx + (r2 - l_tk) * np.cos(rad)))
        ty2 = int(round(cy2 + (r2 - l_tk) * np.sin(rad)))
        cv2.line(canvas, (tx1, ty1), (tx2, ty2), (*gc, 140), 1, cv2.LINE_AA)

    # C. Cardinal crosslines (Meridian & East-West Equator)
    draw_sketchy_line(canvas, (cx - r2 + 10, cy2), (cx + r2 - 10, cy2), gc, alpha_base=135, passes=1, seed=seed + 20)
    draw_sketchy_line(canvas, (cx, cy2 - r2 + 12), (cx, cy2 + r2 - 12), gc, alpha_base=135, passes=1, seed=seed + 21)

    # D. Tropic of Cancer, Celestial Equator, and Tropic of Capricorn arcs
    cv2.ellipse(canvas, (cx, cy2), (int(r2 * 0.72), int(r2 * 0.72)), 0, 0, 360, (*gc, 90), 1, cv2.LINE_AA)  # Equator
    cv2.ellipse(canvas, (cx, cy2), (int(r2 * 0.46), int(r2 * 0.46)), 0, 0, 360, (*gc, 75), 1, cv2.LINE_AA)  # Tropic of Capricorn

    # E. Horizon Obliquus arc & Crepusculum twilight circle
    cv2.ellipse(canvas, (cx, cy2 + 38), (r2 - 14, int(r2 * 0.70)), 0, 192, 348, (*gc, 210), 2, cv2.LINE_AA)
    cv2.ellipse(canvas, (cx, cy2 + 56), (r2 - 10, int(r2 * 0.82)), 0, 196, 344, (*gc, 115), 1, cv2.LINE_AA)

    # F. Zenith point & Stereographic Almucantars (Altitude circles for Lat 38* 12')
    zx, zy = cx, cy2 - int(r2 * 0.28)
    cv2.circle(canvas, (zx, zy), 4, (*gc, 225), -1)

    # 7 Concentric Almucantar curves
    almu_radii = [18, 36, 56, 78, 102, 126, 146]
    for idx_al, rad_circ in enumerate(almu_radii):
        cy_al = zy + int(rad_circ * 0.32)
        cv2.circle(canvas, (zx, cy_al), rad_circ, (*gc, 110 if idx_al % 2 == 0 else 75), 1, cv2.LINE_AA)

    # G. Azimuth arcs radiating from Zenith to Horizon
    for az_ang in [-60, -40, -20, 20, 40, 60]:
        az_r = np.deg2rad(az_ang)
        cv2.ellipse(canvas, (zx + int(np.sin(az_r) * 70), zy + 45),
                    (abs(int(np.sin(az_r) * 65)) + 35, 75), 0, 10, 170, (*gc, 70), 1, cv2.LINE_AA)

    # Center axis bore
    cv2.circle(canvas, (cx, cy2), 6, (*gc, 230), -1)

    # -------------------------------------------------------------------------
    # 3. THE RETE (cy ≈ 1370, R = 155) — Renaissance Openwork Filigree Masterpiece
    # -------------------------------------------------------------------------
    cy3, r3 = 1370, 155

    # A. Outer equinoctial ring with delicate double border
    cv2.circle(canvas, (cx, cy3), r3, (*gc, 185), 2, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy3), r3 - 6, (*gc, 120), 1, cv2.LINE_AA)

    # B. Concentric Ecliptic / Zodiac ring (Via Solis) — perfectly centered & balanced
    rz_out, rz_in = 100, 86
    cv2.circle(canvas, (cx, cy3), rz_out, (*gc, 215), 2, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy3), rz_in, (*gc, 160), 1, cv2.LINE_AA)

    # 12 Zodiac house radial division lines & degree graduation marks
    for zdeg in range(0, 360, 30):
        zrad = np.deg2rad(zdeg)
        zx1 = int(round(cx + rz_out * np.cos(zrad)))
        zy1 = int(round(cy3 + rz_out * np.sin(zrad)))
        zx2 = int(round(cx + rz_in * np.cos(zrad)))
        zy2 = int(round(cy3 + rz_in * np.sin(zrad)))
        cv2.line(canvas, (zx1, zy1), (zx2, zy2), (*gc, 190), 1, cv2.LINE_AA)

        # Intermediate 10* graduation ticks
        for sub_deg in [10, 20]:
            srad = np.deg2rad(zdeg + sub_deg)
            sx1 = int(round(cx + rz_out * np.cos(srad)))
            sy1 = int(round(cy3 + rz_out * np.sin(srad)))
            sx2 = int(round(cx + (rz_out - 6) * np.cos(srad)))
            sy2 = int(round(cy3 + (rz_out - 6) * np.sin(srad)))
            cv2.line(canvas, (sx1, sy1), (sx2, sy2), (*gc, 130), 1, cv2.LINE_AA)

    # C. Gothic Tracery Openwork Bars & Arabesque Tendrils connecting Rings
    # Central East-West openwork crossbar through center
    cv2.line(canvas, (cx - r3 + 7, cy3 - 2), (cx - 16, cy3 - 2), (*gc, 150), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx - r3 + 7, cy3 + 2), (cx - 16, cy3 + 2), (*gc, 150), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx + 16, cy3 - 2), (cx + r3 - 7, cy3 - 2), (*gc, 150), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx + 16, cy3 + 2), (cx + r3 - 7, cy3 + 2), (*gc, 150), 1, cv2.LINE_AA)

    # Symmetrical foliate quadrant arches connecting Zodiac ring to outer frame
    for sign_x in [-1, 1]:
        # Upper quadrant arches
        cv2.ellipse(canvas, (cx + sign_x * 52, cy3 - 48), (72, 42), sign_x * 32, 15, 165, (*gc, 125), 1, cv2.LINE_AA)
        # Lower quadrant arches
        cv2.ellipse(canvas, (cx + sign_x * 52, cy3 + 48), (72, 42), -sign_x * 32, 15, 165, (*gc, 125), 1, cv2.LINE_AA)
        # Inner support cusps
        cv2.ellipse(canvas, (cx + sign_x * 36, cy3), (28, 18), 0, 0, 180, (*gc, 105), 1, cv2.LINE_AA)

    # Al-Muri equinoctial pointer tooth at 0* (East rim, well clear of bottom axis arrow)
    muri_pts = np.array([
        [cx + r3 - 6, cy3 - 7],
        [cx + r3 + 8, cy3],
        [cx + r3 - 6, cy3 + 7]
    ], np.int32)
    cv2.fillPoly(canvas, [muri_pts], (*gc, 200))
    cv2.circle(canvas, (cx + r3 + 8, cy3), 2, (*gc, 240), -1)

    # D. 6 Slender Renaissance Star Pointers (Mucrones) with Acanthus Leaf Bases
    # Symmetrically balanced around the zodiac circle (angles avoid all axis collisions)
    star_data = [
        (35, "Veg", 135),   # Vega (Lyra)
        (110, "Alt", 135),  # Altair (Aquila) — south-east, clean clearance from 90*
        (160, "Den", 135),  # Deneb (Cygnus)
        (215, "Arc", 135),  # Arcturus (Bootes)
        (285, "Ald", 135),  # Aldebaran (Taurus) — north-east, clear of 270*
        (340, "Pol", 135),  # Polaris (Ursa Minor)
    ]

    for s_deg, s_abbr, tip_dist in star_data:
        s_rad = np.deg2rad(s_deg)
        tx = int(round(cx + tip_dist * np.cos(s_rad)))
        ty = int(round(cy3 + tip_dist * np.sin(s_rad)))

        # Slender acanthus foliate tongue
        root_dist = rz_out
        bx1 = int(round(cx + root_dist * np.cos(s_rad - 0.055)))
        by1 = int(round(cy3 + root_dist * np.sin(s_rad - 0.055)))
        bx2 = int(round(cx + root_dist * np.cos(s_rad + 0.055)))
        by2 = int(round(cy3 + root_dist * np.sin(s_rad + 0.055)))

        mid_dist = (tip_dist - 10)
        mx1 = int(round(cx + mid_dist * np.cos(s_rad - 0.03)))
        my1 = int(round(cy3 + mid_dist * np.sin(s_rad - 0.03)))
        mx2 = int(round(cx + mid_dist * np.cos(s_rad + 0.03)))
        my2 = int(round(cy3 + mid_dist * np.sin(s_rad + 0.03)))

        flame_poly = np.array([[bx1, by1], [mx1, my1], [tx, ty], [mx2, my2], [bx2, by2]], np.int32)
        cv2.fillPoly(canvas, [flame_poly], (*gc, 80))
        cv2.polylines(canvas, [flame_poly], True, (*gc, 215), 1, cv2.LINE_AA)

        # Star tip gleaming dot & spine line
        cv2.line(canvas, (int(round(cx + root_dist * np.cos(s_rad))), int(round(cy3 + root_dist * np.sin(s_rad)))),
                 (tx, ty), (*gc, 180), 1, cv2.LINE_AA)
        cv2.circle(canvas, (tx, ty), 2, (*gc, 245), -1)

        # Star abbreviation label placed beside the pointer in the clear open band
        tang_offset = 0.13 if s_deg in [35, 110, 215, 285] else -0.13
        lx = int(round(cx + 120 * np.cos(s_rad + tang_offset)))
        ly = int(round(cy3 + 120 * np.sin(s_rad + tang_offset)))
        t_star, _ = render_pencil_text(s_abbr, FONT_PATH, font_size=20, gc=gc, seed=seed + s_deg)
        if t_star is not None:
            blit_rgba(canvas, t_star, lx - t_star.shape[1] // 2, ly - t_star.shape[0] // 2)

    # Center axis bore & brass collar
    cv2.circle(canvas, (cx, cy3), 16, (*gc, 170), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy3), 10, (*gc, 120), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy3), 6, (*gc, 230), -1)

    # -------------------------------------------------------------------------
    # 4. THE ALIDADE (cy ≈ 1760, Length ≈ 340) — Beveled Sighting Arm with Pinules
    # -------------------------------------------------------------------------
    cy4 = 1760
    al_len = 168
    al_ang = np.deg2rad(30)

    # A. Central pivot boss
    cv2.circle(canvas, (cx, cy4), 26, (*gc, 205), 2, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy4), 16, (*gc, 140), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy4), 6, (*gc, 230), -1)

    # B. Tapered sighting arms with fiducial bevel
    ux, uy = np.cos(al_ang), np.sin(al_ang)
    vx, vy = -uy, ux  # perpendicular vector

    arm_w1 = 11.0  # width at center boss
    arm_w2 = 6.0   # width at tip

    p1_l = (int(round(cx - al_len * ux + arm_w2 * vx)), int(round(cy4 - al_len * uy + arm_w2 * vy)))
    p1_r = (int(round(cx - al_len * ux - arm_w2 * vx)), int(round(cy4 - al_len * uy - arm_w2 * vy)))
    p2_l = (int(round(cx + al_len * ux + arm_w2 * vx)), int(round(cy4 + al_len * uy + arm_w2 * vy)))
    p2_r = (int(round(cx + al_len * ux - arm_w2 * vx)), int(round(cy4 + al_len * uy - arm_w2 * vy)))

    c_top_l = (int(round(cx - 24 * ux + arm_w1 * vx)), int(round(cy4 - 24 * uy + arm_w1 * vy)))
    c_top_r = (int(round(cx - 24 * ux - arm_w1 * vx)), int(round(cy4 - 24 * uy - arm_w1 * vy)))
    c_bot_l = (int(round(cx + 24 * ux + arm_w1 * vx)), int(round(cy4 + 24 * uy + arm_w1 * vy)))
    c_bot_r = (int(round(cx + 24 * ux - arm_w1 * vx)), int(round(cy4 + 24 * uy - arm_w1 * vy)))

    blade_poly1 = np.array([p1_l, c_top_l, c_top_r, p1_r], np.int32)
    blade_poly2 = np.array([c_bot_l, p2_l, p2_r, c_bot_r], np.int32)

    cv2.fillPoly(canvas, [blade_poly1], (*gc, 150))
    cv2.fillPoly(canvas, [blade_poly2], (*gc, 150))
    cv2.polylines(canvas, [blade_poly1], True, (*gc, 215), 1, cv2.LINE_AA)
    cv2.polylines(canvas, [blade_poly2], True, (*gc, 215), 1, cv2.LINE_AA)

    # Sharp pointer tips (cuspes)
    tip1 = (int(round(cx - (al_len + 16) * ux)), int(round(cy4 - (al_len + 16) * uy)))
    tip2 = (int(round(cx + (al_len + 16) * ux)), int(round(cy4 + (al_len + 16) * uy)))
    cv2.line(canvas, p1_l, tip1, (*gc, 220), 1, cv2.LINE_AA)
    cv2.line(canvas, p1_r, tip1, (*gc, 220), 1, cv2.LINE_AA)
    cv2.line(canvas, p2_l, tip2, (*gc, 220), 1, cv2.LINE_AA)
    cv2.line(canvas, p2_r, tip2, (*gc, 220), 1, cv2.LINE_AA)

    # Center fiducial line across length
    draw_sketchy_line(canvas, tip1, tip2, gc, alpha_base=180, passes=1, seed=seed + 40)

    # C. Sighting Vanes (Pinules) with double apertures in 3D relief
    for dist_van in [-al_len * 0.65, al_len * 0.65]:
        v_cx = int(round(cx + dist_van * ux))
        v_cy = int(round(cy4 + dist_van * uy))

        # Vane plate rectangular footprint perpendicular to ruler
        vp1 = (int(round(v_cx + 18 * vx - 4 * ux)), int(round(v_cy + 18 * vy - 4 * uy)))
        vp2 = (int(round(v_cx + 18 * vx + 4 * ux)), int(round(v_cy + 18 * vy + 4 * uy)))
        vp3 = (int(round(v_cx - 18 * vx + 4 * ux)), int(round(v_cy - 18 * vy + 4 * uy)))
        vp4 = (int(round(v_cx - 18 * vx - 4 * ux)), int(round(v_cy - 18 * vy - 4 * uy)))
        vane_poly = np.array([vp1, vp2, vp3, vp4], np.int32)
        cv2.fillPoly(canvas, [vane_poly], (*gc, 195))
        cv2.polylines(canvas, [vane_poly], True, (*gc, 235), 1, cv2.LINE_AA)

        # Dual sight apertures: large nocturnal aperture + pinpoint solar aperture
        a_large = (int(round(v_cx + 9 * vx)), int(round(v_cy + 9 * vy)))
        a_pin = (int(round(v_cx - 8 * vx)), int(round(v_cy - 8 * vy)))
        cv2.circle(canvas, a_large, 3, (*gc, 90), 1, cv2.LINE_AA)
        cv2.circle(canvas, a_pin, 1, (*gc, 240), -1)

    # -------------------------------------------------------------------------
    # 5. THE HORSE WEDGE (cy ≈ 2000) — Sculpted Renaissance Horse Clavus
    # -------------------------------------------------------------------------
    cy5 = 2000

    # A. Sculpted Renaissance Horse Head (Al-Faras) Profile
    # An anatomically graceful horse silhouette with arched crest, ear, eye, and snout
    pts_horse = np.array([
        [cx - 36, cy5 + 6],    # Neck base rear
        [cx - 28, cy5 - 14],   # Arch of neck
        [cx - 16, cy5 - 32],   # Crest curve
        [cx - 6, cy5 - 40],    # Base of ear
        [cx - 4, cy5 - 50],    # Ear tip
        [cx + 2, cy5 - 42],    # Forehead / poll
        [cx + 16, cy5 - 34],   # Brow
        [cx + 34, cy5 - 18],   # Nasal bridge
        [cx + 42, cy5 - 4],    # Muzzle / nose
        [cx + 36, cy5 + 6],    # Chin / lower jaw
        [cx + 20, cy5 + 16],   # Throatlatch
        [cx + 8, cy5 + 24],    # Neck front
        [cx - 18, cy5 + 24]    # Chest join
    ], np.int32)

    cv2.fillPoly(canvas, [pts_horse], (*gc, 95))
    cv2.polylines(canvas, [pts_horse], True, (*gc, 230), 2, cv2.LINE_AA)

    # Fine horse details: Leonardo cross-hatching, flowing mane locks, eye, and bridle strap
    for hy_off in range(-28, 16, 5):
        cv2.line(canvas, (cx - 16, cy5 + hy_off), (cx + 10, cy5 + hy_off + 7), (*gc, 65), 1, cv2.LINE_AA)

    # Mane locks hatching along crest
    for my_off in range(-34, 0, 7):
        cv2.line(canvas, (cx - 22, cy5 + my_off), (cx - 38, cy5 + my_off + 8), (*gc, 140), 1, cv2.LINE_AA)

    # Expressive almond eye with dark pupil
    cv2.ellipse(canvas, (cx + 12, cy5 - 22), (4, 2), -20, 0, 360, (*gc, 90), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx + 12, cy5 - 22), 1, (*gc, 240), -1)

    # Bridle / harness line across cheek
    cv2.line(canvas, (cx + 2, cy5 - 38), (cx + 24, cy5 + 8), (*gc, 140), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx + 14, cy5 - 14), 2, (*gc, 210), -1)  # Bridle stud

    # B. Tapered locking wedge shank extending downwards
    wedge_poly = np.array([
        [cx - 12, cy5 + 24],
        [cx + 12, cy5 + 24],
        [cx + 6, cy5 + 72],
        [cx - 6, cy5 + 72]
    ], np.int32)
    cv2.fillPoly(canvas, [wedge_poly], (*gc, 110))
    cv2.polylines(canvas, [wedge_poly], True, (*gc, 215), 1, cv2.LINE_AA)

    # Axis slot mortise through the wedge
    cv2.rectangle(canvas, (cx - 3, cy5 + 34), (cx + 3, cy5 + 62), (*gc, 80), -1)
    cv2.rectangle(canvas, (cx - 3, cy5 + 34), (cx + 3, cy5 + 62), (*gc, 210), 1, cv2.LINE_AA)

    # Slotted cotter key pin inserted horizontally
    cv2.line(canvas, (cx - 18, cy5 + 48), (cx + 18, cy5 + 48), (*gc, 220), 2, cv2.LINE_AA)
    cv2.circle(canvas, (cx - 18, cy5 + 48), 2, (*gc, 230), -1)


def draw_celestial_constellation_banner(
    canvas: np.ndarray,
    x1: int = 140,
    x2: int = 1530,
    y1: int = 2115,
    y2: int = 2320,
    gc: tuple = GRAPHITE_COLOR,
    seed: int = 901
) -> None:
    """
    Renders an elongated, highly detailed Renaissance celestial constellation banner (skymap sketch)
    covering the entire page width (x in [140, 1530], y in [2115, 2320]):
    - Double graduation borders with Right Ascension hours & degree ticks.
    - Sinusoidal Ecliptic (Via Solis) and Celestial Equator (Aequator Caelestis).
    - Dense Milky Way (Via Lactea) stippling meandering diagonally.
    - Detailed major constellations: Ursa Major, Cassiopeia, Cygnus & Lyra, Aquila,
      Orion with Belt & Nebula, Taurus & Pleiades cluster, Pegasus & Andromeda galaxy.
    - Gleaming starbursts on primary navigational guide stars with diffraction rays.
    - Authentic Renaissance astronomical annotations and declination lines.
    """
    np.random.seed(seed)
    ymid = (y1 + y2) // 2
    w_banner = x2 - x1

    # 1. Outer Astronomical Graduation Borders (Top & Bottom)
    draw_sketchy_line(canvas, (x1, y1), (x2, y1), gc, alpha_base=170, passes=1, seed=seed)
    draw_sketchy_line(canvas, (x1, y1 + 10), (x2, y1 + 10), gc, alpha_base=130, passes=1, seed=seed + 1)
    draw_sketchy_line(canvas, (x1, y2 - 10), (x2, y2 - 10), gc, alpha_base=130, passes=1, seed=seed + 2)
    draw_sketchy_line(canvas, (x1, y2), (x2, y2), gc, alpha_base=170, passes=1, seed=seed + 3)

    # Lateral border stops with Renaissance corner rivets
    cv2.line(canvas, (x1, y1), (x1, y2), (*gc, 180), 2, cv2.LINE_AA)
    cv2.line(canvas, (x1 + 6, y1), (x1 + 6, y2), (*gc, 120), 1, cv2.LINE_AA)
    cv2.line(canvas, (x2 - 6, y1), (x2 - 6, y2), (*gc, 120), 1, cv2.LINE_AA)
    cv2.line(canvas, (x2, y1), (x2, y2), (*gc, 180), 2, cv2.LINE_AA)

    for cx_rivet in [x1 + 3, x2 - 3]:
        cv2.circle(canvas, (cx_rivet, y1 + 5), 2, (*gc, 210), -1)
        cv2.circle(canvas, (cx_rivet, y2 - 5), 2, (*gc, 210), -1)

    # Graduation ticks along top & bottom rims
    for gx in range(x1 + 12, x2 - 12, 12):
        is_major = (gx - x1) % 60 < 12
        t_len_top = 8 if is_major else 4
        t_len_bot = 8 if is_major else 4
        cv2.line(canvas, (gx, y1), (gx, y1 + t_len_top), (*gc, 160 if is_major else 110), 1, cv2.LINE_AA)
        cv2.line(canvas, (gx, y2), (gx, y2 - t_len_bot), (*gc, 160 if is_major else 110), 1, cv2.LINE_AA)

    # 2. Celestial Coordinate Framework (Equator, Tropics, Ecliptic Sine Wave)
    # Aequator Caelestis (dashed centerline)
    for qx in range(x1 + 14, x2 - 14, 16):
        cv2.line(canvas, (qx, ymid), (qx + 9, ymid), (*gc, 85), 1, cv2.LINE_AA)

    # Tropics of Cancer & Capricorn (subtle dotted declination guides)
    for dec_y in [ymid - 48, ymid + 48]:
        for qx in range(x1 + 16, x2 - 16, 24):
            cv2.circle(canvas, (qx, dec_y), 1, (*gc, 65), -1)

    # Ecliptic Sine Wave (Via Solis) traversing across the sky
    ecl_pts = []
    for ex in range(x1 + 8, x2 - 8, 4):
        ey = int(round(ymid - 46.0 * np.sin(2.0 * np.pi * (ex - x1 - 100) / (w_banner * 0.95))))
        ecl_pts.append((ex, ey))

    for i in range(len(ecl_pts) - 1):
        cv2.line(canvas, ecl_pts[i], ecl_pts[i + 1], (*gc, 145), 1, cv2.LINE_AA)
        if i % 6 == 0:
            p1 = ecl_pts[i]
            p2 = ecl_pts[i + 1]
            dx, dy = p2[0] - p1[0], p2[1] - p1[1]
            mag = max(1e-4, np.hypot(dx, dy))
            nx, ny = -dy / mag, dx / mag
            tx1 = int(round(p1[0] - 4 * nx))
            ty1 = int(round(p1[1] - 4 * ny))
            tx2 = int(round(p1[0] + 4 * nx))
            ty2 = int(round(p1[1] + 4 * ny))
            cv2.line(canvas, (tx1, ty1), (tx2, ty2), (*gc, 125), 1, cv2.LINE_AA)

    # Right Ascension vertical hour meridians (fine dashed construction lines)
    for hx in range(x1 + 115, x2 - 40, 115):
        for hy in range(y1 + 14, y2 - 14, 18):
            cv2.line(canvas, (hx, hy), (hx, hy + 8), (*gc, 50), 1, cv2.LINE_AA)

    # 3. Via Lactea (The Milky Way) — Luminous diagonal stellar dust stippling
    for _ in range(400):
        t = np.random.uniform(0.0, 1.0)
        cx_mw = x1 + 280 + t * 800 + np.random.normal(0, 40)
        cy_mw = (y2 - 16) - t * (y2 - y1 - 32) + np.random.normal(0, 24)
        if x1 + 14 < cx_mw < x2 - 14 and y1 + 14 < cy_mw < y2 - 14:
            alpha_mw = int(np.random.uniform(40, 95))
            r_mw = 1 if np.random.rand() > 0.15 else 2
            cv2.circle(canvas, (int(round(cx_mw)), int(round(cy_mw))), r_mw, (*gc, alpha_mw), -1)

    # 4. Renaissance Constellations with Stick Lines & Starbursts
    def draw_star(sx: int, sy: int, mag_type: int = 1):
        if not (x1 + 10 < sx < x2 - 10 and y1 + 10 < sy < y2 - 10):
            return
        if mag_type == 1:
            cv2.circle(canvas, (sx, sy), 6, (*gc, 80), 1, cv2.LINE_AA)
            cv2.circle(canvas, (sx, sy), 3, (*gc, 230), -1)
            cv2.line(canvas, (sx - 14, sy), (sx + 14, sy), (*gc, 180), 1, cv2.LINE_AA)
            cv2.line(canvas, (sx, sy - 14), (sx, sy + 14), (*gc, 180), 1, cv2.LINE_AA)
            cv2.line(canvas, (sx - 8, sy - 8), (sx + 8, sy + 8), (*gc, 120), 1, cv2.LINE_AA)
            cv2.line(canvas, (sx - 8, sy + 8), (sx + 8, sy - 8), (*gc, 120), 1, cv2.LINE_AA)
        elif mag_type == 2:
            cv2.circle(canvas, (sx, sy), 4, (*gc, 85), 1, cv2.LINE_AA)
            cv2.circle(canvas, (sx, sy), 2, (*gc, 210), -1)
            cv2.line(canvas, (sx - 7, sy), (sx + 7, sy), (*gc, 140), 1, cv2.LINE_AA)
            cv2.line(canvas, (sx, sy - 7), (sx, sy + 7), (*gc, 140), 1, cv2.LINE_AA)
        else:
            cv2.circle(canvas, (sx, sy), 1, (*gc, 175), -1)

    # A. URSA MAJOR (The Great Bear & The Pointers) [X in 170, 310]
    um_stars = [
        ("Alkaid", 175, ymid - 32, 2),
        ("Mizar", 200, ymid - 44, 2),
        ("Alioth", 225, ymid - 38, 2),
        ("Megrez", 252, ymid - 32, 2),
        ("Phecda", 255, ymid - 4, 2),
        ("Merak", 290, ymid - 8, 1),
        ("Dubhe", 288, ymid - 38, 1),
    ]
    for i in range(len(um_stars) - 1):
        cv2.line(canvas, (um_stars[i][1], um_stars[i][2]), (um_stars[i + 1][1], um_stars[i + 1][2]), (*gc, 120), 1, cv2.LINE_AA)
    cv2.line(canvas, (252, ymid - 32), (288, ymid - 38), (*gc, 120), 1, cv2.LINE_AA)
    cv2.line(canvas, (288, ymid - 38), (285, y1 + 18), (*gc, 85), 1, cv2.LINE_AA)
    for name, sx, sy, m in um_stars:
        draw_star(sx, sy, m)

    # B. CASSIOPEIA (The Celestial Throne / 'W') [X in 345, 475]
    cas_stars = [
        (355, ymid - 24, 2),
        (380, ymid - 52, 1),
        (410, ymid - 36, 1),
        (440, ymid - 58, 2),
        (468, ymid - 42, 2),
    ]
    for i in range(len(cas_stars) - 1):
        cv2.line(canvas, (cas_stars[i][0], cas_stars[i][1]), (cas_stars[i + 1][0], cas_stars[i + 1][1]), (*gc, 120), 1, cv2.LINE_AA)
    for sx, sy, m in cas_stars:
        draw_star(sx, sy, m)

    # C. CYGNUS & LYRA (Northern Cross & Brilliant Vega) [X in 510, 710]
    deneb = (600, ymid - 54)
    sadr = (602, ymid - 18)
    albireo = (604, ymid + 38)
    gienah = (558, ymid - 12)
    del_cyg = (648, ymid - 24)
    cv2.line(canvas, deneb, sadr, (*gc, 130), 1, cv2.LINE_AA)
    cv2.line(canvas, sadr, albireo, (*gc, 130), 1, cv2.LINE_AA)
    cv2.line(canvas, gienah, sadr, (*gc, 130), 1, cv2.LINE_AA)
    cv2.line(canvas, sadr, del_cyg, (*gc, 130), 1, cv2.LINE_AA)
    draw_star(deneb[0], deneb[1], 1)
    draw_star(sadr[0], sadr[1], 2)
    draw_star(albireo[0], albireo[1], 2)
    draw_star(gienah[0], gienah[1], 2)
    draw_star(del_cyg[0], del_cyg[1], 2)

    vega = (678, ymid - 48)
    draw_star(vega[0], vega[1], 1)
    ly_pts = [(668, ymid - 24), (690, ymid - 22), (694, ymid - 4), (672, ymid - 6)]
    for i in range(4):
        cv2.line(canvas, ly_pts[i], ly_pts[(i + 1) % 4], (*gc, 110), 1, cv2.LINE_AA)
        draw_star(ly_pts[i][0], ly_pts[i][1], 3)
    cv2.line(canvas, vega, ly_pts[0], (*gc, 110), 1, cv2.LINE_AA)

    # D. AQUILA (The Eagle & Brilliant Altair) [X in 750, 875]
    altair = (812, ymid + 8)
    tarazed = (802, ymid - 10)
    alshain = (822, ymid + 26)
    cv2.line(canvas, tarazed, altair, (*gc, 130), 1, cv2.LINE_AA)
    cv2.line(canvas, altair, alshain, (*gc, 130), 1, cv2.LINE_AA)
    cv2.line(canvas, (762, ymid + 16), tarazed, (*gc, 110), 1, cv2.LINE_AA)
    cv2.line(canvas, alshain, (864, ymid + 34), (*gc, 110), 1, cv2.LINE_AA)
    draw_star(altair[0], altair[1], 1)
    draw_star(tarazed[0], tarazed[1], 2)
    draw_star(alshain[0], alshain[1], 2)
    draw_star(762, ymid + 16, 3)
    draw_star(864, ymid + 34, 3)

    # E. ORION (The Hunter: Betelgeuse, Rigel, Belt & Nebula) [X in 920, 1105]
    betel = (952, ymid - 46)
    bella = (1014, ymid - 40)
    alnitak = (972, ymid + 2)
    alnilam = (984, ymid + 4)
    mintaka = (996, ymid + 6)
    saiph = (956, ymid + 50)
    rigel = (1018, ymid + 54)

    cv2.line(canvas, betel, bella, (*gc, 135), 1, cv2.LINE_AA)
    cv2.line(canvas, betel, alnitak, (*gc, 120), 1, cv2.LINE_AA)
    cv2.line(canvas, bella, mintaka, (*gc, 120), 1, cv2.LINE_AA)
    cv2.line(canvas, alnitak, alnilam, (*gc, 150), 1, cv2.LINE_AA)
    cv2.line(canvas, alnilam, mintaka, (*gc, 150), 1, cv2.LINE_AA)
    cv2.line(canvas, alnitak, saiph, (*gc, 120), 1, cv2.LINE_AA)
    cv2.line(canvas, mintaka, rigel, (*gc, 120), 1, cv2.LINE_AA)
    cv2.line(canvas, saiph, rigel, (*gc, 135), 1, cv2.LINE_AA)

    # Orion Nebula (M42) stippled cloud below belt
    for _ in range(40):
        neb_x = int(round(984 + np.random.normal(0, 4)))
        neb_y = int(round(ymid + 24 + np.random.normal(0, 6)))
        cv2.circle(canvas, (neb_x, neb_y), 1, (*gc, 90), -1)
    cv2.circle(canvas, (984, ymid + 24), 2, (*gc, 200), -1)
    cv2.line(canvas, alnilam, (984, ymid + 24), (*gc, 90), 1, cv2.LINE_AA)

    draw_star(betel[0], betel[1], 1)
    draw_star(bella[0], bella[1], 2)
    draw_star(alnitak[0], alnitak[1], 2)
    draw_star(alnilam[0], alnilam[1], 2)
    draw_star(mintaka[0], mintaka[1], 2)
    draw_star(saiph[0], saiph[1], 2)
    draw_star(rigel[0], rigel[1], 1)

    # F. TAURUS & THE PLEIADES [X in 1135, 1300]
    aldebaran = (1204, ymid - 14)
    elnath = (1232, ymid - 54)
    zeta_tau = (1248, ymid - 20)
    hyad1 = (1186, ymid - 24)
    hyad2 = (1190, ymid - 2)

    cv2.line(canvas, hyad1, aldebaran, (*gc, 130), 1, cv2.LINE_AA)
    cv2.line(canvas, aldebaran, hyad2, (*gc, 130), 1, cv2.LINE_AA)
    cv2.line(canvas, aldebaran, elnath, (*gc, 120), 1, cv2.LINE_AA)
    cv2.line(canvas, aldebaran, zeta_tau, (*gc, 120), 1, cv2.LINE_AA)
    draw_star(aldebaran[0], aldebaran[1], 1)
    draw_star(elnath[0], elnath[1], 2)
    draw_star(zeta_tau[0], zeta_tau[1], 2)
    draw_star(hyad1[0], hyad1[1], 3)
    draw_star(hyad2[0], hyad2[1], 3)

    # Pleiades tight jewel cluster
    plei_center = (1152, ymid - 48)
    cv2.circle(canvas, plei_center, 12, (*gc, 55), 1, cv2.LINE_AA)
    for px_off, py_off in [(-6, -3), (-2, -6), (2, -4), (6, -2), (4, 3), (0, 5), (-4, 2)]:
        cv2.circle(canvas, (plei_center[0] + px_off, plei_center[1] + py_off), 1, (*gc, 220), -1)

    # G. PEGASUS & ANDROMEDA [X in 1335, 1505]
    alpheratz = (1358, ymid - 44)
    scheat = (1428, ymid - 48)
    markab = (1422, ymid + 14)
    algenib = (1362, ymid + 16)
    cv2.line(canvas, alpheratz, scheat, (*gc, 130), 1, cv2.LINE_AA)
    cv2.line(canvas, scheat, markab, (*gc, 130), 1, cv2.LINE_AA)
    cv2.line(canvas, markab, algenib, (*gc, 130), 1, cv2.LINE_AA)
    cv2.line(canvas, algenib, alpheratz, (*gc, 130), 1, cv2.LINE_AA)
    draw_star(alpheratz[0], alpheratz[1], 1)
    draw_star(scheat[0], scheat[1], 2)
    draw_star(markab[0], markab[1], 2)
    draw_star(algenib[0], algenib[1], 2)

    mirach = (1474, ymid - 32)
    almach = (1502, ymid - 18)
    cv2.line(canvas, alpheratz, mirach, (*gc, 115), 1, cv2.LINE_AA)
    cv2.line(canvas, mirach, almach, (*gc, 115), 1, cv2.LINE_AA)
    draw_star(mirach[0], mirach[1], 2)
    draw_star(almach[0], almach[1], 2)

    # Andromeda Galaxy (M31)
    cv2.ellipse(canvas, (1482, ymid - 54), (10, 4), -30, 0, 360, (*gc, 85), 1, cv2.LINE_AA)
    cv2.circle(canvas, (1482, ymid - 54), 1, (*gc, 200), -1)

    # 5. Background Natural Field Stars
    for _ in range(160):
        fx = int(round(np.random.uniform(x1 + 18, x2 - 18)))
        fy = int(round(np.random.uniform(y1 + 16, y2 - 16)))
        draw_star(fx, fy, 3)

    # 6. Latin Scientific Constellation Callouts
    banner_labels = [
        ("Ursa Major", 215, ymid + 54),
        ("Cassiopeia", 390, ymid + 54),
        ("Cygnus", 600, ymid - 68),
        ("Lyra", 685, ymid + 36),
        ("Via Lactea", 740, ymid - 68),
        ("Aquila", 812, ymid + 58),
        ("Orion", 972, ymid + 72),
        ("Taurus", 1220, ymid + 56),
        ("Pleiades", 1152, ymid - 68),
        ("Pegasus", 1390, ymid + 56),
    ]
    for lbl_text, lx, ly in banner_labels:
        t_lbl, _ = render_pencil_text(lbl_text, FONT_PATH, font_size=19, gc=gc, seed=seed + lx)
        if t_lbl is not None:
            blit_rgba(canvas, t_lbl, lx - t_lbl.shape[1] // 2, ly - t_lbl.shape[0] // 2)


def render_face_4b(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """
    Renders Hoja 4 · Cara B (Page 7, holes on RIGHT: X > 1583 px).
    - Header: 'Anatomy of the Artifact' (font_size=62) + hand-drawn divider.
    - Central Exploded Assembly (cx=780) with Mater, Tympan, Rete, Alidade, Horse Wedge.
    - Left Column (X in [140, 560]): Component descriptions in readable font_size=32.
    - Right Margin (X in [1020, 1480]): Connecting guide lines with callouts (font_size=32).
    - Bottom Right: Da Vinci cross-section assembly cutaway diagram.
    - Footer: Panoramic Renaissance celestial constellation banner sketch across sheet width.
    """
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. Header & Divider
    t_img, base_out = render_pencil_text("Anatomy of the Artifact", FONT_PATH, font_size=62, gc=gc, seed=501)
    if t_img is not None:
        blit_rgba(canvas, t_img, 140, 195 - base_out)

    div = create_handdrawn_divider(width=1340, gc=gc, seed=502)
    blit_rgba(canvas, div, 140, 250 - div.shape[0] // 2)

    # 2. Central Exploded Astrolabe Assembly (cx=780)
    diagram_cx = 780
    draw_exploded_astrolabe(canvas, cx=diagram_cx, gc=gc, seed=505)

    # 3. Left Column: Vertically Aligned Component Notes (X in [140, 560])
    aligned_notes = [
        (420, "I. The Mater (The Mother)", [
            "Heavy outer bronze casing",
            "holding internal plates.",
            "Limbus divided into 24 hours",
            "and 360 angular degrees.",
            "Recessed bed prevents warping."
        ]),
        (835, "II. The Tympan (Horizon Plate)", [
            "Exchangeable disc engraved for",
            "Latitude 38* 12' (Sanctuary Datum).",
            "Stereographic curves show altitude",
            "circles converging at the zenith."
        ]),
        (1255, "III. The Rete (The Star Web)", [
            "Openwork bronze skeleton of sky.",
            "Concentric ring traces the zodiac.",
            "Flame pointers mark guide stars."
        ]),
        (1675, "IV. The Alidade (Sight Rule)", [
            "Revolving sighting ruler on back.",
            "Dual pinholes measure star altitude."
        ]),
        (1945, "V. The Horse Wedge (Equus)", [
            "Traditional locking wedge holding plates.",
            "Slips out instantly to swap horizons."
        ])
    ]

    for start_y, comp_title, lines in aligned_notes:
        c_title_img, _ = render_pencil_text(comp_title, FONT_PATH, font_size=35, gc=gc, seed=510 + start_y)
        if c_title_img is not None:
            blit_rgba(canvas, c_title_img, 140, start_y)
        y_step = start_y + 44
        for line in lines:
            l_img, _ = render_pencil_text(line, FONT_PATH, font_size=28, gc=gc, seed=520 + y_step)
            if l_img is not None:
                blit_rgba(canvas, l_img, 140, y_step)
            y_step += 35

    # 4. Right Side: Connecting Guide Lines & Callout Labels (X in [1000, 1480])
    # x_start matches the exact outer edge of each component
    callouts = [
        (530, "The Mater: 360* limbus & base frame", diagram_cx + 175 + 4),
        (950, "The Tympan: Almucantars for Lat. 38* 12'", diagram_cx + 155 + 4),
        (1370, "The Rete: Ecliptic band & 6 star pointers", diagram_cx + 155 + 4),
        (1760, "The Alidade: Elevation sighting ruler", diagram_cx + 26 + 6),
        (2000, "The Horse Wedge: Locks central axis pin", diagram_cx + 42),
    ]

    for y_comp, label_text, x_start in callouts:
        cv2.circle(canvas, (x_start, y_comp), 2, (*gc, 180), -1)
        draw_sketchy_line(canvas, (x_start, y_comp), (1020, y_comp), gc, alpha_base=130, passes=1, seed=550 + y_comp)
        cv2.line(canvas, (1014, y_comp - 3), (1020, y_comp), (*gc, 180), 1, cv2.LINE_AA)
        cv2.line(canvas, (1014, y_comp + 3), (1020, y_comp), (*gc, 180), 1, cv2.LINE_AA)

        c_img, _ = render_pencil_text(label_text, FONT_PATH, font_size=32, gc=gc, seed=560 + y_comp)
        if c_img is not None:
            blit_rgba(canvas, c_img, 1030, y_comp - c_img.shape[0] // 2)

    # 5. Rete Star Pointers Legend in Lower-Right Margin
    cs_x, cs_y = 1040, 1420

    t_stars_head, _ = render_pencil_text("The 6 Star Pointers (Mucrones)", FONT_PATH, font_size=30, gc=gc, seed=582)
    if t_stars_head is not None:
        blit_rgba(canvas, t_stars_head, cs_x + 10, cs_y)

    # 6 Guide stars in exact clockwise order matching Drawing 3 (The Rete)
    rete_stars = [
        "1. Ald  —  Aldebaran (Taurus)",
        "2. Pol  —  Polaris (Ursa Minor)",
        "3. Veg  —  Vega (Lyra)",
        "4. Alt  —  Altair (Aquila)",
        "5. Den  —  Deneb (Cygnus)",
        "6. Arc  —  Arcturus (Bootes)"
    ]
    cur_star_y = cs_y + 40
    for s_idx, s_txt in enumerate(rete_stars):
        s_img, _ = render_pencil_text(s_txt, FONT_PATH, font_size=25, gc=gc, seed=590 + s_idx * 7)
        if s_img is not None:
            blit_rgba(canvas, s_img, cs_x + 15, cur_star_y)
        cur_star_y += 34

    t_stars_foot, _ = render_pencil_text("Flame tips indicate sidereal hours on limbus", FONT_PATH, font_size=24, gc=gc, seed=588)
    if t_stars_foot is not None:
        blit_rgba(canvas, t_stars_foot, cs_x + 15, cur_star_y + 6)

    # 6. Bottom Decorative Celestial Constellation Banner (Full page width)
    draw_celestial_constellation_banner(canvas, x1=140, x2=1530, y1=2115, y2=2320, gc=gc, seed=901)

    return canvas


# -------------------------------------------------------------------------
# FACE 5A: THE MIDNIGHT CALIBRATION & INTERACTIVE OBSERVATION LOG
# -------------------------------------------------------------------------

def draw_nocturnal_planisphere(canvas: np.ndarray, cx: int, cy: int, rw: int, rh: int, gc: tuple = GRAPHITE_COLOR, seed: int = 601) -> None:
    """
    Renders an authentic, balanced Renaissance midnight sky planisphere with:
    - Marco del dibujo: Architectural double-line elliptical frame with perimeter ticks.
    - Concentric Altitude Almucantars: Exactly 5 degree lines (0*, 15*, 30*, 45*, 60*).
      The 0* line is distinctly inside the frame, NOT the frame itself.
    - 6 Guide Stars sitting precisely on their degree circles:
      * Polaris: Alt 30* (000* True North)
      * Deneb: Alt 30* (045* NE)
      * Vega: Alt 45* (090* E)
      * Altair: Alt 30* (180* S)
      * Aldebaran: Alt 15* (225* SW)
      * Arcturus: Alt 45* (270* W)
    - Constellations:
      * Ursa Major: In the northwest sky (zero pointer lines to Polaris).
      * Cassiopeia: Positioned sovereignly in the center, directly below the degree scale.
    - Zero inter-constellation connecting lines (no Summer Triangle, no diagonal rays).
    """
    np.random.seed(seed)

    # -------------------------------------------------------------------------
    # 1. ALTITUDE CIRCLE RADII & FRAME GEOMETRY
    # Exactly 5 degree circles: 0*, 15*, 30*, 45*, 60*
    # -------------------------------------------------------------------------
    scales = {0: 0.88, 15: 0.72, 30: 0.56, 45: 0.40, 60: 0.24}
    radii = {deg: (int(rw * s), int(rh * s)) for deg, s in scales.items()}

    # -------------------------------------------------------------------------
    # 2. GUIDE STAR POSITIONS (Each sits 100% on its degree circle)
    # -------------------------------------------------------------------------
    # Star 1: Polaris (North, Alt 30*)
    pol_x, pol_y = cx, cy - radii[30][1]

    # Star 2: Deneb (Cygnus) — Northeast (045* NE, Alt 30*)
    den_x = int(round(cx + radii[30][0] * 0.707))
    den_y = int(round(cy - radii[30][1] * 0.707))

    # Star 3: Vega (Lyra) — East (090* E, Alt 45*)
    veg_x = cx + radii[45][0]
    veg_y = cy

    # Star 4: Altair (Aquila) — South (180* S, Alt 30*)
    alt_x = cx
    alt_y = cy + radii[30][1]

    # Star 5: Aldebaran (Taurus) — Southwest (225* SW, Alt 15*)
    ald_x = int(round(cx - radii[15][0] * 0.707))
    ald_y = int(round(cy + radii[15][1] * 0.707))

    # Star 6: Arcturus (Bootes) — West (270* W, Alt 45*)
    arc_x = cx - radii[45][0]
    arc_y = cy

    # Dubhe (Alpha Ursae Majoris) radiant pointer star
    dubhe_x, dubhe_y = cx - 180, cy - int(rh * 0.48)

    star_positions = [
        (pol_x, pol_y), (den_x, den_y), (veg_x, veg_y),
        (alt_x, alt_y), (ald_x, ald_y), (arc_x, arc_y),
        (dubhe_x, dubhe_y)
    ]

    # -------------------------------------------------------------------------
    # 3. PRE-RENDER ALL TEXT LABELS (With clean halo clearances)
    # -------------------------------------------------------------------------
    text_blits = []

    # Perimeter Bearing Labels (Placed outside the frame — all 8 compass directions)
    bearing_labels = [
        ("000*  [N]", cx - 40, cy - rh - 30),
        ("045*  [NE]", int(cx + rw * 0.707) + 12, int(cy - rh * 0.707) - 14),
        ("090*  [E]",  cx + rw + 14, cy - 14),
        ("135*  [SE]", int(cx + rw * 0.707) + 12, int(cy + rh * 0.707) + 4),
        ("180*  [S]",  cx - 35, cy + rh + 8),
        ("225*  [SW]", int(cx - rw * 0.707) - 80, int(cy + rh * 0.707) + 4),
        ("270*  [W]",  cx - rw - 90, cy - 14),
        ("315*  [NW]", int(cx - rw * 0.707) - 80, int(cy - rh * 0.707) - 14),
    ]
    for lbl, lx, ly in bearing_labels:
        t_b, _ = render_pencil_text(lbl, FONT_PATH, font_size=20, gc=gc, seed=seed + lx)
        if t_b is not None:
            text_blits.append((t_b, lx, ly))

    # Altitude Marks along Meridian (Stacked clearly above the center: 0*, 15*, 30*, 45*, 60*)
    for deg in [0, 15, 30, 45, 60]:
        rw_d, rh_d = radii[deg]
        t_deg, _ = render_pencil_text(f"{deg}*", FONT_PATH, font_size=19, gc=gc, seed=seed + 100 + deg)
        if t_deg is not None:
            text_blits.append((t_deg, cx - 44, cy - rh_d - 10))

    # Star Labels
    t_pol, _ = render_pencil_text("Polaris  [Pol]", FONT_PATH, font_size=25, gc=gc, seed=seed + 20)
    if t_pol is not None:
        text_blits.append((t_pol, pol_x + 18, pol_y - 25))

    t_den, _ = render_pencil_text("Deneb  [Den]", FONT_PATH, font_size=25, gc=gc, seed=seed + 62)
    if t_den is not None:
        text_blits.append((t_den, den_x + 18, den_y - 25))

    t_veg, _ = render_pencil_text("Vega  [Veg]", FONT_PATH, font_size=25, gc=gc, seed=seed + 68)
    if t_veg is not None:
        text_blits.append((t_veg, veg_x + 28, veg_y + 8))

    t_alt, _ = render_pencil_text("Altair  [Alt]", FONT_PATH, font_size=25, gc=gc, seed=seed + 74)
    if t_alt is not None:
        text_blits.append((t_alt, alt_x - 45, alt_y + 20))

    t_ald, _ = render_pencil_text("Aldebaran  [Ald]", FONT_PATH, font_size=24, gc=gc, seed=seed + 92)
    if t_ald is not None:
        text_blits.append((t_ald, ald_x + 18, ald_y - 20))

    t_arc, _ = render_pencil_text("Arcturus  [Arc]", FONT_PATH, font_size=25, gc=gc, seed=seed + 86)
    if t_arc is not None:
        text_blits.append((t_arc, arc_x - 170, arc_y - 12))

    # Reference Asterism Labels
    t_ursa, _ = render_pencil_text("Ursa Major", FONT_PATH, font_size=24, gc=gc, seed=seed + 41)
    if t_ursa is not None:
        text_blits.append((t_ursa, cx - 330, 360))

    t_cas, _ = render_pencil_text("Cassiopeia", FONT_PATH, font_size=23, gc=gc, seed=seed + 55)
    if t_cas is not None:
        # Placed sovereignly in the center, below the degree scale
        text_blits.append((t_cas, cx - 45, cy + 8))

    # -------------------------------------------------------------------------
    # 4. DRAW BACKGROUND GUIDE LINES ONTO DEDICATED bg_layer (VERY SOFT)
    # -------------------------------------------------------------------------
    bg_layer = np.zeros_like(canvas)

    # Marco del dibujo: Outer celestial rim (architectural double ellipse)
    cv2.ellipse(bg_layer, (cx, cy), (rw, rh), 0, 0, 360, (*gc, 180), 2, cv2.LINE_AA)
    cv2.ellipse(bg_layer, (cx, cy), (rw - 8, rh - 6), 0, 0, 360, (*gc, 90), 1, cv2.LINE_AA)

    # Frame degree ticks (pointing inward from frame boundary)
    for deg in range(0, 360, 15):
        rad = np.deg2rad(deg)
        l_tick = 12 if deg % 45 == 0 else 6
        x1 = int(round(cx + rw * np.cos(rad)))
        y1 = int(round(cy + rh * np.sin(rad)))
        x2 = int(round(cx + (rw - l_tick) * np.cos(rad)))
        y2 = int(round(cy + (rh - int(l_tick * rh / rw)) * np.sin(rad)))
        cv2.line(bg_layer, (x1, y1), (x2, y2), (*gc, 120), 1, cv2.LINE_AA)

    # Concentric Altitude Ellipses (Almucantars) — EXACTLY 5 lines (0*, 15*, 30*, 45*, 60*)
    for deg in [0, 15, 30, 45, 60]:
        rw_d, rh_d = radii[deg]
        alpha = 45 if deg == 0 else 32
        cv2.ellipse(bg_layer, (cx, cy), (rw_d, rh_d), 0, 0, 360, (*gc, alpha), 1, cv2.LINE_AA)

    # Soft stippled Milky Way wash curving across the sky
    for _ in range(160):
        t = np.random.uniform(-1.0, 1.0)
        curve_y = cy + t * (rh * 0.75) + np.sin(t * 3.2) * 45.0
        curve_x = cx + t * (rw * 0.65) + np.random.normal(0, 35)
        if 0 <= int(curve_x) < CANVAS_WIDTH_PX and 0 <= int(curve_y) < CANVAS_HEIGHT_PX:
            cv2.circle(bg_layer, (int(curve_x), int(curve_y)), 1, (*gc, np.random.randint(10, 24)), -1)

    # -------------------------------------------------------------------------
    # 5. RENAISSANCE ENGRAVING HALO: ZERO COLLISIONS GUARANTEE
    # Clear background lines in margins around all text labels and star markers
    # -------------------------------------------------------------------------
    for t_img, tx, ty in text_blits:
        th, tw = t_img.shape[:2]
        m = 5
        y0, y1 = max(0, ty - m), min(CANVAS_HEIGHT_PX, ty + th + m)
        x0, x1 = max(0, tx - m), min(CANVAS_WIDTH_PX, tx + tw + m)
        bg_layer[y0:y1, x0:x1] = 0

    for sx, sy in star_positions:
        m = 8
        y0, y1 = max(0, sy - m), min(CANVAS_HEIGHT_PX, sy + m)
        x0, x1 = max(0, sx - m), min(CANVAS_WIDTH_PX, sx + m)
        bg_layer[y0:y1, x0:x1] = 0

    # Composite the pristine background layer into canvas
    blit_rgba(canvas, bg_layer, 0, 0)

    # Helper to draw a radiant star marker
    def draw_radiant_star(x: int, y: int, r: int = 5, gc_val: tuple = gc, bright: int = 235):
        cv2.circle(canvas, (x, y), r, (*gc_val, bright), -1)
        for d in [0, 45, 90, 135]:
            rad = np.deg2rad(d)
            dx = int(round((r + 6) * np.cos(rad)))
            dy = int(round((r + 6) * np.sin(rad)))
            cv2.line(canvas, (x - dx, y - dy), (x + dx, y + dy), (*gc_val, 160), 1, cv2.LINE_AA)

    # -------------------------------------------------------------------------
    # 6. DRAW STARS & ASTERISMS (Internal constellation lines only)
    # -------------------------------------------------------------------------

    # --- STAR 1: Polaris (North, Alt 30*) ---
    draw_radiant_star(pol_x, pol_y, r=5, bright=240)

    # --- ASTERISM: Ursa Major (The Big Dipper with Dubhe as bright guide star) ---
    dipper_pts = [
        (cx - 360, cy - int(rh * 0.40)),  # Alkaid
        (cx - 315, cy - int(rh * 0.45)),  # Mizar
        (cx - 270, cy - int(rh * 0.43)),  # Alioth
        (cx - 230, cy - int(rh * 0.46)),  # Megrez
        (cx - 230, cy - int(rh * 0.33)),  # Phecda
        (cx - 180, cy - int(rh * 0.34)),  # Merak
        (dubhe_x, dubhe_y),               # Dubhe (Alpha pointer star)
        (cx - 230, cy - int(rh * 0.46)),  # Back to Megrez
    ]
    for i in range(len(dipper_pts) - 1):
        cv2.line(canvas, dipper_pts[i], dipper_pts[i + 1], (*gc, 90), 1, cv2.LINE_AA)
    for pt in dipper_pts[:6]:
        cv2.circle(canvas, pt, 3, (*gc, 180), -1)
    # Dubhe shines as the radiant beacon star of Ursa Major!
    draw_radiant_star(dubhe_x, dubhe_y, r=5, bright=240)

    # --- ASTERISM: Cassiopeia (The Celestial W) --- Center below degree scale
    cas_pts = [
        (cx - 40, cy - 22),
        (cx - 20, cy - 8),
        (cx,      cy - 20),
        (cx + 20, cy - 6),
        (cx + 40, cy - 18)
    ]
    for i in range(len(cas_pts) - 1):
        cv2.line(canvas, cas_pts[i], cas_pts[i + 1], (*gc, 90), 1, cv2.LINE_AA)
    for pt in cas_pts:
        cv2.circle(canvas, pt, 3, (*gc, 180), -1)

    # --- STAR 2: Deneb (Cygnus / Northern Cross) ---
    draw_radiant_star(den_x, den_y, r=5, bright=235)
    cyg_pts = [
        (den_x, den_y),
        (den_x - 15, den_y + 25),
        (den_x - 30, den_y + 50),
        (den_x - 32, den_y + 10),
        (den_x + 5, den_y + 35)
    ]
    cv2.line(canvas, cyg_pts[0], cyg_pts[1], (*gc, 85), 1, cv2.LINE_AA)
    cv2.line(canvas, cyg_pts[1], cyg_pts[2], (*gc, 85), 1, cv2.LINE_AA)
    cv2.line(canvas, cyg_pts[3], cyg_pts[1], (*gc, 85), 1, cv2.LINE_AA)
    cv2.line(canvas, cyg_pts[1], cyg_pts[4], (*gc, 85), 1, cv2.LINE_AA)
    for cpt in cyg_pts[1:]:
        cv2.circle(canvas, cpt, 2, (*gc, 170), -1)

    # --- STAR 3: Vega (Lyra) — Elaborate Renaissance Lyre ---
    draw_radiant_star(veg_x, veg_y, r=5, bright=240)

    # Upper yoke arch directly anchoring Vega
    cv2.line(canvas, (veg_x - 18, veg_y + 2), (veg_x + 18, veg_y + 2), (*gc, 140), 1, cv2.LINE_AA)
    cv2.circle(canvas, (veg_x - 20, veg_y), 2, (*gc, 180), -1)
    cv2.circle(canvas, (veg_x + 20, veg_y), 2, (*gc, 180), -1)

    # Classical curved lyre arms
    left_arm = np.array([
        [veg_x - 18, veg_y + 2],
        [veg_x - 24, veg_y + 16],
        [veg_x - 16, veg_y + 34],
        [veg_x - 8,  veg_y + 44]
    ], dtype=np.int32)
    cv2.polylines(canvas, [left_arm], False, (*gc, 130), 1, cv2.LINE_AA)

    right_arm = np.array([
        [veg_x + 18, veg_y + 2],
        [veg_x + 24, veg_y + 16],
        [veg_x + 16, veg_y + 34],
        [veg_x + 8,  veg_y + 44]
    ], dtype=np.int32)
    cv2.polylines(canvas, [right_arm], False, (*gc, 130), 1, cv2.LINE_AA)

    # Soundbox base
    base_pts = np.array([
        [veg_x - 16, veg_y + 34],
        [veg_x - 8,  veg_y + 44],
        [veg_x,      veg_y + 47],
        [veg_x + 8,  veg_y + 44],
        [veg_x + 16, veg_y + 34]
    ], dtype=np.int32)
    cv2.polylines(canvas, [base_pts], False, (*gc, 140), 1, cv2.LINE_AA)
    cv2.line(canvas, (veg_x - 12, veg_y + 34), (veg_x + 12, veg_y + 34), (*gc, 100), 1, cv2.LINE_AA)

    # Lyre strings
    for off_x in [-8, -3, 3, 8]:
        cv2.line(canvas, (veg_x + off_x, veg_y + 3), (veg_x + off_x, veg_y + 34), (*gc, 75), 1, cv2.LINE_AA)

    # Classical star nodes of Lyra (Zeta, Epsilon, Sulafat, Sheliak)
    for sn in [(veg_x - 18, veg_y + 2), (veg_x + 18, veg_y + 2), (veg_x - 16, veg_y + 34), (veg_x + 16, veg_y + 34), (veg_x, veg_y + 47)]:
        cv2.circle(canvas, sn, 2, (*gc, 190), -1)

    # --- STAR 4: Altair (Aquila) ---
    draw_radiant_star(alt_x, alt_y, r=5, bright=235)
    cv2.line(canvas, (alt_x - 22, alt_y - 12), (alt_x + 22, alt_y + 12), (*gc, 80), 1, cv2.LINE_AA)
    cv2.circle(canvas, (alt_x - 22, alt_y - 12), 2, (*gc, 165), -1)
    cv2.circle(canvas, (alt_x + 22, alt_y + 12), 2, (*gc, 165), -1)

    # --- STAR 5: Aldebaran (Taurus) ---
    draw_radiant_star(ald_x, ald_y, r=5, bright=235)
    cv2.line(canvas, (ald_x, ald_y), (ald_x - 20, ald_y - 16), (*gc, 80), 1, cv2.LINE_AA)
    cv2.line(canvas, (ald_x, ald_y), (ald_x + 20, ald_y - 12), (*gc, 80), 1, cv2.LINE_AA)
    cv2.circle(canvas, (ald_x - 20, ald_y - 16), 2, (*gc, 165), -1)
    cv2.circle(canvas, (ald_x + 20, ald_y - 12), 2, (*gc, 165), -1)

    # --- STAR 6: Arcturus (Bootes) ---
    draw_radiant_star(arc_x, arc_y, r=5, bright=235)
    kite_pts = [
        (arc_x, arc_y),
        (arc_x - 22, arc_y - 25),
        (arc_x, arc_y - 50),
        (arc_x + 22, arc_y - 25),
        (arc_x, arc_y)
    ]
    for i in range(len(kite_pts) - 1):
        cv2.line(canvas, kite_pts[i], kite_pts[i + 1], (*gc, 80), 1, cv2.LINE_AA)

    # -------------------------------------------------------------------------
    # 7. BLIT ALL TEXT LABELS
    # -------------------------------------------------------------------------
    for t_img, tx, ty in text_blits:
        if t_img is not None:
            blit_rgba(canvas, t_img, tx, ty)


def render_face_5a(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """
    Renders Hoja 5 · Cara A (Page 8, holes on LEFT: X < 165 px).
    - Header: 'The Midnight Calibration' (font_size=64) + hand-drawn divider.
    - Top Half: Compact Grand Nocturnal Planisphere (cx=920, cy=530, rw=520, rh=240).
    - Mid Section: Four-Step Calibration Procedure aligned with physical notebook lines.
    - Lower Section: Interactive Observation Table for Silvia with rows matched 100%
      to the physical notebook ruling (Y = 1582, 1678, 1775, 1872, 1969, 2066, 2162).
    - Bottom: Accessible Renaissance Sanctuary Formula and spoiler-free footer.
    """
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. Header & Divider
    t_img, base_out = render_pencil_text("The Midnight Calibration", FONT_PATH, font_size=64, gc=gc, seed=601)
    if t_img is not None:
        blit_rgba(canvas, t_img, 240, 195 - base_out)

    div = create_handdrawn_divider(width=1340, gc=gc, seed=602)
    blit_rgba(canvas, div, 240, 248 - div.shape[0] // 2)

    # 2. Grand Nocturnal Planisphere (Compact rh=240 to leave generous space for ruled lines below)
    draw_nocturnal_planisphere(canvas, cx=920, cy=530, rw=520, rh=240, gc=gc, seed=605)

    # 3. Calibration Protocol Steps (Aligned with notebook lines at Y=1006, 1102, 1197, 1294)
    t_steps_head, base_sh = render_pencil_text("Procedure for True Sanctuary Alignment", FONT_PATH, font_size=36, gc=gc, seed=610)
    if t_steps_head is not None:
        blit_rgba(canvas, t_steps_head, 240, 840)

    steps = [
        ("1.  Suspend the astrolabe by its silk cord until the plumb bob hangs steady.", 1006),
        ("2.  Rotate the alidade ruler toward Polaris; lock the elevation index at 30*.", 1102),
        ("3.  Turn the Rete star web until the pointer of Vega matches the 45* altitude circle.", 1197),
        ("4.  Read the resulting perimeter mark: this angle points toward the mountain vault.", 1294),
    ]

    for step_txt, ly in steps:
        s_img, s_base = render_pencil_text(step_txt, FONT_PATH, font_size=31, gc=gc, seed=620 + ly)
        if s_img is not None:
            blit_rgba(canvas, s_img, 240, ly - s_base - 8)

    # 5. Interactive Observation Table for Silvia (Y in [1390, 2162])
    # Synchronized 1:1 with notebook lines: Y_lines = [1390, 1486, 1582, 1678, 1775, 1872, 1969, 2066, 2162]
    tbl_x = 240
    tbl_w = 1340

    # Table Title sitting cleanly on notebook line 1390 above the table (Zero collision with border!)
    t_tbl_head, base_th = render_pencil_text("Field Observation Log: Star Altitudes & Bearings", FONT_PATH, font_size=34, gc=gc, seed=630)
    if t_tbl_head is not None:
        blit_rgba(canvas, t_tbl_head, tbl_x, 1390 - base_th - 10)

    # Top border of table — coincides exactly with physical notebook line Y=1486!
    draw_sketchy_line(canvas, (tbl_x, 1486), (tbl_x + tbl_w, 1486), gc, alpha_base=180, passes=1, seed=635)

    # Table Headers sitting inside row [1486, 1582] with baseline aligned to line 1582
    headers = [
        (tbl_x + 15, "Target Guide Star"),
        (tbl_x + 345, "Measured Altitude"),
        (tbl_x + 705, "Horizon Bearing"),
        (tbl_x + 985, "Sanctuary Delta")
    ]
    for hx, htitle in headers:
        h_img, h_base = render_pencil_text(htitle, FONT_PATH, font_size=28, gc=gc, seed=640 + hx)
        if h_img is not None:
            blit_rgba(canvas, h_img, hx, 1582 - h_base - 10)

    # Bottom line of table headers / top of rows — coincides with notebook line Y=1582!
    draw_sketchy_line(canvas, (tbl_x, 1582), (tbl_x + tbl_w, 1582), gc, alpha_base=160, passes=1, seed=645)

    # 6 Rows for Silvia — perfectly synchronized with ruled lines at [1678, 1775, 1872, 1969, 2066, 2162]
    row_entries = [
        # (Star Name, Altitude, Bearing, Delta, notebook_line_y)
        (("Polaris (Ursa Minor)", "", "", ""), 1678),
        (("Vega (Lyra)", "", "", ""), 1775),
        (("Arcturus (Bootes)", "", "", ""), 1872),
        (("Aldebaran (Taurus)", "", "", ""), 1969),
        (("Deneb (Cygnus)", "", "", ""), 2066),
        (("Altair (Aquila)", "", "", ""), 2162)
    ]

    for (col1, col2, col3, col4), ly in row_entries:
        # Soft graphite reinforcement on the physical notebook line (zero double-lines!)
        draw_sketchy_line(canvas, (tbl_x, ly), (tbl_x + tbl_w, ly), gc, alpha_base=120, passes=1, seed=650 + ly)
        # End bracket marks
        cv2.line(canvas, (tbl_x, ly - 8), (tbl_x, ly), (*gc, 140), 1, cv2.LINE_AA)
        cv2.line(canvas, (tbl_x + tbl_w, ly - 8), (tbl_x + tbl_w, ly), (*gc, 140), 1, cv2.LINE_AA)

        for c_text, hx in zip([col1, col2, col3, col4], [tbl_x + 15, tbl_x + 345, tbl_x + 705, tbl_x + 985]):
            if c_text:
                c_img, c_base = render_pencil_text(c_text, FONT_PATH, font_size=28, gc=gc, seed=660 + ly + hx)
                if c_img is not None:
                    blit_rgba(canvas, c_img, hx, ly - c_base - 10)

    # Vertical column dividers — spanning exactly from top border (1486) to bottom border (2162)
    col_divs = [tbl_x, tbl_x + 330, tbl_x + 690, tbl_x + 970, tbl_x + tbl_w]
    for cdx in col_divs:
        draw_sketchy_line(canvas, (cdx, 1486), (cdx, 2162), gc, alpha_base=75, passes=1, seed=648 + cdx)

    # 6. Accessible Renaissance Sanctuary Formula & Mysterious Spoiler-Free Footer
    t_sph, s_base = render_pencil_text("Sanctuary Calibration:  Delta = (Horizon Bearing + Measured Altitude) - Latitude 38*", FONT_PATH, font_size=29, gc=gc, seed=685)
    if t_sph is not None:
        blit_rgba(canvas, t_sph, tbl_x + 90, 2258 - s_base - 10)

    note_foot, n_base = render_pencil_text("Six celestial alignments recorded. Only one unlocks the mountain vault, yet none know which until tested.", FONT_PATH, font_size=27, gc=gc, seed=690)
    if note_foot is not None:
        blit_rgba(canvas, note_foot, tbl_x + 25, 2355 - n_base - 10)

    return canvas


# -------------------------------------------------------------------------
# FACE 5B: NIGHT JOURNAL & DESERT CANYON PANORAMA
# -------------------------------------------------------------------------

def wrap_text_to_width(text: str, font_path: str, font_size: int, max_w: int) -> list:
    """Wraps text into lines that do not exceed max_w pixels."""
    font = ImageFont.truetype(font_path, font_size * 3)
    dummy = Image.new('RGBA', (10, 10))
    draw = ImageDraw.Draw(dummy)

    words = text.split()
    lines = []
    cur_line = []

    for word in words:
        test_line = " ".join(cur_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=font)
        w_px = (bbox[2] - bbox[0]) // 3
        if w_px <= max_w:
            cur_line.append(word)
        else:
            if cur_line:
                lines.append(" ".join(cur_line))
            cur_line = [word]

    if cur_line:
        lines.append(" ".join(cur_line))

    return lines


def draw_surveyor_quadrant_renaissance(
    canvas: np.ndarray,
    vx: int = 1180,
    vy: int = 280,
    r: int = 175,
    gc: tuple = GRAPHITE_COLOR,
    seed: int = 801
) -> None:
    """
    Renders an exquisite Leonardo / Kepler style brass Surveyor's Altitude Quadrant (90°).
    Features:
    - Sighting upper edge with two raised sighting vanes (pinholes).
    - Vertical reference edge with suspension loop.
    - Finely graduated 90° arc (0° to 90°) with major, medium, and fine degree ticks.
    - Internal Shadow Scale (Umbra Recta / Umbra Versa) grid with numbers.
    - Plumb-line suspended from vertex pivot, hanging at exactly 30° altitude (Polaris altitude).
    - Ornate brass biconical plumb bob at the end of the line.
    """
    np.random.seed(seed)

    # 1. Main outer quadrant frames
    cv2.line(canvas, (vx, vy), (vx + r + 15, vy), (*gc, 200), 2, cv2.LINE_AA)
    cv2.line(canvas, (vx, vy + 4), (vx + r, vy + 4), (*gc, 120), 1, cv2.LINE_AA)

    cv2.line(canvas, (vx, vy), (vx, vy + r + 15), (*gc, 200), 2, cv2.LINE_AA)
    cv2.line(canvas, (vx + 4, vy), (vx + 4, vy + r), (*gc, 120), 1, cv2.LINE_AA)

    # Sighting vanes on top horizontal edge
    for sx in [vx + 40, vx + r - 20]:
        cv2.rectangle(canvas, (sx - 4, vy - 14), (sx + 4, vy), (*gc, 210), 1, cv2.LINE_AA)
        cv2.circle(canvas, (sx, vy - 7), 2, (*gc, 230), -1)

    # Concentric arcs of the graduated limb
    r_outer = r
    r_mid = r - 12
    r_inner = r - 26
    cv2.ellipse(canvas, (vx, vy), (r_outer, r_outer), 0, 0, 90, (*gc, 210), 2, cv2.LINE_AA)
    cv2.ellipse(canvas, (vx, vy), (r_mid, r_mid), 0, 0, 90, (*gc, 140), 1, cv2.LINE_AA)
    cv2.ellipse(canvas, (vx, vy), (r_inner, r_inner), 0, 0, 90, (*gc, 170), 1, cv2.LINE_AA)

    # Degree graduations from 0° (vertical) to 90° (horizontal)
    for deg in range(0, 91, 1):
        rad = np.deg2rad(deg)
        cos_a = np.cos(rad)
        sin_a = np.sin(rad)

        if deg % 10 == 0:
            l_tick = 24
            alpha = 210
        elif deg % 5 == 0:
            l_tick = 16
            alpha = 170
        else:
            l_tick = 8
            alpha = 110

        p_out = (int(round(vx + r_outer * sin_a)), int(round(vy + r_outer * cos_a)))
        p_in = (int(round(vx + (r_outer - l_tick) * sin_a)), int(round(vy + (r_outer - l_tick) * cos_a)))
        cv2.line(canvas, p_out, p_in, (*gc, alpha), 1, cv2.LINE_AA)

    # Degree numbers for 0, 15, 30, 45, 60, 75, 90
    for deg in [0, 15, 30, 45, 60, 75, 90]:
        rad = np.deg2rad(deg)
        cos_a = np.cos(rad)
        sin_a = np.sin(rad)
        lbl_r = r_inner - 14
        lx = int(round(vx + lbl_r * sin_a)) - 8
        ly = int(round(vy + lbl_r * cos_a)) - 8
        t_num, _ = render_pencil_text(f"{deg}*", FONT_PATH, font_size=18, gc=gc, seed=seed + deg)
        if t_num is not None:
            blit_rgba(canvas, t_num, lx, ly)

    # Shadow Scale (Umbra Recta / Versa square inside quadrant)
    sq_size = int(r * 0.46)
    cv2.rectangle(canvas, (vx + 14, vy + 14), (vx + 14 + sq_size, vy + 14 + sq_size), (*gc, 125), 1, cv2.LINE_AA)
    cv2.line(canvas, (vx + 14, vy + 14), (vx + 14 + sq_size, vy + 14 + sq_size), (*gc, 90), 1, cv2.LINE_AA)
    for step in range(1, 4):
        pos = int(sq_size * (step / 4.0))
        cv2.line(canvas, (vx + 14 + pos, vy + 14), (vx + 14 + pos, vy + 14 + sq_size), (*gc, 75), 1, cv2.LINE_AA)
        cv2.line(canvas, (vx + 14, vy + 14 + pos), (vx + 14 + sq_size, vy + 14 + pos), (*gc, 75), 1, cv2.LINE_AA)

    t_umbra, _ = render_pencil_text("Umbra Recta / Versa", FONT_PATH, font_size=18, gc=gc, seed=seed + 101)
    if t_umbra is not None:
        blit_rgba(canvas, t_umbra, vx + 18, vy + sq_size + 22)

    # Plumb-line suspended from vertex (vx, vy)
    cv2.circle(canvas, (vx, vy), 7, (*gc, 220), -1)
    cv2.circle(canvas, (vx, vy), 11, (*gc, 160), 1, cv2.LINE_AA)

    # Plumb line at 30° altitude
    rad_plumb = np.deg2rad(30)
    sin_p = np.sin(rad_plumb)
    cos_p = np.cos(rad_plumb)
    plumb_len = r_outer + 36
    px_end = int(round(vx + plumb_len * sin_p))
    py_end = int(round(vy + plumb_len * cos_p))

    cv2.line(canvas, (vx, vy), (px_end, py_end), (*gc, 215), 1, cv2.LINE_AA)

    # Ornate biconical plumb bob
    bob_cx, bob_cy = px_end, py_end
    bob_pts = np.array([
        [bob_cx, bob_cy - 4],
        [bob_cx + 7, bob_cy + 8],
        [bob_cx, bob_cy + 22],
        [bob_cx - 7, bob_cy + 8]
    ], dtype=np.int32)
    cv2.fillPoly(canvas, [bob_pts], (*gc, 230), cv2.LINE_AA)
    cv2.polylines(canvas, [bob_pts], True, (*gc, 255), 1, cv2.LINE_AA)
    cv2.circle(canvas, (bob_cx, bob_cy - 4), 3, (*gc, 240), -1)

    # Highlight index at 30° reading
    idx_pt = (int(round(vx + r_outer * sin_p)), int(round(vy + r_outer * cos_p)))
    cv2.circle(canvas, idx_pt, 4, (*gc, 230), 1, cv2.LINE_AA)

    # Labels for the quadrant
    t_q_title, _ = render_pencil_text("Surveyor's Altitude Quadrant (90*)", FONT_PATH, font_size=28, gc=gc, seed=seed + 102)
    if t_q_title is not None:
        blit_rgba(canvas, t_q_title, vx - 80, vy + r + 46)

    t_q_reading, _ = render_pencil_text("Polaris Alt. Reading: 30* 00' N", FONT_PATH, font_size=27, gc=gc, seed=seed + 103)
    if t_q_reading is not None:
        blit_rgba(canvas, t_q_reading, vx - 80, vy + r + 82)


def draw_geodetic_survey_triangulation(
    canvas: np.ndarray,
    x0: int = 1080,
    y0: int = 605,
    w: int = 420,
    h: int = 410,
    gc: tuple = GRAPHITE_COLOR,
    seed: int = 850
) -> None:
    """
    Renders an authentic Renaissance survey triangulation study.
    Connects Base Station, Watchtower VI, and Distant Peak VII.
    """
    np.random.seed(seed)

    # Header divider
    draw_sketchy_line(canvas, (x0, y0), (x0 + w, y0), gc, alpha_base=140, passes=1, seed=seed + 1)

    t_head, _ = render_pencil_text("Geodetic Triangulation Study", FONT_PATH, font_size=30, gc=gc, seed=seed + 2)
    if t_head is not None:
        blit_rgba(canvas, t_head, x0 + 10, y0 + 14)

    # Geometric triangulation diagram
    pt_a = (x0 + 60, y0 + 225)
    pt_b = (x0 + 340, y0 + 175)
    pt_c = (x0 + 220, y0 + 105)

    draw_sketchy_line(canvas, pt_a, pt_b, gc, alpha_base=190, passes=2, seed=seed + 10)
    cv2.line(canvas, pt_a, pt_c, (*gc, 140), 1, cv2.LINE_AA)
    cv2.line(canvas, pt_b, pt_c, (*gc, 140), 1, cv2.LINE_AA)

    # Meridian North line from A
    cv2.line(canvas, pt_a, (pt_a[0], pt_a[1] - 75), (*gc, 170), 1, cv2.LINE_AA)
    cv2.circle(canvas, (pt_a[0], pt_a[1] - 75), 3, (*gc, 210), -1)
    t_north, _ = render_pencil_text("Meridian N", FONT_PATH, font_size=20, gc=gc, seed=seed + 11)
    if t_north is not None:
        blit_rgba(canvas, t_north, pt_a[0] - 28, pt_a[1] - 98)

    # Angle arc at station A (azimuth to Watchtower VI)
    cv2.ellipse(canvas, pt_a, (32, 32), 0, -90, 15, (*gc, 150), 1, cv2.LINE_AA)
    t_az_lbl, _ = render_pencil_text("112*", FONT_PATH, font_size=18, gc=gc, seed=seed + 12)
    if t_az_lbl is not None:
        blit_rgba(canvas, t_az_lbl, pt_a[0] + 28, pt_a[1] - 32)

    # Station markers (circles with dots)
    for pt, lbl in [(pt_a, "Station 0 (Wash)"), (pt_b, "Watchtower VI"), (pt_c, "Peak VII")]:
        cv2.circle(canvas, pt, 5, (*gc, 220), -1)
        cv2.circle(canvas, pt, 9, (*gc, 160), 1, cv2.LINE_AA)
        t_lbl, _ = render_pencil_text(lbl, FONT_PATH, font_size=22, gc=gc, seed=seed + 20 + pt[0])
        if t_lbl is not None:
            ox = -50 if pt == pt_a else (15 if pt == pt_b else -30)
            oy = 15 if pt != pt_c else -28
            blit_rgba(canvas, t_lbl, pt[0] + ox, pt[1] + oy)

    # Triangulation notes
    notes = [
        ("Base Baseline: 5,420 paces to Red Ridge", y0 + 265),
        ("Watchtower VI Azimuth: 112* East", y0 + 301),
        ("Magnetic Offset: +04* 15' (True N. Corr.)", y0 + 337),
        ("Apex Elevation (Peak VII): 1,240 varas", y0 + 373),
    ]
    for text, ny in notes:
        t_note, _ = render_pencil_text(text, FONT_PATH, font_size=26, gc=gc, seed=seed + ny)
        if t_note is not None:
            blit_rgba(canvas, t_note, x0 + 12, ny)


def draw_desert_frontier_masterwork(
    canvas: np.ndarray,
    x: int = 130,
    y: int = 1170,
    target_w: int = 1380,
    gc: tuple = GRAPHITE_COLOR,
) -> None:
    """
    Renders the authentic Renaissance Da Vinci masterwork landscape engraving
    for Hoja 5 · Cara B (The Desert Frontier).
    Features Watchtower VI on sandstone cliffs, canyon wash trail, three stone cairns,
    distant mountains, and celestial vault with radiant Polaris.
    Matches the exquisite visual standard of Page 1.
    """
    asset_path = os.path.join(PROJECT_ROOT, "journal", "page05", "assets", "desert_frontier_master_alpha.png")
    if not os.path.exists(asset_path):
        print(f"Warning: masterwork asset not found at {asset_path}")
        return

    strokes = cv2.imread(asset_path, cv2.IMREAD_UNCHANGED)
    if strokes is None:
        return

    target_h = int(round(strokes.shape[0] * (target_w / strokes.shape[1])))
    resized = cv2.resize(strokes, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)

    blit_rgba(canvas, resized, x, y)


def draw_canonical_dual_seals(
    canvas: np.ndarray,
    gc: tuple = GRAPHITE_COLOR,
    seed: int = 950
) -> None:
    """
    Renders both canonical seals side-by-side at the bottom:
    1. The Constellation Path (Stellar triangle & celestial astrolabe rings).
    2. The Desert Path (Sun with rays & desert dunes with astrolabe rings).
    Strictly emblems only: no intermediate arrows, no 'From Sky to Sand', and no text labels.
    """
    np.random.seed(seed)

    # Seal 1: The Constellation Path
    s1_cx, s1_cy, s1_r = 240, 2185, 46
    cv2.circle(canvas, (s1_cx, s1_cy), s1_r, (*gc, 215), 2, cv2.LINE_AA)
    cv2.circle(canvas, (s1_cx, s1_cy), s1_r - 5, (*gc, 140), 1, cv2.LINE_AA)
    cv2.circle(canvas, (s1_cx, s1_cy), s1_r - 12, (*gc, 185), 1, cv2.LINE_AA)

    for deg in range(0, 360, 45):
        rad = np.deg2rad(deg)
        x_o = int(round(s1_cx + s1_r * np.cos(rad)))
        y_o = int(round(s1_cy + s1_r * np.sin(rad)))
        x_i = int(round(s1_cx + (s1_r - 7) * np.cos(rad)))
        y_i = int(round(s1_cy + (s1_r - 7) * np.sin(rad)))
        cv2.line(canvas, (x_o, y_o), (x_i, y_i), (*gc, 215), 1, cv2.LINE_AA)

    scale_star = (s1_r - 14) / 170.0
    pt_top = (s1_cx, int(round(s1_cy - 116 * scale_star)))
    pt_left = (int(round(s1_cx - 116 * scale_star)), int(round(s1_cy + 74 * scale_star)))
    pt_right = (int(round(s1_cx + 116 * scale_star)), int(round(s1_cy + 74 * scale_star)))

    cv2.line(canvas, pt_top, pt_left, (*gc, 230), 2, cv2.LINE_AA)
    cv2.line(canvas, pt_top, pt_right, (*gc, 230), 2, cv2.LINE_AA)
    cv2.line(canvas, pt_left, pt_right, (*gc, 230), 2, cv2.LINE_AA)

    for pt in [pt_top, pt_left, pt_right]:
        cv2.circle(canvas, pt, 5, (*gc, 245), -1)
        cv2.circle(canvas, pt, 8, (*gc, 160), 1, cv2.LINE_AA)
    cv2.circle(canvas, (s1_cx, int(round(s1_cy + 9 * scale_star))), 3, (*gc, 235), -1)

    # Seal 2: The Desert Path
    s2_cx, s2_cy, s2_r = 370, 2185, 46
    cv2.circle(canvas, (s2_cx, s2_cy), s2_r, (*gc, 215), 2, cv2.LINE_AA)
    cv2.circle(canvas, (s2_cx, s2_cy), s2_r - 5, (*gc, 140), 1, cv2.LINE_AA)
    cv2.circle(canvas, (s2_cx, s2_cy), s2_r - 12, (*gc, 185), 1, cv2.LINE_AA)

    for deg in range(0, 360, 45):
        rad = np.deg2rad(deg)
        x_o = int(round(s2_cx + s2_r * np.cos(rad)))
        y_o = int(round(s2_cy + s2_r * np.sin(rad)))
        x_i = int(round(s2_cx + (s2_r - 7) * np.cos(rad)))
        y_i = int(round(s2_cy + (s2_r - 7) * np.sin(rad)))
        cv2.line(canvas, (x_o, y_o), (x_i, y_i), (*gc, 215), 1, cv2.LINE_AA)

    sun_cy = s2_cy - 12
    cv2.circle(canvas, (s2_cx, sun_cy), 11, (*gc, 235), -1)
    cv2.line(canvas, (s2_cx, sun_cy - 13), (s2_cx, sun_cy - 21), (*gc, 220), 2, cv2.LINE_AA)
    cv2.line(canvas, (s2_cx, sun_cy + 13), (s2_cx, sun_cy + 21), (*gc, 220), 2, cv2.LINE_AA)
    cv2.line(canvas, (s2_cx - 13, sun_cy), (s2_cx - 21, sun_cy), (*gc, 220), 2, cv2.LINE_AA)
    cv2.line(canvas, (s2_cx + 13, sun_cy), (s2_cx + 21, sun_cy), (*gc, 220), 2, cv2.LINE_AA)

    scale_dune = (s2_r - 14) / 176.0
    dune_pts = []
    for t_val in np.linspace(0, 1, 30):
        if t_val < 0.5:
            u = t_val * 2.0
            x = (1 - u)**2 * (-120) + 2 * (1 - u) * u * (-40) + u**2 * (30)
            y = (1 - u)**2 * (25) + 2 * (1 - u) * u * (-15) + u**2 * (18)
        else:
            u = (t_val - 0.5) * 2.0
            x = (1 - u)**2 * (30) + 2 * (1 - u) * u * (90) + u**2 * (120)
            y = (1 - u)**2 * (18) + 2 * (1 - u) * u * (-5) + u**2 * (25)
        dune_pts.append((int(round(s2_cx + x * scale_dune)), int(round(s2_cy + 8 + y * scale_dune))))

    for i in range(len(dune_pts) - 1):
        cv2.line(canvas, dune_pts[i], dune_pts[i + 1], (*gc, 225), 2, cv2.LINE_AA)


def render_face_5b(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """
    Renders Hoja 5 · Cara B (Page 9, holes on RIGHT: X > 1583 px).
    - Header: 'Field Log: The Desert Frontier' (font_size=62) + 1998 expedition date subtitle (font_size=28).
      Generously spaced (baseline separation: 77 px, 47+ px clear air).
    - Upper Left: Young Cartographer's personal 1998 field journal entries (3 sections, font_size=33 for titles,
      56 px drop to body text font_size=28, line_spacing=35, max_w=910px, 36 px between sections).
    - Upper Right: 90° Brass Surveyor's Altitude Quadrant & Geodetic Triangulation study.
    - Lower Half: Masterwork Da Vinci Desert Canyon Panorama (starts at Y=1200) with Watchtower VI,
      sandstone mesas, winding wash trail, three pyramidal dry-stone cairns, and dedicated Copper Benchmark Cartouche.
    - Bottom: Dual Canonical Path Seals (The Constellation Path & The Desert Path, clean emblems only)
      and signature 'The Cartographer'.
    """
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. Header & Date Subtitle (Generously Spaced)
    t_title, base_title = render_pencil_text("Field Log: The Desert Frontier", FONT_PATH, font_size=62, gc=gc, seed=701)
    if t_title is not None:
        blit_rgba(canvas, t_title, 140, 135 - base_title)

    t_date, base_date = render_pencil_text("Autumn, 1998  —  Twenty-eight years before the Call.", FONT_PATH, font_size=28, gc=gc, seed=702)
    if t_date is not None:
        blit_rgba(canvas, t_date, 142, 212 - base_date)

    div = create_handdrawn_divider(width=1340, gc=gc, seed=703)
    blit_rgba(canvas, div, 140, 250 - div.shape[0] // 2)

    # 2. Upper Right: Surveyor's Altitude Quadrant & Triangulation (X in [1080, 1500])
    draw_surveyor_quadrant_renaissance(canvas, vx=1180, vy=280, r=175, gc=gc, seed=801)
    draw_geodetic_survey_triangulation(canvas, x0=1080, y0=605, w=420, h=410, gc=gc, seed=850)

    # 3. Upper Left: Personal Field Journal from 1998 (X in [140, 1050])
    journal_sections = [
        ("I. The First Crossing into the Red Sands", (
            "I was twenty-four when I left the Sanctuary library behind, carrying only my brass quadrant, "
            "unfinished star plates, and the elder's forbidden charts. The scholars believed the desert was a "
            "barren waste of dead stone. They could not understand that the sand is the purest mirror of the "
            "cosmos; here the flat horizon allows the curvature of the earth to be weighed directly."
        )),
        ("II. Astronomy of the Dunes", (
            "For fourteen nights, I measured the altitude of Polaris from the dry ridge. At local midnight, "
            "the north star hangs fixed at thirty degrees above the horizon, anchoring the great turning vault "
            "of the night sky. By calculating the sun's meridian shadow at noon, I confirmed what was written: "
            "this latitude is no accident. It marks the fourth harmonic of the astrolabe."
        )),
        ("III. The Three Cairns & The Copper Benchmark", (
            "Before ascending to Outer Watchtower VI, I surveyed the dry wash bed below. To mark the route for "
            "the seeker who would one day follow my footsteps, I raised three stone cairns along the canyon "
            "wash, pointing south-southeast. Beneath the foundation stones of Cairn III, beneath a flat red "
            "sandstone slab, I buried the first copper benchmark plate engraved with the azimuth of 112 degrees."
        ))
    ]

    cur_y = 284
    for sec_title, paragraph_text in journal_sections:
        t_sec, _ = render_pencil_text(sec_title, FONT_PATH, font_size=33, gc=gc, seed=710 + cur_y)
        if t_sec is not None:
            blit_rgba(canvas, t_sec, 140, cur_y)
        cur_y += 56

        wrapped_lines = wrap_text_to_width(paragraph_text, FONT_PATH, font_size=28, max_w=910)
        for w_line in wrapped_lines:
            t_l, _ = render_pencil_text(w_line, FONT_PATH, font_size=28, gc=gc, seed=720 + cur_y)
            if t_l is not None:
                blit_rgba(canvas, t_l, 140, cur_y)
            cur_y += 35
        cur_y += 36

    # 4. Masterwork Desert Panorama (Starts cleanly at Y=1200 with ample breathing room)
    draw_desert_frontier_masterwork(canvas, x=130, y=1170, target_w=1380, gc=gc)

    # 5. Dual Canonical Path Seals (Clean emblems only, side-by-side)
    draw_canonical_dual_seals(canvas, gc=gc, seed=950)

    # 6. Signature: Strictly "The Cartographer"
    sig_img, sig_base = render_pencil_text("The Cartographer", FONT_PATH, font_size=56, gc=gc, seed=790)
    if sig_img is not None:
        sig_x = 960
        sig_y = 2135
        blit_rgba(canvas, sig_img, sig_x, sig_y)

        underline_y = sig_y + sig_base + 16
        sx1 = sig_x - 5
        sx2 = sig_x + sig_img.shape[1] + 35
        draw_sketchy_line(canvas, (sx1, underline_y), (sx2, underline_y), gc, alpha_base=170, passes=2, seed=795)
        cv2.line(canvas, (sx2, underline_y), (sx2 + 26, underline_y - 8), (*gc, 140), 1, cv2.LINE_AA)

    return canvas


# -------------------------------------------------------------------------
# BUILD PIPELINE
# -------------------------------------------------------------------------

def build_pages04_05(
    real_paper_photo_path: str,
    output_base_dir: str
) -> None:
    """Generates all production assets (PNG canvas, Vector PDF, Photorealistic Mockup) for all 4 faces."""
    p4_dir = os.path.join(output_base_dir, "page04")
    p5_dir = os.path.join(output_base_dir, "page05")
    os.makedirs(p4_dir, exist_ok=True)
    os.makedirs(p5_dir, exist_ok=True)

    print("=== Building Journal Pages 4 & 5 (Sheets 4 & 5 — The Astrolabe Codex) ===")

    bg_raw = None
    if os.path.exists(real_paper_photo_path):
        bg_raw = cv2.imread(real_paper_photo_path)
        if bg_raw is not None:
            bg_raw = cv2.resize(bg_raw, (CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX), interpolation=cv2.INTER_LANCZOS4)

    tasks = [
        ("Hoja 4 · Cara A (Page 6 — Introduction & Lore)", render_face_4a, p4_dir, "page04_front", False),
        ("Hoja 4 · Cara B (Page 7 — Exploded Astrolabe Anatomy)", render_face_4b, p4_dir, "page04_back", True),
        ("Hoja 5 · Cara A (Page 8 — Midnight Calibration & Planisphere)", render_face_5a, p5_dir, "page05_front", False),
        ("Hoja 5 · Cara B (Page 9 — Field Log: The Desert Frontier & Dual Seals)", render_face_5b, p5_dir, "page05_back", True),
    ]

    for title, renderer, out_dir, stem, is_back in tasks:
        print(f"\nRendering {title}...")
        canvas = renderer(gc=GRAPHITE_COLOR)

        pdf_dir = os.path.join(out_dir, "pdf")
        canvas_dir = os.path.join(out_dir, "canvases")
        mockup_dir = os.path.join(out_dir, "mockups")
        os.makedirs(pdf_dir, exist_ok=True)
        os.makedirs(canvas_dir, exist_ok=True)
        os.makedirs(mockup_dir, exist_ok=True)

        # 1. Transparent PNG Canvas
        canvas_path = os.path.join(canvas_dir, f"{stem}_canvas_A5_300dpi.png")
        cv2.imwrite(canvas_path, canvas)
        print(f"  -> Transparent Canvas: {canvas_path}")

        # 2. Print-Ready Vector PDF
        pdf_path = os.path.join(pdf_dir, f"{stem}_A5.pdf")
        PDFBuilder.save_a5_pdf_from_rgba(canvas, pdf_path, dpi=300)
        print(f"  -> Vector PDF: {pdf_path}")

        # 3. Photorealistic Mockup
        mockup_path = os.path.join(mockup_dir, f"{stem}_real_paper_mockup.jpg")
        if bg_raw is not None:
            bg_for_face = cv2.flip(bg_raw, 1) if is_back else bg_raw.copy()
            fg_rgb = canvas[:, :, :3].astype(np.float32)
            alpha = (canvas[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]
            mockup = (fg_rgb * alpha + bg_for_face.astype(np.float32) * (1.0 - alpha)).astype(np.uint8)
            cv2.imwrite(mockup_path, mockup, [cv2.IMWRITE_JPEG_QUALITY, 95])
            print(f"  -> Photorealistic Mockup: {mockup_path}")

    print("\n=== Successfully Completed Pages 4 & 5 (The Astrolabe Codex)! ===")


if __name__ == "__main__":
    paper_photo = os.path.join(PROJECT_ROOT, "journal", "page01", "real_paper_300dpi.png")
    journal_dir = os.path.join(PROJECT_ROOT, "journal")
    build_pages04_05(paper_photo, journal_dir)
