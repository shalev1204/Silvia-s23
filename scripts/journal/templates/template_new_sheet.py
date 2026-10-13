#!/usr/bin/env python3
"""
=============================================================================
THE ECLIPSE ORDER · JOURNAL PRODUCTION BOILERPLATE (A5 DUPLEX SHEET)
=============================================================================
Plantilla base oficial para generar una nueva hoja física (doble cara)
del diario manuscrito de Silvia (148 x 210 mm @ 300 DPI).

Instrucciones de uso:
1. Copie este archivo a scripts/journal/build_pageXX.py (o renómbrelo).
2. Configure SHEET_NUMBER, SHEET_TITLE_A, SHEET_TITLE_B y las funciones de renderizado.
3. Ejecute: python3 scripts/journal/build_pageXX.py

Invariantes obligatorios del troquelado de 6 anillas:
- Cara A (Anverso): 0 píxeles no transparentes en X < 165 px.
- Cara B (Reverso): 0 píxeles no transparentes en X > 1583 px.
- Separación texto-dibujo: Mínimo 40-80 px.
- Jerarquía tipográfica: Títulos 62-66px, cuerpo 35-38px, notas 28-33px.
=============================================================================
"""

import os
import sys
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Ubicación raíz del proyecto
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from scripts.journal.geometry import (
    CANVAS_WIDTH_PX,
    CANVAS_HEIGHT_PX,
    GEOMETRY_CARA_A,
    GEOMETRY_CARA_B,
    mm_to_px,
)
from scripts.journal.pdf_builder import PDFBuilder
from scripts.journal.composer import PageComposer
from scripts.journal.alpha_engine import AlphaEngine

# Parámetros Globales
GRAPHITE_COLOR = (42, 38, 34)  # Color canónico de grafito puro (RGB)
REAL_PAPER_PATH = os.path.join(PROJECT_ROOT, "journal", "page01", "real_paper_300dpi.png")
CHANCERY_FONT_PATH = "/System/Library/Fonts/Supplemental/Apple Chancery.ttf"

# Configuración de la Hoja (Modificar para cada hoja nueva)
SHEET_NUMBER = 19
SHEET_NAME = f"page{SHEET_NUMBER:02d}"
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "journal", SHEET_NAME)


# ---------------------------------------------------------------------------
# RENDERIZADORES DE CARA A Y CARA B
# ---------------------------------------------------------------------------

def render_face_a(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """
    Renderiza la Cara A (Anverso / Página Impar).
    Margen de anillas a la IZQUIERDA (X < 165 px debe tener 0 píxeles).
    """
    print(f"  -> Renderizando Hoja {SHEET_NUMBER} · Cara A...")
    # Crear lienzo transparente RGBA (2480 alto x 1748 ancho x 4 canales)
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. Título principal (Apple Chancery, 62-66 px)
    pil_canvas = Image.fromarray(canvas)
    draw = ImageDraw.Draw(pil_canvas)
    font_title = ImageFont.truetype(CHANCERY_FONT_PATH, 64) if os.path.exists(CHANCERY_FONT_PATH) else ImageFont.load_default()
    
    title_text = "The Stage Sanctuary"
    # Área segura Cara A: X entre 185 y 1650 px
    draw.text((220, 180), title_text, fill=(*gc, 240), font=font_title)
    
    # 2. Línea decorativa sutil de grafito bajo el título
    canvas = np.array(pil_canvas)
    cv2.line(canvas, (220, 260), (1450, 260), (*gc, 180), 2, cv2.LINE_AA)

    # 3. Párrafo narrativo del Cartógrafo (36 px)
    pil_canvas = Image.fromarray(canvas)
    draw = ImageDraw.Draw(pil_canvas)
    font_body = ImageFont.truetype(CHANCERY_FONT_PATH, 36) if os.path.exists(CHANCERY_FONT_PATH) else ImageFont.load_default()
    
    narrative_lines = [
        "Behind the red curtains of stone, the light reflects upon seven bronze mirrors.",
        "Silvia, take the sighting rule: what seems inverted is merely waiting to be aligned.",
        "The third tower does not rise toward the stars; it gathers their echoes."
    ]
    y_text = 330
    for line in narrative_lines:
        draw.text((220, y_text), line, fill=(*gc, 230), font=font_body)
        y_text += 55

    canvas = np.array(pil_canvas)

    # 4. Inserción de ilustración de arte limpia (si existe)
    # asset_path = os.path.join(OUTPUT_DIR, "assets", "stage_illustration_alpha.png")
    # if os.path.exists(asset_path):
    #     art = cv2.imread(asset_path, cv2.IMREAD_UNCHANGED)
    #     canvas = AlphaEngine.composite_rgba_at(canvas, art, x=300, y=700)

    return canvas


def render_face_b(gc: tuple = GRAPHITE_COLOR) -> np.ndarray:
    """
    Renderiza la Cara B (Reverso / Página Par).
    Margen de anillas a la DERECHA (X > 1583 px debe tener 0 píxeles).
    """
    print(f"  -> Renderizando Hoja {SHEET_NUMBER} · Cara B...")
    # Crear lienzo transparente RGBA
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)

    # 1. Título del Enigma o Tabla de Observación
    pil_canvas = Image.fromarray(canvas)
    draw = ImageDraw.Draw(pil_canvas)
    font_title = ImageFont.truetype(CHANCERY_FONT_PATH, 62) if os.path.exists(CHANCERY_FONT_PATH) else ImageFont.load_default()
    
    title_text = "The Mirror Transit"
    # Área segura Cara B: X entre 120 y 1560 px
    draw.text((160, 180), title_text, fill=(*gc, 240), font=font_title)

    canvas = np.array(pil_canvas)
    cv2.line(canvas, (160, 260), (1400, 260), (*gc, 180), 2, cv2.LINE_AA)

    # 2. Pautas o Cuadrícula interactiva para que Silvia resuelva
    pil_canvas = Image.fromarray(canvas)
    draw = ImageDraw.Draw(pil_canvas)
    font_notes = ImageFont.truetype(CHANCERY_FONT_PATH, 30) if os.path.exists(CHANCERY_FONT_PATH) else ImageFont.load_default()
    draw.text((160, 310), "Field Notes & Celestial Alignment Observations:", fill=(*gc, 210), font=font_notes)
    
    canvas = np.array(pil_canvas)

    # Dibujar 8 líneas pautadas de grafito sutil
    y_rule = 400
    for _ in range(8):
        cv2.line(canvas, (160, y_rule), (1520, y_rule), (*gc, 75), 1, cv2.LINE_AA)
        y_rule += 70

    return canvas


# ---------------------------------------------------------------------------
# PIPELINE DE CONSTRUCCIÓN Y VERIFICACIÓN
# ---------------------------------------------------------------------------

def build_sheet(sheet_dir: str = OUTPUT_DIR) -> None:
    """Ejecuta el pipeline completo de producción para la hoja."""
    pdf_dir = os.path.join(sheet_dir, "pdf")
    mockups_dir = os.path.join(sheet_dir, "mockups")
    os.makedirs(pdf_dir, exist_ok=True)
    os.makedirs(mockups_dir, exist_ok=True)

    # Cargar fondo de papel real si está disponible
    bg_raw = None
    if os.path.exists(REAL_PAPER_PATH):
        bg_raw = cv2.imread(REAL_PAPER_PATH)
        if bg_raw is not None:
            bg_raw = cv2.resize(bg_raw, (CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX))

    faces = [
        ("Cara A (Anverso)", render_face_a, f"{SHEET_NAME}_front", False),
        ("Cara B (Reverso)", render_face_b, f"{SHEET_NAME}_back", True),
    ]

    for label, renderer, stem, is_back in faces:
        print(f"\nProcesando {label}...")
        canvas = renderer(gc=GRAPHITE_COLOR)

        # 1. VERIFICACIÓN Y CLAMPING ESTRICTO DE TROQUELADO
        if is_back:
            # Cara B: anillas a la derecha (X > 1583)
            right_zone = canvas[:, 1583:, 3]
            violation = np.count_nonzero(right_zone)
            if violation > 0:
                print(f"  [AVISO] {violation} px detectados en zona de troquelado DERECHA (X > 1583). Aplicando máscara.")
                canvas[:, 1583:, 3] = 0
            else:
                print("  [OK] Zona de troquelado derecha (X > 1583): 0 píxeles.")
        else:
            # Cara A: anillas a la izquierda (X < 165)
            left_zone = canvas[:, :165, 3]
            violation = np.count_nonzero(left_zone)
            if violation > 0:
                print(f"  [AVISO] {violation} px detectados en zona de troquelado IZQUIERDA (X < 165). Aplicando máscara.")
                canvas[:, :165, 3] = 0
            else:
                print("  [OK] Zona de troquelado izquierda (X < 165): 0 píxeles.")

        # 2. EXPORTAR PDF VECTORIAL 1:1 A5 (300 DPI)
        pdf_path = os.path.join(pdf_dir, f"{stem}_A5.pdf")
        PDFBuilder.save_a5_pdf_from_rgba(canvas, pdf_path, dpi=300)
        print(f"  -> Guardado PDF: {pdf_path}")

        # 3. GENERAR MOCKUP FOTORREALISTA SOBRE PAPEL REAL
        if bg_raw is not None:
            bg_face = cv2.flip(bg_raw, 1) if is_back else bg_raw.copy()
            fg_rgb = canvas[:, :, :3].astype(np.float32)
            alpha = (canvas[:, :, 3].astype(np.float32) / 255.0)[:, :, np.newaxis]
            blended = (fg_rgb * alpha + bg_face.astype(np.float32) * (1.0 - alpha)).astype(np.uint8)

            mockup_path = os.path.join(mockups_dir, f"{stem}_real_paper_mockup.jpg")
            cv2.imwrite(mockup_path, blended, [cv2.IMWRITE_JPEG_QUALITY, 96])
            print(f"  -> Guardado Mockup: {mockup_path}")

    print(f"\n=== Hoja {SHEET_NUMBER} producida con éxito en: {sheet_dir} ===")


if __name__ == "__main__":
    build_sheet()
