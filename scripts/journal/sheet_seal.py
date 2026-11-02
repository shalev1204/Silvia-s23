#!/usr/bin/env python3
"""
The seals of the Stage Path sheets (docs/IDEAS_BACKLOG.md #14)
==============================================================
Each game face of Sheets 20 to 26 carries a seal of the Order: an engraved medallion with a QR code at its heart.
The QR is the key of that room: scanning it opens the Hub with ?seal=CODE, and the room's door opens
(web/hub/js/sheet-seals.js). Without the sheet in her hands, the door stays shut.

- The codes live in journal/stage_seals.json (eight letters A-Z, made once and kept). The Hub only holds their hash.
- draw_seal(canvas, cx, cy, r, face) draws the medallion on a sheet canvas (build_stage_path.py, when each sheet is
  drawn); every seal is read back with OpenCV before it is accepted.
- Run alone: python3 scripts/journal/sheet_seal.py   writes journal/seals/seal_<face>.png previews and prints the
  hashes to paste into SEALS in sheet-seals.js when each room is built.

Needs segno (in scripts/requirements.txt).
"""

import json
import math
import os
import secrets
import string
import sys

import cv2
import numpy as np
import segno

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from scripts.journal.build_desert_games import GRAPHITE_COLOR, draw_sketchy_line   # noqa: E402

HUB_URL = "https://the-eclipse-order.pages.dev/"
CODES_FILE = os.path.join(PROJECT_ROOT, "journal", "stage_seals.json")
PREVIEW_DIR = os.path.join(PROJECT_ROOT, "journal", "seals")
# game face -> node of its room in the Hub (Stations 21 to 28; Station 20 opened before the seals; 20B, 21B, 22A, 24A, 25A, and 26A use alternative creative methods)
FACES = {"20A": 41, "23A": 45}


def fnv1a(text):
    """32-bit FNV-1a, the same hash sheet-seals.js computes (only the hash of each code is in the Hub)."""
    h = 0x811C9DC5
    for ch in text.encode("ascii"):
        h ^= ch
        h = (h * 0x01000193) & 0xFFFFFFFF
    return format(h, "08x")


def codes():
    """The code of every face, made once (A-Z only, Rule 10) and kept in journal/stage_seals.json."""
    data = {}
    if os.path.exists(CODES_FILE):
        with open(CODES_FILE, encoding="utf-8") as f:
            data = json.load(f)
    changed = False
    for face, node in FACES.items():
        if face not in data:
            data[face] = {"node": node, "code": "".join(secrets.choice(string.ascii_uppercase) for _ in range(8))}
            changed = True
    if changed:
        os.makedirs(os.path.dirname(CODES_FILE), exist_ok=True)
        with open(CODES_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
            f.write("\n")
    return data


def seal_url(face):
    return HUB_URL + "?seal=" + codes()[face]["code"]


def draw_seal(canvas, cx, cy, r, face, gc=GRAPHITE_COLOR, seed=4100, direct=False, mode="clean"):
    """The medallion: authentic Renaissance astronomical astrolabe seal with beaded coin rim,
    guilloché rope fluting, 72-degree limbus graduations, four faceted cardinal star pointers,
    four sacred eclipse discs (half-dark / half-light ◐), sky plan altitude arcs,
    and chiaroscuro bevel shading enclosing the QR chamber.
    If direct=True, draws the enlarged direct QR code filling an architectural opening.
    Ink is solid so the camera reads it effortlessly on real paper."""
    if direct:
        return draw_direct_qr(canvas, cx, cy, int(r * 2), face, mode=mode, gc=gc)

    url = seal_url(face)
    qr = segno.make(url, error="h", boost_error=False)
    matrix = [list(row) for row in qr.matrix]
    n = len(matrix)

    # Radii of concentric astronomical rings
    r_out = r
    r_pearls = r * 0.952
    r_rope_out = r * 0.920
    r_rope_in = r * 0.862
    r_limbus_in = r * 0.755
    r_inner = r * 0.655

    ink_solid = (int(gc[0] * 0.40), int(gc[1] * 0.40), int(gc[2] * 0.40), 255)
    ink_dark  = (int(gc[0] * 0.50), int(gc[1] * 0.50), int(gc[2] * 0.50), 255)
    ink_mid   = (int(gc[0] * 0.70), int(gc[1] * 0.70), int(gc[2] * 0.70), 220)
    ink_faint = (int(gc[0]), int(gc[1]), int(gc[2]), 120)

    # 1. Clear the paper under the seal
    cv2.circle(canvas, (int(cx), int(cy)), int(r_out + 3), (0, 0, 0, 0), -1)

    # 2. Outer stepped coin rim with beaded pearls (36 relief pearls)
    for rad, passes in ((r_out, 3), (r_pearls, 2), (r_rope_out, 2)):
        pts = [(cx + rad * math.cos(a), cy + rad * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 120)]
        for i in range(len(pts) - 1):
            draw_sketchy_line(canvas, pts[i], pts[i + 1], gc=gc, alpha_base=225, passes=passes, seed=seed + i)

    n_beads = 36
    r_b = (r_out + r_pearls) / 2
    for k in range(n_beads):
        a = k * 2 * math.pi / n_beads
        px = cx + r_b * math.cos(a)
        py = cy + r_b * math.sin(a)
        cv2.circle(canvas, (int(round(px)), int(round(py))), max(2, int(r * 0.015)), ink_dark, -1)
        # Highlight on each pearl (classic engraving technique)
        cv2.circle(canvas, (int(round(px - 1)), int(round(py - 1))), max(1, int(r * 0.007)), (*gc, 90), -1)

    # 3. Guilloché / Twisted nautical rope band between r_rope_out and r_rope_in
    pts_rope_in = [(cx + r_rope_in * math.cos(a), cy + r_rope_in * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 120)]
    for i in range(len(pts_rope_in) - 1):
        draw_sketchy_line(canvas, pts_rope_in[i], pts_rope_in[i + 1], gc=gc, alpha_base=215, passes=2, seed=seed + 150 + i)

    n_rope = 72
    for k in range(n_rope):
        a1 = k * 2 * math.pi / n_rope
        a2 = a1 + (2 * math.pi / n_rope) * 0.82
        p0 = (int(cx + r_rope_in * math.cos(a1)), int(cy + r_rope_in * math.sin(a1)))
        p1 = (int(cx + r_rope_out * math.cos(a2)), int(cy + r_rope_out * math.sin(a2)))
        cv2.line(canvas, p0, p1, (*gc, 180), 1, cv2.LINE_AA)

    # 4. Astrolabe Limbus: 72 astronomical degree graduations
    pts_limbus_in = [(cx + r_limbus_in * math.cos(a), cy + r_limbus_in * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 120)]
    for i in range(len(pts_limbus_in) - 1):
        draw_sketchy_line(canvas, pts_limbus_in[i], pts_limbus_in[i + 1], gc=gc, alpha_base=230, passes=2, seed=seed + 300 + i)

    n_ticks = 72
    for k in range(n_ticks):
        a = k * 2 * math.pi / n_ticks
        major = (k % 6 == 0)      # every 30 deg
        cardinal = (k % 18 == 0)  # every 90 deg
        r0 = r_limbus_in
        r1 = r_rope_in - (0 if major else int(r * 0.038))
        p0 = (int(cx + r0 * math.cos(a)), int(cy + r0 * math.sin(a)))
        p1 = (int(cx + r1 * math.cos(a)), int(cy + r1 * math.sin(a)))
        thick = 2 if cardinal else (2 if major else 1)
        alpha = 240 if cardinal else (200 if major else 130)
        cv2.line(canvas, p0, p1, (*gc, alpha), thick, cv2.LINE_AA)

    # 5. Four Major Faceted Renaissance Compass Rose Pointers (0, 90, 180, 270 deg)
    for k in range(4):
        a = k * math.pi / 2
        dist = (r_rope_in + r_limbus_in) / 2
        sz = r * 0.055
        w_half = sz * 0.44
        
        fx = cx + dist * math.cos(a)
        fy = cy + dist * math.sin(a)
        
        tip = (fx + sz * math.cos(a), fy + sz * math.sin(a))
        base = (fx - sz * 0.65 * math.cos(a), fy - sz * 0.65 * math.sin(a))
        wing_l = (fx - w_half * math.sin(a), fy + w_half * math.cos(a))
        wing_r = (fx + w_half * math.sin(a), fy - w_half * math.cos(a))
        
        poly_dark = np.array([tip, wing_l, base], np.int32)
        cv2.fillPoly(canvas, [poly_dark], ink_dark)
        
        poly_light = np.array([tip, wing_r, base], np.int32)
        cv2.fillPoly(canvas, [poly_light], (*gc, 90))
        cv2.polylines(canvas, [poly_light], True, ink_dark, 1, cv2.LINE_AA)

    # 6. Four Sacred Eclipse Discs (half dark / half light ◐) at diagonal octants (45, 135, 225, 315 deg)
    r_disc = r * 0.034
    r_disc_pos = (r_rope_in + r_limbus_in) / 2
    for k in range(4):
        a = k * math.pi / 2 + math.pi / 4
        dx = cx + r_disc_pos * math.cos(a)
        dy = cy + r_disc_pos * math.sin(a)
        
        # Outer decorative ring
        cv2.circle(canvas, (int(round(dx)), int(round(dy))), int(round(r_disc + 2)), (*gc, 180), 1, cv2.LINE_AA)
        cv2.circle(canvas, (int(round(dx)), int(round(dy))), int(round(r_disc)), ink_dark, 1, cv2.LINE_AA)
        
        # Half dark fill (left side in rotated frame)
        angles = np.linspace(a + math.pi / 2, a + 3 * math.pi / 2, 20)
        half_pts = [(int(round(dx + r_disc * math.cos(t))), int(round(dy + r_disc * math.sin(t)))) for t in angles]
        half_pts.append((int(round(dx)), int(round(dy))))
        cv2.fillPoly(canvas, [np.array(half_pts, np.int32)], ink_dark)
        
        # Radial rays from the open half (solar corona / crescent glow)
        for ray_t in np.linspace(a - math.pi / 3, a + math.pi / 3, 5):
            p_in = (int(round(dx + (r_disc + 2) * math.cos(ray_t))), int(round(dy + (r_disc + 2) * math.sin(ray_t))))
            p_out = (int(round(dx + (r_disc + 5) * math.cos(ray_t))), int(round(dy + (r_disc + 5) * math.sin(ray_t))))
            cv2.line(canvas, p_in, p_out, (*gc, 150), 1, cv2.LINE_AA)

    # 7. Astrolabe Celestial Projection Arcs (almucantars / planetary curves)
    for arc_idx in range(6):
        arc_r = r * (0.695 + arc_idx * 0.010)
        offset_y = (arc_idx - 2.5) * (r * 0.02)
        arc_pts = [(cx + arc_r * math.cos(t), cy + offset_y + arc_r * 0.92 * math.sin(t)) 
                   for t in np.linspace(0, 2 * math.pi, 90)]
        for i in range(len(arc_pts) - 1):
            p0 = (int(arc_pts[i][0]), int(arc_pts[i][1]))
            p1 = (int(arc_pts[i+1][0]), int(arc_pts[i+1][1]))
            d0 = math.hypot(p0[0] - cx, p0[1] - cy)
            d1 = math.hypot(p1[0] - cx, p1[1] - cy)
            if d0 > r_inner + 3 and d1 > r_inner + 3 and d0 < r_limbus_in - 2 and d1 < r_limbus_in - 2:
                cv2.line(canvas, p0, p1, (*gc, 75), 1, cv2.LINE_AA)

    # 8. Inner Bevel Ring with Chiaroscuro depth hatching
    pts_in = [(cx + r_inner * math.cos(a), cy + r_inner * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 120)]
    for i in range(len(pts_in) - 1):
        draw_sketchy_line(canvas, pts_in[i], pts_in[i + 1], gc=gc, alpha_base=245, passes=3, seed=seed + 700 + i)

    # Deep shadow on bottom-right (from 220 to 40 deg, centered at 310 deg)
    for t in np.linspace(math.pi * 1.15, math.pi * 2.25, 50):
        shade_len = r * 0.028
        p0 = (int(cx + r_inner * math.cos(t)), int(cy + r_inner * math.sin(t)))
        p1 = (int(cx + (r_inner + shade_len) * math.cos(t)), int(cy + (r_inner + shade_len) * math.sin(t)))
        cv2.line(canvas, p0, p1, (*gc, 180), 1, cv2.LINE_AA)

    # 9. QR Code strictly inside r_inner with pristine quiet zone
    side = r_inner * math.sqrt(2) * 0.90
    quiet = 3
    mod = max(2, int(side / (n + 2 * quiet)))
    side = mod * (n + 2 * quiet)
    x0 = cx - side / 2 + quiet * mod
    y0 = cy - side / 2 + quiet * mod

    for yy, row in enumerate(matrix):
        for xx, dark in enumerate(row):
            if dark:
                p0 = (int(round(x0 + xx * mod)), int(round(y0 + yy * mod)))
                p1 = (int(round(x0 + (xx + 1) * mod)) - 1, int(round(y0 + (yy + 1) * mod)) - 1)
                cv2.rectangle(canvas, p0, p1, ink_solid, -1)

    return canvas


def draw_direct_qr(canvas, cx, cy, qr_size, face, mode="clean", gc=GRAPHITE_COLOR):
    """Draws an enlarged direct QR code (clean square, dots, or dots with central Eclipse emblem)
    filling an architectural space without heavy enclosing rings, verified for 100% camera readability.
    """
    url = seal_url(face)
    qr = segno.make(url, error="h", boost_error=False)
    matrix = [list(row) for row in qr.matrix]
    N = len(matrix)
    quiet = 4
    total_mods = N + 2 * quiet
    mod = qr_size / float(total_mods)

    ink_solid = (int(gc[0] * 0.35), int(gc[1] * 0.35), int(gc[2] * 0.35), 255)

    x_start = cx - qr_size / 2.0
    y_start = cy - qr_size / 2.0

    # Clear region under QR code
    cv2.rectangle(
        canvas,
        (int(x_start), int(y_start)),
        (int(x_start + qr_size), int(y_start + qr_size)),
        (0, 0, 0, 0),
        -1,
    )

    def is_finder(x, y):
        if x < 8 and y < 8:
            return True
        if x >= N - 8 and y < 8:
            return True
        if x < 8 and y >= N - 8:
            return True
        return False

    center_r = 4.2
    cx_m, cy_m = N // 2, N // 2

    def is_center(x, y):
        return (x - cx_m) ** 2 + (y - cy_m) ** 2 <= (center_r - 0.2) ** 2

    for y in range(N):
        for x in range(N):
            if mode in ("dots_eclipse", "shadow_theatre", "camera_obscura") and is_center(x, y):
                continue
            if not matrix[y][x]:
                continue

            px = x_start + (x + quiet) * mod
            py = y_start + (y + quiet) * mod

            if mode == "clean" or is_finder(x, y):
                p0 = (int(round(px)), int(round(py)))
                p1 = (int(round(px + mod)) - 1, int(round(py + mod)) - 1)
                cv2.rectangle(canvas, p0, p1, ink_solid, -1)
            elif mode in ("dots", "dots_eclipse", "shadow_theatre", "camera_obscura"):
                cmx = int(round(px + mod * 0.5))
                cmy = int(round(py + mod * 0.5))
                cv2.circle(canvas, (cmx, cmy), int(round(mod * 0.46)), ink_solid, -1, cv2.LINE_AA)

    if mode == "dots_eclipse":
        emb_cx = int(round(x_start + (cx_m + quiet + 0.5) * mod))
        emb_cy = int(round(y_start + (cy_m + quiet + 0.5) * mod))
        emb_r = int((center_r - 0.5) * mod)

        cv2.circle(canvas, (emb_cx, emb_cy), emb_r, (0, 0, 0, 0), -1)
        cv2.circle(canvas, (emb_cx, emb_cy), emb_r, ink_solid, 2, cv2.LINE_AA)
        cv2.circle(canvas, (emb_cx, emb_cy), emb_r - 4, (*gc, 160), 1, cv2.LINE_AA)
        cv2.circle(canvas, (emb_cx, emb_cy), int(emb_r * 0.65), ink_solid, 2, cv2.LINE_AA)
        angles = np.linspace(math.pi, 2 * math.pi, 20)
        half_pts = [
            (int(round(emb_cx + emb_r * 0.65 * math.cos(t))), int(round(emb_cy + emb_r * 0.65 * math.sin(t))))
            for t in angles
        ]
        half_pts.append((emb_cx, emb_cy))
        cv2.fillPoly(canvas, [np.array(half_pts, np.int32)], ink_solid)
        cv2.line(
            canvas,
            (int(round(emb_cx - emb_r * 0.8)), emb_cy),
            (int(round(emb_cx + emb_r * 0.8)), emb_cy),
            ink_solid,
            2,
            cv2.LINE_AA,
        )

    elif mode == "shadow_theatre":
        emb_cx = int(round(x_start + (cx_m + quiet + 0.5) * mod))
        emb_cy = int(round(y_start + (cy_m + quiet + 0.5) * mod))
        emb_r = int((center_r - 0.2) * mod)

        # Clear circle under vignette
        cv2.circle(canvas, (emb_cx, emb_cy), emb_r + 2, (0, 0, 0, 0), -1)
        cv2.circle(canvas, (emb_cx, emb_cy), emb_r, ink_solid, 2, cv2.LINE_AA)
        cv2.circle(canvas, (emb_cx, emb_cy), emb_r - 3, (*gc, 180), 1, cv2.LINE_AA)

        # Crescent Moon silhouette
        mx, my = emb_cx - int(emb_r * 0.25), emb_cy - int(emb_r * 0.28)
        mr = int(emb_r * 0.28)
        moon_pts = []
        for t in np.linspace(-math.pi / 2, math.pi / 2, 20):
            moon_pts.append((int(mx + mr * math.cos(t)), int(my + mr * math.sin(t))))
        for t in np.linspace(math.pi / 2, -math.pi / 2, 20):
            moon_pts.append((int(mx + mr * 0.4 + mr * 0.7 * math.cos(t)), int(my + mr * math.sin(t))))
        cv2.fillPoly(canvas, [np.array(moon_pts, np.int32)], ink_solid)

        # Watchtower silhouette
        tw_w = int(emb_r * 0.32)
        tw_h = int(emb_r * 0.45)
        tw_x = emb_cx + int(emb_r * 0.10)
        tw_y = emb_cy + int(emb_r * 0.05)
        t_pts = [
            (tw_x - tw_w // 2, tw_y + tw_h),
            (tw_x - tw_w // 2, tw_y),
            (tw_x - tw_w // 2 - 2, tw_y),
            (tw_x - tw_w // 2 - 2, tw_y - 4),
            (tw_x - tw_w // 4, tw_y - 4),
            (tw_x - tw_w // 4, tw_y - 1),
            (tw_x + tw_w // 4, tw_y - 1),
            (tw_x + tw_w // 4, tw_y - 4),
            (tw_x + tw_w // 2 + 2, tw_y - 4),
            (tw_x + tw_w // 2 + 2, tw_y),
            (tw_x + tw_w // 2, tw_y),
            (tw_x + tw_w // 2, tw_y + tw_h),
        ]
        cv2.fillPoly(canvas, [np.array(t_pts, np.int32)], ink_solid)

        # Delicate Brass Mounting Brackets at the 4 outer corners
        br_len = int(mod * 2.8)
        corners = [
            (int(x_start + mod * 0.5), int(y_start + mod * 0.5), 1, 1),
            (int(x_start + qr_size - mod * 0.5), int(y_start + mod * 0.5), -1, 1),
            (int(x_start + mod * 0.5), int(y_start + qr_size - mod * 0.5), 1, -1),
            (int(x_start + qr_size - mod * 0.5), int(y_start + qr_size - mod * 0.5), -1, -1),
        ]
        for cx_c, cy_c, dx, dy in corners:
            cv2.line(canvas, (cx_c, cy_c), (cx_c + dx * br_len, cy_c), ink_solid, 2, cv2.LINE_AA)
            cv2.line(canvas, (cx_c, cy_c), (cx_c, cy_c + dy * br_len), ink_solid, 2, cv2.LINE_AA)
            cv2.circle(
                canvas,
                (cx_c + dx * int(mod * 0.8), cy_c + dy * int(mod * 0.8)),
                max(1, int(mod * 0.25)),
                ink_solid,
                -1,
                cv2.LINE_AA,
            )

    elif mode == "camera_obscura":
        emb_cx = int(round(x_start + (cx_m + quiet + 0.5) * mod))
        emb_cy = int(round(y_start + (cy_m + quiet + 0.5) * mod))
        emb_r = int((center_r - 0.2) * mod)

        # Clear circle under lens aperture
        cv2.circle(canvas, (emb_cx, emb_cy), emb_r + 2, (0, 0, 0, 0), -1)
        # Outer brass lens barrel
        cv2.circle(canvas, (emb_cx, emb_cy), emb_r, ink_solid, 2, cv2.LINE_AA)
        # Calibrated optical ring
        cv2.circle(canvas, (emb_cx, emb_cy), emb_r - 3, (*gc, 180), 1, cv2.LINE_AA)

        # 8 Diaphragm tick marks on lens collar
        for a_deg in range(0, 360, 45):
            rad = math.radians(a_deg)
            p_in = (int(round(emb_cx + (emb_r - 3) * math.cos(rad))), int(round(emb_cy + (emb_r - 3) * math.sin(rad))))
            p_out = (int(round(emb_cx + emb_r * math.cos(rad))), int(round(emb_cy + emb_r * math.sin(rad))))
            cv2.line(canvas, p_in, p_out, ink_solid, 1, cv2.LINE_AA)

        # Inverted Optical Rays (Keplerian Ray Crossing through the pinhole)
        cone_top = [
            (emb_cx - int(emb_r * 0.45), emb_cy - int(emb_r * 0.55)),
            (emb_cx + int(emb_r * 0.45), emb_cy - int(emb_r * 0.55)),
            (emb_cx, emb_cy),
        ]
        cone_bot = [
            (emb_cx, emb_cy),
            (emb_cx + int(emb_r * 0.45), emb_cy + int(emb_r * 0.55)),
            (emb_cx - int(emb_r * 0.45), emb_cy + int(emb_r * 0.55)),
        ]
        cv2.fillPoly(canvas, [np.array(cone_top, np.int32)], ink_solid)
        cv2.fillPoly(canvas, [np.array(cone_bot, np.int32)], ink_solid)

        # Pinhole aperture oculus
        cv2.circle(canvas, (emb_cx, emb_cy), max(2, int(mod * 0.35)), (0, 0, 0, 0), -1)
        cv2.circle(canvas, (emb_cx, emb_cy), max(3, int(mod * 0.55)), ink_solid, 1, cv2.LINE_AA)

        # Aperture partition wall line
        cv2.line(
            canvas,
            (emb_cx - int(emb_r * 0.75), emb_cy),
            (emb_cx - max(4, int(mod * 0.7)), emb_cy),
            ink_solid,
            1,
            cv2.LINE_AA,
        )
        cv2.line(
            canvas,
            (emb_cx + max(4, int(mod * 0.7)), emb_cy),
            (emb_cx + int(emb_r * 0.75), emb_cy),
            ink_solid,
            1,
            cv2.LINE_AA,
        )

        # Optical Caliper Brackets at outer 4 corners (optical bench alignment mounts)
        cal_len = int(mod * 2.8)
        corners = [
            (int(x_start + mod * 0.5), int(y_start + mod * 0.5), 1, 1),
            (int(x_start + qr_size - mod * 0.5), int(y_start + mod * 0.5), -1, 1),
            (int(x_start + mod * 0.5), int(y_start + qr_size - mod * 0.5), 1, -1),
            (int(x_start + qr_size - mod * 0.5), int(y_start + qr_size - mod * 0.5), -1, -1),
        ]
        for cx_c, cy_c, dx, dy in corners:
            cv2.line(canvas, (cx_c, cy_c), (cx_c + dx * cal_len, cy_c), ink_solid, 2, cv2.LINE_AA)
            cv2.line(canvas, (cx_c, cy_c), (cx_c, cy_c + dy * cal_len), ink_solid, 2, cv2.LINE_AA)
            cv2.circle(
                canvas,
                (cx_c + dx * int(mod * 0.8), cy_c + dy * int(mod * 0.8)),
                max(1, int(mod * 0.25)),
                ink_solid,
                -1,
                cv2.LINE_AA,
            )

    return canvas


def read_back(canvas):
    """What a camera reads from the seal (OpenCV), on the paper colour."""
    paper = np.full(canvas.shape[:2] + (3,), (196, 220, 236), np.uint8)   # parchment, BGR
    alpha = canvas[:, :, 3:4].astype(np.float32) / 255.0
    img = (canvas[:, :, :3].astype(np.float32) * alpha + paper.astype(np.float32) * (1 - alpha)).astype(np.uint8)
    img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_NEAREST)   # a phone camera sees more pixels than this preview
    text, _, _ = cv2.QRCodeDetector().detectAndDecode(img)
    return text


def main():
    os.makedirs(PREVIEW_DIR, exist_ok=True)
    data = codes()
    print("Hashes for SEALS in web/hub/js/sheet-seals.js (paste each one when its room is built):")
    for face, node in FACES.items():
        canvas = np.zeros((520, 520, 4), np.uint8)
        draw_seal(canvas, 260, 260, 230, face)
        url = read_back(canvas)
        ok = url == seal_url(face)
        cv2.imwrite(os.path.join(PREVIEW_DIR, "seal_" + face + ".png"), canvas)
        print("  %d: '%s',   // Sheet %s%s" % (node, fnv1a(data[face]["code"]), face, "" if ok else "   ✗ THE SEAL DOES NOT READ BACK"))
        if not ok:
            sys.exit(1)


if __name__ == "__main__":
    main()
