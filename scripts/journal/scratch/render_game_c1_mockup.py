import os, sys, random
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from scripts.journal.geometry import CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX
from scripts.journal.build_page06_07 import render_pencil_text, blit_rgba, draw_sketchy_line, GRAPHITE_COLOR

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FONT_PATH = os.path.join(PROJECT_ROOT, 'assets', 'fonts', 'MarckScript.ttf')
PAPER_PATH = os.path.join(PROJECT_ROOT, 'journal', 'page01', 'real_paper_300dpi.png')

def render_planisphere_game(gc=GRAPHITE_COLOR):
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    
    # 1. Header (Title & Subtitle) - Cara A (Holes on left X < 165, all content X >= 200)
    t_title, b_t = render_pencil_text("The Planisphere", FONT_PATH, font_size=58, gc=gc, seed=101)
    blit_rgba(canvas, t_title, 230, 95 - b_t)
    
    t_sub, b_s = render_pencil_text("Celestial Search & The Thirty-Four Star Stanzas", FONT_PATH, font_size=25, gc=gc, seed=102)
    blit_rgba(canvas, t_sub, 232, 160 - b_s)
    
    # Header divider line
    draw_sketchy_line(canvas, (230, 185), (1550, 185), gc=gc, alpha_base=160, passes=2, seed=103)
    
    # 2. Renaissance Planisphere Circular Framework
    # Center of planisphere: (930, 820)
    cx, cy = 930, 820
    r_outer = 560
    r_inner = 520
    
    # Draw double concentric circles
    cv2.circle(canvas, (cx, cy), r_outer, (*gc, 180), 2, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), r_inner, (*gc, 120), 1, cv2.LINE_AA)
    
    # Degree ticks around outer ring (every 10 degrees, with major ticks every 30)
    for deg in range(0, 360, 10):
        rad = np.deg2rad(deg)
        cos_a, sin_a = np.cos(rad), np.sin(rad)
        p1 = (int(round(cx + r_outer * cos_a)), int(round(cy + r_outer * sin_a)))
        tick_len = 16 if deg % 30 == 0 else 8
        p2 = (int(round(cx + (r_outer - tick_len) * cos_a)), int(round(cy + (r_outer - tick_len) * sin_a)))
        alpha = 190 if deg % 30 == 0 else 110
        cv2.line(canvas, p1, p2, (*gc, alpha), 1, cv2.LINE_AA)
        
        # Roman numerals at every 30 deg
        if deg % 30 == 0:
            num_idx = (deg // 30)
            romans = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"]
            lbl = romans[num_idx]
            t_rom, b_rom = render_pencil_text(lbl, FONT_PATH, font_size=18, gc=gc, seed=200+deg)
            # Position slightly inside outer ring
            rx = int(round(cx + (r_outer - 32) * cos_a - t_rom.shape[1] // 2))
            ry = int(round(cy + (r_outer - 32) * sin_a - t_rom.shape[0] // 2))
            blit_rgba(canvas, t_rom, rx, ry)

    # Corner quadrant arcs & fleurons
    draw_sketchy_line(canvas, (cx - r_outer - 25, cy), (cx - r_outer + 15, cy), gc=gc, alpha_base=130, passes=2, seed=301)
    draw_sketchy_line(canvas, (cx + r_outer - 15, cy), (cx + r_outer + 25, cy), gc=gc, alpha_base=130, passes=2, seed=302)
    draw_sketchy_line(canvas, (cx, cy - r_outer - 25), (cx, cy - r_outer + 15), gc=gc, alpha_base=130, passes=2, seed=303)
    draw_sketchy_line(canvas, (cx, cy + r_outer - 15), (cx, cy + r_outer + 25), gc=gc, alpha_base=130, passes=2, seed=304)

    # 3. Word Search Grid inside the Planisphere
    # 12x12 grid centered at (cx, cy)
    cell_w, cell_h = 58, 58
    grid_w = 12 * cell_w # 696 px
    grid_h = 12 * cell_h # 696 px
    gx0 = cx - grid_w // 2 # 930 - 348 = 582
    gy0 = cy - grid_h // 2 # 820 - 348 = 472
    
    # Solve deterministic grid
    words = ['POLARIS', 'CASSIOPEIA', 'ALTAIR', 'VEGA', 'ORION', 'ZENITH', 'ALIDADE', 'NADIR', 'SYZYGY', 'ECLIPSE']
    hidden_msg = 'THESKYREMEMBERSWHATTHEEARTHFORGETS'
    dirs = [(0, 1), (1, 0), (1, 1), (1, -1)]

    random.seed(0)
    grid = [['' for _ in range(12)] for _ in range(12)]
    is_word = [[False]*12 for _ in range(12)]

    for w in sorted(words, key=len, reverse=True):
        valid_pos = []
        for dr, dc in dirs:
            for r in range(12):
                for c in range(12):
                    er, ec = r + dr * (len(w) - 1), c + dc * (len(w) - 1)
                    if 0 <= er < 12 and 0 <= ec < 12:
                        ok = True
                        for i, ch in enumerate(w):
                            gr, gc_col = r + dr * i, c + dc * i
                            if grid[gr][gc_col] != '' and grid[gr][gc_col] != ch:
                                ok = False
                                break
                        if ok:
                            valid_pos.append((r, c, dr, dc))
        r, c, dr, dc = random.choice(valid_pos)
        for i, ch in enumerate(w):
            grid[r + dr * i][c + dc * i] = ch
            is_word[r + dr * i][c + dc * i] = True

    empty = [(r, c) for r in range(12) for c in range(12) if not is_word[r][c]]
    is_star = [[False]*12 for _ in range(12)]

    for i, ch in enumerate(hidden_msg):
        r, c = empty[i]
        grid[r][c] = ch
        is_star[r][c] = True

    filler = 'ASTROLUXCAELUM'
    for j, (r, c) in enumerate(empty[len(hidden_msg):]):
        grid[r][c] = filler[j % len(filler)]

    # Draw faint grid dots/crosses at intersections
    for r in range(13):
        for c in range(13):
            px, py = gx0 + c * cell_w, gy0 + r * cell_h
            # Small cross
            cv2.line(canvas, (px - 3, py), (px + 3, py), (*gc, 70), 1, cv2.LINE_AA)
            cv2.line(canvas, (px, py - 3), (px, py + 3), (*gc, 70), 1, cv2.LINE_AA)

    # Render Letters
    for r in range(12):
        for c in range(12):
            ch = grid[r][c]
            # Font size 28 px for grid letter
            t_ch, b_ch = render_pencil_text(ch, FONT_PATH, font_size=28, gc=gc, seed=400 + r * 12 + c)
            cx_cell = gx0 + c * cell_w + cell_w // 2
            cy_cell = gy0 + r * cell_h + cell_h // 2
            lx = cx_cell - t_ch.shape[1] // 2
            ly = cy_cell - t_ch.shape[0] // 2 - 2
            blit_rgba(canvas, t_ch, lx, ly)
            
            # If star letter, draw a delicate celestial dot/asterism below it
            if is_star[r][c]:
                dot_y = cy_cell + 16
                # Tiny 4-point star or dot
                cv2.circle(canvas, (cx_cell, dot_y), 2, (*gc, 180), -1, cv2.LINE_AA)
                cv2.line(canvas, (cx_cell - 4, dot_y), (cx_cell + 4, dot_y), (*gc, 130), 1, cv2.LINE_AA)
                cv2.line(canvas, (cx_cell, dot_y - 4), (cx_cell, dot_y + 4), (*gc, 130), 1, cv2.LINE_AA)

    # 4. Instructions & Word Bank ($Y = 1530 \dots 2150$)
    t_inst, b_in = render_pencil_text(
        "Find the ten celestial guides in the starfield. Read the 34 marked stars (.) row by row:",
        FONT_PATH, font_size=24, gc=gc, seed=501
    )
    blit_rgba(canvas, t_inst, 230, 1540 - b_in)
    
    # 2 Columns of words
    col1 = [
        ("POLARIS", "The steadfast northern pivot"),
        ("CASSIOPEIA", "The throne of the seated queen"),
        ("ALTAIR", "The soaring falcon of Aquila"),
        ("VEGA", "The pale sapphire of Lyra"),
        ("ORION", "The hunter of the winter meridian")
    ]
    col2 = [
        ("ZENITH", "The point of pure ascension"),
        ("ALIDADE", "The brass sighting rule"),
        ("NADIR", "The unseen depth beneath"),
        ("SYZYGY", "The triple celestial alignment"),
        ("ECLIPSE", "The union of sun and shadow")
    ]
    
    y_start = 1620
    row_spacing = 68
    
    for i, (w_name, w_desc) in enumerate(col1):
        y_pos = y_start + i * row_spacing
        # Star bullet
        cv2.circle(canvas, (240, y_pos - 6), 3, (*gc, 200), -1, cv2.LINE_AA)
        cv2.circle(canvas, (240, y_pos - 6), 6, (*gc, 120), 1, cv2.LINE_AA)
        
        t_nm, b_nm = render_pencil_text(w_name, FONT_PATH, font_size=28, gc=gc, seed=600 + i)
        blit_rgba(canvas, t_nm, 260, y_pos - b_nm)
        
        t_ds, b_ds = render_pencil_text(f"— {w_desc}", FONT_PATH, font_size=22, gc=gc, seed=700 + i)
        blit_rgba(canvas, t_ds, 260 + t_nm.shape[1] + 15, y_pos - b_ds)

    for i, (w_name, w_desc) in enumerate(col2):
        y_pos = y_start + i * row_spacing
        cv2.circle(canvas, (900, y_pos - 6), 3, (*gc, 200), -1, cv2.LINE_AA)
        cv2.circle(canvas, (900, y_pos - 6), 6, (*gc, 120), 1, cv2.LINE_AA)
        
        t_nm, b_nm = render_pencil_text(w_name, FONT_PATH, font_size=28, gc=gc, seed=800 + i)
        blit_rgba(canvas, t_nm, 920, y_pos - b_nm)
        
        t_ds, b_ds = render_pencil_text(f"— {w_desc}", FONT_PATH, font_size=22, gc=gc, seed=900 + i)
        blit_rgba(canvas, t_ds, 920 + t_nm.shape[1] + 15, y_pos - b_ds)

    # 5. Deduction Area ($Y = 2050 \dots 2380$)
    draw_sketchy_line(canvas, (230, 2010), (1550, 2010), gc=gc, alpha_base=140, passes=2, seed=950)
    
    t_ded, b_ded = render_pencil_text("The Archivist's Maxim (The 34 Secret Stars):", FONT_PATH, font_size=26, gc=gc, seed=951)
    blit_rgba(canvas, t_ded, 230, 2060 - b_ded)
    
    # 2 spacious writing deduction lines for Silvia
    # Line 1: "THE SKY REMEMBERS WHAT" (20 chars)
    # Line 2: "THE EARTH FORGETS" (14 chars)
    draw_sketchy_line(canvas, (230, 2180), (1550, 2180), gc=gc, alpha_base=180, passes=2, seed=952)
    t_bracket1, b_b1 = render_pencil_text("[  _ _ _    _ _ _    _ _ _ _ _ _ _ _ _    _ _ _ _  ]", FONT_PATH, font_size=24, gc=gc, seed=953)
    blit_rgba(canvas, t_bracket1, 230, 2160 - b_b1)
    
    draw_sketchy_line(canvas, (230, 2310), (1550, 2310), gc=gc, alpha_base=180, passes=2, seed=954)
    t_bracket2, b_b2 = render_pencil_text("[  _ _ _    _ _ _ _ _    _ _ _ _ _ _ _  ]", FONT_PATH, font_size=24, gc=gc, seed=955)
    blit_rgba(canvas, t_bracket2, 230, 2290 - b_b2)

    return canvas

canvas = render_planisphere_game()

# Composite onto paper
bg_raw = cv2.imread(PAPER_PATH)
bg_face = cv2.resize(bg_raw, (CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX))
fg = canvas[:, :, :3].astype(float)
al = (canvas[:, :, 3].astype(float) / 255.0)[:, :, np.newaxis]
mockup = (fg * al + bg_face.astype(float) * (1.0 - al)).astype(np.uint8)

out_mockup = os.path.join(PROJECT_ROOT, 'journal', 'constellation_games', 'game01_planisphere_mockup.jpg')
cv2.imwrite(out_mockup, mockup, [cv2.IMWRITE_JPEG_QUALITY, 95])
print("Saved game01_planisphere_mockup.jpg successfully!")
