import sys
sys.path.insert(0, 'scripts/journal')
import os, cv2, numpy as np, math, random
from collections import deque
from build_entire_journal import PDFBuilder, JOURNAL_DIR, GRAPHITE_COLOR
from build_page06_07 import create_handdrawn_divider, wrap_text_to_width
from build_desert_odyssey_expanded import (
    FONT_PATH, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX,
    render_pencil_text, draw_sketchy_rect, draw_sketchy_circle,
    draw_sketchy_line, _draw_arc, blit_rgba, _clear_polygon, _hatch_polygon, _draw_rock,
    _draw_cairn_elevation
)

LABYRINTH_SIGIL = "WINDROSE"

def build_labyrinth_maze(rows, cols, start_c, goal_c, seed=881):
    """Generates a perfect maze using seed 881 (163-step path, 107 turns, 17 forks)."""
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


def draw_davinci_wind_vortex(canvas, cx, cy, w, h, gc, seed=1740):
    """Da Vinci fluid dynamics aerological sketch: curling streamlines of the West Wind (Favonius)."""
    rng = np.random.default_rng(seed)
    # Streamline currents curling from west to east
    y_offsets = [-35, -20, -5, 10, 25, 40]
    for i, y_off in enumerate(y_offsets):
        pts = []
        for t in np.linspace(0, 1, 45):
            x = int(cx - w // 2 + t * w * 0.85 + math.sin(t * 4.2 + i * 0.6) * 14)
            y = int(cy + y_off + math.cos(t * 3.5 + i * 0.5) * 10)
            pts.append((x, y))
        for k in range(len(pts) - 1):
            cv2.line(canvas, pts[k], pts[k+1], (*gc, 110 + i * 16), 1, cv2.LINE_AA)
            if k % 4 == 0 and k < len(pts) - 2:
                # Faint feather strokes
                cv2.line(canvas, pts[k], (pts[k][0] + 5, pts[k][1] - 3), (*gc, 75), 1, cv2.LINE_AA)

    # 3 Curly spiral vortices (turbini d'aria)
    vortices = [
        (cx + int(w * 0.22), cy - 14, 24, 1),
        (cx + int(w * 0.38), cy + 16, 18, -1),
        (cx + int(w * 0.12), cy + 24, 15, 1)
    ]
    for vx, vy, r_max, dir_sign in vortices:
        spiral_pts = []
        for theta in np.linspace(0, 3.8 * math.pi, 48):
            r = r_max * (1.0 - theta / (4.2 * math.pi))
            x = int(vx + r * math.cos(theta * dir_sign))
            y = int(vy + r * math.sin(theta * dir_sign))
            spiral_pts.append((x, y))
        for k in range(len(spiral_pts) - 1):
            cv2.line(canvas, spiral_pts[k], spiral_pts[k+1], (*gc, 155), 1, cv2.LINE_AA)

    # Text annotation beneath vortex
    t_v1, _ = render_pencil_text("Favonius · The West Gale", FONT_PATH, font_size=19, gc=gc, seed=seed + 1)
    if t_v1 is not None:
        blit_rgba(canvas, t_v1, int(cx - t_v1.shape[1] / 2), cy + h // 2 - 12)
    t_v2, _ = render_pencil_text("« Wind of the Canyon Arches »", FONT_PATH, font_size=16, gc=gc, seed=seed + 2)
    if t_v2 is not None:
        blit_rgba(canvas, t_v2, int(cx - t_v2.shape[1] / 2), cy + h // 2 + 10)


def draw_renaissance_compass_rose(canvas, cx, cy, r, gc, seed=1750):
    """16-point surveyor compass rose (Rosa dei Venti) with shaded points and Fleur-de-lis."""
    # Outer concentric degree rings
    cv2.circle(canvas, (cx, cy), r, (*gc, 210), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), r - 5, (*gc, 130), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), int(r * 0.52), (*gc, 120), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), int(r * 0.28), (*gc, 160), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), 3, (*gc, 220), -1)

    # Degree tick marks every 15 degrees
    for deg in range(0, 360, 15):
        rad = math.radians(deg)
        r_inner = r - 10 if deg % 45 == 0 else (r - 7 if deg % 30 == 0 else r - 4)
        p1 = (int(cx + r_inner * math.cos(rad)), int(cy + r_inner * math.sin(rad)))
        p2 = (int(cx + r * math.cos(rad)), int(cy + r * math.sin(rad)))
        cv2.line(canvas, p1, p2, (*gc, 160 if deg % 45 == 0 else 100), 1, cv2.LINE_AA)

    # 8 Primary points (alternating dark/light shading)
    primary_angles = [0, 45, 90, 135, 180, 225, 270, 315]
    for i, a in enumerate(primary_angles):
        rad = math.radians(a)
        rad_l = math.radians(a - 22.5)
        rad_r = math.radians(a + 22.5)
        tip_r = r - 6 if i % 2 == 0 else int((r - 6) * 0.75)
        base_r = int(r * 0.28)
        
        pt_tip = (int(cx + tip_r * math.sin(rad)), int(cy - tip_r * math.cos(rad)))
        pt_base_l = (int(cx + base_r * math.sin(rad_l)), int(cy - base_r * math.cos(rad_l)))
        pt_base_r = (int(cx + base_r * math.sin(rad_r)), int(cy - base_r * math.cos(rad_r)))
        
        # Left shaded half
        poly_l = np.array([(cx, cy), pt_base_l, pt_tip], dtype=np.int32)
        cv2.fillPoly(canvas, [poly_l], (*gc, 185))
        cv2.polylines(canvas, [poly_l], True, (*gc, 215), 1, cv2.LINE_AA)
        # Right outlined half
        poly_r = np.array([(cx, cy), pt_base_r, pt_tip], dtype=np.int32)
        cv2.polylines(canvas, [poly_r], True, (*gc, 205), 1, cv2.LINE_AA)

    # Northern Fleur-de-lis finial at top
    fl_tip = (cx, cy - r - 12)
    fl_pts = np.array([(cx, cy - r + 2), (cx - 7, cy - r - 6), (cx, cy - r - 14), (cx + 7, cy - r - 6)], dtype=np.int32)
    cv2.fillPoly(canvas, [fl_pts], (*gc, 200))
    cv2.polylines(canvas, [fl_pts], True, (*gc, 225), 1, cv2.LINE_AA)

    # Cardinal labels: N, E, S, W
    cardinals = [
        ("N", cx, cy - r - 22, 19),
        ("S", cx, cy + r + 16, 17),
        ("E", cx + r + 14, cy + 6, 17),
        ("W", cx - r - 14, cy + 6, 17)
    ]
    for lbl, lx, ly, lsz in cardinals:
        t_c, _ = render_pencil_text(lbl, FONT_PATH, font_size=lsz, gc=gc, seed=seed + 10)
        if t_c is not None:
            blit_rgba(canvas, t_c, int(lx - t_c.shape[1] / 2), int(ly - t_c.shape[0] / 2))


def draw_romanesque_stone_arch(canvas, cx, cy, letter, gc, seed):
    """Detailed Romanesque stone arch with radial voussoirs, keystone, moldings, and clear letter."""
    r_out = 23
    r_in = 15
    y_spring = cy - 4
    y_ground = cy + 22

    # Pier plinths at ground level
    cv2.line(canvas, (cx - 26, y_ground), (cx - 12, y_ground), (*gc, 215), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx + 12, y_ground), (cx + 26, y_ground), (*gc, 215), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx - 26, y_ground - 3), (cx - 12, y_ground - 3), (*gc, 170), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx + 12, y_ground - 3), (cx + 26, y_ground - 3), (*gc, 170), 1, cv2.LINE_AA)

    # Vertical piers
    cv2.line(canvas, (cx - r_out, y_spring), (cx - r_out, y_ground - 3), (*gc, 225), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx - r_in, y_spring), (cx - r_in, y_ground - 3), (*gc, 195), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx + r_in, y_spring), (cx + r_in, y_ground - 3), (*gc, 195), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx + r_out, y_spring), (cx + r_out, y_ground - 3), (*gc, 225), 1, cv2.LINE_AA)

    # Core stone tone in piers
    cv2.rectangle(canvas, (cx - r_out + 1, y_spring), (cx - r_in - 1, y_ground - 3), (*gc, 40), -1)
    cv2.rectangle(canvas, (cx + r_in + 1, y_spring), (cx + r_out - 1, y_ground - 3), (*gc, 45), -1)

    # Stone courses on piers
    for y_c in range(y_spring + 6, y_ground - 4, 6):
        cv2.line(canvas, (cx - r_out, y_c), (cx - r_in, y_c), (*gc, 140), 1, cv2.LINE_AA)
        cv2.line(canvas, (cx + r_in, y_c), (cx + r_out, y_c), (*gc, 140), 1, cv2.LINE_AA)

    # Right pier shadow hatching (sun from NW)
    for y_s in range(y_spring + 2, y_ground - 2, 4):
        cv2.line(canvas, (cx + r_out, y_s), (cx + r_out + 4, y_s + 4), (*gc, 90), 1, cv2.LINE_AA)

    # Impost mouldings at springing line
    cv2.line(canvas, (cx - 26, y_spring), (cx - 13, y_spring), (*gc, 225), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx - 26, y_spring + 2), (cx - 13, y_spring + 2), (*gc, 175), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx + 13, y_spring), (cx + 26, y_spring), (*gc, 225), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx + 13, y_spring + 2), (cx + 26, y_spring + 2), (*gc, 175), 1, cv2.LINE_AA)

    # Semicircular arch curves
    _draw_arc(canvas, (cx, y_spring), r_out, 180, 360, gc=gc, alpha=225, seed=seed + 1, passes=2)
    _draw_arc(canvas, (cx, y_spring), r_in, 180, 360, gc=gc, alpha=195, seed=seed + 2, passes=1)
    _draw_arc(canvas, (cx, y_spring), r_out + 2, 180, 360, gc=gc, alpha=130, seed=seed + 3, passes=1)

    # Tone inside voussoir ring
    ring_mask = np.zeros((r_out * 2 + 8, r_out * 2 + 8), dtype=np.uint8)
    cv2.circle(ring_mask, (r_out + 4, r_out + 4), r_out, 255, -1)
    cv2.circle(ring_mask, (r_out + 4, r_out + 4), r_in, 0, -1)
    ring_mask[r_out + 4:, :] = 0
    patch = np.zeros((r_out * 2 + 8, r_out * 2 + 8, 4), dtype=np.uint8)
    patch[ring_mask > 0] = (*gc, 35)
    blit_rgba(canvas, patch, cx - r_out - 4, y_spring - r_out - 4)

    # Radial voussoirs (wedge stones)
    angles = [180 + 20 * i for i in range(1, 9)]
    for a in angles:
        if a in (260, 280):
            continue
        rad = math.radians(a)
        p_in = (int(round(cx + r_in * math.cos(rad))), int(round(y_spring + r_in * math.sin(rad))))
        p_out = (int(round(cx + r_out * math.cos(rad))), int(round(y_spring + r_out * math.sin(rad))))
        cv2.line(canvas, p_in, p_out, (*gc, 160), 1, cv2.LINE_AA)

    # Central Keystone at apex
    k_rad_l = math.radians(261)
    k_rad_r = math.radians(279)
    k_in_l = (int(round(cx + r_in * math.cos(k_rad_l))), int(round(y_spring + r_in * math.sin(k_rad_l))))
    k_in_r = (int(round(cx + r_in * math.cos(k_rad_r))), int(round(y_spring + r_in * math.sin(k_rad_r))))
    k_out_l = (int(round(cx + (r_out + 4) * math.cos(k_rad_l))), int(round(y_spring + (r_out + 4) * math.sin(k_rad_l))))
    k_out_r = (int(round(cx + (r_out + 4) * math.cos(k_rad_r))), int(round(y_spring + (r_out + 4) * math.sin(k_rad_r))))
    cv2.line(canvas, k_in_l, k_out_l, (*gc, 225), 1, cv2.LINE_AA)
    cv2.line(canvas, k_in_r, k_out_r, (*gc, 225), 1, cv2.LINE_AA)
    cv2.line(canvas, k_out_l, k_out_r, (*gc, 225), 1, cv2.LINE_AA)

    # Soft inner arch barrel shadow
    for y_sh in range(cy - 3, cy + 5):
        x_span = int(math.sqrt(max(0, r_in**2 - (y_sh - y_spring)**2)) * 0.75)
        if x_span > 2:
            cv2.line(canvas, (cx - x_span, y_sh), (cx + x_span, y_sh), (*gc, 42), 1, cv2.LINE_AA)

    # Graphite pencil letter centered inside the portal
    l_img, _ = render_pencil_text(letter, FONT_PATH, font_size=28, gc=gc, seed=seed + 5)
    if l_img is not None:
        blit_rgba(canvas, l_img, int(cx - l_img.shape[1] / 2), int(cy - l_img.shape[0] / 2 + 7))


def render_desert_odyssey_14b_complete(gc=GRAPHITE_COLOR):
    """Assembles the complete, magnificent Sheet 14 · Cara B."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    X0, W = 180, 1360
    BODY, BODY_LH = 35, 50
    SEC, SEC_LH = 44, 60
    CELL, COLS, ROWS = 72, 17, 12
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

    # 1. Page Header
    put("The Sandstone Labyrinth & Cairn III", X0, 85, 62, 6001)
    blit_rgba(canvas, create_handdrawn_divider(width=W, gc=gc, seed=6003), X0, 170)

    # 2. Section I: The Arches of the West Wind
    y = 220
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

    # 3. Labyrinth Plate
    top_m = 138
    bot_m = 105
    plate_h = top_m + ROWS * CELL + bot_m
    y0_plate = y

    # Outer Renaissance double frame with corner florets
    draw_sketchy_rect(canvas, (X0, y0_plate, X0 + W, y0_plate + plate_h), gc=gc, alpha_base=220, passes=2, seed=1701)
    draw_sketchy_rect(canvas, (X0 + 8, y0_plate + 8, X0 + W - 8, y0_plate + plate_h - 8), gc=gc, alpha_base=125, passes=1, seed=1702)

    for cx_, cy_ in ((X0 + 8, y0_plate + 8), (X0 + W - 8, y0_plate + 8), (X0 + 8, y0_plate + plate_h - 8), (X0 + W - 8, y0_plate + plate_h - 8)):
        pts = np.array([(cx_, cy_ - 8), (cx_ + 8, cy_), (cx_, cy_ + 8), (cx_ - 8, cy_)], dtype=np.int32)
        cv2.fillPoly(canvas, [pts], (*gc, 195))

    # Graticule tick marks along outer frame edges
    for gx in range(X0 + 40, X0 + W - 30, 60):
        cv2.line(canvas, (gx, y0_plate + 3), (gx, y0_plate + 8), (*gc, 140), 1, cv2.LINE_AA)
        cv2.line(canvas, (gx, y0_plate + plate_h - 8), (gx, y0_plate + plate_h - 3), (*gc, 140), 1, cv2.LINE_AA)
    for gy in range(y0_plate + 40, y0_plate + plate_h - 30, 60):
        cv2.line(canvas, (X0 + 3, gy), (X0 + 8, gy), (*gc, 140), 1, cv2.LINE_AA)
        cv2.line(canvas, (X0 + W - 8, gy), (X0 + W - 3, gy), (*gc, 140), 1, cv2.LINE_AA)

    # Flanking Renaissance elements in top margin
    # West Wind Vortex (top-left)
    draw_davinci_wind_vortex(canvas, X0 + 130, y0_plate + 65, 190, 90, gc, seed=1740)
    # Compass Rose (top-right)
    draw_renaissance_compass_rose(canvas, X0 + W - 110, y0_plate + 68, 52, gc, seed=1750)

    # Labyrinth grid bounds
    mx0 = X0 + (W - COLS * CELL) // 2
    my0 = y0_plate + top_m
    mx1, my1 = mx0 + COLS * CELL, my0 + ROWS * CELL

    open_edges, road = build_labyrinth_maze(ROWS, COLS, START_C, GOAL_C, seed=881)

    hw = 4  # Wall half-width (thickness = 8px)
    def is_open(a, b):
        return frozenset((a, b)) in open_edges

    pillars = set()

    # Corridor silt washes & wash ripples (subtle sedimentary lines)
    for r in range(ROWS):
        for c in range(COLS):
            cx = mx0 + c * CELL + CELL // 2
            cy = my0 + r * CELL + CELL // 2
            # Faint flow line through cell
            cv2.line(canvas, (cx - 16, cy), (cx + 16, cy), (*gc, 26), 1, cv2.LINE_AA)
            cv2.line(canvas, (cx, cy - 16), (cx, cy + 16), (*gc, 22), 1, cv2.LINE_AA)

    # Internal canyon walls
    for r in range(ROWS):
        for c in range(COLS):
            x, cell_y = mx0 + c * CELL, my0 + r * CELL

            # Vertical wall between (r, c) and (r, c+1)
            if c < COLS - 1 and not is_open((r, c), (r, c + 1)):
                wx = x + CELL
                cv2.rectangle(canvas, (wx - hw, cell_y), (wx + hw, cell_y + CELL), (*gc, 40), -1)
                cv2.line(canvas, (wx - hw, cell_y), (wx - hw, cell_y + CELL), (*gc, 215), 1, cv2.LINE_AA)
                cv2.line(canvas, (wx + hw, cell_y), (wx + hw, cell_y + CELL), (*gc, 215), 1, cv2.LINE_AA)
                for jy in range(cell_y + 8, cell_y + CELL - 4, 12):
                    cv2.line(canvas, (wx - hw, jy), (wx + hw, jy), (*gc, 135), 1, cv2.LINE_AA)
                # Cast shadow to the East
                for sy in range(cell_y + 3, cell_y + CELL - 2, 6):
                    cv2.line(canvas, (wx + hw, sy), (wx + hw + 5, sy + 3), (*gc, 85), 1, cv2.LINE_AA)
                pillars.update({(c + 1, r), (c + 1, r + 1)})

            # Horizontal wall between (r, c) and (r+1, c)
            if r < ROWS - 1 and not is_open((r, c), (r + 1, c)):
                wy = cell_y + CELL
                cv2.rectangle(canvas, (x, wy - hw), (x + CELL, wy + hw), (*gc, 40), -1)
                cv2.line(canvas, (x, wy - hw), (x + CELL, wy - hw), (*gc, 215), 1, cv2.LINE_AA)
                cv2.line(canvas, (x, wy + hw), (x + CELL, wy + hw), (*gc, 215), 1, cv2.LINE_AA)
                for jx in range(x + 8, x + CELL - 4, 12):
                    cv2.line(canvas, (jx, wy - hw), (jx, wy + hw), (*gc, 135), 1, cv2.LINE_AA)
                # Cast shadow to the South
                for sx in range(x + 3, x + CELL - 2, 6):
                    cv2.line(canvas, (sx, wy + hw), (sx + 3, wy + hw + 5), (*gc, 85), 1, cv2.LINE_AA)
                pillars.update({(c, r + 1), (c + 1, r + 1)})

    # Outer boundary walls
    # Top wall (opening at GOAL_C = 5)
    for c in range(COLS):
        wx = mx0 + c * CELL
        if c != GOAL_C:
            cv2.rectangle(canvas, (wx, my0 - hw), (wx + CELL, my0 + hw), (*gc, 48), -1)
            cv2.line(canvas, (wx, my0 - hw), (wx + CELL, my0 - hw), (*gc, 225), 1, cv2.LINE_AA)
            cv2.line(canvas, (wx, my0 + hw), (wx + CELL, my0 + hw), (*gc, 225), 1, cv2.LINE_AA)
            for jx in range(wx + 8, wx + CELL - 4, 12):
                cv2.line(canvas, (jx, my0 - hw), (jx, my0 + hw), (*gc, 140), 1, cv2.LINE_AA)
            for sx in range(wx + 3, wx + CELL - 2, 6):
                cv2.line(canvas, (sx, my0 + hw), (sx + 3, my0 + hw + 5), (*gc, 85), 1, cv2.LINE_AA)

    # Bottom wall (opening at START_C = 10)
    for c in range(COLS):
        wx = mx0 + c * CELL
        if c != START_C:
            cv2.rectangle(canvas, (wx, my1 - hw), (wx + CELL, my1 + hw), (*gc, 48), -1)
            cv2.line(canvas, (wx, my1 - hw), (wx + CELL, my1 - hw), (*gc, 225), 1, cv2.LINE_AA)
            cv2.line(canvas, (wx, my1 + hw), (wx + CELL, my1 + hw), (*gc, 225), 1, cv2.LINE_AA)
            for jx in range(wx + 8, wx + CELL - 4, 12):
                cv2.line(canvas, (jx, my1 - hw), (jx, my1 + hw), (*gc, 140), 1, cv2.LINE_AA)
            for sx in range(wx + 3, wx + CELL - 2, 6):
                cv2.line(canvas, (sx, my1 + hw), (sx + 3, my1 + hw + 5), (*gc, 85), 1, cv2.LINE_AA)

    # Left & Right perimeter walls
    for r in range(ROWS):
        wy = my0 + r * CELL
        # Left wall
        cv2.rectangle(canvas, (mx0 - hw, wy), (mx0 + hw, wy + CELL), (*gc, 48), -1)
        cv2.line(canvas, (mx0 - hw, wy), (mx0 - hw, wy + CELL), (*gc, 225), 1, cv2.LINE_AA)
        cv2.line(canvas, (mx0 + hw, wy), (mx0 + hw, wy + CELL), (*gc, 225), 1, cv2.LINE_AA)
        for jy in range(wy + 8, wy + CELL - 4, 12):
            cv2.line(canvas, (mx0 - hw, jy), (mx0 + hw, jy), (*gc, 140), 1, cv2.LINE_AA)
        for sy in range(wy + 3, wy + CELL - 2, 6):
            cv2.line(canvas, (mx0 + hw, sy), (mx0 + hw + 5, sy + 3), (*gc, 85), 1, cv2.LINE_AA)
        # Right wall
        cv2.rectangle(canvas, (mx1 - hw, wy), (mx1 + hw, wy + CELL), (*gc, 48), -1)
        cv2.line(canvas, (mx1 - hw, wy), (mx1 - hw, wy + CELL), (*gc, 225), 1, cv2.LINE_AA)
        cv2.line(canvas, (mx1 + hw, wy), (mx1 + hw, wy + CELL), (*gc, 225), 1, cv2.LINE_AA)
        for jy in range(wy + 8, wy + CELL - 4, 12):
            cv2.line(canvas, (mx1 - hw, jy), (mx1 + hw, jy), (*gc, 140), 1, cv2.LINE_AA)

    # Dressed square ashlar corner blocks at junctions
    for (pc, pr_) in pillars:
        px, py_c = mx0 + pc * CELL, my0 + pr_ * CELL
        if 0 < pc < COLS and 0 < pr_ < ROWS:
            cv2.rectangle(canvas, (px - 5, py_c - 5), (px + 5, py_c + 5), (0, 0, 0, 0), -1)
            cv2.rectangle(canvas, (px - 5, py_c - 5), (px + 5, py_c + 5), (*gc, 65), -1)
            cv2.rectangle(canvas, (px - 5, py_c - 5), (px + 5, py_c + 5), (*gc, 225), 1, cv2.LINE_AA)
            cv2.line(canvas, (px - 5, py_c - 5), (px + 5, py_c + 5), (*gc, 130), 1, cv2.LINE_AA)
            cv2.circle(canvas, (px, py_c), 1, (*gc, 220), -1)

    # 4. Stone Arches: 8 true arches on the road spelling WINDROSE, 12 decoys off-road
    L = len(road)
    road_idx = [int(round((i + 1) * L / (len(LABYRINTH_SIGIL) + 1))) for i in range(len(LABYRINTH_SIGIL))]
    arch_cells = {road[i]: LABYRINTH_SIGIL[n] for n, i in enumerate(road_idx)}

    # Decoy arches in dead ends
    off = [(r, c) for r in range(ROWS) for c in range(COLS) if (r, c) not in road and not (r == ROWS - 1 and c == START_C) and not (r == 0 and c == GOAL_C)]
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

    for (r, c), ch in arch_cells.items():
        acx = mx0 + c * CELL + CELL // 2
        acy = my0 + r * CELL + CELL // 2
        draw_romanesque_stone_arch(canvas, acx, acy, ch, gc=gc, seed=3000 + r * 40 + c)

    # 5. ENTRANCE: THE SOUTHERN MOUTH (CANYON PORTAL)
    mcx = mx0 + START_C * CELL + CELL // 2
    pylon_left_x = mx0 + START_C * CELL
    pylon_right_x = mx0 + (START_C + 1) * CELL

    # Clear threshold opening
    cv2.rectangle(canvas, (pylon_left_x + hw + 1, my1 - hw - 2), (pylon_right_x - hw - 1, my1 + hw + 2), (0, 0, 0, 0), -1)

    # Twin carved sandstone obelisk pylons
    def draw_entrance_pylon(px, py_base, seed_p):
        pw, ph = 22, 38
        # Base plinth
        cv2.rectangle(canvas, (px - 13, py_base - 4), (px + 13, py_base + 6), (0, 0, 0, 0), -1)
        cv2.rectangle(canvas, (px - 13, py_base - 4), (px + 13, py_base + 6), (*gc, 50), -1)
        cv2.rectangle(canvas, (px - 13, py_base - 4), (px + 13, py_base + 6), (*gc, 225), 1, cv2.LINE_AA)
        cv2.line(canvas, (px - 15, py_base + 6), (px + 15, py_base + 6), (*gc, 225), 1, cv2.LINE_AA)
        # Shaft
        cv2.rectangle(canvas, (px - 10, py_base + 6), (px + 10, py_base + ph), (0, 0, 0, 0), -1)
        cv2.rectangle(canvas, (px - 10, py_base + 6), (px + 10, py_base + ph), (*gc, 40), -1)
        cv2.rectangle(canvas, (px - 10, py_base + 6), (px + 10, py_base + ph), (*gc, 220), 1, cv2.LINE_AA)
        for py_c in range(py_base + 12, py_base + ph - 2, 7):
            cv2.line(canvas, (px - 10, py_c), (px + 10, py_c), (*gc, 135), 1, cv2.LINE_AA)
        # Pyramidion cap
        cap_pts = np.array([(px - 11, py_base + ph), (px + 11, py_base + ph), (px, py_base + ph + 12)], dtype=np.int32)
        cv2.fillPoly(canvas, [cap_pts], (0, 0, 0, 0))
        cv2.fillPoly(canvas, [cap_pts], (*gc, 45))
        cv2.polylines(canvas, [cap_pts], True, (*gc, 220), 1, cv2.LINE_AA)
        cv2.circle(canvas, (px, py_base + ph + 13), 2, (*gc, 225), -1)

    draw_entrance_pylon(pylon_left_x, my1, 3950)
    draw_entrance_pylon(pylon_right_x, my1, 3951)

    # Stepped flagstone approach paving leading into the mouth
    for step_i, step_w in enumerate((52, 60, 68)):
        sy = my1 + 6 + step_i * 6
        cv2.line(canvas, (mcx - step_w // 2, sy), (mcx + step_w // 2, sy), (*gc, 185 - step_i * 20), 1, cv2.LINE_AA)
        for sx in range(mcx - step_w // 2 + 8, mcx + step_w // 2, 12):
            cv2.line(canvas, (sx, sy), (sx, sy + 4), (*gc, 125), 1, cv2.LINE_AA)

    # Stylized surveyor chevron arrow pointing boldly into the canyon mouth
    arrow_pts = np.array([(mcx, my1 - 12), (mcx - 11, my1 + 6), (mcx, my1 + 2), (mcx + 11, my1 + 6)], dtype=np.int32)
    cv2.fillPoly(canvas, [arrow_pts], (0, 0, 0, 0))
    cv2.fillPoly(canvas, [arrow_pts], (*gc, 215))
    cv2.polylines(canvas, [arrow_pts], True, (*gc, 235), 1, cv2.LINE_AA)

    # Stepped flagstone approach paving leading into the mouth
    for step_i, step_w in enumerate((48, 56, 64)):
        sy = my1 + 10 + step_i * 6
        cv2.line(canvas, (mcx - step_w // 2, sy), (mcx + step_w // 2, sy), (*gc, 185 - step_i * 20), 1, cv2.LINE_AA)
        for sx in range(mcx - step_w // 2 + 8, mcx + step_w // 2, 12):
            cv2.line(canvas, (sx, sy), (sx, sy + 4), (*gc, 125), 1, cv2.LINE_AA)

    # Entrance banner cleanly spaced
    t_ent, _ = render_pencil_text("« THE SOUTHERN MOUTH · ENTRANCE »", FONT_PATH, font_size=28, gc=gc, seed=3911)
    if t_ent is not None:
        blit_rgba(canvas, t_ent, int(mcx - t_ent.shape[1] / 2), my1 + 42)
    t_sub, _ = render_pencil_text("Enter here — follow the true bedrock road north", FONT_PATH, font_size=21, gc=gc, seed=3912)
    if t_sub is not None:
        blit_rgba(canvas, t_sub, int(mcx - t_sub.shape[1] / 2), my1 + 68)

    # 6. EXIT / GOAL: CAIRN III & THE THIRD SEAL
    gcx = mx0 + GOAL_C * CELL + CELL // 2

    # Clear top opening into terrace
    cv2.rectangle(canvas, (gcx - CELL // 2 + hw + 1, my0 - hw - 2), (gcx + CELL // 2 - hw - 1, my0 + hw + 2), (0, 0, 0, 0), -1)

    # Semicircular stone sanctuary terrace rising above row 0
    t_rad = 60
    _clear_polygon(canvas, [(gcx - t_rad - 10, my0 + 2), (gcx + t_rad + 10, my0 + 2), (gcx + t_rad + 10, my0 - t_rad - 12), (gcx - t_rad - 10, my0 - t_rad - 12)])

    # Curved terrace balustrade
    _draw_arc(canvas, (gcx, my0), t_rad, 180, 360, gc=gc, alpha=225, seed=3890, passes=2)
    _draw_arc(canvas, (gcx, my0), t_rad + 6, 180, 360, gc=gc, alpha=155, seed=3891, passes=1)
    for a in range(190, 360, 18):
        rad = math.radians(a)
        p1 = (int(gcx + t_rad * math.cos(rad)), int(my0 + t_rad * math.sin(rad)))
        p2 = (int(gcx + (t_rad + 6) * math.cos(rad)), int(my0 + (t_rad + 6) * math.sin(rad)))
        cv2.line(canvas, p1, p2, (*gc, 155), 1, cv2.LINE_AA)

    # Terrace floor paving
    for r_t in range(14, t_rad - 4, 12):
        _draw_arc(canvas, (gcx, my0), r_t, 185, 355, gc=gc, alpha=90, seed=3895 + r_t, passes=1)

    # Cairn III elevation (pyramid of dry stones with copper plate)
    cairn_h = 66
    _draw_cairn_elevation(canvas, 2, gcx, my0 - 2, cairn_h, gc, 3900)

    # Radiating geodetic bearing rays from Cairn III
    # Ray to Sun Monolith (348 deg NNW)
    rad_sm = math.radians(348 - 90)
    for step_r in range(24, 60, 8):
        p_a = (int(gcx + step_r * math.cos(rad_sm)), int(my0 - 24 + step_r * math.sin(rad_sm)))
        p_b = (int(gcx + (step_r + 4) * math.cos(rad_sm)), int(my0 - 24 + (step_r + 4) * math.sin(rad_sm)))
        cv2.line(canvas, p_a, p_b, (*gc, 160), 1, cv2.LINE_AA)
    t_sm, _ = render_pencil_text("348° to Sun Monolith", FONT_PATH, font_size=16, gc=gc, seed=3920)
    if t_sm is not None:
        blit_rgba(canvas, t_sm, gcx - t_rad - t_sm.shape[1] - 8, my0 - 45)

    # Ray to Watchtower VI (112 deg ESE)
    rad_wt = math.radians(112 - 90)
    for step_r in range(24, 75, 8):
        p_a = (int(gcx + step_r * math.cos(rad_wt)), int(my0 - 24 + step_r * math.sin(rad_wt)))
        p_b = (int(gcx + (step_r + 4) * math.cos(rad_wt)), int(my0 - 24 + (step_r + 4) * math.sin(rad_wt)))
        cv2.line(canvas, p_a, p_b, (*gc, 160), 1, cv2.LINE_AA)
    t_wt, _ = render_pencil_text("112° to Watchtower VI", FONT_PATH, font_size=16, gc=gc, seed=3921)
    if t_wt is not None:
        blit_rgba(canvas, t_wt, gcx + t_rad + 12, my0 - 15)

    # Goal Banner cleanly positioned in top margin
    t_goal, _ = render_pencil_text("« CAIRN III · THE THIRD SEAL (GOAL) »", FONT_PATH, font_size=28, gc=gc, seed=3910)
    if t_goal is not None:
        blit_rgba(canvas, t_goal, int(gcx - t_goal.shape[1] / 2), y0_plate + 14)
    t_gdesc, _ = render_pencil_text("Summit sanctuary & copper benchmark plate", FONT_PATH, font_size=20, gc=gc, seed=3913)
    if t_gdesc is not None:
        blit_rgba(canvas, t_gdesc, int(gcx - t_gdesc.shape[1] / 2), y0_plate + 40)

    y = y0_plate + plate_h + 46

    # 7. Section II: The Tablet at the Mouth
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

    # 8. Answer Bar
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

    # Enforce punch clearance Cara B (X > 1583 = 0)
    canvas[:, 1583:, 3] = 0
    return canvas

# Render and save
canvas = render_desert_odyssey_14b_complete()
p_dir = os.path.join(JOURNAL_DIR, 'page14')
canvases_dir = os.path.join(p_dir, 'canvases')
pdf_dir = os.path.join(p_dir, 'pdf')
mockups_dir = os.path.join(p_dir, 'mockups')

os.makedirs(canvases_dir, exist_ok=True)
os.makedirs(pdf_dir, exist_ok=True)
os.makedirs(mockups_dir, exist_ok=True)

stem = 'page14_back'
canvas_path = os.path.join(canvases_dir, f'{stem}_canvas_A5_300dpi.png')
cv2.imwrite(canvas_path, canvas)
print(f'Canvas saved: {canvas_path}')

pdf_path = os.path.join(pdf_dir, f'{stem}_A5.pdf')
PDFBuilder.save_a5_pdf_from_rgba(canvas, pdf_path, dpi=300)
print(f'PDF saved: {pdf_path}')

# Real paper mockup
bg_raw = cv2.imread('journal/page01/real_paper_300dpi.png')
bg_for_face = cv2.flip(bg_raw, 1) # is_back = True
fg_rgb = canvas[:, :, :3].astype(np.float32)
alpha = (canvas[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]
blended = (fg_rgb * alpha + bg_for_face.astype(np.float32) * (1.0 - alpha)).astype(np.uint8)
mockup_path = os.path.join(mockups_dir, f'{stem}_real_paper_mockup.jpg')
cv2.imwrite(mockup_path, blended, [cv2.IMWRITE_JPEG_QUALITY, 96])
print(f'Mockup saved: {mockup_path}')
