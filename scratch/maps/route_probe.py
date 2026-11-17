"""Render the Desert 3D map with Silvia's 17 Nov story point at a given stage size; print where nodes project, save a shot.
Usage: python3 scratch/maps/route_probe.py OUT_DIR [W H]"""
import os, re, sys, json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
SW, SH = (int(sys.argv[2]), int(sys.argv[3])) if len(sys.argv) > 3 else (735, 560)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read()
save = json.loads(src[src.index("var SAVE = {") + 11: src.index("\n        };", src.index("var SAVE = {")) + 10].strip().rstrip(";"))
save = {k: v for k, v in save.items() if not k.startswith("__")}
W.BASE = "http://127.0.0.1:8813"; server = W.start_server(port=8813)
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, save)
    page.set_viewport_size({"width": SW + 700, "height": SH + 500})
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2000)
    page.evaluate("document.querySelector('[data-view=\"view-trail\"]').click()"); page.wait_for_timeout(500)
    page.evaluate("window.showDesertMap && window.showDesertMap(false)"); page.wait_for_timeout(3000)
    page.evaluate(f"(() => {{ const s = document.getElementById('desert3d-stage'); s.style.width = '{SW}px'; s.style.height = '{SH}px'; s.style.flex = 'none'; s.style.aspectRatio = 'auto'; window.dispatchEvent(new Event('resize')); }})()")
    page.wait_for_timeout(6000)
    print("stage", page.evaluate("(() => { const s = document.getElementById('desert3d-stage'); return [s.clientWidth, s.clientHeight]; })()"))
    for name, (x, y) in {"labyrinth": (1640, 770), "cairn4": (130, 2150), "arch": (1480, 2040), "sanct": (1560, 1660), "monolith": (1262, 430)}.items():
        print(name, page.evaluate(f"window.Desert3D.project({x},{y})"))
    print("hermes", page.evaluate("(() => { const d = window.Desert3D.debug(); return [d.state.lvl, d.shownD, d.camDist]; })()"))
    page.locator("#desert3d-stage").screenshot(path=os.path.join(OUT, f"map_{SW}x{SH}.png"))
    red = os.environ.get("RED_NPY")
    if red:   # draw the Operator's red line (map coordinates) over the shot, to compare with the dotted route
        import numpy as np
        from PIL import Image, ImageDraw
        pts = [page.evaluate(f"window.Desert3D.project({x},{y})") for x, y in np.load(red)]
        im = Image.open(os.path.join(OUT, f"map_{SW}x{SH}.png")).convert("RGB"); dr = ImageDraw.Draw(im)
        dr.line([(q["x"], q["y"]) for q in pts], fill=(255, 30, 30), width=2)
        im.save(os.path.join(OUT, f"map_{SW}x{SH}_red.png"))
    print(errors[:3])
    b.close()
server.shutdown()
