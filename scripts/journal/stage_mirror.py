#!/usr/bin/env python3
"""
The Mirror of Tower III · shared geometry (Stage Path)
=======================================================
One source of truth for the broken mirror of the Stage Path:
- the glass (an arched Venetian mirror, 600 × 800 units),
- the nine fragments (I–IX), cut by jagged cracks from one point of impact,
- the reflection the whole mirror shows at the end (a façade drawn as polylines).

Used by the journal sheets (each fragment face draws its own piece) and by the Hub,
which loads the generated `web/assets/js/stage-mirror-data.js`. Deterministic:
running it twice writes the same file.

Run:  python3 scripts/journal/stage_mirror.py
"""

import json
import math
import os
import random

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_JS = os.path.join(PROJECT_ROOT, "web", "assets", "js", "stage-mirror-data.js")

W, H = 600, 800
ARCH_CX, ARCH_CY, ARCH_R = 300.0, 320.0, 230.0   # the arched top of the glass
LEFT, RIGHT, BOTTOM = ARCH_CX - ARCH_R, ARCH_CX + ARCH_R, 750.0
IMPACT = (288.0, 430.0)
# Crack directions in degrees (0 = east, clockwise on screen); fragment I starts at the first crack
CRACK_DEG = [-80, -38, 4, 38, 72, 108, 145, 190, 232]
ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"]


def glass_boundary(n=360):
    """The outline of the glass, clockwise from the top of the arch."""
    pts = []
    # arch: from the left spring (180°) over the top to the right spring (360°)
    for i in range(n // 2 + 1):
        a = math.pi + math.pi * i / (n // 2)
        pts.append((ARCH_CX + ARCH_R * math.cos(a), ARCH_CY + ARCH_R * math.sin(a)))
    # right side down, bottom, left side up
    steps = 40
    for i in range(1, steps + 1):
        pts.append((RIGHT, ARCH_CY + (BOTTOM - ARCH_CY) * i / steps))
    for i in range(1, steps + 1):
        pts.append((RIGHT - (RIGHT - LEFT) * i / steps, BOTTOM))
    for i in range(1, steps):
        pts.append((LEFT, BOTTOM - (BOTTOM - ARCH_CY) * i / steps))
    return pts


def ray_hit(angle):
    """Where a ray from the point of impact meets the edge of the glass."""
    dx, dy = math.cos(angle), math.sin(angle)
    best = None
    poly = glass_boundary()
    for i in range(len(poly)):
        (x1, y1), (x2, y2) = poly[i], poly[(i + 1) % len(poly)]
        ex, ey = x2 - x1, y2 - y1
        den = dx * ey - dy * ex
        if abs(den) < 1e-9:
            continue
        t = ((x1 - IMPACT[0]) * ey - (y1 - IMPACT[1]) * ex) / den
        u = ((x1 - IMPACT[0]) * dy - (y1 - IMPACT[1]) * dx) / den
        if t > 0 and 0 <= u <= 1 and (best is None or t < best[0]):
            best = (t, i, (IMPACT[0] + t * dx, IMPACT[1] + t * dy))
    return best


def crack_points(k):
    """A jagged crack from the point of impact to the edge (seeded, so always the same)."""
    rnd = random.Random(2310 + k)
    a = math.radians(CRACK_DEG[k])
    t_end, _, end = ray_hit(a)
    segs = 7
    pts = [IMPACT]
    for s in range(1, segs):
        t = t_end * s / segs
        j = rnd.uniform(-1, 1) * min(14.0, 4.0 + t * 0.05)
        pts.append((IMPACT[0] + t * math.cos(a) - j * math.sin(a), IMPACT[1] + t * math.sin(a) + j * math.cos(a)))
    pts.append(end)
    return pts


def boundary_between(i0, p0, i1, p1):
    """The edge of the glass walked clockwise from the hit point p0 (edge i0) to p1 (edge i1)."""
    poly = glass_boundary()
    out = [p0]
    i = i0
    while True:
        i = (i + 1) % len(poly)
        out.append(poly[i])
        if i == i1:
            break
    out.append(p1)
    return out


def fragments():
    cracks = [crack_points(k) for k in range(9)]
    hits = [ray_hit(math.radians(d)) for d in CRACK_DEG]
    shards = []
    for k in range(9):
        k2 = (k + 1) % 9
        edge = boundary_between(hits[k][1], hits[k][2], hits[k2][1], hits[k2][2])
        poly = cracks[k][:-1] + edge + list(reversed(cracks[k2][1:-1]))
        cx = sum(p[0] for p in poly) / len(poly)
        cy = sum(p[1] for p in poly) / len(poly)
        shards.append({"roman": ROMAN[k], "points": [[round(x, 1), round(y, 1)] for x, y in poly], "center": [round(cx, 1), round(cy, 1)]})
    return shards, [[[round(x, 1), round(y, 1)] for x, y in c] for c in cracks]


# -------------------------------------------------------------------------
# The reflection: a grand opera façade, drawn as polylines in glass units
# -------------------------------------------------------------------------

def _arch(x0, x1, spring_y, n=14):
    """A round arch from x0 to x1 springing at spring_y (left pier up, over, right pier down)."""
    r = (x1 - x0) / 2.0
    cx = x0 + r
    return [(cx - r * math.cos(math.pi * i / n), spring_y - r * math.sin(math.pi * i / n)) for i in range(n + 1)]


def _crescent(c1, r1, c2, r2, n=18):
    """A crescent moon: the arc of circle 1 outside circle 2, closed by the arc of circle 2 inside circle 1."""
    (x1, y1), (x2, y2) = c1, c2
    d = math.hypot(x2 - x1, y2 - y1)
    a = (r1 * r1 - r2 * r2 + d * d) / (2 * d)
    h = math.sqrt(max(0.0, r1 * r1 - a * a))
    mx, my = x1 + a * (x2 - x1) / d, y1 + a * (y2 - y1) / d
    p1 = (mx + h * (y2 - y1) / d, my - h * (x2 - x1) / d)
    p2 = (mx - h * (y2 - y1) / d, my + h * (x2 - x1) / d)
    ang = lambda c, p: math.atan2(p[1] - c[1], p[0] - c[0])

    def arc(c, r, a0, a1, outside):
        # walk from a0 to a1 the way that stays outside (or inside) the other circle
        span = (a1 - a0) % (2 * math.pi)
        mid = a0 + span / 2
        other = c2 if c is c1 else c1
        mpt = (c[0] + r * math.cos(mid), c[1] + r * math.sin(mid))
        is_out = math.hypot(mpt[0] - other[0], mpt[1] - other[1]) > (r2 if c is c1 else r1)
        if is_out != outside:
            span = span - 2 * math.pi
        return [[round(c[0] + r * math.cos(a0 + span * i / n), 1), round(c[1] + r * math.sin(a0 + span * i / n), 1)] for i in range(n + 1)]

    outer = arc(c1, r1, ang(c1, p1), ang(c1, p2), True)
    inner = arc(c2, r2, ang(c2, p1), ang(c2, p2), False)
    return [outer, inner]


def facade():
    L = []   # polylines

    def line(*pts):
        L.append([[round(x, 1), round(y, 1)] for x, y in pts])

    ground, plinth = 700, 712
    # steps and ground
    for k, y in enumerate((ground, ground + 6, plinth)):
        line((95 - k * 6, y), (505 + k * 6, y))
    # central block: ground arcade of five arches
    cx0, cx1 = 165, 435
    bay = (cx1 - cx0) / 5.0
    for b in range(5):
        x0, x1 = cx0 + b * bay + 6, cx0 + (b + 1) * bay - 6
        line((x0, ground), *_arch(x0, x1, 612), (x1, ground))
    line((cx0, ground), (cx0, 575)); line((cx1, ground), (cx1, 575))
    line((cx0 - 6, 575), (cx1 + 6, 575)); line((cx0 - 6, 568), (cx1 + 6, 568))
    # upper loggia: five tall arches on paired columns
    for b in range(5):
        x0, x1 = cx0 + b * bay + 8, cx0 + (b + 1) * bay - 8
        line((x0, 568), *_arch(x0, x1, 486), (x1, 568))
        for xc in (x0 - 4, x1 + 4):
            line((xc, 568), (xc, 470))
    line((cx0 - 8, 440), (cx1 + 8, 440)); line((cx0 - 8, 432), (cx1 + 8, 432))
    # balustrade and five statues on the cornice
    line((cx0, 418), (cx1, 418))
    for b in range(28):
        x = cx0 + 4 + b * (cx1 - cx0 - 8) / 27.0
        line((x, 432), (x, 418))
    for b in range(5):
        x = cx0 + (b + 0.5) * bay
        line((x - 5, 418), (x - 4, 400), (x - 2, 390), (x + 2, 390), (x + 4, 400), (x + 5, 418))
        L.append([[round(x + 3.5 * math.cos(2 * math.pi * i / 10), 1), round(385 + 3.5 * math.sin(2 * math.pi * i / 10), 1)] for i in range(11)])
    # roofs: the front roof, and the great roof of the stage house behind it
    line((cx0 + 10, 418), (cx0 + 40, 360), (cx1 - 40, 360), (cx1 - 10, 418))
    line((cx0 + 70, 360), (cx0 + 95, 300), (cx1 - 95, 300), (cx1 - 70, 360))
    line((300, 300), (300, 282))
    # side wings: corner pavilions with one tall arched window on each floor
    for wx0, wx1 in ((95, cx0 - 12), (cx1 + 12, 505)):
        line((wx0, ground), (wx0, 450), (wx1, 450), (wx1, ground))
        line((wx0 - 4, 575), (wx1 + 4, 575)); line((wx0 - 4, 450), (wx1 + 4, 450))
        line((wx0 + 4, 450), (wx0 + 20, 424), (wx1 - 20, 424), (wx1 - 4, 450))
        x0, x1 = wx0 + 16, wx1 - 16
        line((x0, 662), *_arch(x0, x1, 626), (x1, 662), (x0, 662))
        line((x0, 548), *_arch(x0, x1, 504), (x1, 548), (x0, 548))
        line((x0 - 4, 668), (x1 + 4, 668)); line((x0 - 4, 554), (x1 + 4, 554))
    # the night sky over the roofs: a crescent moon and a few stars
    L.extend(_crescent((468, 172), 22, (479, 166), 19))
    for sx, sy, r in ((150, 250, 5), (215, 150, 4), (300, 120, 6), (380, 205, 4), (130, 360, 3), (520, 300, 4), (250, 230, 3)):
        line((sx - r, sy), (sx + r, sy)); line((sx, sy - r), (sx, sy + r))
    return L


def build():
    shards, cracks = fragments()
    data = {
        "width": W, "height": H,
        "arch": {"cx": ARCH_CX, "cy": ARCH_CY, "r": ARCH_R, "left": LEFT, "right": RIGHT, "bottom": BOTTOM},
        "impact": list(IMPACT),
        "shards": shards,
        "cracks": cracks,
        "facade": facade(),
    }
    return data


def write_js(data):
    body = json.dumps(data, separators=(",", ":"))
    js = ("// GENERATED by scripts/journal/stage_mirror.py · do not edit by hand.\n"
          "// The Mirror of Tower III: the glass, its nine fragments and the reflection they hold.\n"
          "window.STAGE_MIRROR = " + body + ";\n")
    os.makedirs(os.path.dirname(OUT_JS), exist_ok=True)
    with open(OUT_JS, "w", encoding="utf-8") as fh:
        fh.write(js)
    return OUT_JS


if __name__ == "__main__":
    d = build()
    print("shards:", len(d["shards"]), "· facade polylines:", len(d["facade"]))
    print("written:", write_js(d))
