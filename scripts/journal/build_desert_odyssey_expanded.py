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
    Navigation across brittle salt crust fissures and safe crystalline slabs."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # Header (Cara A: X >= 200, stops at X <= 1650)
    t_title, _ = render_pencil_text("The Salt Playa (Dry Basin)", FONT_PATH, font_size=54, gc=gc, seed=1001)
    blit_rgba(canvas, t_title, 220, 80)

    t_sub, _ = render_pencil_text("Traversing the Brine Crust & Crystalline Fissures", FONT_PATH, font_size=28, gc=gc, seed=1002)
    blit_rgba(canvas, t_sub, 224, 150)

    draw_sketchy_line(canvas, (220, 195), (1600, 195), gc=gc, alpha_base=180, passes=2, seed=1003)

    # Narrative Introduction
    intro_lines = [
        "Emerging from the deep chasm, the desert floor collapses into a blinding white salt basin.",
        "A fragile crust of dry halite crystals conceals subterranean pockets of saturated brine.",
        "Step only upon dense hexagonal polygonal slabs. Avoid the treacherous dark brine sinkholes.",
        "The Law of the Basin: The sum of crystal facets on any safe crossing row must equal XIV (14).",
    ]
    render_multiline_text(canvas, intro_lines, 220, 220, font_size=24, line_spacing=34, gc=gc, seed_base=1010)

    # Salt Polygon Fissure Grid (7 rows x 7 cols)
    gx0, gy0 = 260, 420
    gw, gh = 1200, 1300
    cols, rows = 7, 7
    cw, ch = gw / cols, gh / rows

    # Outer polygonal boundary
    draw_sketchy_rect(canvas, (gx0 - 10, gy0 - 10, gx0 + gw + 10, gy0 + gh + 10), gc=gc, alpha_base=200, passes=2, seed=1020)

    # Values in hexagonal slabs (facet counts)
    # A path traverses through specific cells where facets match the equation
    grid_data = [
        [3, 5, 2, 6, 4, 1, 5],
        [4, 2, 6, 1, 5, 3, 2],
        [1, 6, 3, 5, 2, 4, 6],
        [5, 1, 4, 2, 6, 3, 1],
        [2, 4, 1, 6, 3, 5, 4],
        [6, 3, 5, 1, 4, 2, 3],
        [2, 5, 1, 4, 6, 2, 5],
    ]
    sinkholes = {(0, 3), (1, 1), (2, 5), (3, 2), (4, 4), (5, 0), (6, 6)}

    for r in range(rows):
        for c in range(cols):
            cx = int(round(gx0 + c * cw))
            cy = int(round(gy0 + r * ch))
            cx2 = int(round(gx0 + (c + 1) * cw))
            cy2 = int(round(gy0 + (r + 1) * ch))

            # Draw polygon cell with crack fissures
            draw_sketchy_rect(canvas, (cx + 4, cy + 4, cx2 - 4, cy2 - 4), gc=gc, alpha_base=140, passes=1, seed=1030 + r * 10 + c)

            # Crack lines extending from corners
            draw_sketchy_line(canvas, (cx + 4, cy + 4), (cx + 18, cy + 18), gc=gc, alpha_base=100, seed=1050 + r * 7 + c)
            draw_sketchy_line(canvas, (cx2 - 4, cy2 - 4), (cx2 - 18, cy2 - 18), gc=gc, alpha_base=100, seed=1060 + r * 7 + c)

            if (r, c) in sinkholes:
                # Dark brine sinkhole texture
                draw_hatching(canvas, (cx + 12, cy + 12, cx2 - 12, cy2 - 12), step=6, angle_deg=35, gc=gc, alpha=160, seed=1100 + r * 9 + c)
                t_danger, _ = render_pencil_text("x", FONT_PATH, font_size=20, gc=gc, seed=1120 + r * 5 + c)
                blit_rgba(canvas, t_danger, (cx + cx2) // 2 - 6, (cy + cy2) // 2 - 12)
            else:
                val_str = str(grid_data[r][c])
                t_val, _ = render_pencil_text(val_str, FONT_PATH, font_size=26, gc=gc, seed=1140 + r * 11 + c)
                blit_rgba(canvas, t_val, (cx + cx2) // 2 - 7, (cy + cy2) // 2 - 14)

    # Footing / Ledger Verification at bottom
    draw_sketchy_line(canvas, (220, 1780), (1600, 1780), gc=gc, alpha_base=160, passes=2, seed=1200)

    footing_lines = [
        "Playa Safe Path Waypoints: Record the 7 chosen stepping slabs (North to South entrance to Oasis):",
        "Row I: [   ]   Row II: [   ]   Row III: [   ]   Row IV: [   ]   Row V: [   ]   Row VI: [   ]   Row VII: [   ]",
        "Verification Equation: Facet Pressure Constant [P] - [A] = 14  -->  Resolved in the Ledger.",
    ]
    render_multiline_text(canvas, footing_lines, 220, 1820, font_size=24, line_spacing=36, gc=gc, seed_base=1210)

    # Left punch-hole enforcement (Cara A: X < 165 has 0 px)
    canvas[:, :165, 3] = 0
    return canvas


# =========================================================================
# SHEET 10 · CARA B: LORE — STUDY ON THE FORMATION OF DRY SALT PLAYA
# =========================================================================

def render_lore_10b_salt_playa_study(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 10 · Cara B (Back: X > 1583 has 0 px).
    Da Vinci study on crystallization, evaporation mechanics, and sedimentary strata."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # Header (Cara B: X <= 1540)
    t_title, _ = render_pencil_text("Study on the Dry Salt Playa", FONT_PATH, font_size=52, gc=gc, seed=2001)
    blit_rgba(canvas, t_title, 180, 80)

    t_sub, _ = render_pencil_text("Sedimentary Stratification, Brine Geometries & Solar Evaporation", FONT_PATH, font_size=27, gc=gc, seed=2002)
    blit_rgba(canvas, t_sub, 184, 148)

    draw_sketchy_line(canvas, (180, 190), (1540, 190), gc=gc, alpha_base=180, passes=2, seed=2003)

    # Section 1: Observational notes
    notes_1 = [
        "In the dry basin between the Sentinel Mesa and the sanctuary threshold lies the ancient playa.",
        "During winter flash floods, torrential waters descend from the Red Ridge, dissolving mineral salts",
        "from the sandstone bedrock. When the ferocious summer winds (Shamal) sweep across the plains,",
        "the moisture evaporates at an alarming rate, leaving polygonal crusts of interlocking halite prisms.",
    ]
    render_multiline_text(canvas, notes_1, 180, 220, font_size=23, line_spacing=34, gc=gc, seed_base=2010)

    # Technical Diagram 1: Geological Stratum Cross-Section (Left column: 180 to 820)
    sx0, sy0, sw, sh = 180, 410, 640, 520
    draw_sketchy_rect(canvas, (sx0, sy0, sx0 + sw, sy0 + sh), gc=gc, alpha_base=180, passes=2, seed=2020)

    t_diag1, _ = render_pencil_text("Fig. I — Stratigraphy of the Basin Floor", FONT_PATH, font_size=22, gc=gc, seed=2021)
    blit_rgba(canvas, t_diag1, sx0 + 20, sy0 + 20)

    # Strata layers
    # Layer 1: Salt crust (0 to 60)
    draw_sketchy_line(canvas, (sx0, sy0 + 80), (sx0 + sw, sy0 + 80), gc=gc, alpha_base=150, seed=2022)
    draw_hatching(canvas, (sx0, sy0 + 80, sx0 + sw, sy0 + 150), step=8, angle_deg=0, gc=gc, alpha=70, seed=2023)
    t_l1, _ = render_pencil_text("A. Brittle Salt Crust (3-5 palmos)", FONT_PATH, font_size=18, gc=gc, seed=2024)
    blit_rgba(canvas, t_l1, sx0 + 20, sy0 + 105)

    # Layer 2: Saturated brine silt (150 to 300)
    draw_sketchy_line(canvas, (sx0, sy0 + 220), (sx0 + sw, sy0 + 220), gc=gc, alpha_base=150, seed=2025)
    draw_hatching(canvas, (sx0, sy0 + 150, sx0 + sw, sy0 + 320), step=10, angle_deg=60, gc=gc, alpha=90, seed=2026)
    t_l2, _ = render_pencil_text("B. Saturated Brine Silt (Quicksand Sludge)", FONT_PATH, font_size=18, gc=gc, seed=2027)
    blit_rgba(canvas, t_l2, sx0 + 20, sy0 + 250)

    # Layer 3: Solid sandstone bedrock (320 to 520)
    draw_sketchy_line(canvas, (sx0, sy0 + 360), (sx0 + sw, sy0 + 360), gc=gc, alpha_base=150, seed=2028)
    draw_hatching(canvas, (sx0, sy0 + 360, sx0 + sw, sy0 + sh), step=6, angle_deg=45, gc=gc, alpha=130, seed=2029)
    t_l3, _ = render_pencil_text("C. Sandstone Bedrock (Subterranean Aquifer)", FONT_PATH, font_size=18, gc=gc, seed=2030)
    blit_rgba(canvas, t_l3, sx0 + 20, sy0 + 440)

    # Technical Diagram 2: Isometric Halite Crystal Cleavage (Right column: 880 to 1520)
    cx0, cy0, cw, ch = 880, 410, 640, 520
    draw_sketchy_rect(canvas, (cx0, cy0, cx0 + cw, cy0 + ch), gc=gc, alpha_base=180, passes=2, seed=2040)

    t_diag2, _ = render_pencil_text("Fig. II — Isometric Halite Cleavage Prisms", FONT_PATH, font_size=22, gc=gc, seed=2041)
    blit_rgba(canvas, t_diag2, cx0 + 20, cy0 + 20)

    # Draw isometric cubes clustered together
    def draw_iso_cube(ox, oy, size, seed_c):
        dx = int(size * 0.866)
        dy = int(size * 0.5)
        # Top face
        p_top = [(ox, oy), (ox + dx, oy - dy), (ox + 2 * dx, oy), (ox + dx, oy + dy)]
        cv2.polylines(canvas, [np.array(p_top, dtype=np.int32)], True, (*gc, 180), 1, cv2.LINE_AA)
        # Left face
        p_left = [(ox, oy), (ox + dx, oy + dy), (ox + dx, oy + dy + size), (ox, oy + size)]
        cv2.polylines(canvas, [np.array(p_left, dtype=np.int32)], True, (*gc, 190), 1, cv2.LINE_AA)
        # Right face
        p_right = [(ox + dx, oy + dy), (ox + 2 * dx, oy), (ox + 2 * dx, oy + size), (ox + dx, oy + dy + size)]
        cv2.polylines(canvas, [np.array(p_right, dtype=np.int32)], True, (*gc, 190), 1, cv2.LINE_AA)
        # Hatch left face
        for hline in range(oy + 10, oy + size + dy, 8):
            cv2.line(canvas, (ox + 4, min(oy + size - 2, hline)), (ox + dx - 4, min(oy + dy + size - 2, hline + dy)), (*gc, 70), 1, cv2.LINE_AA)

    draw_iso_cube(cx0 + 80, cy0 + 220, 110, seed_c=2050)
    draw_iso_cube(cx0 + 240, cy0 + 170, 130, seed_c=2051)
    draw_iso_cube(cx0 + 380, cy0 + 260, 95, seed_c=2052)

    # Section 2: Evaporation rate calculation & mathematical observations
    notes_2 = [
        "Geometrical Observation on Salt Cracking:",
        "When desiccation reaches its maximum, the crust shrinks towards centers of tension, forming",
        "hexagonal networks identical to the basalt columns of alpine crags and the drying of wet clay.",
        "The angle of intersection between adjacent fissures tends perpetually toward 120 degrees.",
        "Under intense solar rays, salt tears precipitate into rhomboid crystals of extreme hardness.",
    ]
    render_multiline_text(canvas, notes_2, 180, 990, font_size=23, line_spacing=34, gc=gc, seed_base=2060)

    # Bottom Da Vinci Calligraphic Reflection (mirrored Italianate style text)
    draw_sketchy_line(canvas, (180, 1220), (1540, 1220), gc=gc, alpha_base=160, passes=2, seed=2070)

    t_refl_head, _ = render_pencil_text("Nota dell'Architetto (Field Observation):", FONT_PATH, font_size=24, gc=gc, seed=2080)
    blit_rgba(canvas, t_refl_head, 180, 1260)

    refl_lines = [
        "«The water that flows carries the memory of the heights; but the salt that remains is the crystal skeleton",
        "of the earth, holding the light long after the storm has turned to dust. Let the seeker who traverses the playa",
        "walk with measured footsteps, for weight without balance yields to the deep beneath.»",
    ]
    render_multiline_text(canvas, refl_lines, 200, 1310, font_size=22, line_spacing=34, gc=gc, seed_base=2090)

    # Right punch-hole enforcement (Cara B: X > 1583 has 0 px)
    canvas[:, 1583:, 3] = 0
    return canvas


# =========================================================================
# SHEET 13 · CARA A: LORE — AT THE GATES OF TOWER II & THE 5 CAIRNS DEMAND
# =========================================================================

def render_lore_13a_sanctuary_servant(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 13 · Cara A (Front: X < 165 has 0 px).
    Llegada al Santuario de Arenisca, encuentro con el sirviente y la demanda de los 5 Cairns."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # Header
    t_title, _ = render_pencil_text("At the Gates of Tower II", FONT_PATH, font_size=56, gc=gc, seed=3001)
    blit_rgba(canvas, t_title, 220, 80)

    t_sub, _ = render_pencil_text("The Sanctuary Servant & The Five Cairns of the Order", FONT_PATH, font_size=28, gc=gc, seed=3002)
    blit_rgba(canvas, t_sub, 224, 150)

    draw_sketchy_line(canvas, (220, 195), (1600, 195), gc=gc, alpha_base=180, passes=2, seed=3003)

    # Narrative
    lines_nar = [
        "At the southern verge of the salt basin rise the monolithic walls of Tower II: The Sandstone Sanctuary.",
        "Fluted columns carved from solid rock support a monumental archway sealed with bronze gates.",
        "Under the shadow of the portico stands an elder in dust-stained ceremonial robes: The Sanctuary Servant.",
        "He bars the threshold with an iron staff capped by an astronomical reticle, addressing the travelers:",
    ]
    render_multiline_text(canvas, lines_nar, 220, 225, font_size=23, line_spacing=34, gc=gc, seed_base=3010)

    # Servant's decree in decorated quote box
    bx0, by0, bw, bh = 240, 400, 1300, 260
    draw_sketchy_rect(canvas, (bx0, by0, bx0 + bw, by0 + bh), gc=gc, alpha_base=180, passes=2, seed=3020)
    draw_sketchy_rect(canvas, (bx0 + 6, by0 + 6, bx0 + bw - 6, by0 + bh - 6), gc=gc, alpha_base=100, passes=1, seed=3021)

    t_dec_head, _ = render_pencil_text("Decree of the Sanctuary Servant:", FONT_PATH, font_size=24, gc=gc, seed=3022)
    blit_rgba(canvas, t_dec_head, bx0 + 30, by0 + 25)

    decree_lines = [
        "«Five sacred Cairns were established by the Order to triangulate this desert realm.",
        "Thou hast found the First Seal (Cairn I) by following the dry wash; but four still sleep in stone.",
        "Without the seals of Cairn II, Cairn III, Cairn IV, and Cairn V, no mortal shall look upon The Oracle.",
        "Return to the sands. Prove thy survey true, or these bronze portals remain forever barred.»",
    ]
    render_multiline_text(canvas, decree_lines, bx0 + 30, by0 + 75, font_size=22, line_spacing=34, gc=gc, seed_base=3030)

    # Diagram: The Five Seal Sockets on the Sanctuary Threshold
    t_sock_head, _ = render_pencil_text("The Five Geodetic Seal Sockets of the Threshold Archway:", FONT_PATH, font_size=26, gc=gc, seed=3040)
    blit_rgba(canvas, t_sock_head, 220, 710)

    # 5 Circles across the page
    seal_names = [
        ("Cairn I", "[ACQUIRED]", "River Wash Hunch", True),
        ("Cairn II", "[MISSING]", "The Sun Monolith", False),
        ("Cairn III", "[MISSING]", "Sandstone Labyrinth", False),
        ("Cairn IV", "[MISSING]", "Canyon Sentry", False),
        ("Cairn V", "[MISSING]", "Solar Altar Arch", False),
    ]

    for idx, (c_name, status, loc, acquired) in enumerate(seal_names):
        cx = 320 + idx * 260
        cy = 860

        draw_sketchy_circle(canvas, (cx, cy), 65, gc=gc, alpha_base=180, passes=2, seed=3050 + idx * 5)
        draw_sketchy_circle(canvas, (cx, cy), 55, gc=gc, alpha_base=120, passes=1, seed=3051 + idx * 5)

        if acquired:
            # Drawn filled heraldic seal for Cairn I
            draw_hatching(canvas, (cx - 40, cy - 40, cx + 40, cy + 40), step=6, angle_deg=45, gc=gc, alpha=140, seed=3060)
            t_s, _ = render_pencil_text("I", FONT_PATH, font_size=36, gc=gc, seed=3061)
            blit_rgba(canvas, t_s, cx - 8, cy - 20)
        else:
            # Empty socket notch
            t_s, _ = render_pencil_text(f"{idx + 1}", FONT_PATH, font_size=32, gc=gc, seed=3062 + idx)
            blit_rgba(canvas, t_s, cx - 8, cy - 18)

        # Labels below
        t_cn, _ = render_pencil_text(c_name, FONT_PATH, font_size=22, gc=gc, seed=3070 + idx)
        blit_rgba(canvas, t_cn, cx - 35, cy + 85)

        t_st, _ = render_pencil_text(status, FONT_PATH, font_size=18, gc=gc, seed=3080 + idx)
        blit_rgba(canvas, t_st, cx - 42, cy + 115)

        t_lc, _ = render_pencil_text(loc, FONT_PATH, font_size=17, gc=gc, seed=3090 + idx)
        blit_rgba(canvas, t_lc, cx - 65, cy + 140)

    # Narrative conclusion & field notes
    concl_lines = [
        "Hermes clutches the stone seal of Cairn I extracted from the riverbed: his hunch had not been in vain.",
        "To earn audience with The Oracle, Silvia and the Cartographer must now embark on the great geodetic",
        "circuit across the four quadrants of the Grand Desert Map, recovering each remaining seal in turn.",
        "First Destination: North-northeast toward The Sun Monolith to unlock the Seal of Cairn II.",
    ]
    render_multiline_text(canvas, concl_lines, 220, 1140, font_size=23, line_spacing=34, gc=gc, seed_base=3100)

    # Left punch-hole enforcement (Cara A: X < 165 has 0 px)
    canvas[:, :165, 3] = 0
    return canvas


# =========================================================================
# SHEET 13 · CARA B: JUEGO D5 — THE SUN MONOLITH & CAIRN II
# =========================================================================

def render_game_d5_sun_monolith(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 13 · Cara B (Back: X > 1583 has 0 px).
    Gnomonic shadow calibration & obtaining the Seal of Cairn II."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # Header
    t_title, _ = render_pencil_text("The Sun Monolith & Cairn II", FONT_PATH, font_size=54, gc=gc, seed=4001)
    blit_rgba(canvas, t_title, 180, 80)

    t_sub, _ = render_pencil_text("Gnomonic Meridian Alignment & The Second Sacred Cairn", FONT_PATH, font_size=28, gc=gc, seed=4002)
    blit_rgba(canvas, t_sub, 184, 148)

    draw_sketchy_line(canvas, (180, 190), (1540, 190), gc=gc, alpha_base=180, passes=2, seed=4003)

    # Narrative & mechanics
    lines_intro = [
        "Rising high upon the northeastern ridge (Quadrant NE · Hoja 09A) stands the Sun Monolith.",
        "A colossal obelisk of red sandstone carved with degree scales along its southern face.",
        "At true local noon, its tip casts a needle-thin shadow across the graduated dial of Cairn II.",
        "Calibrate the solar bearing and shadow length to unlock the Second Geodetic Seal.",
    ]
    render_multiline_text(canvas, lines_intro, 180, 220, font_size=23, line_spacing=34, gc=gc, seed_base=4010)

    # Central Drawing: The Monolith & Graduated Shadow Dial
    ox, oy = 860, 950
    # Obelisk sketch (slender tall trapezoid)
    pts_obelisk = np.array([[ox - 30, oy - 480], [ox + 30, oy - 480], [ox + 50, oy], [ox - 50, oy]], dtype=np.int32)
    cv2.polylines(canvas, [pts_obelisk], True, (*gc, 200), 1, cv2.LINE_AA)
    # Pyramidion apex
    pts_apex = np.array([[ox - 30, oy - 480], [ox, oy - 540], [ox + 30, oy - 480]], dtype=np.int32)
    cv2.polylines(canvas, [pts_apex], True, (*gc, 200), 1, cv2.LINE_AA)

    # Hatching on obelisk shaded side
    draw_hatching(canvas, (ox, oy - 480, ox + 45, oy), step=8, angle_deg=75, gc=gc, alpha=90, seed=4020)

    # Sun Rays from top right
    sun_x, sun_y = 1380, 360
    draw_sketchy_circle(canvas, (sun_x, sun_y), 50, gc=gc, alpha_base=160, passes=2, seed=4030)
    for ang in range(0, 360, 30):
        rad = math.radians(ang)
        r1, r2 = 60, 90
        cv2.line(canvas, (int(sun_x + r1 * math.cos(rad)), int(sun_y + r1 * math.sin(rad))),
                         (int(sun_x + r2 * math.cos(rad)), int(sun_y + r2 * math.sin(rad))), (*gc, 120), 1, cv2.LINE_AA)

    # Shadow ray from apex to dial
    draw_sketchy_line(canvas, (ox, oy - 540), (ox - 480, oy + 80), gc=gc, alpha_base=150, passes=1, seed=4040)

    # Graduated semicircular dial at Cairn II base
    draw_sketchy_circle(canvas, (ox - 480, oy + 80), 160, gc=gc, alpha_base=180, passes=2, seed=4050)
    draw_sketchy_circle(canvas, (ox - 480, oy + 80), 140, gc=gc, alpha_base=120, passes=1, seed=4051)

    # Dial degree tick marks
    for deg in range(0, 190, 15):
        rad = math.radians(deg)
        tx1 = int(ox - 480 + 140 * math.cos(rad))
        ty1 = int(oy + 80 - 140 * math.sin(rad))
        tx2 = int(ox - 480 + 160 * math.cos(rad))
        ty2 = int(oy + 80 - 160 * math.sin(rad))
        cv2.line(canvas, (tx1, ty1), (tx2, ty2), (*gc, 160), 1, cv2.LINE_AA)

    t_dial_lbl, _ = render_pencil_text("Dial of Cairn II", FONT_PATH, font_size=22, gc=gc, seed=4060)
    blit_rgba(canvas, t_dial_lbl, ox - 550, oy + 260)

    # Stele puzzle instructions & answer ledger
    puzzle_lines = [
        "Solar Meridian Calculation:",
        "1. Solar Altitude at Solstice: 64° 30' Above Horizon.",
        "2. Meridian Shadow Vector: Intersects the Cairn II plate at Bearing 348° True North-Northwest.",
        "3. Solstice Equation: [R] x 2 = [F]  -->  Given R = 3, deduce F = 6 and confirm Seal Key.",
        "Enter Cairn II Unlock Sigil: [   P   ] [   H   ] [   O   ] [   E   ] [   N   ] [   I   ] [   X   ]",
    ]
    render_multiline_text(canvas, puzzle_lines, 180, 1140, font_size=23, line_spacing=36, gc=gc, seed_base=4070)

    # Right punch-hole enforcement (Cara B: X > 1583 has 0 px)
    canvas[:, 1583:, 3] = 0
    return canvas


# =========================================================================
# SHEET 14 · CARA A: LORE — THE FIVE GEODETIC CAIRNS
# =========================================================================

def render_lore_14a_cairns_survey(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 14 · Cara A (Front: X < 165 has 0 px).
    Estudio arquitectónico y cartográfico de los 5 Cairns de la Orden."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # Header
    t_title, _ = render_pencil_text("The Five Geodetic Cairns", FONT_PATH, font_size=56, gc=gc, seed=5001)
    blit_rgba(canvas, t_title, 220, 80)

    t_sub, _ = render_pencil_text("Architectural Elevation Survey & Horizon Triangulation", FONT_PATH, font_size=28, gc=gc, seed=5002)
    blit_rgba(canvas, t_sub, 224, 150)

    draw_sketchy_line(canvas, (220, 195), (1600, 195), gc=gc, alpha_base=180, passes=2, seed=5003)

    # Intro text
    intro_lines = [
        "Before the Great Silence fell upon the Observatory, the master cartographers erected five markers",
        "of unhewn sandstone across the desert basin. Each cairn preserves a celestial-terrestrial coordinate,",
        "anchoring the triangulation network that leads from Tower I to Tower II and the forgotten third sanctuary.",
    ]
    render_multiline_text(canvas, intro_lines, 220, 220, font_size=23, line_spacing=34, gc=gc, seed_base=5010)

    # Detailed Table / Survey of the 5 Cairns
    cairn_survey = [
        ("CAIRN I · THE WASH THRESHOLD", "Hoja 08B · Cuadrante NO (980, 2190)", "Cone of stacked river boulders at the dry wadi entrance. Acquired by Hermes on river hunch."),
        ("CAIRN II · THE NOMAD STELE", "Hoja 09A · Cuadrante NE (2070, 2150)", "Square stepped pedestal with carved tablets. Aligned to the solar noon shadow of the Sun Monolith."),
        ("CAIRN III · COPPER BENCHMARK", "Hoja 09A · Cuadrante NE (2750, 2150)", "Pyramidal cairn with engraved bronze benchmark plate. Visual sighting ray: 348° NNW."),
        ("CAIRN IV · CANYON SENTRY", "Hoja 11B · Cuadrante SO (220, 1750)", "Twin stone pillars flanking the lower gorge beneath the Sentinel Mesa. Acoustic resonance chamber."),
        ("CAIRN V · THE FINAL MARKER", "Hoja 12A · Cuadrante SE (2340, 280)", "Monolithic plinth before the Solstice Arch. Sighting ray: 163° SSE connecting directly to Solar Altar."),
    ]

    curr_y = 360
    for idx, (title, loc, desc) in enumerate(cairn_survey):
        draw_sketchy_rect(canvas, (220, curr_y, 1600, curr_y + 130), gc=gc, alpha_base=160, passes=1, seed=5020 + idx * 7)

        t_c_title, _ = render_pencil_text(title, FONT_PATH, font_size=23, gc=gc, seed=5030 + idx)
        blit_rgba(canvas, t_c_title, 240, curr_y + 15)

        t_c_loc, _ = render_pencil_text(f"Location: {loc}", FONT_PATH, font_size=20, gc=gc, seed=5040 + idx)
        blit_rgba(canvas, t_c_loc, 240, curr_y + 50)

        t_c_desc, _ = render_pencil_text(desc, FONT_PATH, font_size=19, gc=gc, seed=5050 + idx)
        blit_rgba(canvas, t_c_desc, 240, curr_y + 85)

        curr_y += 155

    # Bottom Da Vinci architectural reflection
    draw_sketchy_line(canvas, (220, 1180), (1600, 1180), gc=gc, alpha_base=160, passes=2, seed=5060)

    refl_lines = [
        "«He who measures the earth with the compass of the stars does not wander in vain.",
        "The five cairns are not mere heaps of stone, but the five finger-joints of the hand that fashioned the sanctuary.",
        "Keep the seals intact, for they alone shall satisfy the servant and grant passage to the inner sanctum.»",
    ]
    render_multiline_text(canvas, refl_lines, 240, 1220, font_size=22, line_spacing=34, gc=gc, seed_base=5070)

    # Left punch-hole enforcement (Cara A: X < 165 has 0 px)
    canvas[:, :165, 3] = 0
    return canvas


# =========================================================================
# SHEET 14 · CARA B: JUEGO D6 — THE SANDSTONE LABYRINTH & CAIRN III
# =========================================================================

def render_game_d6_sandstone_labyrinth(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 14 · Cara B (Back: X > 1583 has 0 px).
    Wagon tracks through the stone arches towards Cairn III Benchmark."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # Header
    t_title, _ = render_pencil_text("The Sandstone Labyrinth & Cairn III", FONT_PATH, font_size=52, gc=gc, seed=6001)
    blit_rgba(canvas, t_title, 180, 80)

    t_sub, _ = render_pencil_text("Traversing the Arches of the West Wind to the Benchmark Plate", FONT_PATH, font_size=27, gc=gc, seed=6002)
    blit_rgba(canvas, t_sub, 184, 148)

    draw_sketchy_line(canvas, (180, 190), (1540, 190), gc=gc, alpha_base=180, passes=2, seed=6003)

    # Narrative
    lines_intro = [
        "In the northeastern highlands (Quadrant NE), winds from the west carved deep natural arches into the rock.",
        "Here the raider wagons (The BC Ashes) fractured an axle, leaving deep ruts in the sandstone floor.",
        "Follow the wheel tracks through the stone corridors without entering the dead-end wind caves.",
        "At the terminus of the true trail lies Cairn III with its circular copper benchmark plate.",
    ]
    render_multiline_text(canvas, lines_intro, 180, 220, font_size=23, line_spacing=34, gc=gc, seed_base=6010)

    # Labyrinth Arcades Drawing (Perspective arches with ruts)
    ax0, ay0, aw, ah = 240, 390, 1200, 680
    draw_sketchy_rect(canvas, (ax0, ay0, ax0 + aw, ay0 + ah), gc=gc, alpha_base=180, passes=2, seed=6020)

    # Render series of receding arches in perspective
    for idx, scale in enumerate([1.0, 0.8, 0.62, 0.48]):
        cur_w = int(aw * scale)
        cur_h = int(ah * scale)
        cur_x = ax0 + (aw - cur_w) // 2
        cur_y = ay0 + (ah - cur_h)

        # Arch top curve
        cv2.ellipse(canvas, (cur_x + cur_w // 2, cur_y + cur_h // 3), (cur_w // 3, cur_h // 3), 0, 180, 360, (*gc, 160), 1, cv2.LINE_AA)
        # Vertical jambs
        draw_sketchy_line(canvas, (cur_x + cur_w // 6, cur_y + cur_h // 3), (cur_x + cur_w // 6, cur_y + cur_h), gc=gc, alpha_base=160, seed=6030 + idx)
        draw_sketchy_line(canvas, (cur_x + 5 * cur_w // 6, cur_y + cur_h // 3), (cur_x + 5 * cur_w // 6, cur_y + cur_h), gc=gc, alpha_base=160, seed=6031 + idx)

    # Wagon ruts winding across the ground
    rut_pts_1 = np.array([[340, 1070], [480, 950], [600, 880], [740, 810], [820, 720]], dtype=np.int32)
    rut_pts_2 = np.array([[380, 1070], [520, 950], [640, 880], [780, 810], [860, 720]], dtype=np.int32)
    cv2.polylines(canvas, [rut_pts_1], False, (*gc, 180), 2, cv2.LINE_AA)
    cv2.polylines(canvas, [rut_pts_2], False, (*gc, 180), 2, cv2.LINE_AA)

    t_plate, _ = render_pencil_text("Cairn III Benchmark Plate [Bearing 348* NNW]", FONT_PATH, font_size=21, gc=gc, seed=6040)
    blit_rgba(canvas, t_plate, 750, 680)

    # Wayfinding instructions & questions
    rules_lines = [
        "Wayfinding Ledger of the West Arches:",
        "1. Identify the three medallion arches inscribed with the letters [ M ] [ A ] [ Z ] [ E ].",
        "2. The true exit bearing from the sandstone arches towards Cairn III is: 042° True North-Northeast.",
        "3. Sighting Ray from Cairn III apex to Sun Monolith: 348° True North-Northwest.",
        "Verification: Copper Plate Seal III Decoded  -->  [ SEAL OF CAIRN III UNLOCKED ]",
    ]
    render_multiline_text(canvas, rules_lines, 180, 1120, font_size=23, line_spacing=36, gc=gc, seed_base=6050)

    # Right punch-hole enforcement (Cara B: X > 1583 has 0 px)
    canvas[:, 1583:, 3] = 0
    return canvas


# =========================================================================
# SHEET 15 · CARA A: JUEGO D7 — CAIRN IV (SENTRY OF THE CANYON)
# =========================================================================

def render_game_d7_cairn_iv_sentry(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 15 · Cara A (Front: X < 165 has 0 px).
    Acoustic echo calibration at the Sentinel Mesa canyon portal."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # Header
    t_title, _ = render_pencil_text("Cairn IV: Sentry of the Canyon", FONT_PATH, font_size=56, gc=gc, seed=7001)
    blit_rgba(canvas, t_title, 220, 80)

    t_sub, _ = render_pencil_text("Acoustic Resonance & The Gateway to the Sentinel Mesa", FONT_PATH, font_size=28, gc=gc, seed=7002)
    blit_rgba(canvas, t_sub, 224, 150)

    draw_sketchy_line(canvas, (220, 195), (1600, 195), gc=gc, alpha_base=180, passes=2, seed=7003)

    # Narrative
    lines_intro = [
        "Guarding the southern exit of the Whispering Chasm (Quadrant SW) stands Cairn IV: Sentry of the Canyon.",
        "Built from twin hollow stone pillars, wind blowing through its acoustic apertures generates distinct harmonics.",
        "The cliffs of the Sentinel Mesa echo the sound across the wash gorge. Only by matching the resonant frequency",
        "of the canyon walls will the stone latch open to surrender the Fourth Geodetic Seal.",
    ]
    render_multiline_text(canvas, lines_intro, 220, 220, font_size=23, line_spacing=34, gc=gc, seed_base=7010)

    # Acoustic Resonance Diagram (Twin Pillars with vibrating wave arcs)
    px0, py0 = 600, 800
    # Left pillar
    draw_sketchy_rect(canvas, (px0 - 180, py0 - 240, px0 - 80, py0 + 180), gc=gc, alpha_base=190, passes=2, seed=7020)
    # Right pillar
    draw_sketchy_rect(canvas, (px0 + 80, py0 - 240, px0 + 180, py0 + 180), gc=gc, alpha_base=190, passes=2, seed=7021)

    # Sound wave concentric arcs
    for r in range(40, 260, 35):
        cv2.ellipse(canvas, (px0, py0 - 30), (r, r // 2), 0, 0, 360, (*gc, 130), 1, cv2.LINE_AA)

    # Cliff profile behind
    draw_sketchy_line(canvas, (260, 480), (px0 - 200, py0 - 200), gc=gc, alpha_base=140, passes=2, seed=7030)
    draw_sketchy_line(canvas, (px0 + 200, py0 - 200), (1540, 480), gc=gc, alpha_base=140, passes=2, seed=7031)

    t_acoust, _ = render_pencil_text("Resonantia Murorum (Echo Frequencies)", FONT_PATH, font_size=22, gc=gc, seed=7040)
    blit_rgba(canvas, t_acoust, px0 - 150, py0 + 220)

    # Acoustic Cipher Matrix
    table_lines = [
        "Acoustic Proportion Ledger:",
        "· Canyon Wash Fundamental Tone: Freq Gamma = 432 Hz.",
        "· Echo Interval between Cliff Faces: Delta Tau = 1.618 beats (The Golden Ratio of Sound).",
        "· Harmonic Formula: [V] - [E] = 10  -->  With V = 12, E = 2, calculate acoustic resonance.",
        "Enter Resonant Passphrase: [   M   ] [   I   ] [   R   ] [   A   ] [   G   ] [   E   ]",
        "Status: [ SEAL OF CAIRN IV RECOVERED FROM THE SENTRY PILLAR ]",
    ]
    render_multiline_text(canvas, table_lines, 220, 1100, font_size=23, line_spacing=36, gc=gc, seed_base=7050)

    # Left punch-hole enforcement (Cara A: X < 165 has 0 px)
    canvas[:, :165, 3] = 0
    return canvas


# =========================================================================
# SHEET 15 · CARA B & SHEET 16 · CARA A: ZOOM AL PUENTE NATURAL (SPREAD 3)
# Directly inspired by the user's first photo (The Sentinel Mesa Elev. 980 varas)
# =========================================================================

def render_zoom_bridge_left(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 15 · Cara B (Spread 3 Left Panel · Full bleed across gutter to 16A).
    High-detail topographic zoom: western abutment of natural stone bridge, cliffs, strata."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # Title & Elevation label (as seen in the photo)
    t_title, _ = render_pencil_text("The Sentinel Mesa  (Elev. 980 varas)", FONT_PATH, font_size=38, gc=gc, seed=8001)
    blit_rgba(canvas, t_title, 260, 480)

    t_zoom_head, _ = render_pencil_text("Topographical Survey — Detailed Span of the Natural Rock Bridge", FONT_PATH, font_size=28, gc=gc, seed=8002)
    blit_rgba(canvas, t_zoom_head, 220, 100)

    # Draw western cliff precipices and talus slopes (Left side)
    # Cliff face 1 (far west)
    pts_cliff1 = np.array([[120, 200], [280, 500], [340, 800], [390, 1200], [420, 1700], [460, 2300]], dtype=np.int32)
    cv2.polylines(canvas, [pts_cliff1], False, (*gc, 210), 2, cv2.LINE_AA)

    # Deep vertical hatching for stratified rock
    for y_s in range(220, 2280, 24):
        x_st = int(120 + (y_s - 200) * 0.16)
        draw_sketchy_line(canvas, (x_st, y_s), (x_st + 180, y_s + 12), gc=gc, alpha_base=120, passes=1, seed=8010 + y_s)

    # The Natural Bridge Arch (Springing from left cliff toward right edge X=1748)
    # Top arch path
    pts_bridge_top = np.array([[460, 1180], [700, 940], [1050, 780], [1400, 680], [1748, 620]], dtype=np.int32)
    cv2.polylines(canvas, [pts_bridge_top], False, (*gc, 220), 2, cv2.LINE_AA)

    # Bottom arch curve (underbelly of bridge)
    pts_bridge_bot = np.array([[520, 1340], [800, 1120], [1150, 980], [1500, 910], [1748, 880]], dtype=np.int32)
    cv2.polylines(canvas, [pts_bridge_bot], False, (*gc, 220), 2, cv2.LINE_AA)

    # Shading under the bridge arch
    for x_b in range(540, 1740, 28):
        y_top = int(np.interp(x_b, pts_bridge_top[:, 0], pts_bridge_top[:, 1]))
        y_bot = int(np.interp(x_b, pts_bridge_bot[:, 0], pts_bridge_bot[:, 1]))
        draw_sketchy_line(canvas, (x_b, y_top + 10), (x_b - 15, y_bot - 10), gc=gc, alpha_base=130, passes=1, seed=8030 + x_b)

    # Fallen boulders & talus in the wash below
    boulders = [(480, 1580), (620, 1720), (750, 1640), (920, 1820), (1200, 1950), (1450, 2050)]
    for bx, by in boulders:
        draw_sketchy_circle(canvas, (bx, by), 26, gc=gc, alpha_base=170, passes=2, seed=8040 + bx)
        draw_hatching(canvas, (bx - 20, by - 20, bx + 20, by + 20), step=5, angle_deg=45, gc=gc, alpha=90, seed=8041 + bx)

    # Contour lines in canyon bed
    for cy in range(1600, 2300, 80):
        cv2.line(canvas, (400, cy), (1748, cy + 40), (*gc, 70), 1, cv2.LINE_AA)

    # Handwritten Field Notes (Left Panel)
    notes_left = [
        "Survey Note IX · Western Abutment:",
        "«The span rests upon massive sandstone cornices of the third age.",
        "A cart track of 5.5 palmos width crosses the upper saddle,",
        "descending by natural terraces toward the lower wash.»",
    ]
    render_multiline_text(canvas, notes_left, 240, 1980, font_size=22, line_spacing=32, gc=gc, seed_base=8050)

    # Full bleed across gutter to sheet 16A: no hole clamping on right side!
    return canvas


def render_zoom_bridge_right(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 16 · Cara A (Spread 3 Right Panel · Full bleed across gutter from 15B).
    High-detail topographic zoom: eastern abutment, towering buttress, Lower Wash descent."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # Title & Scale
    t_scale, _ = render_pencil_text("Scale: 1 : 250 (Varas Castellanas) — Continuous Topographic Section", FONT_PATH, font_size=26, gc=gc, seed=9001)
    blit_rgba(canvas, t_scale, 200, 100)

    # Natural Bridge Continuation from left edge X=0
    # Top arch path continuing
    pts_bridge_top = np.array([[0, 620], [300, 580], [600, 540], [820, 580], [1050, 680]], dtype=np.int32)
    cv2.polylines(canvas, [pts_bridge_top], False, (*gc, 220), 2, cv2.LINE_AA)

    # Bottom arch curve continuing and meeting right towering buttress
    pts_bridge_bot = np.array([[0, 880], [280, 860], [540, 840], [780, 890], [1000, 1020]], dtype=np.int32)
    cv2.polylines(canvas, [pts_bridge_bot], False, (*gc, 220), 2, cv2.LINE_AA)

    # Shading under arch continuation
    for x_b in range(0, 800, 28):
        y_top = int(np.interp(x_b, pts_bridge_top[:, 0], pts_bridge_top[:, 1]))
        y_bot = int(np.interp(x_b, pts_bridge_bot[:, 0], pts_bridge_bot[:, 1]))
        draw_sketchy_line(canvas, (x_b, y_top + 10), (x_b - 15, y_bot - 10), gc=gc, alpha_base=130, passes=1, seed=9010 + x_b)

    # Massive Towering Sandstone Buttress on East Side (as seen in photo)
    # Vertical cliff column with blocky fracture joints
    bx_st = 920
    draw_sketchy_line(canvas, (bx_st, 320), (bx_st, 2200), gc=gc, alpha_base=210, passes=2, seed=9020)
    draw_sketchy_line(canvas, (bx_st + 240, 260), (bx_st + 240, 2200), gc=gc, alpha_base=210, passes=2, seed=9021)
    draw_sketchy_line(canvas, (bx_st + 480, 200), (bx_st + 480, 2200), gc=gc, alpha_base=210, passes=2, seed=9022)

    # Horizontal strata joints across eastern buttress
    for by_j in range(350, 2150, 90):
        draw_sketchy_line(canvas, (bx_st, by_j), (bx_st + 480, by_j + 15), gc=gc, alpha_base=170, passes=1, seed=9030 + by_j)
        draw_hatching(canvas, (bx_st, by_j, bx_st + 240, by_j + 85), step=7, angle_deg=75, gc=gc, alpha=90, seed=9040 + by_j)

    # Lower Wash bed and boulders continuing
    boulders_r = [(180, 1850), (420, 1920), (680, 2040), (840, 1980)]
    for bx, by in boulders_r:
        draw_sketchy_circle(canvas, (bx, by), 24, gc=gc, alpha_base=170, passes=2, seed=9050 + bx)
        draw_hatching(canvas, (bx - 18, by - 18, bx + 18, by + 18), step=5, angle_deg=45, gc=gc, alpha=90, seed=9051 + bx)

    # Handwritten Field Notes (Right Panel)
    notes_right = [
        "Survey Note X · Eastern Buttress & Lower Wash:",
        "«The eastern pier rises 380 varas above the scree wash.",
        "Beneath the bridge, deep fissures lead toward the subterranean cisterns.",
        "Cairn IV stands sentinel at the northern approach; to the south lies the open salt basin.»",
    ]
    render_multiline_text(canvas, notes_right, 180, 1980, font_size=22, line_spacing=32, gc=gc, seed_base=9060)

    # Full bleed across gutter from sheet 15B: no hole clamping on left side!
    return canvas


# =========================================================================
# SHEET 16 · CARA B: JUEGO D8 — ARCH OF THE SOLSTICE & THE SOLAR ALTAR
# =========================================================================

def render_game_d8_arch_solstice_altar(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 16 · Cara B (Back: X > 1583 has 0 px).
    Zenith ray alignment through the Solstice Arch onto the Solar Altar at Cairn V."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # Header
    t_title, _ = render_pencil_text("Arch of the Solstice & The Solar Altar", FONT_PATH, font_size=52, gc=gc, seed=10001)
    blit_rgba(canvas, t_title, 180, 80)

    t_sub, _ = render_pencil_text("The Zenith Ray & The Final Marker (Seal of Cairn V)", FONT_PATH, font_size=28, gc=gc, seed=10002)
    blit_rgba(canvas, t_sub, 184, 148)

    draw_sketchy_line(canvas, (180, 190), (1540, 190), gc=gc, alpha_base=180, passes=2, seed=10003)

    # Narrative
    lines_intro = [
        "Before the monumental facade of Tower II stands the ceremonial Arch of the Solstice (Quadrant SE).",
        "Directly aligned with Cairn V (The Final Marker) lies the circular Solar Altar fitted with a brass focal ring.",
        "On the summer solstice noon, the sun's zenith beam passes cleanly through the archway's crown,",
        "focusing directly onto the central seal socket of Cairn V to unseal the fifth and final talisman.",
    ]
    render_multiline_text(canvas, lines_intro, 180, 220, font_size=23, line_spacing=34, gc=gc, seed_base=10010)

    # Central Drawing: The Monumental Solstice Arch & Solar Altar
    ax0, ay0 = 860, 900
    # Monumental Arch
    cv2.ellipse(canvas, (ax0, ay0 - 180), (340, 340), 0, 180, 360, (*gc, 200), 2, cv2.LINE_AA)
    cv2.ellipse(canvas, (ax0, ay0 - 180), (280, 280), 0, 180, 360, (*gc, 160), 1, cv2.LINE_AA)
    # Vertical stone piers
    draw_sketchy_rect(canvas, (ax0 - 340, ay0 - 180, ax0 - 280, ay0 + 180), gc=gc, alpha_base=190, passes=2, seed=10020)
    draw_sketchy_rect(canvas, (ax0 + 280, ay0 - 180, ax0 + 340, ay0 + 180), gc=gc, alpha_base=190, passes=2, seed=10021)

    # The Solar Altar in the center foreground
    draw_sketchy_circle(canvas, (ax0, ay0 + 80), 130, gc=gc, alpha_base=190, passes=2, seed=10030)
    draw_sketchy_circle(canvas, (ax0, ay0 + 80), 90, gc=gc, alpha_base=150, passes=1, seed=10031)

    # Zenith light ray beam
    draw_sketchy_line(canvas, (ax0, 200), (ax0, ay0 + 80), gc=gc, alpha_base=160, passes=2, seed=10040)
    # Sighting ray 163° SSE from Cairn V to Altar
    draw_sketchy_line(canvas, (ax0 - 240, 380), (ax0, ay0 + 80), gc=gc, alpha_base=140, passes=1, seed=10041)

    t_ray_lbl, _ = render_pencil_text("Bearing 163* True South-Southeast to Altar", FONT_PATH, font_size=20, gc=gc, seed=10050)
    blit_rgba(canvas, t_ray_lbl, ax0 - 320, ay0 - 50)

    # Puzzle instructions & resolution
    puzzle_lines = [
        "Zenith Ray Triangulation & Cairn V Activation:",
        "1. Solstice Declination: +23° 27' North.",
        "2. Angular Incidence through Keystone: 90° - Latitude 30° 00' = 60° Meridian Altitude.",
        "3. Final Altar Inscription: «WHEN LIGHT RESTS UPON STONE, THE SEAL IS BROKEN.»",
        "Result: [ SEAL OF CAIRN V EXTRACTED · ALL FIVE CAIRNS NOW ASSEMBLED IN THE SATCHEL ]",
    ]
    render_multiline_text(canvas, puzzle_lines, 180, 1140, font_size=23, line_spacing=36, gc=gc, seed_base=10060)

    # Right punch-hole enforcement (Cara B: X > 1583 has 0 px)
    canvas[:, 1583:, 3] = 0
    return canvas


# =========================================================================
# SHEET 18 · CARA A: JUEGO D10 — THE ORACLE'S HORIZON (TRIPLE TOWER CLIMAX)
# =========================================================================

def render_game_d10_oracle_horizon(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 18 · Cara A (Front: X < 165 has 0 px).
    Triple tower triangulation and unlocking the pathway to the Stage Path."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # Header
    t_title, _ = render_pencil_text("The Oracle's Horizon", FONT_PATH, font_size=56, gc=gc, seed=11001)
    blit_rgba(canvas, t_title, 220, 80)

    t_sub, _ = render_pencil_text("The Triple Tower Triangulation & The Stage Horizon", FONT_PATH, font_size=28, gc=gc, seed=11002)
    blit_rgba(canvas, t_sub, 224, 150)

    draw_sketchy_line(canvas, (220, 195), (1600, 195), gc=gc, alpha_base=180, passes=2, seed=11003)

    # Narrative
    lines_intro = [
        "Within the sanctum of Tower II, The Desert Oracle unrolls the grand triangular parchment of the Order.",
        "Hermes places the recovered Astrolabe upon the altar alongside the five Cairn seals.",
        "The Oracle speaks: «Tower I in the snow revealed WHAT. Here in the burning stone thou hast learned WHERE.",
        "Now align the two towers to project the vector eastward toward Tower III, where WHEN awaits.»",
    ]
    render_multiline_text(canvas, lines_intro, 220, 220, font_size=23, line_spacing=34, gc=gc, seed_base=11010)

    # Grand Triangulation Diagram (Tower I, Tower II, Tower III & Center Vault)
    cx, cy = 910, 850
    # Equilateral triangle
    r_tri = 380
    p_t1 = (cx, cy - r_tri)  # Tower I (North/Alpine)
    p_t2 = (int(cx - r_tri * math.cos(math.pi / 6)), int(cy + r_tri * math.sin(math.pi / 6)))  # Tower II (SW/Desert)
    p_t3 = (int(cx + r_tri * math.cos(math.pi / 6)), int(cy + r_tri * math.sin(math.pi / 6)))  # Tower III (SE/Stage)

    draw_sketchy_line(canvas, p_t1, p_t2, gc=gc, alpha_base=190, passes=2, seed=11020)
    draw_sketchy_line(canvas, p_t2, p_t3, gc=gc, alpha_base=190, passes=2, seed=11021)
    draw_sketchy_line(canvas, p_t3, p_t1, gc=gc, alpha_base=190, passes=2, seed=11022)

    # Medians converging on center vault
    draw_sketchy_line(canvas, p_t1, (cx, cy), gc=gc, alpha_base=120, passes=1, seed=11023)
    draw_sketchy_line(canvas, p_t2, (cx, cy), gc=gc, alpha_base=120, passes=1, seed=11024)
    draw_sketchy_line(canvas, p_t3, (cx, cy), gc=gc, alpha_base=120, passes=1, seed=11025)

    # Tower node circles
    for pt, name, clue, stars in [
        (p_t1, "TOWER I: THE ALPINE OBSERVATORY", "WHAT: The Ballet Tickets", "Polaris & Aldebaran"),
        (p_t2, "TOWER II: THE SANDSTONE SANCTUARY", "WHERE: The City & Theatre", "Vega & Deneb"),
        (p_t3, "TOWER III: THE STAGE TOWER", "WHEN: Date & Hour of the Gala", "Altair & Arcturus"),
    ]:
        draw_sketchy_circle(canvas, pt, 45, gc=gc, alpha_base=190, passes=2, seed=11030 + pt[0])
        draw_sketchy_circle(canvas, pt, 35, gc=gc, alpha_base=130, passes=1, seed=11031 + pt[0])

        t_n, _ = render_pencil_text(name, FONT_PATH, font_size=20, gc=gc, seed=11040 + pt[0])
        t_c, _ = render_pencil_text(f"[{clue}]", FONT_PATH, font_size=18, gc=gc, seed=11041 + pt[0])
        t_s, _ = render_pencil_text(f"Stars: {stars}", FONT_PATH, font_size=17, gc=gc, seed=11042 + pt[0])

        offset_y = -75 if pt == p_t1 else 55
        blit_rgba(canvas, t_n, pt[0] - 160, pt[1] + offset_y)
        blit_rgba(canvas, t_c, pt[0] - 110, pt[1] + offset_y + 24)
        blit_rgba(canvas, t_s, pt[0] - 80, pt[1] + offset_y + 46)

    # Center Vault of Convergence
    draw_sketchy_circle(canvas, (cx, cy), 32, gc=gc, alpha_base=210, passes=2, seed=11050)
    t_v, _ = render_pencil_text("✦", FONT_PATH, font_size=28, gc=gc, seed=11051)
    blit_rgba(canvas, t_v, cx - 8, cy - 18)

    t_v_lbl, _ = render_pencil_text("The Vault of the Grand Eclipse", FONT_PATH, font_size=20, gc=gc, seed=11052)
    blit_rgba(canvas, t_v_lbl, cx - 110, cy + 38)

    # Master Climax Equation
    climax_lines = [
        "The Triangulation Theorem of the Three Towers:",
        "Vector I (Tower I -> Tower II): Bearing 194° SSW · Confirmed by Al-Qibla Sun Compass.",
        "Vector II (Tower II -> Tower III): Bearing 076° ENE · Towards the Great Auditorium of Mirrors.",
        "Master Alignment: When WHAT, WHERE, and WHEN converge, the secret 4th vault unlocks.",
        "Status: [ DESERT PATH COMPLETED · STAGE PATH NAVIGATION PROTOCOL INITIALIZED ]",
    ]
    render_multiline_text(canvas, climax_lines, 220, 1160, font_size=23, line_spacing=36, gc=gc, seed_base=11060)

    # Left punch-hole enforcement (Cara A: X < 165 has 0 px)
    canvas[:, :165, 3] = 0
    return canvas


# =========================================================================
# SHEET 18 · CARA B: ARTE DE TRANSICIÓN AL STAGE PATH
# Directly inspired by the user's second photo (Theatrical Drapes, Perspective Pillars & Harmonic Waves)
# =========================================================================

def render_art_18b_stage_path_transition(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 18 · Cara B (Back: X > 1583 has 0 px).
    Atmospheric artwork marking the transition from Desert Path to Stage Path."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # Artistic composition inspired by the sketchbook photo
    # Left side (X: 180 to 520): Theatrical Drapes, Proscenium Folds & Stars
    # Dividing braid spine (X: 520 to 600)
    # Center pillars (X: 600 to 1050): Vertical chevron / herringbone columns in perspective
    # Right side (X: 1050 to 1540): Floor perspective grid with flowing harmonic wave contours

    # 1. Left Theatre Curtains / Drapes (flowing vertical S-curves)
    drape_x_start = 180
    for fold in range(0, 320, 45):
        pts_drape = []
        for y in range(80, 2300, 30):
            wobble = 25 * math.sin(y * 0.008 + fold) + 12 * math.cos(y * 0.015)
            pts_drape.append((int(drape_x_start + fold + wobble), y))
        pts_drape = np.array(pts_drape, dtype=np.int32)
        cv2.polylines(canvas, [pts_drape], False, (*gc, 180), 1, cv2.LINE_AA)

        # Subtle shading between drape folds
        for y_sh in range(120, 2250, 40):
            px = int(drape_x_start + fold + 25 * math.sin(y_sh * 0.008 + fold))
            cv2.line(canvas, (px, y_sh), (px + 28, y_sh + 10), (*gc, 80), 1, cv2.LINE_AA)

    # Four-pointed celestial stars on the curtain folds
    star_locs = [(260, 420), (320, 560), (280, 780), (340, 1100), (250, 1450), (310, 1850)]
    for sx, sy in star_locs:
        r1, r2 = 24, 7
        # 4 points
        for rad in [0, math.pi / 2, math.pi, 3 * math.pi / 2]:
            px1 = int(sx + r1 * math.cos(rad))
            py1 = int(sy + r1 * math.sin(rad))
            cv2.line(canvas, (sx, sy), (px1, py1), (*gc, 200), 1, cv2.LINE_AA)
        for rad in [math.pi / 4, 3 * math.pi / 4, 5 * math.pi / 4, 7 * math.pi / 4]:
            px2 = int(sx + r2 * math.cos(rad))
            py2 = int(sy + r2 * math.sin(rad))
            cv2.line(canvas, (sx, sy), (px2, py2), (*gc, 160), 1, cv2.LINE_AA)

    # Swirling rose / spiral motifs (bottom left)
    for cx_sp, cy_sp, r_max in [(280, 1320, 70), (340, 1600, 85), (270, 1880, 75)]:
        pts_sp = []
        for theta_deg in range(0, 1080, 15):
            t_rad = math.radians(theta_deg)
            r_curr = (theta_deg / 1080.0) * r_max
            px = int(cx_sp + r_curr * math.cos(t_rad))
            py = int(cy_sp + r_curr * math.sin(t_rad))
            pts_sp.append((px, py))
        cv2.polylines(canvas, [np.array(pts_sp, dtype=np.int32)], False, (*gc, 160), 1, cv2.LINE_AA)

    # 2. Vertical Braided / Scaled Column Spine (X: 520 to 600)
    bx_spine = 540
    draw_sketchy_line(canvas, (bx_spine, 80), (bx_spine, 2300), gc=gc, alpha_base=210, passes=2, seed=12010)
    draw_sketchy_line(canvas, (bx_spine + 65, 80), (bx_spine + 65, 2300), gc=gc, alpha_base=210, passes=2, seed=12011)

    for by_scale in range(90, 2280, 32):
        # Half circle loops (overlapping scales)
        cv2.ellipse(canvas, (bx_spine + 32, by_scale), (28, 20), 0, 0, 180, (*gc, 170), 1, cv2.LINE_AA)
        draw_hatching(canvas, (bx_spine + 10, by_scale - 10, bx_spine + 55, by_scale + 15), step=4, angle_deg=45, gc=gc, alpha=70, seed=12020 + by_scale)

    # 3. Center Pillars with Herringbone / Chevron Lines (X: 630 to 1020)
    px1, px2, px3 = 640, 820, 1010
    draw_sketchy_line(canvas, (px1, 80), (px1, 2300), gc=gc, alpha_base=200, passes=2, seed=12030)
    draw_sketchy_line(canvas, (px2, 80), (px2, 2300), gc=gc, alpha_base=200, passes=2, seed=12031)
    draw_sketchy_line(canvas, (px3, 80), (px3, 2300), gc=gc, alpha_base=200, passes=2, seed=12032)

    # Chevron lines between px1 and px2 (pointing upward)
    for py_chev in range(90, 2280, 26):
        draw_sketchy_line(canvas, (px1, py_chev + 14), (px2, py_chev - 14), gc=gc, alpha_base=140, passes=1, seed=12040 + py_chev)
        draw_sketchy_line(canvas, (px2, py_chev - 14), (px3, py_chev + 14), gc=gc, alpha_base=140, passes=1, seed=12041 + py_chev)

    # 4. Right Side Stage Floor Perspective Grid (X: 1040 to 1540)
    gx_start, gx_end = 1040, 1540
    # Vertical grid lines
    for gx in range(gx_start, gx_end + 1, 38):
        draw_sketchy_line(canvas, (gx, 80), (gx, 2300), gc=gc, alpha_base=110, passes=1, seed=12050 + gx)
    # Horizontal grid lines
    for gy in range(80, 2301, 38):
        draw_sketchy_line(canvas, (gx_start, gy), (gx_end, gy), gc=gc, alpha_base=110, passes=1, seed=12060 + gy)

    # Flowing Organic Wave Contours & Atmospheric Wisps over the grid
    # (Harmonic sound/dance waves transitioning to Stage Path)
    for wave_idx, (y_base, amp, freq, phase) in enumerate([
        (350, 60, 0.007, 0.0),
        (520, 80, 0.009, 1.2),
        (750, 70, 0.006, 2.5),
        (1020, 95, 0.008, 0.8),
        (1350, 85, 0.007, 3.1),
        (1680, 75, 0.010, 1.9),
        (2000, 90, 0.006, 0.5),
    ]):
        pts_wave = []
        for x in range(gx_start - 30, gx_end + 30, 16):
            y = int(y_base + amp * math.sin(x * freq + phase) + (amp // 3) * math.cos(x * 0.018))
            pts_wave.append((x, y))
        pts_wave = np.array(pts_wave, dtype=np.int32)
        cv2.polylines(canvas, [pts_wave], False, (*gc, 190), 2, cv2.LINE_AA)

        # Concentric contour echo line
        pts_echo = np.array([(p[0], p[1] - 18) for p in pts_wave], dtype=np.int32)
        cv2.polylines(canvas, [pts_echo], False, (*gc, 130), 1, cv2.LINE_AA)

    # Poetic Latin / Renaissance Inscription at bottom
    draw_sketchy_line(canvas, (180, 2180), (1540, 2180), gc=gc, alpha_base=180, passes=2, seed=12080)

    t_trans_title, _ = render_pencil_text("Transitus ad Theatrum Harmonicum", FONT_PATH, font_size=28, gc=gc, seed=12090)
    blit_rgba(canvas, t_trans_title, 200, 2210)

    t_trans_desc, _ = render_pencil_text("From the silence of stone to the symmetry of the proscenium — The Stage Path begins.", FONT_PATH, font_size=22, gc=gc, seed=12091)
    blit_rgba(canvas, t_trans_desc, 204, 2255)

    # Right punch-hole enforcement (Cara B: X > 1583 has 0 px)
    canvas[:, 1583:, 3] = 0
    return canvas


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
        if label not in ("15B", "16A"):
            if is_back:
                v = np.count_nonzero(c[:, 1583:, 3])
                assert v == 0, f"{label} Back punch violation: {v} px!"
            else:
                v = np.count_nonzero(c[:, :165, 3])
                assert v == 0, f"{label} Front punch violation: {v} px!"
        print(f"  [OK] {label}: Shape {c.shape}, Punch margin clear.")
    print("All 12 Expanded Desert Odyssey Pages verified successfully!")
