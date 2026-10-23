"""
build_impresion_master.py:
Assembles print-ready duplex PDFs for all 18 sheets and the unified
complete 36-page master journal PDF in `journal/impresion/`, plus the Stage Path
bundle (sheets 19 to 26), which Silvia receives all together.
"""

import os
import pypdf

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
IMPRESION_DIR = os.path.join(PROJECT_ROOT, 'journal', 'impresion')
HOJAS_DIR = os.path.join(IMPRESION_DIR, 'hojas_doble_cara')

SHEETS = [
    (1, 'Hoja_01_Portada_y_Carta.pdf', 'page01/pdf/page01_front_A5.pdf', 'page01/pdf/page01_back_A5.pdf'),
    (2, 'Hoja_02_Alfabeto_Parte_I_y_II.pdf', 'page02/pdf/page02_front_A5.pdf', 'page02/pdf/page02_back_A5.pdf'),
    (3, 'Hoja_03_Alfabeto_Parte_III_y_IV.pdf', 'page03/pdf/page03_front_A5.pdf', 'page03/pdf/page03_back_A5.pdf'),
    (4, 'Hoja_04_Lore_Astrolabio_y_Juego_C1_Planisferio.pdf', 'page04/pdf/page04_front_A5.pdf', 'page04/pdf/page04_back_A5.pdf'),
    (5, 'Hoja_05_Anatomia_Astrolabio_y_Juego_C2_Zodiaco.pdf', 'page05/pdf/page05_front_A5.pdf', 'page05/pdf/page05_back_A5.pdf'),
    (6, 'Hoja_06_Calibracion_Medianoche_y_Juego_C3_Transito.pdf', 'page06/pdf/page06_front_A5.pdf', 'page06/pdf/page06_back_A5.pdf'),
    (7, 'Hoja_07_Juego_C4_Cifrado_y_Frontera_Desierto.pdf', 'page07/pdf/page07_front_A5.pdf', 'page07/pdf/page07_back_A5.pdf'),
    (8, 'Hoja_08_El_Gran_Silencio_y_Gran_Mapa_NO.pdf', 'page08/pdf/page08_front_A5.pdf', 'page08/pdf/page08_back_A5.pdf'),
    (9, 'Hoja_09_Gran_Mapa_NE_y_Juego_D1_Laberinto.pdf', 'page09/pdf/page09_front_A5.pdf', 'page09/pdf/page09_back_A5.pdf'),
    (10, 'Hoja_10_Juego_D2_Salar_Silice_y_Estudio_Estratos.pdf', 'page10/pdf/page10_front_A5.pdf', 'page10/pdf/page10_back_A5.pdf'),
    (11, 'Hoja_11_Gran_Mapa_SO_y_Juego_D3_Clepsidra.pdf', 'page11/pdf/page11_front_A5.pdf', 'page11/pdf/page11_back_A5.pdf'),
    (12, 'Hoja_12_Gran_Mapa_SE_y_Juego_D4_Estela_Polibio.pdf', 'page12/pdf/page12_front_A5.pdf', 'page12/pdf/page12_back_A5.pdf'),
    (13, 'Hoja_13_Puertas_Torre_II_y_Juego_D5_Monolito_Solar.pdf', 'page13/pdf/page13_front_A5.pdf', 'page13/pdf/page13_back_A5.pdf'),
    (14, 'Hoja_14_Cinco_Mojones_y_Juego_D6_Laberinto_Arenisca.pdf', 'page14/pdf/page14_front_A5.pdf', 'page14/pdf/page14_back_A5.pdf'),
    (15, 'Hoja_15_Juego_D7_Centinela_Mojon_IV_y_Zoom_Puente_Oeste.pdf', 'page15/pdf/page15_front_A5.pdf', 'page15/pdf/page15_back_A5.pdf'),
    (16, 'Hoja_16_Zoom_Puente_Este_y_Juego_D8_Altar_Solsticio.pdf', 'page16/pdf/page16_front_A5.pdf', 'page16/pdf/page16_back_A5.pdf'),
    (17, 'Hoja_17_Codice_Tormenta_y_Climax_Oraculo_Base.pdf', 'page17/pdf/page17_front_A5.pdf', 'page17/pdf/page17_back_A5.pdf'),
    (18, 'Hoja_18_Juego_D10_Horizonte_Oraculo_y_Transicion_Escenario.pdf', 'page18/pdf/page18_front_A5.pdf', 'page18/pdf/page18_back_A5.pdf'),
]

# The Stage Path (Tower III): sheets 19 to 26, delivered to Silvia all together in their own bundle.
STAGE_SHEETS = [
    (19, 'Hoja_19_Carta_Nunca_Enviada_y_Juego_S1_Puerta_Mascaras.pdf', 'page19/pdf/page19_front_A5.pdf', 'page19/pdf/page19_back_A5.pdf'),
    # back_rel None (a face not built yet) puts a blank A5 page in its place, so the duplex printing stays aligned
    (20, 'Hoja_20_Camera_Obscura_y_Whispering_Gallery.pdf', 'page20/pdf/page20_front_A5.pdf', 'page20/pdf/page20_back_A5.pdf'),
]
STAGE_TOTAL = 8


def build_stage_bundle() -> None:
    """Duplex PDFs for each Stage Path sheet and one bundle with every sheet built so far."""
    os.makedirs(HOJAS_DIR, exist_ok=True)
    bundle = pypdf.PdfWriter()
    for num, name, front_rel, back_rel in STAGE_SHEETS:
        sheet_writer = pypdf.PdfWriter()
        front = pypdf.PdfReader(os.path.join(PROJECT_ROOT, 'journal', front_rel)).pages[0]
        for writer in (sheet_writer, bundle):
            writer.add_page(front)
        if back_rel is None:
            w, h = float(front.mediabox.width), float(front.mediabox.height)
            for writer in (sheet_writer, bundle):
                writer.add_blank_page(w, h)
            print(f"  [OK] Sheet {num:02d}: {name}  (NOTE: face {num}B is pending, its back is a BLANK A5 page for now)")
        else:
            back = pypdf.PdfReader(os.path.join(PROJECT_ROOT, 'journal', back_rel)).pages[0]
            for writer in (sheet_writer, bundle):
                writer.add_page(back)
            print(f"  [OK] Sheet {num:02d}: {name}")
        with open(os.path.join(HOJAS_DIR, name), 'wb') as fh:
            sheet_writer.write(fh)
    bundle_path = os.path.join(IMPRESION_DIR, '01_STAGE_PATH_HOJAS_19_A_26_A5.pdf')
    with open(bundle_path, 'wb') as fh:
        bundle.write(fh)
    print(f"  -> Stage Path bundle ({len(STAGE_SHEETS)} of {STAGE_TOTAL} sheets): {bundle_path}")


def build_impresion_master() -> None:
    os.makedirs(HOJAS_DIR, exist_ok=True)
    master_writer = pypdf.PdfWriter()

    print("=== Assembling Duplex Sheets (18 Sheets / 36 Pages) ===")
    for num, name, front_rel, back_rel in SHEETS:
        front_path = os.path.join(PROJECT_ROOT, 'journal', front_rel)
        back_path = os.path.join(PROJECT_ROOT, 'journal', back_rel)

        r_front = pypdf.PdfReader(front_path)
        r_back = pypdf.PdfReader(back_path)

        sheet_writer = pypdf.PdfWriter()
        sheet_writer.add_page(r_front.pages[0])
        sheet_writer.add_page(r_back.pages[0])

        out_sheet_path = os.path.join(HOJAS_DIR, name)
        with open(out_sheet_path, 'wb') as fh:
            sheet_writer.write(fh)
        print(f"  [OK] Sheet {num:02d}: {name}")

        master_writer.add_page(r_front.pages[0])
        master_writer.add_page(r_back.pages[0])

    master_path = os.path.join(IMPRESION_DIR, '00_DIARIO_COMPLETO_36_PAGINAS_A5.pdf')
    with open(master_path, 'wb') as fh:
        master_writer.write(fh)
    print(f"  -> Generated Complete Master PDF: {master_path}")


if __name__ == '__main__':
    build_impresion_master()
    build_stage_bundle()
