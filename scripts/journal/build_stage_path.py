#!/usr/bin/env python3
"""
The Stage Path · journal sheets 19 to 26 (Tower III)
=====================================================
Each game face of the Stage Path carries its own fragment of the Mirror of Tower III,
drawn from the shared geometry in `stage_mirror.py` (the same pieces the Hub shows).

Sheet 19
- Cara A · The Unsent Letter: the Oracle of centuries ago writes to the Mirror Speaker, in mirror writing.
- Cara B · The Gate of a Thousand Masks (Station 20): twelve masks, six of them lie. Fragment I.

Margins: Cara A has no pixels at X < 165, Cara B none at X > 1583 (ring holes); 75 px clear at the foot.

Run alone:  python3 scripts/journal/build_stage_path.py   (proof-reads every face with verify_sheets.py, then writes
            journal/page19 PDFs and mockups, the 19-26 bundle and the print preview in journal/impresion)
"""

import math
import os
import sys

import cv2
import numpy as np

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from scripts.journal.geometry import CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX
from scripts.journal.build_desert_games import render_pencil_text, blit_rgba, draw_sketchy_line, GRAPHITE_COLOR, FONT_PATH
from scripts.journal.build_desert_odyssey_expanded import _hatch_polygon
from scripts.journal import stage_mirror, stage_drawings

FRONT_X0, BACK_X0, TEXT_W = 220, 198, 1330   # text column of a front face and of a back face
FOOT = 75                                      # clear band at the foot of every face
BODY, BODY_LH = 35, 48


# -------------------------------------------------------------------------
# small drawing kit
# -------------------------------------------------------------------------

def _canvas():
    return np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)


def _text(canvas, text, x, y, size, seed, gc=GRAPHITE_COLOR, mirror=False, anchor="left"):
    """Pencil text at (x, y). anchor 'left' | 'center' | 'right'. mirror=True writes it as the glass sees it."""
    img, _ = render_pencil_text(text, FONT_PATH, font_size=size, gc=gc, seed=seed)
    if mirror:
        img = np.ascontiguousarray(img[:, ::-1])
    w = img.shape[1]
    x0 = x if anchor == "left" else (x - w // 2 if anchor == "center" else x - w)
    blit_rgba(canvas, img, int(x0), int(y))
    return w


def _wrap(text, size, max_w):
    from scripts.journal.build_page06_07 import wrap_text_to_width
    return wrap_text_to_width(text, FONT_PATH, size, max_w)


def _paragraph(canvas, text, x, y, max_w, size=BODY, lh=BODY_LH, seed=0, gc=GRAPHITE_COLOR):
    for k, ln in enumerate(_wrap(text, size, max_w)):
        _text(canvas, ln, x, y, size, seed + k * 3, gc)
        y += lh
    return y


def _divider(canvas, x, y, w, seed, gc=GRAPHITE_COLOR):
    from scripts.journal.build_page06_07 import create_handdrawn_divider
    blit_rgba(canvas, create_handdrawn_divider(width=w, gc=gc, seed=seed), x, y)


def _pline(canvas, pts, gc, alpha=190, seed=1, passes=2, closed=False, thick=1, wob=0.7):
    """A hand-drawn polyline: two light passes with a little wobble."""
    rng = np.random.default_rng(seed)
    base = np.array(pts, dtype=np.float32)
    for p in range(passes):
        q = base + rng.normal(0, wob + 0.25 * p, base.shape)
        a = int(alpha * rng.uniform(0.8, 1.0))
        cv2.polylines(canvas, [np.round(q).astype(np.int32)], closed, (*gc, a), thick, cv2.LINE_AA)


def _clear_foot(canvas):
    canvas[CANVAS_HEIGHT_PX - FOOT:, :, 3] = 0
    return canvas


# -------------------------------------------------------------------------
# The fragments of the mirror (shared by every game face of the Stage Path)
# -------------------------------------------------------------------------

def shard_bbox(idx):
    shards, _ = stage_mirror.fragments()
    pts = np.array(shards[idx]["points"], dtype=np.float32)
    return pts[:, 0].min(), pts[:, 1].min(), pts[:, 0].max(), pts[:, 1].max()


def draw_fragment(canvas, idx, x, y, scale, gc=GRAPHITE_COLOR, seed=900):
    """Draws fragment idx (0 = I) with its top-left bbox corner at (x, y): the glass outline,
    the piece of reflection it holds (clipped), a sheen of hatching and its numeral.
    Returns the drawn box (x0, y0, x1, y1)."""
    shards, _ = stage_mirror.fragments()
    sh = shards[idx]
    bx0, by0, bx1, by1 = shard_bbox(idx)
    T = lambda p: (x + (p[0] - bx0) * scale, y + (p[1] - by0) * scale)
    poly = np.array([T(p) for p in sh["points"]], dtype=np.float32)
    box = (int(poly[:, 0].min()), int(poly[:, 1].min()), int(math.ceil(poly[:, 0].max())), int(math.ceil(poly[:, 1].max())))

    # the reflection, drawn on its own layer and clipped to the glass
    layer = np.zeros_like(canvas)
    for k, pl in enumerate(stage_mirror.facade()):
        _pline(layer, [T(p) for p in pl], gc, alpha=205, seed=seed + k, passes=2, wob=0.35)
    mask = np.zeros(canvas.shape[:2], dtype=np.uint8)
    cv2.fillPoly(mask, [np.round(poly).astype(np.int32)], 255)
    mask = cv2.erode(mask, np.ones((5, 5), np.uint8))
    layer[:, :, 3] = (layer[:, :, 3].astype(np.uint16) * mask // 255).astype(np.uint8)
    blit_rgba(canvas, layer[box[1]:box[3] + 1, box[0]:box[2] + 1], box[0], box[1])

    # a light sheen across the glass, the sharp edge, and the numeral
    _hatch_polygon(canvas, [tuple(p) for p in poly], step=11, angle=-35.0, gc=gc, alpha=28, seed=seed + 300)
    _pline(canvas, poly, gc, alpha=235, seed=seed + 400, closed=True, thick=2, wob=0.5)
    _pline(canvas, poly + np.array([3, 3], np.float32), gc, alpha=90, seed=seed + 401, closed=True, passes=1, wob=0.5)
    return box


# -------------------------------------------------------------------------
# SHEET 19 · CARA A · THE UNSENT LETTER
# -------------------------------------------------------------------------

LETTER_19A = [
    ("To the Mirror Speaker of the third tower,", "salute"),
    ("Forgive me. I closed my door to you when you crossed the plateau to see me, and I have been sorry every night since.", "p"),
    ("Now hear what only we two know. Your mirror did not fall. We broke it together into nine pieces, and hid each piece in your theatre. While the nine are apart, no one can turn the Astrolabe alone: not the Order, not you, not I.", "p"),
    ("And beware the Ashes. They were old before the Order was born. They keep a fire older than our first star, and they want what the Astrolabe opens. They will come to you smiling.", "p"),
    ("The first piece sleeps behind a thousand faces. Only the one who sees what is not equal will find it.", "p"),
    ("The Oracle", "sign"),
]

LETTER_PT, LETTER_LH = 41, 60   # larger, crisp lettering for effortless reading in a mirror

HERMES_JOURNAL_19A = (
    "I found this folded letter inside the cedar chest of the Sanctuary, beneath the oldest charts. "
    "An ancient Oracle wrote it to the Mirror Speaker of Tower III, but never sent it. "
    "The words were set down in mirror script, just as the glass sees them. "
    "Held before a mirror, the letters turn and become easy to read."
)


def _draw_theatrical_letter_parchment(canvas, px0, py0, px1, py1, gc, seed):
    """Draws an exquisite antique theatrical letter parchment for the Stage Tower:
    deckled edges, turned dog-ear corner, proscenium drapery swag header with rope tassels,
    baroque acanthus volute corner brackets, and authentic aged tri-fold creases."""
    rng = np.random.default_rng(seed)
    fold = 85

    # 1. Deckled edge contour with gentle organic variation
    def wavy_edge(p_start, p_end, n_pts=24, amp=1.5):
        xs = np.linspace(p_start[0], p_end[0], n_pts)
        ys = np.linspace(p_start[1], p_end[1], n_pts)
        dx = p_end[0] - p_start[0]
        dy = p_end[1] - p_start[1]
        length = math.hypot(dx, dy)
        nx, ny = -dy / length, dx / length
        res = []
        for i in range(n_pts):
            if i == 0 or i == n_pts - 1:
                res.append((xs[i], ys[i]))
            else:
                wob = math.sin(i * 1.8) * amp + rng.normal(0, 0.35)
                res.append((xs[i] + nx * wob, ys[i] + ny * wob))
        return res

    top_edge = wavy_edge((px0, py0), (px1 - fold, py0), n_pts=20)
    fold_edge = [(px1 - fold, py0), (px1, py0 + fold)]
    right_edge = wavy_edge((px1, py0 + fold), (px1, py1), n_pts=24)
    bottom_edge = wavy_edge((px1, py1), (px0, py1), n_pts=24)
    left_edge = wavy_edge((px0, py1), (px0, py0), n_pts=24)

    paper_contour = top_edge + fold_edge + right_edge + bottom_edge + left_edge
    _pline(canvas, paper_contour, gc, alpha=220, seed=seed, closed=True, thick=2, wob=0.4)

    # 2. Turned-over corner (dog-ear) with shadow and fine diagonal hatching
    ear_apex = (px1 - fold + 14, py0 + fold - 14)
    ear_fold_poly = [(px1 - fold, py0), ear_apex, (px1, py0 + fold)]
    _pline(canvas, ear_fold_poly, gc, alpha=195, seed=seed + 1, thick=2, wob=0.3)
    _hatch_polygon(canvas, ear_fold_poly, step=5, angle=55, gc=gc, alpha=90, seed=seed + 2)
    shadow_poly = [(px1 - fold, py0), ear_apex, (px1, py0 + fold), (px1 - 6, py0 + fold + 12), (px1 - fold - 12, py0 + 6)]
    _hatch_polygon(canvas, shadow_poly, step=4, angle=-35, gc=gc, alpha=45, seed=seed + 3)

    # 3. Fine inner decorative framing line (inset by 16px)
    ins = 16
    ins_fold = fold + 8
    inner_top = wavy_edge((px0 + ins, py0 + ins), (px1 - ins_fold, py0 + ins), n_pts=16, amp=0.8)
    inner_fold = [(px1 - ins_fold, py0 + ins), (px1 - ins, py0 + ins_fold)]
    inner_right = wavy_edge((px1 - ins, py0 + ins_fold), (px1 - ins, py1 - ins), n_pts=20, amp=0.8)
    inner_bottom = wavy_edge((px1 - ins, py1 - ins), (px0 + ins, py1 - ins), n_pts=20, amp=0.8)
    inner_left = wavy_edge((px0 + ins, py1 - ins), (px0 + ins, py0 + ins), n_pts=20, amp=0.8)
    inner_contour = inner_top + inner_fold + inner_right + inner_bottom + inner_left
    _pline(canvas, inner_contour, gc, alpha=150, seed=seed + 4, closed=True, thick=1, wob=0.3)

    # 4. Antique paper fold creases (where the letter was kept folded into thirds)
    for k, frac in enumerate((0.27, 0.53, 0.78)):
        fy = py0 + (py1 - py0) * frac
        _pline(canvas, [(px0 + 8, fy + 1), (px1 - 8, fy + 1)], gc, alpha=28, seed=seed + 10 + k, thick=2, passes=1)
        _pline(canvas, [(px0 + 4, fy), (px1 - 4, fy)], gc, alpha=60, seed=seed + 20 + k, thick=1, passes=1, wob=0.4)

    # 5. Baroque Theatrical Corner Scrollwork (compact so text keeps > 40px buffer)
    def draw_corner_scroll(cx, cy, flip_x, flip_y, s_seed):
        pts_main = []
        for t in np.linspace(0, 1.7 * math.pi, 24):
            r = 9 + 13 * (t / (1.7 * math.pi))
            x = cx + flip_x * (r * math.cos(t))
            y = cy + flip_y * (r * math.sin(t))
            pts_main.append((x, y))
        _pline(canvas, pts_main, gc, alpha=180, seed=s_seed, thick=1, wob=0.3)
        pts_branch = []
        for t in np.linspace(0.4 * math.pi, 1.5 * math.pi, 16):
            r = 15 + 13 * (t / (1.5 * math.pi))
            x = cx + flip_x * (r * math.cos(t) + 3)
            y = cy + flip_y * (r * math.sin(t) + 3)
            pts_branch.append((x, y))
        _pline(canvas, pts_branch, gc, alpha=145, seed=s_seed + 1, thick=1, wob=0.3)
        for b in (9, 18):
            bx = int(cx + flip_x * b)
            by = int(cy + flip_y * b)
            cv2.circle(canvas, (bx, by), 2, (*gc, 130), -1, cv2.LINE_AA)

    draw_corner_scroll(px0 + ins + 18, py0 + ins + 18, -1, -1, seed + 30)
    draw_corner_scroll(px0 + ins + 18, py1 - ins - 18, -1, 1, seed + 40)
    draw_corner_scroll(px1 - ins - 18, py1 - ins - 18, 1, 1, seed + 50)
    draw_corner_scroll(px1 - ins - 18, py0 + ins_fold + 26, 1, -1, seed + 60)

    # 6. Theatrical Proscenium Header Drapery Swags & Central Medallion
    mid_x = (px0 + px1) / 2
    cart_y = py0 + ins + 2
    crest_left, crest_right = [], []
    for t in np.linspace(0, 1.0, 24):
        xx = 150 * t
        yy = -10 * math.sin(math.pi * t) + 6 * (t ** 2)
        crest_left.append((mid_x - xx, cart_y + yy))
        crest_right.append((mid_x + xx, cart_y + yy))
    _pline(canvas, crest_left, gc, alpha=185, seed=seed + 70, thick=1, wob=0.3)
    _pline(canvas, crest_right, gc, alpha=185, seed=seed + 71, thick=1, wob=0.3)

    swag_l, swag_r = [], []
    span = 240
    for i in range(25):
        t = i / 24.0
        lx = mid_x - span + span * t
        ly = cart_y + 10 + 13 * math.sin(math.pi * t)
        swag_l.append((lx, ly))
        rx = mid_x + span * t
        ry = cart_y + 10 + 13 * math.sin(math.pi * t)
        swag_r.append((rx, ry))
    _pline(canvas, swag_l, gc, alpha=160, seed=seed + 75, thick=1, wob=0.35)
    _pline(canvas, swag_r, gc, alpha=160, seed=seed + 76, thick=1, wob=0.35)

    for tx in (mid_x - span, mid_x, mid_x + span):
        _pline(canvas, [(tx, cart_y + 10), (tx, cart_y + 24)], gc, alpha=150, seed=seed + 80 + int(tx), thick=1)
        cv2.ellipse(canvas, (int(tx), int(cart_y + 26)), (4, 3), 0, 0, 360, (*gc, 150), 1, cv2.LINE_AA)
        _pline(canvas, [(tx - 2, cart_y + 29), (tx, cart_y + 35), (tx + 2, cart_y + 29)], gc, alpha=130, seed=seed + 85 + int(tx), thick=1)

    # Central Theatrical Rosette / Oracle Star Medallion
    cv2.circle(canvas, (int(mid_x), int(cart_y + 4)), 8, (*gc, 185), 1, cv2.LINE_AA)
    cv2.circle(canvas, (int(mid_x), int(cart_y + 4)), 4, (*gc, 145), 1, cv2.LINE_AA)
    for a in range(8):
        ang = a * math.pi / 4
        px = int(mid_x + 8 * math.cos(ang))
        py = int(cart_y + 4 + 8 * math.sin(ang))
        qx = int(mid_x + 13 * math.cos(ang))
        qy = int(cart_y + 4 + 13 * math.sin(ang))
        cv2.line(canvas, (px, py), (qx, qy), (*gc, 155), 1, cv2.LINE_AA)

    # 7. Symmetrical Bottom Tailpiece Flourish
    bot_y = py1 - ins - 4
    bot_l, bot_r = [], []
    for t in np.linspace(0, 1.0, 20):
        xx = 110 * t
        yy = -8 * math.sin(math.pi * t)
        bot_l.append((mid_x - xx, bot_y + yy))
        bot_r.append((mid_x + xx, bot_y + yy))
    _pline(canvas, bot_l, gc, alpha=170, seed=seed + 90, thick=1, wob=0.3)
    _pline(canvas, bot_r, gc, alpha=170, seed=seed + 91, thick=1, wob=0.3)
    cv2.circle(canvas, (int(mid_x), int(bot_y - 2)), 3, (*gc, 160), -1, cv2.LINE_AA)
    _pline(canvas, [(mid_x - 16, bot_y - 2), (mid_x + 16, bot_y - 2)], gc, alpha=135, seed=seed + 95, thick=1)



def _draw_hand_mirror(canvas, cx, cy, rx=230, ry=140, gc=GRAPHITE_COLOR, seed=19400):
    """Exquisite Renaissance Venetian Hand Mirror:
    Cast bronze/silver bezel, baroque acanthus crest, turned baluster handle with fluted knops and pommel,
    and pristine optical reflections (pure decorative element, no text)."""
    rng = np.random.default_rng(seed)
    tilt = -14.0
    rad = math.radians(tilt)
    cos_t, sin_t = math.cos(rad), math.sin(rad)
    rot = lambda px, py: (cx + px * cos_t - py * sin_t, cy + px * sin_t + py * cos_t)

    def ell_pts(a, b, n=120):
        return [rot(a * math.cos(2 * math.pi * i / n), b * math.sin(2 * math.pi * i / n)) for i in range(n + 1)]

    # 1. Soft cast shadow on the paper
    sh_pts = [(p[0] + 16, p[1] + 20) for p in ell_pts(rx + 16, ry + 16)]
    _hatch_polygon(canvas, sh_pts, step=6, angle=tilt + 45, gc=gc, alpha=30, seed=seed)

    # 2. Outer Bevel & Molded Rims
    _pline(canvas, ell_pts(rx + 24, ry + 24), gc, alpha=220, seed=seed + 1, thick=2, wob=0.3)
    _pline(canvas, ell_pts(rx + 20, ry + 20), gc, alpha=160, seed=seed + 2, thick=1, wob=0.25)
    _pline(canvas, ell_pts(rx + 12, ry + 12), gc, alpha=170, seed=seed + 3, thick=1, wob=0.25)

    # Beaded Garland between outer rims (36 pearl beads with highlight dots)
    n_beads = 36
    for k in range(n_beads):
        t = 2 * math.pi * k / n_beads
        bx, by = rot((rx + 16) * math.cos(t), (ry + 16) * math.sin(t))
        cv2.circle(canvas, (int(bx), int(by)), 3, (*gc, 180), 1, cv2.LINE_AA)
        cv2.circle(canvas, (int(bx - 1), int(by - 1)), 1, (*gc, 120), -1, cv2.LINE_AA)

    # Inner retaining bezel
    _pline(canvas, ell_pts(rx, ry), gc, alpha=220, seed=seed + 4, thick=2, wob=0.3)
    _pline(canvas, ell_pts(rx - 5, ry - 5), gc, alpha=140, seed=seed + 5, thick=1, wob=0.2)

    # 3. Baroque Acanthus Shell Crest (Crown of the Mirror Head at top, anchored directly to frame)
    top_y = -ry - 24
    crown_l, crown_r = [], []
    for t in np.linspace(0, 1.0, 20):
        xx = 64 * t
        yy = top_y - 22 * math.sin(math.pi * t) - 6 * (t ** 2)
        crown_l.append(rot(-xx, yy))
        crown_r.append(rot(xx, yy))
    _pline(canvas, crown_l, gc, alpha=210, seed=seed + 20, thick=2, wob=0.3)
    _pline(canvas, crown_r, gc, alpha=210, seed=seed + 21, thick=2, wob=0.3)

    # Radiating fluted shell ribs inside crown
    for k in range(7):
        ang_k = -math.pi / 2 + (k - 3) * 0.24
        p_base = rot(0, top_y + 2)
        p_tip = rot(28 * math.cos(ang_k), top_y - 24 + 14 * math.sin(ang_k))
        _pline(canvas, [p_base, p_tip], gc, alpha=175, seed=seed + 25 + k, thick=1)

    # Volutes curling at crown flanks
    for sgn in (-1, 1):
        v_pts = [rot(sgn * (64 + 10 * math.cos(u)), top_y - 6 + 10 * math.sin(u)) for u in np.linspace(0, 2 * math.pi, 20)]
        _pline(canvas, v_pts, gc, alpha=190, seed=seed + 35 + sgn, thick=1)
        tie_pts = [rot(sgn * (64 - 24 * t), top_y + 14 * t) for t in np.linspace(0, 1, 10)]
        _pline(canvas, tie_pts, gc, alpha=170, seed=seed + 40 + sgn, thick=1)

    # 4. Handle Throat and Baluster Stem
    bot_y = ry + 22
    hw = 22
    h_top = bot_y
    h_bot = h_top + 245
    steps = 36
    l_prof, r_prof = [], []

    for i in range(steps + 1):
        v = i / float(steps)
        curr_y = h_top + (h_bot - h_top) * v
        if v < 0.10:  # flared throat cup joining the oval frame
            w = hw * (1.35 - 0.45 * (v / 0.10))
        elif v < 0.20:  # neck collar
            w = hw * 0.90
        elif v < 0.50:  # bulbous gadrooned vase/knop
            nv = (v - 0.20) / 0.30
            w = hw * (0.90 + 0.65 * math.sin(nv * math.pi))
        elif v < 0.62:  # waist with ring moldings
            w = hw * 0.75
        elif v < 0.88:  # lower fluted stem
            nv = (v - 0.62) / 0.26
            w = hw * (0.75 + 0.35 * math.sin(nv * math.pi * 0.5))
        else:  # terminal base collar
            w = hw * 0.95
        l_prof.append(rot(-w, curr_y))
        r_prof.append(rot(w, curr_y))

    _pline(canvas, l_prof, gc, alpha=225, seed=seed + 70, thick=2, wob=0.3)
    _pline(canvas, r_prof, gc, alpha=225, seed=seed + 71, thick=2, wob=0.3)

    # Turned Ring Moldings across the handle
    for ring_frac in (0.10, 0.20, 0.50, 0.56, 0.62, 0.88):
        ryy = h_top + (h_bot - h_top) * ring_frac
        ring_pts = [rot(hw * 1.35 * math.cos(u), ryy + 4 * math.sin(u)) for u in np.linspace(-math.pi, 0, 20)]
        _pline(canvas, ring_pts, gc, alpha=200, seed=seed + 80 + int(ring_frac * 100), thick=2)

    # Handle Shading: cylindrical volume hatching
    handle_poly = l_prof + r_prof[::-1]
    _hatch_polygon(canvas, handle_poly, step=4, angle=tilt + 85, gc=gc, alpha=60, seed=seed + 90)
    r_shadow = [rot(hw * 0.1, h_top + (h_bot - h_top) * (i / float(steps))) for i in range(steps + 1)] + r_prof[::-1]
    _hatch_polygon(canvas, r_shadow, step=3, angle=tilt + 65, gc=gc, alpha=85, seed=seed + 95)

    # Terminal Pommel / Finial: Turned sphere with pedestal
    pom_cy = h_bot + 24
    pom_r = 25
    pom_pts = [rot(pom_r * math.cos(u), pom_cy + pom_r * math.sin(u)) for u in np.linspace(0, 2 * math.pi, 36)]
    _pline(canvas, pom_pts, gc, alpha=225, seed=seed + 100, thick=2, wob=0.3)
    _hatch_polygon(canvas, pom_pts, step=3, angle=tilt + 45, gc=gc, alpha=100, seed=seed + 105)
    pom_cap = [rot(pom_r * 1.15 * math.cos(u), pom_cy - 4 + pom_r * 0.6 * math.sin(u)) for u in np.linspace(math.pi * 0.8, math.pi * 2.2, 20)]
    _pline(canvas, pom_cap, gc, alpha=180, seed=seed + 110, thick=1)
    finial_pts = [rot(8 * math.cos(u), pom_cy + pom_r + 10 + 8 * math.sin(u)) for u in np.linspace(0, 2 * math.pi, 20)]
    _pline(canvas, finial_pts, gc, alpha=190, seed=seed + 115, thick=1)

    # 5. Mirror Glass: Optical Reflections & Antique Sheen (NO TEXT)
    mask_glass = np.zeros(canvas.shape[:2], dtype=np.uint8)
    glass_pts = np.round(np.array(ell_pts(rx - 7, ry - 7))).astype(np.int32)
    cv2.fillPoly(mask_glass, [glass_pts], 255)

    sheen_layer = np.zeros_like(canvas)
    b1 = [rot(-rx * 0.75, -ry * 0.8), rot(-rx * 0.15, -ry * 0.95), rot(rx * 0.55, ry * 0.8), rot(-0.05 * rx, ry * 0.95)]
    _hatch_polygon(sheen_layer, b1, step=6, angle=tilt + 48, gc=gc, alpha=70, seed=seed + 120)
    b2 = [rot(-rx * 0.42, -ry * 0.85), rot(-rx * 0.22, -ry * 0.9), rot(rx * 0.35, ry * 0.85), rot(rx * 0.15, ry * 0.9)]
    _hatch_polygon(sheen_layer, b2, step=3, angle=tilt + 48, gc=gc, alpha=105, seed=seed + 125)

    for k in (0.35, 0.65, 0.85, 0.94):
        _pline(sheen_layer, ell_pts((rx - 7) * k, (ry - 7) * k), gc, alpha=35, seed=seed + 130 + int(k * 100), thick=1, wob=0.3)

    for k in range(5):
        s1 = rot(-rx * 0.55 + k * 26, -ry * 0.72)
        s2 = rot(-rx * 0.10 + k * 26, ry * 0.45)
        _pline(sheen_layer, [s1, s2], gc, alpha=85, seed=seed + 140 + k, thick=1)

    sheen_layer[:, :, 3] = (sheen_layer[:, :, 3].astype(np.uint16) * mask_glass // 255).astype(np.uint8)
    al = sheen_layer[:, :, 3:4].astype(np.float32) / 255.0
    canvas[:, :, :3] = (sheen_layer[:, :, :3] * al + canvas[:, :, :3] * (1.0 - al)).astype(np.uint8)
    canvas[:, :, 3] = np.maximum(canvas[:, :, 3], sheen_layer[:, :, 3])


def _draw_quill_and_ink(canvas, ix, iy, gc=GRAPHITE_COLOR, seed=19600):
    """Exquisite Renaissance Scholar's Inkpot and Goose Quill (Da Vinci / Dürer still life):
    Bulbous turned bronze inkstand with stepped plinth, gadrooning, dark glistening ink reservoir,
    and a realistic calligraphic primary goose feather with smooth rachis, dense sweeping barbs,
    natural plumage splits, calamus rings, and stained cut nib."""
    rng = np.random.default_rng(seed)

    # 1. Soft desk shadow
    shadow_well = [(ix - 80, iy + 4), (ix + 88, iy + 4), (ix + 104, iy + 22), (ix - 66, iy + 22)]
    _hatch_polygon(canvas, shadow_well, step=4, angle=35, gc=gc, alpha=40, seed=seed)
    shadow_quill = [(ix - 440, iy + 12), (ix - 85, iy + 8), (ix - 75, iy + 16), (ix - 430, iy + 20)]
    _hatch_polygon(canvas, shadow_quill, step=5, angle=35, gc=gc, alpha=30, seed=seed + 1)

    # 2. Renaissance Bronze Inkstand (Turned & Molded Urn Pot)
    _pline(canvas, [(ix - 76, iy), (ix + 76, iy), (ix + 72, iy - 12), (ix - 72, iy - 12)], gc, alpha=220, seed=seed + 10, closed=True, thick=2)
    _pline(canvas, [(ix - 72, iy - 12), (ix + 72, iy - 12), (ix + 65, iy - 20), (ix - 65, iy - 20)], gc, alpha=175, seed=seed + 11, closed=True)

    top_y = iy - 96
    mid_y = iy - 54
    pts_left = [(ix - 65, iy - 20), (ix - 78, mid_y), (ix - 72, mid_y - 20), (ix - 36, top_y)]
    pts_right = [(ix + 65, iy - 20), (ix + 78, mid_y), (ix + 72, mid_y - 20), (ix + 36, top_y)]
    _pline(canvas, pts_left, gc, alpha=225, seed=seed + 15, thick=2, wob=0.3)
    _pline(canvas, pts_right, gc, alpha=225, seed=seed + 16, thick=2, wob=0.3)

    for g in (-2, -1, 0, 1, 2):
        frac = g / 2.5
        g_bot = (ix + 60 * frac, iy - 20)
        g_mid = (ix + 72 * frac, mid_y)
        g_top = (ix + 32 * frac, top_y)
        _pline(canvas, [g_bot, g_mid, g_top], gc, alpha=180, seed=seed + 20 + g, thick=1, wob=0.3)

    body_poly = pts_left + [(ix + 36, top_y)] + pts_right[::-1]
    _hatch_polygon(canvas, body_poly, step=4, angle=65, gc=gc, alpha=50, seed=seed + 30)
    shadow_body = [(ix, top_y), (ix + 36, top_y)] + pts_right[::-1] + [(ix, iy - 20)]
    _hatch_polygon(canvas, shadow_body, step=3, angle=60, gc=gc, alpha=85, seed=seed + 35)

    neck_y = top_y - 16
    rim_y = top_y - 25
    _pline(canvas, [(ix - 36, top_y), (ix - 30, neck_y), (ix - 38, rim_y), (ix + 38, rim_y), (ix + 30, neck_y), (ix + 36, top_y)],
           gc, alpha=220, seed=seed + 40, thick=2, wob=0.3)

    res_ell = [(ix + 34 * math.cos(u), rim_y + 10 * math.sin(u)) for u in np.linspace(0, 2 * math.pi, 36)]
    _pline(canvas, res_ell, gc, alpha=240, seed=seed + 45, thick=2)
    _hatch_polygon(canvas, res_ell, step=2, angle=45, gc=gc, alpha=235, seed=seed + 46)
    _hatch_polygon(canvas, res_ell, step=2, angle=-45, gc=gc, alpha=200, seed=seed + 47)
    arc_pts = [(ix + 24 * math.cos(u), rim_y + 2 + 6 * math.sin(u)) for u in np.linspace(math.pi * 0.15, math.pi * 0.85, 20)]
    _pline(canvas, arc_pts, gc, alpha=65, seed=seed + 48, thick=1)

    loop = [(ix + 72 + 18 * math.cos(u), mid_y + 16 * math.sin(u)) for u in np.linspace(-math.pi * 0.5, math.pi * 0.7, 20)]
    _pline(canvas, loop, gc, alpha=195, seed=seed + 50, thick=2)

    # 3. Calligrapher's Goose Quill
    nib_x, nib_y = ix - 88, iy - 6
    shaft_len = 410.0
    ang = math.radians(-169)
    dx, dy = math.cos(ang), math.sin(ang)
    nx, ny = -dy, dx

    rachis_pts = []
    for i in range(51):
        u = i / 50.0
        curve = 26 * math.sin(math.pi * u) - 8 * math.sin(2 * math.pi * u)
        px = nib_x + dx * shaft_len * u + nx * curve
        py = nib_y + dy * shaft_len * u + ny * curve
        rachis_pts.append((px, py))

    _pline(canvas, rachis_pts, gc, alpha=235, seed=seed + 60, thick=2, wob=0.25)
    _pline(canvas, [(p[0] + 1, p[1] + 1) for p in rachis_pts[:26]], gc, alpha=160, seed=seed + 61, thick=1)

    nib_tri = [(nib_x, nib_y), (nib_x + dx * 26 + nx * 5, nib_y + dy * 26 + ny * 5),
               (nib_x + dx * 26 - nx * 5, nib_y + dy * 26 - ny * 5)]
    _pline(canvas, nib_tri, gc, alpha=240, seed=seed + 65, closed=True, thick=2)
    _pline(canvas, [(nib_x, nib_y), (nib_x + dx * 16, nib_y + dy * 16)], gc, alpha=240, seed=seed + 66, thick=2)
    cv2.circle(canvas, (int(nib_x + dx * 16), int(nib_y + dy * 16)), 2, (*gc, 240), -1, cv2.LINE_AA)
    _hatch_polygon(canvas, nib_tri, step=2, angle=45, gc=gc, alpha=225, seed=seed + 67)

    for r_k in (8, 14, 20):
        c_rx, c_ry = nib_x + dx * r_k, nib_y + dy * r_k
        _pline(canvas, [(c_rx - nx * 4, c_ry - ny * 4), (c_rx + nx * 4, c_ry + ny * 4)], gc, alpha=150, seed=seed + 70 + r_k, thick=1)

    u_start, u_end = 0.22, 0.98
    top_outline, bot_outline = [], []
    n_pts = 60
    for i in range(n_pts + 1):
        v = i / float(n_pts)
        u = u_start + (u_end - u_start) * v
        idx = int(u * 50)
        rx, ry = rachis_pts[idx]
        w_top = 46 * (math.sin(math.pi * v) ** 0.65) * (1.0 - 0.22 * v)
        w_bot = 28 * (math.sin(math.pi * v) ** 0.8) * (1.0 - 0.30 * v)
        if 0.36 < v < 0.40 or 0.66 < v < 0.70:
            w_top *= 0.78
        top_outline.append((rx - nx * w_top + dx * 12 * v, ry - ny * w_top + dy * 12 * v))
        bot_outline.append((rx + nx * w_bot + dx * 10 * v, ry + ny * w_bot + dy * 10 * v))

    _pline(canvas, top_outline, gc, alpha=205, seed=seed + 80, thick=1, wob=0.3)
    _pline(canvas, bot_outline, gc, alpha=195, seed=seed + 81, thick=1, wob=0.3)

    poly_top = rachis_pts[int(u_start * 50):int(u_end * 50)] + top_outline[::-1]
    _hatch_polygon(canvas, poly_top, step=3, angle=math.degrees(ang) + 38, gc=gc, alpha=70, seed=seed + 100)
    poly_bot = rachis_pts[int(u_start * 50):int(u_end * 50)] + bot_outline[::-1]
    _hatch_polygon(canvas, poly_bot, step=3, angle=math.degrees(ang) - 38, gc=gc, alpha=65, seed=seed + 110)

    for k in range(40):
        v = k / 39.0
        u = u_start + (u_end - u_start) * v
        idx = int(u * 50)
        rx, ry = rachis_pts[idx]
        tx, ty = top_outline[int(v * n_pts)]
        _pline(canvas, [(tx, ty), (tx + dx * 4 - nx * 2, ty + dy * 4 - ny * 2)], gc, alpha=130, seed=seed + 200 + k, thick=1)



def render_lore_19a_unsent_letter(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 19 · Cara A (front: X < 165 empty)."""
    c = _canvas()
    X0, W = FRONT_X0, TEXT_W
    _text(c, "The Unsent Letter", X0, 80, 64, 19001, gc)
    _divider(c, X0, 172, W, 19003, gc)
    y = _paragraph(c, HERMES_JOURNAL_19A, X0, 222, W, size=38, lh=52, seed=19010, gc=gc)
    y += 55


    # the letter: an ornate antique theatrical letter parchment written the way the glass sees it
    px0, px1, py0 = X0 + 30, X0 + W - 30, y
    inner_l, inner_r = px0 + 90, px1 - 90
    lines = []
    for text, kind in LETTER_19A:
        if kind == "p":
            lines += [(ln, "p") for ln in _wrap(text, LETTER_PT, inner_r - inner_l)] + [("", "gap")]
        else:
            lines += [(text, kind), ("", "gap")]
    lh = LETTER_LH
    py1 = py0 + 98 + sum(lh if k != "gap" else 24 for _, k in lines) + 38
    _draw_theatrical_letter_parchment(c, px0, py0, px1, py1, gc, 19100)

    ty = py0 + 98
    for k, (text, kind) in enumerate(lines):
        if kind == "gap":
            ty += 24
            continue
        if kind == "salute":   # mirrored: the first words of each line sit on the right
            _text(c, text, inner_r, ty, LETTER_PT + 2, 19200 + k, gc, mirror=True, anchor="right")
        elif kind == "sign":
            _text(c, text, inner_l, ty + 8, LETTER_PT + 2, 19200 + k, gc, mirror=True, anchor="left")
        else:
            _text(c, text, inner_r, ty, LETTER_PT, 19200 + k, gc, mirror=True, anchor="right")
        ty += lh
    y = py1 + 65

    # a hand mirror to show the way, and Hermes' unified journal entry
    mx, my = X0 + 300, y + 190
    _draw_hand_mirror(c, mx, my, 230, 140, gc=gc, seed=19400)
    nx = X0 + 650
    col_w = X0 + W - nx
    hermes_entry = ("From this high pass, Tower III rises before me: a colossal amphitheatre carved into the "
                    "mountain rim, its grand stage facing the abyss. The letter in the cedar chest changes everything. "
                    "The Great Mirror was not destroyed by chance, but broken by design—divided into nine fragments "
                    "and hidden across the nine halls of the theatre to safeguard the Astrolabe from the Ashes. "
                    "With this looking glass and my journal in hand, I step toward the Gate of a Thousand Masks. "
                    "The Stage Path has begun.")
    ny = _paragraph(c, hermes_entry, nx, y + 10, col_w, size=34, lh=48, seed=19500, gc=gc)
    _draw_quill_and_ink(c, X0 + W - 120, CANVAS_HEIGHT_PX - FOOT - 40, gc=gc, seed=19600)
    return _clear_foot(c)


# -------------------------------------------------------------------------
# SHEET 19 · CARA B · THE GATE OF A THOUSAND MASKS (STATION 20)
# -------------------------------------------------------------------------
# Twelve masks, read left to right and row by row. Six are true (both halves match);
# six lie (one half differs). The letters of the six liars, in reading order, give the word of the gate.

# Twelve masterwork masks, four across and three down.
# Six are true (cast in perfect symmetry, true to the sacred glass);
# six lie (hiding subtle flaws in their features, carved to deceive the unwary).
# Pure Renaissance codex study: zero letters, zero numbers.

MASK_OUTLINES_12 = [
    # 0: Volto Nobile (classical oval)
    [(0, -142), (42, -139), (78, -126), (100, -100), (108, -60), (106, -16), (100, 26), (88, 66), (68, 100), (42, 124), (18, 137), (0, 141)],
    # 1: Dama del Pianto (slender elongated visage)
    [(0, -148), (38, -145), (70, -132), (90, -102), (98, -60), (96, -15), (90, 30), (78, 72), (60, 108), (36, 134), (16, 147), (0, 150)],
    # 2: Sacerdotessa della Luna (porcelain circular moon)
    [(120 * math.sin(math.pi * i / 28), -128 * math.cos(math.pi * i / 28)) for i in range(29)],
    # 3: Senatore Bauta (prominent jutting square beak chin)
    [(0, -142), (45, -138), (84, -122), (106, -92), (114, -50), (112, -6), (106, 36), (102, 74), (106, 102), (92, 124), (58, 134), (20, 138), (0, 139)],
    # 4: Arlecchino Alato (flared cat-eye winged temples)
    [(0, -136), (46, -136), (88, -120), (116, -90), (122, -54), (110, -18), (96, 22), (80, 62), (62, 96), (38, 122), (16, 136), (0, 139)],
    # 5: Filosofo Antico (rugged brow, cleft chin)
    [(0, -140), (48, -138), (86, -124), (108, -94), (112, -52), (108, -10), (102, 32), (92, 70), (78, 102), (54, 126), (28, 138), (0, 140)],
    # 6: Sirena Incoronata (graceful oval framed by braided locks)
    [(0, -144), (40, -140), (76, -126), (98, -98), (104, -58), (102, -14), (96, 28), (84, 68), (66, 102), (40, 126), (18, 138), (0, 142)],
    # 7: Re Infranto (angular sovereign visage with crown)
    [(0, -140), (44, -138), (82, -124), (104, -96), (110, -56), (108, -12), (102, 30), (90, 70), (72, 104), (46, 128), (20, 140), (0, 142)],
    # 8: Astrologo Bauta (triangular swept Bauta jaw)
    [(0, -140), (44, -136), (82, -120), (102, -90), (110, -48), (108, -4), (102, 38), (96, 76), (98, 104), (82, 126), (48, 136), (18, 140), (0, 141)],
    # 9: Oracolo Velato (ascetic visage with draped cowl)
    [(0, -146), (40, -142), (74, -128), (94, -98), (100, -58), (96, -14), (88, 28), (76, 68), (58, 104), (36, 130), (16, 144), (0, 147)],
    # 10: Pierrot Melanconico (heart-shaped face with collar ruff)
    [(0, -138), (44, -136), (82, -122), (104, -94), (108, -52), (102, -12), (92, 28), (76, 68), (56, 102), (34, 126), (14, 138), (0, 140)],
    # 11: Guardia di Bronzo (heavy riveted visor helmet)
    [(0, -142), (48, -140), (88, -124), (110, -96), (114, -54), (112, -10), (106, 34), (98, 74), (84, 108), (62, 132), (32, 142), (0, 144)],
]

def _smooth_mask_contour(pts, n_samples=12):
    out = []
    P = [pts[0]] + pts + [pts[-1]]
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(n_samples):
            t = k / float(n_samples)
            t2 = t * t
            t3 = t2 * t
            out.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in range(2)))
    out.append(pts[-1])
    return out

def _curve_catmull(pts, n_steps=10):
    if len(pts) < 3:
        return pts
    out = []
    P = [pts[0]] + list(pts) + [pts[-1]]
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(n_steps):
            t = k / float(n_steps)
            t2 = t * t
            t3 = t2 * t
            pt = tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t +
                              (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 +
                              (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in range(2))
            out.append(pt)
    out.append(pts[-1])
    return out


def draw_unique_theatrical_mask(canvas, cx, cy, idx, gc=GRAPHITE_COLOR, seed=19800, s=0.90):
    """Draws one of the 12 masterwork theatrical masks for Tower III.
    Masterwork Da Vinci / Serlio Renaissance style:
    - Pure sculptural elegance: crisp multi-pass graphite line work with authentic chiaroscuro.
    - True three-dimensional depth: sculpted orbital arches, realistic eyelid apertures with dark hollow interiors,
      nasal bridge modeling with side shading, sculpted philtrum and lips, and volumetric form hatching.
    - Unique historical Venetian archetype silhouettes, headdresses, and drapery.
    - Zero letters, zero numbers.
    - 6 symmetric (0, 2, 5, 6, 8, 11); 6 subtle flaws/asymmetries (1, 3, 4, 7, 9, 10).
    """
    rng = np.random.default_rng(seed)
    right = _smooth_mask_contour(MASK_OUTLINES_12[idx], n_samples=12)
    P = lambda sgn, pts, sx=1.0, sy=1.0, dy=0.0: [(cx + sgn * x * sx * s, cy + (y * sy + dy) * s) for x, y in pts]
    def both(pts, alpha=200, salt=0, thick=1, closed=False, passes=2, wob=0.32):
        for sgn in (+1, -1):
            _pline(canvas, P(sgn, pts), gc, alpha=alpha, seed=seed + salt + (7 if sgn > 0 else 13), thick=thick, closed=closed, passes=passes, wob=wob)

    # 1. HANGING NAIL & CORD
    nail_y = cy - 180 * s
    nail_poly = [(cx - 4 * s, nail_y - 4 * s), (cx + 4 * s, nail_y - 4 * s), (cx + 5 * s, nail_y + 4 * s), (cx - 3 * s, nail_y + 5 * s)]
    _pline(canvas, nail_poly, gc, alpha=240, seed=seed + 1, closed=True, thick=2)
    _hatch_polygon(canvas, nail_poly, step=2, angle=45, gc=gc, alpha=220, seed=seed + 2)
    _pline(canvas, [(cx - 3 * s, nail_y + 6 * s), (cx + 6 * s, nail_y + 6 * s)], gc, alpha=160, seed=seed + 3, thick=2)
    
    tx, ty = min(right, key=lambda p: abs(p[1] + 96))
    for sgn in (+1, -1):
        c_pts = [(cx + sgn * 2 * s, nail_y + 4 * s), (cx + sgn * tx * 0.45 * s, cy - 146 * s), (cx + sgn * tx * s, cy + ty * s)]
        _pline(canvas, _curve_catmull(c_pts, 8), gc, alpha=160, seed=seed + 4 + sgn, passes=2, wob=0.3)
        cv2.circle(canvas, (int(cx + sgn * tx * s), int(cy + ty * s)), int(3 * s), (*gc, 200), 1, cv2.LINE_AA)

    # 2. MASK SHELL & SCULPTED RIM
    face_outer = P(+1, right) + P(-1, list(reversed(right[:-1])))
    rim_inner = [(x * 0.93, y * 0.94 + 1) for x, y in right]
    face_inner = P(+1, rim_inner) + P(-1, list(reversed(rim_inner[:-1])))

    _pline(canvas, face_outer, gc, alpha=245, seed=seed + 10, closed=True, thick=2, passes=2, wob=0.3)
    _pline(canvas, face_inner, gc, alpha=135, seed=seed + 11, closed=True, thick=1, passes=1, wob=0.25)

    shadow_flank = P(-1, right) + P(-1, list(reversed(rim_inner)))
    _hatch_polygon(canvas, shadow_flank, step=4, angle=120, gc=gc, alpha=38, seed=seed + 12)

    if idx not in (7, 11):
        for sgn in (+1, -1):
            if not (idx == 1 and sgn == +1):
                cheek_pts = P(sgn, [(42, 32), (64, 44), (56, 70), (36, 56)])
                _hatch_polygon(canvas, cheek_pts, step=4, angle=40 if sgn > 0 else 140, gc=gc, alpha=30, seed=seed + 13 + sgn)

    # 3. NOSE & NASAL ARCHITECTURE
    if idx in (3, 8): # Bauta: sharp angular projecting beak with curved bridge
        beak_pts = _curve_catmull([(0, -36), (5, -22), (9, 6), (14, 26), (17, 38), (4, 42)], 8)
        both(beak_pts, 230, 20, thick=2)
        beak_under = P(+1, [(0, 42), (17, 38), (9, 46), (0, 48)]) + P(-1, [(9, 46), (17, 38), (0, 42)])
        _hatch_polygon(canvas, beak_under, step=2, angle=0, gc=gc, alpha=160, seed=seed + 21)
        _pline(canvas, P(-1, _curve_catmull([(4, -22), (8, 8), (13, 28)], 8)), gc, alpha=170, seed=seed + 22, thick=1)
    elif idx == 11: # Bronze Visor nose
        both([(0, -32), (7, -26), (11, 14), (15, 34), (5, 36)], 235, 20, thick=2)
        _pline(canvas, [(cx, cy - 32 * s), (cx, cy + 36 * s)], gc, alpha=220, seed=seed + 21, thick=2)
    else: # Sculpted classical nose
        both([(5, -24), (8, 4), (13, 24)], 185, 20)
        bridge_shade = P(-1, [(2, -20), (6, 2), (11, 22), (6, 24), (0, 4)])
        _hatch_polygon(canvas, bridge_shade, step=3, angle=65, gc=gc, alpha=40, seed=seed + 21)
        both([(13, 24), (17, 31), (12, 36), (3, 35)], 210, 22, thick=1)
        both([(17, 29), (23, 32), (20, 37), (13, 36)], 160, 23)
        both([(5, 34), (11, 35), (9, 37), (4, 36)], 230, 24, closed=True)
        both([(3, 38), (4, 56)], 120, 25, passes=1)

    # 4. LIPS & CHIN
    lip_curve = 8 if idx == 5 else (-8 if idx in (1, 2, 4, 6, 10) else 0)
    if idx == 1: # Weeping Muse
        both([(0, 64), (7, 60), (16, 62), (25, 66), (0, 68)], 220, 30, closed=True)
        both([(0, 72), (13, 74), (25, 66), (16, 80), (0, 83)], 220, 31, closed=True)
        mouth_hole = P(+1, [(0, 68), (15, 68), (0, 72)]) + P(-1, [(15, 68), (0, 68), (0, 72)])
        _hatch_polygon(canvas, mouth_hole, step=2, angle=0, gc=gc, alpha=190, seed=seed + 32)
        _pline(canvas, P(+1, [(0, 88), (13, 89), (20, 86)]) + P(-1, [(20, 86), (13, 89), (0, 88)]), gc, alpha=140, seed=seed + 33)
    elif idx == 11: # Bronze visor
        _pline(canvas, [(cx - 28 * s, cy + 72 * s), (cx + 28 * s, cy + 72 * s)], gc, alpha=240, seed=seed + 30, thick=2)
        _pline(canvas, [(cx - 24 * s, cy + 76 * s), (cx + 24 * s, cy + 76 * s)], gc, alpha=180, seed=seed + 31)
        for br_k in range(-2, 3):
            _pline(canvas, [(cx + br_k * 10 * s, cy + 68 * s), (cx + br_k * 10 * s, cy + 80 * s)], gc, alpha=190, seed=seed + 32 + br_k)
    else: # Sculpted classical lips
        upper_lip = P(+1, [(0, 66), (6, 62), (14, 64), (24, 66 + lip_curve * 0.4), (32, 70 + lip_curve), (18, 71 + lip_curve * 0.4), (0, 71)]) +                     P(-1, list(reversed([(0, 66), (6, 62), (14, 64), (24, 66 + lip_curve * 0.4), (32, 70 + lip_curve), (18, 71 + lip_curve * 0.4), (0, 71)])))
        _pline(canvas, upper_lip, gc, alpha=210, seed=seed + 30, closed=True)
        _hatch_polygon(canvas, upper_lip, step=3, angle=45, gc=gc, alpha=45, seed=seed + 31)
        both([(0, 71), (15, 71 + lip_curve * 0.45), (31, 70 + lip_curve)], 235, 32, thick=2)
        both([(31, 70 + lip_curve), (33, 73 + lip_curve)], 230, 33, thick=2)
        both([(31, 70 + lip_curve), (19, 81 + lip_curve * 0.4), (10, 84), (0, 85)], 190, 34)
        both([(0, 90), (12, 91), (19, 88)], 140, 35)

    # 5. EYES & BROWS
    for sgn in (+1, -1):
        if idx == 9 and sgn == +1: # Oracle: Blind Carved Solar Disc
            disc_center = (cx + sgn * 38 * s, cy - 28 * s)
            cv2.circle(canvas, (int(disc_center[0]), int(disc_center[1])), int(16 * s), (*gc, 240), 2, cv2.LINE_AA)
            cv2.circle(canvas, (int(disc_center[0]), int(disc_center[1])), int(8 * s), (*gc, 200), 1, cv2.LINE_AA)
            _hatch_polygon(canvas, [(disc_center[0] + 15*s*math.cos(2*math.pi*k/16), disc_center[1] + 15*s*math.sin(2*math.pi*k/16)) for k in range(16)], step=3, angle=45, gc=gc, alpha=170, seed=seed+20)
            for r_k in range(12):
                a_r = 2 * math.pi * r_k / 12.0
                r_in = 18 * s
                r_out = (26 if r_k % 2 == 0 else 22) * s
                _pline(canvas, [(disc_center[0] + r_in*math.cos(a_r), disc_center[1] + r_in*math.sin(a_r)),
                                (disc_center[0] + r_out*math.cos(a_r), disc_center[1] + r_out*math.sin(a_r))], gc, alpha=210, seed=seed+21+r_k, thick=2 if r_k % 2 == 0 else 1)
        elif idx == 11: # Bronze Visor
            slit = P(sgn, [(16, -34), (54, -34), (54, -20), (16, -20)])
            _pline(canvas, slit, gc, alpha=240, seed=seed + 20 + sgn, closed=True, thick=2)
            _hatch_polygon(canvas, slit, step=3, angle=45, gc=gc, alpha=190, seed=seed + 21 + sgn)
            _pline(canvas, P(sgn, [(35, -37), (35, -17)]), gc, alpha=230, seed=seed + 22 + sgn, thick=2)
        elif idx == 2: # Moon Priestess
            crescent_top = P(sgn, [(16, -24), (30, -35), (44, -37), (56, -29)])
            crescent_bot = P(sgn, [(56, -29), (44, -30), (30, -28), (16, -24)])
            crescent_poly = crescent_top + crescent_bot
            _pline(canvas, crescent_poly, gc, alpha=235, seed=seed + 20 + sgn, closed=True, thick=2)
            _hatch_polygon(canvas, crescent_poly, step=3, angle=45, gc=gc, alpha=180, seed=seed + 21 + sgn)
            _pline(canvas, P(sgn, [(18, -41), (34, -44), (52, -37)]), gc, alpha=150, seed=seed + 22 + sgn)
        else: # Sculpted almond eye
            upper_lid = _curve_catmull(P(sgn, [(16, -28), (28, -37), (44, -38), (56, -30)]), 8)
            lower_lid = _curve_catmull(P(sgn, [(56, -30), (44, -22), (28, -23), (16, -28)]), 8)
            eye_poly = upper_lid + lower_lid
            _pline(canvas, eye_poly, gc, alpha=240, seed=seed + 20 + sgn, closed=True, thick=2)
            _hatch_polygon(canvas, eye_poly, step=3, angle=45, gc=gc, alpha=185, seed=seed + 21 + sgn)
            crease = _curve_catmull(P(sgn, [(18, -41), (34, -45), (52, -39)]), 8)
            _pline(canvas, crease, gc, alpha=160, seed=seed + 23 + sgn)
            socket_pts = P(sgn, [(14, -47), (32, -52), (52, -48), (50, -41), (34, -45), (16, -41)])
            _hatch_polygon(canvas, socket_pts, step=3, angle=65 if sgn > 0 else 115, gc=gc, alpha=35, seed=seed + 24 + sgn)

        # Brows
        if idx == 3 and sgn == -1: # Bauta: BROKEN left brow volute
            brow_pts = P(sgn, [(10, -54), (24, -61), (38, -63)])
            _pline(canvas, brow_pts, gc, alpha=230, seed=seed + 30 + sgn, thick=2)
            _pline(canvas, P(sgn, [(38, -68), (42, -63), (37, -58), (41, -54)]), gc, alpha=240, seed=seed + 31, thick=2)
            _hatch_polygon(canvas, P(sgn, [(37, -68), (43, -63), (37, -56)]), step=2, angle=45, gc=gc, alpha=120, seed=seed + 32)
        elif idx == 3 and sgn == +1: # Bauta: Intact right brow scroll
            brow_pts = P(sgn, [(10, -54), (24, -61), (42, -64), (58, -60), (64, -52), (60, -46), (52, -48)])
            _pline(canvas, _curve_catmull(brow_pts, 8), gc, alpha=230, seed=seed + 30 + sgn, thick=2)
        elif idx == 5: # Ancient Stoic: Curved forehead wrinkles
            brow_pts = P(sgn, [(8, -52), (24, -58), (44, -60), (64, -56)])
            _pline(canvas, brow_pts, gc, alpha=240, seed=seed + 30 + sgn, thick=2)
            _pline(canvas, P(sgn, [(4, -48), (4, -66)]), gc, alpha=210, seed=seed + 31 + sgn, thick=1)
            _pline(canvas, P(sgn, [(9, -50), (8, -63)]), gc, alpha=170, seed=seed + 32 + sgn, thick=1)
            for f_i, (f_y, f_span) in enumerate(((-82, 48), (-96, 42), (-110, 36))):
                wrinkle = [(cx - f_span * s, cy + f_y * s), (cx, cy + (f_y - 6) * s), (cx + f_span * s, cy + f_y * s)]
                _pline(canvas, _curve_catmull(wrinkle, 8), gc, alpha=160, seed=seed + 33 + f_i)
        elif idx == 10: # Pierrot
            brow_pts = P(sgn, [(14, -60), (32, -72), (52, -72), (66, -62)])
            _pline(canvas, _curve_catmull(brow_pts, 8), gc, alpha=220, seed=seed + 30 + sgn, thick=2)
        else:
            brow_pts = P(sgn, [(12, -54), (28, -62), (46, -64), (62, -60), (70, -52)])
            _pline(canvas, _curve_catmull(brow_pts, 8), gc, alpha=220, seed=seed + 30 + sgn, thick=2)

    # 6. HEADDRESSES & ORNAMENTS
    my = cy - 100 * s

    # MASK 0: Volto Nobile - Ornate Laurel Wreath
    if idx == 0:
        gem_box = [(cx - 9 * s, my - 12 * s), (cx + 9 * s, my - 12 * s), (cx + 11 * s, my + 6 * s), (cx - 11 * s, my + 6 * s)]
        _pline(canvas, gem_box, gc, alpha=240, seed=seed + 40, closed=True, thick=2)
        _hatch_polygon(canvas, gem_box, step=2, angle=45, gc=gc, alpha=90, seed=seed + 41)
        cv2.circle(canvas, (int(cx), int(my - 3 * s)), int(5 * s), (*gc, 230), -1, cv2.LINE_AA)
        for sgn in (+1, -1):
            stem = P(sgn, [(12, -102), (32, -105), (54, -104), (72, -98), (88, -88)])
            _pline(canvas, _curve_catmull(stem, 8), gc, alpha=210, seed=seed + 42 + sgn, thick=2)
            for lf_k in range(5):
                lx = 16 + lf_k * 14
                ly = -104 - lf_k * 2
                leaf = P(sgn, [(lx, ly), (lx + 6, ly - 10), (lx + 15, ly - 8), (lx + 11, ly + 2), (lx, ly)])
                _pline(canvas, _curve_catmull(leaf, 6), gc, alpha=210, seed=seed + 44 + lf_k * sgn, closed=True)
                _pline(canvas, P(sgn, [(lx, ly), (lx + 11, ly - 4)]), gc, alpha=160, seed=seed + 46 + lf_k * sgn)
        for sgn in (+1, -1):
            d_outer = P(sgn, [(44, 20), (58, 35), (44, 50), (30, 35)])
            d_inner = P(sgn, [(44, 25), (52, 35), (44, 45), (36, 35)])
            _pline(canvas, d_outer, gc, alpha=210, seed=seed + 50 + sgn, closed=True, thick=2)
            _pline(canvas, d_inner, gc, alpha=160, seed=seed + 51 + sgn, closed=True)
            _hatch_polygon(canvas, d_inner, step=2, angle=45, gc=gc, alpha=80, seed=seed + 52 + sgn)

    # MASK 1: Dama del Pianto - 5-Tier Pearl Garland & Crystal Teardrop
    elif idx == 1:
        for p_k in (-3, -2, -1, 0, 1, 2, 3):
            px = cx + p_k * 15 * s
            py = my - 6 * s + (abs(p_k) ** 1.3) * 3 * s
            cv2.circle(canvas, (int(px), int(py)), int(5 * s), (*gc, 240), 2, cv2.LINE_AA)
            cv2.circle(canvas, (int(px), int(py)), int(2 * s), (*gc, 210), -1, cv2.LINE_AA)
        for sgn in (+1, -1):
            swag = P(sgn, [(0, -96), (18, -88), (36, -90), (54, -84), (68, -76)])
            _pline(canvas, _curve_catmull(swag, 8), gc, alpha=160, seed=seed + 42 + sgn, passes=1)
        # Asymmetry: Teardrop on +1
        tear_pts = P(+1, [(46, 8), (56, 22), (58, 38), (46, 50), (34, 38), (36, 22)])
        _pline(canvas, tear_pts, gc, alpha=240, seed=seed + 50, closed=True, thick=2)
        _hatch_polygon(canvas, tear_pts, step=3, angle=35, gc=gc, alpha=160, seed=seed + 51)
        _pline(canvas, P(+1, [(46, 8), (46, 50)]), gc, alpha=210, seed=seed + 52, thick=1)
        _pline(canvas, P(+1, [(36, 22), (56, 22)]), gc, alpha=190, seed=seed + 53, thick=1)
        _pline(canvas, P(+1, [(34, 38), (58, 38)]), gc, alpha=190, seed=seed + 54, thick=1)

    # MASK 2: Sacerdotessa della Luna - Crescent Moon Diadem & Star Coordinates
    elif idx == 2:
        n_m = 16
        moon_outer = [(cx + 30 * s * math.sin(math.pi * (t / (n_m - 1) - 0.5)),
                       my - 16 * s - 24 * s * math.cos(math.pi * (t / (n_m - 1) - 0.5))) for t in range(n_m)]
        moon_inner = [(cx + 30 * s * math.sin(math.pi * (t / (n_m - 1) - 0.5)),
                       my - 28 * s - 12 * s * math.cos(math.pi * (t / (n_m - 1) - 0.5))) for t in range(n_m)]
        moon_poly = moon_outer + list(reversed(moon_inner))
        _pline(canvas, moon_poly, gc, alpha=240, seed=seed + 40, closed=True, thick=2)
        _hatch_polygon(canvas, moon_poly, step=3, angle=45, gc=gc, alpha=85, seed=seed + 41)
        _pline(canvas, [(cx, my - 8 * s), (cx, my + 6 * s)], gc, alpha=200, seed=seed + 42)
        cv2.circle(canvas, (int(cx), int(my + 8 * s)), int(4 * s), (*gc, 240), -1, cv2.LINE_AA)
        for sgn in (+1, -1):
            for (sx, sy) in ((50, 18), (64, 34), (52, 50)):
                _pline(canvas, P(sgn, [(sx - 5, sy), (sx + 5, sy)]), gc, alpha=190, seed=seed + 50 + sgn, thick=1)
                _pline(canvas, P(sgn, [(sx, sy - 5), (sx, sy + 5)]), gc, alpha=190, seed=seed + 51 + sgn, thick=1)

    # MASK 3: Senatore Bauta - Classical Cartouche & Broken Left Brow Scroll
    elif idx == 3:
        cartouche = [(cx, my + 16 * s), (cx + 18 * s, my), (cx + 14 * s, my - 16 * s),
                     (cx - 14 * s, my - 16 * s), (cx - 18 * s, my)]
        _pline(canvas, cartouche, gc, alpha=240, seed=seed + 40, closed=True, thick=2)
        _hatch_polygon(canvas, cartouche, step=3, angle=45, gc=gc, alpha=80, seed=seed + 41)
        cv2.circle(canvas, (int(cx), int(my - 2 * s)), int(4 * s), (*gc, 220), -1, cv2.LINE_AA)
        volute_r = P(+1, [(16, -114), (32, -120), (48, -118), (60, -110), (58, -100), (46, -98)])
        _pline(canvas, _curve_catmull(volute_r, 8), gc, alpha=210, seed=seed + 43, thick=2)
        volute_l_broken = P(-1, [(16, -114), (30, -118), (34, -112), (28, -106)])
        _pline(canvas, volute_l_broken, gc, alpha=230, seed=seed + 44, thick=2)
        _hatch_polygon(canvas, P(-1, [(26, -120), (36, -114), (30, -104)]), step=2, angle=45, gc=gc, alpha=120, seed=seed + 45)

    # MASK 4: Arlecchino Alato - Butterfly Mask Filigree & Magnificent Feather Plume
    elif idx == 4:
        for sgn in (+1, -1):
            wing = _curve_catmull(P(sgn, [(0, -92), (12, -110), (28, -114), (40, -102), (32, -92), (18, -88), (0, -92)]), 8)
            _pline(canvas, wing, gc, alpha=210, seed=seed + 40 + sgn, closed=True, thick=2)
            _hatch_polygon(canvas, wing, step=3, angle=30 if sgn > 0 else 150, gc=gc, alpha=60, seed=seed + 41 + sgn)
        cv2.circle(canvas, (int(cx), int(my + 2 * s)), int(5 * s), (*gc, 240), -1, cv2.LINE_AA)
        # Asymmetry: Feather Plume on +1
        spine = P(+1, [(68 + 4.8 * i, -84 - 12 * i + 0.35 * i * i) for i in range(16)])
        _pline(canvas, _curve_catmull(spine, 8), gc, alpha=245, seed=seed + 50, thick=2)
        for i in range(2, 16):
            sx, sy = spine[i]
            ln = (10 + 1.4 * (15 - abs(i - 8))) * s
            _pline(canvas, [(sx, sy), (sx + ln, sy + ln * 0.4)], gc, alpha=200, seed=seed + 52 + i, thick=1)
            _pline(canvas, [(sx, sy), (sx - ln * 0.55, sy - ln * 0.65)], gc, alpha=200, seed=seed + 53 + i, thick=1)
        cv2.circle(canvas, (int(cx - 68 * s), int(cy - 84 * s)), int(5 * s), (*gc, 210), 2, cv2.LINE_AA)
        _pline(canvas, P(-1, [(68, -84), (76, -72), (72, -60)]), gc, alpha=180, seed=seed + 55, thick=1)

    # MASK 5: Filosofo Antico - Cleft Chin & Temple Oak Sprigs
    elif idx == 5:
        _pline(canvas, [(cx, cy + 118 * s), (cx, cy + 138 * s)], gc, alpha=220, seed=seed + 40, thick=2)
        both([(4, 124), (8, 134), (2, 140)], 160, 41)
        both([(18, 36), (28, 60), (36, 86)], 200, 42, thick=2)
        for sgn in (+1, -1):
            for lf_k in range(3):
                lx = 64 + lf_k * 10
                ly = -84 - lf_k * 6
                leaf = P(sgn, [(lx, ly), (lx + 6, ly - 8), (lx + 12, ly - 6), (lx + 6, ly + 2), (lx, ly)])
                _pline(canvas, _curve_catmull(leaf, 6), gc, alpha=180, seed=seed + 45 + lf_k * sgn, closed=True)

    # MASK 6: Sirena Incoronata - Braided Hair Locks & 6-Petal Rosette Medallion
    elif idx == 6:
        cv2.circle(canvas, (int(cx), int(my)), int(13 * s), (*gc, 240), 2, cv2.LINE_AA)
        cv2.circle(canvas, (int(cx), int(my)), int(5 * s), (*gc, 200), -1, cv2.LINE_AA)
        for ang in range(0, 360, 60):
            rad = math.radians(ang)
            cv2.circle(canvas, (int(cx + 9 * s * math.cos(rad)), int(my + 9 * s * math.sin(rad))), int(4 * s), (*gc, 190), 1, cv2.LINE_AA)
        for sgn in (+1, -1):
            braid_spine = P(sgn, [(74, -28), (92, -8), (100, 18), (96, 50), (86, 80), (94, 108)])
            _pline(canvas, _curve_catmull(braid_spine, 8), gc, alpha=220, seed=seed + 50 + sgn, thick=2)
            braid_inner = P(sgn, [(74, -28), (82, -4), (86, 22), (80, 54), (78, 84)])
            _pline(canvas, _curve_catmull(braid_inner, 8), gc, alpha=170, seed=seed + 51 + sgn)
            for b_i in range(len(braid_inner) - 1):
                p1, p2 = braid_spine[b_i + 1], braid_inner[b_i]
                _pline(canvas, [p1, p2], gc, alpha=160, seed=seed + 52 + b_i * sgn)

    # MASK 7: Re Infranto - 5-Pointed Renaissance Crown & Lightning Fracture
    elif idx == 7:
        crown_outer = _curve_catmull([
            (cx - 52 * s, cy - 94 * s),
            (cx - 48 * s, cy - 118 * s),
            (cx - 40 * s, cy - 140 * s),
            (cx - 32 * s, cy - 124 * s),
            (cx - 24 * s, cy - 110 * s),
            (cx - 12 * s, cy - 130 * s),
            (cx, cy - 150 * s),
            (cx + 12 * s, cy - 130 * s),
            (cx + 24 * s, cy - 110 * s),
            (cx + 32 * s, cy - 124 * s),
            (cx + 40 * s, cy - 140 * s),
            (cx + 48 * s, cy - 118 * s),
            (cx + 52 * s, cy - 94 * s),
            (cx, cy - 86 * s)
        ], 6)
        _pline(canvas, crown_outer, gc, alpha=240, seed=seed + 40, closed=True, thick=2)
        _hatch_polygon(canvas, crown_outer, step=4, angle=45, gc=gc, alpha=70, seed=seed + 41)
        for j_x, j_y in ((-40, -140), (-24, -110), (0, -150), (24, -110), (40, -140)):
            cv2.circle(canvas, (int(cx + j_x * s), int(cy + j_y * s)), int(3.5 * s), (*gc, 240), -1, cv2.LINE_AA)
        # Asymmetry: Lightning fracture on -1
        crack_pts = P(-1, [(40, -140), (34, -110), (38, -82), (30, -54), (42, -16), (32, 18), (46, 56), (34, 94), (18, 136)])
        _pline(canvas, crack_pts, gc, alpha=245, seed=seed + 50, thick=2)
        _pline(canvas, P(-1, [(38, -82), (56, -88)]), gc, alpha=210, seed=seed + 51, thick=1)
        _pline(canvas, P(-1, [(30, -54), (52, -60)]), gc, alpha=210, seed=seed + 52, thick=1)
        _pline(canvas, P(-1, [(32, 18), (56, 12)]), gc, alpha=210, seed=seed + 53, thick=1)
        _pline(canvas, P(-1, [(46, 56), (66, 62)]), gc, alpha=210, seed=seed + 54, thick=1)

    # MASK 8: Astrologo Bauta - Astrolabe Rete & Compass Star
    elif idx == 8:
        cv2.circle(canvas, (int(cx), int(my)), int(18 * s), (*gc, 240), 2, cv2.LINE_AA)
        cv2.circle(canvas, (int(cx), int(my)), int(11 * s), (*gc, 180), 1, cv2.LINE_AA)
        _pline(canvas, [(cx - 22 * s, my), (cx + 22 * s, my)], gc, alpha=210, seed=seed + 40, thick=1)
        _pline(canvas, [(cx, my - 22 * s), (cx, my + 22 * s)], gc, alpha=210, seed=seed + 41, thick=1)
        for a_idx in range(8):
            a_th = math.pi * a_idx / 4.0
            r_outer = (24 if a_idx % 2 == 0 else 15) * s
            _pline(canvas, [(cx, my), (cx + r_outer * math.cos(a_th), my + r_outer * math.sin(a_th))], gc, alpha=220, seed=seed + 42 + a_idx, thick=2 if a_idx % 2 == 0 else 1)
        for sgn in (+1, -1):
            _pline(canvas, P(sgn, [(40, 26), (62, 26)]), gc, alpha=200, seed=seed + 50 + sgn, thick=2)
            _pline(canvas, P(sgn, [(51, 15), (51, 37)]), gc, alpha=200, seed=seed + 51 + sgn, thick=2)
            cv2.circle(canvas, (int(cx + sgn * 51 * s), int(cy + 26 * s)), int(3 * s), (*gc, 210), 1, cv2.LINE_AA)

    # MASK 9: Oracolo Velato - Draped Monastic Cowl & Blind Sun-Disc
    elif idx == 9:
        cowl_top = _curve_catmull([
            (cx - 70 * s, cy - 76 * s),
            (cx - 52 * s, cy - 114 * s),
            (cx, cy - 124 * s),
            (cx + 52 * s, cy - 114 * s),
            (cx + 70 * s, cy - 76 * s),
            (cx + 50 * s, cy - 90 * s),
            (cx, cy - 100 * s),
            (cx - 50 * s, cy - 90 * s)
        ], 8)
        _pline(canvas, cowl_top, gc, alpha=240, seed=seed + 40, closed=True, thick=2)
        _hatch_polygon(canvas, cowl_top, step=3, angle=65, gc=gc, alpha=75, seed=seed + 41)
        for sgn in (+1, -1):
            fold1 = P(sgn, [(50, -90), (64, -56), (72, -16), (74, 34), (66, 84)])
            _pline(canvas, _curve_catmull(fold1, 8), gc, alpha=210, seed=seed + 42 + sgn, thick=2)
            fold2 = P(sgn, [(44, -86), (56, -51), (62, -14), (64, 34)])
            _pline(canvas, _curve_catmull(fold2, 8), gc, alpha=160, seed=seed + 43 + sgn)

    # MASK 10: Pierrot Melanconico - Rounded Accordion Ruff & Curled Tassel
    elif idx == 10:
        cv2.circle(canvas, (int(cx), int(my)), int(11 * s), (*gc, 230), 2, cv2.LINE_AA)
        cv2.circle(canvas, (int(cx), int(my)), int(5 * s), (*gc, 190), -1, cv2.LINE_AA)
        n_ruff = 11
        for r_i in range(n_ruff):
            t_r = (r_i - (n_ruff - 1) / 2.0) / ((n_ruff - 1) / 2.0)
            rx = cx + t_r * 72 * s
            ry = cy + 138 * s + (8 if r_i % 2 == 0 else 0) * s
            scallop = []
            for sc_k in range(7):
                th = math.pi * sc_k / 6.0
                scallop.append((rx + 8 * s * math.cos(th), ry + 8 * s * math.sin(th)))
            _pline(canvas, scallop, gc, alpha=220, seed=seed + 44 + r_i, thick=2)
            _pline(canvas, [(rx, ry), (cx + (r_i - (n_ruff - 2) / 2.0) * 13 * s, cy + 128 * s)], gc, alpha=160, seed=seed + 60 + r_i)
        # Asymmetry: Hanging curled silk tassel on left (-1)
        tassel_cord = P(-1, [(52, 138), (66, 150), (70, 164), (62, 178)])
        _pline(canvas, _curve_catmull(tassel_cord, 8), gc, alpha=240, seed=seed + 50, thick=2)
        tx, ty = tassel_cord[-1]
        cv2.circle(canvas, (int(tx), int(ty)), int(5 * s), (*gc, 240), -1, cv2.LINE_AA)
        for fl_k in range(-2, 3):
            _pline(canvas, [(tx, ty), (tx + fl_k * 3 * s, ty + 10 * s)], gc, alpha=200, seed=seed + 51 + fl_k)

    # MASK 11: Guardia di Bronzo - Riveted Brow Band & Cheek Plates
    elif idx == 11:
        brow_band = [
            (cx - 56 * s, my - 14 * s), (cx + 56 * s, my - 14 * s),
            (cx + 56 * s, my + 14 * s), (cx - 56 * s, my + 14 * s)
        ]
        _pline(canvas, brow_band, gc, alpha=245, seed=seed + 40, closed=True, thick=2)
        _hatch_polygon(canvas, brow_band, step=3, angle=0, gc=gc, alpha=80, seed=seed + 41)
        for riv_k in range(-2, 3):
            rx = cx + riv_k * 23 * s
            ry = my
            cv2.circle(canvas, (int(rx), int(ry)), int(5 * s), (*gc, 240), 2, cv2.LINE_AA)
            cv2.circle(canvas, (int(rx), int(ry)), int(2 * s), (*gc, 240), -1, cv2.LINE_AA)
        for sgn in (+1, -1):
            plate = P(sgn, [(40, 8), (72, 14), (68, 62), (38, 54)])
            _pline(canvas, plate, gc, alpha=220, seed=seed + 50 + sgn, closed=True, thick=2)
            _hatch_polygon(canvas, plate, step=4, angle=45 if sgn > 0 else 135, gc=gc, alpha=50, seed=seed + 51 + sgn)
            cv2.circle(canvas, (int(cx + sgn * 54 * s), int(cy + 34 * s)), int(4 * s), (*gc, 230), -1, cv2.LINE_AA)


def render_game_19b_masks(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 19 · Cara B (back: X > 1583 empty). Station 20."""
    c = _canvas()
    X0, W = BACK_X0, TEXT_W
    _text(c, "The Gate of a Thousand Masks", X0, 80, 60, 19601, gc)
    _divider(c, X0, 168, W, 19603, gc)
    intro = (
        "Before me, the threshold of Tower III is sealed by a colossal wall of carved visors. "
        "In this theatre of stone, twelve ancient masks guard the dark passage. Some are cast "
        "in perfect symmetry, true to the sacred glass; others hide subtle flaws in their features, "
        "carved to deceive the unwary."
    )
    y = _paragraph(c, intro, X0, 214, W, size=38, lh=52, seed=19610, gc=gc)
    rule = (
        "Study each face carefully in this codex. When the lanterns flicker upon the gate, "
        "trust only what is reflected true: the theatre watches your gaze."
    )
    y = _paragraph(c, rule, X0, y + 10, W, size=38, lh=52, seed=19630, gc=gc)

    # 12 AI-generated Masterwork Masks in authentic Renaissance Codex bistre graphite
    W_masks = 1420
    X0_masks = 125
    cols, rows = 4, 3
    cw = W_masks // cols
    chh = 290
    gy0 = y + 65
    masks_alpha_dir = os.path.join(PROJECT_ROOT, "journal", "page19", "assets", "masks_alpha")
    for i in range(12):
        r, k = divmod(i, cols)
        cx = X0_masks + k * cw + cw // 2
        cy = gy0 + r * chh + chh // 2
        mask_path = os.path.join(masks_alpha_dir, f"mask_alpha_{i:02d}.png")
        if os.path.exists(mask_path):
            mask = cv2.imread(mask_path, cv2.IMREAD_UNCHANGED)
            mh, mw = mask.shape[:2]
            max_h = 245 if i in (4, 6, 10) else 220
            scale = min(max_h / mh, (cw - 30) / mw)
            scaled = cv2.resize(mask, (int(mw * scale), int(mh * scale)), interpolation=cv2.INTER_LANCZOS4)
            sh, sw = scaled.shape[:2]
            mx = cx - sw // 2
            my = cy - sh // 2
            blit_rgba(c, scaled, mx, my)

    y_masks_end = gy0 + rows * chh + 10

    # Architectural Study: The Colossal Wall & Theatrical Portal (Full Wall & Stage Perspective)
    arch_path = os.path.join(PROJECT_ROOT, "journal", "page19", "assets", "davinci_theatrical_archway_full_wall_alpha.png")
    if os.path.exists(arch_path):
        arch = cv2.imread(arch_path, cv2.IMREAD_UNCHANGED)
        ys, xs = np.where(arch[:, :, 3] > 10)
        if len(xs) > 0 and len(ys) > 0:
            arch_crop = arch[ys.min():ys.max()+1, xs.min():xs.max()+1]
            ah, aw = arch_crop.shape[:2]
            target_arch_w = 1470
            arch_scale = target_arch_w / aw
            scaled_arch = cv2.resize(arch_crop, (int(aw * arch_scale), int(ah * arch_scale)), interpolation=cv2.INTER_LANCZOS4)
            sah, saw = scaled_arch.shape[:2]
            arch_x = 100
            arch_y = 2400 - sah
            blit_rgba(c, scaled_arch, arch_x, arch_y)

    # Cara B troquelado clearance & clear foot
    c[:, 1583:, 3] = 0
    return _clear_foot(c)


def _plan_width(h):
    return int((stage_mirror.RIGHT - stage_mirror.LEFT) * h / (stage_mirror.BOTTOM - (stage_mirror.ARCH_CY - stage_mirror.ARCH_R)))


def _draw_mirror_plan(canvas, idx, x, y, h, gc, seed):
    """A small plan of the whole mirror with every crack, the given fragment hatched: where this piece goes."""
    shards, cracks = stage_mirror.fragments()
    k = h / (stage_mirror.BOTTOM - (stage_mirror.ARCH_CY - stage_mirror.ARCH_R))
    ox, oy = x - stage_mirror.LEFT * k, y - (stage_mirror.ARCH_CY - stage_mirror.ARCH_R) * k
    T = lambda p: (ox + p[0] * k, oy + p[1] * k)
    _hatch_polygon(canvas, [T(p) for p in shards[idx]["points"]], step=5, angle=45, gc=gc, alpha=150, seed=seed)
    _pline(canvas, [T(p) for p in stage_mirror.glass_boundary(120)], gc, alpha=215, seed=seed + 1, closed=True, thick=2)
    for j, c in enumerate(cracks):
        _pline(canvas, [T(p) for p in c], gc, alpha=150, seed=seed + 10 + j, passes=1, wob=0.3)
    for j, sh in enumerate(shards):
        cxs, cys = T((sh["center"][0] * 0.8 + stage_mirror.IMPACT[0] * 0.2, sh["center"][1] * 0.8 + stage_mirror.IMPACT[1] * 0.2))
        if j != idx:
            _text(canvas, stage_mirror.ROMAN[j], cxs, cys - 16, 22, seed + 30 + j, gc, anchor="center")
    return (x, y, int(x + (stage_mirror.RIGHT - stage_mirror.LEFT) * k), y + h)



# -------------------------------------------------------------------------
# SHEET 20 · CARA A · THE CAMERA OBSCURA (STATION 21)
# -------------------------------------------------------------------------
# The city of the third tower as it stood the day before the raiders came ("before" of scripts/journal/camera_city.py,
# the same source the Hub projects "now" from), printed upside down: the way the wall of the dark room shows it.

def _draw_city_upside_down(canvas, x0, y0, width, gc, seed):
    """The 'before' city as a pencil drawing, turned 180 degrees, with its top-left corner at (x0, y0)."""
    from scripts.journal import camera_city
    data = camera_city.build()
    items, smoke = camera_city.view(data, "before")
    k = width / data["width"]
    # the ink spans only part of the 1200 x 640 field: turn the drawing about its own extent, so no empty sky is left
    ys = [p[1] for it in items for p in it["pts"]] + [s["y"] - 82 for s in smoke]
    ytop, ybot = min(ys) - 4, max(ys) + 4
    T = lambda p: (x0 + (data["width"] - p[0]) * k, y0 + (ybot - p[1]) * k)   # turned 180 degrees: (x, y) -> (W - x, ybot - y)
    for n, it in enumerate(items):
        pts = [T(p) for p in it["pts"]]
        area = 0.0
        if it["c"]:
            arr = np.array(pts, dtype=np.float32)
            area = abs(cv2.contourArea(arr))
            cv2.fillPoly(canvas, [np.round(arr).astype(np.int32)], (0, 0, 0, 0))   # what stands in front hides what is behind
            if it["f"] == 2:
                _hatch_polygon(canvas, pts, step=7, angle=-52.0, gc=gc, alpha=95, seed=seed + n)
            elif it["f"] == 1:
                _hatch_polygon(canvas, pts, step=11, angle=72.0, gc=gc, alpha=26, seed=seed + n)
            elif area < 1100 * k * k:   # a window or a wheel: the glass is darker
                _hatch_polygon(canvas, pts, step=5, angle=45.0, gc=gc, alpha=60, seed=seed + n)
        big = it["c"] and it["f"] > 0 and area > 2500 * k * k
        _pline(canvas, pts, gc, alpha=205 if big else 185, seed=seed + 1000 + n, closed=it["c"], thick=2 if big else 1, wob=0.7)
    # the smoke of the chimneys that were burning: small curls that grow as they rise (before the turn: up is -y)
    for n, s in enumerate(smoke):
        for j in range(4):
            cx, cy, r = s["x"] + 7 * math.sin(j * 1.4 + n), s["y"] - 14 - 17 * j, 4.5 + 2.4 * j
            a0 = 40 + 55 * j
            curl = [(cx + r * math.cos(math.radians(a0 + 300 * t / 14)), cy + r * math.sin(math.radians(a0 + 300 * t / 14))) for t in range(15)]
            _pline(canvas, [T(p) for p in curl], gc, alpha=150, seed=seed + 3000 + 10 * n + j, passes=2, wob=0.5)
    return (int(x0), int(y0), int(x0 + width), int(y0 + (ybot - ytop) * k))


def render_game_20a_camera_obscura(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 20 · Cara A (front: X < 165 empty). Station 21. The first game face with a seal (idea #14)."""
    from scripts.journal import sheet_seal
    c = _canvas()
    X0, W = FRONT_X0, TEXT_W
    PT, LH = 38, 52
    _text(c, "The Camera Obscura", X0, 80, 64, 20001, gc)
    _divider(c, X0, 172, W, 20003, gc)
    intro = ("Beyond the gate of masks, I enter a dark chamber pierced by a single aperture. "
             "Through this pinhole, sunlight projects the living city of Tower III onto the stone wall, "
             "cast upside down by the geometry of light. Here in this codex, I have drawn the streets "
             "as they stood the day before the raiders struck.")
    y = _paragraph(c, intro, X0, 224, W, size=PT, lh=LH, seed=20010, gc=gc)
    rule = ("Keep this page beside you. In the chamber ahead, four things in the city have changed "
            "since this sketch was made. Find each difference—and watch where smoke rises, "
            "for the raiders leave their trace in fire.")
    y = _paragraph(c, rule, X0, y + 14, W, size=PT, lh=LH, seed=20030, gc=gc)

    # Masterwork Renaissance City Drawing (Camera Obscura optical inversion)
    # Positioned close to the text paragraph (city_gap = 50 px)
    city_asset_path = os.path.join(PROJECT_ROOT, "journal", "page20", "assets", "davinci_camera_obscura_city_alpha.png")
    if os.path.exists(city_asset_path):
        city_img = cv2.imread(city_asset_path, cv2.IMREAD_UNCHANGED)
        ch, cw = city_img.shape[:2]
        target_w = W
        scale = target_w / cw
        scaled_city = cv2.resize(city_img, (target_w, int(ch * scale)), interpolation=cv2.INTER_LANCZOS4)
        c_h, c_w = scaled_city.shape[:2]
        top = y + 50
        blit_rgba(c, scaled_city, X0, top)
        y_city_bot = top + c_h
    else:
        layer = _canvas()
        cbox = _draw_city_upside_down(layer, X0, 0, W, gc, 20100)
        cut = layer[:cbox[3] + 8, :, :]
        top = y + 50
        blit_rgba(c, cut, 0, top)
        y_city_bot = top + cbox[3]

    # Lower section: Large Optical Ray Diagram on the left, Lore Note + Seal in the right column
    # Divider at Y = 1200 gives ample vertical breathing room for the large diagram and corner seal
    y_div = 1200
    _divider(c, X0, y_div, W, 20070, gc)
    y_lower = y_div + 45

    # 1. Large prominent Optical Ray Diagram (Da Vinci / Kepler)
    optics_asset_path = os.path.join(PROJECT_ROOT, "journal", "page20", "assets", "davinci_camera_obscura_optics_alpha.png")
    if os.path.exists(optics_asset_path):
        optics_img = cv2.imread(optics_asset_path, cv2.IMREAD_UNCHANGED)
        oh, ow = optics_img.shape[:2]
        opt_w = 950
        opt_h = int(oh * (opt_w / ow))
        opt_scaled = cv2.resize(optics_img, (opt_w, opt_h), interpolation=cv2.INTER_LANCZOS4)
        opt_x = X0 - 15  # 205 px
        opt_y = y_lower + 10
        blit_rgba(c, opt_scaled, opt_x, opt_y)

    # 2. Lore Note: The Three Hearths (Cartographer's observation on the chimneys of Tower III)
    _text(c, "The Three Hearths", 1215, y_lower + 20, 34, 20900, gc)
    hearth_note = ("In this codex, two hearths send white smoke into the sky: the mill and the market lodge. "
                   "If the chamber ahead reveals a third chimney breathing fire, "
                   "seek the narrow door beneath it. The raiders kindle hearths where none should burn.")
    _paragraph(c, hearth_note, 1215, y_lower + 75, 435, size=29, lh=41, seed=20920, gc=gc)

    # 3. Unique Camera Obscura Room Seal (Seal 20A): Optical Oculus & Ray Crossing
    qr_size = 400
    x_seal = 1435
    sy = 1965
    sheet_seal.draw_seal(c, x_seal, sy, qr_size // 2, "20A", direct=True, mode="camera_obscura", gc=gc)
    _paragraph(c, "The seal of this room. Scan it with your camera when the door asks for it.",
               x_seal - qr_size // 2, sy + qr_size // 2 + 34, qr_size, size=29, lh=38, seed=20400, gc=gc)
    return _clear_foot(c)


# -------------------------------------------------------------------------
# SHEET 20 · CARA B · THE WHISPERING GALLERY (STATION 22)
# -------------------------------------------------------------------------
# The plan of the elliptical hall (scripts/journal/whisper_gallery.py, the same source the Hub uses), drawn to scale
# with its axes and a scale bar, but WITHOUT its two pins: Silvia finds them with a ruler (half the string, 5 varas,
# from the top of the short axis down to the long axis: 3, 4, 5). The gardener's construction is shown apart, on a
# different ellipse that is not to scale.

GALLERY_K = 95   # px per vara on the plan (8.04 mm at 300 dpi); the scale bar is drawn with the same number

INTRO_20B = ("Beneath the narrow house, past the hearth where the raiders lit their fire, a stair leads to a silent hall "
             "with no corners. The Order laid it out using Kepler's planetary orbits: two pins in the stone, a string of ten "
             "varas, and a taut pencil. A whisper at one pin travels the curved wall to the other, clear as a bell. Nowhere else.")
RULE_20B = ("The pins are gone, but the string never stretched. Find where they stood along the floor: five varas "
            "measured from the northern curve to the central axis marks the listening rose. The raiders whisper at the "
            "eastern pin: stand at the western one, and listen.")


def _dashed(canvas, p0, p1, gc, seed, dash=18, gap=12, alpha=150):
    """A light dashed pencil line from p0 to p1."""
    L = math.hypot(p1[0] - p0[0], p1[1] - p0[1])
    ux, uy = (p1[0] - p0[0]) / L, (p1[1] - p0[1]) / L
    s, k = 0.0, 0
    while s < L:
        e = min(L, s + dash)
        _pline(canvas, [(p0[0] + ux * s, p0[1] + uy * s), (p0[0] + ux * e, p0[1] + uy * e)], gc, alpha=alpha, seed=seed + k, passes=1, wob=0.3)
        s, k = e + gap, k + 1


def _draw_gallery_plan(canvas, cx, cy, k, gc, seed):
    """The plan of the gallery, centre (cx, cy), k px per vara: the double wall with its door, the colonnade and the two
    axes. No pins. Returns the outer box of the wall (x0, y0, x1, y1)."""
    from scripts.journal import whisper_gallery
    g = whisper_gallery.build()
    a, b = g["a"], g["b"]
    P = lambda x, y: (cx + x * k, cy - y * k)                     # plan (x east, y north) -> page
    t_door = math.degrees(math.acos(0.45 / a))                    # the door: 0.9 vara wide in the south wall
    wall = 0.12                                                   # thickness of the wall, in varas
    arc = lambda ra, rb: [P(ra * math.cos(math.radians(t)), rb * math.sin(math.radians(t)))
                          for t in np.linspace(-90 + (90 - t_door), 270 - (90 - t_door), 240)]
    inner, outer = arc(a, b), arc(a + wall, b + wall)
    _hatch_polygon(canvas, inner + outer[::-1], step=4, angle=45, gc=gc, alpha=70, seed=seed)
    _pline(canvas, inner, gc, alpha=225, seed=seed + 1, thick=2)
    _pline(canvas, outer, gc, alpha=205, seed=seed + 2, thick=2)
    for end in (0, -1):                                           # the jambs of the door
        _pline(canvas, [inner[end], outer[end]], gc, alpha=220, seed=seed + 3 + end, thick=2)
    # the colonnade
    r = g["column_r"] * k
    for n, (x, y) in enumerate(g["columns"]):
        px, py = P(x, y)
        ring = [(px + r * math.cos(2 * math.pi * i / 28), py + r * math.sin(2 * math.pi * i / 28)) for i in range(29)]
        _hatch_polygon(canvas, ring, step=4, angle=-45, gc=gc, alpha=80, seed=seed + 10 + n)
        _pline(canvas, ring, gc, alpha=215, seed=seed + 40 + n, closed=True)
    # the two axes, wall to wall: light dashes (they carry no mark where the pins stood)
    _dashed(canvas, P(-a, 0), P(a, 0), gc, seed + 100)
    _dashed(canvas, P(0, -b), P(0, b), gc, seed + 200)
    x0, y0 = P(-a - wall, b + wall)
    x1, y1 = P(a + wall, -b - wall)
    return (int(x0), int(y0), int(math.ceil(x1)), int(math.ceil(y1)))


def _draw_scale_bar(canvas, x0, y, k, varas, gc, seed):
    """A scale bar of `varas` whole varas at k px per vara, its left end at (x0, y): two rules, every other vara filled."""
    x1 = x0 + varas * k
    _pline(canvas, [(x0, y), (x1, y)], gc, alpha=225, seed=seed, wob=0.3)
    _pline(canvas, [(x0, y + 8), (x1, y + 8)], gc, alpha=225, seed=seed + 1, wob=0.3)
    for i in range(varas + 1):
        xi = x0 + i * k
        _pline(canvas, [(xi, y - 5), (xi, y + 13)], gc, alpha=225, seed=seed + 2 + i, passes=1, wob=0.2)
        if i < varas and i % 2 == 0:
            cv2.rectangle(canvas, (int(xi), int(y)), (int(xi + k), int(y + 8)), (*gc, 200), -1)
    return x1


def _draw_gardener_vignette(canvas, cx, cy, a, b, gc, seed):
    """The gardener's way (not to scale): two pins, a string tied to both, and a pencil pulled tight at the top of the
    short axis. (cx, cy) is the middle of this little ellipse."""
    c = math.sqrt(a * a - b * b)
    _pline(canvas, [(cx + a * math.cos(t), cy + b * math.sin(t)) for t in np.linspace(0, 2 * math.pi, 120)],
           gc, alpha=185, seed=seed, thick=2)
    top = (cx, cy - b)
    for sgn in (-1, +1):
        fx = cx + sgn * c
        _pline(canvas, [(fx, cy), top], gc, alpha=200, seed=seed + 2 + sgn)                     # the string, pulled tight
        loop = [(fx + 9 * math.cos(t), cy + 5 * math.sin(t)) for t in np.linspace(0, 2 * math.pi, 24)]
        _pline(canvas, loop, gc, alpha=160, seed=seed + 5 + sgn, passes=1)                     # tied round the pin
        cv2.circle(canvas, (int(fx), int(cy)), 6, (*gc, 235), -1, cv2.LINE_AA)                 # the pin's head
        _pline(canvas, [(fx, cy), (fx + 4, cy + 16)], gc, alpha=150, seed=seed + 8 + sgn)       # its shadow on the floor
    # the pencil: tip at the top of the short axis, leaning back toward the hand that pulls it
    ang = math.radians(-58)                                       # from the vertical, toward the upper right
    d = (math.sin(-ang), -math.cos(ang))
    n = (-d[1], d[0])
    tip, L, w = top, 104, 7
    cone = (tip[0] + d[0] * 22, tip[1] + d[1] * 22)
    end = (tip[0] + d[0] * L, tip[1] + d[1] * L)
    body = [(cone[0] + n[0] * w, cone[1] + n[1] * w), (end[0] + n[0] * w, end[1] + n[1] * w),
            (end[0] - n[0] * w, end[1] - n[1] * w), (cone[0] - n[0] * w, cone[1] - n[1] * w)]
    _hatch_polygon(canvas, body, step=4, angle=math.degrees(math.atan2(d[1], d[0])) + 90, gc=gc, alpha=60, seed=seed + 20)
    _pline(canvas, body, gc, alpha=215, seed=seed + 21, closed=True)
    _pline(canvas, [body[0], tip, body[3]], gc, alpha=215, seed=seed + 22)
    _pline(canvas, [(cone[0] + d[0] * 8 + n[0] * w, cone[1] + d[1] * 8 + n[1] * w),
                    (cone[0] + d[0] * 8 - n[0] * w, cone[1] + d[1] * 8 - n[1] * w)], gc, alpha=150, seed=seed + 23, passes=1)
    return (int(cx - a - 10), int(min(cy - b, end[1] - w) - 2), int(cx + a + 10), int(cy + b + 16))


def render_game_20b_whispering_gallery(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 20 · Cara B (back: X > 1583 empty). Station 22."""
    from scripts.journal import sheet_seal
    c = _canvas()
    X0, W = BACK_X0, TEXT_W
    PT, LH, K = 36, 50, GALLERY_K
    _text(c, "The Whispering Gallery", X0, 72, 64, 22001, gc)
    _divider(c, X0, 162, W, 22003, gc)
    y = _paragraph(c, INTRO_20B, X0, 210, W, size=PT, lh=LH, seed=22010, gc=gc)

    # the rule, with the gardener's construction beside it (a little ellipse, not the gallery)
    vig_asset_path = os.path.join(PROJECT_ROOT, "journal", "page20", "assets", "davinci_kepler_gardener_ellipse_alpha.png")
    vig_w = 420
    vig_x = X0 + W - vig_w
    rule_top = y + 12
    rule_end = _paragraph(c, RULE_20B, X0, rule_top, vig_x - 55 - X0, size=PT, lh=LH, seed=22030, gc=gc)

    # Masterwork Renaissance Gardener Vignette (Kepler / Da Vinci) without text underneath
    if os.path.exists(vig_asset_path):
        vig_img = cv2.imread(vig_asset_path, cv2.IMREAD_UNCHANGED)
        vh, vw = vig_img.shape[:2]
        vig_h = int(vh * (vig_w / vw))
        scaled_vig = cv2.resize(vig_img, (vig_w, vig_h), interpolation=cv2.INTER_LANCZOS4)
        vig_y = rule_top - 10
        blit_rgba(c, scaled_vig, vig_x, vig_y)
        vignette_bottom = vig_y + vig_h
    else:
        vig = _draw_gardener_vignette(c, vig_x + 220, rule_top + 120, 175, 75, gc, 22100)
        vignette_bottom = vig[3]

    # Masterwork Renaissance Architectural Plan of The Whispering Gallery (Palladio / Kepler / Kircher)
    plate_asset_path = os.path.join(PROJECT_ROOT, "journal", "page20", "assets", "davinci_whispering_gallery_plate_alpha.png")
    if os.path.exists(plate_asset_path):
        plate_img = cv2.imread(plate_asset_path, cv2.IMREAD_UNCHANGED)
        ph, pw = plate_img.shape[:2]
        target_w = 1380
        target_h = int(ph * (target_w / pw))
        scaled_plate = cv2.resize(plate_img, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
        x_plan = 182
        top_plan = max(rule_end, vignette_bottom) + 30
        blit_rgba(c, scaled_plate, x_plan, top_plan)
        plate_end = top_plan + target_h
    else:
        cx = X0 + 600
        n_top = max(rule_end, vignette_bottom) + 26
        cy = n_top + 36 + 42 + int(round((4.0 + 0.12) * K))
        plan = _draw_gallery_plan(c, cx, cy, K, gc, 22200)
        _text(c, "N", cx, n_top, 36, 22300, gc, anchor="center")
        _text(c, "W", plan[0] - 44, cy - 24, 36, 22301, gc, anchor="right")
        _text(c, "E", plan[2] + 44, cy - 24, 36, 22302, gc, anchor="left")
        _text(c, "10 varas", cx - int(1.3 * K), cy - 46, 30, 22303, gc, anchor="center")
        _text(c, "8 varas", cx + 46, cy - int(2.0 * K) - 18, 30, 22304, gc, anchor="left")
        _text(c, "door", cx, plan[3] + 40, 32, 22305, gc, anchor="center")
        bar_x0, bar_y = cx + int(0.9 * K), plan[3] + 42
        bar_x1 = _draw_scale_bar(c, bar_x0, bar_y, K, 5, gc, 22310)
        for i in range(6):
            _text(c, str(i), bar_x0 + i * K, bar_y + 24, 28, 22320 + i, gc, anchor="center")
        _text(c, "varas", bar_x1 + 20, bar_y + 24, 28, 22330, gc, anchor="left")
        plate_end = bar_y + 24 + 40

    # Lower section: divider and Cartographer's field note on the Secret Niche and the Mirror Tune
    div_y = plate_end + 35
    _divider(c, X0, div_y, W, 22400, gc)
    note_top = div_y + 45
    _text(c, "The Secret of the Niche", X0, note_top, 40, 22410, gc)
    note_text = ("The stone vault does not repeat a song: it mirrors it. When the five bronze bells of the niche ring across "
                 "the stones, answer them not as they sounded, but from the last chime to the first.")
    y_note = _paragraph(c, note_text, X0, note_top + 55, W, size=35, lh=50, seed=22420, gc=gc)
    _text(c, "« Non sonus, sed reflexio. »", X0 + W // 2, y_note + 65, 36, 22430, gc, anchor="center")

    return _clear_foot(c)


# -------------------------------------------------------------------------
# HELPER: GAME FACE BOTTOM ROW (FRAGMENT + MIRROR PLAN + SEAL)
# -------------------------------------------------------------------------

def _render_game_fragment_row(c, X0, W, y_div, shard_idx, seal_code, gc=GRAPHITE_COLOR, seed=20000):
    """Standard bottom row for game faces: divider, fragment, mirror plan, and seal medallion."""
    from scripts.journal import sheet_seal
    _divider(c, X0, y_div, W, seed, gc)
    y = y_div + 48
    seal_r = 230
    plan_h, fscale, gap = 490, 1.3, 45
    plan_w = _plan_width(plan_h)
    bx0_, by0_, bx1_, by1_ = shard_bbox(shard_idx)
    frag_w = int((bx1_ - bx0_) * fscale)
    x_frag = X0 + (W - frag_w - plan_w - 2 * seal_r - 2 * gap) // 2
    x_plan = x_frag + frag_w + gap
    x_seal = x_plan + plan_w + gap + seal_r

    box = draw_fragment(c, shard_idx, x_frag, y + 40, fscale, gc, seed=seed + 10)
    _text(c, f"Fragment {stage_mirror.ROMAN[shard_idx]}", x_frag, box[3] + 40, 42, seed + 20, gc)
    cap = f"Piece {stage_mirror.ROMAN[shard_idx]} of the mirror of Tower III. It is yours when the room opens."
    _paragraph(c, cap, x_frag, box[3] + 100, frag_w + 10, size=31, lh=44, seed=seed + 30, gc=gc)

    mplan = _draw_mirror_plan(c, shard_idx, x_plan, y + 10, plan_h, gc, seed + 40)
    _text(c, "Its place in the mirror", x_plan + plan_w // 2, mplan[3] + 40, 33, seed + 50, gc, anchor="center")

    sheet_seal.draw_seal(c, x_seal, y + 10 + seal_r, seal_r, seal_code)
    _paragraph(c, "The seal of this room. Scan it with your camera when the door asks for it.",
               x_seal - seal_r, y + 10 + 2 * seal_r + 42, 2 * seal_r, size=33, lh=46, seed=seed + 60, gc=gc)


# -------------------------------------------------------------------------
# SHEET 21 · HOJA 21
# -------------------------------------------------------------------------

def render_art_21a_aurelia_sketchbook_1(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 21 · Cara A (front: X < 165 empty). Aurelia's Sketchbook I."""
    c = _canvas()
    X0, W = FRONT_X0, TEXT_W
    _text(c, "The Alpine Memories", X0, 80, 64, 21001, gc)
    _divider(c, X0, 160, W, 21003, gc)

    text_intro = (
        "Aurelia: When the cold wind rises, the mist clears from the northern peaks. "
        "I still remember the high stone steps of Tower I, the great brass dome turning "
        "in absolute silence, and the long winter nights we spent reading the stars "
        "together beside the fire."
    )
    y = _paragraph(c, text_intro, X0, 208, W, size=38, lh=54, seed=21010, gc=gc)
    y += 35

    obs_path = os.path.join(PROJECT_ROOT, "journal", "page21", "assets", "davinci_alpine_observatory_alpha.png")
    if os.path.exists(obs_path):
        obs_asset = cv2.imread(obs_path, cv2.IMREAD_UNCHANGED)
        obs_w = 1350
        obs_h = int(obs_asset.shape[0] * (obs_w / obs_asset.shape[1]))
        target_obs_h = min(obs_h, 560)
        target_obs_w = int(obs_asset.shape[1] * (target_obs_h / obs_asset.shape[0]))
        obs_resized = cv2.resize(obs_asset, (target_obs_w, target_obs_h), interpolation=cv2.INTER_AREA)
        obs_x = X0 + (W - target_obs_w) // 2
        blit_rgba(c, obs_resized, obs_x, y)
        y += target_obs_h + 25
    else:
        stage_drawings.draw_alpine_observatory(c, X0 + W // 2, y + 200, w=1100, h=380, gc=gc, seed=21100)
        y += 455

    cap_obs = "Tower I: The Alpine Observatory. The telescope slit faced Polaris through the longest winter nights."
    y = _paragraph(c, cap_obs, X0 + 60, y, W - 120, size=32, lh=44, seed=21150, gc=gc)
    y += 50

    bot_cx = X0 + 240
    edel_path = os.path.join(PROJECT_ROOT, "journal", "page21", "assets", "davinci_edelweiss_alpha.png")
    if os.path.exists(edel_path):
        edel_asset = cv2.imread(edel_path, cv2.IMREAD_UNCHANGED)
        edel_w = 300
        edel_h = int(edel_asset.shape[0] * (edel_w / edel_asset.shape[1]))
        edel_resized = cv2.resize(edel_asset, (edel_w, edel_h), interpolation=cv2.INTER_AREA)
        edel_x = bot_cx - edel_w // 2
        blit_rgba(c, edel_resized, edel_x, y + 5)
        _text(c, "Leontopodium nivale", bot_cx, y + 5 + edel_h + 28, 30, 21250, gc, anchor="center")
        _text(c, "High crags · alt. 2400 varas", bot_cx, y + 5 + edel_h + 64, 26, 21251, gc, anchor="center")
    else:
        stage_drawings.draw_edelweiss_botanical(c, bot_cx, y + 150, size=190, gc=gc, seed=21200)
        _text(c, "Leontopodium nivale", bot_cx, y + 365, 32, 21250, gc, anchor="center")
        _text(c, "High crags · alt. 2400 varas", bot_cx, y + 405, 28, 21251, gc, anchor="center")

    text_x = X0 + 510
    text_w = W - 510
    text_edel = (
        "Aurelia: This little white flower blooms in the deep rock fissures near the summit. "
        "Its petals are as soft as wool, shielding the tiny seed from the alpine frost. "
        "We pressed one into the pages of our Astrolabe log on the twenty-third day of September. "
        "If you climb high enough, the snow remembers every single footstep."
    )
    ty = _paragraph(c, text_edel, text_x, y + 15, text_w, size=38, lh=54, seed=21260, gc=gc)
    ty += 50

    _pline(c, [(text_x, ty - 18), (text_x + 140, ty - 18)], gc, alpha=130, seed=21280)
    hermes_note = "Hermes: She is beginning to remember the way back. The road to the peaks is still open."
    ty = _paragraph(c, hermes_note, text_x, ty + 8, text_w, size=35, lh=50, seed=21290, gc=gc)

    footer_path = os.path.join(PROJECT_ROOT, "journal", "page21", "assets", "davinci_stage_path_hermes_aurelia_alpha.png")
    if os.path.exists(footer_path):
        footer_asset = cv2.imread(footer_path, cv2.IMREAD_UNCHANGED)
        fH, fW, _ = footer_asset.shape
        footer_x = 0
        footer_w = CANVAS_WIDTH_PX
        footer_bottom = CANVAS_HEIGHT_PX
        footer_y = 1775
        footer_h = footer_bottom - footer_y
        scaled_footer = cv2.resize(footer_asset, (footer_w, footer_h), interpolation=cv2.INTER_AREA)
        for i in range(30):
            f = i / 30.0
            scaled_footer[i, :, 3] = (scaled_footer[i, :, 3].astype(float) * f).astype(np.uint8)
        blit_rgba(c, scaled_footer, footer_x, footer_y)

    return c


def render_game_21b_automaton_orchestra(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 21 · Cara B (back: X > 1583 empty). Station 23."""
    c = _canvas()
    X0, W = BACK_X0, TEXT_W
    _text(c, "The Automaton Orchestra", X0, 72, 60, 21501, gc)
    _divider(c, X0, 162, W, 21503, gc)

    intro = (
        "In the silent music chamber of Tower III, three clockwork musicians sit motionless upon the stage. "
        "Carved from aged pearwood and polished brass, their hands rest frozen over lute, pipe, and dulcimer, "
        "waiting for the gears to turn once more. Beneath the cedar floorboards, a great bronze cylinder "
        "bristling with iron pins holds their forgotten melodies."
    )
    y = _paragraph(c, intro, X0, 206, W, size=38, lh=54, seed=21510, gc=gc)
    rule = (
        "Study the measures upon the drum. The song that opens the gate is the reflection of the melody: "
        "read each pitch from the opposite rim of the cylinder, from the last measure to the first."
    )
    y = _paragraph(c, rule, X0, y + 14, W, size=36, lh=50, seed=21520, gc=gc)
    y += 16

    cyl_path = os.path.join(PROJECT_ROOT, "journal", "page21", "assets", "davinci_automaton_music_cylinder_alpha.png")
    if os.path.exists(cyl_path):
        cyl_asset = cv2.imread(cyl_path, cv2.IMREAD_UNCHANGED)
        fH, fW, _ = cyl_asset.shape
        cyl_w = 1200
        cyl_h = int(fH * (cyl_w / fW))
        scaled_cyl = cv2.resize(cyl_asset, (cyl_w, cyl_h), interpolation=cv2.INTER_AREA)
        cyl_x = X0 + (W - cyl_w) // 2
        blit_rgba(c, scaled_cyl, cyl_x, y)
        y += cyl_h + 54
    else:
        stage_drawings.draw_music_barrel_assembly(c, X0 + W // 2, y + 200, w=840, h=400, gc=gc, seed=21600)
        y += 390

    carillon_lore = (
        "Six bronze bells hang beneath the soundboard, tuned to the natural hexachord. "
        "To open the door of the Orchestra, play the reflection of the melody upon the bells."
    )
    y = _paragraph(c, carillon_lore, X0, y, W, size=36, lh=50, seed=21720, gc=gc)
    y += 24

    car_path = os.path.join(PROJECT_ROOT, "journal", "page21", "assets", "davinci_tuned_carillon_alpha.png")
    if os.path.exists(car_path):
        car_asset = cv2.imread(car_path, cv2.IMREAD_UNCHANGED)
        cH, cW, _ = car_asset.shape
        car_w = 1100
        car_h = int(cH * (car_w / cW))
        scaled_car = cv2.resize(car_asset, (car_w, car_h), interpolation=cv2.INTER_AREA)
        car_x = X0 + (W - car_w) // 2
        blit_rgba(c, scaled_car, car_x, y)
        y += car_h + 50

    car_cap = "The tuning of the six bells: C · D · E · F · G · A. The last note struck is the first to unlock."
    y = _paragraph(c, car_cap, X0 + 60, y, W - 120, size=32, lh=44, seed=21750, gc=gc)

    return _clear_foot(c)


# -------------------------------------------------------------------------
# SHEET 22 · HOJA 22
# -------------------------------------------------------------------------

def _draw_lupa_clinometer(canvas, cx, cy, r=75, gc=(36, 34, 32), seed=22300):
    """Circular Leonardo inset: zoom-in on the 38-degree clinometer star and plumb line."""
    cv2.circle(canvas, (cx, cy), r, (*gc, 205), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), r - 4, (*gc, 130), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), 2, (*gc, 220), -1, cv2.LINE_AA)
    for deg in (0, 90, 180, 270):
        rad = math.radians(deg)
        x1 = int(cx + (r - 2) * math.cos(rad))
        y1 = int(cy + (r - 2) * math.sin(rad))
        x2 = int(cx + (r + 6) * math.cos(rad))
        y2 = int(cy + (r + 6) * math.sin(rad))
        cv2.line(canvas, (x1, y1), (x2, y2), (*gc, 170), 1, cv2.LINE_AA)
    arc_r = int(r * 0.72)
    arc_y = cy - int(r * 0.15)
    cv2.ellipse(canvas, (cx, arc_y), (arc_r, arc_r), 0, 15, 165, (*gc, 210), 2, cv2.LINE_AA)
    cv2.ellipse(canvas, (cx, arc_y), (arc_r - 6, arc_r - 6), 0, 15, 165, (*gc, 140), 1, cv2.LINE_AA)
    for deg in range(20, 161, 5):
        rad = math.radians(deg)
        r_inner = arc_r - 6 if deg % 10 == 0 else arc_r - 3
        x1 = int(cx + r_inner * math.cos(rad))
        y1 = int(arc_y + r_inner * math.sin(rad))
        x2 = int(cx + arc_r * math.cos(rad))
        y2 = int(arc_y + arc_r * math.sin(rad))
        cv2.line(canvas, (x1, y1), (x2, y2), (*gc, 180 if deg % 10 == 0 else 120), 1, cv2.LINE_AA)
    target_deg = 90 - 38
    target_rad = math.radians(target_deg)
    star_x = int(cx + (arc_r - 3) * math.cos(target_rad))
    star_y = int(arc_y + (arc_r - 3) * math.sin(target_rad))
    s_r = 6
    for ang in (0, 45, 90, 135):
        arad = math.radians(ang)
        p1 = (int(star_x - s_r * math.cos(arad)), int(star_y - s_r * math.sin(arad)))
        p2 = (int(star_x + s_r * math.cos(arad)), int(star_y + s_r * math.sin(arad)))
        cv2.line(canvas, p1, p2, (*gc, 230), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx, arc_y - 25), (star_x, star_y + 35), (*gc, 210), 1, cv2.LINE_AA)
    bob_x, bob_y = star_x, star_y + 28
    bob_pts = np.array([
        (bob_x, bob_y - 10),
        (bob_x + 5, bob_y),
        (bob_x + 6, bob_y + 8),
        (bob_x, bob_y + 14),
        (bob_x - 6, bob_y + 8),
        (bob_x - 5, bob_y),
    ], dtype=np.int32)
    cv2.polylines(canvas, [bob_pts], True, (*gc, 210), 1, cv2.LINE_AA)
    for y_off in range(-6, 12, 3):
        cv2.line(canvas, (bob_x - 4, bob_y + y_off), (bob_x + 4, bob_y + y_off), (*gc, 110), 1, cv2.LINE_AA)


def _draw_lupa_cut_rope(canvas, cx, cy, r=75, gc=(36, 34, 32), seed=22350):
    """Circular Leonardo inset: zoom-in on the severed hemp rope and cut fibers."""
    cv2.circle(canvas, (cx, cy), r, (*gc, 205), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), r - 4, (*gc, 130), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), 2, (*gc, 220), -1, cv2.LINE_AA)
    for deg in (0, 90, 180, 270):
        rad = math.radians(deg)
        x1 = int(cx + (r - 2) * math.cos(rad))
        y1 = int(cy + (r - 2) * math.sin(rad))
        x2 = int(cx + (r + 6) * math.cos(rad))
        y2 = int(cy + (r + 6) * math.sin(rad))
        cv2.line(canvas, (x1, y1), (x2, y2), (*gc, 170), 1, cv2.LINE_AA)
    rope_top = cy - int(r * 0.7)
    cut_y = cy - 5
    for x_off in (-5, 0, 5):
        cv2.line(canvas, (cx + x_off, rope_top), (cx + x_off, cut_y), (*gc, 190), 1, cv2.LINE_AA)
    for y_w in range(rope_top, cut_y, 8):
        cv2.line(canvas, (cx - 7, y_w), (cx + 7, y_w + 4), (*gc, 150), 1, cv2.LINE_AA)
    frays = [(-12, 14), (-7, 18), (-2, 22), (4, 20), (9, 16), (14, 11), (-5, 10), (6, 12)]
    for dx, dy in frays:
        cv2.line(canvas, (cx + dx // 3, cut_y), (cx + dx, cut_y + dy), (*gc, 180), 1, cv2.LINE_AA)
    fall_y = cy + 28
    for x_off in (-4, 1, 5):
        cv2.line(canvas, (cx + x_off, fall_y + 12), (cx + x_off, cy + int(r * 0.65)), (*gc, 170), 1, cv2.LINE_AA)
    for dx, dy in [(-8, -10), (-3, -14), (2, -12), (7, -8)]:
        cv2.line(canvas, (cx + dx // 2, fall_y + 12), (cx + dx, fall_y + 12 + dy), (*gc, 170), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx - 30, cut_y - 12), (cx + 30, cut_y + 12), (*gc, 130), 1, cv2.LINE_AA)
    for px, py in [(cx - 24, cy + 30), (cx - 20, cy + 38), (cx + 25, cy + 35)]:
        cv2.circle(canvas, (px, py), 2, (*gc, 200), -1, cv2.LINE_AA)


def _draw_leader_line(canvas, start_pt, end_pt, gc=(36, 34, 32)):
    """Delicate dashed leader line connecting the main machine to a detail inset circle."""
    x1, y1 = start_pt
    x2, y2 = end_pt
    dist = math.hypot(x2 - x1, y2 - y1)
    if dist < 10:
        return
    n_segs = int(dist // 14)
    dx, dy = (x2 - x1) / dist, (y2 - y1) / dist
    nx, ny = -dy, dx
    for i in range(0, n_segs, 2):
        u1 = i / float(n_segs)
        u2 = min(1.0, (i + 1) / float(n_segs))
        mid_sag = 22 * math.sin(math.pi * u1)
        p_a = (int(x1 + dx * dist * u1 + nx * mid_sag), int(y1 + dy * dist * u1 + ny * mid_sag))
        p_b = (int(x1 + dx * dist * u2 + nx * mid_sag), int(y1 + dy * dist * u2 + ny * mid_sag))
        cv2.line(canvas, p_a, p_b, (*gc, 130), 1, cv2.LINE_AA)
    cv2.circle(canvas, (int(x2), int(y2)), 2, (*gc, 170), -1, cv2.LINE_AA)


def render_game_22a_fly_tower(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 22 · Cara A (front: X < 165 empty). Station 24.
    Leonardo da Vinci Codex Marginalia Layout: unified theatrical rigging plate,
    circular compass detail insets, fine leader lines, and integrated operational rules.
    """
    c = _canvas()
    X0, W = FRONT_X0, TEXT_W
    _text(c, "The Fly Tower", X0, 72, 64, 22001, gc)
    _divider(c, X0, 162, W, 22003, gc)

    intro = (
        "High in the timber rafters above the stage hangs the vast rigging of the fly tower. "
        "Hand-hewn pulleys of seasoned boxwood guide the oiled hemp cords that once "
        "balanced the painted heavens, the moving clouds, and the heavy scenic machinery of Tower III."
    )
    y = _paragraph(c, intro, X0, 206, W, size=38, lh=54, seed=22010, gc=gc)

    lore = (
        "The raiders severed the rigging lines to drop the iron proscenium curtain across the stage. "
        "Merely hauling on the remaining cords will snap the hemp: Serlio and Sabbatini engineered "
        "a dual balance lock to prevent catastrophic collapse."
    )
    y = _paragraph(c, lore, X0, y + 16, W, size=35, lh=48, seed=22020, gc=gc)
    y += 28

    # 1. Unified Masterwork Architectural Plate (Ultra-light Da Vinci drafting)
    mach_path = os.path.join(PROJECT_ROOT, "journal", "page22", "assets", "davinci_unified_fly_tower_alpha.png")
    if os.path.exists(mach_path):
        mach_asset = cv2.imread(mach_path, cv2.IMREAD_UNCHANGED)
        mH, mW, _ = mach_asset.shape
        mach_w = 1100
        mach_h = int(mH * (mach_w / mW))
        mach_x = X0 + (W - mach_w) // 2
        scaled_mach = cv2.resize(mach_asset, (mach_w, mach_h), interpolation=cv2.INTER_AREA)
        blit_rgba(c, scaled_mach, mach_x, y)
        y += mach_h + 50
    else:
        stage_drawings.draw_fly_tower_machinery(c, X0 + W // 2, y + 240, w=860, h=380, gc=gc, seed=22100)
        y += 495

    cap = "Plate XII — Unified theatrical fly tower rigging (Tower III). Serlio & Sabbatini mechanical system."
    y = _paragraph(c, cap, X0 + 60, y, W - 120, size=30, lh=42, seed=22150, gc=gc)
    y += 48

    # 2. Leonardo Codex Inset A: Clinometer zoom on the left, rule on the right
    vign_a_cx, vign_a_cy = X0 + 95, y + 90
    _draw_lupa_clinometer(c, vign_a_cx, vign_a_cy, r=70, gc=gc)

    text_a_x = X0 + 240
    text_a_w = W - 240
    _text(c, "I. The Clinometer & Safety Brake", text_a_x, y, 35, 22201, gc)
    p1 = (
        "The semicircular clinometer suspended from the tie-beam measures the true horizontal level of the curtain. "
        "Settle the plumb-bob exactly upon thirty-eight degrees on the bronze arc: only at this equilibrium does the internal "
        "ratchet pawl disengage from the drum, releasing the safety brake."
    )
    y1 = _paragraph(c, p1, text_a_x, y + 42, text_a_w, size=35, lh=48, seed=22210, gc=gc)
    y = max(y1, vign_a_cy + 95) + 40

    # 3. Leonardo Codex Inset B: Severed line zoom on the right, rule on the left
    vign_b_cx, vign_b_cy = X0 + W - 95, y + 90
    _draw_lupa_cut_rope(c, vign_b_cx, vign_b_cy, r=70, gc=gc)

    text_b_x = X0
    text_b_w = W - 240
    _text(c, "II. The West Counterweight Cradle", text_b_x, y, 35, 22251, gc)
    p2 = (
        "The raiders slashed the eastern lines in haste, locking the proscenium in darkness. "
        "Once the safety brake is disengaged, distribute the sandbags and iron ingots upon the west cradle. "
        "When the cradle counterweight equals the mass of the curtain, the proscenium raises smoothly."
    )
    y2 = _paragraph(c, p2, text_b_x, y + 42, text_b_w, size=35, lh=48, seed=22260, gc=gc)
    y = max(y2, vign_b_cy + 95) + 38

    # 4. Cartographer's Field Codex Warning
    fn = (
        "Field note: If the plumb-line drifts even two degrees from thirty-eight, the iron teeth bite and lock the track. "
        "Set the balance first; weigh the cradle second."
    )
    y = _paragraph(c, fn, X0 + 40, y, W - 80, size=31, lh=42, seed=22280, gc=gc)

    return _clear_foot(c)


def _draw_pinned_parchment_slip(canvas, x0, y0, w, h, gc=GRAPHITE_COLOR, seed=22800):
    """Draws a delicate Renaissance slip of parchment pinned to the hearth."""
    rng = np.random.default_rng(seed)
    pts = []
    for x in np.linspace(x0, x0 + w, 24):
        pts.append((x, y0 + rng.uniform(-1.5, 1.5)))
    for y in np.linspace(y0, y0 + h, 16):
        pts.append((x0 + w + rng.uniform(-1.5, 1.5), y))
    for x in np.linspace(x0 + w, x0, 24):
        pts.append((x, y0 + h + rng.uniform(-1.5, 1.5)))
    for y in np.linspace(y0 + h, y0, 16):
        pts.append((x0 + rng.uniform(-1.5, 1.5), y))

    pts_arr = np.array(pts, dtype=np.int32)
    cv2.polylines(canvas, [pts_arr], True, (*gc, 185), 1, cv2.LINE_AA)
    inner_pts = []
    pad = 8
    for x in np.linspace(x0 + pad, x0 + w - pad, 18):
        inner_pts.append((x, y0 + pad))
    for y in np.linspace(y0 + pad, y0 + h - pad, 12):
        inner_pts.append((x0 + w - pad, y))
    for x in np.linspace(x0 + w - pad, x0 + pad, 18):
        inner_pts.append((x, y0 + h - pad))
    for y in np.linspace(y0 + h - pad, y0 + pad, 12):
        inner_pts.append((x0 + pad, y))
    cv2.polylines(canvas, [np.array(inner_pts, dtype=np.int32)], True, (*gc, 110), 1, cv2.LINE_AA)

    pin_x, pin_y = x0 + w // 2, y0 - 2
    cv2.circle(canvas, (pin_x, pin_y), 7, (*gc, 210), 1, cv2.LINE_AA)
    cv2.circle(canvas, (pin_x, pin_y), 5, (*gc, 140), 1, cv2.LINE_AA)
    cv2.circle(canvas, (pin_x, pin_y), 2, (*gc, 230), -1, cv2.LINE_AA)
    cv2.line(canvas, (pin_x, pin_y + 7), (pin_x, pin_y + 14), (*gc, 160), 1, cv2.LINE_AA)


def _draw_seal_of_ash(canvas, cx, cy, r=24, gc=GRAPHITE_COLOR):
    """Draws the Seal of Ash of Pope-E: circle bisected by an iron stroke."""
    cv2.circle(canvas, (cx, cy), r, (*gc, 210), 1, cv2.LINE_AA)
    cv2.line(canvas, (cx - r - 8, cy), (cx + r + 8, cy), (*gc, 230), 2, cv2.LINE_AA)
    for dy in range(4, r - 2, 4):
        dx = int(math.sqrt(r * r - dy * dy))
        cv2.line(canvas, (cx - dx + 2, cy - dy), (cx + dx - 2, cy - dy), (*gc, 140), 1, cv2.LINE_AA)


def render_lore_22b_ashes_bc(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 22 · Cara B (back: X > 1583 empty). The Ashes Before Christ.
    Option 1: Pinned camp note of Pope-E, the bronze brazier plate, and the golden feather lore.
    """
    c = _canvas()
    X0, W = BACK_X0, TEXT_W
    _text(c, "The Ashes Before Christ", X0, 80, 60, 22501, gc)
    _divider(c, X0, 168, W, 22503, gc)

    p1 = (
        "The letters carved upon their iron saddles do not name common desert raiders. "
        "'BC' is neither a calendar year nor a province: it stands for Before Christ. They are "
        "a brotherhood far older than our Order, custodians of a primordial flame that was "
        "tended in these lands long before our first observatory was raised."
    )
    y = _paragraph(c, p1, X0, 214, W, size=38, lh=54, seed=22510, gc=gc)
    y += 16
    p2 = (
        "They believe the stars only reflect what the earth first burned. Their masked leader signs each decree with a seal of soot: "
        "a circle cut in two by an iron stroke, the mark of the first flame. They seek the Fourth Chamber, but they do not destroy: "
        "they watch, and they leave tokens for the one who walks behind them."
    )
    y = _paragraph(c, p2, X0, y, W, size=36, lh=50, seed=22520, gc=gc)
    y += 40

    # 1. Monumental Archaeological Plate (Brazier & Decree)
    bp_path = os.path.join(PROJECT_ROOT, "journal", "page22", "assets", "davinci_ashes_brazier_papyrus_alpha.png")
    if os.path.exists(bp_path):
        bp_asset = cv2.imread(bp_path, cv2.IMREAD_UNCHANGED)
        bH, bW, _ = bp_asset.shape
        bp_w = 1180
        bp_h = int(bH * (bp_w / bW))
        bp_x = X0 + (W - bp_w) // 2
        scaled_bp = cv2.resize(bp_asset, (bp_w, bp_h), interpolation=cv2.INTER_AREA)
        blit_rgba(c, scaled_bp, bp_x, y)
        y += bp_h + 30
    else:
        stage_drawings.draw_ashes_brazier_and_papyrus(c, X0 + W // 2, y + 230, w=860, h=420, gc=gc, seed=22600)
        y += 485

    cap = "Plate XIII — The bronze tripod brazier and the ancient papyrus. The seal of ash inverts the symbol of the Order."
    y = _paragraph(c, cap, X0 + 60, y, W - 120, size=30, lh=42, seed=22650, gc=gc)
    y += 40

    intro_slip = (
        "Hermes found their camp empty at dawn. In the cold embers lay a single golden feather, untouched by the smoke. "
        "Weighted beneath an iron rivet rested a folded slip of parchment:"
    )
    y = _paragraph(c, intro_slip, X0, y, W, size=35, lh=48, seed=22700, gc=gc)
    y += 55

    # 2. Pinned Slip of Parchment (The Intercepted Message of Pope-E)
    slip_x = X0 + 60
    slip_w = W - 120
    slip_h = 260
    slip_y = y
    _draw_pinned_parchment_slip(c, slip_x, slip_y, slip_w, slip_h, gc=gc, seed=22800)

    # Note text inside slip
    note_text = (
        "«Do not mistake our fire for pity, traveler. "
        "We kindle the braziers ahead not to guide you, but to test if you can endure our smoke. "
        "The dark would have taken you before thirty paces. "
        "Gather the nine shards of the living glass: the fourth door yields to no one but the key.»"
    )
    ny = slip_y + 44
    for ln in _wrap(note_text, 33, slip_w - 200):
        _text(c, ln, slip_x + 50, ny, 33, 22810, gc)
        ny += 44

    # Seal of Ash on right of slip
    seal_cx = slip_x + slip_w - 85
    seal_cy = slip_y + slip_h // 2
    _draw_seal_of_ash(c, seal_cx, seal_cy, r=24, gc=gc)

    y = slip_y + slip_h + 45

    hermes_note = (
        "Hermes' note: A harsh warning, yet he lit every stair ahead of us. Pope-E knew Silvia was following our steps. "
        "Why does our pursuer call her the key?"
    )
    y = _paragraph(c, hermes_note, X0 + 40, y, W - 80, size=31, lh=42, seed=22850, gc=gc)

    return _clear_foot(c)


# -------------------------------------------------------------------------
# SHEET 23 · HOJA 23
# -------------------------------------------------------------------------

def render_game_23a_shadow_theatre(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 23 · Cara A (front: X < 165 empty). Station 25."""
    c = _canvas()
    X0, W = FRONT_X0, TEXT_W
    _text(c, "The Shadow Theatre", X0, 72, 64, 23001, gc)
    _divider(c, X0, 162, W, 23003, gc)

    intro = (
        "Behind the heavy proscenium curtain lies an intimate theatre of light and shade. "
        "Three Venetian oil lamps hang suspended from an iron rail above the stage, casting "
        "the sharp profiles of articulated brass puppets across the taut linen screen. Here, "
        "the early masters practiced the art of silhouettes to convey silent ciphers."
    )
    y = _paragraph(c, intro, X0, 206, W, size=38, lh=54, seed=23010, gc=gc)

    lore = (
        "When the raiders fled through this hall, they left the silhouettes scattered across the boards. "
        "To awaken the screen, arrange the brass figures along the beam between the flames. "
        "When the shadow of the tower and the crescent align, hold this page against a lantern: "
        "the light passing through both faces will bring the secret cipher into focus."
    )
    y = _paragraph(c, lore, X0, y + 16, W, size=35, lh=48, seed=23020, gc=gc)
    y += 45

    plate_path = os.path.join(PROJECT_ROOT, "journal", "page23", "assets", "davinci_shadow_theatre_plate_alpha.png")
    if os.path.exists(plate_path):
        plate = cv2.imread(plate_path, cv2.IMREAD_UNCHANGED)
        pH, pW, _ = plate.shape
        target_w = 1140
        target_h = int(pH * (target_w / pW))
        scaled_plate = cv2.resize(plate, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)

        plate_x = X0 + (W - target_w) // 2
        plate_y = y
        blit_rgba(c, scaled_plate, plate_x, plate_y)

        # Unique Shadow Theatre QR Code (Pierced brass stencils, Tower & Crescent silhouette, corner brackets)
        from scripts.journal import sheet_seal
        s = target_w / float(pW)
        qr_cx = int(plate_x + 714 * s)
        qr_cy = int(plate_y + 1010 * s)
        qr_size = int(320 * s)  # ~407 px!
        sheet_seal.draw_seal(c, qr_cx, qr_cy, qr_size // 2, "23A", direct=True, mode="shadow_theatre", gc=gc)

        # Caption
        cap = "Plate XIV — Apparato per il Teatro delle Ombre (Tower III). Articulated brass silhouettes and room seal."
        y_cap = plate_y + target_h + 45
        y = _paragraph(c, cap, X0 + 60, y_cap, W - 120, size=29, lh=40, seed=23150, gc=gc)
    else:
        stage_drawings.draw_shadow_theatre_apparatus(c, X0 + W // 2, y + 200, w=840, h=400, gc=gc, seed=23100)
        y += 465
        cap = "The three hanging lamps and the puppets of brass. The light shines through to the reverse."
        y = _paragraph(c, cap, X0 + 60, y, W - 120, size=30, lh=42, seed=23150, gc=gc)
        y += 48
        from scripts.journal import sheet_seal
        seal_r = 230
        x_seal = 1242
        sy = y + 10 + seal_r
        sheet_seal.draw_seal(c, x_seal, sy, seal_r, "23A")
        scap = "The seal of this room. Scan it with your camera when the door asks for it."
        _paragraph(c, scap, x_seal - seal_r, sy + seal_r + 35, 2 * seal_r, size=31, lh=44, seed=23270, gc=gc)

    return _clear_foot(c)


def render_art_23b_aurelia_sketchbook_2(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 23 · Cara B (back: X > 1583 empty). The Disc and the Vow."""
    c = _canvas()
    X0, W = BACK_X0, TEXT_W
    _text(c, "The Disc and the Vow", X0, 80, 64, 23501, gc)
    _divider(c, X0, 168, W, 23503, gc)

    text_intro = (
        "In the autumn of 1970, before our order parted ways, we cast this disc of bronze "
        "to seal a solemn vow. Its twenty-four engraved spokes divide the hours of the "
        "night and the zodiac. Three small apertures were pierced at the exact angles where "
        "the stage lamps burn. Held up to a candle, the light shining through both faces "
        "reveals the secret word of our covenant."
    )
    y = _paragraph(c, text_intro, X0, 214, W, size=38, lh=54, seed=23510, gc=gc)
    _text(c, "A.", X0 + W, y + 2, BODY, 23520, gc, anchor="right")
    y += 40

    # -------------------------------------------------------------------------
    # UPPER PLATE: Il Disco Astrometrico del Voto (1970)
    # -------------------------------------------------------------------------
    disc_path = os.path.join(PROJECT_ROOT, "journal", "page23", "assets", "davinci_vow_disc_plate_alpha.png")
    if os.path.exists(disc_path):
        disc_plate = cv2.imread(disc_path, cv2.IMREAD_UNCHANGED)
        dpH, dpW, _ = disc_plate.shape

        # Calibrated catenary scaling to frame the three Venetian chalices:
        # Crosshairs at (315, 569), (511, 512), (708, 569) -> span = 393 px.
        # Target span on Cara 23B canvas to frame lamps = 474 px.
        s = 474.0 / 393.0
        target_disc_w = int(dpW * s)  # 1235 px
        target_disc_h = int(dpH * s)  # 1235 px
        scaled_disc = cv2.resize(disc_plate, (target_disc_w, target_disc_h), interpolation=cv2.INTER_LANCZOS4)

        # Place center porthole (511*s, 512*s) exactly on Center Chalice target (862, 1100)
        disc_x = int(862 - 511 * s)
        disc_y = int(1100 - 512 * s)
        blit_rgba(c, scaled_disc, disc_x, disc_y)

        # Caption Fig. I removed per Operator request ("Quita esto")
        y = disc_y + target_disc_h

        # -------------------------------------------------------------------------
        # INSTRUCTIONS: How to read the covenant through the light
        # -------------------------------------------------------------------------
        y = disc_y + target_disc_h + 50
        _divider(c, X0 + 80, y, W - 160, 23603, gc)
        y += 50

        _text(c, "Instructions for the Flame", X0, y, 48, 23610, gc)
        y += 65

        inst_1 = "1. In a darkened room, place a single lit candle or light behind this page."
        y = _paragraph(c, inst_1, X0, y, W, size=39, lh=56, seed=23620, gc=gc)
        y += 24

        inst_2 = "2. Hold Sheet 23 upright between your eyes and the flame, with this disc facing you."
        y = _paragraph(c, inst_2, X0, y, W, size=39, lh=56, seed=23630, gc=gc)
        y += 24

        inst_3 = (
            "3. Look through the three pierced apertures: the light shining from behind will align "
            "with the stage lamps of the front face, revealing the secret letters of our vow."
        )
        y = _paragraph(c, inst_3, X0, y, W, size=39, lh=56, seed=23640, gc=gc)
    else:
        stage_drawings.draw_astrometric_vow_disc(c, X0 + W // 2, y + 230, r=220, gc=gc, seed=23600)
        y += 490

        cap = "The astrometric calculation disc of 1970. The three apertures align with the lamps of the front face."
        y = _paragraph(c, cap, X0 + 60, y, W - 120, size=30, lh=42, seed=23650, gc=gc)
        y += 50

        through_light_note = "Hold Sheet 23 up to the light. The three flames of the front illuminate the secret letters."
        y = _paragraph(c, through_light_note, X0, y, W - 60, size=33, lh=46, seed=23700, gc=gc)
        _text(c, "A.", X0 + W, y + 2, 33, 23710, gc, anchor="right")

    return _clear_foot(c)


# -------------------------------------------------------------------------
# SHEET 24 · HOJA 24
# -------------------------------------------------------------------------

def render_game_24a_hall_of_mirrors(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 24 · Cara A (front: X < 165 empty). Station 26: The Hall of Mirrors (Option B: Crypto-Navigation of the 20 Paces)."""
    c = _canvas()
    X0, W = FRONT_X0, TEXT_W
    cx = CANVAS_WIDTH_PX // 2  # 874

    # 1. Title & Header
    _text(c, "The Hall of Mirrors", X0, 72, 64, 24001, gc)
    _divider(c, X0, 156, W, 24003, gc)

    # 2. Introductory Narrative & Navigation Rule (Option B: 20 Paces)
    intro = (
        "A labyrinth of silvered glass fills the inner gallery. Every wall is an optical mirror, and every passage "
        "reflects a corridor that does not exist."
    )
    y = _paragraph(c, intro, X0, 196, W, size=36, lh=50, seed=24010, gc=gc)
    nav_rule = (
        "The compass does not turn inside the glass gallery; the mirrors rotate the light, not the earth. "
        "Count twenty Venetian paces from the Western gate: at each mirrored alcove, reject the path that duplicates "
        "your candle. Follow only the corridor where your shadow walks ahead of you."
    )
    y = _paragraph(c, nav_rule, X0, y + 6, W, size=35, lh=49, seed=24020, gc=gc)

    # 3. Figure I: Serlio Architectural Plan
    plan_cy = y + 295
    stage_drawings.draw_mirror_maze_serlio_plan(c, cx, plan_cy, w=960, h=380, gc=gc, seed=24100)

    # Architectural Scale Bar label
    scale_label_y = plan_cy + 262
    _text(c, "Scala di Venti Passi Veneziani", cx, scale_label_y, 24, 24140, gc, anchor="center")

    # 4. Central Divider between Plan and Optical Study
    y = scale_label_y + 55
    _divider(c, X0 + 60, y, W - 120, 24190, gc)
    y += 60

    # 5. Optical Reflection Study & Compass Rose
    study_cy = y + 245
    stage_drawings.draw_optical_reflection_study(c, cx, study_cy, w=960, h=420, gc=gc, seed=24220)

    # 6. The Rule of the Twenty Paces (Large font & authentic journal personality)
    y = study_cy + 210 + 55
    _text(c, "The Rule of the Twenty Paces", X0 + 40, y, 38, 24240, gc)
    y += 48

    rule_text = (
        "Do not let the glass deceive your stride. Fold Sheet 24 along the central silver axis: "
        "the false reflections cancel against stone masonry, revealing the only unmirrored route "
        "through the twenty paces to the inner chamber."
    )
    y = _paragraph(c, rule_text, X0 + 40, y, W - 80, size=38, lh=54, seed=24250, gc=gc)

    # 7. Divider before the Maxim
    y += 34
    _divider(c, X0 + 60, y, W - 120, 24280, gc)
    y += 44

    q1 = "\"Never trust the corridor that reflects your own eyes; the true path reflects only the lanterns behind you.\""
    y = _paragraph(c, q1, X0 + 40, y, W - 80, size=39, lh=55, seed=24290, gc=gc)
    y += 18

    q2 = "Twenty paces from gate to sanctum: where the glass lies, the compass remembers."
    y = _paragraph(c, q2, X0 + 40, y, W - 80, size=36, lh=50, seed=24300, gc=gc)

    return _clear_foot(c)


def render_lore_24b_doctrine_mirror_speaker(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 24 · Cara B (back: X > 1583 empty). The Doctrine of the Mirror Speaker.
    Variant 3: The Manifesto against the Siege & The Proscenium Altar Section."""
    c = _canvas()
    X0, W = BACK_X0, TEXT_W

    # 1. Header & Doctrine (The Mirror Speaker)
    _text(c, "The Doctrine of the Mirror Speaker", X0, 75, 58, 24501, gc)
    _divider(c, X0, 165, W, 24503, gc)

    d1 = (
        "The mirror creates no light of its own; it only returns what you bring to it. "
        "If you walk with hurried steps, you will meet only your own haste upon the glass."
    )
    y = _paragraph(c, d1, X0, 215, W, size=36, lh=54, seed=24510, gc=gc)

    d2 = (
        "The nine pieces were not broken in anger, but in kindness. A truth shared between nine rooms "
        "cannot be stolen by one pair of hands. Stand still before the threshold; when you stop reaching, "
        "the glass clears."
    )
    y = _paragraph(c, d2, X0, y + 35, W, size=36, lh=54, seed=24520, gc=gc)

    d3 = (
        "Bring the fragments together when the night is quiet. What you see in the completed glass "
        "is the place where our journey was always meant to end."
    )
    y = _paragraph(c, d3, X0, y + 35, W, size=36, lh=54, seed=24530, gc=gc)

    # Signature snug under d3
    sig_y = y - 14
    _text(c, "— The Mirror Speaker", X0 + W - 40, sig_y, 32, 24710, gc, anchor="right")
    sig_end = sig_y + 25

    # 2. Masterwork Renaissance Drawing: Proscenium Altar of the Living Glass
    altar_path = os.path.join(PROJECT_ROOT, "journal", "page24", "assets", "davinci_proscenium_altar_alpha.png")
    if os.path.exists(altar_path):
        altar_img = cv2.imread(altar_path, cv2.IMREAD_UNCHANGED)
        ah, aw = altar_img.shape[:2]
        target_w = 1340
        target_h = int(ah * (target_w / aw))
        scaled_altar = cv2.resize(altar_img, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
        altar_x = X0 + (W - target_w) // 2
        altar_y = sig_end + 38
        blit_rgba(c, scaled_altar, altar_x, altar_y)
        draw_bottom = altar_y + target_h
    else:
        draw_cy = 980
        stage_drawings.draw_proscenium_altar_section(c, X0 + W // 2, draw_cy, w=1080, h=520, gc=gc, seed=24600)
        draw_bottom = 1240

    # 3. Field Notes: Aurelia (1970) & Hermes (1998)
    # Note 1: Aurelia
    y_aur = draw_bottom + 65
    _text(c, "Aurelia (1970)", X0 + 20, y_aur, 36, 24800, gc)

    aur_text = (
        "Pope-E burned the ropes above the stage and filled the lower halls with smoke, but he could "
        "not cross this threshold. Some places cannot be taken by fire. They are built of quiet patience, "
        "not walls you can break. There was no gold for him to plunder here, only mirrors that turn a stranger "
        "back upon himself. By the time the Ashes reach this room, our steps will already be high in the mountains."
    )
    y = _paragraph(c, aur_text, X0 + 20, y_aur + 54, W - 40, size=35, lh=52, seed=24810, gc=gc)

    # Note 2: Hermes
    y_her = y + 70
    _text(c, "Hermes (1998)", X0 + 20, y_her, 36, 24900, gc)

    her_text = (
        "Silvia, when you bring the nine pieces of glass to the stage altar, remember what the Mirror Speaker wrote. "
        "Do not look for your own face in the mirror."
    )
    y = _paragraph(c, her_text, X0 + 20, y_her + 54, W - 40, size=35, lh=52, seed=24910, gc=gc)

    her_text2 = (
        "The last piece does not show who holds it. When the lantern overhead shines through the prisms, "
        "the glass turns into an open window—revealing the great theater in the city where we will finally meet."
    )
    y = _paragraph(c, her_text2, X0 + 20, y + 32, W - 40, size=35, lh=52, seed=24920, gc=gc)

    her_sub = "You already hold seven pieces. Only the light and the stage remain."
    y = _paragraph(c, her_sub, X0 + 20, y + 36, W - 40, size=32, lh=48, seed=24930, gc=gc)

    return _clear_foot(c)


# -------------------------------------------------------------------------
# SHEET 25 · HOJA 25
# -------------------------------------------------------------------------

def render_game_25a_kaleidoscope_lantern(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 25 · Cara A (front: X < 165 empty). Station 27.
    Option 3: The Crown of the Theatre & The Memory of the Ashes."""
    c = _canvas()
    X0, W = FRONT_X0, TEXT_W

    # 1. Header & Narrative Intro
    _text(c, "The Kaleidoscope Lantern", X0, 75, 62, 25001, gc)
    _divider(c, X0, 165, W, 25003, gc)

    intro = (
        "Thirty paces above the empty stage, the great dome narrows to its zenith. Suspended in the gloom "
        "hangs the octagonal lantern—an intricate crown of brass, counterweights, and polished quartz prisms. "
        "From this dizzying height, the proscenium below is but a quiet shadow in the dust, waiting for the first beam of light."
    )
    y = _paragraph(c, intro, X0, 215, W, size=36, lh=50, seed=25010, gc=gc)

    rule = (
        "Through the eight sides of the drum, morning sun and candle glow are divided into pure geometric harmonies. "
        "Turn the outer brass ring until the refracted rays converge upon the passage dial; the spectrum marks "
        "the pathway to the high terrace."
    )
    y = _paragraph(c, rule, X0, y + 25, W, size=36, lh=50, seed=25020, gc=gc)

    # 2. Masterwork Renaissance Drawing: The Crown of the Theatre
    lantern_path = os.path.join(PROJECT_ROOT, "journal", "page25", "assets", "davinci_kaleidoscope_lantern_alpha.png")
    if os.path.exists(lantern_path):
        lantern_img = cv2.imread(lantern_path, cv2.IMREAD_UNCHANGED)
        lh, lw = lantern_img.shape[:2]
        target_w = 1320
        target_h = int(lh * (target_w / lw))
        scaled_lantern = cv2.resize(lantern_img, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
        lantern_x = X0 + (W - target_w) // 2
        lantern_y = y + 45
        blit_rgba(c, scaled_lantern, lantern_x, lantern_y)
        draw_bottom = lantern_y + target_h
    else:
        draw_cy = y + 360
        stage_drawings.draw_kaleidoscope_optics_engine(c, X0 + W // 2, draw_cy, w=820, h=400, gc=gc, seed=25100)
        draw_bottom = draw_cy + 220

    # 3. Field Notes: Aurelia (1970) & Hermes (1998)
    # Note 1: Aurelia (1970)
    y_aur = draw_bottom + 65
    _text(c, "Aurelia (1970)", X0 + 20, y_aur, 36, 25200, gc)
    aur_text = (
        "When Pope-E set fire to the rigging below, the smoke rose thick into the vault, but the fire could not "
        "reach these heights. I climbed the iron rungs to the lantern drum while the bells were still sounding. "
        "I turned the prism vernier to the northern angle, casting a beam of amber light through the high archway "
        "to guide our companions across the terrace. Then I dropped the iron pin into the gear train so no stranger "
        "could turn the glass. The lantern held its secret while the theatre burned."
    )
    y = _paragraph(c, aur_text, X0 + 20, y_aur + 52, W - 40, size=35, lh=49, seed=25210, gc=gc)

    # Note 2: Hermes (1998)
    y_her = y + 60
    _text(c, "Hermes (1998)", X0 + 20, y_her, 36, 25300, gc)
    her_text = (
        "Silvia, the iron pin was still resting in the teeth of the drum when I arrived, covered in twenty-eight "
        "years of mountain dust. The quartz prisms are undamaged. When you solve the alignment in the lantern, "
        "the lock will release and the door to the northern terrace will swing open."
    )
    y = _paragraph(c, her_text, X0 + 20, y_her + 52, W - 40, size=35, lh=49, seed=25310, gc=gc)

    her_sub = "Beyond this dome lies the open sky. We are one step from the final stage."
    y = _paragraph(c, her_sub, X0 + 20, y + 28, W - 40, size=32, lh=46, seed=25320, gc=gc)

    return _clear_foot(c)


def render_art_25b_aurelia_sketchbook_3(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 25 · Cara B (full-bleed landscape art). Aurelia's Sketchbook III: The Terrace Under the Stars."""
    c = _canvas()
    X0, W = BACK_X0, TEXT_W

    # 1. Full-Bleed Panorama Asset (100% of canvas, no margins)
    bg_path = os.path.join(PROJECT_ROOT, "journal", "page25", "assets", "davinci_terrace_panorama_alpha.png")
    if os.path.exists(bg_path):
        bg_asset = cv2.imread(bg_path, cv2.IMREAD_UNCHANGED)
        blit_rgba(c, bg_asset, 0, 0)
    else:
        stage_drawings.draw_terrace_night_panorama(c, X0 + W // 2, 800, w=1200, h=600, gc=gc, seed=25600)

    # 2. Minimal Renaissance Heading in the open sky
    _text(c, "The Terrace Under the Stars", X0, 80, 58, 25501, gc)

    # 3. Renaissance Filacterio (Speech Scroll / Banderole)
    sw = 1260
    sh = 260
    sx0 = (CANVAS_WIDTH_PX - sw) // 2  # 244
    sy0 = 2135

    t = np.linspace(0, 1, 60)
    wave = 10 * np.sin(np.pi * t)
    top_y = sy0 + wave
    bot_y = sy0 + sh + wave

    poly_pts = [(int(sx0 + sw * t[i]), int(top_y[i])) for i in range(len(t))] + \
               [(int(sx0 + sw * t[i]), int(bot_y[i])) for i in range(len(t)-1, -1, -1)]
    poly = np.array(poly_pts, dtype=np.int32)

    # Mask polygon to clear background under scroll
    mask = np.zeros(c.shape[:2], dtype=np.uint8)
    cv2.fillPoly(mask, [poly], 255)

    # Left & right ribbon folds
    l_fold = np.array([
        (sx0, int(top_y[0])),
        (sx0 - 55, int(top_y[0] + 32)),
        (sx0 - 35, int(bot_y[0] - 18)),
        (sx0, int(bot_y[0]))
    ], dtype=np.int32)

    r_fold = np.array([
        (sx0 + sw, int(top_y[-1])),
        (sx0 + sw + 55, int(top_y[-1] + 32)),
        (sx0 + sw + 35, int(bot_y[-1] - 18)),
        (sx0 + sw, int(bot_y[-1]))
    ], dtype=np.int32)

    l_tail = np.array([
        (sx0 - 55, int(top_y[0] + 32)),
        (sx0 - 110, int(top_y[0] + 58)),
        (sx0 - 80, int(top_y[0] + 85)),
        (sx0 - 110, int(top_y[0] + 112)),
        (sx0 - 35, int(bot_y[0] - 18))
    ], dtype=np.int32)
    cv2.fillPoly(mask, [l_tail], 255)

    r_tail = np.array([
        (sx0 + sw + 50, int(top_y[-1] + 32)),
        (sx0 + sw + 110, int(top_y[-1] + 58)),
        (sx0 + sw + 75, int(top_y[-1] + 85)),
        (sx0 + sw + 110, int(top_y[-1] + 112)),
        (sx0 + sw + 35, int(bot_y[-1] - 18))
    ], dtype=np.int32)
    cv2.fillPoly(mask, [r_tail], 255)

    # Clear background under scroll and tails
    c[:, :, 3] = np.where(mask > 0, 0, c[:, :, 3])

    # Draw filacterio borders
    cv2.polylines(c, [poly], True, (*gc, 225), 2, cv2.LINE_AA)

    # Inner border hairline
    top_y_in = top_y + 6
    bot_y_in = bot_y - 6
    poly_in_pts = [(int(sx0 + 8 + (sw - 16) * t[i]), int(top_y_in[i])) for i in range(len(t))] + \
                  [(int(sx0 + 8 + (sw - 16) * t[i]), int(bot_y_in[i])) for i in range(len(t)-1, -1, -1)]
    cv2.polylines(c, [np.array(poly_in_pts, dtype=np.int32)], True, (*gc, 85), 1, cv2.LINE_AA)

    # Draw ribbon folds & tails
    cv2.polylines(c, [l_fold, r_fold], False, (*gc, 190), 2, cv2.LINE_AA)
    cv2.polylines(c, [l_tail, r_tail], False, (*gc, 170), 2, cv2.LINE_AA)

    # Renaissance shadow hatching on fold undersides
    for k in range(6, 26, 4):
        cv2.line(c, (sx0 - 55 + k, int(top_y[0] + 32)), (sx0 - 35 + k, int(bot_y[0] - 18)), (*gc, 75), 1, cv2.LINE_AA)
        cv2.line(c, (sx0 + sw + 55 - k, int(top_y[-1] + 32)), (sx0 + sw + 35 - k, int(bot_y[-1] - 18)), (*gc, 75), 1, cv2.LINE_AA)

    # Text: Option A (Warm & accomplice — Aurelia to Hermes)
    lines = [
        "“Look down at the gorge, Hermes. The torches are climbing",
        "toward the ice with our Astrolabe. Sleep well tonight.",
        "At the first light of dawn, the mountain is ours.”",
    ]
    cx = sx0 + sw // 2
    _text(c, lines[0], cx, sy0 + 56, 32, 25810, gc, anchor="center")
    _text(c, lines[1], cx, sy0 + 106, 32, 25811, gc, anchor="center")
    _text(c, lines[2], cx, sy0 + 156, 32, 25812, gc, anchor="center")
    _text(c, "— Aurelia", cx + 330, sy0 + 208, 30, 25813, gc, anchor="right")

    return c


# -------------------------------------------------------------------------
# SHEET 26 · HOJA 26
# -------------------------------------------------------------------------

def render_game_26a_stage_mirror_speaker(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 26 · Cara A (front: X < 165 empty). Station 28."""
    from scripts.journal import sheet_seal
    c = _canvas()
    X0, W = FRONT_X0, TEXT_W

    # 1. Header
    _text(c, "The Stage of the Mirror Speaker", X0, 72, 58, 26001, gc)
    _divider(c, X0, 162, W, 26003, gc)

    # 2. Introductory Chronicles & Climax Lore
    intro = (
        "The centre of the stage is cleared. In the grand Venetian frame, eight fragments of mirror already rest. "
        "When the ninth piece is laid into the glass, the cracks heal and the true reflection awakens."
    )
    y = _paragraph(c, intro, X0, 206, W, size=35, lh=49, seed=26010, gc=gc)

    rule = (
        "Gather the marks from the margins of Sheets 19 to 26. In order, they reveal the words of the ceremony. "
        "Look deep into the restored glass: it does not reflect this underground hall, but a great palace of music "
        "five hundred leagues to the north. Count the five arches of its loggia; let the restored reflection "
        "speak its name when the ninth piece is laid in the frame."
    )
    y = _paragraph(c, rule, X0, y + 10, W, size=35, lh=49, seed=26020, gc=gc)

    # 3. Masterwork Frontispiece Plate: The Stage & The Venetian Mirror
    asset_path = os.path.join(PROJECT_ROOT, "journal", "page26", "assets", "davinci_vienna_mirror_frontispiece_alpha.png")
    if os.path.exists(asset_path):
        img_asset = cv2.imread(asset_path, cv2.IMREAD_UNCHANGED)
        ih, iw = img_asset.shape[:2]
        target_w = 1240
        target_h = int(ih * (target_w / iw))
        scaled_img = cv2.resize(img_asset, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
        img_x = X0 + (W - target_w) // 2
        img_y = y + 27
        blit_rgba(c, scaled_img, img_x, img_y)
        draw_bottom = img_y + target_h
    else:
        stage_drawings.draw_mirror_climax_vienna_facade(c, X0 + W // 2, y + 270, w=840, h=420, gc=gc, seed=26100)
        draw_bottom = y + 525

    # 4. Section 1: The Liturgy of the Mirror Speaker (transition directly beneath plate)
    _text(c, "The Liturgy of the Mirror Speaker", X0, draw_bottom + 50, 38, 26310, gc)
    liturgy = (
        "“You did not seek an echo, Silvia; you sought an awakening. The nine shards were scattered through "
        "the gloom so that only hands that honour symmetry could heal what fire tried to sever. Now look deep "
        "into the glass: across five hundred leagues of mountain and river, the grand hall of the imperial capital "
        "awaits, where the stone dances and the strings are tuned to your arrival. Walk into the snow with an "
        "untroubled heart. The mirror never forgets what it has once reflected.”"
    )
    y_lit = _paragraph(c, liturgy, X0 + 15, draw_bottom + 105, W - 30, size=34, lh=48, seed=26320, gc=gc)
    _text(c, "— The Mirror Speaker", X0 + W - 30, y_lit + 14, 32, 26325, gc, anchor="right")

    # 5. Section 2: The Celestial Coordinates of Vienna (Astrometric Quadrant & Sighting)
    y_div2 = y_lit + 50
    _divider(c, X0, y_div2, W, 26400, gc)

    _text(c, "The Celestial Meridian of the 48th Parallel", X0, y_div2 + 80, 36, 26410, gc)

    # Left: Astrometric Quadrant Dial
    cx_quad = X0 + 195
    cy_quad = y_div2 + 345
    r_quad = 145
    stage_drawings.draw_vienna_astrometric_quadrant(c, cx_quad, cy_quad, r=r_quad, gc=gc, seed=26800)
    _text(c, "Meridian Dial · 48° 12′ N", cx_quad, cy_quad + r_quad + 46, 28, 26420, gc, anchor="center")

    # Right: Technical Coordinates & Hermes Field Note
    rx = X0 + 425
    rw = W - 425
    ry = y_div2 + 130

    _text(c, "Astrometric Sighting · Imperial Basin", rx, ry, 32, 26430, gc)

    c1 = "Zenith Latitude: 48° 12′ 12″ N    ·    Imperial Meridian: 16° 22′ 08″ E"
    ry = _paragraph(c, c1, rx, ry + 46, rw, size=28, lh=38, seed=26440, gc=gc)

    c2 = "True Bearing: 354° North through the Alpine Pass    ·    Elevation: 171 m"
    ry = _paragraph(c, c2, rx, ry + 12, rw, size=28, lh=38, seed=26450, gc=gc)

    hermes_note = (
        "Hermes: The line is true. From the proscenium of Tower III, the sighting line passes directly "
        "over the high shoulder of Tower I and descends into the imperial valley. The raiders flee along "
        "our exact meridian. At first light, we pack the instruments and ride toward the snow."
    )
    ry = _paragraph(c, hermes_note, rx, ry + 22, rw, size=31, lh=43, seed=26460, gc=gc)
    _text(c, "H. & A.", rx + rw, ry + 14, 30, 26470, gc, anchor="right")

    return _clear_foot(c)


def render_art_26b_back_to_peaks(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 26 · Cara B (back: X > 1583 empty). Back to the Peaks: The Geodetic Triangulation of the Three Towers."""
    c = _canvas()
    X0, W = BACK_X0, TEXT_W

    # 1. Header (clean title and divider only, per user request)
    _text(c, "Back to the Peaks", X0, 80, 60, 26501, gc)
    _divider(c, X0, 160, W, 26503, gc)

    # 2. Departure Chronicles
    p1 = (
        "The Stage Path is finished. The restored glass has spoken, casting its true reflection northward across "
        "five hundred leagues to the imperial palace of music. Yet our journey cannot rest while the Astrolabe "
        "remains lost to the ashes."
    )
    y = _paragraph(c, p1, X0, 205, W, size=36, lh=48, seed=26510, gc=gc)

    p2 = (
        "At first light we pack the sighting instruments, strap the brass cases to the mules, and step out from "
        "the underground proscenium into the sharp alpine dawn. Aurelia has released the white dove toward the crags "
        "of Tower I to announce our ascent. Ahead lies the Chasm Pass, where the ancient road climbs to the "
        "secret convergence of the Three Towers."
    )
    y = _paragraph(c, p2, X0, y + 16, W, size=36, lh=48, seed=26520, gc=gc)

    # 3. Grand Adventure Geodetic Map (spanning the entire lower 70% of the page!)
    # map height = 1700, centered at cx = X0 + W // 2 = 863, cy = 1510
    # map bounds: X in [233, 1493] (X > 1583 completely empty), Y in [660, 2360] (well above foot 2405)
    map_cx = X0 + W // 2
    map_cy = 1510
    stage_drawings.draw_grand_expedition_map(c, map_cx, map_cy, w=1260, h=1700, gc=gc, seed=26850)

    return _clear_foot(c)


# -------------------------------------------------------------------------
# stand-alone build of the Stage Path sheets
# -------------------------------------------------------------------------

STAGE_SHEETS = [
    (19,
     ("Hoja 19 · Cara A (Lore: The Unsent Letter)", render_lore_19a_unsent_letter, "page19_front", False, False),
     ("Hoja 19 · Cara B (Game S1: The Gate of a Thousand Masks · Station 20)", render_game_19b_masks, "page19_back", True, False)),
    (20,
     ("Hoja 20 · Cara A (Game S2: The Camera Obscura · Station 21)", render_game_20a_camera_obscura, "page20_front", False, False),
     ("Hoja 20 · Cara B (Game S3: The Whispering Gallery · Station 22)", render_game_20b_whispering_gallery, "page20_back", True, False)),
    (21,
     ("Hoja 21 · Cara A (Cuaderno de Aurelia: The Alpine Memories)", render_art_21a_aurelia_sketchbook_1, "page21_front", False, True),
     ("Hoja 21 · Cara B (Game S4: The Automaton Orchestra · Station 23)", render_game_21b_automaton_orchestra, "page21_back", True, False)),
    (22,
     ("Hoja 22 · Cara A (Game S5: The Fly Tower · Station 24)", render_game_22a_fly_tower, "page22_front", False, False),
     ("Hoja 22 · Cara B (Lore: The Ashes Before Christ)", render_lore_22b_ashes_bc, "page22_back", True, False)),
    (23,
     ("Hoja 23 · Cara A (Game S6: The Shadow Theatre · Station 25)", render_game_23a_shadow_theatre, "page23_front", False, False),
     ("Hoja 23 · Cara B (Cuaderno de Aurelia: The Disc and the Vow)", render_art_23b_aurelia_sketchbook_2, "page23_back", True, False)),
    (24,
     ("Hoja 24 · Cara A (Game S7: The Hall of Mirrors · Station 26)", render_game_24a_hall_of_mirrors, "page24_front", False, False),
     ("Hoja 24 · Cara B (Lore: The Doctrine of the Mirror Speaker)", render_lore_24b_doctrine_mirror_speaker, "page24_back", True, False)),
    (25,
     ("Hoja 25 · Cara A (Game S8: The Kaleidoscope Lantern · Station 27)", render_game_25a_kaleidoscope_lantern, "page25_front", False, False),
     ("Hoja 25 · Cara B (Cuaderno de Aurelia: The Terrace Under the Stars)", render_art_25b_aurelia_sketchbook_3, "page25_back", True, True)),
    (26,
     ("Hoja 26 · Cara A (Game S9: The Stage of the Mirror Speaker · Station 28)", render_game_26a_stage_mirror_speaker, "page26_front", False, False),
     ("Hoja 26 · Cara B (Arte: Back to the Peaks)", render_art_26b_back_to_peaks, "page26_back", True, True)),
]
# stem -> ((x0, y0), (x1, y1)): where a face folds (Sheet 24A, idea #8), marked in the print preview (stage_preview.py)
FOLD_LINES = {
    "page24_front": ((CANVAS_WIDTH_PX // 2, 70), (CANVAS_WIDTH_PX // 2, CANVAS_HEIGHT_PX - FOOT))
}


def build(sheets=STAGE_SHEETS):
    from scripts.journal.pdf_builder import PDFBuilder
    from scripts.journal import verify_sheets   # every face is proof-read before its PDF is written (#15)
    verify_sheets.install()
    journal = os.path.join(PROJECT_ROOT, "journal")
    paper = cv2.imread(os.path.join(journal, "page01", "real_paper_300dpi.png"))
    if paper is not None:
        paper = cv2.resize(paper, (CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX), interpolation=cv2.INTER_LANCZOS4)
    drawn = {}
    for num, *faces in sheets:
        base = os.path.join(journal, f"page{num:02d}")
        os.makedirs(os.path.join(base, "pdf"), exist_ok=True)
        os.makedirs(os.path.join(base, "mockups"), exist_ok=True)
        for label, renderer, stem, is_back, bleed in faces:
            canvas, errors, warnings, _ = verify_sheets.check_face(num, label, renderer, stem, is_back, bleed)
            for wmsg in warnings:
                print(f"    note: {wmsg}")
            if errors:
                raise SystemExit(f"✗ {label}: " + "; ".join(errors) + " (python3 scripts/journal/verify_sheets.py --sheets 19-26)")
            if not bleed:
                zone = canvas[:, 1583:, 3] if is_back else canvas[:, :165, 3]
                assert not np.count_nonzero(zone), f"{label}: pixels in the ring holes"
                assert not np.count_nonzero(canvas[CANVAS_HEIGHT_PX - FOOT:, :, 3]), f"{label}: pixels in the foot band"
            PDFBuilder.save_a5_pdf_from_rgba(canvas, os.path.join(base, "pdf", f"{stem}_A5.pdf"), dpi=300)
            if paper is not None:
                bg = cv2.flip(paper, 1) if is_back else paper
                a = (canvas[:, :, 3].astype(np.float32) / 255.0)[:, :, None]
                out = (canvas[:, :, :3].astype(np.float32) * a + bg.astype(np.float32) * (1 - a)).astype(np.uint8)
                cv2.imwrite(os.path.join(base, "mockups", f"{stem}_real_paper_mockup.jpg"), out, [cv2.IMWRITE_JPEG_QUALITY, 96])
            drawn[stem] = canvas
            print(f"  ✓ {label}")
    # the bundle Silvia receives and the preview Carles reads before printing (#16)
    from scripts.journal import build_impresion_master, stage_preview
    build_impresion_master.build_stage_bundle()
    stage_preview.build_preview(drawn)


if __name__ == "__main__":
    build()
