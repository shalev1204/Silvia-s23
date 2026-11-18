"""Screenshots of the panel of Cairn IV (Part II) in its states: nothing marked, some marks, all marked, Test call, and on the iPad.
Usage: python3 shot_panel.py OUT_DIR [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8890
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save.update({"order_cairn4_march_start": str(int(time.time() * 1000) - 19 * 3600 * 1000), "order_bridge_spyglass": '{"done":true,"choice":"hide"}',
             "order_cairn4_awake": "true", "order_cairn4_cine_intro": "seen", "order_cairn4_howto": "seen"})
def panel(page, name):
    page.wait_for_timeout(350)
    box = page.evaluate("(() => { const r = document.querySelector('#modal-cairn-four .chasm3d-panel').getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })()")
    page.screenshot(path=os.path.join(OUT, name + ".png"), clip={"x": box[0], "y": box[1], "width": box[2], "height": min(box[3], 900)})
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    for vw, vh, tag in ((1440, 900, "mac"), (1180, 820, "ipad")):
        ctx, page, errors = W.new_page(b, save)
        page.set_viewport_size({"width": vw, "height": vh})
        page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
        page.evaluate("window.openCairnFourModal()"); page.wait_for_timeout(4500)
        page.evaluate("document.querySelector('#modal-cairn-four .chasm3d-panel').scrollTop = 0; document.querySelector('#pillars-game').scrollIntoView({block: 'start'})")
        panel(page, f"{tag}_0_empty")
        c4 = "window.__cairn4"
        for fid in ("L30", "R25"):
            aim = page.evaluate(f"{c4}.aimAt('{fid}')"); page.mouse.click(aim["x"], aim["y"]); page.wait_for_timeout(150)
        page.evaluate("document.querySelector('#pillars-game').scrollIntoView({block: 'start'})")
        panel(page, f"{tag}_1_two")
        page.click("#btn-pillars-mode-call"); panel(page, f"{tag}_2_call")
        page.click("#btn-pillars-mode-mark")
        for fid in ("L45", "R60", "L55", "R35", "L25", "R40"):
            if page.evaluate("document.querySelectorAll('#pillars-slots .is-filled').length") >= page.evaluate("document.querySelectorAll('#pillars-slots .pillars-slot').length"): break
            aim = page.evaluate(f"{c4}.aimAt('{fid}')"); page.mouse.click(aim["x"], aim["y"]); page.wait_for_timeout(150)
        page.evaluate("document.querySelector('#pillars-game').scrollIntoView({block: 'start'})")
        panel(page, f"{tag}_3_full")
        page.evaluate("document.getElementById('btn-pillars-howto').click()"); page.wait_for_timeout(500)
        for _ in range(3): page.click("#btn-pillars-howto-next"); page.wait_for_timeout(250)
        page.wait_for_timeout(600); page.screenshot(path=os.path.join(OUT, f"{tag}_howto_p4.png"))
        print(tag, "errors", errors)
        ctx.close()
    b.close()
