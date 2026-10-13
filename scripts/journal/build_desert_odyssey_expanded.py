#!/usr/bin/env python3
"""
Build Desert Odyssey Expanded Pages (Sheets 10, 13, 14, 15, 16, 18)
===================================================================
Master renderer for the expanded Desert Odyssey physical journal sheets:
- Sheet 10A: Game D2 — The Salt Playa (Dry Basin Navigation)
- Sheet 10B: Lore — Study on the Formation of the Dry Salt Playa (Da Vinci Crystallography)
- Sheet 13A: Lore — At the Gates of Tower II (The Sanctuary Servant & The 5 Cairns Demand)
- Sheet 13B: Game D5 — The Sun Monolith & Cairn II (Gnomonic Meridian Alignment)
- Sheet 14A: Lore — The Five Geodetic Cairns of the Order (Architectural Elevation Survey)
- Sheet 14B: Game D6 — The Sandstone Labyrinth & Cairn III (Wagon Tracks & Sighting Ray 348° NNW)
- Sheet 15A: Game D7 — Cairn IV: Sentry of the Canyon (Acoustic Echo Calibration)
- Sheet 15B: Continuous Spread 3 Left — Zoom Topográfico al Puente Natural de la Mesa Centinela
- Sheet 16A: Continuous Spread 3 Right — Zoom Topográfico al Puente Natural y Lower Wash
- Sheet 16B: Game D8 — Arch of the Solstice & The Solar Altar (Cairn V Zenith Ray)
- Sheet 18A: Game D10 — The Oracle's Horizon & Triple Tower Triangulation Climax
- Sheet 18B: Art — Transition Artwork to the Stage Path (Theatrical Drapes, Perspective Pillars & Harmonic Waves)

Strict Renaissance Da Vinci & Kepler draftsmanship standards:
- Graphite RGB(46, 42, 38)
- Zero text-drawing collisions
- Margin clearance:
    Cara A: X < 165 px strictly 0 pixels
    Cara B: X > 1583 px strictly 0 pixels (except continuous full-bleed spread 15B+16A)
"""

import os
import sys
import math
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from scripts.journal.geometry import CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX
from scripts.journal.build_desert_games import (
    render_pencil_text,
    blit_rgba,
    draw_sketchy_line,
    draw_sketchy_rect,
    GRAPHITE_COLOR,
    FONT_PATH,
)

# -------------------------------------------------------------------------
# GRAPHIC PRIMITIVES & HELPER FUNCTIONS
# -------------------------------------------------------------------------

def draw_sketchy_circle(
    canvas: np.ndarray,
    center: tuple[int, int],
    radius: int,
    gc: tuple = GRAPHITE_COLOR,
    alpha_base: int = 160,
    passes: int = 2,
    seed: int = 42,
    num_pts: int = 48,
):
    """Draws a hand-drawn circle with subtle graphite wobble."""
    rng = np.random.default_rng(seed)
    cx, cy = center
    for p in range(passes):
        pts = []
        for i in range(num_pts + 1):
            theta = 2.0 * math.pi * (i / float(num_pts))
            r = radius + rng.normal(0, 0.75 + p * 0.25)
            px = int(round(cx + r * math.cos(theta)))
            py = int(round(cy + r * math.sin(theta)))
            pts.append((px, py))
        pts = np.array(pts, dtype=np.int32)
        alpha = int(alpha_base * rng.uniform(0.75, 1.0))
        cv2.polylines(canvas, [pts], False, (*gc, alpha), 1, cv2.LINE_AA)


def draw_hatching(
    canvas: np.ndarray,
    rect: tuple[int, int, int, int],
    step: int = 12,
    angle_deg: float = 45.0,
    gc: tuple = GRAPHITE_COLOR,
    alpha: int = 90,
    seed: int = 42,
):
    """Fills a bounding box with parallel graphite hatch lines."""
    x1, y1, x2, y2 = rect
    rad = math.radians(angle_deg)
    cos_a, sin_a = math.cos(rad), math.sin(rad)
    w, h = x2 - x1, y2 - y1
    diag = int(math.hypot(w, h))

    rng = np.random.default_rng(seed)
    cx, cy = (x1 + x2) // 2, (y1 + y2) // 2

    for offset in range(-diag, diag, step):
        p1_x = cx + offset * -sin_a - diag * cos_a
        p1_y = cy + offset * cos_a - diag * sin_a
        p2_x = cx + offset * -sin_a + diag * cos_a
        p2_y = cy + offset * cos_a + diag * sin_a

        # Clip line to rect
        p1 = (int(np.clip(p1_x, x1, x2)), int(np.clip(p1_y, y1, y2)))
        p2 = (int(np.clip(p2_x, x1, x2)), int(np.clip(p2_y, y1, y2)))
        if p1 != p2:
            a = int(alpha * rng.uniform(0.7, 1.0))
            cv2.line(canvas, p1, p2, (*gc, a), 1, cv2.LINE_AA)


def render_multiline_text(
    canvas: np.ndarray,
    lines: list[str],
    x: int,
    y: int,
    font_size: int = 24,
    line_spacing: int = 34,
    gc: tuple = GRAPHITE_COLOR,
    seed_base: int = 100,
):
    """Renders a block of handwritten text line by line."""
    curr_y = y
    for idx, line in enumerate(lines):
        if line.strip():
            t_img, _ = render_pencil_text(line, FONT_PATH, font_size=font_size, gc=gc, seed=seed_base + idx * 7)
            blit_rgba(canvas, t_img, x, curr_y)
        curr_y += line_spacing
    return curr_y


# =========================================================================
# SHEET 10 · CARA A: JUEGO D2 — THE SALT PLAYA (DRY BASIN)
# =========================================================================

def render_game_d2_salt_playa(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 10 · Cara A (Front: X < 165 has 0 px).
    Game D2: The Salt Playa (Dry Basin).
    Traversing the brittle halite crust using crystalline facet balance (|Δ| = 1).
    Safe transit path spells 'CRYSTAL' from Row I to Row VII."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. Header (Cara A: X >= 200, stops at X <= 1600)
    t_title, _ = render_pencil_text("The Salt Playa (Dry Basin)", FONT_PATH, font_size=58, gc=gc, seed=1001)
    blit_rgba(canvas, t_title, 240, 80)

    # Clean divider line
    draw_sketchy_line(canvas, (240, 175), (1500, 175), gc=gc, alpha_base=180, passes=2, seed=1003)

    # 2. 100% Gameplay-Focused Instructions (Clear, Accessible, Zero Confusing Jargon)
    rule_lines = [
        "1. Start at Row I, Column D (marked with 3 and [C]).",
        "2. Advance one row per step, traveling from Row I down to Row VII.",
        "3. Move only to an adjacent cell in the row below (straight down or diagonal).",
        "4. Cells marked with [ X ] are impassable sinkholes. Never step on them.",
        "5. The number in each step must be exactly 1 higher or 1 lower (+1 or -1).",
        "6. The letters along your 7-step path reveal the passage keyword.",
    ]
    render_multiline_text(canvas, rule_lines, 240, 215, font_size=38, line_spacing=70, gc=gc, seed_base=1010)

    # 3. Enlarged Salt Polygon Fissure Grid (7 rows x 7 cols) - Expanded without moving other elements
    # Total grid size: 1050 x 1050 px (150 px per cell)
    cols, rows = 7, 7
    cw, ch = 150, 150
    gw, gh = cols * cw, rows * ch  # 1050, 1050
    gx0 = (CANVAS_WIDTH_PX - gw) // 2  # centered: 349
    gy0 = 700

    # Outer boundary with subtle sketchy border
    draw_sketchy_rect(canvas, (gx0 - 6, gy0 - 6, gx0 + gw + 6, gy0 + gh + 6), gc=gc, alpha_base=190, passes=2, seed=1020)

    # Grid Data: (facet_count, letter)
    # Target Path: (0,3):3[C] -> (1,4):4[R] -> (2,3):5[Y] -> (3,2):4[S] -> (4,2):3[T] -> (5,3):2[A] -> (6,3):1[L]
    # Mathematically unique crossing across all 49 cells!
    grid_cells = [
        [(1, 'M'), (5, 'X'), (6, 'B'), (3, 'C'), (1, 'Q'), (6, 'Z'), (2, 'V')],
        [(4, 'G'), (2, 'E'), ('X', 'X'), (6, 'K'), (4, 'R'), (1, 'J'), (5, 'U')],
        [(3, 'F'), ('X', 'X'), (2, 'I'), (5, 'Y'), ('X', 'X'), (2, 'P'), (6, 'D')],
        [(5, 'O'), (1, 'A'), (4, 'S'), (2, 'W'), ('X', 'X'), (5, 'B'), (3, 'T')],
        [(2, 'L'), ('X', 'X'), (3, 'T'), (6, 'H'), (1, 'N'), ('X', 'X'), (6, 'M')],
        [(6, 'K'), (5, 'N'), ('X', 'X'), (2, 'A'), (5, 'R'), (3, 'E'), (1, 'S')],
        [(3, 'P'), (1, 'Z'), (4, 'O'), (1, 'L'), ('X', 'X'), (6, 'C'), (2, 'Y')],
    ]

    col_names = ["COL A", "COL B", "COL C", "COL D", "COL E", "COL F", "COL G"]
    row_names = ["ROW I", "ROW II", "ROW III", "ROW IV", "ROW V", "ROW VI", "ROW VII"]

    # Draw Column Headers above grid (clean, isolated, no overlaps)
    for c in range(cols):
        cx = int(round(gx0 + c * cw + cw / 2))
        t_col, _ = render_pencil_text(col_names[c], FONT_PATH, font_size=22, gc=gc, seed=1025 + c * 3)
        blit_rgba(canvas, t_col, cx - t_col.shape[1] // 2, gy0 - 34)

    # Draw Row Headers and Grid Cells
    for r in range(rows):
        cy_mid = int(round(gy0 + r * ch + ch / 2))
        t_row, _ = render_pencil_text(row_names[r], FONT_PATH, font_size=22, gc=gc, seed=1030 + r * 5)
        blit_rgba(canvas, t_row, gx0 - t_row.shape[1] - 18, cy_mid - 11)

        for c in range(cols):
            cx = int(round(gx0 + c * cw))
            cy = int(round(gy0 + r * ch))
            cx2 = int(round(gx0 + (c + 1) * cw))
            cy2 = int(round(gy0 + (r + 1) * ch))

            # Chamfered crystal slab rectangle
            draw_sketchy_rect(canvas, (cx + 4, cy + 4, cx2 - 4, cy2 - 4), gc=gc, alpha_base=140, passes=1, seed=1040 + r * 10 + c)

            # Crack fissures extending from corners
            draw_sketchy_line(canvas, (cx + 4, cy + 4), (cx + 20, cy + 20), gc=gc, alpha_base=100, seed=1060 + r * 7 + c)
            draw_sketchy_line(canvas, (cx2 - 4, cy2 - 4), (cx2 - 20, cy2 - 20), gc=gc, alpha_base=100, seed=1070 + r * 7 + c)
            draw_sketchy_line(canvas, (cx + 4, cy2 - 4), (cx + 20, cy2 - 20), gc=gc, alpha_base=100, seed=1080 + r * 7 + c)
            draw_sketchy_line(canvas, (cx2 - 4, cy + 4), (cx2 - 20, cy + 20), gc=gc, alpha_base=100, seed=1090 + r * 7 + c)

            val, letter = grid_cells[r][c]
            mid_x = (cx + cx2) // 2
            mid_y = (cy + cy2) // 2

            if val == 'X':
                # Treacherous brine sinkhole: dark dense cross-hatching and bold 'X'
                draw_hatching(canvas, (cx + 12, cy + 12, cx2 - 12, cy2 - 12), step=7, angle_deg=35, gc=gc, alpha=160, seed=1100 + r * 9 + c)
                draw_hatching(canvas, (cx + 12, cy + 12, cx2 - 12, cy2 - 12), step=7, angle_deg=-55, gc=gc, alpha=120, seed=1110 + r * 9 + c)
                t_danger, _ = render_pencil_text("X", FONT_PATH, font_size=42, gc=gc, seed=1120 + r * 5 + c)
                blit_rgba(canvas, t_danger, mid_x - t_danger.shape[1] // 2, mid_y - t_danger.shape[0] // 2)
            else:
                # Safe crystalline slab
                draw_sketchy_circle(canvas, (mid_x, mid_y - 16), radius=26, gc=gc, alpha_base=80, passes=1, seed=1130 + r * 11 + c)
                t_val, _ = render_pencil_text(str(val), FONT_PATH, font_size=44, gc=gc, seed=1140 + r * 11 + c)
                blit_rgba(canvas, t_val, mid_x - t_val.shape[1] // 2, mid_y - 44)
                t_let, _ = render_pencil_text(f"[{letter}]", FONT_PATH, font_size=28, gc=gc, seed=1150 + r * 13 + c)
                blit_rgba(canvas, t_let, mid_x - t_let.shape[1] // 2, mid_y + 14)

    # 4. Waypoint Log & Recording Desk (Enlarged and Spacious)
    draw_sketchy_line(canvas, (240, 1810), (1540, 1810), gc=gc, alpha_base=160, passes=2, seed=1200)

    t_log_head, _ = render_pencil_text("The 7 Stepping Stones Waypoint Log (North to South Transit):", FONT_PATH, font_size=34, gc=gc, seed=1202)
    blit_rgba(canvas, t_log_head, 240, 1840)

    # 7 large recording boxes across width X in [240, 1516]
    box_w = 160
    box_h = 95
    gap = 26

    for i in range(7):
        bx = 240 + i * (box_w + gap)
        by = 1895
        draw_sketchy_rect(canvas, (bx, by, bx + box_w, by + box_h), gc=gc, alpha_base=170, passes=2, seed=1210 + i * 5)
        t_box_lbl, _ = render_pencil_text(row_names[i], FONT_PATH, font_size=23, gc=gc, seed=1220 + i * 7)
        blit_rgba(canvas, t_box_lbl, bx + (box_w - t_box_lbl.shape[1]) // 2, by + 14)
        t_box_slot, _ = render_pencil_text("[ ___ ]", FONT_PATH, font_size=32, gc=gc, seed=1230 + i * 9)
        blit_rgba(canvas, t_box_slot, bx + (box_w - t_box_slot.shape[1]) // 2, by + 48)

    t_kw_prompt, _ = render_pencil_text("Passage Keyword:  [ ___ ]  [ ___ ]  [ ___ ]  [ ___ ]  [ ___ ]  [ ___ ]  [ ___ ]", FONT_PATH, font_size=36, gc=gc, seed=1240)
    blit_rgba(canvas, t_kw_prompt, 260, 2035)

    t_kw_sub, _ = render_pencil_text("Transmit the 7-letter keyword to the Web Navigator Console to unlock the South Shore.", FONT_PATH, font_size=26, gc=gc, seed=1245)
    blit_rgba(canvas, t_kw_sub, 260, 2105)

    # 5. Masterwork Renaissance Landscape Vignette: The Salt Playa Basin
    t_pcap, _ = render_pencil_text("Southern Prospect: The Salt Playa Basin & The Sentinel Mesa (Elev. 980 paces)", FONT_PATH, font_size=20, gc=gc, seed=1330)
    blit_rgba(canvas, t_pcap, 240, 2148)

    pano_path = os.path.join(PROJECT_ROOT, "journal", "page10", "assets", "salt_playa_landscape_vignette_alpha.png")
    if os.path.exists(pano_path):
        pano = cv2.imread(pano_path, cv2.IMREAD_UNCHANGED)
        if pano is not None:
            pano_resized = cv2.resize(pano, (1320, 275), interpolation=cv2.INTER_LANCZOS4)
            blit_rgba(canvas, pano_resized, 214, 2174)

    # 6. Left punch-hole enforcement (Cara A: X < 165 has strictly 0 px)
    canvas[:, :165, 3] = 0
    return canvas


# =========================================================================
# SHEET 10 · CARA B: LORE — STUDY ON THE FORMATION OF DRY SALT PLAYA
# =========================================================================

def render_lore_10b_salt_playa_study(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 10 · Cara B (Back: X > 1583 has strictly 0 px).
    Master Renaissance Da Vinci study on halite crystallization, basin stratigraphy,
    desiccation polygon mechanics, and geodetic topographic survey profile."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. Header (Cara B: X in [180, 1540])
    t_title, _ = render_pencil_text("Study on the Dry Salt Playa", FONT_PATH, font_size=56, gc=gc, seed=2001)
    blit_rgba(canvas, t_title, 180, 70)

    draw_sketchy_line(canvas, (180, 145), (1540, 145), gc=gc, alpha_base=180, passes=2, seed=2003)

    # 2. Section I: Mechanical Principles of Crust Buckling & Desiccation (above Figure 1)
    t_sec1, _ = render_pencil_text("I. Mechanical Principles of Crust Buckling & Desiccation", FONT_PATH, font_size=32, gc=gc, seed=2005)
    blit_rgba(canvas, t_sec1, 180, 190)

    notes_1 = [
        "As solar heat bakes the playa, capillary suction pulls saturated brine up through fissures.",
        "Crystallizing salt expands by volume, forcing polygon plate edges to buckle into sharp ridges.",
        "Where subterranean waters dissolve the silt from beneath, treacherous sinkholes form unseen.",
        "The traveler must test every slab before bearing full weight, as dry crusts conceal deep brine.",
    ]
    render_multiline_text(canvas, notes_1, 180, 255, font_size=31, line_spacing=54, gc=gc, seed_base=2010)

    draw_sketchy_line(canvas, (180, 495), (1540, 495), gc=gc, alpha_base=140, passes=1, seed=2018)

    # 3. Figure 1: Masterwork Leonardo da Vinci Explanatory Plan
    # -------------------------------------------------------------------------
    # Unified 3D Isometric Cutaway Block Plan of the Salt Playa & Halite Crystallography
    t_diag1, _ = render_pencil_text("Fig. I — Morphological Cutaway of the Salt Playa & Halite Crystallography", FONT_PATH, font_size=24, gc=gc, seed=2020)
    blit_rgba(canvas, t_diag1, 184, 535)

    plan_path = os.path.join(PROJECT_ROOT, "journal", "page10", "assets", "davinci_salt_playa_plan_alpha.png")
    if os.path.exists(plan_path):
        plan_alpha = cv2.imread(plan_path, cv2.IMREAD_UNCHANGED)
        if plan_alpha is not None:
            plan_w = 1220
            plan_h = int(plan_alpha.shape[0] * (plan_w / plan_alpha.shape[1]))
            plan_resized = cv2.resize(plan_alpha, (plan_w, plan_h), interpolation=cv2.INTER_LANCZOS4)
            px0 = 210
            py0 = 575
            blit_rgba(canvas, plan_resized, px0, py0)

            scale = plan_w / 1376.0

            # Strata leader lines and concise English labels (right side)
            strata_callouts = [
                (py0 + int(330 * scale), "A. Brittle Halite Crust (0-2 ft)"),
                (py0 + int(420 * scale), "B. Saturated Brine Silt (2-4 ft)"),
                (py0 + int(510 * scale), "C. Gypsum Laminae (4-7 ft)"),
                (py0 + int(615 * scale), "D. Sandstone Bedrock (7-10+ ft)")
            ]
            for sy_pos, slbl in strata_callouts:
                lx_start = px0 + int(1030 * scale)
                lx_end = px0 + int(1070 * scale)
                cv2.line(canvas, (lx_start, sy_pos), (lx_end, sy_pos), (*gc, 160), 1, cv2.LINE_AA)
                t_slbl, _ = render_pencil_text(slbl, FONT_PATH, font_size=18, gc=gc, seed=int(sy_pos))
                blit_rgba(canvas, t_slbl, lx_end + 8, sy_pos - 10)

            # Minimal scientific annotations
            t_c2, _ = render_pencil_text("120° Triple Junction Mechanics", FONT_PATH, font_size=16, gc=gc, seed=2032)
            blit_rgba(canvas, t_c2, px0 + 25, py0 + int(395 * scale))

    # Divider line between Figure 1 and Section II
    draw_sketchy_line(canvas, (180, 1295), (1540, 1295), gc=gc, alpha_base=140, passes=1, seed=2090)

    # 4. Section II: The Architect's Note (Field Codex Entry) - above Figure 2
    t_sec2, _ = render_pencil_text("II. The Architect's Note (Field Codex Entry):", FONT_PATH, font_size=32, gc=gc, seed=2092)
    blit_rgba(canvas, t_sec2, 180, 1340)

    notes_2 = [
        "«The water that flows carries the memory of the heights; but the salt that remains",
        "is the crystal skeleton of the earth, holding the light long after the storm has turned to dust.",
        "Let the seeker who traverses the playa walk with measured footsteps,",
        "for weight without balance yields perpetually to the deep beneath.»",
    ]
    render_multiline_text(canvas, notes_2, 180, 1405, font_size=31, line_spacing=54, gc=gc, seed_base=2100)

    # Divider line between Section II and Figure 2
    draw_sketchy_line(canvas, (180, 1645), (1540, 1645), gc=gc, alpha_base=140, passes=1, seed=2105)

    # 5. Figure 2: Masterwork Renaissance Geodetic Transect
    transect_path = os.path.join(PROJECT_ROOT, "journal", "page10", "assets", "davinci_transect_clean_alpha.png")
    if os.path.exists(transect_path):
        transect_alpha = cv2.imread(transect_path, cv2.IMREAD_UNCHANGED)
        if transect_alpha is not None:
            trans_w = 1140
            trans_h = int(transect_alpha.shape[0] * (trans_w / transect_alpha.shape[1]))
            trans_resized = cv2.resize(transect_alpha, (trans_w, trans_h), interpolation=cv2.INTER_LANCZOS4)
            tx0 = 240
            ty0 = 1690
            blit_rgba(canvas, trans_resized, tx0, ty0)

            # Elegant Renaissance framing border
            draw_sketchy_rect(canvas, (tx0 - 15, ty0 - 10, tx0 + trans_w + 15, ty0 + trans_h + 8), gc=gc, alpha_base=95, passes=1, seed=2116)

            # Minimal, evocative geographic & elevation annotations (Da Vinci codex style)
            t_stn, _ = render_pencil_text("Survey Station Alpha", FONT_PATH, font_size=15, gc=gc, seed=2120)
            blit_rgba(canvas, t_stn, tx0 + 185, ty0 + 10)

            t_mesa, _ = render_pencil_text("The Sentinel Mesa (Elev. 980 paces)", FONT_PATH, font_size=18, gc=gc, seed=2121)
            blit_rgba(canvas, t_mesa, tx0 + 245, ty0 + 55)

            t_sump, _ = render_pencil_text("Great Salt Sump · Basin Depression (Elev. 420 paces)", FONT_PATH, font_size=17, gc=gc, seed=2122)
            blit_rgba(canvas, t_sump, tx0 + (trans_w - t_sump.shape[1]) // 2, ty0 + trans_h - 26)

            t_sanct, _ = render_pencil_text("Sanctuary Approach (Elev. 680 paces)", FONT_PATH, font_size=18, gc=gc, seed=2123)
            blit_rgba(canvas, t_sanct, tx0 + 820, ty0 + 65)

    # Compact Renaissance Stadia Scale Bar at bottom of Figure 2
    scale_y = 2145
    scale_x0 = 240 + 260
    scale_w = 620
    draw_sketchy_line(canvas, (scale_x0, scale_y), (scale_x0 + scale_w, scale_y), gc=gc, alpha_base=160, seed=2180)
    scale_ticks = [
        (scale_x0, "0"),
        (scale_x0 + int(scale_w * 0.33), "1000"),
        (scale_x0 + int(scale_w * 0.67), "2000"),
        (scale_x0 + scale_w, "3000 paces")
    ]
    for idx_dt, (dtx, dlbl) in enumerate(scale_ticks):
        draw_sketchy_line(canvas, (dtx, scale_y - 6), (dtx, scale_y + 6), gc=gc, alpha_base=170, seed=2182 + idx_dt)
        t_dtick, _ = render_pencil_text(dlbl, FONT_PATH, font_size=15, gc=gc, seed=2185 + idx_dt)
        blit_rgba(canvas, t_dtick, dtx - t_dtick.shape[1] // 2, scale_y + 10)

    t_scale_title, _ = render_pencil_text("Geodetic Transect Distance (Paces)", FONT_PATH, font_size=15, gc=gc, seed=2195)
    blit_rgba(canvas, t_scale_title, scale_x0 + (scale_w - t_scale_title.shape[1]) // 2, scale_y - 42)

    # Below Figure 2 is left empty (clean parchment)

    # Strict Right Punch Hole Enforcement (Cara B: X > 1583 has strictly 0 px)
    canvas[:, 1583:, 3] = 0
    return canvas


# =========================================================================
# SHEET 13 · CARA A: LORE — AT THE GATES OF TOWER II & THE 5 CAIRNS DEMAND
# =========================================================================

def _hatch_polygon(canvas, pts, step=6, angle=60.0, gc=GRAPHITE_COLOR, alpha=70, seed=1):
    """Fills an arbitrary polygon with parallel graphite hatch lines (clipped by the polygon)."""
    pts = np.array(pts, dtype=np.int32)
    x1, y1 = pts.min(axis=0)
    x2, y2 = pts.max(axis=0)
    x1, y1 = max(0, int(x1)), max(0, int(y1))
    x2, y2 = min(canvas.shape[1], int(x2) + 1), min(canvas.shape[0], int(y2) + 1)
    if x2 <= x1 or y2 <= y1:
        return
    tmp = np.zeros((y2 - y1, x2 - x1, 4), dtype=np.uint8)
    draw_hatching(tmp, (0, 0, x2 - x1, y2 - y1), step=step, angle_deg=angle, gc=gc, alpha=alpha, seed=seed)
    mask = np.zeros((y2 - y1, x2 - x1), dtype=np.uint8)
    cv2.fillPoly(mask, [pts - np.array([x1, y1], dtype=np.int32)], 255)
    tmp[:, :, 3] = (tmp[:, :, 3].astype(np.float32) * (mask.astype(np.float32) / 255.0)).astype(np.uint8)
    blit_rgba(canvas, tmp, x1, y1)


def _draw_arc(canvas, center, radius, a0, a1, gc=GRAPHITE_COLOR, alpha=170, seed=1, passes=2):
    """Hand-drawn circular arc from angle a0 to a1 (degrees, 0 = right, 90 = down, counter-clockwise on screen = negative)."""
    rng = np.random.default_rng(seed)
    cx, cy = center
    n = max(8, int(abs(a1 - a0) / 4))
    for p in range(passes):
        pts = []
        for i in range(n + 1):
            th = math.radians(a0 + (a1 - a0) * i / n)
            r = radius + rng.normal(0, 0.6 + 0.2 * p)
            pts.append((int(round(cx + r * math.cos(th))), int(round(cy + r * math.sin(th)))))
        cv2.polylines(canvas, [np.array(pts, dtype=np.int32)], False, (*gc, int(alpha * rng.uniform(0.8, 1.0))), 1, cv2.LINE_AA)


def _draw_stone_courses(canvas, rect, course_h, gc, seed, alpha=60):
    """Horizontal courses of dressed stone with staggered joints inside rect."""
    x1, y1, x2, y2 = rect
    rng = np.random.default_rng(seed)
    row = 0
    y = y1
    while y + course_h <= y2:
        draw_sketchy_line(canvas, (x1, y), (x2, y), gc=gc, alpha_base=alpha, passes=1, seed=seed + row)
        offset = 0 if row % 2 == 0 else course_h
        x = x1 + offset + int(rng.integers(0, course_h // 2))
        while x < x2:
            cv2.line(canvas, (x, y), (x, min(y + course_h, y2)), (*gc, int(alpha * 0.9)), 1, cv2.LINE_AA)
            x += int(course_h * rng.uniform(1.7, 2.6))
        y += course_h
        row += 1


def _draw_fluted_column(canvas, cx, top, bottom, width, gc, seed):
    """Fluted column with base, capital volutes and shaded flank."""
    hw = width // 2
    _clear_polygon(canvas, [(cx - hw - 10, top - 2), (cx + hw + 10, top - 2), (cx + hw + 10, bottom + 1), (cx - hw - 10, bottom + 1)])
    shaft_top = top + 20
    shaft_bot = bottom - 18
    # shaft outline and flutes
    draw_sketchy_line(canvas, (cx - hw, shaft_top), (cx - hw, shaft_bot), gc=gc, alpha_base=190, passes=2, seed=seed)
    draw_sketchy_line(canvas, (cx + hw, shaft_top), (cx + hw, shaft_bot), gc=gc, alpha_base=190, passes=2, seed=seed + 1)
    for k in range(1, 6):
        fx = cx - hw + int(k * width / 6)
        draw_sketchy_line(canvas, (fx, shaft_top + 4), (fx, shaft_bot - 4), gc=gc, alpha_base=95, passes=1, seed=seed + 2 + k)
    _hatch_polygon(canvas, [(cx + hw // 3, shaft_top), (cx + hw, shaft_top), (cx + hw, shaft_bot), (cx + hw // 3, shaft_bot)], step=4, angle=90, gc=gc, alpha=75, seed=seed + 9)
    # capital: abacus, echinus and two volutes
    draw_sketchy_rect(canvas, (cx - hw - 8, top, cx + hw + 8, top + 8), gc=gc, alpha_base=190, passes=2, seed=seed + 20)
    draw_sketchy_rect(canvas, (cx - hw - 3, top + 8, cx + hw + 3, shaft_top), gc=gc, alpha_base=170, passes=1, seed=seed + 24)
    for side in (-1, 1):
        draw_sketchy_circle(canvas, (cx + side * (hw + 2), top + 15), 6, gc=gc, alpha_base=170, passes=1, seed=seed + 30 + side, num_pts=20)
        cv2.circle(canvas, (cx + side * (hw + 2), top + 15), 2, (*gc, 190), -1, cv2.LINE_AA)
    # base: torus and plinth
    draw_sketchy_rect(canvas, (cx - hw - 4, shaft_bot, cx + hw + 4, shaft_bot + 8), gc=gc, alpha_base=180, passes=1, seed=seed + 40)
    draw_sketchy_rect(canvas, (cx - hw - 9, shaft_bot + 8, cx + hw + 9, bottom), gc=gc, alpha_base=190, passes=2, seed=seed + 44)


def _clear_polygon(canvas, pts):
    """Erases the artwork under a polygon so figures and columns read as solid bodies in front of the background."""
    cv2.fillPoly(canvas, [np.array([(int(px), int(py)) for px, py in pts], dtype=np.int32)], (0, 0, 0, 0))


def _shade_ramp(canvas, rect, step, angle_deg, a_min, a_max, gc, seed):
    """Hatching whose strength grows smoothly from a_min (left) to a_max (right): a graphite gradient."""
    x1, y1, x2, y2 = rect
    if x2 <= x1 or y2 <= y1:
        return
    tmp = np.zeros((y2 - y1, x2 - x1, 4), dtype=np.uint8)
    draw_hatching(tmp, (0, 0, x2 - x1, y2 - y1), step=step, angle_deg=angle_deg, gc=gc, alpha=255, seed=seed)
    ramp = np.linspace(a_min / 255.0, a_max / 255.0, x2 - x1)[None, :]
    tmp[:, :, 3] = (tmp[:, :, 3].astype(np.float32) * ramp).astype(np.uint8)
    blit_rgba(canvas, tmp, x1, y1)


def _draw_robed_figure(canvas, cx, feet, height, gc, seed, staff_side=1, hooded=True, satchel=False, beard=False, goggles=False):
    """Standing robed figure: opaque silhouette, vertical drapery folds with graded shading, hood, face, sleeve and staff.
    Light comes from the left, so the right side carries the shadow."""
    s = height / 150.0
    head_r = int(round(11 * s))
    sh_y = feet - int(116 * s)
    sh_hw = int(round(25 * s))
    waist_hw = int(round(21 * s))
    hem_hw = int(round(50 * s))
    waist_y = sh_y + int(48 * s)
    lean = staff_side

    sil = [(cx - sh_hw, sh_y + 2), (cx - 9 * s, sh_y - 3), (cx + 9 * s, sh_y - 3), (cx + sh_hw, sh_y + 2), (cx + waist_hw, waist_y), (cx + hem_hw, feet), (cx - hem_hw, feet), (cx - waist_hw, waist_y)]
    head_c = (cx, sh_y - head_r - int(2 * s))
    hood = [(cx - sh_hw + 3, sh_y + 4), (cx - head_r - 7, head_c[1] + 4), (cx - head_r - 4, head_c[1] - head_r - 1), (cx, head_c[1] - head_r - int(11 * s)), (cx + head_r + 4, head_c[1] - head_r - 1), (cx + head_r + 7, head_c[1] + 4), (cx + sh_hw - 3, sh_y + 4)]
    sx = cx + lean * (hem_hw + int(14 * s))
    hand = (sx, feet - int(86 * s))
    arm_a = (cx + lean * (sh_hw - 2), sh_y + 8)
    sleeve = [arm_a, (arm_a[0] + lean * int(13 * s), arm_a[1] + int(18 * s)), (hand[0] - lean * 2, hand[1] - 7), (hand[0] - lean * 2, hand[1] + 13), (arm_a[0] - lean * int(8 * s), arm_a[1] + int(40 * s))]

    # opaque body: erase whatever was drawn behind it
    _clear_polygon(canvas, sil)
    _clear_polygon(canvas, hood if hooded else [(head_c[0] - head_r, head_c[1] - head_r), (head_c[0] + head_r, head_c[1] - head_r), (head_c[0] + head_r, head_c[1] + head_r), (head_c[0] - head_r, head_c[1] + head_r)])
    _clear_polygon(canvas, sleeve)

    # drapery: seven vertical folds from the waist to a flared hem
    N = 7
    tops = [(cx + (i - N / 2) * (2 * waist_hw) / N, waist_y) for i in range(N + 1)]
    bots = [(cx + (i - N / 2) * (2 * hem_hw) / N, feet) for i in range(N + 1)]
    for i in range(N + 1):
        mid = ((tops[i][0] + bots[i][0]) / 2 + (3 if i % 2 else -3) * s, (waist_y + feet) / 2)
        pts = [(int(tops[i][0]), int(tops[i][1])), (int(mid[0]), int(mid[1])), (int(bots[i][0]), int(bots[i][1]))]
        cv2.polylines(canvas, [np.array(pts, dtype=np.int32)], False, (*gc, 150 if 0 < i < N else 210), 1, cv2.LINE_AA)
    for i in range(N):
        band = [tops[i], tops[i + 1], bots[i + 1], bots[i]]
        if i >= N // 2:
            _hatch_polygon(canvas, band, step=3, angle=84, gc=gc, alpha=70 + (i - N // 2) * 28, seed=seed + i)
        elif i == N // 2 - 1:
            _hatch_polygon(canvas, band, step=6, angle=84, gc=gc, alpha=38, seed=seed + i)
    # torso: lit on the left, light hatching on the shadow side
    _hatch_polygon(canvas, [(cx + int(2 * s), sh_y), (cx + sh_hw, sh_y + 2), (cx + waist_hw, waist_y), (cx + int(4 * s), waist_y)], step=3, angle=80, gc=gc, alpha=85, seed=seed + 20)
    cv2.polylines(canvas, [np.array([(int(px), int(py)) for px, py in sil], dtype=np.int32)], True, (*gc, 215), 1, cv2.LINE_AA)
    # belt with a knot, hem arcs, sandals
    draw_sketchy_line(canvas, (cx - waist_hw, waist_y - int(5 * s)), (cx + waist_hw, waist_y - int(5 * s)), gc=gc, alpha_base=190, passes=2, seed=seed + 24)
    cv2.circle(canvas, (cx + int(4 * s), waist_y - int(5 * s)), max(2, int(3 * s)), (*gc, 200), 1, cv2.LINE_AA)
    for k in range(N):
        mx = int((bots[k][0] + bots[k + 1][0]) / 2)
        _draw_arc(canvas, (mx, feet), int(hem_hw / N), 0, 180, gc=gc, alpha=135, seed=seed + 30 + k, passes=1)
    for dx in (-15, 15):
        cv2.ellipse(canvas, (cx + int(dx * s), feet + 3), (int(10 * s), 3), 0, 0, 360, (*gc, 175), 1, cv2.LINE_AA)
    # mantle over the shoulders
    _draw_arc(canvas, (cx, sh_y + int(8 * s)), sh_hw, 190, 350, gc=gc, alpha=195, seed=seed + 40, passes=2)

    # hood and face
    if hooded:
        cv2.polylines(canvas, [np.array([(int(px), int(py)) for px, py in hood], dtype=np.int32)], False, (*gc, 205), 1, cv2.LINE_AA)
        _hatch_polygon(canvas, [(cx + 2, head_c[1] - head_r - int(11 * s)), (cx + head_r + 4, head_c[1] - head_r - 1), (cx + head_r + 7, head_c[1] + 4), (cx + sh_hw - 3, sh_y + 4), (cx + 4, sh_y + 4)], step=3, angle=78, gc=gc, alpha=105, seed=seed + 44)
    face = (head_c[0], head_c[1] + int(1 * s))
    cv2.ellipse(canvas, face, (head_r - 1, head_r + 1), 0, 0, 360, (*gc, 190), 1, cv2.LINE_AA)
    _hatch_polygon(canvas, [(face[0] + head_r // 3, face[1] - head_r), (face[0] + head_r - 1, face[1]), (face[0] + head_r // 2, face[1] + head_r)], step=3, angle=70, gc=gc, alpha=70, seed=seed + 46)
    if goggles:
        for dx in (-4, 4):
            draw_sketchy_circle(canvas, (face[0] + int(dx * s), face[1] - 1), max(2, int(3.2 * s)), gc=gc, alpha_base=200, passes=1, seed=seed + 47 + dx, num_pts=12)
        draw_sketchy_line(canvas, (face[0] - head_r, face[1] - 1), (face[0] + head_r, face[1] - 1), gc=gc, alpha_base=160, passes=1, seed=seed + 49)
    else:
        for dx in (-3, 3):
            cv2.circle(canvas, (face[0] + int(dx * s), face[1] - int(1 * s)), 1, (*gc, 220), -1, cv2.LINE_AA)
        cv2.line(canvas, (face[0], face[1]), (face[0] + 1, face[1] + int(3 * s)), (*gc, 150), 1, cv2.LINE_AA)
    if beard:
        for k, dx in enumerate((-5, -2, 1, 4)):
            draw_sketchy_line(canvas, (face[0] + int(dx * s), face[1] + int(5 * s)), (face[0] + int(dx * s * 0.7), face[1] + int(19 * s)), gc=gc, alpha_base=150, passes=1, seed=seed + 50 + k)

    # staff with bands, sleeve, hand
    staff_top = (sx, feet - int(190 * s))
    draw_sketchy_line(canvas, (sx, feet + 6), staff_top, gc=gc, alpha_base=210, passes=2, seed=seed + 60)
    draw_sketchy_line(canvas, (sx + 3, feet + 6), (sx + 3, staff_top[1] + 10), gc=gc, alpha_base=90, passes=1, seed=seed + 61)
    for k in range(3):
        by = feet - int((60 + k * 40) * s)
        draw_sketchy_line(canvas, (sx - 3, by), (sx + 5, by), gc=gc, alpha_base=170, passes=1, seed=seed + 62 + k)
    cv2.polylines(canvas, [np.array([(int(px), int(py)) for px, py in sleeve], dtype=np.int32)], False, (*gc, 195), 1, cv2.LINE_AA)
    _hatch_polygon(canvas, [(int(arm_a[0] + lean * 6 * s), int(arm_a[1] + 10 * s)), (int(hand[0] - lean * 2), int(hand[1] - 7)), (int(hand[0] - lean * 2), int(hand[1] + 13)), (int(arm_a[0] - lean * 2 * s), int(arm_a[1] + 40 * s))], step=3, angle=70, gc=gc, alpha=60, seed=seed + 66)
    cv2.circle(canvas, hand, max(2, int(3 * s)), (*gc, 205), -1, cv2.LINE_AA)
    # resting arm
    draw_sketchy_line(canvas, (cx - lean * sh_hw, sh_y + 8), (cx - lean * (sh_hw + int(5 * s)), sh_y + int(54 * s)), gc=gc, alpha_base=175, passes=2, seed=seed + 70)
    draw_sketchy_line(canvas, (cx - lean * (sh_hw - 8), sh_y + 16), (cx - lean * (sh_hw - 2), sh_y + int(58 * s)), gc=gc, alpha_base=120, passes=1, seed=seed + 71)
    if satchel:
        draw_sketchy_line(canvas, (cx - lean * sh_hw + lean * 2, sh_y + 3), (cx + lean * (sh_hw - 4), sh_y + int(58 * s)), gc=gc, alpha_base=185, passes=1, seed=seed + 72)
        bag = [(cx + lean * (sh_hw - 16), sh_y + int(52 * s)), (cx + lean * (sh_hw + 9), sh_y + int(50 * s)), (cx + lean * (sh_hw + 9), sh_y + int(80 * s)), (cx + lean * (sh_hw - 16), sh_y + int(82 * s))]
        _clear_polygon(canvas, bag)
        cv2.polylines(canvas, [np.array(bag, dtype=np.int32)], True, (*gc, 205), 1, cv2.LINE_AA)
        _hatch_polygon(canvas, bag, step=3, angle=45, gc=gc, alpha=110, seed=seed + 74)
        cv2.circle(canvas, (cx + lean * (sh_hw - 3), sh_y + int(58 * s)), 2, (*gc, 215), -1, cv2.LINE_AA)
    return staff_top, sx


def _draw_star_sight(canvas, center, r, gc, seed):
    """Astronomical reticle: ring, cross-hairs and four star points (head of the Servant's staff)."""
    cx, cy = center
    draw_sketchy_circle(canvas, (cx, cy), r, gc=gc, alpha_base=200, passes=2, seed=seed, num_pts=28)
    draw_sketchy_circle(canvas, (cx, cy), r - 5, gc=gc, alpha_base=120, passes=1, seed=seed + 1, num_pts=24)
    draw_sketchy_line(canvas, (cx - r - 7, cy), (cx + r + 7, cy), gc=gc, alpha_base=170, passes=1, seed=seed + 2)
    draw_sketchy_line(canvas, (cx, cy - r - 7), (cx, cy + r + 7), gc=gc, alpha_base=170, passes=1, seed=seed + 3)
    cv2.circle(canvas, (cx, cy), 2, (*gc, 220), -1, cv2.LINE_AA)


def _draw_brazier(canvas, cx, base_y, gc, seed):
    """Bronze tripod brazier with a flame, set on the steps beside the gate."""
    draw_sketchy_line(canvas, (cx - 14, base_y), (cx - 5, base_y - 34), gc=gc, alpha_base=190, passes=1, seed=seed)
    draw_sketchy_line(canvas, (cx + 14, base_y), (cx + 5, base_y - 34), gc=gc, alpha_base=190, passes=1, seed=seed + 1)
    draw_sketchy_line(canvas, (cx, base_y + 2), (cx, base_y - 34), gc=gc, alpha_base=190, passes=1, seed=seed + 2)
    cup = [(cx - 15, base_y - 34), (cx + 15, base_y - 34), (cx + 10, base_y - 22), (cx - 10, base_y - 22)]
    cv2.polylines(canvas, [np.array(cup, dtype=np.int32)], True, (*gc, 200), 1, cv2.LINE_AA)
    _hatch_polygon(canvas, [(cx + 2, base_y - 34), (cx + 15, base_y - 34), (cx + 10, base_y - 22), (cx + 2, base_y - 22)], step=3, angle=70, gc=gc, alpha=110, seed=seed + 3)
    for k, (dx, hh) in enumerate(((-7, 16), (0, 26), (7, 14))):
        pts = [(cx + dx - 4, base_y - 34), (cx + dx - 2, base_y - 34 - hh // 2), (cx + dx, base_y - 34 - hh), (cx + dx + 2, base_y - 34 - hh // 2), (cx + dx + 4, base_y - 34)]
        cv2.polylines(canvas, [np.array(pts, dtype=np.int32)], False, (*gc, 170), 1, cv2.LINE_AA)


def _draw_brazier(canvas, cx, base_y, gc, seed):
    """Bronze tripod brazier with a flame, set on the steps beside the gate."""
    draw_sketchy_line(canvas, (cx - 14, base_y), (cx - 5, base_y - 34), gc=gc, alpha_base=190, passes=1, seed=seed)
    draw_sketchy_line(canvas, (cx + 14, base_y), (cx + 5, base_y - 34), gc=gc, alpha_base=190, passes=1, seed=seed + 1)
    draw_sketchy_line(canvas, (cx, base_y + 2), (cx, base_y - 34), gc=gc, alpha_base=190, passes=1, seed=seed + 2)
    cup = [(cx - 15, base_y - 34), (cx + 15, base_y - 34), (cx + 10, base_y - 22), (cx - 10, base_y - 22)]
    cv2.polylines(canvas, [np.array(cup, dtype=np.int32)], True, (*gc, 200), 1, cv2.LINE_AA)
    _hatch_polygon(canvas, [(cx + 2, base_y - 34), (cx + 15, base_y - 34), (cx + 10, base_y - 22), (cx + 2, base_y - 22)], step=3, angle=70, gc=gc, alpha=110, seed=seed + 3)
    for k, (dx, hh) in enumerate(((-7, 16), (0, 26), (7, 14))):
        pts = [(cx + dx - 4, base_y - 34), (cx + dx - 2, base_y - 34 - hh // 2), (cx + dx, base_y - 34 - hh), (cx + dx + 2, base_y - 34 - hh // 2), (cx + dx + 4, base_y - 34)]
        cv2.polylines(canvas, [np.array(pts, dtype=np.int32)], False, (*gc, 170), 1, cv2.LINE_AA)


def _draw_tower_gate_scene(canvas, x0, y0, w, h, gc=GRAPHITE_COLOR):
    """Engraved plate: the bronze gates of Tower II, five seal sockets in the archway, columns, braziers,
    the Sanctuary Servant at the threshold, and Hermes arriving in the foreground."""
    rng = np.random.default_rng(1301)
    draw_sketchy_rect(canvas, (x0, y0, x0 + w, y0 + h), gc=gc, alpha_base=200, passes=2, seed=1310)
    draw_sketchy_rect(canvas, (x0 + 8, y0 + 8, x0 + w - 8, y0 + h - 8), gc=gc, alpha_base=110, passes=1, seed=1314)

    cx = x0 + w // 2
    y_h = y0 + int(h * 0.76)            # horizon / ground line
    tower_top = y0 + 60
    y_s = y0 + int(h * 0.44)            # springing line of the arch

    # --- sky: low sun with rays, cloud strokes, two falcons
    sun_c = (x0 + 165, y0 + 112)
    draw_sketchy_circle(canvas, sun_c, 38, gc=gc, alpha_base=190, passes=2, seed=1320, num_pts=36)
    draw_sketchy_circle(canvas, sun_c, 28, gc=gc, alpha_base=110, passes=1, seed=1321, num_pts=30)
    for k in range(32):
        th = math.radians(k * 360 / 32)
        r1, r2 = 50, (84 if k % 2 == 0 else 66)
        cv2.line(canvas, (int(sun_c[0] + r1 * math.cos(th)), int(sun_c[1] + r1 * math.sin(th))), (int(sun_c[0] + r2 * math.cos(th)), int(sun_c[1] + r2 * math.sin(th))), (*gc, 110), 1, cv2.LINE_AA)
    for k in range(16):
        yy = y0 + 28 + k * 11
        xx = x0 + int(w * 0.66) + int(rng.integers(-60, 160))
        ln = int(rng.integers(60, 190))
        if xx + ln < x0 + w - 24 and yy < y0 + 190:
            draw_sketchy_line(canvas, (xx, yy), (xx + ln, yy), gc=gc, alpha_base=42, passes=1, seed=1330 + k)
    for fx, fy, fs in ((x0 + w - 250, y0 + 92, 1.0), (x0 + w - 185, y0 + 128, 0.7)):
        for side in (-1, 1):
            _draw_arc(canvas, (int(fx + side * 16 * fs), int(fy + 6 * fs)), int(18 * fs), 200 if side < 0 else 280, 250 if side < 0 else 330, gc=gc, alpha=190, seed=1340 + side, passes=1)
        cv2.circle(canvas, (int(fx), int(fy + 4 * fs)), 2, (*gc, 200), -1, cv2.LINE_AA)

    # --- distant dunes and a far mesa
    mesa = [(x0 + w - 330, y_h - 52), (x0 + w - 316, y_h - 92), (x0 + w - 236, y_h - 92), (x0 + w - 220, y_h - 52)]
    cv2.polylines(canvas, [np.array(mesa, dtype=np.int32)], False, (*gc, 110), 1, cv2.LINE_AA)
    _hatch_polygon(canvas, [(x0 + w - 280, y_h - 92), (x0 + w - 236, y_h - 92), (x0 + w - 220, y_h - 52), (x0 + w - 280, y_h - 52)], step=4, angle=75, gc=gc, alpha=45, seed=1344)
    for layer, (base, amp, a) in enumerate(((y_h - 50, 18, 70), (y_h - 26, 24, 100))):
        pts = []
        for xx in range(x0 + 10, x0 + w - 10, 8):
            pts.append((xx, int(base + amp * math.sin(xx / 170.0 + layer * 1.7) + 7 * math.sin(xx / 53.0))))
        for i in range(len(pts) - 1):
            cv2.line(canvas, pts[i], pts[i + 1], (*gc, a + 40), 1, cv2.LINE_AA)
        for i in range(0, len(pts) - 1, 3):
            cv2.line(canvas, (pts[i][0], pts[i][1] + 3), (pts[i][0] + 18, pts[i][1] + 10), (*gc, 55), 1, cv2.LINE_AA)

    # --- tower body, frieze, cornice, battlements, piers
    body = (cx - 390, tower_top + 28, cx + 390, y_h)
    draw_sketchy_rect(canvas, body, gc=gc, alpha_base=205, passes=2, seed=1360)
    _draw_stone_courses(canvas, (body[0] + 2, body[1] + 70, body[2] - 2, body[3] - 2), 30, gc, 1362, alpha=58)
    _shade_ramp(canvas, (cx + 100, body[1] + 70, cx + 390, y_h), 6, 62, 0, 100, gc, 1370)
    # frieze band with repeating sun-and-star glyphs
    fy1, fy2 = tower_top + 36, tower_top + 64
    draw_sketchy_line(canvas, (cx - 390, fy1), (cx + 390, fy1), gc=gc, alpha_base=190, passes=2, seed=1372)
    draw_sketchy_line(canvas, (cx - 390, fy2), (cx + 390, fy2), gc=gc, alpha_base=190, passes=2, seed=1373)
    for k in range(20):
        gx = cx - 380 + k * 40
        c0 = (gx + 10, (fy1 + fy2) // 2)
        if k % 2 == 0:
            cv2.circle(canvas, c0, 6, (*gc, 170), 1, cv2.LINE_AA)
            cv2.circle(canvas, c0, 1, (*gc, 200), -1, cv2.LINE_AA)
        else:
            for a in range(4):
                th = math.radians(a * 90 + 45)
                cv2.line(canvas, c0, (int(c0[0] + 8 * math.cos(th)), int(c0[1] + 8 * math.sin(th))), (*gc, 170), 1, cv2.LINE_AA)
    # cornice and battlements
    draw_sketchy_rect(canvas, (cx - 404, tower_top + 14, cx + 404, tower_top + 28), gc=gc, alpha_base=195, passes=2, seed=1376)
    draw_sketchy_line(canvas, (cx - 404, tower_top + 21), (cx + 404, tower_top + 21), gc=gc, alpha_base=90, passes=1, seed=1377)
    bx, k = cx - 390, 0
    while bx < cx + 382:
        draw_sketchy_rect(canvas, (bx, tower_top - 12, bx + 38, tower_top + 14), gc=gc, alpha_base=175, passes=1, seed=1380 + k)
        draw_sketchy_line(canvas, (bx + 6, tower_top + 4), (bx + 32, tower_top + 4), gc=gc, alpha_base=70, passes=1, seed=1400 + k)
        bx += 60
        k += 1
    # buttress piers with sloped caps
    for side in (-1, 1):
        px1, px2 = cx + side * 390, cx + side * 456
        left, right = min(px1, px2), max(px1, px2)
        pier_top = tower_top + 150
        draw_sketchy_rect(canvas, (left, pier_top, right, y_h), gc=gc, alpha_base=195, passes=2, seed=1410 + side)
        cap = [(left - 5, pier_top), (right + 5, pier_top), (right, pier_top - 16), (left, pier_top - 16)]
        cv2.polylines(canvas, [np.array(cap, dtype=np.int32)], True, (*gc, 190), 1, cv2.LINE_AA)
        _draw_stone_courses(canvas, (left + 2, pier_top + 2, right - 2, y_h - 2), 28, gc, 1416 + side, alpha=52)
        if side > 0:
            _hatch_polygon(canvas, [(left + 20, pier_top), (right, pier_top), (right, y_h), (left + 20, y_h)], step=5, angle=62, gc=gc, alpha=75, seed=1420)

    # --- relief sun medallions on the facade, either side of the arch
    for side in (-1, 1):
        mc = (cx + side * 250, fy2 + 62)
        draw_sketchy_circle(canvas, mc, 18, gc=gc, alpha_base=190, passes=2, seed=1430 + side, num_pts=28)
        draw_sketchy_circle(canvas, mc, 12, gc=gc, alpha_base=120, passes=1, seed=1432 + side, num_pts=22)
        cv2.circle(canvas, mc, 3, (*gc, 200), -1, cv2.LINE_AA)
        for k in range(12):
            th = math.radians(k * 30)
            cv2.line(canvas, (int(mc[0] + 22 * math.cos(th)), int(mc[1] + 22 * math.sin(th))), (int(mc[0] + 31 * math.cos(th)), int(mc[1] + 31 * math.sin(th))), (*gc, 150), 1, cv2.LINE_AA)
        if side > 0:
            _hatch_polygon(canvas, [(mc[0] + 2, mc[1] - 12), (mc[0] + 12, mc[1]), (mc[0] + 2, mc[1] + 12)], step=3, angle=60, gc=gc, alpha=90, seed=1436)

    # --- archway: door opening, three mouldings with voussoirs, keystone
    r_door = 104
    door_l, door_r = cx - r_door, cx + r_door
    door_bot = y_h - 40
    for ridx, rr in enumerate((r_door, r_door + 17, r_door + 34)):
        _draw_arc(canvas, (cx, y_s), rr, 180, 360, gc=gc, alpha=205 - 30 * ridx, seed=1440 + ridx, passes=2)
    for deg in range(180, 361, 9):
        th = math.radians(deg)
        cv2.line(canvas, (int(cx + (r_door + 17) * math.cos(th)), int(y_s + (r_door + 17) * math.sin(th))), (int(cx + (r_door + 34) * math.cos(th)), int(y_s + (r_door + 34) * math.sin(th))), (*gc, 120), 1, cv2.LINE_AA)
    for side in (-1, 1):
        for ridx in range(3):
            xx = cx + side * (r_door + 17 * ridx)
            draw_sketchy_line(canvas, (xx, y_s), (xx, door_bot), gc=gc, alpha_base=195 - 30 * ridx, passes=2, seed=1446 + ridx + (5 if side > 0 else 0))
    ks = [(cx - 15, y_s - r_door - 42), (cx + 15, y_s - r_door - 42), (cx + 12, y_s - r_door - 14), (cx - 12, y_s - r_door - 14)]
    cv2.polylines(canvas, [np.array(ks, dtype=np.int32)], True, (*gc, 210), 1, cv2.LINE_AA)
    kc = (cx, y_s - r_door - 28)
    cv2.circle(canvas, kc, 5, (*gc, 200), 1, cv2.LINE_AA)
    for k in range(8):
        th = math.radians(k * 45)
        cv2.line(canvas, (int(kc[0] + 7 * math.cos(th)), int(kc[1] + 7 * math.sin(th))), (int(kc[0] + 11 * math.cos(th)), int(kc[1] + 11 * math.sin(th))), (*gc, 190), 1, cv2.LINE_AA)

    # --- five seal sockets set into the archway (the first already holds its seal)
    sock_r = r_door + 58
    for idx, deg in enumerate((200, 235, 270, 305, 340)):
        th = math.radians(deg)
        sc = (int(cx + sock_r * math.cos(th)), int(y_s + sock_r * math.sin(th)))
        draw_sketchy_circle(canvas, sc, 15, gc=gc, alpha_base=205, passes=2, seed=1450 + idx, num_pts=24)
        draw_sketchy_circle(canvas, sc, 10, gc=gc, alpha_base=130, passes=1, seed=1460 + idx, num_pts=20)
        if idx == 0:
            _hatch_polygon(canvas, [(sc[0] - 9, sc[1] - 9), (sc[0] + 9, sc[1] - 9), (sc[0] + 9, sc[1] + 9), (sc[0] - 9, sc[1] + 9)], step=3, angle=45, gc=gc, alpha=175, seed=1470)
            draw_sketchy_circle(canvas, sc, 15, gc=gc, alpha_base=235, passes=2, seed=1471, num_pts=24)
        else:
            cv2.circle(canvas, sc, 2, (*gc, 150), -1, cv2.LINE_AA)

    # --- bronze gates: fan light, two leaves with planks, straps, studs and rings
    fan = [(cx + (r_door - 3) * math.cos(math.radians(a)), y_s + (r_door - 3) * math.sin(math.radians(a))) for a in range(180, 361, 6)]
    _hatch_polygon(canvas, [(int(px), int(py)) for px, py in fan] + [(door_r, y_s), (door_l, y_s)], step=7, angle=0, gc=gc, alpha=22, seed=1480)
    for leaf, (lx1, lx2) in enumerate(((door_l, cx - 3), (cx + 3, door_r))):
        draw_sketchy_rect(canvas, (lx1 + 3, y_s, lx2 - 3, door_bot), gc=gc, alpha_base=195, passes=2, seed=1490 + leaf)
        for k in range(1, 5):
            px = lx1 + 3 + int(k * (lx2 - lx1 - 6) / 5)
            draw_sketchy_line(canvas, (px, y_s + 3), (px, door_bot - 3), gc=gc, alpha_base=95, passes=1, seed=1500 + leaf * 10 + k)
        _hatch_polygon(canvas, [(lx1 + 4, y_s + 2), (lx2 - 4, y_s + 2), (lx2 - 4, door_bot - 2), (lx1 + 4, door_bot - 2)], step=6 if leaf == 0 else 3, angle=90, gc=gc, alpha=48 if leaf == 0 else 80, seed=1510 + leaf)
        for sy in (y_s + 36, (y_s + door_bot) // 2, door_bot - 34):
            draw_sketchy_line(canvas, (lx1 + 3, sy), (lx2 - 3, sy), gc=gc, alpha_base=200, passes=2, seed=1520 + leaf + sy % 7)
            draw_sketchy_line(canvas, (lx1 + 3, sy + 6), (lx2 - 3, sy + 6), gc=gc, alpha_base=120, passes=1, seed=1525 + leaf + sy % 5)
            for stx in range(lx1 + 12, lx2 - 8, 17):
                cv2.circle(canvas, (stx, sy + 3), 2, (*gc, 210), -1, cv2.LINE_AA)
        ring_x = (cx - 18) if leaf == 0 else (cx + 18)
        draw_sketchy_circle(canvas, (ring_x, (y_s + door_bot) // 2 + 10), 8, gc=gc, alpha_base=215, passes=2, seed=1530 + leaf, num_pts=20)
    draw_sketchy_line(canvas, (cx, y_s), (cx, door_bot), gc=gc, alpha_base=205, passes=2, seed=1540)

    # --- steps in front of the gate
    for st in range(4):
        sy = door_bot + st * 10
        xl, xr = cx - r_door - 22 - st * 16, cx + r_door + 22 + st * 16
        draw_sketchy_line(canvas, (xl, sy), (xr, sy), gc=gc, alpha_base=195, passes=2, seed=1550 + st)
        draw_sketchy_line(canvas, (xl, sy), (xl, sy + 10), gc=gc, alpha_base=150, passes=1, seed=1555 + st)
        draw_sketchy_line(canvas, (xr, sy), (xr, sy + 10), gc=gc, alpha_base=150, passes=1, seed=1560 + st)
        _hatch_polygon(canvas, [(xl, sy + 1), (xr, sy + 1), (xr, sy + 9), (xl, sy + 9)], step=4, angle=0, gc=gc, alpha=45, seed=1565 + st)

    # --- ground ripples, dune ridges, shadows and dry grass
    for k in range(230):
        gx = int(rng.integers(x0 + 20, x0 + w - 60))
        gy = int(rng.integers(y_h + 4, y0 + h - 14))
        if abs(gx - cx) < 190 and gy < door_bot + 46:
            continue
        ln = int(rng.integers(12, 46))
        cv2.line(canvas, (gx, gy), (gx + ln, gy + int(rng.integers(-1, 2))), (*gc, int(rng.integers(38, 90))), 1, cv2.LINE_AA)
    for ridge in range(3):
        pts = []
        for xx in range(x0 + 12, x0 + w - 12, 10):
            pts.append((xx, int(y_h + 26 + ridge * 32 + 9 * math.sin(xx / 120.0 + ridge * 2.0))))
        for i in range(len(pts) - 1):
            if abs(pts[i][0] - cx) < 230 and ridge == 0:
                continue
            cv2.line(canvas, pts[i], pts[i + 1], (*gc, 120), 1, cv2.LINE_AA)
    _hatch_polygon(canvas, [(cx + 456, y_h), (cx + 590, y_h), (cx + 630, y_h + 30), (cx + 500, y_h + 30)], step=4, angle=8, gc=gc, alpha=70, seed=1570)
    for gx, gy in ((x0 + 330, y0 + h - 34), (x0 + 470, y0 + h - 22), (x0 + w - 360, y0 + h - 30), (x0 + w - 520, y0 + h - 20)):
        for k in range(7):
            th = math.radians(-90 + (k - 3) * 17)
            cv2.line(canvas, (gx, gy), (int(gx + 20 * math.cos(th)), int(gy + 20 * math.sin(th))), (*gc, 150), 1, cv2.LINE_AA)

    # --- freestanding fluted columns and braziers
    for side in (-1, 1):
        for k, off in enumerate((178, 256)):
            _draw_fluted_column(canvas, cx + side * off, y_s - 4 + k * 6, y_h + 4, 30, gc, 1580 + side * 7 + k * 3)
        _draw_brazier(canvas, cx + side * 138, door_bot + 12, gc, 1600 + side)

    # --- the Sanctuary Servant on the top step, with the star-sight staff
    staff_top, staff_x = _draw_robed_figure(canvas, cx + 20, door_bot + 6, 178, gc, 1620, staff_side=1, hooded=True, beard=True)
    _draw_star_sight(canvas, (staff_x, staff_top[1] - 4), 13, gc, 1630)
    _hatch_polygon(canvas, [(cx + 30, door_bot + 8), (cx + 76, door_bot + 8), (cx + 190, door_bot + 34), (cx + 124, door_bot + 34)], step=4, angle=10, gc=gc, alpha=85, seed=1635)

    # --- Hermes arriving in the foreground (left), with brass goggles and his travel satchel; a small cairn on the right
    _draw_robed_figure(canvas, x0 + 190, y0 + h - 50, 128, gc, 1640, staff_side=-1, hooded=True, satchel=True, goggles=True)
    _hatch_polygon(canvas, [(x0 + 156, y0 + h - 48), (x0 + 204, y0 + h - 48), (x0 + 320, y0 + h - 28), (x0 + 262, y0 + h - 28)], step=4, angle=10, gc=gc, alpha=80, seed=1645)
    stones = [(x0 + w - 190, y0 + h - 40, 44, 15), (x0 + w - 188, y0 + h - 58, 34, 13), (x0 + w - 186, y0 + h - 73, 25, 11), (x0 + w - 184, y0 + h - 86, 16, 9)]
    for k, (sx_, sy_, rx, ry) in enumerate(stones):
        cv2.ellipse(canvas, (sx_, sy_), (rx, ry), 0, 0, 360, (*gc, 200), 1, cv2.LINE_AA)
        cv2.ellipse(canvas, (sx_, sy_), (rx - 2, ry - 2), 0, 20, 160, (*gc, 110), 1, cv2.LINE_AA)
        _hatch_polygon(canvas, [(sx_ + rx // 3, sy_ - ry + 2), (sx_ + rx, sy_ - 2), (sx_ + rx // 2, sy_ + ry)], step=3, angle=60, gc=gc, alpha=100, seed=1650 + k)


def _draw_cairn_emblem(canvas, c, idx, gc, seed, scale=1.0, alpha=200):
    """Small engraved emblem for each Cairn, centred on c. idx 0..4 = Cairn I..V."""
    cx, cy = c
    s = scale
    if idx == 0:   # cone of river boulders
        for k, (dy, rx, ry) in enumerate(((22, 30, 11), (6, 23, 10), (-8, 17, 9), (-20, 11, 7))):
            cv2.ellipse(canvas, (cx, int(cy + dy * s)), (int(rx * s), int(ry * s)), 0, 0, 360, (*gc, alpha), 1, cv2.LINE_AA)
            _hatch_polygon(canvas, [(cx + int(rx * s * 0.2), int(cy + (dy - ry) * s)), (cx + int(rx * s), int(cy + dy * s)), (cx + int(rx * s * 0.4), int(cy + (dy + ry) * s))], step=3, angle=60, gc=gc, alpha=int(alpha * 0.55), seed=seed + k)
    elif idx == 1:  # stepped pedestal with tablets
        for k, (hw, y1, y2) in enumerate(((32, 14, 28), (24, 0, 14), (16, -14, 0))):
            draw_sketchy_rect(canvas, (cx - int(hw * s), cy + int(y1 * s) - 4, cx + int(hw * s), cy + int(y2 * s) - 4), gc=gc, alpha_base=alpha, passes=1, seed=seed + k)
            _hatch_polygon(canvas, [(cx + int(hw * s * 0.45), cy + int(y1 * s) - 4), (cx + int(hw * s), cy + int(y1 * s) - 4), (cx + int(hw * s), cy + int(y2 * s) - 4), (cx + int(hw * s * 0.45), cy + int(y2 * s) - 4)], step=3, angle=90, gc=gc, alpha=int(alpha * 0.5), seed=seed + 5 + k)
        for dx in (-10, 2, 14):
            cv2.line(canvas, (cx + int((dx - 4) * s), cy - int(8 * s)), (cx + int((dx + 4) * s), cy - int(8 * s)), (*gc, int(alpha * 0.7)), 1, cv2.LINE_AA)
    elif idx == 2:  # pyramid with benchmark plate
        tri = [(cx, cy - int(34 * s)), (cx + int(34 * s), cy + int(26 * s)), (cx - int(34 * s), cy + int(26 * s))]
        cv2.polylines(canvas, [np.array(tri, dtype=np.int32)], True, (*gc, alpha), 1, cv2.LINE_AA)
        _hatch_polygon(canvas, [(cx, cy - int(34 * s)), (cx + int(34 * s), cy + int(26 * s)), (cx + 2, cy + int(26 * s))], step=3, angle=60, gc=gc, alpha=int(alpha * 0.6), seed=seed)
        draw_sketchy_rect(canvas, (cx - int(9 * s), cy + int(2 * s), cx + int(9 * s), cy + int(14 * s)), gc=gc, alpha_base=alpha, passes=1, seed=seed + 3)
        cv2.circle(canvas, (cx, cy + int(8 * s)), max(2, int(3 * s)), (*gc, alpha), -1, cv2.LINE_AA)
    elif idx == 3:  # twin pillars
        for k, dx in enumerate((-18, 18)):
            draw_sketchy_rect(canvas, (cx + int((dx - 8) * s), cy - int(28 * s), cx + int((dx + 8) * s), cy + int(28 * s)), gc=gc, alpha_base=alpha, passes=1, seed=seed + k)
            draw_sketchy_rect(canvas, (cx + int((dx - 11) * s), cy - int(34 * s), cx + int((dx + 11) * s), cy - int(28 * s)), gc=gc, alpha_base=alpha, passes=1, seed=seed + 4 + k)
            _hatch_polygon(canvas, [(cx + int(dx * s), cy - int(28 * s)), (cx + int((dx + 8) * s), cy - int(28 * s)), (cx + int((dx + 8) * s), cy + int(28 * s)), (cx + int(dx * s), cy + int(28 * s))], step=3, angle=90, gc=gc, alpha=int(alpha * 0.55), seed=seed + 8 + k)
    else:           # monolithic plinth with a sun ray
        draw_sketchy_rect(canvas, (cx - int(14 * s), cy - int(34 * s), cx + int(14 * s), cy + int(28 * s)), gc=gc, alpha_base=alpha, passes=2, seed=seed)
        _hatch_polygon(canvas, [(cx + int(3 * s), cy - int(34 * s)), (cx + int(14 * s), cy - int(34 * s)), (cx + int(14 * s), cy + int(28 * s)), (cx + int(3 * s), cy + int(28 * s))], step=3, angle=90, gc=gc, alpha=int(alpha * 0.55), seed=seed + 2)
        draw_sketchy_rect(canvas, (cx - int(22 * s), cy + int(28 * s), cx + int(22 * s), cy + int(36 * s)), gc=gc, alpha_base=alpha, passes=1, seed=seed + 4)
        for k in range(5):
            th = math.radians(-60 - k * 20)
            cv2.line(canvas, (cx + int(20 * s * math.cos(th)) + 14, cy - int(40 * s) + int(20 * s * math.sin(th)) + 14), (cx + int(40 * s * math.cos(th)) + 14, cy - int(40 * s) + int(40 * s * math.sin(th)) + 14), (*gc, int(alpha * 0.6)), 1, cv2.LINE_AA)


def _draw_seal_socket(canvas, c, idx, acquired, gc, seed):
    """Heraldic seal socket: notched double ring; acquired seals are engraved and filled, empty ones are dashed."""
    cx, cy = c
    R = 88
    draw_sketchy_circle(canvas, (cx, cy), R, gc=gc, alpha_base=210 if acquired else 150, passes=2, seed=seed, num_pts=60)
    draw_sketchy_circle(canvas, (cx, cy), R - 10, gc=gc, alpha_base=190 if acquired else 120, passes=1, seed=seed + 1, num_pts=56)
    for k in range(40):
        th = math.radians(k * 9)
        r1, r2 = R - 9, R - 1
        cv2.line(canvas, (int(cx + r1 * math.cos(th)), int(cy + r1 * math.sin(th))), (int(cx + r2 * math.cos(th)), int(cy + r2 * math.sin(th))), (*gc, 150 if acquired else 90), 1, cv2.LINE_AA)
    draw_sketchy_circle(canvas, (cx, cy), 62, gc=gc, alpha_base=170 if acquired else 100, passes=1, seed=seed + 2, num_pts=48)
    if acquired:
        # engraved band between the inner rings
        for k in range(0, 360, 6):
            th = math.radians(k)
            cv2.line(canvas, (int(cx + 64 * math.cos(th)), int(cy + 64 * math.sin(th))), (int(cx + 76 * math.cos(th + 0.5)), int(cy + 76 * math.sin(th + 0.5))), (*gc, 120), 1, cv2.LINE_AA)
        _draw_cairn_emblem(canvas, (cx, cy), idx, gc, seed + 10, scale=1.1, alpha=220)
    else:
        # empty socket: only a faint ghost of the emblem inside a hollow
        _draw_cairn_emblem(canvas, (cx, cy), idx, gc, seed + 10, scale=1.1, alpha=70)


def _render_13a_page(gc: tuple = GRAPHITE_COLOR, plate_override=None):
    """Sheet 13 · Cara A (Front: X < 165 has 0 px).
    At the gates of Tower II: the Sandstone Sanctuary and the demand of the five Cairns.
    Follows the authentic first-person codex narrative style of Pages 1-12."""
    from scripts.journal.build_page06_07 import create_handdrawn_divider, wrap_text_to_width

    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    X0, W = 220, 1330
    BODY, BODY_LH = 34, 54
    SEC, SEC_LH = 40, 62

    def put(text, x, y, size, seed):
        t_img, _ = render_pencil_text(text, FONT_PATH, font_size=size, gc=gc, seed=seed)
        blit_rgba(canvas, t_img, x, y)
        return t_img.shape[1]

    def put_centered(text, cx, y, size, seed):
        t_img, _ = render_pencil_text(text, FONT_PATH, font_size=size, gc=gc, seed=seed)
        blit_rgba(canvas, t_img, int(cx - t_img.shape[1] / 2), y)

    def paragraph(text, x, y, max_w, size=BODY, lh=BODY_LH, seed=0):
        for k, ln in enumerate(wrap_text_to_width(text, FONT_PATH, size, max_w)):
            put(ln, x, y, size, seed + k * 3)
            y += lh
        return y

    # 1. Header (Clean title, generous top margin)
    put("At the Gates of Tower II", X0, 85, 62, 3001)
    divider = create_handdrawn_divider(width=W, gc=gc, seed=3003)
    blit_rgba(canvas, divider, X0, 175)

    # 2. Section I: The Threshold
    y = 240
    put("I. The Sandstone Sanctuary", X0, y, SEC, 3010)
    y += SEC_LH
    sec1_text = (
        "At the western margin of the salt playa rise the colossal ramparts of Tower II. "
        "Here, carved deep into the sheer red cliffs, stands the Sandstone Sanctuary of the Oracle. "
        "Fluted columns of living rock frame an ancient archway sealed by heavy bronze gates. "
        "In the shadow of the portico stands the Sanctuary Servant, an elder of the Order "
        "guarding the threshold with an iron staff topped by a celestial star-sight."
    )
    y = paragraph(sec1_text, X0, y, W, size=BODY, lh=BODY_LH, seed=3012)
    y += 50

    # 3. Engraved plate: Masterwork Leonardo da Vinci Tower II Sanctuary Gates Study
    target_w = 1180
    gate_asset_path = os.path.join(PROJECT_ROOT, "journal", "page13", "assets", "davinci_tower2_gates_clean_alpha.png")
    if os.path.exists(gate_asset_path):
        gate_alpha = cv2.imread(gate_asset_path, cv2.IMREAD_UNCHANGED)
        if gate_alpha is not None:
            target_h = int(round(gate_alpha.shape[0] * (target_w / gate_alpha.shape[1])))
            gate_resized = cv2.resize(gate_alpha, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
            gx0 = X0 + (W - target_w) // 2
            gy0 = y
            blit_rgba(canvas, gate_resized, gx0, gy0)
            draw_sketchy_rect(canvas, (gx0 - 10, gy0 - 8, gx0 + target_w + 10, gy0 + target_h + 8), gc=gc, alpha_base=120, passes=1, seed=3019)
            y = gy0 + target_h + 55
    else:
        plate_h = 520
        _draw_tower_gate_scene(canvas, X0, y, W, plate_h, gc)
        y += plate_h + 55

    # 4. Section II: The Demand of the Five Seals
    put("II. The Demand of the Five Seals", X0, y, SEC, 3030)
    y += SEC_LH
    sec2_text = (
        "No traveler may step beyond the gates without offering proof of their survey. "
        "When I presented the carved stone seal recovered from the dry riverbed, the guardian studied "
        "its geometry in silence, then pointed his staff to the five empty sockets set into the arch: "
        "«You have found the first seal by following the dry wash, but four still sleep in stone. "
        "Five sacred cairns were raised by our founders to measure this desert. Return to the sands "
        "and complete the meridian survey, or these gates remain closed forever.»"
    )
    y = paragraph(sec2_text, X0, y, W, size=BODY, lh=BODY_LH, seed=3032)
    y += 55

    # 5. Section III: The Great Circuit
    put("III. The Great Circuit", X0, y, SEC, 3060)
    y += SEC_LH + 10
    seal_cy = y + 75
    names = [
        ("Cairn I", "Seal acquired", "River Wash"),
        ("Cairn II", "Seal missing", "Sun Monolith"),
        ("Cairn III", "Seal missing", "Sandstone Labyrinth"),
        ("Cairn IV", "Seal missing", "Canyon Sentry"),
        ("Cairn V", "Seal missing", "Solar Altar Arch")
    ]
    step_x = W / 5.0
    for idx, (nm, st, place) in enumerate(names):
        cxs = int(X0 + step_x * (idx + 0.5))
        _draw_seal_socket(canvas, (cxs, seal_cy), idx, idx == 0, gc, 3100 + idx * 40)
        put_centered(nm, cxs, seal_cy + 92, 30, 3070 + idx)
        put_centered(st, cxs, seal_cy + 128, 25, 3080 + idx)
        put_centered(place, cxs, seal_cy + 158, 25, 3090 + idx)

    y = seal_cy + 185 + 45
    closing_text = (
        "The initial hunch by the dry wash was only the first link. To unlock the Sanctuary "
        "and stand before the Oracle, we must traverse the full expanse of the Grand Desert Map "
        "and recover each missing seal from its landmark. "
        "Our course is set north-north-east, toward the shadow of the Sun Monolith."
    )
    y = paragraph(closing_text, X0, y, W, size=BODY, lh=BODY_LH, seed=3200)

    # Left punch-hole enforcement (Cara A: X < 165 has 0 px)
    canvas[:, :165, 3] = 0
    return canvas, target_h if os.path.exists(gate_asset_path) else plate_h, y


def render_lore_13a_sanctuary_servant(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 13 · Cara A (Front: X < 165 has 0 px).
    Masterwork Leonardo da Vinci study: At the gates of Tower II (The Sandstone Sanctuary)."""
    canvas, _, _ = _render_13a_page(gc)
    return canvas


# =========================================================================
# SHEET 13 · CARA B: JUEGO D5 — THE SUN MONOLITH & CAIRN II
# =========================================================================

def _draw_dashed_line(canvas, p1, p2, gc, dash=14, gap=9, alpha=150):
    """Dashed pencil line (sun rays, measuring guides)."""
    x1, y1 = p1
    x2, y2 = p2
    dist = math.hypot(x2 - x1, y2 - y1)
    if dist < 1:
        return
    ux, uy = (x2 - x1) / dist, (y2 - y1) / dist
    t = 0.0
    while t < dist:
        e = min(dist, t + dash)
        cv2.line(canvas, (int(x1 + ux * t), int(y1 + uy * t)), (int(x1 + ux * e), int(y1 + uy * e)), (*gc, alpha), 1, cv2.LINE_AA)
        t += dash + gap


def _draw_sun_monolith_scene(canvas, x0, y0, w, h, gc=GRAPHITE_COLOR, pace=10):
    """Engraved plate (1 pace = 10 px): the Sun Monolith (24 paces) at first light with its 48-pace shadow, Hermes's
    2-pace staff with its 4-pace shadow, the stepped pedestal of Cairn II and a measuring scale in paces."""
    rng = np.random.default_rng(1701)
    draw_sketchy_rect(canvas, (x0, y0, x0 + w, y0 + h), gc=gc, alpha_base=200, passes=2, seed=1710)
    draw_sketchy_rect(canvas, (x0 + 8, y0 + 8, x0 + w - 8, y0 + h - 8), gc=gc, alpha_base=110, passes=1, seed=1714)

    PACE = pace
    sy = y0 + h - 88                         # measuring scale line
    y_g = sy - 54                            # ground line
    ox = x0 + 560                            # obelisk axis
    tip_y = y_g - 24 * PACE                  # 24 paces tall (shaft + pyramidion)

    # --- sky: low sun, rays, thin clouds, two falcons
    sun_c = (x0 + 150, y0 + 118)
    draw_sketchy_circle(canvas, sun_c, 36, gc=gc, alpha_base=190, passes=2, seed=1720, num_pts=36)
    draw_sketchy_circle(canvas, sun_c, 26, gc=gc, alpha_base=110, passes=1, seed=1721, num_pts=30)
    for k in range(32):
        th = math.radians(k * 360 / 32)
        r1, r2 = 48, (82 if k % 2 == 0 else 64)
        cv2.line(canvas, (int(sun_c[0] + r1 * math.cos(th)), int(sun_c[1] + r1 * math.sin(th))), (int(sun_c[0] + r2 * math.cos(th)), int(sun_c[1] + r2 * math.sin(th))), (*gc, 110), 1, cv2.LINE_AA)
    for k in range(14):
        yy = y0 + 28 + k * 11
        xx = x0 + int(w * 0.56) + int(rng.integers(-40, 260))
        ln = int(rng.integers(60, 190))
        if xx + ln < x0 + w - 24 and yy < y0 + 150:
            draw_sketchy_line(canvas, (xx, yy), (xx + ln, yy), gc=gc, alpha_base=40, passes=1, seed=1730 + k)
    for fx, fy, fs in ((x0 + w - 160, y0 + 64, 1.0), (x0 + w - 100, y0 + 96, 0.7)):
        for side in (-1, 1):
            _draw_arc(canvas, (int(fx + side * 16 * fs), int(fy + 6 * fs)), int(18 * fs), 200 if side < 0 else 280, 250 if side < 0 else 330, gc=gc, alpha=190, seed=1740 + side, passes=1)

    # --- far mesas and dunes
    for mx, mw, mh in ((x0 + 60, 150, 56), (x0 + w - 300, 190, 74), (x0 + w - 100, 70, 44)):
        poly = [(mx, y_g - 14), (mx + 14, y_g - 14 - mh), (mx + mw - 14, y_g - 14 - mh), (mx + mw, y_g - 14)]
        cv2.polylines(canvas, [np.array(poly, dtype=np.int32)], False, (*gc, 105), 1, cv2.LINE_AA)
        _hatch_polygon(canvas, [(mx + mw // 2, y_g - 14 - mh), (mx + mw - 14, y_g - 14 - mh), (mx + mw, y_g - 14), (mx + mw // 2, y_g - 14)], step=4, angle=75, gc=gc, alpha=42, seed=1750 + mx % 13)
    for layer, (base, amp, a) in enumerate(((y_g - 12, 12, 85), (y_g + 6, 16, 105))):
        pts = [(xx, int(base + amp * math.sin(xx / 150.0 + layer * 1.9) + 5 * math.sin(xx / 47.0))) for xx in range(x0 + 10, x0 + w - 10, 8)]
        for i in range(len(pts) - 1):
            cv2.line(canvas, pts[i], pts[i + 1], (*gc, a), 1, cv2.LINE_AA)

    # --- Cairn II: stepped pedestal with carved tablets (left of the Monolith)
    cxp = x0 + 330
    for k, (hw, y1, y2) in enumerate(((84, y_g - 20, y_g), (64, y_g - 40, y_g - 20), (44, y_g - 60, y_g - 40))):
        _clear_polygon(canvas, [(cxp - hw, y1), (cxp + hw, y1), (cxp + hw, y2), (cxp - hw, y2)])
        draw_sketchy_rect(canvas, (cxp - hw, y1, cxp + hw, y2), gc=gc, alpha_base=195, passes=2, seed=1760 + k)
        _hatch_polygon(canvas, [(cxp + hw // 3, y1), (cxp + hw, y1), (cxp + hw, y2), (cxp + hw // 3, y2)], step=3, angle=90, gc=gc, alpha=75, seed=1764 + k)
    for k in range(5):
        tx = cxp - 36 + k * 18
        draw_sketchy_rect(canvas, (tx, y_g - 58, tx + 13, y_g - 42), gc=gc, alpha_base=170, passes=1, seed=1770 + k)
        for ln in range(3):
            cv2.line(canvas, (tx + 3, y_g - 55 + ln * 4), (tx + 10, y_g - 55 + ln * 4), (*gc, 150), 1, cv2.LINE_AA)
    cv2.ellipse(canvas, (cxp, y_g - 64), (32, 9), 0, 0, 360, (*gc, 185), 1, cv2.LINE_AA)
    cv2.ellipse(canvas, (cxp, y_g - 64), (21, 6), 0, 0, 360, (*gc, 120), 1, cv2.LINE_AA)

    # --- the Sun Monolith: tapered shaft with two faces, scale ticks, sun bands, pyramidion, plinth
    shaft_bot, shaft_top = y_g - 24, tip_y + 40
    bl, br, tl, tr = ox - 30, ox + 32, ox - 16, ox + 17
    front = [(bl, shaft_bot), (ox + 3, shaft_bot), (ox + 1, shaft_top), (tl, shaft_top)]
    side = [(ox + 3, shaft_bot), (br, shaft_bot), (tr, shaft_top), (ox + 1, shaft_top)]
    _clear_polygon(canvas, front + [(br, shaft_bot), (tr, shaft_top)])
    for poly in (front, side):
        cv2.polylines(canvas, [np.array(poly, dtype=np.int32)], True, (*gc, 205), 1, cv2.LINE_AA)
    _shade_ramp(canvas, (ox + 3, shaft_top, br + 1, shaft_bot), 3, 84, 70, 130, gc, 1780)
    for yy in range(shaft_top + 8, shaft_bot - 4, 10):
        longer = ((shaft_bot - yy) // 10) % 5 == 0
        xl = int(tl + (bl - tl) * (yy - shaft_top) / (shaft_bot - shaft_top))
        cv2.line(canvas, (xl + 2, yy), (xl + (13 if longer else 7), yy), (*gc, 170), 1, cv2.LINE_AA)
    for k, yy in enumerate((shaft_top + 48, shaft_top + 118, shaft_top + 188)):
        c0 = (ox - 11, yy)
        cv2.circle(canvas, c0, 6, (*gc, 180), 1, cv2.LINE_AA)
        for a in range(8):
            th = math.radians(a * 45)
            cv2.line(canvas, (int(c0[0] + 8 * math.cos(th)), int(c0[1] + 8 * math.sin(th))), (int(c0[0] + 12 * math.cos(th)), int(c0[1] + 12 * math.sin(th))), (*gc, 150), 1, cv2.LINE_AA)
        cv2.line(canvas, (bl + 5, yy + 20), (ox, yy + 20), (*gc, 90), 1, cv2.LINE_AA)
    apex = (ox, tip_y)
    pyr_l = [(tl, shaft_top), apex, (ox + 1, shaft_top)]
    pyr_r = [(ox + 1, shaft_top), apex, (tr, shaft_top)]
    cv2.polylines(canvas, [np.array(pyr_l, dtype=np.int32)], True, (*gc, 205), 1, cv2.LINE_AA)
    cv2.polylines(canvas, [np.array(pyr_r, dtype=np.int32)], True, (*gc, 205), 1, cv2.LINE_AA)
    _hatch_polygon(canvas, pyr_r, step=3, angle=70, gc=gc, alpha=120, seed=1790)
    for k, (hw, y1, y2) in enumerate(((54, y_g - 12, y_g), (43, y_g - 24, y_g - 12))):
        draw_sketchy_rect(canvas, (ox - hw, y1, ox + hw, y2), gc=gc, alpha_base=195, passes=2, seed=1795 + k)
        _hatch_polygon(canvas, [(ox + 6, y1), (ox + hw, y1), (ox + hw, y2), (ox + 6, y2)], step=3, angle=90, gc=gc, alpha=70, seed=1797 + k)

    # --- the sun's ray touching the tip and falling to the end of the shadow (the same 1:2 slope)
    shadow_len = 48 * PACE
    tip_shadow_x = ox + 32 + shadow_len
    _draw_dashed_line(canvas, apex, (tip_shadow_x, y_g + 2), gc, alpha=160)

    # --- the Monolith's shadow on the ground (tapering band, hatched)
    shadow = [(ox + 30, y_g - 6), (ox + 30, y_g + 14), (tip_shadow_x, y_g + 6), (tip_shadow_x, y_g + 2)]
    cv2.polylines(canvas, [np.array(shadow, dtype=np.int32)], True, (*gc, 170), 1, cv2.LINE_AA)
    _hatch_polygon(canvas, shadow, step=3, angle=0, gc=gc, alpha=105, seed=1800)

    # --- Hermes's two-pace staff with its four-pace shadow
    sx = x0 + 150
    draw_sketchy_line(canvas, (sx, y_g + 4), (sx, y_g - 2 * PACE), gc=gc, alpha_base=215, passes=2, seed=1810)
    cv2.polylines(canvas, [np.array([(sx, y_g - 2 * PACE), (sx + 12, y_g - 2 * PACE + 4), (sx, y_g - 2 * PACE + 9)], dtype=np.int32)], True, (*gc, 200), 1, cv2.LINE_AA)
    draw_sketchy_line(canvas, (sx, y_g + 6), (sx + 4 * PACE, y_g + 6), gc=gc, alpha_base=150, passes=2, seed=1812)
    _hatch_polygon(canvas, [(sx, y_g + 3), (sx + 4 * PACE, y_g + 5), (sx + 4 * PACE, y_g + 8), (sx, y_g + 9)], step=3, angle=0, gc=gc, alpha=120, seed=1814)

    # --- pace scale under the shadow: ticks every 6 paces, labels every 12
    draw_sketchy_line(canvas, (ox + 32, sy), (tip_shadow_x, sy), gc=gc, alpha_base=190, passes=2, seed=1820)
    for p in range(0, 49, 6):
        tx = ox + 32 + p * PACE
        cv2.line(canvas, (tx, sy - (10 if p % 12 == 0 else 6)), (tx, sy + (10 if p % 12 == 0 else 6)), (*gc, 190), 1, cv2.LINE_AA)
    # ground ripples and tufts
    for k in range(190):
        gx = int(rng.integers(x0 + 20, x0 + w - 60))
        gy = int(rng.integers(y_g + 18, y0 + h - 14))
        if ox - 20 < gx < tip_shadow_x + 30 and sy - 16 < gy < sy + 76:
            continue
        if x0 + 60 < gx < x0 + 330 and y_g + 14 < gy < y_g + 70:
            continue
        ln = int(rng.integers(12, 40))
        cv2.line(canvas, (gx, gy), (gx + ln, gy + int(rng.integers(-1, 2))), (*gc, int(rng.integers(36, 80))), 1, cv2.LINE_AA)
    for gx, gy in ((x0 + 480, y0 + h - 30), (x0 + w - 110, y0 + h - 40), (x0 + 60, y0 + h - 28)):
        for k in range(7):
            th = math.radians(-90 + (k - 3) * 17)
            cv2.line(canvas, (gx, gy), (int(gx + 20 * math.cos(th)), int(gy + 20 * math.sin(th))), (*gc, 150), 1, cv2.LINE_AA)
    return ox, sy, tip_shadow_x, y_g, sx, cxp


def _draw_cairn_half_dial(canvas, cx, cy, gc, seed=1900):
    """Northern half of the dial of Cairn II, seen from above: stepped pedestal, seven half-rings (6 to 42 paces) and a
    letter tablet on each ring along the north line. The Monolith stands at the centre; its noon shadow runs due north."""
    PPP = 7.0                                    # px per pace
    R_out = int(round(42 * PPP)) + 14
    # stepped pedestal (three steps) around the half dial
    for k, inset in enumerate((0, 9, 18)):
        half = R_out + 24 - inset
        draw_sketchy_rect(canvas, (cx - half, cy - half, cx + half, cy + 66 - inset), gc=gc, alpha_base=205 - 35 * k, passes=2 if k == 0 else 1, seed=seed + k)
    _hatch_polygon(canvas, [(cx + R_out + 6, cy - R_out - 6), (cx + R_out + 24, cy - R_out - 24), (cx + R_out + 24, cy + 66), (cx + R_out + 6, cy + 60)], step=3, angle=90, gc=gc, alpha=80, seed=seed + 3)
    # outer ring with ticks every 5 degrees (northern half)
    _draw_arc(canvas, (cx, cy), R_out, 180, 360, gc=gc, alpha=205, seed=seed + 5, passes=2)
    _draw_arc(canvas, (cx, cy), R_out - 10, 180, 360, gc=gc, alpha=130, seed=seed + 6, passes=1)
    for deg in range(180, 361, 5):
        th = math.radians(deg)
        long_tick = deg % 15 == 0
        r1 = R_out - 10 if long_tick else R_out - 6
        cv2.line(canvas, (int(cx + r1 * math.cos(th)), int(cy + r1 * math.sin(th))), (int(cx + R_out * math.cos(th)), int(cy + R_out * math.sin(th))), (*gc, 150 if long_tick else 90), 1, cv2.LINE_AA)
    # seven half-rings
    for paces in range(6, 43, 6):
        _draw_arc(canvas, (cx, cy), int(round(paces * PPP)), 180, 360, gc=gc, alpha=150, seed=seed + 10 + paces, passes=1)
    # diameter line, north line and the Monolith at the centre
    draw_sketchy_line(canvas, (cx - R_out + 8, cy), (cx + R_out - 8, cy), gc=gc, alpha_base=170, passes=2, seed=seed + 40)
    draw_sketchy_line(canvas, (cx, cy), (cx, cy - R_out + 8), gc=gc, alpha_base=130, passes=1, seed=seed + 41)
    mon = [(cx - 9, cy + 8), (cx + 9, cy + 8), (cx + 9, cy - 8), (cx - 9, cy - 8)]
    _clear_polygon(canvas, mon)
    cv2.polylines(canvas, [np.array(mon, dtype=np.int32)], True, (*gc, 215), 1, cv2.LINE_AA)
    _hatch_polygon(canvas, [(cx, cy - 8), (cx + 9, cy - 8), (cx + 9, cy + 8), (cx, cy + 8)], step=3, angle=60, gc=gc, alpha=150, seed=seed + 42)
    # north arrow in the top-left corner of the pedestal
    ax, ay = cx - R_out - 4, cy - R_out - 8
    cv2.polylines(canvas, [np.array([(ax, ay), (ax - 10, ay + 26), (ax + 10, ay + 26)], dtype=np.int32)], True, (*gc, 210), 1, cv2.LINE_AA)
    cv2.fillPoly(canvas, [np.array([(ax, ay), (ax + 10, ay + 26), (ax, ay + 20)], dtype=np.int32)], (*gc, 200))
    n_img, _ = render_pencil_text("North", FONT_PATH, font_size=24, gc=gc, seed=seed + 44)
    blit_rgba(canvas, n_img, ax + 18, ay + 2)
    # tablets along the north line and ring values along the diameter
    letters = {6: 'U', 12: 'D', 18: 'S', 24: 'A', 30: 'N', 36: 'I', 42: 'L'}
    for paces, letter in letters.items():
        r = int(round(paces * PPP))
        ty = cy - r
        draw_sketchy_rect(canvas, (cx - 15, ty - 15, cx + 15, ty + 15), gc=gc, alpha_base=215, passes=2, seed=seed + 50 + paces)
        _clear_polygon(canvas, [(cx - 13, ty - 13), (cx + 13, ty - 13), (cx + 13, ty + 13), (cx - 13, ty + 13)])
        t_img, _ = render_pencil_text(letter, FONT_PATH, font_size=26, gc=gc, seed=seed + 70 + paces)
        blit_rgba(canvas, t_img, int(cx - t_img.shape[1] / 2), int(ty - t_img.shape[0] / 2 + 3))
        cv2.line(canvas, (cx + r, cy - 5), (cx + r, cy + 5), (*gc, 190), 1, cv2.LINE_AA)
        cv2.line(canvas, (cx - r, cy - 5), (cx - r, cy + 5), (*gc, 150), 1, cv2.LINE_AA)
        v_img, _ = render_pencil_text(str(paces), FONT_PATH, font_size=22, gc=gc, seed=seed + 90 + paces)
        blit_rgba(canvas, v_img, int(cx + r - v_img.shape[1] / 2), cy + 12)
    return R_out


def _render_13b_page(gc: tuple = GRAPHITE_COLOR, plate_override=None):
    """Sheet 13 · Cara B (Back: X > 1583 has 0 px).
    Game D5: the noon-shadow puzzle of the Sun Monolith and Cairn II.
    Follows the authentic codex narrative style of Pages 1-12."""
    from scripts.journal.build_page06_07 import create_handdrawn_divider, wrap_text_to_width

    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    X0, W = 180, 1360
    BODY, BODY_LH = 33, 50
    SEC, SEC_LH = 40, 58
    PACE = 10

    def put(text, x, y, size, seed):
        t_img, _ = render_pencil_text(text, FONT_PATH, font_size=size, gc=gc, seed=seed)
        blit_rgba(canvas, t_img, x, y)
        return t_img.shape[1]

    def put_centered(text, cx, y, size, seed):
        t_img, _ = render_pencil_text(text, FONT_PATH, font_size=size, gc=gc, seed=seed)
        blit_rgba(canvas, t_img, int(cx - t_img.shape[1] / 2), y)

    def paragraph(text, x, y, max_w, size=BODY, lh=BODY_LH, seed=0):
        for k, ln in enumerate(wrap_text_to_width(text, FONT_PATH, size, max_w)):
            put(ln, x, y, size, seed + k * 3)
            y += lh
        return y

    # ------------------------------------------------------------------ 1. Header (Clean title, generous top margin)
    put("The Sun Monolith & Cairn II", X0, 85, 62, 4001)
    blit_rgba(canvas, create_handdrawn_divider(width=W, gc=gc, seed=4003), X0, 172)

    # ------------------------------------------------------------------ 2. Section I: The Ridge of the Sun
    y = 228
    put("I. The Ridge of the Sun", X0, y, SEC, 4010)
    y += SEC_LH
    sec1 = (
        "On the high north-eastern ridge stands the Sun Monolith, an ancient obelisk of red sandstone "
        "carved by the founders of the Order. At its foot rests Cairn II, a stepped pedestal surrounded "
        "by a radial pavement of concentric rings. Here, where the desert horizon stretches unbroken, "
        "the architects calibrated their meridian surveys by measuring the shadows cast at true solar noon."
    )
    y = paragraph(sec1, X0, y, W, seed=4012)
    y += 46

    # ------------------------------------------------------------------ Plate: Masterwork Da Vinci Sun Monolith Study
    target_w = 1120
    monolith_asset_path = os.path.join(PROJECT_ROOT, "journal", "page13", "assets", "davinci_sun_monolith_clean_alpha.png")
    if os.path.exists(monolith_asset_path):
        m_alpha = cv2.imread(monolith_asset_path, cv2.IMREAD_UNCHANGED)
        if m_alpha is not None:
            target_h = int(round(m_alpha.shape[0] * (target_w / m_alpha.shape[1])))
            m_resized = cv2.resize(m_alpha, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
            gx0 = X0 + (W - target_w) // 2
            gy0 = y
            blit_rgba(canvas, m_resized, gx0, gy0)
            y = gy0 + target_h + 46
    else:
        plate_h = 520
        ox, sy, tip_x, y_g, staff_x, cairn_x = _draw_sun_monolith_scene(canvas, X0, y, W, plate_h, gc, PACE)
        for p in (12, 24, 36, 48):
            put_centered(str(p) if p < 48 else "48 paces", ox + 32 + p * PACE, sy + 14, 22, 4020 + p)
        put_centered("Monolith's shadow", ox + 32 + 24 * PACE, sy + 42, 26, 4024)
        put("Staff: 2 paces", staff_x - 66, y_g + 26, 24, 4025)
        put("shadow: 4 paces", staff_x - 66, y_g + 54, 24, 4026)
        put_centered("Cairn II", cairn_x, y_g + 20, 26, 4027)
        y += plate_h + 46

    # ------------------------------------------------------------------ 3. Section II: The Rules of the Survey
    put("II. The Rules of the Survey", X0, y, SEC, 4030)
    y += SEC_LH
    rules = [
        "1. The Law of Proportion — At any hour, every upright marker casts a shadow proportional to its height. The surveyor's staff stands two paces tall; the Monolith rises twenty-four paces. Determine the Monolith's shadow for each entry in the ledger.",
        "2. The Meridian Rings — At true solar noon, shadows fall due north across Cairn II. Each concentric ring on the dial marks a measured distance in paces from the Monolith at the center.",
        "3. The Order of the Sigil — Locate the ring for each calculated shadow. The letter tablet carved upon that ring yields one character of the sigil, following the ledger from Noon I to VII."
    ]
    for k, r in enumerate(rules):
        for j, ln in enumerate(wrap_text_to_width(r, FONT_PATH, BODY, W)):
            put(ln, X0 + (0 if j == 0 else 24), y, BODY, 4032 + k * 10 + j)
            y += BODY_LH
        y += 10
    y += 34

    # ------------------------------------------------------------------ 4. Section III: The Seven Noons: table (left) + half dial (right)
    put("III. The Seven Noons", X0, y, SEC, 4060)
    y += SEC_LH + 6
    col_w = (110, 180, 220, 130)
    tw = sum(col_w)
    tx0, ty0 = X0, y
    row_h, head_h = 50, 56
    staff_shadows = ["1.5", "0.5", "2.5", "1", "3", "2", "3.5"]
    headers = ["Noon", "Staff shadow", "Monolith shadow", "Dial letter"]
    sub = ["", "paces", "paces", ""]
    xs = [tx0]
    for cw in col_w:
        xs.append(xs[-1] + cw)
    table_bottom = ty0 + head_h + 7 * row_h
    draw_sketchy_rect(canvas, (tx0, ty0, tx0 + tw, table_bottom), gc=gc, alpha_base=200, passes=2, seed=4070)
    draw_sketchy_line(canvas, (tx0, ty0 + head_h), (tx0 + tw, ty0 + head_h), gc=gc, alpha_base=200, passes=2, seed=4071)
    for i in range(1, 4):
        draw_sketchy_line(canvas, (xs[i], ty0), (xs[i], table_bottom), gc=gc, alpha_base=150, passes=1, seed=4072 + i)
    for r in range(1, 7):
        draw_sketchy_line(canvas, (tx0, ty0 + head_h + r * row_h), (tx0 + tw, ty0 + head_h + r * row_h), gc=gc, alpha_base=110, passes=1, seed=4080 + r)
    for i, (hd, sb) in enumerate(zip(headers, sub)):
        t_img, _ = render_pencil_text(hd, FONT_PATH, font_size=23, gc=gc, seed=4090 + i)
        blit_rgba(canvas, t_img, int((xs[i] + xs[i + 1]) / 2 - t_img.shape[1] / 2), ty0 + (4 if sb else 16))
        if sb:
            s_img, _ = render_pencil_text(sb, FONT_PATH, font_size=20, gc=gc, seed=4095 + i)
            blit_rgba(canvas, s_img, int((xs[i] + xs[i + 1]) / 2 - s_img.shape[1] / 2), ty0 + 30)
    for r in range(7):
        ry = ty0 + head_h + r * row_h
        for i, val in enumerate((["I", "II", "III", "IV", "V", "VI", "VII"][r], staff_shadows[r])):
            t_img, _ = render_pencil_text(val, FONT_PATH, font_size=30, gc=gc, seed=4100 + r * 7 + i)
            blit_rgba(canvas, t_img, int((xs[i] + xs[i + 1]) / 2 - t_img.shape[1] / 2), ry + 7)

    # Half dial of Cairn II, right of the table
    dial_cx = tx0 + tw + 40 + 340
    dial_cy = ty0 + 290
    R_out = _draw_cairn_half_dial(canvas, dial_cx, dial_cy, gc)
    put_centered("The dial of Cairn II (rings in paces)", dial_cx, dial_cy + 82, 23, 4121)
    put_centered("The Monolith stands at the centre.", dial_cx, dial_cy + 108, 22, 4122)
    y = max(table_bottom, dial_cy + 136) + 48

    # ------------------------------------------------------------------ 5. Answer bar
    put("The Sigil of Cairn II:", X0, y, 36, 4130)
    y += 50
    box_w, gap = 150, 22
    for k in range(7):
        bx = X0 + k * (box_w + gap)
        draw_sketchy_rect(canvas, (bx, y, bx + box_w, y + 84), gc=gc, alpha_base=200, passes=2, seed=4140 + k * 5)
        draw_sketchy_rect(canvas, (bx + 6, y + 6, bx + box_w - 6, y + 78), gc=gc, alpha_base=90, passes=1, seed=4141 + k * 5)
        n_img, _ = render_pencil_text(["I", "II", "III", "IV", "V", "VI", "VII"][k], FONT_PATH, font_size=22, gc=gc, seed=4170 + k)
        blit_rgba(canvas, n_img, bx + 12, y + 7)
    y += 84
    put("Transcribe the seven-letter sigil to align the meridian survey and claim the seal of Cairn II.", X0, y + 10, 28, 4180)
    y += 38

    # Right punch-hole enforcement (Cara B: X > 1583 has 0 px)
    canvas[:, 1583:, 3] = 0
    return canvas, target_h if os.path.exists(monolith_asset_path) else plate_h, y


def render_game_d5_sun_monolith(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 13 · Cara B (Back: X > 1583 has 0 px).
    Masterwork Leonardo da Vinci study: The Sun Monolith & Cairn II."""
    canvas, _, _ = _render_13b_page(gc)
    return canvas


# =========================================================================
# SHEET 14 · CARA A: LORE — THE FIVE GEODETIC CAIRNS
# =========================================================================

def _roman(n):
    return ["I", "II", "III", "IV", "V"][n]


def _draw_rock(canvas, cx, cy, rx, ry, gc, seed, alpha=205):
    """One opaque boulder: irregular outline, shadow hatching on the right, a crack."""
    rng = np.random.default_rng(seed)
    pts = []
    ths = []
    for k in range(20):
        th = 2 * math.pi * k / 20
        r = 1 + rng.uniform(-0.07, 0.07)
        pts.append((int(cx + rx * r * math.cos(th)), int(cy + ry * r * math.sin(th))))
        ths.append(th)
    _clear_polygon(canvas, pts)
    cv2.polylines(canvas, [np.array(pts, dtype=np.int32)], True, (*gc, alpha), 1, cv2.LINE_AA)
    sub = [p for p, th in zip(pts, ths) if math.cos(th) > 0.28]
    if len(sub) > 2:
        _hatch_polygon(canvas, sub, step=3, angle=65, gc=gc, alpha=int(alpha * 0.5), seed=seed + 1)
    x1 = int(cx - rx * 0.4)
    cv2.line(canvas, (x1, int(cy - ry * 0.3)), (x1 + int(rx * 0.35), int(cy + ry * 0.1)), (*gc, 110), 1, cv2.LINE_AA)


def _draw_cairn_elevation(canvas, idx, cx, gy, H, gc, seed):
    """Large elevation drawing of one of the five Cairns, standing on ground line gy, about H px tall.
    Light comes from the left; the right sides carry hatching."""
    s = H / 250.0
    if idx == 0:  # cone of river boulders
        tiers = [(236, 72), (190, 66), (146, 60), (104, 54), (64, 46)]
        yb = gy
        for t, (w, h) in enumerate(tiers):
            w, h = w * s, h * s
            n = max(1, int(round(w / (82 * s))))
            cyt = yb - h / 2
            for k in range(n):
                rx = w / (2 * n) * 1.12
                rcx = cx - w / 2 + w / (2 * n) * (2 * k + 1)
                _draw_rock(canvas, rcx, cyt - (3 * s if k % 2 else 0), rx, h / 2, gc, seed + t * 11 + k)
            yb -= h * 0.72
        for k in range(7):
            ang = (k - 3) * 0.5
            _draw_rock(canvas, cx + 118 * s * math.sin(ang) * 1.05, gy - 5 * s, (9 + (k % 3) * 4) * s, (6 + (k % 2) * 3) * s, gc, seed + 90 + k, alpha=170)
    elif idx == 1:  # stepped pedestal with carved tablets and a dial slab on top
        steps = [(105, 66), (78, 60), (52, 54)]
        yb = gy
        for t, (hw, h) in enumerate(steps):
            hw, h = hw * s, h * s
            body = [(cx - hw, yb), (cx + hw, yb), (cx + hw, yb - h), (cx - hw, yb - h)]
            _clear_polygon(canvas, body)
            draw_sketchy_rect(canvas, (int(cx - hw), int(yb - h), int(cx + hw), int(yb)), gc=gc, alpha_base=205, passes=2, seed=seed + t)
            _hatch_polygon(canvas, [(cx + hw * 0.45, yb - h), (cx + hw, yb - h), (cx + hw, yb), (cx + hw * 0.45, yb)], step=3, angle=90, gc=gc, alpha=85, seed=seed + 5 + t)
            for k in range(3 + (2 - t)):
                tw = hw * 2 / (4 + (2 - t))
                tx = cx - hw + tw * 0.2 + k * tw * 1.0
                if tx + tw * 0.6 > cx + hw * 0.5:
                    continue
                draw_sketchy_rect(canvas, (int(tx), int(yb - h * 0.8), int(tx + tw * 0.62), int(yb - h * 0.2)), gc=gc, alpha_base=160, passes=1, seed=seed + 20 + t * 7 + k)
                for ln in range(3):
                    cv2.line(canvas, (int(tx + tw * 0.1), int(yb - h * 0.62 + ln * h * 0.14)), (int(tx + tw * 0.52), int(yb - h * 0.62 + ln * h * 0.14)), (*gc, 140), 1, cv2.LINE_AA)
            yb -= h
        cv2.ellipse(canvas, (int(cx), int(yb - 6 * s)), (int(58 * s), int(14 * s)), 0, 0, 360, (*gc, 200), 1, cv2.LINE_AA)
        cv2.ellipse(canvas, (int(cx), int(yb - 6 * s)), (int(38 * s), int(9 * s)), 0, 0, 360, (*gc, 130), 1, cv2.LINE_AA)
        for k in range(8):
            th = math.radians(k * 45)
            cv2.line(canvas, (int(cx + 44 * s * math.cos(th)), int(yb - 6 * s + 11 * s * math.sin(th))), (int(cx + 56 * s * math.cos(th)), int(yb - 6 * s + 13.5 * s * math.sin(th))), (*gc, 140), 1, cv2.LINE_AA)
    elif idx == 2:  # pyramid of dry stones with the copper plate
        hw0, hw1, hh = 124 * s, 14 * s, 250 * s
        body = [(cx - hw0, gy), (cx + hw0, gy), (cx + hw1, gy - hh), (cx - hw1, gy - hh)]
        _clear_polygon(canvas, body)
        cv2.polylines(canvas, [np.array([(int(a), int(b)) for a, b in body], dtype=np.int32)], True, (*gc, 210), 1, cv2.LINE_AA)
        rows = 8
        rng = np.random.default_rng(seed)
        for r in range(rows):
            y1 = gy - (r + 1) * hh / rows
            y0_ = gy - r * hh / rows
            w_bot = hw0 + (hw1 - hw0) * (r / rows)
            w_top = hw0 + (hw1 - hw0) * ((r + 1) / rows)
            cv2.line(canvas, (int(cx - w_top), int(y1)), (int(cx + w_top), int(y1)), (*gc, 150), 1, cv2.LINE_AA)
            nblocks = max(2, int(round(w_bot * 2 / (62 * s))))
            off = (r % 2) * 0.5
            for b in range(1, nblocks):
                fx = (b - off * 0.0 + (off if r % 2 else 0)) / nblocks
                bx_bot = cx - w_bot + (2 * w_bot) * (b + (0.5 if r % 2 else 0)) / (nblocks + (0.5 if r % 2 else 0) * 0)
                if abs(bx_bot - cx) >= w_top - 2:
                    continue
                cv2.line(canvas, (int(bx_bot), int(y0_)), (int(bx_bot + rng.uniform(-2, 2)), int(y1)), (*gc, 110), 1, cv2.LINE_AA)
        _hatch_polygon(canvas, [(cx + hw1 * 0.3, gy - hh), (cx + hw1, gy - hh), (cx + hw0, gy), (cx + hw0 * 0.12, gy)], step=3, angle=70, gc=gc, alpha=95, seed=seed + 3)
        # copper benchmark plate
        py = gy - 0.34 * hh
        pr = 31 * s
        cv2.circle(canvas, (int(cx - 8 * s), int(py)), int(pr), (0, 0, 0, 0), -1)
        draw_sketchy_circle(canvas, (int(cx - 8 * s), int(py)), int(pr), gc=gc, alpha_base=215, passes=2, seed=seed + 8, num_pts=40)
        draw_sketchy_circle(canvas, (int(cx - 8 * s), int(py)), int(pr * 0.72), gc=gc, alpha_base=150, passes=1, seed=seed + 9, num_pts=34)
        for k in range(8):
            th = math.radians(k * 45 + 22)
            cv2.circle(canvas, (int(cx - 8 * s + pr * 0.86 * math.cos(th)), int(py + pr * 0.86 * math.sin(th))), 1, (*gc, 210), -1, cv2.LINE_AA)
        cv2.line(canvas, (int(cx - 8 * s - pr * 0.5), int(py)), (int(cx - 8 * s + pr * 0.5), int(py)), (*gc, 170), 1, cv2.LINE_AA)
        cv2.line(canvas, (int(cx - 8 * s), int(py - pr * 0.5)), (int(cx - 8 * s), int(py + pr * 0.5)), (*gc, 170), 1, cv2.LINE_AA)
        _hatch_polygon(canvas, [(cx - 8 * s - pr * 0.2, py - pr * 0.7), (cx - 8 * s + pr * 0.7, py - pr * 0.3), (cx - 8 * s + pr * 0.7, py + pr * 0.3), (cx - 8 * s - pr * 0.2, py + pr * 0.7)], step=3, angle=45, gc=gc, alpha=80, seed=seed + 10)
        # fallen stones at the foot
        for k, (dx, rr) in enumerate(((-150, 11), (-175, 8), (146, 10), (176, 7))):
            _draw_rock(canvas, cx + dx * s, gy - 5 * s, rr * s * 1.2, rr * s * 0.7, gc, seed + 60 + k, alpha=170)
    elif idx == 3:  # twin hollow pillars with wind
        pw = 36 * s
        for k, dx in enumerate((-64 * s, 64 * s)):
            px = cx + dx
            body = [(px - pw, gy), (px + pw, gy), (px + pw * 0.82, gy - H), (px - pw * 0.82, gy - H)]
            _clear_polygon(canvas, body)
            cv2.polylines(canvas, [np.array([(int(a), int(b)) for a, b in body], dtype=np.int32)], True, (*gc, 210), 1, cv2.LINE_AA)
            for yy in range(int(gy - H + 36 * s), int(gy - 10 * s), int(40 * s)):
                cv2.line(canvas, (int(px - pw * 0.9), yy), (int(px + pw * 0.9), yy), (*gc, 90), 1, cv2.LINE_AA)
            _hatch_polygon(canvas, [(px + pw * 0.2, gy - H), (px + pw * 0.82, gy - H), (px + pw, gy), (px + pw * 0.2, gy)], step=3, angle=88, gc=gc, alpha=95, seed=seed + k * 3)
            for a in range(3):
                ay = gy - H * (0.28 + 0.2 * a)
                cv2.ellipse(canvas, (int(px - 4 * s), int(ay)), (int(10 * s), int(17 * s)), 0, 0, 360, (*gc, 200), 1, cv2.LINE_AA)
                _hatch_polygon(canvas, [(px - 4 * s, ay - 17 * s), (px + 6 * s, ay - 10 * s), (px + 6 * s, ay + 10 * s), (px - 4 * s, ay + 17 * s)], step=2, angle=80, gc=gc, alpha=150, seed=seed + 30 + k * 5 + a)
            draw_sketchy_rect(canvas, (int(px - pw - 8 * s), int(gy - H - 14 * s), int(px + pw + 8 * s), int(gy - H)), gc=gc, alpha_base=205, passes=2, seed=seed + 40 + k)
            draw_sketchy_rect(canvas, (int(px - pw - 10 * s), int(gy - 14 * s), int(px + pw + 10 * s), int(gy)), gc=gc, alpha_base=205, passes=2, seed=seed + 44 + k)
        for k in range(3):
            pts = [(int(cx - 22 * s + t * 3), int(gy - H * (0.34 + 0.18 * k) + 7 * math.sin(t / 5.0 + k))) for t in range(0, int(44 * s), 2)]
            for a in range(0, len(pts) - 1, 2):
                cv2.line(canvas, pts[a], pts[a + 1], (*gc, 120), 1, cv2.LINE_AA)
    else:  # monolithic pedestal facing the sun
        steps = [(88, 22), (68, 22)]
        yb = gy
        for t, (hw, h) in enumerate(steps):
            hw, h = hw * s, h * s
            _clear_polygon(canvas, [(cx - hw, yb), (cx + hw, yb), (cx + hw, yb - h), (cx - hw, yb - h)])
            draw_sketchy_rect(canvas, (int(cx - hw), int(yb - h), int(cx + hw), int(yb)), gc=gc, alpha_base=205, passes=2, seed=seed + t)
            _hatch_polygon(canvas, [(cx + hw * 0.4, yb - h), (cx + hw, yb - h), (cx + hw, yb), (cx + hw * 0.4, yb)], step=3, angle=90, gc=gc, alpha=85, seed=seed + 4 + t)
            yb -= h
        top = yb - (H - 44 * s)
        slab = [(cx - 46 * s, yb), (cx + 46 * s, yb), (cx + 38 * s, top), (cx - 38 * s, top)]
        _clear_polygon(canvas, slab)
        cv2.polylines(canvas, [np.array([(int(a), int(b)) for a, b in slab], dtype=np.int32)], True, (*gc, 215), 1, cv2.LINE_AA)
        bevel = [(cx - 38 * s, top), (cx + 38 * s, top), (cx + 30 * s, top - 14 * s), (cx - 30 * s, top - 14 * s)]
        _clear_polygon(canvas, bevel)
        cv2.polylines(canvas, [np.array([(int(a), int(b)) for a, b in bevel], dtype=np.int32)], True, (*gc, 205), 1, cv2.LINE_AA)
        _hatch_polygon(canvas, [(cx + 6 * s, top), (cx + 38 * s, top), (cx + 46 * s, yb), (cx + 6 * s, yb)], step=3, angle=90, gc=gc, alpha=90, seed=seed + 8)
        gcy = top + 0.34 * (yb - top)
        cv2.circle(canvas, (int(cx - 8 * s), int(gcy)), int(15 * s), (*gc, 190), 1, cv2.LINE_AA)
        for k in range(12):
            th = math.radians(k * 30)
            cv2.line(canvas, (int(cx - 8 * s + 19 * s * math.cos(th)), int(gcy + 19 * s * math.sin(th))), (int(cx - 8 * s + 28 * s * math.cos(th)), int(gcy + 28 * s * math.sin(th))), (*gc, 150), 1, cv2.LINE_AA)
        for k in range(3):
            cv2.line(canvas, (int(cx - 30 * s), int(top + (yb - top) * (0.62 + 0.1 * k))), (int(cx + 4 * s), int(top + (yb - top) * (0.62 + 0.1 * k))), (*gc, 110), 1, cv2.LINE_AA)
        for k in range(4):
            th = math.radians(-135 + k * 14)
            _draw_dashed_line(canvas, (cx - 70 * s + 12 * math.cos(th), top - 30 * s + 12 * math.sin(th)), (cx - 110 * s, top - 62 * s + k * 18 * s), gc, dash=9, gap=7, alpha=90)


def _draw_cairn_survey_plate(canvas, x0, y0, w, h, gc=GRAPHITE_COLOR):
    """Engraved plate: the five Cairns in elevation along one horizon line. I-III lie rebuilt (loose stones at the foot),
    IV and V never fell."""
    rng = np.random.default_rng(1401)
    draw_sketchy_rect(canvas, (x0, y0, x0 + w, y0 + h), gc=gc, alpha_base=200, passes=2, seed=1410)
    draw_sketchy_rect(canvas, (x0 + 8, y0 + 8, x0 + w - 8, y0 + h - 8), gc=gc, alpha_base=110, passes=1, seed=1414)
    gy = y0 + h - 64
    Hmax = int(min(270, h - 64 - 100))
    # sky: thin clouds and falcons
    for k in range(10):
        yy = y0 + 22 + k * 9
        xx = x0 + 40 + int(rng.integers(0, w - 360))
        ln = int(rng.integers(70, 210))
        draw_sketchy_line(canvas, (xx, yy), (xx + ln, yy), gc=gc, alpha_base=34, passes=1, seed=1420 + k)
    for fx, fy in ((x0 + w - 150, y0 + 40), (x0 + w - 104, y0 + 64)):
        for side in (-1, 1):
            _draw_arc(canvas, (int(fx + side * 15), int(fy + 5)), 17, 200 if side < 0 else 280, 250 if side < 0 else 330, gc=gc, alpha=170, seed=1430 + side, passes=1)
    # far mesas and the survey horizon line
    hz = gy - int(Hmax * 0.42)
    for mx, mw_, mh in ((x0 + 22, 170, 64), (x0 + 560, 210, 52), (x0 + w - 250, 190, 70)):
        poly = [(mx, gy - 6), (mx + 16, gy - 6 - mh), (mx + mw_ - 16, gy - 6 - mh), (mx + mw_, gy - 6)]
        cv2.polylines(canvas, [np.array(poly, dtype=np.int32)], False, (*gc, 85), 1, cv2.LINE_AA)
        _hatch_polygon(canvas, [(mx + mw_ // 2, gy - 6 - mh), (mx + mw_ - 16, gy - 6 - mh), (mx + mw_, gy - 6), (mx + mw_ // 2, gy - 6)], step=4, angle=75, gc=gc, alpha=36, seed=1440 + mx % 17)
    _draw_dashed_line(canvas, (x0 + 24, hz), (x0 + w - 24, hz), gc, dash=22, gap=12, alpha=70)
    # dunes and ground
    for layer, (base, amp, a) in enumerate(((gy - 8, 9, 80), (gy + 2, 7, 120))):
        pts = [(xx, int(base + amp * math.sin(xx / 130.0 + layer * 1.7) + 3 * math.sin(xx / 41.0))) for xx in range(x0 + 12, x0 + w - 12, 8)]
        for i in range(len(pts) - 1):
            cv2.line(canvas, pts[i], pts[i + 1], (*gc, a), 1, cv2.LINE_AA)
    cell = w / 5.0
    for i in range(5):
        cx = int(x0 + cell * (i + 0.5))
        _draw_cairn_elevation(canvas, i, cx, gy, int(Hmax * (1.12 if i in (1,) else 1.0)), gc, 1450 + i * 100)
        # medallion with the roman numeral
        mcy = y0 + 54
        draw_sketchy_circle(canvas, (cx, mcy), 31, gc=gc, alpha_base=205, passes=2, seed=1460 + i, num_pts=40)
        draw_sketchy_circle(canvas, (cx, mcy), 24, gc=gc, alpha_base=120, passes=1, seed=1470 + i, num_pts=34)
        r_img, _ = render_pencil_text(_roman(i), FONT_PATH, font_size=26, gc=gc, seed=1480 + i)
        blit_rgba(canvas, r_img, int(cx - r_img.shape[1] / 2), int(mcy - r_img.shape[0] / 2 + 3))
    # ground ripples (kept clear of the labels)
    for k in range(120):
        gx = int(rng.integers(x0 + 20, x0 + w - 60))
        gyy = int(rng.integers(gy + 12, gy + 22))
        cv2.line(canvas, (gx, gyy), (gx + int(rng.integers(10, 34)), gyy), (*gc, int(rng.integers(30, 70))), 1, cv2.LINE_AA)
    return gy


def _draw_bearing_panel(canvas, cx, cy, R, gc, seed=1600):
    """Cairn III seen from above: a ring of degrees (north up) with Hermes's plate line (112 deg) and the older
    cut in the stone (348 deg)."""
    draw_sketchy_circle(canvas, (cx, cy), R, gc=gc, alpha_base=210, passes=2, seed=seed, num_pts=64)
    draw_sketchy_circle(canvas, (cx, cy), R - 14, gc=gc, alpha_base=130, passes=1, seed=seed + 1, num_pts=60)
    for deg in range(0, 360, 5):
        th = math.radians(deg)
        long_tick = deg % 30 == 0
        r1 = R - (24 if long_tick else 18)
        cv2.line(canvas, (int(cx + r1 * math.sin(th)), int(cy - r1 * math.cos(th))), (int(cx + (R - 14) * math.sin(th)), int(cy - (R - 14) * math.cos(th))), (*gc, 160 if long_tick else 95), 1, cv2.LINE_AA)
    # the cairn at the centre: stepped square seen from above
    for k, hw in enumerate((22, 15, 8)):
        draw_sketchy_rect(canvas, (cx - hw, cy - hw, cx + hw, cy + hw), gc=gc, alpha_base=200 - 30 * k, passes=1, seed=seed + 5 + k)
    cv2.circle(canvas, (cx, cy), 3, (*gc, 220), -1, cv2.LINE_AA)
    # lines
    for deg, solid in ((112, True), (348, False)):
        th = math.radians(deg)
        ex, ey = int(cx + (R - 26) * math.sin(th)), int(cy - (R - 26) * math.cos(th))
        sx, sy = int(cx + 26 * math.sin(th)), int(cy - 26 * math.cos(th))
        if solid:
            draw_sketchy_line(canvas, (sx, sy), (ex, ey), gc=gc, alpha_base=215, passes=2, seed=seed + 20)
        else:
            _draw_dashed_line(canvas, (sx, sy), (ex, ey), gc, dash=12, gap=8, alpha=210)
        pts = np.array([(ex, ey), (int(ex - 14 * math.sin(th) + 6 * math.cos(th)), int(ey + 14 * math.cos(th) + 6 * math.sin(th))), (int(ex - 14 * math.sin(th) - 6 * math.cos(th)), int(ey + 14 * math.cos(th) - 6 * math.sin(th)))], dtype=np.int32)
        cv2.fillPoly(canvas, [pts], (*gc, 215))
    # compass letters outside the ring
    for lab, deg in (("N", 0), ("E", 90), ("S", 180), ("W", 270)):
        th = math.radians(deg)
        l_img, _ = render_pencil_text(lab, FONT_PATH, font_size=26, gc=gc, seed=seed + 40 + deg)
        blit_rgba(canvas, l_img, int(cx + (R + 22) * math.sin(th) - l_img.shape[1] / 2), int(cy - (R + 22) * math.cos(th) - l_img.shape[0] / 2 + 3))
    # degree tags next to the lines
    for deg, lab, dx, dy in ((112, "112°", -34, 20), (348, "348°", -86, -6)):
        th = math.radians(deg)
        t_img, _ = render_pencil_text(lab, FONT_PATH, font_size=24, gc=gc, seed=seed + 60 + deg)
        blit_rgba(canvas, t_img, int(cx + (R * 0.58) * math.sin(th) + dx), int(cy - (R * 0.58) * math.cos(th) + dy))


def _render_14a_page(gc: tuple = GRAPHITE_COLOR, plate_override=None):
    """Sheet 14 · Cara A (Front: X < 165 has 0 px). The Five Geodetic Cairns: elevations, survey list and the Servant's
    account of the 1971 quake."""
    from scripts.journal.build_page06_07 import create_handdrawn_divider, draw_desert_path_seal, wrap_text_to_width

    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    X0, W = 220, 1330
    BODY, BODY_LH = 35, 50
    SEC, SEC_LH = 44, 60

    def put(text, x, y, size, seed):
        t_img, _ = render_pencil_text(text, FONT_PATH, font_size=size, gc=gc, seed=seed)
        blit_rgba(canvas, t_img, x, y)
        return t_img.shape[1]

    def put_centered(text, cx, y, size, seed):
        t_img, _ = render_pencil_text(text, FONT_PATH, font_size=size, gc=gc, seed=seed)
        blit_rgba(canvas, t_img, int(cx - t_img.shape[1] / 2), y)

    def paragraph(text, x, y, max_w, size=BODY, lh=BODY_LH, seed=0):
        for k, ln in enumerate(wrap_text_to_width(text, FONT_PATH, size, max_w)):
            put(ln, x, y, size, seed + k * 3)
            y += lh
        return y

    # ------------------------------------------------------------------ header
    put("The Five Geodetic Cairns", X0, 85, 62, 5001)
    blit_rgba(canvas, create_handdrawn_divider(width=W, gc=gc, seed=5003), X0, 172)

    # ------------------------------------------------------------------ I. The Markers of the Order
    y = 228
    put("I. The Markers of the Order", X0, y, SEC, 5010)
    y += SEC_LH
    sec1_text = (
        "Across the open desert, the Order of the Eclipse raised five sacred cairns to anchor their surveys. "
        "Each marker marks a vital turn across the waste, binding the earth to the positions of the sun and stars. "
        "In these field sketches, I have recorded the elevation and character of every cairn, "
        "that their ancient foundations may be recognized across the sands."
    )
    y = paragraph(sec1_text, X0, y, W, seed=5012)
    y += 24

    # ------------------------------------------------------------------ Plate: Five Sacred Cairns Architectural Study
    target_w = 1260
    cairns_asset_path = os.path.join(PROJECT_ROOT, "journal", "page14", "assets", "davinci_five_cairns_clean_alpha.png")
    if os.path.exists(cairns_asset_path):
        c_alpha = cv2.imread(cairns_asset_path, cv2.IMREAD_UNCHANGED)
        if c_alpha is not None:
            cropped = c_alpha[70:650, :]
            h_c, w_c = cropped.shape[:2]
            target_h = int(round(h_c * (target_w / w_c)))
            resized = cv2.resize(cropped, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
            gx0 = X0 + (W - target_w) // 2
            gy0 = y
            blit_rgba(canvas, resized, gx0, gy0)

            # Cairn centers
            scale = target_w / w_c
            cairn_ranges_orig = [(30, 360), (360, 600), (600, 870), (870, 1070), (1070, 1340)]
            alpha_res = resized[:, :, 3]
            c_centers = []
            for i, (x1, x2) in enumerate(cairn_ranges_orig):
                sx1, sx2 = int(x1 * scale), int(x2 * scale)
                segment = alpha_res[:, sx1:sx2]
                xs = np.arange(sx1, sx2)
                weights = segment.sum(axis=0)
                cx = np.average(xs, weights=weights)
                c_centers.append(gx0 + int(round(cx)))

            names = ["Cairn I", "Cairn II", "Cairn III", "Cairn IV", "Cairn V"]
            ground_y_abs = gy0 + int(round((625 - 70) * scale))

            for i, nm in enumerate(names):
                put_centered(nm, c_centers[i], ground_y_abs + 24, 26, 5100 + i)

            y = ground_y_abs + 24 + 56
            plate_h = target_h
    else:
        plate_h = 500
        gy = _draw_cairn_survey_plate(canvas, X0, y, W, plate_h, gc)
        names = ["Cairn I", "Cairn II", "Cairn III", "Cairn IV", "Cairn V"]
        cell = W / 5.0
        for i, nm in enumerate(names):
            put_centered(nm, int(X0 + cell * (i + 0.5)), gy + 24, 26, 5100 + i)
        y = gy + 24 + 56

    # ------------------------------------------------------------------ II. The Words of the Servant
    put("II. The Words of the Servant", X0, y, SEC, 5200)
    y += SEC_LH
    draw_sketchy_line(canvas, (X0, y - 4), (X0 + W, y - 4), gc=gc, alpha_base=170, passes=1, seed=5121)

    sec2_intro = (
        "When I reached the portico of Tower II, the Sanctuary Servant studied the sandstone seal in my palm "
        "and pointed his staff toward the vast basin: «You hold only the first piece of the circuit. The founders "
        "raised five sacred cairns to measure this desert; without all five, these doors remain barred forever.» "
        "Then, tracing the ancient meridian lines upon the flagstones, he revealed the secret of the fallen stones."
    )
    y = paragraph(sec2_intro, X0, y, W, seed=5205)
    y += 34

    bt = y
    BOX_W = 790
    PANEL_W = W - BOX_W - 40
    box_x0 = X0
    px0 = X0 + BOX_W + 40

    quotes = [
        "«Three of the five cairns collapsed in the autumn of 1971, when the great earthquake shook the basin and the red storm swept across the wastes. For twenty-seven years their foundations lay buried under shifting silt and river sand.",
        "In the autumn of 1998, a young traveler walked the dry wash and raised three mounds of dry stone to guide those who might follow, setting a copper benchmark plate beneath the third. He believed he was merely marking his own trail across the sands. He did not know that his hands were rebuilding the sacred stations of the Order upon their ancient bedrock foundations.",
        "A stone remembers the hand that raises it. That is why your fingers knew the rocks in the riverbed; you were returning to what you had already begun. But Cairns IV and V, far in the southern gorges, never fell. Go back to the sands, surveyor: the desert yields its seals only to the one who walks the complete meridian.»",
    ]

    qlines_all = [wrap_text_to_width(q, FONT_PATH, 30, BOX_W - 90) for q in quotes]

    # Balance block height for clean bottom margin around 110 px
    target_end = CANVAS_HEIGHT_PX - 110
    block_h = target_end - bt

    # Draw left plaque
    draw_sketchy_rect(canvas, (box_x0, bt, box_x0 + BOX_W, bt + block_h), gc=gc, alpha_base=200, passes=2, seed=5210)
    draw_sketchy_rect(canvas, (box_x0 + 9, bt + 9, box_x0 + BOX_W - 9, bt + block_h - 9), gc=gc, alpha_base=110, passes=1, seed=5214)
    for (cx_, cy_) in ((box_x0 + 9, bt + 9), (box_x0 + BOX_W - 9, bt + 9), (box_x0 + 9, bt + block_h - 9), (box_x0 + BOX_W - 9, bt + block_h - 9)):
        pts = np.array([(cx_, cy_ - 8), (cx_ + 8, cy_), (cx_, cy_ + 8), (cx_ - 8, cy_)], dtype=np.int32)
        cv2.fillPoly(canvas, [pts], (*gc, 190))

    put("The Memory of the Stones (1971–1998)", box_x0 + 44, bt + 24, 34, 5220)
    draw_sketchy_line(canvas, (box_x0 + 44, bt + 62), (box_x0 + BOX_W - 44, bt + 62), gc=gc, alpha_base=130, passes=1, seed=5221)

    qy = bt + 80
    for q_idx, ql in enumerate(qlines_all):
        for k, ln in enumerate(ql):
            put(ln, box_x0 + 45, qy, 30, 5222 + q_idx * 20 + k * 3)
            qy += 37
        qy += 18

    # Right panel: Bearing Rose & Notes
    PANEL_R = 120
    pcx = px0 + PANEL_W // 2
    put_centered("Cairn III · Topographical Survey", pcx, bt + 20, 31, 5300)
    pcy = bt + 215
    _draw_bearing_panel(canvas, pcx, pcy, PANEL_R, gc)

    legend_items = [
        ("1. The Copper Benchmark (1998):", "Set at 112° E, pointing toward Outer Watchtower VI across the northern sands."),
        ("2. The Bedrock Groove (Ancient):", "Cut into the foundation at 348° NNW, aligned directly with the Sun Monolith."),
        ("3. The Sandstone Labyrinth:", "Cairn III crowns the deep fissures ahead. Trace the true route on Sheet 14B to recover the third seal."),
    ]

    leg_lines = [(t, wrap_text_to_width(d, FONT_PATH, 25, PANEL_W - 20)) for t, d in legend_items]

    ly = pcy + PANEL_R + 36
    for t, d_lines in leg_lines:
        put(t, px0 + 8, ly, 27, 5310 + ly % 97)
        ly += 30
        for d_ln in d_lines:
            put(d_ln, px0 + 16, ly, 25, 5320 + ly % 97)
            ly += 28
        ly += 16

    # Add geodetic note at the bottom of right panel
    draw_sketchy_line(canvas, (px0 + 8, ly + 6), (px0 + PANEL_W - 8, ly + 6), gc=gc, alpha_base=120, passes=1, seed=5335)
    ly += 22
    put("Meridian Alignment:", px0 + 8, ly, 26, 5340)
    ly += 28
    note_lines = wrap_text_to_width("The 348° axis connects directly with the solar line of Tower II. Walk north across the plateau.", FONT_PATH, 24, PANEL_W - 20)
    for n_ln in note_lines:
        put(n_ln, px0 + 16, ly, 24, 5345 + ly % 73)
        ly += 27

    y = bt + block_h

    canvas[:, :165, 3] = 0
    return canvas, plate_h, y


def render_lore_14a_cairns_survey(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 14 · Cara A."""
    canvas, plate_h, end_y = _render_14a_page(gc)
    return canvas


# =========================================================================
# SHEET 14 · CARA B: JUEGO D6 — THE SANDSTONE LABYRINTH & CAIRN III
# =========================================================================

LABYRINTH_SIGIL = "WINDROSE"


def _build_labyrinth(rows, cols, start_c, goal_c, seed=881):
    """Perfect maze (exactly one road between any two cells) with the mouth at the bottom row and Cairn III at the top
    row. Returns (open_edges, road) where road is the unique cell path from the mouth to the Cairn.
    Using seed 881 produces an exceptionally challenging 163-step path with 107 turns and deceptive branches."""
    import random
    from collections import deque
    rnd = random.Random(seed)
    open_edges = set()
    seen = {(rows - 1, start_c)}
    stack = [(rows - 1, start_c)]
    while stack:
        r, c = stack[-1]
        nbrs = [(r + dr, c + dc) for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1))
                if 0 <= r + dr < rows and 0 <= c + dc < cols and (r + dr, c + dc) not in seen]
        if not nbrs:
            stack.pop()
            continue
        nr, nc = rnd.choice(nbrs)
        open_edges.add(frozenset(((r, c), (nr, nc))))
        seen.add((nr, nc))
        stack.append((nr, nc))
    start, goal = (rows - 1, start_c), (0, goal_c)
    prev = {start: None}
    dq = deque([start])
    while dq:
        cur = dq.popleft()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nb = (cur[0] + dr, cur[1] + dc)
            if nb in prev or frozenset((cur, nb)) not in open_edges:
                continue
            prev[nb] = cur
            dq.append(nb)
    road = []
    cur = goal
    while cur is not None:
        road.append(cur)
        cur = prev[cur]
    road.reverse()
    return open_edges, road



def _draw_arch(canvas, cx, cy, letter, gc, seed):
    """Romanesque stone arch with radial voussoirs, central keystone, impost mouldings,
    pier plinths, inner barrel vault shadow, and legible pencil-drawn letter."""
    r_out = 23
    r_in = 15
    y_spring = cy - 4
    y_ground = cy + 22

    # 1. Pier plinths (bases) at ground level
    cv2.line(canvas, (cx - 26, y_ground), (cx - 12, y_ground), (*gc, 210), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx + 12, y_ground), (cx + 26, y_ground), (*gc, 210), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx - 26, y_ground - 3), (cx - 12, y_ground - 3), (*gc, 170), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx + 12, y_ground - 3), (cx + 26, y_ground - 3), (*gc, 170), 1, cv2.LINE_AA)

    # 2. Vertical piers (outer and inner jambs)
    cv2.line(canvas, (cx - r_out, y_spring), (cx - r_out, y_ground - 3), (*gc, 220), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx - r_in, y_spring), (cx - r_in, y_ground - 3), (*gc, 190), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx + r_in, y_spring), (cx + r_in, y_ground - 3), (*gc, 190), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx + r_out, y_spring), (cx + r_out, y_ground - 3), (*gc, 220), 1, cv2.LINE_AA)

    # Subtle tone inside piers
    cv2.rectangle(canvas, (cx - r_out + 1, y_spring), (cx - r_in - 1, y_ground - 3), (*gc, 35), -1)
    cv2.rectangle(canvas, (cx + r_in + 1, y_spring), (cx + r_out - 1, y_ground - 3), (*gc, 45), -1)

    # Horizontal stone courses on piers
    for y_c in range(y_spring + 6, y_ground - 4, 6):
        cv2.line(canvas, (cx - r_out, y_c), (cx - r_in, y_c), (*gc, 140), 1, cv2.LINE_AA)
        cv2.line(canvas, (cx + r_in, y_c), (cx + r_out, y_c), (*gc, 140), 1, cv2.LINE_AA)

    # Right pier shadow hatching (sunlight from NW)
    for y_s in range(y_spring + 2, y_ground - 2, 4):
        cv2.line(canvas, (cx + r_out, y_s), (cx + r_out + 4, y_s + 4), (*gc, 90), 1, cv2.LINE_AA)

    # 3. Impost mouldings at springing line
    cv2.line(canvas, (cx - 26, y_spring), (cx - 13, y_spring), (*gc, 220), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx - 26, y_spring + 2), (cx - 13, y_spring + 2), (*gc, 170), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx + 13, y_spring), (cx + 26, y_spring), (*gc, 220), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx + 13, y_spring + 2), (cx + 26, y_spring + 2), (*gc, 170), 1, cv2.LINE_AA)

    # 4. Semicircular arch curves (inner and outer archivolt)
    _draw_arc(canvas, (cx, y_spring), r_out, 180, 360, gc=gc, alpha=220, seed=seed + 1, passes=2)
    _draw_arc(canvas, (cx, y_spring), r_in, 180, 360, gc=gc, alpha=190, seed=seed + 2, passes=1)
    _draw_arc(canvas, (cx, y_spring), r_out + 2, 180, 360, gc=gc, alpha=130, seed=seed + 3, passes=1)

    # Subtle tone inside voussoir ring
    ring_mask = np.zeros((r_out * 2 + 8, r_out * 2 + 8), dtype=np.uint8)
    cv2.circle(ring_mask, (r_out + 4, r_out + 4), r_out, 255, -1)
    cv2.circle(ring_mask, (r_out + 4, r_out + 4), r_in, 0, -1)
    ring_mask[r_out + 4:, :] = 0
    patch = np.zeros((r_out * 2 + 8, r_out * 2 + 8, 4), dtype=np.uint8)
    patch[ring_mask > 0] = (*gc, 30)
    blit_rgba(canvas, patch, cx - r_out - 4, y_spring - r_out - 4)

    # 5. Radial voussoirs (wedge stones)
    angles = [180 + 20 * i for i in range(1, 9)]
    for a in angles:
        if a in (260, 280):
            continue
        rad = math.radians(a)
        p_in = (int(round(cx + r_in * math.cos(rad))), int(round(y_spring + r_in * math.sin(rad))))
        p_out = (int(round(cx + r_out * math.cos(rad))), int(round(y_spring + r_out * math.sin(rad))))
        cv2.line(canvas, p_in, p_out, (*gc, 160), 1, cv2.LINE_AA)

    # 6. Keystone (central wedge stone at apex)
    k_rad_l = math.radians(261)
    k_rad_r = math.radians(279)
    k_in_l = (int(round(cx + r_in * math.cos(k_rad_l))), int(round(y_spring + r_in * math.sin(k_rad_l))))
    k_in_r = (int(round(cx + r_in * math.cos(k_rad_r))), int(round(y_spring + r_in * math.sin(k_rad_r))))
    k_out_l = (int(round(cx + (r_out + 4) * math.cos(k_rad_l))), int(round(y_spring + (r_out + 4) * math.sin(k_rad_l))))
    k_out_r = (int(round(cx + (r_out + 4) * math.cos(k_rad_r))), int(round(y_spring + (r_out + 4) * math.sin(k_rad_r))))
    cv2.line(canvas, k_in_l, k_out_l, (*gc, 220), 1, cv2.LINE_AA)
    cv2.line(canvas, k_in_r, k_out_r, (*gc, 220), 1, cv2.LINE_AA)
    cv2.line(canvas, k_out_l, k_out_r, (*gc, 220), 1, cv2.LINE_AA)

    # 7. Soft inner arch barrel shadow
    for y_sh in range(cy - 3, cy + 5):
        x_span = int(math.sqrt(max(0, r_in**2 - (y_sh - y_spring)**2)) * 0.75)
        if x_span > 2:
            cv2.line(canvas, (cx - x_span, y_sh), (cx + x_span, y_sh), (*gc, 40), 1, cv2.LINE_AA)

    # 8. Graphite pencil letter centered inside the portal
    l_img, _ = render_pencil_text(letter, FONT_PATH, font_size=28, gc=gc, seed=seed + 5)
    if l_img is not None:
        blit_rgba(canvas, l_img, int(cx - l_img.shape[1] / 2), int(cy - l_img.shape[0] / 2 + 7))


def _draw_labyrinth_plate(canvas, x0, y0, w, rows, cols, cell, open_edges, road, start_c, goal_c, gc=GRAPHITE_COLOR):
    """Engraved Renaissance plan of the Sandstone Labyrinth: massive canyon masonry walls with directional shadow
    hachures, 8 true arches on the unique road spelling WINDROSE in order, deceptive decoy arches, the Southern Mouth
    entrance flanked by carved sandstone obelisks, Cairn III summit sanctuary at the top, Da Vinci west wind curls,
    and a 16-point surveyor compass rose."""
    import random
    top_m = 136
    bot_m = 100
    h = top_m + rows * cell + bot_m

    # Outer plate double frame with Renaissance strapwork
    draw_sketchy_rect(canvas, (x0, y0, x0 + w, y0 + h), gc=gc, alpha_base=215, passes=2, seed=1701)
    draw_sketchy_rect(canvas, (x0 + 8, y0 + 8, x0 + w - 8, y0 + h - 8), gc=gc, alpha_base=120, passes=1, seed=1702)

    # Corner strapwork florets
    for cx_, cy_ in ((x0 + 8, y0 + 8), (x0 + w - 8, y0 + 8), (x0 + 8, y0 + h - 8), (x0 + w - 8, y0 + h - 8)):
        pts = np.array([(cx_, cy_ - 8), (cx_ + 8, cy_), (cx_, cy_ + 8), (cx_ - 8, cy_)], dtype=np.int32)
        cv2.fillPoly(canvas, [pts], (*gc, 190))

    # Graticule tick marks along outer frame edges
    for gx in range(x0 + 40, x0 + w - 30, 60):
        cv2.line(canvas, (gx, y0 + 3), (gx, y0 + 8), (*gc, 140), 1, cv2.LINE_AA)
        cv2.line(canvas, (gx, y0 + h - 8), (gx, y0 + h - 3), (*gc, 140), 1, cv2.LINE_AA)
    for gy in range(y0 + 40, y0 + h - 30, 60):
        cv2.line(canvas, (x0 + 3, gy), (x0 + 8, gy), (*gc, 140), 1, cv2.LINE_AA)
        cv2.line(canvas, (x0 + w - 8, gy), (x0 + w - 3, gy), (*gc, 140), 1, cv2.LINE_AA)

    mx0 = x0 + (w - cols * cell) // 2
    my0 = y0 + top_m
    mx1, my1 = mx0 + cols * cell, my0 + rows * cell


    # Masonry walls: 8px thickness (hw = 4)
    w_th = 8
    hw = 4

    def is_open(a, b):
        return frozenset((a, b)) in open_edges

    pillars = set()

    # 1. Internal walls
    for r in range(rows):
        for c in range(cols):
            x, y = mx0 + c * cell, my0 + r * cell

            # Vertical wall between (r, c) and (r, c+1)
            if c < cols - 1 and not is_open((r, c), (r, c + 1)):
                wx = x + cell
                cv2.rectangle(canvas, (wx - hw, y), (wx + hw, y + cell), (*gc, 35), -1)
                cv2.line(canvas, (wx - hw, y), (wx - hw, y + cell), (*gc, 210), 1, cv2.LINE_AA)
                cv2.line(canvas, (wx + hw, y), (wx + hw, y + cell), (*gc, 210), 1, cv2.LINE_AA)
                for jy in range(y + 8, y + cell - 4, 12):
                    cv2.line(canvas, (wx - hw, jy), (wx + hw, jy), (*gc, 130), 1, cv2.LINE_AA)
                for sy in range(y + 3, y + cell - 2, 6):
                    cv2.line(canvas, (wx + hw, sy), (wx + hw + 5, sy + 3), (*gc, 80), 1, cv2.LINE_AA)
                pillars.update({(c + 1, r), (c + 1, r + 1)})

            # Horizontal wall between (r, c) and (r+1, c)
            if r < rows - 1 and not is_open((r, c), (r + 1, c)):
                wy = y + cell
                cv2.rectangle(canvas, (x, wy - hw), (x + cell, wy + hw), (*gc, 35), -1)
                cv2.line(canvas, (x, wy - hw), (x + cell, wy - hw), (*gc, 210), 1, cv2.LINE_AA)
                cv2.line(canvas, (x, wy + hw), (x + cell, wy + hw), (*gc, 210), 1, cv2.LINE_AA)
                for jx in range(x + 8, x + cell - 4, 12):
                    cv2.line(canvas, (jx, wy - hw), (jx, wy + hw), (*gc, 130), 1, cv2.LINE_AA)
                for sx in range(x + 3, x + cell - 2, 6):
                    cv2.line(canvas, (sx, wy + hw), (sx + 3, wy + hw + 5), (*gc, 80), 1, cv2.LINE_AA)
                pillars.update({(c, r + 1), (c + 1, r + 1)})

    # 2. Outer perimeter boundary walls
    # Top wall (opening at goal_c = 5)
    for c in range(cols):
        wx = mx0 + c * cell
        if c != goal_c:
            cv2.rectangle(canvas, (wx, my0 - hw), (wx + cell, my0 + hw), (*gc, 45), -1)
            cv2.line(canvas, (wx, my0 - hw), (wx + cell, my0 - hw), (*gc, 225), 1, cv2.LINE_AA)
            cv2.line(canvas, (wx, my0 + hw), (wx + cell, my0 + hw), (*gc, 225), 1, cv2.LINE_AA)
            for jx in range(wx + 8, wx + cell - 4, 12):
                cv2.line(canvas, (jx, my0 - hw), (jx, my0 + hw), (*gc, 140), 1, cv2.LINE_AA)
            for sx in range(wx + 3, wx + cell - 2, 6):
                cv2.line(canvas, (sx, my0 + hw), (sx + 3, my0 + hw + 5), (*gc, 80), 1, cv2.LINE_AA)

    # Bottom wall (opening at start_c = 10)
    for c in range(cols):
        wx = mx0 + c * cell
        if c != start_c:
            cv2.rectangle(canvas, (wx, my1 - hw), (wx + cell, my1 + hw), (*gc, 45), -1)
            cv2.line(canvas, (wx, my1 - hw), (wx + cell, my1 - hw), (*gc, 225), 1, cv2.LINE_AA)
            cv2.line(canvas, (wx, my1 + hw), (wx + cell, my1 + hw), (*gc, 225), 1, cv2.LINE_AA)
            for jx in range(wx + 8, wx + cell - 4, 12):
                cv2.line(canvas, (jx, my1 - hw), (jx, my1 + hw), (*gc, 140), 1, cv2.LINE_AA)
            for sx in range(wx + 3, wx + cell - 2, 6):
                cv2.line(canvas, (sx, my1 + hw), (sx + 3, my1 + hw + 5), (*gc, 80), 1, cv2.LINE_AA)

    # Left and Right perimeter walls
    for r in range(rows):
        wy = my0 + r * cell
        # Left wall
        cv2.rectangle(canvas, (mx0 - hw, wy), (mx0 + hw, wy + cell), (*gc, 45), -1)
        cv2.line(canvas, (mx0 - hw, wy), (mx0 - hw, wy + cell), (*gc, 225), 1, cv2.LINE_AA)
        cv2.line(canvas, (mx0 + hw, wy), (mx0 + hw, wy + cell), (*gc, 225), 1, cv2.LINE_AA)
        for jy in range(wy + 8, wy + cell - 4, 12):
            cv2.line(canvas, (mx0 - hw, jy), (mx0 + hw, jy), (*gc, 140), 1, cv2.LINE_AA)
        for sy in range(wy + 3, wy + cell - 2, 6):
            cv2.line(canvas, (mx0 + hw, sy), (mx0 + hw + 5, sy + 3), (*gc, 80), 1, cv2.LINE_AA)
        # Right wall
        cv2.rectangle(canvas, (mx1 - hw, wy), (mx1 + hw, wy + cell), (*gc, 45), -1)
        cv2.line(canvas, (mx1 - hw, wy), (mx1 - hw, wy + cell), (*gc, 225), 1, cv2.LINE_AA)
        cv2.line(canvas, (mx1 + hw, wy), (mx1 + hw, wy + cell), (*gc, 225), 1, cv2.LINE_AA)
        for jy in range(wy + 8, wy + cell - 4, 12):
            cv2.line(canvas, (mx1 - hw, jy), (mx1 + hw, jy), (*gc, 140), 1, cv2.LINE_AA)

    # 3. Dressed square ashlar corner blocks at junctions
    for (pc, pr_) in pillars:
        px, py = mx0 + pc * cell, my0 + pr_ * cell
        if 0 < pc < cols and 0 < pr_ < rows:
            cv2.rectangle(canvas, (px - 5, py - 5), (px + 5, py + 5), (0, 0, 0, 0), -1)
            cv2.rectangle(canvas, (px - 5, py - 5), (px + 5, py + 5), (*gc, 60), -1)
            cv2.rectangle(canvas, (px - 5, py - 5), (px + 5, py + 5), (*gc, 220), 1, cv2.LINE_AA)
            cv2.line(canvas, (px - 5, py - 5), (px + 5, py + 5), (*gc, 120), 1, cv2.LINE_AA)
            cv2.circle(canvas, (px, py), 1, (*gc, 210), -1)

    # 4. Arches: 8 true arches on the road spelling WINDROSE, 12 decoys off-road
    L = len(road)
    road_idx = [int(round((i + 1) * L / (len(LABYRINTH_SIGIL) + 1))) for i in range(len(LABYRINTH_SIGIL))]
    arch_cells = {road[i]: LABYRINTH_SIGIL[n] for n, i in enumerate(road_idx)}

    # Decoy arches in dead ends
    off = [(r, c) for r in range(rows) for c in range(cols) if (r, c) not in road and not (r == rows - 1 and c == start_c) and not (r == 0 and c == goal_c)]
    rnd = random.Random(123)
    rnd.shuffle(off)
    decoys = []
    for cellpos in off:
        if len(decoys) >= 12:
            break
        if all(abs(cellpos[0] - d[0]) + abs(cellpos[1] - d[1]) >= 2 for d in decoys) and all(abs(cellpos[0] - a[0]) + abs(cellpos[1] - a[1]) >= 1 for a in arch_cells):
            decoys.append(cellpos)

    decoy_letters = ['A', 'C', 'K', 'M', 'P', 'T', 'V', 'G', 'L', 'F', 'H', 'U']
    for i, d in enumerate(decoys):
        arch_cells[d] = decoy_letters[i % len(decoy_letters)]

    # Draw all arches
    for (r, c), ch in arch_cells.items():
        acx = mx0 + c * cell + cell // 2
        acy = my0 + r * cell + cell // 2
        _draw_arch(canvas, acx, acy, ch, gc=gc, seed=3000 + r * 40 + c)

    # -------------------------------------------------------------------------
    # ENTRANCE: THE SOUTHERN MOUTH (CANYON PORTAL)
    # -------------------------------------------------------------------------
    mcx = mx0 + start_c * cell + cell // 2
    pylon_left_x = mx0 + start_c * cell
    pylon_right_x = mx0 + (start_c + 1) * cell

    # Clear threshold opening
    cv2.rectangle(canvas, (pylon_left_x + hw + 1, my1 - hw - 2), (pylon_right_x - hw - 1, my1 + hw + 2), (0, 0, 0, 0), -1)

    # Twin carved sandstone pylons / obelisks
    def draw_pylon(px, py_base, seed_p):
        pw, ph = 20, 36
        cv2.rectangle(canvas, (px - 12, py_base - 4), (px + 12, py_base + 6), (0, 0, 0, 0), -1)
        cv2.rectangle(canvas, (px - 12, py_base - 4), (px + 12, py_base + 6), (*gc, 45), -1)
        cv2.rectangle(canvas, (px - 12, py_base - 4), (px + 12, py_base + 6), (*gc, 220), 1, cv2.LINE_AA)
        cv2.line(canvas, (px - 14, py_base + 6), (px + 14, py_base + 6), (*gc, 220), 1, cv2.LINE_AA)
        cv2.rectangle(canvas, (px - 9, py_base + 6), (px + 9, py_base + ph), (0, 0, 0, 0), -1)
        cv2.rectangle(canvas, (px - 9, py_base + 6), (px + 9, py_base + ph), (*gc, 35), -1)
        cv2.rectangle(canvas, (px - 9, py_base + 6), (px + 9, py_base + ph), (*gc, 215), 1, cv2.LINE_AA)
        for py_c in range(py_base + 12, py_base + ph - 2, 7):
            cv2.line(canvas, (px - 9, py_c), (px + 9, py_c), (*gc, 130), 1, cv2.LINE_AA)
        cap_pts = np.array([(px - 10, py_base + ph), (px + 10, py_base + ph), (px, py_base + ph + 10)], dtype=np.int32)
        cv2.fillPoly(canvas, [cap_pts], (0, 0, 0, 0))
        cv2.fillPoly(canvas, [cap_pts], (*gc, 40))
        cv2.polylines(canvas, [cap_pts], True, (*gc, 215), 1, cv2.LINE_AA)
        cv2.circle(canvas, (px, py_base + ph + 12), 2, (*gc, 220), -1)

    draw_pylon(pylon_left_x, my1, 3950)
    draw_pylon(pylon_right_x, my1, 3951)

    # Stepped flagstone approach paving leading into the mouth
    for step_i, step_w in enumerate((48, 56, 64)):
        sy = my1 + 6 + step_i * 6
        cv2.line(canvas, (mcx - step_w // 2, sy), (mcx + step_w // 2, sy), (*gc, 175 - step_i * 20), 1, cv2.LINE_AA)
        for sx in range(mcx - step_w // 2 + 8, mcx + step_w // 2, 12):
            cv2.line(canvas, (sx, sy), (sx, sy + 4), (*gc, 120), 1, cv2.LINE_AA)

    # Directional entrance arrow pointing inward
    cv2.polylines(canvas, [np.array([(mcx, my1 + 2), (mcx - 10, my1 + 20), (mcx + 10, my1 + 20)], dtype=np.int32)], True, (*gc, 220), 1, cv2.LINE_AA)
    cv2.fillPoly(canvas, [np.array([(mcx, my1 + 2), (mcx + 10, my1 + 20), (mcx, my1 + 16)], dtype=np.int32)], (*gc, 210))

    # Entrance banner framed neatly above bottom plate border
    t_ent, _ = render_pencil_text("« THE SOUTHERN MOUTH · ENTRANCE »", FONT_PATH, font_size=27, gc=gc, seed=3911)
    if t_ent is not None:
        blit_rgba(canvas, t_ent, int(mcx - t_ent.shape[1] / 2), my1 + 28)
    t_sub, _ = render_pencil_text("Enter here — follow the true canyon road north", FONT_PATH, font_size=20, gc=gc, seed=3912)
    if t_sub is not None:
        blit_rgba(canvas, t_sub, int(mcx - t_sub.shape[1] / 2), my1 + 58)

    # -------------------------------------------------------------------------
    # EXIT / GOAL: CAIRN III & THE THIRD SEAL
    # -------------------------------------------------------------------------
    gcx = mx0 + goal_c * cell + cell // 2

    # Clear top opening into terrace
    cv2.rectangle(canvas, (gcx - cell // 2 + hw + 1, my0 - hw - 2), (gcx + cell // 2 - hw - 1, my0 + hw + 2), (0, 0, 0, 0), -1)

    # Semicircular stone sanctuary terrace rising above row 0
    t_rad = 56
    _clear_polygon = lambda can, pts: cv2.fillPoly(can, [np.array(pts, dtype=np.int32)], (0, 0, 0, 0))
    _clear_polygon(canvas, [(gcx - t_rad - 8, my0 + 2), (gcx + t_rad + 8, my0 + 2), (gcx + t_rad + 8, my0 - t_rad - 10), (gcx - t_rad - 8, my0 - t_rad - 10)])

    # Curved terrace balustrade
    _draw_arc(canvas, (gcx, my0), t_rad, 180, 360, gc=gc, alpha=220, seed=3890, passes=2)
    _draw_arc(canvas, (gcx, my0), t_rad + 6, 180, 360, gc=gc, alpha=150, seed=3891, passes=1)
    for a in range(190, 360, 18):
        rad = math.radians(a)
        p1 = (int(gcx + t_rad * math.cos(rad)), int(my0 + t_rad * math.sin(rad)))
        p2 = (int(gcx + (t_rad + 6) * math.cos(rad)), int(my0 + (t_rad + 6) * math.sin(rad)))
        cv2.line(canvas, p1, p2, (*gc, 150), 1, cv2.LINE_AA)

    # Terrace floor paving
    for r_t in range(12, t_rad - 4, 12):
        _draw_arc(canvas, (gcx, my0), r_t, 185, 355, gc=gc, alpha=85, seed=3895 + r_t, passes=1)

    # Cairn III elevation (pyramid of dry stones with copper plate)
    cairn_h = 60
    _draw_cairn_elevation(canvas, 2, gcx, my0 - 2, cairn_h, gc, 3900)


    # Goal Banner cleanly positioned in top margin
    t_goal, _ = render_pencil_text("« CAIRN III · THE THIRD SEAL (GOAL) »", FONT_PATH, font_size=27, gc=gc, seed=3910)
    if t_goal is not None:
        blit_rgba(canvas, t_goal, int(gcx - t_goal.shape[1] / 2), y0 + 16)
    t_gdesc, _ = render_pencil_text("Summit sanctuary & copper benchmark plate", FONT_PATH, font_size=19, gc=gc, seed=3913)
    if t_gdesc is not None:
        blit_rgba(canvas, t_gdesc, int(gcx - t_gdesc.shape[1] / 2), y0 + 44)


    return h


def _render_14b_page(gc: tuple = GRAPHITE_COLOR):
    """Sheet 14 · Cara B (Back: X > 1583 has 0 px). Game D6: follow the only road through the Sandstone Labyrinth to Cairn III."""
    from scripts.journal.build_page06_07 import create_handdrawn_divider, wrap_text_to_width

    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    X0, W = 180, 1360
    BODY, BODY_LH = 35, 50
    SEC, SEC_LH = 44, 60
    CELL, COLS = 72, 17
    START_C, GOAL_C = 10, 5

    def put(text, x, y, size, seed):
        t_img, _ = render_pencil_text(text, FONT_PATH, font_size=size, gc=gc, seed=seed)
        if t_img is not None:
            blit_rgba(canvas, t_img, x, y)
            return t_img.shape[1]
        return 0

    def paragraph(text, x, y, max_w, size=BODY, lh=BODY_LH, seed=0):
        for k, ln in enumerate(wrap_text_to_width(text, FONT_PATH, size, max_w)):
            put(ln, x, y, size, seed + k * 3)
            y += lh
        return y

    # ------------------------------------------------------------------ header
    put("The Sandstone Labyrinth & Cairn III", X0, 85, 62, 6001)
    blit_rgba(canvas, create_handdrawn_divider(width=W, gc=gc, seed=6003), X0, 170)

    # ------------------------------------------------------------------ I. The Arches of the West Wind
    y = 222
    put("I. The Arches of the West Wind", X0, y, SEC, 6010)
    y += SEC_LH
    sec1_text = (
        "North of the Sun Monolith, the open desert rises into a wild plateau of wind-carved sandstone. "
        "Here, centuries of scouring gales have sculpted a labyrinth of towering pillars, narrow fissures, and natural arches. "
        "Deep within this maze stands Cairn III, guarding the third seal of the Order beneath its copper benchmark plate. "
        "The ancient wagon tracks have long vanished beneath shifting sand, but the bedrock itself remembers the way."
    )
    y = paragraph(sec1_text, X0, y, W, size=35, lh=46, seed=6012)
    y += 32

    # ------------------------------------------------------------------ plate: the labyrinth
    rows = 12
    open_edges, road = _build_labyrinth(rows, COLS, START_C, GOAL_C, seed=881)
    plate_h = _draw_labyrinth_plate(canvas, X0, y, W, rows, COLS, CELL, open_edges, road, START_C, GOAL_C, gc)
    y += plate_h + 46

    # ------------------------------------------------------------------ II. The Tablet at the Mouth
    put("II. The Tablet at the Mouth", X0, y, SEC, 6030)
    y += SEC_LH
    sec2_intro = (
        "At the entrance to the gorge, half-buried in silt, stands a weather-worn sandstone stele "
        "left by the early surveyors. Before stepping between the towering walls, I copied its inscription into my log:"
    )
    y = paragraph(sec2_intro, X0, y, W, size=33, lh=44, seed=6035)
    y += 20

    tablet = (
        "Only one continuous road cuts through the labyrinth from this entrance to the summit of Cairn III. "
        "Eight stone arches stand upon that true path, each bearing a single letter. Follow the way step by step, "
        "reading the arches in the exact order you pass beneath them. Heed not the shadows of the side fissures: "
        "the arches that lie off the path are false."
    )
    tab_lines = wrap_text_to_width(tablet, FONT_PATH, 33, W - 140)
    box_h = 32 + len(tab_lines) * 44 + 24
    bt = y
    draw_sketchy_rect(canvas, (X0, bt, X0 + W, bt + box_h), gc=gc, alpha_base=200, passes=2, seed=6040)
    draw_sketchy_rect(canvas, (X0 + 9, bt + 9, X0 + W - 9, bt + box_h - 9), gc=gc, alpha_base=110, passes=1, seed=6044)
    for (cx_, cy_) in ((X0 + 9, bt + 9), (X0 + W - 9, bt + 9), (X0 + 9, bt + box_h - 9), (X0 + W - 9, bt + box_h - 9)):
        pts = np.array([(cx_, cy_ - 8), (cx_ + 8, cy_), (cx_, cy_ + 8), (cx_ - 8, cy_)], dtype=np.int32)
        cv2.fillPoly(canvas, [pts], (*gc, 190))
    qy = bt + 32
    for k, ln in enumerate(tab_lines):
        put(("«" if k == 0 else "") + ln + ("»" if k == len(tab_lines) - 1 else ""), X0 + 56, qy, 33, 6050 + k * 3)
        qy += 44
    y = bt + box_h + 46

    # ------------------------------------------------------------------ answer bar
    put("The Sigil of Cairn III:", X0, y, 36, 6100)
    y += 52
    box_w, gap = 140, 20
    for k in range(len(LABYRINTH_SIGIL)):
        bx = X0 + k * (box_w + gap)
        draw_sketchy_rect(canvas, (bx, y, bx + box_w, y + 84), gc=gc, alpha_base=200, passes=2, seed=6110 + k * 5)
        draw_sketchy_rect(canvas, (bx + 6, y + 6, bx + box_w - 6, y + 78), gc=gc, alpha_base=90, passes=1, seed=6111 + k * 5)
        n_img, _ = render_pencil_text(str(k + 1), FONT_PATH, font_size=23, gc=gc, seed=6140 + k)
        blit_rgba(canvas, n_img, bx + 12, y + 8)
    y += 84
    put("Speak this eight-letter name at Cairn III to unlock its copper plate and claim the third seal.", X0, y + 14, 30, 6150)
    y += 48

    canvas[:, 1583:, 3] = 0
    return canvas, road, y


def render_game_d6_sandstone_labyrinth(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 14 · Cara B."""
    canvas, _road, _end_y = _render_14b_page(gc)
    return canvas


# =========================================================================
# SHEET 15 · CARA A: JUEGO D7 — CAIRN IV (SENTRY OF THE CANYON)
# =========================================================================

# Game D7 data: rings are paces from a pillar (25 to 60). An echo of n beats comes from a crack 5 x n paces away.
ECHO_SIGIL = "RESOUND"
ECHO_RINGS = (25, 30, 35, 40, 45, 50, 55, 60)
ECHO_LEFT = {25: "T", 30: "S", 35: "A", 40: "M", 45: "U", 50: "L", 55: "E", 60: "C"}
ECHO_RIGHT = {25: "N", 30: "B", 35: "G", 40: "R", 45: "P", 50: "D", 55: "H", 60: "O"}
ECHO_LEDGER = (("Right", 8), ("Left", 11), ("Left", 6), ("Right", 12), ("Left", 9), ("Right", 5), ("Right", 10))


def _echo_letter(side, beats):
    return (ECHO_LEFT if side == "Left" else ECHO_RIGHT)[5 * beats]


def _draw_canyon_panorama(canvas, x0, y0, w, h, gc=GRAPHITE_COLOR):
    """Engraved plate: the mouth of the Whispering Chasm seen from the south in perspective. The twin pillars of
    Cairn IV stand in front, the cliffs run away to the far gate and the Sentinel Mesa with its natural bridge rises beyond."""
    asset_path = os.path.join(PROJECT_ROOT, "journal", "page15", "assets", "davinci_cairn_iv_panorama_clean_alpha.png")
    if os.path.exists(asset_path):
        raw_img = cv2.imread(asset_path, cv2.IMREAD_UNCHANGED)
        if raw_img is not None:
            # Crop rows 70 to 520 (keeping setting sun, Sentinel Mesa with natural bridge, Cairn IV pillars, acoustic waves, plinths)
            crop = raw_img[70:520, :]
            draw_sketchy_rect(canvas, (x0, y0, x0 + w, y0 + h), gc=gc, alpha_base=210, passes=2, seed=1510)
            draw_sketchy_rect(canvas, (x0 + 8, y0 + 8, x0 + w - 8, y0 + h - 8), gc=gc, alpha_base=120, passes=1, seed=1514)
            resized = cv2.resize(crop, (w - 24, h - 24), interpolation=cv2.INTER_LANCZOS4)
            blit_rgba(canvas, resized, x0 + 12, y0 + 12)
            return y0 + h

    rng = np.random.default_rng(1501)
    draw_sketchy_rect(canvas, (x0, y0, x0 + w, y0 + h), gc=gc, alpha_base=200, passes=2, seed=1510)
    draw_sketchy_rect(canvas, (x0 + 8, y0 + 8, x0 + w - 8, y0 + h - 8), gc=gc, alpha_base=110, passes=1, seed=1514)
    vx = x0 + w // 2
    vy = y0 + int(0.47 * h)
    gw = 300
    ynt, ynb = y0 + 16, y0 + h - 30
    yft, yfb = vy - int(0.20 * h), vy + 22
    xl, xr = x0 + 16, x0 + w - 16

    # sky: sun, thin clouds, falcons
    sun = (vx - 150, y0 + 74)
    draw_sketchy_circle(canvas, sun, 32, gc=gc, alpha_base=190, passes=2, seed=1520, num_pts=36)
    draw_sketchy_circle(canvas, sun, 23, gc=gc, alpha_base=110, passes=1, seed=1521, num_pts=30)
    for k in range(28):
        th = math.radians(k * 360 / 28)
        r2 = 60 if k % 2 == 0 else 50
        cv2.line(canvas, (int(sun[0] + 44 * math.cos(th)), int(sun[1] + 44 * math.sin(th))), (int(sun[0] + r2 * math.cos(th)), int(sun[1] + r2 * math.sin(th))), (*gc, 105), 1, cv2.LINE_AA)
    for k in range(12):
        yy = y0 + 26 + k * 9
        xx = vx - 120 + int(rng.integers(0, 320))
        draw_sketchy_line(canvas, (xx, yy), (xx + int(rng.integers(60, 170)), yy), gc=gc, alpha_base=34, passes=1, seed=1530 + k)
    for fx, fy in ((vx + 190, y0 + 52), (vx + 232, y0 + 74)):
        for side in (-1, 1):
            _draw_arc(canvas, (int(fx + side * 15), int(fy + 5)), 17, 200 if side < 0 else 280, 250 if side < 0 else 330, gc=gc, alpha=170, seed=1540 + side, passes=1)

    # the Sentinel Mesa with its natural bridge, far away
    top = vy - int(0.20 * h) - 24
    mesa = [(vx - 330, vy + 14), (vx - 285, top + 30), (vx - 230, top), (vx + 240, top), (vx + 300, top + 28), (vx + 340, vy + 14)]
    _clear_polygon(canvas, mesa)
    cv2.polylines(canvas, [np.array(mesa, dtype=np.int32)], True, (*gc, 170), 1, cv2.LINE_AA)
    _hatch_polygon(canvas, [(vx + 70, top), (vx + 240, top), (vx + 300, top + 28), (vx + 340, vy + 14), (vx + 70, vy + 14)], step=4, angle=78, gc=gc, alpha=62, seed=1550)
    for k in range(5):
        yy = top + 24 + k * ((vy + 14 - top - 24) // 5)
        cv2.line(canvas, (vx - 300 + k * 6, yy), (vx + 320 - k * 6, yy), (*gc, 55), 1, cv2.LINE_AA)
    _draw_arc(canvas, (vx - 210, top + 70), 58, 180, 360, gc=gc, alpha=190, seed=1552, passes=2)
    _draw_arc(canvas, (vx - 210, top + 70), 45, 180, 360, gc=gc, alpha=120, seed=1553, passes=1)
    cv2.line(canvas, (vx - 268, top + 70), (vx - 268, vy + 14), (*gc, 150), 1, cv2.LINE_AA)
    cv2.line(canvas, (vx - 152, top + 70), (vx - 152, vy + 14), (*gc, 150), 1, cv2.LINE_AA)

    # ground: converging furrows of the wash
    for fxp in range(-9, 10):
        xn = vx + fxp * (w // 18)
        xf = vx + fxp * 20
        if xl + 6 < xn < xr - 6:
            draw_sketchy_line(canvas, (xn, ynb), (xf, yfb + 4), gc=gc, alpha_base=60, passes=1, seed=1560 + fxp + 9)
    for k in range(5):
        yy = yfb + int((ynb - yfb) * (k + 1) ** 2 / 36.0)
        cv2.line(canvas, (xl + 20, yy), (xr - 20, yy), (*gc, 40), 1, cv2.LINE_AA)

    # cliff faces in perspective (left lit, right in shade) with strata
    def face(near_x, far_x, shade_strength, seed):
        quad = [(near_x, ynt), (far_x, yft), (far_x, yfb), (near_x, ynb)]
        _clear_polygon(canvas, quad)
        cv2.polylines(canvas, [np.array(quad, dtype=np.int32)], True, (*gc, 215), 1, cv2.LINE_AA)
        _hatch_polygon(canvas, quad, step=6, angle=82, gc=gc, alpha=shade_strength, seed=seed)
        for k in range(1, 11):
            t = k / 11.0
            p1 = (near_x, int(ynt + (ynb - ynt) * t))
            p2 = (far_x, int(yft + (yfb - yft) * t))
            draw_sketchy_line(canvas, p1, p2, gc=gc, alpha_base=80, passes=1, seed=seed + k)
        # cracks, spaced in perspective
        for k, u in enumerate((0.10, 0.28, 0.46, 0.64, 0.80)):
            s = (1 - 1 / (1 + 3 * u)) / 0.75
            x = near_x + (far_x - near_x) * s
            ya = (ynt + (yft - ynt) * s) + 0.18 * ((ynb + (yfb - ynb) * s) - (ynt + (yft - ynt) * s))
            yb = (ynt + (yft - ynt) * s) + 0.78 * ((ynb + (yfb - ynb) * s) - (ynt + (yft - ynt) * s))
            kk = 1 - 0.65 * s
            pts = []
            n = 8
            for i in range(n + 1):
                pts.append((int(x + (10 * kk if i % 2 else -10 * kk) * (1 if k % 2 else -1)), int(ya + (yb - ya) * i / n)))
            cv2.polylines(canvas, [np.array(pts, dtype=np.int32)], False, (*gc, 190), 1, cv2.LINE_AA)
    face(xl, vx - gw, 34, 1600)
    face(xr, vx + gw, 70, 1700)

    # twin pillars in front with sound waves
    gy = ynb - 22
    H = int(min(240, h - 110))
    _draw_cairn_elevation(canvas, 3, vx, gy, H, gc, 1800)
    s_ = H / 250.0
    for dx, a0, a1 in ((-64 * s_ - 38 * s_, 130, 230), (64 * s_ + 38 * s_, 310, 410)):
        for r in (26, 48, 70):
            _draw_arc(canvas, (int(vx + dx), int(gy - H * 0.5)), r, a0, a1, gc=gc, alpha=120, seed=1810 + r, passes=1)
    for lab, dx in (("Left pillar", -64 * s_), ("Right pillar", 64 * s_)):
        t_img, _ = render_pencil_text(lab, FONT_PATH, font_size=24, gc=gc, seed=1820 + int(dx))
        blit_rgba(canvas, t_img, int(vx + dx - t_img.shape[1] / 2), gy + 8)
    return gy


def _draw_echo_plan(canvas, x0, y0, w, h, gc=GRAPHITE_COLOR):
    """Plan of the canyon mouth from above. Each pillar sings toward its own wall; rings count paces from the pillar
    (25 to 60) and every ring meets a crack carrying a letter."""
    PPP = 7.0
    D = 20 * PPP                                  # distance from a pillar to its own wall
    draw_sketchy_rect(canvas, (x0, y0, x0 + w, y0 + h), gc=gc, alpha_base=200, passes=2, seed=1901)
    draw_sketchy_rect(canvas, (x0 + 8, y0 + 8, x0 + w - 8, y0 + h - 8), gc=gc, alpha_base=110, passes=1, seed=1902)
    cx = x0 + w // 2
    py = y0 + 478
    pxl, pxr = cx - 40, cx + 40
    wl, wr = pxl - D, pxr + D
    top_y = int(py - math.sqrt(60 ** 2 - 20 ** 2) * PPP - 26)
    rng = np.random.default_rng(1903)

    # rock on both sides of the canyon
    for xs, sgn in ((wl, -1), (wr, 1)):
        band = [(xs, top_y), (xs + sgn * 98, top_y), (xs + sgn * 98, py + 34), (xs, py + 34)]
        _hatch_polygon(canvas, band, step=5, angle=58, gc=gc, alpha=52, seed=1910 + sgn)
        pts = []
        for i in range(0, int(py + 34 - top_y) + 1, 14):
            pts.append((int(xs + rng.integers(-4, 5)), int(top_y + i)))
        cv2.polylines(canvas, [np.array(pts, dtype=np.int32)], False, (*gc, 215), 1, cv2.LINE_AA)
        cv2.polylines(canvas, [np.array([(p[0] + sgn * 3, p[1]) for p in pts], dtype=np.int32)], False, (*gc, 120), 1, cv2.LINE_AA)
    # floor stipple
    for k in range(70):
        gx = int(rng.integers(wl + 12, wr - 12))
        gyy = int(rng.integers(top_y + 10, py + 28))
        cv2.circle(canvas, (gx, gyy), 1, (*gc, int(rng.integers(40, 90))), -1, cv2.LINE_AA)

    # rings of paces (each pillar draws only toward its own wall) and the cracks with their letters
    for r in ECHO_RINGS:
        R = r * PPP
        th_w = 180 + math.degrees(math.acos(D / R))
        th_m = 360 - math.degrees(math.acos(40 / R))
        _draw_arc(canvas, (pxl, py), int(R), th_w, th_m, gc=gc, alpha=150, seed=1920 + r, passes=1)
        th_m2 = 180 + math.degrees(math.acos(40 / R))
        th_w2 = 360 - math.degrees(math.acos(D / R))
        _draw_arc(canvas, (pxr, py), int(R), th_m2, th_w2, gc=gc, alpha=150, seed=1940 + r, passes=1)
        ywall = int(py - math.sqrt(r * r - 400) * PPP)
        for xs, sgn, letter in ((wl, -1, ECHO_LEFT[r]), (wr, 1, ECHO_RIGHT[r])):
            # crack going into the rock and the carved tablet
            pts = [(xs, ywall), (xs + sgn * 8, ywall - 5), (xs + sgn * 15, ywall + 3), (xs + sgn * 24, ywall - 3)]
            cv2.polylines(canvas, [np.array(pts, dtype=np.int32)], False, (*gc, 205), 1, cv2.LINE_AA)
            tx = xs + sgn * 52
            _clear_polygon(canvas, [(tx - 17, ywall - 17), (tx + 17, ywall - 17), (tx + 17, ywall + 17), (tx - 17, ywall + 17)])
            draw_sketchy_rect(canvas, (tx - 17, ywall - 17, tx + 17, ywall + 17), gc=gc, alpha_base=210, passes=2, seed=1960 + r + sgn)
            l_img, _ = render_pencil_text(letter, FONT_PATH, font_size=26, gc=gc, seed=1980 + r + sgn)
            blit_rgba(canvas, l_img, int(tx - l_img.shape[1] / 2), int(ywall - l_img.shape[0] / 2 + 4))
        ymid = int(py - math.sqrt(R * R - 40 * 40))
        _clear_polygon(canvas, [(cx - 20, ymid - 12), (cx + 20, ymid - 12), (cx + 20, ymid + 12), (cx - 20, ymid + 12)])
        v_img, _ = render_pencil_text(str(r), FONT_PATH, font_size=22, gc=gc, seed=2000 + r)
        blit_rgba(canvas, v_img, int(cx - v_img.shape[1] / 2), ymid - 14)

    # the twin pillars seen from above
    for px_, lab in ((pxl, "Left"), (pxr, "Right")):
        draw_sketchy_rect(canvas, (px_ - 18, py - 18, px_ + 18, py + 18), gc=gc, alpha_base=215, passes=2, seed=2020 + px_ % 7)
        draw_sketchy_rect(canvas, (px_ - 10, py - 10, px_ + 10, py + 10), gc=gc, alpha_base=130, passes=1, seed=2030 + px_ % 7)
        cv2.circle(canvas, (px_, py), 3, (*gc, 220), -1, cv2.LINE_AA)
        t_img, _ = render_pencil_text(lab, FONT_PATH, font_size=24, gc=gc, seed=2040 + px_ % 11)
        blit_rgba(canvas, t_img, int(px_ - t_img.shape[1] / 2), py + 26)
    t_img, _ = render_pencil_text("Rings count paces from the pillars", FONT_PATH, font_size=24, gc=gc, seed=2050)
    blit_rgba(canvas, t_img, int(cx - t_img.shape[1] / 2), y0 + 18)
    # north arrow below the right wall
    nx, ny = x0 + w - 46, py + 54
    cv2.polylines(canvas, [np.array([(nx, ny - 28), (nx - 10, ny), (nx + 10, ny)], dtype=np.int32)], True, (*gc, 210), 1, cv2.LINE_AA)
    cv2.fillPoly(canvas, [np.array([(nx, ny - 28), (nx + 10, ny), (nx, ny - 6)], dtype=np.int32)], (*gc, 200))
    t_img, _ = render_pencil_text("N", FONT_PATH, font_size=24, gc=gc, seed=2051)
    blit_rgba(canvas, t_img, nx - t_img.shape[1] // 2, ny + 2)
    # the pillars sing toward their own wall: small wave arcs
    for px_, a0, a1 in ((pxl, 195, 255), (pxr, 285, 345)):
        for r in (30, 44, 58):
            _draw_arc(canvas, (px_, py), r, a0, a1, gc=gc, alpha=170, seed=2060 + r + px_ % 5, passes=1)
    # boulders on the canyon floor
    for bx, by, rr in ((cx - 96, py - 190, 11), (cx + 104, py - 250, 9), (cx - 84, py - 110, 8), (cx + 90, py - 100, 10), (cx + 100, py - 330, 8)):
        _draw_rock(canvas, bx, by, rr * 1.3, rr, gc, 2080 + bx % 13, alpha=170)


def _render_15a_page(gc: tuple = GRAPHITE_COLOR):
    """Sheet 15 · Cara A (Front: X < 165 has 0 px). Game D7: the singing pillars of Cairn IV and the echoes of the canyon."""
    from scripts.journal.build_page06_07 import create_handdrawn_divider, draw_desert_path_seal, wrap_text_to_width

    assert "".join(_echo_letter(s, b) for s, b in ECHO_LEDGER) == ECHO_SIGIL
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    X0, W = 220, 1330
    BODY, BODY_LH = 35, 50
    SEC, SEC_LH = 44, 60

    def put(text, x, y, size, seed):
        t_img, _ = render_pencil_text(text, FONT_PATH, font_size=size, gc=gc, seed=seed)
        blit_rgba(canvas, t_img, x, y)
        return t_img.shape[1]

    def put_centered(text, cx, y, size, seed):
        t_img, _ = render_pencil_text(text, FONT_PATH, font_size=size, gc=gc, seed=seed)
        blit_rgba(canvas, t_img, int(cx - t_img.shape[1] / 2), y)

    def paragraph(text, x, y, max_w, size=BODY, lh=BODY_LH, seed=0):
        for k, ln in enumerate(wrap_text_to_width(text, FONT_PATH, size, max_w)):
            put(ln, x, y, size, seed + k * 3)
            y += lh
        return y

    # ------------------------------------------------------------------ header
    put("Cairn IV: Sentry of the Canyon", X0, 85, 62, 7001)
    blit_rgba(canvas, create_handdrawn_divider(width=W, gc=gc, seed=7003), X0, 170)

    # ------------------------------------------------------------------ I. The Mouth of the Chasm
    y = 222
    put("I. The Mouth of the Chasm", X0, y, SEC, 7010)
    y += SEC_LH
    y = paragraph(
        "Beyond the sandstone labyrinth, the desert narrows into the towering corridor of the Whispering Chasm. "
        "Here, beneath the Sentinel Mesa, stand two hollow stone pillars: Cairn IV, the Sentry of the Canyon. "
        "When the wind rushes through their carved chambers, the pillars sing across the gorge, each stone "
        "throwing its voice toward its own cliff wall. To claim the fourth seal, Silvia must follow the cadence of "
        "the canyon and discover where each echo was born.",
        X0, y, W, seed=7012)
    y += 28

    # ------------------------------------------------------------------ plate: the canyon in perspective
    plate_h = 440
    _draw_canyon_panorama(canvas, X0, y, W, plate_h, gc)
    y += plate_h + 30

    # ------------------------------------------------------------------ II. The Rules of the Echo
    put("II. The Rules of the Echo", X0, y, SEC, 7030)
    y += SEC_LH
    y = paragraph(
        "To decipher the echoes recorded in the survey log, observe three simple laws:",
        X0, y, W, size=34, lh=44, seed=7031)
    y += 8
    rules = [
        "1. Direction — The Left pillar echoes only against the left cliff; the Right pillar echoes only against the right cliff.",
        "2. Distance — Sound travels to the rock and back. Each beat of time measured on the chronometer equals 5 paces of distance to the cliff.",
        "3. The Letters — Find that distance ring on the survey plan to read the carved letter. Transcribe the seven echoes in order to reveal the Sigil of the Sentry.",
    ]
    rule_lines = [wrap_text_to_width(r, FONT_PATH, 34, W - 40) for r in rules]
    for k, rl in enumerate(rule_lines):
        for j, ln in enumerate(rl):
            put(ln, X0 + (0 if j == 0 else 36), y, 34, 7032 + k * 11 + j * 3)
            y += 44
        y += 6
    y += 28

    # ------------------------------------------------------------------ III. The Seven Echoes: plan (left) + ledger (right)
    PLAN_W, PLAN_H = 560, 562
    put("III. The Seven Echoes", X0, y, SEC, 7060)
    y += SEC_LH + 6
    _draw_echo_plan(canvas, X0, y, PLAN_W, PLAN_H, gc)
    tx0, ty0 = X0 + PLAN_W + 30, y
    col_w = (100, 220, 230, 190)
    tw = sum(col_w)
    row_h, head_h = 64, 70
    xs = [tx0]
    for cw in col_w:
        xs.append(xs[-1] + cw)
    table_bottom = ty0 + head_h + 7 * row_h
    draw_sketchy_rect(canvas, (tx0, ty0, tx0 + tw, table_bottom), gc=gc, alpha_base=200, passes=2, seed=7070)
    draw_sketchy_line(canvas, (tx0, ty0 + head_h), (tx0 + tw, ty0 + head_h), gc=gc, alpha_base=200, passes=2, seed=7071)
    for i in range(1, 4):
        draw_sketchy_line(canvas, (xs[i], ty0), (xs[i], table_bottom), gc=gc, alpha_base=150, passes=1, seed=7072 + i)
    for r in range(1, 7):
        draw_sketchy_line(canvas, (tx0, ty0 + head_h + r * row_h), (tx0 + tw, ty0 + head_h + r * row_h), gc=gc, alpha_base=110, passes=1, seed=7080 + r)
    for i, hd in enumerate(("Echo", "Pillar", "Back after", "Letter")):
        t_img, _ = render_pencil_text(hd, FONT_PATH, font_size=28, gc=gc, seed=7090 + i)
        blit_rgba(canvas, t_img, int((xs[i] + xs[i + 1]) / 2 - t_img.shape[1] / 2), ty0 + 18)
    for r, (side, beats) in enumerate(ECHO_LEDGER):
        ry = ty0 + head_h + r * row_h
        for i, val in enumerate((str(r + 1), side, f"{beats} beats")):
            t_img, _ = render_pencil_text(val, FONT_PATH, font_size=34, gc=gc, seed=7100 + r * 7 + i)
            blit_rgba(canvas, t_img, int((xs[i] + xs[i + 1]) / 2 - t_img.shape[1] / 2), ry + 12)
    put_centered("Survey log of the seven echoes", tx0 + tw // 2, table_bottom + 18, 28, 7140)
    y += PLAN_H + 34

    # ------------------------------------------------------------------ answer bar
    put("The Sigil of the Sentry:", X0, y, 36, 7150)
    y += 50
    box_w, gap = 150, 22
    for k in range(len(ECHO_SIGIL)):
        bx = X0 + k * (box_w + gap)
        draw_sketchy_rect(canvas, (bx, y, bx + box_w, y + 84), gc=gc, alpha_base=200, passes=2, seed=7160 + k * 5)
        draw_sketchy_rect(canvas, (bx + 6, y + 6, bx + box_w - 6, y + 78), gc=gc, alpha_base=90, passes=1, seed=7161 + k * 5)
        n_img, _ = render_pencil_text(str(k + 1), FONT_PATH, font_size=22, gc=gc, seed=7190 + k)
        blit_rgba(canvas, n_img, bx + 12, y + 7)
    y += 84
    put("Speak this seven-letter name at Cairn IV to claim the fourth seal.", X0, y + 10, 30, 7200)
    y += 48

    canvas[:, :165, 3] = 0
    return canvas, plate_h, y


def render_game_d7_cairn_iv_sentry(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 15 · Cara A."""
    canvas, _plate_h, _end_y = _render_15a_page(gc)
    return canvas


# =========================================================================
# SHEET 15 · CARA B & SHEET 16 · CARA A: ZOOM AL PUENTE NATURAL (SPREAD 3)
# Directly inspired by the user's first photo (The Sentinel Mesa Elev. 980 varas)
# =========================================================================

BRIDGE_PX_PER_VARA = 3.58
BRIDGE_PLATEAU_Y = 640                      # elevation 980 varas
BRIDGE_WASH_Y = 2000                        # elevation 600 varas (380 varas below the plateau)
BRIDGE_GUTTER_X = 1748


def _bridge_elev(y):
    return 980 - (y - BRIDGE_PLATEAU_Y) / BRIDGE_PX_PER_VARA


def _bridge_deck_top(x):
    t = min(1.0, max(0.0, (x - 1000) / 1540.0))
    return 722 - 64 * math.sin(math.pi * t)


def _bridge_deck_bot(x):
    t = min(1.0, max(0.0, (x - 1000) / 1540.0))
    return 1092 - 232 * (math.sin(math.pi * t) ** 0.8)


def _wob(x1, y1, x2, y2, rng, amp=2.0, step=14):
    n = max(2, int(math.hypot(x2 - x1, y2 - y1) / step))
    pts = []
    for i in range(n + 1):
        t = i / n
        pts.append((int(x1 + (x2 - x1) * t + rng.uniform(-amp, amp) * 0.4), int(y1 + (y2 - y1) * t + rng.uniform(-amp, amp))))
    return pts


def _stroke(canvas, pts, gc, alpha, thick=1):
    cv2.polylines(canvas, [np.array(pts, dtype=np.int32)], False, (*gc, int(alpha)), thick, cv2.LINE_AA)


def _top_at(top_pts, x):
    return float(np.interp(x, [p[0] for p in top_pts], [p[1] for p in top_pts]))


def _draw_strata_mass(canvas, face_pts, top_pts, outer_x, side, gc, seed, shade=1.0):
    """Red sandstone mass seen in elevation: long vertical strata (the dominant grain of the Sentinel Mesa), a few broken
    bedding joints, weathering pockets, ledges with fallen stones, shadow hatching along the gorge face and cracks.
    side = -1 (rock lies to the left of its face) or +1 (to the right)."""
    rng = np.random.default_rng(seed)
    fy = [p[1] for p in face_pts]
    fx = [p[0] for p in face_pts]
    face_x = lambda y: float(np.interp(y, fy, fx))
    top_y = min(p[1] for p in top_pts)
    bot_y = face_pts[-1][1]
    poly = list(top_pts) + list(face_pts) + [(outer_x, face_pts[-1][1]), (outer_x, top_pts[0][1])]
    _clear_polygon(canvas, poly)
    xa = outer_x + 8 if side < 0 else min(fx) - 4
    xb = max(fx) + 4 if side < 0 else outer_x - 8
    inside = (lambda x, y: x < face_x(y) - 8) if side < 0 else (lambda x, y: x > face_x(y) + 8)

    # vertical strata: broken fine lines, denser dark bands
    bands = [(rng.uniform(xa, xb), rng.uniform(50, 150)) for _ in range(9)]
    x = xa
    while x < xb:
        dense = any(bx <= x <= bx + bw for bx, bw in bands)
        y = _top_at(top_pts, x) + rng.uniform(14, 50)
        while y < bot_y - 20:
            ln = rng.uniform(55, 250)
            ye = min(bot_y - 10, y + ln)
            if inside(x, y) and inside(x, ye):
                a = rng.integers(55, 100) if dense else rng.integers(30, 72)
                pts = [(int(x + rng.integers(-1, 2)), int(y)), (int(x + rng.integers(-2, 3)), int((y + ye) / 2)), (int(x + rng.integers(-2, 3)), int(ye))]
                _stroke(canvas, pts, gc, a)
            y = ye + rng.uniform(8, 44)
        x += rng.uniform(4.5, 8) if dense else rng.uniform(14, 24)

    # broken bedding joints
    y = top_y + 70
    rows = []
    while y < bot_y - 30:
        rows.append(y)
        xa2, xb2 = (outer_x + 12, face_x(y) - 12) if side < 0 else (face_x(y) + 12, outer_x - 12)
        x = xa2
        while x < xb2 - 20:
            ln = rng.uniform(90, 300)
            xe = min(xb2, x + ln)
            _stroke(canvas, _wob(int(x), int(y), int(xe), int(y + rng.uniform(-6, 6)), rng, 1.6, 16), gc, rng.integers(70, 125))
            x = xe + rng.uniform(40, 150)
        y += int(rng.integers(86, 150))

    # weathering pockets (tafoni)
    for _ in range(90):
        px = rng.uniform(xa, xb)
        py = rng.uniform(top_y + 60, bot_y - 60)
        if not inside(px, py) or not inside(px + 20, py):
            continue
        rx, ry = rng.uniform(5, 13), rng.uniform(3, 8)
        cv2.ellipse(canvas, (int(px), int(py)), (int(rx), int(ry)), 0, 0, 360, (*gc, 120), 1, cv2.LINE_AA)
        cv2.ellipse(canvas, (int(px + 1), int(py + 2)), (int(rx * 0.7), int(ry * 0.6)), 0, 0, 180, (*gc, 140), 1, cv2.LINE_AA)

    # shadow hatching along the face
    for yy in range(int(top_y + 24), int(bot_y), 4):
        f = face_x(yy)
        L = rng.uniform(70, 230) * (1.0 if shade >= 1 else 0.65)
        a = int(rng.integers(60, 125) * shade)
        if side < 0:
            cv2.line(canvas, (int(f - L), yy + 6), (int(f - 5), yy - 2), (*gc, a), 1, cv2.LINE_AA)
        else:
            cv2.line(canvas, (int(f + 5), yy - 2), (int(f + L), yy + 6), (*gc, a), 1, cv2.LINE_AA)

    # ledges with fallen stones
    for k in range(7):
        yy = int(top_y + 140 + k * (bot_y - top_y - 220) / 6 + rng.integers(-18, 18))
        f = face_x(yy)
        xs0 = f + side * -rng.uniform(170, 360)
        _stroke(canvas, _wob(int(xs0), yy, int(f - side * 4), yy + int(rng.integers(-3, 4)), rng, 1.5, 14), gc, 175, 2)
        for j in range(int(rng.integers(3, 6))):
            rx_ = f - side * rng.uniform(14, 190)
            _draw_rock(canvas, rx_, yy - 6, rng.uniform(8, 17), rng.uniform(5, 10), gc, seed + 500 + k * 9 + j, alpha=165)

    # fault fissures running into the rock
    for k in range(5):
        yy = int(rng.uniform(top_y + 120, bot_y - 120))
        f = face_x(yy)
        pts = [(int(f), yy)]
        x_, y_ = f, yy
        for i in range(6):
            x_ += -side * rng.uniform(26, 48)
            y_ += rng.uniform(-30, 34)
            pts.append((int(x_), int(y_)))
        _stroke(canvas, pts, gc, 190)

    # heavy double outline of the face and the top edge, rocks and shrubs along the rim
    _stroke(canvas, face_pts, gc, 225, 2)
    _stroke(canvas, [(p[0] - side * 6, p[1]) for p in face_pts], gc, 105)
    _stroke(canvas, top_pts, gc, 225, 2)
    _stroke(canvas, [(p[0], p[1] + 9) for p in top_pts], gc, 115)
    x = xa + 30
    while x < xb - 30:
        ty = _top_at(top_pts, x)
        if rng.random() < 0.6:
            sz = rng.uniform(7, 17)
            _draw_rock(canvas, x, ty - sz * 0.6, sz * 1.3, sz, gc, seed + 900 + int(x) % 97, alpha=180)
        else:
            for k in range(6):
                th = math.radians(-90 + (k - 2.5) * 20)
                cv2.line(canvas, (int(x), int(ty - 2)), (int(x + 20 * math.cos(th)), int(ty - 2 + 20 * math.sin(th))), (*gc, 150), 1, cv2.LINE_AA)
        x += rng.uniform(70, 150)


def _draw_bridge_world(gc: tuple = GRAPHITE_COLOR):
    """The Sentinel Mesa's natural rock bridge as one continuous elevation (two A5 panels wide): the western abutment is
    sheet 15B, the eastern buttress and the Lower Wash descent are sheet 16A."""
    Wd = CANVAS_WIDTH_PX * 2
    canvas = np.zeros((CANVAS_HEIGHT_PX, Wd, 4), dtype=np.uint8)
    rng = np.random.default_rng(1550)
    Y_BOT = BRIDGE_WASH_Y

    # ------------------------------------------------------------ sky: haze lines, sun, falcons, far hills
    for k in range(34):
        yy = 300 + k * 9
        xx = int(rng.integers(200, Wd - 900))
        ln = int(rng.integers(160, 520))
        draw_sketchy_line(canvas, (xx, yy), (xx + ln, yy), gc=gc, alpha_base=int(26 + 14 * rng.random()), passes=1, seed=1560 + k)
    sun = (1250, 340)
    draw_sketchy_circle(canvas, sun, 54, gc=gc, alpha_base=190, passes=2, seed=1600, num_pts=44)
    draw_sketchy_circle(canvas, sun, 40, gc=gc, alpha_base=110, passes=1, seed=1601, num_pts=36)
    for k in range(40):
        th = math.radians(k * 9)
        r2 = 118 if k % 2 == 0 else 92
        cv2.line(canvas, (int(sun[0] + 70 * math.cos(th)), int(sun[1] + 70 * math.sin(th))), (int(sun[0] + r2 * math.cos(th)), int(sun[1] + r2 * math.sin(th))), (*gc, 100), 1, cv2.LINE_AA)
    for fx, fy, fs in ((2150, 330, 1.2), (2260, 380, 0.9), (2050, 420, 0.7)):
        for side_ in (-1, 1):
            _draw_arc(canvas, (int(fx + side_ * 22 * fs), int(fy + 8 * fs)), int(26 * fs), 200 if side_ < 0 else 280, 250 if side_ < 0 else 330, gc=gc, alpha=180, seed=1610 + side_, passes=1)
    for layer, (amp, base, a, step) in enumerate(((95, 470, 70, 5), (70, 520, 95, 5), (46, 575, 130, 4))):
        pts = [(x, int(base + amp * 0.5 * math.sin(x / (230.0 + 70 * layer) + layer * 2.1) + amp * 0.3 * math.sin(x / (63.0 + 11 * layer) + layer) - amp * 0.25)) for x in range(0, Wd + 20, 14)]
        _clear_polygon(canvas, [(0, 660)] + pts + [(Wd, 660)])
        _stroke(canvas, pts, gc, a, 2 if layer == 2 else 1)
        for (x1, y1), (x2, y2) in zip(pts[::2], pts[1::2]):
            for xx in range(x1, x2 + 1, step * 2):
                yy = int(np.interp(xx, [x1, x2], [y1, y2]))
                cv2.line(canvas, (xx, yy + 4), (xx - 6 - layer * 2, min(640, yy + 26 + 10 * layer)), (*gc, 34 + 16 * layer), 1, cv2.LINE_AA)
    for (cx0, cy0, n) in ((1850, 360, 5), (2750, 410, 4), (3200, 330, 5)):
        pts_c = []
        for k in range(n):
            r = int(rng.integers(22, 40))
            _draw_arc(canvas, (cx0 + k * 38, cy0), r, 180, 360, gc=gc, alpha=120, seed=1630 + k + cx0 % 13, passes=1)
        cv2.line(canvas, (cx0 - 30, cy0), (cx0 + n * 38 + 20, cy0), (*gc, 100), 1, cv2.LINE_AA)
        for k in range(6):
            cv2.line(canvas, (cx0 - 10 + k * 28, cy0 + 8), (cx0 + 8 + k * 28, cy0 + 8), (*gc, 36), 1, cv2.LINE_AA)

    # ------------------------------------------------------------ the gorge behind the bridge: far walls and shadow under the arch
    for x in range(1060, 2480, 7):
        yb = _bridge_deck_bot(x) if 1000 <= x <= 2540 else 1100
        y = yb
        while y < Y_BOT:
            seg = rng.uniform(40, 150)
            ye = min(Y_BOT, y + seg)
            a = 52 + 86 * math.exp(-(y - yb) / 190.0)
            cv2.line(canvas, (x + int(rng.integers(-1, 2)), int(y)), (x + int(rng.integers(-2, 3)), int(ye)), (*gc, int(a)), 1, cv2.LINE_AA)
            y = ye + rng.uniform(6, 30)
    for y in range(1160, Y_BOT, 62):
        x = 1070
        while x < 2470:
            ln = rng.uniform(120, 360)
            _stroke(canvas, _wob(int(x), y, int(min(2470, x + ln)), y + int(rng.integers(-4, 5)), rng, 1.6, 16), gc, 46)
            x += ln + rng.uniform(14, 40)
    far_blocks = [(1180, 160, 1100, .55), (1420, 230, 1020, .55), (1700, 170, 1150, .55), (1900, 210, 1060, .55), (2230, 190, 1120, .55),
                  (1250, 230, 1320, .8), (1560, 180, 1380, .8), (1860, 220, 1300, .8), (2160, 200, 1360, .8),
                  (1130, 200, 1500, 1.0), (1420, 180, 1560, 1.0), (1740, 260, 1460, 1.0), (2060, 240, 1520, 1.0), (2300, 150, 1600, 1.0)]
    for bx0, bw, by0, dep in sorted(far_blocks, key=lambda t: t[3]):
        blk = [(bx0, Y_BOT), (bx0 + 10, by0 + 30), (bx0 + 50, by0), (bx0 + bw - 40, by0 + 12), (bx0 + bw, by0 + 50), (bx0 + bw + 14, Y_BOT)]
        _clear_polygon(canvas, blk)
        _stroke(canvas, blk, gc, 90 + 70 * dep, 2 if dep >= 1.0 else 1)
        _stroke(canvas, [(x + 5, y + 6) for x, y in blk[1:-1]], gc, 50 + 40 * dep)
        for xx in range(bx0 + 12, bx0 + bw + 8, 7):
            yy = by0 + 36 + int(rng.integers(0, 40))
            while yy < Y_BOT - 14:
                ln = int(rng.integers(50, 190))
                a_ = int((50 + 70 * max(0, (xx - bx0 - bw * 0.35) / (bw * 0.65))) * (0.55 + 0.5 * dep))
                cv2.line(canvas, (xx, yy), (xx + int(rng.integers(-2, 3)), min(Y_BOT - 6, yy + ln)), (*gc, a_), 1, cv2.LINE_AA)
                yy += ln + int(rng.integers(8, 34))
        for k in range(1, 7):
            yy = by0 + k * ((Y_BOT - by0) // 7)
            cv2.line(canvas, (bx0 + 14, yy), (bx0 + bw, yy + int(rng.integers(-4, 5))), (*gc, int(40 + 36 * dep)), 1, cv2.LINE_AA)
        for k in range(4):
            _draw_rock(canvas, bx0 + 50 + k * (bw - 100) / 3, by0 + 4, 14, 8, gc, 1630 + bx0 % 7 + k, alpha=int(110 + 60 * dep))
        if dep >= 1.0:
            for k in range(7):
                _draw_rock(canvas, bx0 - 20 + k * ((bw + 40) / 6), Y_BOT - 6 - int(rng.integers(0, 20)), 13 + int(rng.integers(0, 14)), 9 + int(rng.integers(0, 9)), gc, 1650 + bx0 % 11 + k, alpha=175)
    # a keyhole window in the far wall and mist bands
    _draw_arc(canvas, (1560, 1260), 58, 180, 360, gc=gc, alpha=170, seed=1670, passes=2)
    cv2.line(canvas, (1502, 1260), (1502, 1330), (*gc, 150), 1, cv2.LINE_AA)
    cv2.line(canvas, (1618, 1260), (1618, 1330), (*gc, 150), 1, cv2.LINE_AA)
    for k in range(6):
        yy = 1250 + k * 130
        for x0m in range(1120, 2400, 180):
            xm = x0m + int(rng.integers(0, 70))
            cv2.line(canvas, (xm, yy + int(rng.integers(-8, 9))), (xm + int(rng.integers(90, 170)), yy), (*gc, 22), 1, cv2.LINE_AA)

    west_top_pts = [(0, 640), (150, 632), (330, 648), (520, 636), (700, 652), (880, 638), (990, 676), (1034, 706)]
    east_top_pts = [(2494, 722), (2530, 676), (2610, 646), (2780, 628), (2960, 612), (3140, 636), (3320, 620), (Wd, 640)]
    # ------------------------------------------------------------ the natural bridge (deck, arch, soffit, cart track)
    xs = list(range(1000, 2541, 10))
    top_pts = [(x, int(_bridge_deck_top(x))) for x in xs]
    bot_pts = [(x, int(_bridge_deck_bot(x))) for x in xs]
    deck = top_pts + bot_pts[::-1]
    _clear_polygon(canvas, deck)
    for f in (0.14, 0.28, 0.42, 0.56, 0.70, 0.84):
        pts = []
        for (x, yt), (_, yb) in zip(top_pts, bot_pts):
            pts.append((x, int(yt + (yb - yt) * f + 3 * math.sin(x / 41.0 + f * 9))))
        # break the bedding line into segments
        i = 0
        while i < len(pts) - 2:
            ln = int(rng.integers(14, 40))
            _stroke(canvas, pts[i:i + ln], gc, int(rng.integers(80, 150)))
            i += ln + int(rng.integers(1, 3))
    for x in range(1030, 2520, 52):
        x = x + int(rng.integers(-12, 12))
        yt, yb = _bridge_deck_top(x), _bridge_deck_bot(x)
        f0 = float(rng.choice((0.0, 0.14, 0.28, 0.42, 0.56, 0.70)))
        cv2.line(canvas, (x, int(yt + (yb - yt) * f0 + 4)), (x + int(rng.integers(-3, 4)), int(yt + (yb - yt) * (f0 + 0.14) - 4)), (*gc, 80), 1, cv2.LINE_AA)
    for (x1, x2) in zip(xs[:-1], xs[1:]):
        pass
    # shadowed underside (soffit) of the arch
    for x in range(1010, 2540, 5):
        yb = _bridge_deck_bot(x)
        L = 70 + 40 * math.sin(math.pi * (x - 1000) / 1540.0)
        cv2.line(canvas, (x, int(yb - L)), (x - 6, int(yb - 2)), (*gc, 105), 1, cv2.LINE_AA)
    _stroke(canvas, top_pts, gc, 225, 2)
    _stroke(canvas, [(x, y + 9) for x, y in top_pts], gc, 110)
    _stroke(canvas, bot_pts, gc, 225, 2)
    _stroke(canvas, [(x, y - 7) for x, y in bot_pts], gc, 110)
    # the old cart track: two dashed ruts along the deck and the plateau tops
    for off in (13, 21):
        run = [(x, int(_bridge_deck_top(x)) + off) for x in range(1000, 2541, 6)]
        i = 0
        while i < len(run) - 4:
            _stroke(canvas, run[i:i + 4], gc, 170)
            i += 7
    for (xa_, xb_, tp) in ((560, 1000, west_top_pts), (2540, 2980, east_top_pts)):
        for off in (13, 21):
            run = [(x, int(_top_at(tp, x)) + off) for x in range(xa_, xb_, 6)]
            i = 0
            while i < len(run) - 4:
                _stroke(canvas, run[i:i + 4], gc, 150)
                i += 7
    # undercut fissures on the soffit
    for x in (1290, 1520, 1990, 2250):
        yb = int(_bridge_deck_bot(x))
        pts = [(x, yb - 4), (x + 8, yb - 24), (x - 6, yb - 46), (x + 6, yb - 66)]
        _stroke(canvas, pts, gc, 190)

    # ------------------------------------------------------------ the western mass: Sentinel Mesa abutment
    west_top = west_top_pts
    west_face = [(1034, 706), (1004, 760), (1010, 860), (1060, 868), (1056, 980), (1012, 986), (1020, 1120), (1080, 1128), (1070, 1260), (1020, 1268), (1030, 1400), (1090, 1410), (1078, 1560), (1036, 1568), (1044, 1700), (1100, 1712), (1120, 1850), (1186, Y_BOT)]
    _draw_strata_mass(canvas, west_face, west_top, 0, -1, gc, 1700, shade=1.0)
    # cornice stones under the bridge springing
    for k in range(5):
        _draw_rock(canvas, 1010 + k * 14, 1100 + k * 12, 34, 18, gc, 1720 + k, alpha=175)

    # ------------------------------------------------------------ the eastern mass: towering buttress with three shafts
    east_top = east_top_pts
    east_face = [(2494, 722), (2520, 780), (2474, 790), (2466, 900), (2520, 908), (2530, 1020), (2478, 1030), (2470, 1150), (2528, 1158), (2540, 1280), (2492, 1290), (2496, 1420), (2556, 1430), (2560, 1560), (2516, 1570), (2522, 1700), (2580, 1710), (2570, 1850), (2604, Y_BOT)]
    _draw_strata_mass(canvas, east_face, east_top, Wd, 1, gc, 1800, shade=0.6)
    for bx in (2778, 3100, 3350):
        pts = [(bx + int(rng.integers(-8, 9)), 640 + k * 70) for k in range(0, 21)]
        pts = [(x, y) for x, y in pts if y < Y_BOT]
        _stroke(canvas, pts, gc, 195, 2)
        _stroke(canvas, [(x + 6, y) for x, y in pts], gc, 100)
    for sx in range(2560, Wd - 30, 30):
        y0_ = 700 + int(rng.integers(0, 120))
        while y0_ < Y_BOT - 60:
            ln = int(rng.integers(70, 240))
            cv2.line(canvas, (sx + int(rng.integers(-4, 5)), y0_), (sx + int(rng.integers(-4, 5)), min(Y_BOT, y0_ + ln)), (*gc, int(rng.integers(36, 76))), 1, cv2.LINE_AA)
            y0_ += ln + int(rng.integers(20, 70))
    for sx0, sx1 in ((2778, 3100), (3100, 3350), (3350, Wd)):
        _hatch_polygon(canvas, [(sx1 - (sx1 - sx0) * 0.30, 700), (sx1 - 8, 700), (sx1 - 8, Y_BOT), (sx1 - (sx1 - sx0) * 0.30, Y_BOT)], step=6, angle=88, gc=gc, alpha=50, seed=1810 + sx0 % 23)
    for k in range(4):
        _draw_rock(canvas, 2494 - k * 12, 1100 + k * 16, 36, 18, gc, 1830 + k, alpha=170)

    # ------------------------------------------------------------ the foreground wash: scree, boulders, channel, contours
    wash_top, wash_bot = Y_BOT, 2230
    for k in range(5):
        base = wash_top + 30 + k * 36
        pts = [(x, int(base + 12 * math.sin(x / 210.0 + k * 1.3) + 5 * math.sin(x / 47.0 + k))) for x in range(0, Wd, 10)]
        _stroke(canvas, pts, gc, int(70 + 18 * k))
    chan = [(x, int(wash_top + 98 + 38 * math.sin(x / 330.0) + 14 * math.sin(x / 83.0))) for x in range(0, Wd, 8)]
    for off, a in ((0, 200), (18, 140), (-16, 110)):
        _stroke(canvas, [(x, y + off) for x, y in chan], gc, a, 2 if off == 0 else 1)
    for k in range(900):
        gx = int(rng.integers(20, Wd - 20))
        gyy = int(rng.integers(wash_top + 4, wash_bot))
        cv2.circle(canvas, (gx, gyy), 1, (*gc, int(rng.integers(35, 95))), -1, cv2.LINE_AA)
    for k in range(95):
        bx = int(rng.integers(40, Wd - 40))
        base = wash_top + 20 + int(rng.integers(0, wash_bot - wash_top - 16))
        sz = float(rng.choice((9, 12, 15, 19, 26, 34, 44), p=(.22, .22, .2, .15, .11, .07, .03)))
        _draw_rock(canvas, bx, base, sz * 1.25, sz, gc, 1900 + k, alpha=185)
    # scree fans at the toes of both masses
    for (x0f, x1f, sgn) in ((1060, 1560, 1), (2560, 2060, -1)):
        for k in range(26):
            t = k / 25.0
            bx = int(x0f + (x1f - x0f) * t + rng.integers(-20, 20))
            by = int(1860 + (Y_BOT + 10 - 1860) * t ** 0.7 + rng.integers(-14, 14))
            sz = 12 + 26 * (1 - t) * rng.random()
            _draw_rock(canvas, bx, by, sz * 1.3, sz, gc, 2100 + k + (0 if sgn > 0 else 40), alpha=180)
    for gx in (320, 760, 1450, 1880, 2330, 2780, 3280):
        gy2 = wash_top + 150 + int(rng.integers(-12, 12))
        for k in range(8):
            th = math.radians(-90 + (k - 4) * 17)
            cv2.line(canvas, (gx, gy2), (int(gx + 28 * math.cos(th)), int(gy2 + 28 * math.sin(th))), (*gc, 150), 1, cv2.LINE_AA)

    # ------------------------------------------------------------ cotas, ruler, labels
    def label(text, x, y, size, seed, bg=True, center=False):
        t_img, _ = render_pencil_text(text, FONT_PATH, font_size=size, gc=gc, seed=seed)
        px = int(x - t_img.shape[1] / 2) if center else int(x)
        if bg:
            _clear_polygon(canvas, [(px - 8, y - 4), (px + t_img.shape[1] + 8, y - 4), (px + t_img.shape[1] + 8, y + t_img.shape[0] + 2), (px - 8, y + t_img.shape[0] + 2)])
        blit_rgba(canvas, t_img, px, y)
        return t_img.shape[1], t_img.shape[0]

    # elevation ruler along the far left of the western mass (every 50 varas, labels every 100)
    rx = 150
    _clear_polygon(canvas, [(rx - 40, BRIDGE_PLATEAU_Y - 40), (rx + 150, BRIDGE_PLATEAU_Y - 40), (rx + 150, Y_BOT + 20), (rx - 40, Y_BOT + 20)])
    draw_sketchy_line(canvas, (rx, BRIDGE_PLATEAU_Y), (rx, Y_BOT), gc=gc, alpha_base=215, passes=2, seed=1990)
    for v in range(600, 981, 50):
        yy = int(BRIDGE_PLATEAU_Y + (980 - v) * BRIDGE_PX_PER_VARA)
        cv2.line(canvas, (rx - (16 if v % 100 == 0 else 9), yy), (rx + (16 if v % 100 == 0 else 9), yy), (*gc, 205), 1, cv2.LINE_AA)
        if v % 100 == 0 or v == 980:
            label(str(v), rx + 26, yy - 14, 26, 2000 + v, bg=False)
    label("varas", rx - 36, BRIDGE_PLATEAU_Y - 64, 24, 1991, bg=False)

    # cotas with leaders
    def cota(text, x, y, tx, ty, seed):
        cv2.line(canvas, (x, y), (tx, ty + 14), (*gc, 170), 1, cv2.LINE_AA)
        cv2.circle(canvas, (x, y), 4, (*gc, 210), -1, cv2.LINE_AA)
        label(text, tx, ty, 28, seed, center=False)

    deck_apex = int(_bridge_deck_top(1770))
    soffit_apex = int(_bridge_deck_bot(1770))
    cota("Mesa top 980", 560, 640, 440, 566, 2100)
    cota(f"Deck {int(round(_bridge_elev(deck_apex) / 5) * 5)}", 1950, deck_apex + 3, 2030, deck_apex - 70, 2101)
    cota(f"Soffit of the arch {int(round(_bridge_elev(soffit_apex) / 5) * 5)}", 1830, soffit_apex - 4, 1880, soffit_apex + 150, 2102)
    cota("Lower Wash 600", 1500, BRIDGE_WASH_Y + 20, 1380, BRIDGE_WASH_Y - 90, 2103)
    # named parts
    label("The Sentinel Mesa  (Elev. 980 varas)", 300, 496, 40, 2110, bg=False)
    label("Western abutment", 640, 1300, 30, 2111)
    label("Fault fissure", 740, 1020, 26, 2112)
    label("The Natural Bridge", 2040, 470, 38, 2113, bg=False)
    label("Old cart track", 1270, 580, 28, 2114, bg=False)
    cv2.line(canvas, (1340, 616), (1380, int(_bridge_deck_top(1380)) + 14), (*gc, 160), 1, cv2.LINE_AA)
    label("Eastern buttress", 3180, 1010, 30, 2115)
    label("Lower Wash (Wadi al-Hajar South)", 2380, 2080, 28, 2116)
    label("Scree and fallen boulders", 520, 2078, 26, 2117)
    # ------------------------------------------------------------ the eastern buttress in detail (sheet 16A)
    # natural windows weathered into the tops of the shafts
    for wx, wy, wr in ((2950, 770, 34), (3225, 820, 28), (3425, 740, 30)):
        _clear_polygon(canvas, [(wx - wr, wy - wr), (wx + wr, wy - wr), (wx + wr, wy + wr + 30), (wx - wr, wy + wr + 30)])
        _draw_arc(canvas, (wx, wy), wr, 180, 360, gc=gc, alpha=200, seed=2200 + wx % 13, passes=2)
        _draw_arc(canvas, (wx, wy), wr - 8, 180, 360, gc=gc, alpha=110, seed=2201 + wx % 13, passes=1)
        cv2.line(canvas, (wx - wr, wy), (wx - wr, wy + wr + 28), (*gc, 190), 1, cv2.LINE_AA)
        cv2.line(canvas, (wx + wr, wy), (wx + wr, wy + wr + 28), (*gc, 190), 1, cv2.LINE_AA)
        _hatch_polygon(canvas, [(wx - wr + 8, wy - 4), (wx + wr - 6, wy - 4), (wx + wr - 6, wy + wr + 26), (wx - wr + 8, wy + wr + 26)], step=3, angle=84, gc=gc, alpha=75, seed=2202 + wx % 13)
    # the switchback trail of the cart track down the face of the buttress
    legs = [(2600, 770), (3030, 880), (2640, 1030), (3050, 1180), (2660, 1340), (3060, 1490), (2690, 1650), (3010, 1820), (2860, 1990)]
    for (xa_, ya_), (xb_, yb_) in zip(legs[:-1], legs[1:]):
        dx, dy = xb_ - xa_, yb_ - ya_
        ln = math.hypot(dx, dy)
        nx_, ny_ = -dy / ln, dx / ln
        band = [(xa_ + nx_ * 17, ya_ + ny_ * 17), (xb_ + nx_ * 17, yb_ + ny_ * 17), (xb_ - nx_ * 17, yb_ - ny_ * 17), (xa_ - nx_ * 17, ya_ - ny_ * 17)]
        _clear_polygon(canvas, band)
        for off, a in ((16, 200), (-16, 170)):
            _stroke(canvas, _wob(int(xa_ + nx_ * off), int(ya_ + ny_ * off), int(xb_ + nx_ * off), int(yb_ + ny_ * off), rng, 1.4, 16), gc, a, 2 if off > 0 else 1)
        # two wheel ruts
        for off in (-5, 5):
            ox_, oy_ = nx_ * off, ny_ * off
            t = 0.0
            while t < 1.0:
                p1 = (xa_ + dx * t + ox_, ya_ + dy * t + oy_)
                t2 = min(1.0, t + 18 / ln)
                p2 = (xa_ + dx * t2 + ox_, ya_ + dy * t2 + oy_)
                cv2.line(canvas, (int(p1[0]), int(p1[1])), (int(p2[0]), int(p2[1])), (*gc, 165), 1, cv2.LINE_AA)
                t += 30 / ln
        # retaining wall below the leg: short ticks
        t = 0.0
        while t < 1.0:
            px_, py_ = xa_ + dx * t + nx_ * 17, ya_ + dy * t + ny_ * 17
            cv2.line(canvas, (int(px_), int(py_)), (int(px_ + nx_ * 12 + 4), int(py_ + ny_ * 12 + 6)), (*gc, 120), 1, cv2.LINE_AA)
            t += 13 / ln
    for (px_, py_) in legs[1:-1]:
        _draw_rock(canvas, px_, py_ + 4, 24, 15, gc, 2300 + px_ % 17 + py_ % 11, alpha=185)
    # a loaded cart on the first leg and a tiny figure with a staff on the third
    def place(pts, ang, ox, oy):
        c_, s_ = math.cos(ang), math.sin(ang)
        return np.array([(int(ox + x * c_ - y * s_), int(oy + x * s_ + y * c_)) for x, y in pts], dtype=np.int32)
    la = math.atan2(880 - 770, 3030 - 2600)
    tcart = 0.38
    cxx, cyy = 2600 + (3030 - 2600) * tcart, 770 + (880 - 770) * tcart
    box = place([(-30, -26), (30, -26), (26, -2), (-26, -2)], la, cxx, cyy)
    _clear_polygon(canvas, box.tolist())
    cv2.polylines(canvas, [box], True, (*gc, 215), 1, cv2.LINE_AA)
    for k in range(-2, 3):
        a_ = place([(k * 11, -26), (k * 11 - 2, -2)], la, cxx, cyy)
        cv2.line(canvas, tuple(a_[0]), tuple(a_[1]), (*gc, 120), 1, cv2.LINE_AA)
    for wx_ in (-18, 18):
        wc = place([(wx_, 4)], la, cxx, cyy)[0]
        cv2.circle(canvas, tuple(int(v) for v in wc), 11, (*gc, 215), 1, cv2.LINE_AA)
        for k in range(8):
            th = math.radians(k * 45)
            cv2.line(canvas, tuple(int(v) for v in wc), (int(wc[0] + 11 * math.cos(th)), int(wc[1] + 11 * math.sin(th))), (*gc, 150), 1, cv2.LINE_AA)
    pole = place([(30, -14), (62, -6)], la, cxx, cyy)
    cv2.line(canvas, tuple(pole[0]), tuple(pole[1]), (*gc, 190), 1, cv2.LINE_AA)
    # tiny figure of Hermes (scale: a 2-pace staff)
    hx, hy = 2900, int(1030 + (1180 - 1030) * 0.5 * 0) + 12
    la3 = math.atan2(1180 - 1030, 3050 - 2640)
    hx, hy = int(2640 + (3050 - 2640) * 0.55), int(1030 + (1180 - 1030) * 0.55) - 16
    cv2.circle(canvas, (hx, hy - 38), 6, (*gc, 215), 1, cv2.LINE_AA)
    cv2.line(canvas, (hx, hy - 32), (hx, hy), (*gc, 215), 2, cv2.LINE_AA)
    cv2.line(canvas, (hx, hy - 26), (hx + 12, hy - 14), (*gc, 190), 1, cv2.LINE_AA)
    cv2.line(canvas, (hx + 14, hy + 2), (hx + 14, hy - 56), (*gc, 205), 1, cv2.LINE_AA)
    cv2.line(canvas, (hx, hy), (hx - 6, hy + 14), (*gc, 190), 1, cv2.LINE_AA)
    cv2.line(canvas, (hx, hy), (hx + 6, hy + 14), (*gc, 190), 1, cv2.LINE_AA)
    # survey stone on the plateau
    sx_, sy_ = 3250, int(_top_at(east_top_pts, 3250))
    cv2.polylines(canvas, [np.array([(sx_, sy_ - 26), (sx_ - 14, sy_ - 2), (sx_ + 14, sy_ - 2)], dtype=np.int32)], True, (*gc, 220), 1, cv2.LINE_AA)
    cv2.circle(canvas, (sx_, sy_ - 11), 2, (*gc, 220), -1, cv2.LINE_AA)
    label("Survey stone 980", sx_ - 70, sy_ - 74, 26, 2250, bg=False)
    cv2.line(canvas, (sx_, sy_ - 42), (sx_, sy_ - 28), (*gc, 150), 1, cv2.LINE_AA)
    # dimension line: the pier above the scree
    dx_ = 3440
    cv2.line(canvas, (dx_, BRIDGE_PLATEAU_Y + 6), (dx_, Y_BOT - 6), (*gc, 205), 1, cv2.LINE_AA)
    for (yy, d) in ((BRIDGE_PLATEAU_Y + 6, 1), (Y_BOT - 6, -1)):
        cv2.line(canvas, (dx_ - 20, yy), (dx_ + 20, yy), (*gc, 205), 1, cv2.LINE_AA)
        cv2.fillPoly(canvas, [np.array([(dx_, yy), (dx_ - 8, yy + 24 * d), (dx_ + 8, yy + 24 * d)], dtype=np.int32)], (*gc, 205))
    label("380", dx_ - 106, 1720, 30, 2251)
    label("varas", dx_ - 106, 1758, 26, 2252)
    # labels and notes of Hermes
    label("Switchback terraces", 2700, 1585, 26, 2253)
    label("The turns are too tight", 3090, 1330, 26, 2254)
    label("for a loaded wagon.", 3090, 1366, 26, 2255)
    label("Old cart track", 2640, 700, 28, 2256, bg=False)
    cv2.line(canvas, (2700, 738), (2690, 768), (*gc, 150), 1, cv2.LINE_AA)
    label("Boulders fallen in the quake of 1971", 2960, 2150, 26, 2257)
    for k in range(18):
        _draw_rock(canvas, 2650 + k * 44 + int(rng.integers(-14, 14)), Y_BOT - 4 - int(rng.integers(0, 26)), 12 + int(rng.integers(0, 22)), 9 + int(rng.integers(0, 14)), gc, 2400 + k, alpha=180)
    # compass and scale bar
    cx_, cy_ = 3250, 300
    draw_sketchy_circle(canvas, (cx_, cy_), 72, gc=gc, alpha_base=200, passes=2, seed=2120, num_pts=48)
    draw_sketchy_circle(canvas, (cx_, cy_), 58, gc=gc, alpha_base=120, passes=1, seed=2121, num_pts=44)
    for k in range(8):
        th = math.radians(k * 45 - 90)
        L = 64 if k % 2 == 0 else 40
        cv2.line(canvas, (cx_, cy_), (int(cx_ + L * math.cos(th)), int(cy_ + L * math.sin(th))), (*gc, 190), 1, cv2.LINE_AA)
    cv2.fillPoly(canvas, [np.array([(cx_, cy_ - 70), (cx_ - 11, cy_ - 22), (cx_ + 11, cy_ - 22)], dtype=np.int32)], (*gc, 215))
    label("N", cx_ - 10, cy_ - 118, 30, 2122, bg=False)
    sbx, sby = 2700, 480
    draw_sketchy_line(canvas, (sbx, sby), (sbx + int(300 * BRIDGE_PX_PER_VARA / 2), sby), gc=gc, alpha_base=215, passes=2, seed=2130)
    for k in range(4):
        tx = sbx + int(k * 100 * BRIDGE_PX_PER_VARA / 2)
        cv2.line(canvas, (tx, sby - 12), (tx, sby + 12), (*gc, 210), 1, cv2.LINE_AA)
        label(str(k * 100), tx - 14, sby + 18, 24, 2131 + k, bg=False)
    label("Scale 1 : 250 (varas)", sbx, sby - 56, 28, 2136, bg=False)
    return canvas


def _bridge_note(canvas, x, y, w, h, title, lines, seed, gc):
    from scripts.journal.build_page06_07 import wrap_text_to_width
    draw_sketchy_rect(canvas, (x, y, x + w, y + h), gc=gc, alpha_base=205, passes=2, seed=seed)
    draw_sketchy_rect(canvas, (x + 9, y + 9, x + w - 9, y + h - 9), gc=gc, alpha_base=110, passes=1, seed=seed + 4)
    for (cx_, cy_) in ((x + 9, y + 9), (x + w - 9, y + 9), (x + 9, y + h - 9), (x + w - 9, y + h - 9)):
        cv2.fillPoly(canvas, [np.array([(cx_, cy_ - 8), (cx_ + 8, cy_), (cx_, cy_ + 8), (cx_ - 8, cy_)], dtype=np.int32)], (*gc, 190))
    t_img, _ = render_pencil_text(title, FONT_PATH, font_size=32, gc=gc, seed=seed + 8)
    blit_rgba(canvas, t_img, x + 30, y + 22)
    ty = y + 22 + 50
    for k, ln in enumerate(lines):
        for sub in wrap_text_to_width(ln, FONT_PATH, 30, w - 70):
            t_img, _ = render_pencil_text(sub, FONT_PATH, font_size=30, gc=gc, seed=seed + 20 + k * 5 + ty % 11)
            blit_rgba(canvas, t_img, x + 34, ty)
            ty += 38


def render_spread3(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Renders the continuous 100% full-bleed double-page masterwork Spread 3 (3496 x 2480 px).

    Left half (0..1748 px): Hoja 15 · Cara B (The Natural Bridge of the Sentinel Mesa).
    Right half (1748..3496 px): Hoja 16 · Cara A (The Eastern Buttress & Lower Wash).
    Fills 100% of the surface continuously edge-to-edge across the binder holes, just like Spread 1 and Spread 2.
    Zero collisions between handwriting and drawing strokes.
    """
    import math
    spread_w = CANVAS_WIDTH_PX * 2  # 3496 px
    spread_h = CANVAS_HEIGHT_PX      # 2480 px

    def put_label(canvas, text, x, y, font_size=28, seed=8000):
        """Blits authentic pencil text directly on top of the map drawing without erasing any background."""
        t_img, _ = render_pencil_text(text, FONT_PATH, font_size=font_size, gc=gc, seed=seed)
        if t_img is None:
            return 0, 0
        th, tw = t_img.shape[:2]
        blit_rgba(canvas, t_img, x, y)
        return tw, th

    def put_multiline_note(canvas, lines_with_sizes, start_x, start_y, line_h=40, seed=8200):
        """Blits multiline survey notes directly on the map in authentic pencil without halos or margins."""
        cur_y = start_y
        for i, (line, f_size) in enumerate(lines_with_sizes):
            t_img, _ = render_pencil_text(line, FONT_PATH, font_size=f_size, gc=gc, seed=seed + i)
            if t_img is not None:
                blit_rgba(canvas, t_img, start_x, cur_y)
            cur_y += line_h

    # 1. Base Map Artwork (Full-Bleed 100% Edge-to-Edge)
    asset_path = os.path.join(PROJECT_ROOT, "journal", "page15", "assets", "spread03_natural_bridge_alpha.png")
    if not os.path.exists(asset_path):
        raise FileNotFoundError(f"Spread 3 asset not found: {asset_path}")

    strokes = cv2.imread(asset_path, cv2.IMREAD_UNCHANGED)
    sh, sw = strokes.shape[:2]
    scale = spread_h / float(sh)
    target_w = int(round(sw * scale))
    resized_map = cv2.resize(strokes, (target_w, spread_h), interpolation=cv2.INTER_LANCZOS4)
    x_offset = (target_w - spread_w) // 2
    spread_canvas = resized_map[:, x_offset:x_offset + spread_w].copy()

    # -------------------------------------------------------------
    # LEFT PANEL: Hoja 15 · Cara B (The Western Abutment)
    # -------------------------------------------------------------
    t_title_l, _ = render_pencil_text("The Natural Bridge of the Sentinel Mesa", FONT_PATH, font_size=58, gc=gc, seed=8001)
    blit_rgba(spread_canvas, t_title_l, 180, 70)

    put_label(spread_canvas, "The Sentinel Mesa · Elev. 980 varas", 360, 210, font_size=28, seed=8101)
    cv2.line(spread_canvas, (350, 225), (260, 270), (*gc, 185), 1, cv2.LINE_AA)
    cv2.circle(spread_canvas, (260, 270), 3, (*gc, 215), -1, cv2.LINE_AA)

    put_label(spread_canvas, "Bridge deck · Elev. 975 varas", 1060, 690, font_size=28, seed=8102)
    put_label(spread_canvas, "Old cart track across the stone span", 1060, 728, font_size=25, seed=8103)
    cv2.line(spread_canvas, (1230, 765), (1330, 875), (*gc, 185), 1, cv2.LINE_AA)
    cv2.circle(spread_canvas, (1330, 875), 3, (*gc, 215), -1, cv2.LINE_AA)

    put_label(spread_canvas, "The Whispering Chasm", 1080, 1120, font_size=30, seed=8104)
    put_label(spread_canvas, "Depth 380 varas below the arch", 1080, 1160, font_size=26, seed=8105)
    cv2.line(spread_canvas, (1220, 1195), (1310, 1380), (*gc, 185), 1, cv2.LINE_AA)
    cv2.circle(spread_canvas, (1310, 1380), 3, (*gc, 215), -1, cv2.LINE_AA)

    # Bottom note: Survey Note IX
    note_ix = [
        ("Survey Note IX · The Western Abutment", 34),
        ("«The bridge rests on a great shelf of red sandstone, older than any road.", 28),
        ("The old cart track crosses its back and falls by natural terraces to the Lower Wash.»", 28)
    ]
    put_multiline_note(spread_canvas, note_ix, 180, 2210, line_h=40, seed=8200)

    # -------------------------------------------------------------
    # RIGHT PANEL: Hoja 16 · Cara A (The Eastern Buttress & Lower Wash)
    # -------------------------------------------------------------
    r_x0 = CANVAS_WIDTH_PX  # 1748 px
    t_title_r, _ = render_pencil_text("The Eastern Buttress & Lower Wash", FONT_PATH, font_size=58, gc=gc, seed=9001)
    blit_rgba(spread_canvas, t_title_r, r_x0 + 180, 70)

    # Renaissance Surveyor Compass Rose
    cx_, cy_ = 3280, 250
    cv2.circle(spread_canvas, (cx_, cy_), 65, (*gc, 190), 1, cv2.LINE_AA)
    cv2.circle(spread_canvas, (cx_, cy_), 52, (*gc, 120), 1, cv2.LINE_AA)
    for k in range(8):
        th = math.radians(k * 45 - 90)
        L = 58 if k % 2 == 0 else 36
        cv2.line(spread_canvas, (cx_, cy_), (int(cx_ + L * math.cos(th)), int(cy_ + L * math.sin(th))), (*gc, 180), 1, cv2.LINE_AA)
    cv2.fillPoly(spread_canvas, [np.array([(cx_, cy_ - 64), (cx_ - 10, cy_ - 20), (cx_ + 10, cy_ - 20)], dtype=np.int32)], (*gc, 210))
    t_n, _ = render_pencil_text("N", FONT_PATH, font_size=30, gc=gc, seed=9020)
    blit_rgba(spread_canvas, t_n, cx_ - t_n.shape[1] // 2, cy_ - 110)

    # Scale Bar (1 : 250 varas)
    sbx, sby, sbw = 2620, 250, 360
    put_label(spread_canvas, "Scale 1 : 250 (varas)", sbx, sby - 36, font_size=26, seed=9031)
    cv2.line(spread_canvas, (sbx, sby), (sbx + sbw, sby), (*gc, 200), 2, cv2.LINE_AA)
    for idx, (tk_off, tk_lab) in enumerate([(0, "0"), (120, "100"), (240, "200"), (360, "300 varas")]):
        cv2.line(spread_canvas, (sbx + tk_off, sby - 8), (sbx + tk_off, sby + 8), (*gc, 200), 1, cv2.LINE_AA)
        t_tk, _ = render_pencil_text(tk_lab, FONT_PATH, font_size=22, gc=gc, seed=9035 + idx)
        blit_rgba(spread_canvas, t_tk, sbx + tk_off - t_tk.shape[1] // 2, sby + 12)

    # Plateau survey stone
    sx_, sy_ = 3180, 680
    cv2.polylines(spread_canvas, [np.array([(sx_, sy_ - 24), (sx_ - 12, sy_ - 2), (sx_ + 12, sy_ - 2)], dtype=np.int32)], True, (*gc, 215), 1, cv2.LINE_AA)
    cv2.circle(spread_canvas, (sx_, sy_ - 10), 2, (*gc, 215), -1, cv2.LINE_AA)
    put_label(spread_canvas, "Survey stone 980", sx_ - 75, sy_ - 68, font_size=26, seed=9040)
    cv2.line(spread_canvas, (sx_, sy_ - 36), (sx_, sy_ - 26), (*gc, 160), 1, cv2.LINE_AA)

    # Annotations along switchbacks
    put_label(spread_canvas, "Switchback terraces", 2860, 1175, font_size=28, seed=9050)
    put_label(spread_canvas, "The turns are too tight", 2860, 1215, font_size=25, seed=9051)
    put_label(spread_canvas, "for a loaded wagon.", 2860, 1253, font_size=25, seed=9052)
    cv2.line(spread_canvas, (2850, 1225), (2760, 1300), (*gc, 185), 1, cv2.LINE_AA)
    cv2.circle(spread_canvas, (2760, 1300), 3, (*gc, 215), -1, cv2.LINE_AA)

    # Dimension line: eastern pier drop 380 varas
    dx_ = 3410
    dy_top, dy_bot = 880, 2160
    cv2.line(spread_canvas, (dx_, dy_top), (dx_, dy_bot), (*gc, 195), 1, cv2.LINE_AA)
    for (yy, d) in ((dy_top, 1), (dy_bot, -1)):
        cv2.line(spread_canvas, (dx_ - 18, yy), (dx_ + 18, yy), (*gc, 195), 1, cv2.LINE_AA)
        cv2.fillPoly(spread_canvas, [np.array([(dx_, yy), (dx_ - 7, yy + 20 * d), (dx_ + 7, yy + 20 * d)], dtype=np.int32)], (*gc, 195))
    put_label(spread_canvas, "380", dx_ - 95, 1495, font_size=30, seed=9060)
    put_label(spread_canvas, "varas", dx_ - 95, 1535, font_size=26, seed=9061)

    # Annotations in lower wash
    put_label(spread_canvas, "Lower Wash (Wadi al-Hajar South)", 2020, 2120, font_size=28, seed=9070)
    put_label(spread_canvas, "Boulders fallen in the quake of 1971", 2520, 2160, font_size=26, seed=9071)
    cv2.line(spread_canvas, (2500, 2175), (2420, 2220), (*gc, 185), 1, cv2.LINE_AA)
    cv2.circle(spread_canvas, (2420, 2220), 3, (*gc, 215), -1, cv2.LINE_AA)

    # Bottom note: Survey Note X
    note_x = [
        ("Survey Note X · The Eastern Buttress", 34),
        ("«The eastern pier rises 380 varas above the scree. Under the arch, deep fissures", 28),
        ("run toward the old cisterns. Cairn IV guards the southern mouth of the gorge.»", 28)
    ]
    put_multiline_note(spread_canvas, note_x, r_x0 + 180, 2210, line_h=40, seed=9200)

    return spread_canvas


def render_zoom_bridge_left(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 15 · Cara B (Spread 3 left panel): the western abutment of the natural rock bridge below the Sentinel Mesa.
    Fills 100% full bleed edge-to-edge as the left half of the continuous A4 landscape Spread 3."""
    spread = render_spread3(gc=gc)
    return spread[:, :CANVAS_WIDTH_PX].copy()


def render_zoom_bridge_right(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 16 · Cara A (Spread 3 right panel): the eastern buttress of the natural rock bridge and the descent to the Lower Wash.
    Fills 100% full bleed edge-to-edge as the right half of the continuous A4 landscape Spread 3."""
    spread = render_spread3(gc=gc)
    return spread[:, CANVAS_WIDTH_PX:].copy()


# =========================================================================
# SHEET 16 · CARA B: JUEGO D8 — ARCH OF THE SOLSTICE & THE SOLAR ALTAR
# =========================================================================

RAY_SIGIL = "DAYBREAK"


def _simulate_ray(rows, cols, start_c, mirrors, pillars, letters, altar):
    """Follows the solstice ray from the arch (entering the top row, heading south). Returns (letters read, reached altar)."""
    x, y, d = start_c, 0, (0, 1)
    read, seen = [], set()
    while 0 <= x < cols and 0 <= y < rows:
        if (x, y, d) in seen:
            return read, False
        seen.add((x, y, d))
        if (x, y) in pillars:
            return read, False
        if (x, y) in altar:
            return read, True
        if (x, y) in letters:
            read.append(letters[(x, y)])
        if (x, y) in mirrors:
            d = (d[1], d[0]) if mirrors[(x, y)] == "\\" else (-d[1], -d[0])
        x, y = x + d[0], y + d[1]
    return read, False


def _build_ray_courtyard(rows, cols, sigil, seed0=1911):
    """Courtyard of the Solar Altar: intricate Renaissance optical maze with 11-13 mirror reflections,
    decoy branches, blocking fallen pillars and 26 lettered sun-stones. The true beam crosses the Sigil letters in order to the Solar Altar."""
    import random
    n = len(sigil)
    for seed in range(seed0, seed0 + 40000):
        rnd = random.Random(seed)
        c0 = rnd.randint(2, cols - 3)
        pos, d = (c0, 0), (0, 1)
        path, mirrors = [pos], {}
        ok = True
        num_turns = rnd.randint(11, 13)
        for t in range(num_turns):
            step_len = rnd.randint(2, 5)
            for _ in range(step_len):
                nx, ny = pos[0] + d[0], pos[1] + d[1]
                if not (0 <= nx < cols and 0 <= ny < rows) or (nx, ny) in path:
                    ok = False
                    break
                pos = (nx, ny)
                path.append(pos)
            if not ok:
                break
            opts = [(d[1], d[0]), (-d[1], -d[0])]
            rnd.shuffle(opts)
            nd = None
            for o in opts:
                tx, ty = pos[0] + o[0], pos[1] + o[1]
                if 0 <= tx < cols and 0 <= ty < rows and (tx, ty) not in path:
                    nd = o
                    break
            if nd is None:
                ok = False
                break
            mirrors[pos] = "\\" if nd == (d[1], d[0]) else "/"
            d = nd
        if not ok:
            continue
        for _ in range(rnd.randint(2, 4)):
            nx, ny = pos[0] + d[0], pos[1] + d[1]
            if not (0 <= nx < cols and 0 <= ny < rows) or (nx, ny) in path:
                ok = False
                break
            pos = (nx, ny)
            path.append(pos)
        if not ok or len(path) < 40:
            continue
        altar = pos
        cand = [c for c in path[1:-1] if c not in mirrors]
        if len(cand) < n + 4:
            continue
        picks = []
        for k in range(n):
            idx = int(round((k + 0.5) * len(cand) / n))
            idx = min(len(cand) - 1, max(0, idx))
            while cand[idx] in picks:
                idx = (idx + 1) % len(cand)
            picks.append(cand[idx])
        picks = sorted(picks, key=lambda c: path.index(c))
        letters = {c: sigil[k] for k, c in enumerate(picks)}
        free = [(x, y) for y in range(rows) for x in range(cols) if (x, y) not in path]
        if len(free) < 55:
            continue
        rnd.shuffle(free)
        num_pillars = rnd.randint(14, 18)
        num_decoy_mirrors = rnd.randint(16, 20)
        num_decoy_letters = rnd.randint(18, 22)

        pillars = set(free[:num_pillars])
        idx_dm = num_pillars
        decoy_mirrors = {c: rnd.choice(("/", "\\")) for c in free[idx_dm:idx_dm + num_decoy_mirrors]}
        idx_dl = idx_dm + num_decoy_mirrors
        decoy_letters = {c: rnd.choice("BCDFGHIJLMNPQRSTUVWXYZ") for c in free[idx_dl:idx_dl + num_decoy_letters]}

        all_mirrors = dict(mirrors)
        all_mirrors.update(decoy_mirrors)
        all_letters = dict(letters)
        all_letters.update(decoy_letters)
        read, reached = _simulate_ray(rows, cols, c0, all_mirrors, pillars, all_letters, {altar})
        if reached and "".join(read) == sigil:
            return dict(start_c=c0, mirrors=all_mirrors, pillars=pillars, letters=all_letters, altar=altar, path=path)
    raise RuntimeError("no courtyard found")


def _draw_solstice_arch_plate(canvas, x0, y0, w, h, gc=GRAPHITE_COLOR):
    """Engraved plate: masterwork Renaissance architectural elevation study of the Arch of the Solstice,
    the morning sun, the solstice ray, the Solar Altar with brass ring, Cairn V, and the geodetic inset plan."""
    asset_path = os.path.join(PROJECT_ROOT, "journal", "page16", "assets", "davinci_solstice_plate_clean_alpha.png")
    if os.path.exists(asset_path):
        raw_img = cv2.imread(asset_path, cv2.IMREAD_UNCHANGED)
        if raw_img is not None:
            resized = cv2.resize(raw_img, (w, h), interpolation=cv2.INTER_LANCZOS4)
            blit_rgba(canvas, resized, x0, y0)

            def lab(text, x, y, size, seed, center=False):
                t_img, _ = render_pencil_text(text, FONT_PATH, font_size=size, gc=gc, seed=seed)
                px = int(x - t_img.shape[1] / 2) if center else int(x)
                blit_rgba(canvas, t_img, px, y)

            arch_cx = x0 + int(550 * w / 1325)
            altar_cx = x0 + int(960 * w / 1325)
            cairn_cx = x0 + int(1227 * w / 1325)
            lab("Arch of the Solstice", arch_cx, y0 + h + 14, 26, 1720, center=True)
            lab("The Solar Altar", altar_cx, y0 + h + 14, 26, 1721, center=True)
            lab("Cairn V", cairn_cx, y0 + h + 14, 26, 1722, center=True)
            return y0 + h

    rng = np.random.default_rng(1601)
    draw_sketchy_rect(canvas, (x0, y0, x0 + w, y0 + h), gc=gc, alpha_base=200, passes=2, seed=1610)
    draw_sketchy_rect(canvas, (x0 + 8, y0 + 8, x0 + w - 8, y0 + h - 8), gc=gc, alpha_base=110, passes=1, seed=1614)
    gy = y0 + h - 58
    s = min(1.05, (h - 110) / 372.0)
    cx = int(x0 + w * 0.40)
    R, Ri = int(170 * s), int(116 * s)
    spring = gy - int(200 * s)

    # sky: sun, thin clouds
    sun = (x0 + 130, y0 + 92)
    draw_sketchy_circle(canvas, sun, 34, gc=gc, alpha_base=195, passes=2, seed=1620, num_pts=36)
    draw_sketchy_circle(canvas, sun, 24, gc=gc, alpha_base=115, passes=1, seed=1621, num_pts=30)
    for k in range(32):
        th = math.radians(k * 360 / 32)
        r2 = 78 if k % 2 == 0 else 62
        cv2.line(canvas, (int(sun[0] + 46 * math.cos(th)), int(sun[1] + 46 * math.sin(th))), (int(sun[0] + r2 * math.cos(th)), int(sun[1] + r2 * math.sin(th))), (*gc, 105), 1, cv2.LINE_AA)
    for k in range(14):
        yy = y0 + 26 + k * 9
        xx = x0 + 380 + int(rng.integers(0, 520))
        draw_sketchy_line(canvas, (xx, yy), (xx + int(rng.integers(70, 200)), yy), gc=gc, alpha_base=30, passes=1, seed=1630 + k)

    # temple facade of Tower II behind the arch
    fx0, fx1 = cx - int(330 * s), cx + int(330 * s)
    ftop = gy - int(250 * s)
    _clear_polygon(canvas, [(fx0, gy), (fx1, gy), (fx1, ftop), (fx0, ftop)])
    draw_sketchy_rect(canvas, (fx0, ftop, fx1, gy), gc=gc, alpha_base=90, passes=1, seed=1640)
    for k in range(8):
        yy = ftop + int((gy - ftop) * (k + 1) / 9.0)
        cv2.line(canvas, (fx0 + 4, yy), (fx1 - 4, yy), (*gc, 40), 1, cv2.LINE_AA)
    for k in range(9):
        xx = fx0 + int((fx1 - fx0) * (k + 0.5) / 9.0)
        cv2.line(canvas, (xx, ftop + 20), (xx, gy - 10), (*gc, 55), 1, cv2.LINE_AA)
    for k in range(int((fx1 - fx0) / 24)):
        xx = fx0 + 12 + k * 24
        cv2.circle(canvas, (xx, ftop + 12), 3, (*gc, 100), 1, cv2.LINE_AA)
    for xx in range(fx0 + 8, fx1, 18):
        cv2.line(canvas, (xx, ftop - 12), (xx, ftop), (*gc, 90), 1, cv2.LINE_AA)
    cv2.line(canvas, (fx0, ftop - 12), (fx1, ftop - 12), (*gc, 100), 1, cv2.LINE_AA)

    # dunes and ground
    for layer, (base, amp, a) in enumerate(((gy - 6, 8, 85), (gy + 8, 6, 120))):
        pts = [(xx, int(base + amp * math.sin(xx / 120.0 + layer * 1.6) + 3 * math.sin(xx / 39.0))) for xx in range(x0 + 12, x0 + w - 12, 8)]
        for i in range(len(pts) - 1):
            cv2.line(canvas, pts[i], pts[i + 1], (*gc, a), 1, cv2.LINE_AA)

    # the Arch: piers with courses, voussoir ring, keystone with the sun, capitals and steps
    def ring_poly(r_in, r_out, a0, a1, n=24):
        outer = [(cx + r_out * math.cos(math.radians(a0 + (a1 - a0) * i / n)), spring + r_out * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]
        inner = [(cx + r_in * math.cos(math.radians(a1 - (a1 - a0) * i / n)), spring + r_in * math.sin(math.radians(a1 - (a1 - a0) * i / n))) for i in range(n + 1)]
        return outer + inner

    for sgn in (-1, 1):
        px0, px1 = (cx - R, cx - Ri) if sgn < 0 else (cx + Ri, cx + R)
        _clear_polygon(canvas, [(px0, spring), (px1, spring), (px1, gy), (px0, gy)])
        draw_sketchy_rect(canvas, (px0, spring, px1, gy), gc=gc, alpha_base=210, passes=2, seed=1650 + sgn)
        for k in range(1, 8):
            yy = spring + int((gy - spring) * k / 8.0)
            cv2.line(canvas, (px0, yy), (px1, yy), (*gc, 120), 1, cv2.LINE_AA)
            xj = int(px0 + (px1 - px0) * (0.35 if k % 2 else 0.65))
            cv2.line(canvas, (xj, yy), (xj, yy - int((gy - spring) / 8.0)), (*gc, 90), 1, cv2.LINE_AA)
        if sgn > 0:
            _hatch_polygon(canvas, [(px0 + (px1 - px0) * 0.5, spring), (px1, spring), (px1, gy), (px0 + (px1 - px0) * 0.5, gy)], step=3, angle=90, gc=gc, alpha=90, seed=1655)
        else:
            _hatch_polygon(canvas, [(px1 - (px1 - px0) * 0.22, spring), (px1, spring), (px1, gy), (px1 - (px1 - px0) * 0.22, gy)], step=3, angle=90, gc=gc, alpha=70, seed=1656)
        draw_sketchy_rect(canvas, (px0 - 10, spring - 14, px1 + 10, spring), gc=gc, alpha_base=205, passes=2, seed=1660 + sgn)
        draw_sketchy_rect(canvas, (px0 - 16, gy - 16, px1 + 16, gy), gc=gc, alpha_base=205, passes=2, seed=1664 + sgn)
    ring = ring_poly(Ri, R, 180, 360)
    _clear_polygon(canvas, ring)
    for r_, a_ in ((R, 215), (Ri, 215)):
        _draw_arc(canvas, (cx, spring), r_, 180, 360, gc=gc, alpha=a_, seed=1670 + r_ % 7, passes=2)
    _draw_arc(canvas, (cx, spring), R + 12, 180, 360, gc=gc, alpha=110, seed=1672, passes=1)
    for deg in range(186, 360, 12):
        if 258 < deg < 282:
            continue
        th = math.radians(deg)
        cv2.line(canvas, (int(cx + Ri * math.cos(th)), int(spring + Ri * math.sin(th))), (int(cx + R * math.cos(th)), int(spring + R * math.sin(th))), (*gc, 150), 1, cv2.LINE_AA)
    _hatch_polygon(canvas, ring_poly(Ri, R, 270, 360, 12), step=3, angle=70, gc=gc, alpha=70, seed=1675)
    key = ring_poly(Ri - 8, R + 16, 262, 278, 6)
    _clear_polygon(canvas, key)
    cv2.polylines(canvas, [np.array([(int(a), int(b)) for a, b in key], dtype=np.int32)], True, (*gc, 225), 1, cv2.LINE_AA)
    kc = (cx, int(spring - (R + Ri) / 2))
    cv2.circle(canvas, kc, 9, (*gc, 210), 1, cv2.LINE_AA)
    for k in range(10):
        th = math.radians(k * 36)
        cv2.line(canvas, (int(kc[0] + 12 * math.cos(th)), int(kc[1] + 12 * math.sin(th))), (int(kc[0] + 19 * math.cos(th)), int(kc[1] + 19 * math.sin(th))), (*gc, 170), 1, cv2.LINE_AA)
    for k in range(5):
        draw_sketchy_rect(canvas, (cx - R - 36 + k * 0, gy + k * 0, cx - R - 36, gy), gc=gc, alpha_base=0, passes=1, seed=1)

    # the Solar Altar: round dais with steps and the brass focal ring
    ax = int(x0 + w * 0.70)
    for k, (rx, ry, yy) in enumerate(((132, 30, 0), (104, 24, -16), (76, 18, -30))):
        cv2.ellipse(canvas, (ax, gy - 6 + yy), (int(rx * s), int(ry * s)), 0, 0, 360, (0, 0, 0, 0), -1)
        cv2.ellipse(canvas, (ax, gy - 6 + yy), (int(rx * s), int(ry * s)), 0, 0, 360, (*gc, 210 - 25 * k), 1, cv2.LINE_AA)
        cv2.ellipse(canvas, (ax, gy - 6 + yy + 14), (int(rx * s), int(ry * s)), 0, 0, 180, (*gc, 170 - 20 * k), 1, cv2.LINE_AA)
        cv2.line(canvas, (int(ax - rx * s), gy - 6 + yy), (int(ax - rx * s), gy - 6 + yy + 14), (*gc, 150), 1, cv2.LINE_AA)
        cv2.line(canvas, (int(ax + rx * s), gy - 6 + yy), (int(ax + rx * s), gy - 6 + yy + 14), (*gc, 150), 1, cv2.LINE_AA)
    fy_ = gy - 36
    cv2.ellipse(canvas, (ax, fy_), (int(46 * s), int(11 * s)), 0, 0, 360, (*gc, 225), 2, cv2.LINE_AA)
    cv2.ellipse(canvas, (ax, fy_), (int(34 * s), int(8 * s)), 0, 0, 360, (*gc, 150), 1, cv2.LINE_AA)
    for k in range(16):
        th = math.radians(k * 22.5)
        cv2.line(canvas, (int(ax + 20 * s * math.cos(th)), int(fy_ + 5 * s * math.sin(th))), (int(ax + 44 * s * math.cos(th)), int(fy_ + 10 * s * math.sin(th))), (*gc, 120), 1, cv2.LINE_AA)
    cv2.circle(canvas, (ax, fy_), 3, (*gc, 230), -1, cv2.LINE_AA)

    # the ray: three dashed parallels from the sun, under the crown of the arch, onto the brass ring
    for off in (-10, 0, 10):
        _draw_dashed_line(canvas, (sun[0] + 40, sun[1] + 24 + off), (ax - 6, fy_ - 4 + off * 0.2), gc, dash=16, gap=9, alpha=140 if off == 0 else 90)
    cv2.circle(canvas, (ax, fy_), 20, (*gc, 60), 1, cv2.LINE_AA)

    # Cairn V beyond the altar
    _draw_cairn_elevation(canvas, 4, int(x0 + w * 0.90), gy, int(min(150, (h - 110) * 0.45)), gc, 1700)

    # labels
    def lab(text, x, y, size, seed, center=False):
        t_img, _ = render_pencil_text(text, FONT_PATH, font_size=size, gc=gc, seed=seed)
        px = int(x - t_img.shape[1] / 2) if center else int(x)
        blit_rgba(canvas, t_img, px, y)
    lab("Arch of the Solstice", cx, gy + 22, 26, 1720, center=True)
    lab("The Solar Altar", ax, gy + 22, 26, 1721, center=True)
    lab("Cairn V", int(x0 + w * 0.90), gy + 22, 26, 1722, center=True)
    lab("Brass ring", ax + 70, int(fy_ - 74), 24, 1723)
    cv2.line(canvas, (ax + 66, int(fy_ - 56)), (ax + 28, fy_ - 8), (*gc, 150), 1, cv2.LINE_AA)

    # plan inset: the 163 degree line from Cairn V to the altar
    ix, iy, iw, ih = x0 + w - 250, y0 + 18, 226, 176
    _clear_polygon(canvas, [(ix, iy), (ix + iw, iy), (ix + iw, iy + ih), (ix, iy + ih)])
    draw_sketchy_rect(canvas, (ix, iy, ix + iw, iy + ih), gc=gc, alpha_base=190, passes=2, seed=1730)
    c5 = (ix + 100, iy + 28)
    al_ = (int(c5[0] + 98 * math.sin(math.radians(163))), int(c5[1] - 98 * math.cos(math.radians(163))))
    draw_sketchy_rect(canvas, (c5[0] - 9, c5[1] - 9, c5[0] + 9, c5[1] + 9), gc=gc, alpha_base=215, passes=1, seed=1731)
    draw_sketchy_circle(canvas, al_, 13, gc=gc, alpha_base=215, passes=1, seed=1732, num_pts=24)
    cv2.circle(canvas, al_, 4, (*gc, 220), -1, cv2.LINE_AA)
    _draw_dashed_line(canvas, (c5[0] + 3, c5[1] + 11), (al_[0] - 3, al_[1] - 14), gc, dash=10, gap=7, alpha=200)
    cv2.polylines(canvas, [np.array([(ix + 28, iy + 50), (ix + 18, iy + 74), (ix + 38, iy + 74)], dtype=np.int32)], True, (*gc, 210), 1, cv2.LINE_AA)
    cv2.fillPoly(canvas, [np.array([(ix + 28, iy + 50), (ix + 38, iy + 74), (ix + 28, iy + 68)], dtype=np.int32)], (*gc, 200))
    lab("N", ix + 21, iy + 78, 24, 1733)
    lab("163°", ix + 132, iy + 60, 24, 1734)
    lab("SSE", ix + 134, iy + 84, 22, 1738)
    lab("Cairn V", c5[0] + 16, c5[1] - 14, 22, 1735)
    lab("Altar", al_[0] + 20, al_[1] - 14, 22, 1736)
    lab("Cairn V to the Altar", ix + iw / 2, iy + ih - 30, 20, 1737, center=True)
    return gy


def _draw_mirror_item(canvas, cx, cy, kind="\\", gc=GRAPHITE_COLOR, seed=42):
    """Renaissance bronze mirror: bevelled bronze casing, polished specular hatch, pivot hub and floor braces."""
    d = 20
    ux, uy = (1.0 / 1.414, 1.0 / 1.414) if kind == "\\" else (1.0 / 1.414, -1.0 / 1.414)
    nx, ny = -uy, ux
    hw = 3.5
    p1a = (int(cx - d * ux + hw * nx), int(cy - d * uy + hw * ny))
    p1b = (int(cx - d * ux - hw * nx), int(cy - d * uy - hw * ny))
    p2a = (int(cx + d * ux + hw * nx), int(cy + d * uy + hw * ny))
    p2b = (int(cx + d * ux - hw * nx), int(cy + d * uy - hw * ny))
    _clear_polygon(canvas, [p1a, p2a, p2b, p1b])
    cv2.line(canvas, p1a, p2a, (*gc, 225), 1, cv2.LINE_AA)
    cv2.line(canvas, p1b, p2b, (*gc, 225), 1, cv2.LINE_AA)
    cv2.line(canvas, p1a, p1b, (*gc, 210), 1, cv2.LINE_AA)
    cv2.line(canvas, p2a, p2b, (*gc, 210), 1, cv2.LINE_AA)
    for pt in (p1a, p1b, p2a, p2b):
        cv2.circle(canvas, pt, 1, (*gc, 200), -1, cv2.LINE_AA)
    for t_frac in (-0.5, -0.2, 0.1, 0.4):
        sx = int(cx + t_frac * d * ux)
        sy = int(cy + t_frac * d * uy)
        l1 = (int(sx - 2 * nx), int(sy - 2 * ny))
        l2 = (int(sx + 2 * nx), int(sy + 2 * ny))
        cv2.line(canvas, l1, l2, (*gc, 130), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), 5, (*gc, 220), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), 3, (*gc, 140), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), 1, (*gc, 240), -1, cv2.LINE_AA)
    for sign in (-1, 1):
        bx = int(cx + sign * 10 * ux - 5 * nx)
        by = int(cy + sign * 10 * uy - 5 * ny)
        cv2.line(canvas, (int(cx + sign * 10 * ux), int(cy + sign * 10 * uy)), (bx, by), (*gc, 150), 1, cv2.LINE_AA)
        cv2.circle(canvas, (bx, by), 1, (*gc, 180), -1, cv2.LINE_AA)


def _draw_pillar_item(canvas, cx, cy, gc=GRAPHITE_COLOR, seed=42):
    """Classical fluted column drum: 16 perimeter flutes, mortise center hole, stone fractures & graphite volume hatching."""
    _clear_polygon(canvas, [(cx - 24, cy - 24), (cx + 24, cy - 24), (cx + 24, cy + 24), (cx - 24, cy + 24)])
    draw_sketchy_circle(canvas, (cx, cy), 22, gc=gc, alpha_base=225, passes=2, seed=seed, num_pts=32)
    draw_sketchy_circle(canvas, (cx, cy), 16, gc=gc, alpha_base=135, passes=1, seed=seed + 1, num_pts=24)
    for k in range(16):
        th = math.radians(k * 22.5)
        p_in = (int(cx + 16 * math.cos(th)), int(cy + 16 * math.sin(th)))
        p_out = (int(cx + 22 * math.cos(th)), int(cy + 22 * math.sin(th)))
        cv2.line(canvas, p_in, p_out, (*gc, 160), 1, cv2.LINE_AA)
    m_box = (cx - 3, cy - 3, cx + 3, cy + 3)
    draw_sketchy_rect(canvas, m_box, gc=gc, alpha_base=210, passes=1, seed=seed + 2)
    cv2.rectangle(canvas, (cx - 2, cy - 2), (cx + 2, cy + 2), (*gc, 180), -1)
    pts_crack = [
        (int(cx + 22 * math.cos(math.radians(205))), int(cy + 22 * math.sin(math.radians(205)))),
        (int(cx + 12 * math.cos(math.radians(195))), int(cy + 12 * math.sin(math.radians(195)))),
        (cx - 3, cy + 1),
        (int(cx + 8 * math.cos(math.radians(45))), int(cy + 8 * math.sin(math.radians(45)))),
        (int(cx + 18 * math.cos(math.radians(40))), int(cy + 18 * math.sin(math.radians(40)))),
    ]
    cv2.polylines(canvas, [np.array(pts_crack, dtype=np.int32)], False, (*gc, 190), 1, cv2.LINE_AA)
    cv2.line(canvas, pts_crack[1], (pts_crack[1][0] + 3, pts_crack[1][1] - 5), (*gc, 140), 1, cv2.LINE_AA)
    crescent_pts = []
    for deg in range(300, 420, 15):
        rad = math.radians(deg)
        crescent_pts.append((int(cx + 21 * math.cos(rad)), int(cy + 21 * math.sin(rad))))
    for deg in range(405, 315, -20):
        rad = math.radians(deg)
        crescent_pts.append((int(cx + 9 * math.cos(rad)), int(cy + 9 * math.sin(rad))))
    if len(crescent_pts) > 2:
        _hatch_polygon(canvas, crescent_pts, step=3, angle=65, gc=gc, alpha=90, seed=seed + 3)
    cv2.circle(canvas, (cx - 25, cy + 5), 1, (*gc, 150), -1, cv2.LINE_AA)
    cv2.circle(canvas, (cx - 23, cy + 10), 2, (*gc, 130), -1, cv2.LINE_AA)


def _draw_sun_stone_item(canvas, cx, cy, letter="S", gc=GRAPHITE_COLOR, seed=42):
    """Carved sunburst stone medallion: 12 radial solar rays in bas-relief, carved ring, engraved letter."""
    _clear_polygon(canvas, [(cx - 25, cy - 25), (cx + 25, cy - 25), (cx + 25, cy + 25), (cx - 25, cy + 25)])
    draw_sketchy_circle(canvas, (cx, cy), 23, gc=gc, alpha_base=225, passes=2, seed=seed, num_pts=32)
    draw_sketchy_circle(canvas, (cx, cy), 18, gc=gc, alpha_base=130, passes=1, seed=seed + 1, num_pts=24)
    for k in range(12):
        th = math.radians(k * 30)
        th1 = math.radians(k * 30 - 7)
        th2 = math.radians(k * 30 + 7)
        p_tip = (int(cx + 23 * math.cos(th)), int(cy + 23 * math.sin(th)))
        p_b1 = (int(cx + 18 * math.cos(th1)), int(cy + 18 * math.sin(th1)))
        p_b2 = (int(cx + 18 * math.cos(th2)), int(cy + 18 * math.sin(th2)))
        cv2.line(canvas, p_b1, p_tip, (*gc, 160), 1, cv2.LINE_AA)
        cv2.line(canvas, p_b2, p_tip, (*gc, 160), 1, cv2.LINE_AA)
    draw_sketchy_circle(canvas, (cx, cy), 14, gc=gc, alpha_base=75, passes=1, seed=seed + 2, num_pts=20)
    t_img, _ = render_pencil_text(letter, FONT_PATH, font_size=26, gc=gc, seed=seed + 3)
    lx = int(cx - t_img.shape[1] / 2)
    ly = int(cy - t_img.shape[0] / 2 + 4)
    blit_rgba(canvas, t_img, lx, ly)


def _draw_altar_item(canvas, cx, cy, gc=GRAPHITE_COLOR, seed=42):
    """The Solar Altar: tiered dais, astronomical brass ring with 24 degree marks, central radiant sunburst & focus."""
    _clear_polygon(canvas, [(cx - 31, cy - 31), (cx + 31, cy - 31), (cx + 31, cy + 31), (cx - 31, cy + 31)])
    draw_sketchy_circle(canvas, (cx, cy), 29, gc=gc, alpha_base=225, passes=2, seed=seed, num_pts=36)
    draw_sketchy_circle(canvas, (cx, cy), 26, gc=gc, alpha_base=140, passes=1, seed=seed + 1, num_pts=32)
    draw_sketchy_circle(canvas, (cx, cy), 23, gc=gc, alpha_base=210, passes=1, seed=seed + 2, num_pts=30)
    draw_sketchy_circle(canvas, (cx, cy), 16, gc=gc, alpha_base=180, passes=1, seed=seed + 3, num_pts=26)
    for k in range(24):
        th = math.radians(k * 15)
        r_in = 18 if k % 6 != 0 else 16
        cv2.line(canvas, (int(cx + r_in * math.cos(th)), int(cy + r_in * math.sin(th))),
                         (int(cx + 23 * math.cos(th)), int(cy + 23 * math.sin(th))), (*gc, 160 if k % 6 == 0 else 110), 1, cv2.LINE_AA)
    for k in range(4):
        th = math.radians(k * 90)
        cv2.circle(canvas, (int(cx + 20 * math.cos(th)), int(cy + 20 * math.sin(th))), 1, (*gc, 230), -1, cv2.LINE_AA)
    draw_sketchy_circle(canvas, (cx, cy), 11, gc=gc, alpha_base=160, passes=1, seed=seed + 4, num_pts=22)
    for k in range(12):
        th = math.radians(k * 30)
        r_tip = 11 if k % 2 == 0 else 9
        cv2.line(canvas, (int(cx + 4 * math.cos(th)), int(cy + 4 * math.sin(th))),
                         (int(cx + r_tip * math.cos(th)), int(cy + r_tip * math.sin(th))), (*gc, 180), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), 3, (*gc, 240), -1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), 4, (*gc, 180), 1, cv2.LINE_AA)


def _draw_courtyard_cells(canvas, x0, y0, rows, cols, cell, data, gc=GRAPHITE_COLOR):
    """The paved courtyard: ashlar stone border, textured flagstones, Renaissance bronze mirrors,
    fluted fallen column drums, carved sun-stone medallions, the Solar Altar and the Solstice Gate."""
    w, h = cols * cell, rows * cell
    # 1. Outer ashlar curb (14 px stone border with division notches and reinforced corners)
    draw_sketchy_rect(canvas, (x0 - 14, y0 - 14, x0 + w + 14, y0 + h + 14), gc=gc, alpha_base=215, passes=2, seed=1801)
    draw_sketchy_rect(canvas, (x0 - 2, y0 - 2, x0 + w + 2, y0 + h + 2), gc=gc, alpha_base=160, passes=1, seed=1802)
    for c in range(cols + 1):
        cx_ = x0 + c * cell
        cv2.line(canvas, (cx_, y0 - 14), (cx_, y0 - 2), (*gc, 110), 1, cv2.LINE_AA)
        cv2.line(canvas, (cx_, y0 + h + 2), (cx_, y0 + h + 14), (*gc, 110), 1, cv2.LINE_AA)
    for r in range(rows + 1):
        cy_ = y0 + r * cell
        cv2.line(canvas, (x0 - 14, cy_), (x0 - 2, cy_), (*gc, 110), 1, cv2.LINE_AA)
        cv2.line(canvas, (x0 + w + 2, cy_), (x0 + w + 14, cy_), (*gc, 110), 1, cv2.LINE_AA)
    for corner in ((x0 - 8, y0 - 8), (x0 + w + 8, y0 - 8), (x0 - 8, y0 + h + 8), (x0 + w + 8, y0 + h + 8)):
        cv2.circle(canvas, corner, 3, (*gc, 180), 1, cv2.LINE_AA)
        cv2.circle(canvas, corner, 1, (*gc, 220), -1, cv2.LINE_AA)

    # 2. Flagstone paving with subtle sandstone texture
    rng = np.random.default_rng(1803)
    for r in range(rows):
        for c in range(cols):
            x, y = x0 + c * cell, y0 + r * cell
            draw_sketchy_rect(canvas, (x + 2, y + 2, x + cell - 2, y + cell - 2), gc=gc, alpha_base=65, passes=1, seed=1900 + r * 31 + c)
            if (c * 7 + r * 13) % 4 == 0:
                for k in range(3):
                    ox = 10 + k * 14
                    cv2.line(canvas, (x + ox, y + 8), (x + ox + 18, y + 26), (*gc, 28), 1, cv2.LINE_AA)
            if (c * 11 + r * 19) % 9 == 0:
                kx, ky = x + 16, y + 16
                cv2.line(canvas, (kx, ky), (kx + 8, ky + 5), (*gc, 65), 1, cv2.LINE_AA)
                cv2.line(canvas, (kx + 8, ky + 5), (kx + 14, ky + 3), (*gc, 50), 1, cv2.LINE_AA)
            cv2.circle(canvas, (x, y), 1, (*gc, 75), -1, cv2.LINE_AA)

    half = cell // 2

    def center(c, r):
        return x0 + c * cell + half, y0 + r * cell + half

    # 3. Bronze mirrors
    for (c, r), kind in data["mirrors"].items():
        mx, my = center(c, r)
        _draw_mirror_item(canvas, mx, my, kind=kind, gc=gc, seed=2000 + c * 17 + r)

    # 4. Fallen pillars
    for (c, r) in data["pillars"]:
        mx, my = center(c, r)
        _draw_pillar_item(canvas, mx, my, gc=gc, seed=2100 + c * 13 + r)

    # 5. Sun-stones
    for (c, r), ch in data["letters"].items():
        mx, my = center(c, r)
        _draw_sun_stone_item(canvas, mx, my, letter=ch, gc=gc, seed=2200 + c * 7 + r)

    # 6. The Solar Altar
    ac, ar = data["altar"]
    mx, my = center(ac, ar)
    _draw_altar_item(canvas, mx, my, gc=gc, seed=2300)

    # 7. Solstice gate crowning the entry column
    gcx = x0 + data["start_c"] * cell + half
    gate_y = y0 - 10
    for side in (-1, 1):
        px0 = gcx + side * 28 - (8 if side > 0 else 0)
        px1 = px0 + 8
        draw_sketchy_rect(canvas, (px0, gate_y - 42, px1, gate_y - 2), gc=gc, alpha_base=180, passes=1, seed=2400 + side)
        for yy in range(gate_y - 34, gate_y - 2, 10):
            cv2.line(canvas, (px0, yy), (px1, yy), (*gc, 120), 1, cv2.LINE_AA)
    for rad, a_ in ((28, 220), (20, 160)):
        _draw_arc(canvas, (gcx, gate_y - 42), rad, 180, 360, gc=gc, alpha=a_, seed=2410 + rad, passes=1)
    for deg in range(195, 350, 20):
        th = math.radians(deg)
        cv2.line(canvas, (int(gcx + 20 * math.cos(th)), int(gate_y - 42 + 20 * math.sin(th))),
                         (int(gcx + 28 * math.cos(th)), int(gate_y - 42 + 28 * math.sin(th))), (*gc, 140), 1, cv2.LINE_AA)
    kc = (gcx, gate_y - 42 - 28)
    draw_sketchy_rect(canvas, (gcx - 6, kc[1] - 5, gcx + 6, kc[1] + 5), gc=gc, alpha_base=210, passes=1, seed=2420)
    cv2.circle(canvas, kc, 3, (*gc, 220), -1, cv2.LINE_AA)
    _draw_dashed_line(canvas, (gcx, gate_y - 64), (gcx, gate_y + 6), gc, dash=7, gap=5, alpha=170)
    arrow_pts = np.array([(gcx, y0 + 20), (gcx - 7, y0 + 4), (gcx + 7, y0 + 4)], dtype=np.int32)
    cv2.fillPoly(canvas, [arrow_pts], (*gc, 220))
    cv2.polylines(canvas, [arrow_pts], True, (*gc, 240), 1, cv2.LINE_AA)
    t_img, _ = render_pencil_text("Arch of the Solstice", FONT_PATH, font_size=23, gc=gc, seed=2430)
    blit_rgba(canvas, t_img, gcx + 38, gate_y - 50)


def _render_16b_page(gc: tuple = GRAPHITE_COLOR):
    """Sheet 16 · Cara B (Back: X > 1583 has 0 px). Game D8: trace the solstice ray through the courtyard to the Solar Altar."""
    from scripts.journal.build_page06_07 import create_handdrawn_divider, draw_desert_path_seal, wrap_text_to_width

    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    X0, W = 180, 1360
    BODY, BODY_LH = 35, 50
    SEC, SEC_LH = 44, 60
    ROWS, COLS, CELL = 11, 12, 64
    data = _build_ray_courtyard(ROWS, COLS, RAY_SIGIL)

    def put(text, x, y, size, seed):
        t_img, _ = render_pencil_text(text, FONT_PATH, font_size=size, gc=gc, seed=seed)
        blit_rgba(canvas, t_img, x, y)
        return t_img.shape[1]

    def put_centered(text, cx, y, size, seed):
        t_img, _ = render_pencil_text(text, FONT_PATH, font_size=size, gc=gc, seed=seed)
        blit_rgba(canvas, t_img, int(cx - t_img.shape[1] / 2), y)

    def paragraph(text, x, y, max_w, size=BODY, lh=BODY_LH, seed=0):
        for k, ln in enumerate(wrap_text_to_width(text, FONT_PATH, size, max_w)):
            put(ln, x, y, size, seed + k * 3)
            y += lh
        return y

    # ------------------------------------------------------------------ header
    put("Arch of the Solstice & The Solar Altar", X0, 80, 64, 10001)
    blit_rgba(canvas, create_handdrawn_divider(width=W, gc=gc, seed=10003), X0, 172)

    # ------------------------------------------------------------------ I. The Arch at the Edge of the Sands
    y = 230
    put("I. The Arch at the Edge of the Sands", X0, y, SEC, 10010)
    y += SEC_LH
    sec1_text = (
        "Beyond the chasm, the trail opens before Tower II: the Sandstone Sanctuary. "
        "Here stands the Arch of the Solstice, and on the terrace rests the Solar Altar. "
        "From the dunes (163°), Cairn V watches as the fifth and final marker. "
        "At midsummer dawn, the sun's first ray slips beneath the arch. Guided by bronze mirrors, "
        "the beam weaves through the courtyard to strike the altar and reveal the last seal."
    )
    y = paragraph(sec1_text, X0, y, W, seed=10012)
    y += 26

    # ------------------------------------------------------------------ plan the page
    RX, RW = X0 + COLS * CELL + 52, W - COLS * CELL - 52
    rules = [
        [
            "1. The ray enters at the arch (see arrow) and",
            "travels straight down the courtyard."
        ],
        [
            "2. Bronze mirrors reflect the ray 90° along",
            "their slant. Fallen pillars stop the light."
        ],
        [
            "3. Follow the true beam to the Solar Altar.",
            "Record each lettered sun-stone crossed, in",
            "order, to reveal the eight-letter Sigil."
        ]
    ]
    plate_h = 540

    # ------------------------------------------------------------------ plate
    gy = _draw_solstice_arch_plate(canvas, X0, y, W, plate_h, gc)
    y += plate_h + 46 + 28

    # ------------------------------------------------------------------ II. The Courtyard of Rays
    put("II. The Courtyard of Rays", X0, y, SEC, 10030)
    y += SEC_LH + 6
    gx0, gy0 = X0 + 4, y + 130
    _draw_courtyard_cells(canvas, gx0, gy0, ROWS, COLS, CELL, data, gc)
    # right column: the rules, the key and a note of Hermes
    ry = y + 16
    for k, rl in enumerate(rules):
        for j, ln in enumerate(rl):
            put(ln, RX + (0 if j == 0 else 24), ry, 28, 10040 + k * 11 + j * 3)
            ry += 38
        ry += 14
    ry += 24
    put("Key", RX, ry, 34, 10080)
    ry += 76
    kx = RX + 34
    tx = RX + 88
    # mirror
    _draw_mirror_item(canvas, kx, ry, kind="/", gc=gc, seed=10081)
    put("Bronze mirror", tx, ry - 14, 28, 10081)
    ry += 68
    _draw_pillar_item(canvas, kx, ry, gc=gc, seed=10084)
    put("Fallen pillar", tx, ry - 14, 28, 10084)
    ry += 68
    _draw_sun_stone_item(canvas, kx, ry, letter="S", gc=gc, seed=10088)
    put("Sun-stone (a letter)", tx, ry - 14, 28, 10088)
    ry += 70
    _draw_altar_item(canvas, kx, ry, gc=gc, seed=10092)
    put("The Solar Altar (the goal)", tx, ry - 14, 28, 10092)
    ry += 60
    # note of Hermes / Cartographer
    nb_h = 145
    nb_top = max(ry + 20, gy0 + ROWS * CELL - nb_h)
    draw_sketchy_rect(canvas, (RX, nb_top, RX + RW, nb_top + nb_h), gc=gc, alpha_base=200, passes=2, seed=10100)
    draw_sketchy_rect(canvas, (RX + 8, nb_top + 8, RX + RW - 8, nb_top + nb_h - 8), gc=gc, alpha_base=110, passes=1, seed=10104)
    put("Cartographer's note", RX + 24, nb_top + 18, 28, 10108)
    ny_ = nb_top + 58
    for ln in wrap_text_to_width("«A true mirror does not choose its path. It only reflects the light it receives.»", FONT_PATH, 28, RW - 50):
        put(ln, RX + 26, ny_, 28, 10110 + ny_ % 17)
        ny_ += 36
    y = gy0 + ROWS * CELL + 45

    # ------------------------------------------------------------------ answer bar
    put("The Sigil of Cairn V:", X0, y, 36, 10130)
    y += 52
    box_w, box_h, gap = 140, 88, 20
    for k in range(len(RAY_SIGIL)):
        bx = X0 + k * (box_w + gap)
        draw_sketchy_rect(canvas, (bx, y, bx + box_w, y + box_h), gc=gc, alpha_base=200, passes=2, seed=10140 + k * 5)
        draw_sketchy_rect(canvas, (bx + 6, y + 6, bx + box_w - 6, y + box_h - 6), gc=gc, alpha_base=90, passes=1, seed=10141 + k * 5)
        n_img, _ = render_pencil_text(str(k + 1), FONT_PATH, font_size=22, gc=gc, seed=10170 + k)
        blit_rgba(canvas, n_img, bx + 12, y + 7)
    y += box_h + 24
    put("Speak this eight-letter Sigil at Cairn V to claim the fifth and final seal.", X0, y, 30, 10180)
    y += 52

    canvas[:, 1583:, 3] = 0
    return canvas, data, y


def render_game_d8_arch_solstice_altar(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 16 · Cara B."""
    canvas, _data, _end_y = _render_16b_page(gc)
    return canvas


# =========================================================================
# SHEET 18 · CARA A: JUEGO D10 — THE ORACLE'S HORIZON (TRIPLE TOWER CLIMAX)
# =========================================================================

HORIZON_SIGIL = "OVERTURE"
# Beacons 1..8 as (column, row), 1-indexed. Mirror I is the upright line on column 4, Mirror II is the stepped
# horizon of Tower II (Column 6 raised to Row D, Columns 5, 7, 8, 9 resting on Row F), and Mirror III is the
# upright line on column 10. Reflections preserve the distance to the active mirror level.
HORIZON_BEACONS = ((2, 1), (1, 3), (3, 3), (2, 4), (1, 6), (3, 6), (2, 7), (3, 8))
HORIZON_COLS, HORIZON_ROWS = 16, 9


def _horizon_final(cell):
    x, y = cell
    # Reflection 1: Mirror I at Column 4 (upright line)
    x = 8 - x
    # Reflection 2: Mirror II at Columns 5..9 (stepped horizon of Tower II)
    h = 4 if x == 6 else 6
    y = 2 * h - y
    # Reflection 3: Mirror III at Column 10 (upright line)
    x = 20 - x
    return x, y


def _horizon_letter_grid():
    import random
    rnd = random.Random(2310)
    grid = {}
    mirror_cells = set()
    for r in range(1, HORIZON_ROWS + 1):
        mirror_cells.add((4, r))
        mirror_cells.add((10, r))
    # Stepped Sanctuary Mirror II in courtyard (Cols 5..9)
    mirror_cells.add((5, 6))
    mirror_cells.add((6, 4))
    mirror_cells.add((6, 5))
    mirror_cells.add((6, 6))
    mirror_cells.add((7, 6))
    mirror_cells.add((8, 6))
    mirror_cells.add((9, 6))
    beacon_cells = set(HORIZON_BEACONS)
    for r in range(1, HORIZON_ROWS + 1):
        for c in range(1, HORIZON_COLS + 1):
            if (c, r) in mirror_cells or (c, r) in beacon_cells:
                continue
            grid[(c, r)] = rnd.choice("ABCDEFGHILMNOPRSTUVWY")
    for k, b in enumerate(HORIZON_BEACONS):
        fc = _horizon_final(b)
        assert 1 <= fc[0] <= HORIZON_COLS and 1 <= fc[1] <= HORIZON_ROWS and fc in grid
        grid[fc] = HORIZON_SIGIL[k]
    return grid


def _draw_sandstone_sanctuary_plate(canvas, x0, y0, w, h, gc=GRAPHITE_COLOR):
    """Architectural plate: Leonardo da Vinci study of The Sandstone Sanctuary (Tower II)
    inside (vault, zenith oculus, light beam, altar, astrolabe) and outside (pylons, staircase, dunes)."""
    draw_sketchy_rect(canvas, (x0, y0, x0 + w, y0 + h), gc=gc, alpha_base=205, passes=2, seed=1810)
    draw_sketchy_rect(canvas, (x0 + 8, y0 + 8, x0 + w - 8, y0 + h - 8), gc=gc, alpha_base=110, passes=1, seed=1814)

    # Rosette / corner anchor studs
    for cx, cy in [(x0 + 8, y0 + 8), (x0 + w - 8, y0 + 8), (x0 + w - 8, y0 + h - 8), (x0 + 8, y0 + h - 8)]:
        cv2.circle(canvas, (cx, cy), 3, (*gc, 200), -1, cv2.LINE_AA)
        cv2.circle(canvas, (cx, cy), 6, (*gc, 120), 1, cv2.LINE_AA)

    asset_path = os.path.join(PROJECT_ROOT, "journal", "page18", "assets", "davinci_sandstone_sanctuary_clean_alpha.png")
    if os.path.exists(asset_path):
        raw_img = cv2.imread(asset_path, cv2.IMREAD_UNCHANGED)
        if raw_img is not None:
            resized = cv2.resize(raw_img, (w - 24, h - 24), interpolation=cv2.INTER_LANCZOS4)
            blit_rgba(canvas, resized, x0 + 12, y0 + 12)
            return y0 + h

    # Procedural Renaissance elevation fallback if asset file is missing
    gy = y0 + h - 42
    s = max(0.6, (h - 90) / 190.0)
    c2 = x0 + w // 2

    # Stepped sandstone plinth
    for k, (hw, hh) in enumerate(((180, 24), (150, 24), (120, 24))):
        top_ = gy - int(24 * s * k + 24 * s)
        draw_sketchy_rect(canvas, (c2 - int(hw * s), top_, c2 + int(hw * s), gy - int(24 * s * k)), gc=gc, alpha_base=205, passes=2, seed=1850 + k)
    tw2, base2 = int(90 * s), gy - int(72 * s)
    t2_top = gy - int(190 * s)
    draw_sketchy_rect(canvas, (c2 - tw2, t2_top, c2 + tw2, base2), gc=gc, alpha_base=210, passes=2, seed=1856)

    # Barrel vault / oculus
    _draw_arc(canvas, (c2, t2_top), tw2, 180, 360, gc=gc, alpha=215, seed=1860, passes=2)
    cv2.circle(canvas, (c2, t2_top - int(30 * s)), int(14 * s), (*gc, 200), 1, cv2.LINE_AA)
    return y0 + h


def _draw_mirror_chart(canvas, x0, y0, cell, grid, gc=GRAPHITE_COLOR):
    """The Oracle's chart: letters on a field of squares, eight numbered beacons on the west edge,
    and the three polished bronze mirrors: Mirror I (Meridian, Col 4), Mirror II (The Stepped Sanctuary
    Horizon across Columns 5..9, with the High Altar at Row D and the Terrace at Row F), and Mirror III
    (Stage Horizon, Col 10), executed in authentic Renaissance astronomical draughtsmanship."""
    cols, rows = HORIZON_COLS, HORIZON_ROWS
    w, h = cols * cell, rows * cell

    # 1. Renaissance Astronomical Frame & Corner Brackets
    draw_sketchy_rect(canvas, (x0 - 10, y0 - 10, x0 + w + 10, y0 + h + 10), gc=gc, alpha_base=215, passes=2, seed=1901)
    draw_sketchy_rect(canvas, (x0 - 2, y0 - 2, x0 + w + 2, y0 + h + 2), gc=gc, alpha_base=130, passes=1, seed=1902)

    # Corner rosettes & L-shaped bracket reinforcements
    bracket_len = 24
    for cx, cy, dx, dy in [
        (x0 - 10, y0 - 10, 1, 1),
        (x0 + w + 10, y0 - 10, -1, 1),
        (x0 + w + 10, y0 + h + 10, -1, -1),
        (x0 - 10, y0 + h + 10, 1, -1),
    ]:
        cv2.circle(canvas, (cx, cy), 3, (*gc, 210), -1, cv2.LINE_AA)
        cv2.circle(canvas, (cx, cy), 6, (*gc, 130), 1, cv2.LINE_AA)
        cv2.line(canvas, (cx, cy + dy * 10), (cx, cy + dy * bracket_len), (*gc, 160), 1, cv2.LINE_AA)
        cv2.line(canvas, (cx + dx * 10, cy), (cx + dx * bracket_len, cy), (*gc, 160), 1, cv2.LINE_AA)

    # Astrolabe grid lines
    for c in range(1, cols):
        cv2.line(canvas, (x0 + c * cell, y0), (x0 + c * cell, y0 + h), (*gc, 50), 1, cv2.LINE_AA)
    for r in range(1, rows):
        cv2.line(canvas, (x0, y0 + r * cell), (x0 + w, y0 + r * cell), (*gc, 50), 1, cv2.LINE_AA)

    # Coordinates & Graduation Ticks
    for c in range(1, cols + 1):
        t_img, _ = render_pencil_text(str(c), FONT_PATH, font_size=24, gc=gc, seed=1910 + c)
        blit_rgba(canvas, t_img, int(x0 + (c - 0.5) * cell - t_img.shape[1] / 2), y0 - 40)
        cv2.line(canvas, (int(x0 + (c - 0.5) * cell), y0 - 10), (int(x0 + (c - 0.5) * cell), y0 - 2), (*gc, 120), 1, cv2.LINE_AA)

    for r in range(1, rows + 1):
        t_img, _ = render_pencil_text("ABCDEFGHI"[r - 1], FONT_PATH, font_size=24, gc=gc, seed=1930 + r)
        blit_rgba(canvas, t_img, int(x0 - 38 - t_img.shape[1] / 2 + 8), int(y0 + (r - 0.5) * cell - t_img.shape[0] / 2 + 3))
        cv2.line(canvas, (x0 - 10, int(y0 + (r - 0.5) * cell)), (x0 - 2, int(y0 + (r - 0.5) * cell)), (*gc, 120), 1, cv2.LINE_AA)

    # Grid letters
    for (c, r), ch in grid.items():
        t_img, _ = render_pencil_text(ch, FONT_PATH, font_size=32, gc=gc, seed=1950 + c * 17 + r)
        blit_rgba(canvas, t_img, int(x0 + (c - 0.5) * cell - t_img.shape[1] / 2), int(y0 + (r - 0.5) * cell - t_img.shape[0] / 2 + 4))

    # 2. Mirror I (Col 4) & Mirror III (Col 10) — Upright Bronze Columns
    for idx, k in enumerate((4, 10)):
        xm = int(x0 + (k - 0.5) * cell)
        _clear_polygon(canvas, [(xm - 12, y0 + 2), (xm + 12, y0 + 2), (xm + 12, y0 + h - 2), (xm - 12, y0 + h - 2)])
        for off in (-7, 7):
            draw_sketchy_line(canvas, (xm + off, y0 + 6), (xm + off, y0 + h - 6), gc=gc, alpha_base=215, passes=2, seed=1970 + idx * 4 + (off > 0))
        for yy in range(y0 + 20, y0 + h - 12, 28):
            cv2.line(canvas, (xm - 4, yy + 7), (xm + 4, yy), (*gc, 150), 1, cv2.LINE_AA)
        for yy in (y0 + 6, y0 + h - 6):
            cv2.line(canvas, (xm - 11, yy), (xm + 11, yy), (*gc, 215), 1, cv2.LINE_AA)
            cv2.circle(canvas, (xm, yy), 3, (*gc, 200), -1, cv2.LINE_AA)
        name = "Mirror I · Meridian" if idx == 0 else "Mirror III · Stage"
        t_img, _ = render_pencil_text(name, FONT_PATH, font_size=25, gc=gc, seed=2000 + idx)
        blit_rgba(canvas, t_img, int(xm - t_img.shape[1] / 2), y0 - 70)

    # Mirror II Header above courtyard
    m2_head, _ = render_pencil_text("Mirror II", FONT_PATH, font_size=26, gc=gc, seed=2005)
    blit_rgba(canvas, m2_head, int(x0 + 7 * cell - m2_head.shape[1] / 2), y0 - 70)

    # 3. Mirror II (Columns 5..9) — Stepped Sanctuary Bronze Horizon
    y_f = int(y0 + (6 - 0.5) * cell)
    y_d = int(y0 + (4 - 0.5) * cell)

    x_c5_start = x0 + 4 * cell + 8
    x_c5_end = x0 + 5 * cell
    x_c6_start = x0 + 5 * cell
    x_c6_end = x0 + 6 * cell
    x_c7_start = x0 + 6 * cell
    x_c9_end = x0 + 9 * cell - 8

    # Terrace bar across Col 5
    _clear_polygon(canvas, [(x_c5_start, y_f - 11), (x_c5_end, y_f - 11), (x_c5_end, y_f + 11), (x_c5_start, y_f + 11)])
    for off in (-6, 6):
        cv2.line(canvas, (x_c5_start, y_f + off), (x_c5_end, y_f + off), (*gc, 215), 2, cv2.LINE_AA)
    for xx in range(x_c5_start + 6, x_c5_end - 4, 18):
        cv2.line(canvas, (xx + 6, y_f - 3), (xx, y_f + 3), (*gc, 140), 1, cv2.LINE_AA)

    # Terrace bar across Cols 7..9
    _clear_polygon(canvas, [(x_c7_start, y_f - 11), (x_c9_end, y_f - 11), (x_c9_end, y_f + 11), (x_c7_start, y_f + 11)])
    for off in (-6, 6):
        cv2.line(canvas, (x_c7_start, y_f + off), (x_c9_end, y_f + off), (*gc, 215), 2, cv2.LINE_AA)
    for xx in range(x_c7_start + 6, x_c9_end - 4, 18):
        cv2.line(canvas, (xx + 6, y_f - 3), (xx, y_f + 3), (*gc, 140), 1, cv2.LINE_AA)

    # High Altar bar across Col 6 at Row D
    _clear_polygon(canvas, [(x_c6_start, y_d - 11), (x_c6_end, y_d - 11), (x_c6_end, y_d + 11), (x_c6_start, y_d + 11)])
    for off in (-6, 6):
        cv2.line(canvas, (x_c6_start, y_d + off), (x_c6_end, y_d + off), (*gc, 220), 2, cv2.LINE_AA)
    for xx in range(x_c6_start + 6, x_c6_end - 4, 18):
        cv2.line(canvas, (xx + 6, y_d - 3), (xx, y_d + 3), (*gc, 150), 1, cv2.LINE_AA)

    # Vertical stepped risers linking Row F and Row D at Col 6 boundaries
    for rx in (x_c6_start, x_c6_end):
        _clear_polygon(canvas, [(rx - 9, y_d - 7), (rx + 9, y_d - 7), (rx + 9, y_f + 7), (rx - 9, y_f + 7)])
        for off in (-6, 6):
            cv2.line(canvas, (rx + off, y_d - 6), (rx + off, y_f + 6), (*gc, 215), 2, cv2.LINE_AA)
        for yy in range(y_d + 10, y_f - 4, 18):
            cv2.line(canvas, (rx - 3, yy + 6), (rx + 3, yy), (*gc, 140), 1, cv2.LINE_AA)
        cv2.circle(canvas, (rx, y_d), 3, (*gc, 200), -1, cv2.LINE_AA)
        cv2.circle(canvas, (rx, y_f), 3, (*gc, 200), -1, cv2.LINE_AA)

    # Col 6 Sacred Altar Niche & Plinth below Row D (Rows E and F)
    niche_x0, niche_x1 = x_c6_start + 4, x_c6_end - 4
    niche_y0, niche_y1 = y_d + 12, y_f + 16
    _clear_polygon(canvas, [(niche_x0, niche_y0), (niche_x1, niche_y0), (niche_x1, niche_y1), (niche_x0, niche_y1)])
    arch_cx = (niche_x0 + niche_x1) // 2
    arch_r = (niche_x1 - niche_x0) // 2 - 4
    cv2.ellipse(canvas, (arch_cx, niche_y0 + arch_r + 4), (arch_r, arch_r), 0, 180, 360, (*gc, 140), 1, cv2.LINE_AA)
    cv2.ellipse(canvas, (arch_cx, niche_y0 + arch_r + 4), (arch_r - 4, arch_r - 4), 0, 180, 360, (*gc, 80), 1, cv2.LINE_AA)
    for py in (niche_y0 + arch_r * 2 + 10, niche_y0 + arch_r * 2 + 30, niche_y0 + arch_r * 2 + 50):
        if py < niche_y1 - 6:
            cv2.line(canvas, (niche_x0 + 4, py), (niche_x1 - 4, py), (*gc, 100), 1, cv2.LINE_AA)
    cv2.circle(canvas, (arch_cx, niche_y0 + arch_r + 4), 5, (*gc, 180), -1, cv2.LINE_AA)
    cv2.circle(canvas, (arch_cx, niche_y0 + arch_r + 4), 8, (*gc, 110), 1, cv2.LINE_AA)

    # Architectural labels to the right of the grid
    alt_lbl, _ = render_pencil_text("The Altar · Row D", FONT_PATH, font_size=21, gc=gc, seed=2010)
    blit_rgba(canvas, alt_lbl, x0 + w + 16, y_d - alt_lbl.shape[0] // 2)

    ter_lbl, _ = render_pencil_text("The Terrace · Row F", FONT_PATH, font_size=21, gc=gc, seed=2012)
    blit_rgba(canvas, ter_lbl, x0 + w + 16, y_f - ter_lbl.shape[0] // 2)

    # 4. Beacons (1..8) with Da Vinci radiant badges
    for k, (c, r) in enumerate(HORIZON_BEACONS):
        bx, by = int(x0 + (c - 0.5) * cell), int(y0 + (r - 0.5) * cell)
        _clear_polygon(canvas, [
            (bx - cell // 2 + 4, by - cell // 2 + 4),
            (bx + cell // 2 - 4, by - cell // 2 + 4),
            (bx + cell // 2 - 4, by + cell // 2 - 4),
            (bx - cell // 2 + 4, by + cell // 2 - 4)
        ])
        draw_sketchy_circle(canvas, (bx, by), 24, gc=gc, alpha_base=225, passes=2, seed=2020 + k, num_pts=28)
        draw_sketchy_circle(canvas, (bx, by), 17, gc=gc, alpha_base=130, passes=1, seed=2030 + k, num_pts=22)
        for j in range(12):
            th = math.radians(j * 30)
            r_out = 34 if j % 3 == 0 else (30 if j % 2 == 0 else 26)
            p1 = (int(bx + 26 * math.cos(th)), int(by + 26 * math.sin(th)))
            p2 = (int(bx + r_out * math.cos(th)), int(by + r_out * math.sin(th)))
            cv2.line(canvas, p1, p2, (*gc, 160), 1, cv2.LINE_AA)
        t_img, _ = render_pencil_text(str(k + 1), FONT_PATH, font_size=25, gc=gc, seed=2040 + k)
        blit_rgba(canvas, t_img, int(bx - t_img.shape[1] / 2), int(by - t_img.shape[0] / 2 + 4))

    # 5. Da Vinci Faint Compass Construction Arcs
    cv2.ellipse(canvas, (x0 + 4 * cell, y_d), (int(2.2 * cell), int(2.2 * cell)), 0, 0, 90, (*gc, 45), 1, cv2.LINE_AA)
    cv2.drawMarker(canvas, (x0 + 4 * cell, y_d), (*gc, 70), cv2.MARKER_CROSS, 7, 1)

    cv2.ellipse(canvas, (x0 + 6 * cell, y_d), (int(3.2 * cell), int(3.2 * cell)), 0, 0, 90, (*gc, 45), 1, cv2.LINE_AA)
    cv2.drawMarker(canvas, (x0 + 6 * cell, y_d), (*gc, 70), cv2.MARKER_CROSS, 7, 1)

    cv2.ellipse(canvas, (x0 + 10 * cell, y_f), (int(2.8 * cell), int(2.8 * cell)), 0, 180, 270, (*gc, 45), 1, cv2.LINE_AA)
    cv2.drawMarker(canvas, (x0 + 10 * cell, y_f), (*gc, 70), cv2.MARKER_CROSS, 7, 1)

    # 6. East Wind Rose Pointer
    ay = y0 + h + 36
    draw_sketchy_line(canvas, (x0 + 50, ay), (x0 + w - 70, ay), gc=gc, alpha_base=180, passes=2, seed=2050)
    cv2.fillPoly(canvas, [np.array([(x0 + w - 44, ay), (x0 + w - 68, ay - 10), (x0 + w - 68, ay + 10)], dtype=np.int32)], (*gc, 205))
    cv2.circle(canvas, (x0 + 50, ay), 3, (*gc, 200), -1, cv2.LINE_AA)
    e_img, _ = render_pencil_text("Oriens · East", FONT_PATH, font_size=27, gc=gc, seed=2051)
    blit_rgba(canvas, e_img, x0 + w - 40, ay - 16)


def _draw_climax_oracle_sigil_bar(canvas, x0, y0, total_w, gc=GRAPHITE_COLOR, seed=11100):
    """Monumental climax answer bar for Game D10 (Station 19: The Climax of the Desert Odyssey).
    Architectural reliquary tablets, arched keystone beacon pediments, and celestial alignment conduits."""
    cx = x0 + total_w // 2

    # 1. Monumental Renaissance Title
    title = "THE SIGIL OF THE ORACLE"
    t_img, _ = render_pencil_text(title, FONT_PATH, font_size=40, gc=gc, seed=seed)
    blit_rgba(canvas, t_img, cx - t_img.shape[1] // 2, y0)

    # Ornamental engraved rules flanking the title
    title_half_w = t_img.shape[1] // 2
    rule_left_end = cx - title_half_w - 24
    rule_left_start = x0 + 36
    rule_right_start = cx + title_half_w + 24
    rule_right_end = x0 + total_w - 36

    ty = y0 + 19
    # Left rule
    cv2.line(canvas, (rule_left_start, ty), (rule_left_end, ty), (*gc, 185), 1, cv2.LINE_AA)
    cv2.line(canvas, (rule_left_start + 30, ty - 3), (rule_left_end - 12, ty - 3), (*gc, 110), 1, cv2.LINE_AA)
    cv2.circle(canvas, (rule_left_start, ty), 4, (*gc, 210), -1, cv2.LINE_AA)
    cv2.circle(canvas, (rule_left_start + 12, ty), 2, (*gc, 150), -1, cv2.LINE_AA)
    cv2.circle(canvas, (rule_left_end, ty), 3, (*gc, 190), -1, cv2.LINE_AA)

    # Right rule
    cv2.line(canvas, (rule_right_start, ty), (rule_right_end, ty), (*gc, 185), 1, cv2.LINE_AA)
    cv2.line(canvas, (rule_right_start + 12, ty - 3), (rule_right_end - 30, ty - 3), (*gc, 110), 1, cv2.LINE_AA)
    cv2.circle(canvas, (rule_right_end, ty), 4, (*gc, 210), -1, cv2.LINE_AA)
    cv2.circle(canvas, (rule_right_end - 12, ty), 2, (*gc, 150), -1, cv2.LINE_AA)
    cv2.circle(canvas, (rule_right_start, ty), 3, (*gc, 190), -1, cv2.LINE_AA)

    # 2. Geometry of the 8 Reliquary Boxes
    y_boxes = y0 + 82
    box_w = 142
    gap = 24
    box_h = 102
    num_boxes = 8
    start_x = x0 + (total_w - (num_boxes * box_w + (num_boxes - 1) * gap)) // 2

    # Left terminal bracket (before Box 1)
    t1_x = start_x - 18
    mid_y = y_boxes + box_h // 2
    cv2.line(canvas, (t1_x, mid_y - 24), (t1_x, mid_y + 24), (*gc, 180), 2, cv2.LINE_AA)
    cv2.line(canvas, (t1_x, mid_y - 24), (start_x - 4, mid_y - 24), (*gc, 140), 1, cv2.LINE_AA)
    cv2.line(canvas, (t1_x, mid_y + 24), (start_x - 4, mid_y + 24), (*gc, 140), 1, cv2.LINE_AA)
    # Sun beacon marker on left bracket
    cv2.circle(canvas, (t1_x - 8, mid_y), 4, (*gc, 200), -1, cv2.LINE_AA)
    for a in range(0, 360, 45):
        rad = math.radians(a)
        cv2.line(canvas, (int(t1_x - 8 + 6 * math.cos(rad)), int(mid_y + 6 * math.sin(rad))),
                         (int(t1_x - 8 + 11 * math.cos(rad)), int(mid_y + 11 * math.sin(rad))), (*gc, 140), 1, cv2.LINE_AA)

    # Right terminal bracket (after Box 8)
    t8_x = start_x + num_boxes * box_w + (num_boxes - 1) * gap + 18
    cv2.line(canvas, (t8_x, mid_y - 24), (t8_x, mid_y + 24), (*gc, 180), 2, cv2.LINE_AA)
    cv2.line(canvas, (t8_x, mid_y - 24), (t8_x - 14, mid_y - 24), (*gc, 140), 1, cv2.LINE_AA)
    cv2.line(canvas, (t8_x, mid_y + 24), (t8_x - 14, mid_y + 24), (*gc, 140), 1, cv2.LINE_AA)
    # Crescent moon & star on right bracket
    cv2.ellipse(canvas, (t8_x + 10, mid_y), (8, 8), 0, 0, 360, (*gc, 190), 1, cv2.LINE_AA)
    cv2.ellipse(canvas, (t8_x + 13, mid_y - 2), (6, 6), 0, 0, 360, (0, 0, 0, 0), -1)
    cv2.circle(canvas, (t8_x + 10, mid_y), 2, (*gc, 210), -1, cv2.LINE_AA)

    for k in range(num_boxes):
        bx = start_x + k * (box_w + gap)
        by = y_boxes

        # --- A. Outer Chamfered Architectural Cartouche ---
        ch = 14
        pts_outer = np.array([
            (bx + ch, by),
            (bx + box_w - ch, by),
            (bx + box_w, by + ch),
            (bx + box_w, by + box_h - ch),
            (bx + box_w - ch, by + box_h),
            (bx + ch, by + box_h),
            (bx, by + box_h - ch),
            (bx, by + ch)
        ], dtype=np.int32)
        cv2.polylines(canvas, [pts_outer], True, (*gc, 220), 2, cv2.LINE_AA)

        # --- B. Inner Concentric Bevel Frame ---
        im = 5
        ich = 11
        pts_inner = np.array([
            (bx + im + ich, by + im),
            (bx + box_w - im - ich, by + im),
            (bx + box_w - im, by + im + ich),
            (bx + box_w - im, by + box_h - im - ich),
            (bx + box_w - im - ich, by + box_h - im),
            (bx + im + ich, by + box_h - im),
            (bx + im, by + box_h - im - ich),
            (bx + im, by + im + ich)
        ], dtype=np.int32)
        cv2.polylines(canvas, [pts_inner], True, (*gc, 140), 1, cv2.LINE_AA)

        # Corner micro-hatchings in the 4 chamfers for carved-stone depth
        cv2.line(canvas, (bx + 4, by + ch - 2), (bx + ch - 2, by + 4), (*gc, 90), 1, cv2.LINE_AA)
        cv2.line(canvas, (bx + box_w - 4, by + ch - 2), (bx + box_w - ch + 2, by + 4), (*gc, 90), 1, cv2.LINE_AA)
        cv2.line(canvas, (bx + 4, by + box_h - ch + 2), (bx + ch - 2, by + box_h - 4), (*gc, 90), 1, cv2.LINE_AA)
        cv2.line(canvas, (bx + box_w - 4, by + box_h - ch + 2), (bx + box_w - ch + 2, by + box_h - 4), (*gc, 90), 1, cv2.LINE_AA)

        # 4 Corner Renaissance Brass Studs / Diamonds
        stud_dist = 8
        for sx, sy in [
            (bx + stud_dist, by + stud_dist),
            (bx + box_w - stud_dist, by + stud_dist),
            (bx + box_w - stud_dist, by + box_h - stud_dist),
            (bx + stud_dist, by + box_h - stud_dist)
        ]:
            cv2.circle(canvas, (sx, sy), 2, (*gc, 200), -1, cv2.LINE_AA)
            cv2.line(canvas, (sx - 3, sy), (sx + 3, sy), (*gc, 120), 1, cv2.LINE_AA)
            cv2.line(canvas, (sx, sy - 3), (sx, sy + 3), (*gc, 120), 1, cv2.LINE_AA)

        # --- C. Beacon Keystone Crest / Pediment Crown ---
        cr_w = 54
        cr_x = bx + (box_w - cr_w) // 2

        # Clear top frame bar under the pediment
        cv2.rectangle(canvas, (cr_x, by - 1), (cr_x + cr_w, by + 3), (0, 0, 0, 0), -1)

        # Arch apex at by - 18, radius 27 x 18
        cv2.ellipse(canvas, (cr_x + cr_w // 2, by), (cr_w // 2, 18), 0, 180, 360, (*gc, 215), 2, cv2.LINE_AA)
        # Inner fine arch
        cv2.ellipse(canvas, (cr_x + cr_w // 2, by), (cr_w // 2 - 3, 15), 0, 180, 360, (*gc, 120), 1, cv2.LINE_AA)

        # Keystone bracket ONLY at the top apex (by - 23 to by - 16)
        kw = 10
        ks_x = cr_x + cr_w // 2 - kw // 2
        cv2.rectangle(canvas, (ks_x, by - 23), (ks_x + kw, by - 16), (*gc, 205), 1, cv2.LINE_AA)

        # Radiant Beacon Sunburst atop the keystone
        ks_top = (cr_x + cr_w // 2, by - 24)
        cv2.circle(canvas, ks_top, 2, (*gc, 220), -1, cv2.LINE_AA)
        for ang in (-60, -30, 0, 30, 60):
            rad = math.radians(ang - 90)
            p1 = (int(ks_top[0] + 3 * math.cos(rad)), int(ks_top[1] + 3 * math.sin(rad)))
            p2 = (int(ks_top[0] + 8 * math.cos(rad)), int(ks_top[1] + 8 * math.sin(rad)))
            cv2.line(canvas, p1, p2, (*gc, 170), 1, cv2.LINE_AA)

        # Beacon Number inside the crest
        num_str = str(k + 1)
        n_img, _ = render_pencil_text(num_str, FONT_PATH, font_size=19, gc=gc, seed=seed + 10 + k)
        blit_rgba(canvas, n_img, cr_x + (cr_w - n_img.shape[1]) // 2, by - 15)

        # --- D. Clean Writing Sanctuary Inside Box ---
        base_y = by + box_h - 18
        for dx in range(bx + 24, bx + box_w - 24, 7):
            cv2.line(canvas, (dx, base_y), (dx + 3, base_y), (*gc, 65), 1, cv2.LINE_AA)

        # --- E. Inter-Box Alignment Hinges / Conduits ---
        if k < num_boxes - 1:
            gx1 = bx + box_w
            gx2 = bx + box_w + gap
            gy_m = by + box_h // 2

            # Double brass conduit bars
            cv2.line(canvas, (gx1, gy_m - 3), (gx2, gy_m - 3), (*gc, 130), 1, cv2.LINE_AA)
            cv2.line(canvas, (gx1, gy_m + 3), (gx2, gy_m + 3), (*gc, 130), 1, cv2.LINE_AA)

            # Central celestial diamond node
            mid_gx = gx1 + gap // 2
            diamond = np.array([
                (mid_gx, gy_m - 7),
                (mid_gx + 6, gy_m),
                (mid_gx, gy_m + 7),
                (mid_gx - 6, gy_m)
            ], dtype=np.int32)
            cv2.fillConvexPoly(canvas, diamond, (*gc, 190), cv2.LINE_AA)
            cv2.circle(canvas, (mid_gx, gy_m), 2, (0, 0, 0, 0), -1, cv2.LINE_AA)

    # 3. Bottom Ceremonial Inscription
    prompt_y = y_boxes + box_h + 30
    prompt = "« Speak the eight-letter Sigil to the Oracle to open the road to the Stage. »"
    p_img, _ = render_pencil_text(prompt, FONT_PATH, font_size=31, gc=gc, seed=seed + 60)
    blit_rgba(canvas, p_img, cx - p_img.shape[1] // 2, prompt_y)

    return prompt_y + p_img.shape[0]


def _render_18a_page(gc: tuple = GRAPHITE_COLOR):
    """Sheet 18 · Cara A (Front: X < 165 has 0 px). Game D10: send the eight beacons east over the three mirrors of the horizon."""
    from scripts.journal.build_page06_07 import create_handdrawn_divider, draw_desert_path_seal, wrap_text_to_width

    grid = _horizon_letter_grid()
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # ------------------------------------------------------------------ Full-Page Architectural Watermark (Option B)
    # The Sandstone Sanctuary (Tower II) Renaissance study spans the entire page as an authentic Da Vinci watermark
    asset_path = os.path.join(PROJECT_ROOT, "journal", "page18", "assets", "davinci_sandstone_sanctuary_clean_alpha.png")
    if os.path.exists(asset_path):
        raw_asset = cv2.imread(asset_path, cv2.IMREAD_UNCHANGED)
        if raw_asset is not None:
            # Direct fit to (CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX) with Lanczos interpolation
            # Full 100% page coverage with zero artificial punch-margin clipping:
            # The watermark drawing extends completely across X=0..CANVAS_WIDTH_PX behind the holes
            cov_img = cv2.resize(raw_asset, (CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX), interpolation=cv2.INTER_LANCZOS4)
            # 15% opacity watermark in warm graphite ink
            wm_alpha = cov_img[:, :, 3].astype(np.float32) * 0.15
            # Feather at vertical extremes and guarantee >= 75px bottom clearance
            fade_bottom = 75
            ramp_len = 80
            ramp_y = np.ones((CANVAS_HEIGHT_PX, 1), dtype=np.float32)
            ramp_y[:50, 0] = np.linspace(0, 1, 50)
            ramp_y[CANVAS_HEIGHT_PX - fade_bottom - ramp_len : CANVAS_HEIGHT_PX - fade_bottom, 0] = np.linspace(1, 0, ramp_len)
            ramp_y[CANVAS_HEIGHT_PX - fade_bottom :, 0] = 0.0
            cov_img[:, :, 3] = (wm_alpha * ramp_y).astype(np.uint8)
            cov_img[CANVAS_HEIGHT_PX - 75:, :, 3] = 0
            canvas = cov_img

    X0, W = 220, 1330
    BODY, BODY_LH = 35, 48
    SEC, SEC_LH = 44, 60
    CELL = 74

    def put(text, x, y, size, seed):
        t_img, _ = render_pencil_text(text, FONT_PATH, font_size=size, gc=gc, seed=seed)
        blit_rgba(canvas, t_img, x, y)
        return t_img.shape[1]

    def put_centered(text, cx, y, size, seed):
        t_img, _ = render_pencil_text(text, FONT_PATH, font_size=size, gc=gc, seed=seed)
        blit_rgba(canvas, t_img, int(cx - t_img.shape[1] / 2), y)

    def paragraph(text, x, y, max_w, size=BODY, lh=BODY_LH, seed=0):
        for k, ln in enumerate(wrap_text_to_width(text, FONT_PATH, size, max_w)):
            put(ln, x, y, size, seed + k * 3)
            y += lh
        return y

    # ------------------------------------------------------------------ header
    put("The Oracle's Horizon", X0, 80, 64, 11001)
    blit_rgba(canvas, create_handdrawn_divider(width=W, gc=gc, seed=11003), X0, 172)

    # ------------------------------------------------------------------ I. The Oracle's Parchment
    y = 230
    put("I. The Oracle's Parchment", X0, y, SEC, 11010)
    y += SEC_LH
    sec1_text = (
        "Deep within Tower II, the desert wind falls quiet. Silvia stands before the Desert Oracle, "
        "knowing neither the What, the Where, nor the How. Here, carved into the ancient sandstone, "
        "the Oracle grants her first great revelation: the WHEN—the hour and season ordained under "
        "the stars. The Where awaits her in the Stage Path beyond, and the What will only be unveiled "
        "upon her final return to the mountain heights. Guide eight beacons of light east across "
        "the three horizon mirrors to seal this first truth."
    )
    y = paragraph(sec1_text, X0, y, W, size=BODY, lh=BODY_LH, seed=11012)
    y += 36

    # ------------------------------------------------------------------ II. The Three Mirrors
    put("II. The Three Mirrors of the Horizon", X0, y, SEC, 11030)
    y += SEC_LH + 8
    rules = [
        "1. Sequence — Guide Beacons 1 to 8 east across Mirror I, then Mirror II, and finally Mirror III.",
        "2. The Stepped Horizon — A mirror reflects a beacon straight across to the same distance on the other side: vertical mirrors keep the row. Mirror II follows the sanctuary: Column 6 reflects across Row D (The Altar); other columns reflect across Row F (The Terrace).",
        "3. The Sigil — Note where Beacons 1 to 8 land after all three reflections. Write their letters in order into the reliquary below to reveal the Sigil of the Oracle."
    ]
    rule_lines = [wrap_text_to_width(r, FONT_PATH, 34, W - 40) for r in rules]
    for k, rl in enumerate(rule_lines):
        for j, ln in enumerate(rl):
            put(ln, X0 + (0 if j == 0 else 36), y, 34, 11032 + k * 11 + j * 3)
            y += 46
        y += 6
    y += 20
    grid_w = HORIZON_COLS * CELL
    cx0 = X0 + (W - grid_w) // 2
    cy0 = y + 84
    _draw_mirror_chart(canvas, cx0, cy0, CELL, grid, gc)
    y = cy0 + HORIZON_ROWS * CELL + 78

    # ------------------------------------------------------------------ climax answer bar
    y = _draw_climax_oracle_sigil_bar(canvas, X0, y, W, gc=gc, seed=11100)
    y += 32

    # ------------------------------------------------------------------ ending
    blit_rgba(canvas, create_handdrawn_divider(width=1160, gc=gc, seed=11160), (CANVAS_WIDTH_PX - 1160) // 2, y)
    emblem_cy = y + 85
    draw_desert_path_seal(canvas, cx=CANVAS_WIDTH_PX // 2, cy=emblem_cy, r=58, gc=gc, seed=11170)
    motto_y = emblem_cy + 78
    put_centered("The road ends where the curtain rises.", CANVAS_WIDTH_PX // 2, motto_y, 35, 11180)

    canvas[CANVAS_HEIGHT_PX - 75:, :, 3] = 0
    return canvas, 0, motto_y + 42


def render_game_d10_oracle_horizon(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 18 · Cara A."""
    canvas, _plate_h, _end_y = _render_18a_page(gc)
    return canvas


# =========================================================================
# SHEET 18 · CARA B: ARTE DE TRANSICIÓN AL STAGE PATH
# Directly inspired by the user's second photo (Theatrical Drapes, Perspective Pillars & Harmonic Waves)
# =========================================================================

def _draw_star4(canvas, cx, cy, r, gc, seed, alpha=205):
    """Four-pointed celestial star with a lit left half, a hatched right half and short rays."""
    pts = []
    for k in range(8):
        rr = r if k % 2 == 0 else r * 0.28
        th = math.radians(-90 + k * 45)
        pts.append((int(cx + rr * math.cos(th)), int(cy + rr * math.sin(th))))
    cv2.polylines(canvas, [np.array(pts, dtype=np.int32)], True, (*gc, alpha), 1, cv2.LINE_AA)
    _hatch_polygon(canvas, [pts[0], pts[1], pts[2], pts[3], pts[4], (cx, cy)], step=3, angle=60, gc=gc, alpha=int(alpha * 0.55), seed=seed)
    for k in range(8):
        th = math.radians(k * 45 + 22.5)
        cv2.line(canvas, (int(cx + r * 0.42 * math.cos(th)), int(cy + r * 0.42 * math.sin(th))), (int(cx + r * 0.62 * math.cos(th)), int(cy + r * 0.62 * math.sin(th))), (*gc, 130), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), 2, (*gc, 230), -1, cv2.LINE_AA)


def _draw_rose_spiral(canvas, cx, cy, R, gc, seed):
    """Rose of eight petals around a logarithmic spiral, in the spirit of the sketchbook."""
    for i in range(8):
        a_ = i * 45
        cv2.ellipse(canvas, (int(cx + R * 0.52 * math.cos(math.radians(a_))), int(cy + R * 0.52 * math.sin(math.radians(a_)))), (int(R * 0.5), int(R * 0.21)), a_, 0, 360, (*gc, 190), 1, cv2.LINE_AA)
        cv2.ellipse(canvas, (int(cx + R * 0.46 * math.cos(math.radians(a_))), int(cy + R * 0.46 * math.sin(math.radians(a_)))), (int(R * 0.36), int(R * 0.12)), a_, 0, 360, (*gc, 110), 1, cv2.LINE_AA)
    pts = []
    for d in range(0, 1080, 10):
        t = math.radians(d)
        rr = R * 0.34 * (d / 1080.0) ** 0.9 + 2
        pts.append((int(cx + rr * math.cos(t)), int(cy + rr * math.sin(t))))
    cv2.polylines(canvas, [np.array(pts, dtype=np.int32)], False, (*gc, 215), 1, cv2.LINE_AA)
    draw_sketchy_circle(canvas, (cx, cy), int(R * 1.06), gc=gc, alpha_base=130, passes=1, seed=seed, num_pts=48)
    _hatch_polygon(canvas, [(cx + 2, cy - R * 0.2), (cx + R * 0.9, cy - R * 0.15), (cx + R * 0.9, cy + R * 0.15), (cx + 2, cy + R * 0.2)], step=3, angle=60, gc=gc, alpha=55, seed=seed + 1)


def _render_art_18b(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 18 · Cara B (Back: Full-bleed surreal Da Vinci codex transition to the Stage Path).
    Intricate, abstract Renaissance architectural & cosmological fantasy:
    impossible perspectives, Escher-like staircases, theatrical pulleys & winches,
    drapery dissolving into desert sands, Keplerian armillary spheres and harmonic waves.
    Full 100% edge-to-edge coverage with zero empty margins, finished with the classical
    Stage Path dedication cartouche."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. Full-Bleed Surreal Da Vinci Masterwork Asset
    asset_path = os.path.join(PROJECT_ROOT, "journal", "page18", "assets", "davinci_stage_transition_abstract_alpha.png")
    if os.path.exists(asset_path):
        raw_asset = cv2.imread(asset_path, cv2.IMREAD_UNCHANGED)
        if raw_asset is not None:
            if raw_asset.shape[:2] != (CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX):
                raw_asset = cv2.resize(raw_asset, (CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX), interpolation=cv2.INTER_LANCZOS4)
            canvas = raw_asset.copy()

    # 2. Clear AI gibberish text in top-left, leaving clean geometric pentagrams
    canvas[0:78, 190:560, :] = 0

    # 3. Dedicated Renaissance Cartouche at Bottom
    CX0, CX1 = 150, 1560
    CY0, CY1 = 2260, 2455

    # Clear underlying drawing inside cartouche for 100% legibility and ZERO collisions
    canvas[CY0 : CY1 + 10, CX0 + 6 : CX1 - 6, 3] = 0

    # Cartouche classical double borders with corner rosettes
    cv2.rectangle(canvas, (CX0, CY0), (CX1, CY1), (*gc, 225), 2, cv2.LINE_AA)
    cv2.rectangle(canvas, (CX0 + 6, CY0 + 6), (CX1 - 6, CY1 - 6), (*gc, 140), 1, cv2.LINE_AA)
    cv2.rectangle(canvas, (CX0 + 10, CY0 + 10), (CX1 - 10, CY1 - 10), (*gc, 80), 1, cv2.LINE_AA)

    for (rcx, rcy) in [(CX0 + 10, CY0 + 10), (CX1 - 10, CY0 + 10), (CX0 + 10, CY1 - 10), (CX1 - 10, CY1 - 10)]:
        cv2.circle(canvas, (rcx, rcy), 5, (*gc, 210), 1, cv2.LINE_AA)
        cv2.circle(canvas, (rcx, rcy), 2, (*gc, 180), -1, cv2.LINE_AA)

    # Stage emblem medallion at left (Theatrical Lens & Radial Iris)
    ex, ey = CX0 + 100, (CY0 + CY1) // 2
    cv2.circle(canvas, (ex, ey), 64, (*gc, 220), 2, cv2.LINE_AA)
    cv2.circle(canvas, (ex, ey), 58, (*gc, 130), 1, cv2.LINE_AA)
    cv2.ellipse(canvas, (ex, ey), (32, 50), 0, 0, 360, (*gc, 215), 2, cv2.LINE_AA)
    cv2.ellipse(canvas, (ex, ey), (24, 40), 0, 0, 360, (*gc, 120), 1, cv2.LINE_AA)
    cv2.circle(canvas, (ex, ey), 12, (*gc, 225), -1, cv2.LINE_AA)
    for k in range(24):
        th = math.radians(k * 15)
        p1 = (int(ex + 51 * math.cos(th)), int(ey + 51 * math.sin(th)))
        p2 = (int(ex + 58 * math.cos(th)), int(ey + 58 * math.sin(th)))
        cv2.line(canvas, p1, p2, (*gc, 150), 1, cv2.LINE_AA)

    # Title: "From the Desert to the Stage"
    t_title, _ = render_pencil_text("From the Desert to the Stage", FONT_PATH, font_size=52, gc=gc, seed=12720)
    blit_rgba(canvas, t_title, CX0 + 205, CY0 + 18)

    # Classical double divider line
    div_y = CY0 + 98
    cv2.line(canvas, (CX0 + 205, div_y), (CX1 - 36, div_y), (*gc, 190), 2, cv2.LINE_AA)
    cv2.line(canvas, (CX0 + 205, div_y + 3), (CX1 - 36, div_y + 3), (*gc, 100), 1, cv2.LINE_AA)

    # Subtitle: "The silence of the stone gives way to the symmetry of the stage."
    t_sub, _ = render_pencil_text("The silence of the stone gives way to the symmetry of the stage.", FONT_PATH, font_size=30, gc=gc, seed=12722)
    blit_rgba(canvas, t_sub, CX0 + 205, CY0 + 120)

    return canvas


def render_art_18b_stage_path_transition(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 18 · Cara B."""
    return _render_art_18b(gc)


# =========================================================================
# CLI TEST RUNNER
# =========================================================================

if __name__ == "__main__":
    print("Testing Expanded Desert Odyssey Pages...")
    test_pages = [
        ("10A", render_game_d2_salt_playa, False),
        ("10B", render_lore_10b_salt_playa_study, True),
        ("13A", render_lore_13a_sanctuary_servant, False),
        ("13B", render_game_d5_sun_monolith, True),
        ("14A", render_lore_14a_cairns_survey, False),
        ("14B", render_game_d6_sandstone_labyrinth, True),
        ("15A", render_game_d7_cairn_iv_sentry, False),
        ("15B", render_zoom_bridge_left, True),
        ("16A", render_zoom_bridge_right, False),
        ("16B", render_game_d8_arch_solstice_altar, True),
        ("18A", render_game_d10_oracle_horizon, False),
        ("18B", render_art_18b_stage_path_transition, True),
    ]

    for label, fn, is_back in test_pages:
        c = fn()
        # Verify punch margins
        if label not in ("15B", "16A", "18A", "18B"):
            if is_back:
                v = np.count_nonzero(c[:, 1583:, 3])
                assert v == 0, f"{label} Back punch violation: {v} px!"
            else:
                v = np.count_nonzero(c[:, :165, 3])
                assert v == 0, f"{label} Front punch violation: {v} px!"
        print(f"  [OK] {label}: Shape {c.shape}, Punch margin clear.")
    print("All 12 Expanded Desert Odyssey Pages verified successfully!")
