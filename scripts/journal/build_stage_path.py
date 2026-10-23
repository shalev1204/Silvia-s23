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
from scripts.journal import stage_mirror

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
    ("Now hear what only we two know. Your mirror did not fall. We broke it together, into nine pieces, and we hid each piece in a different room of your theatre. While the nine are apart, no one can turn the Astrolabe alone: not the Order, not you, not I.", "p"),
    ("And beware the Ashes. They were old before the Order was born. They keep a fire older than our first star, and they want what the Astrolabe opens. They will come to you smiling.", "p"),
    ("The first piece sleeps behind a thousand faces. Only the one who sees what is not equal will find it.", "p"),
    ("The Oracle of the Sandstone Sanctuary", "sign"),
]

LETTER_PT, LETTER_LH = 38, 55   # the letter is the heart of the page: larger than the notes around it

AURELIA_NOTE_19A = (
    "Silvia, I found this in the cedar chest of the Sanctuary, under the oldest charts. An Oracle of long "
    "ago wrote it, centuries before me, to the Mirror Speaker of Tower III, and never sent it. She wrote it "
    "the way the glass sees, as the people of the mirror do. Hold the page up to a mirror and read it."
)


def _draw_broken_seal(canvas, cx, cy, r, gc, seed):
    """A wax seal of the Order, broken in two when the letter was opened."""
    from scripts.journal.build_page06_07 import draw_desert_path_seal
    draw_desert_path_seal(canvas, cx=cx, cy=cy, r=r, gc=gc, seed=seed)
    crack = [(cx - r * 0.15, cy - r * 1.05), (cx + r * 0.08, cy - r * 0.45), (cx - r * 0.1, cy + r * 0.05),
             (cx + r * 0.12, cy + r * 0.55), (cx - r * 0.05, cy + r * 1.05)]
    _pline(canvas, crack, gc, alpha=230, seed=seed + 5, thick=2)


def _draw_hand_mirror(canvas, cx, cy, rx, ry, words, gc, seed):
    """A hand mirror tilted a little, showing the first words of the letter the right way round."""
    tilt = -14.0
    rot = lambda px, py: (cx + px * math.cos(math.radians(tilt)) - py * math.sin(math.radians(tilt)),
                          cy + px * math.sin(math.radians(tilt)) + py * math.cos(math.radians(tilt)))
    ell = lambda a, b, n=90: [rot(a * math.cos(2 * math.pi * i / n), b * math.sin(2 * math.pi * i / n)) for i in range(n + 1)]
    _pline(canvas, ell(rx + 26, ry + 26), gc, alpha=215, seed=seed, thick=2)
    _pline(canvas, ell(rx + 14, ry + 14), gc, alpha=150, seed=seed + 1)
    _pline(canvas, ell(rx, ry), gc, alpha=200, seed=seed + 2)
    # beads on the frame
    for k in range(18):
        t = 2 * math.pi * k / 18
        bx, by = rot((rx + 20) * math.cos(t), (ry + 20) * math.sin(t))
        cv2.circle(canvas, (int(bx), int(by)), 4, (*gc, 150), 1, cv2.LINE_AA)
    # the handle: a turned stem with two collars and a knob
    hw, top, bot = 20, ry + 26, ry + 250
    left = [rot(-hw + 4 * math.sin(i / 3.0), top + (bot - top) * i / 12) for i in range(13)]
    right = [rot(hw - 4 * math.sin(i / 3.0), top + (bot - top) * i / 12) for i in range(13)]
    _pline(canvas, left, gc, alpha=200, seed=seed + 3, thick=2)
    _pline(canvas, right, gc, alpha=200, seed=seed + 4, thick=2)
    for yy in (top + 40, bot - 60):
        _pline(canvas, [rot(-hw - 8, yy), rot(hw + 8, yy)], gc, alpha=190, seed=seed + int(yy))
    _pline(canvas, [rot(math.cos(2 * math.pi * i / 40) * 26, bot + 22 + math.sin(2 * math.pi * i / 40) * 22) for i in range(41)],
           gc, alpha=200, seed=seed + 7)
    _hatch_polygon(canvas, right[::-1] + [rot(hw - 9, top + (bot - top) * i / 12) for i in range(13)], step=5, angle=70, gc=gc, alpha=80, seed=seed + 8)
    # glass sheen and the reflected words, read the right way round
    for k in range(3):
        a, b = rot(-rx * 0.55 + k * 26, -ry * 0.75), rot(-rx * 0.2 + k * 26, -ry * 0.25)
        _pline(canvas, [a, b], gc, alpha=70, seed=seed + 20 + k)
    layer = np.zeros_like(canvas)
    for k, line in enumerate(words):
        img, _ = render_pencil_text(line, FONT_PATH, font_size=34, gc=gc, seed=seed + 30 + k)
        h, w = img.shape[:2]
        M = cv2.getRotationMatrix2D((w / 2, h / 2), -tilt, 1.0)
        cos, sin = abs(M[0, 0]), abs(M[0, 1])
        nw, nh = int(h * sin + w * cos), int(h * cos + w * sin)
        M[0, 2] += nw / 2 - w / 2
        M[1, 2] += nh / 2 - h / 2
        turned = cv2.warpAffine(img, M, (nw, nh), flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))
        lx, ly = rot(0, -22 + 52 * k)
        blit_rgba(layer, turned, int(lx - nw / 2), int(ly - nh / 2))
    # only what falls on the glass is reflected
    mask = np.zeros(canvas.shape[:2], dtype=np.uint8)
    cv2.fillPoly(mask, [np.round(np.array(ell(rx - 6, ry - 6))).astype(np.int32)], 255)
    layer[:, :, 3] = (layer[:, :, 3].astype(np.uint16) * mask // 255).astype(np.uint8)
    blit_rgba(canvas, layer, 0, 0)


def _draw_quill_and_ink(canvas, ix, iy, gc, seed):
    """An inkwell (its foot at ix, iy) and a quill lying on the table beside it, its nib toward the ink."""
    ell = lambda x, y, a, b, n=48: [(x + a * math.cos(2 * math.pi * i / n), y + b * math.sin(2 * math.pi * i / n)) for i in range(n + 1)]
    # the well: a squat pot with a lip and a little neck
    _pline(canvas, ell(ix, iy, 78, 18), gc, alpha=200, seed=seed, thick=2)
    _pline(canvas, [(ix - 78, iy), (ix - 82, iy - 54), (ix - 60, iy - 84), (ix - 30, iy - 96)], gc, alpha=210, seed=seed + 1, thick=2)
    _pline(canvas, [(ix + 78, iy), (ix + 82, iy - 54), (ix + 60, iy - 84), (ix + 30, iy - 96)], gc, alpha=210, seed=seed + 2, thick=2)
    _pline(canvas, ell(ix, iy - 98, 32, 8), gc, alpha=200, seed=seed + 3)
    _pline(canvas, ell(ix, iy - 112, 38, 10), gc, alpha=200, seed=seed + 4, thick=2)
    _pline(canvas, [(ix - 32, iy - 98), (ix - 36, iy - 110)], gc, alpha=180, seed=seed + 5)
    _pline(canvas, [(ix + 32, iy - 98), (ix + 36, iy - 110)], gc, alpha=180, seed=seed + 6)
    _hatch_polygon(canvas, [(ix + 20, iy - 92), (ix + 60, iy - 84), (ix + 82, iy - 54), (ix + 78, iy), (ix + 30, iy + 16)],
                   step=6, angle=70, gc=gc, alpha=80, seed=seed + 7)
    # the quill: a gently curved shaft lying to the left, with a leaf-shaped vane of fine barbs
    sx, sy, L, ang = ix - 112, iy - 2, 430.0, math.radians(-170)
    d, nrm = (math.cos(ang), math.sin(ang)), (-math.sin(ang), math.cos(ang))
    P = lambda u, off: (sx + d[0] * L * u + nrm[0] * (off + 22 * u * u), sy + d[1] * L * u + nrm[1] * (off + 22 * u * u))
    _pline(canvas, [P(i / 40, 0) for i in range(41)], gc, alpha=220, seed=seed + 10, thick=2)
    v0 = 0.28
    wide = lambda u, w: w * math.sin(math.pi * min(1.0, (u - v0) / (1 - v0))) ** 0.6 if u > v0 else 0.0
    top = [P(v0 + (1 - v0) * i / 30, -wide(v0 + (1 - v0) * i / 30, 40)) for i in range(31)]
    bot = [P(v0 + (1 - v0) * i / 30, wide(v0 + (1 - v0) * i / 30, 26)) for i in range(31)]
    _pline(canvas, top, gc, alpha=190, seed=seed + 11)
    _pline(canvas, bot, gc, alpha=170, seed=seed + 12)
    for i in range(1, 44):   # barbs swept toward the tip
        u = v0 + (1 - v0) * i / 44
        for side, w, salt in ((-1, 40, 20), (1, 26, 120)):
            ww = wide(u, w)
            if ww < 3:
                continue
            _pline(canvas, [P(u - 0.012, 0), P(u + 0.035, side * ww * 0.96)], gc, alpha=105 if side < 0 else 85, seed=seed + salt + i, passes=1, wob=0.3)
    _hatch_polygon(canvas, bot, step=4, angle=math.degrees(ang) + 60, gc=gc, alpha=40, seed=seed + 200)
    _pline(canvas, [P(0.04, -4), (sx + 14, sy + 3), P(0.04, 4)], gc, alpha=210, seed=seed + 99)   # the cut nib


def render_lore_19a_unsent_letter(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 19 · Cara A (front: X < 165 empty)."""
    c = _canvas()
    X0, W = FRONT_X0, TEXT_W
    _text(c, "The Unsent Letter", X0, 80, 64, 19001, gc)
    _divider(c, X0, 172, W, 19003, gc)
    y = _paragraph(c, AURELIA_NOTE_19A, X0, 222, W, seed=19010, gc=gc)
    _text(c, "A.", X0 + W, y + 2, BODY, 19030, gc, anchor="right")
    y += 70

    # the letter: a sheet of paper with a folded corner, written the way the glass sees it
    px0, px1, py0 = X0 + 30, X0 + W - 30, y
    inner_l, inner_r = px0 + 70, px1 - 70
    lines = []
    for text, kind in LETTER_19A:
        if kind == "p":
            lines += [(ln, "p") for ln in _wrap(text, LETTER_PT, inner_r - inner_l)] + [("", "gap")]
        else:
            lines += [(text, kind), ("", "gap")]
    lh = LETTER_LH
    py1 = py0 + 130 + sum(lh if k != "gap" else 22 for _, k in lines) + 40
    fold = 70
    paper = [(px0, py0), (px1 - fold, py0), (px1, py0 + fold), (px1, py1), (px0, py1)]
    _pline(c, paper, gc, alpha=210, seed=19100, closed=True, thick=2)
    _pline(c, [(px1 - fold, py0), (px1 - fold + 8, py0 + fold - 8), (px1, py0 + fold)], gc, alpha=170, seed=19101)
    _hatch_polygon(c, [(px1 - fold, py0), (px1 - fold + 8, py0 + fold - 8), (px1, py0 + fold)], step=5, angle=45, gc=gc, alpha=70, seed=19102)
    for k in range(3):   # the old folds of the letter
        fy = py0 + (py1 - py0) * (k + 1) / 4
        _pline(c, [(px0 + 6, fy), (px1 - 6, fy)], gc, alpha=34, seed=19110 + k, passes=1)
    _draw_broken_seal(c, px0 + 100, py0 + 84, 56, gc, 19120)

    ty = py0 + 110
    for k, (text, kind) in enumerate(lines):
        if kind == "gap":
            ty += 22
            continue
        if kind == "salute":   # mirrored: the first words of each line sit on the right
            _text(c, text, inner_r, ty, LETTER_PT + 2, 19200 + k, gc, mirror=True, anchor="right")
        elif kind == "sign":
            _text(c, text, inner_l, ty + 8, LETTER_PT + 2, 19200 + k, gc, mirror=True, anchor="left")
        else:
            _text(c, text, inner_r, ty, LETTER_PT, 19200 + k, gc, mirror=True, anchor="right")
        ty += lh
    y = py1 + 70

    # a hand mirror to show the way, a last line from Aurelia and a margin note from Hermes
    mx, my = X0 + 300, y + 190
    _draw_hand_mirror(c, mx, my, 250, 150, ["To the Mirror Speaker", "of the third tower,"], gc, 19400)
    nx = X0 + 690
    note = ("In the mirror the words turn round, and so do the people who wrote them. "
            "Tower III is the house of the mirror: there, everything may be the other way round.")
    ny = _paragraph(c, note, nx, y + 10, X0 + W - nx, size=33, lh=46, seed=19500, gc=gc)
    _text(c, "A.", X0 + W, ny + 2, 33, 19530, gc, anchor="right")
    ny += 92
    _pline(c, [(nx, ny - 26), (nx + 120, ny - 26)], gc, alpha=120, seed=19540)
    margin = ("Leonardo wrote his notebooks the same way, from right to left. I always thought he did it "
              "to hide his secrets. Perhaps he only wanted to be read by someone patient.")
    ny = _paragraph(c, margin, nx, ny, X0 + W - nx, size=31, lh=44, seed=19550, gc=gc)
    _text(c, "H.", X0 + W, ny + 2, 31, 19580, gc, anchor="right")
    _draw_quill_and_ink(c, X0 + W - 100, CANVAS_HEIGHT_PX - FOOT - 40, gc, 19600)
    return _clear_foot(c)


# -------------------------------------------------------------------------
# SHEET 19 · CARA B · THE GATE OF A THOUSAND MASKS (STATION 20)
# -------------------------------------------------------------------------
# Twelve masks, read left to right and row by row. Six are true (both halves match);
# six lie (one half differs). The letters of the six liars, in reading order, give the word of the gate.

MASKS_19B = [
    # (letter, outline, mouth, symmetric decoration, lie or None, side of the lie: +1 viewer's right, -1 left)
    ("M", "volto", "calm", "diamonds", None, 0),
    ("S", "volto", "smile", None, "tear", +1),
    ("A", "moon", "smile", "tears", None, 0),
    ("I", "bauta", "calm", "stars", "brow", -1),
    ("L", "moon", "calm", None, "feather", +1),
    ("O", "volto", "frown", "feathers", None, 0),
    ("T", "moon", "calm", "ribbons", None, 0),
    ("V", "volto", "smile", "diamonds", "crack", -1),
    ("H", "bauta", "calm", "stars", None, 0),
    ("E", "volto", "frown", None, "eye", +1),
    ("R", "moon", "smile", "tears", "ribbon", -1),
    ("U", "bauta", "frown", "diamonds", None, 0),
]
GATE_WORD = "".join(m[0] for m in MASKS_19B if m[4])   # the word the gate is waiting for


def _outline_half(kind):
    """The right half of a mask outline, from the top of the forehead to the chin (x >= 0, y down)."""
    if kind == "moon":
        return [(116 * math.sin(math.pi * i / 28), -130 * math.cos(math.pi * i / 28)) for i in range(29)]
    if kind == "bauta":   # the Venetian bauta: a high brow and a jutting square chin
        pts = [(0, -140), (44, -137), (82, -122), (104, -94), (112, -52), (110, -8), (104, 34), (98, 70),
               (102, 96), (88, 118), (54, 130), (20, 136), (0, 137)]
    else:
        pts = [(0, -142), (42, -139), (78, -126), (100, -100), (108, -60), (106, -16), (100, 26), (88, 66),
               (68, 100), (42, 124), (18, 137), (0, 141)]
    # a smoother contour: Catmull-Rom through the control points
    out = []
    P = [pts[0]] + pts + [pts[-1]]
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(6):
            t = k / 6.0
            out.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t
                                    + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t * t * t) for j in range(2)))
    out.append(pts[-1])
    return out


def _eye(cx, cy, w, h, shape="almond"):
    if shape == "round":
        return [(cx + w * 0.4 * math.cos(2 * math.pi * i / 30), cy + w * 0.4 * math.sin(2 * math.pi * i / 30)) for i in range(31)]
    top = [(cx - w / 2 + w * i / 16, cy - h * 0.62 * math.sin(math.pi * i / 16) - 3 * (i / 16)) for i in range(17)]
    bot = [(cx + w / 2 - w * i / 16, cy + h * 0.45 * math.sin(math.pi * i / 16)) for i in range(17)]
    return top + bot[1:]


def _scroll_brow(mouth):
    """An ornamental brow: a long arc from the bridge of the nose ending in a small curl."""
    lift = {"smile": -7, "frown": 5, "calm": 0}[mouth]
    tilt = {"smile": -2, "frown": 10, "calm": 2}[mouth]
    arc = [(12 + 4.6 * i, -56 + lift - 10 * math.sin(math.pi * i / 14) + tilt * i / 14) for i in range(15)]
    ex, ey = arc[-1]
    curl = [(ex + 7 * (1 - k / 14) * math.cos(-math.pi / 2 + 2.4 * math.pi * k / 14) - 0,
             ey + 7 + 7 * (1 - k / 14) * math.sin(-math.pi / 2 + 2.4 * math.pi * k / 14)) for k in range(15)]
    return arc + curl


def _decor_half(name):
    """Decorations of the right half (all symmetric unless used as a lie)."""
    if name == "diamonds":
        return [[(64, 24), (74, 40), (64, 56), (54, 40), (64, 24)], [(64, 30), (69, 40), (64, 50), (59, 40), (64, 30)]]
    if name == "tears":
        return [[(48, -6), (52, 4), (54, 12), (48, 18), (42, 12), (44, 4), (48, -6)]]
    if name == "tear":
        return [[(46, -4), (53, 12), (56, 25), (46, 35), (36, 25), (39, 12), (46, -4)]]
    if name == "stars":
        st = []
        for (sx, sy, r) in ((70, 26, 9), (84, 50, 6)):
            st.append([(sx + (r if k % 2 == 0 else r * 0.35) * math.cos(-math.pi / 2 + k * math.pi / 4),
                        sy + (r if k % 2 == 0 else r * 0.35) * math.sin(-math.pi / 2 + k * math.pi / 4)) for k in range(9)])
        return st
    if name in ("feathers", "feather"):
        spine = [(58 + 5.5 * i, -128 - 9.5 * i + 0.25 * i * i) for i in range(13)]
        barbs = []
        for i in range(3, 13):
            sx, sy = spine[i]
            ln = 6 + 0.9 * (12 - abs(i - 8))
            barbs.append([(sx, sy), (sx + ln, sy + ln * 0.35)])
            barbs.append([(sx, sy), (sx - ln * 0.55, sy - ln * 0.6)])
        return [spine] + barbs
    if name in ("ribbons", "ribbon"):
        return [[(108, -40), (126, -32), (138, -8), (134, 24), (122, 54), (130, 84)],
                [(108, -40), (120, -22), (122, 6), (114, 36), (118, 66)],
                [(104, -50), (116, -54), (120, -40), (108, -34)]]
    if name == "crack":
        return [[(16, -138), (28, -104), (20, -80), (38, -56), (32, -10), (54, 20), (48, 60), (68, 98)],
                [(38, -56), (60, -62)], [(54, 20), (76, 12)]]
    return []


def _draw_mask(canvas, cx, cy, spec, gc, seed, s=1.0):
    letter, kind, mouth, decor, lie, side = spec
    P = lambda sgn, pts, sx=1.0, sy=1.0, dy=0.0: [(cx + sgn * x * sx * s, cy + (y * sy + dy) * s) for x, y in pts]

    def both(pts, alpha, salt=0, thick=1):
        for sgn in (+1, -1):
            _pline(canvas, P(sgn, pts), gc, alpha=alpha, seed=seed + salt + (7 if sgn > 0 else 13), thick=thick)

    # the cord, tied at the temples on the edge of the mask, and the nail it hangs from
    right = _outline_half(kind)
    tx, ty = min(right, key=lambda p: abs(p[1] + 96))
    nail = (cx, cy - 190 * s)
    cv2.circle(canvas, (int(nail[0]), int(nail[1])), 5, (*gc, 210), -1, cv2.LINE_AA)
    for sgn in (+1, -1):
        _pline(canvas, [nail, (cx + sgn * tx * 0.55 * s, cy - 150 * s), (cx + sgn * (tx + 2) * s, cy + ty * s)], gc, alpha=120, seed=seed + 3 + sgn)

    # the shell: outer edge, inner rim, and the thickness of the mask hatched between them
    face = P(+1, right) + P(-1, list(reversed(right[:-1])))
    rim_r = [(x * 0.9, y * 0.92 + 3) for x, y in right]
    for sgn in (+1, -1):
        band = P(sgn, right) + P(sgn, list(reversed(rim_r)))
        _hatch_polygon(canvas, band, step=5, angle=62 if sgn > 0 else 118, gc=gc, alpha=58, seed=seed + 5 + sgn)
    _pline(canvas, face, gc, alpha=230, seed=seed, closed=True, thick=2)
    _pline(canvas, P(+1, rim_r) + P(-1, list(reversed(rim_r[:-1]))), gc, alpha=110, seed=seed + 1, closed=True)

    # the eyes are holes (one may lie), with a lid line; the scroll brows (one may be missing)
    for sgn in (+1, -1):
        shape = "round" if (lie == "eye" and sgn == side) else "almond"
        eye = _eye(42 if kind != "moon" else 40, -30, 48, 20, shape)
        pts = P(sgn, eye)
        _hatch_polygon(canvas, pts, step=3, angle=45, gc=gc, alpha=175, seed=seed + 22 + sgn)
        _hatch_polygon(canvas, pts, step=3, angle=-45, gc=gc, alpha=120, seed=seed + 24 + sgn)
        _pline(canvas, pts, gc, alpha=230, seed=seed + 20 + sgn, closed=True, thick=2)
        if shape == "almond":
            lid = [(x, y - 6) for x, y in eye[2:15]]
            _pline(canvas, P(sgn, lid), gc, alpha=120, seed=seed + 26 + sgn)
        if not (lie == "brow" and sgn == side):
            _pline(canvas, P(sgn, _scroll_brow(mouth)), gc, alpha=210, seed=seed + 30 + sgn, thick=2)
    # the nose: the bridge, the tip and the wing of the nostril
    both([(6, -24), (9, 6), (14, 26)], 160, 1)
    both([(14, 26), (17, 33), (11, 38), (4, 37)], 175, 2)
    both([(17, 31), (22, 33), (20, 38)], 120, 3)
    # the lips: a cupid's bow over a fuller lower lip, closed by a quiet line
    curve = {"smile": -8, "frown": 8, "calm": 0}[mouth]
    both([(0, 70), (6, 66), (13, 68), (24, 70 + curve * 0.5), (34, 73 + curve)], 205, 4)
    both([(0, 74), (16, 74 + curve * 0.45), (34, 73 + curve)], 140, 5)
    both([(34, 73 + curve), (22, 82 + curve * 0.4), (10, 85), (0, 86)], 180, 6)
    both([(4, 79), (14, 80)], 90, 7)
    # the cheeks, shaded alike on both sides
    for sgn in (+1, -1):
        cheek = P(sgn, [(70, 0), (94, 8), (92, 46), (74, 64), (64, 34)])
        _hatch_polygon(canvas, cheek, step=7, angle=60 if sgn > 0 else 120, gc=gc, alpha=40, seed=seed + 40 + sgn)

    # the symmetric decoration
    for k, pl in enumerate(_decor_half(decor) if decor else []):
        both(pl, 190, 50 + k)
    # the lie: one half only
    if lie in ("tear", "feather", "ribbon", "crack"):
        for k, pl in enumerate(_decor_half(lie)):
            _pline(canvas, P(side, pl), gc, alpha=220, seed=seed + 70 + k, thick=2 if lie in ("tear", "crack") else 1)
        if lie == "tear":
            _hatch_polygon(canvas, P(side, _decor_half("tear")[0]), step=3, angle=30, gc=gc, alpha=130, seed=seed + 79)

    # the medallion on the forehead with its letter, flanked by two small leaves
    my, r = cy - 100 * s, 23 * s
    ring = [(cx + r * math.cos(2 * math.pi * k / 40), my + r * math.sin(2 * math.pi * k / 40)) for k in range(41)]
    _pline(canvas, ring, gc, alpha=205, seed=seed + 90, thick=1)
    for sgn in (+1, -1):
        leaf = [(cx + sgn * (r + 4), my), (cx + sgn * (r + 16), my - 7), (cx + sgn * (r + 30), my), (cx + sgn * (r + 16), my + 7), (cx + sgn * (r + 4), my)]
        _pline(canvas, leaf, gc, alpha=150, seed=seed + 92 + sgn)
    _text(canvas, letter, cx, my - 18, 30, seed + 91, gc, anchor="center")   # centred in the ring, clear of the forehead hatching


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
        # the numeral sits a little toward the point of impact, clear of the frame
        cxs, cys = T((sh["center"][0] * 0.8 + stage_mirror.IMPACT[0] * 0.2, sh["center"][1] * 0.8 + stage_mirror.IMPACT[1] * 0.2))
        if j != idx:
            _text(canvas, stage_mirror.ROMAN[j], cxs, cys - 16, 22, seed + 30 + j, gc, anchor="center")   # 22 px: the smallest reading size
    return (x, y, int(x + (stage_mirror.RIGHT - stage_mirror.LEFT) * k), y + h)


def render_game_19b_masks(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Sheet 19 · Cara B (back: X > 1583 empty). Station 20."""
    c = _canvas()
    X0, W = BACK_X0, TEXT_W
    _text(c, "The Gate of a Thousand Masks", X0, 80, 60, 19601, gc)
    _divider(c, X0, 168, W, 19603, gc)
    intro = ("The door of Tower III is a wall of masks, and each mask is half a face held up to a mirror. "
             "A true face is the same on both sides. Six of these twelve masks lie: their two halves are not equal.")
    y = _paragraph(c, intro, X0, 214, W, seed=19610, gc=gc)
    rule = "Find the six that lie. Read the letters on their foreheads from left to right, row by row: that is the word the gate is waiting for."
    y = _paragraph(c, rule, X0, y + 6, W, seed=19630, gc=gc)

    # the wall of masks: four across, three down, each hanging from its nail
    cols, rows = 4, 3
    cw, chh = W // cols, 400
    gy0 = y + 30
    for i, spec in enumerate(MASKS_19B):
        r, k = divmod(i, cols)
        _draw_mask(c, X0 + k * cw + cw // 2, gy0 + r * chh + 232, spec, gc, 19800 + 37 * i, s=1.08)
    y = gy0 + rows * chh + 20

    # the answer: six empty boxes
    _text(c, "The word of the gate:", X0, y + 14, 38, 20010, gc)
    bx0, bw, gap = X0 + 470, 92, 22
    for k in range(len(GATE_WORD)):
        x = bx0 + k * (bw + gap)
        _pline(c, [(x, y), (x + bw, y), (x + bw, y + bw), (x, y + bw)], gc, alpha=200, seed=20020 + k, closed=True, thick=2)
    y += bw + 40

    # Fragment I and the plan of the mirror it belongs to
    _divider(c, X0, y, W, 20040, gc)
    y += 48
    fh = 2400 - FOOT - 20 - y   # the height left above the foot band
    bx0_, by0_, bx1_, by1_ = shard_bbox(0)
    box = draw_fragment(c, 0, X0 + 30, y, fh / (by1_ - by0_), gc, seed=20100)
    plan = _draw_mirror_plan(c, 0, X0 + W - 10 - _plan_width(fh - 40), y + 30, fh - 40, gc, 20300)
    tx, tr = box[2] + 60, plan[0] - 60
    _text(c, "Fragment I", tx, y + 4, 46, 20200, gc)
    cap = ("When the gate opens, the first piece of the mirror of Tower III is yours. "
           "Keep it: nine pieces make one glass, and the whole glass shows the way.")
    ty = _paragraph(c, cap, tx, y + 74, tr - tx, size=33, lh=46, seed=20210, gc=gc)
    _text(c, "Its place in the mirror", tr - 110, ty + 24, 30, 20240, gc, anchor="right")
    ay = ty + 48   # a small pencil arrow toward the plan, 40 px clear of its caption
    _pline(c, [(tr - 66, ay), (tr - 8, ay)], gc, alpha=200, seed=20241, thick=2)
    _pline(c, [(tr - 22, ay - 10), (tr - 8, ay), (tr - 22, ay + 10)], gc, alpha=200, seed=20242, thick=2)
    return _clear_foot(c)


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
    intro = ("A dark room with one small hole in its wall. Through the hole the whole city of the third tower falls on the wall, "
             "upside down. This is the city as it stood the day before the raiders came, drawn the way the wall shows it: upside down.")
    y = _paragraph(c, intro, X0, 224, W, size=PT, lh=LH, seed=20010, gc=gc)
    rule = ("Keep this sheet beside you. In the dark room the city is turned the same way, and four things in it have changed "
            "since this drawing was made. Find them. The raiders carry their fire wherever they go.")
    y = _paragraph(c, rule, X0, y + 14, W, size=PT, lh=LH, seed=20030, gc=gc)

    # the city is drawn apart so its height is known, and the free height of the face is shared around it
    lower_h = 60 + 2 * 246 + 50 + 3 * 46           # divider, seal (r = 246), its three-line caption
    layer = _canvas()
    cbox = _draw_city_upside_down(layer, X0, 0, W, gc, 20100)
    cut = layer[:cbox[3] + 8, :, :]
    free = (CANVAS_HEIGHT_PX - FOOT - 25 - lower_h) - (y + cut.shape[0] + 90 + 80 + 80)   # what is left after the fixed gaps
    air = max(0, free) // 3
    top = y + 80 + air
    blit_rgba(c, cut, 0, top)
    y = top + cbox[3] + 80 + air
    _text(c, "Look at the sky, the roofs, the shutters and the street.", X0 + W // 2, y, PT, 20060, gc, anchor="center")
    y += 90 + air

    # Fragment II, the plan of the mirror it belongs to, and the seal of the room: three columns with their captions
    seal_r = 246                                   # 492 px across (42 mm): over the 30 mm a phone needs; modules of 5 whole pixels
    plan_h, fscale, gap = 520, 1.3, 55
    _divider(c, X0, y, W, 20070, gc)
    y += 60
    plan_w = _plan_width(plan_h)
    bx0_, by0_, bx1_, by1_ = shard_bbox(1)
    frag_w = int((bx1_ - bx0_) * fscale)
    x_frag = X0 + (W - frag_w - plan_w - 2 * seal_r - 2 * gap) // 2
    x_plan = x_frag + frag_w + gap
    x_seal = x_plan + plan_w + gap + seal_r
    box = draw_fragment(c, 1, x_frag, y + 40, fscale, gc, seed=20200)
    _text(c, "Fragment II", x_frag, box[3] + 40, 42, 20210, gc)
    cap = "The second piece of the mirror of Tower III. It is yours when the room opens."
    _paragraph(c, cap, x_frag, box[3] + 104, frag_w + 10, size=31, lh=44, seed=20220, gc=gc)
    plan = _draw_mirror_plan(c, 1, x_plan, y + 10, plan_h, gc, 20300)
    _text(c, "Its place in the mirror", x_plan + plan_w // 2, plan[3] + 40, 33, 20240, gc, anchor="center")
    sy = y + 10 + seal_r
    sheet_seal.draw_seal(c, x_seal, sy, seal_r, "20A")
    _paragraph(c, "The seal of this room. Scan it with your camera when the door asks for it.",
               x_seal - seal_r, sy + seal_r + 50, 2 * seal_r, size=33, lh=46, seed=20400, gc=gc)
    return _clear_foot(c)


# -------------------------------------------------------------------------
# SHEET 20 · CARA B · THE WHISPERING GALLERY (STATION 22)
# -------------------------------------------------------------------------
# The plan of the elliptical hall (scripts/journal/whisper_gallery.py, the same source the Hub uses), drawn to scale
# with its axes and a scale bar, but WITHOUT its two pins: Silvia finds them with a ruler (half the string, 5 varas,
# from the top of the short axis down to the long axis: 3, 4, 5). The gardener's construction is shown apart, on a
# different ellipse that is not to scale.

GALLERY_K = 95   # px per vara on the plan (8.04 mm at 300 dpi); the scale bar is drawn with the same number

INTRO_20B = ("Under the narrow house a second stair goes down to a long hall with no corners. The Order laid it out the way "
             "Kepler drew the paths of the planets: two pins in the floor, a string of ten varas, and a pencil pulled tight "
             "around them. A whisper at one pin is heard at the other, clear as a bell. Nowhere else.")
RULE_20B = ("The pins are gone, but the string never stretched. Find where they stood. The raiders whisper at the east pin: "
            "stand at the west one, and listen. What you hear must be answered the way a mirror answers.")


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
    vig_x = X0 + W - 440
    rule_top = y + 12
    rule_end = _paragraph(c, RULE_20B, X0, rule_top, vig_x - 45 - X0, size=PT, lh=LH, seed=22030, gc=gc)
    vig = _draw_gardener_vignette(c, vig_x + 220, rule_top + 120, 175, 75, gc, 22100)
    _text(c, "Two pins, one string, one pencil.", vig_x + 220, vig[3] + 34, 30, 22130, gc, anchor="center")

    # the plan, to scale: N above, W and E at the ends of the long axis, the door in the south wall.
    # It stands a little left of the middle, so its north-east shoulder keeps clear of the construction above it
    cx = X0 + 600
    n_top = rule_end + 26
    cy = n_top + 36 + 42 + int(round((4.0 + 0.12) * K))           # the N, its clear band, then the wall
    plan = _draw_gallery_plan(c, cx, cy, K, gc, 22200)
    _text(c, "N", cx, n_top, 36, 22300, gc, anchor="center")
    _text(c, "W", plan[0] - 44, cy - 24, 36, 22301, gc, anchor="right")
    _text(c, "E", plan[2] + 44, cy - 24, 36, 22302, gc, anchor="left")
    _text(c, "10 varas", cx - int(1.3 * K), cy - 46, 30, 22303, gc, anchor="center")
    _text(c, "8 varas", cx + 46, cy - int(2.0 * K) - 18, 30, 22304, gc, anchor="left")
    _text(c, "door", cx, plan[3] + 40, 32, 22305, gc, anchor="center")
    # the scale bar, at the very scale of the plan, under its south-east side
    bar_x0, bar_y = cx + int(0.9 * K), plan[3] + 42
    bar_x1 = _draw_scale_bar(c, bar_x0, bar_y, K, 5, gc, 22310)
    for i in range(6):
        _text(c, str(i), bar_x0 + i * K, bar_y + 24, 28, 22320 + i, gc, anchor="center")
    _text(c, "varas", bar_x1 + 20, bar_y + 24, 28, 22330, gc, anchor="left")
    plan_end = bar_y + 24 + 40

    # Fragment III, the plan of the mirror it belongs to, and the seal of the room (as on Sheet 20A)
    seal_r = 246
    plan_h, fscale, gap = 520, 1.3, 55
    lower_h = 48 + 10 + 2 * seal_r + 42 + 3 * 46 + 12
    y = CANVAS_HEIGHT_PX - FOOT - 15 - lower_h
    assert y >= plan_end + 30, "Sheet 20B: the plan runs into the fragment row (%d < %d)" % (y, plan_end + 30)
    _divider(c, X0, y, W, 22400, gc)
    y += 48
    plan_w = _plan_width(plan_h)
    bx0_, by0_, bx1_, by1_ = shard_bbox(2)
    frag_w = int((bx1_ - bx0_) * fscale)
    x_frag = X0 + (W - frag_w - plan_w - 2 * seal_r - 2 * gap) // 2
    x_plan = x_frag + frag_w + gap
    x_seal = x_plan + plan_w + gap + seal_r
    box = draw_fragment(c, 2, x_frag, y + 40, fscale, gc, seed=22500)
    _text(c, "Fragment III", x_frag, box[3] + 40, 42, 22510, gc)
    cap = "The third piece of the mirror of Tower III. It is yours when the room opens."
    _paragraph(c, cap, x_frag, box[3] + 104, frag_w + 10, size=31, lh=44, seed=22520, gc=gc)
    mplan = _draw_mirror_plan(c, 2, x_plan, y + 10, plan_h, gc, 22600)
    _text(c, "Its place in the mirror", x_plan + plan_w // 2, mplan[3] + 40, 33, 22640, gc, anchor="center")
    sy = y + 10 + seal_r
    sheet_seal.draw_seal(c, x_seal, sy, seal_r, "20B")
    _paragraph(c, "The seal of this room. Scan it with your camera when the door asks for it.",
               x_seal - seal_r, sy + seal_r + 42, 2 * seal_r, size=33, lh=46, seed=22700, gc=gc)
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
]
# stem -> ((x0, y0), (x1, y1)): where a face folds (Sheet 24A, idea #8), marked in the print preview (stage_preview.py)
FOLD_LINES = {}


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
