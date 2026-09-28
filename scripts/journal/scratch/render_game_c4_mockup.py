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

def render_coordinate_cipher(gc=GRAPHITE_COLOR):
    canvas = np.zeros((CANVAS_HEIGHT_PX, CANVAS_WIDTH_PX, 4), dtype=np.uint8)
    
    # 1. Header (Cara B: Holes on RIGHT X > 1583, content in X in [180, 1540])
    t_title, b_t = render_pencil_text("The Celestial Cipher", FONT_PATH, font_size=58, gc=gc, seed=101)
    blit_rgba(canvas, t_title, 200, 95 - b_t)
    
    t_sub, b_s = render_pencil_text("Hour Angle & Declination Coordinates of the Lost Stanza", FONT_PATH, font_size=25, gc=gc, seed=102)
    blit_rgba(canvas, t_sub, 202, 160 - b_s)
    
    draw_sketchy_line(canvas, (200, 185), (1520, 185), gc=gc, alpha_base=160, passes=2, seed=103)
    
    # 2. Concentric Astrolabe Coordinate Dial ($Y = 220 \dots 1200$)
    # Center: (860, 680)
    cx, cy = 860, 660
    radii = [420, 340, 260, 180, 100] # 4 bands
    
    # Draw concentric circles
    for r in radii:
        cv2.circle(canvas, (cx, cy), r, (*gc, 160), 1, cv2.LINE_AA)
        
    # Draw 12 radial hour sectors (every 30 deg)
    romans = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"]
    for i in range(12):
        deg = i * 30 - 90 # XII at top
        rad = np.deg2rad(deg)
        cos_a, sin_a = np.cos(rad), np.sin(rad)
        p1 = (int(round(cx + radii[-1] * cos_a)), int(round(cy + radii[-1] * sin_a)))
        p2 = (int(round(cx + radii[0] * cos_a)), int(round(cy + radii[0] * sin_a)))
        cv2.line(canvas, p1, p2, (*gc, 140), 1, cv2.LINE_AA)
        
        # Roman numeral outside outer ring
        p_rom = (int(round(cx + (radii[0] + 25) * cos_a)), int(round(cy + (radii[0] + 25) * sin_a)))
        t_rom, b_rom = render_pencil_text(romans[i], FONT_PATH, font_size=20, gc=gc, seed=200+i)
        blit_rgba(canvas, t_rom, p_rom[0] - t_rom.shape[1] // 2, p_rom[1] - t_rom.shape[0] // 2)

    # Declination band labels on vertical axis (col XII / VI)
    bands = ["+45*", "+15*", "-15*", "-45*"]
    for b_idx, b_lbl in enumerate(bands):
        mid_r = (radii[b_idx] + radii[b_idx + 1]) // 2
        t_bd, b_d = render_pencil_text(b_lbl, FONT_PATH, font_size=16, gc=gc, seed=250+b_idx)
        # Put label near vertical axis
        blit_rgba(canvas, t_bd, cx - t_bd.shape[1] // 2, cy - mid_r - t_bd.shape[0] // 2)

    # 48 cells (12 sectors x 4 bands) containing letters
    # Coordinate key mapping:
    # Sector i (0..11) -> romans[i]
    # Band b (0..3) -> bands[b]
    # We assign letters to match the target decoded message:
    # Message: "YOU WERE ALWAYS THE TREASURE" (24 letters!)
    # Let's map coordinates:
    target_msg = "YOU WERE ALWAYS THE TREASURE" # 28 chars with spaces, 24 letters
    # 24 letters:
    # Y O U   W E R E   A L W A Y S   T H E   T R E A S U R E
    coords_for_msg = [
        # Y O U
        ("IV", "+45*"), ("VII", "-15*"), ("II", "+15*"),
        # W E R E
        ("IX", "-15*"), ("V", "+15*"), ("I", "+45*"), ("XI", "-45*"),
        # A L W A Y S
        ("III", "+15*"), ("VIII", "+45*"), ("X", "-15*"), ("VI", "+45*"), ("IV", "-15*"), ("XII", "-45*"),
        # T H E
        ("I", "-15*"), ("VII", "+45*"), ("V", "-45*"),
        # T R E A S U R E
        ("X", "+15*"), ("III", "-45*"), ("VIII", "-15*"), ("VI", "-45*"), ("IX", "+45*"), ("II", "-45*"), ("XI", "+15*"), ("XII", "+15*")
    ]
    
    # Place target letters in dial
    dial_letters = {}
    for letter, (s_rom, b_lbl) in zip(target_msg.replace(" ", ""), coords_for_msg):
        s_idx = romans.index(s_rom)
        b_idx = bands.index(b_lbl)
        dial_letters[(s_idx, b_idx)] = letter
        
    # Fill remaining cells with distractor celestial letters
    filler = "BCDFGHJKLMNPQRSTVWXZ"
    for s_idx in range(12):
        for b_idx in range(4):
            if (s_idx, b_idx) not in dial_letters:
                dial_letters[(s_idx, b_idx)] = filler[(s_idx * 4 + b_idx) % len(filler)]
                
    # Render all 48 letters in the dial sectors
    for (s_idx, b_idx), ch in dial_letters.items():
        # Sector center angle: mid angle between s_idx and s_idx + 1
        deg_mid = s_idx * 30 - 75 # offset by 15 deg
        rad_mid = np.deg2rad(deg_mid)
        r_mid = (radii[b_idx] + radii[b_idx + 1]) // 2
        px = int(round(cx + r_mid * np.cos(rad_mid)))
        py = int(round(cy + r_mid * np.sin(rad_mid)))
        
        t_ch, b_ch = render_pencil_text(ch, FONT_PATH, font_size=23, gc=gc, seed=400+s_idx*4+b_idx)
        blit_rgba(canvas, t_ch, px - t_ch.shape[1] // 2, py - t_ch.shape[0] // 2)

    # Central emblem in dial hub
    cv2.circle(canvas, (cx, cy), radii[-1], (*gc, 180), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), 16, (*gc, 140), 1, cv2.LINE_AA)
    cv2.circle(canvas, (cx, cy), 4, (*gc, 200), -1, cv2.LINE_AA)
    t_hub, b_h = render_pencil_text("Pole", FONT_PATH, font_size=18, gc=gc, seed=499)
    blit_rgba(canvas, t_hub, cx - t_hub.shape[1] // 2, cy + 22)

    # 3. Coordinate Riddle Table ($Y = 1220 \dots 1850$)
    draw_sketchy_line(canvas, (200, 1200), (1520, 1200), gc=gc, alpha_base=140, passes=2, seed=501)
    
    t_tbl_hdr, b_th = render_pencil_text("Sighting Log: Cross the Hour Angle with the Declination Ring:", FONT_PATH, font_size=26, gc=gc, seed=502)
    blit_rgba(canvas, t_tbl_hdr, 200, 1240 - b_th)
    
    # 4 Groups of coordinates matching the words:
    # Word 1: YOU (3)
    # Word 2: WERE (4)
    # Word 3: ALWAYS (6)
    # Word 4: THE (3)
    # Word 5: TREASURE (8)
    groups = [
        ("I. The Seeker's Identity:", coords_for_msg[0:3]),      # YOU
        ("II. The Past Meridian:",  coords_for_msg[3:7]),      # WERE
        ("III. The Timeless Stance:",coords_for_msg[7:13]),     # ALWAYS
        ("IV. The Definite Sun:",   coords_for_msg[13:16]),     # THE
        ("V. The Final Mystery:",   coords_for_msg[16:24])      # TREASURE
    ]
    
    y_tbl = 1290
    for g_title, g_coords in groups:
        t_gt, b_gt = render_pencil_text(g_title, FONT_PATH, font_size=22, gc=gc, seed=600+y_tbl)
        blit_rgba(canvas, t_gt, 200, y_tbl - b_gt)
        
        # Print coordinate chips
        chip_x = 560
        for s_rom, b_lbl in g_coords:
            coord_str = f"({s_rom}, {b_lbl})"
            t_cp, b_cp = render_pencil_text(coord_str, FONT_PATH, font_size=20, gc=gc, seed=650+chip_x+y_tbl)
            blit_rgba(canvas, t_cp, chip_x, y_tbl - b_cp)
            chip_x += t_cp.shape[1] + 24
        y_tbl += 68

    # 4. Deduction & Transcription Area ($Y = 1880 \dots 2380$)
    draw_sketchy_line(canvas, (200, 1850), (1520, 1850), gc=gc, alpha_base=140, passes=2, seed=701)
    
    t_dec_hdr, b_dh = render_pencil_text("The Decoded Prophecy of the Cartographer:", FONT_PATH, font_size=26, gc=gc, seed=702)
    blit_rgba(canvas, t_dec_hdr, 200, 1900 - b_dh)
    
    # 2 deduction lines with brackets:
    # Line 1: [ ___  ___  ___ ]   [ ___  ___  ___  ___ ]   [ ___  ___  ___  ___  ___  ___ ]
    # Line 2: [ ___  ___  ___ ]   [ ___  ___  ___  ___  ___  ___  ___  ___ ]
    draw_sketchy_line(canvas, (200, 2040), (1520, 2040), gc=gc, alpha_base=180, passes=2, seed=801)
    t_l1, b_l1 = render_pencil_text("[  _ _ _  ]       [  _ _ _ _  ]       [  _ _ _ _ _ _  ]", FONT_PATH, font_size=24, gc=gc, seed=802)
    blit_rgba(canvas, t_l1, 200, 2010 - b_l1)
    
    draw_sketchy_line(canvas, (200, 2180), (1520, 2180), gc=gc, alpha_base=180, passes=2, seed=803)
    t_l2, b_l2 = render_pencil_text("[  _ _ _  ]       [  _ _ _ _ _ _ _ _  ]", FONT_PATH, font_size=24, gc=gc, seed=804)
    blit_rgba(canvas, t_l2, 200, 2150 - b_l2)
    
    # Canonical sign-off
    t_sig, b_sg = render_pencil_text("The Cartographer of Distant Light", FONT_PATH, font_size=25, gc=gc, seed=901)
    blit_rgba(canvas, t_sig, 1020, 2280 - b_sg)

    return canvas

canvas = render_coordinate_cipher()

bg_raw = cv2.imread(PAPER_PATH)
bg_face = cv2.flip(cv2.resize(bg_raw, (CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX)), 1)
fg = canvas[:, :, :3].astype(float)
al = (canvas[:, :, 3].astype(float) / 255.0)[:, :, np.newaxis]
mockup = (fg * al + bg_face.astype(float) * (1.0 - al)).astype(np.uint8)

out_mockup = os.path.join(PROJECT_ROOT, 'journal', 'constellation_games', 'game04_coordinate_cipher_mockup.jpg')
cv2.imwrite(out_mockup, mockup, [cv2.IMWRITE_JPEG_QUALITY, 95])
print("Saved game04_coordinate_cipher_mockup.jpg successfully!")
