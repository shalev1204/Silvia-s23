#!/usr/bin/env python3
"""
The sheet verifier (docs/IDEAS_BACKLOG.md #15)
==============================================
Renders each face of the journal and checks what the eye of a proof-reader would:

1. Text and drawing never touch: no stroke within 40 px of a block of text (.agents/rules/user-preferences.md §3).
   Two things are not illustrations: thin dividers (a pencil rule under a title) are left out, and a label that sits
   inside a drawing on purpose (a letter on a mask, a numeral in a shard, a caption in its frame) only has to keep
   clear of the strokes around it by a few pixels.
2. Letter sizes: no reading text under 22 px; a warning when the body of a face is under 35 px (§4).
3. Words and rules: forbidden terms and jargon (the lore lint's lists), no letter given its value (Rule 9), only the
   letters A-Z in formulas (Rule 10), and every seal of Sheets 20-26 reads back to its room (scripts/journal/sheet_seal.py).

How it sees the text: while a face renders, every render_pencil_text and blit_rgba of the builders is watched, so each
block of text is known with its words, its size and its exact pixels; everything else on the face is drawing.
Text drawn another way (straight with PIL) is not seen: the report says how many blocks each face had.

Sheets 1-18 are already printed: they are reported, never blocking. Sheets 19-26 block (exit code 1), and
build_stage_path.py runs this check on every face before it writes the PDF.

Run:  python3 scripts/journal/verify_sheets.py               all sheets
      python3 scripts/journal/verify_sheets.py --sheets 19-26
A face with collisions leaves a picture in journal/verify/<face>_check.png (red: the strokes too close to the text).
"""

import argparse
import os
import re
import sys

import cv2
import numpy as np

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from scripts.audit.lint_lore_and_vocabulary import FORBIDDEN_PATTERNS, ACCESSIBILITY_PATTERNS   # noqa: E402

BUFFER = 40            # px of clear paper between text and drawing
INK = 60               # alpha from which a pixel counts as a stroke (lighter is paper texture)
SPECK = 12             # stray pixels tolerated near a block before it counts as a collision
TOUCH = 3              # px a label inside a drawing keeps from its strokes (it may sit close, never touch)
MIN_TEXT, BODY = 22, 35
FIRST_BLOCKING = 19    # Sheets 1-18 are printed already
OUT_DIR = os.path.join(PROJECT_ROOT, "journal", "verify")

_texts = {}            # signature of a rendered text image -> (words, size)
_records = {}          # id(canvas) -> [block of text placed on it]
_seals = {}            # id(canvas) -> [(face, cx, cy, r)]


def _sig(arr):
    return (arr.shape, int(arr[:, :, 3].sum())) if isinstance(arr, np.ndarray) and arr.ndim == 3 and arr.shape[2] == 4 else None


def _watch_text(fn):
    def wrapper(text, *args, **kwargs):
        out = fn(text, *args, **kwargs)
        img = out[0] if isinstance(out, tuple) else out
        size = kwargs.get("font_size", args[1] if len(args) > 1 else None)
        s = _sig(img)
        if s:
            _texts[s] = (str(text), size)   # a mirrored copy keeps the same signature
        return out
    wrapper._watched = True
    return wrapper


def _watch_blit(fn):
    def wrapper(target, src, x, y, *args, **kwargs):
        out = fn(target, src, x, y, *args, **kwargs)
        x, y = int(x), int(y)
        s = _sig(src)
        if s in _texts:
            words, size = _texts[s]
            _records.setdefault(id(target), []).append({"x": x, "y": y, "mask": src[:, :, 3] > 20, "text": words, "size": size})
        for r in _records.get(id(src), []):       # a part of the face, drawn apart and pasted in
            _records.setdefault(id(target), []).append(dict(r, x=r["x"] + x, y=r["y"] + y))
        for (face, cx, cy, rad) in _seals.get(id(src), []):
            _seals.setdefault(id(target), []).append((face, cx + x, cy + y, rad))
        return out
    wrapper._watched = True
    return wrapper


def _watch_seal(fn):
    def wrapper(canvas, cx, cy, r, face, *args, **kwargs):
        _seals.setdefault(id(canvas), []).append((face, cx, cy, r))
        return fn(canvas, cx, cy, r, face, *args, **kwargs)
    wrapper._watched = True
    return wrapper


def install():
    """Load every builder and watch its text, its pastes and its seals."""
    import scripts.journal.build_entire_journal   # noqa: F401  (imports every sheet builder)
    import scripts.journal.sheet_seal             # noqa: F401
    for name, mod in list(sys.modules.items()):
        if not name.startswith("scripts.journal.") or mod is None:
            continue
        for attr, watch in (("render_pencil_text", _watch_text), ("blit_rgba", _watch_blit), ("draw_seal", _watch_seal)):
            fn = getattr(mod, attr, None)
            if callable(fn) and not getattr(fn, "_watched", False):
                setattr(mod, attr, watch(fn))


def journal_sheets():
    install()
    from scripts.journal.build_entire_journal import JOURNAL_SHEETS
    return JOURNAL_SHEETS


def _render(renderer):
    from scripts.journal.build_desert_games import GRAPHITE_COLOR
    from PIL import Image
    from scripts.journal.pdf_builder import PDFBuilder
    _texts.clear(); _records.clear(); _seals.clear()
    # some builders of the printed sheets write their PDF and mockup as they draw: a check writes nothing
    saved = cv2.imwrite, PDFBuilder.save_a5_pdf_from_rgba, Image.Image.save
    cv2.imwrite = lambda *a, **k: True
    PDFBuilder.save_a5_pdf_from_rgba = staticmethod(lambda *a, **k: None)
    Image.Image.save = lambda *a, **k: None
    try:
        try:
            canvas = renderer(gc=GRAPHITE_COLOR)
        except TypeError:
            canvas = renderer()
    finally:
        cv2.imwrite, Image.Image.save = saved[0], saved[2]
        PDFBuilder.save_a5_pdf_from_rgba = staticmethod(saved[1])
    if not isinstance(canvas, np.ndarray):
        canvas = np.array(canvas.convert("RGBA")) if hasattr(canvas, "convert") else np.asarray(canvas)
    blocks = _records.get(id(canvas), [])   # a face copied after its text went in shows 0 blocks in the report
    seals = _seals.get(id(canvas), [])
    return canvas, blocks, seals


def _dividers(drawing):
    """Thin horizontal pencil rules (dividers under titles, short dashes): typography, not illustration."""
    n, lab, stats, _ = cv2.connectedComponentsWithStats(drawing.astype(np.uint8), connectivity=8)
    keep = np.zeros(n, bool)
    for i in range(1, n):
        cw, ch = stats[i, cv2.CC_STAT_WIDTH], stats[i, cv2.CC_STAT_HEIGHT]
        keep[i] = (ch <= 14 and cw >= 4 * ch) or (ch <= 26 and cw >= 12 * ch)   # a plain rule, or one with a small ornament
    # the dots that end a rule belong to it
    near = cv2.dilate(keep[lab].astype(np.uint8), np.ones((9, 31), np.uint8)) > 0
    for i in range(1, n):
        if not keep[i] and stats[i, cv2.CC_STAT_AREA] <= 40 and near[lab == i].any():
            keep[i] = True
    return keep[lab]


def _enclosed(drawing, box):
    """A label inside a drawing: strokes on all four sides, close to it."""
    x0, y0, x1, y1 = box
    h, w = drawing.shape
    reach = max(150, int(1.5 * max(x1 - x0, y1 - y0)))
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    band = lambda a, b: slice(max(0, a), max(0, min(b, 10 ** 6)))
    up = drawing[band(y0 - reach, y0 - TOUCH), band(cx - 3, cx + 4)]
    down = drawing[band(y1 + TOUCH, min(h, y1 + reach)), band(cx - 3, cx + 4)]
    left = drawing[band(cy - 3, cy + 4), band(x0 - reach, x0 - TOUCH)]
    right = drawing[band(cy - 3, cy + 4), band(x1 + TOUCH, min(w, x1 + reach))]
    return all(z.size and z.any() for z in (up, down, left, right))


def _face_name(stem):
    m = re.match(r"page(\d+)_(front|back)", stem)
    return (str(int(m.group(1))) + ("A" if m.group(2) == "front" else "B")) if m else stem


def _letter_values(text):
    """Rule 9: a letter given its value ('[A] = 5', 'K = 3'); equations between letters are fine."""
    return [c.strip() for c in re.split(r"[,;:()·]", text) if re.match(r"^\s*\[?[A-Z]\]?\s*=\s*\d+\s*$", c)]


def check_face(num, label, renderer, stem, is_back, bleed):
    """Render one face and return (canvas, errors, warnings, notes)."""
    canvas, blocks, seals = _render(renderer)
    h, w = canvas.shape[:2]
    errors, warnings = [], []
    alpha = canvas[:, :, 3]

    # the text's own pixels, so its strokes are never taken for drawing
    text_px = np.zeros((h, w), bool)
    placed = []
    for b in blocks:
        mh, mw = b["mask"].shape
        x0, y0 = max(0, b["x"]), max(0, b["y"])
        x1, y1 = min(w, b["x"] + mw), min(h, b["y"] + mh)
        if x1 <= x0 or y1 <= y0:
            continue
        m = b["mask"][y0 - b["y"]:y1 - b["y"], x0 - b["x"]:x1 - b["x"]]
        text_px[y0:y1, x0:x1] |= m
        ys, xs = np.nonzero(m)
        if len(xs):
            placed.append(dict(b, box=(x0 + xs.min(), y0 + ys.min(), x0 + xs.max(), y0 + ys.max())))
    text_px = cv2.dilate(text_px.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    drawing = (alpha >= INK) & ~text_px
    drawing &= ~_dividers(drawing)

    # 1. collisions
    hits = []
    for b in placed:
        bx0, by0, bx1, by1 = b["box"]
        pad = TOUCH if _enclosed(drawing, b["box"]) else BUFFER
        zx0, zy0, zx1, zy1 = max(0, bx0 - pad), max(0, by0 - pad), min(w, bx1 + pad + 1), min(h, by1 + pad + 1)
        n = int(np.count_nonzero(drawing[zy0:zy1, zx0:zx1]))
        if n > SPECK:
            hits.append((b, (zx0, zy0, zx1, zy1), n))
    if hits:
        msg = "%d text blocks with a stroke within %d px: %s" % (len(hits), BUFFER, "; ".join(
            '"%s" (%d px of ink)' % (b["text"][:40], n) for b, _, n in hits[:4]) + (" …" if len(hits) > 4 else ""))
        (warnings if bleed else errors).append(msg + (" [full-bleed map: labels sit on the drawing]" if bleed else ""))
        _overlay(canvas, drawing, hits, stem)

    # 2. letter sizes
    sizes = [b["size"] for b in placed if isinstance(b["size"], (int, float))]
    small = sorted({s for s in sizes if s < MIN_TEXT})
    if small:
        errors.append("text under %d px: %s" % (MIN_TEXT, ", ".join("%g px" % s for s in small)))
    if sizes:
        weight = {}
        for b in placed:
            if isinstance(b["size"], (int, float)):
                weight[b["size"]] = weight.get(b["size"], 0) + len(b["text"])
        body = max(weight, key=weight.get)
        if body < BODY:
            warnings.append("the body of the face is %g px (under %d px)" % (body, BODY))

    # 3. words and rules
    words = "\n".join(b["text"] for b in placed)
    for pat, why in FORBIDDEN_PATTERNS + ACCESSIBILITY_PATTERNS:
        if re.search(pat, words, re.IGNORECASE):   # as the lint reads them
            errors.append(why)
    values = [v for b in placed for v in _letter_values(b["text"])]
    if values:
        errors.append("Rule 9, letters with their value: " + ", ".join(values[:5]))
    greek = sorted(set(re.findall(r"[Ͱ-Ͽ]", words)))
    if greek:
        errors.append("Rule 10, letters outside A-Z: " + " ".join(greek))
    face = _face_name(stem)
    from scripts.journal import sheet_seal
    if num >= 20 and face in sheet_seal.FACES:
        mine = [s for s in seals if s[0] == face]
        if not mine:
            errors.append("the seal of Sheet %s is missing (sheet_seal.draw_seal)" % face)
        for (_, cx, cy, r) in mine:
            pad = int(r * 1.1)
            crop = canvas[max(0, int(cy) - pad):int(cy) + pad, max(0, int(cx) - pad):int(cx) + pad]
            if sheet_seal.read_back(np.ascontiguousarray(crop)) != sheet_seal.seal_url(face):
                errors.append("the seal of Sheet %s does not read back" % face)

    notes = "%d text blocks seen" % len(placed) + ("" if placed else " (its text is drawn another way: not checked)")
    return canvas, errors, warnings, notes


def _overlay(canvas, drawing, hits, stem):
    os.makedirs(OUT_DIR, exist_ok=True)
    paper = np.full(canvas.shape[:2] + (3,), (214, 230, 240), np.uint8)
    a = canvas[:, :, 3:4].astype(np.float32) / 255.0
    img = (canvas[:, :, :3].astype(np.float32) * a + paper * (1 - a)).astype(np.uint8)
    for _, (x0, y0, x1, y1), _ in hits:
        zone = drawing[y0:y1, x0:x1]
        img[y0:y1, x0:x1][zone] = (40, 40, 230)
        cv2.rectangle(img, (x0, y0), (x1 - 1, y1 - 1), (40, 40, 230), 3)
    cv2.imwrite(os.path.join(OUT_DIR, stem + "_check.png"), img)


def main():
    ap = argparse.ArgumentParser(description="Check the journal sheets before printing")
    ap.add_argument("--sheets", default="1-26", help="a range such as 19-26, or a single sheet")
    args = ap.parse_args()
    lo, _, hi = args.sheets.partition("-")
    lo, hi = int(lo), int(hi or lo)
    blocking = 0
    for num, *faces in journal_sheets():
        if not lo <= num <= hi:
            continue
        for label, renderer, stem, is_back, bleed in faces:
            _, errors, warnings, notes = check_face(num, label, renderer, stem, is_back, bleed)
            printed = num < FIRST_BLOCKING
            mark = "✓" if not errors else ("•" if printed else "✗")
            print("%s %s · %s" % (mark, label, notes))
            for e in errors:
                print("    %s %s" % ("info:" if printed else "ERROR:", e))
            for wmsg in warnings:
                print("    note: " + wmsg)
            if errors and not printed:
                blocking += 1
    if blocking:
        print("\n✗ %d faces of Sheets %d-26 need fixing before printing." % (blocking, FIRST_BLOCKING))
        sys.exit(1)
    print("\n✓ Nothing blocks the printing (Sheets 1-18 are printed already and only reported).")


if __name__ == "__main__":
    main()
