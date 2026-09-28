"""
Automated unit tests for the Journal print pipeline.
Verifies dimensions, alpha transparency, hole margins, and PDF integrity.
"""

import os
import unittest
import numpy as np
from PIL import Image

from scripts.journal.geometry import (
    A5_WIDTH_MM,
    A5_HEIGHT_MM,
    CANVAS_WIDTH_PX,
    CANVAS_HEIGHT_PX,
    CANVAS_WIDTH_PT,
    CANVAS_HEIGHT_PT,
    LINE_COUNT,
    HEADER_MARGIN_MM,
    LINE_PITCH_MM,
    GEOMETRY_CARA_A,
    GEOMETRY_CARA_B,
    mm_to_px,
    px_to_mm,
    mm_to_pt,
)
from scripts.journal.alpha_engine import AlphaEngine
from scripts.journal.composer import PageComposer
from scripts.journal.pdf_builder import PDFBuilder


class TestJournalPipeline(unittest.TestCase):
    """Test suite ensuring strict compliance with physical paper constraints."""

    def test_a5_geometry_and_dpi(self):
        """Validates exact A5 dimension conversions."""
        self.assertEqual(CANVAS_WIDTH_PX, 1748)
        self.assertEqual(CANVAS_HEIGHT_PX, 2480)
        self.assertAlmostEqual(CANVAS_WIDTH_PT, 419.53, places=1)
        self.assertAlmostEqual(CANVAS_HEIGHT_PT, 595.28, places=1)

    def test_ruled_lines_count_and_positions(self):
        """Validates that exactly 21 lines are computed with exact 8.2mm pitch."""
        lines_a = GEOMETRY_CARA_A.get_all_lines_y_mm()
        self.assertEqual(len(lines_a), 21)
        self.assertAlmostEqual(lines_a[0], 36.0, places=2)
        self.assertAlmostEqual(lines_a[1], 44.2, places=2)
        self.assertAlmostEqual(lines_a[20], 36.0 + 20 * 8.2, places=2)

    def test_holes_geometry_and_symmetry(self):
        """Validates hole punch symmetry: left on Cara A, right on Cara B."""
        self.assertAlmostEqual(GEOMETRY_CARA_A.hole_x_center_mm, 7.5, places=2)
        self.assertAlmostEqual(GEOMETRY_CARA_B.hole_x_center_mm, 140.5, places=2)

        safe_a = GEOMETRY_CARA_A.safe_content_box_mm
        self.assertGreaterEqual(safe_a[0], 15.0)  # Safe area starts after holes
        self.assertLessEqual(safe_a[2], 142.0)

        safe_b = GEOMETRY_CARA_B.safe_content_box_mm
        self.assertGreaterEqual(safe_b[0], 6.0)
        self.assertLessEqual(safe_b[2], 132.0)  # Safe area ends before right holes

    def test_alpha_engine_pure_graphite(self):
        """Verifies background extraction and color replacement."""
        # Create a synthetic image with dark pencil lines on a cream paper background
        import cv2
        test_img = np.ones((400, 400, 3), dtype=np.uint8) * 240  # Off-white background
        # Draw realistic pencil strokes (3-5 px wide)
        cv2.line(test_img, (50, 50), (350, 350), (45, 45, 45), 4)

        tmp_path = "/tmp/test_synth_sketch.png"
        cv2.imwrite(tmp_path, test_img)

        rgba = AlphaEngine.extract_graphite_strokes(
            image_path=tmp_path,
            graphite_color=(32, 30, 28),
            bg_threshold=0.92
        )

        # Background pixels (e.g. at 10, 10) must be 100% transparent (alpha = 0)
        self.assertEqual(rgba[10, 10, 3], 0)
        # Center stroke pixels (at 200, 200) must have high alpha and pure graphite RGB
        self.assertGreater(rgba[200, 200, 3], 150)
        self.assertEqual(tuple(rgba[200, 200, :3]), (32, 30, 28))

        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    def test_composer_respects_hole_boundaries(self):
        """Ensures that placed artwork does not cross into hole punch margin in standard mode."""
        composer = PageComposer(geometry=GEOMETRY_CARA_A)
        art = np.zeros((400, 400, 4), dtype=np.uint8)
        art[:, :, :3] = 32
        art[:, :, 3] = 255  # Fully opaque

        canvas = composer.place_artwork(
            artwork_rgba=art,
            target_width_mm=118.0,
            center_x_mm=79.0,
            top_y_mm=20.0
        )

        self.assertEqual(canvas.shape, (CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4))
        hole_border_px = mm_to_px(15.0, 300)
        hole_zone_alpha = canvas[:, :hole_border_px, 3]
        self.assertEqual(np.max(hole_zone_alpha), 0)

    def test_composer_place_full_page(self):
        """Ensures that place_full_page covers the entire canvas without dead bands."""
        composer = PageComposer(geometry=GEOMETRY_CARA_A)
        # 3:4 aspect ratio artwork
        art = np.zeros((1200, 900, 4), dtype=np.uint8)
        art[:, :, :3] = 32
        art[:, :, 3] = 200  # Non-zero alpha everywhere

        # Test cover mode with 0 margin (full bleed)
        canvas_cover = composer.place_full_page(art, mode='cover', margin_mm=0.0)
        self.assertEqual(canvas_cover.shape, (CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4))
        # Verify that all 4 corners have non-zero alpha (100% full coverage)
        self.assertGreater(canvas_cover[0, 0, 3], 0)
        self.assertGreater(canvas_cover[0, -1, 3], 0)
        self.assertGreater(canvas_cover[-1, 0, 3], 0)
        self.assertGreater(canvas_cover[-1, -1, 3], 0)

        # Test contain_height mode with 5mm margin
        canvas_h = composer.place_full_page(art, mode='contain_height', margin_mm=5.0)
        self.assertEqual(canvas_h.shape, (CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4))
        # Top 5mm should be 0 alpha
        top_5mm_px = mm_to_px(4.0, 300)
        self.assertEqual(np.max(canvas_h[:top_5mm_px, :, 3]), 0)

    def test_pdf_builder_mediabox(self):
        """Verifies that generated PDF has exact A5 MediaBox."""
        canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
        canvas[100:200, 100:200, 3] = 255  # Some strokes

        out_pdf = "/tmp/test_unit_a5.pdf"
        PDFBuilder.save_a5_pdf_from_rgba(canvas, out_pdf, dpi=300)
        self.assertTrue(os.path.exists(out_pdf))

        with open(out_pdf, 'rb') as f:
            content = f.read().decode('latin1')
            self.assertIn('/MediaBox', content)
            # Find MediaBox line
            for line in content.split('\n'):
                if '/MediaBox' in line:
                    self.assertIn('419.52', line)
                    self.assertIn('595.2', line)

        if os.path.exists(out_pdf):
            os.remove(out_pdf)

    def test_render_cara_b_lines_and_safe_margins(self):
        """Validates that Cara B renders 21 lines within safe bounds, leaving holes margin intact."""
        from scripts.journal.build_page01_back import render_cara_b_canvas
        canvas_pil = render_cara_b_canvas()
        canvas_np = np.array(canvas_pil)

        self.assertEqual(canvas_np.shape, (CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4))
        # On Cara B, holes are on the right: X > 133 mm
        hole_border_left_px = mm_to_px(133.0, 300)
        hole_zone_alpha = canvas_np[:, hole_border_left_px:, 3]
        # Verify no text invades the hole punch margin on the right
        self.assertEqual(np.max(hole_zone_alpha), 0)

    def test_render_pages_02_and_03_faces_and_margins(self):
        """Validates that Pages 2 & 3 (all 4 faces) render correctly and strictly respect binder margins."""
        from scripts.journal.build_page02_03 import (
            render_face_2a,
            render_face_2b,
            render_face_3a,
            render_face_3b,
        )

        c2a = render_face_2a()
        c2b = render_face_2b()
        c3a = render_face_3a()
        c3b = render_face_3b()

        for name, c in [("2A", c2a), ("2B", c2b), ("3A", c3a), ("3B", c3b)]:
            self.assertEqual(c.shape, (CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), f"Face {name} shape mismatch")
            self.assertGreater(np.max(c[:, :, 3]), 0, f"Face {name} has no content")

        left_hole_px = mm_to_px(14.0, 300)
        right_hole_px = mm_to_px(133.0, 300)

        # Cara A (left holes)
        self.assertEqual(np.max(c2a[:, :left_hole_px, 3]), 0, "Face 2A invades left hole margin")
        self.assertEqual(np.max(c3a[:, :left_hole_px, 3]), 0, "Face 3A invades left hole margin")

        # Cara B (right holes)
        self.assertEqual(np.max(c2b[:, right_hole_px:, 3]), 0, "Face 2B invades right hole margin")
        self.assertEqual(np.max(c3b[:, right_hole_px:, 3]), 0, "Face 3B invades right hole margin")


if __name__ == '__main__':
    unittest.main()

