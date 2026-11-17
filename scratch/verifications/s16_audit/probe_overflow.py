"""Lists elements wider than a 390 px phone on the Chronicles view (the notebook smoke). Usage: python3 probe_overflow.py [PORT]"""
import os, sys, time
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8874
W.BASE = f"http://127.0.0.1:{PORT}"; server = W.start_server(port=PORT)
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, dict(W.DESERT_BASE))
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
    page.evaluate("document.querySelector('[data-view=\"view-chronicles\"]').click()"); page.wait_for_timeout(600)
    page.set_viewport_size({"width": 390, "height": 800}); page.wait_for_timeout(500)
    print("scrollWidth", page.evaluate("document.documentElement.scrollWidth"))
    print(page.evaluate("""[...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return !(e instanceof SVGElement) && r.width && r.right > 390.5; }).slice(0, 12).map(e => e.tagName + '#' + e.id + '.' + String(e.className).slice(0, 50) + ' ' + Math.round(e.getBoundingClientRect().right))"""))
    b.close()
