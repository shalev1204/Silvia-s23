import math
from playwright.sync_api import sync_playwright
import os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

nodes = [
    # 1: Origin (Threshold) - Alpine valley entrance
    (180, 970),
    
    # 2: Cartographer Arrival - Sweeping right across foothills
    (380, 890),
    
    # 3: Celestial Flower - High sheltered pine slope
    (700, 810),
    
    # 4: Observatory Raid - Ancient aqueduct bridging the chasm
    (490, 690),
    
    # 5: Radio Relay - Pinnacle spire overlooking the canyon
    (260, 560),
    
    # 6: Celestial Matrix - Sunken Planisphere amphitheater
    (560, 460),
    
    # 7: The Zodiac Engine - Sandstone mesa terrace
    (840, 360),
    
    # 8: The Midnight Calibration - Tempest mesa & Vega ray
    (580, 240),
    
    # 9: The Celestial Cipher - Ancient Desert Gate threshold
    (820, 140),
    
    # Horizon - Fades into the celestial canopy
    (960, 75)
]

print("--- DISTANCES BETWEEN CONSECUTIVE STATIONS ---")
for i in range(len(nodes) - 1):
    p1 = nodes[i]
    p2 = nodes[i+1]
    dist = math.sqrt((p2[0]-p1[0])**2 + (p2[1]-p1[1])**2)
    print(f"Station {i+1} -> {i+2}: dist = {dist:.1f} px  (dx={p2[0]-p1[0]}, dy={p2[1]-p1[1]})")

n = len(nodes)
tangents = []
for i in range(n):
    if i == 0:
        tx = nodes[1][0] - nodes[0][0]
        ty = nodes[1][1] - nodes[0][1]
    elif i == n - 1:
        tx = nodes[n-1][0] - nodes[n-2][0]
        ty = nodes[n-1][1] - nodes[n-2][1]
    else:
        tx = nodes[i+1][0] - nodes[i-1][0]
        ty = nodes[i+1][1] - nodes[i-1][1]
    L = math.sqrt(tx*tx + ty*ty)
    tangents.append((tx / L, ty / L))

segments = []
for i in range(n - 1):
    p1 = nodes[i]
    p2 = nodes[i+1]
    D = math.sqrt((p2[0]-p1[0])**2 + (p2[1]-p1[1])**2)
    k = D * 0.36
    cp1 = (round(p1[0] + tangents[i][0] * k, 1), round(p1[1] + tangents[i][1] * k, 1))
    cp2 = (round(p2[0] - tangents[i+1][0] * k, 1), round(p2[1] - tangents[i+1][1] * k, 1))
    segments.append((p1, cp1, cp2, p2))

path_d = f"M {nodes[0][0]} {nodes[0][1]} " + " ".join([f"C {cp1[0]} {cp1[1]}, {cp2[0]} {cp2[1]}, {p2[0]} {p2[1]}" for p1, cp1, cp2, p2 in segments])

svg_html = f'''<!DOCTYPE html>
<html>
<head>
<style>
  body {{ margin: 0; background: #040918; display: flex; justify-content: center; }}
  svg {{ width: 1120px; height: 1100px; }}
  .road {{ fill: none; stroke: rgba(212,168,83,0.3); stroke-width: 8; stroke-linecap: round; stroke-linejoin: round; }}
  .core {{ fill: none; stroke: #f59e0b; stroke-width: 3; stroke-dasharray: 8, 6; }}
  .node {{ fill: #ffe099; stroke: #d4a853; stroke-width: 2; }}
  text {{ fill: #fde68a; font-family: sans-serif; font-size: 14px; text-anchor: middle; font-weight: bold; }}
</style>
</head>
<body>
<svg viewBox="0 0 1120 1100">
  <rect width="1120" height="1100" fill="#040918" />
  <!-- Margin guides -->
  <rect x="50" y="50" width="1020" height="1000" fill="none" stroke="rgba(212,168,83,0.15)" stroke-dasharray="4, 4" />
  <path class="road" d="{path_d}" />
  <path class="core" d="{path_d}" />
  {''.join([f'<circle class="node" cx="{x}" cy="{y}" r="12" /><text x="{x}" y="{y+26}">{idx+1}</text>' for idx, (x, y) in enumerate(nodes[:-1])])}
  <circle cx="{nodes[-1][0]}" cy="{nodes[-1][1]}" r="6" fill="#fbbf24" />
  <text x="{nodes[-1][0]}" y="{nodes[-1][1]+20}">End</text>
</svg>
</body>
</html>'''

with open("scratch/preview_curve_v2.html", "w") as f:
    f.write(svg_html)

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless=True
    )
    page = browser.new_page(viewport={'width': 1200, 'height': 1200})
    page.goto("file://" + os.path.join(ROOT, "scratch/preview_curve_v2.html"))
    page.wait_for_timeout(300)
    page.locator('svg').screenshot(path='scratch/preview_curve_v2.png')
    browser.close()
    print("SUCCESS: Captured preview_curve_v2.png")
