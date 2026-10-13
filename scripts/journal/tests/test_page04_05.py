"""
Unit tests for Pages 4 and 5 of the Journal (The Astrolabe Codex).
Validates canvas dimensions, channel count, alpha ranges, and hole punch margins.
"""

import os
import sys
import unittest
import numpy as np

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
sys.path.insert(0, PROJECT_ROOT)

from scripts.journal.build_page04_05 import (
    render_face_4a,
    render_face_4b,
    render_face_5a,
    render_face_5b,
    GRAPHITE_COLOR,
    CANVAS_WIDTH_PX,
    CANVAS_HEIGHT_PX,
)


class TestPage0405Codex(unittest.TestCase):
    """Test suite ensuring exact technical conformity for Sheets 4 & 5."""

    def test_dimensions_and_channels(self):
        """All 4 faces must render to exact A5 300DPI RGBA canvas."""
        faces = [
            ("Face 4A", render_face_4a),
            ("Face 4B", render_face_4b),
            ("Face 5A", render_face_5a),
            ("Face 5B", render_face_5b),
        ]
        for name, renderer in faces:
            with self.subTest(face=name):
                img = renderer(gc=GRAPHITE_COLOR)
                self.assertEqual(img.shape, (CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4))
                self.assertEqual(img.dtype, np.uint8)
                self.assertFalse(np.isnan(img).any())
                # Ensure meaningful content is drawn
                self.assertGreater(np.sum(img[:, :, 3] > 0), 20000)

    def test_hole_punch_clearance_cara_a(self):
        """Face 4A and 5A must have NO content inside left hole punch zone (X < 165 px)."""
        for name, renderer in [("Face 4A", render_face_4a), ("Face 5A", render_face_5a)]:
            with self.subTest(face=name):
                img = renderer(gc=GRAPHITE_COLOR)
                left_zone_alpha = img[:, :165, 3]
                self.assertEqual(np.count_nonzero(left_zone_alpha), 0, f"{name} drawn inside left hole zone!")

    def test_hole_punch_clearance_cara_b(self):
        """Face 4B and 5B must have NO content inside right hole punch zone (X > 1583 px)."""
        for name, renderer in [("Face 4B", render_face_4b), ("Face 5B", render_face_5b)]:
            with self.subTest(face=name):
                img = renderer(gc=GRAPHITE_COLOR)
                right_zone_alpha = img[:, 1583:, 3]
                self.assertEqual(np.count_nonzero(right_zone_alpha), 0, f"{name} drawn inside right hole zone!")


if __name__ == '__main__':
    unittest.main()
