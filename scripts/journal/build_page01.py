"""
End-to-end automated production pipeline for Page 1 of the Journal.
Generates:
1. Pure transparent graphite artwork PNG (300 DPI)
2. Full A5 transparent canvas PNG (1748 x 2480 px @ 300 DPI)
3. Direct print-ready A5 PDF (scale 1:1, MediaBox 419.52 x 595.2 pt)
4. Calibration sheets (Cara A & Cara B)
5. Photorealistic mockup over real photographed paper
"""

import os
import sys
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Ensure scripts directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from scripts.journal.geometry import (
    GEOMETRY_CARA_A,
    GEOMETRY_CARA_B,
    CANVAS_WIDTH_PX,
    CANVAS_HEIGHT_PX,
    mm_to_px,
)
from scripts.journal.alpha_engine import AlphaEngine
from scripts.journal.composer import PageComposer
from scripts.journal.pdf_builder import PDFBuilder


def build_page01(
    raw_sketch_path: str,
    real_paper_photo_path: str,
    output_dir: str
) -> None:
    """Builds all Page 1 production assets with surgical Da Vinci cleanup."""
    os.makedirs(output_dir, exist_ok=True)
    print(f"=== Starting Page 1 Production Pipeline ===")
    print(f"Source Sketch: {raw_sketch_path}")
    print(f"Output Directory: {output_dir}")

    # 1. Extract pure transparent graphite strokes
    print("\n[Step 1/5] Extracting pure graphite strokes (AlphaEngine)...")
    art_rgba = AlphaEngine.extract_graphite_strokes(
        image_path=raw_sketch_path,
        graphite_color=(28, 26, 24),
        bg_threshold=0.92,
        gamma=1.3,
        kernel_size=51,
        blur_size=61
    )

    clean = art_rgba.copy()

    # Clear outer binding and paper scanner edges
    clean[:, :24, 3] = 0
    clean[:, 836:, 3] = 0
    clean[:25, :, 3] = 0
    clean[1228:, :, 3] = 0

    # --- SURGICAL DA VINCI CLEANUP MASKS ---

    # 1. Top Eclisse Lunare title & underline
    clean[30:75, 560:725, 3] = 0

    # 2. Top-left note (per nota...) and residual divider underlines up to zodiac ring
    clean[60:200, 50:395, 3] = 0

    # 3. Observatorio title & curved arrow to dome
    clean[230:272, 55:305, 3] = 0
    clean[272:320, 80:130, 3] = 0

    # Sky dashes between dome and zodiac ring
    clean[340:425, 340:460, 3] = 0

    # 4. Altillo (observatory platform & rock ledge) - 100% RECONSTRUCTED & INTACT:
    # Preserves beams (x <= 398 for y in [450, 520]) and rock ledge (x <= 405 for y in [520, 575])
    clean[430:475, 395:540, 3] = 0
    clean[475:505, 402:540, 3] = 0
    clean[505:525, 398:540, 3] = 0
    clean[525:565, 408:540, 3] = 0
    clean[518:532, 396:415, 3] = 0
    clean[564:585, 345:385, 3] = 0  # Arrow under strut
    clean[565:575, 406:530, 3] = 0  # Platform note ('runioniti...')
    clean[575:590, 395:530, 3] = 0
    clean[590:640, 370:530, 3] = 0

    # 5. Zodiac second circle & open sky in front of dove - 100% PRESERVED & FLAWLESS:
    # Concentric rings, divider lines and astrological glyph '♌' preserved at Y <= 405 for X in [470, 580]
    clean[415:465, 340:480, 3] = 0  # Sky dashes approaching dove
    clean[445:495, 480:555, 3] = 0
    for y in range(412, 442):
        for x in range(550, 575):
            y_ring = int(0.52 * (x - 480) + 364.5)
            if y >= y_ring + 3:
                clean[y, x, 3] = 0  # Arrowhead pointing up-right to zodiac ring
    clean[452:472, 590:608, 3] = 0  # Arrowhead pointing to dove breast
    clean[416:424, 574:585, 3] = 0  # Dash in front of beak
    clean[474:482, 565:578, 3] = 0  # Lower dash
    clean[415:418, 575:578, 3] = 0  # Tiny speck above forehead

    # 6. Colombino Viaggiatore text & arrow to tail:
    clean[510:585, 695:805, 3] = 0
    clean[470:505, 700:750, 3] = 0

    # 7. Mid strati note & curved pointer to ground:
    clean[635:725, 360:560, 3] = 0
    clean[720:815, 480:525, 3] = 0

    # 8. Arco e Teatro title & arrow to arch cornice:
    clean[645:695, 565:810, 3] = 0
    clean[695:740, 785:815, 3] = 0

    # 9. Bottom-left text on cliff & cutoff text (cleared to make room for compass):
    clean[935:1060, 30:220, 3] = 0
    clean[1060:1115, 20:250, 3] = 0

    # 10. Leonardo bottom-center text on sand dune (tapered preservation of dune lines above):
    clean[1143:1235, 380:635, 3] = 0

    # 11. Erase old compass from bottom-right (surgical mask to preserve dunes and mountain slope):
    old_comp_mask = np.zeros(clean.shape[:2], dtype=np.uint8)
    cv2.circle(old_comp_mask, (727, 1157), 80, 255, -1)
    cv2.rectangle(old_comp_mask, (708, 1048), (745, 1157), 255, -1)  # N & fleur
    cv2.rectangle(old_comp_mask, (708, 1157), (745, 1255), 255, -1)  # S & 'S'
    cv2.rectangle(old_comp_mask, (635, 1130), (727, 1165), 255, -1)  # W & 'W'
    cv2.rectangle(old_comp_mask, (727, 1125), (832, 1165), 255, -1)  # E & 'E'
    pts_diag = np.array([
        [727, 1157], [665, 1095], [727, 1115], [788, 1095], [727, 1157],
        [788, 1218], [727, 1200], [665, 1218]
    ], np.int32)
    cv2.fillPoly(old_comp_mask, [pts_diag], 255)
    clean[old_comp_mask > 0, 3] = 0

    # --- REPLACE SCROLL WITH MINI DIARIO ON DOVE (WITH ECLIPSE SHIELD & SILK RIBBON) ---
    print("  -> Replacing parchment scroll with mini diario on dove (with Eclipse Order emblem & silk ribbon)...")
    assets_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'journal', 'page01', 'assets')
    j_path = os.path.join(assets_dir, 'mini_journal_alpha.png')
    # Use enhanced journal with eclipse shield if available
    j_enh_path = os.path.join(assets_dir, 'mini_journal_eclipse_shield.png')
    if os.path.exists(j_enh_path):
        j_rgba = cv2.imread(j_enh_path, cv2.IMREAD_UNCHANGED)
    elif os.path.exists(j_path):
        j_rgba = cv2.imread(j_path, cv2.IMREAD_UNCHANGED)
    else:
        j_rgba = None

    if j_rgba is not None:
        ys, xs = np.where(j_rgba[:, :, 3] > 10)
        j_crop = j_rgba[ys.min():ys.max()+1, xs.min():xs.max()+1]
        scale_j = 0.35
        w_j = int(round(j_crop.shape[1] * scale_j))
        h_j = int(round(j_crop.shape[0] * scale_j))
        j_scaled = cv2.resize(j_crop, (w_j, h_j), interpolation=cv2.INTER_AREA)

        # Erase old parchment scroll & strings
        clean[475:518, 575:655, 3] = 0
        clean[478:505, 570:580, 3] = 0
        clean[490:525, 635:668, 3] = 0
        clean[470:476, 580:595, 3] = 0
        clean[450:525, 520:580, 3] = 0  # Clean front stray motion dashes & specks

        # Place mini journal at Y=466, X=590
        sub_dove = clean[466:466+h_j, 590:590+w_j]
        sub_dove[:, :, 3] = np.maximum(sub_dove[:, :, 3], j_scaled[:, :, 3])
        for c in range(3):
            sub_dove[:, :, c] = 28
        clean[466:466+h_j, 590:590+w_j] = sub_dove

    # --- PLACE COMPASS IN BOTTOM-LEFT ---
    print("  -> Relocating compass rose to bottom-left (100% visible, fully framed)...")
    c_path = os.path.join(assets_dir, 'compass_master_alpha.png')
    if os.path.exists(c_path):
        comp_master = cv2.imread(c_path, cv2.IMREAD_UNCHANGED)
        scale_c = 0.72
        w_c = int(round(comp_master.shape[1] * scale_c))
        h_c = int(round(comp_master.shape[0] * scale_c))
        comp_scaled = cv2.resize(comp_master, (w_c, h_c), interpolation=cv2.INTER_LANCZOS4)

        # Place compass at X=80, Y=1048
        sub_comp = clean[1048:1048+h_c, 80:80+w_c]
        sub_comp[:, :, 3] = np.maximum(sub_comp[:, :, 3], comp_scaled[:, :, 3])
        for c in range(3):
            sub_comp[:, :, c] = 28
        clean[1048:1048+h_c, 80:80+w_c] = sub_comp

    # --- THE ECLIPSE ORDER: LOGO & HANDWRITTEN TITLE ABOVE OBSERVATORY ---
    print("  -> Drawing hand-sketched 'The Eclipse Order' emblem and title above observatory...")
    gc = (28, 26, 24)

    # 1. Authentic Renaissance Compass-Drawn Eclipse Emblem
    def create_pencil_emblem(diameter=52):
        size = diameter + 16
        img = np.zeros((size, size, 4), dtype=np.uint8)
        cx, cy = size // 2, size // 2
        R = diameter // 2

        # Pinprick compass anchor
        cv2.circle(img, (cx, cy), 1, (*gc, 180), -1)

        # Concentric astrolabe rings with soft pencil stroke
        cv2.circle(img, (cx, cy), R, (*gc, 205), 1, cv2.LINE_AA)
        cv2.circle(img, (cx, cy), R - 3, (*gc, 135), 1, cv2.LINE_AA)

        # Astrolabe dashed circle
        r_dash = int(R * 0.88)
        for deg in range(0, 360, 15):
            rad1 = np.deg2rad(deg)
            rad2 = np.deg2rad(deg + 7)
            x1 = int(round(cx + r_dash * np.cos(rad1)))
            y1 = int(round(cy + r_dash * np.sin(rad1)))
            x2 = int(round(cx + r_dash * np.cos(rad2)))
            y2 = int(round(cy + r_dash * np.sin(rad2)))
            cv2.line(img, (x1, y1), (x2, y2), (*gc, 160), 1, cv2.LINE_AA)

        r_inner = int(R * 0.77)
        cv2.circle(img, (cx, cy), r_inner, (*gc, 155), 1, cv2.LINE_AA)

        # Central eclipse circle
        r_ecl = int(R * 0.64)
        cv2.circle(img, (cx, cy), r_ecl, (*gc, 215), 1, cv2.LINE_AA)

        # Cardinal & diagonal ticks
        ticks = [
            (0, R - 4, R + 4, 1),
            (90, R - 4, R + 4, 1),
            (180, R - 4, R + 4, 1),
            (270, R - 4, R + 4, 1),
            (45, R - 3, R + 2, 1),
            (135, R - 3, R + 2, 1),
            (225, R - 3, R + 2, 1),
            (315, R - 3, R + 2, 1),
        ]
        for deg, r_in, r_out, w in ticks:
            rad = np.deg2rad(deg)
            x1 = int(round(cx + r_in * np.cos(rad)))
            y1 = int(round(cy + r_in * np.sin(rad)))
            x2 = int(round(cx + r_out * np.cos(rad)))
            y2 = int(round(cy + r_out * np.sin(rad)))
            cv2.line(img, (x1, y1), (x2, y2), (*gc, 190), w, cv2.LINE_AA)

        # Vertical meridian dividing line
        cv2.line(img, (cx, cy - r_ecl), (cx, cy + r_ecl), (*gc, 215), 1, cv2.LINE_AA)

        # Renaissance pencil hatching for dark hemisphere (Right half)
        mask_right = np.zeros((size, size), dtype=np.uint8)
        cv2.circle(mask_right, (cx, cy), r_ecl, 255, -1)
        mask_right[:, :cx] = 0

        hatch_layer = np.zeros((size, size), dtype=np.uint8)
        for offset in range(-size, size*2, 3):
            pt1 = (offset, 0)
            pt2 = (offset + size, size)
            cv2.line(hatch_layer, pt1, pt2, 175, 1, cv2.LINE_AA)
        for offset in range(-size, size*2, 4):
            pt1 = (offset + size, 0)
            pt2 = (offset, size)
            cv2.line(hatch_layer, pt1, pt2, 115, 1, cv2.LINE_AA)

        hatch_right = cv2.bitwise_and(hatch_layer, hatch_layer, mask=mask_right)
        y_idx, x_idx = np.where(hatch_right > 0)
        for y, x in zip(y_idx, x_idx):
            val = int(hatch_right[y, x])
            grain = np.random.randint(-18, 18)
            alpha = int(np.clip(val + grain, 0, 255))
            if alpha > img[y, x, 3]:
                img[y, x] = (*gc, alpha)

        cv2.circle(img, (cx, cy), r_ecl, (*gc, 210), 1, cv2.LINE_AA)
        return img

    # 2. Authentic Cartographer Handwritten Cursive (Apple Chancery with 2B graphite texture)
    def render_organic_pencil_text(text, font_path, font_size, letter_spacing=1.0):
        scale = 3
        font = ImageFont.truetype(font_path, int(font_size * scale))
        dummy = Image.new('RGBA', (10, 10))
        d = ImageDraw.Draw(dummy)

        char_widths = []
        char_bboxes = []
        for char in text:
            bbox = d.textbbox((0, 0), char, font=font)
            char_bboxes.append(bbox)
            char_widths.append(bbox[2] - bbox[0])

        total_w = sum(char_widths) + int(len(text) * 4 * scale) + 60 * scale
        max_h = max(b[3] - b[1] for b in char_bboxes) + 50 * scale

        t_img = Image.new('RGBA', (total_w, max_h), (0, 0, 0, 0))
        d_img = ImageDraw.Draw(t_img)

        cur_x = 25 * scale
        base_y = 25 * scale

        np.random.seed(123)
        words = text.split(' ')
        for i, word in enumerate(words):
            w_bbox = d.textbbox((0, 0), word, font=font)
            w_width = w_bbox[2] - w_bbox[0]
            jitter_y = np.random.uniform(-2.0, 2.0)
            d_img.text((cur_x, base_y + jitter_y), word, fill=(255, 255, 255, 255), font=font)
            space_w = d.textbbox((0, 0), ' ', font=font)[2] - d.textbbox((0, 0), ' ', font=font)[0]
            cur_x += w_width + int(space_w * letter_spacing)

        arr = np.array(t_img)
        alpha = arr[:, :, 3].astype(float)

        grain = np.random.normal(0, 22, alpha.shape)
        y_coords, x_coords = np.indices(alpha.shape)
        pressure = np.sin(x_coords / (14.0 * scale)) * 12 + np.cos(y_coords / (9.0 * scale)) * 8

        textured = np.where(
            alpha > 12,
            np.clip(alpha * 0.84 + grain + pressure, 35, 230),
            alpha
        ).astype(np.uint8)

        w_out = arr.shape[1] // scale
        h_out = arr.shape[0] // scale
        res_alpha = cv2.resize(textured, (w_out, h_out), interpolation=cv2.INTER_AREA)

        ys, xs = np.where(res_alpha > 10)
        if len(ys) > 0:
            res_alpha = res_alpha[ys.min():ys.max()+1, xs.min():xs.max()+1]

        res = np.zeros((res_alpha.shape[0], res_alpha.shape[1], 4), dtype=np.uint8)
        for c in range(3):
            res[:, :, c] = gc[c]
        res[:, :, 3] = res_alpha
        return res

    # Render Emblem & Title (Horizontal Header: Emblem Left, Title Right, lowered for natural top margin)
    cy_pos = 135
    emblem = create_pencil_emblem(diameter=52)
    eh, ew = emblem.shape[:2]
    ex = 80
    ey = cy_pos - eh // 2

    sub_e = clean[ey:ey+eh, ex:ex+ew]
    sub_e[:, :, 3] = np.maximum(sub_e[:, :, 3], emblem[:, :, 3])
    for c in range(3):
        sub_e[:, :, c] = gc[c]
    clean[ey:ey+eh, ex:ex+ew] = sub_e

    # Title "The Eclipse Order"
    chancery_path = '/System/Library/Fonts/Supplemental/Apple Chancery.ttf'
    txt = render_organic_pencil_text('The Eclipse Order', chancery_path, font_size=21)
    th, tw = txt.shape[:2]
    tx = ex + ew + 10
    ty = cy_pos - th // 2

    sub_t = clean[ty:ty+th, tx:tx+tw]
    sub_t[:, :, 3] = np.maximum(sub_t[:, :, 3], txt[:, :, 3])
    for c in range(3):
        sub_t[:, :, c] = gc[c]
    clean[ty:ty+th, tx:tx+tw] = sub_t

    # Fine pencil flourish underline under title only (clean taper)
    uy = ty + th + 3
    cv2.line(clean, (tx - 4, uy), (tx + tw + 8, uy), (*gc, 165), 1, cv2.LINE_AA)
    cv2.line(clean, (tx + tw + 8, uy), (tx + tw + 20, uy), (*gc, 80), 1, cv2.LINE_AA)

    pdf_dir = os.path.join(output_dir, "pdf")
    mockup_dir = os.path.join(output_dir, "mockups")
    os.makedirs(pdf_dir, exist_ok=True)
    os.makedirs(mockup_dir, exist_ok=True)

    # 2. Compose onto full A5 Cara A canvas (148 x 210 mm)
    print("\n[Step 2/4] Composing onto A5 Cara A canvas (1748 x 2480 px @ 300 DPI - Full Page)...")
    composer = PageComposer(geometry=GEOMETRY_CARA_A)
    # Full Page Format: Fills 100% of the A5 sheet height and width
    canvas_rgba = composer.place_full_page(
        artwork_rgba=clean,
        mode='cover',
        margin_mm=0.0,
        auto_trim_alpha=True
    )

    # 3. Generate Print-Ready 1:1 Vector A5 PDF
    print("\n[Step 3/4] Generating print-ready 1:1 A5 PDF...")
    pdf_path = os.path.join(pdf_dir, "page01_front_print_A5.pdf")
    PDFBuilder.save_a5_pdf_from_rgba(canvas_rgba, pdf_path, dpi=300)
    print(f"  -> Saved print-ready PDF: {pdf_path}")

    # 4. Photorealistic mockup over real journal page
    print("\n[Step 4/4] Generating photorealistic mockup on real photographed paper...")
    if os.path.exists(real_paper_photo_path):
        real_bg = cv2.imread(real_paper_photo_path)
        if real_bg is not None:
            mockup = composer.composite_over_background(canvas_rgba, real_bg)
            mockup_path = os.path.join(mockup_dir, "page01_front_real_paper_mockup.jpg")
            cv2.imwrite(mockup_path, mockup, [cv2.IMWRITE_JPEG_QUALITY, 95])
            print(f"  -> Saved photorealistic mockup: {mockup_path}")
    else:
        print(f"  -> Notice: Background paper photo not found at {real_paper_photo_path}, skipping mockup.")

    print("\n=== Page 1 Production Pipeline Completed Successfully! ===")
    return canvas_rgba


if __name__ == "__main__":
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    raw_sketch = os.path.join(project_root, "journal", "page01", "raw_davinci_sketch.jpg")
    warped_paper = os.path.join(project_root, "journal", "page01", "real_paper_300dpi.png")
    out_directory = os.path.join(project_root, "journal", "page01")

    build_page01(raw_sketch, warped_paper, out_directory)
