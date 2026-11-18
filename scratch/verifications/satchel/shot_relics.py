"""Satchel inspector with the short relic texts (Mac and iPad). Usage: python3 shot_relics.py OUT_DIR [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8893
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save.update({"order_last_seen_at": str(int(time.time() * 1000))})
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    for vw, vh, tag in ((1440, 900, "mac"), (1180, 820, "ipad")):
        ctx, page, errors = W.new_page(b, save)
        page.set_viewport_size({"width": vw, "height": vh})
        page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
        for rid in ("tuning_pebble", "surveyor_compass", "lamp_oil"):
            page.evaluate(f"window.openSatchelInventoryModal('{rid}')"); page.wait_for_timeout(1200)
            print(tag, rid, page.evaluate("[document.getElementById('si-inspect-desc').textContent.length, document.getElementById('si-hermes-note').textContent.length]"))
            page.screenshot(path=os.path.join(OUT, f"{tag}_{rid}.png"))
            page.keyboard.press("Escape"); page.wait_for_timeout(400)
        print(tag, "errors", errors)
        ctx.close()
    b.close()
