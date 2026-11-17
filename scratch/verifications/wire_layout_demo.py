"""Screenshots of the Field Wire with Silvia's 17 Nov story point: today's layout and mock-ups of layout options (CSS injected, nothing saved).
Usage: python3 scratch/verifications/wire_layout_demo.py OUT_DIR [option ...]   options: now, A, B, C"""
import os, sys, json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
OPTS = sys.argv[2:] or ["now"]
HERE = os.path.dirname(__file__)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read()
i = src.index("var SAVE = {")
save = json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";"))
save = {k: v for k, v in save.items() if not k.startswith("__")}
W.BASE = "http://127.0.0.1:8814"; server = W.start_server(port=8814)
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    for opt in OPTS:
        ctx, page, errors = W.new_page(b, save)
        page.set_viewport_size({"width": 1440, "height": 900})
        page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
        page.evaluate("document.querySelector('[data-view=\"view-field-wire\"]').click()"); page.wait_for_timeout(2500)
        css = os.path.join(HERE, f"wire_demo_{opt}.css")
        if os.path.exists(css):
            page.add_style_tag(path=css)
        js = os.path.join(HERE, f"wire_demo_{opt}.js")
        if os.path.exists(js):
            page.add_script_tag(path=js)
        page.wait_for_timeout(1200)
        if opt == "B":   # the top menu as it looks at the top of the page, to lay over shot 3 (the slide-in bar)
            page.evaluate("window.scrollTo(0, 0)"); page.wait_for_timeout(500)
            hb = page.evaluate("(() => { const r = document.querySelector('.hub-viewport-header').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; })()")
            hb = [hb[0] - 6, max(0, hb[1] - 8), hb[2] + 12, hb[3] + 16]
            page.screenshot(path=f"{OUT}/B_menu_strip.png", clip=dict(zip("x y width height".split(), hb)))
        # 1 · at the latest message (where Silvia lands)
        page.evaluate("window.__demoBottom ? window.__demoBottom() : window.scrollTo(0, document.documentElement.scrollHeight)"); page.wait_for_timeout(900)
        page.screenshot(path=f"{OUT}/{opt}_1_latest.png")
        # 2 · reading back up the conversation
        page.evaluate("window.__demoReadBack ? window.__demoReadBack() : window.scrollBy(0, -1400)"); page.wait_for_timeout(900)
        page.screenshot(path=f"{OUT}/{opt}_2_reading.png")
        # 3 · a small scroll up from there: can the top menu be reached?
        page.evaluate("window.__demoTop ? window.__demoTop() : window.scrollBy(0, -300)"); page.wait_for_timeout(900)
        page.screenshot(path=f"{OUT}/{opt}_3_menu.png")
        if opt == "B":
            from PIL import Image, ImageDraw
            shot, strip = Image.open(f"{OUT}/B_3_menu.png").convert("RGB"), Image.open(f"{OUT}/B_menu_strip.png").convert("RGB")
            x0 = int(hb[0]); bg = Image.new("RGB", (strip.width, strip.height + 6), (22, 15, 10))
            bg.paste(strip, (0, 0)); ImageDraw.Draw(bg).line([(0, strip.height + 2), (strip.width, strip.height + 2)], fill=(150, 115, 60), width=2)
            shot.paste(bg, (x0, 0)); shot.save(f"{OUT}/B_3_menu.png")
        print(opt, "page height", page.evaluate("document.documentElement.scrollHeight"), errors[:2])
        ctx.close()
    b.close()
server.shutdown()
