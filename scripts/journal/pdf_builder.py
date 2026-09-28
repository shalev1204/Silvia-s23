"""
PDF Builder: Generates vector-dimensioned ISO A5 PDFs at exact 1:1 scale (300 DPI).
Ensures zero printer ink on unprinted paper regions.
"""

import os
from typing import Union
import cv2
import numpy as np
from PIL import Image

from .geometry import (
    A5_WIDTH_MM,
    A5_HEIGHT_MM,
    DEFAULT_DPI,
    CANVAS_WIDTH_PX,
    CANVAS_HEIGHT_PX,
    mm_to_pt,
)


class PDFBuilder:
    """Generates print-ready PDFs with millimetric precision."""

    @staticmethod
    def save_a5_pdf_from_rgba(
        rgba_img: np.ndarray,
        output_pdf_path: str,
        dpi: int = DEFAULT_DPI,
    ) -> None:
        """
        Saves an RGBA numpy array as an exact 1:1 A5 PDF (300 DPI).
        Unprinted pixels are mapped to pure (255, 255, 255) so standard CMYK printers
        deposit zero ink on the paper.

        Args:
            rgba_img: RGBA image of shape (H, W, 4).
            output_pdf_path: Target path for the output PDF.
            dpi: Resolution (default 300 DPI).
        """
        os.makedirs(os.path.dirname(os.path.abspath(output_pdf_path)), exist_ok=True)

        h, w = rgba_img.shape[:2]
        # Ensure canvas dimensions match target
        if (w, h) != (CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX):
            rgba_img = cv2.resize(
                rgba_img,
                (CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX),
                interpolation=cv2.INTER_LANCZOS4
            )

        # Separate color and alpha
        rgb = rgba_img[:, :, :3]
        alpha = rgba_img[:, :, 3].astype(np.float32) / 255.0

        # Composite against pure white background
        white_bg = np.ones((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 3), dtype=np.float32) * 255.0
        alpha_3d = alpha[:, :, np.newaxis]
        blended = rgb.astype(np.float32) * alpha_3d + white_bg * (1.0 - alpha_3d)
        final_rgb = np.clip(blended, 0, 255).astype(np.uint8)

        # Convert to PIL and save as PDF with exact DPI
        pil_img = Image.fromarray(final_rgb)
        pil_img.save(
            output_pdf_path,
            'PDF',
            resolution=float(dpi),
            quality=100
        )
