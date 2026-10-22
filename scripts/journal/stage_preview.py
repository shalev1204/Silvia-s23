#!/usr/bin/env python3
"""
The print preview of the Stage Path (docs/IDEAS_BACKLOG.md #16)
================================================================
One PDF for Carles to look at before printing Sheets 19 to 26 (it is never given to Silvia):

- Page 1, the spread: the sixteen faces side by side on the real paper, with the faces not built yet as labelled gaps.
- Then one page per built sheet, Cara A and Cara B large, with the zones the paper owns marked on them: the ring holes
  (Cara A X < 165, Cara B X > 1583), the 75 px foot and, where a sheet folds (Sheet 24A, idea #8), its fold line with
  40 px of clear paper on each side. Under each face, the ink found in the ring and foot zones (it must be 0).

build_stage_path.py writes it after the sheets (journal/impresion/02_STAGE_PATH_VISTA_PREVIA_A4.pdf).
Run alone:  python3 scripts/journal/stage_preview.py   (draws the sheets again; writes only the preview)
"""

import datetime
import os
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from scripts.journal.geometry import CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX   # noqa: E402

OUT_PATH = os.path.join(PROJECT_ROOT, "journal", "impresion", "02_STAGE_PATH_VISTA_PREVIA_A4.pdf")
FONT = os.path.join(PROJECT_ROOT, "assets", "fonts", "EBGaramond.ttf")
PAGE_W, PAGE_H, DPI = 2339, 1654, 200          # A4 landscape
RING_A, RING_B, FOOT, FOLD_CLEAR = 165, 1583, 75, 40
INK = 60
RED, BLUE, GREY = (190, 40, 40), (40, 80, 190), (120, 110, 95)

# The sixteen faces of the Stage Path (docs/STAGE_PATH_BIBLE.md §5): face, kind, title
PLAN = [
    ("19A", "historia", "The Unsent Letter"), ("19B", "juego · Estación 20", "The Gate of a Thousand Masks"),
    ("20A", "juego · Estación 21", "The Camera Obscura"), ("20B", "juego · Estación 22", "The Whispering Gallery"),
    ("21A", "cuaderno de Aurelia", "Aurelia's Sketchbook I"), ("21B", "juego · Estación 23", "The Automaton Orchestra"),
    ("22A", "juego · Estación 24", "The Fly Tower"), ("22B", "historia", "The Ashes Before Christ"),
    ("23A", "juego · Estación 25", "The Shadow Theatre"), ("23B", "cuaderno de Aurelia", "Aurelia's Sketchbook II"),
    ("24A", "juego · Estación 26", "The Hall of Mirrors"), ("24B", "historia", "The Doctrine of the Mirror Speaker"),
    ("25A", "juego · Estación 27", "The Kaleidoscope Lantern"), ("25B", "cuaderno de Aurelia", "Aurelia's Sketchbook III"),
    ("26A", "juego · Estación 28", "The Stage of the Mirror Speaker"), ("26B", "cuaderno de Aurelia", "Back to the Peaks"),
]


def _font(size):
    return ImageFont.truetype(FONT, size)


def _paper():
    paper = cv2.imread(os.path.join(PROJECT_ROOT, "journal", "page01", "real_paper_300dpi.png"))
    if paper is None:
        return np.full((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 3), (196, 220, 236), np.uint8)
    return cv2.resize(paper, (CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX), interpolation=cv2.INTER_LANCZOS4)


def _on_paper(canvas, is_back, paper):
    """The face as it prints (the same blend as the mockups of build_stage_path.py), as an RGB PIL image."""
    bg = cv2.flip(paper, 1) if is_back else paper
    a = (canvas[:, :, 3].astype(np.float32) / 255.0)[:, :, None]
    out = (canvas[:, :, :3].astype(np.float32) * a + bg.astype(np.float32) * (1 - a)).astype(np.uint8)
    return Image.fromarray(cv2.cvtColor(out, cv2.COLOR_BGR2RGB))


def _zones(is_back, fold):
    """The zones the paper owns, in face pixels: (name, polygon or box, colour)."""
    ring = (RING_B, 0, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX) if is_back else (0, 0, RING_A, CANVAS_HEIGHT_PX)
    zones = [("anillas", ring, RED), ("pie", (0, CANVAS_HEIGHT_PX - FOOT, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX), RED)]
    if fold:
        zones.append(("doblez", fold, BLUE))
    return zones


def _ink_in(canvas, box):
    x0, y0, x1, y1 = box
    return int(np.count_nonzero(canvas[y0:y1, x0:x1, 3] >= INK))


def _mark(img, is_back, fold, k):
    """Draw the paper's zones on a face image scaled by k (hatched band, its name)."""
    over = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    f = _font(max(14, int(46 * k)))
    for name, z, col in _zones(is_back, fold):
        if name == "doblez":
            (ax, ay), (bx, by) = z
            n = int(np.hypot(bx - ax, by - ay) // 30) or 1
            for i in range(0, n, 2):   # a dashed line and its clear band
                t0, t1 = i / n, (i + 1) / n
                d.line([((ax + (bx - ax) * t0) * k, (ay + (by - ay) * t0) * k),
                        ((ax + (bx - ax) * t1) * k, (ay + (by - ay) * t1) * k)], fill=col + (230,), width=max(2, int(6 * k)))
            nx, ny = -(by - ay), bx - ax
            ln = np.hypot(nx, ny) or 1
            ox, oy = nx / ln * FOLD_CLEAR, ny / ln * FOLD_CLEAR
            d.polygon([((ax + ox) * k, (ay + oy) * k), ((bx + ox) * k, (by + oy) * k),
                       ((bx - ox) * k, (by - oy) * k), ((ax - ox) * k, (ay - oy) * k)], fill=col + (40,))
            d.text(((ax + bx) / 2 * k + 8, (ay + by) / 2 * k), name, font=f, fill=col + (255,))
            continue
        x0, y0, x1, y1 = [v * k for v in z]
        d.rectangle([x0, y0, x1, y1], fill=col + (38,))
        step = max(8, int(28 * k))
        for s in range(int(-(y1 - y0)), int(x1 - x0), step):   # diagonal hatching inside the band
            d.line([(x0 + max(s, 0), y0 + max(-s, 0)), (x0 + min(x1 - x0, s + (y1 - y0)), y0 + min(y1 - y0, (x1 - x0) - s))],
                   fill=col + (90,), width=1)
        if name == "anillas":
            d.text((x0 + 4, y0 + 8), name, font=f, fill=col + (255,))
        else:
            d.text((x0 + 8 + (RING_A * k if not is_back else 0), y0 - f.size - 4), name, font=f, fill=col + (255,))
    return Image.alpha_composite(img.convert("RGBA"), over).convert("RGB")


def _thumb_gap(w, h, face, kind, title):
    img = Image.new("RGB", (w, h), (236, 228, 212))
    d = ImageDraw.Draw(img)
    for i in range(0, 2 * (w + h), 18):   # a dashed outline
        pts = [(i, 0), (min(i + 9, w), 0)] if i < w else None
        if pts:
            d.line(pts, fill=GREY, width=2)
            d.line([(i, h - 1), (min(i + 9, w), h - 1)], fill=GREY, width=2)
    for j in range(0, h, 18):
        d.line([(0, j), (0, min(j + 9, h))], fill=GREY, width=2)
        d.line([(w - 1, j), (w - 1, min(j + 9, h))], fill=GREY, width=2)
    y = h // 3
    for text, size in ((face, 40), (kind, 20), ("por construir", 20)):
        f = _font(size)
        tw = d.textlength(text, font=f)
        d.text(((w - tw) / 2, y), text, font=f, fill=GREY)
        y += size + 16
    _wrapped(d, title, w // 2, y + 10, w - 24, _font(20), GREY)
    return img


def _wrapped(d, text, cx, y, max_w, f, fill):
    line, lines = "", []
    for word in text.split():
        trial = (line + " " + word).strip()
        if d.textlength(trial, font=f) > max_w and line:
            lines.append(line)
            line = word
        else:
            line = trial
    lines.append(line)
    for ln in lines:
        d.text((cx - d.textlength(ln, font=f) / 2, y), ln, font=f, fill=fill or (60, 50, 40))
        y += f.size + 6
    return y


def _spread(faces, built):
    """Page 1: every face of Sheets 19 to 26, two rows of four sheets."""
    page = Image.new("RGB", (PAGE_W, PAGE_H), (250, 247, 240))
    d = ImageDraw.Draw(page)
    d.text((70, 50), "The Stage Path · Hojas 19–26 · vista previa de impresión", font=_font(54), fill=(40, 34, 28))
    d.text((70, 120), "%d de 8 hojas construidas · %s · A5 a doble cara, la cara B se ve al girar la hoja"
           % (built, datetime.date.today().strftime("%d-%m-%Y")), font=_font(28), fill=GREY)
    m, gap, pair_gap = 70, 14, 46
    tw = int((PAGE_W - 2 * m - 3 * pair_gap - 4 * gap) / 8)
    th = int(tw * CANVAS_HEIGHT_PX / CANVAS_WIDTH_PX)
    for i in range(8):
        row, col = divmod(i, 4)
        x = m + col * (2 * tw + gap + pair_gap)
        y = (PAGE_H + 160 - 2 * (th + 120)) // 2 + row * (th + 160)   # the grid centred under the title
        num = 19 + i
        d.text((x, y), "Hoja %d" % num, font=_font(30), fill=(40, 34, 28))
        for j, side in enumerate("AB"):
            face = "%d%s" % (num, side)
            kind, title = [(k, t) for f, k, t in PLAN if f == face][0]
            img = faces.get(face)
            thumb = img.resize((tw, th), Image.LANCZOS) if img is not None else _thumb_gap(tw, th, face, kind, title)
            tx = x + j * (tw + gap)
            page.paste(thumb, (tx, y + 44))
            if img is not None:
                d.rectangle([tx, y + 44, tx + tw - 1, y + 44 + th - 1], outline=(160, 150, 130), width=1)
                _wrapped(d, face + " · " + title, tx + tw // 2, y + 52 + th, tw, _font(18), None)
    return page


def _sheet_page(num, sides):
    """One built sheet: Cara A and Cara B large, the paper's zones marked, the ink found in them."""
    page = Image.new("RGB", (PAGE_W, PAGE_H), (250, 247, 240))
    d = ImageDraw.Draw(page)
    d.text((70, 40), "Hoja %d · anillas, pie y doblez" % num, font=_font(48), fill=(40, 34, 28))
    fh = PAGE_H - 270
    k = fh / CANVAS_HEIGHT_PX
    fw = int(CANVAS_WIDTH_PX * k)
    x = (PAGE_W - 2 * fw - 120) // 2
    for side, (img, canvas, is_back, fold, label) in sides:
        face = _mark(img.resize((fw, fh), Image.LANCZOS), is_back, fold, k)
        page.paste(face, (x, 130))
        d.rectangle([x, 130, x + fw - 1, 130 + fh - 1], outline=(160, 150, 130), width=1)
        ring = (RING_B, 0, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX) if is_back else (0, 0, RING_A, CANVAS_HEIGHT_PX)
        foot = (0, CANVAS_HEIGHT_PX - FOOT, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX)
        ink = (_ink_in(canvas, ring), _ink_in(canvas, foot))
        ok = ink == (0, 0)
        y = _wrapped(d, label, x + fw // 2, 140 + fh, fw, _font(22), None)
        status = "%s · tinta en anillas: %d px · en el pie: %d px%s" % ("Limpia" if ok else "REVISAR", ink[0], ink[1],
                                                                       " · doblez marcado" if fold else "")
        _wrapped(d, status, x + fw // 2, y + 2, fw, _font(22), (40, 120, 60) if ok else RED)
        x += fw + 120
    return page


def build_preview(canvases=None):
    """Write the preview. canvases: {stem: RGBA face} already drawn (build_stage_path.build passes them)."""
    from scripts.journal.build_stage_path import STAGE_SHEETS, FOLD_LINES, GRAPHITE_COLOR
    canvases = dict(canvases or {})
    paper = _paper()
    faces, pages = {}, []
    for num, *sides in STAGE_SHEETS:
        rows = []
        for label, renderer, stem, is_back, _bleed in sides:
            if stem not in canvases:
                canvases[stem] = renderer(gc=GRAPHITE_COLOR)
            img = _on_paper(canvases[stem], is_back, paper)
            faces["%d%s" % (num, "B" if is_back else "A")] = img
            rows.append(("B" if is_back else "A", (img, canvases[stem], is_back, FOLD_LINES.get(stem), label)))
        pages.append(_sheet_page(num, rows))
    pages.insert(0, _spread(faces, len(STAGE_SHEETS)))
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    pages[0].save(OUT_PATH, "PDF", resolution=DPI, save_all=True, append_images=pages[1:], quality=88)
    print("  -> Print preview (%d pages): %s" % (len(pages), OUT_PATH))
    return OUT_PATH


if __name__ == "__main__":
    build_preview()
