"""
Mathematical and physical geometry definitions for A5 Journal pages.
Calibrated via computer vision on the physical leather-bound journal paper.
"""

from dataclasses import dataclass
from typing import List, Tuple

# Base Physical Dimensions (ISO 216 A5)
A5_WIDTH_MM: float = 148.0
A5_HEIGHT_MM: float = 210.0
DEFAULT_DPI: int = 300

# Conversion constants
MM_PER_INCH: float = 25.4
POINTS_PER_INCH: float = 72.0


def mm_to_px(mm: float, dpi: int = DEFAULT_DPI) -> int:
    """Convert millimeters to pixels at the specified DPI."""
    return round((mm / MM_PER_INCH) * dpi)


def px_to_mm(px: int, dpi: int = DEFAULT_DPI) -> float:
    """Convert pixels to millimeters at the specified DPI."""
    return (px / dpi) * MM_PER_INCH


def mm_to_pt(mm: float) -> float:
    """Convert millimeters to PostScript points (72 pt / inch)."""
    return (mm / MM_PER_INCH) * POINTS_PER_INCH


# Canvas sizes
CANVAS_WIDTH_PX: int = mm_to_px(A5_WIDTH_MM, DEFAULT_DPI)    # 1748 px
CANVAS_HEIGHT_PX: int = mm_to_px(A5_HEIGHT_MM, DEFAULT_DPI)  # 2480 px
CANVAS_WIDTH_PT: float = mm_to_pt(A5_WIDTH_MM)               # 419.528 pt
CANVAS_HEIGHT_PT: float = mm_to_pt(A5_HEIGHT_MM)             # 595.276 pt

# Physical Ruled Lines
LINE_COUNT: int = 21
HEADER_MARGIN_MM: float = 36.0
LINE_PITCH_MM: float = 8.2
BOTTOM_MARGIN_MM: float = 10.6

# 6-Ring Binder Holes Geometry
HOLE_DIAMETER_MM: float = 5.5
HOLE_RADIUS_MM: float = HOLE_DIAMETER_MM / 2.0
HOLE_MARGIN_FROM_EDGE_MM: float = 7.5

HOLE_Y_POSITIONS_MM: List[float] = [
    30.0, 49.0, 68.0,    # Upper trio
    138.0, 157.0, 176.0  # Lower trio
]


@dataclass(frozen=True)
class PageGeometry:
    """Geometry profile for a specific face (Cara A or Cara B)."""
    face: str  # 'A' (front, holes on left) or 'B' (back, holes on right)
    width_mm: float = A5_WIDTH_MM
    height_mm: float = A5_HEIGHT_MM
    dpi: int = DEFAULT_DPI

    @property
    def hole_x_center_mm(self) -> float:
        """Center X of the 6 binder holes."""
        if self.face == 'A':
            return HOLE_MARGIN_FROM_EDGE_MM
        else:
            return self.width_mm - HOLE_MARGIN_FROM_EDGE_MM

    @property
    def safe_content_box_mm(self) -> Tuple[float, float, float, float]:
        """
        Returns (x_min, y_min, x_max, y_max) in mm.
        Guarantees zero overlap with holes and paper borders.
        """
        y_min = 12.0
        y_max = self.height_mm - 10.0
        if self.face == 'A':
            # Holes on left (0 to 15mm)
            x_min = 16.0
            x_max = self.width_mm - 6.0  # 142.0 mm
        else:
            # Holes on right (133 to 148mm)
            x_min = 6.0
            x_max = self.width_mm - 16.0  # 132.0 mm
        return (x_min, y_min, x_max, y_max)

    def get_ruled_line_y_mm(self, line_index: int) -> float:
        """
        Get vertical Y coordinate of a ruled line (1-indexed: 1 to 21).
        Line 1 starts at HEADER_MARGIN_MM.
        """
        if not (1 <= line_index <= LINE_COUNT):
            raise ValueError(f"Line index must be between 1 and {LINE_COUNT}, got {line_index}")
        return HEADER_MARGIN_MM + (line_index - 1) * LINE_PITCH_MM

    def get_all_lines_y_mm(self) -> List[float]:
        """Returns all 21 ruled line Y positions in mm."""
        return [self.get_ruled_line_y_mm(i) for i in range(1, LINE_COUNT + 1)]


GEOMETRY_CARA_A = PageGeometry(face='A')
GEOMETRY_CARA_B = PageGeometry(face='B')
