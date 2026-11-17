"""Lists every control under 44 px that a finger can miss, on the iPad viewport, across the Hub views and station windows
(the same walk as the smoke's touch check, but printing all of them). Usage: python3 probe_touch.py [PORT]"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.abspath(os.path.join(HERE, "..", "..", "..", "scripts", "audit")))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8881
W.BASE = f"http://127.0.0.1:{PORT}"
W.start_server(port=PORT)
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx = b.new_context(viewport={"width": 1180, "height": 820}, has_touch=True)
    page = ctx.new_page()
    page.add_init_script(W.SEED_JS % json.dumps(W.A11Y_SEED))
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
    ov = lambda v: (page.evaluate("v => document.querySelector(`[data-view='${v}']`).click()", v), page.wait_for_timeout(900))
    small = []
    for view in W.VIEWS:
        ov(view); small += [view + ": " + m for m in page.evaluate(W.A11Y_TOUCH_JS, [None, W.A11Y_FOCUSABLE])]
    for fn, mid in W.A11Y_MODALS:
        ov("view-trail")
        page.evaluate(f"window.{fn}()" if fn.startswith("open") else f"window.{fn} 0"); page.wait_for_timeout(1000)
        small += [mid + ": " + m for m in page.evaluate(W.A11Y_TOUCH_JS, ["#" + mid, W.A11Y_FOCUSABLE])]
        page.keyboard.press("Escape"); page.wait_for_timeout(500)
        page.evaluate(f"document.getElementById('{mid}').style.display = 'none'")
    print("\n".join(sorted(set(small))) or "none")
    b.close()
