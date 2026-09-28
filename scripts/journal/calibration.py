"""
Calibration Sheet Generator: Produces a high-precision A5 alignment test page
with millimetric crosshairs, hole centers, and 21 ruled line tick marks.
Allows the user to test-print on draft paper and verify 0.1 mm registration against the real journal.
"""

import os
import cv2
import numpy as np

from .geometry import (
    PageGeometry,
    GEOMETRY_CARA_A,
    GEOMETRY_CARA_B,
    CANVAS_WIDTH_PX,
    CANVAS_HEIGHT_PX,
    HOLE_Y_POSITIONS_MM,
    HOLE_RADIUS_MM,
    LINE_COUNT,
    HEADER_MARGIN_MM,
    LINE_PITCH_MM,
    mm_to_px,
)
from .pdf_builder import PDFBuilder


class CalibrationGenerator:
    """Generates alignment calibration sheets for Cara A and Cara B."""

    @staticmethod
    def generate_sheet(geometry: PageGeometry) -> np.ndarray:
        """Draws millimetric alignment markers on a transparent/white canvas."""
        w_px = mm_to_px(geometry.width_mm, geometry.dpi)
        h_px = mm_to_px(geometry.height_mm, geometry.dpi)

        # Start with transparent RGBA canvas
        canvas = np.zeros((h_px, w_px, 4), dtype=np.uint8)

        # Color: sharp technical graphite / dark blue
        color_marker = (40, 40, 40, 255)
        color_guide = (100, 100, 100, 200)

        # 1. Outer page registration corners (10 mm crosshairs at each corner)
        corners = [
            (10, 10), (geometry.width_mm - 10, 10),
            (10, geometry.height_mm - 10), (geometry.width_mm - 10, geometry.height_mm - 10)
        ]
        for cx_mm, cy_mm in corners:
            cx = mm_to_px(cx_mm, geometry.dpi)
            cy = mm_to_px(cy_mm, geometry.dpi)
            arm = mm_to_px(4.0, geometry.dpi)
            # Horizontal & vertical crosshair lines
            cv2.line(canvas, (cx - arm, cy), (cx + arm, cy), color_marker, 2)
            cv2.line(canvas, (cx, cy - arm), (cx, cy + arm), color_marker, 2)

        # 2. 6-Ring Binder Hole Guides
        hole_x = mm_to_px(geometry.hole_x_center_mm, geometry.dpi)
        hole_r = mm_to_px(HOLE_RADIUS_MM, geometry.dpi)
        for y_mm in HOLE_Y_POSITIONS_MM:
            hy = mm_to_px(y_mm, geometry.dpi)
            # Circle boundary
            cv2.circle(canvas, (hole_x, hy), hole_r, color_marker, 2)
            # Center crosshair
            cv2.line(canvas, (hole_x - hole_r - 8, hy), (hole_x + hole_r + 8, hy), color_marker, 1)
            cv2.line(canvas, (hole_x, hy - hole_r - 8), (hole_x, hy + hole_r + 8), color_marker, 1)

        # 3. 21 Ruled Line Alignment Ticks
        for i in range(1, LINE_COUNT + 1):
            y_mm = geometry.get_ruled_line_y_mm(i)
            ly = mm_to_px(y_mm, geometry.dpi)
            # Draw tick on both left and right margins
            tick_len = mm_to_px(6.0, geometry.dpi)
            cv2.line(canvas, (mm_to_px(16.0, geometry.dpi), ly), (mm_to_px(16.0, geometry.dpi) + tick_len, ly), color_guide, 2)
            cv2.line(canvas, (mm_to_px(geometry.width_mm - 16.0, geometry.dpi) - tick_len, ly), (mm_to_px(geometry.width_mm - 16.0, geometry.dpi), ly), color_guide, 2)

        # 4. Calibration Scales (100 mm top ruler)
        ruler_y = mm_to_px(18.0, geometry.dpi)
        ruler_start_x = mm_to_px(24.0, geometry.dpi)
        ruler_end_x = mm_to_px(124.0, geometry.dpi)  # Exactly 100 mm
        cv2.line(canvas, (ruler_start_x, ruler_y), (ruler_end_x, ruler_y), color_marker, 2)
        # 10 mm ticks
        for mm_step in range(0, 110, 10):
            tx = mm_to_px(24.0 + mm_step, geometry.dpi)
            t_len = mm_to_px(3.0 if mm_step % 50 != 0 else 5.0, geometry.dpi)
            cv2.line(canvas, (tx, ruler_y - t_len), (tx, ruler_y + t_len), color_marker, 2)

        # 5. Descriptive text
        font = cv2.FONT_HERSHEY_SIMPLEX
        title = f"A5 CALIBRATION SHEET - CARA {geometry.face} (148x210 mm)"
        sub = "Regla de verificacion: 100 mm exactos | Escala de impresion: 100% (Tamano Real)"
        cv2.putText(canvas, title, (ruler_start_x, mm_to_px(13.0, geometry.dpi)), font, 0.7, color_marker, 2, cv2.LINE_AA)
        cv2.putText(canvas, sub, (ruler_start_x, mm_to_px(24.0, geometry.dpi)), font, 0.45, color_guide, 1, cv2.LINE_AA)

        return canvas

    @classmethod
    def save_calibration_assets(cls, output_dir: str) -> None:
        """Builds calibration PNG and PDF for both Cara A and Cara B."""
        os.makedirs(output_dir, exist_ok=True)
        for geom in [GEOMETRY_CARA_A, GEOMETRY_CARA_B]:
            canvas = cls.generate_sheet(geom)
            prefix = f"calibration_cara_{geom.face.lower()}"
            png_path = os.path.join(output_dir, f"{prefix}.png")
            pdf_path = os.path.join(output_dir, f"{prefix}.pdf")

            # Save PNG
            cv2.imwrite(png_path, cv2.cvtColor(canvas, cv2.COLOR_RGBA2BGRA))
            # Save PDF
            PDFBuilder.save_a5_pdf_from_rgba(canvas, pdf_path, geom.dpi)
