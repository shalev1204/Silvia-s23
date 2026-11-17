"""S16 audit, part 1: the map card is drawn sealed, she goes to the Field Wire, Hermes arrives there, and she presses
"Open the Grand Desert Map": is the Station 16 card redrawn? Usage: python3 scratch/verifications/s16_audit/part1_arrival_return.py OUT_DIR"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts", "audit")); sys.path.insert(0, HERE)
import web_smoke as W  # noqa: E402
from load_save import save  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]
W.BASE = "http://127.0.0.1:8841"; server = W.start_server(port=8841)
H18 = 18 * 3600 * 1000
CARD = "[...document.querySelectorAll('[id^=insp]')].filter(e => e.offsetParent && e.children.length === 0 && e.textContent.trim()).map(e => e.id + '=' + e.textContent.trim().slice(0,70))"
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, save)
    page.add_init_script("window.__wireFast = false; delete window.__wireAllChapters;")
    page.set_viewport_size({"width": 1440, "height": 900})
    js = page.evaluate
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(4000)
    js(f"localStorage.setItem('order_cairn4_march_start', String(Date.now() - {H18} + 15000))")
    js("window.selectMapNode(25, true)"); page.wait_for_timeout(800)
    print("map card (sealed):", js(CARD)[:3])
    js("document.querySelector('[data-view=\"view-field-wire\"]').click()"); page.wait_for_timeout(22000)
    print("wire bar:", js("document.querySelector('.messenger-waypoint-title').textContent"))
    js("document.getElementById('btn-wire-to-map').click()"); page.wait_for_timeout(3000)
    page.screenshot(path=f"{OUT}/f_return_map_card.png")
    print("map card after return:", js(CARD)[:4])
    print("btn:", js("(document.getElementById('insp-btn-primary')||{}).innerText"))
    print("errors:", errors[:6])
    b.close()
server.shutdown()
