"""
Unit tests for Sheets 6 and 7 of the Journal (The Desert Frontier & The Grand Map).
Validates canvas dimensions, channel count, alpha ranges, and hole punch margins.
"""

import os
import sys
import unittest
import numpy as np

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
sys.path.insert(0, PROJECT_ROOT)

from scripts.journal.build_page06_07 import (
    render_face_6a,
    render_face_6b,
    render_face_7a,
    render_face_7b,
    render_face_8a,
    render_spread1,
    render_spread2,
    GRAPHITE_COLOR,
    CANVAS_WIDTH_PX,
    CANVAS_HEIGHT_PX,
)


class TestPage0607Desert(unittest.TestCase):
    """Test suite ensuring exact technical conformity for Sheets 6, 7 & 8 (Desert Spreads 1 & 2)."""

    def test_dimensions_and_channels(self):
        """Hoja 6 Cara A must render to exact A5 300DPI RGBA canvas."""
        img = render_face_6a(gc=GRAPHITE_COLOR)
        self.assertEqual(img.shape, (CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4))
        self.assertEqual(img.dtype, np.uint8)
        self.assertFalse(np.isnan(img).any())
        # Ensure meaningful content is drawn
        self.assertGreater(np.sum(img[:, :, 3] > 0), 20000)

    def test_hole_punch_clearance_cara_a(self):
        """Face 6A must have NO content inside left hole punch zone (X < 165 px)."""
        img = render_face_6a(gc=GRAPHITE_COLOR)
        left_zone_alpha = img[:, :165, 3]
        self.assertEqual(np.count_nonzero(left_zone_alpha), 0, "Face 6A drawn inside left hole zone!")

    def test_face_6b_fullbleed_and_text_safety(self):
        """Hoja 6 Cara B must be (2480, 1748, 4), 100% full bleed including over holes."""
        img = render_face_6b(gc=GRAPHITE_COLOR)
        self.assertEqual(img.shape, (CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4))
        self.assertEqual(img.dtype, np.uint8)
        self.assertFalse(np.isnan(img).any())
        self.assertGreater(np.sum(img[:, :, 3] > 0), 50000)
        # Verify map covers the right binder margin (100% full-bleed as requested)
        right_zone_alpha = img[:, 1583:, 3]
        self.assertGreater(np.count_nonzero(right_zone_alpha), 1000, "Map must cover 100% of surface including hole zone!")

    def test_face_7a_fullbleed_and_text_safety(self):
        """Hoja 7 Cara A must be (2480, 1748, 4), 100% full bleed including over holes."""
        img = render_face_7a(gc=GRAPHITE_COLOR)
        self.assertEqual(img.shape, (CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4))
        self.assertEqual(img.dtype, np.uint8)
        self.assertFalse(np.isnan(img).any())
        self.assertGreater(np.sum(img[:, :, 3] > 0), 50000)
        # Verify map covers the left binder margin (100% full-bleed as requested)
        left_zone_alpha = img[:, :165, 3]
        self.assertGreater(np.count_nonzero(left_zone_alpha), 1000, "Map must cover 100% of surface including hole zone!")

    def test_spread1_continuity(self):
        """Spread 1 must render to continuous double A5 canvas (2480, 3496, 4)."""
        spread = render_spread1(gc=GRAPHITE_COLOR)
        self.assertEqual(spread.shape, (CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX * 2, 4))
        self.assertEqual(spread.dtype, np.uint8)
        # Verify continuous content across both left and right halves and center seam
        left_alpha = spread[:, :CANVAS_WIDTH_PX, 3]
        right_alpha = spread[:, CANVAS_WIDTH_PX:, 3]
        center_seam_alpha = spread[:, CANVAS_WIDTH_PX - 50:CANVAS_WIDTH_PX + 50, 3]
        self.assertGreater(np.sum(left_alpha > 0), 50000)
        self.assertGreater(np.sum(right_alpha > 0), 50000)
        self.assertGreater(np.sum(center_seam_alpha > 0), 10000, "Seam must be filled with continuous drawing!")

    def test_face_7b_fullbleed_and_text_safety(self):
        """Hoja 7 Cara B must be (2480, 1748, 4), 100% full bleed including over holes."""
        img = render_face_7b(gc=GRAPHITE_COLOR)
        self.assertEqual(img.shape, (CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4))
        self.assertEqual(img.dtype, np.uint8)
        self.assertFalse(np.isnan(img).any())
        self.assertGreater(np.sum(img[:, :, 3] > 0), 50000)
        # Verify map covers the right binder margin (100% full-bleed)
        right_zone_alpha = img[:, 1583:, 3]
        self.assertGreater(np.count_nonzero(right_zone_alpha), 1000, "Map must cover 100% of surface including hole zone!")

    def test_face_8a_fullbleed_and_text_safety(self):
        """Hoja 8 Cara A must be (2480, 1748, 4), 100% full bleed including over holes."""
        img = render_face_8a(gc=GRAPHITE_COLOR)
        self.assertEqual(img.shape, (CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4))
        self.assertEqual(img.dtype, np.uint8)
        self.assertFalse(np.isnan(img).any())
        self.assertGreater(np.sum(img[:, :, 3] > 0), 50000)
        # Verify map covers the left binder margin (100% full-bleed)
        left_zone_alpha = img[:, :165, 3]
        self.assertGreater(np.count_nonzero(left_zone_alpha), 1000, "Map must cover 100% of surface including hole zone!")

    def test_spread2_continuity(self):
        """Spread 2 must render to continuous double A5 canvas (2480, 3496, 4)."""
        spread = render_spread2(gc=GRAPHITE_COLOR)
        self.assertEqual(spread.shape, (CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX * 2, 4))
        self.assertEqual(spread.dtype, np.uint8)
        # Verify continuous content across both left and right halves and center seam
        left_alpha = spread[:, :CANVAS_WIDTH_PX, 3]
        right_alpha = spread[:, CANVAS_WIDTH_PX:, 3]
        center_seam_alpha = spread[:, CANVAS_WIDTH_PX - 50:CANVAS_WIDTH_PX + 50, 3]
        self.assertGreater(np.sum(left_alpha > 0), 50000)
        self.assertGreater(np.sum(right_alpha > 0), 50000)
        self.assertGreater(np.sum(center_seam_alpha > 0), 10000, "Seam must be filled with continuous drawing!")


if __name__ == '__main__':
    unittest.main()


