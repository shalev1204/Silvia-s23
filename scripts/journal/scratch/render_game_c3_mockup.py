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

def render_star_transit_game(gc=GRAPHITE_COLOR):
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    
    # 1. Header (Cara A: Holes on LEFT X < 165, all content X >= 200)
    t_title, b_t = render_pencil_text("The Midnight Transit", FONT_PATH, font_size=58, gc=gc, seed=101)
    blit_rgba(canvas, t_title, 230, 95 - b_t)
    
    t_sub, b_s = render_pencil_text("Geometric Triangulation Across Light-Years & Ephemeris", FONT_PATH, font_size=25, gc=gc, seed=102)
    blit_rgba(canvas, t_sub, 232, 160 - b_s)
    
    draw_sketchy_line(canvas, (230, 185), (1550, 185), gc=gc, alpha_base=160, passes=2, seed=103)
    
    # 2. Nocturnal Starfield Frame ($Y = 220 \dots 1400$)
    # Bounded rectangular chart with decorative corner brackets
    fx1, fy1, fx2, fy2 = 230, 220, 1550, 1380
    draw_sketchy_line(canvas, (fx1, fy1), (fx2, fy1), gc=gc, alpha_base=180, passes=2, seed=201)
    draw_sketchy_line(canvas, (fx2, fy1), (fx2, fy2), gc=gc, alpha_base=180, passes=2, seed=202)
    draw_sketchy_line(canvas, (fx2, fy2), (fx1, fy2), gc=gc, alpha_base=180, passes=2, seed=203)
    draw_sketchy_line(canvas, (fx1, fy2), (fx1, fy1), gc=gc, alpha_base=180, passes=2, seed=204)
    
    # Coordinate grid ticks along the frame
    for x in range(fx1 + 100, fx2, 120):
        cv2.line(canvas, (x, fy1), (x, fy1 + 8), (*gc, 140), 1, cv2.LINE_AA)
        cv2.line(canvas, (x, fy2), (x, fy2 - 8), (*gc, 140), 1, cv2.LINE_AA)
    for y in range(fy1 + 100, fy2, 120):
        cv2.line(canvas, (fx1, y), (fx1 + 8, y), (*gc, 140), 1, cv2.LINE_AA)
        cv2.line(canvas, (fx2, y), (fx2 - 8, y), (*gc, 140), 1, cv2.LINE_AA)

    # 12 Navigation Stars with coordinates inside the frame
    stars = [
        ("Achernar", "alpha-Eri", 139, (380, 1180), 6),
        ("Canopus", "alpha-Car", 310, (520, 820), 7),
        ("Sirius", "alpha-CMa", 9, (820, 1020), 8),
        ("Rigel", "beta-Ori", 860, (1320, 1140), 7),
        ("Bellatrix", "gamma-Ori", 250, (1420, 720), 5),
        ("Betelgeuse", "alpha-Ori", 550, (1260, 480), 8),
        ("Aldebaran", "alpha-Tau", 65, (980, 420), 7),
        ("Capella", "alpha-Aur", 43, (720, 360), 6),
        ("Polaris", "alpha-UMi", 433, (890, 700), 7),
        ("Vega", "alpha-Lyr", 25, (440, 440), 7),
        ("Arcturus", "alpha-Boo", 37, (1380, 320), 6),
        ("Spica", "alpha-Vir", 250, (320, 680), 5),
    ]

    # Draw stars, glow rings, names and distance labels
    for name, bay, dist, (sx, sy), rad in stars:
        # Star nucleus & glow
        cv2.circle(canvas, (sx, sy), rad, (*gc, 230), -1, cv2.LINE_AA)
        cv2.circle(canvas, (sx, sy), rad + 4, (*gc, 130), 1, cv2.LINE_AA)
        cv2.circle(canvas, (sx, sy), rad + 9, (*gc, 70), 1, cv2.LINE_AA)
        # Cross spikes
        cv2.line(canvas, (sx - rad - 6, sy), (sx + rad + 6, sy), (*gc, 160), 1, cv2.LINE_AA)
        cv2.line(canvas, (sx, sy - rad - 6), (sx, sy + rad + 6), (*gc, 160), 1, cv2.LINE_AA)
        
        # Label: Name (size 22) + Distance in ly (size 18)
        t_nm, b_nm = render_pencil_text(f"{name} ({dist} ly)", FONT_PATH, font_size=20, gc=gc, seed=300+dist)
        blit_rgba(canvas, t_nm, sx + rad + 8, sy - b_nm // 2)

    # 3. Transits & Mathematical Navigation Clues ($Y = 1420 \dots 2000$)
    t_rule_hdr, b_rh = render_pencil_text("The Six Chords of Distant Light (Trace with straight edge):", FONT_PATH, font_size=26, gc=gc, seed=401)
    blit_rgba(canvas, t_rule_hdr, 230, 1440 - b_rh)
    
    clues = [
        ("I.", "Depart from Achernar (139 ly). Sights the southern pivot."),
        ("II.", "Draw to the blue supergiant whose distance is exactly 139 + 721 ly [= 860 ly]."),
        ("III.", "Traverse north-northwest to the red giant where light left 860 - 310 years ago [= 550 ly]."),
        ("IV.", "Cast the third chord across the heavens to the orange eye at 550 - 485 ly [= 65 ly]."),
        ("V.", "Ascend along the meridian to the northern beacon of Capella [43 ly]."),
        ("VI.", "Close the stellar quadrilateral by plunging to the true northern axle: Polaris [433 ly].")
    ]
    
    for i, (num, txt) in enumerate(clues):
        y_pos = 1500 + i * 75
        t_n, b_n = render_pencil_text(num, FONT_PATH, font_size=24, gc=gc, seed=500+i)
        blit_rgba(canvas, t_n, 230, y_pos - b_n)
        
        t_tx, b_tx = render_pencil_text(txt, FONT_PATH, font_size=21, gc=gc, seed=510+i)
        blit_rgba(canvas, t_tx, 275, y_pos - b_tx)

    # 4. Observation & Deduction Box ($Y = 2020 \dots 2380$)
    draw_sketchy_line(canvas, (230, 1990), (1550, 1990), gc=gc, alpha_base=140, passes=2, seed=601)
    
    t_concl, b_cc = render_pencil_text("Observation Log & The Hidden Asterism:", FONT_PATH, font_size=26, gc=gc, seed=602)
    blit_rgba(canvas, t_concl, 230, 2040 - b_cc)
    
    notes_lines = [
        "1. Sum of the Six Stellar Chords:   139 + 860 + 550 + 65 + 43 + 433 = [ ____________ ] light-years.",
        "2. The geometric shape revealed within the quadrilateral: [ ___________________________________ ].",
        "3. Sighting angle of the main diagonal (Achernar to Polaris): Bearing [ _______ ] True North."
    ]
    
    for i, n_txt in enumerate(notes_lines):
        y_pos = 2120 + i * 85
        t_nl, b_nl = render_pencil_text(n_txt, FONT_PATH, font_size=22, gc=gc, seed=700+i)
        blit_rgba(canvas, t_nl, 230, y_pos - b_nl)
        draw_sketchy_line(canvas, (230, y_pos + 15), (1550, y_pos + 15), gc=gc, alpha_base=120, passes=1, seed=710+i)

    return canvas

canvas = render_star_transit_game()

bg_raw = cv2.imread(PAPER_PATH)
bg_face = cv2.resize(bg_raw, (CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX))
fg = canvas[:, :, :3].astype(float)
al = (canvas[:, :, 3].astype(float) / 255.0)[:, :, np.newaxis]
mockup = (fg * al + bg_face.astype(float) * (1.0 - al)).astype(np.uint8)

out_mockup = os.path.join(PROJECT_ROOT, 'journal', 'constellation_games', 'game03_star_transit_mockup.jpg')
cv2.imwrite(out_mockup, mockup, [cv2.IMWRITE_JPEG_QUALITY, 95])
print("Saved game03_star_transit_mockup.jpg successfully!")
