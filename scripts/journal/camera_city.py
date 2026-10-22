#!/usr/bin/env python3
"""
The Camera Obscura · the city of the third tower (Stage Path, Station 21)
==========================================================================
One source of truth for the city that the dark room projects on its wall:
- the city "before" (drawn upside down on Sheet 20A) and "now" (what the Hub projects),
- the eleven places Silvia can point at,
- the four things that changed between the two (a flag, a cart, a shutter, a chimney that smokes).

The hideout of the raiders is the narrow house behind the market: its chimney was cold on the sheet and smokes now.
Used by the journal sheet (scripts/journal/build_stage_path.py draws the "before" version) and by the Hub, which
loads the generated `web/assets/js/camera-city-data.js`. Deterministic: running it twice writes the same file.

Run:  python3 scripts/journal/camera_city.py            (writes the Hub data and the room's thumbnail)
      python3 scripts/journal/camera_city.py --preview  (also writes before/now PNGs in the scratch folder given by $CITY_PREVIEW)
"""

import json
import math
import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_JS = os.path.join(PROJECT_ROOT, "web", "assets", "js", "camera-city-data.js")

W, H = 1200, 640
GROUND = 520            # where the buildings stand; the street runs below it

# id -> (name, what changed there)
PLACES = {
    "windmill": ("the windmill", None),
    "house_a": ("the house by the windmill", None),
    "tower": ("the clock tower", "flag"),
    "fountain": ("the fountain", None),
    "theatre": ("the domed hall", None),
    "market": ("the market", "cart"),
    "house_d": ("the narrow house behind the market", "smoke"),
    "house_b": ("the house beside the market", None),
    "house_c": ("the house with the shutters", "shutter"),
    "bridge": ("the stone bridge", None),
    "gate": ("the city gate", None),
}
TARGET = "house_d"      # the hideout


def _circle(cx, cy, r, n=28):
    return [(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n)]


def _arc(cx, cy, r, a0, a1, n=16):
    """Degrees, clockwise on screen from east; a0 -> a1."""
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)), cy + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]


def _rect(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


class _City:
    def __init__(self):
        self.items = []     # {p, o, c, f, pts}   p place, o 'before'|'now'|None, c closed, f fill (0 none, 1 wall, 2 roof)
        self.smoke = []     # {p, o, x, y}

    def add(self, place, pts, closed=False, fill=0, only=None):
        self.items.append({"p": place, "o": only, "c": closed, "f": fill, "pts": [[round(x, 1), round(y, 1)] for x, y in pts]})

    def puff(self, place, x, y, only=None):
        self.smoke.append({"p": place, "o": only, "x": x, "y": y})

    # ---- parts ----
    def window(self, place, x, y, w, h, arched=False):
        if arched:
            self.add(place, [(x, y + h), (x, y + w / 2)] + _arc(x + w / 2, y + w / 2, w / 2, 180, 360, 8) + [(x + w, y + h)], False, 0)
        else:
            self.add(place, _rect(x, y, x + w, y + h), True, 0)
        self.add(place, [(x + w / 2, y), (x + w / 2, y + h)])
        self.add(place, [(x, y + h / 2), (x + w, y + h / 2)])

    def house(self, place, x0, x1, base, wall_h, roof_h, chimney, door=True, windows=2, overhang=7):
        top = base - wall_h
        mid = (x0 + x1) / 2
        self.add(place, _rect(x0, top, x1, base), True, 1)
        self.add(place, [(x0 - overhang, top), (mid, top - roof_h), (x1 + overhang, top)], True, 2)
        # the chimney stands on the slope of the right half of the roof
        cx0 = chimney
        slope_y = top - roof_h + (cx0 - mid) * (roof_h / ((x1 + overhang) - mid))
        self.add(place, _rect(cx0, slope_y - 36, cx0 + 11, slope_y + 2), True, 1)
        self.add(place, [(cx0 - 3, slope_y - 36), (cx0 + 14, slope_y - 36)])
        if door:
            dw = max(14, (x1 - x0) * 0.2)
            self.add(place, [(x0 + (x1 - x0) * 0.38, base), (x0 + (x1 - x0) * 0.38, base - 38)] +
                     _arc(x0 + (x1 - x0) * 0.38 + dw / 2, base - 38, dw / 2, 180, 360, 6) +
                     [(x0 + (x1 - x0) * 0.38 + dw, base)])
        if windows:
            ww = max(11, (x1 - x0) * 0.17)
            for k in range(windows):
                wx = x0 + 8 + k * ((x1 - x0) - 16 - ww) / max(1, windows - 1)
                self.window(place, wx, top + 14, ww, ww * 1.15)
        return slope_y - 36

    def cart(self, place, x, base, only=None):
        self.add(place, _rect(x, base - 46, x + 66, base - 14), True, 1, only)
        self.add(place, [(x, base - 30), (x - 30, base - 12)], False, 0, only)           # the handle
        for wx in (x + 16, x + 52):
            self.add(place, _circle(wx, base - 12, 13, 18), True, 0, only)
            self.add(place, [(wx - 13, base - 12), (wx + 13, base - 12)], False, 0, only)
            self.add(place, [(wx, base - 25), (wx, base + 1)], False, 0, only)
        self.add(place, [(x + 8, base - 46), (x + 14, base - 58), (x + 30, base - 62), (x + 46, base - 58), (x + 58, base - 46)], False, 0, only)   # sacks

    def stall(self, place, x0, base=GROUND):
        w = 40
        self.add(place, [(x0, base - 66), (x0 + w, base - 66), (x0 + w + 6, base - 44), (x0 - 6, base - 44)], True, 2)
        for k in range(1, 4):
            self.add(place, [(x0 + w * k / 4, base - 66), (x0 + w * k / 4 + (k - 2) * 1.5, base - 44)])
        self.add(place, [(x0 + 2, base - 44), (x0 + 2, base)])
        self.add(place, [(x0 + w - 2, base - 44), (x0 + w - 2, base)])
        self.add(place, _rect(x0 + 2, base - 20, x0 + w - 2, base - 14), True, 1)


def build():
    c = _City()
    # ---- scenery: the hills, the street, the birds, a little cloud ----
    c.add(None, [(0, 452), (90, 436), (210, 444), (330, 424), (470, 440), (600, 428), (760, 442), (900, 430), (1040, 446), (1200, 432)])
    c.add(None, [(0, GROUND), (W, GROUND)])
    for k in range(9):
        x = 40 + k * 140 + (k % 3) * 18
        c.add(None, [(x, 556 + (k % 2) * 14), (x + 46, 556 + (k % 2) * 14)])
    for bx, by in ((560, 210), (610, 178), (668, 226)):
        c.add(None, [(bx - 14, by), (bx, by + 8), (bx + 14, by - 2)])
    c.add(None, [(840, 150), (856, 138), (884, 136), (900, 148), (924, 146), (934, 158), (840, 160)], True, 0)

    # ---- the windmill ----
    c.add("windmill", [(62, GROUND), (100, GROUND), (91, 396), (71, 396)], True, 1)
    c.add("windmill", [(67, 396), (95, 396), (81, 366)], True, 2)
    hub = (81, 384)
    for ang in (40, 130, 220, 310):
        a = math.radians(ang)
        ux, uy, vx, vy = math.cos(a), math.sin(a), -math.sin(a), math.cos(a)
        c.add("windmill", [(hub[0] + ux * 12 + vx * 7, hub[1] + uy * 12 + vy * 7), (hub[0] + ux * 60 + vx * 7, hub[1] + uy * 60 + vy * 7),
                           (hub[0] + ux * 60 - vx * 7, hub[1] + uy * 60 - vy * 7), (hub[0] + ux * 12 - vx * 7, hub[1] + uy * 12 - vy * 7)], True, 0)
        c.add("windmill", [(hub[0] + ux * 12, hub[1] + uy * 12), (hub[0] + ux * 60, hub[1] + uy * 60)])
    c.add("windmill", [(76, GROUND), (76, 490)] + _arc(81, 490, 5, 180, 360, 5) + [(86, GROUND)])

    # ---- the house by the windmill (smokes before and now) ----
    top_a = c.house("house_a", 140, 216, GROUND, 104, 62, 192)
    c.puff("house_a", 197, top_a - 4)

    # ---- the clock tower (a flag flies from it now) ----
    c.add("tower", _rect(240, 230, 306, GROUND), True, 1)
    c.add("tower", [(233, 230), (273, 148), (313, 230)], True, 2)
    c.add("tower", _circle(273, 292, 25, 24), True, 0)
    c.add("tower", [(273, 292), (273, 274)])
    c.add("tower", [(273, 292), (286, 298)])
    for k in range(12):
        a = math.radians(30 * k)
        c.add("tower", [(273 + 21 * math.cos(a), 292 + 21 * math.sin(a)), (273 + 25 * math.cos(a), 292 + 25 * math.sin(a))])
    c.window("tower", 263, 352, 20, 30, arched=True)
    c.window("tower", 263, 420, 20, 30, arched=True)
    c.add("tower", [(273, 148), (273, 112)], False, 0, "now")
    c.add("tower", [(273, 112), (314, 124), (273, 136)], True, 2, "now")

    # ---- the fountain ----
    c.add("fountain", [(338, 548), (414, 548), (406, 522), (346, 522)], True, 1)
    c.add("fountain", [(370, 522), (382, 522), (379, 474), (373, 474)], True, 1)
    c.add("fountain", _arc(376, 470, 28, 0, 180, 12), False, 0)
    c.add("fountain", [(348, 470), (404, 470)])
    c.add("fountain", [(376, 470), (376, 440), (368, 432)], False, 0)
    for s in (-1, 1):
        c.add("fountain", [(376, 440), (376 + s * 14, 432), (376 + s * 26, 450), (376 + s * 30, 470)])

    # ---- the domed hall ----
    c.add("theatre", _rect(440, 424, 646, GROUND), True, 1)
    c.add("theatre", _rect(446, 410, 640, 428), True, 1)
    c.add("theatre", [(446, 410), (543, 362), (640, 410)], True, 2)
    for k in range(7):
        cx = 462 + k * 29.5
        c.add("theatre", _rect(cx, 428, cx + 12, GROUND), True, 0)
    c.add("theatre", _rect(500, 336, 586, 366), True, 1)
    c.add("theatre", _arc(543, 336, 43, 180, 360, 20), True, 2)
    for k in (-1, 0, 1):
        c.add("theatre", [(543 + 30 * k, 336 - 30 * math.sqrt(max(0, 1 - (k * 30 / 43) ** 2)) * 0.2), (543 + 30 * k * 0.4, 296)])
    c.add("theatre", _rect(535, 270, 551, 294), True, 1)
    c.add("theatre", [(543, 270), (543, 240)])
    c.add("theatre", _circle(543, 236, 4, 10), True, 0)
    c.add("theatre", [(528, 480), (528, 458)] + _arc(543, 458, 15, 180, 360, 8) + [(558, 480), (558, GROUND)], False, 0)

    # ---- the narrow house behind the market (its chimney is cold before, and smokes now) ----
    top_d = c.house("house_d", 722, 764, 458, 86, 40, 754, door=False, windows=1, overhang=5)
    c.puff("house_d", 760, top_d - 4, "now")

    # ---- the market (a new cart stands in the street now) ----
    for x0 in (668, 716, 764):
        c.stall("market", x0)
    c.cart("market", 690, 586, "now")

    # ---- the house beside the market (smokes before and now) ----
    top_b = c.house("house_b", 808, 888, GROUND, 92, 66, 868, windows=2)
    c.puff("house_b", 873, top_b - 4)

    # ---- the house with the shutters: the upper shutter is open before and closed now ----
    c.add("house_c", _rect(902, 410, 982, GROUND), True, 1)
    c.add("house_c", [(895, 410), (942, 350), (989, 410)], True, 2)
    c.add("house_c", [(942, GROUND), (942, 478)] + _arc(953, 478, 11, 180, 360, 6) + [(964, GROUND)], False, 0)
    c.window("house_c", 914, 436, 18, 24)
    c.window("house_c", 950, 436, 18, 24)
    wx, wy, ww, wh = 928, 368, 26, 32
    c.add("house_c", _rect(wx, wy, wx + ww, wy + wh), True, 0)
    c.add("house_c", [(wx + ww / 2, wy), (wx + ww / 2, wy + wh)], False, 0, "before")
    c.add("house_c", [(wx, wy + wh / 2), (wx + ww, wy + wh / 2)], False, 0, "before")
    c.add("house_c", _rect(wx - 11, wy, wx - 2, wy + wh), True, 1, "before")         # the shutters stand open
    c.add("house_c", _rect(wx + ww + 2, wy, wx + ww + 11, wy + wh), True, 1, "before")
    c.add("house_c", _rect(wx, wy, wx + ww, wy + wh), True, 1, "now")               # ... and are closed
    for k in range(1, 5):
        c.add("house_c", [(wx, wy + wh * k / 5), (wx + ww, wy + wh * k / 5)], False, 0, "now")
    c.add("house_c", [(wx + ww / 2, wy), (wx + ww / 2, wy + wh)], False, 0, "now")

    # ---- the stone bridge ----
    c.add("bridge", [(990, 500), (1118, 500), (1118, 512), (990, 512)], True, 1)
    c.add("bridge", [(990, 500), (990, 486), (1118, 486), (1118, 500)])
    for k in range(8):
        c.add("bridge", [(996 + k * 17, 486), (996 + k * 17, 500)])
    for cx in (1022, 1086):
        c.add("bridge", [(cx - 26, 548)] + _arc(cx, 548, 26, 180, 360, 12) + [(cx + 26, 548)], False, 0)
    c.add("bridge", [(990, 512), (990, 548)])
    c.add("bridge", [(1118, 512), (1118, 548)])
    c.add("bridge", [(1054, 512), (1054, 548)])
    for k in range(5):
        c.add("bridge", [(984 + k * 28, 566 + (k % 2) * 8), (1000 + k * 28, 560 + (k % 2) * 8), (1014 + k * 28, 566 + (k % 2) * 8)])

    # ---- the city gate ----
    c.add("gate", _rect(1134, 388, 1200, GROUND), True, 1)
    c.add("gate", [(1130, 388), (1130, 372), (1142, 372), (1142, 380), (1154, 380), (1154, 372), (1166, 372), (1166, 380),
                   (1178, 380), (1178, 372), (1190, 372), (1190, 380), (1200, 380)], False, 2)
    c.add("gate", [(1150, GROUND), (1150, 462)] + _arc(1170, 462, 20, 180, 360, 10) + [(1190, GROUND)], False, 0)
    c.add("gate", [(1170, 442), (1170, GROUND)])
    c.add("gate", [(1150, 482), (1190, 482)])
    c.add("gate", [(1148, 410), (1148, 426), (1156, 426), (1156, 410)], True, 0)

    # ---- the places and their hit areas ----
    places = []
    for pid, (name, change) in PLACES.items():
        xs, ys = [], []
        for it in c.items:
            if it["p"] == pid:
                xs += [p[0] for p in it["pts"]]
                ys += [p[1] for p in it["pts"]]
        for s in c.smoke:
            if s["p"] == pid:
                xs.append(s["x"]); ys.append(s["y"] - 56)
        pad = 8
        box = [max(0, round(min(xs) - pad)), max(0, round(min(ys) - pad)), min(W, round(max(xs) + pad)), min(H, round(max(ys) + pad))]
        places.append({"id": pid, "name": name, "change": change, "box": box})
    return {"width": W, "height": H, "ground": GROUND, "target": TARGET, "places": places, "items": c.items, "smoke": c.smoke}


def view(data, version):
    """The items and smoke of one version ('before' = Sheet 20A, 'now' = the Hub's projection)."""
    keep = lambda o: o is None or o == version
    return [i for i in data["items"] if keep(i["o"])], [s for s in data["smoke"] if keep(s["o"])]


def write_js(data):
    js = ("// GENERATED by scripts/journal/camera_city.py · do not edit by hand.\n"
          "// The city of the third tower as the Camera Obscura projects it, and the four things that changed since Sheet 20A.\n"
          "window.CAMERA_CITY = " + json.dumps(data, separators=(",", ":")) + ";\n")
    os.makedirs(os.path.dirname(OUT_JS), exist_ok=True)
    with open(OUT_JS, "w", encoding="utf-8") as fh:
        fh.write(js)
    return OUT_JS


def preview(data, version, path, flip=False):
    import cv2
    import numpy as np
    img = np.full((H, W, 3), 238, np.uint8)
    items, smoke = view(data, version)
    for it in items:
        pts = np.round(np.array(it["pts"], np.float32)).astype(np.int32)
        if it["c"] and it["f"]:
            cv2.fillPoly(img, [pts], (222, 226, 232) if it["f"] == 1 else (180, 190, 205))
        cv2.polylines(img, [pts], it["c"], (60, 55, 50), 2, cv2.LINE_AA)
    for s in smoke:
        for k in range(4):
            cv2.circle(img, (int(s["x"] + (k % 2) * 8 - 4), int(s["y"] - 14 * k)), 6 + 2 * k, (120, 120, 120), 1, cv2.LINE_AA)
    for p in data["places"]:
        b = p["box"]
        cv2.rectangle(img, (b[0], b[1]), (b[2], b[3]), (60, 120, 220), 1)
        cv2.putText(img, p["id"], (b[0] + 2, b[1] + 12), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (60, 120, 220), 1)
    if flip:
        img = img[::-1, ::-1].copy()
    cv2.imwrite(path, img)


def thumbnail(data, path):
    """The card of the room on the Quest Map: the city on the dark wall, upside down and a little out of focus (760 x 480)."""
    import cv2
    import numpy as np
    S = 4
    img = np.zeros((H * S // 2, W * S // 2, 3), np.uint8)
    img[:] = (14, 10, 12)
    items, smoke = view(data, "now")
    k = S / 2
    for it in items:
        pts = np.round(np.array(it["pts"], np.float32) * k).astype(np.int32)
        if it["c"] and it["f"]:
            cv2.fillPoly(img, [pts], (52, 66, 74) if it["f"] == 2 else (30, 38, 44))
        cv2.polylines(img, [pts], it["c"], (184, 226, 243), 3, cv2.LINE_AA)
    for sm in smoke:
        for j in range(3):
            cv2.circle(img, (int(sm["x"] * k + (j % 2) * 10 - 5), int((sm["y"] - 8 - 15 * j) * k)), int((5 + 2.4 * j) * k), (150, 200, 225), 2, cv2.LINE_AA)
    img = img[::-1, ::-1]                                    # the wall shows the city upside down
    img = cv2.GaussianBlur(img, (0, 0), 2.2)
    vignette = np.zeros(img.shape[:2], np.float32)
    cv2.circle(vignette, (img.shape[1] // 2, img.shape[0] // 2), int(img.shape[0] * 0.62), 1.0, -1)
    vignette = cv2.GaussianBlur(vignette, (0, 0), img.shape[0] * 0.18)
    img = (img.astype(np.float32) * (0.25 + 0.75 * vignette[:, :, None])).astype(np.uint8)
    img = cv2.resize(img, (760, 480), interpolation=cv2.INTER_AREA)
    cv2.imwrite(path, img, [cv2.IMWRITE_WEBP_QUALITY, 82])
    return path


if __name__ == "__main__":
    d = build()
    print("written:", write_js(d))
    print("written:", thumbnail(d, os.path.join(PROJECT_ROOT, "web", "assets", "thumbnails", "camera_obscura_preview.webp")))
    if "--preview" in sys.argv:
        out = os.environ.get("CITY_PREVIEW", ".")
        preview(d, "before", os.path.join(out, "city_before.png"))
        preview(d, "now", os.path.join(out, "city_now.png"))
        print("previews in", out)
