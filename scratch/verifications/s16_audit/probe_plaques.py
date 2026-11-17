"""Clicks each of the 16 fissure plaques of Cairn IV from the default view and reports which fissure each click marks.
Serves this checkout's web/. Usage: python3 probe_plaques.py OUT_DIR [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8873
W.BASE = f"http://127.0.0.1:{PORT}"
server = W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read()
i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save.update({"order_cairn4_march_start": str(int(time.time() * 1000) - 19 * 3600 * 1000), "order_bridge_spyglass": '{"done":true,"choice":"hide"}',
             "order_cairn4_awake": "true", "order_cairn4_cine_intro": "seen", "order_cairn4_howto": "seen"})
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, save)
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
    page.evaluate("window.openCairnFourModal()"); page.wait_for_timeout(2500)
    page.evaluate("window.__cairn4.gfx().cam.p = null"); page.wait_for_timeout(400)
    page.screenshot(path=os.path.join(OUT, "default_view.png"))
    res = {}
    for side in "LR":
        for d in range(25, 65, 5):
            fid = f"{side}{d}"
            aim = page.evaluate(f"window.__cairn4.aimAt('{fid}')")
            page.mouse.click(aim["x"], aim["y"]); page.wait_for_timeout(120)
            txt = page.evaluate("document.getElementById('pillars-slots').innerText").split("\n")[0]
            res[fid] = txt
            page.click("#btn-pillars-undo") if page.is_visible("#btn-pillars-undo") else None
            page.wait_for_timeout(80)
    print(json.dumps(res, indent=0))
    print("errors", errors)
    b.close()
server.shutdown() if hasattr(server, "shutdown") else None
