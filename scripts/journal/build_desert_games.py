#!/usr/bin/env python3
"""
Build Desert Games (Pages 15-18 — Hojas 8B, D1, D2)
===================================================
Generates four rich, interactive Renaissance-style game pages for the Desert Path:
  - Game D1 (Hoja 8 · Cara B — Page 15): The Whispering Chasm Maze (19x19 Canyon Labyrinth & Cairns).
  - Game D2 (Hoja D1 · Cara A — Page 16): The Desert Lexicon (8-word Crossword & PHOENIX Master Key).
  - Game D3 (Hoja D1 · Cara B — Page 17): The Oasis Clepsydra (Water Clock & 4x4 Logic Matrix).
  - Game D4 (Hoja D2 · Cara A — Page 18): The Polybius Stele (5x5 Nomad Cipher & Stele Inscription).

Strict Quality & Aesthetic Guidelines:
  - Pure 2B Graphite Palette: RGB(46, 42, 38).
  - Renaissance Da Vinci / Kepler Draftsmanship.
  - Zero Text Collisions.
  - Strict Binder Hole Margin Clearances:
      * Cara A: X < 165 px has 0 px.
      * Cara B: X > 1583 px has 0 px.
  - 300 DPI A5 Canvas: 1748 x 2480 px.
"""

import os
import sys
from collections import deque
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

# Add project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from scripts.journal.pdf_builder import PDFBuilder

# Constants
CANVAS_WIDTH_PX = 1748
CANVAS_HEIGHT_PX = 2480
GRAPHITE_COLOR = (46, 42, 38)
FONT_PATH = os.path.join(PROJECT_ROOT, "assets", "fonts", "Fondamento.ttf")


# -------------------------------------------------------------------------
# GRAPHICS UTILITIES
# -------------------------------------------------------------------------

def render_pencil_text(
    text: str,
    font_path: str,
    font_size: int,
    gc: tuple = GRAPHITE_COLOR,
    seed: int = 42
) -> tuple[np.ndarray, int]:
    """Renders text with slight graphite texture variation."""
    pil_font = ImageFont.truetype(font_path, font_size)
    dummy = Image.new("RGBA", (1, 1), (0, 0, 0, 0))
    d_draw = ImageDraw.Draw(dummy)
    bbox = d_draw.textbbox((0, 0), text, font=pil_font)
    w = bbox[2] - bbox[0] + 16
    h = bbox[3] - bbox[1] + 16
    baseline_offset = -bbox[1] + 8

    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.text((8 - bbox[0], 8 - bbox[1]), text, font=pil_font, fill=(*gc, 255))
    arr = np.array(img, dtype=np.uint8)

    rng = np.random.default_rng(seed)
    alpha = arr[:, :, 3].astype(np.float32) / 255.0
    noise = rng.normal(0.92, 0.08, alpha.shape)
    alpha_noisy = np.clip(alpha * noise, 0.0, 1.0)
    arr[:, :, 3] = (alpha_noisy * 255).astype(np.uint8)

    return arr, baseline_offset


def blit_rgba(target: np.ndarray, source: np.ndarray, x: int, y: int):
    """Blits an RGBA source onto an RGBA target with alpha blending."""
    th, tw = target.shape[:2]
    sh, sw = source.shape[:2]

    x1, y1 = max(0, x), max(0, y)
    x2, y2 = min(tw, x + sw), min(th, y + sh)

    if x1 >= x2 or y1 >= y2:
        return

    sx1, sy1 = x1 - x, y1 - y
    sx2, sy2 = sx1 + (x2 - x1), sy1 + (y2 - y1)

    src_crop = source[sy1:sy2, sx1:sx2]
    tgt_crop = target[y1:y2, x1:x2]

    src_a = src_crop[:, :, 3].astype(np.float32) / 255.0
    tgt_a = tgt_crop[:, :, 3].astype(np.float32) / 255.0

    out_a = src_a + tgt_a * (1.0 - src_a)
    nz = out_a > 1e-4

    for c in range(3):
        num = src_crop[:, :, c].astype(np.float32) * src_a + tgt_crop[:, :, c].astype(np.float32) * tgt_a * (1.0 - src_a)
        tgt_crop[nz, c] = np.clip(num[nz] / out_a[nz], 0, 255).astype(np.uint8)

    tgt_crop[:, :, 3] = np.clip(out_a * 255, 0, 255).astype(np.uint8)
    target[y1:y2, x1:x2] = tgt_crop


def draw_sketchy_line(
    canvas: np.ndarray,
    p1: tuple[int, int],
    p2: tuple[int, int],
    gc: tuple = GRAPHITE_COLOR,
    alpha_base: int = 170,
    passes: int = 2,
    seed: int = 42
):
    """Draws a hand-drawn pencil line with micro-wobble."""
    rng = np.random.default_rng(seed)
    p1, p2 = np.array(p1, dtype=np.float32), np.array(p2, dtype=np.float32)
    dist = np.linalg.norm(p2 - p1)
    if dist < 2:
        return

    num_pts = max(3, int(dist / 25))
    t_vals = np.linspace(0.0, 1.0, num_pts)

    for p in range(passes):
        pts = []
        for t in t_vals:
            base_pt = (1.0 - t) * p1 + t * p2
            wobble = rng.normal(0, 0.65 + p * 0.25, 2)
            pts.append(base_pt + wobble)
        pts = np.array(pts, dtype=np.int32)
        alpha = int(alpha_base * rng.uniform(0.75, 1.0))
        cv2.polylines(canvas, [pts], False, (*gc, alpha), 1, cv2.LINE_AA)


def draw_sketchy_rect(
    canvas: np.ndarray,
    rect: tuple[int, int, int, int],
    gc: tuple = GRAPHITE_COLOR,
    alpha_base: int = 180,
    passes: int = 2,
    seed: int = 42
):
    """Draws an organic hand-sketched rectangle."""
    x1, y1, x2, y2 = rect
    draw_sketchy_line(canvas, (x1, y1), (x2, y1), gc, alpha_base, passes, seed)
    draw_sketchy_line(canvas, (x2, y1), (x2, y2), gc, alpha_base, passes, seed + 1)
    draw_sketchy_line(canvas, (x2, y2), (x1, y2), gc, alpha_base, passes, seed + 2)
    draw_sketchy_line(canvas, (x1, y2), (x1, y1), gc, alpha_base, passes, seed + 3)


# -------------------------------------------------------------------------
# GAME D1: THE WHISPERING CHASM MAZE (Hoja 8 · Cara B)
# -------------------------------------------------------------------------

def render_game_d1(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Hoja 8 · Cara B (Game D1 — Topographical Canyon Labyrinth)."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. Header (Cara B: right margin safe, stops at X <= 1520)
    t_title, _ = render_pencil_text("The Whispering Chasm", FONT_PATH, font_size=58, gc=gc, seed=101)
    blit_rgba(canvas, t_title, 200, 80)

    draw_sketchy_line(canvas, (200, 180), (1520, 180), gc=gc, alpha_base=160, passes=2, seed=103)

    # 2. Maze Generation (Intricate 25x25 Grid with 231-step winding path & cycle shortcuts)
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

    # Strategic cycle & shortcut doors:
    # (2, 1) and (22, 23) create a seductive 63-step fast path to the exit that skips 5 cairns!
    # Additional doors create interconnecting loops, cross-junctions, and deceptive options.
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

    # Maze drawing bounds (1060x1060 px, cell size 42.4 px)
    mx0, my0 = 260, 240
    mw, mh = 1060, 1060
    cell_w = mw / w_cells
    cell_h = mh / h_cells

    # Outer Labyrinth Frame with physical openings for Entrance and Exit
    # Top and bottom borders
    draw_sketchy_line(canvas, (mx0 - 8, my0 - 8), (mx0 + mw + 8, my0 - 8), gc=gc, alpha_base=200, passes=2, seed=200)
    draw_sketchy_line(canvas, (mx0 - 8, my0 + mh + 8), (mx0 + mw + 8, my0 + mh + 8), gc=gc, alpha_base=200, passes=2, seed=201)

    # Left wall (with clear open portal at row 1)
    y_ent_top = int(round(my0 + cell_h * 1))
    y_ent_bot = int(round(my0 + cell_h * 2))
    draw_sketchy_line(canvas, (mx0 - 8, my0 - 8), (mx0 - 8, y_ent_top), gc=gc, alpha_base=200, passes=2, seed=202)
    draw_sketchy_line(canvas, (mx0 - 8, y_ent_bot), (mx0 - 8, my0 + mh + 8), gc=gc, alpha_base=200, passes=2, seed=203)
    draw_sketchy_line(canvas, (mx0 - 8, y_ent_top), (mx0, y_ent_top), gc=gc, alpha_base=180, passes=1, seed=204)
    draw_sketchy_line(canvas, (mx0 - 8, y_ent_bot), (mx0, y_ent_bot), gc=gc, alpha_base=180, passes=1, seed=205)

    # Right wall (with clear open exit at row 23)
    y_ext_top = int(round(my0 + cell_h * (h_cells - 2)))
    y_ext_bot = int(round(my0 + cell_h * (h_cells - 1)))
    draw_sketchy_line(canvas, (mx0 + mw + 8, my0 - 8), (mx0 + mw + 8, y_ext_top), gc=gc, alpha_base=200, passes=2, seed=206)
    draw_sketchy_line(canvas, (mx0 + mw + 8, y_ext_bot), (mx0 + mw + 8, my0 + mh + 8), gc=gc, alpha_base=200, passes=2, seed=207)
    draw_sketchy_line(canvas, (mx0 + mw, y_ext_top), (mx0 + mw + 8, y_ext_top), gc=gc, alpha_base=180, passes=1, seed=208)
    draw_sketchy_line(canvas, (mx0 + mw, y_ext_bot), (mx0 + mw + 8, y_ext_bot), gc=gc, alpha_base=180, passes=1, seed=209)

    # Render Canyon Walls with Topographical Hachures
    for r in range(h_cells):
        for c in range(w_cells):
            if maze[r, c] == 1:
                cx1 = int(round(mx0 + c * cell_w))
                cy1 = int(round(my0 + r * cell_h))
                cx2 = int(round(mx0 + (c + 1) * cell_w))
                cy2 = int(round(my0 + (r + 1) * cell_h))

                # Wall block with sketchy border
                draw_sketchy_rect(canvas, (cx1, cy1, cx2, cy2), gc=gc, alpha_base=150, passes=1, seed=300 + r * 30 + c)

                # Internal cliff relief hatching
                for hy in range(cy1 + 6, cy2 - 3, 11):
                    draw_sketchy_line(canvas, (cx1 + 4, hy), (cx2 - 4, hy), gc=gc, alpha_base=80, passes=1, seed=400 + hy * 7 + c)

    # 3. Entrance & Exit Banners (Prominent with arrows)
    t_ent, b_ent = render_pencil_text("North Portal ->", FONT_PATH, font_size=22, gc=gc, seed=501)
    blit_rgba(canvas, t_ent, mx0 - t_ent.shape[1] - 16, int(my0 + cell_h * 1.5 - b_ent // 2))

    t_ext, b_ext = render_pencil_text("-> Desert Oasis", FONT_PATH, font_size=22, gc=gc, seed=502)
    blit_rgba(canvas, t_ext, mx0 + mw + 16, int(my0 + cell_h * (h_cells - 1.5) - b_ext // 2))

    # 4. Inscribed Relic Cairns
    # 6 TRUE Cairns on the 231-step Master Path (Spelling M-I-R-A-G-E in strict order of traversal)
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

        # Medallion cairn stone (scaled for 42.4 px cells)
        cv2.circle(canvas, (center_x, center_y), 14, (*gc, 210), 1, cv2.LINE_AA)
        cv2.circle(canvas, (center_x, center_y), 17, (*gc, 100), 1, cv2.LINE_AA)

        # Subtle stone rays
        for a in range(0, 360, 45):
            rad = np.deg2rad(a)
            p1 = (int(round(center_x + 14 * np.cos(rad))), int(round(center_y + 14 * np.sin(rad))))
            p2 = (int(round(center_x + 18 * np.cos(rad))), int(round(center_y + 18 * np.sin(rad))))
            cv2.line(canvas, p1, p2, (*gc, 120), 1, cv2.LINE_AA)

        t_let, b_l = render_pencil_text(letter, FONT_PATH, font_size=19, gc=gc, seed=600 + idx)
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
        t_d, _ = render_pencil_text(d_txt, FONT_PATH, font_size=12, gc=gc, seed=700 + dr)
        blit_rgba(canvas, t_d, dx - t_d.shape[1] // 2, dy - t_d.shape[0] // 2)

    # 5. Instructions & Deduction Field
    draw_sketchy_line(canvas, (200, 1360), (1520, 1360), gc=gc, alpha_base=140, passes=2, seed=801)

    t_lore1, b_l1 = render_pencil_text("The Law of the Canyon Walkers:", FONT_PATH, font_size=32, gc=gc, seed=802)
    blit_rgba(canvas, t_lore1, 200, 1420 - b_l1)

    t_rule1, b_r1 = render_pencil_text("1. Never retrace your steps: no corridor or junction may be trodden or crossed more than once.", FONT_PATH, font_size=27, gc=gc, seed=803)
    blit_rgba(canvas, t_rule1, 200, 1495 - b_r1)

    t_rule2, b_r2 = render_pencil_text("2. Beware the swift path: the shortest way to the Oasis is a deceitful lure that skips the relics.", FONT_PATH, font_size=27, gc=gc, seed=804)
    blit_rgba(canvas, t_rule2, 200, 1565 - b_r2)

    t_rule3, b_r3 = render_pencil_text("3. You must discover and collect all six sacred runes in strict sequence before reaching the Oasis.", FONT_PATH, font_size=27, gc=gc, seed=805)
    blit_rgba(canvas, t_rule3, 200, 1635 - b_r3)

    t_rule4, b_r4 = render_pencil_text("4. Ponder each turning with care; entering a blind gorge or missing a rune will doom your passage.", FONT_PATH, font_size=26, gc=gc, seed=806)
    blit_rgba(canvas, t_rule4, 200, 1705 - b_r4)

    # 6. Answer field (The Nomad's Passphrase)
    draw_sketchy_line(canvas, (200, 1765), (1520, 1765), gc=gc, alpha_base=140, passes=2, seed=901)

    t_pass_hdr, b_ph = render_pencil_text("The Nomad's Passphrase (The Six Relic Cairns):", FONT_PATH, font_size=32, gc=gc, seed=902)
    blit_rgba(canvas, t_pass_hdr, 200, 1825 - b_ph)

    t_sub, b_sb = render_pencil_text("Inscribe the six sacred runes in order of discovery:", FONT_PATH, font_size=24, gc=gc, seed=903)
    blit_rgba(canvas, t_sub, 200, 1875 - b_sb)

    # 6 Large Answer Boxes (MIRAGE)
    b_sz = 90
    b_h = 92
    b_gap = 35
    total_w = 6 * b_sz + 5 * b_gap
    b_x0 = (CANVAS_WIDTH_PX - total_w) // 2
    b_y0 = 1930

    for i in range(6):
        bx = b_x0 + i * (b_sz + b_gap)
        draw_sketchy_rect(canvas, (bx, b_y0, bx + b_sz, b_y0 + b_h), gc=gc, alpha_base=180, passes=2, seed=950 + i)
        t_idx, _ = render_pencil_text(str(i + 1), FONT_PATH, font_size=25, gc=gc, seed=970 + i)
        blit_rgba(canvas, t_idx, bx + b_sz // 2 - t_idx.shape[1] // 2, b_y0 + b_h + 16)

    draw_sketchy_line(canvas, (200, 2110), (1520, 2110), gc=gc, alpha_base=130, passes=1, seed=980)

    return canvas


# -------------------------------------------------------------------------
# GAME D2: THE DESERT LEXICON (Hoja D1 · Cara A)
# -------------------------------------------------------------------------

def render_game_d2(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Hoja D1 · Cara A (Game D2 — 10-Word Desert Crossword & PHOENIX Master Key)."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. Header (Cara A: left margin safe, starts at X >= 220)
    t_title, _ = render_pencil_text("The Desert Lexicon", FONT_PATH, font_size=58, gc=gc, seed=101)
    blit_rgba(canvas, t_title, 230, 80)

    draw_sketchy_line(canvas, (230, 180), (1550, 180), gc=gc, alpha_base=160, passes=2, seed=103)

    # 2. Crossword Grid (10 words: 5 Across, 5 Down, 15 rows x 12 cols)
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

    cell_sz = 58
    gx0 = 230
    gy0 = 220

    active_cells = {}
    for r0, c0, w in across_words:
        for i, ch in enumerate(w):
            active_cells[(r0, c0 + i)] = ch

    for r0, c0, w in down_words:
        for i, ch in enumerate(w):
            active_cells[(r0 + i, c0)] = ch

    # Master Key Cells (P-H-O-E-N-I-X) scattered across 7 different words/rows/cols:
    # 1: P (ECLIPSE - r11, c9)
    # 2: H (HORIZON - r13, c5)
    # 3: O (SIROCCO - r2, c4)
    # 4: E (DUNES - r10, c10)
    # 5: N (NOMAD / CARAVAN - r6, c3)
    # 6: I (OASIS - r9, c7)
    # 7: X (SPHINX - r7, c1)
    key_circles = {
        (11, 9): "1",   # P
        (13, 5): "2",   # H
        (2, 4):  "3",   # O
        (10, 10): "4",  # E
        (6, 3):  "5",   # N
        (9, 7):  "6",   # I
        (7, 1):  "7",   # X
    }

    for (r, c) in active_cells:
        x1 = gx0 + c * cell_sz
        y1 = gy0 + r * cell_sz
        x2 = x1 + cell_sz
        y2 = y1 + cell_sz

        draw_sketchy_line(canvas, (x1, y1), (x2, y1), gc=gc, alpha_base=180, passes=2, seed=r * 15 + c)
        draw_sketchy_line(canvas, (x2, y1), (x2, y2), gc=gc, alpha_base=180, passes=2, seed=r * 15 + c + 1)
        draw_sketchy_line(canvas, (x2, y2), (x1, y2), gc=gc, alpha_base=180, passes=2, seed=r * 15 + c + 2)
        draw_sketchy_line(canvas, (x1, y2), (x1, y1), gc=gc, alpha_base=180, passes=2, seed=r * 15 + c + 3)

        if (r, c) in key_circles:
            mid_x, mid_y = (x1 + x2) // 2, (y1 + y2) // 2
            cv2.circle(canvas, (mid_x, mid_y), cell_sz // 2 - 4, (*gc, 160), 1, cv2.LINE_AA)
            t_kn, _ = render_pencil_text(key_circles[(r, c)], FONT_PATH, font_size=15, gc=gc, seed=380 + int(key_circles[(r, c)]))
            blit_rgba(canvas, t_kn, x2 - 16, y2 - 18)

    # Word starting clue numbers
    starts = {
        (0, 3): "1",
        (2, 1): "2",
        (6, 3): "3",
        (6, 5): "4",
        (7, 10): "5",
        (9, 4): "6",
        (9, 8): "7",
        (11, 5): "8",
        (13, 5): "9",
    }
    for (r, c), num in starts.items():
        x1 = gx0 + c * cell_sz
        y1 = gy0 + r * cell_sz
        t_num, _ = render_pencil_text(num, FONT_PATH, font_size=16, gc=gc, seed=350 + r * 10 + c)
        blit_rgba(canvas, t_num, x1 + 4, y1 + 2)

    # Decorative Nomad Astrolabe / Sun Compass on the right of the grid
    dec_cx, dec_cy = 1290, 600
    cv2.circle(canvas, (dec_cx, dec_cy), 185, (*gc, 150), 1, cv2.LINE_AA)
    cv2.circle(canvas, (dec_cx, dec_cy), 155, (*gc, 90), 1, cv2.LINE_AA)
    cv2.circle(canvas, (dec_cx, dec_cy), 125, (*gc, 130), 1, cv2.LINE_AA)
    cv2.circle(canvas, (dec_cx, dec_cy), 45, (*gc, 170), 1, cv2.LINE_AA)
    cv2.circle(canvas, (dec_cx, dec_cy), 4, (*gc, 230), -1, cv2.LINE_AA)

    # 16-point wind compass rose
    for a in range(0, 360, 22):
        rad = np.deg2rad(a)
        r_out = 185 if a % 45 == 0 else (170 if a % 90 == 0 else 160)
        p1 = (int(round(dec_cx + 45 * np.cos(rad))), int(round(dec_cy + 45 * np.sin(rad))))
        p2 = (int(round(dec_cx + r_out * np.cos(rad))), int(round(dec_cy + r_out * np.sin(rad))))
        cv2.line(canvas, p1, p2, (*gc, 140 if a % 45 == 0 else 80), 1, cv2.LINE_AA)

    t_dec_lbl, _ = render_pencil_text("Al-Qibla & Desert Bearing", FONT_PATH, font_size=20, gc=gc, seed=399)
    blit_rgba(canvas, t_dec_lbl, dec_cx - t_dec_lbl.shape[1] // 2, dec_cy + 205)

    # 3. Clues Section
    draw_sketchy_line(canvas, (230, 1140), (1550, 1140), gc=gc, alpha_base=140, passes=1, seed=400)

    # Across Column (Left)
    t_ac_hdr, b_ah = render_pencil_text("Across (The Lateral Trails)", FONT_PATH, font_size=28, gc=gc, seed=401)
    blit_rgba(canvas, t_ac_hdr, 230, 1190 - b_ah)

    across_clues = [
        ("2.", "The blistering south-easterly wind that sweeps", "the dunes and erases all travelers' footsteps."),
        ("3.", "The eternal wanderer whose only roof is", "the starry vault and the desert horizon."),
        ("6.", "A verdant sanctuary where hidden subterranean", "springs quench the thirst of weary pilgrims."),
        ("8.", "The sacred occultation when the noon sun is", "crowned in darkness by the celestial disk."),
        ("9.", "The boundless circle where the burning desert", "sands meet the eternal vault of heaven.")
    ]
    for i, (n, l1, l2) in enumerate(across_clues):
        y_top = 1245 + i * 105
        t_n, b_n = render_pencil_text(n, FONT_PATH, font_size=24, gc=gc, seed=410 + i * 3)
        blit_rgba(canvas, t_n, 230, y_top - b_n)
        t_l1, b_l1 = render_pencil_text(l1, FONT_PATH, font_size=21, gc=gc, seed=411 + i * 3)
        blit_rgba(canvas, t_l1, 275, y_top - b_l1)
        t_l2, b_l2 = render_pencil_text(l2, FONT_PATH, font_size=21, gc=gc, seed=412 + i * 3)
        blit_rgba(canvas, t_l2, 275, y_top + 28 - b_l2)

    # Down Column (Right)
    t_dn_hdr, b_dh = render_pencil_text("Down (The Vertical Meridians)", FONT_PATH, font_size=28, gc=gc, seed=501)
    blit_rgba(canvas, t_dn_hdr, 900, 1190 - b_dh)

    down_clues = [
        ("1.", "The solemn march of laden camels and", "merchants navigating by nocturnal stars."),
        ("2.", "The stone guardian of ancient dynasties,", "keeping silent watch over the golden sands."),
        ("4.", "The shimmering illusion of non-existent waters", "conjured by heat above the scorched basin."),
        ("5.", "The shifting hills of golden powder,", "sculpted and reshaped by the midnight breeze."),
        ("7.", "The unseen whisperer of the desert expanse,", "whistling through the sandstone canyons.")
    ]
    for i, (n, l1, l2) in enumerate(down_clues):
        y_top = 1245 + i * 105
        t_n, b_n = render_pencil_text(n, FONT_PATH, font_size=24, gc=gc, seed=510 + i * 3)
        blit_rgba(canvas, t_n, 900, y_top - b_n)
        t_l1, b_l1 = render_pencil_text(l1, FONT_PATH, font_size=21, gc=gc, seed=511 + i * 3)
        blit_rgba(canvas, t_l1, 945, y_top - b_l1)
        t_l2, b_l2 = render_pencil_text(l2, FONT_PATH, font_size=21, gc=gc, seed=512 + i * 3)
        blit_rgba(canvas, t_l2, 945, y_top + 28 - b_l2)

    # 4. Master Key Box (The Desert Sigil)
    draw_sketchy_line(canvas, (230, 1800), (1550, 1800), gc=gc, alpha_base=140, passes=1, seed=601)

    t_mk_hdr, b_mh = render_pencil_text("The Desert Sigil (Assemble the circled letters in order 1 to 7):", FONT_PATH, font_size=28, gc=gc, seed=602)
    blit_rgba(canvas, t_mk_hdr, 230, 1860 - b_mh)

    # 7 Large Answer Boxes (PHOENIX)
    k_sz = 86
    k_gap = 32
    total_kw = 7 * k_sz + 6 * k_gap
    k_x0 = (CANVAS_WIDTH_PX - total_kw) // 2
    k_y0 = 1920

    for i in range(7):
        kx = k_x0 + i * (k_sz + k_gap)
        draw_sketchy_rect(canvas, (kx, k_y0, kx + k_sz, k_y0 + k_sz), gc=gc, alpha_base=180, passes=2, seed=650 + i)
        t_idx, _ = render_pencil_text(str(i + 1), FONT_PATH, font_size=24, gc=gc, seed=670 + i)
        blit_rgba(canvas, t_idx, kx + k_sz // 2 - t_idx.shape[1] // 2, k_y0 + k_sz + 16)

    draw_sketchy_line(canvas, (230, 2090), (1550, 2090), gc=gc, alpha_base=130, passes=1, seed=690)

    return canvas


# -------------------------------------------------------------------------
# GAME D3: THE OASIS CLEPSYDRA (Hoja D1 · Cara B)
# -------------------------------------------------------------------------

def render_game_d3(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Hoja D1 · Cara B (Game D3 — Clepsydra Illustration & 4x4 Logic Matrix)."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. Header (Cara B: right margin safe, stops at X <= 1520)
    t_title, _ = render_pencil_text("The Oasis Clepsydra", FONT_PATH, font_size=58, gc=gc, seed=101)
    blit_rgba(canvas, t_title, 200, 80)

    draw_sketchy_line(canvas, (200, 180), (1520, 180), gc=gc, alpha_base=160, passes=2, seed=103)

    # 2. Grand Full-Width Logic Deduction Matrix (200..1516, 240..630)
    # 4 Seekers x (4 Wells + 4 Hours + 4 Relics) = 12 wide columns across the entire page
    seekers = ["Cartographer", "Alchemist", "Nomad", "Astronomer"]
    wells = ["Falcon", "Jackal", "Scarab", "Serpent"]
    hours = ["Hr III", "Hr VI", "Hr IX", "Hr XII"]
    relics = ["Astrolabe", "Scarab", "Sandglass", "Dagger"]

    grid_x0 = 200
    grid_y0 = 330
    label_w = 260
    c_w = 88
    c_h = 75

    # Category Super-Headers
    sup_hdr = [
        ("WELLS", grid_x0 + label_w, grid_x0 + label_w + 4 * c_w),
        ("ARRIVAL HOURS", grid_x0 + label_w + 4 * c_w, grid_x0 + label_w + 8 * c_w),
        ("SACRED RELICS", grid_x0 + label_w + 8 * c_w, grid_x0 + label_w + 12 * c_w),
    ]
    for cat_name, x_start, x_end in sup_hdr:
        t_cat, _ = render_pencil_text(cat_name, FONT_PATH, font_size=20, gc=gc, seed=250 + x_start)
        cx_mid = (x_start + x_end) // 2
        blit_rgba(canvas, t_cat, cx_mid - t_cat.shape[1] // 2, grid_y0 - 70)
        draw_sketchy_line(canvas, (x_start + 10, grid_y0 - 45), (x_end - 10, grid_y0 - 45), gc=gc, alpha_base=130, passes=1, seed=260 + x_start)

    # Column Sub-Headers (Wells)
    for j, w_name in enumerate(wells):
        t_w, _ = render_pencil_text(w_name, FONT_PATH, font_size=20, gc=gc, seed=300 + j)
        blit_rgba(canvas, t_w, grid_x0 + label_w + j * c_w + (c_w - t_w.shape[1]) // 2, grid_y0 - 35)

    # Column Sub-Headers (Hours)
    for j, h_name in enumerate(hours):
        t_h, _ = render_pencil_text(h_name, FONT_PATH, font_size=20, gc=gc, seed=310 + j)
        blit_rgba(canvas, t_h, grid_x0 + label_w + (4 + j) * c_w + (c_w - t_h.shape[1]) // 2, grid_y0 - 35)

    # Column Sub-Headers (Relics)
    for j, r_name in enumerate(relics):
        t_r, _ = render_pencil_text(r_name, FONT_PATH, font_size=19, gc=gc, seed=320 + j)
        blit_rgba(canvas, t_r, grid_x0 + label_w + (8 + j) * c_w + (c_w - t_r.shape[1]) // 2, grid_y0 - 35)

    # Row headers & horizontal lines
    for i, s_name in enumerate(seekers):
        ry = grid_y0 + i * c_h
        t_s, _ = render_pencil_text(f"The {s_name}", FONT_PATH, font_size=26, gc=gc, seed=330 + i)
        blit_rgba(canvas, t_s, grid_x0 + 12, ry + (c_h - t_s.shape[0]) // 2)

        # Horizontal row line
        draw_sketchy_line(canvas, (grid_x0, ry), (grid_x0 + label_w + 12 * c_w, ry), gc=gc, alpha_base=140, passes=1, seed=350 + i)

    # Top border line of grid
    draw_sketchy_line(canvas, (grid_x0, grid_y0), (grid_x0 + label_w + 12 * c_w, grid_y0), gc=gc, alpha_base=200, passes=2, seed=358)
    # Bottom border line of grid
    draw_sketchy_line(canvas, (grid_x0, grid_y0 + 4 * c_h), (grid_x0 + label_w + 12 * c_w, grid_y0 + 4 * c_h), gc=gc, alpha_base=200, passes=2, seed=360)

    # Vertical column lines
    # Left border
    draw_sketchy_line(canvas, (grid_x0, grid_y0), (grid_x0, grid_y0 + 4 * c_h), gc=gc, alpha_base=190, passes=2, seed=365)
    # Header column separator
    draw_sketchy_line(canvas, (grid_x0 + label_w, grid_y0 - 40), (grid_x0 + label_w, grid_y0 + 4 * c_h), gc=gc, alpha_base=220, passes=2, seed=370)

    for col in range(1, 13):
        cx = grid_x0 + label_w + col * c_w
        is_major = col in [4, 8, 12]
        thickness = 2 if is_major else 1
        alpha = 220 if is_major else 115
        top_y = grid_y0 - 70 if is_major else grid_y0 - 40
        cv2.line(canvas, (cx, top_y), (cx, grid_y0 + 4 * c_h), (*gc, alpha), thickness, cv2.LINE_AA)

    # 3. Deduction Clues (Middle Area) — Difficulty 7.5 - 8/10
    draw_sketchy_line(canvas, (200, 710), (1520, 710), gc=gc, alpha_base=140, passes=1, seed=400)

    t_clue_hdr, b_ch = render_pencil_text("The Five Testimonies of the Shadow Index:", FONT_PATH, font_size=30, gc=gc, seed=401)
    blit_rgba(canvas, t_clue_hdr, 200, 765 - b_ch)

    clues = [
        ("I.", "The traveler bearing the Brass Astrolabe arrived at their well exactly three shadow-hours", "before the arrival of the Nomad."),
        ("II.", "The seeker at the Well of the Jackal arrived earlier in the day than The Cartographer,", "but was never seen in possession of the Obsidian Dagger."),
        ("III.", "The arrival at the Well of the Falcon occurred strictly later than that at the Well of the Scarab,", "though neither of these two arrivals took place at Hour XII."),
        ("IV.", "The Astronomer carried the Gold Scarab and reached the Well of the Serpent,", "yet their camel was not unburdened until the ninth shadow-hour or later."),
        ("V.", "The Alchemist possessed the Silver Sandglass, and quenched their thirst at an earlier hour", "than the seeker who carried the Brass Astrolabe.")
    ]

    for i, (num, l1, l2) in enumerate(clues):
        y_top = 830 + i * 105
        t_n, b_n = render_pencil_text(num, FONT_PATH, font_size=26, gc=gc, seed=410 + i * 3)
        blit_rgba(canvas, t_n, 200, y_top - b_n)

        t_l1, b_l1 = render_pencil_text(l1, FONT_PATH, font_size=23, gc=gc, seed=420 + i * 3)
        blit_rgba(canvas, t_l1, 260, y_top - b_l1)
        t_l2, b_l2 = render_pencil_text(l2, FONT_PATH, font_size=23, gc=gc, seed=421 + i * 3)
        blit_rgba(canvas, t_l2, 260, y_top + 32 - b_l2)

    # 4. Concluded Log / Answer Ledger (Spacious & Clean)
    draw_sketchy_line(canvas, (200, 1440), (1520, 1440), gc=gc, alpha_base=140, passes=1, seed=500)

    t_led_hdr, b_lh = render_pencil_text("The Oasis Registry (Transcribe the Verified Seekers):", FONT_PATH, font_size=30, gc=gc, seed=501)
    blit_rgba(canvas, t_led_hdr, 200, 1500 - b_lh)

    profiles = [
        "1.  The Cartographer :  Relic [ ______________ ]   |   Well [ ______________ ]   |   Arrival [ _________ ]",
        "2.  The Alchemist    :  Relic [ ______________ ]   |   Well [ ______________ ]   |   Arrival [ _________ ]",
        "3.  The Nomad        :  Relic [ ______________ ]   |   Well [ ______________ ]   |   Arrival [ _________ ]",
        "4.  The Astronomer   :  Relic [ ______________ ]   |   Well [ ______________ ]   |   Arrival [ _________ ]",
    ]

    for i, p_txt in enumerate(profiles):
        y_pos = 1590 + i * 110
        t_p, b_p = render_pencil_text(p_txt, FONT_PATH, font_size=24, gc=gc, seed=510 + i)
        blit_rgba(canvas, t_p, 200, y_pos - b_p)

    # Secret Verification Sum
    draw_sketchy_line(canvas, (200, 2110), (1520, 2110), gc=gc, alpha_base=140, passes=1, seed=600)
    t_vsum, b_vs = render_pencil_text("The Clepsydra Key:   Sum of the Four Arrival Hours = [ __________ ] (Roman Numerals) = [ ____ ] Hours.", FONT_PATH, font_size=23, gc=gc, seed=601)
    blit_rgba(canvas, t_vsum, 200, 2200 - b_vs)
    draw_sketchy_line(canvas, (200, 2260), (1520, 2260), gc=gc, alpha_base=120, passes=1, seed=605)

    return canvas


# -------------------------------------------------------------------------
# GAME D4: THE POLYBIUS STELE (Hoja D2 · Cara A)
# -------------------------------------------------------------------------

def render_game_d4(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Hoja D2 · Cara A (Game D4 — Polybius Cipher Stele & Ancient Nomadic Inscription)."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. Header (Cara A: left margin safe, starts at X >= 220)
    t_title, _ = render_pencil_text("The Polybius Stele", FONT_PATH, font_size=64, gc=gc, seed=101)
    blit_rgba(canvas, t_title, 230, 75)

    draw_sketchy_line(canvas, (230, 160), (1550, 160), gc=gc, alpha_base=160, passes=2, seed=103)

    # 2. Engraved Sandstone Stele Monument (Centered on X=900, spanning 340..1460)
    st_x1, st_y1, st_x2, st_y2 = 340, 185, 1460, 825
    st_mid_x = (st_x1 + st_x2) // 2

    # Rounded arch top
    cv2.ellipse(canvas, (st_mid_x, st_y1 + 45), ((st_x2 - st_x1) // 2, 50), 0, 180, 360, (*gc, 200), 2, cv2.LINE_AA)
    draw_sketchy_line(canvas, (st_x1, st_y1 + 45), (st_x1, st_y2), gc=gc, alpha_base=200, passes=2, seed=201)
    draw_sketchy_line(canvas, (st_x2, st_y1 + 45), (st_x2, st_y2), gc=gc, alpha_base=200, passes=2, seed=202)
    draw_sketchy_line(canvas, (st_x1, st_y2), (st_x2, st_y2), gc=gc, alpha_base=200, passes=2, seed=203)

    # Inner decorative stone border
    cv2.rectangle(canvas, (st_x1 + 16, st_y1 + 60), (st_x2 - 16, st_y2 - 16), (*gc, 120), 1, cv2.LINE_AA)

    # Keyed Polybius Grid (Key: P H O E N I X - Single letter per cell, strictly no I/J combining)
    polybius_grid = [
        ["P", "H", "O", "E", "N"],
        ["I", "X", "A", "B", "C"],
        ["D", "F", "G", "K", "L"],
        ["M", "Q", "R", "S", "T"],
        ["U", "V", "W", "Y", "Z"],
    ]
    romans = ["I", "II", "III", "IV", "V"]

    # Table horizontal centering:
    # Row header column: width 80 px
    # 5 grid columns: each 144 px -> 5 * 144 = 720 px
    # Total table width = 800 px. Centered at X=900 -> start X = 500 px.
    rh_w = 80
    pg_cw = 144
    pg_ch = 98
    pg_x0 = 500
    pg_y0 = st_y1 + 60

    # Column Headers (I..V) centered above cells
    for c_idx, rom in enumerate(romans):
        cx = pg_x0 + rh_w + c_idx * pg_cw + pg_cw // 2
        t_rom, _ = render_pencil_text(rom, FONT_PATH, font_size=36, gc=gc, seed=300 + c_idx)
        blit_rgba(canvas, t_rom, cx - t_rom.shape[1] // 2, pg_y0 + 10)

    # Row Headers and Cells (centered vertically and horizontally)
    for r_idx, row in enumerate(polybius_grid):
        ry = pg_y0 + 45 + r_idx * pg_ch + pg_ch // 2
        # Row roman numeral
        t_rrom, _ = render_pencil_text(romans[r_idx], FONT_PATH, font_size=36, gc=gc, seed=310 + r_idx)
        blit_rgba(canvas, t_rrom, pg_x0 + rh_w // 2 - t_rrom.shape[1] // 2, ry - t_rrom.shape[0] // 2)

        for c_idx, letter in enumerate(row):
            cx = pg_x0 + rh_w + c_idx * pg_cw
            cy = pg_y0 + 45 + r_idx * pg_ch

            # Draw cell box
            draw_sketchy_rect(canvas, (cx, cy, cx + pg_cw, cy + pg_ch), gc=gc, alpha_base=160, passes=1, seed=320 + r_idx * 10 + c_idx)

            # Letter inside cell (large, single glyph)
            t_let, _ = render_pencil_text(letter, FONT_PATH, font_size=46, gc=gc, seed=340 + r_idx * 10 + c_idx)
            blit_rgba(canvas, t_let, cx + (pg_cw - t_let.shape[1]) // 2, cy + (pg_ch - t_let.shape[0]) // 2)

    # 3. The Law of the Inverted Mirage (Double Sight Rules - Enlarged)
    draw_sketchy_line(canvas, (230, 855), (1550, 855), gc=gc, alpha_base=140, passes=1, seed=400)

    t_rule_hdr, b_rh = render_pencil_text("The Law of the Inverted Mirage (Double Sight):", FONT_PATH, font_size=36, gc=gc, seed=401)
    blit_rgba(canvas, t_rule_hdr, 230, 898 - b_rh)

    t_r1, b_r1 = render_pencil_text("1. Solar Stanzas (Odd: I, III, V): Direct stone reading — coordinates are (Row, Column).", FONT_PATH, font_size=33, gc=gc, seed=402)
    blit_rgba(canvas, t_r1, 230, 960 - b_r1)

    t_r2, b_r2 = render_pencil_text("2. Lunar Stanzas (Even: II, IV, VI): Inverted by desert mirage — read as (Column, Row).", FONT_PATH, font_size=33, gc=gc, seed=403)
    blit_rgba(canvas, t_r2, 230, 1025 - b_r2)

    # Horizontal separator line under 2. Lunar Stanzas
    draw_sketchy_line(canvas, (230, 1070), (1550, 1070), gc=gc, alpha_base=140, passes=1, seed=450)

    # 4. Scribed Coordinates (Stanzas I to VI) - Lowered for generous margins
    # Message: "STARS GUIDE THOSE WHO SEEK TRUTH"
    t_coord_hdr, b_ch = render_pencil_text("The Scribed Coordinates of the Desert Pillars:", FONT_PATH, font_size=34, gc=gc, seed=501)
    blit_rgba(canvas, t_coord_hdr, 230, 1125 - b_ch)

    stanzas = [
        ("I.", "(IV, IV)   (IV, V)   (II, III)   (IV, III)   (IV, IV)", "5 Letters"),
        ("II.", "(III, III)   (I, V)   (I, II)   (I, III)   (IV, I)", "5 Letters"),
        ("III.", "(IV, V)   (I, II)   (I, III)   (IV, IV)   (I, IV)", "5 Letters"),
        ("IV.", "(III, V)   (II, I)   (III, I)", "3 Letters"),
        ("V.", "(IV, IV)   (I, IV)   (I, IV)   (III, IV)", "4 Letters"),
        ("VI.", "(V, IV)   (III, IV)   (I, V)   (V, IV)   (II, I)", "5 Letters"),
    ]

    for i, (num, glyphs, count) in enumerate(stanzas):
        y_pos = 1215 + i * 85
        t_n, b_n = render_pencil_text(num, FONT_PATH, font_size=30, gc=gc, seed=510 + i)
        blit_rgba(canvas, t_n, 230, y_pos - b_n)

        t_gl, b_gl = render_pencil_text(glyphs, FONT_PATH, font_size=30, gc=gc, seed=520 + i)
        blit_rgba(canvas, t_gl, 330, y_pos - b_gl)

        t_cnt, b_ct = render_pencil_text(f"[ {count} ]", FONT_PATH, font_size=24, gc=gc, seed=530 + i)
        blit_rgba(canvas, t_cnt, 1370, y_pos - b_ct)

    # 5. Decoded Translation Field with Individual Letter Inscription Boxes
    # Shifted down to provide generous margins and vertical breathing room
    draw_sketchy_line(canvas, (230, 1770), (1550, 1770), gc=gc, alpha_base=140, passes=1, seed=600)

    t_dec_hdr, b_dh = render_pencil_text("The Decoded Nomadic Proverb (Inscribe each letter into its stone):", FONT_PATH, font_size=32, gc=gc, seed=601)
    blit_rgba(canvas, t_dec_hdr, 230, 1825 - b_dh)

    box_w, box_h = 56, 68
    letter_gap = 10

    # Line 1: Word 1 (5 letters: STARS), Word 2 (5 letters: GUIDE), Word 3 (5 letters: THOSE)
    line1_words = [
        ("I", 5),
        ("II", 5),
        ("III", 5),
    ]
    word_gap1 = 65
    total_w1 = sum(cnt * box_w + (cnt - 1) * letter_gap for _, cnt in line1_words) + (len(line1_words) - 1) * word_gap1
    start_x1 = 230 + (1320 - total_w1) // 2
    cur_x = start_x1
    y_box1 = 1895

    for w_idx, (roman_lbl, cnt) in enumerate(line1_words):
        w_start = cur_x
        for l_idx in range(cnt):
            bx = cur_x
            draw_sketchy_rect(canvas, (bx, y_box1, bx + box_w, y_box1 + box_h), gc=gc, alpha_base=160, passes=2, seed=610 + w_idx * 10 + l_idx)
            cur_x += box_w + letter_gap
        cur_x -= letter_gap

        # Word roman label below
        w_center = (w_start + cur_x) // 2
        t_lbl, _ = render_pencil_text(roman_lbl, FONT_PATH, font_size=24, gc=gc, seed=620 + w_idx)
        blit_rgba(canvas, t_lbl, w_center - t_lbl.shape[1] // 2, y_box1 + box_h + 12)

        cur_x += word_gap1

    # Line 2: Word 4 (3 letters: WHO), Word 5 (4 letters: SEEK), Word 6 (5 letters: TRUTH)
    line2_words = [
        ("IV", 3),
        ("V", 4),
        ("VI", 5),
    ]
    word_gap2 = 75
    total_w2 = sum(cnt * box_w + (cnt - 1) * letter_gap for _, cnt in line2_words) + (len(line2_words) - 1) * word_gap2
    start_x2 = 230 + (1320 - total_w2) // 2
    cur_x = start_x2
    y_box2 = 2065

    for w_idx, (roman_lbl, cnt) in enumerate(line2_words):
        w_start = cur_x
        for l_idx in range(cnt):
            bx = cur_x
            draw_sketchy_rect(canvas, (bx, y_box2, bx + box_w, y_box2 + box_h), gc=gc, alpha_base=160, passes=2, seed=640 + w_idx * 10 + l_idx)
            cur_x += box_w + letter_gap
        cur_x -= letter_gap

        # Word roman label below
        w_center = (w_start + cur_x) // 2
        t_lbl, _ = render_pencil_text(roman_lbl, FONT_PATH, font_size=24, gc=gc, seed=650 + w_idx)
        blit_rgba(canvas, t_lbl, w_center - t_lbl.shape[1] // 2, y_box2 + box_h + 12)

        cur_x += word_gap2

    draw_sketchy_line(canvas, (230, 2240), (1550, 2240), gc=gc, alpha_base=140, passes=1, seed=700)

    return canvas


# -------------------------------------------------------------------------
# MAIN EXECUTION
# -------------------------------------------------------------------------

def main():
    print("=== Building Desert Games (Hojas 8B, D1, D2 — 4 Pages) ===")

    paper_photo = os.path.join(PROJECT_ROOT, "journal", "page01", "real_paper_300dpi.png")
    bg_raw = None
    if os.path.exists(paper_photo):
        bg_raw = cv2.imread(paper_photo)
        if bg_raw is not None:
            bg_raw = cv2.resize(bg_raw, (CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX), interpolation=cv2.INTER_LANCZOS4)

    # Output directories
    p8_dir = os.path.join(PROJECT_ROOT, "journal", "page08")
    dg_dir = os.path.join(PROJECT_ROOT, "journal", "desert_games")
    dg_pdf_dir = os.path.join(dg_dir, "pdf")
    dg_canvas_dir = os.path.join(dg_dir, "canvases")
    dg_mockup_dir = os.path.join(dg_dir, "mockups")

    os.makedirs(p8_dir, exist_ok=True)
    os.makedirs(dg_pdf_dir, exist_ok=True)
    os.makedirs(dg_canvas_dir, exist_ok=True)
    os.makedirs(dg_mockup_dir, exist_ok=True)

    tasks = [
        ("Hoja 8 · Cara B (Game D1 — The Whispering Chasm Maze)", render_game_d1, "game01_chasm_maze", True, True),
        ("Hoja D1 · Cara A (Game D2 — The Desert Lexicon)", render_game_d2, "game02_desert_crossword", False, False),
        ("Hoja D1 · Cara B (Game D3 — The Oasis Clepsydra)", render_game_d3, "game03_water_clock", True, False),
        ("Hoja D2 · Cara A (Game D4 — The Polybius Stele)", render_game_d4, "game04_polybius_stele", False, False),
    ]

    for title, renderer, stem, is_back, is_page08 in tasks:
        print(f"\nRendering {title}...")
        canvas = renderer(gc=GRAPHITE_COLOR)

        # 1. Master Transparent Canvas (300 DPI) in desert_games/canvases/
        canvas_path = os.path.join(dg_canvas_dir, f"{stem}_canvas_A5_300dpi.png")
        cv2.imwrite(canvas_path, canvas)
        print(f"  -> Transparent Canvas: {canvas_path}")

        # 2. Vector PDF in desert_games/pdf/
        pdf_path = os.path.join(dg_pdf_dir, f"{stem}_A5.pdf")
        PDFBuilder.save_a5_pdf_from_rgba(canvas, pdf_path, dpi=300)
        print(f"  -> Vector PDF: {pdf_path}")

        # 3. Photorealistic Mockup in desert_games/mockups/
        if bg_raw is not None:
            bg_for_face = cv2.flip(bg_raw, 1) if is_back else bg_raw.copy()
            fg_rgb = canvas[:, :, :3].astype(np.float32)
            alpha = (canvas[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]
            blended = (fg_rgb * alpha + bg_for_face.astype(np.float32) * (1.0 - alpha)).astype(np.uint8)
            mockup_path = os.path.join(dg_mockup_dir, f"{stem}_mockup.jpg")
            cv2.imwrite(mockup_path, blended, [cv2.IMWRITE_JPEG_QUALITY, 96])
            print(f"  -> Photorealistic Mockup: {mockup_path}")

            # Also maintain page08 synchronization if applicable
            if is_page08:
                p8_pdf_dir = os.path.join(p8_dir, "pdf")
                p8_canvas_dir = os.path.join(p8_dir, "canvases")
                p8_mockup_dir = os.path.join(p8_dir, "mockups")
                os.makedirs(p8_pdf_dir, exist_ok=True)
                os.makedirs(p8_canvas_dir, exist_ok=True)
                os.makedirs(p8_mockup_dir, exist_ok=True)

                p8_canvas = os.path.join(p8_canvas_dir, "page08_back_canvas_A5_300dpi.png")
                p8_pdf = os.path.join(p8_pdf_dir, "page08_back_A5.pdf")
                p8_mockup = os.path.join(p8_mockup_dir, "page08_back_real_paper_mockup.jpg")
                cv2.imwrite(p8_canvas, canvas)
                PDFBuilder.save_a5_pdf_from_rgba(canvas, p8_pdf, dpi=300)
                cv2.imwrite(p8_mockup, blended, [cv2.IMWRITE_JPEG_QUALITY, 96])
                print(f"  -> Also synced to Page 08 Back: {p8_pdf}")

            if stem == "game04_polybius_stele":
                p12_dir = os.path.join(PROJECT_ROOT, "journal", "page12")
                p12_pdf_dir = os.path.join(p12_dir, "pdf")
                p12_canvas_dir = os.path.join(p12_dir, "canvases")
                p12_mockup_dir = os.path.join(p12_dir, "mockups")
                os.makedirs(p12_pdf_dir, exist_ok=True)
                os.makedirs(p12_canvas_dir, exist_ok=True)
                os.makedirs(p12_mockup_dir, exist_ok=True)

                p12_canvas = os.path.join(p12_canvas_dir, "page12_front_canvas_A5_300dpi.png")
                p12_pdf = os.path.join(p12_pdf_dir, "page12_front_A5.pdf")
                p12_mockup = os.path.join(p12_mockup_dir, "page12_front_real_paper_mockup.jpg")
                cv2.imwrite(p12_canvas, canvas)
                PDFBuilder.save_a5_pdf_from_rgba(canvas, p12_pdf, dpi=300)
                cv2.imwrite(p12_mockup, blended, [cv2.IMWRITE_JPEG_QUALITY, 96])
                print(f"  -> Also synced to Page 12 Front: {p12_pdf}")

    print("\n=== Successfully Built All 4 Desert Games! ===")


if __name__ == "__main__":
    main()
