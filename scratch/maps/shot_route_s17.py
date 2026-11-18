"""The Grand Desert Map after Station 17: is the road from Cairn IV to the Arch the Operator's? Usage: python3 shot_route_s17.py OUT_DIR [PORT]"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8894
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, {"the_eclipse_active_seeker": "Carles"})
    page.set_viewport_size({"width": 1600, "height": 1000})
    page.goto(f"{W.BASE}/index.html?tester=1", wait_until="load"); page.wait_for_timeout(2500)
    page.evaluate("TesterDesert.jumpTo('s18')"); page.reload(); page.wait_for_timeout(3000)
    page.evaluate("window.switchMapPath && window.switchMapPath('desert', true)"); page.wait_for_timeout(6000)
    page.screenshot(path=os.path.join(OUT, "route_s17.png"))
    print("errors", errors)
    b.close()
