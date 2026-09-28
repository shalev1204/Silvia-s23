#!/usr/bin/env python3
"""
build_page06_07.py
==================
Production builder for Journal Sheets 6 & 7 (Pages 10 to 13 — The Desert Frontier & The Grand Map).
Silvia's 23rd Birthday Treasure Hunt.

Structure:
- Hoja 6 · Cara A (Page 10, holes on LEFT: X < 165 px):
    * Title: "The Desert" — Lore & Prologue to the Wasteland.
    * I. The Mirror of the Earth (Bedrock memory of the desert).
    * II. The Voice of Shadows (Introduction to The Oracle & the silence).
    * Masterwork Da Vinci Renaissance Desert Study (Solar gnomon, windswept dunes,
      sandstone stele, wind vortices, falcons, and natural arches).
    * III. The Three Laws of the Waste (Meridian shadow, dry wash, and third cairn benchmark).
    * Canonical Seal of The Desert Path with motto "What the wind covers, the sun shall reveal."
- Hoja 6 · Cara B (Page 11, holes on RIGHT: X > 1583 px):
    * The Grand Desert Map (Top-Left A4 panel).
- Hoja 7 · Cara A (Page 12, holes on LEFT: X < 165 px):
    * The Grand Desert Map (Top-Right A4 panel).
- Hoja 7 · Cara B (Page 13, holes on RIGHT: X > 1583 px):
    * The Grand Desert Map (Bottom-Left A4 panel).

Typography & Design Standards:
- Large, comfortably readable cursive handwriting at 300 DPI (A5 format).
- Absolute zero collisions between drawings and text baselines.
- Strict hole punch margin clearance: X < 165 px (Cara A) and X > 1583 px (Cara B).
"""

import os
import sys
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from scripts.journal.geometry import mm_to_px, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX
from scripts.journal.pdf_builder import PDFBuilder


GRAPHITE_COLOR = (46, 42, 38)
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FONT_PATH = os.path.join(PROJECT_ROOT, 'assets', 'fonts', 'MarckScript.ttf')


def blit_rgba(target: np.ndarray, src: np.ndarray, x: int, y: int) -> None:
    """Safely blits an RGBA image onto target canvas with alpha blending."""
    th, tw = target.shape[:2]
    sh, sw = src.shape[:2]
    x1, y1 = max(0, x), max(0, y)
    x2, y2 = min(tw, x + sw), min(th, y + sh)
    if x2 <= x1 or y2 <= y1:
        return
    sx1, sy1 = x1 - x, y1 - y
    sx2, sy2 = sx1 + (x2 - x1), sy1 + (y2 - y1)

    src_alpha = src[sy1:sy2, sx1:sx2, 3].astype(float) / 255.0
    tgt_alpha = target[y1:y2, x1:x2, 3].astype(float) / 255.0

    out_alpha = src_alpha + tgt_alpha * (1.0 - src_alpha)
    nz = out_alpha > 0.0

    for c in range(3):
        target[y1:y2, x1:x2, c][nz] = np.clip(
            (src[sy1:sy2, sx1:sx2, c][nz] * src_alpha[nz] +
             target[y1:y2, x1:x2, c][nz] * tgt_alpha[nz] * (1.0 - src_alpha[nz])) / out_alpha[nz],
            0, 255
        ).astype(np.uint8)

    target[y1:y2, x1:x2, 3] = (out_alpha * 255.0).astype(np.uint8)


def draw_sketchy_line(
    canvas: np.ndarray,
    p1: tuple,
    p2: tuple,
    gc: tuple = GRAPHITE_COLOR,
    alpha_base: int = 180,
    passes: int = 3,
    seed: int = 42
) -> None:
    """Draws an organic, multi-stroke handdrawn pencil line."""
    np.random.seed(seed)
    x1, y1 = p1
    x2, y2 = p2
    dx = x2 - x1
    dy = y2 - y1
    dist = np.hypot(dx, dy)
    steps = max(int(dist / 4), 2)

    for p in range(passes):
        points = []
        for i in range(steps + 1):
            t = i / float(steps)
            nx = x1 + t * dx + np.random.normal(0, 0.45)
            ny = y1 + t * dy + np.random.normal(0, 0.45)
            points.append((int(round(nx)), int(round(ny))))

        alpha = max(10, min(255, int(alpha_base * np.random.uniform(0.75, 1.15))))
        color = (*gc, alpha)
        thickness = 1 if p > 0 else np.random.choice([1, 2], p=[0.7, 0.3])

        for i in range(len(points) - 1):
            cv2.line(canvas, points[i], points[i + 1], color, thickness, cv2.LINE_AA)


def render_pencil_text(
    text: str,
    font_path: str,
    font_size: int,
    gc: tuple = GRAPHITE_COLOR,
    seed: int = 42
) -> tuple:
    """Renders text with authentic graphite pencil grain and pressure variation."""
    if not text.strip():
        return None, 0
    np.random.seed(seed)
    font = ImageFont.truetype(font_path, font_size)

    dummy_img = Image.new('RGBA', (1, 1), (0, 0, 0, 0))
    dummy_draw = ImageDraw.Draw(dummy_img)
    bbox = dummy_draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0] + 16
    h = bbox[3] - bbox[1] + 16
    base_offset = -bbox[1] + 8

    txt_img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(txt_img)
    draw.text((8 - bbox[0], base_offset), text, font=font, fill=(0, 0, 0, 255))

    arr = np.array(txt_img)
    alpha = arr[:, :, 3].astype(float) / 255.0

    noise = np.random.uniform(0.72, 1.05, alpha.shape)
    alpha_pencil = np.clip(alpha * noise * 240.0, 0, 255).astype(np.uint8)

    res = np.zeros((h, w, 4), dtype=np.uint8)
    res[:, :, 0] = gc[0]
    res[:, :, 1] = gc[1]
    res[:, :, 2] = gc[2]
    res[:, :, 3] = alpha_pencil
    return res, base_offset


def create_handdrawn_divider(width: int, gc: tuple = GRAPHITE_COLOR, seed: int = 42) -> np.ndarray:
    """Creates a delicate, organic horizontal divider line with subtle terminal diamond flourishes."""
    np.random.seed(seed)
    h = 32
    div = np.zeros((h, width, 4), dtype=np.uint8)
    cy = h // 2

    draw_sketchy_line(div, (24, cy), (width - 24, cy), gc, alpha_base=185, passes=2, seed=seed)

    cx = width // 2
    pts_diamond = np.array([[cx, cy - 5], [cx + 6, cy], [cx, cy + 5], [cx - 6, cy]], np.int32)
    cv2.fillPoly(div, [pts_diamond], (*gc, 210), cv2.LINE_AA)
    cv2.circle(div, (cx - 16, cy), 2, (*gc, 180), -1, cv2.LINE_AA)
    cv2.circle(div, (cx + 16, cy), 2, (*gc, 180), -1, cv2.LINE_AA)

    for x_end in [12, width - 12]:
        cv2.circle(div, (x_end, cy), 2, (*gc, 160), -1, cv2.LINE_AA)

    return div


def wrap_text_to_width(text: str, font_path: str, font_size: int, max_w: int) -> list:
    """Wraps text so no rendered line exceeds max_w pixels."""
    font = ImageFont.truetype(font_path, font_size)
    dummy_draw = ImageDraw.Draw(Image.new('RGBA', (1, 1)))
    words = text.split(' ')
    lines = []
    current_line = []

    for word in words:
        test_line = ' '.join(current_line + [word])
        bbox = dummy_draw.textbbox((0, 0), test_line, font=font)
        line_w = bbox[2] - bbox[0]
        if line_w <= max_w:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
            current_line = [word]

    if current_line:
        lines.append(' '.join(current_line))
    return lines


def draw_desert_path_seal(
    canvas: np.ndarray,
    cx: int,
    cy: int,
    r: int = 58,
    gc: tuple = GRAPHITE_COLOR,
    seed: int = 960
) -> None:
    """
    Renders the official canonical seal of The Desert Path:
    - 3 concentric astronomical rings with 12 astrolabe hour ticks.
    - Radiant Sun disk with 12 geometric rays in upper hemisphere.
    - Rolling desert dune strata curves in lower hemisphere.
    """
    np.random.seed(seed)
    # 3 concentric rings
    cv2.circle(canvas, (cx, cy), r, (*gc, 215), 2, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), r - 5, (*gc, 140), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), r - 14, (*gc, 185), 1, cv2.LINE_AA)

    # 12 Astrolabe hour tick marks
    for deg in range(0, 360, 30):
        rad = np.deg2rad(deg)
        x_o = int(round(cx + r * np.cos(rad)))
        y_o = int(round(cy + r * np.sin(rad)))
        x_i = int(round(cx + (r - 9) * np.cos(rad)))
        y_i = int(round(cy + (r - 9) * np.sin(rad)))
        cv2.line(canvas, (x_o, y_o), (x_i, y_i), (*gc, 215), 1, cv2.LINE_AA)

    # Sun disk & radiant rays in upper hemisphere
    sun_cy = cy - 15
    cv2.circle(canvas, (cx, sun_cy), 14, (*gc, 240), -1)
    for deg_r in range(0, 360, 30):
        rad_r = np.deg2rad(deg_r)
        rx1 = int(round(cx + 16 * np.cos(rad_r)))
        ry1 = int(round(sun_cy + 16 * np.sin(rad_r)))
        rx2 = int(round(cx + 25 * np.cos(rad_r)))
        ry2 = int(round(sun_cy + 25 * np.sin(rad_r)))
        cv2.line(canvas, (rx1, ry1), (rx2, ry2), (*gc, 220), 2, cv2.LINE_AA)

    # Dune curves in lower hemisphere
    scale_dune = (r - 18) / 176.0
    dune_pts = []
    for t_val in np.linspace(0, 1, 35):
        if t_val < 0.5:
            u = t_val * 2.0
            x = (1 - u)**2 * (-130) + 2 * (1 - u) * u * (-40) + u**2 * (30)
            y = (1 - u)**2 * (30) + 2 * (1 - u) * u * (-15) + u**2 * (20)
        else:
            u = (t_val - 0.5) * 2.0
            x = (1 - u)**2 * (30) + 2 * (1 - u) * u * (90) + u**2 * (130)
            y = (1 - u)**2 * (20) + 2 * (1 - u) * u * (-10) + u**2 * (25)
        dune_pts.append((int(round(cx + x * scale_dune)), int(round(cy + y * scale_dune))))
    for i in range(len(dune_pts) - 1):
        cv2.line(canvas, dune_pts[i], dune_pts[i + 1], (*gc, 235), 2, cv2.LINE_AA)


# -------------------------------------------------------------------------
# RENDER PAGE FACES
# -------------------------------------------------------------------------

def render_face_6a(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """
    Renders Hoja 6 · Cara A (Page 10, holes on LEFT: X < 165 px).
    - Header: 'The Desert' (font_size=64) + 'Of Sun, Silence, and Buried Stone.' (font_size=28).
    - Upper Section: Lore Sections I & II (The Mirror of the Earth & The Voice of Shadows).
    - Central Section: Masterwork Da Vinci Renaissance Desert Study (Solar gnomon sundial,
      windswept dunes with ripple patterns, fluid dynamics wind vortices, ancient sun monolith,
      and desert falcons in flight).
    - Lower Section: III. The Three Laws of the Waste (Meridian Shadow, Dry Wash, Benchmark Plate).
    - Bottom: The Desert Path Canonical Seal (Centered) with motto and threshold legend.
      Strictly NO 'The Cartographer' signature.
    """
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. Header (Left margin X=220 px, safely right of X=165 px hole punch zone)
    t_title, base_title = render_pencil_text("The Desert", FONT_PATH, font_size=64, gc=gc, seed=601)
    if t_title is not None:
        blit_rgba(canvas, t_title, 220, 135 - base_title)

    t_sub, base_sub = render_pencil_text("Of Sun, Silence, and Buried Stone.", FONT_PATH, font_size=28, gc=gc, seed=602)
    if t_sub is not None:
        blit_rgba(canvas, t_sub, 222, 212 - base_sub)

    div = create_handdrawn_divider(width=1340, gc=gc, seed=603)
    blit_rgba(canvas, div, 220, 250 - div.shape[0] // 2)

    # 2. Lore Sections I & II
    sections_top = [
        ("I. The Mirror of the Earth", (
            "The scholars call the desert an empty wasteland, for they only value what can be harvested. "
            "Yet the sand is the purest archive of the Order. The dry wind strips away every illusion, every tree, "
            "every wall of clay, until only the ancient bedrock remains. What is written in the city is forgotten "
            "by morning; what is buried beneath a flat red sandstone slab remains untouched for a thousand years."
        )),
        ("II. The Voice of Shadows", (
            "Deep within the sandstone canyons dwells the second guardian: The Oracle. She wears no face, "
            "speaks no idle words, and leaves no footprints upon the dunes. When the wanderer brings a question, "
            "she points only to the earth and the sun. Do not ask where the road leads; ask where the sun casts its "
            "weight. The shadow is the only compass that never forgets the light."
        ))
    ]

    cur_y = 286
    for sec_title, paragraph_text in sections_top:
        t_sec, _ = render_pencil_text(sec_title, FONT_PATH, font_size=33, gc=gc, seed=610 + cur_y)
        if t_sec is not None:
            blit_rgba(canvas, t_sec, 220, cur_y)
        cur_y += 50

        wrapped_lines = wrap_text_to_width(paragraph_text, FONT_PATH, font_size=28, max_w=1330)
        for w_line in wrapped_lines:
            t_l, _ = render_pencil_text(w_line, FONT_PATH, font_size=28, gc=gc, seed=620 + cur_y)
            if t_l is not None:
                blit_rgba(canvas, t_l, 220, cur_y)
            cur_y += 35
        cur_y += 32

    # 3. Masterwork Desert Study
    asset_path = os.path.join(PROJECT_ROOT, "journal", "page06", "assets", "desert_lore_master_alpha.png")
    if os.path.exists(asset_path):
        strokes = cv2.imread(asset_path, cv2.IMREAD_UNCHANGED)
        if strokes is not None:
            target_w = 1350
            target_h = int(round(strokes.shape[0] * (target_w / strokes.shape[1])))
            resized_strokes = cv2.resize(strokes, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
            art_x = 215
            art_y = cur_y + 8
            blit_rgba(canvas, resized_strokes, art_x, art_y)
            cur_y = art_y + target_h + 36

    # 4. Section III: The Three Laws of the Waste (With comfortable multi-line format)
    t_sec3, _ = render_pencil_text("III. The Three Laws of the Waste", FONT_PATH, font_size=34, gc=gc, seed=650)
    if t_sec3 is not None:
        blit_rgba(canvas, t_sec3, 220, cur_y)
    cur_y += 52

    laws = [
        ("1. The Meridian Shadow", (
            "At true solar noon, the gnomon casts its shortest shadow along the meridian line. "
            "Only then is true north revealed, pointing toward the ancient observatory."
        )),
        ("2. The Dry Wash", (
            "Where winter flash floods once carved the sandstone, the gravel bed packs firm. "
            "It is the only safe passage through the labyrinth of sheer mesas and red canyons."
        )),
        ("3. The Benchmark Plate", (
            "Three cairns of dry stone mark the southern turn into the wash. Beneath the foundation slab "
            "of the third lies the copper plate, aligned to the azimuth of one hundred and twelve degrees."
        ))
    ]

    for law_title, law_desc in laws:
        t_lt, _ = render_pencil_text(law_title, FONT_PATH, font_size=29, gc=gc, seed=660 + cur_y)
        if t_lt is not None:
            blit_rgba(canvas, t_lt, 235, cur_y)
        cur_y += 36

        desc_lines = wrap_text_to_width(law_desc, FONT_PATH, font_size=27, max_w=1300)
        for d_line in desc_lines:
            t_dl, _ = render_pencil_text(d_line, FONT_PATH, font_size=27, gc=gc, seed=670 + cur_y)
            if t_dl is not None:
                blit_rgba(canvas, t_dl, 255, cur_y)
            cur_y += 34
        cur_y += 18

    # 5. Lower Decorative Divider
    div2 = create_handdrawn_divider(width=1100, gc=gc, seed=680)
    div2_x = (CANVAS_WIDTH_PX - div2.shape[1]) // 2
    blit_rgba(canvas, div2, div2_x, cur_y + 15)
    cur_y += 40

    # 6. The Desert Path Seal (Centered & Majestic)
    seal_cy = cur_y + 70
    seal_cx = CANVAS_WIDTH_PX // 2
    draw_desert_path_seal(canvas, cx=seal_cx, cy=seal_cy, r=58, gc=gc, seed=960)

    # Motto below seal
    t_motto, _ = render_pencil_text("What the wind covers, the sun shall reveal.", FONT_PATH, font_size=32, gc=gc, seed=685)
    if t_motto is not None:
        motto_x = (CANVAS_WIDTH_PX - t_motto.shape[1]) // 2
        blit_rgba(canvas, t_motto, motto_x, seal_cy + 82)

    return canvas


def dilate_clear_and_blit(
    canvas: np.ndarray,
    text: str,
    x: int,
    y: int,
    font_size: int = 25,
    pad: int = 6,
    feather: int = 6,
    gc: tuple = GRAPHITE_COLOR,
    seed: int = 42
) -> None:
    """Renders text and softly attenuates underlying drawing strokes using contour dilation for zero collisions."""
    t_img, b_off = render_pencil_text(text, FONT_PATH, font_size=font_size, gc=gc, seed=seed)
    if t_img is None:
        return
    th, tw = t_img.shape[:2]
    top_y = y - b_off

    x1 = max(0, x - pad - feather)
    y1 = max(0, top_y - pad - feather)
    x2 = min(canvas.shape[1], x + tw + pad + feather)
    y2 = min(canvas.shape[0], top_y + th + pad + feather)

    t_alpha = t_img[:, :, 3].astype(np.float32) / 255.0
    ksize = pad * 2 + 1
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (ksize, ksize))
    dil = cv2.dilate(t_alpha, kernel)
    if feather > 0:
        f_k = feather * 2 + 1
        dil = cv2.GaussianBlur(dil, (f_k, f_k), feather / 2.0)

    sub_mask = np.zeros((y2 - y1, x2 - x1), dtype=np.float32)
    ox = x - x1
    oy = top_y - y1
    sub_mask[oy:oy+th, ox:ox+tw] = dil

    c_alpha = canvas[y1:y2, x1:x2, 3].astype(np.float32)
    canvas[y1:y2, x1:x2, 3] = (c_alpha * (1.0 - sub_mask * 0.94)).astype(np.uint8)
    blit_rgba(canvas, t_img, x, top_y)


def dilate_clear_and_blit_multiline(
    canvas: np.ndarray,
    lines: list,
    start_x: int,
    start_y: int,
    line_h: int = 38,
    font_size: int = 28,
    pad: int = 6,
    feather: int = 6,
    gc: tuple = GRAPHITE_COLOR,
    seed_base: int = 800
) -> None:
    """Renders a multiline text block, clearing underlying graphite across all lines simultaneously."""
    rendered_items = []
    total_mask = np.zeros((canvas.shape[0], canvas.shape[1]), dtype=np.float32)
    cur_y = start_y
    for i, line in enumerate(lines):
        t_img, b_off = render_pencil_text(line, FONT_PATH, font_size=font_size, gc=gc, seed=seed_base + i)
        if t_img is None:
            continue
        th, tw = t_img.shape[:2]
        top_y = cur_y - b_off
        rendered_items.append((t_img, start_x, top_y))

        t_alpha = t_img[:, :, 3].astype(np.float32) / 255.0
        ksize = pad * 2 + 1
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (ksize, ksize))
        dil = cv2.dilate(t_alpha, kernel)
        if feather > 0:
            f_k = feather * 2 + 1
            dil = cv2.GaussianBlur(dil, (f_k, f_k), feather / 2.0)

        y1, y2 = top_y, top_y + th
        x1, x2 = start_x, start_x + tw
        total_mask[y1:y2, x1:x2] = np.maximum(total_mask[y1:y2, x1:x2], dil)
        cur_y += line_h

    nz_y, nz_x = np.nonzero(total_mask > 0.01)
    if len(nz_y) > 0:
        min_y, max_y = nz_y.min(), nz_y.max() + 1
        min_x, max_x = nz_x.min(), nz_x.max() + 1
        sub_m = total_mask[min_y:max_y, min_x:max_x]
        c_alpha = canvas[min_y:max_y, min_x:max_x, 3].astype(np.float32)
        canvas[min_y:max_y, min_x:max_x, 3] = (c_alpha * (1.0 - sub_m * 0.94)).astype(np.uint8)

    for t_img, tx, ty in rendered_items:
        blit_rgba(canvas, t_img, tx, ty)


def draw_scale_bar(
    canvas: np.ndarray,
    sc_x: int = 2900,
    sc_y: int = 2370,
    sc_w: int = 420,
    gc: tuple = GRAPHITE_COLOR
) -> None:
    """Draws an authentic Castilian Varas cartographic scale bar with soft clearance."""
    t_sc_title, b_title = render_pencil_text("Scala Varas Castilianas (1 League)", FONT_PATH, font_size=21, gc=gc, seed=870)
    title_y = sc_y - 28 - b_title
    title_x = sc_x + (sc_w - t_sc_title.shape[1]) // 2

    ticks = [(0, "0"), (140, "1,000"), (280, "2,000"), (420, "3,000 Varas")]
    tick_imgs = []
    for off_x, t_name in ticks:
        t_tk, b_tk = render_pencil_text(t_name, FONT_PATH, font_size=20, gc=gc, seed=880 + off_x)
        tick_imgs.append((t_tk, sc_x + off_x - t_tk.shape[1] // 2, sc_y + 10))

    total_mask = np.zeros((canvas.shape[0], canvas.shape[1]), dtype=np.float32)
    cv2.line(total_mask, (sc_x - 10, sc_y), (sc_x + sc_w + 10, sc_y), 1.0, 16)
    th, tw = t_sc_title.shape[:2]
    total_mask[title_y:title_y+th, title_x:title_x+tw] = np.maximum(total_mask[title_y:title_y+th, title_x:title_x+tw], t_sc_title[:, :, 3].astype(np.float32) / 255.0)
    for t_tk, tx, ty in tick_imgs:
        th, tw = t_tk.shape[:2]
        total_mask[ty:ty+th, tx:tx+tw] = np.maximum(total_mask[ty:ty+th, tx:tx+tw], t_tk[:, :, 3].astype(np.float32) / 255.0)

    ksize = 15
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (ksize, ksize))
    dil = cv2.dilate(total_mask, kernel)
    dil = cv2.GaussianBlur(dil, (17, 17), 4.0)

    nz_y, nz_x = np.nonzero(dil > 0.01)
    if len(nz_y) > 0:
        min_y, max_y = nz_y.min(), nz_y.max() + 1
        min_x, max_x = nz_x.min(), nz_x.max() + 1
        sub_m = dil[min_y:max_y, min_x:max_x]
        c_alpha = canvas[min_y:max_y, min_x:max_x, 3].astype(np.float32)
        canvas[min_y:max_y, min_x:max_x, 3] = (c_alpha * (1.0 - sub_m * 0.92)).astype(np.uint8)

    cv2.line(canvas, (sc_x, sc_y), (sc_x + sc_w, sc_y), (*gc, 200), 2, cv2.LINE_AA)
    for off_x, _ in ticks:
        cv2.line(canvas, (sc_x + off_x, sc_y - 6), (sc_x + off_x, sc_y + 6), (*gc, 220), 2, cv2.LINE_AA)

    blit_rgba(canvas, t_sc_title, title_x, title_y)
    for t_tk, tx, ty in tick_imgs:
        blit_rgba(canvas, t_tk, tx, ty)


def render_spread1(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Renders the continuous 100% full-bleed double-page masterwork Spread 1 (3496 x 2480 px).

    Left half (0..1748 px): Hoja 6 · Cara B (The Desert Frontier).
    Right half (1748..3496 px): Hoja 7 · Cara A (The Sandstone Labyrinth).
    Fills 100% of the surface continuously edge-to-edge, across the binder holes.
    Zero collisions between handwriting and drawing strokes.
    """
    spread_w = CANVAS_WIDTH_PX * 2  # 3496 px
    spread_h = CANVAS_HEIGHT_PX      # 2480 px

    # 1. Base Map Artwork (Full-Bleed 100% Edge-to-Edge)
    asset_path = os.path.join(PROJECT_ROOT, "journal", "page06", "assets", "grand_desert_map_fullbleed_spread1_alpha.png")
    if not os.path.exists(asset_path):
        raise FileNotFoundError(f"Grand map asset not found at {asset_path}")

    strokes = cv2.imread(asset_path, cv2.IMREAD_UNCHANGED)
    sh, sw = strokes.shape[:2]

    scale = spread_h / float(sh)
    target_w = int(round(sw * scale))
    resized_map = cv2.resize(strokes, (target_w, spread_h), interpolation=cv2.INTER_LANCZOS4)

    x_offset = (target_w - spread_w) // 2
    spread_canvas = resized_map[:, x_offset:x_offset + spread_w].copy()

    # 2. Immersive Titles in Open Sky
    # Left Page: The Desert Frontier
    t_title_l, b_tl = render_pencil_text("The Desert Frontier", FONT_PATH, font_size=48, gc=gc, seed=801)
    blit_rgba(spread_canvas, t_title_l, 180, 85 - b_tl)

    t_sub_l, b_sl = render_pencil_text("Northern Approaches & The Red Ridge  ·  Latitude 30* 00\x27 N", FONT_PATH, font_size=24, gc=gc, seed=802)
    blit_rgba(spread_canvas, t_sub_l, 182, 145 - b_sl)


    # 3. Horizon & Topographic Callouts
    t_sp, b_sp = render_pencil_text("The Sinking Peaks (Distant Horizon)", FONT_PATH, font_size=25, gc=gc, seed=811)
    blit_rgba(spread_canvas, t_sp, 2680, 95 - b_sp)

    t_gm, b_gm = render_pencil_text("The Great Mesa  (Mesa del Sol)", FONT_PATH, font_size=26, gc=gc, seed=812)
    blit_rgba(spread_canvas, t_gm, 980, 440 - b_gm)

    dilate_clear_and_blit(spread_canvas, "The Red Ridge  —  Precipitous Sandstone", 190, 680, font_size=25, pad=6, feather=6, seed=813)
    dilate_clear_and_blit(spread_canvas, "Outer Watchtower VI  (Elev. 1,240 varas)", 440, 1370, font_size=25, pad=6, feather=6, seed=814)
    dilate_clear_and_blit(spread_canvas, "Dry Canyon Wash (Wadi al-Hajar)", 720, 1750, font_size=25, pad=6, feather=6, seed=815)
    dilate_clear_and_blit(spread_canvas, "The Sun Monolith", 2010, 640, font_size=26, pad=6, feather=6, seed=816)
    dilate_clear_and_blit(spread_canvas, "Arches of the West Wind", 2440, 750, font_size=25, pad=6, feather=6, seed=817)
    dilate_clear_and_blit(spread_canvas, "The Sandstone Labyrinth", 2760, 1320, font_size=26, pad=6, feather=6, seed=818)

    # Cairns
    dilate_clear_and_blit(spread_canvas, "Cairn I", 980, 2190, font_size=24, pad=6, feather=6, seed=819)
    dilate_clear_and_blit(spread_canvas, "Cairn II", 2070, 2150, font_size=25, pad=6, feather=6, seed=820)
    dilate_clear_and_blit(spread_canvas, "Cairn III  (Copper Benchmark Plate)", 2750, 2150, font_size=26, pad=6, feather=6, seed=821)

    # 4. Navigational Sighting Ray (from Cairn III apex towards Sun Monolith apex)
    c3_pt = (2600, 1990)
    sun_pt = (2270, 490)
    dx = sun_pt[0] - c3_pt[0]
    dy = sun_pt[1] - c3_pt[1]
    dist = np.hypot(dx, dy)
    num_dashes = int(dist // 22)
    for d_i in range(num_dashes):
        if d_i % 2 == 0:
            t1 = d_i / float(num_dashes)
            t2 = (d_i + 0.8) / float(num_dashes)
            p_a = (int(round(c3_pt[0] + t1 * dx)), int(round(c3_pt[1] + t1 * dy)))
            p_b = (int(round(c3_pt[0] + t2 * dx)), int(round(c3_pt[1] + t2 * dy)))
            cv2.line(spread_canvas, p_a, p_b, (*gc, 130), 1, cv2.LINE_AA)

    dilate_clear_and_blit(spread_canvas, "Bearing 348* True North-Northwest", 2430, 1500, font_size=23, pad=6, feather=6, seed=830)

    # 5. Expedition Field Notes
    notes_l = [
        "Here the bedrock plunges into sand. The winter flash floods have",
        "carved the only passable road. Follow the wash until the third cairn."
    ]
    dilate_clear_and_blit_multiline(spread_canvas, notes_l, 180, 2350, line_h=38, font_size=28, pad=6, feather=6, seed_base=840)

    notes_r = [
        "Beyond the Great Mesa lies the territory of The Oracle. The wind",
        "erases all paths; align the sun monolith with the noon shadow."
    ]
    dilate_clear_and_blit_multiline(spread_canvas, notes_r, 1950, 2350, line_h=38, font_size=28, pad=6, feather=6, seed_base=850)

    # 6. Scale Bar (Castilian Varas)
    draw_scale_bar(spread_canvas, sc_x=2900, sc_y=2370, sc_w=420, gc=gc)

    return spread_canvas


def render_face_6b(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Hoja 6 · Cara B (The Grand Desert Map — Left Panel of Spread 1).

    100% full-bleed continuous map.
    """
    spread = render_spread1(gc=gc)
    canvas = spread[:, 0:CANVAS_WIDTH_PX].copy()
    return canvas


def render_face_7a(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Hoja 7 · Cara A (The Grand Desert Map — Right Panel of Spread 1).

    100% full-bleed continuous map.
    """
    spread = render_spread1(gc=gc)
    canvas = spread[:, CANVAS_WIDTH_PX:CANVAS_WIDTH_PX * 2].copy()
    return canvas


def render_spread2(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Renders the continuous 100% full-bleed double-page masterwork Spread 2 (3496 x 2480 px).

    Left half (0..1748 px): Hoja 7 · Cara B (The Whispering Chasm & Lower Wash).
    Right half (1748..3496 px): Hoja 8 · Cara A (The Sunken Sanctuary & Southern Spires).
    Fills 100% of the surface continuously edge-to-edge, across the binder holes.
    Zero collisions between handwriting and drawing strokes.
    """
    spread_w = CANVAS_WIDTH_PX * 2  # 3496 px
    spread_h = CANVAS_HEIGHT_PX      # 2480 px

    # 1. Base Map Artwork (Full-Bleed 100% Edge-to-Edge)
    asset_path = os.path.join(PROJECT_ROOT, "journal", "page07", "assets", "grand_desert_map_fullbleed_spread2_alpha.png")
    if not os.path.exists(asset_path):
        raise FileNotFoundError(f"Grand map spread 2 asset not found at {asset_path}")

    strokes = cv2.imread(asset_path, cv2.IMREAD_UNCHANGED)
    sh, sw = strokes.shape[:2]

    scale = spread_h / float(sh)
    target_w = int(round(sw * scale))
    resized_map = cv2.resize(strokes, (target_w, spread_h), interpolation=cv2.INTER_LANCZOS4)

    x_offset = (target_w - spread_w) // 2
    spread_canvas = resized_map[:, x_offset:x_offset + spread_w].copy()

    # 2. Callouts on Left Page (Hoja 7 · Cara B — 0..1748 px)
    # Binder rings are on the RIGHT edge (X > 1583 px). All text strictly X < 1550 px.
    dilate_clear_and_blit(spread_canvas, "The Lower Wash  (Wadi al-Hajar South)", 550, 480, font_size=25, pad=6, feather=6, seed=861)
    dilate_clear_and_blit(spread_canvas, "The Terraces of the Jackal", 220, 850, font_size=25, pad=6, feather=6, seed=862)
    dilate_clear_and_blit(spread_canvas, "The Sentinel Mesa  (Elev. 980 varas)", 1000, 860, font_size=25, pad=6, feather=6, seed=863)
    dilate_clear_and_blit(spread_canvas, "The Whispering Chasm", 480, 1280, font_size=25, pad=6, feather=6, seed=864)
    dilate_clear_and_blit(spread_canvas, "Cairn IV  (Sentry of the Canyon)", 220, 1750, font_size=25, pad=6, feather=6, seed=865)

    notes_7b = [
        "The canyon fractures into deep alluvial gravel. Follow the descending wash past",
        "the fourth cairn. Where the dry bed turns eastward, the open sands begin."
    ]
    dilate_clear_and_blit_multiline(spread_canvas, notes_7b, 180, 2340, line_h=38, font_size=28, pad=6, feather=6, seed_base=870)

    # 3. Callouts on Right Page (Hoja 8 · Cara A — 1748..3496 px)
    # Binder rings are on the LEFT edge (X in [1748..1913] px). All text strictly X > 1940 px.
    dilate_clear_and_blit(spread_canvas, "Cairn V  (The Final Marker)", 2340, 280, font_size=25, pad=6, feather=6, seed=881)
    dilate_clear_and_blit(spread_canvas, "The Sunken Sanctuary of the Oracle", 2480, 880, font_size=27, pad=6, feather=6, seed=882)
    dilate_clear_and_blit(spread_canvas, "The Solar Altar", 2700, 1260, font_size=24, pad=6, feather=6, seed=883)
    dilate_clear_and_blit(spread_canvas, "Arch of the Solstice", 2050, 1520, font_size=25, pad=6, feather=6, seed=884)
    dilate_clear_and_blit(spread_canvas, "The Salt Playa  (Dry Basin)", 2020, 2120, font_size=25, pad=6, feather=6, seed=885)

    # Dashed sighting ray from Cairn V (2500, 360) to Sanctuary Altar (2750, 1180)
    c5_pt = (2500, 360)
    altar_pt = (2750, 1180)
    dx = altar_pt[0] - c5_pt[0]
    dy = altar_pt[1] - c5_pt[1]
    dist = np.hypot(dx, dy)
    num_dashes = int(dist // 22)
    for d_i in range(num_dashes):
        if d_i % 2 == 0:
            t1 = d_i / float(num_dashes)
            t2 = (d_i + 0.8) / float(num_dashes)
            p_a = (int(round(c5_pt[0] + t1 * dx)), int(round(c5_pt[1] + t1 * dy)))
            p_b = (int(round(c5_pt[0] + t2 * dx)), int(round(c5_pt[1] + t2 * dy)))
            cv2.line(spread_canvas, p_a, p_b, (*gc, 130), 1, cv2.LINE_AA)

    dilate_clear_and_blit(spread_canvas, "Bearing 163* True South-Southeast", 2680, 750, font_size=23, pad=6, feather=6, seed=887)

    notes_8a = [
        "In the vast basin of shifting dunes lies the sunken temple. At high noon,",
        "the stone portal aligns with the solstice sun, casting light upon the altar."
    ]
    dilate_clear_and_blit_multiline(spread_canvas, notes_8a, 1960, 2340, line_h=38, font_size=28, pad=6, feather=6, seed_base=890)

    # 4. Scale Bar (Castilian Varas)
    draw_scale_bar(spread_canvas, sc_x=2900, sc_y=2370, sc_w=420, gc=gc)

    return spread_canvas


def render_face_7b(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Hoja 7 · Cara B (The Grand Desert Map — Left Panel of Spread 2 / Bottom-Left).

    100% full-bleed continuous map.
    """
    spread = render_spread2(gc=gc)
    canvas = spread[:, 0:CANVAS_WIDTH_PX].copy()
    return canvas


def render_face_8a(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """Hoja 8 · Cara A (The Grand Desert Map — Right Panel of Spread 2 / Bottom-Right).

    100% full-bleed continuous map.
    """
    spread = render_spread2(gc=gc)
    canvas = spread[:, CANVAS_WIDTH_PX:CANVAS_WIDTH_PX * 2].copy()
    return canvas


# -------------------------------------------------------------------------
# BUILD PIPELINE
# -------------------------------------------------------------------------

def build_pages06_07(
    real_paper_photo_path: str,
    output_base_dir: str
) -> None:
    """Generates all production assets for Hoja 6, 7, and 8A (Spreads 1 & 2)."""
    p6_dir = os.path.join(output_base_dir, "page06")
    p7_dir = os.path.join(output_base_dir, "page07")
    p8_dir = os.path.join(output_base_dir, "page08")
    os.makedirs(p6_dir, exist_ok=True)
    os.makedirs(p7_dir, exist_ok=True)
    os.makedirs(p8_dir, exist_ok=True)

    print("=== Building Journal Desert Map (Spreads 1 & 2 — The 4 Quadrants) ===")

    bg_raw = None
    if os.path.exists(real_paper_photo_path):
        bg_raw = cv2.imread(real_paper_photo_path)
        if bg_raw is not None:
            bg_raw = cv2.resize(bg_raw, (CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX))

    faces = [
        ("Hoja 6 · Cara A (Page 10 — The Desert: Lore & Seal)", render_face_6a, p6_dir, "page06_front", False, True),
        ("Hoja 6 · Cara B (Page 11 — The Desert Frontier: Map West / Top-Left)", render_face_6b, p6_dir, "page06_back", True, False),
        ("Hoja 7 · Cara A (Page 12 — The Sandstone Labyrinth: Map East / Top-Right)", render_face_7a, p7_dir, "page07_front", False, False),
        ("Hoja 7 · Cara B (Page 13 — The Lower Wash: Map West / Bottom-Left)", render_face_7b, p7_dir, "page07_back", True, False),
        ("Hoja 8 · Cara A (Page 14 — The Sunken Sanctuary: Map East / Bottom-Right)", render_face_8a, p8_dir, "page08_front", False, False),
    ]

    rendered_canvases = {}

    for label, renderer, out_dir, prefix, is_face_b, enforce_hole_clearance in faces:
        print(f"\nRendering {label}...")
        canvas = renderer(gc=GRAPHITE_COLOR)
        rendered_canvases[prefix] = canvas

        # Hole punch margin enforcement (only for non-full-bleed pages like 6A)
        if enforce_hole_clearance:
            if is_face_b:
                right_zone = canvas[:, 1583:, 3]
                violation = np.count_nonzero(right_zone)
                if violation > 0:
                    print(f"  [ERROR] {violation} pixels found in RIGHT hole punch zone (X > 1583)!")
                    canvas[:, 1583:, 3] = 0
            else:
                left_zone = canvas[:, :165, 3]
                violation = np.count_nonzero(left_zone)
                if violation > 0:
                    print(f"  [ERROR] {violation} pixels found in LEFT hole punch zone (X < 165)!")
                    canvas[:, :165, 3] = 0

        pdf_dir = os.path.join(out_dir, "pdf")
        canvas_dir = os.path.join(out_dir, "canvases")
        mockup_dir = os.path.join(out_dir, "mockups")
        os.makedirs(pdf_dir, exist_ok=True)
        os.makedirs(canvas_dir, exist_ok=True)
        os.makedirs(mockup_dir, exist_ok=True)

        # Save transparent PNG
        png_path = os.path.join(canvas_dir, f"{prefix}_canvas_A5_300dpi.png")
        cv2.imwrite(png_path, canvas)
        print(f"  -> Transparent Canvas: {png_path}")

        # Save Vector PDF
        pdf_path = os.path.join(pdf_dir, f"{prefix}_A5.pdf")
        PDFBuilder.save_a5_pdf_from_rgba(canvas, pdf_path, dpi=300)
        print(f"  -> Vector PDF: {pdf_path}")

        # Save Photorealistic Mockup
        if bg_raw is not None:
            bg_face = cv2.flip(bg_raw, 1) if is_face_b else bg_raw
            fg_rgb = canvas[:, :, :3].astype(np.float32)
            alpha = (canvas[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]
            mockup = (fg_rgb * alpha + bg_face.astype(np.float32) * (1.0 - alpha)).astype(np.uint8)

            mockup_path = os.path.join(mockup_dir, f"{prefix}_real_paper_mockup.jpg")
            cv2.imwrite(mockup_path, mockup, [cv2.IMWRITE_JPEG_QUALITY, 95])
            print(f"  -> Photorealistic Mockup: {mockup_path}")

    # Generate Continuous Double-Page Spread 1 Mockup (Top Half)
    spread1_mockup = None
    if bg_raw is not None and "page06_back" in rendered_canvases and "page07_front" in rendered_canvases:
        print("\nGenerating Continuous Double-Page Spread 1 Mockup (Top Half)...")
        c6b = rendered_canvases["page06_back"]
        c7a = rendered_canvases["page07_front"]

        bg_b = cv2.flip(bg_raw, 1)
        bg_a = bg_raw

        fg_l = c6b[:, :, :3].astype(np.float32)
        al_l = (c6b[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]
        mockup_l = (fg_l * al_l + bg_b.astype(np.float32) * (1.0 - al_l)).astype(np.uint8)

        fg_r = c7a[:, :, :3].astype(np.float32)
        al_r = (c7a[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]
        mockup_r = (fg_r * al_r + bg_a.astype(np.float32) * (1.0 - al_r)).astype(np.uint8)

        spread1_mockup = np.hstack([mockup_l, mockup_r])

        spread_path_p6 = os.path.join(p6_dir, "mockups", "spread01_desert_map_continuous_mockup.jpg")
        spread_path_p7 = os.path.join(p7_dir, "mockups", "spread01_desert_map_continuous_mockup.jpg")
        cv2.imwrite(spread_path_p6, spread1_mockup, [cv2.IMWRITE_JPEG_QUALITY, 95])
        cv2.imwrite(spread_path_p7, spread1_mockup, [cv2.IMWRITE_JPEG_QUALITY, 95])
        print(f"  -> Continuous Spread 1 Mockup: {spread_path_p6}")

    # Generate Continuous Double-Page Spread 2 Mockup (Bottom Half)
    spread2_mockup = None
    if bg_raw is not None and "page07_back" in rendered_canvases and "page08_front" in rendered_canvases:
        print("\nGenerating Continuous Double-Page Spread 2 Mockup (Bottom Half)...")
        c7b = rendered_canvases["page07_back"]
        c8a = rendered_canvases["page08_front"]

        bg_b = cv2.flip(bg_raw, 1)
        bg_a = bg_raw

        fg_l = c7b[:, :, :3].astype(np.float32)
        al_l = (c7b[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]
        mockup_l = (fg_l * al_l + bg_b.astype(np.float32) * (1.0 - al_l)).astype(np.uint8)

        fg_r = c8a[:, :, :3].astype(np.float32)
        al_r = (c8a[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]
        mockup_r = (fg_r * al_r + bg_a.astype(np.float32) * (1.0 - al_r)).astype(np.uint8)

        spread2_mockup = np.hstack([mockup_l, mockup_r])

        spread_path_p7b = os.path.join(p7_dir, "mockups", "spread02_desert_map_continuous_mockup.jpg")
        spread_path_p8a = os.path.join(p8_dir, "mockups", "spread02_desert_map_continuous_mockup.jpg")
        cv2.imwrite(spread_path_p7b, spread2_mockup, [cv2.IMWRITE_JPEG_QUALITY, 95])
        cv2.imwrite(spread_path_p8a, spread2_mockup, [cv2.IMWRITE_JPEG_QUALITY, 95])
        print(f"  -> Continuous Spread 2 Mockup: {spread_path_p7b}")

    # Generate 4-Quadrant Complete Desert Map Overview (Spread 1 on top, Spread 2 on bottom)
    if bg_raw is not None and "page06_back" in rendered_canvases and "page07_front" in rendered_canvases and "page07_back" in rendered_canvases and "page08_front" in rendered_canvases:
        print("\nGenerating 4-Quadrant Complete Desert Map Overview...")
        c6b = rendered_canvases["page06_back"]
        c7a = rendered_canvases["page07_front"]
        c7b = rendered_canvases["page07_back"]
        c8a = rendered_canvases["page08_front"]

        spread1_rgba = np.hstack([c6b, c7a])
        spread2_rgba = np.hstack([c7b, c8a])
        full_rgba = np.vstack([spread1_rgba, spread2_rgba])

        # Build seamless paper background: flipping top spread vertically creates
        # an exact mathematical match across row 2480 with zero brightness/vignette jump
        # and ZERO blurring.
        bg_spread_top = np.hstack([cv2.flip(bg_raw, 1), bg_raw])
        bg_spread_bot = cv2.flip(bg_spread_top, 0)
        bg_4quad = np.vstack([bg_spread_top, bg_spread_bot])

        fg = full_rgba[:, :, :3].astype(float)
        al = (full_rgba[:, :, 3].astype(float) / 255.0)[:, :, np.newaxis]
        panorama_4quad = (fg * al + bg_4quad.astype(float) * (1.0 - al)).astype(np.uint8)

        overview_path = os.path.join(p7_dir, "mockups", "grand_desert_map_4quadrants_overview.jpg")
        cv2.imwrite(overview_path, panorama_4quad, [cv2.IMWRITE_JPEG_QUALITY, 94])
        print(f"  -> Complete 4-Quadrant Desert Map: {overview_path}")

    print("\n=== Successfully Built Desert Map Masterwork (Spreads 1 & 2)! ===")


if __name__ == '__main__':
    paper_photo = os.path.join(PROJECT_ROOT, "journal", "page01", "real_paper_300dpi.png")
    journal_dir = os.path.join(PROJECT_ROOT, "journal")
    build_pages06_07(paper_photo, journal_dir)

