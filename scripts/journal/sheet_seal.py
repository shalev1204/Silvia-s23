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

Needs segno (pip install segno), only for the journal sheets.
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
# game face -> node of its room in the Hub (Stations 21 to 28; Station 20 opened before the seals existed)
FACES = {"20A": 41, "20B": 42, "21B": 43, "22A": 44, "23A": 45, "24A": 46, "25A": 47, "26A": 48}


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


def draw_seal(canvas, cx, cy, r, face, gc=GRAPHITE_COLOR, seed=4100):
    """The medallion: a double ring with twenty-four marks (like Aurelia's disc) and the QR inside the inner ring,
    with its own quiet margin. Ink is solid so the camera reads it on 80-90 g paper."""
    qr = segno.make(seal_url(face), error="h", boost_error=False)
    matrix = [list(row) for row in qr.matrix]
    n = len(matrix)
    inner = r * 0.74
    side = inner * math.sqrt(2) * 0.92            # the QR square fits the inner ring, corners clear of the line
    quiet = 3                                     # modules of clear paper around the code
    mod = max(2, int(side / (n + 2 * quiet)))    # whole pixels, so every module prints the same size
    side = mod * (n + 2 * quiet)
    x0 = cx - side / 2 + quiet * mod
    y0 = cy - side / 2 + quiet * mod
    ink = (int(gc[0] * 0.55), int(gc[1] * 0.55), int(gc[2] * 0.55), 255)
    # clear the paper under the seal
    cv2.circle(canvas, (int(cx), int(cy)), int(r), (0, 0, 0, 0), -1)
    for yy, row in enumerate(matrix):
        for xx, dark in enumerate(row):
            if dark:
                p0 = (int(round(x0 + xx * mod)), int(round(y0 + yy * mod)))
                p1 = (int(round(x0 + (xx + 1) * mod)) - 1, int(round(y0 + (yy + 1) * mod)) - 1)
                cv2.rectangle(canvas, p0, p1, ink, -1)
    for rad, passes in ((r, 3), (r * 0.9, 2), (inner, 2)):
        pts = [(cx + rad * math.cos(a), cy + rad * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 97)]
        for i in range(len(pts) - 1):
            draw_sketchy_line(canvas, pts[i], pts[i + 1], gc=gc, alpha_base=210, passes=passes, seed=seed + i)
    for k in range(24):
        a = k * math.pi / 12
        p = (cx + r * 0.95 * math.cos(a), cy + r * 0.95 * math.sin(a))
        cv2.circle(canvas, (int(p[0]), int(p[1])), max(2, int(r * 0.022)), ink, -1)
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
