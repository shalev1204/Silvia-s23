"""Screenshots of the one-screen Field Wire (option C, 17 Nov 2026) with Silvia's story point: latest, reading back (folded deck),
the Hub menu one flick up, the Index with the filters, Ask Hermes, and the Quest Map opening at the top after the Wire.
Usage: python3 scratch/verifications/wire_layout_check.py OUT_DIR"""
import os, sys, json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read()
i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
W.BASE = "http://127.0.0.1:8816"; server = W.start_server(port=8816)
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, save)
    page.set_viewport_size({"width": 1440, "height": 900})
    js = page.evaluate
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
    js("document.querySelector('[data-view=\"view-field-wire\"]').click()"); page.wait_for_timeout(2500)
    st = "document.getElementById('wire-messages-stream')"
    info = lambda: js(f"({{ page: Math.round(scrollY), pageMax: document.documentElement.scrollHeight - innerHeight, dist: Math.round({st}.scrollHeight - {st}.scrollTop - {st}.clientHeight), chat: {st}.clientHeight, folded: document.querySelector('#view-field-wire .messenger-reply-deck').classList.contains('is-folded') }})")
    page.screenshot(path=f"{OUT}/1_latest.png"); print("latest", info())
    page.mouse.move(800, 400)
    for _ in range(6): page.mouse.wheel(0, -400); page.wait_for_timeout(120)
    page.wait_for_timeout(700); page.screenshot(path=f"{OUT}/2_reading.png"); print("reading", info())
    js("window.scrollTo(0, 0)"); page.wait_for_timeout(500); page.screenshot(path=f"{OUT}/3_menu.png"); print("menu", info())
    js("window.wireFitWindow()"); page.wait_for_timeout(300)
    js("document.querySelector('#view-field-wire .wire-fold-bar').click()"); page.wait_for_timeout(1500); print("answer", info())
    js("document.getElementById('btn-wire-chapter-picker').click()"); page.wait_for_timeout(600); page.screenshot(path=f"{OUT}/4_index.png")
    js("document.querySelector('.wcp-filters .wmf-btn[data-wire-filter=\"clues\"]').click()"); page.wait_for_timeout(400)
    print("index label", js("document.getElementById('btn-wire-chapter-picker').textContent"))
    js("document.querySelector('.wcp-filters .wmf-btn[data-wire-filter=\"all\"]').click(); document.body.click()"); page.wait_for_timeout(400)
    js("document.getElementById('tab-wire-inquiries').click()"); page.wait_for_timeout(1200); page.screenshot(path=f"{OUT}/5_ask.png")
    js("document.getElementById('tab-wire-expedition').click()"); page.wait_for_timeout(1200); print("back to expedition", info())
    js("document.querySelector('[data-view=\"view-trail\"]').click()"); page.wait_for_timeout(1500); print("map scrollY", js("scrollY"))
    page.screenshot(path=f"{OUT}/6_map.png")
    print("errors:", errors[:4])
    b.close()
server.shutdown()
