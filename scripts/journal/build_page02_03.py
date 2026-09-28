"""
Production pipeline for Pages 2 and 3 of the Journal (Sheets 2 & 3, comprising 4 faces).
Implements the Cipher Codex (The Eclipse Script) according to the Cartographer's Field Journal:
- Hoja 2 Cara A (Page 2): Title ("The Celestial Alphabet") + Intro Text + 7 Elongated Rectangles
  spanning from Y=550 to Y=2115 px (almost the full page height) + Accompanying margin studies
  (Armillary sphere, discarded glyph, horizon baseline).
- Hoja 2 Cara B (Page 3): NO TITLE + 7 Elongated Rectangles spanning from Y=220 to Y=2070 px
  (full page height) + Accompanying margin studies (Lunar crescent progression, trigonometry pad,
  mountain bearing visual).
- Hoja 3 Cara A (Page 4): NO TITLE + 7 Elongated Rectangles spanning from Y=220 to Y=2070 px
  (full page height) + Accompanying margin studies (Celestial planisphere, sextant altitude fan,
  gnomon shadow dial, 16-point compass rose).
- Hoja 3 Cara B (Page 5): NO PAGE TITLE + 5 Elongated Rectangles (Top, same width W=840 and format)
  from Y=200 to Y=1200 px + Section Divider + Two-Column Bottom:
  Renaissance Meridian Quadrant (Left) + Synthesis Notes & Signature (Right).

Key constraints implemented:
- STRICT PROTAGONISM OF THE ALPHABET: The boxes occupy 60% of page width and 85-90% of page height.
- UNIFIED ELEGANT FORMAT: W=840 px, H=180-200 px across all 26 glyphs on all 4 faces!
- Generous deduction space: ~490 px wide for Silvia with solid baseline and corner brackets [ ____________ ].
- Strictly NO pre-filled letters, strictly NO Roman numerals!
- Strictly SHUFFLED / RANDOM order for all 26 glyphs (7 on P2, 7 on P3, 7 on P4, 5 on P5 = 26 total).
- Sketches and diagonal notes act as rich accompanying marginalia providing authentic depth.
- 100% 2B graphite texture RGB(46, 42, 38).
"""

import os
import sys
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from scripts.journal.geometry import (
    CANVAS_WIDTH_PX,
    CANVAS_HEIGHT_PX,
    mm_to_px,
)
from scripts.journal.pdf_builder import PDFBuilder


GRAPHITE_COLOR = (46, 42, 38)
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FONT_PATH = os.path.join(PROJECT_ROOT, 'assets', 'fonts', 'MarckScript.ttf')
GLYPHS_DIR = os.path.join(PROJECT_ROOT, 'assets', 'general', 'glyphs', 'rendered_png')

# Fixed deterministic shuffled order of all 26 letters (a-z)
# Exactly 26 letters, zero alphabetical sequence, no letter repeated.
# Distribution: 7 on Page 2, 7 on Page 3, 7 on Page 4, 5 on Page 5 = 26 total.
SHUFFLED_GLYPHS = [
    'k', 'r', 'd', 'y', 'm', 'b', 't',  # Page 2 (7 glyphs)
    'o', 'f', 'w', 'a', 's', 'p', 'c',  # Page 3 (7 glyphs)
    'x', 'h', 'l', 'u', 'j', 'e', 'n',  # Page 4 (7 glyphs)
    'z', 'q', 'g', 'v', 'i'             # Page 5 (5 glyphs)
]


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
    nz = out_alpha > 0

    for c in range(3):
        target[y1:y2, x1:x2, c][nz] = np.clip(
            (src[sy1:sy2, sx1:sx2, c][nz] * src_alpha[nz] +
             target[y1:y2, x1:x2, c][nz] * tgt_alpha[nz] * (1.0 - src_alpha[nz])) / out_alpha[nz],
            0, 255
        ).astype(np.uint8)

    target[y1:y2, x1:x2, 3] = (out_alpha * 255).astype(np.uint8)


def create_handdrawn_divider(width: int = 1345, gc: tuple = GRAPHITE_COLOR, seed: int = 99) -> np.ndarray:
    """Renders an organic hand-drawn pencil divider with diamond ornament."""
    np.random.seed(seed)
    h = 30
    img = np.zeros((h, width, 4), dtype=np.uint8)
    cy = h // 2
    pts = []
    for x in range(0, width, 4):
        wave = np.sin(x / 140.0) * 1.2 + np.cos(x / 65.0) * 0.6
        tremor = np.random.uniform(-0.4, 0.4)
        y = cy + wave + tremor
        t = 1.0
        if x < 60:
            t = x / 60.0
        elif x > width - 60:
            t = (width - x) / 60.0
        pts.append((x, int(round(y)), t))

    for i in range(len(pts) - 1):
        p1 = (pts[i][0], pts[i][1])
        p2 = (pts[i + 1][0], pts[i + 1][1])
        alpha = int(round(180 * min(pts[i][2], pts[i + 1][2])))
        cv2.line(img, p1, p2, (*gc, alpha), 1, cv2.LINE_AA)

    cx = width // 2
    dia_pts = np.array([
        [cx, cy - 4],
        [cx + 5, cy],
        [cx, cy + 4],
        [cx - 5, cy]
    ], np.int32)
    cv2.fillPoly(img, [dia_pts], (*gc, 180))
    cv2.polylines(img, [dia_pts], True, (*gc, 210), 1, cv2.LINE_AA)
    return img


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
    grain = np.random.normal(0, 11, alpha.shape)
    textured = np.where(alpha > 10, np.clip(alpha * 0.88 + grain, 35, 235), alpha).astype(np.uint8)
    res_alpha = cv2.resize(textured, (arr.shape[1] // scale, arr.shape[0] // scale), interpolation=cv2.INTER_AREA)

    res = np.zeros((res_alpha.shape[0], res_alpha.shape[1], 4), dtype=np.uint8)
    for c in range(3):
        res[:, :, c] = gc[c]
    res[:, :, 3] = res_alpha
    return res, base_y // scale


def render_pencil_text_diagonal(
    text: str,
    font_path: str = FONT_PATH,
    font_size: int = 24,
    angle_deg: float = 0.0,
    gc: tuple = GRAPHITE_COLOR,
    seed: int = 42
) -> np.ndarray:
    """Renders text in 2B pencil cursive texture rotated diagonally by angle_deg degrees."""
    img_rgba, _ = render_pencil_text(text, font_path, font_size, gc, seed)
    if img_rgba is None:
        return None
    if abs(angle_deg) < 0.1:
        return img_rgba
    pil_img = Image.fromarray(img_rgba)
    rotated = pil_img.rotate(angle_deg, resample=Image.BICUBIC, expand=True)
    return np.array(rotated)


def draw_sketchy_line(
    canvas: np.ndarray,
    p1: tuple,
    p2: tuple,
    gc: tuple = GRAPHITE_COLOR,
    alpha_base: int = 175,
    passes: int = 2,
    jitter_amp: float = 0.7,
    seed: int = 42
) -> None:
    """Draws an organic multi-pass pencil stroke with natural hand tremor."""
    np.random.seed(seed)
    dist = int(np.hypot(p2[0] - p1[0], p2[1] - p1[1]))
    if dist < 2:
        return
    for p in range(passes):
        pts = []
        alpha = int(round(alpha_base * np.random.uniform(0.7, 1.0)))
        step = max(3, dist // 25)
        for s in range(0, dist + 1, step):
            t = s / float(dist)
            bx = p1[0] + (p2[0] - p1[0]) * t + np.random.uniform(-jitter_amp, jitter_amp)
            by = p1[1] + (p2[1] - p1[1]) * t + np.random.uniform(-jitter_amp, jitter_amp)
            pts.append((int(round(bx)), int(round(by))))
        for j in range(len(pts) - 1):
            cv2.line(canvas, pts[j], pts[j + 1], (*gc, alpha), 1, cv2.LINE_AA)


def draw_cartographer_elongated_box(
    canvas: np.ndarray,
    x1: int,
    y1: int,
    w: int = 840,
    h: int = 185,
    gc: tuple = GRAPHITE_COLOR,
    seed: int = 101
) -> None:
    """
    Renders an elongated horizontal cartographer cipher box (W=840, H=180-200):
    - Hand-drawn pencil perimeter with subtle corner overshoots.
    - Inside left: Glyph placement zone (centered at ~0.14 * w).
    - Inside middle: Handwritten arrow '—>'.
    - Inside right: Spacious transcription deduction space (~490 px) for Silvia with corner brackets
      [ ____________________________________ ].
    - Strictly NO pre-filled letters, NO Roman numerals!
    """
    np.random.seed(seed)
    ov = 7

    segments = [
        ((x1 - ov, y1), (x1 + w + ov, y1), True),
        ((x1 + w, y1 - ov), (x1 + w, y1 + h + ov), False),
        ((x1 + w + ov, y1 + h), (x1 - ov, y1 + h), True),
        ((x1, y1 + h + ov), (x1, y1 - ov), False),
    ]

    for (px1, py1), (px2, py2), is_horiz in segments:
        dist = int(np.hypot(px2 - px1, py2 - py1))
        pts = []
        bow_amp = np.random.uniform(-0.7, 0.7)
        for s in range(0, dist + 1, 3):
            t = s / float(dist)
            bx = px1 + (px2 - px1) * t
            by = py1 + (py2 - py1) * t
            wave = np.sin(t * np.pi) * bow_amp + np.random.uniform(-0.25, 0.25)
            if is_horiz:
                by += wave
            else:
                bx += wave
            pts.append((int(round(bx)), int(round(by))))

        for j in range(len(pts) - 1):
            alpha = int(round(np.random.uniform(150, 200)))
            cv2.line(canvas, pts[j], pts[j + 1], (*gc, alpha), 1, cv2.LINE_AA)

    # Middle handwritten arrow '—>'
    mx = x1 + int(w * 0.30)
    my = y1 + h // 2
    cv2.line(canvas, (mx - 16, my), (mx + 14, my), (*gc, 160), 1, cv2.LINE_AA)
    cv2.line(canvas, (mx + 6, my - 6), (mx + 15, my), (*gc, 160), 1, cv2.LINE_AA)
    cv2.line(canvas, (mx + 6, my + 6), (mx + 15, my), (*gc, 160), 1, cv2.LINE_AA)

    # Right transcription deduction space: solid pencil baseline with corner brackets
    lx1 = x1 + int(w * 0.38)
    lx2 = x1 + int(w * 0.94)
    by = y1 + int(h * 0.68)

    # End brackets
    cv2.line(canvas, (lx1, by - 16), (lx1, by + 4), (*gc, 160), 1, cv2.LINE_AA)
    cv2.line(canvas, (lx1, by + 4), (lx1 + 10, by + 4), (*gc, 160), 1, cv2.LINE_AA)
    cv2.line(canvas, (lx2, by - 16), (lx2, by + 4), (*gc, 160), 1, cv2.LINE_AA)
    cv2.line(canvas, (lx2, by + 4), (lx2 - 10, by + 4), (*gc, 160), 1, cv2.LINE_AA)

    # Continuous subtle pencil baseline for handwriting
    cv2.line(canvas, (lx1 + 14, by + 4), (lx2 - 14, by + 4), (*gc, 120), 1, cv2.LINE_AA)


def place_glyph_in_elongated_box(
    canvas: np.ndarray,
    letter: str,
    box_x: int,
    box_y: int,
    box_w: int = 840,
    box_h: int = 185,
    target_h: int = 108,
    gc: tuple = GRAPHITE_COLOR
) -> None:
    """Places the textured graphite glyph prominently in the left zone of the elongated box."""
    glyph_path = os.path.join(GLYPHS_DIR, f"glyph_{letter.lower()}.png")
    if not os.path.exists(glyph_path):
        return
    glyph_img = cv2.imread(glyph_path, cv2.IMREAD_UNCHANGED)
    if glyph_img is None:
        return

    gh, gw = glyph_img.shape[:2]
    target_w = int(gw * (target_h / float(gh)))
    resized = cv2.resize(glyph_img, (target_w, target_h), interpolation=cv2.INTER_AREA)

    # Center in left ~15% zone of the box
    cx = box_x + int(box_w * 0.15)
    cy = box_y + box_h // 2
    gx = cx - target_w // 2
    gy = cy - target_h // 2
    blit_rgba(canvas, resized, gx, gy)


# -------------------------------------------------------------------------
# ACCOMPANYING MARGINALIA SKETCHES & NOTES (Providing Depth & Detail)
# -------------------------------------------------------------------------

# --- PAGE 2 ACCOMPANYING MARGINALIA ---

def sketch_page02_accompanying_studies(canvas: np.ndarray, gc: tuple = GRAPHITE_COLOR) -> None:
    """
    Renders rich accompanying cartographic studies in the right margin of Page 2 (X in [1080, 1540]):
    - Upper Right: Celestial Azimuth Sighting Ring with polar axis and diagonal ray/text.
    - Mid Right: Discarded spurious glyph with vigorous graphite cross-out and '?'.
    - Lower Right: Sighting elevation baseline and desert horizon contour.
    """
    seed = 120
    np.random.seed(seed)

    # 1. UPPER RIGHT: Celestial Azimuth Ring (cx=1310, cy=860, R=140)
    cx, cy, r = 1310, 860, 140

    draw_sketchy_line(canvas, (cx - r - 45, cy), (cx + r + 45, cy), gc, alpha_base=85, passes=1, seed=seed + 1)
    draw_sketchy_line(canvas, (cx, cy - r - 50), (cx, cy + r + 55), gc, alpha_base=85, passes=1, seed=seed + 2)

    # Polar axis tilted at -40 degrees
    p_rad = np.deg2rad(-40)
    p_len = r + 65
    p1 = (int(round(cx - p_len * np.cos(p_rad))), int(round(cy - p_len * np.sin(p_rad))))
    p2 = (int(round(cx + p_len * np.cos(p_rad))), int(round(cy + p_len * np.sin(p_rad))))
    draw_sketchy_line(canvas, p1, p2, gc, alpha_base=160, passes=2, seed=seed + 3)

    cv2.circle(canvas, (cx, cy), r, (*gc, 180), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx + 1, cy - 1), r - 10, (*gc, 130), 1, cv2.LINE_AA)

    for deg in range(0, 91, 10):
        rad = np.deg2rad(deg)
        x1 = int(round(cx + r * np.cos(rad)))
        y1 = int(round(cy - r * np.sin(rad)))
        x2 = int(round(cx + (r - 12) * np.cos(rad)))
        y2 = int(round(cy - (r - 12) * np.sin(rad)))
        cv2.line(canvas, (x1, y1), (x2, y2), (*gc, 160), 1, cv2.LINE_AA)

    cv2.ellipse(canvas, (cx, cy), (r, int(r * 0.44)), -25, 0, 360, (*gc, 165), 1, cv2.LINE_AA)

    # Sighting ray shooting out toward top right
    ray_start = (cx, cy - r)
    ray_end = (1520, 610)
    draw_sketchy_line(canvas, ray_start, ray_end, gc, alpha_base=180, passes=2, seed=seed + 4)
    cv2.circle(canvas, ray_start, 4, (*gc, 200), -1)

    diag_arm = render_pencil_text_diagonal(
        "Sighting ray  —  declination drift: +18* 30'",
        FONT_PATH, font_size=30, angle_deg=22.0, gc=gc, seed=seed + 5
    )
    if diag_arm is not None:
        blit_rgba(canvas, diag_arm, 1150, 620)

    t_arm, _ = render_pencil_text("Celestial sighting ring", FONT_PATH, font_size=32, gc=gc, seed=seed + 6)
    if t_arm is not None:
        blit_rgba(canvas, t_arm, cx - 110, cy + r + 18)

    # 2. MID RIGHT: Discarded Spurious Glyph (cx=1310, cy=1320)
    gx, gy = 1310, 1320

    pts_glyph = np.array([[gx - 26, gy - 20], [gx + 26, gy - 20], [gx, gy + 28]], np.int32)
    cv2.polylines(canvas, [pts_glyph], True, (*gc, 140), 1, cv2.LINE_AA)
    cv2.circle(canvas, (gx, gy - 6), 8, (*gc, 140), 1, cv2.LINE_AA)

    # Tachón
    for _ in range(7):
        sx1 = gx - 36 + np.random.randint(-4, 4)
        sy1 = gy - 30 + np.random.randint(-4, 4)
        sx2 = gx + 38 + np.random.randint(-4, 4)
        sy2 = gy + 32 + np.random.randint(-4, 4)
        cv2.line(canvas, (sx1, sy1), (sx2, sy2), (*gc, np.random.randint(190, 230)), 2, cv2.LINE_AA)
    for _ in range(4):
        sx1 = gx - 32 + np.random.randint(-4, 4)
        sy1 = gy + 28 + np.random.randint(-4, 4)
        sx2 = gx + 34 + np.random.randint(-4, 4)
        sy2 = gy - 26 + np.random.randint(-4, 4)
        cv2.line(canvas, (sx1, sy1), (sx2, sy2), (*gc, np.random.randint(170, 210)), 2, cv2.LINE_AA)

    q_img, _ = render_pencil_text("?", FONT_PATH, font_size=56, gc=gc, seed=seed + 7)
    if q_img is not None:
        blit_rgba(canvas, q_img, gx + 52, gy - 36)

    diag_disc = render_pencil_text_diagonal(
        "Spurious sign  —  non-phonetic",
        FONT_PATH, font_size=30, angle_deg=-8.0, gc=gc, seed=seed + 8
    )
    if diag_disc is not None:
        blit_rgba(canvas, diag_disc, gx - 140, gy + 42)

    # 3. LOWER RIGHT: Horizon & Baseline Elevation (Y in [1700, 2120])
    draw_sketchy_line(canvas, (1100, 1920), (1530, 1920), gc, alpha_base=170, passes=2, seed=seed + 9)
    for tx in range(1120, 1520, 35):
        tl = 8 if (tx - 1120) % 70 == 0 else 4
        cv2.line(canvas, (tx, 1920), (tx, 1920 + tl), (*gc, 130), 1, cv2.LINE_AA)

    # Sanctuary Spire silhouette
    sp_x, sp_y = 1420, 1840
    cv2.line(canvas, (sp_x - 5, 1920), (sp_x, sp_y), (*gc, 190), 1, cv2.LINE_AA)
    cv2.line(canvas, (sp_x + 5, 1920), (sp_x, sp_y), (*gc, 190), 1, cv2.LINE_AA)
    cv2.circle(canvas, (sp_x, sp_y), 4, (*gc, 200), -1)

    diag_sight = render_pencil_text_diagonal(
        "Sightline to Sanctuary  —  112* E",
        FONT_PATH, font_size=30, angle_deg=-14.0, gc=gc, seed=seed + 10
    )
    if diag_sight is not None:
        blit_rgba(canvas, diag_sight, 1110, 1850)

    t_base, _ = render_pencil_text("Datum: Delta = 38* 14' 22\"", FONT_PATH, font_size=30, gc=gc, seed=seed + 11)
    if t_base is not None:
        blit_rgba(canvas, t_base, 1100, 1950)


# --- PAGE 3 ACCOMPANYING MARGINALIA ---

def sketch_page03_accompanying_studies(canvas: np.ndarray, gc: tuple = GRAPHITE_COLOR) -> None:
    """
    Renders rich accompanying cartographic studies in the right margin of Page 3 (X in [1000, 1510]):
    - Upper Right: Lunar crescent phase study along elliptical arc with diagonal parallax note.
    - Mid Right: Field trigonometry scratchpad with formulas and crossed-out arithmetic error.
    - Lower Right: Geodetic triangulation angle bearings and Peak VII sightline.
    """
    seed = 130
    np.random.seed(seed)

    # 1. UPPER RIGHT: Lunar Phase Study (cx=1260, cy=460, rx=230, ry=220)
    arc_center = (1260, 580)
    rx, ry = 230, 260
    cv2.ellipse(canvas, arc_center, (rx, ry), 0, 200, 340, (*gc, 160), 1, cv2.LINE_AA)

    for deg in [220, 260, 300]:
        rad = np.deg2rad(deg)
        px = int(round(arc_center[0] + rx * np.cos(rad)))
        py = int(round(arc_center[1] + ry * np.sin(rad)))
        cv2.circle(canvas, (px, py), 20, (*gc, 170), 1, cv2.LINE_AA)
        # Crescent terminator
        for ly in range(py - 16, py + 17, 3):
            dx = int(round(np.sqrt(max(0, 20**2 - (ly - py)**2))))
            cv2.line(canvas, (px - dx, ly), (px, ly), (*gc, 130), 1, cv2.LINE_AA)

    diag_lunar = render_pencil_text_diagonal(
        "Lunar parallax: 57' 02\" at perigee",
        FONT_PATH, font_size=30, angle_deg=-15.0, gc=gc, seed=seed + 1
    )
    if diag_lunar is not None:
        blit_rgba(canvas, diag_lunar, 1060, 310)

    t_node, _ = render_pencil_text("Ephemeris progression  —  Sector II", FONT_PATH, font_size=32, gc=gc, seed=seed + 2)
    if t_node is not None:
        blit_rgba(canvas, t_node, 1030, 590)

    # 2. MID RIGHT: Field Trigonometry Scratchpad (X in [1020, 1500], Y in [840, 1350])
    draw_sketchy_line(canvas, (1020, 860), (1490, 860), gc, alpha_base=130, passes=1, seed=seed + 3)
    draw_sketchy_line(canvas, (1020, 860), (1020, 1320), gc, alpha_base=130, passes=1, seed=seed + 4)

    t_pad_title, _ = render_pencil_text("Field Trigonometry Pad", FONT_PATH, font_size=34, gc=gc, seed=seed + 5)
    if t_pad_title is not None:
        blit_rgba(canvas, t_pad_title, 1040, 880)

    t_f1, _ = render_pencil_text("d = B . sin(a) / sin(g)", FONT_PATH, font_size=32, gc=gc, seed=seed + 6)
    if t_f1 is not None:
        blit_rgba(canvas, t_f1, 1040, 935)

    # Crossed-out arithmetic error with correction
    t_err, _ = render_pencil_text("d = 3,840 paces", FONT_PATH, font_size=32, gc=gc, seed=seed + 7)
    if t_err is not None:
        blit_rgba(canvas, t_err, 1040, 995)
        cv2.line(canvas, (1035, 1012), (1240, 1012), (*gc, 210), 2, cv2.LINE_AA)
        cv2.line(canvas, (1035, 1015), (1240, 1007), (*gc, 190), 2, cv2.LINE_AA)

    t_corr, _ = render_pencil_text("-> 3,912 paces (corr.)", FONT_PATH, font_size=32, gc=gc, seed=seed + 8)
    if t_corr is not None:
        blit_rgba(canvas, t_corr, 1260, 995)

    t_f2, _ = render_pencil_text("Zenith elevation h = 412 paces", FONT_PATH, font_size=30, gc=gc, seed=seed + 9)
    if t_f2 is not None:
        blit_rgba(canvas, t_f2, 1040, 1060)

    t_ref, _ = render_pencil_text("Midday heat shimmer compensated", FONT_PATH, font_size=30, gc=gc, seed=seed + 10)
    if t_ref is not None:
        blit_rgba(canvas, t_ref, 1040, 1115)

    # 3. LOWER RIGHT: Triangulation Network & Peak VII Bearing (Y in [1500, 2100])
    sta_a = (1050, 2020)
    sta_b = (1440, 2020)
    pk_vii = (1360, 1680)

    draw_sketchy_line(canvas, (sta_a[0] - 20, 2020), (sta_b[0] + 20, 2020), gc, alpha_base=180, passes=2, seed=seed + 11)
    draw_sketchy_line(canvas, sta_a, pk_vii, gc, alpha_base=160, passes=2, seed=seed + 12)
    draw_sketchy_line(canvas, sta_b, pk_vii, gc, alpha_base=160, passes=2, seed=seed + 13)

    cv2.circle(canvas, sta_a, 5, (*gc, 200), -1)
    cv2.circle(canvas, sta_b, 5, (*gc, 200), -1)
    cv2.circle(canvas, pk_vii, 5, (*gc, 210), -1)

    t_pk, _ = render_pencil_text("Peak VII (Sanctuary)", FONT_PATH, font_size=32, gc=gc, seed=seed + 14)
    if t_pk is not None:
        blit_rgba(canvas, t_pk, pk_vii[0] - 110, pk_vii[1] - 40)

    diag_tri = render_pencil_text_diagonal(
        "Direction 284* N to Observatory",
        FONT_PATH, font_size=30, angle_deg=26.0, gc=gc, seed=seed + 15
    )
    if diag_tri is not None:
        blit_rgba(canvas, diag_tri, 1070, 1780)

    t_base, _ = render_pencil_text("Baseline: 4,200 paces", FONT_PATH, font_size=30, gc=gc, seed=seed + 16)
    if t_base is not None:
        blit_rgba(canvas, t_base, 1120, 2040)


# --- PAGE 4 ACCOMPANYING MARGINALIA ---

def sketch_page04_accompanying_studies(canvas: np.ndarray, gc: tuple = GRAPHITE_COLOR) -> None:
    """
    Renders rich accompanying cartographic studies in the right margin of Page 4 (X in [1080, 1540]):
    - Upper Right: Celestial Planisphere / Star Chart (R=175) with stars, nebula, and precession vector.
    - Mid Right: Sextant Altitude Fan with Polaris elevation arc and diagonal text.
    - Lower Right: Solstitial Gnomon Dial & 16-point Renaissance Master Compass Rose.
    """
    seed = 140
    np.random.seed(seed)

    # 1. UPPER RIGHT: Celestial Planisphere (cx=1310, cy=520, R=175)
    cx, cy, r = 1310, 520, 175

    cv2.circle(canvas, (cx, cy), r, (*gc, 180), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), r - 10, (*gc, 130), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), int(r * 0.65), (*gc, 115), 1, cv2.LINE_AA)

    for deg in range(0, 360, 45):
        rad = np.deg2rad(deg)
        x2 = int(round(cx + r * np.cos(rad)))
        y2 = int(round(cy + r * np.sin(rad)))
        draw_sketchy_line(canvas, (cx, cy), (x2, y2), gc, alpha_base=85, passes=1, seed=seed + deg)

    # 12 Stars
    np.random.seed(seed + 55)
    star_angles = [18, 42, 65, 95, 130, 165, 210, 245, 280, 315, 75, 190]
    star_dists = [135, 95, 140, 70, 120, 85, 140, 105, 130, 60, 40, 110]
    star_pts = []

    for sa, sd in zip(star_angles, star_dists):
        rad = np.deg2rad(sa)
        sx = int(round(cx + sd * np.cos(rad)))
        sy = int(round(cy + sd * np.sin(rad)))
        star_pts.append((sx, sy))
        cv2.circle(canvas, (sx, sy), 3, (*gc, 200), -1)

    for i in range(3):
        draw_sketchy_line(canvas, star_pts[i], star_pts[i + 1], gc, alpha_base=120, passes=1, seed=seed + 70 + i)

    # Diagonal Precession Vector line
    vec_p1 = (cx + r + 30, cy - r + 30)
    vec_p2 = (cx - r - 15, cy + r - 40)
    draw_sketchy_line(canvas, vec_p1, vec_p2, gc, alpha_base=150, passes=2, seed=seed + 80)

    diag_chart = render_pencil_text_diagonal(
        "Precession vector  —  Sector IV",
        FONT_PATH, font_size=30, angle_deg=-24.0, gc=gc, seed=seed + 81
    )
    if diag_chart is not None:
        blit_rgba(canvas, diag_chart, 1100, 390)

    t_chart, _ = render_pencil_text("High Desert Planisphere", FONT_PATH, font_size=32, gc=gc, seed=seed + 82)
    if t_chart is not None:
        blit_rgba(canvas, t_chart, cx - 120, cy + r + 18)

    # 2. MID RIGHT: Sextant Altitude Fan (Y in [840, 1200])
    fax, fay = 1110, 1080
    draw_sketchy_line(canvas, (fax, fay), (1510, fay), gc, alpha_base=170, passes=2, seed=seed + 90)
    for deg in [14, 28, 38]:
        drad = np.deg2rad(deg)
        fx2 = int(round(fax + 380 * np.cos(drad)))
        fy2 = int(round(fay - 380 * np.sin(drad)))
        draw_sketchy_line(canvas, (fax, fay), (fx2, fy2), gc, alpha_base=140, passes=1, seed=seed + 92 + deg)

    cv2.ellipse(canvas, (fax, fay), (220, 220), 0, -38, 0, (*gc, 150), 1, cv2.LINE_AA)
    diag_fan = render_pencil_text_diagonal(
        "Polaris altitude: 38* 12'  —  Benchmark",
        FONT_PATH, font_size=30, angle_deg=-15.0, gc=gc, seed=seed + 95
    )
    if diag_fan is not None:
        blit_rgba(canvas, diag_fan, 1130, 950)

    # 3. LOWER RIGHT: Master 16-point Compass Rose (cx=1310, cy=1720, R=140)
    rcx, rcy, rr = 1310, 1720, 140

    cv2.circle(canvas, (rcx, rcy), rr, (*gc, 135), 1, cv2.LINE_AA)
    cv2.circle(canvas, (rcx, rcy), rr - 8, (*gc, 110), 1, cv2.LINE_AA)
    cv2.circle(canvas, (rcx, rcy), int(rr * 0.44), (*gc, 100), 1, cv2.LINE_AA)

    for idx, deg in enumerate(range(0, 360, 45)):
        rad = np.deg2rad(deg)
        rad_r = np.deg2rad(deg + 22.5)
        tip_x = int(round(rcx + rr * np.cos(rad)))
        tip_y = int(round(rcy + rr * np.sin(rad)))
        mid_x = int(round(rcx + int(rr * 0.44) * np.cos(rad_r)))
        mid_y = int(round(rcy + int(rr * 0.44) * np.sin(rad_r)))

        poly_shaded = np.array([[rcx, rcy], [tip_x, tip_y], [mid_x, mid_y]], np.int32)
        cv2.fillPoly(canvas, [poly_shaded], (*gc, 180 if deg == 270 else 135))
        draw_sketchy_line(canvas, (rcx, rcy), (tip_x, tip_y), gc, alpha_base=180, passes=1, seed=seed + 100 + idx)

    n_tip = (rcx, rcy - rr - 24)
    draw_sketchy_line(canvas, (rcx, rcy), n_tip, gc, alpha_base=210, passes=2, seed=seed + 110)
    cv2.circle(canvas, n_tip, 4, (*gc, 220), -1)

    t_n, _ = render_pencil_text("N", FONT_PATH, font_size=36, gc=gc, seed=seed + 111)
    if t_n is not None:
        blit_rgba(canvas, t_n, rcx - 12, n_tip[1] - 40)

    diag_mag = render_pencil_text_diagonal(
        "Declination: 4* 15' W of Polaris",
        FONT_PATH, font_size=30, angle_deg=-20.0, gc=gc, seed=seed + 112
    )
    if diag_mag is not None:
        blit_rgba(canvas, diag_mag, rcx - 180, rcy - rr - 20)

    # Discarded labyrinth key seal below compass
    dgx, dgy = 1310, 2040
    cv2.rectangle(canvas, (dgx - 20, dgy - 20), (dgx + 20, dgy + 20), (*gc, 150), 1, cv2.LINE_AA)
    for d in range(0, 720, 20):
        vrad = np.deg2rad(d)
        vr = (d / 720.0) * 32.0
        cv2.circle(canvas, (int(round(dgx + vr * np.cos(vrad))), int(round(dgy + vr * np.sin(vrad)))), 1, (*gc, 190), -1)

    t_seal, _ = render_pencil_text("?  architectural seal  —  non-phonetic", FONT_PATH, font_size=30, gc=gc, seed=seed + 115)
    if t_seal is not None:
        blit_rgba(canvas, t_seal, dgx - 170, dgy + 36)


# --- PAGE 5 (QUADRANT DRAWING & TOP RIGHT RETICLE) ---

def sketch_page05_top_reticle(canvas: np.ndarray, gc: tuple = GRAPHITE_COLOR) -> None:
    """Renders an intricate Astronomical Horizon Sighting Reticle beside the 5 boxes on Page 5."""
    seed = 150
    np.random.seed(seed)
    cx, cy, r = 1260, 680, 160

    cv2.circle(canvas, (cx, cy), r, (*gc, 175), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), r - 10, (*gc, 125), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), int(r * 0.45), (*gc, 105), 1, cv2.LINE_AA)

    draw_sketchy_line(canvas, (cx - r - 40, cy), (cx + r + 40, cy), gc, alpha_base=130, passes=1, seed=seed + 1)
    draw_sketchy_line(canvas, (cx, cy - r - 40), (cx, cy + r + 40), gc, alpha_base=130, passes=1, seed=seed + 2)

    for deg in range(0, 360, 10):
        rad = np.deg2rad(deg)
        tl = 10 if deg % 30 == 0 else 5
        x1 = int(round(cx + r * np.cos(rad)))
        y1 = int(round(cy + r * np.sin(rad)))
        x2 = int(round(cx + (r - tl) * np.cos(rad)))
        y2 = int(round(cy - (r - tl) * np.sin(rad)))
        cv2.line(canvas, (x1, y1), (x2, y2), (*gc, 140), 1, cv2.LINE_AA)

    s_start = (cx, cy)
    s_end = (cx + r + 45, cy - r + 25)
    draw_sketchy_line(canvas, s_start, s_end, gc, alpha_base=170, passes=2, seed=seed + 3)
    cv2.circle(canvas, s_end, 4, (*gc, 200), -1)

    diag_ret = render_pencil_text_diagonal(
        "Vernier precision: +/- 2 arcmin",
        FONT_PATH, font_size=30, angle_deg=-14.0, gc=gc, seed=seed + 4
    )
    if diag_ret is not None:
        blit_rgba(canvas, diag_ret, 1060, 540)

    t_ret1, _ = render_pencil_text("Fixed datum benchmark", FONT_PATH, font_size=32, gc=gc, seed=seed + 5)
    if t_ret1 is not None:
        blit_rgba(canvas, t_ret1, 1080, cy + r + 18)

    t_ret2, _ = render_pencil_text("Foundation stone", FONT_PATH, font_size=30, gc=gc, seed=seed + 6)
    if t_ret2 is not None:
        blit_rgba(canvas, t_ret2, 1130, cy + r + 54)


def draw_astronomical_quadrant(canvas: np.ndarray, x: int, y: int, size: int = 540, gc: tuple = GRAPHITE_COLOR) -> None:
    """
    Renders a Da Vinci / Renaissance brass astronomical quadrant with plumb bob and scales.
    Strictly restricted to 0 to 90 degrees quadrant quadrant (NO full circles that invade other zones).
    """
    ox, oy = x + 30, y + 30
    R = size - 60

    # Main outer arms (Right and Down only)
    draw_sketchy_line(canvas, (ox, oy), (ox + R, oy), gc, alpha_base=200, passes=2, seed=901)
    draw_sketchy_line(canvas, (ox, oy), (ox, oy + R), gc, alpha_base=200, passes=2, seed=902)

    draw_sketchy_line(canvas, (ox, oy - 6), (ox + R + 10, oy - 6), gc, alpha_base=140, passes=1, seed=903)
    draw_sketchy_line(canvas, (ox - 6, oy), (ox - 6, oy + R + 10), gc, alpha_base=140, passes=1, seed=904)

    # Quadrant arcs (0 to 90 degrees only)
    cv2.ellipse(canvas, (ox, oy), (R, R), 0, 0, 90, (*gc, 210), 2, cv2.LINE_AA)
    cv2.ellipse(canvas, (ox, oy), (R - 15, R - 15), 0, 0, 90, (*gc, 140), 1, cv2.LINE_AA)
    cv2.ellipse(canvas, (ox, oy), (R - 35, R - 35), 0, 0, 90, (*gc, 120), 1, cv2.LINE_AA)

    for deg in range(0, 91, 2):
        rad = np.deg2rad(deg)
        length = 15 if deg % 10 == 0 else (10 if deg % 5 == 0 else 5)
        r_inner = R - length
        x1 = int(round(ox + R * np.cos(rad)))
        y1 = int(round(oy + R * np.sin(rad)))
        x2 = int(round(ox + r_inner * np.cos(rad)))
        y2 = int(round(oy + r_inner * np.sin(rad)))
        alpha = 190 if deg % 10 == 0 else 130
        cv2.line(canvas, (x1, y1), (x2, y2), (*gc, alpha), 1, cv2.LINE_AA)

    for deg in [0, 30, 45, 60, 90]:
        rad = np.deg2rad(deg)
        tx = int(round(ox + (R - 54) * np.cos(rad))) - 14
        ty = int(round(oy + (R - 54) * np.sin(rad))) - 14
        d_img, _ = render_pencil_text(f"{deg}*", FONT_PATH, font_size=26, gc=gc, seed=deg)
        if d_img is not None:
            blit_rgba(canvas, d_img, tx, ty)

    # Internal inner quadrant decorative arcs (0 to 90 degrees only)
    r_rose = int(R * 0.42)
    cv2.ellipse(canvas, (ox, oy), (r_rose, r_rose), 0, 0, 90, (*gc, 125), 1, cv2.LINE_AA)
    cv2.ellipse(canvas, (ox, oy), (int(r_rose * 0.65), int(r_rose * 0.65)), 0, 0, 90, (*gc, 100), 1, cv2.LINE_AA)
    for deg in range(0, 91, 15):
        rad = np.deg2rad(deg)
        px = int(round(ox + r_rose * np.cos(rad)))
        py = int(round(oy + r_rose * np.sin(rad)))
        cv2.line(canvas, (ox, oy), (px, py), (*gc, 90), 1, cv2.LINE_AA)

    # Plumb bob line at 38 degrees
    rad_plumb = np.deg2rad(38)
    plumb_len = R + 42
    px_bob = int(round(ox + plumb_len * np.cos(rad_plumb)))
    py_bob = int(round(oy + plumb_len * np.sin(rad_plumb)))
    cv2.line(canvas, (ox, oy), (px_bob, py_bob), (*gc, 160), 1, cv2.LINE_AA)

    pts_bob = np.array([
        [px_bob, py_bob],
        [px_bob - 7, py_bob + 18],
        [px_bob, py_bob + 26],
        [px_bob + 7, py_bob + 18]
    ], np.int32)
    cv2.fillPoly(canvas, [pts_bob], (*gc, 190))
    cv2.polylines(canvas, [pts_bob], True, (*gc, 220), 1, cv2.LINE_AA)

    # Sighting pinules along top horizontal arm
    for vx in [ox + 50, ox + R - 50]:
        cv2.line(canvas, (vx, oy - 16), (vx, oy), (*gc, 200), 2, cv2.LINE_AA)
        cv2.circle(canvas, (vx, oy - 8), 3, (*gc, 170), 1, cv2.LINE_AA)

    l1, _ = render_pencil_text("Cartographer's Meridian Quadrant", FONT_PATH, font_size=32, gc=gc, seed=99)
    if l1 is not None:
        blit_rgba(canvas, l1, ox + 15, oy + R + 25)

    l2, _ = render_pencil_text("Elevation index: 38*  —  Polaris alignment", FONT_PATH, font_size=28, gc=gc, seed=100)
    if l2 is not None:
        blit_rgba(canvas, l2, ox + 15, oy + R + 60)


# -------------------------------------------------------------------------
# FACE RENDERERS
# -------------------------------------------------------------------------

def render_face_2a(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """
    Renders Hoja 2 Cara A (Page 2, holes on LEFT: X < 165 px).
    - Title: "The Celestial Alphabet" + Intro text (compacted, ending at Y ≈ 500)
    - 7 Elongated Rectangles (W=840, H=185) spanning from Y=550 down to Y=2115 px!
      Covers almost the FULL vertical height of the page!
    - Accompanying margin studies on Right (X in [1080, 1540]).
    """
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. Header & Divider
    t_img, base_out = render_pencil_text("The Celestial Alphabet", FONT_PATH, font_size=64, gc=gc, seed=201)
    if t_img is not None:
        blit_rgba(canvas, t_img, 240, 195 - base_out)

    div = create_handdrawn_divider(width=1345, gc=gc, seed=202)
    blit_rgba(canvas, div, 240, 245 - div.shape[0] // 2)

    # 2. Intro Text (ending comfortably above Y=520)
    intro_lines = [
        "These are the symbols that govern the heavens; the contours with which",
        "the ancient sanctuaries speak. I have recorded the twenty-six signs",
        "uncovered across the ruined towers of the desert kingdom.",
        "Study their geometry. Every dial and threshold responds to this script."
    ]
    for i, line_text in enumerate(intro_lines):
        y_line = 305 + i * 56
        line_img, l_base = render_pencil_text(line_text, FONT_PATH, font_size=38, gc=gc, seed=300 + i * 17)
        if line_img is not None:
            blit_rgba(canvas, line_img, 240, y_line - l_base)

    # 3. 7 Elongated Rectangles in 1 column (Left side: X in [220, 1060], W=840, H=185)
    # Spanning from Y=550 down to Y=2115 px!
    box_w = 840
    box_h = 185
    bx = 220
    y_starts = [550, 780, 1010, 1240, 1470, 1700, 1930]

    glyphs_2a = SHUFFLED_GLYPHS[0:7]
    for idx, (letter, by) in enumerate(zip(glyphs_2a, y_starts)):
        draw_cartographer_elongated_box(canvas, bx, by, box_w, box_h, gc=gc, seed=400 + idx * 31)
        place_glyph_in_elongated_box(canvas, letter, bx, by, box_w, box_h, target_h=105, gc=gc)

    # 4. Accompanying Margin Studies on Right (X in [1080, 1540])
    sketch_page02_accompanying_studies(canvas, gc=gc)

    return canvas


def render_face_2b(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """
    Renders Hoja 2 Cara B (Page 3, holes on RIGHT: X > 1571 px).
    - NO TITLE!
    - 7 Elongated Rectangles (W=840, H=200) spanning from Y=220 down to Y=2070 px!
      Covers the FULL vertical height of the page!
    - Accompanying margin studies on Right (X in [1010, 1510]).
    """
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. 7 Elongated Rectangles in 1 column (Left side: X in [140, 980], W=840, H=200)
    # Spanning from Y=220 down to Y=2070 px!
    box_w = 840
    box_h = 200
    bx = 140
    y_starts = [220, 495, 770, 1045, 1320, 1595, 1870]

    glyphs_2b = SHUFFLED_GLYPHS[7:14]
    for idx, (letter, by) in enumerate(zip(glyphs_2b, y_starts)):
        draw_cartographer_elongated_box(canvas, bx, by, box_w, box_h, gc=gc, seed=500 + idx * 29)
        place_glyph_in_elongated_box(canvas, letter, bx, by, box_w, box_h, target_h=110, gc=gc)

    # 2. Accompanying Margin Studies on Right (X in [1010, 1510])
    sketch_page03_accompanying_studies(canvas, gc=gc)

    return canvas


def render_face_3a(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """
    Renders Hoja 3 Cara A (Page 4, holes on LEFT: X < 165 px).
    - NO TITLE!
    - 7 Elongated Rectangles (W=840, H=200) spanning from Y=220 down to Y=2070 px!
      Covers the FULL vertical height of the page!
    - Accompanying margin studies on Right (X in [1080, 1540]).
    """
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. 7 Elongated Rectangles in 1 column (Left side: X in [220, 1060], W=840, H=200)
    # Spanning from Y=220 down to Y=2070 px!
    box_w = 840
    box_h = 200
    bx = 220
    y_starts = [220, 495, 770, 1045, 1320, 1595, 1870]

    glyphs_3a = SHUFFLED_GLYPHS[14:21]
    for idx, (letter, by) in enumerate(zip(glyphs_3a, y_starts)):
        draw_cartographer_elongated_box(canvas, bx, by, box_w, box_h, gc=gc, seed=600 + idx * 27)
        place_glyph_in_elongated_box(canvas, letter, bx, by, box_w, box_h, target_h=110, gc=gc)

    # 2. Accompanying Margin Studies on Right (X in [1080, 1540])
    sketch_page04_accompanying_studies(canvas, gc=gc)

    return canvas


def render_face_3b(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """
    Renders Hoja 3 Cara B (Page 5, holes on RIGHT: X > 1571 px).
    - NO PAGE TITLE!
    - Final 5 Glyphs in EXACT SAME single-column format (W=840, H=180) from Y=200 to Y=1200 px!
    - Top Right Reticle Study beside the boxes (X in [1010, 1510]).
    - Section Divider at Y=1240 px.
    - Two-Column Bottom Zone (Y in [1280, 2260]):
      * Left: Da Vinci Meridian Quadrant drawing
      * Right: "Convergence of the Bearings", Field Notes, Erratum, Signature
    """
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. Final 5 Glyphs in EXACT SAME FORMAT (W=840, H=180) in 1 column (Left side)
    box_w, box_h = 840, 180
    bx = 140
    row_ys = [200, 405, 610, 815, 1020]

    glyphs_3b = SHUFFLED_GLYPHS[21:26]
    for idx, (letter, by) in enumerate(zip(glyphs_3b, row_ys)):
        draw_cartographer_elongated_box(canvas, bx, by, box_w, box_h, gc=gc, seed=700 + idx * 37)
        place_glyph_in_elongated_box(canvas, letter, bx, by, box_w, box_h, target_h=105, gc=gc)

    # 2. Top Right Reticle Study (X in [1010, 1510], Y in [200, 1180])
    sketch_page05_top_reticle(canvas, gc=gc)

    # 3. Section Divider at Y=1240
    div = create_handdrawn_divider(width=1345, gc=gc, seed=901)
    blit_rgba(canvas, div, 140, 1240)

    # 4. LOWER ZONE: TWO COLUMNS (Y in [1280, 2260])
    # Left Column: Astronomical Quadrant
    draw_astronomical_quadrant(canvas, 140, 1280, size=520, gc=gc)

    # Horizon angle gauge sketch below the quadrant
    cv2.line(canvas, (170, 2030), (680, 2030), (*gc, 160), 1, cv2.LINE_AA)
    for tx in range(170, 681, 34):
        h_len = 12 if (tx - 170) % 68 == 0 else 6
        cv2.line(canvas, (tx, 2030), (tx, 2030 - h_len), (*gc, 140), 1, cv2.LINE_AA)
    lbl_quad, _ = render_pencil_text("Micrometer tangent graduation  —  Base horizon", FONT_PATH, font_size=30, gc=gc, seed=908)
    if lbl_quad is not None:
        blit_rgba(canvas, lbl_quad, 170, 2045)

    # Right Column: Notes & Signature
    notes_x = 700
    r_title, base_out = render_pencil_text("Convergence of the Bearings", FONT_PATH, font_size=50, gc=gc, seed=902)
    if r_title is not None:
        blit_rgba(canvas, r_title, notes_x, 1290)

    # Note: Clean handwritten header unmarred by colliding horizontal rules

    field_paragraphs = [
        "This celestial alphabet is not a code of words,",
        "but of directions and coordinates.",
        "Each mark represents an ancient path carved in stone,",
        "waiting for the observer to align it with the horizon.",
        "",
        "Follow the clues in strict order of discovery.",
        "What appears silent in these folios will reveal",
        "its meaning when the ancient sanctuary is reached.",
        "",
        "Trust the geometry. The stars do not deceive."
    ]

    for line_idx, p_text in enumerate(field_paragraphs):
        if not p_text:
            continue
        py = 1380 + line_idx * 48
        p_img, _ = render_pencil_text(p_text, FONT_PATH, font_size=35, gc=gc, seed=920 + line_idx * 11)
        if p_img is not None:
            blit_rgba(canvas, p_img, notes_x, py)

    # Erratum: Hand-drawn strikethrough crossing directly through the middle of the words
    strike_txt, strike_base = render_pencil_text("word translation", FONT_PATH, font_size=34, gc=gc, seed=950)
    if strike_txt is not None:
        strike_x = notes_x + 30
        strike_y = 1920
        blit_rgba(canvas, strike_txt, strike_x, strike_y)

        # Midline of lowercase letters: baseline is at (strike_y + strike_base)
        mid_y = strike_y + strike_base - int(34 * 0.35)
        x_start = strike_x + 6
        x_end = strike_x + strike_txt.shape[1] - 22

        # 2-pass organic hand tremor pencil strikethrough passing right across the text
        np.random.seed(952)
        pts_s1 = []
        for sx in range(x_start - 6, x_end + 8, 8):
            sy = int(round(mid_y + np.sin((sx - x_start) * 0.04) * 1.5 + np.random.normal(0, 0.5)))
            pts_s1.append((sx, sy))
        for i in range(len(pts_s1) - 1):
            cv2.line(canvas, pts_s1[i], pts_s1[i + 1], (*gc, 215), 2, cv2.LINE_AA)

        pts_s2 = []
        for sx in range(x_start + 2, x_end + 4, 10):
            sy = int(round(mid_y - 1 + np.cos((sx - x_start) * 0.05) * 1.0 + np.random.normal(0, 0.4)))
            pts_s2.append((sx, sy))
        for i in range(len(pts_s2) - 1):
            cv2.line(canvas, pts_s2[i], pts_s2[i + 1], (*gc, 185), 2, cv2.LINE_AA)

        corr_x = strike_x + strike_txt.shape[1] - 8
        corr_txt, _ = render_pencil_text("-> star alignment only", FONT_PATH, font_size=32, gc=gc, seed=951)
        if corr_txt is not None:
            blit_rgba(canvas, corr_txt, corr_x, strike_y)

    sig_img, sig_base = render_pencil_text("The Cartographer", FONT_PATH, font_size=48, gc=gc, seed=999)
    if sig_img is not None:
        sig_x = notes_x + 200
        sig_y = 2020
        blit_rgba(canvas, sig_img, sig_x, sig_y)

        # Flourish underline placed gracefully BELOW the baseline/descenders
        underline_y = sig_y + sig_base + 18
        sx1 = sig_x - 5
        sx2 = sig_x + sig_img.shape[1] - 25
        draw_sketchy_line(canvas, (sx1, underline_y), (sx2, underline_y), gc, alpha_base=160, passes=2, seed=995)
        cv2.line(canvas, (sx2, underline_y), (sx2 + 25, underline_y - 6), (*gc, 130), 1, cv2.LINE_AA)

    foot_txt, _ = render_pencil_text("Carved in the high desert, beneath the zenith of the solstices.", FONT_PATH, font_size=30, gc=gc, seed=998)
    if foot_txt is not None:
        blit_rgba(canvas, foot_txt, notes_x + 20, 2165)

    return canvas


# -------------------------------------------------------------------------
# BUILD PIPELINE
# -------------------------------------------------------------------------

def build_pages02_03(
    real_paper_photo_path: str,
    output_base_dir: str
) -> None:
    """Generates all production assets (PNG canvas, Vector PDF, Photorealistic Mockup) for all 4 faces."""
    p2_dir = os.path.join(output_base_dir, "page02")
    p3_dir = os.path.join(output_base_dir, "page03")
    os.makedirs(p2_dir, exist_ok=True)
    os.makedirs(p3_dir, exist_ok=True)

    print("=== Building Journal Pages 2 & 3 (Sheets 2 & 3 — All 4 Faces) ===")

    bg_raw = None
    if os.path.exists(real_paper_photo_path):
        bg_raw = cv2.imread(real_paper_photo_path)
        if bg_raw is not None:
            bg_raw = cv2.resize(bg_raw, (CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX), interpolation=cv2.INTER_LANCZOS4)

    tasks = [
        ("Hoja 2 · Cara A (Page 2)", render_face_2a, p2_dir, "page02_front", False),
        ("Hoja 2 · Cara B (Page 3)", render_face_2b, p2_dir, "page02_back", True),
        ("Hoja 3 · Cara A (Page 4)", render_face_3a, p3_dir, "page03_front", False),
        ("Hoja 3 · Cara B (Page 5)", render_face_3b, p3_dir, "page03_back", True),
    ]

    for title, renderer, out_dir, prefix, is_back in tasks:
        print(f"\nRendering {title}...")
        canvas_rgba = renderer(gc=GRAPHITE_COLOR)

        pdf_dir = os.path.join(out_dir, "pdf")
        canvas_dir = os.path.join(out_dir, "canvases")
        mockup_dir = os.path.join(out_dir, "mockups")
        os.makedirs(pdf_dir, exist_ok=True)
        os.makedirs(canvas_dir, exist_ok=True)
        os.makedirs(mockup_dir, exist_ok=True)

        # 1. Save Transparent 300 DPI Canvas PNG
        png_path = os.path.join(canvas_dir, f"{prefix}_canvas_A5_300dpi.png")
        pil_canvas = Image.fromarray(canvas_rgba)
        pil_canvas.save(png_path)
        print(f"  -> Transparent Canvas: {png_path}")

        # 2. Save Print-Ready 1:1 Vector A5 PDF
        pdf_path = os.path.join(pdf_dir, f"{prefix}_A5.pdf")
        PDFBuilder.save_a5_pdf_from_rgba(canvas_rgba, pdf_path, dpi=300)
        print(f"  -> Vector PDF: {pdf_path}")

        # 3. Save Photorealistic Mockup over real paper
        if bg_raw is not None:
            bg_current = cv2.flip(bg_raw, 1) if is_back else bg_raw.copy()
            fg_rgb = canvas_rgba[:, :, :3].astype(np.float32)
            alpha = (canvas_rgba[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]
            mockup = (fg_rgb * alpha + bg_current.astype(np.float32) * (1.0 - alpha)).astype(np.uint8)

            mockup_path = os.path.join(mockup_dir, f"{prefix}_real_paper_mockup.jpg")
            cv2.imwrite(mockup_path, mockup, [cv2.IMWRITE_JPEG_QUALITY, 95])
            print(f"  -> Photorealistic Mockup: {mockup_path}")

    print("\n=== Successfully Completed Pages 2 & 3 (All 4 Faces)! ===")


if __name__ == "__main__":
    paper_path = os.path.join(PROJECT_ROOT, "journal", "page01", "real_paper_300dpi.png")
    out_base = os.path.join(PROJECT_ROOT, "journal")
    build_pages02_03(paper_path, out_base)
