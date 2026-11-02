#!/usr/bin/env python3
"""
Detailed Renaissance Drawing Suites for the Stage Path (Hojas 21 to 26).
Implements intricate Da Vinci / Kepler / Serlio / Sabbatini style illustrations:
- 21A: Alpine Observatory & Edelweiss Botanical
- 21B: Music Barrel Assembly & Clockwork Escapement
- 22A: Fly Tower Rigging & Counterweight Balances
- 22B: Bronze Tripod Brazier & Ancient Papyrus
- 23A: Shadow Theatre Apparatus & Articulated Puppets
- 23B: Astrometric Calculating Disc of 1970
- 24A: Hall of Mirrors Architectural Maze Plan
- 24B: Baroque Convex Mirror & Caustic Rays
- 25A: Kaleidoscope Lantern Prisms & Optical Ray Engine
- 25B: High Balustrade Terrace & Alpine Night Panorama
- 26A: Completed Mirror with Wiener Staatsoper Facade
- 26B: Carriage Gateway, Carrier Dove & Alpine Ascent
"""

import math
import os
import cv2
import numpy as np

from scripts.journal.build_desert_games import GRAPHITE_COLOR, render_pencil_text, blit_rgba, FONT_PATH
from scripts.journal.build_desert_odyssey_expanded import _hatch_polygon
from scripts.journal import stage_mirror

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def _pline(canvas, pts, gc=GRAPHITE_COLOR, alpha=190, seed=1, passes=2, closed=False, thick=1, wob=0.7):
    """Hand-drawn polyline with organic graphite wobble."""
    if len(pts) < 2:
        return
    rng = np.random.default_rng(seed)
    base = np.array(pts, dtype=np.float32)
    for p in range(passes):
        q = base + rng.normal(0, wob + 0.22 * p, base.shape)
        a = int(alpha * rng.uniform(0.82, 1.0))
        cv2.polylines(canvas, [np.round(q).astype(np.int32)], closed, (*gc, a), thick, cv2.LINE_AA)


def _dashed_line(canvas, pt1, pt2, dash_len=14, gap_len=8, gc=GRAPHITE_COLOR, alpha=180, seed=1, thick=1):
    """Draws a dashed polyline between two points with graphite texture."""
    x1, y1 = pt1
    x2, y2 = pt2
    dist = math.hypot(x2 - x1, y2 - y1)
    if dist < 1:
        return
    dx = (x2 - x1) / dist
    dy = (y2 - y1) / dist
    curr = 0.0
    idx = 0
    while curr < dist:
        end = min(curr + dash_len, dist)
        pA = (int(x1 + dx * curr), int(y1 + dy * curr))
        pB = (int(x1 + dx * end), int(y1 + dy * end))
        _pline(canvas, [pA, pB], gc, alpha=alpha, seed=seed + idx, passes=1, thick=thick)
        curr += dash_len + gap_len
        idx += 1



# -------------------------------------------------------------------------
# HOJA 19B: THE GATE OF A THOUSAND MASKS · OPEN ARCHWAY (SERLIO / DA VINCI)
# -------------------------------------------------------------------------

def draw_theatrical_archway_open(canvas, cx, y_top=1615, w=1040, h=550, gc=GRAPHITE_COLOR, seed=19700):
    """Monumental open theatrical portal (Serlio & Sabbatini stage machinery):
    Classical Renaissance entablature with dentil course and architrave frieze,
    rusticated ashlar masonry piers (bugnato a cuscino) with Tuscan impost capitals,
    semicircular double-moulded archivolt with radiating voussoirs and carved acanthus keystone,
    open heavy oak timber double doors with forged iron spear-tipped strap hinges swung in perspective,
    counterweight rigging with overhead boxwood pulleys, and a deep raked baroque stage perspective
    featuring tied-back velvet curtains, receding scenic wings, footlights trough with glowing candle flames,
    and a suspended chandelier in the deep theatre gloom."""
    rng = np.random.default_rng(seed)

    x_left = cx - w // 2
    x_right = cx + w // 2
    y_ground = y_top + h - 20

    # Arch opening geometry
    arch_cx = cx
    arch_r = int(w * 0.24)                 # ~ 250 px radius
    arch_spring_y = y_top + 48 + arch_r + 48 # ~ 1961 px
    arch_top_y = arch_spring_y - arch_r    # ~ 1711 px
    vp_y = arch_spring_y - 20              # central vanishing point

    # -------------------------------------------------------------
    # 1. THEATRE INTERIOR PERSPECTIVE (drawn first, in the background)
    # -------------------------------------------------------------
    # Stage floorboards (raked perspective)
    floor_w_front = int(arch_r * 0.94)
    floor_w_back = int(arch_r * 0.38)
    floor_y_back = vp_y + 35
    floor_poly = [
        (arch_cx - floor_w_front, y_ground),
        (arch_cx + floor_w_front, y_ground),
        (arch_cx + floor_w_back, floor_y_back),
        (arch_cx - floor_w_back, floor_y_back),
    ]
    _hatch_polygon(canvas, floor_poly, step=7, angle=90, gc=gc, alpha=32, seed=seed + 1)
    n_boards = 14
    for b_idx in range(-n_boards // 2, n_boards // 2 + 1):
        t_front = b_idx / (n_boards / 2.0)
        bx = arch_cx + int(floor_w_front * t_front)
        tx = arch_cx + int(floor_w_back * t_front * 0.9)
        _pline(canvas, [(bx, y_ground), (tx, floor_y_back)], gc, alpha=135, seed=seed + 10 + b_idx, wob=0.25)

    # Deep theatre background wall & gloom (sfumato cross-hatching)
    bg_wall = [
        (arch_cx - floor_w_back, floor_y_back),
        (arch_cx + floor_w_back, floor_y_back),
        (arch_cx + floor_w_back, arch_top_y + 40),
        (arch_cx - floor_w_back, arch_top_y + 40),
    ]
    _hatch_polygon(canvas, bg_wall, step=4, angle=-45, gc=gc, alpha=75, seed=seed + 2)
    _hatch_polygon(canvas, bg_wall, step=5, angle=45, gc=gc, alpha=60, seed=seed + 3)

    # Suspended Baroque Chandelier / Corona in the background
    chand_x, chand_y = cx, arch_top_y + 75
    for ch_y in range(arch_top_y + 25, chand_y - 12, 6):
        cv2.ellipse(canvas, (chand_x, ch_y), (2, 4), 0, 0, 360, (*gc, 180), 1, cv2.LINE_AA)
    cv2.ellipse(canvas, (chand_x, chand_y), (36, 12), 0, 0, 360, (*gc, 210), 2, cv2.LINE_AA)
    cv2.ellipse(canvas, (chand_x, chand_y + 2), (24, 8), 0, 0, 360, (*gc, 160), 1, cv2.LINE_AA)
    for c_ang in (-28, -14, 0, 14, 28):
        c_x = chand_x + c_ang
        c_y = chand_y + int(math.sin(c_ang / 28.0 * math.pi / 2.0) * 8)
        _pline(canvas, [(c_x, c_y), (c_x, c_y - 8)], gc, alpha=200, seed=seed + 20 + c_ang)
        _pline(canvas, [(c_x, c_y - 8), (c_x, c_y - 14)], gc, alpha=235, seed=seed + 25 + c_ang)
        cv2.circle(canvas, (c_x, c_y - 11), 5, (*gc, 40), -1, cv2.LINE_AA)

    # Receding Scenic Wings (quinte teatrali) with classical pilasters
    for w_idx, w_pos in enumerate((0.84, 0.64, 0.48)):
        w_alpha = 180 - w_idx * 35
        for sgn in (-1, +1):
            wx0 = arch_cx + sgn * int(arch_r * w_pos)
            wx1 = arch_cx + sgn * int(arch_r * (w_pos - 0.08))
            wy_base = y_ground - w_idx * 28
            rad_arg = max(0, arch_r**2 - int(arch_r * (w_pos - 0.04))**2)
            wy_head = arch_spring_y - int(math.sqrt(rad_arg)) + 20
            wing_box = [(wx0, wy_base), (wx1, wy_base), (wx1, wy_head), (wx0, wy_head)]
            _pline(canvas, wing_box, gc, alpha=w_alpha, seed=seed + 30 + w_idx * 2 + sgn, closed=True)
            _hatch_polygon(canvas, wing_box, step=4, angle=65 if sgn > 0 else 115, gc=gc, alpha=55, seed=seed + 35)
            mid_x = (wx0 + wx1) // 2
            _pline(canvas, [(mid_x, wy_base), (mid_x, wy_head)], gc, alpha=w_alpha - 20, seed=seed + 38)

    # Proscenium Valance & Swagged Velvet Drapery
    valance_pts = []
    for k in range(33):
        th = math.pi * k / 32.0
        vx = arch_cx - int((arch_r - 28) * math.cos(th))
        vy = arch_spring_y - int((arch_r - 28) * math.sin(th)) + int(14 * math.sin(k * math.pi / 4.0))
        valance_pts.append((vx, vy))
    _pline(canvas, valance_pts, gc, alpha=195, seed=seed + 45, thick=2)
    for vx, vy in valance_pts[2:-2:2]:
        _pline(canvas, [(vx, vy), (vx, vy + 9)], gc, alpha=150, seed=seed + 48 + vx)

    # Tied-back drapery swags on sides
    for sgn in (-1, +1):
        swag_top = (arch_cx + sgn * int(arch_r * 0.92), arch_spring_y - int(arch_r * 0.35))
        tie_pt = (arch_cx + sgn * int(arch_r * 0.88), arch_spring_y + 40)
        swag_bot = (arch_cx + sgn * int(arch_r * 0.72), y_ground - 25)
        swag_outer = [swag_top, (tie_pt[0] - sgn * 12, tie_pt[1]), swag_bot,
                      (swag_bot[0] + sgn * 24, swag_bot[1]), (tie_pt[0] + sgn * 16, tie_pt[1]),
                      (swag_top[0] + sgn * 8, swag_top[1])]
        _pline(canvas, swag_outer, gc, alpha=210, seed=seed + 50 + sgn, closed=True)
        _hatch_polygon(canvas, swag_outer, step=4, angle=45 if sgn > 0 else -45, gc=gc, alpha=70, seed=seed + 52)
        _pline(canvas, [(tie_pt[0] - sgn * 18, tie_pt[1]), (tie_pt[0] + sgn * 22, tie_pt[1])], gc, alpha=230, seed=seed + 54, thick=2)
        tassel_y = tie_pt[1] + 32
        _pline(canvas, [(tie_pt[0], tie_pt[1]), (tie_pt[0], tassel_y - 10)], gc, alpha=210, seed=seed + 55)
        cv2.circle(canvas, (tie_pt[0], tassel_y - 8), 4, (*gc, 220), -1, cv2.LINE_AA)
        _pline(canvas, [(tie_pt[0], tassel_y - 4), (tie_pt[0] - 6, tassel_y + 12), (tie_pt[0] + 6, tassel_y + 12)], gc, alpha=220, seed=seed + 56, closed=True)

    # Footlights Trough (candilejas de la ribalta) at stage front
    trough_y = y_ground - 10
    _pline(canvas, [(arch_cx - int(arch_r * 0.86), trough_y), (arch_cx + int(arch_r * 0.86), trough_y)], gc, alpha=230, seed=seed + 60, thick=2)
    _pline(canvas, [(arch_cx - int(arch_r * 0.86), trough_y + 5), (arch_cx + int(arch_r * 0.86), trough_y + 5)], gc, alpha=180, seed=seed + 61)
    for fl_x in range(arch_cx - int(arch_r * 0.72), arch_cx + int(arch_r * 0.75), 44):
        dish = [(fl_x - 7, trough_y), (fl_x + 7, trough_y), (fl_x + 5, trough_y - 7), (fl_x - 5, trough_y - 7)]
        _pline(canvas, dish, gc, alpha=215, seed=seed + 65 + fl_x, closed=True, thick=1)
        flame = [(fl_x, trough_y - 18), (fl_x + 3, trough_y - 11), (fl_x, trough_y - 7), (fl_x - 3, trough_y - 11)]
        _pline(canvas, flame, gc, alpha=235, seed=seed + 66 + fl_x, closed=True)
        cv2.circle(canvas, (fl_x, trough_y - 12), 8, (*gc, 45), -1, cv2.LINE_AA)

    # -------------------------------------------------------------
    # 2. OPEN OAK TIMBER PORTALS (swung open into perspective)
    # -------------------------------------------------------------
    for sgn in (-1, +1):
        hinge_side_x = arch_cx + sgn * (arch_r - 6)
        swing_side_x = arch_cx + sgn * int(arch_r * 0.54)
        door_top_hinge = arch_spring_y - 10
        door_top_swing = arch_spring_y + 16
        door_bot_hinge = y_ground - 2
        door_bot_swing = y_ground - 18

        door_poly = [
            (hinge_side_x, door_top_hinge),
            (swing_side_x, door_top_swing),
            (swing_side_x, door_bot_swing),
            (hinge_side_x, door_bot_hinge),
        ]
        thick_dx = sgn * 12
        door_edge = [
            (swing_side_x, door_top_swing),
            (swing_side_x + thick_dx, door_top_swing + 4),
            (swing_side_x + thick_dx, door_bot_swing + 4),
            (swing_side_x, door_bot_swing),
        ]
        _pline(canvas, door_edge, gc, alpha=240, seed=seed + 70 + sgn, closed=True, thick=2)
        _hatch_polygon(canvas, door_edge, step=3, angle=90, gc=gc, alpha=90, seed=seed + 71)

        _pline(canvas, door_poly, gc, alpha=245, seed=seed + 72 + sgn, closed=True, thick=2)
        _hatch_polygon(canvas, door_poly, step=5, angle=25 if sgn > 0 else -25, gc=gc, alpha=70, seed=seed + 73)

        for pl_k in range(1, 4):
            t_pl = pl_k / 4.0
            px_t = int(hinge_side_x + (swing_side_x - hinge_side_x) * t_pl)
            py_t = int(door_top_hinge + (door_top_swing - door_top_hinge) * t_pl)
            px_b = px_t
            py_b = int(door_bot_hinge + (door_bot_swing - door_bot_hinge) * t_pl)
            _pline(canvas, [(px_t, py_t), (px_b, py_b)], gc, alpha=175, seed=seed + 75 + pl_k * sgn)

        _pline(canvas, [(hinge_side_x, door_bot_hinge - 25), (swing_side_x, door_top_swing + 25)], gc, alpha=200, seed=seed + 80 + sgn, thick=2)

        for hy_rel in (0.2, 0.55, 0.85):
            hy_h = int(door_top_hinge + (door_bot_hinge - door_top_hinge) * hy_rel)
            hy_s = int(door_top_swing + (door_bot_swing - door_top_swing) * hy_rel)
            hx_end = int(hinge_side_x + (swing_side_x - hinge_side_x) * 0.72)
            hy_end = int(hy_h + (hy_s - hy_h) * 0.72)
            _pline(canvas, [(hinge_side_x - sgn * 12, hy_h), (hx_end, hy_end)], gc, alpha=240, seed=seed + 85 + int(hy_rel * 10), thick=3)
            _pline(canvas, [(hx_end, hy_end - 5), (hx_end + sgn * 10, hy_end), (hx_end, hy_end + 5)], gc, alpha=240, seed=seed + 88, closed=True)
            for r_pos in (0.2, 0.45):
                rx = int(hinge_side_x + (hx_end - hinge_side_x) * r_pos)
                ry = int(hy_h + (hy_end - hy_h) * r_pos)
                cv2.circle(canvas, (rx, ry), 3, (*gc, 235), -1, cv2.LINE_AA)

    # -------------------------------------------------------------
    # 3. CLASSICAL RENAISSANCE ENTABLATURE & STONEWORK (Foreground)
    # -------------------------------------------------------------
    c_y0 = y_top + 8
    c_y1 = y_top + 24
    cornice_poly = [
        (x_left + 10, c_y0), (x_right - 10, c_y0),
        (x_right - 22, c_y1), (x_left + 22, c_y1)
    ]
    _pline(canvas, cornice_poly, gc, alpha=240, seed=seed + 90, closed=True, thick=2)
    _hatch_polygon(canvas, cornice_poly, step=5, angle=0, gc=gc, alpha=45, seed=seed + 91)

    d_y0, d_y1 = y_top + 24, y_top + 38
    _pline(canvas, [(x_left + 22, d_y1), (x_right - 22, d_y1)], gc, alpha=230, seed=seed + 92, thick=1)
    for dx in range(x_left + 32, x_right - 35, 22):
        dentil = [(dx, d_y0), (dx + 11, d_y0), (dx + 11, d_y1), (dx, d_y1)]
        _pline(canvas, dentil, gc, alpha=215, seed=seed + 93 + dx, closed=True)
        _hatch_polygon(canvas, dentil, step=3, angle=90, gc=gc, alpha=65, seed=seed + 94 + dx)

    f_y0, f_y1 = y_top + 38, y_top + 62
    frieze_poly = [(x_left + 25, f_y0), (x_right - 25, f_y0), (x_right - 25, f_y1), (x_left + 25, f_y1)]
    _pline(canvas, frieze_poly, gc, alpha=245, seed=seed + 95, closed=True, thick=2)
    _hatch_polygon(canvas, frieze_poly, step=6, angle=45, gc=gc, alpha=38, seed=seed + 96)
    _pline(canvas, [(x_left + 25, f_y1 + 4), (x_right - 25, f_y1 + 4)], gc, alpha=200, seed=seed + 97)

    # Rusticated Ashlar Stone Piers (Bugnato a cuscino)
    n_courses = 8
    pier_top_y = f_y1 + 4
    course_h = (y_ground - pier_top_y) / float(n_courses)
    for sgn, px_outer, px_inner in ((-1, x_left + 35, arch_cx - arch_r), (+1, x_right - 35, arch_cx + arch_r)):
        p0, p1 = (min(px_outer, px_inner), max(px_outer, px_inner))
        for c_idx in range(n_courses):
            cy0 = pier_top_y + c_idx * course_h
            cy1 = cy0 + course_h
            _pline(canvas, [(p0, int(cy1)), (p1, int(cy1))], gc, alpha=225, seed=seed + 100 + c_idx * sgn, thick=2)
            n_blocks = 2 if c_idx % 2 == 0 else 3
            bw = (p1 - p0) / float(n_blocks)
            for b_k in range(1, n_blocks):
                jx = int(p0 + b_k * bw)
                _pline(canvas, [(jx, int(cy0)), (jx, int(cy1))], gc, alpha=210, seed=seed + 110 + c_idx * 5 + b_k)
            for b_k in range(n_blocks):
                bx0 = int(p0 + b_k * bw + 5)
                bx1 = int(p0 + (b_k + 1) * bw - 5)
                block_cushion = [(bx0, int(cy0 + 4)), (bx1, int(cy0 + 4)), (bx1, int(cy1 - 4)), (bx0, int(cy1 - 4))]
                _hatch_polygon(canvas, block_cushion, step=6, angle=20 if sgn < 0 else -20, gc=gc, alpha=40, seed=seed + 120 + c_idx * 6 + b_k)
                if (c_idx + b_k) % 3 == 0:
                    mid_bx = (bx0 + bx1) // 2
                    mid_by = int((cy0 + cy1) // 2)
                    _pline(canvas, [(mid_bx - 6, mid_by - 3), (mid_bx, mid_by), (mid_bx + 8, mid_by - 2)], gc, alpha=150, seed=seed + 130 + c_idx)

    # Impost Capitals at arch springing line
    for sgn, ix_inner in ((-1, arch_cx - arch_r), (+1, arch_cx + arch_r)):
        ix_outer = ix_inner - sgn * 50
        ix0, ix1 = min(ix_inner, ix_outer), max(ix_inner, ix_outer)
        impost = [
            (ix0 - 6, arch_spring_y - 14), (ix1 + 6, arch_spring_y - 14),
            (ix1 + 2, arch_spring_y + 14), (ix0 - 2, arch_spring_y + 14)
        ]
        _pline(canvas, impost, gc, alpha=245, seed=seed + 140 + sgn, closed=True, thick=2)
        _hatch_polygon(canvas, impost, step=4, angle=0, gc=gc, alpha=70, seed=seed + 141)

    # Semicircular Archivolt with radiating voussoirs (double molded)
    r_in = arch_r
    r_mid = arch_r + 34
    r_out = arch_r + 62
    n_vous = 15
    for k in range(n_vous + 1):
        th = math.pi * k / float(n_vous)
        cos_t, sin_t = math.cos(th), math.sin(th)
        p_in = (int(arch_cx - r_in * cos_t), int(arch_spring_y - r_in * sin_t))
        p_mid = (int(arch_cx - r_mid * cos_t), int(arch_spring_y - r_mid * sin_t))
        p_out = (int(arch_cx - r_out * cos_t), int(arch_spring_y - r_out * sin_t))
        _pline(canvas, [p_in, p_out], gc, alpha=215, seed=seed + 150 + k, thick=1)
        if k < n_vous:
            th_m = math.pi * (k + 0.5) / float(n_vous)
            v_poly = [
                (int(arch_cx - r_in * math.cos(th)), int(arch_spring_y - r_in * math.sin(th))),
                (int(arch_cx - r_in * math.cos(th + math.pi / n_vous)), int(arch_spring_y - r_in * math.sin(th + math.pi / n_vous))),
                (int(arch_cx - r_out * math.cos(th + math.pi / n_vous)), int(arch_spring_y - r_out * math.sin(th + math.pi / n_vous))),
                (int(arch_cx - r_out * math.cos(th)), int(arch_spring_y - r_out * math.sin(th))),
            ]
            _hatch_polygon(canvas, v_poly, step=5, angle=int(math.degrees(th_m)), gc=gc, alpha=42, seed=seed + 155 + k)

    for r_c, thk, alp in ((r_in, 2, 245), (r_mid, 1, 200), (r_out, 2, 240)):
        arc_pts = [(int(arch_cx - r_c * math.cos(math.pi * i / 40.0)), int(arch_spring_y - r_c * math.sin(math.pi * i / 40.0))) for i in range(41)]
        _pline(canvas, arc_pts, gc, alpha=alp, seed=seed + 160 + int(r_c), thick=thk)

    # Carved Renaissance Keystone (Mensola a voluta d'acanto)
    k_w_bot = 32
    k_w_top = 48
    ks_bot_y = arch_spring_y - r_in + 4
    ks_top_y = f_y1
    keystone = [
        (arch_cx - k_w_bot // 2, ks_bot_y),
        (arch_cx + k_w_bot // 2, ks_bot_y),
        (arch_cx + k_w_top // 2, ks_top_y),
        (arch_cx - k_w_top // 2, ks_top_y),
    ]
    _pline(canvas, keystone, gc, alpha=245, seed=seed + 170, closed=True, thick=2)
    _hatch_polygon(canvas, keystone, step=4, angle=45, gc=gc, alpha=70, seed=seed + 171)
    ks_mid_y = (ks_bot_y + ks_top_y) // 2
    _pline(canvas, [(arch_cx, ks_bot_y - 4), (arch_cx - 8, ks_mid_y), (arch_cx, ks_mid_y - 6), (arch_cx + 8, ks_mid_y), (arch_cx, ks_bot_y - 4)], gc, alpha=220, seed=seed + 175, closed=True)
    for s_sgn in (-1, +1):
        v_pts = [(arch_cx + s_sgn * (6 + 3 * t), ks_top_y + 8 + int(8 * math.sin(t * math.pi / 2.0))) for t in range(5)]
        _pline(canvas, v_pts, gc, alpha=210, seed=seed + 176 + s_sgn)

    # -------------------------------------------------------------
    # 4. COUNTERWEIGHT STAGE MACHINERY (Sabbatini Carrucole e Pesi)
    # -------------------------------------------------------------
    for p_idx, px in enumerate((arch_cx - arch_r - 28, arch_cx + arch_r + 28)):
        p_sgn = -1 if p_idx == 0 else +1
        py = arch_spring_y - 35
        corbel = [(px - 16, py - 20), (px + 16, py - 20), (px + 12, py + 15), (px - 12, py + 15)]
        _pline(canvas, corbel, gc, alpha=225, seed=seed + 180 + p_idx, closed=True)
        cv2.circle(canvas, (px, py), 22, (*gc, 230), 2, cv2.LINE_AA)
        cv2.circle(canvas, (px, py), 8, (*gc, 210), 1, cv2.LINE_AA)
        cv2.circle(canvas, (px, py), 3, (*gc, 240), -1, cv2.LINE_AA)
        for sp in (0, 45, 90, 135):
            rad_s = math.radians(sp)
            _pline(canvas, [(int(px - 20 * math.cos(rad_s)), int(py - 20 * math.sin(rad_s))),
                            (int(px + 20 * math.cos(rad_s)), int(py + 20 * math.sin(rad_s)))], gc, alpha=170, seed=seed + 185 + sp)
        door_x = arch_cx + p_sgn * int(arch_r * 0.54)
        _pline(canvas, [(px - p_sgn * 22, py), (door_x, arch_spring_y + 16)], gc, alpha=215, seed=seed + 190 + p_idx, thick=2)
        cw_x = px + p_sgn * 22
        cw_top_y = py + 35
        _pline(canvas, [(cw_x, py), (cw_x, cw_top_y)], gc, alpha=220, seed=seed + 195 + p_idx, thick=2)
        cv2.circle(canvas, (cw_x, cw_top_y + 6), 6, (*gc, 230), 1, cv2.LINE_AA)
        weight_poly = [(cw_x - 14, cw_top_y + 12), (cw_x + 14, cw_top_y + 12), (cw_x + 14, cw_top_y + 70), (cw_x - 14, cw_top_y + 70)]
        _pline(canvas, weight_poly, gc, alpha=235, seed=seed + 200 + p_idx, closed=True, thick=2)
        _hatch_polygon(canvas, weight_poly, step=4, angle=65, gc=gc, alpha=75, seed=seed + 201 + p_idx)
        _pline(canvas, [(cw_x - 14, cw_top_y + 30), (cw_x + 14, cw_top_y + 30)], gc, alpha=210, seed=seed + 202)
        _pline(canvas, [(cw_x - 14, cw_top_y + 50), (cw_x + 14, cw_top_y + 50)], gc, alpha=210, seed=seed + 203)

    # -------------------------------------------------------------
    # 5. THRESHOLD GROUND & COBBLESTONES
    # -------------------------------------------------------------
    _pline(canvas, [(x_left + 15, y_ground), (x_right - 15, y_ground)], gc, alpha=245, seed=seed + 210, thick=2)
    _pline(canvas, [(x_left + 20, y_ground + 4), (x_right - 20, y_ground + 4)], gc, alpha=180, seed=seed + 211)
    for c_idx in range(16):
        cb_x = x_left + 40 + c_idx * 58 + rng.integers(-4, 4)
        cobble = [(cb_x, y_ground + 4), (cb_x + 36, y_ground + 4), (cb_x + 32, y_ground + 15), (cb_x - 4, y_ground + 15)]
        _pline(canvas, cobble, gc, alpha=165, seed=seed + 220 + c_idx, closed=True)
        _hatch_polygon(canvas, cobble, step=3, angle=45, gc=gc, alpha=35, seed=seed + 221 + c_idx)



# -------------------------------------------------------------------------
# HOJA 21A: THE ALPINE OBSERVATORY & EDELWEISS BOTANICAL
# -------------------------------------------------------------------------

def draw_alpine_observatory(canvas, cx, cy, w, h, gc=GRAPHITE_COLOR, seed=21100):
    """The Alpine Observatory perched on rugged mountain crags (Da Vinci style)."""
    # 1. Distant crags and ridges
    left_crag = [
        (cx - w // 2, cy + h // 2),
        (cx - w * 0.38, cy + h * 0.1),
        (cx - w * 0.25, cy - h * 0.05),
        (cx - w * 0.15, cy - h * 0.22),
        (cx - w * 0.05, cy - h * 0.15),
        (cx + w * 0.05, cy - h * 0.35),
        (cx + w * 0.2, cy - h * 0.1),
        (cx + w * 0.35, cy - h * 0.25),
        (cx + w // 2, cy + h * 0.2),
        (cx + w // 2, cy + h // 2),
    ]
    _pline(canvas, left_crag, gc, alpha=170, seed=seed, thick=2)
    _hatch_polygon(canvas, left_crag, step=8, angle=55, gc=gc, alpha=35, seed=seed + 2)

    # 2. Main Stone Tower of Observatory
    tx, ty = cx - 40, cy - 20
    tw, th = 170, 240
    tower_box = [
        (tx - tw // 2, ty + th // 2),
        (tx - tw // 2 + 10, ty - th // 2 + 40),
        (tx + tw // 2 - 10, ty - th // 2 + 40),
        (tx + tw // 2, ty + th // 2),
    ]
    _pline(canvas, tower_box, gc, alpha=220, seed=seed + 10, closed=True, thick=2)
    _hatch_polygon(canvas, tower_box, step=6, angle=75, gc=gc, alpha=45, seed=seed + 11)

    # Masonry courses
    for i in range(1, 8):
        my = ty + th // 2 - i * (th // 8)
        _pline(canvas, [(tx - tw // 2 + 6, my), (tx + tw // 2 - 6, my)], gc, alpha=130, seed=seed + 20 + i)

    # Dome top (hemisphere with shutter slit)
    dx, dy = tx, ty - th // 2 + 40
    dr = 78
    dome_pts = [(dx + dr * math.cos(math.pi + math.pi * i / 32), dy + dr * math.sin(math.pi + math.pi * i / 32)) for i in range(33)]
    _pline(canvas, dome_pts, gc, alpha=230, seed=seed + 30, closed=True, thick=2)
    _hatch_polygon(canvas, dome_pts, step=5, angle=-45, gc=gc, alpha=50, seed=seed + 31)

    # Telescope viewing slit
    slit = [(dx - 12, dy), (dx - 10, dy - dr + 10), (dx + 10, dy - dr + 10), (dx + 12, dy)]
    _pline(canvas, slit, gc, alpha=240, seed=seed + 35, closed=True, thick=2)
    _hatch_polygon(canvas, slit, step=3, angle=0, gc=gc, alpha=180, seed=seed + 36)

    # Arched windows in tower
    for wx_off in (-35, 35):
        wx, wy = tx + wx_off, ty + 20
        win = [(wx - 14, wy + 25), (wx - 14, wy), (wx, wy - 14), (wx + 14, wy), (wx + 14, wy + 25)]
        _pline(canvas, win, gc, alpha=210, seed=seed + 40 + int(wx_off), closed=True, thick=2)
        _hatch_polygon(canvas, win, step=3, angle=45, gc=gc, alpha=120, seed=seed + 42 + int(wx_off))

    # Buttress wing on crag
    buttress = [(tx + tw // 2, ty + 40), (tx + tw // 2 + 70, ty + th // 2 + 20), (tx + tw // 2, ty + th // 2)]
    _pline(canvas, buttress, gc, alpha=200, seed=seed + 50, closed=True, thick=2)
    _hatch_polygon(canvas, buttress, step=6, angle=35, gc=gc, alpha=40, seed=seed + 51)

    # Swirling mist lines
    for m in range(5):
        my = cy + h // 2 - 40 + m * 18
        mist = [(cx - w // 2 + 40 + i * 40, my + 8 * math.sin(i * 0.7 + m)) for i in range(26)]
        _pline(canvas, mist, gc, alpha=65, seed=seed + 60 + m, passes=1, wob=0.4)


def draw_edelweiss_botanical(canvas, cx, cy, size=180, gc=GRAPHITE_COLOR, seed=21200):
    """Detailed Renaissance botanical dissection of an Edelweiss flower."""
    # Stem
    stem = [(cx + 10 * math.sin(i * 0.3), cy + size * 0.8 - i * (size * 0.8 / 16)) for i in range(17)]
    _pline(canvas, stem, gc, alpha=210, seed=seed, thick=2)

    # Stem leaves
    for sgn in (-1, 1):
        for k in (0.3, 0.6):
            ly = cy + size * 0.8 - k * (size * 0.8)
            lx = cx + sgn * 6
            leaf = [(lx, ly), (lx + sgn * 32, ly - 18), (lx + sgn * 52, ly - 36), (lx + sgn * 24, ly - 10), (lx, ly)]
            _pline(canvas, leaf, gc, alpha=180, seed=seed + int(k * 100) + sgn, closed=True)
            _hatch_polygon(canvas, leaf, step=4, angle=sgn * 30, gc=gc, alpha=45, seed=seed + 10)

    # Central florets (compact textured disc)
    disc_r = size * 0.16
    for ang in np.linspace(0, 2 * math.pi, 14):
        bx = cx + disc_r * 0.65 * math.cos(ang)
        by = cy + disc_r * 0.65 * math.sin(ang)
        cv2.circle(canvas, (int(bx), int(by)), int(disc_r * 0.28), (*gc, 180), -1, cv2.LINE_AA)
    cv2.circle(canvas, (int(cx), int(cy)), int(disc_r * 0.32), (*gc, 210), -1, cv2.LINE_AA)

    # Woolly star bracts (9 to 11 velvety pointed petals)
    bracts = 11
    for b in range(bracts):
        theta = 2 * math.pi * b / bracts
        L = size * (0.44 if b % 2 == 0 else 0.34)
        Wb = size * 0.11
        tip = (cx + L * math.cos(theta), cy + L * math.sin(theta))
        p1 = (cx + disc_r * math.cos(theta - 0.28) + Wb * math.sin(theta),
              cy + disc_r * math.sin(theta - 0.28) - Wb * math.cos(theta))
        p2 = (cx + disc_r * math.cos(theta + 0.28) - Wb * math.sin(theta),
              cy + disc_r * math.sin(theta + 0.28) + Wb * math.cos(theta))
        petal = [(cx, cy), p1, tip, p2, (cx, cy)]
        _pline(canvas, petal, gc, alpha=195, seed=seed + 30 + b, closed=True, thick=1)
        _hatch_polygon(canvas, petal, step=4, angle=math.degrees(theta), gc=gc, alpha=40, seed=seed + 50 + b)


# -------------------------------------------------------------------------
# HOJA 21B: THE AUTOMATON ORCHESTRA
# -------------------------------------------------------------------------

def draw_music_barrel_assembly(canvas, cx, cy, w=820, h=400, gc=GRAPHITE_COLOR, seed=21300):
    """Mechanical music barrel with escapement, brass cylinder and pin grid."""
    # Axle & Pillow blocks
    ax_y = cy
    axle = [(cx - w // 2 - 30, ax_y), (cx + w // 2 + 30, ax_y)]
    _pline(canvas, axle, gc, alpha=230, seed=seed, thick=3)

    # Left & Right bearing stands (cast bronze pedestals)
    for sgn, side in ((-1, cx - w // 2 - 15), (1, cx + w // 2 + 15)):
        ped = [
            (side - 26, ax_y + 90),
            (side - 14, ax_y - 20),
            (side + 14, ax_y - 20),
            (side + 26, ax_y + 90),
        ]
        _pline(canvas, ped, gc, alpha=210, seed=seed + 5 + sgn, closed=True, thick=2)
        _hatch_polygon(canvas, ped, step=5, angle=65, gc=gc, alpha=60, seed=seed + 6 + sgn)
        cv2.circle(canvas, (int(side), int(ax_y)), 16, (*gc, 220), 2, cv2.LINE_AA)

    # Main Brass Cylinder
    cyl_w, cyl_r = w - 140, 110
    cyl_x0, cyl_x1 = cx - cyl_w // 2, cx + cyl_w // 2
    # End plates (ellipses)
    for x_end, ang_off in ((cyl_x0, 0), (cyl_x1, 0)):
        end_ell = [(x_end + 18 * math.cos(t), ax_y + cyl_r * math.sin(t)) for t in np.linspace(0, 2 * math.pi, 48)]
        _pline(canvas, end_ell, gc, alpha=225, seed=seed + 15, thick=2)
        if x_end == cyl_x0:
            _hatch_polygon(canvas, end_ell, step=6, angle=45, gc=gc, alpha=70, seed=seed + 16)

    # Top & Bottom contour of cylinder
    _pline(canvas, [(cyl_x0, ax_y - cyl_r), (cyl_x1, ax_y - cyl_r)], gc, alpha=230, seed=seed + 20, thick=2)
    _pline(canvas, [(cyl_x0, ax_y + cyl_r), (cyl_x1, ax_y + cyl_r)], gc, alpha=230, seed=seed + 21, thick=2)

    # Longitudinal ribs & pin grid (musical measures)
    measures = 6
    for m in range(measures + 1):
        mx = cyl_x0 + m * (cyl_w / measures)
        _pline(canvas, [(mx, ax_y - cyl_r), (mx, ax_y + cyl_r)], gc, alpha=90, seed=seed + 30 + m, passes=1)

    # Sounding comb / pick teeth along bottom edge
    comb_pts = []
    for tooth in range(24):
        tx = cyl_x0 + 15 + tooth * ((cyl_w - 30) / 24)
        ty_tip = ax_y + cyl_r - 4
        _pline(canvas, [(tx, ty_tip), (tx - 5, ty_tip + 38), (tx + 5, ty_tip + 38)], gc, alpha=210, seed=seed + 40 + tooth, thick=2)
        # Pin projecting from cylinder near comb
        py_pin = ty_tip - (12 + 8 * math.sin(tooth * 1.3))
        cv2.circle(canvas, (int(tx), int(py_pin)), 3, (*gc, 230), -1, cv2.LINE_AA)

    # Escapement Ratchet Wheel on left axle
    rx = cyl_x0 - 45
    rr = 60
    ratchet_pts = []
    teeth = 16
    for t in range(teeth):
        a1 = 2 * math.pi * t / teeth
        a2 = 2 * math.pi * (t + 0.8) / teeth
        ratchet_pts.append((rx + (rr - 10) * math.cos(a1), ax_y + (rr - 10) * math.sin(a1)))
        ratchet_pts.append((rx + rr * math.cos(a2), ax_y + rr * math.sin(a2)))
    _pline(canvas, ratchet_pts, gc, alpha=225, seed=seed + 70, closed=True, thick=2)
    _hatch_polygon(canvas, ratchet_pts, step=5, angle=-30, gc=gc, alpha=75, seed=seed + 71)


# -------------------------------------------------------------------------
# HOJA 22A: THE FLY TOWER (LA TRAMOYA)
# -------------------------------------------------------------------------

def draw_fly_tower_machinery(canvas, cx, cy, w=840, h=420, gc=GRAPHITE_COLOR, seed=22100):
    """Renaissance counterweight stage machinery (Serlio & Sabbatini)."""
    # Top timber beam (graticcio)
    beam_y = cy - h // 2 + 30
    beam = [
        (cx - w // 2, beam_y - 20),
        (cx + w // 2, beam_y - 20),
        (cx + w // 2, beam_y + 20),
        (cx - w // 2, beam_y + 20),
    ]
    _pline(canvas, beam, gc, alpha=225, seed=seed, closed=True, thick=2)
    _hatch_polygon(canvas, beam, step=7, angle=0, gc=gc, alpha=45, seed=seed + 1)

    # Main Pulleys (grooved boxwood wheels mounted on beam)
    pulley_x = [cx - w * 0.32, cx - w * 0.08, cx + w * 0.16, cx + w * 0.38]
    pr = 34
    for idx, px in enumerate(pulley_x):
        py = beam_y + 50
        # iron mounting strap
        _pline(canvas, [(px - 14, beam_y + 20), (px - 14, py), (px + 14, py), (px + 14, beam_y + 20)], gc, alpha=210, seed=seed + 10 + idx, thick=2)
        cv2.circle(canvas, (int(px), int(py)), pr, (*gc, 220), 2, cv2.LINE_AA)
        cv2.circle(canvas, (int(px), int(py)), int(pr * 0.35), (*gc, 200), 1, cv2.LINE_AA)
        cv2.circle(canvas, (int(px), int(py)), 4, (*gc, 230), -1, cv2.LINE_AA)

    # Ropes & Counterweight bags
    # Left system (balanced counterweight cradle)
    p_left = pulley_x[0]
    rope_l1 = [(p_left - pr, beam_y + 50), (p_left - pr, cy + 90)]
    _pline(canvas, rope_l1, gc, alpha=215, seed=seed + 20, thick=2)
    # Counterweight cradle (arched frame with stack of lead bars)
    cradle_top = cy + 90
    cradle_w, cradle_h = 70, 95
    cradle = [
        (p_left - pr - cradle_w // 2, cradle_top),
        (p_left - pr + cradle_w // 2, cradle_top),
        (p_left - pr + cradle_w // 2, cradle_top + cradle_h),
        (p_left - pr - cradle_w // 2, cradle_top + cradle_h),
    ]
    _pline(canvas, cradle, gc, alpha=220, seed=seed + 25, closed=True, thick=2)
    _hatch_polygon(canvas, cradle, step=5, angle=65, gc=gc, alpha=70, seed=seed + 26)

    # Right system (cut rope fray and hanging sandbag)
    p_right = pulley_x[3]
    cut_y = cy + 20
    rope_r1 = [(p_right + pr, beam_y + 50), (p_right + pr, cut_y)]
    _pline(canvas, rope_r1, gc, alpha=215, seed=seed + 30, thick=2)
    # Frayed fibers where cut
    for f in (-8, -4, 0, 4, 8):
        _pline(canvas, [(p_right + pr, cut_y), (p_right + pr + f, cut_y + 14 + abs(f))], gc, alpha=180, seed=seed + 35 + f)

    # Sandbag fallen lower
    bag_cx, bag_cy = p_right + pr, cy + 120
    bag = [
        (bag_cx, bag_cy - 45),
        (bag_cx + 28, bag_cy - 30),
        (bag_cx + 38, bag_cy + 25),
        (bag_cx + 20, bag_cy + 45),
        (bag_cx - 20, bag_cy + 45),
        (bag_cx - 38, bag_cy + 25),
        (bag_cx - 28, bag_cy - 30),
    ]
    _pline(canvas, bag, gc, alpha=220, seed=seed + 40, closed=True, thick=2)
    _hatch_polygon(canvas, bag, step=5, angle=-45, gc=gc, alpha=55, seed=seed + 41)
    # Tie neck
    _pline(canvas, [(bag_cx - 14, bag_cy - 40), (bag_cx + 14, bag_cy - 40)], gc, alpha=240, seed=seed + 45, thick=3)


# -------------------------------------------------------------------------
# HOJA 22B: THE ASHES BEFORE CHRIST
# -------------------------------------------------------------------------

def draw_ashes_brazier_and_papyrus(canvas, cx, cy, w=840, h=420, gc=GRAPHITE_COLOR, seed=22300):
    """Bronze tripod incense brazier and ancient papyrus fragment."""
    # 1. Bronze Tripod Brazier (Left half)
    bx, by = cx - 210, cy + 30
    br = 120
    # Bowl
    bowl_pts = [(bx + br * math.cos(math.pi * i / 24), by + 35 * math.sin(math.pi * i / 24)) for i in range(25)]
    _pline(canvas, bowl_pts, gc, alpha=230, seed=seed, thick=2)
    _hatch_polygon(canvas, bowl_pts, step=5, angle=75, gc=gc, alpha=70, seed=seed + 1)
    # Rim flange
    rim = [(bx + (br + 12) * math.cos(math.pi + math.pi * i / 24), by - 12 + 16 * math.sin(math.pi + math.pi * i / 24)) for i in range(25)]
    _pline(canvas, rim, gc, alpha=220, seed=seed + 5, thick=2)

    # 3 Tripod cabriole legs ending in lion paws
    for sgn, lx in ((-1, bx - br * 0.7), (0, bx), (1, bx + br * 0.7)):
        leg = [
            (lx, by + 20),
            (lx + sgn * 24, by + 75),
            (lx + sgn * 10, by + 130),
            (lx + sgn * 28, by + 160),
            (lx + sgn * 6, by + 160),
            (lx - sgn * 10, by + 80),
            (lx - sgn * 8, by + 20),
        ]
        _pline(canvas, leg, gc, alpha=210, seed=seed + 10 + int(lx), closed=True, thick=2)
        _hatch_polygon(canvas, leg, step=4, angle=60, gc=gc, alpha=65, seed=seed + 12 + int(lx))

    # Glowing charcoal embers inside bowl
    for e in range(16):
        ex = bx - br * 0.65 + e * (br * 1.3 / 16)
        ey = by - 8 + 12 * math.sin(e * 0.9)
        cv2.circle(canvas, (int(ex), int(ey)), 6, (*gc, 210), -1, cv2.LINE_AA)

    # Curling tendrils of smoke rising from embers
    for s in range(5):
        sx0 = bx - 40 + s * 20
        smoke = [(sx0 + 26 * math.sin(i * 0.6 + s), by - 15 - i * 26) for i in range(10)]
        _pline(canvas, smoke, gc, alpha=85, seed=seed + 20 + s, passes=1, wob=0.6)

    # 2. Torn Papyrus Fragment of the BC Ashes (Right half)
    px, py = cx + 210, cy + 20
    pw, ph = 260, 290
    papyrus = [
        (px - pw // 2, py - ph // 2),
        (px + pw // 2 - 20, py - ph // 2 + 10),
        (px + pw // 2, py - ph // 2 + 40),
        (px + pw // 2 - 12, py + ph // 2 - 15),
        (px + pw // 2 - 35, py + ph // 2),
        (px - pw // 2 + 18, py + ph // 2 - 8),
        (px - pw // 2, py + ph // 2 - 35),
    ]
    _pline(canvas, papyrus, gc, alpha=220, seed=seed + 40, closed=True, thick=2)
    _hatch_polygon(canvas, papyrus, step=6, angle=45, gc=gc, alpha=30, seed=seed + 41)

    # Pope-E's Seal of Ash on Papyrus (circle cut by horizontal bar)
    seal_r = 54
    cv2.circle(canvas, (int(px), int(py)), seal_r, (*gc, 230), 2, cv2.LINE_AA)
    # Upper half hatched solid (inverted Order symbol)
    upper_half = [(px + seal_r * math.cos(math.pi + math.pi * i / 24), py + seal_r * math.sin(math.pi + math.pi * i / 24)) for i in range(25)]
    upper_half.append((px + seal_r, py))
    _hatch_polygon(canvas, upper_half, step=3, angle=0, gc=gc, alpha=160, seed=seed + 50)
    _pline(canvas, [(px - seal_r - 12, py), (px + seal_r + 12, py)], gc, alpha=240, seed=seed + 52, thick=3)


# -------------------------------------------------------------------------
# HOJA 23A: THE SHADOW THEATRE
# -------------------------------------------------------------------------

# The exact positions of the 3 oil lamp flames (for 23A -> 23B through-light registration)
LAMP_FLAMES = [(-260, -90), (0, -115), (260, -90)]

def draw_shadow_theatre_apparatus(canvas, cx, cy, w=840, h=400, gc=GRAPHITE_COLOR, seed=23100):
    """Stage with 3 hanging oil lamps and brass shadow puppets."""
    # Top support rod
    bar_y = cy - h // 2 + 25
    _pline(canvas, [(cx - w // 2 + 40, bar_y), (cx + w // 2 - 40, bar_y)], gc, alpha=220, seed=seed, thick=2)

    # 3 Hanging Venetian Oil Lamps
    for idx, (lx_rel, ly_rel) in enumerate(LAMP_FLAMES):
        lx, ly = cx + lx_rel, cy + ly_rel
        # Hanging cord
        _pline(canvas, [(lx, bar_y), (lx, ly - 35)], gc, alpha=180, seed=seed + 10 + idx)
        # Lamp cap & glass font
        cap = [(lx - 16, ly - 35), (lx + 16, ly - 35), (lx + 12, ly - 20), (lx - 12, ly - 20)]
        _pline(canvas, cap, gc, alpha=210, seed=seed + 15 + idx, closed=True)
        globe = [(lx + 24 * math.cos(t), ly + 20 + 26 * math.sin(t)) for t in np.linspace(0, 2 * math.pi, 36)]
        _pline(canvas, globe, gc, alpha=205, seed=seed + 20 + idx, thick=2)
        _hatch_polygon(canvas, globe, step=5, angle=60, gc=gc, alpha=35, seed=seed + 21 + idx)

        # Teardrop flame at (lx, ly)
        flame = [
            (lx, ly - 20),
            (lx + 8, ly - 8),
            (lx + 7, ly + 2),
            (lx, ly + 6),
            (lx - 7, ly + 2),
            (lx - 8, ly - 8),
        ]
        _pline(canvas, flame, gc, alpha=240, seed=seed + 30 + idx, closed=True, thick=2)
        _hatch_polygon(canvas, flame, step=2, angle=0, gc=gc, alpha=180, seed=seed + 31 + idx)

    # Brass Puppets on thin iron rods below lamps
    # Puppet 1: Crescent Moon on rod (Left)
    mx, my = cx - 180, cy + 90
    _pline(canvas, [(mx, my + 110), (mx, my)], gc, alpha=200, seed=seed + 50, thick=2)
    moon_outer = [(mx + 42 * math.cos(t), my + 42 * math.sin(t)) for t in np.linspace(-math.pi / 2, math.pi / 2, 24)]
    moon_inner = [(mx + 22 + 32 * math.cos(t), my + 42 * math.sin(t)) for t in np.linspace(math.pi / 2, -math.pi / 2, 24)]
    moon_poly = moon_outer + moon_inner
    _pline(canvas, moon_poly, gc, alpha=230, seed=seed + 52, closed=True, thick=2)
    _hatch_polygon(canvas, moon_poly, step=3, angle=45, gc=gc, alpha=160, seed=seed + 53)

    # Puppet 2: Classical Tower silhouette (Center)
    tx, ty = cx, cy + 75
    _pline(canvas, [(tx, ty + 125), (tx, ty)], gc, alpha=200, seed=seed + 60, thick=2)
    tower_pts = [
        (tx - 35, ty + 70), (tx - 30, ty - 25), (tx - 40, ty - 25), (tx - 40, ty - 45),
        (tx - 25, ty - 45), (tx - 25, ty - 35), (tx - 10, ty - 35), (tx - 10, ty - 45),
        (tx + 10, ty - 45), (tx + 10, ty - 35), (tx + 25, ty - 35), (tx + 25, ty - 45),
        (tx + 40, ty - 45), (tx + 40, ty - 25), (tx + 30, ty - 25), (tx + 35, ty + 70)
    ]
    _pline(canvas, tower_pts, gc, alpha=235, seed=seed + 62, closed=True, thick=2)
    _hatch_polygon(canvas, tower_pts, step=3, angle=-45, gc=gc, alpha=170, seed=seed + 63)

    # Puppet 3: Masked Figure Profile (Right)
    fx, fy = cx + 180, cy + 85
    _pline(canvas, [(fx, fy + 115), (fx, fy)], gc, alpha=200, seed=seed + 70, thick=2)
    fig_pts = [
        (fx, fy - 45), (fx + 22, fy - 35), (fx + 30, fy - 15), (fx + 18, fy + 10),
        (fx + 28, fy + 25), (fx + 10, fy + 55), (fx - 18, fy + 55), (fx - 24, fy + 20),
        (fx - 15, fy - 20)
    ]
    _pline(canvas, fig_pts, gc, alpha=230, seed=seed + 72, closed=True, thick=2)
    _hatch_polygon(canvas, fig_pts, step=3, angle=65, gc=gc, alpha=165, seed=seed + 73)


# -------------------------------------------------------------------------
# HOJA 23B: AURELIA'S SKETCHBOOK II · THE DISC AND THE VOW
# -------------------------------------------------------------------------

def draw_astrometric_vow_disc(canvas, cx, cy, r=220, gc=GRAPHITE_COLOR, seed=23300):
    """Great 24-spoke calculating disc with through-light alignment apertures."""
    # Outer rings with beaded edge
    cv2.circle(canvas, (int(cx), int(cy)), int(r), (*gc, 225), 2, cv2.LINE_AA)
    cv2.circle(canvas, (int(cx), int(cy)), int(r - 18), (*gc, 205), 1, cv2.LINE_AA)
    cv2.circle(canvas, (int(cx), int(cy)), int(r - 40), (*gc, 215), 2, cv2.LINE_AA)
    cv2.circle(canvas, (int(cx), int(cy)), int(r * 0.45), (*gc, 210), 1, cv2.LINE_AA)

    # 24 Radii / Spokes
    for s in range(24):
        ang = 2 * math.pi * s / 24
        p0 = (cx + (r - 40) * math.cos(ang), cy + (r - 40) * math.sin(ang))
        p1 = (cx + r * math.cos(ang), cy + r * math.sin(ang))
        _pline(canvas, [p0, p1], gc, alpha=190, seed=seed + s, thick=1)
        # Degree tick mark
        p_in = (cx + (r - 18) * math.cos(ang + math.pi / 24), cy + (r - 18) * math.sin(ang + math.pi / 24))
        p_out = (cx + r * math.cos(ang + math.pi / 24), cy + r * math.sin(ang + math.pi / 24))
        _pline(canvas, [p_in, p_out], gc, alpha=140, seed=seed + 30 + s, passes=1)

    # The 3 Translucent Alignment Apertures (Mirrored for Cara B: x -> -x)
    for idx, (lx_rel, ly_rel) in enumerate(LAMP_FLAMES):
        # On Cara B, the horizontal coordinate aligns from the reverse side: -lx_rel
        ap_x, ap_y = cx - lx_rel, cy + ly_rel
        cv2.circle(canvas, (int(ap_x), int(ap_y)), 18, (*gc, 240), 2, cv2.LINE_AA)
        cv2.circle(canvas, (int(ap_x), int(ap_y)), 6, (*gc, 240), -1, cv2.LINE_AA)
        # Decorative bracket around aperture
        bracket = [(ap_x + 24 * math.cos(t), ap_y + 24 * math.sin(t)) for t in np.linspace(0, 2 * math.pi, 24)]
        _pline(canvas, bracket, gc, alpha=160, seed=seed + 60 + idx)

    # Central Vow Medallion of 1970
    center_r = 55
    cv2.circle(canvas, (int(cx), int(cy)), center_r, (*gc, 230), 2, cv2.LINE_AA)
    _hatch_polygon(canvas, [(cx + center_r * math.cos(t), cy + center_r * math.sin(t)) for t in np.linspace(0, 2 * math.pi, 36)],
                   step=4, angle=45, gc=gc, alpha=45, seed=seed + 80)
    # 4 Star rays from center
    for a in (0, math.pi / 2, math.pi, 3 * math.pi / 2):
        _pline(canvas, [(cx, cy), (cx + (r * 0.42) * math.cos(a), cy + (r * 0.42) * math.sin(a))], gc, alpha=200, seed=seed + 90, thick=2)


# -------------------------------------------------------------
# HOJA 24A: THE HALL OF MIRRORS (SERLIO GROUND PLAN & OPTICS)
# -------------------------------------------------------------

def draw_mirror_maze_serlio_plan(canvas, cx, cy, w=960, h=380, gc=GRAPHITE_COLOR, seed=24100):
    """Sebastiano Serlio / Galli da Bibiena Renaissance ground plan of the Hall of Mirrors:
    Rusticated ashlar perimeter walls (bugnato a cuscino) with Tuscan pilasters,
    semicircular wall esedras (alcoves) holding monumental mirrors, paved checkerboard floor grid,
    symmetrical stone partitions and silvered glass mirror baffles, central Silver Axis (fold crease)
    with top and bottom ornamental fleurons, Pope-E's cloaked silhouette in the secret exit chamber,
    and a classical subdivided architectural scale bar (Scala di XX Passi)."""
    rng = np.random.default_rng(seed)

    x0 = cx - w // 2
    x1 = cx + w // 2
    y0 = cy - h // 2
    y1 = cy + h // 2
    wall_t = 24  # masonry perimeter wall thickness

    ix0, ix1 = x0 + wall_t, x1 - wall_t
    iy0, iy1 = y0 + wall_t, y1 - wall_t

    # 1. Floor Paving Grid (Pavimento a scacchiera)
    tile_s = 32
    for tx in range(ix0 + tile_s, ix1, tile_s):
        _pline(canvas, [(tx, iy0), (tx, iy1)], gc, alpha=36, seed=seed + 1 + tx % 100, passes=1)
    for ty in range(iy0 + tile_s, iy1, tile_s):
        _pline(canvas, [(ix0, ty), (ix1, ty)], gc, alpha=36, seed=seed + 50 + ty % 100, passes=1)

    # 2. Rusticated Ashlar Perimeter Walls (Bugnato a cuscino)
    outer_box = [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]
    _pline(canvas, outer_box, gc, alpha=230, seed=seed + 10, closed=True, thick=2)
    inner_box = [(ix0, iy0), (ix1, iy0), (ix1, iy1), (ix0, iy1)]
    _pline(canvas, inner_box, gc, alpha=210, seed=seed + 11, closed=True, thick=2)

    # Ashlar block joints in perimeter masonry
    # Top & bottom walls
    n_top_blocks = int((x1 - x0) // 32)
    for bi in range(n_top_blocks):
        bx = x0 + int(bi * (x1 - x0) / n_top_blocks)
        _pline(canvas, [(bx, y0), (bx, iy0)], gc, alpha=160, seed=seed + 20 + bi)
        _pline(canvas, [(bx + 16, y1), (bx + 16, iy1)], gc, alpha=160, seed=seed + 30 + bi)
        if bi % 2 == 0:
            block_top = [(bx, y0), (bx + 32, y0), (bx + 32, iy0), (bx, iy0)]
            _hatch_polygon(canvas, block_top, step=5, angle=45, gc=gc, alpha=45, seed=seed + 40 + bi)
            block_bot = [(bx + 16, iy1), (bx + 48, iy1), (bx + 48, y1), (bx + 16, y1)]
            _hatch_polygon(canvas, block_bot, step=5, angle=-45, gc=gc, alpha=45, seed=seed + 50 + bi)

    # Left & right side walls
    n_side_blocks = int((y1 - y0) // 28)
    for bi in range(n_side_blocks):
        by = y0 + int(bi * (y1 - y0) / n_side_blocks)
        _pline(canvas, [(x0, by), (ix0, by)], gc, alpha=160, seed=seed + 60 + bi)
        _pline(canvas, [(x1, by), (ix1, by)], gc, alpha=160, seed=seed + 70 + bi)
        if bi % 2 == 1:
            block_left = [(x0, by), (ix0, by), (ix0, by + 28), (x0, by + 28)]
            _hatch_polygon(canvas, block_left, step=5, angle=45, gc=gc, alpha=40, seed=seed + 80 + bi)
            block_right = [(ix1, by), (x1, by), (x1, by + 28), (ix1, by + 28)]
            _hatch_polygon(canvas, block_right, step=5, angle=-45, gc=gc, alpha=40, seed=seed + 90 + bi)

    # 3. Semicircular Wall Esedras (Nicchie murarie intagliate con specchi e passi)
    esedra_rad = 20
    for ex in (cx - 240, cx + 240):
        # North wall niche (recessed upward into stone: 180 to 360 deg)
        cv2.line(canvas, (ex - esedra_rad + 2, iy0), (ex + esedra_rad - 2, iy0), (0, 0, 0, 0), 4)
        cv2.ellipse(canvas, (ex, iy0), (esedra_rad, esedra_rad), 0, 180, 360, (*gc, 210), 2, cv2.LINE_AA)
        cv2.ellipse(canvas, (ex, iy0), (esedra_rad - 6, esedra_rad - 6), 0, 180, 360, (*gc, 160), 1, cv2.LINE_AA)
        # Radial voussoirs into masonry
        for a_deg in (210, 240, 270, 300, 330):
            th = math.radians(a_deg)
            pA = (int(ex + (esedra_rad - 6) * math.cos(th)), int(iy0 + (esedra_rad - 6) * math.sin(th)))
            pB = (int(ex + esedra_rad * math.cos(th)), int(iy0 + esedra_rad * math.sin(th)))
            _pline(canvas, [pA, pB], gc, alpha=180, seed=seed + 100 + ex + a_deg)

        # South wall niche (recessed downward into stone: 0 to 180 deg)
        cv2.line(canvas, (ex - esedra_rad + 2, iy1), (ex + esedra_rad - 2, iy1), (0, 0, 0, 0), 4)
        cv2.ellipse(canvas, (ex, iy1), (esedra_rad, esedra_rad), 0, 0, 180, (*gc, 210), 2, cv2.LINE_AA)
        cv2.ellipse(canvas, (ex, iy1), (esedra_rad - 6, esedra_rad - 6), 0, 0, 180, (*gc, 160), 1, cv2.LINE_AA)
        for a_deg in (30, 60, 90, 120, 150):
            th = math.radians(a_deg)
            pA = (int(ex + (esedra_rad - 6) * math.cos(th)), int(iy1 + (esedra_rad - 6) * math.sin(th)))
            pB = (int(ex + esedra_rad * math.cos(th)), int(iy1 + esedra_rad * math.sin(th)))
            _pline(canvas, [pA, pB], gc, alpha=180, seed=seed + 110 + ex + a_deg)

    # Inscribe Venetian pace counts at the 4 alcoves (IV, VI, V, V = XX paces)
    # North-West alcove: IV paces
    nwx = cx - 240
    _pline(canvas, [(nwx - 8, iy0 + 8), (nwx - 8, iy0 + 22)], gc, alpha=200, seed=seed + 102, thick=1)
    _pline(canvas, [(nwx - 2, iy0 + 8), (nwx + 2, iy0 + 22), (nwx + 6, iy0 + 8)], gc, alpha=200, seed=seed + 103, thick=1)
    # North-East alcove: VI paces
    nex = cx + 240
    _pline(canvas, [(nex - 6, iy0 + 8), (nex - 2, iy0 + 22), (nex + 2, iy0 + 8)], gc, alpha=200, seed=seed + 105, thick=1)
    _pline(canvas, [(nex + 8, iy0 + 8), (nex + 8, iy0 + 22)], gc, alpha=200, seed=seed + 106, thick=1)
    # South-West alcove: V paces
    swx = cx - 240
    _pline(canvas, [(swx - 4, iy1 - 22), (swx, iy1 - 8), (swx + 4, iy1 - 22)], gc, alpha=200, seed=seed + 112, thick=1)
    # South-East alcove: V paces
    sex = cx + 240
    _pline(canvas, [(sex - 4, iy1 - 22), (sex, iy1 - 8), (sex + 4, iy1 - 22)], gc, alpha=200, seed=seed + 115, thick=1)

    # 4. Portals: Entrance (West · Occidens) and Exit (East · Oriens)
    # West Portal (Entrance)
    ent_y0, ent_y1 = cy - 36, cy + 36
    cv2.line(canvas, (x0 - 2, ent_y0), (ix0 + 2, ent_y0), (0, 0, 0, 0), 4)
    cv2.line(canvas, (x0 - 2, ent_y1), (ix0 + 2, ent_y1), (0, 0, 0, 0), 4)
    _pline(canvas, [(x0, ent_y0), (ix0, ent_y0)], gc, alpha=220, seed=seed + 120, thick=2)
    _pline(canvas, [(x0, ent_y1), (ix0, ent_y1)], gc, alpha=220, seed=seed + 121, thick=2)
    _pline(canvas, [(x0 - 12, ent_y0 - 8), (x0 - 12, ent_y1 + 8)], gc, alpha=190, seed=seed + 122, thick=1)
    _pline(canvas, [(x0 - 6, ent_y0 - 4), (x0 - 6, ent_y1 + 4)], gc, alpha=200, seed=seed + 123, thick=1)
    # Cardinal W at Western Portal
    _pline(canvas, [(x0 - 24, cy - 8), (x0 - 20, cy + 8), (x0 - 16, cy - 2), (x0 - 12, cy + 8), (x0 - 8, cy - 8)],
           gc, alpha=210, seed=seed + 124, thick=1)

    # East Portal (Exit to Inner Chamber · Oriens)
    exit_y0, exit_y1 = cy + 45, cy + 125
    _pline(canvas, [(x1, exit_y0), (ix1, exit_y0)], gc, alpha=220, seed=seed + 125, thick=2)
    _pline(canvas, [(x1, exit_y1), (ix1, exit_y1)], gc, alpha=220, seed=seed + 126, thick=2)
    ch_x1 = x1 + 45
    _pline(canvas, [(x1, exit_y0), (ch_x1, exit_y0), (ch_x1, exit_y1), (x1, exit_y1)], gc, alpha=200, seed=seed + 127, thick=2)
    _hatch_polygon(canvas, [(x1, exit_y0), (ch_x1, exit_y0), (ch_x1, exit_y1), (x1, exit_y1)], step=6, angle=45, gc=gc, alpha=30, seed=seed + 128)
    # Cardinal E at Eastern Portal
    _pline(canvas, [(ch_x1 + 10, cy + 78), (ch_x1 + 20, cy + 78)], gc, alpha=210, seed=seed + 129, thick=1)
    _pline(canvas, [(ch_x1 + 10, cy + 78), (ch_x1 + 10, cy + 92)], gc, alpha=210, seed=seed + 130, thick=1)
    _pline(canvas, [(ch_x1 + 10, cy + 85), (ch_x1 + 17, cy + 85)], gc, alpha=210, seed=seed + 131, thick=1)
    _pline(canvas, [(ch_x1 + 10, cy + 92), (ch_x1 + 20, cy + 92)], gc, alpha=210, seed=seed + 132, thick=1)

    # 5. Internal Partitions & Mirror Baffles
    stone_walls = [
        ((-330, -110), (-160, -110)),
        ((-250, 40), (-150, 40)),
        ((-250, -110), (-250, -35)),
        ((160, -110), (330, -110)),
        ((150, 40), (250, 40)),
        ((250, -110), (250, -35)),
    ]
    for idx, (pA, pB) in enumerate(stone_walls):
        ax, ay = cx + pA[0], cy + pA[1]
        bx, by = cx + pB[0], cy + pB[1]
        dx, dy = bx - ax, by - ay
        L = math.hypot(dx, dy)
        if L < 1:
            continue
        nx, ny = -dy / L * 3.5, dx / L * 3.5
        wall_pts = [
            (int(ax + nx), int(ay + ny)),
            (int(bx + nx), int(by + ny)),
            (int(bx - nx), int(by - ny)),
            (int(ax - nx), int(ay - ny)),
        ]
        _pline(canvas, wall_pts, gc, alpha=230, seed=seed + 140 + idx, closed=True, thick=1)
        _hatch_polygon(canvas, wall_pts, step=3, angle=45, gc=gc, alpha=160, seed=seed + 150 + idx)

    mirror_baffles = [
        ((-240, -35), (-70, -35), (0, 1)),
        ((-340, 40), (-250, 40), (0, -1)),
        ((-300, 115), (-110, 115), (0, -1)),
        ((-150, 40), (-150, 115), (1, 0)),
        ((70, -35), (240, -35), (0, 1)),
        ((250, 40), (340, 40), (0, -1)),
        ((110, 115), (300, 115), (0, -1)),
        ((150, 40), (150, 115), (-1, 0)),
    ]
    for idx, (pA, pB, normal) in enumerate(mirror_baffles):
        ax, ay = cx + pA[0], cy + pA[1]
        bx, by = cx + pB[0], cy + pB[1]
        _pline(canvas, [(ax, ay), (bx, by)], gc, alpha=235, seed=seed + 160 + idx, thick=2)
        dx, dy = bx - ax, by - ay
        L = math.hypot(dx, dy)
        n_ticks = int(L // 12)
        for s in range(n_ticks):
            t = (s + 0.5) * 12 / L
            tx, ty = ax + dx * t, ay + dy * t
            tick_end = (int(tx + normal[0] * 7 + normal[1] * 5), int(ty + normal[1] * 7 - normal[0] * 5))
            _pline(canvas, [(int(tx), int(ty)), tick_end], gc, alpha=175, seed=seed + 180 + idx * 20 + s, passes=1)

    # 6. Pope-E's Silhouette in the Exit Alcove (Carles / Pope-E back reflection)
    pe_x, pe_y = cx + 320, cy + 90
    cloak = [
        (pe_x - 12, pe_y + 32),
        (pe_x - 18, pe_y + 8),
        (pe_x - 9, pe_y - 16),
        (pe_x, pe_y - 25),
        (pe_x + 9, pe_y - 16),
        (pe_x + 18, pe_y + 8),
        (pe_x + 12, pe_y + 32),
    ]
    _pline(canvas, cloak, gc, alpha=235, seed=seed + 220, closed=True, thick=2)
    _hatch_polygon(canvas, cloak, step=3, angle=65, gc=gc, alpha=195, seed=seed + 221)
    cv2.circle(canvas, (pe_x, pe_y - 18), 7, (*gc, 235), -1, cv2.LINE_AA)

    # 7. The Silver Axis (Central Fold Line)
    fold_y_top = y0 - 30
    fold_y_bot = y1 + 30
    _dashed_line(canvas, (cx, fold_y_top), (cx, fold_y_bot), dash_len=14, gap_len=8, gc=gc, alpha=210, seed=seed + 230, thick=2)

    # Top Fleuron / Fold Crease Arrow
    top_arrow = [
        (cx, y0 - 4),
        (cx - 9, y0 - 24),
        (cx - 3, y0 - 20),
        (cx - 3, y0 - 32),
        (cx + 3, y0 - 32),
        (cx + 3, y0 - 20),
        (cx + 9, y0 - 24),
    ]
    _pline(canvas, top_arrow, gc, alpha=230, seed=seed + 240, closed=True, thick=1)
    _hatch_polygon(canvas, top_arrow, step=3, angle=90, gc=gc, alpha=180, seed=seed + 241)
    cv2.ellipse(canvas, (cx - 16, y0 - 26), (9, 5), -25, 0, 360, (*gc, 180), 1, cv2.LINE_AA)
    cv2.ellipse(canvas, (cx + 16, y0 - 26), (9, 5), 25, 0, 360, (*gc, 180), 1, cv2.LINE_AA)

    # Bottom Fleuron / Fold Crease Arrow
    bot_arrow = [
        (cx, y1 + 4),
        (cx - 9, y1 + 24),
        (cx - 3, y1 + 20),
        (cx - 3, y1 + 32),
        (cx + 3, y1 + 32),
        (cx + 3, y1 + 20),
        (cx + 9, y1 + 24),
    ]
    _pline(canvas, bot_arrow, gc, alpha=230, seed=seed + 245, closed=True, thick=1)
    _hatch_polygon(canvas, bot_arrow, step=3, angle=90, gc=gc, alpha=180, seed=seed + 246)
    cv2.ellipse(canvas, (cx - 16, y1 + 26), (9, 5), 25, 0, 360, (*gc, 180), 1, cv2.LINE_AA)
    cv2.ellipse(canvas, (cx + 16, y1 + 26), (9, 5), -25, 0, 360, (*gc, 180), 1, cv2.LINE_AA)

    # 8. Architectural Scale Bar (Scala di Venti Passi)
    bar_y = y1 + 44
    bar_w = 360
    bar_x0 = cx - bar_w // 2
    bar_x1 = cx + bar_w // 2
    bar_h = 7
    _pline(canvas, [(bar_x0, bar_y), (bar_x1, bar_y), (bar_x1, bar_y + bar_h), (bar_x0, bar_y + bar_h)],
           gc, alpha=220, seed=seed + 250, closed=True, thick=1)
    div_w = bar_w / 10.0
    for di in range(10):
        dx_start = int(bar_x0 + di * div_w)
        dx_end = int(bar_x0 + (di + 1) * div_w)
        _pline(canvas, [(dx_start, bar_y - 4), (dx_start, bar_y + bar_h + 4)], gc, alpha=200, seed=seed + 260 + di)
        if di % 2 == 0:
            div_box = [(dx_start, bar_y), (dx_end, bar_y), (dx_end, bar_y + bar_h), (dx_start, bar_y + bar_h)]
            _hatch_polygon(canvas, div_box, step=2, angle=90, gc=gc, alpha=190, seed=seed + 270 + di)
    _pline(canvas, [(bar_x1, bar_y - 4), (bar_x1, bar_y + bar_h + 4)], gc, alpha=200, seed=seed + 280)


def draw_mirror_maze_plan(canvas, cx, cy, w=960, h=380, gc=GRAPHITE_COLOR, seed=24100):
    """Backward-compatible wrapper for the Serlio mirror maze plan."""
    return draw_mirror_maze_serlio_plan(canvas, cx, cy, w=w, h=h, gc=gc, seed=seed)


def draw_optical_reflection_study(canvas, cx, cy, w=960, h=420, gc=GRAPHITE_COLOR, seed=24200):
    """Renaissance optical study of specular reflection (Alhazen & Leonardo da Vinci):
    Vertical silvered mirror plane (Speculum Argenteum) with dense mercury amalgam backing,
    light source (brass candlestick) emitting incident ray, horizontal normal line with angle arcs (theta_i = theta_r),
    reflected ray entering Leonardo profile eye study (Oculus Observatoris),
    virtual space behind mirror with dashed ray projection, virtual ghost flame,
    and receding phantom corridor (Corridoio Spettrale);
    flanked by a grand 16-point Renaissance Compass Rose (Rosa dei Venti)."""
    rng = np.random.default_rng(seed)

    # 1. THE MIRROR PLANE (Speculum Argenteum)
    xm = cx - 90
    my_top = cy - 175
    my_bot = cy + 175

    _pline(canvas, [(xm, my_top), (xm, my_bot)], gc, alpha=240, seed=seed + 1, thick=2)
    _pline(canvas, [(xm + 4, my_top), (xm + 4, my_bot)], gc, alpha=180, seed=seed + 2, thick=1)

    back_poly = [(xm + 4, my_top), (xm + 24, my_top), (xm + 24, my_bot), (xm + 4, my_bot)]
    _hatch_polygon(canvas, back_poly, step=4, angle=45, gc=gc, alpha=90, seed=seed + 5)
    _pline(canvas, [(xm + 24, my_top), (xm + 24, my_bot)], gc, alpha=150, seed=seed + 6)
    _pline(canvas, [(xm - 14, my_top), (xm + 34, my_top)], gc, alpha=200, seed=seed + 7, thick=2)
    _pline(canvas, [(xm - 14, my_bot), (xm + 34, my_bot)], gc, alpha=200, seed=seed + 8, thick=2)

    # 2. LIGHT SOURCE: CANDLESTICK & FLAME (Fons Luminis)
    cx_light = cx - 390
    cy_light = cy - 110

    candle_w, candle_h = 16, 48
    candle_box = [
        (cx_light - candle_w // 2, cy_light + 10),
        (cx_light + candle_w // 2, cy_light + 10),
        (cx_light + candle_w // 2, cy_light + 10 + candle_h),
        (cx_light - candle_w // 2, cy_light + 10 + candle_h),
    ]
    _pline(canvas, candle_box, gc, alpha=210, seed=seed + 15, closed=True)
    _hatch_polygon(canvas, candle_box, step=3, angle=90, gc=gc, alpha=60, seed=seed + 16)
    _pline(canvas, [(cx_light - candle_w // 2, cy_light + 18), (cx_light - candle_w // 2 - 3, cy_light + 30),
                    (cx_light - candle_w // 2, cy_light + 35)], gc, alpha=180, seed=seed + 17)

    tray_y = cy_light + 10 + candle_h
    cv2.ellipse(canvas, (cx_light, tray_y), (26, 7), 0, 0, 360, (*gc, 210), 2, cv2.LINE_AA)
    _pline(canvas, [(cx_light - 6, tray_y + 7), (cx_light - 10, tray_y + 35),
                    (cx_light - 28, tray_y + 50), (cx_light + 28, tray_y + 50),
                    (cx_light + 10, tray_y + 35), (cx_light + 6, tray_y + 7)],
           gc, alpha=210, seed=seed + 20, closed=True)
    _hatch_polygon(canvas, [(cx_light - 28, tray_y + 40), (cx_light + 28, tray_y + 40),
                            (cx_light + 28, tray_y + 50), (cx_light - 28, tray_y + 50)],
                   step=3, angle=45, gc=gc, alpha=80, seed=seed + 21)

    wick_tip = (cx_light, cy_light + 2)
    _pline(canvas, [(cx_light, cy_light + 10), wick_tip], gc, alpha=240, seed=seed + 25, thick=2)
    flame_pts = [
        (cx_light, cy_light - 24),
        (cx_light + 7, cy_light - 10),
        (cx_light + 5, cy_light + 4),
        (cx_light, cy_light + 6),
        (cx_light - 5, cy_light + 4),
        (cx_light - 7, cy_light - 10),
    ]
    _pline(canvas, flame_pts, gc, alpha=230, seed=seed + 28, closed=True, thick=1)
    for a_deg in (-60, -35, -10, 15, 40, 65, 90, 120, 150):
        th = math.radians(a_deg)
        r_start = (int(cx_light + 10 * math.cos(th)), int(cy_light - 8 + 10 * math.sin(th)))
        r_end = (int(cx_light + 38 * math.cos(th)), int(cy_light - 8 + 38 * math.sin(th)))
        _pline(canvas, [r_start, r_end], gc, alpha=110, seed=seed + 30 + a_deg, passes=1)

    # 3. INCIDENT RAY, NORMAL & REFLECTED RAY
    flame_center = (cx_light, cy_light - 8)
    hit_pt = (xm, cy)

    _pline(canvas, [flame_center, hit_pt], gc, alpha=235, seed=seed + 40, thick=2)
    mid_inc = ((flame_center[0] + hit_pt[0]) // 2, (flame_center[1] + hit_pt[1]) // 2)
    inc_ang = math.atan2(hit_pt[1] - flame_center[1], hit_pt[0] - flame_center[0])
    a1 = (int(mid_inc[0] - 13 * math.cos(inc_ang - 0.38)), int(mid_inc[1] - 13 * math.sin(inc_ang - 0.38)))
    a2 = (int(mid_inc[0] - 13 * math.cos(inc_ang + 0.38)), int(mid_inc[1] - 13 * math.sin(inc_ang + 0.38)))
    _pline(canvas, [a1, mid_inc, a2], gc, alpha=235, seed=seed + 42, thick=2)

    _dashed_line(canvas, (xm - 220, cy), (xm, cy), dash_len=10, gap_len=6, gc=gc, alpha=180, seed=seed + 45)
    _pline(canvas, [(xm - 16, cy), (xm - 16, cy - 16), (xm, cy - 16)], gc, alpha=190, seed=seed + 48)

    cx_eye = cx - 390
    cy_eye = cy + 110
    eye_pupil = (cx_eye + 20, cy_eye)
    _pline(canvas, [hit_pt, eye_pupil], gc, alpha=235, seed=seed + 50, thick=2)
    mid_ref = ((hit_pt[0] + eye_pupil[0]) // 2, (hit_pt[1] + eye_pupil[1]) // 2)
    ref_ang = math.atan2(eye_pupil[1] - hit_pt[1], eye_pupil[0] - hit_pt[0])
    r1 = (int(mid_ref[0] - 13 * math.cos(ref_ang - 0.38)), int(mid_ref[1] - 13 * math.sin(ref_ang - 0.38)))
    r2 = (int(mid_ref[0] - 13 * math.cos(ref_ang + 0.38)), int(mid_ref[1] - 13 * math.sin(ref_ang + 0.38)))
    _pline(canvas, [r1, mid_ref, r2], gc, alpha=235, seed=seed + 52, thick=2)

    arc_rad = 60
    cv2.ellipse(canvas, (xm, cy), (arc_rad, arc_rad), 0, 180 - int(math.degrees(inc_ang)), 180, (*gc, 185), 1, cv2.LINE_AA)
    cv2.ellipse(canvas, (xm, cy), (arc_rad, arc_rad), 0, 180, 180 + int(math.degrees(ref_ang - math.pi)), (*gc, 185), 1, cv2.LINE_AA)

    # 4. OBSERVER'S EYE STUDY (Oculus Observatoris)
    cornea = [
        (cx_eye + 12, cy_eye - 18),
        (cx_eye + 24, cy_eye - 9),
        (cx_eye + 26, cy_eye),
        (cx_eye + 24, cy_eye + 9),
        (cx_eye + 12, cy_eye + 18),
    ]
    _pline(canvas, cornea, gc, alpha=235, seed=seed + 60, thick=2)
    cv2.ellipse(canvas, (cx_eye, cy_eye), (22, 19), 0, 0, 360, (*gc, 160), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx_eye + 15, cy_eye), 8, (*gc, 210), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx_eye + 16, cy_eye), 4, (*gc, 240), -1, cv2.LINE_AA)
    _pline(canvas, [(cx_eye - 18, cy_eye - 14), (cx_eye + 8, cy_eye - 19), (cx_eye + 24, cy_eye - 9)],
           gc, alpha=210, seed=seed + 65, thick=1)
    _pline(canvas, [(cx_eye - 18, cy_eye + 14), (cx_eye + 8, cy_eye + 19), (cx_eye + 24, cy_eye + 9)],
           gc, alpha=210, seed=seed + 66, thick=1)
    _pline(canvas, [(cx_eye - 22, cy_eye), (cx_eye - 48, cy_eye)], gc, alpha=150, seed=seed + 68)

    # 5. VIRTUAL SPACE & PHANTOM CORRIDOR (Corridoio Spettrale)
    dx_virt = xm - flame_center[0]
    dy_virt = flame_center[1] - hit_pt[1]
    virt_flame = (xm + dx_virt, hit_pt[1] + dy_virt)
    _dashed_line(canvas, hit_pt, virt_flame, dash_len=10, gap_len=6, gc=gc, alpha=185, seed=seed + 75)

    for dash_a in range(8):
        ang_v = dash_a * math.pi / 4.0
        v_pt = (int(virt_flame[0] + 10 * math.cos(ang_v)), int(virt_flame[1] + 13 * math.sin(ang_v)))
        _pline(canvas, [virt_flame, v_pt], gc, alpha=135, seed=seed + 80 + dash_a, passes=1)
    cv2.circle(canvas, virt_flame, 6, (*gc, 110), 1, cv2.LINE_AA)

    vp_x, vp_y = xm + 200, cy
    _dashed_line(canvas, (xm + 24, my_top + 20), (vp_x, vp_y), dash_len=8, gap_len=7, gc=gc, alpha=130, seed=seed + 90)
    _dashed_line(canvas, (xm + 24, my_bot - 20), (vp_x, vp_y), dash_len=8, gap_len=7, gc=gc, alpha=130, seed=seed + 91)
    for step_pct in (0.30, 0.58, 0.80):
        gx = int(xm + 24 + (vp_x - (xm + 24)) * step_pct)
        gy_top = int((my_top + 20) + (vp_y - (my_top + 20)) * step_pct)
        gy_bot = int((my_bot - 20) + (vp_y - (my_bot - 20)) * step_pct)
        _dashed_line(canvas, (gx, gy_top), (gx, gy_bot), dash_len=6, gap_len=5, gc=gc, alpha=120, seed=seed + 95 + int(step_pct * 10))
        gw = int(14 * (1.0 - step_pct * 0.5))
        gh = int(12 * (1.0 - step_pct * 0.5))
        cv2.ellipse(canvas, (gx, gy_top), (gw, gh), 0, 180, 360, (*gc, 110), 1, cv2.LINE_AA)

    # 6. GRAND RENAISSANCE COMPASS ROSE (Rosa dei Venti)
    cx_rose = cx + 330
    cy_rose = cy
    R_rose = 118

    cv2.circle(canvas, (cx_rose, cy_rose), R_rose, (*gc, 210), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx_rose, cy_rose), R_rose - 12, (*gc, 170), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx_rose, cy_rose), int(R_rose * 0.35), (*gc, 180), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx_rose, cy_rose), 12, (*gc, 220), -1, cv2.LINE_AA)
    cv2.circle(canvas, (cx_rose, cy_rose), 4, (255, 255, 255, 255), -1, cv2.LINE_AA)

    for deg in range(0, 360, 10):
        th = math.radians(deg)
        r_inner = R_rose - 12 if deg % 30 == 0 else R_rose - 6
        p1 = (int(cx_rose + r_inner * math.cos(th)), int(cy_rose + r_inner * math.sin(th)))
        p2 = (int(cx_rose + R_rose * math.cos(th)), int(cy_rose + R_rose * math.sin(th)))
        _pline(canvas, [p1, p2], gc, alpha=190, seed=seed + 110 + deg, passes=1)

    pts_angles = [
        (0, R_rose + 10, "E"),
        (45, int(R_rose * 0.70), "SE"),
        (90, R_rose + 10, "S"),
        (135, int(R_rose * 0.70), "SW"),
        (180, R_rose + 10, "W"),
        (225, int(R_rose * 0.70), "NW"),
        (270, R_rose + 18, "N"),
        (315, int(R_rose * 0.70), "NE"),
    ]
    for idx, (deg, p_len, label) in enumerate(pts_angles):
        th = math.radians(deg)
        tip = (int(cx_rose + p_len * math.cos(th)), int(cy_rose + p_len * math.sin(th)))
        th_l = math.radians(deg - 22.5)
        th_r = math.radians(deg + 22.5)
        r_base = int(R_rose * 0.35)
        b_left = (int(cx_rose + r_base * math.cos(th_l)), int(cy_rose + r_base * math.sin(th_l)))
        b_right = (int(cx_rose + r_base * math.cos(th_r)), int(cy_rose + r_base * math.sin(th_r)))

        _pline(canvas, [b_left, tip, b_right], gc, alpha=220, seed=seed + 150 + idx, thick=1)
        _pline(canvas, [tip, (cx_rose, cy_rose)], gc, alpha=180, seed=seed + 160 + idx)

        hatch_half = [(cx_rose, cy_rose), tip, b_right]
        _hatch_polygon(canvas, hatch_half, step=3, angle=deg + 45, gc=gc, alpha=160, seed=seed + 170 + idx)

    fn_x, fn_y = cx_rose, cy_rose - R_rose - 16
    fleur_pts = [
        (fn_x, fn_y - 14),
        (fn_x + 5, fn_y - 4),
        (fn_x + 12, fn_y - 2),
        (fn_x + 8, fn_y + 4),
        (fn_x + 4, fn_y + 3),
        (fn_x, fn_y + 5),
        (fn_x - 4, fn_y + 3),
        (fn_x - 8, fn_y + 4),
        (fn_x - 12, fn_y - 2),
        (fn_x - 5, fn_y - 4),
    ]
    _pline(canvas, fleur_pts, gc, alpha=230, seed=seed + 190, closed=True, thick=1)
    _hatch_polygon(canvas, fleur_pts, step=2, angle=90, gc=gc, alpha=180, seed=seed + 191)

    _pline(canvas, [(cx_rose - 5, cy_rose - R_rose - 24), (cx_rose - 5, cy_rose - R_rose - 38)], gc, alpha=240, seed=seed + 201, thick=2)
    _pline(canvas, [(cx_rose - 5, cy_rose - R_rose - 38), (cx_rose + 5, cy_rose - R_rose - 24)], gc, alpha=240, seed=seed + 202, thick=2)
    _pline(canvas, [(cx_rose + 5, cy_rose - R_rose - 38), (cx_rose + 5, cy_rose - R_rose - 24)], gc, alpha=240, seed=seed + 203, thick=2)
    sy = cy_rose + R_rose + 18
    _pline(canvas, [(cx_rose + 4, sy), (cx_rose - 4, sy + 3), (cx_rose + 4, sy + 9), (cx_rose - 4, sy + 14)], gc, alpha=240, seed=seed + 205, thick=2)
    ex = cx_rose + R_rose + 18
    _pline(canvas, [(ex + 7, cy_rose - 7), (ex, cy_rose - 7), (ex, cy_rose + 7), (ex + 7, cy_rose + 7)], gc, alpha=240, seed=seed + 207, thick=2)
    _pline(canvas, [(ex, cy_rose), (ex + 5, cy_rose)], gc, alpha=240, seed=seed + 208, thick=2)
    wx = cx_rose - R_rose - 18
    _pline(canvas, [(wx - 8, cy_rose - 7), (wx - 4, cy_rose + 7), (wx, cy_rose - 3), (wx + 4, cy_rose + 7), (wx + 8, cy_rose - 7)], gc, alpha=240, seed=seed + 210, thick=2)

    cv2.circle(canvas, (cx_rose, cy_rose), int(R_rose * 1.35), (*gc, 40), 1, cv2.LINE_AA)
    _pline(canvas, [(cx_rose - int(R_rose * 1.45), cy_rose), (cx_rose + int(R_rose * 1.45), cy_rose)], gc, alpha=45, seed=seed + 220)
    _pline(canvas, [(cx_rose, cy_rose - int(R_rose * 1.45)), (cx_rose, cy_rose + int(R_rose * 1.45))], gc, alpha=45, seed=seed + 221)


# -------------------------------------------------------------------------
# HOJA 24B: THE DOCTRINE OF THE MIRROR SPEAKER
# -------------------------------------------------------------------------

def _draw_roman_glyph(canvas, text, cx, cy, h=14, gc=GRAPHITE_COLOR, alpha=200):
    """Draw clean Renaissance hand-drawn Roman numeral glyphs."""
    sh = h // 2
    x = cx
    if text == 'I':
        cv2.line(canvas, (x, cy - sh), (x, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x - 3, cy - sh), (x + 3, cy - sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x - 3, cy + sh), (x + 3, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
    elif text == 'II':
        for dx in (-4, 4):
            cv2.line(canvas, (x + dx, cy - sh), (x + dx, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x - 7, cy - sh), (x + 7, cy - sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x - 7, cy + sh), (x + 7, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
    elif text == 'III':
        for dx in (-6, 0, 6):
            cv2.line(canvas, (x + dx, cy - sh), (x + dx, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x - 9, cy - sh), (x + 9, cy - sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x - 9, cy + sh), (x + 9, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
    elif text == 'IV':
        cv2.line(canvas, (x - 7, cy - sh), (x - 7, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x - 10, cy - sh), (x - 4, cy - sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x - 10, cy + sh), (x - 4, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x, cy - sh), (x + 4, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x + 8, cy - sh), (x + 4, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
    elif text == 'V':
        cv2.line(canvas, (x - 5, cy - sh), (x, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x + 5, cy - sh), (x, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x - 7, cy - sh), (x - 3, cy - sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x + 3, cy - sh), (x + 7, cy - sh), (*gc, alpha), 1, cv2.LINE_AA)
    elif text == 'VI':
        cv2.line(canvas, (x - 6, cy - sh), (x - 2, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x + 2, cy - sh), (x - 2, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x + 6, cy - sh), (x + 6, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x + 3, cy - sh), (x + 9, cy - sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x + 3, cy + sh), (x + 9, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
    elif text == 'VII':
        cv2.line(canvas, (x - 8, cy - sh), (x - 4, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x, cy - sh), (x - 4, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
        for dx in (4, 10):
            cv2.line(canvas, (x + dx, cy - sh), (x + dx, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x + 1, cy - sh), (x + 13, cy - sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x + 1, cy + sh), (x + 13, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
    elif text == 'VIII':
        cv2.line(canvas, (x - 11, cy - sh), (x - 7, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x - 3, cy - sh), (x - 7, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
        for dx in (1, 6, 11):
            cv2.line(canvas, (x + dx, cy - sh), (x + dx, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x - 2, cy - sh), (x + 14, cy - sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x - 2, cy + sh), (x + 14, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
    elif text == 'IX':
        cv2.line(canvas, (x - 6, cy - sh), (x - 6, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x - 9, cy - sh), (x - 3, cy - sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x - 9, cy + sh), (x - 3, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x + 1, cy - sh), (x + 9, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)
        cv2.line(canvas, (x + 9, cy - sh), (x + 1, cy + sh), (*gc, alpha), 1, cv2.LINE_AA)


def draw_proscenium_altar_section(canvas, cx, cy, w=1080, h=520, gc=GRAPHITE_COLOR, seed=24600):
    """
    Calibrated Renaissance architectural section of the Proscenium Altar of the Nine Shards (Turris III).
    Style: Sebastiano Serlio / Nicola Sabbattini / Andrea Palladio.
    Strict vertical envelope: [cy - h//2, cy + h//2].
    """
    hw = w // 2
    hh = h // 2
    top_y = cy - hh
    bot_y = cy + hh

    ground_y = bot_y - 30
    loft_top_y = top_y + 15
    loft_y0 = loft_top_y + 35
    arch_apex_y = loft_y0 + 10

    # 1. Classical Stage Floor & Perspective Grid Lines
    _pline(canvas, [(cx - hw + 20, ground_y), (cx + hw - 20, ground_y)], gc, alpha=230, seed=seed, thick=2)
    _pline(canvas, [(cx - hw + 20, ground_y + 12), (cx + hw - 20, ground_y + 12)], gc, alpha=160, seed=seed + 1)
    _hatch_polygon(canvas, [(cx - hw + 20, ground_y), (cx + hw - 20, ground_y),
                            (cx + hw - 20, ground_y + 12), (cx - hw + 20, ground_y + 12)],
                   step=5, angle=45, gc=gc, alpha=60, seed=seed + 2)

    for px_offset in (-420, -320, -220, -130, 130, 220, 320, 420):
        start_pt = (cx + px_offset, ground_y)
        end_pt = (cx + int(px_offset * 0.35), ground_y - 50)
        _pline(canvas, [start_pt, end_pt], gc, alpha=50, seed=seed + 10 + px_offset)

    # 2. Grand Classical Proscenium Columns & Arch
    col_w = 44
    col_left_x = cx - 360
    col_right_x = cx + 360
    cap_y = ground_y - 230
    arch_spring_y = cap_y - 15

    for col_x in (col_left_x, col_right_x):
        # Pedestal / Plinth
        plinth_w = 58
        plinth_top = ground_y - 45
        p_pts = [
            (col_x - plinth_w // 2, ground_y),
            (col_x - plinth_w // 2, plinth_top),
            (col_x + plinth_w // 2, plinth_top),
            (col_x + plinth_w // 2, ground_y)
        ]
        _pline(canvas, p_pts, gc, alpha=220, seed=seed + 20, closed=True, thick=2)
        _hatch_polygon(canvas, p_pts, step=6, angle=45, gc=gc, alpha=35, seed=seed + 21)

        # Fluted Column Shaft
        _pline(canvas, [(col_x - col_w // 2, plinth_top), (col_x - col_w // 2, cap_y)], gc, alpha=220, seed=seed + 25, thick=2)
        _pline(canvas, [(col_x + col_w // 2, plinth_top), (col_x + col_w // 2, cap_y)], gc, alpha=220, seed=seed + 26, thick=2)
        for fl in (-10, 0, 10):
            _pline(canvas, [(col_x + fl, plinth_top + 8), (col_x + fl, cap_y - 8)], gc, alpha=85, seed=seed + 30 + fl)

        # Capital
        cap_pts = [
            (col_x - col_w // 2 - 8, cap_y),
            (col_x - col_w // 2 - 14, cap_y - 18),
            (col_x + col_w // 2 + 14, cap_y - 18),
            (col_x + col_w // 2 + 8, cap_y)
        ]
        _pline(canvas, cap_pts, gc, alpha=230, seed=seed + 40, closed=True, thick=2)

    # Classical Round Proscenium Arch spanning between columns
    arch_rx = 360
    arch_ry = arch_spring_y - arch_apex_y
    cv2.ellipse(canvas, (int(cx), int(arch_spring_y)), (int(arch_rx - 30), int(arch_ry - 25)),
                0, 180, 360, (*gc, 230), 2, cv2.LINE_AA)
    cv2.ellipse(canvas, (int(cx), int(arch_spring_y)), (int(arch_rx), int(arch_ry)),
                0, 180, 360, (*gc, 230), 2, cv2.LINE_AA)

    # Keystone / Chiave di volta at the apex of the arch
    key_pts = [
        (cx - 18, arch_apex_y + 10),
        (cx - 24, arch_apex_y - 18),
        (cx + 24, arch_apex_y - 18),
        (cx + 18, arch_apex_y + 10)
    ]
    _pline(canvas, key_pts, gc, alpha=240, seed=seed + 50, closed=True, thick=2)
    _hatch_polygon(canvas, key_pts, step=4, angle=45, gc=gc, alpha=50, seed=seed + 51)

    # Voussoir radial joints along the arch
    for a_deg in range(195, 350, 15):
        rad = math.radians(a_deg)
        p_in = (cx + int((arch_rx - 30) * math.cos(rad)), arch_spring_y + int((arch_ry - 25) * math.sin(rad)))
        p_out = (cx + int(arch_rx * math.cos(rad)), arch_spring_y + int(arch_ry * math.sin(rad)))
        _pline(canvas, [p_in, p_out], gc, alpha=130, seed=seed + 60 + a_deg)

    # 3. Upper Fly Loft Rigging & Timber Beams
    _pline(canvas, [(cx - hw + 40, loft_y0), (cx + hw - 40, loft_y0)], gc, alpha=200, seed=seed + 70, thick=2)
    _pline(canvas, [(cx - hw + 40, loft_top_y), (cx + hw - 40, loft_top_y)], gc, alpha=180, seed=seed + 71, thick=2)
    for lx in range(cx - 400, cx + 401, 100):
        _pline(canvas, [(lx, loft_y0), (lx, loft_top_y)], gc, alpha=120, seed=seed + 75 + lx)
        _pline(canvas, [(lx - 35, loft_y0), (lx + 35, loft_top_y)], gc, alpha=70, seed=seed + 80 + lx)

    # Loft Pulleys and ropes
    for pul_x in (cx - 260, cx - 120, cx + 120, cx + 260):
        cv2.circle(canvas, (pul_x, loft_y0 + 10), 8, (*gc, 200), 2, cv2.LINE_AA)
        cv2.circle(canvas, (pul_x, loft_y0 + 10), 2, (*gc, 200), -1, cv2.LINE_AA)
        _pline(canvas, [(pul_x + 8, loft_y0 + 10), (pul_x + 8, ground_y - 80)], gc, alpha=75, seed=seed + 90 + pul_x)

    # 4. Central Stage Altar & The Nine-Sharded Mirror Frame
    altar_w = 240
    altar_top_y = ground_y - 50
    altar_pts = [
        (cx - altar_w // 2 - 20, ground_y),
        (cx - altar_w // 2 - 12, ground_y - 15),
        (cx - altar_w // 2, ground_y - 15),
        (cx - altar_w // 2, altar_top_y),
        (cx + altar_w // 2, altar_top_y),
        (cx + altar_w // 2, ground_y - 15),
        (cx + altar_w // 2 + 12, ground_y - 15),
        (cx + altar_w // 2 + 20, ground_y)
    ]
    _pline(canvas, altar_pts, gc, alpha=235, seed=seed + 100, closed=True, thick=2)
    _hatch_polygon(canvas, altar_pts, step=5, angle=-45, gc=gc, alpha=40, seed=seed + 101)

    tab_base_y = altar_top_y
    tab_w = 150
    tab_h = 175
    mirror_cy = tab_base_y - tab_h // 2 - 8
    
    tab_pts = [
        (cx - tab_w // 2, tab_base_y),
        (cx - tab_w // 2, tab_base_y - tab_h + 60),
        (cx, tab_base_y - tab_h - 12),
        (cx + tab_w // 2, tab_base_y - tab_h + 60),
        (cx + tab_w // 2, tab_base_y)
    ]
    _pline(canvas, tab_pts, gc, alpha=240, seed=seed + 110, closed=True, thick=3)
    _hatch_polygon(canvas, tab_pts, step=5, angle=30, gc=gc, alpha=45, seed=seed + 111)

    # Inner Sharded Mirror Pane (9 shards)
    hub_x = cx
    hub_y = mirror_cy + 8
    m_rw = int(tab_w * 0.40)
    m_rh = int(tab_h * 0.42)

    cv2.ellipse(canvas, (hub_x, hub_y), (m_rw, m_rh), 0, 0, 360, (*gc, 220), 2, cv2.LINE_AA)

    fracture_angles = [20, 60, 100, 140, 180, 220, 260, 305, 345]
    for idx, f_deg in enumerate(fracture_angles):
        rad = math.radians(f_deg)
        rim_pt = (hub_x + int(m_rw * math.cos(rad)), hub_y + int(m_rh * math.sin(rad)))
        mid_pt = (hub_x + int(m_rw * 0.52 * math.cos(rad + 0.08)), hub_y + int(m_rh * 0.52 * math.sin(rad + 0.08)))
        _pline(canvas, [(hub_x, hub_y), mid_pt, rim_pt], gc, alpha=190, seed=seed + 120 + idx, thick=1)

    pts_ix = [
        (hub_x, hub_y),
        (hub_x + int(m_rw * math.cos(math.radians(260))), hub_y + int(m_rh * math.sin(math.radians(260)))),
        (hub_x + int(m_rw * math.cos(math.radians(282))), hub_y + int(m_rh * math.sin(math.radians(282)))),
        (hub_x + int(m_rw * math.cos(math.radians(305))), hub_y + int(m_rh * math.sin(math.radians(305))))
    ]
    _hatch_polygon(canvas, pts_ix, step=4, angle=-45, gc=gc, alpha=70, seed=seed + 130)

    # 5. Celestial Conical Light Beam from Upper Oculus down onto the Mirror
    oculus_y = loft_top_y + 4
    oculus_r = 28
    cv2.ellipse(canvas, (cx, oculus_y), (oculus_r, 8), 0, 0, 360, (*gc, 230), 2, cv2.LINE_AA)

    ray_left = [(cx - oculus_r + 4, oculus_y + 5), (cx - altar_w // 2 - 8, ground_y - 15)]
    ray_right = [(cx + oculus_r - 4, oculus_y + 5), (cx + altar_w // 2 + 8, ground_y - 15)]
    _pline(canvas, ray_left, gc, alpha=130, seed=seed + 150, thick=1)
    _pline(canvas, ray_right, gc, alpha=130, seed=seed + 151, thick=1)

    light_cone_pts = [
        (cx - oculus_r + 4, oculus_y + 5),
        (cx + oculus_r - 4, oculus_y + 5),
        (cx + altar_w // 2 + 8, ground_y - 15),
        (cx - altar_w // 2 - 8, ground_y - 15)
    ]
    _hatch_polygon(canvas, light_cone_pts, step=8, angle=80, gc=gc, alpha=22, seed=seed + 155)

    # 6. Nine Station Badges
    wing_left_x = cx - 440
    wing_right_x = cx + 440
    left_numerals = ['I', 'II', 'III', 'IV']
    right_numerals = ['V', 'VI', 'VII', 'VIII']

    for i, num in enumerate(left_numerals):
        sy = ground_y - 210 + i * 55
        _pline(canvas, [(wing_left_x - 26, sy - 12), (wing_left_x + 26, sy - 12),
                        (wing_left_x + 26, sy + 12), (wing_left_x - 26, sy + 12)],
               gc, alpha=150, seed=seed + 160 + i, closed=True)
        _draw_roman_glyph(canvas, num, wing_left_x, sy, h=12, gc=gc, alpha=190)

    for i, num in enumerate(right_numerals):
        sy = ground_y - 210 + i * 55
        _pline(canvas, [(wing_right_x - 26, sy - 12), (wing_right_x + 26, sy - 12),
                        (wing_right_x + 26, sy + 12), (wing_right_x - 26, sy + 12)],
               gc, alpha=150, seed=seed + 180 + i, closed=True)
        _draw_roman_glyph(canvas, num, wing_right_x, sy, h=12, gc=gc, alpha=190)

    # Architectural Scale Bar
    scale_y = ground_y + 18
    scale_hw = 110
    _pline(canvas, [(cx - scale_hw, scale_y), (cx + scale_hw, scale_y)], gc, alpha=180, seed=seed + 200, thick=1)
    for tick_x in (-scale_hw, -scale_hw // 2, 0, scale_hw // 2, scale_hw):
        _pline(canvas, [(cx + tick_x, scale_y - 3), (cx + tick_x, scale_y + 3)], gc, alpha=180, seed=seed + 205 + tick_x)


def draw_doctrine_baroque_mirror(canvas, cx, cy, w=760, h=440, gc=GRAPHITE_COLOR, seed=24300):
    """Grand Venetian baroque pier glass with acanthus crest and convex mirror."""
    # Outer baroque scrolled frame
    mx, my = cx, cy - 20
    fw, fh = 460, 360
    frame_pts = [
        (mx - fw // 2, my + fh // 2),
        (mx - fw // 2 + 20, my - fh // 2 + 60),
        (mx - fw * 0.35, my - fh // 2 + 15),
        (mx, my - fh // 2 - 35),   # Top acanthus crest apex
        (mx + fw * 0.35, my - fh // 2 + 15),
        (mx + fw // 2 - 20, my - fh // 2 + 60),
        (mx + fw // 2, my + fh // 2),
        (mx + fw * 0.4, my + fh // 2 + 25),
        (mx - fw * 0.4, my + fh // 2 + 25),
    ]
    _pline(canvas, frame_pts, gc, alpha=230, seed=seed, closed=True, thick=2)
    _hatch_polygon(canvas, frame_pts, step=6, angle=45, gc=gc, alpha=45, seed=seed + 1)

    # Inner glass boundary
    cv2.ellipse(canvas, (int(mx), int(my)), (int(fw * 0.38), int(fh * 0.40)), 0, 0, 360, (*gc, 220), 2, cv2.LINE_AA)

    # Convex mirror reflection lines (curved distorted grid)
    for g in (-2, -1, 0, 1, 2):
        gx = mx + g * 42
        curve_v = [(gx + 14 * math.sin(math.pi * i / 20) * (g / 2.0), my - 110 + i * 11) for i in range(21)]
        _pline(canvas, curve_v, gc, alpha=75, seed=seed + 10 + g, passes=1)
        gy = my + g * 35
        curve_h = [(mx - 130 + i * 13, gy + 12 * math.cos(math.pi * (i - 10) / 20) * (g / 2.0)) for i in range(21)]
        _pline(canvas, curve_h, gc, alpha=75, seed=seed + 20 + g, passes=1)

    # Optical Caustic Reflection Rays fanning out from frame
    for r in range(12):
        ang = math.pi * 0.2 + math.pi * 0.6 * (r / 12)
        r_start = (mx + (fw * 0.42) * math.cos(ang), my + (fh * 0.44) * math.sin(ang))
        r_end = (mx + (fw * 0.68) * math.cos(ang), my + (fh * 0.70) * math.sin(ang))
        _pline(canvas, [r_start, r_end], gc, alpha=90, seed=seed + 40 + r, passes=1)


# -------------------------------------------------------------------------
# HOJA 25A: THE KALEIDOSCOPE LANTERN
# -------------------------------------------------------------------------

def draw_kaleidoscope_optics_engine(canvas, cx, cy, w=820, h=400, gc=GRAPHITE_COLOR, seed=25100):
    """Keplerian triangular quartz prisms and ray-tracing geometry."""
    # Central equilateral quartz prism
    pr_r = 130
    prism_pts = [(cx + pr_r * math.cos(-math.pi / 2 + 2 * math.pi * i / 3),
                  cy + pr_r * math.sin(-math.pi / 2 + 2 * math.pi * i / 3)) for i in range(3)]
    _pline(canvas, prism_pts, gc, alpha=240, seed=seed, closed=True, thick=3)
    _hatch_polygon(canvas, prism_pts, step=6, angle=-30, gc=gc, alpha=35, seed=seed + 1)

    # Concentric Faceted Brass Housing (Octagonal frame)
    oct_r = 190
    oct_pts = [(cx + oct_r * math.cos(2 * math.pi * i / 8), cy + oct_r * math.sin(2 * math.pi * i / 8)) for i in range(8)]
    _pline(canvas, oct_pts, gc, alpha=220, seed=seed + 10, closed=True, thick=2)

    # Dial vernier graduations around frame
    for d in range(32):
        a = 2 * math.pi * d / 32
        p0 = (cx + (oct_r + 4) * math.cos(a), cy + (oct_r + 4) * math.sin(a))
        p1 = (cx + (oct_r + 18) * math.cos(a), cy + (oct_r + 18) * math.sin(a))
        _pline(canvas, [p0, p1], gc, alpha=160, seed=seed + 20 + d, thick=1)

    # Incoming White Light Ray & Refracted Dispersed Spectrum Rays
    ray_in = [(cx - w * 0.42, cy + 40), (cx - pr_r * 0.5, cy + 20)]
    _pline(canvas, ray_in, gc, alpha=230, seed=seed + 40, thick=2)

    # Dispersed rays exiting prism toward right dial
    for s_idx, angle in enumerate((-18, -9, 0, 9, 18)):
        rad = math.radians(angle)
        ray_out = [(cx + pr_r * 0.4, cy + 10), (cx + w * 0.42, cy - 40 + s_idx * 28)]
        _pline(canvas, ray_out, gc, alpha=185, seed=seed + 50 + s_idx, thick=1)


# -------------------------------------------------------------------------
# HOJA 25B: AURELIA'S SKETCHBOOK III · THE TERRACE UNDER THE STARS
# -------------------------------------------------------------------------

def draw_terrace_night_panorama(canvas, cx, cy, w=840, h=420, gc=GRAPHITE_COLOR, seed=25300):
    """Night landscape with classical balustrade, alpine peaks and starry sky."""
    # 1. Classical Stone Balustrade (Foreground bottom)
    bal_y = cy + h // 2 - 70
    # Top handrail
    rail = [(cx - w // 2 + 20, bal_y - 16), (cx + w // 2 - 20, bal_y - 16),
            (cx + w // 2 - 20, bal_y + 10), (cx - w // 2 + 20, bal_y + 10)]
    _pline(canvas, rail, gc, alpha=230, seed=seed, closed=True, thick=2)
    _hatch_polygon(canvas, rail, step=6, angle=0, gc=gc, alpha=50, seed=seed + 1)

    # Spindles / Balusters
    spindles = 12
    sp_w = (w - 80) / spindles
    for s in range(spindles):
        bx = cx - w // 2 + 50 + s * sp_w
        by = bal_y + 10
        sp_pts = [
            (bx - 10, by), (bx + 10, by),
            (bx + 6, by + 18), (bx + 14, by + 32), (bx + 6, by + 46),
            (bx + 10, by + 65), (bx - 10, by + 65),
            (bx - 6, by + 46), (bx - 14, by + 32), (bx - 6, by + 18)
        ]
        _pline(canvas, sp_pts, gc, alpha=210, seed=seed + 10 + s, closed=True, thick=1)
        _hatch_polygon(canvas, sp_pts, step=4, angle=75, gc=gc, alpha=40, seed=seed + 20 + s)

    # 2. Alpine Mountain Silhouette in Background
    peaks = [
        (cx - w // 2 + 20, bal_y - 16),
        (cx - w * 0.38, cy + 20),
        (cx - w * 0.22, cy - 60),
        (cx - w * 0.08, cy + 10),
        (cx + w * 0.06, cy - 90),   # Highest peak
        (cx + w * 0.24, cy - 20),
        (cx + w * 0.38, cy - 70),
        (cx + w // 2 - 20, cy + 15),
        (cx + w // 2 - 20, bal_y - 16),
    ]
    _pline(canvas, peaks, gc, alpha=220, seed=seed + 40, closed=True, thick=2)
    _hatch_polygon(canvas, peaks, step=7, angle=40, gc=gc, alpha=35, seed=seed + 41)

    # Winding mountain pass road with tiny torch pinpoints
    road = [(cx + 20 + i * 22, cy + 40 - i * 9 + 4 * math.sin(i)) for i in range(12)]
    _pline(canvas, road, gc, alpha=150, seed=seed + 50)
    for torch in (2, 5, 8, 10):
        tx, ty = road[torch]
        cv2.circle(canvas, (int(tx), int(ty - 4)), 3, (*gc, 230), -1, cv2.LINE_AA)

    # 3. Night Sky with Crescent Moon and Star Field
    moon_x, moon_y = cx - w * 0.32, cy - h * 0.32
    m_outer = [(moon_x + 28 * math.cos(t), moon_y + 28 * math.sin(t)) for t in np.linspace(-math.pi / 2, math.pi / 2, 20)]
    m_inner = [(moon_x + 14 + 22 * math.cos(t), moon_y + 28 * math.sin(t)) for t in np.linspace(math.pi / 2, -math.pi / 2, 20)]
    _pline(canvas, m_outer + m_inner, gc, alpha=235, seed=seed + 60, closed=True, thick=2)
    _hatch_polygon(canvas, m_outer + m_inner, step=3, angle=30, gc=gc, alpha=140, seed=seed + 61)

    # Stars (cross pinpoints)
    star_coords = [(-120, -140), (-40, -160), (40, -130), (120, -170), (220, -120), (280, -150)]
    for idx, (st_x, st_y) in enumerate(star_coords):
        sx, sy = cx + st_x, cy + st_y
        _pline(canvas, [(sx - 6, sy), (sx + 6, sy)], gc, alpha=200, seed=seed + 70 + idx)
        _pline(canvas, [(sx, sy - 6), (sx, sy + 6)], gc, alpha=200, seed=seed + 80 + idx)


# -------------------------------------------------------------------------
# HOJA 26A: THE STAGE OF THE MIRROR SPEAKER (WHERE · WIENER STAATSOPER)
# -------------------------------------------------------------------------

def draw_mirror_climax_vienna_facade(canvas, cx, cy, w=840, h=420, gc=GRAPHITE_COLOR, seed=26100):
    """Completed mirror showing the grand Renaissance facade of Wiener Staatsoper."""
    # Grand Arched Venetian Mirror Frame
    fx0, fy0 = cx - w // 2 + 40, cy - h // 2 + 15
    fx1, fy1 = cx + w // 2 - 40, cy + h // 2 - 15
    arch_pts = [(cx + (w // 2 - 40) * math.cos(math.pi + math.pi * i / 32),
                 fy0 + 120 + 120 * math.sin(math.pi + math.pi * i / 32)) for i in range(33)]
    mirror_border = arch_pts + [(fx1, fy1), (fx0, fy1)]
    _pline(canvas, mirror_border, gc, alpha=240, seed=seed, closed=True, thick=3)

    # Healed Kintsugi Gold/Pencil Crack Lines converging on impact point
    for k in range(9):
        ang = math.radians(stage_mirror.CRACK_DEG[k])
        c_end = (cx + 260 * math.cos(ang), cy + 180 * math.sin(ang))
        _pline(canvas, [(cx, cy), c_end], gc, alpha=160, seed=seed + 10 + k, passes=1, wob=0.8)

    # Facade of Wiener Staatsoper reflected in the center
    # Two-tiered renaissance loggia
    loggia_w, loggia_h = 420, 190
    lx0, ly0 = cx - loggia_w // 2, cy - loggia_h // 2 + 25
    lx1, ly1 = cx + loggia_w // 2, cy + loggia_h // 2 + 25

    # Main Cornice & Roofline
    _pline(canvas, [(lx0 - 20, ly0), (lx1 + 20, ly0)], gc, alpha=230, seed=seed + 30, thick=3)
    _pline(canvas, [(lx0 - 15, ly0 + 15), (lx1 + 15, ly0 + 15)], gc, alpha=210, seed=seed + 31, thick=2)

    # 5 Arched Bays of upper loggia
    bays = 5
    bw = loggia_w / bays
    for b in range(bays):
        bx_c = lx0 + b * bw + bw / 2
        arch = [(bx_c + bw * 0.38 * math.cos(math.pi + math.pi * i / 16),
                 ly0 + 55 + bw * 0.38 * math.sin(math.pi + math.pi * i / 16)) for i in range(17)]
        arch += [(bx_c + bw * 0.38, ly0 + 95), (bx_c - bw * 0.38, ly0 + 95)]
        _pline(canvas, arch, gc, alpha=220, seed=seed + 40 + b, closed=True, thick=2)
        _hatch_polygon(canvas, arch, step=4, angle=65, gc=gc, alpha=45, seed=seed + 50 + b)

    # Ground level rusticated arcade
    _pline(canvas, [(lx0 - 15, ly0 + 105), (lx1 + 15, ly0 + 105)], gc, alpha=225, seed=seed + 60, thick=2)
    for b in range(bays):
        bx_c = lx0 + b * bw + bw / 2
        arcade = [(bx_c + bw * 0.34 * math.cos(math.pi + math.pi * i / 16),
                   ly0 + 145 + bw * 0.34 * math.sin(math.pi + math.pi * i / 16)) for i in range(17)]
        arcade += [(bx_c + bw * 0.34, ly1), (bx_c - bw * 0.34, ly1)]
        _pline(canvas, arcade, gc, alpha=215, seed=seed + 70 + b, closed=True, thick=2)
        _hatch_polygon(canvas, arcade, step=3, angle=-45, gc=gc, alpha=60, seed=seed + 80 + b)

    # Equestrian Statues on roof pedestals (Left and Right wings)
    for sgn in (-1, 1):
        st_x = cx + sgn * (loggia_w * 0.44)
        statue = [(st_x, ly0 - 6), (st_x + sgn * 12, ly0 - 24), (st_x + sgn * 24, ly0 - 38), (st_x, ly0 - 20)]
        _pline(canvas, statue, gc, alpha=230, seed=seed + 90 + sgn, closed=True, thick=2)


# -------------------------------------------------------------------------
# HOJA 26B: BACK TO THE PEAKS
# -------------------------------------------------------------------------

def draw_back_to_peaks_transition(canvas, cx, cy, w=840, h=420, gc=GRAPHITE_COLOR, seed=26300):
    """Grand arched carriage portal, carrier dove taking flight & alpine map."""
    # Grand Arched Stone Gateway
    gx0, gy0 = cx - w // 2 + 40, cy - h // 2 + 20
    gw, gh = w - 80, h - 40
    # Outer arch ring
    arch_top = [(cx + (gw // 2) * math.cos(math.pi + math.pi * i / 36),
                 gy0 + 140 + 140 * math.sin(math.pi + math.pi * i / 36)) for i in range(37)]
    gateway = arch_top + [(cx + gw // 2, gy0 + gh), (cx - gw // 2, gy0 + gh)]
    _pline(canvas, gateway, gc, alpha=235, seed=seed, closed=True, thick=3)

    # Masonry voussoirs along arch
    for v in range(19):
        a = math.pi + math.pi * v / 18
        p0 = (cx + (gw // 2 - 24) * math.cos(a), gy0 + 140 + 116 * math.sin(a))
        p1 = (cx + (gw // 2) * math.cos(a), gy0 + 140 + 140 * math.sin(a))
        _pline(canvas, [p0, p1], gc, alpha=180, seed=seed + 10 + v, thick=1)

    # Distant peaks framed through the portal
    portal_peaks = [
        (cx - gw * 0.38, gy0 + 260),
        (cx - gw * 0.18, gy0 + 160),
        (cx + gw * 0.05, gy0 + 120),
        (cx + gw * 0.28, gy0 + 190),
        (cx + gw * 0.38, gy0 + 260),
    ]
    _pline(canvas, portal_peaks, gc, alpha=175, seed=seed + 30, thick=2)
    _hatch_polygon(canvas, portal_peaks, step=6, angle=45, gc=gc, alpha=30, seed=seed + 31)

    # Carrier Dove Taking Flight toward the north (Apex of gateway)
    dx, dy = cx, gy0 + 75
    # Wings spread upward
    left_wing = [(dx, dy), (dx - 22, dy - 18), (dx - 48, dy - 34), (dx - 32, dy - 8), (dx, dy)]
    right_wing = [(dx, dy), (dx + 22, dy - 18), (dx + 48, dy - 34), (dx + 32, dy - 8), (dx, dy)]
    _pline(canvas, left_wing, gc, alpha=235, seed=seed + 50, closed=True, thick=2)
    _pline(canvas, right_wing, gc, alpha=235, seed=seed + 51, closed=True, thick=2)
    _hatch_polygon(canvas, left_wing, step=3, angle=-30, gc=gc, alpha=120, seed=seed + 52)
    _hatch_polygon(canvas, right_wing, step=3, angle=30, gc=gc, alpha=120, seed=seed + 53)
    # Body and tail
    body = [(dx, dy - 12), (dx + 6, dy + 18), (dx, dy + 28), (dx - 6, dy + 18)]
    _pline(canvas, body, gc, alpha=240, seed=seed + 55, closed=True, thick=2)

    # Travel trunk & astrolabe case in gateway foreground
    case_x, case_y = cx - 180, gy0 + gh - 40
    case_box = [
        (case_x - 55, case_y - 35),
        (case_x + 55, case_y - 35),
        (case_x + 55, case_y + 35),
        (case_x - 55, case_y + 35),
    ]
    _pline(canvas, case_box, gc, alpha=220, seed=seed + 70, closed=True, thick=2)
    _hatch_polygon(canvas, case_box, step=5, angle=65, gc=gc, alpha=50, seed=seed + 71)
    # Brass straps and corner reinforcements
    _pline(canvas, [(case_x - 25, case_y - 35), (case_x - 25, case_y + 35)], gc, alpha=240, seed=seed + 75, thick=2)
    _pline(canvas, [(case_x + 25, case_y - 35), (case_x + 25, case_y + 35)], gc, alpha=240, seed=seed + 76, thick=2)

    # Compass Rose pointing North (Right foreground)
    cmp_x, cmp_y = cx + 220, gy0 + gh - 35
    cmp_r = 38
    cv2.circle(canvas, (int(cmp_x), int(cmp_y)), cmp_r, (*gc, 210), 1, cv2.LINE_AA)
    # North pointer
    n_ptr = [(cmp_x, cmp_y - cmp_r - 8), (cmp_x + 8, cmp_y), (cmp_x, cmp_y + 6), (cmp_x - 8, cmp_y)]
    _pline(canvas, n_ptr, gc, alpha=235, seed=seed + 80, closed=True, thick=2)
    _hatch_polygon(canvas, [(cmp_x, cmp_y - cmp_r - 8), (cmp_x + 8, cmp_y), (cmp_x, cmp_y)], step=2, angle=45, gc=gc, alpha=160, seed=seed + 81)


def draw_vienna_astrometric_quadrant(canvas, cx, cy, r=140, gc=GRAPHITE_COLOR, seed=26800):
    """Draws an authentic Renaissance astrometric quadrant & celestial meridian chart for Vienna (48° 12' N)."""
    # 1. Concentric astronomical circles
    for rad, passes in [(r, 3), (r - 10, 2), (r - 24, 1), (r - 55, 1), (r - 95, 1)]:
        pts = [(cx + rad * math.cos(a), cy + rad * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 120)]
        for i in range(len(pts) - 1):
            _pline(canvas, [pts[i], pts[i+1]], gc, alpha=210, seed=seed + int(rad) + i, passes=passes)

    # 2. Quadrant arc lines (Meridian & Equator)
    _pline(canvas, [(cx - r - 8, cy), (cx + r + 8, cy)], gc, alpha=220, seed=seed + 1, passes=2)
    _pline(canvas, [(cx, cy + r + 8), (cx, cy - r - 20)], gc, alpha=230, seed=seed + 2, passes=3)

    # 3. Degree graduations on outer rim
    for deg in range(0, 360, 5):
        rad = math.radians(deg)
        t_len = 14 if deg % 15 == 0 else 7
        p1 = (cx + (r - 10) * math.cos(rad), cy + (r - 10) * math.sin(rad))
        p2 = (cx + (r - 10 + t_len) * math.cos(rad), cy + (r - 10 + t_len) * math.sin(rad))
        alpha = 240 if deg % 15 == 0 else 140
        _pline(canvas, [p1, p2], gc, alpha=alpha, seed=seed + 100 + deg, passes=1)

    # 4. Prominent Vienna Latitude Sighting Ray (48° 12' North of East / Zenith)
    v_ang = math.radians(-48.2)
    p_vienna = (cx + (r + 22) * math.cos(v_ang), cy + (r + 22) * math.sin(v_ang))
    _pline(canvas, [(cx, cy), p_vienna], gc, alpha=245, seed=seed + 500, passes=3)

    tip_x, tip_y = p_vienna
    for da in [-0.25, 0.25]:
        ax = tip_x - 14 * math.cos(v_ang + da)
        ay = tip_y - 14 * math.sin(v_ang + da)
        _pline(canvas, [(tip_x, tip_y), (ax, ay)], gc, alpha=240, seed=seed + 510, passes=2)

    # 5. Stereographic Almucantar arcs
    for offset_y in [28, 60, 95]:
        arc_pts = [(cx + x_t, cy - offset_y - 14 * math.cos(x_t / r * math.pi / 2)) for x_t in np.linspace(-r + 12, r - 12, 40)]
        for i in range(len(arc_pts) - 1):
            _pline(canvas, [arc_pts[i], arc_pts[i+1]], gc, alpha=120, seed=seed + 600 + offset_y + i, passes=1)

    # 6. Central Sacred Eclipse Pivot (◐)
    cv2.circle(canvas, (int(cx), int(cy)), 14, (*gc, 230), 2, cv2.LINE_AA)
    cv2.ellipse(canvas, (int(cx), int(cy)), (14, 14), 0, 90, 270, (*gc, 230), -1, cv2.LINE_AA)

    # 7. Northern Cardinal Arrow at top
    cv2.putText(canvas, 'N', (int(cx - 7), int(cy - r - 22)), cv2.FONT_HERSHEY_TRIPLEX, 0.55, (*gc, 240), 1, cv2.LINE_AA)


def draw_scroll_banner(canvas, cx, cy, text, font_size=26, pad_x=22, h=36, gc=GRAPHITE_COLOR, seed=1, min_x=248, max_x=1478):
    """Draws a masterwork Renaissance filacteria / scroll banner with smart width, ribbon folds, and clean masking."""
    t_img, _ = render_pencil_text(text, FONT_PATH, font_size=font_size, gc=gc, seed=seed + 10)
    if t_img is None:
        return

    tw, th = t_img.shape[1], t_img.shape[0]
    w = tw + pad_x * 2
    bh = max(h, th + 12)
    rw = int(bh * 0.44)

    # Clamp cx so that the entire banner (including ribbon folds rw) stays strictly within [min_x, max_x]
    half_total = w // 2 + rw + 2
    if cx - half_total < min_x:
        cx = min_x + half_total
    elif cx + half_total > max_x:
        cx = max_x - half_total

    bx0, by0 = cx - w // 2, cy - bh // 2
    bx1, by1 = cx + w // 2, cy + bh // 2

    # 1. Left ribbon fold behind
    l_fold = [(bx0, by0), (bx0 - rw, by0 + 5), (bx0 - rw + 6, by0 + bh // 2), (bx0 - rw, by1 - 5), (bx0, by1)]
    _pline(canvas, l_fold, gc, alpha=190, seed=seed, closed=True, thick=1)
    _hatch_polygon(canvas, l_fold, step=3, angle=45, gc=gc, alpha=75, seed=seed + 1)

    # 2. Right ribbon fold behind
    r_fold = [(bx1, by0), (bx1 + rw, by0 + 5), (bx1 + rw - 6, by0 + bh // 2), (bx1 + rw, by1 - 5), (bx1, by1)]
    _pline(canvas, r_fold, gc, alpha=190, seed=seed + 2, closed=True, thick=1)
    _hatch_polygon(canvas, r_fold, step=3, angle=-45, gc=gc, alpha=75, seed=seed + 3)

    # 3. Main parchment body
    body_pts = [(bx0, by0), (bx1, by0), (bx1, by1), (bx0, by1)]

    # Mask out background strokes behind body so paper shines through cleanly
    mask = np.zeros(canvas.shape[:2], dtype=np.uint8)
    cv2.fillPoly(mask, [np.array(body_pts, dtype=np.int32)], 255)
    canvas[mask == 255] = 0

    # Double neatline for body
    _pline(canvas, body_pts, gc, alpha=235, seed=seed + 4, closed=True, thick=2)
    _pline(canvas, [(bx0 + 4, by0 + 3), (bx1 - 4, by0 + 3), (bx1 - 4, by1 - 3), (bx0 + 4, by1 - 3)], gc, alpha=150, seed=seed + 5, closed=True, thick=1)

    # 4. Text inside banner
    tx = cx - tw // 2
    ty = cy - th // 2
    blit_rgba(canvas, t_img, tx, ty)


def _make_soft_box_mask(h: int, w: int, top: int = 80, bottom: int = 80, left: int = 80, right: int = 80) -> np.ndarray:
    """Creates a 2D cosine-feathered mask (H, W) in [0, 1] with zero hard rectangular edges."""
    y = np.arange(h, dtype=np.float32)
    x = np.arange(w, dtype=np.float32)
    my = np.ones(h, dtype=np.float32)
    mx = np.ones(w, dtype=np.float32)

    if top > 0:
        t_idx = y < top
        my[t_idx] = 0.5 * (1.0 - np.cos(np.pi * y[t_idx] / float(top)))
    if bottom > 0:
        b_idx = y > (h - 1 - bottom)
        my[b_idx] = np.minimum(my[b_idx], 0.5 * (1.0 - np.cos(np.pi * (h - 1 - y[b_idx]) / float(bottom))))
    if left > 0:
        l_idx = x < left
        mx[l_idx] = 0.5 * (1.0 - np.cos(np.pi * x[l_idx] / float(left)))
    if right > 0:
        r_idx = x > (w - 1 - right)
        mx[r_idx] = np.minimum(mx[r_idx], 0.5 * (1.0 - np.cos(np.pi * (w - 1 - x[r_idx]) / float(right))))

    return np.outer(my, mx)


def _make_ellipse_mask(h: int, w: int, cx: float, cy: float, rx: float, ry: float, feather: float = 0.25) -> np.ndarray:
    """Creates a smooth elliptical radial mask centered at (cx, cy) with radii (rx, ry)."""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    dist = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
    inner = 1.0 - feather
    mask = np.ones((h, w), dtype=np.float32)
    trans = (dist > inner) & (dist < 1.0)
    mask[trans] = 0.5 * (1.0 + np.cos(np.pi * (dist[trans] - inner) / feather))
    mask[dist >= 1.0] = 0.0
    return mask


def _load_graphite_asset(rel_path: str, gain: float = 1.0, gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Loads an RGBA asset from the repository and normalizes its pigment to GRAPHITE_COLOR."""
    full_path = os.path.join(PROJECT_ROOT, rel_path)
    im = cv2.imread(full_path, cv2.IMREAD_UNCHANGED)
    if im is None:
        raise FileNotFoundError(f"Missing required asset: {full_path}")
    rgba = im.copy()
    rgba[:, :, 0] = gc[0]
    rgba[:, :, 1] = gc[1]
    rgba[:, :, 2] = gc[2]
    if gain != 1.0:
        rgba[:, :, 3] = np.clip(rgba[:, :, 3].astype(np.float32) * gain, 0, 255).astype(np.uint8)
    return rgba


def _blit_feathered(
    canvas: np.ndarray,
    src_rgba: np.ndarray,
    x: int,
    y: int,
    target_w: int = None,
    target_h: int = None,
    feather_margins: tuple = (80, 80, 80, 80),
    ellipse_params: tuple = None,
    alpha_scale: float = 1.0,
    flip_x: bool = False
):
    """Resizes, applies smooth organic feathering (box and/or elliptical), and blits onto canvas."""
    img = src_rgba.copy()
    if flip_x:
        img = cv2.flip(img, 1)
    if target_w is not None and target_h is not None:
        img = cv2.resize(img, (target_w, target_h), interpolation=cv2.INTER_AREA)
    elif target_w is not None:
        th = int(round(img.shape[0] * (target_w / float(img.shape[1]))))
        img = cv2.resize(img, (target_w, th), interpolation=cv2.INTER_AREA)
    elif target_h is not None:
        tw = int(round(img.shape[1] * (target_h / float(img.shape[0]))))
        img = cv2.resize(img, (tw, target_h), interpolation=cv2.INTER_AREA)

    h, w = img.shape[:2]
    mask = np.ones((h, w), dtype=np.float32)
    if feather_margins is not None:
        top, bot, left, right = feather_margins
        mask *= _make_soft_box_mask(h, w, top, bot, left, right)
    if ellipse_params is not None:
        ecx, ecy, erx, ery, efeath = ellipse_params
        mask *= _make_ellipse_mask(h, w, ecx * w, ecy * h, erx * w, ery * h, efeath)

    img[:, :, 3] = np.clip(img[:, :, 3].astype(np.float32) * mask * alpha_scale, 0, 255).astype(np.uint8)
    blit_rgba(canvas, img, int(x), int(y))


def _blit_integrated_calligraphy(
    canvas: np.ndarray,
    text: str,
    cx: int,
    cy: int,
    font_size: int = 27,
    gc: tuple = (28, 25, 22),
    seed: int = 1,
    halo_strength: float = 0.65,
    underline: bool = False
):
    """Renders Fondamento calligraphy integrated directly into the drawing with a soft glyph-contour halo (zero rectangular boxes)."""
    t_img, _ = render_pencil_text(text, FONT_PATH, font_size=font_size, gc=gc, seed=seed)
    if t_img is None:
        return
    th, tw = t_img.shape[:2]
    px = max(155, min(1555 - tw, int(cx - tw // 2)))
    py = max(645, min(2370 - th, int(cy)))

    pad = 22
    y0, y1 = max(0, py - pad), min(canvas.shape[0], py + th + pad)
    x0, x1 = max(0, px - pad), min(canvas.shape[1], px + tw + pad)

    glyph_mask = np.zeros((y1 - y0, x1 - x0), dtype=np.float32)
    gy0 = py - y0
    gx0 = px - x0
    gy1 = min(y1 - y0, gy0 + th)
    gx1 = min(x1 - x0, gx0 + tw)
    glyph_mask[gy0:gy1, gx0:gx1] = t_img[:(gy1 - gy0), :(gx1 - gx0), 3].astype(np.float32) / 255.0

    k_dil = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (17, 11))
    halo = cv2.dilate(glyph_mask, k_dil, iterations=1)
    halo = cv2.GaussianBlur(halo, (35, 25), 0)
    halo = np.clip(halo * 1.40, 0.0, 1.0)

    atten = 1.0 - halo_strength * halo
    canvas[y0:y1, x0:x1, 3] = (canvas[y0:y1, x0:x1, 3].astype(np.float32) * atten).astype(np.uint8)

    t_strong = t_img.copy()
    t_strong[:, :, 3] = np.clip(t_strong[:, :, 3].astype(np.float32) * 1.38, 0, 255).astype(np.uint8)
    blit_rgba(canvas, t_strong, px, py)

    if underline:
        ul_y = py + th + 2
        _pline(canvas, [(px + 10, ul_y), (px + tw - 10, ul_y)], gc=gc, alpha=175, seed=seed + 77, passes=1, thick=1)


def draw_grand_expedition_map(canvas, cx, cy, w=1260, h=1700, gc=GRAPHITE_COLOR, seed=26850):
    """
    Draws the full-bleed continuous Da Vinci landscape & Armillary Sphere convergence (Option 2):
    'El Desfiladero de las Cumbres y la Rueda Zodiacal del Cielo'.
    Unites Tower I (The Alpine Observatory & Chasm Pass Expedition), Tower II (The Sandstone Sanctuary
    & Sentinel Canyon), and Tower III (The Stage Tower Amphitheatre & Proscenium) around the 3D Armillary
    Sphere & Celestial Zodiac Wheel at the Vault of the Grand Eclipse.
    """
    dark_ink = (28, 25, 22)

    # Load permanent repository RGBA plates
    alpine_bg = _load_graphite_asset("journal/page26/assets/davinci_alpine_panorama_bg_alpha.png", gain=1.0, gc=gc)
    terrace_chasm = _load_graphite_asset("journal/page26/assets/davinci_terrace_chasm_ascent_alpha.png", gain=1.0, gc=gc)
    stage_monumental = _load_graphite_asset("journal/page26/assets/davinci_stage_monumental_departure_alpha.png", gain=1.0, gc=gc)
    carrier_dove = _load_graphite_asset("journal/page26/assets/davinci_carrier_dove_clean_alpha.png", gain=1.0, gc=gc)
    desert_frontier = _load_graphite_asset("journal/page05/assets/desert_frontier_master_alpha.png", gain=1.18, gc=gc)
    cairn_iv_canyon = _load_graphite_asset("journal/page15/assets/davinci_cairn_iv_panorama_clean_alpha.png", gain=1.18, gc=gc)
    compass_rose = _load_graphite_asset("journal/page01/assets/compass_master_alpha.png", gain=1.25, gc=gc)

    p18b = _load_graphite_asset("journal/page18/assets/davinci_stage_transition_abstract_alpha.png", gain=1.28, gc=gc)
    armillary_3d = p18b[48:636, 535:1215].copy()
    armillary_3d[:18, 180:500, 3] = 0

    # 1. BACKGROUND ALPINE RIDGES & SKY (Y=690..1440)
    _blit_feathered(
        canvas, alpine_bg,
        x=145, y=690, target_w=1420, target_h=750,
        feather_margins=(75, 190, 95, 95),
        alpha_scale=0.82
    )

    # 2. HIGH NORTHERN SUMMIT & CHASM PASS EXPEDITION: Terrace Chasm (Y=715..1615)
    t1_vertical = terrace_chasm[55:1080, 55:760].copy()
    _blit_feathered(
        canvas, t1_vertical,
        x=cx - 495, y=715, target_w=820, target_h=900,
        feather_margins=(50, 180, 120, 130),
        ellipse_params=(0.55, 0.48, 0.48, 0.49, 0.28),
        alpha_scale=1.18
    )

    # 3. GRAND CELESTIAL ZODIAC & ASTROLABE WHEEL IN THE CENTRAL FIRMAMENT
    zodiac_wheel_only = desert_frontier[0:520, 50:740].copy()
    _blit_feathered(
        canvas, zodiac_wheel_only,
        x=cx - 450, y=1020, target_w=900, target_h=680,
        feather_margins=(80, 110, 110, 110),
        ellipse_params=(0.50, 0.48, 0.48, 0.48, 0.26),
        alpha_scale=0.95
    )

    # 4. SOUTH-WEST REGION (LEFT): Cairn IV Sentinel Canyon & Distant Solstice Arch (Tower II Approach)
    canyon_crop = cairn_iv_canyon[20:768, 10:1220].copy()
    _blit_feathered(
        canvas, canyon_crop,
        x=140, y=1440, target_w=760, target_h=650,
        feather_margins=(115, 85, 70, 155),
        ellipse_params=(0.48, 0.52, 0.50, 0.49, 0.25),
        alpha_scale=1.12
    )

    # 5. SOUTH-EAST REGION (RIGHT): Monumental Stage Tower Amphitheatre, Proscenium & Hermes/Aurelia (Tower III)
    _blit_feathered(
        canvas, stage_monumental,
        x=700, y=1460, target_w=865, target_h=640,
        feather_margins=(120, 90, 155, 75),
        ellipse_params=(0.54, 0.52, 0.50, 0.49, 0.25),
        alpha_scale=1.14
    )

    # 6. SOARING CARRIER DOVE & COMPASS ROSE
    _blit_feathered(
        canvas, carrier_dove,
        x=cx + 165, y=935, target_w=170, target_h=190,
        feather_margins=(18, 18, 18, 18),
        alpha_scale=1.18
    )
    _blit_feathered(
        canvas, compass_rose,
        x=205, y=735, target_w=175, target_h=200,
        feather_margins=(15, 15, 15, 15),
        alpha_scale=1.10
    )

    # 7. CENTRAL ARMILLARY & ECLIPSE CONVERGENCE OVER THE CHASM (cx=863, cy=1445)
    vx, vy = cx, 1445
    r_clear = 240
    y0, y1 = max(0, vy - r_clear), min(canvas.shape[0], vy + r_clear)
    x0, x1 = max(0, vx - r_clear), min(canvas.shape[1], vx + r_clear)
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    dist_c = np.sqrt((xx - vx) ** 2 + (yy - vy) ** 2) / float(r_clear)
    atten_c = np.clip(0.24 + 0.76 * (dist_c ** 1.7), 0.24, 1.0)
    canvas[y0:y1, x0:x1, 3] = (canvas[y0:y1, x0:x1, 3].astype(np.float32) * atten_c).astype(np.uint8)

    _blit_feathered(
        canvas, armillary_3d,
        x=vx - 255, y=vy - 220, target_w=510, target_h=440,
        feather_margins=(30, 30, 30, 30),
        ellipse_params=(0.50, 0.50, 0.48, 0.48, 0.22),
        alpha_scale=1.22
    )

    # Central Sacred Grand Eclipse Medallion inside the Armillary core
    radius = 29
    r_glow = int(radius * 1.9)
    gy0, gy1 = max(0, vy - r_glow), min(canvas.shape[0], vy + r_glow)
    gx0, gx1 = max(0, vx - r_glow), min(canvas.shape[1], vx + r_glow)
    gyy, gxx = np.mgrid[gy0:gy1, gx0:gx1].astype(np.float32)
    gd = np.sqrt((gxx - vx) ** 2 + (gyy - vy) ** 2) / float(r_glow)
    g_atten = np.clip(0.35 + 0.65 * (gd ** 1.5), 0.35, 1.0)
    canvas[gy0:gy1, gx0:gx1, 3] = (canvas[gy0:gy1, gx0:gx1, 3].astype(np.float32) * g_atten).astype(np.uint8)

    for deg in range(0, 360, 10):
        rad = math.radians(deg)
        r_in = radius + 3
        r_out = radius + (18 if deg % 30 == 0 else (12 if deg % 20 == 0 else 7))
        p1 = (vx + r_in * math.cos(rad), vy + r_in * math.sin(rad))
        p2 = (vx + r_out * math.cos(rad), vy + r_out * math.sin(rad))
        _pline(canvas, [p1, p2], dark_ink, alpha=220 if deg % 30 == 0 else 165, seed=seed + 500 + deg, passes=1, thick=1)

    cv2.circle(canvas, (int(vx), int(vy)), radius, (*dark_ink, 250), 2, cv2.LINE_AA)
    cv2.circle(canvas, (int(vx), int(vy)), radius + 4, (*dark_ink, 180), 1, cv2.LINE_AA)
    cv2.ellipse(canvas, (int(vx), int(vy)), (radius, radius), 0, 90, 270, (*dark_ink, 245), -1, cv2.LINE_AA)
    for dy_h in range(-radius + 3, radius - 2, 4):
        dx_max = int(math.sqrt(max(0, radius * radius - dy_h * dy_h)))
        _pline(canvas, [(vx, vy + dy_h), (vx + dx_max - 2, vy + dy_h)], dark_ink, alpha=115, seed=seed + 700 + dy_h, passes=1, thick=1)

    # 8. SIGHTING RAYS & GEODETIC CHORDS
    t1_pt = (cx, 815)        # Tower I on the high summit of terrace_chasm
    t2_pt = (445, 1790)      # Tower II Sentinel Canyon & Sanctuary Axis
    t3_pt = (1285, 1785)     # Tower III Stage Tower Proscenium

    for pt in [t1_pt, t2_pt, t3_pt]:
        px_n, py_n = int(pt[0]), int(pt[1])
        cv2.circle(canvas, (px_n, py_n), 11, (*dark_ink, 240), 1, cv2.LINE_AA)
        cv2.circle(canvas, (px_n, py_n), 4, (*dark_ink, 255), -1, cv2.LINE_AA)
        for dx_n, dy_n in [(-18, 0), (18, 0), (0, -18), (0, 18)]:
            cv2.line(canvas, (px_n + dx_n // 2, py_n + dy_n // 2), (px_n + dx_n, py_n + dy_n), (*dark_ink, 210), 1, cv2.LINE_AA)

    _dashed_line(canvas, t1_pt, t2_pt, dash_len=20, gap_len=12, gc=dark_ink, alpha=195, seed=seed + 601, thick=1)
    _dashed_line(canvas, t2_pt, t3_pt, dash_len=20, gap_len=12, gc=dark_ink, alpha=195, seed=seed + 602, thick=1)
    _dashed_line(canvas, t3_pt, t1_pt, dash_len=20, gap_len=12, gc=dark_ink, alpha=195, seed=seed + 603, thick=1)

    for pt, s_id in [(t1_pt, 701), (t2_pt, 702), (t3_pt, 703)]:
        dx_r, dy_r = vx - pt[0], vy - pt[1]
        d_r = math.hypot(dx_r, dy_r)
        p_end = (vx - dx_r / d_r * 38, vy - dy_r / d_r * 38)
        p_start = (pt[0] + dx_r / d_r * 16, pt[1] + dy_r / d_r * 16)
        _pline(canvas, [p_start, p_end], dark_ink, alpha=220, seed=seed + s_id, passes=2, thick=1)
        nx_r, ny_r = -dy_r / d_r * 3.5, dx_r / d_r * 3.5
        _pline(canvas, [(p_start[0] + nx_r, p_start[1] + ny_r), (p_end[0] + nx_r, p_end[1] + ny_r)], dark_ink, alpha=140, seed=seed + s_id + 10, passes=1, thick=1)

    # 9. INTEGRATED CALLIGRAPHY (Zero rectangular cutout boxes)
    _blit_integrated_calligraphy(canvas, "TOWER I · THE ALPINE OBSERVATORY", cx, 662, font_size=29, gc=dark_ink, seed=801, underline=True)
    _blit_integrated_calligraphy(canvas, "Summit 3,420 m · The Chasm Pass Trail", cx, 700, font_size=23, gc=dark_ink, seed=802)

    _blit_integrated_calligraphy(canvas, "240 Leagues · Western Ridge", 425, 1175, font_size=24, gc=dark_ink, seed=803)
    _blit_integrated_calligraphy(canvas, "210 Leagues · Bearing 354° N", 1270, 1175, font_size=24, gc=dark_ink, seed=804)

    _blit_integrated_calligraphy(canvas, "THE VAULT OF THE GRAND ECLIPSE", vx, vy + 220, font_size=29, gc=dark_ink, seed=805, underline=True)
    _blit_integrated_calligraphy(canvas, "Locus Convergentiae · The Secret Chamber", vx, vy + 258, font_size=23, gc=dark_ink, seed=806)

    _blit_integrated_calligraphy(canvas, "TOWER II · SANDSTONE SANCTUARY", 435, 2115, font_size=27, gc=dark_ink, seed=807, underline=True)
    _blit_integrated_calligraphy(canvas, "The Desert Path · Solar Meridian", 435, 2152, font_size=23, gc=dark_ink, seed=808)

    _blit_integrated_calligraphy(canvas, "TOWER III · THE STAGE TOWER", 1235, 2115, font_size=27, gc=dark_ink, seed=809, underline=True)
    _blit_integrated_calligraphy(canvas, "Departure Bearing: 354° North", 1235, 2152, font_size=23, gc=dark_ink, seed=810)

    _blit_integrated_calligraphy(canvas, "180 Leagues · The Great Rift", vx, 1835, font_size=24, gc=dark_ink, seed=811)

    _blit_integrated_calligraphy(
        canvas,
        "Bearings: 354° North from Tower III through the Chasm Pass toward Tower I and the Vault.   — H. & A.",
        cx, 2245, font_size=30, gc=dark_ink, seed=812
    )

    # Enforce strict Cara B right hole margin (0 pixels at X > 1583)
    canvas[:, 1580:, 3] = 0


# Backward-compatible alias
draw_three_towers_geodetic_chart = draw_grand_expedition_map



