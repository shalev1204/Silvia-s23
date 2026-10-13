"""
Master Production Pipeline for the Complete 12-Sheet / 24-Page Journal:
Integrates lore and games organically across all 12 physical sheets (A5, double-sided),
strictly preserving:
1. Sheet 1: Da Vinci Cover (Cara A) & Cartographer's Letter (Cara B).
2. Sheets 2 & 3: The Celestial Alphabet (4 uninterrupted faces).
3. Sheets 4, 5, 6, 7: The Constellation Path & Astrolabe Codex intertwined with Games C1-C4,
   concluding with the Field Log & Dual Wax Seals transition (7B).
4. Sheets 8, 9, 10, 11: The Desert Frontier Lore & The Grand Desert Map (4 uninterrupted quadrants,
   forming continuous Double-Page Spreads 1 & 2), followed by Game D1 (09B).
5. Sheets 10, 11 & 12: The Desert Enigmas (D2, D3, D4) and The Cartographer's Colophon (12B).

Strictly enforces A5 6-ring binder punch hole margins (0 non-zero alpha pixels):
- Cara A (Front): X < 165 px has 0 pixels.
- Cara B (Back): X > 1583 px has 0 pixels (except full-bleed map spreads).
"""

import os
import sys
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, PROJECT_ROOT)

from scripts.journal.geometry import (
    CANVAS_WIDTH_PX,
    CANVAS_HEIGHT_PX,
    mm_to_px,
)
from scripts.journal.pdf_builder import PDFBuilder
from scripts.journal.build_page01 import build_page01
from scripts.journal.build_page01_back import render_cara_b_canvas
from scripts.journal.build_page02_03 import (
    render_face_2a,
    render_face_2b,
    render_face_3a,
    render_face_3b,
)
from scripts.journal.build_page04_05 import (
    render_face_4a,
    render_face_4b,
    render_face_5a,
    render_face_5b,
)
from scripts.journal.build_page06_07 import (
    render_face_6a,
    render_face_6b,
    render_face_7a,
    render_face_7b,
    render_face_8a,
)
from scripts.journal.build_constellation_games import (
    render_game_c1,
    render_game_c2,
    render_game_c3,
    render_game_c4,
)
from scripts.journal.build_desert_games import (
    render_game_d1,
    render_game_d2,
    render_game_d3,
    render_game_d4,
)
from scripts.journal.build_desert_odyssey_expanded import (
    render_game_d2_salt_playa,
    render_lore_10b_salt_playa_study,
    render_lore_13a_sanctuary_servant,
    render_game_d5_sun_monolith,
    render_lore_14a_cairns_survey,
    render_game_d6_sandstone_labyrinth,
    render_game_d7_cairn_iv_sentry,
    render_zoom_bridge_left,
    render_zoom_bridge_right,
    render_game_d8_arch_solstice_altar,
    render_game_d10_oracle_horizon,
    render_art_18b_stage_path_transition,
)

GRAPHITE_COLOR = (46, 42, 38)
FONT_PATH = os.path.join(PROJECT_ROOT, "assets", "fonts", "Fondamento.ttf")
SHIELD_PATH = os.path.join(PROJECT_ROOT, "journal", "page01", "assets", "mini_journal_eclipse_shield.png")
REAL_PAPER_PATH = os.path.join(PROJECT_ROOT, "journal", "page01", "real_paper_300dpi.png")
JOURNAL_DIR = os.path.join(PROJECT_ROOT, "journal")
_p17_art = os.path.join(JOURNAL_DIR, "page17", "assets", "oracle_desert_master_alpha.png")
ORACLE_ARTWORK_PATH = _p17_art if os.path.exists(_p17_art) else os.path.join(JOURNAL_DIR, "page12", "assets", "oracle_desert_master_alpha.png")
_p17_base = os.path.join(JOURNAL_DIR, "page17", "assets", "oracle_base_master_alpha.png")
ORACLE_BASE_ARTWORK_PATH = _p17_base if os.path.exists(_p17_base) else os.path.join(JOURNAL_DIR, "page12", "assets", "oracle_base_master_alpha.png")


# -------------------------------------------------------------------------
# HELPER FUNCTIONS & COLOPHON RENDERER
# -------------------------------------------------------------------------

def blit_rgba(target: np.ndarray, src: np.ndarray, x: int, y: int) -> None:
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


def render_pencil_text(text: str, font_path: str = FONT_PATH, font_size: int = 40, gc: tuple = GRAPHITE_COLOR, seed: int = 42):
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


def draw_sketchy_line(canvas: np.ndarray, p1: tuple, p2: tuple, gc: tuple = GRAPHITE_COLOR, alpha_base: int = 150, passes: int = 2, seed: int = 42) -> None:
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


def wrap_text(text: str, font_path: str, font_size: int, max_width: int):
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


def create_pencil_emblem(diameter: int = 84, gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Authentic Renaissance Compass-Drawn Eclipse Emblem."""
    size = diameter + 20
    img = np.zeros((size, size, 4), dtype=np.uint8)
    cx, cy = size // 2, size // 2
    R = diameter // 2

    # Pinprick compass anchor
    cv2.circle(img, (cx, cy), 1, (*gc, 180), -1)

    # Concentric astrolabe rings with soft pencil stroke
    cv2.circle(img, (cx, cy), R, (*gc, 205), 1, cv2.LINE_AA)
    cv2.circle(img, (cx, cy), R - 3, (*gc, 135), 1, cv2.LINE_AA)

    # Astrolabe dashed circle
    r_dash = int(R * 0.88)
    for deg in range(0, 360, 15):
        rad1 = np.deg2rad(deg)
        rad2 = np.deg2rad(deg + 7)
        x1 = int(round(cx + r_dash * np.cos(rad1)))
        y1 = int(round(cy + r_dash * np.sin(rad1)))
        x2 = int(round(cx + r_dash * np.cos(rad2)))
        y2 = int(round(cy + r_dash * np.sin(rad2)))
        cv2.line(img, (x1, y1), (x2, y2), (*gc, 160), 1, cv2.LINE_AA)

    r_inner = int(R * 0.77)
    cv2.circle(img, (cx, cy), r_inner, (*gc, 155), 1, cv2.LINE_AA)

    # Central eclipse circle
    r_ecl = int(R * 0.64)
    cv2.circle(img, (cx, cy), r_ecl, (*gc, 215), 1, cv2.LINE_AA)

    # Cardinal & diagonal ticks
    ticks = [
        (0, R - 4, R + 4, 1),
        (90, R - 4, R + 4, 1),
        (180, R - 4, R + 4, 1),
        (270, R - 4, R + 4, 1),
        (45, R - 3, R + 2, 1),
        (135, R - 3, R + 2, 1),
        (225, R - 3, R + 2, 1),
        (315, R - 3, R + 2, 1),
    ]
    for deg, r_in, r_out, w in ticks:
        rad = np.deg2rad(deg)
        x1 = int(round(cx + r_in * np.cos(rad)))
        y1 = int(round(cy + r_in * np.sin(rad)))
        x2 = int(round(cx + r_out * np.cos(rad)))
        y2 = int(round(cy + r_out * np.sin(rad)))
        cv2.line(img, (x1, y1), (x2, y2), (*gc, 190), w, cv2.LINE_AA)

    # Vertical meridian dividing line
    cv2.line(img, (cx, cy - r_ecl), (cx, cy + r_ecl), (*gc, 215), 1, cv2.LINE_AA)

    # Renaissance pencil hatching for dark hemisphere (Right half)
    mask_right = np.zeros((size, size), dtype=np.uint8)
    cv2.circle(mask_right, (cx, cy), r_ecl, 255, -1)
    mask_right[:, :cx] = 0

    hatch_layer = np.zeros((size, size), dtype=np.uint8)
    for offset in range(-size, size * 2, 3):
        pt1 = (offset, 0)
        pt2 = (offset + size, size)
        cv2.line(hatch_layer, pt1, pt2, 175, 1, cv2.LINE_AA)
    for offset in range(-size, size * 2, 4):
        pt1 = (offset + size, 0)
        pt2 = (offset, size)
        cv2.line(hatch_layer, pt1, pt2, 115, 1, cv2.LINE_AA)

    hatch_right = cv2.bitwise_and(hatch_layer, hatch_layer, mask=mask_right)
    y_idx, x_idx = np.where(hatch_right > 0)
    for y, x in zip(y_idx, x_idx):
        val = int(hatch_right[y, x])
        grain = np.random.randint(-18, 18)
        alpha = int(np.clip(val + grain, 0, 255))
        if alpha > img[y, x, 3]:
            img[y, x] = (*gc, alpha)

    return img


def render_colophon(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 12 · Cara B (Page 24 — Epilogue Lore: The Desert Oracle & The Outpost)."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    x_left = 150
    x_right = 1490
    max_w = x_right - x_left
    body_fs = 35  # Increased by 2 points for maximum legibility and page utilization
    line_spacing = 54

    # 1. Header: Prominent title, no subtitle
    t_title, b_t = render_pencil_text("The Desert Oracle", FONT_PATH, font_size=64, gc=gc, seed=101)
    blit_rgba(canvas, t_title, x_left + 5, 80 - b_t)
    draw_sketchy_line(canvas, (x_left, 110), (x_right, 110), gc=gc, alpha_base=165, passes=2, seed=102)

    # 2. Section I: Cartographer's opinion & setting the scene
    p1 = "For three weeks I traversed this furnace of dust convinced that celestial mathematics alone could resolve our quest. I believed the recovered Astrolabe was self-sufficient—that every secret of the Order lay charted in distant light. I was arrogant. The heavens may trace the celestial dial, but the earth demands a living keeper."

    cur_y = 165
    lines_p1 = wrap_text(p1, FONT_PATH, body_fs, max_w - 20)
    for i, line in enumerate(lines_p1):
        t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=body_fs, gc=gc, seed=200 + i)
        blit_rgba(canvas, t_l, x_left + 10, cur_y - b_l)
        cur_y += line_spacing

    # 3. Main Illustration (The Sighting across the desert dunes) with expanded margins
    cur_y += 45
    if os.path.exists(ORACLE_ARTWORK_PATH):
        art1 = cv2.imread(ORACLE_ARTWORK_PATH, cv2.IMREAD_UNCHANGED)
        if art1 is not None:
            target_w1 = 1060
            scale1 = target_w1 / art1.shape[1]
            target_h1 = int(round(art1.shape[0] * scale1))
            art1_scaled = cv2.resize(art1, (target_w1, target_h1), interpolation=cv2.INTER_AREA)
            art1_x = (x_left + x_right) // 2 - target_w1 // 2
            blit_rgba(canvas, art1_scaled, art1_x, cur_y)
            cur_y += target_h1 + 65
    else:
        cur_y += 750

    # 4. Section II: Story of discovering the outpost & observing him
    p2 = "Past the red pillars, following a dry salt riverbed, I caught the scent of burning cedar. Hidden beneath a massive sandstone overhang was his base: a stone sanctuary dwelling sheltered by coarse canvas, flanked by stone cairns and alignment stakes driven into the dust."
    p3 = "From the ridge above, I watched him for hours. He ignored the constellations, instead pouring red sand through his palms and arranging black river stones upon a weathered table. When he turned, his face was entirely lost within his cowl, yet he looked straight toward my perch. He knew I was there before my boots touched the stone."

    lines_p2 = wrap_text(p2, FONT_PATH, body_fs, max_w - 20)
    for i, line in enumerate(lines_p2):
        t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=body_fs, gc=gc, seed=250 + i)
        blit_rgba(canvas, t_l, x_left + 10, cur_y - b_l)
        cur_y += line_spacing

    cur_y += 24
    lines_p3 = wrap_text(p3, FONT_PATH, body_fs, max_w - 20)
    for i, line in enumerate(lines_p3):
        t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=body_fs, gc=gc, seed=300 + i)
        blit_rgba(canvas, t_l, x_left + 10, cur_y - b_l)
        cur_y += line_spacing

    # 5. Bottom Section: Mini drawing of the outpost + Cartographer's judgment & advice to Silvia
    cur_y += 45
    draw_sketchy_line(canvas, (x_left, cur_y), (x_right, cur_y), gc=gc, alpha_base=135, passes=2, seed=350)
    cur_y += 45

    if os.path.exists(ORACLE_BASE_ARTWORK_PATH):
        art2 = cv2.imread(ORACLE_BASE_ARTWORK_PATH, cv2.IMREAD_UNCHANGED)
        if art2 is not None:
            w2 = 570
            scale2 = w2 / art2.shape[1]
            h2 = int(round(art2.shape[0] * scale2))
            art2_scaled = cv2.resize(art2, (w2, h2), interpolation=cv2.INTER_AREA)

            art2_x = x_right - w2
            art2_y = cur_y - 5
            blit_rgba(canvas, art2_scaled, art2_x, art2_y)

            # Text on the left side with generous 50px gutter
            left_text_w = art2_x - x_left - 50
            p4 = "My judgment of this Oracle is unequivocal: he is unsettling and secretive, yet utterly indispensable. He guards the terrestrial coordinates lost to our Order — the buried anchor required to unlock the Astrolabe."
            p5 = "I cannot approach him; my tools belong to the stars. But you, Silvia, who unraveled the eight seals of this journal, possess eyes that see both sky and dust. Seek his outpost when shadows lengthen. The Desert Path is yours."

            cur_left_y = cur_y + 15
            lines_p4 = wrap_text(p4, FONT_PATH, 34, left_text_w)
            for i, line in enumerate(lines_p4):
                t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=34, gc=gc, seed=400 + i)
                blit_rgba(canvas, t_l, x_left + 10, cur_left_y - b_l)
                cur_left_y += 52

            cur_left_y += 24
            lines_p5 = wrap_text(p5, FONT_PATH, 34, left_text_w)
            for i, line in enumerate(lines_p5):
                t_l, b_l = render_pencil_text(line, FONT_PATH, font_size=34, gc=gc, seed=450 + i)
                blit_rgba(canvas, t_l, x_left + 10, cur_left_y - b_l)
                cur_left_y += 52

            cur_y = max(cur_left_y, art2_y + h2) + 20

    return canvas


# -------------------------------------------------------------------------
# SURGICAL GEOMETRY SHIFTERS FOR THE 4 CARA A / CARA B ADAPTATIONS
# -------------------------------------------------------------------------

def render_sheet04_back_c1(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Game C1 (The Planisphere) rendered for Cara B (X > 1583 free of punch holes)."""
    c1 = render_game_c1(gc=gc)
    # C1 already naturally satisfies X > 1583 with 0 px; shift left by 30px for extra elegance
    shifted = np.zeros_like(c1)
    shift = 30
    shifted[:, :-shift] = c1[:, shift:]
    return shifted


def render_sheet05_front_anatomy(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Astrolabe Anatomy rendered for Cara A (X < 165 free of punch holes)."""
    f4b = render_face_4b(gc=gc)
    # Shift right by 80px so notes on left clear X < 165
    shifted = np.zeros_like(f4b)
    shift = 80
    shifted[:, shift:] = f4b[:, :-shift]
    return shifted


def render_sheet06_back_c3(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Game C3 (The Midnight Transit) rendered for Cara B (X > 1583 free of punch holes)."""
    c3 = render_game_c3(gc=gc)
    # Shift left by 40px so all star tags clear X > 1583
    shifted = np.zeros_like(c3)
    shift = 40
    shifted[:, :-shift] = c3[:, shift:]
    return shifted


def render_sheet07_front_c4(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Game C4 (The Celestial Cipher) rendered for Cara A (X < 165 free of punch holes)."""
    c4 = render_game_c4(gc=gc)
    # Shift right by 25px so content is centered on Cara A
    shifted = np.zeros_like(c4)
    shift = 25
    shifted[:, shift:] = c4[:, :-shift]
    return shifted


def render_sheet01_front() -> np.ndarray:
    """Renders Sheet 01 Front (Cover)."""
    raw_sketch = os.path.join(JOURNAL_DIR, "page01", "raw_davinci_sketch.jpg")
    return build_page01(raw_sketch, REAL_PAPER_PATH, os.path.join(JOURNAL_DIR, "page01"))


def render_sheet01_back() -> np.ndarray:
    """Renders Sheet 01 Back (Cartographer's Letter)."""
    pil_img = render_cara_b_canvas()
    return np.array(pil_img)


# -------------------------------------------------------------------------
# MASTER BUILD ORCHESTRATOR (12 SHEETS / 24 FACES)
# -------------------------------------------------------------------------

def build_entire_journal() -> None:
    print("==========================================================================")
    print("=== BUILDING COMPLETE 12-SHEET / 24-PAGE JOURNAL (ORGANIC LORE & GAMES) ===")
    print("==========================================================================")

    bg_raw = None
    if os.path.exists(REAL_PAPER_PATH):
        bg_raw = cv2.imread(REAL_PAPER_PATH)
        if bg_raw is not None:
            bg_raw = cv2.resize(bg_raw, (CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX), interpolation=cv2.INTER_LANCZOS4)

    # 18 Sheets definition: (sheet_num, face_a_tuple, face_b_tuple)
    # Face tuple: (label, renderer_fn, stem, is_back, is_fullbleed)
    sheets = [
        # Sheet 1: Prologue
        (1,
         ("Hoja 1 · Cara A (Cover: The Eclipse Order)", render_sheet01_front, "page01_front", False, True),
         ("Hoja 1 · Cara B (Letter: The Cartographer's Letter)", render_sheet01_back, "page01_back", True, False)),

        # Sheet 2: The Celestial Alphabet (Part I)
        (2,
         ("Hoja 2 · Cara A (Alphabet Part I: Glyphs 1-7)", render_face_2a, "page02_front", False, False),
         ("Hoja 2 · Cara B (Alphabet Part II: Glyphs 8-14)", render_face_2b, "page02_back", True, False)),

        # Sheet 3: The Celestial Alphabet (Part II)
        (3,
         ("Hoja 3 · Cara A (Alphabet Part III: Glyphs 15-21)", render_face_3a, "page03_front", False, False),
         ("Hoja 3 · Cara B (Alphabet Part IV: Glyphs 22-26 & Meridian Quadrant)", render_face_3b, "page03_back", True, False)),

        # Sheet 4: Astrolabe Lore & Game C1 (The Planisphere)
        (4,
         ("Hoja 4 · Cara A (Lore: The Astrolabe & Constellation Frise)", render_face_4a, "page04_front", False, False),
         ("Hoja 4 · Cara B (Game C1: The Planisphere)", render_sheet04_back_c1, "page04_back", True, False)),

        # Sheet 5: Astrolabe Anatomy & Game C2 (The Zodiacal Engine)
        (5,
         ("Hoja 5 · Cara A (Lore: Exploded Astrolabe Anatomy)", render_sheet05_front_anatomy, "page05_front", False, False),
         ("Hoja 5 · Cara B (Game C2: The Zodiacal Engine)", render_game_c2, "page05_back", True, False)),

        # Sheet 6: Midnight Calibration & Game C3 (The Midnight Transit)
        (6,
         ("Hoja 6 · Cara A (Lore: Midnight Calibration & Planisphere)", render_face_5a, "page06_front", False, False),
         ("Hoja 6 · Cara B (Game C3: The Midnight Transit)", render_sheet06_back_c3, "page06_back", True, False)),

        # Sheet 7: Game C4 & Transition to Desert
        (7,
         ("Hoja 7 · Cara A (Game C4: The Celestial Cipher)", render_sheet07_front_c4, "page07_front", False, False),
         ("Hoja 7 · Cara B (Lore: Field Log - The Desert Frontier & Dual Seals)", render_face_5b, "page07_back", True, False)),

        # Sheet 8: Desert Lore & Grand Map Q1
        (8,
         ("Hoja 8 · Cara A (Lore: The Desert Frontier & The River Hunch)", render_face_6a, "page08_front", False, False),
         ("Hoja 8 · Cara B (Map: Grand Desert Map - NW Top-Left / Spread 1)", render_face_6b, "page08_back", True, True)),

        # Sheet 9: Grand Map Q2 & Game D1 (Chasm Maze)
        (9,
         ("Hoja 9 · Cara A (Map: Grand Desert Map - NE Top-Right / Spread 1)", render_face_7a, "page09_front", False, True),
         ("Hoja 9 · Cara B (Game D1: The Whispering Chasm Maze)", render_game_d1, "page09_back", True, False)),

        # Sheet 10: Game D2 (Salt Playa) & Salt Playa Study
        (10,
         ("Hoja 10 · Cara A (Game D2: The Salt Playa Navigation)", render_game_d2_salt_playa, "page10_front", False, False),
         ("Hoja 10 · Cara B (Lore: Study on the Dry Salt Playa Formation)", render_lore_10b_salt_playa_study, "page10_back", True, False)),

        # Sheet 11: Game D3 (Desert Lexicon - BC Ashes) & Grand Map Q3 (Map SW)
        (11,
         ("Hoja 11 · Cara A (Game D3: The Desert Lexicon & BC Ashes)", render_game_d2, "page11_front", False, False),
         ("Hoja 11 · Cara B (Map: Grand Desert Map - SW Bottom-Left / Spread 2)", render_face_7b, "page11_back", True, True)),

        # Sheet 12: Grand Map Q4 (Map SE) & Game D4 (Oasis Clepsydra - Mirage)
        (12,
         ("Hoja 12 · Cara A (Map: Grand Desert Map - SE Bottom-Right / Spread 2)", render_face_8a, "page12_front", False, True),
         ("Hoja 12 · Cara B (Game D4: The Oasis Clepsydra - Feverish Mirage)", render_game_d3, "page12_back", True, False)),

        # Sheet 13: Sanctuary Servant Lore & Game D5 (Sun Monolith - Cairn II)
        (13,
         ("Hoja 13 · Cara A (Lore: At the Gates of Tower II & Servant's Demand)", render_lore_13a_sanctuary_servant, "page13_front", False, False),
         ("Hoja 13 · Cara B (Game D5: The Sun Monolith & Cairn II)", render_game_d5_sun_monolith, "page13_back", True, False)),

        # Sheet 14: The 5 Cairns Survey Lore & Game D6 (Sandstone Labyrinth - Cairn III)
        (14,
         ("Hoja 14 · Cara A (Lore: The Five Geodetic Cairns Survey)", render_lore_14a_cairns_survey, "page14_front", False, False),
         ("Hoja 14 · Cara B (Game D6: The Sandstone Labyrinth & Cairn III)", render_game_d6_sandstone_labyrinth, "page14_back", True, False)),

        # Sheet 15: Game D7 (Cairn IV Sentry) & Zoom Bridge Left (Spread 3 Left)
        (15,
         ("Hoja 15 · Cara A (Game D7: Cairn IV Sentry of the Canyon)", render_game_d7_cairn_iv_sentry, "page15_front", False, False),
         ("Hoja 15 · Cara B (Map Zoom: Natural Bridge & Sentinel Mesa - Left Panel)", render_zoom_bridge_left, "page15_back", True, True)),

        # Sheet 16: Zoom Bridge Right (Spread 3 Right) & Game D8 (Solstice Arch / Altar - Cairn V)
        (16,
         ("Hoja 16 · Cara A (Map Zoom: Natural Bridge & Lower Wash - Right Panel)", render_zoom_bridge_right, "page16_front", False, True),
         ("Hoja 16 · Cara B (Game D8: Arch of the Solstice & Cairn V Altar)", render_game_d8_arch_solstice_altar, "page16_back", True, False)),

        # Sheet 17: Game D9 (Polybius Stele - Servant's Trial) & Audience with Oracle
        (17,
         ("Hoja 17 · Cara A (Game D9: The Polybius Stele - Servant's Trial)", render_game_d4, "page17_front", False, False),
         ("Hoja 17 · Cara B (Lore: Audience with The Desert Oracle)", render_colophon, "page17_back", True, False)),

        # Sheet 18: Game D10 (Oracle Climax) & Transition Art to Stage Path
        (18,
         ("Hoja 18 · Cara A (Game D10: The Oracle's Horizon & Triple Triangulation)", render_game_d10_oracle_horizon, "page18_front", False, True),
         ("Hoja 18 · Cara B (Art: Transition to the Stage Path)", render_art_18b_stage_path_transition, "page18_back", True, True)),
    ]

    all_canvases = {}

    for sheet_num, face_a, face_b in sheets:
        p_name = f"page{sheet_num:02d}"
        p_dir = os.path.join(JOURNAL_DIR, p_name)
        pdf_dir = os.path.join(p_dir, "pdf")
        mockups_dir = os.path.join(p_dir, "mockups")

        os.makedirs(pdf_dir, exist_ok=True)
        os.makedirs(mockups_dir, exist_ok=True)

        for label, renderer, stem, is_back, is_fullbleed in [face_a, face_b]:
            print(f"\nRendering {label}...")
            canvas = renderer(gc=GRAPHITE_COLOR) if renderer not in (render_sheet01_front, render_sheet01_back) else renderer()
            all_canvases[stem] = canvas

            # Verify and enforce hole clearance on non-fullbleed pages
            if not is_fullbleed:
                if is_back:
                    right_zone = canvas[:, 1583:, 3]
                    violation = np.count_nonzero(right_zone)
                    if violation > 0:
                        print(f"  [ERROR] {violation} pixels found in RIGHT hole zone (X > 1583)! Clamping.")
                        canvas[:, 1583:, 3] = 0
                    else:
                        print(f"  [OK] Right hole punch zone (X > 1583): 0 pixels.")
                else:
                    left_zone = canvas[:, :165, 3]
                    violation = np.count_nonzero(left_zone)
                    if violation > 0:
                        print(f"  [ERROR] {violation} pixels found in LEFT hole zone (X < 165)! Clamping.")
                        canvas[:, :165, 3] = 0
                    else:
                        print(f"  [OK] Left hole punch zone (X < 165): 0 pixels.")

            # 1. Print-Ready Vector PDF (300 DPI, exact A5 MediaBox)
            pdf_path = os.path.join(pdf_dir, f"{stem}_A5.pdf")
            PDFBuilder.save_a5_pdf_from_rgba(canvas, pdf_path, dpi=300)
            print(f"  -> Vector PDF: {pdf_path}")

            # 2. Photorealistic Mockup over Real Paper
            if bg_raw is not None:
                bg_for_face = cv2.flip(bg_raw, 1) if is_back else bg_raw.copy()
                fg_rgb = canvas[:, :, :3].astype(np.float32)
                alpha = (canvas[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]
                blended = (fg_rgb * alpha + bg_for_face.astype(np.float32) * (1.0 - alpha)).astype(np.uint8)
                mockup_path = os.path.join(mockups_dir, f"{stem}_real_paper_mockup.jpg")
                cv2.imwrite(mockup_path, blended, [cv2.IMWRITE_JPEG_QUALITY, 96])
                print(f"  -> Photorealistic Mockup: {mockup_path}")

    # ---------------------------------------------------------------------
    # ASSEMBLE CONTINUOUS DOUBLE-PAGE SPREADS FOR THE GRAND DESERT MAP
    # ---------------------------------------------------------------------
    # Spread 1: North Half (Page 08B + Page 09A)
    if bg_raw is not None and "page08_back" in all_canvases and "page09_front" in all_canvases:
        print("\n=== Generating Continuous Double-Page Spread 1 (North Half: Page 08B + Page 09A) ===")
        c8b = all_canvases["page08_back"]
        c9a = all_canvases["page09_front"]

        bg_b = cv2.flip(bg_raw, 1)
        bg_a = bg_raw

        fg_l = c8b[:, :, :3].astype(np.float32)
        al_l = (c8b[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]
        mockup_l = (fg_l * al_l + bg_b.astype(np.float32) * (1.0 - al_l)).astype(np.uint8)

        fg_r = c9a[:, :, :3].astype(np.float32)
        al_r = (c9a[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]
        mockup_r = (fg_r * al_r + bg_a.astype(np.float32) * (1.0 - al_r)).astype(np.uint8)

        spread1_mockup = np.hstack([mockup_l, mockup_r])
        sp1_p8 = os.path.join(JOURNAL_DIR, "page08", "mockups", "spread01_desert_map_continuous_mockup.jpg")
        sp1_p9 = os.path.join(JOURNAL_DIR, "page09", "mockups", "spread01_desert_map_continuous_mockup.jpg")
        cv2.imwrite(sp1_p8, spread1_mockup, [cv2.IMWRITE_JPEG_QUALITY, 95])
        cv2.imwrite(sp1_p9, spread1_mockup, [cv2.IMWRITE_JPEG_QUALITY, 95])
        print(f"  -> Saved Continuous Spread 1 Mockup: {sp1_p8}")

    # Spread 2: South Half (Page 11B + Page 12A)
    if bg_raw is not None and "page11_back" in all_canvases and "page12_front" in all_canvases:
        print("\n=== Generating Continuous Double-Page Spread 2 (South Half: Page 11B + Page 12A) ===")
        c11b = all_canvases["page11_back"]
        c12a = all_canvases["page12_front"]

        bg_b = cv2.flip(bg_raw, 1)
        bg_a = bg_raw

        fg_l = c11b[:, :, :3].astype(np.float32)
        al_l = (c11b[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]
        mockup_l = (fg_l * al_l + bg_b.astype(np.float32) * (1.0 - al_l)).astype(np.uint8)

        fg_r = c12a[:, :, :3].astype(np.float32)
        al_r = (c12a[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]
        mockup_r = (fg_r * al_r + bg_a.astype(np.float32) * (1.0 - al_r)).astype(np.uint8)

        spread2_mockup = np.hstack([mockup_l, mockup_r])
        sp2_p11 = os.path.join(JOURNAL_DIR, "page11", "mockups", "spread02_desert_map_continuous_mockup.jpg")
        sp2_p12 = os.path.join(JOURNAL_DIR, "page12", "mockups", "spread02_desert_map_continuous_mockup.jpg")
        cv2.imwrite(sp2_p11, spread2_mockup, [cv2.IMWRITE_JPEG_QUALITY, 95])
        cv2.imwrite(sp2_p12, spread2_mockup, [cv2.IMWRITE_JPEG_QUALITY, 95])
        print(f"  -> Saved Continuous Spread 2 Mockup: {sp2_p11}")

    # Spread 3: Zoom Topográfico al Puente Natural de la Mesa Centinela (Page 15B + Page 16A)
    if bg_raw is not None and "page15_back" in all_canvases and "page16_front" in all_canvases:
        print("\n=== Generating Continuous Spread 3: Zoom al Puente Natural (Page 15B + Page 16A) ===")
        c15b = all_canvases["page15_back"]
        c16a = all_canvases["page16_front"]

        bg_b = cv2.flip(bg_raw, 1)
        bg_a = bg_raw

        fg_l = c15b[:, :, :3].astype(np.float32)
        al_l = (c15b[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]
        mockup_l = (fg_l * al_l + bg_b.astype(np.float32) * (1.0 - al_l)).astype(np.uint8)

        fg_r = c16a[:, :, :3].astype(np.float32)
        al_r = (c16a[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]
        mockup_r = (fg_r * al_r + bg_a.astype(np.float32) * (1.0 - al_r)).astype(np.uint8)

        spread3_mockup = np.hstack([mockup_l, mockup_r])
        sp3_p15 = os.path.join(JOURNAL_DIR, "page15", "mockups", "spread03_bridge_zoom_continuous_mockup.jpg")
        sp3_p16 = os.path.join(JOURNAL_DIR, "page16", "mockups", "spread03_bridge_zoom_continuous_mockup.jpg")
        cv2.imwrite(sp3_p15, spread3_mockup, [cv2.IMWRITE_JPEG_QUALITY, 95])
        cv2.imwrite(sp3_p16, spread3_mockup, [cv2.IMWRITE_JPEG_QUALITY, 95])
        print(f"  -> Saved Continuous Spread 3 (Bridge Zoom) Mockup: {sp3_p15}")

    # Assemble complete 4-quadrant overview
    if bg_raw is not None and "page08_back" in all_canvases and "page09_front" in all_canvases and "page11_back" in all_canvases and "page12_front" in all_canvases:
        print("\n=== Generating 4-Quadrant Complete Desert Map Overview (2x2) ===")
        c8b = all_canvases["page08_back"]
        c9a = all_canvases["page09_front"]
        c11b = all_canvases["page11_back"]
        c12a = all_canvases["page12_front"]

        spread1_rgba = np.hstack([c8b, c9a])
        spread2_rgba = np.hstack([c11b, c12a])
        full_rgba = np.vstack([spread1_rgba, spread2_rgba])

        bg_spread_top = np.hstack([cv2.flip(bg_raw, 1), bg_raw])
        bg_spread_bot = cv2.flip(bg_spread_top, 0)
        bg_4quad = np.vstack([bg_spread_top, bg_spread_bot])

        fg = full_rgba[:, :, :3].astype(float)
        al = (full_rgba[:, :, 3].astype(float) / 255.0)[:, :, np.newaxis]
        panorama_4quad = (fg * al + bg_4quad.astype(float) * (1.0 - al)).astype(np.uint8)

        ov_p11 = os.path.join(JOURNAL_DIR, "page11", "mockups", "grand_desert_map_4quadrants_overview.jpg")
        ov_p12 = os.path.join(JOURNAL_DIR, "page12", "mockups", "grand_desert_map_4quadrants_overview.jpg")
        cv2.imwrite(ov_p11, panorama_4quad, [cv2.IMWRITE_JPEG_QUALITY, 94])
        cv2.imwrite(ov_p12, panorama_4quad, [cv2.IMWRITE_JPEG_QUALITY, 94])
        print(f"  -> Complete 4-Quadrant Desert Map: {ov_p11}")

        # Sync web assets
        web_maps_dir = os.path.join(PROJECT_ROOT, "web", "assets", "maps")
        if os.path.exists(web_maps_dir):
            web_ov = os.path.join(web_maps_dir, "grand_desert_map_overview.webp")
            cv2.imwrite(web_ov, cv2.resize(panorama_4quad, (1748, 2480), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_WEBP_QUALITY, 90])
            print(f"  -> Synced Web Desert Map Overview: {web_ov}")

            # Also sync the 4 quadrants to web
            web_q1 = os.path.join(web_maps_dir, "desert_quadrant_1_nw.webp")
            web_q2 = os.path.join(web_maps_dir, "desert_quadrant_2_ne.webp")
            web_q3 = os.path.join(web_maps_dir, "desert_quadrant_3_sw.webp")
            web_q4 = os.path.join(web_maps_dir, "desert_quadrant_4_se.webp")
            cv2.imwrite(web_q1, cv2.imread(os.path.join(JOURNAL_DIR, "page08", "mockups", "page08_back_real_paper_mockup.jpg")), [cv2.IMWRITE_WEBP_QUALITY, 90])
            cv2.imwrite(web_q2, cv2.imread(os.path.join(JOURNAL_DIR, "page09", "mockups", "page09_front_real_paper_mockup.jpg")), [cv2.IMWRITE_WEBP_QUALITY, 90])
            cv2.imwrite(web_q3, cv2.imread(os.path.join(JOURNAL_DIR, "page11", "mockups", "page11_back_real_paper_mockup.jpg")), [cv2.IMWRITE_WEBP_QUALITY, 90])
            cv2.imwrite(web_q4, cv2.imread(os.path.join(JOURNAL_DIR, "page12", "mockups", "page12_front_real_paper_mockup.jpg")), [cv2.IMWRITE_WEBP_QUALITY, 90])
            print(f"  -> Synced 4 Web Quadrants: Q1(08B), Q2(09A), Q3(11B), Q4(12A)")

    print("\n==========================================================================")
    print("=== SUCCESS: COMPLETE 18-SHEET JOURNAL (36 FACES) BUILT FLAWLESSLY! ===")
    print("==========================================================================")


if __name__ == "__main__":
    build_entire_journal()
