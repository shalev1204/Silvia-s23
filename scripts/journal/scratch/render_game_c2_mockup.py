import os, sys
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from scripts.journal.geometry import CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX
from scripts.journal.build_page06_07 import render_pencil_text, blit_rgba, draw_sketchy_line, GRAPHITE_COLOR

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FONT_PATH = os.path.join(PROJECT_ROOT, 'assets', 'fonts', 'MarckScript.ttf')
PAPER_PATH = os.path.join(PROJECT_ROOT, 'journal', 'page01', 'real_paper_300dpi.png')

def render_zodiac_crossword(gc=GRAPHITE_COLOR):
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    
    # 1. Header (Cara B: Holes on RIGHT X > 1583, content in X in [180, 1540])
    t_title, b_t = render_pencil_text("The Zodiacal Engine", FONT_PATH, font_size=58, gc=gc, seed=101)
    blit_rgba(canvas, t_title, 200, 95 - b_t)
    
    t_sub, b_s = render_pencil_text("Harmonics of the Celestial Gears & The Seven Keynotes", FONT_PATH, font_size=25, gc=gc, seed=102)
    blit_rgba(canvas, t_sub, 202, 160 - b_s)
    
    draw_sketchy_line(canvas, (200, 185), (1520, 185), gc=gc, alpha_base=160, passes=2, seed=103)
    
    # 2. Decorative Gear & Astrolabe corner marginalia
    # Top right decorative gear teeth and dial
    cg_x, cg_y = 1380, 520
    cv2.circle(canvas, (cg_x, cg_y), 130, (*gc, 140), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cg_x, cg_y), 110, (*gc, 90), 1, cv2.LINE_AA)
    for a in range(0, 360, 20):
        rad = np.deg2rad(a)
        p1 = (int(round(cg_x + 130 * np.cos(rad))), int(round(cg_y + 130 * np.sin(rad))))
        p2 = (int(round(cg_x + 145 * np.cos(rad))), int(round(cg_y + 145 * np.sin(rad))))
        cv2.line(canvas, p1, p2, (*gc, 150), 2, cv2.LINE_AA)

    # 3. Crossword Grid Layout
    # 10 rows x 10 cols, cell_size = 62x62 px
    # Total grid: 620 x 620 px
    cell_sz = 62
    gx0 = 240
    gy0 = 260
    
    # Word definitions and positions:
    # Across:
    # 1. SOLSTICE (1, 1..8)
    # 2. ECLIPTIC (3, 2..9)
    # 3. ZENITH   (8, 3..8)
    # Down:
    # 4. MERIDIAN (0..7, 8)
    # 5. ALIDADE  (2..8, 4)
    # 6. POLARIS  (3..9, 6)
    
    active_cells = {}
    # Fill letters
    for i, ch in enumerate("SOLSTICE"): active_cells[(1, 1 + i)] = ch
    for i, ch in enumerate("ECLIPTIC"): active_cells[(3, 2 + i)] = ch
    for i, ch in enumerate("ZENITH"):   active_cells[(8, 3 + i)] = ch
    for i, ch in enumerate("MERIDIAN"): active_cells[(0 + i, 8)] = ch
    for i, ch in enumerate("ALIDADE"):  active_cells[(2 + i, 4)] = ch
    for i, ch in enumerate("POLARIS"):  active_cells[(3 + i, 6)] = ch
    
    # Numbers for clues:
    # (0, 8): 1 Down (MERIDIAN)
    # (1, 1): 2 Across (SOLSTICE)
    # (2, 4): 3 Down (ALIDADE)
    # (3, 2): 4 Across (ECLIPTIC)
    # (3, 6): 5 Down (POLARIS)
    # (8, 3): 6 Across (ZENITH)
    clue_numbers = {
        (0, 8): "1",
        (1, 1): "2",
        (2, 4): "3",
        (3, 2): "4",
        (3, 6): "5",
        (8, 3): "6"
    }
    
    # Key cells that reveal "E C L I P S E":
    # 1 -> E at (1, 8)
    # 2 -> C at (1, 7)
    # 3 -> L at (1, 3)
    # 4 -> I at (1, 6)
    # 5 -> P at (3, 6)
    # 6 -> S at (1, 1)
    # 7 -> E at (8, 4)
    key_circles = {
        (1, 8): "1",
        (1, 7): "2",
        (1, 3): "3",
        (1, 6): "4",
        (3, 6): "5",
        (1, 1): "6",
        (8, 4): "7"
    }
    
    # Draw empty crossword boxes for Silvia to write into!
    for (r, c), letter in active_cells.items():
        x1 = gx0 + c * cell_sz
        y1 = gy0 + r * cell_sz
        x2 = x1 + cell_sz
        y2 = y1 + cell_sz
        
        # Sketchy box border
        draw_sketchy_line(canvas, (x1, y1), (x2, y1), gc=gc, alpha_base=180, passes=2, seed=r*10+c)
        draw_sketchy_line(canvas, (x2, y1), (x2, y2), gc=gc, alpha_base=180, passes=2, seed=r*10+c+1)
        draw_sketchy_line(canvas, (x2, y2), (x1, y2), gc=gc, alpha_base=180, passes=2, seed=r*10+c+2)
        draw_sketchy_line(canvas, (x1, y2), (x1, y1), gc=gc, alpha_base=180, passes=2, seed=r*10+c+3)
        
        # If clue number, draw tiny number in top-left
        if (r, c) in clue_numbers:
            t_num, b_num = render_pencil_text(clue_numbers[(r, c)], FONT_PATH, font_size=18, gc=gc, seed=300+r*10+c)
            blit_rgba(canvas, t_num, x1 + 5, y1 + 3)
            
        # If key circle, draw double dashed circle inside
        if (r, c) in key_circles:
            mid_x, mid_y = (x1 + x2) // 2, (y1 + y2) // 2
            cv2.circle(canvas, (mid_x, mid_y), 24, (*gc, 140), 1, cv2.LINE_AA)
            t_kc, b_kc = render_pencil_text(key_circles[(r, c)], FONT_PATH, font_size=14, gc=gc, seed=500+r*10+c)
            blit_rgba(canvas, t_kc, x2 - 16, y2 - 18)

    # 4. Crossword Clues ($Y = 940 \dots 1980$)
    draw_sketchy_line(canvas, (200, 930), (1520, 930), gc=gc, alpha_base=140, passes=2, seed=601)
    
    # Left Column: Across Clues
    t_ac_hdr, b_ah = render_pencil_text("Across (The Horizontal Circles)", FONT_PATH, font_size=28, gc=gc, seed=602)
    blit_rgba(canvas, t_ac_hdr, 200, 980 - b_ah)
    
    across_clues = [
        ("2.", "The turning of the noon sun at its greatest celestial declination."),
        ("4.", "The great golden road traversed by the sun through the twelve houses."),
        ("6.", "The absolute peak of the sky, standing perpendicular above the observer.")
    ]
    
    for i, (num, txt) in enumerate(across_clues):
        y_pos = 1050 + i * 110
        t_n, b_n = render_pencil_text(num, FONT_PATH, font_size=26, gc=gc, seed=700+i)
        blit_rgba(canvas, t_n, 200, y_pos - b_n)
        
        # Multiline clue
        words_c = txt.split()
        l1 = " ".join(words_c[:6])
        l2 = " ".join(words_c[6:])
        t_l1, b_1 = render_pencil_text(l1, FONT_PATH, font_size=22, gc=gc, seed=710+i)
        blit_rgba(canvas, t_l1, 240, y_pos - b_1)
        if l2:
            t_l2, b_2 = render_pencil_text(l2, FONT_PATH, font_size=22, gc=gc, seed=720+i)
            blit_rgba(canvas, t_l2, 240, y_pos + 32 - b_2)

    # Right Column: Down Clues
    t_dn_hdr, b_dh = render_pencil_text("Down (The Vertical Planes)", FONT_PATH, font_size=28, gc=gc, seed=802)
    blit_rgba(canvas, t_dn_hdr, 880, 980 - b_dh)
    
    down_clues = [
        ("1.", "The great circle passing through the celestial poles and the noon sun."),
        ("3.", "The pivoted brass index rule that sights the altitudes of the stars."),
        ("5.", "The lodestar that never sets, holding watch over the northern axis.")
    ]
    
    for i, (num, txt) in enumerate(down_clues):
        y_pos = 1050 + i * 110
        t_n, b_n = render_pencil_text(num, FONT_PATH, font_size=26, gc=gc, seed=810+i)
        blit_rgba(canvas, t_n, 880, y_pos - b_n)
        
        words_c = txt.split()
        l1 = " ".join(words_c[:6])
        l2 = " ".join(words_c[6:])
        t_l1, b_1 = render_pencil_text(l1, FONT_PATH, font_size=22, gc=gc, seed=820+i)
        blit_rgba(canvas, t_l1, 920, y_pos - b_1)
        if l2:
            t_l2, b_2 = render_pencil_text(l2, FONT_PATH, font_size=22, gc=gc, seed=830+i)
            blit_rgba(canvas, t_l2, 920, y_pos + 32 - b_2)

    # 5. Bottom Deduction Box ($Y = 2050 \dots 2380$)
    draw_sketchy_line(canvas, (200, 2020), (1520, 2020), gc=gc, alpha_base=140, passes=2, seed=901)
    
    t_dec, b_dec = render_pencil_text("The Master Key (Assemble the seven numbered circles 1 to 7):", FONT_PATH, font_size=26, gc=gc, seed=902)
    blit_rgba(canvas, t_dec, 200, 2080 - b_dec)
    
    # 7 large dedicated boxes for Silvia to write the letters: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] [ 6 ] [ 7 ]
    box_w, box_h = 75, 75
    start_bx = 450
    by = 2140
    for idx in range(7):
        bx = start_bx + idx * (box_w + 35)
        # Box frame
        draw_sketchy_line(canvas, (bx, by), (bx + box_w, by), gc=gc, alpha_base=190, passes=2, seed=910+idx)
        draw_sketchy_line(canvas, (bx + box_w, by), (bx + box_w, by + box_h), gc=gc, alpha_base=190, passes=2, seed=911+idx)
        draw_sketchy_line(canvas, (bx + box_w, by + box_h), (bx, by + box_h), gc=gc, alpha_base=190, passes=2, seed=912+idx)
        draw_sketchy_line(canvas, (bx, by + box_h), (bx, by), gc=gc, alpha_base=190, passes=2, seed=913+idx)
        
        # Subscript number under box
        t_subn, b_sn = render_pencil_text(str(idx + 1), FONT_PATH, font_size=20, gc=gc, seed=920+idx)
        blit_rgba(canvas, t_subn, bx + box_w // 2 - t_subn.shape[1] // 2, by + box_h + 15)

    return canvas

canvas = render_zodiac_crossword()

bg_raw = cv2.imread(PAPER_PATH)
bg_face = cv2.flip(cv2.resize(bg_raw, (CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX)), 1)
fg = canvas[:, :, :3].astype(float)
al = (canvas[:, :, 3].astype(float) / 255.0)[:, :, np.newaxis]
mockup = (fg * al + bg_face.astype(float) * (1.0 - al)).astype(np.uint8)

out_mockup = os.path.join(PROJECT_ROOT, 'journal', 'constellation_games', 'game02_zodiac_crossword_mockup.jpg')
cv2.imwrite(out_mockup, mockup, [cv2.IMWRITE_JPEG_QUALITY, 95])
print("Saved game02_zodiac_crossword_mockup.jpg successfully!")
