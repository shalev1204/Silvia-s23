#!/usr/bin/env python3
"""
Extract clean RGBA cutouts for the new Cairn I and Cairn II seals,
and normalize all PNG inventory items in web/assets/items/ onto uniform
1024x1024 transparent canvases with balanced visual sizing.
"""

import os
import shutil
import cv2
import numpy as np
from PIL import Image

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
ITEMS_DIR = os.path.join(REPO_ROOT, "web", "assets", "items")

NEW_SEALS = [
    (
        "item_seal_cairn_1",
        "/Users/carlespujol/.gemini/antigravity/brain/bc5b4f96-880c-4a38-90d3-a9a82c2809c3/seal_cairn_1_1794849181576.jpg",
    ),
    (
        "item_seal_cairn_2",
        "/Users/carlespujol/.gemini/antigravity/brain/bc5b4f96-880c-4a38-90d3-a9a82c2809c3/seal_cairn_2_v2_1794849230950.jpg",
    ),
]

TARGET_SIZES = {
    "item_falcon_weight.png": 720,
    "item_lamp_oil.png": 760,
    "item_lamp_oil_half.png": 760,
    "item_ibis_figure.png": 760,
    "item_gilded_feather.png": 760,
    "item_order_wax_seal.png": 810,
    "item_brass_compass.png": 810,
    "item_water_skins.png": 810,
    "item_flint_tinder.png": 810,
    "item_spyglass_lens.png": 810,
    "item_red_cord.png": 810,
    "item_servant_coin.png": 810,
    "item_statue_seal.png": 810,
    "item_seal_cairn_1.png": 810,
    "item_seal_cairn_2.png": 810,
}


def extract_seal_rgba(master_jpg_path: str) -> Image.Image:
    """Extract solid sandstone/bronze disc from pitch-black studio background."""
    rgb = np.array(Image.open(master_jpg_path).convert("RGB"))

    # Strict pure-black background threshold (<= 6) protects deep stone shadows
    lum = rgb.max(axis=2)
    is_dark = (lum <= 6).astype(np.uint8)

    # Flood-fill connected background strictly from image borders
    num_labels, labels = cv2.connectedComponents(is_dark, connectivity=4)
    border_labels = set()
    border_labels.update(labels[0, :].tolist())
    border_labels.update(labels[-1, :].tolist())
    border_labels.update(labels[:, 0].tolist())
    border_labels.update(labels[:, -1].tolist())
    border_labels.discard(0)

    ext_bg = np.isin(labels, list(border_labels))
    fg_mask = (~ext_bg).astype(np.uint8) * 255

    # Keep largest component, close dark shadow crevices, and fill solid silhouette
    n_fg, fg_labels, stats, _ = cv2.connectedComponentsWithStats(fg_mask, connectivity=8)
    if n_fg > 1:
        areas = stats[1:, cv2.CC_STAT_AREA]
        largest_label = 1 + int(np.argmax(areas))
        fg_mask = np.where(fg_labels == largest_label, 255, 0).astype(np.uint8)

    close_k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
    fg_closed = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, close_k)
    contours, _ = cv2.findContours(fg_closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    filled = np.zeros_like(fg_closed)
    if contours:
        largest_cnt = max(contours, key=cv2.contourArea)
        cv2.drawContours(filled, [largest_cnt], -1, 255, thickness=cv2.FILLED)
    else:
        filled = fg_closed

    # Erode 1px to remove any residual black fringe, then feather outer 2px edge
    kernel = np.ones((3, 3), np.uint8)
    fg_eroded = cv2.erode(filled, kernel, iterations=1)
    alpha = cv2.GaussianBlur(fg_eroded.astype(np.float32), (3, 3), 0.7)

    inner_core = cv2.erode(fg_eroded, kernel, iterations=2)
    alpha = np.where(inner_core > 0, 255.0, alpha)
    alpha_u8 = np.clip(alpha, 0, 255).astype(np.uint8)

    rgba = np.dstack([rgb, alpha_u8])
    return Image.fromarray(rgba)


def normalize_to_square(im: Image.Image, target_max: int, canvas_size: int = 1024) -> Image.Image:
    """Tightly crop non-transparent bounding box, scale to target_max, and center on 1024x1024."""
    im = im.convert("RGBA")
    alpha = im.getchannel("A")
    clean_mask = alpha.point(lambda a: 255 if a >= 8 else 0)
    bbox = clean_mask.getbbox()
    if not bbox:
        return im

    cropped = im.crop(bbox)
    cw, ch = cropped.size
    if im.size == (canvas_size, canvas_size) and abs(max(cw, ch) - target_max) <= 1:
        # Already normalized at target size
        return im

    scale = target_max / float(max(cw, ch))
    new_w = max(1, int(round(cw * scale)))
    new_h = max(1, int(round(ch * scale)))

    resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    offset_x = (canvas_size - new_w) // 2
    offset_y = (canvas_size - new_h) // 2
    canvas.paste(resized, (offset_x, offset_y), resized)
    return canvas


def main():
    for base_name, master_path in NEW_SEALS:
        jpg_dest = os.path.join(ITEMS_DIR, f"{base_name}.jpg")
        png_dest = os.path.join(ITEMS_DIR, f"{base_name}.png")
        shutil.copy2(master_path, jpg_dest)
        rgba_im = extract_seal_rgba(master_path)
        rgba_norm = normalize_to_square(rgba_im, TARGET_SIZES[f"{base_name}.png"])
        rgba_norm.save(png_dest, "PNG", optimize=True)
        bbox = rgba_norm.getbbox()
        print(f"[NEW] {base_name}.png -> size={rgba_norm.size}, bbox={bbox}")

    print("\nNormalizing existing PNG items to 1024x1024:")
    for filename, target_max in sorted(TARGET_SIZES.items()):
        if filename in ("item_seal_cairn_1.png", "item_seal_cairn_2.png"):
            continue
        path = os.path.join(ITEMS_DIR, filename)
        if not os.path.isfile(path):
            print(f"[SKIP] Missing {path}")
            continue
        im = Image.open(path)
        norm = normalize_to_square(im, target_max)
        norm.save(path, "PNG", optimize=True)
        bbox = norm.getbbox()
        bw = bbox[2] - bbox[0] if bbox else 0
        bh = bbox[3] - bbox[1] if bbox else 0
        print(f"  {filename:28s} -> 1024x1024, content={bw}x{bh} (target_max={target_max})")


if __name__ == "__main__":
    main()
