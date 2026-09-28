"""
Composer: Positions artwork onto an exact 300 DPI A5 transparent canvas,
respecting the millimetric hole punch boundaries and paper margins.
"""

from typing import Optional, Tuple
import cv2
import numpy as np
from PIL import Image

from .geometry import (
    PageGeometry,
    GEOMETRY_CARA_A,
    GEOMETRY_CARA_B,
    CANVAS_WIDTH_PX,
    CANVAS_HEIGHT_PX,
    mm_to_px,
    px_to_mm,
)


class PageComposer:
    """Composes transparent assets onto an exact A5 sheet canvas."""

    def __init__(self, geometry: PageGeometry = GEOMETRY_CARA_A):
        self.geometry = geometry
        self.width_px = mm_to_px(geometry.width_mm, geometry.dpi)
        self.height_px = mm_to_px(geometry.height_mm, geometry.dpi)

    def create_empty_canvas(self) -> np.ndarray:
        """Returns an empty transparent RGBA canvas (1748 x 2480 at 300 DPI)."""
        return np.zeros((self.height_px, self.width_px, 4), dtype=np.uint8)

    def place_artwork(
        self,
        artwork_rgba: np.ndarray,
        target_width_mm: float,
        center_x_mm: Optional[float] = None,
        center_y_mm: Optional[float] = None,
        top_y_mm: Optional[float] = None,
    ) -> np.ndarray:
        """
        Places an RGBA artwork onto the A5 canvas with millimetric precision.

        Args:
            artwork_rgba: Source RGBA numpy array.
            target_width_mm: Target physical width in mm.
            center_x_mm: Center X in mm (defaults to center of safe content area).
            center_y_mm: Center Y in mm (if None and top_y_mm is None, defaults to page center).
            top_y_mm: Top edge Y in mm (overrides center_y_mm if specified).

        Returns:
            np.ndarray: Full A5 RGBA canvas with artwork placed.
        """
        canvas = self.create_empty_canvas()
        art_h, art_w = artwork_rgba.shape[:2]

        target_w_px = mm_to_px(target_width_mm, self.geometry.dpi)
        scale = target_w_px / float(art_w)
        target_h_px = int(round(art_h * scale))

        # High-fidelity resizing
        resized = cv2.resize(
            artwork_rgba,
            (target_w_px, target_h_px),
            interpolation=cv2.INTER_LANCZOS4
        )

        # Compute safe bounds
        x_min_mm, y_min_mm, x_max_mm, y_max_mm = self.geometry.safe_content_box_mm

        if center_x_mm is None:
            center_x_mm = (x_min_mm + x_max_mm) / 2.0

        target_center_x_px = mm_to_px(center_x_mm, self.geometry.dpi)
        pos_x = target_center_x_px - target_w_px // 2

        if top_y_mm is not None:
            pos_y = mm_to_px(top_y_mm, self.geometry.dpi)
        elif center_y_mm is not None:
            pos_y = mm_to_px(center_y_mm, self.geometry.dpi) - target_h_px // 2
        else:
            pos_y = (self.height_px - target_h_px) // 2

        # Clamp and slice onto canvas
        src_x1 = max(0, -pos_x)
        src_y1 = max(0, -pos_y)
        dst_x1 = max(0, pos_x)
        dst_y1 = max(0, pos_y)

        src_x2 = min(target_w_px, self.width_px - pos_x)
        src_y2 = min(target_h_px, self.height_px - pos_y)
        dst_x2 = min(self.width_px, pos_x + target_w_px)
        dst_y2 = min(self.height_px, pos_y + target_h_px)

        if dst_x2 > dst_x1 and dst_y2 > dst_y1:
            patch = resized[src_y1:src_y2, src_x1:src_x2]
            canvas[dst_y1:dst_y2, dst_x1:dst_x2] = patch

        return canvas

    def place_full_page(
        self,
        artwork_rgba: np.ndarray,
        mode: str = 'cover',
        margin_mm: float = 0.0,
        center_x_mm: Optional[float] = None,
        auto_trim_alpha: bool = True,
    ) -> np.ndarray:
        """
        Places artwork so that it fills the entire A5 page (full page format).

        Modes:
            'cover': Scales proportionally so that BOTH width and height completely cover
                     the page (or page minus margin_mm), eliminating any empty space.
            'contain_height': Scales height to match full page height (210mm - 2*margin_mm)
                              and centers width.
            'stretch_exact': Resizes directly to exact canvas dimensions (1748 x 2480 px).

        Args:
            artwork_rgba: Source RGBA numpy array.
            mode: 'cover', 'contain_height', or 'stretch_exact'.
            margin_mm: Margin from page edges in mm (0.0 for edge-to-edge full bleed).
            center_x_mm: Optional custom horizontal center in mm.
            auto_trim_alpha: If True, trims empty transparent margins before scaling
                             so visible strokes span 100% of the page.

        Returns:
            np.ndarray: Full A5 RGBA canvas (1748 x 2480 px at 300 DPI).
        """
        canvas = self.create_empty_canvas()

        # Trim empty transparent padding if requested
        if auto_trim_alpha:
            alpha = artwork_rgba[:, :, 3]
            ys, xs = np.where(alpha > 8)
            if len(ys) > 0 and len(xs) > 0:
                artwork_rgba = artwork_rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]

        art_h, art_w = artwork_rgba.shape[:2]

        usable_w_mm = self.geometry.width_mm - 2 * margin_mm
        usable_h_mm = self.geometry.height_mm - 2 * margin_mm

        usable_w_px = mm_to_px(usable_w_mm, self.geometry.dpi)
        usable_h_px = mm_to_px(usable_h_mm, self.geometry.dpi)

        if mode == 'stretch_exact':
            resized = cv2.resize(
                artwork_rgba,
                (usable_w_px, usable_h_px),
                interpolation=cv2.INTER_LANCZOS4
            )
            offset_x = mm_to_px(margin_mm, self.geometry.dpi)
            offset_y = mm_to_px(margin_mm, self.geometry.dpi)
            canvas[offset_y:offset_y + usable_h_px, offset_x:offset_x + usable_w_px] = resized
            return canvas

        scale_w = usable_w_px / float(art_w)
        scale_h = usable_h_px / float(art_h)

        if mode == 'cover':
            scale = max(scale_w, scale_h)
        elif mode == 'contain_height':
            scale = scale_h
        else:
            scale = min(scale_w, scale_h)

        target_w_px = int(round(art_w * scale))
        target_h_px = int(round(art_h * scale))

        resized = cv2.resize(
            artwork_rgba,
            (target_w_px, target_h_px),
            interpolation=cv2.INTER_LANCZOS4
        )

        if center_x_mm is not None:
            center_x_px = mm_to_px(center_x_mm, self.geometry.dpi)
            pos_x = center_x_px - target_w_px // 2
        else:
            pos_x = (self.width_px - target_w_px) // 2

        pos_y = (self.height_px - target_h_px) // 2

        # Clamp and slice onto canvas
        src_x1 = max(0, -pos_x)
        src_y1 = max(0, -pos_y)
        dst_x1 = max(0, pos_x)
        dst_y1 = max(0, pos_y)

        src_x2 = min(target_w_px, self.width_px - pos_x)
        src_y2 = min(target_h_px, self.height_px - pos_y)
        dst_x2 = min(self.width_px, pos_x + target_w_px)
        dst_y2 = min(self.height_px, pos_y + target_h_px)

        if dst_x2 > dst_x1 and dst_y2 > dst_y1:
            patch = resized[src_y1:src_y2, src_x1:src_x2]
            canvas[dst_y1:dst_y2, dst_x1:dst_x2] = patch

        return canvas

    def composite_over_background(
        self,
        canvas_rgba: np.ndarray,
        background_bgr: np.ndarray
    ) -> np.ndarray:
        """
        Overlays the transparent canvas onto a photographed or rendered paper background.
        Ensures exact 1:1 dimension matching.
        """
        bg_h, bg_w = background_bgr.shape[:2]
        if (bg_h, bg_w) != (self.height_px, self.width_px):
            bg_matched = cv2.resize(
                background_bgr,
                (self.width_px, self.height_px),
                interpolation=cv2.INTER_LANCZOS4
            )
        else:
            bg_matched = background_bgr.copy()

        fg_rgb = cv2.cvtColor(canvas_rgba[:, :, :3], cv2.COLOR_RGB2BGR).astype(np.float32)
        alpha = (canvas_rgba[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]

        bg_float = bg_matched.astype(np.float32)
        composite = fg_rgb * alpha + bg_float * (1.0 - alpha)
        return np.clip(composite, 0, 255).astype(np.uint8)
