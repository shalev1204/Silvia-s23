#!/usr/bin/env python3
"""
build_constellation_games.py
============================
Production builder for Journal Sheets C1 & C2 (The Constellation Path Games).
Silvia's 23rd Birthday Treasure Hunt.

Structure:
- Hoja C1 · Cara A (Game C1, holes on LEFT: X < 165 px):
    * "The Planisphere" — 12x12 celestial starfield word search embedded in an
      astrolabe circular projection. Uncast star letters spell:
      "THE SKY REMEMBERS WHAT THE EARTH FORGETS" (34 letters).
- Hoja C1 · Cara B (Game C2, holes on RIGHT: X > 1583 px):
    * "The Zodiacal Engine" — Interlocking mechanical gear crossword featuring 6
      fundamental Order terms (SOLSTICE, ECLIPTIC, ZENITH, MERIDIAN, ALIDADE, POLARIS).
      Seven highlighted numbered key-cells spell: "E C L I P S E".
- Hoja C2 · Cara A (Game C3, holes on LEFT: X < 165 px):
    * "The Midnight Transit" — Starfield triangulation problem connecting 12 navigation
      stars across their true light-year distances (Achernar, Rigel, Betelgeuse, etc.).
- Hoja C2 · Cara B (Game C4, holes on RIGHT: X > 1583 px):
    * "The Celestial Cipher" — Concentric astrolabe coordinate dial (Hour Angles I..XII
      vs Declinations +45*..-45*). Decodes the Cartographer's lost transmission:
      "YOU WERE ALWAYS THE TREASURE" (24 letters).

Typography & Design Standards:
- Large, comfortably readable cursive handwriting at 300 DPI (A5 format).
- Absolute zero collisions between drawings and text baselines.
- Strict hole punch margin clearance: X < 165 px (Cara A) and X > 1583 px (Cara B).
- 100% 2B graphite texture RGB(46, 42, 38).
"""

import os
import sys
import random
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from scripts.journal.geometry import CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX
from scripts.journal.pdf_builder import PDFBuilder
from scripts.journal.build_page06_07 import (
    render_pencil_text,
    blit_rgba,
    draw_sketchy_line,
    GRAPHITE_COLOR
)

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FONT_PATH = os.path.join(PROJECT_ROOT, 'assets', 'fonts', 'Fondamento.ttf')


# -------------------------------------------------------------------------
# GAME C1: THE PLANISPHERE
# -------------------------------------------------------------------------

def render_game_c1(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Hoja C1 · Cara A (Game C1 — The Planisphere Starfield Search)."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. Header
    t_title, _ = render_pencil_text("The Planisphere", FONT_PATH, font_size=58, gc=gc, seed=101)
    blit_rgba(canvas, t_title, 230, 80)

    draw_sketchy_line(canvas, (230, 180), (1550, 180), gc=gc, alpha_base=160, passes=2, seed=103)

    # 2. Planisphere Circular Framework
    cx, cy = 930, 820
    r_outer = 560
    r_inner = 520

    cv2.circle(canvas, (cx, cy), r_outer, (*gc, 180), 2, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), r_inner, (*gc, 120), 1, cv2.LINE_AA)

    for deg in range(0, 360, 10):
        rad = np.deg2rad(deg)
        cos_a, sin_a = np.cos(rad), np.sin(rad)
        p1 = (int(round(cx + r_outer * cos_a)), int(round(cy + r_outer * sin_a)))
        tick_len = 16 if deg % 30 == 0 else 8
        p2 = (int(round(cx + (r_outer - tick_len) * cos_a)), int(round(cy + (r_outer - tick_len) * sin_a)))
        alpha = 190 if deg % 30 == 0 else 110
        cv2.line(canvas, p1, p2, (*gc, alpha), 1, cv2.LINE_AA)

        if deg % 30 == 0:
            clock_romans = {
                270: "XII",
                300: "I",
                330: "II",
                0: "III",
                30: "IV",
                60: "V",
                90: "VI",
                120: "VII",
                150: "VIII",
                180: "IX",
                210: "X",
                240: "XI"
            }
            roman_str = clock_romans[deg]
            t_rom, _ = render_pencil_text(roman_str, FONT_PATH, font_size=18, gc=gc, seed=200+deg)
            rx = int(round(cx + (r_outer - 32) * cos_a - t_rom.shape[1] // 2))
            ry = int(round(cy + (r_outer - 32) * sin_a - t_rom.shape[0] // 2))
            blit_rgba(canvas, t_rom, rx, ry)

    draw_sketchy_line(canvas, (cx - r_outer - 25, cy), (cx - r_outer + 15, cy), gc=gc, alpha_base=130, passes=2, seed=301)
    draw_sketchy_line(canvas, (cx + r_outer - 15, cy), (cx + r_outer + 25, cy), gc=gc, alpha_base=130, passes=2, seed=302)
    draw_sketchy_line(canvas, (cx, cy - r_outer - 25), (cx, cy - r_outer + 15), gc=gc, alpha_base=130, passes=2, seed=303)
    draw_sketchy_line(canvas, (cx, cy + r_outer - 15), (cx, cy + r_outer + 25), gc=gc, alpha_base=130, passes=2, seed=304)

    # 3. 12x12 Word Search Grid
    cell_w, cell_h = 58, 58
    grid_w = 12 * cell_w
    grid_h = 12 * cell_h
    gx0 = cx - grid_w // 2
    gy0 = cy - grid_h // 2

    # 16 Astronomical guides; remaining cells after placement spell the 34-letter maxim
    words = [
        'CASSIOPEIA', 'BETELGEUSE', 'ALDEBARAN', 'ANDROMEDA', 'PLEIADES',
        'SOLSTICE', 'ALIDADE', 'POLARIS', 'ECLIPSE', 'ZENITH',
        'ALTAIR', 'SYZYGY', 'SIRIUS', 'ORION', 'NADIR', 'VEGA'
    ]
    hidden_msg = 'THESKYREMEMBERSWHATTHEEARTHFORGETS'

    random.seed(21)
    grid = [['' for _ in range(12)] for _ in range(12)]
    is_word = [[False]*12 for _ in range(12)]

    shuffled_words = list(words)
    random.shuffle(shuffled_words)

    for w in shuffled_words:
        valid_pos = []
        for dr, dc in [(0, 1), (1, 0), (1, 1), (1, -1)]:
            for r in range(12):
                for c in range(12):
                    er, ec = r + dr * (len(w) - 1), c + dc * (len(w) - 1)
                    if 0 <= er < 12 and 0 <= ec < 12:
                        ok = True
                        for i, ch in enumerate(w):
                            gr, gc_col = r + dr * i, c + dc * i
                            if grid[gr][gc_col] != '' and grid[gr][gc_col] != ch:
                                ok = False
                                break
                        if ok:
                            valid_pos.append((r, c, dr, dc))
        r, c, dr, dc = random.choice(valid_pos)
        for i, ch in enumerate(w):
            grid[r + dr * i][c + dc * i] = ch
            is_word[r + dr * i][c + dc * i] = True

    empty = [(r, c) for r in range(12) for c in range(12) if not is_word[r][c]]
    for i, ch in enumerate(hidden_msg):
        r, c = empty[i]
        grid[r][c] = ch

    # Grid intersection ticks (astronomical grid styling)
    for r in range(13):
        for c in range(13):
            px, py = gx0 + c * cell_w, gy0 + r * cell_h
            cv2.line(canvas, (px - 3, py), (px + 3, py), (*gc, 70), 1, cv2.LINE_AA)
            cv2.line(canvas, (px, py - 3), (px, py + 3), (*gc, 70), 1, cv2.LINE_AA)

    # Render grid letters uniformly (no spoiler dots)
    for r in range(12):
        for c in range(12):
            ch = grid[r][c]
            t_ch, _ = render_pencil_text(ch, FONT_PATH, font_size=28, gc=gc, seed=400 + r * 12 + c)
            cx_cell = gx0 + c * cell_w + cell_w // 2
            cy_cell = gy0 + r * cell_h + cell_h // 2
            lx = cx_cell - t_ch.shape[1] // 2
            ly = cy_cell - t_ch.shape[0] // 2 - 2
            blit_rgba(canvas, t_ch, lx, ly)

    # 4. Instructions & 16 Blank Write-in Slots
    t_inst, b_in = render_pencil_text(
        "Locate and circle the sixteen celestial guides in the starfield:",
        FONT_PATH, font_size=25, gc=gc, seed=501
    )
    blit_rgba(canvas, t_inst, 230, 1460 - b_in)

    row_y_list = [1587, 1684, 1781, 1878, 1975, 2072, 2169, 2265]

    for i, y_pos in enumerate(row_y_list):
        # Column 1: Guides 1 to 8
        cv2.circle(canvas, (240, y_pos - 7), 3, (*gc, 200), -1, cv2.LINE_AA)
        cv2.circle(canvas, (240, y_pos - 7), 6, (*gc, 120), 1, cv2.LINE_AA)
        t_n1, _ = render_pencil_text(f"{i + 1}.", FONT_PATH, font_size=25, gc=gc, seed=600 + i)
        blit_rgba(canvas, t_n1, 258, y_pos - 21)
        draw_sketchy_line(canvas, (295, y_pos + 1), (845, y_pos + 1), gc=gc, alpha_base=130, passes=1, seed=700 + i)

        # Column 2: Guides 9 to 16
        cv2.circle(canvas, (920, y_pos - 7), 3, (*gc, 200), -1, cv2.LINE_AA)
        cv2.circle(canvas, (920, y_pos - 7), 6, (*gc, 120), 1, cv2.LINE_AA)
        t_n2, _ = render_pencil_text(f"{i + 9}.", FONT_PATH, font_size=25, gc=gc, seed=800 + i)
        blit_rgba(canvas, t_n2, 938, y_pos - 21)
        draw_sketchy_line(canvas, (985, y_pos + 1), (1535, y_pos + 1), gc=gc, alpha_base=130, passes=1, seed=900 + i)

    return canvas


# -------------------------------------------------------------------------
# GAME C2: THE ZODIACAL ENGINE
# -------------------------------------------------------------------------

def render_game_c2(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Hoja C1 · Cara B (Game C2 — The Zodiac Gear Crossword)."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. Header
    t_title, _ = render_pencil_text("The Zodiacal Engine", FONT_PATH, font_size=58, gc=gc, seed=101)
    blit_rgba(canvas, t_title, 200, 80)

    draw_sketchy_line(canvas, (200, 180), (1520, 180), gc=gc, alpha_base=160, passes=2, seed=103)

    # 2. Decorative Astrolabe Gear on Right Side
    cg_x, cg_y = 1320, 670
    cv2.circle(canvas, (cg_x, cg_y), 135, (*gc, 140), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cg_x, cg_y), 115, (*gc, 90), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cg_x, cg_y), 50, (*gc, 110), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cg_x, cg_y), 16, (*gc, 150), 1, cv2.LINE_AA)
    for a in range(0, 360, 15):
        rad = np.deg2rad(a)
        p1 = (int(round(cg_x + 135 * np.cos(rad))), int(round(cg_y + 135 * np.sin(rad))))
        p2 = (int(round(cg_x + 148 * np.cos(rad))), int(round(cg_y + 148 * np.sin(rad))))
        cv2.line(canvas, p1, p2, (*gc, 140), 2, cv2.LINE_AA)
    for a in range(0, 360, 45):
        rad = np.deg2rad(a)
        p1 = (int(round(cg_x + 50 * np.cos(rad))), int(round(cg_y + 50 * np.sin(rad))))
        p2 = (int(round(cg_x + 115 * np.cos(rad))), int(round(cg_y + 115 * np.sin(rad))))
        cv2.line(canvas, p1, p2, (*gc, 95), 1, cv2.LINE_AA)

    # 3. Crossword Grid (10 words: 5 Across, 5 Down, 13 rows x 12 cols)
    cell_sz = 68
    gx0 = 230
    gy0 = 230

    active_cells = {}
    word_placements = [
        ("CELESTIAL", 0, 4, 'D'),
        ("SEXTANT",   0, 10, 'D'),
        ("POLARIS",   2, 2, 'D'),
        ("APOGEE",    3, 0, 'A'),
        ("ALIDADE",   3, 0, 'D'),
        ("MERIDIAN",  5, 7, 'D'),
        ("ZENITH",    6, 6, 'A'),
        ("SOLSTICE",  8, 2, 'A'),
        ("ECLIPTIC",  10, 4, 'A'),
        ("HORIZON",   12, 1, 'A')
    ]

    for w, r, c, d in word_placements:
        for i, ch in enumerate(w):
            rr = r if d == 'A' else r + i
            cc = c + i if d == 'A' else c
            active_cells[(rr, cc)] = ch

    clue_numbers = {
        (0, 4):  "1",   # Down: Celestial
        (0, 10): "2",   # Down: Sextant
        (2, 2):  "3",   # Down: Polaris
        (3, 0):  "4",   # Across: Apogee, Down: Alidade
        (5, 7):  "5",   # Down: Meridian
        (6, 6):  "6",   # Across: Zenith
        (8, 2):  "7",   # Across: Solstice
        (10, 4): "8",   # Across: Ecliptic
        (12, 1): "9"    # Across: Horizon
    }

    # Master Key circles spelling E-C-L-I-P-S-E (1 to 7)
    key_circles = {
        (10, 4): "1",  # E (Ecliptic)
        (0, 4):  "2",  # C (Celestial)
        (4, 2):  "3",  # L (Polaris)
        (6, 9):  "4",  # I (Zenith)
        (10, 8): "5",  # P (Ecliptic)
        (0, 10): "6",  # S (Sextant)
        (8, 9):  "7"   # E (Solstice)
    }

    for (r, c), _ in active_cells.items():
        x1 = gx0 + c * cell_sz
        y1 = gy0 + r * cell_sz
        x2 = x1 + cell_sz
        y2 = y1 + cell_sz

        draw_sketchy_line(canvas, (x1, y1), (x2, y1), gc=gc, alpha_base=180, passes=2, seed=r*10+c)
        draw_sketchy_line(canvas, (x2, y1), (x2, y2), gc=gc, alpha_base=180, passes=2, seed=r*10+c+1)
        draw_sketchy_line(canvas, (x2, y2), (x1, y2), gc=gc, alpha_base=180, passes=2, seed=r*10+c+2)
        draw_sketchy_line(canvas, (x1, y2), (x1, y1), gc=gc, alpha_base=180, passes=2, seed=r*10+c+3)

        if (r, c) in clue_numbers:
            t_num, _ = render_pencil_text(clue_numbers[(r, c)], FONT_PATH, font_size=18, gc=gc, seed=300+r*10+c)
            blit_rgba(canvas, t_num, x1 + 5, y1 + 3)

        if (r, c) in key_circles:
            mid_x, mid_y = (x1 + x2) // 2, (y1 + y2) // 2
            cv2.circle(canvas, (mid_x, mid_y), 26, (*gc, 140), 1, cv2.LINE_AA)
            t_kc, _ = render_pencil_text(key_circles[(r, c)], FONT_PATH, font_size=15, gc=gc, seed=500+r*10+c)
            blit_rgba(canvas, t_kc, x2 - 18, y2 - 20)

    # 4. Crossword Clues (10 Clues in 2 Columns)
    draw_sketchy_line(canvas, (200, 1160), (1520, 1160), gc=gc, alpha_base=140, passes=2, seed=601)

    t_ac_hdr, b_ah = render_pencil_text("Across (The Horizontal Circles)", FONT_PATH, font_size=28, gc=gc, seed=602)
    blit_rgba(canvas, t_ac_hdr, 200, 1205 - b_ah)

    across_clues = [
        ("4.", "The point where a wandering star or moon is farthest from Earth."),
        ("6.", "The highest point of the celestial dome, directly overhead."),
        ("7.", "The longest noon, when the sun reaches northernmost declination."),
        ("8.", "The great golden track traced by the sun through the twelve houses."),
        ("9.", "The boundless ring where earth meets the dome of heaven.")
    ]

    for i, (num, txt) in enumerate(across_clues):
        y_pos = 1260 + i * 105
        t_n, b_n = render_pencil_text(num, FONT_PATH, font_size=26, gc=gc, seed=700+i)
        blit_rgba(canvas, t_n, 200, y_pos - b_n)

        words_c = txt.split()
        l1 = " ".join(words_c[:6])
        l2 = " ".join(words_c[6:])
        t_l1, b_1 = render_pencil_text(l1, FONT_PATH, font_size=22, gc=gc, seed=710+i)
        blit_rgba(canvas, t_l1, 240, y_pos - b_1)
        if l2:
            t_l2, b_2 = render_pencil_text(l2, FONT_PATH, font_size=22, gc=gc, seed=720+i)
            blit_rgba(canvas, t_l2, 240, y_pos + 30 - b_2)

    t_dn_hdr, b_dh = render_pencil_text("Down (The Vertical Planes)", FONT_PATH, font_size=28, gc=gc, seed=802)
    blit_rgba(canvas, t_dn_hdr, 880, 1205 - b_dh)

    down_clues = [
        ("1.", "Of the heavenly sphere and its ancient revolving harmonies."),
        ("2.", "The brass arc used to measure the angular height of the stars."),
        ("3.", "The northern pivot of heaven, steady guide of nocturnal mariners."),
        ("4.", "The revolving sight rule that aligns with distant beacons."),
        ("5.", "The great noon circle passing through observer and both poles.")
    ]

    for i, (num, txt) in enumerate(down_clues):
        y_pos = 1260 + i * 105
        t_n, b_n = render_pencil_text(num, FONT_PATH, font_size=26, gc=gc, seed=810+i)
        blit_rgba(canvas, t_n, 880, y_pos - b_n)

        words_c = txt.split()
        l1 = " ".join(words_c[:6])
        l2 = " ".join(words_c[6:])
        t_l1, b_1 = render_pencil_text(l1, FONT_PATH, font_size=22, gc=gc, seed=820+i)
        blit_rgba(canvas, t_l1, 920, y_pos - b_1)
        if l2:
            t_l2, b_2 = render_pencil_text(l2, FONT_PATH, font_size=22, gc=gc, seed=830+i)
            blit_rgba(canvas, t_l2, 920, y_pos + 30 - b_2)

    # 5. Deduction Area (The Master Key)
    draw_sketchy_line(canvas, (200, 1830), (1520, 1830), gc=gc, alpha_base=140, passes=2, seed=901)

    t_dec, b_dec = render_pencil_text("The Master Key (Assemble the seven numbered circles 1 to 7):", FONT_PATH, font_size=26, gc=gc, seed=902)
    blit_rgba(canvas, t_dec, 200, 1890 - b_dec)

    box_w, box_h = 80, 80
    start_bx = 475
    by = 1950
    for idx in range(7):
        bx = start_bx + idx * (box_w + 35)
        draw_sketchy_line(canvas, (bx, by), (bx + box_w, by), gc=gc, alpha_base=190, passes=2, seed=910+idx)
        draw_sketchy_line(canvas, (bx + box_w, by), (bx + box_w, by + box_h), gc=gc, alpha_base=190, passes=2, seed=911+idx)
        draw_sketchy_line(canvas, (bx + box_w, by + box_h), (bx, by + box_h), gc=gc, alpha_base=190, passes=2, seed=912+idx)
        draw_sketchy_line(canvas, (bx, by + box_h), (bx, by), gc=gc, alpha_base=190, passes=2, seed=913+idx)

        t_subn, _ = render_pencil_text(str(idx + 1), FONT_PATH, font_size=22, gc=gc, seed=920+idx)
        blit_rgba(canvas, t_subn, bx + box_w // 2 - t_subn.shape[1] // 2, by + box_h + 15)

    return canvas


# -------------------------------------------------------------------------
# GAME C3: THE MIDNIGHT TRANSIT
# -------------------------------------------------------------------------

def render_game_c3(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Hoja C2 · Cara A (Game C3 — The Star Transit Triangulation)."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. Header
    t_title, _ = render_pencil_text("The Midnight Transit", FONT_PATH, font_size=58, gc=gc, seed=101)
    blit_rgba(canvas, t_title, 230, 80)

    draw_sketchy_line(canvas, (230, 180), (1550, 180), gc=gc, alpha_base=160, passes=2, seed=103)

    # 2. Nocturnal Starfield Frame (height scaled to leave room for notebook-aligned clues)
    fx1, fy1, fx2, fy2 = 230, 220, 1550, 1180
    draw_sketchy_line(canvas, (fx1, fy1), (fx2, fy1), gc=gc, alpha_base=180, passes=2, seed=201)
    draw_sketchy_line(canvas, (fx2, fy1), (fx2, fy2), gc=gc, alpha_base=180, passes=2, seed=202)
    draw_sketchy_line(canvas, (fx2, fy2), (fx1, fy2), gc=gc, alpha_base=180, passes=2, seed=203)
    draw_sketchy_line(canvas, (fx1, fy2), (fx1, fy1), gc=gc, alpha_base=180, passes=2, seed=204)

    for x in range(fx1 + 100, fx2, 120):
        cv2.line(canvas, (x, fy1), (x, fy1 + 8), (*gc, 140), 1, cv2.LINE_AA)
        cv2.line(canvas, (x, fy2), (x, fy2 - 8), (*gc, 140), 1, cv2.LINE_AA)
    for y in range(fy1 + 100, fy2, 120):
        cv2.line(canvas, (fx1, y), (fx1 + 8, y), (*gc, 140), 1, cv2.LINE_AA)
        cv2.line(canvas, (fx2, y), (fx2 - 8, y), (*gc, 140), 1, cv2.LINE_AA)

    stars = [
        ("Achernar", "alpha-Eri", 139, (380, 1060), 6),
        ("Canopus", "alpha-Car", 310, (520, 780), 7),
        ("Sirius", "alpha-CMa", 9, (820, 940), 8),
        ("Rigel", "beta-Ori", 860, (1320, 1040), 7),
        ("Bellatrix", "gamma-Ori", 250, (1420, 680), 5),
        ("Betelgeuse", "alpha-Ori", 550, (1260, 480), 8),
        ("Aldebaran", "alpha-Tau", 65, (980, 420), 7),
        ("Capella", "alpha-Aur", 43, (720, 360), 6),
        ("Polaris", "alpha-UMi", 433, (890, 680), 7),
        ("Vega", "alpha-Lyr", 25, (440, 440), 7),
        ("Arcturus", "alpha-Boo", 37, (1380, 320), 6),
        ("Spica", "alpha-Vir", 250, (320, 640), 5),
    ]

    for name, _, dist, (sx, sy), rad in stars:
        cv2.circle(canvas, (sx, sy), rad, (*gc, 230), -1, cv2.LINE_AA)
        cv2.circle(canvas, (sx, sy), rad + 4, (*gc, 130), 1, cv2.LINE_AA)
        cv2.circle(canvas, (sx, sy), rad + 9, (*gc, 70), 1, cv2.LINE_AA)
        cv2.line(canvas, (sx - rad - 6, sy), (sx + rad + 6, sy), (*gc, 160), 1, cv2.LINE_AA)
        cv2.line(canvas, (sx, sy - rad - 6), (sx, sy + rad + 6), (*gc, 160), 1, cv2.LINE_AA)

        t_nm, b_nm = render_pencil_text(f"{name} ({dist} ly)", FONT_PATH, font_size=20, gc=gc, seed=300+dist)
        if name in ("Bellatrix", "Arcturus"):
            blit_rgba(canvas, t_nm, sx - rad - 12 - t_nm.shape[1], sy - b_nm // 2)
        else:
            blit_rgba(canvas, t_nm, sx + rad + 8, sy - b_nm // 2)

    # 3. Navigation Clues (Each sitting naturally above notebook lines)
    t_rule_hdr, b_rh = render_pencil_text("The Six Chords of Distant Light (Trace with straight edge):", FONT_PATH, font_size=30, gc=gc, seed=401)
    blit_rgba(canvas, t_rule_hdr, 230, 1260 - b_rh)

    clues = [
        ("I.", "Depart from Achernar (139 ly). Sights the southern pivot.", 1355),
        ("II.", "Draw to the blue supergiant whose distance in light-years equals 139 + 721.", 1450),
        ("III.", "Traverse north-northwest to the red giant where starlight departed 860 - 310 years ago.", 1545),
        ("IV.", "Cast the third chord across the heavens to the orange beacon at 550 - 485 light-years.", 1640),
        ("V.", "Ascend along the meridian to the northern beacon of Capella.", 1735),
        ("VI.", "Close the celestial circuit by plunging to the true northern axle: Polaris.", 1830)
    ]

    for i, (num, txt, y_base) in enumerate(clues):
        t_n, b_n = render_pencil_text(num, FONT_PATH, font_size=32, gc=gc, seed=500+i)
        blit_rgba(canvas, t_n, 230, y_base - b_n)

        t_tx, b_tx = render_pencil_text(txt, FONT_PATH, font_size=29, gc=gc, seed=510+i)
        blit_rgba(canvas, t_tx, 290, y_base - b_tx)

    # 4. Deduction Box & Observation Log (sitting above notebook lines 2066, 2162, 2258)
    draw_sketchy_line(canvas, (230, 1910), (1550, 1910), gc=gc, alpha_base=140, passes=1, seed=601)

    t_concl, b_cc = render_pencil_text("Observation Log & The Hidden Asterism:", FONT_PATH, font_size=30, gc=gc, seed=602)
    blit_rgba(canvas, t_concl, 230, 1955 - b_cc)

    notes_lines = [
        ("1. Sum of the Six Stellar Chords: [ ___ ] + [ ___ ] + [ ___ ] + [ ___ ] + [ ___ ] + [ ___ ] = [ _______ ] ly.", 2045),
        ("2. The geometric polygon revealed by the six chords: [ _________________________ ].", 2140),
        ("3. The two celestial anchors bridging southern and northern poles: [ __________ ] & [ __________ ].", 2235)
    ]

    for i, (n_txt, y_base) in enumerate(notes_lines):
        t_nl, b_nl = render_pencil_text(n_txt, FONT_PATH, font_size=29, gc=gc, seed=700+i)
        blit_rgba(canvas, t_nl, 230, y_base - b_nl)

    return canvas


# -------------------------------------------------------------------------
# GAME C4: THE CELESTIAL CIPHER
# -------------------------------------------------------------------------

def render_game_c4(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Hoja C2 · Cara B (Game C4 — The Astrolabe Coordinate Dial Cipher)."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. Header
    t_title, _ = render_pencil_text("The Celestial Cipher", FONT_PATH, font_size=58, gc=gc, seed=101)
    blit_rgba(canvas, t_title, 200, 80)

    draw_sketchy_line(canvas, (200, 180), (1520, 180), gc=gc, alpha_base=160, passes=2, seed=103)

    # 2. Concentric Coordinate Dial
    cx, cy = 860, 660
    radii = [420, 340, 260, 180, 100]

    for r in radii:
        cv2.circle(canvas, (cx, cy), r, (*gc, 160), 1, cv2.LINE_AA)

    romans = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"]
    for i in range(12):
        deg = i * 30 - 90
        rad = np.deg2rad(deg)
        cos_a, sin_a = np.cos(rad), np.sin(rad)
        p1 = (int(round(cx + radii[-1] * cos_a)), int(round(cy + radii[-1] * sin_a)))
        p2 = (int(round(cx + radii[0] * cos_a)), int(round(cy + radii[0] * sin_a)))
        cv2.line(canvas, p1, p2, (*gc, 140), 1, cv2.LINE_AA)

        p_rom = (int(round(cx + (radii[0] + 25) * cos_a)), int(round(cy + (radii[0] + 25) * sin_a)))
        t_rom, _ = render_pencil_text(romans[i], FONT_PATH, font_size=20, gc=gc, seed=200+i)
        blit_rgba(canvas, t_rom, p_rom[0] - t_rom.shape[1] // 2, p_rom[1] - t_rom.shape[0] // 2)

    bands = ["+45*", "+15*", "-15*", "-45*"]
    for b_idx, b_lbl in enumerate(bands):
        mid_r = (radii[b_idx] + radii[b_idx + 1]) // 2
        t_bd, _ = render_pencil_text(b_lbl, FONT_PATH, font_size=16, gc=gc, seed=250+b_idx)
        blit_rgba(canvas, t_bd, cx - t_bd.shape[1] // 2, cy - mid_r - t_bd.shape[0] // 2)

    target_msg = "YOU WERE ALWAYS THE TREASURE"
    coords_for_msg = [
        ("IV", "+45*"), ("VII", "-15*"), ("II", "+15*"),
        ("IX", "-15*"), ("V", "+15*"), ("I", "+45*"), ("XI", "-45*"),
        ("III", "+15*"), ("VIII", "+45*"), ("X", "-15*"), ("VI", "+45*"), ("IV", "-15*"), ("XII", "-45*"),
        ("I", "-15*"), ("VII", "+45*"), ("V", "-45*"),
        ("X", "+15*"), ("III", "-45*"), ("VIII", "-15*"), ("VI", "-45*"), ("IX", "+45*"), ("II", "-45*"), ("XI", "+15*"), ("XII", "+15*")
    ]

    dial_letters = {}
    for letter, (s_rom, b_lbl) in zip(target_msg.replace(" ", ""), coords_for_msg):
        s_idx = romans.index(s_rom)
        b_idx = bands.index(b_lbl)
        dial_letters[(s_idx, b_idx)] = letter

    filler = "BCDFGHJKLMNPQRSTVWXZ"
    for s_idx in range(12):
        for b_idx in range(4):
            if (s_idx, b_idx) not in dial_letters:
                dial_letters[(s_idx, b_idx)] = filler[(s_idx * 4 + b_idx) % len(filler)]

    for (s_idx, b_idx), ch in dial_letters.items():
        deg_mid = s_idx * 30 - 75
        rad_mid = np.deg2rad(deg_mid)
        r_mid = (radii[b_idx] + radii[b_idx + 1]) // 2
        px = int(round(cx + r_mid * np.cos(rad_mid)))
        py = int(round(cy + r_mid * np.sin(rad_mid)))

        t_ch, _ = render_pencil_text(ch, FONT_PATH, font_size=23, gc=gc, seed=400+s_idx*4+b_idx)
        blit_rgba(canvas, t_ch, px - t_ch.shape[1] // 2, py - t_ch.shape[0] // 2)

    cv2.circle(canvas, (cx, cy), radii[-1], (*gc, 180), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), 16, (*gc, 140), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), 4, (*gc, 200), -1, cv2.LINE_AA)
    t_hub, _ = render_pencil_text("Pole", FONT_PATH, font_size=18, gc=gc, seed=499)
    blit_rgba(canvas, t_hub, cx - t_hub.shape[1] // 2, cy + 22)

    # 3. Riddle Table (Sighting Log)
    draw_sketchy_line(canvas, (200, 1140), (1520, 1140), gc=gc, alpha_base=140, passes=2, seed=501)

    t_tbl_hdr, b_th = render_pencil_text("Sighting Log: Cross the Hour Angle with the Declination Ring:", FONT_PATH, font_size=30, gc=gc, seed=502)
    blit_rgba(canvas, t_tbl_hdr, 200, 1185 - b_th)

    groups = [
        ("I. The Seeker's Identity:", coords_for_msg[0:3]),
        ("II. The Past Meridian:",   coords_for_msg[3:7]),
        ("III. The Timeless Stance:", coords_for_msg[7:13]),
        ("IV. The Definite Sun:",     coords_for_msg[13:16]),
        ("V. The Final Mystery:",     coords_for_msg[16:24])
    ]

    y_tbl = 1250
    for g_title, g_coords in groups:
        t_gt, b_gt = render_pencil_text(g_title, FONT_PATH, font_size=27, gc=gc, seed=600+y_tbl)
        blit_rgba(canvas, t_gt, 200, y_tbl - b_gt)

        chip_x = 525
        for s_rom, b_lbl in g_coords:
            coord_str = f"({s_rom}, {b_lbl})"
            t_cp, b_cp = render_pencil_text(coord_str, FONT_PATH, font_size=23, gc=gc, seed=650+chip_x+y_tbl)
            blit_rgba(canvas, t_cp, chip_x, y_tbl - b_cp)
            chip_x += t_cp.shape[1] + 15
        y_tbl += 78

    # 4. Deduction Box (The Decoded Prophecy)
    draw_sketchy_line(canvas, (200, 1660), (1520, 1660), gc=gc, alpha_base=140, passes=2, seed=701)

    t_dec_hdr, b_dh = render_pencil_text("The Decoded Prophecy of the Cartographer:", FONT_PATH, font_size=30, gc=gc, seed=702)
    blit_rgba(canvas, t_dec_hdr, 200, 1715 - b_dh)

    box_w, box_h = 56, 68
    let_gap = 10

    # Line 1: Words I (YOU - 3), II (WERE - 4), III (ALWAYS - 6)
    words_line1 = [("I", 3), ("II", 4), ("III", 6)]
    w_gap1 = 55
    total_w1 = sum(n * box_w + (n - 1) * let_gap for _, n in words_line1) + (len(words_line1) - 1) * w_gap1
    cur_x1 = (CANVAS_WIDTH_PX - total_w1) // 2
    by1 = 1830

    for w_tag, n_letters in words_line1:
        w_block = n_letters * box_w + (n_letters - 1) * let_gap
        t_tag, _ = render_pencil_text(w_tag, FONT_PATH, font_size=20, gc=gc, seed=750+cur_x1)
        blit_rgba(canvas, t_tag, cur_x1 + w_block // 2 - t_tag.shape[1] // 2, by1 - 25)

        for l_idx in range(n_letters):
            bx = cur_x1 + l_idx * (box_w + let_gap)
            draw_sketchy_line(canvas, (bx, by1), (bx + box_w, by1), gc=gc, alpha_base=180, passes=2, seed=800+bx)
            draw_sketchy_line(canvas, (bx + box_w, by1), (bx + box_w, by1 + box_h), gc=gc, alpha_base=180, passes=2, seed=801+bx)
            draw_sketchy_line(canvas, (bx + box_w, by1 + box_h), (bx, by1 + box_h), gc=gc, alpha_base=180, passes=2, seed=802+bx)
            draw_sketchy_line(canvas, (bx, by1 + box_h), (bx, by1), gc=gc, alpha_base=180, passes=2, seed=803+bx)
        cur_x1 += w_block + w_gap1

    # Line 2: Words IV (THE - 3), V (TREASURE - 8)
    words_line2 = [("IV", 3), ("V", 8)]
    w_gap2 = 65
    total_w2 = sum(n * box_w + (n - 1) * let_gap for _, n in words_line2) + (len(words_line2) - 1) * w_gap2
    cur_x2 = (CANVAS_WIDTH_PX - total_w2) // 2
    by2 = 1975

    for w_tag, n_letters in words_line2:
        w_block = n_letters * box_w + (n_letters - 1) * let_gap
        t_tag, _ = render_pencil_text(w_tag, FONT_PATH, font_size=20, gc=gc, seed=850+cur_x2)
        blit_rgba(canvas, t_tag, cur_x2 + w_block // 2 - t_tag.shape[1] // 2, by2 - 25)

        for l_idx in range(n_letters):
            bx = cur_x2 + l_idx * (box_w + let_gap)
            draw_sketchy_line(canvas, (bx, by2), (bx + box_w, by2), gc=gc, alpha_base=180, passes=2, seed=900+bx)
            draw_sketchy_line(canvas, (bx + box_w, by2), (bx + box_w, by2 + box_h), gc=gc, alpha_base=180, passes=2, seed=901+bx)
            draw_sketchy_line(canvas, (bx + box_w, by2 + box_h), (bx, by2 + box_h), gc=gc, alpha_base=180, passes=2, seed=902+bx)
            draw_sketchy_line(canvas, (bx, by2 + box_h), (bx, by2), gc=gc, alpha_base=180, passes=2, seed=903+bx)
        cur_x2 += w_block + w_gap2

    draw_sketchy_line(canvas, (200, 2110), (1520, 2110), gc=gc, alpha_base=130, passes=1, seed=950)

    t_sig, b_sg = render_pencil_text("The Cartographer", FONT_PATH, font_size=28, gc=gc, seed=960)
    blit_rgba(canvas, t_sig, 1200, 2170 - b_sg)

    return canvas


# -------------------------------------------------------------------------
# PRODUCTION BUILD PIPELINE
# -------------------------------------------------------------------------

def build_constellation_games(real_paper_path: str, output_dir: str) -> None:
    """Renders and builds all production assets for Constellation Games (Hojas C1 & C2)."""
    pdf_dir = os.path.join(output_dir, "pdf")
    mockup_dir = os.path.join(output_dir, "mockups")
    os.makedirs(pdf_dir, exist_ok=True)
    os.makedirs(mockup_dir, exist_ok=True)

    print("=== Building Constellation Games (Hojas C1 & C2 — 4 Pages) ===")

    bg_raw = None
    if os.path.exists(real_paper_path):
        bg_raw = cv2.imread(real_paper_path)
        if bg_raw is not None:
            bg_raw = cv2.resize(bg_raw, (CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX))

    games = [
        ("Hoja C1 · Cara A (Game C1 — The Planisphere)", render_game_c1, "game01_planisphere", False),
        ("Hoja C1 · Cara B (Game C2 — The Zodiacal Engine)", render_game_c2, "game02_zodiac_crossword", True),
        ("Hoja C2 · Cara A (Game C3 — The Midnight Transit)", render_game_c3, "game03_star_transit", False),
        ("Hoja C2 · Cara B (Game C4 — The Celestial Cipher)", render_game_c4, "game04_coordinate_cipher", True),
    ]

    rendered_canvases = {}

    for label, renderer, prefix, is_face_b in games:
        print(f"\nRendering {label}...")
        canvas = renderer(gc=GRAPHITE_COLOR)
        rendered_canvases[prefix] = canvas

        # Verify hole clearance
        if is_face_b:
            right_zone = canvas[:, 1583:, 3]
            violation = np.count_nonzero(right_zone)
            if violation > 0:
                print(f"  [ERROR] {violation} pixels in RIGHT hole zone (X > 1583)!")
                canvas[:, 1583:, 3] = 0
        else:
            left_zone = canvas[:, :165, 3]
            violation = np.count_nonzero(left_zone)
            if violation > 0:
                print(f"  [ERROR] {violation} pixels in LEFT hole zone (X < 165)!")
                canvas[:, :165, 3] = 0

        # 1. Vector PDF (300 DPI)
        pdf_path = os.path.join(pdf_dir, f"{prefix}_A5.pdf")
        PDFBuilder.save_a5_pdf_from_rgba(canvas, pdf_path, dpi=300)
        print(f"  -> Vector PDF: {pdf_path}")

        # 3. Photorealistic Mockup
        if bg_raw is not None:
            bg_face = cv2.flip(bg_raw, 1) if is_face_b else bg_raw
            fg_rgb = canvas[:, :, :3].astype(np.float32)
            alpha = (canvas[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]
            mockup = (fg_rgb * alpha + bg_face.astype(np.float32) * (1.0 - alpha)).astype(np.uint8)

            mockup_path = os.path.join(mockup_dir, f"{prefix}_mockup.jpg")
            cv2.imwrite(mockup_path, mockup, [cv2.IMWRITE_JPEG_QUALITY, 95])
            print(f"  -> Photorealistic Mockup: {mockup_path}")

    print("\n=== Successfully Built All 4 Constellation Games! ===")


if __name__ == '__main__':
    paper_photo = os.path.join(PROJECT_ROOT, "journal", "page01", "real_paper_300dpi.png")
    out_dir = os.path.join(PROJECT_ROOT, "journal", "constellation_games")
    build_constellation_games(paper_photo, out_dir)
