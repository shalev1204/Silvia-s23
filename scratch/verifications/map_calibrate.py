"""Calibrate the 3D map camera against the Operator's screenshot (stage 1024x797), print where the markers land."""
import os, sys, json, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "audit"))
import web_smoke as W
from playwright.sync_api import sync_playwright
OUT = os.path.join(os.path.dirname(__file__), "shots")
SW, SH = int(sys.argv[1]) if len(sys.argv) > 1 else 1024, int(sys.argv[2]) if len(sys.argv) > 2 else 797
server = W.start_server()
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    now = int(time.time() * 1000)
    seed = dict(W.DESERT_BASE, order_desert_lexicon_completed="true", order_oasis_clepsydra_completed="true", order_gates_scene_completed="true",
                order_monolith_march_start=str(now - 3600 * 1000), order_active_map_path="desert", order_field_wire_step="10")
    ctx, page, errors = W.new_page(b, seed)
    page.set_viewport_size({"width": SW + 700, "height": SH + 500})
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(1500)
    page.evaluate("document.querySelector('[data-view=\"view-trail\"]').click()"); page.wait_for_timeout(500)
    page.evaluate("window.showDesertMap && window.showDesertMap(false)"); page.wait_for_timeout(3500)
    page.evaluate(f"(() => {{ const s = document.getElementById('desert3d-stage'); s.style.width = '{SW}px'; s.style.height = '{SH}px'; s.style.flex = 'none'; s.style.aspectRatio = 'auto'; window.dispatchEvent(new Event('resize')); }})()")
    page.wait_for_timeout(2500)
    print("stage", page.evaluate("(() => { const s = document.getElementById('desert3d-stage'); return [s.clientWidth, s.clientHeight]; })()"))
    for name, (x, y) in {"monolith": (1262, 430), "labyrinth": (1640, 770), "cairn1": (538, 1203), "gates": (1560, 1660), "sanct": (1640, 1590)}.items():
        print(name, page.evaluate(f"window.Desert3D.project({x},{y})"))
    page.locator("#desert3d-stage").screenshot(path=os.path.join(OUT, "map_calib.png"))
    print(errors[:3])
    b.close()
server.shutdown()
