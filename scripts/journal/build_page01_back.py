"""
Production script for Page 1 Cara B (The Cartographer's Letter).
Renders 21 lines of authentic Renaissance Cartographer calligraphy directly onto the
physical ruled lines of A5 paper, with prominent title, celestial vignettes,
and the official Constellation Path seal on signature.
"""

import os
import sys
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from scripts.journal.geometry import (
    GEOMETRY_CARA_B,
    CANVAS_WIDTH_PX,
    CANVAS_HEIGHT_PX,
    mm_to_px,
)
from scripts.journal.pdf_builder import PDFBuilder


LETTER_LINES_21 = [
    "For centuries, our order believed every path had already been mapped.",
    "We were wrong. The old kingdom left trails that appear on no atlas,",
    "hidden markers waiting for someone to connect them across the land.",
    "",
    "My search began in the desert ruins, tracking symbols carved in stone.",
    "Every clue points toward a forgotten network of sanctuaries.",
    "The first three markers are verified.",
    "",
    "The Astrolabe we recovered is only one piece of a much larger puzzle.",
    "It does not point to ordinary stars. When aligned with the old towers,",
    "its dials reveal landmarks that should not exist on our charts.",
    "",
    "I have gathered all my observations, routes, and sketches in this book.",
    "Step by step, the pieces are beginning to form a single continuous route.",
    "There is still much ground to cover before the full map is revealed.",
    "",
    "Tonight I head north to follow the trail into the mountain pass.",
    "If you hold these notes, follow the clues in order and trust your instincts.",
    "",
    "The path is real. We just have to walk it.",
    "The Cartographer"
]


def create_constellation_seal(diameter: int = 74, gc: tuple = (28, 25, 23)) -> np.ndarray:
    """
    Renders the official Constellation Path emblem (Astrolabe rings, Stellar Triangle, 4 stars)
    in realistic hand-drawn graphite/ink signet style.
    """
    size = diameter + 24
    img = np.zeros((size, size, 4), dtype=np.uint8)
    cx, cy = size // 2, size // 2
    R = diameter // 2

    # Outer solid astrolabe ring with soft edge
    cv2.circle(img, (cx, cy), R, (*gc, 215), 1, cv2.LINE_AA)
    cv2.circle(img, (cx, cy), R - 3, (*gc, 125), 1, cv2.LINE_AA)

    # Middle dashed ring
    r_dash = int(R * 0.88)
    for deg in range(0, 360, 15):
        rad1 = np.deg2rad(deg)
        rad2 = np.deg2rad(deg + 8)
        x1 = int(round(cx + r_dash * np.cos(rad1)))
        y1 = int(round(cy + r_dash * np.sin(rad1)))
        x2 = int(round(cx + r_dash * np.cos(rad2)))
        y2 = int(round(cy + r_dash * np.sin(rad2)))
        cv2.line(img, (x1, y1), (x2, y2), (*gc, 180), 1, cv2.LINE_AA)

    # Inner ring
    r_in = int(R * 0.76)
    cv2.circle(img, (cx, cy), r_in, (*gc, 160), 1, cv2.LINE_AA)

    # Stellar Triangle
    r_tri = r_in * 0.82
    p_top = (cx, int(round(cy - r_tri)))
    p_bl = (int(round(cx + r_tri * np.cos(np.deg2rad(130)))), int(round(cy + r_tri * np.sin(np.deg2rad(130)))))
    p_br = (int(round(cx + r_tri * np.cos(np.deg2rad(50)))), int(round(cy + r_tri * np.sin(np.deg2rad(50)))))

    cv2.line(img, p_top, p_bl, (*gc, 215), 1, cv2.LINE_AA)
    cv2.line(img, p_top, p_br, (*gc, 215), 1, cv2.LINE_AA)
    cv2.line(img, p_bl, p_br, (*gc, 215), 1, cv2.LINE_AA)

    # 3 Major Constellation Stars with radiating cross-ticks
    stars = [p_top, p_bl, p_br]
    for px, py in stars:
        for dx, dy in [(0, 4), (0, -4), (4, 0), (-4, 0)]:
            cv2.line(img, (px, py), (px + dx, py + dy), (*gc, 160), 1, cv2.LINE_AA)
        cv2.circle(img, (px, py), 2, (*gc, 240), -1)

    # Center guide star
    p_cen = (cx, int(round(cy + r_tri * 0.18)))
    cv2.circle(img, p_cen, 1, (*gc, 220), -1)
    for dx, dy in [(0, 3), (0, -3), (3, 0), (-3, 0)]:
        cv2.line(img, (p_cen[0], p_cen[1]), (p_cen[0] + dx, p_cen[1] + dy), (*gc, 140), 1, cv2.LINE_AA)

    return img


def create_header_astrolabe(diameter: int = 130, gc: tuple = (28, 25, 23)) -> np.ndarray:
    """Renders a delicate celestial armillary sphere / astrolabe vignette for the header."""
    size = diameter + 20
    img = np.zeros((size, size, 4), dtype=np.uint8)
    cx, cy = size // 2, size // 2
    R = diameter // 2

    cv2.circle(img, (cx, cy), R, (*gc, 190), 1, cv2.LINE_AA)
    cv2.circle(img, (cx, cy), R - 4, (*gc, 130), 1, cv2.LINE_AA)

    for deg in range(0, 360, 10):
        rad = np.deg2rad(deg)
        r_inner = R - (6 if deg % 30 == 0 else 3)
        x1 = int(round(cx + R * np.cos(rad)))
        y1 = int(round(cy + R * np.sin(rad)))
        x2 = int(round(cx + r_inner * np.cos(rad)))
        y2 = int(round(cy + r_inner * np.sin(rad)))
        cv2.line(img, (x1, y1), (x2, y2), (*gc, 150), 1, cv2.LINE_AA)

    cv2.ellipse(img, (cx, cy), (int(R * 0.75), int(R * 0.35)), 30, 0, 360, (*gc, 165), 1, cv2.LINE_AA)
    cv2.ellipse(img, (cx, cy), (int(R * 0.75), int(R * 0.35)), -30, 0, 360, (*gc, 135), 1, cv2.LINE_AA)
    cv2.circle(img, (cx, cy), int(R * 0.38), (*gc, 140), 1, cv2.LINE_AA)
    cv2.line(img, (cx - 10, cy), (cx + 10, cy), (*gc, 180), 1, cv2.LINE_AA)
    cv2.line(img, (cx, cy - 10), (cx, cy + 10), (*gc, 180), 1, cv2.LINE_AA)
    cv2.circle(img, (cx, cy), 3, (*gc, 200), -1)
    cv2.circle(img, (cx, cy - R - 3), 7, (*gc, 190), 1, cv2.LINE_AA)
    return img


def create_constellation_doodle(width: int = 300, height: int = 150, gc: tuple = (28, 25, 23)) -> np.ndarray:
    """Renders a delicate star constellation diagram (Cygnus / Northern Cross) with coordinates."""
    img = np.zeros((height, width, 4), dtype=np.uint8)
    stars = [
        ('Deneb', (230, 25), 3),
        ('Sadr', (170, 70), 3),
        ('Albireo', (50, 125), 2),
        ('Gienah', (250, 115), 2),
        ('Delta', (105, 35), 2),
    ]
    lines = [
        (stars[0][1], stars[1][1]),
        (stars[1][1], stars[2][1]),
        (stars[1][1], stars[3][1]),
        (stars[1][1], stars[4][1]),
    ]
    for p1, p2 in lines:
        dist = int(np.hypot(p2[0]-p1[0], p2[1]-p1[1]))
        num_d = max(3, dist // 6)
        for step in range(0, num_d, 2):
            t1 = step / float(num_d)
            t2 = min(1.0, (step + 1) / float(num_d))
            pt1 = (int(round(p1[0] + (p2[0]-p1[0])*t1)), int(round(p1[1] + (p2[1]-p1[1])*t1)))
            pt2 = (int(round(p1[0] + (p2[0]-p1[0])*t2)), int(round(p1[1] + (p2[1]-p1[1])*t2)))
            cv2.line(img, pt1, pt2, (*gc, 105), 1, cv2.LINE_AA)

    for name, (sx, sy), r in stars:
        for dx, dy in [(0, 4), (0, -4), (4, 0), (-4, 0)]:
            cv2.line(img, (sx, sy), (sx + dx, sy + dy), (*gc, 130), 1, cv2.LINE_AA)
        cv2.circle(img, (sx, sy), r, (*gc, 195), -1)

    cv2.putText(img, 'CYGNUS', (200, 142), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (*gc, 115), 1, cv2.LINE_AA)
    cv2.putText(img, '41*53 N', (30, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (*gc, 95), 1, cv2.LINE_AA)
    return img


def blit_rgba(target: np.ndarray, src: np.ndarray, x: int, y: int) -> None:
    """Safely blits an RGBA source onto an RGBA target canvas with boundary clamping."""
    th, tw = target.shape[:2]
    sh, sw = src.shape[:2]
    x1, y1 = max(0, x), max(0, y)
    x2, y2 = min(tw, x + sw), min(th, y + sh)
    if x2 <= x1 or y2 <= y1:
        return
    sx1, sy1 = x1 - x, y1 - y
    sx2, sy2 = sx1 + (x2 - x1), sy1 + (y2 - y1)
    sub = target[y1:y2, x1:x2]
    sub[:, :, 3] = np.maximum(sub[:, :, 3], src[sy1:sy2, sx1:sx2, 3])
    for c in range(3):
        sub[:, :, c] = src[sy1:sy2, sx1:sx2, c]
    target[y1:y2, x1:x2] = sub


def render_organic_handwriting_line(
    text: str,
    font_path: str,
    font_size: int = 41,
    seed: int = 123,
    gc: tuple = (46, 42, 38)
):
    """
    Renders a single line of handwriting with authentic wrist micro-jitter,
    natural letter-spacing variance, 2B pencil graphite grain, and organic pressure modulation.
    """
    if not text:
        return None
    scale = 3
    font = ImageFont.truetype(font_path, int(font_size * scale))
    dummy = Image.new('RGBA', (10, 10))
    d_dummy = ImageDraw.Draw(dummy)

    words = text.split(' ')
    w_total = d_dummy.textbbox((0, 0), text, font=font)[2] + len(words) * 6 * scale + 80 * scale
    h_total = int(font_size * 3.2 * scale)

    line_img = Image.new('RGBA', (w_total, h_total), (0, 0, 0, 0))
    d_line = ImageDraw.Draw(line_img)

    base_y = int(font_size * 2.1 * scale)
    cur_x = 10 * scale
    space_w = d_dummy.textbbox((0, 0), ' ', font=font)[2] - d_dummy.textbbox((0, 0), ' ', font=font)[0]

    np.random.seed(seed)
    for word in words:
        w_width = d_dummy.textbbox((0, 0), word, font=font)[2] - d_dummy.textbbox((0, 0), word, font=font)[0]
        jitter_y = np.random.uniform(-0.5, 0.5) * scale
        d_line.text((cur_x, base_y + jitter_y), word, font=font, anchor='ls', fill=(255, 255, 255, 255))
        cur_x += w_width + space_w + int(np.random.uniform(-1, 2) * scale)

    arr = np.array(line_img)
    alpha = arr[:, :, 3].astype(float)
    if alpha.max() == 0:
        return None

    # Realistic 2B graphite grain and natural wrist pressure dynamics
    grain = np.random.normal(0, 10, alpha.shape)
    textured = np.where(alpha > 10, np.clip(alpha * 0.90 + grain, 35, 240), alpha).astype(np.uint8)

    w_out = arr.shape[1] // scale
    h_out = arr.shape[0] // scale
    res_alpha = cv2.resize(textured, (w_out, h_out), interpolation=cv2.INTER_AREA)

    res = np.zeros((res_alpha.shape[0], res_alpha.shape[1], 4), dtype=np.uint8)
    for c in range(3):
        res[:, :, c] = gc[c]
    res[:, :, 3] = res_alpha
    return res, base_y // scale


def create_handdrawn_divider(width: int = 1345, gc: tuple = (46, 42, 38), seed: int = 99) -> np.ndarray:
    """
    Renders an authentic hand-drawn pencil divider line with subtle organic tremor,
    sinusoidal wave, soft tapering ends, and an irregular central diamond ornament.
    """
    np.random.seed(seed)
    h = 30
    img = np.zeros((h, width, 4), dtype=np.uint8)
    cy = h // 2
    pts = []
    for x in range(0, width, 4):
        wave = np.sin(x / 140.0) * 1.2 + np.cos(x / 65.0) * 0.6
        tremor = np.random.uniform(-0.4, 0.4)
        y = cy + wave + tremor
        t = 1.0
        if x < 60:
            t = x / 60.0
        elif x > width - 60:
            t = (width - x) / 60.0
        pts.append((x, int(round(y)), t))

    for i in range(len(pts) - 1):
        p1 = (pts[i][0], pts[i][1])
        p2 = (pts[i + 1][0], pts[i + 1][1])
        alpha = int(round(180 * min(pts[i][2], pts[i + 1][2])))
        cv2.line(img, p1, p2, (*gc, alpha), 1, cv2.LINE_AA)

    cx = width // 2
    dia_pts = np.array([
        [cx, cy - 4],
        [cx + 5, cy],
        [cx, cy + 4],
        [cx - 5, cy]
    ], np.int32)
    cv2.fillPoly(img, [dia_pts], (*gc, 180))
    cv2.polylines(img, [dia_pts], True, (*gc, 210), 1, cv2.LINE_AA)
    return img


def render_pencil_title(
    text: str,
    font_path: str,
    font_size: int = 58,
    gc: tuple = (46, 42, 38),
    seed: int = 42
) -> tuple:
    """
    Renders the title in authentic cursive pencil texture:
    soft pressure, graphite micro-grain, and natural alpha modulation.
    """
    scale = 3
    font = ImageFont.truetype(font_path, int(font_size * scale))
    dummy = Image.new('RGBA', (10, 10))
    d_dummy = ImageDraw.Draw(dummy)
    bbox = d_dummy.textbbox((0, 0), text, font=font)
    w_tot = bbox[2] + 40 * scale
    h_tot = int(font_size * 2.8 * scale)
    img = Image.new('RGBA', (w_tot, h_tot), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    base_y = int(font_size * 1.9 * scale)
    d.text((10 * scale, base_y), text, font=font, anchor='ls', fill=(255, 255, 255, 255))

    arr = np.array(img)
    alpha = arr[:, :, 3].astype(float)
    np.random.seed(seed)
    grain = np.random.normal(0, 12, alpha.shape)
    textured = np.where(alpha > 10, np.clip(alpha * 0.88 + grain, 35, 235), alpha).astype(np.uint8)
    res_alpha = cv2.resize(textured, (arr.shape[1] // scale, arr.shape[0] // scale), interpolation=cv2.INTER_AREA)

    res = np.zeros((res_alpha.shape[0], res_alpha.shape[1], 4), dtype=np.uint8)
    for c in range(3):
        res[:, :, c] = gc[c]
    res[:, :, 3] = res_alpha
    return res, base_y // scale


def render_cara_b_canvas(
    lines: list = LETTER_LINES_21,
    gc: tuple = (46, 42, 38),
    body_font_path: str = None,
    header_font_path: str = None
) -> np.ndarray:
    """Renders the transparent 300 DPI canvas for Cara B with authentic manuscript handwriting."""
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

    if body_font_path is None:
        body_font_path = os.path.join(project_root, 'assets', 'fonts', 'MarckScript.ttf')
    if header_font_path is None:
        header_font_path = os.path.join(project_root, 'assets', 'fonts', 'MarckScript.ttf')

    # 1. Header: The Uncharted Path (58 pt cursive pencil, baseline on ruled line Y=231 px)
    t_img, base_out = render_pencil_title("The Uncharted Path", header_font_path, font_size=58, gc=gc, seed=42)
    th, tw = t_img.shape[:2]
    blit_rgba(canvas, t_img, 165, 231 - base_out)

    # Hand-drawn irregular pencil divider with central diamond on ruled line Y=328 px
    div = create_handdrawn_divider(width=1345, gc=gc, seed=99)
    dh, dw = div.shape[:2]
    blit_rgba(canvas, div, 165, 328 - dh // 2)

    # 2. Compose Body Lines: Each line rests directly ON the physical ruled line
    x_body = 165
    for i, line_text in enumerate(lines):
        if not line_text:
            continue
        y_phys_line = int(round(425 + i * 96.85))

        if i == 20:  # Signature line
            rendered = render_organic_handwriting_line(line_text, body_font_path, font_size=46, seed=500 + i, gc=gc)
            if rendered:
                line_img, base_out = rendered
                lh, lw = line_img.shape[:2]

                sig_x = 760
                sig_y = y_phys_line - base_out - 3

                # Constellation Seal
                seal = create_constellation_seal(74, gc=gc)
                sh, sw = seal.shape[:2]
                seal_x = sig_x - sw - 15
                seal_y = y_phys_line - sh // 2 - 12
                blit_rgba(canvas, seal, seal_x, seal_y)

                # Signature text
                blit_rgba(canvas, line_img, sig_x, sig_y)

                # Cursive flourish underline
                uy = y_phys_line + 5
                cv2.line(canvas, (sig_x - 5, uy), (sig_x + lw + 20, uy), (*gc, 160), 1, cv2.LINE_AA)
                cv2.line(canvas, (sig_x + lw + 20, uy), (sig_x + lw + 45, uy + 8), (*gc, 90), 1, cv2.LINE_AA)

        else:
            rendered = render_organic_handwriting_line(line_text, body_font_path, font_size=41, seed=100 + i * 37, gc=gc)
            if rendered:
                line_img, base_out = rendered
                lh, lw = line_img.shape[:2]
                ly = y_phys_line - base_out - 3
                blit_rgba(canvas, line_img, x_body, ly)

    # 3. Constellation doodle in EMPTY right margin at Line 6/7 (Y=875, X=1160)
    doodle = create_constellation_doodle(300, 150, gc=gc)
    blit_rgba(canvas, doodle, 1160, 875)

    # Note: Footer removed per user request

    return canvas


def build_page01_back(
    real_paper_photo_path: str,
    output_dir: str
) -> None:
    """Generates all production assets for Cara B."""
    os.makedirs(output_dir, exist_ok=True)
    print("=== Building Page 1 Cara B (The Cartographer's Letter) ===")

    # 1. Render canvas
    print("\n[Step 1/3] Rendering 300 DPI calligraphy canvas supported on ruled lines...")
    canvas_rgba = render_cara_b_canvas()

    pdf_dir = os.path.join(output_dir, "pdf")
    mockup_dir = os.path.join(output_dir, "mockups")
    os.makedirs(pdf_dir, exist_ok=True)
    os.makedirs(mockup_dir, exist_ok=True)

    # 2. Save Print-Ready 1:1 Vector A5 PDF
    print("\n[Step 2/3] Generating print-ready 1:1 A5 PDF...")
    pdf_path = os.path.join(pdf_dir, "page01_back_letter_A5.pdf")
    PDFBuilder.save_a5_pdf_from_rgba(canvas_rgba, pdf_path, dpi=300)
    print(f"  -> Saved print-ready PDF: {pdf_path}")

    # 3. Photorealistic mockup over real paper
    print("\n[Step 3/3] Generating photorealistic mockup on real photographed paper...")
    if os.path.exists(real_paper_photo_path):
        bg = cv2.imread(real_paper_photo_path)
        if bg is not None:
            # Resize background to 300 DPI and flip horizontally for Cara B
            bg_matched = cv2.resize(bg, (CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX), interpolation=cv2.INTER_LANCZOS4)
            bg_flipped = cv2.flip(bg_matched, 1)

            fg_rgb = canvas_rgba[:, :, :3].astype(np.float32)
            alpha = (canvas_rgba[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]
            mockup = (fg_rgb * alpha + bg_flipped.astype(np.float32) * (1.0 - alpha)).astype(np.uint8)

            mockup_path = os.path.join(mockup_dir, "page01_back_real_paper_mockup.jpg")
            cv2.imwrite(mockup_path, mockup, [cv2.IMWRITE_JPEG_QUALITY, 95])
            print(f"  -> Saved photorealistic mockup: {mockup_path}")
    else:
        print(f"  -> Notice: Background paper photo not found at {real_paper_photo_path}")

    print("\n=== Cara B Production Pipeline Completed Successfully! ===")


if __name__ == "__main__":
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    paper_path = os.path.join(project_root, "journal", "page01", "real_paper_300dpi.png")
    out_dir = os.path.join(project_root, "journal", "page01")
    build_page01_back(paper_path, out_dir)
