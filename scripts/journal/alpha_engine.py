"""
Alpha Engine: Computer Vision pipeline to extract pure graphite pencil strokes
with true transparency (zero background ink) for physical paper printing.
"""

from typing import Optional, Tuple
import cv2
import numpy as np


class AlphaEngine:
    """Transforms raw pencil sketches on solid/paper backgrounds into pure transparent RGBA assets."""

    @staticmethod
    def extract_graphite_strokes(
        image_path: str,
        graphite_color: Tuple[int, int, int] = (32, 30, 28),  # Deep charcoal graphite
        bg_threshold: float = 0.92,
        gamma: float = 1.35,
        kernel_size: int = 45,
        blur_size: int = 51,
        bottom_clean_y: Optional[int] = None,
        bottom_clean_center_x_range: Optional[Tuple[int, int]] = None,
    ) -> np.ndarray:
        """
        Extracts pencil strokes from an image and creates a pure RGBA image.

        Args:
            image_path: Path to the raw sketch image.
            graphite_color: RGB tuple for the pencil lead pigment.
            bg_threshold: Normalized intensity above which pixels are 100% transparent.
            gamma: Contrast curve exponent for pencil pressure (1.0 = linear, >1.0 = crisper).
            kernel_size: Kernel size for morphological background estimation.
            blur_size: Gaussian blur kernel size for smooth illumination field.
            bottom_clean_y: Optional Y coordinate below which text ghosts are removed.
            bottom_clean_center_x_range: Optional (min_x, max_x) to preserve in bottom zone (e.g. compass).

        Returns:
            np.ndarray: RGBA image with shape (H, W, 4) and uint8 dtype.
        """
        raw_bgr = cv2.imread(image_path)
        if raw_bgr is None:
            raise FileNotFoundError(f"Could not load image at {image_path}")

        gray = cv2.cvtColor(raw_bgr, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0

        # Step 1: Estimate uneven background illumination via morphological closing
        k = cv2.getStructuringElement(cv2.MORPH_RECT, (kernel_size, kernel_size))
        bg_estimate = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, k)
        bg_estimate = cv2.GaussianBlur(bg_estimate, (blur_size, blur_size), 0)

        # Avoid division by zero
        bg_estimate = np.maximum(bg_estimate, 0.05)

        # Step 2: Normalize image against local background
        normalized = np.clip(gray / bg_estimate, 0.0, 1.0)

        # Step 3: Compute soft alpha based on pencil stroke density
        # Inverted contrast: dark strokes have high delta
        stroke_density = np.maximum(0.0, bg_threshold - normalized) / bg_threshold
        # Apply gamma curve for natural pencil pressure feel
        alpha_channel = np.power(stroke_density, gamma) * 255.0
        alpha_channel = np.clip(alpha_channel, 0.0, 255.0).astype(np.uint8)

        # Step 4: Construct pure RGBA matrix with uniform graphite pigment
        h, w = gray.shape
        rgba = np.zeros((h, w, 4), dtype=np.uint8)
        rgba[:, :, 0] = graphite_color[0]  # R
        rgba[:, :, 1] = graphite_color[1]  # G
        rgba[:, :, 2] = graphite_color[2]  # B
        rgba[:, :, 3] = alpha_channel      # A

        # Step 5: Clean unwanted bottom text/hallucinations if requested
        if bottom_clean_y is not None and bottom_clean_y < h:
            if bottom_clean_center_x_range is not None:
                x_min, x_max = bottom_clean_center_x_range
                rgba[bottom_clean_y:, :x_min, 3] = 0
                rgba[bottom_clean_y:, x_max:, 3] = 0
            else:
                rgba[bottom_clean_y:, :, 3] = 0

        return rgba

    @staticmethod
    def save_rgba_png(rgba_img: np.ndarray, output_path: str) -> None:
        """Saves RGBA image to PNG format preserving full alpha channel."""
        # OpenCV expects BGRA for imwrite
        bgra = cv2.cvtColor(rgba_img, cv2.COLOR_RGBA2BGRA)
        cv2.imwrite(output_path, bgra, [cv2.IMWRITE_PNG_COMPRESSION, 9])
