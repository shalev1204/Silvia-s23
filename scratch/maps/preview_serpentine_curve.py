import math
from playwright.sync_api import sync_playwright
import os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

nodes = [
    (240, 980),
    (430, 900),
    (630, 840),
    (480, 710),
    (340, 570),
    (540, 470),
    (740, 390),
    (590, 260),
    (780, 160),
    (910, 90)
]

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
    k = D * 0.38
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
  <!-- Grid lines -->
  <g stroke="rgba(212,168,83,0.1)" stroke-width="1">
    <line x1="0" y1="200" x2="1120" y2="200" />
    <line x1="0" y1="400" x2="1120" y2="400" />
    <line x1="0" y1="600" x2="1120" y2="600" />
    <line x1="0" y1="800" x2="1120" y2="800" />
    <line x1="0" y1="1000" x2="1120" y2="1000" />
    <line x1="280" y1="0" x2="280" y2="1100" />
    <line x1="560" y1="0" x2="560" y2="1100" />
    <line x1="840" y1="0" x2="840" y2="1100" />
  </g>
  <path class="road" d="{path_d}" />
  <path class="core" d="{path_d}" />
  {''.join([f'<circle class="node" cx="{x}" cy="{y}" r="12" /><text x="{x}" y="{y+26}">{idx+1}</text>' for idx, (x, y) in enumerate(nodes[:-1])])}
  <circle cx="{nodes[-1][0]}" cy="{nodes[-1][1]}" r="6" fill="#fbbf24" />
  <text x="{nodes[-1][0]}" y="{nodes[-1][1]+20}">End</text>
</svg>
</body>
</html>'''

with open("scratch/preview_curve.html", "w") as f:
    f.write(svg_html)

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless=True
    )
    page = browser.new_page(viewport={'width': 1200, 'height': 1200})
    page.goto("file://" + os.path.join(ROOT, "scratch/preview_curve.html"))
    page.wait_for_timeout(300)
    page.locator('svg').screenshot(path='scratch/preview_curve.png')
    browser.close()
    print("SUCCESS: Captured preview_curve.png")
