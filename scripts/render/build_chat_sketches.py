"""Graphite sketches that Hermes "attaches" in the Hub chat (web/assets/chat/*.webp).

They are drawn with the same pencil engine as the journal sheets (scripts/journal/build_desert_odyssey_expanded.py), then
composited on the journal paper. Run from the repository root:

    python3 scripts/render/build_chat_sketches.py
"""
import math
import os
import sys

import cv2
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, ROOT)
os.chdir(ROOT)

import scripts.journal.build_desert_odyssey_expanded as J  # noqa: E402

GC = J.GRAPHITE_COLOR
W, H = 860, 560
OUT = os.path.join(ROOT, "web", "assets", "chat")


def text(canvas, s, x, y, size=26, seed=1, center=False):
    img, _ = J.render_pencil_text(s, J.FONT_PATH, font_size=size, gc=GC, seed=seed)
    px = int(x - img.shape[1] / 2) if center else int(x)
    J._clear_polygon(canvas, [(px - 6, int(y) - 2), (px + img.shape[1] + 6, int(y) - 2), (px + img.shape[1] + 6, int(y) + img.shape[0] + 2), (px - 6, int(y) + img.shape[0] + 2)])
    J.blit_rgba(canvas, img, px, int(y))
    return img.shape[1]


def frame(canvas):
    J.draw_sketchy_rect(canvas, (14, 14, W - 14, H - 14), gc=GC, alpha_base=190, passes=2, seed=11)
    J.draw_sketchy_rect(canvas, (22, 22, W - 22, H - 22), gc=GC, alpha_base=90, passes=1, seed=12)


def save(canvas, name):
    paper = cv2.imread(os.path.join(ROOT, "journal", "page01", "real_paper_300dpi.png"))
    ph, pw = paper.shape[:2]
    x0, y0 = int(pw * 0.18), int(ph * 0.30)
    crop = paper[y0:y0 + int(ph * 0.22), x0:x0 + int(pw * 0.34)]
    bg = cv2.resize(crop, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32)
    a = (canvas[:, :, 3:4] / 255.0).astype(np.float32)
    out = (canvas[:, :, :3].astype(np.float32) * a + bg * (1 - a))
    yy, xx = np.mgrid[0:H, 0:W]
    vig = 1 - 0.16 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    out = np.clip(out * vig[:, :, None], 0, 255).astype(np.uint8)
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, name)
    cv2.imwrite(path, out, [cv2.IMWRITE_WEBP_QUALITY, 82])
    print("written", path, os.path.getsize(path) // 1024, "KB")


def dunes(canvas, y_base, x0, x1, n, seed, a=70):
    rng = np.random.default_rng(seed)
    for k in range(n):
        ph = rng.uniform(0, 6)
        pts = [(x, int(y_base + k * 16 + 10 * math.sin(x / 90.0 + ph) + 4 * math.sin(x / 31.0 + k))) for x in range(x0, x1, 8)]
        for i in range(len(pts) - 1):
            cv2.line(canvas, pts[i], pts[i + 1], (*GC, a), 1, cv2.LINE_AA)


def sketch_dry_wash():
    """Plan of the dry riverbed below Outer Watchtower VI, with Hermes's hunch marked."""
    c = np.zeros((H, W, 4), dtype=np.uint8)
    frame(c)
    rng = np.random.default_rng(5)
    # dune contours either side
    for k in range(16):
        ph = rng.uniform(0, 6)
        y0 = 70 + k * 30
        pts = [(x, int(y0 + 9 * math.sin(x / 70.0 + ph) + 3 * math.sin(x / 23.0 + k))) for x in range(40, W - 40, 8)]
        for i in range(len(pts) - 1):
            cv2.line(c, pts[i], pts[i + 1], (*GC, 40), 1, cv2.LINE_AA)
    # the wash: a snake from the watchtower to the bottom right
    centre = []
    for t in np.linspace(0, 1, 90):
        x = 150 + 650 * t
        y = 140 + 330 * t + 52 * math.sin(t * 9.0) * (1 - 0.3 * t)
        centre.append((x, y))
    left, right = [], []
    for i in range(len(centre) - 1):
        dx, dy = centre[i + 1][0] - centre[i][0], centre[i + 1][1] - centre[i][1]
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        wdt = 30 + 7 * math.sin(i / 7.0)
        left.append((int(centre[i][0] + nx * wdt), int(centre[i][1] + ny * wdt)))
        right.append((int(centre[i][0] - nx * wdt), int(centre[i][1] - ny * wdt)))
    poly = left + right[::-1]
    J._clear_polygon(c, poly)
    cv2.polylines(c, [np.array(left, dtype=np.int32)], False, (*GC, 215), 2, cv2.LINE_AA)
    cv2.polylines(c, [np.array(right, dtype=np.int32)], False, (*GC, 215), 2, cv2.LINE_AA)
    for (a, b) in zip(left[::2], right[::2]):
        cv2.line(c, (a[0] - 5, a[1] + 3), (a[0] - 14, a[1] + 11), (*GC, 110), 1, cv2.LINE_AA)
        cv2.line(c, (b[0] + 5, b[1] - 3), (b[0] + 14, b[1] - 11), (*GC, 110), 1, cv2.LINE_AA)
    for i in range(0, len(centre), 2):
        for _ in range(7):
            gx = centre[i][0] + rng.uniform(-24, 24)
            gy = centre[i][1] + rng.uniform(-24, 24)
            cv2.circle(c, (int(gx), int(gy)), 1, (*GC, int(rng.integers(60, 130))), -1, cv2.LINE_AA)
    for i in range(6, len(centre) - 6, 9):
        sz = int(rng.integers(6, 13))
        J._draw_rock(c, centre[i][0] + rng.uniform(-18, 18), centre[i][1] + rng.uniform(-14, 14), sz * 1.3, sz, GC, 200 + i, alpha=185)
    # Outer Watchtower VI on its ridge
    tx, ty = 130, 120
    ridge = [(60, 150), (90, 120), (170, 112), (210, 150)]
    cv2.polylines(c, [np.array(ridge, dtype=np.int32)], False, (*GC, 200), 2, cv2.LINE_AA)
    J._hatch_polygon(c, [(120, 120), (190, 118), (210, 150), (120, 150)], step=4, angle=70, gc=GC, alpha=70, seed=21)
    J.draw_sketchy_rect(c, (tx - 18, ty - 56, tx + 18, ty + 2), gc=GC, alpha_base=215, passes=2, seed=22)
    for k in range(4):
        J.draw_sketchy_rect(c, (tx - 18 + k * 10, ty - 66, tx - 10 + k * 10, ty - 56), gc=GC, alpha_base=190, passes=1, seed=23 + k)
    cv2.ellipse(c, (tx, ty - 22), (6, 10), 0, 180, 360, (*GC, 200), 1, cv2.LINE_AA)
    text(c, "Outer Watchtower VI", 236, 60, 22, 31)
    # the hunch
    hx, hy = centre[60]
    cv2.ellipse(c, (int(hx), int(hy)), (46, 34), 0, 0, 360, (*GC, 200), 2, cv2.LINE_AA)
    for k in range(0, 360, 24):
        th = math.radians(k)
        cv2.line(c, (int(hx + 52 * math.cos(th)), int(hy + 40 * math.sin(th))), (int(hx + 60 * math.cos(th)), int(hy + 47 * math.sin(th))), (*GC, 150), 1, cv2.LINE_AA)
    text(c, "?", hx - 6, hy - 22, 36, 41)
    text(c, "my hunch", hx - 70, hy + 64, 26, 42)
    cv2.line(c, (int(hx - 10), int(hy + 60)), (int(hx - 4), int(hy + 36)), (*GC, 170), 1, cv2.LINE_AA)
    text(c, "dry wash (Wadi al-Hajar)", 380, 120, 24, 43)
    cv2.line(c, (470, 150), (500, 190), (*GC, 150), 1, cv2.LINE_AA)
    # north arrow and footprints
    nx, ny = W - 70, 90
    cv2.polylines(c, [np.array([(nx, ny - 30), (nx - 11, ny), (nx + 11, ny)], dtype=np.int32)], True, (*GC, 210), 1, cv2.LINE_AA)
    cv2.fillPoly(c, [np.array([(nx, ny - 30), (nx + 11, ny), (nx, ny - 6)], dtype=np.int32)], (*GC, 200))
    text(c, "N", nx - 8, ny + 4, 24, 44)
    for k in range(9):
        px = 200 + k * 20
        py = 190 + k * 12
        cv2.ellipse(c, (px, py), (4, 7), 25, 0, 360, (*GC, 160), 1, cv2.LINE_AA)
    text(c, "Hermes", 118, 272, 22, 45)
    save(c, "sketch_dry_wash.webp")


def sketch_cairn_one():
    """Cairn I as Hermes first sees it: a cone of river boulders, half buried in silt, with the low sun behind."""
    c = np.zeros((H, W, 4), dtype=np.uint8)
    frame(c)
    rng = np.random.default_rng(6)
    sun = (170, 150)
    J.draw_sketchy_circle(c, sun, 38, gc=GC, alpha_base=190, passes=2, seed=51, num_pts=36)
    for k in range(32):
        th = math.radians(k * 360 / 32)
        r2 = 84 if k % 2 == 0 else 66
        cv2.line(c, (int(sun[0] + 50 * math.cos(th)), int(sun[1] + 50 * math.sin(th))), (int(sun[0] + r2 * math.cos(th)), int(sun[1] + r2 * math.sin(th))), (*GC, 100), 1, cv2.LINE_AA)
    gy = 400
    dunes(c, gy - 40, 40, W - 40, 3, 7, 70)
    cx0 = 520
    tiers = [(236, 74), (176, 66), (118, 58), (66, 48)]
    yb = gy
    for t, (tw, th) in enumerate(tiers):
        n = max(1, int(round(tw / 82)))
        for k in range(n):
            rx = tw / (2 * n) * 1.12
            J._draw_rock(c, cx0 - tw / 2 + tw / (2 * n) * (2 * k + 1), yb - th / 2 - (3 if k % 2 else 0), rx, th / 2, GC, 60 + t * 11 + k)
        yb -= th * 0.74
    # silt that half buries the cone: dune hatching drawn over its foot
    top = [(x, int(gy - 74 + 18 * math.sin(x / 55.0) + 6 * math.sin(x / 19.0))) for x in range(330, 720, 6)]
    J._clear_polygon(c, top + [(720, gy + 40), (330, gy + 40)])
    cv2.polylines(c, [np.array(top, dtype=np.int32)], False, (*GC, 215), 2, cv2.LINE_AA)
    for x, y in top[::2]:
        cv2.line(c, (x, y + 6), (x - 8, y + 26), (*GC, 90), 1, cv2.LINE_AA)
    for k in range(40):
        gx = rng.integers(60, W - 60)
        gyy = rng.integers(gy + 6, H - 60)
        cv2.line(c, (gx, gyy), (gx + int(rng.integers(14, 44)), gyy), (*GC, int(rng.integers(36, 80))), 1, cv2.LINE_AA)
    text(c, "Cairn I?", 600, 120, 34, 61)
    cv2.line(c, (610, 166), (560, 214), (*GC, 160), 1, cv2.LINE_AA)
    text(c, "half buried in silt", 160, 462, 26, 62)
    text(c, "river boulders, stacked by an old hand", 160, 496, 24, 63)
    save(c, "sketch_cairn_one.webp")


def sketch_chasm_mouth():
    """The North Portal of the Whispering Chasm: two walls closing in, the dry bed running between them."""
    c = np.zeros((H, W, 4), dtype=np.uint8)
    frame(c)
    rng = np.random.default_rng(8)
    vx, vy = W // 2, 250
    gw = 110
    lw = [(40, 50), (vx - gw, vy - 120), (vx - gw, vy + 20), (40, H - 60)]
    rw = [(W - 40, 50), (vx + gw, vy - 120), (vx + gw, vy + 20), (W - 40, H - 60)]
    for quad, shade, seed in ((lw, 30, 71), (rw, 70, 72)):
        J._clear_polygon(c, quad)
        cv2.polylines(c, [np.array(quad, dtype=np.int32)], True, (*GC, 215), 2, cv2.LINE_AA)
        J._hatch_polygon(c, quad, step=7, angle=82, gc=GC, alpha=shade, seed=seed)
        for k in range(1, 9):
            t = k / 9.0
            p1 = (quad[0][0], int(quad[0][1] + (quad[3][1] - quad[0][1]) * t))
            p2 = (quad[1][0], int(quad[1][1] + (quad[2][1] - quad[1][1]) * t))
            J.draw_sketchy_line(c, p1, p2, gc=GC, alpha_base=80, passes=1, seed=seed + k)
        for k in range(4):
            s = k / 4.0 * 0.7 + 0.15
            x = quad[0][0] + (quad[1][0] - quad[0][0]) * s
            ya = quad[0][1] + (quad[1][1] - quad[0][1]) * s + 30
            yb = ya + 120 * (1 - s * 0.6)
            pts = [(int(x + (8 if i % 2 else -8) * (1 - s)), int(ya + (yb - ya) * i / 7)) for i in range(8)]
            cv2.polylines(c, [np.array(pts, dtype=np.int32)], False, (*GC, 170), 1, cv2.LINE_AA)
    # far light between the walls and the dry bed
    for k in range(7):
        yy = vy - 110 + k * 22
        cv2.line(c, (vx - gw + 6, yy), (vx + gw - 6, yy), (*GC, 30), 1, cv2.LINE_AA)
    bed = [(vx - 24, vy + 20), (vx + 24, vy + 20), (W // 2 + 210, H - 60), (W // 2 - 210, H - 60)]
    cv2.polylines(c, [np.array(bed, dtype=np.int32)], True, (*GC, 150), 1, cv2.LINE_AA)
    for k in range(-5, 6):
        cv2.line(c, (vx + k * 5, vy + 20), (vx + k * 38, H - 60), (*GC, 60), 1, cv2.LINE_AA)
    for k in range(12):
        t = (k + 1) / 13.0
        y = vy + 20 + (H - 60 - vy - 20) * t ** 1.6
        wdt = 24 + 186 * t ** 1.6
        J._draw_rock(c, vx + rng.uniform(-wdt * 0.8, wdt * 0.8), y, 5 + 16 * t ** 1.4, 4 + 10 * t ** 1.4, GC, 80 + k, alpha=170)
    # little Hermes with a staff, and the whisper arcs
    hx, hy = vx - 120, H - 92
    cv2.circle(c, (hx, hy - 38), 7, (*GC, 215), 1, cv2.LINE_AA)
    cv2.line(c, (hx, hy - 31), (hx, hy), (*GC, 215), 2, cv2.LINE_AA)
    cv2.line(c, (hx, hy - 24), (hx + 14, hy - 12), (*GC, 190), 1, cv2.LINE_AA)
    cv2.line(c, (hx + 16, hy + 4), (hx + 16, hy - 62), (*GC, 205), 1, cv2.LINE_AA)
    cv2.line(c, (hx, hy), (hx - 6, hy + 16), (*GC, 190), 1, cv2.LINE_AA)
    cv2.line(c, (hx, hy), (hx + 6, hy + 16), (*GC, 190), 1, cv2.LINE_AA)
    for r in (26, 44, 62):
        J._draw_arc(c, (vx, vy - 20), r, 200, 340, gc=GC, alpha=130, seed=90 + r, passes=1)
    text(c, "The North Portal", vx, 72, 32, 81, center=True)
    text(c, "the canyon splits ahead", vx + 140, vy - 8, 22, 82)
    text(c, "it whispers", vx - 220, vy - 70, 24, 83)
    cv2.line(c, (vx - 120, vy - 40), (vx - 36, vy - 18), (*GC, 150), 1, cv2.LINE_AA)
    save(c, "sketch_chasm_mouth.webp")


if __name__ == "__main__":
    sketch_dry_wash()
    sketch_cairn_one()
    sketch_chasm_mouth()
