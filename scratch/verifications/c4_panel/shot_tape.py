"""Cairn IV: the tape folded, opened by the wind, folded again after it, and opened by hand (Mac and iPad).
Usage: python3 shot_tape.py OUT_DIR [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8892
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save.update({"order_cairn4_march_start": str(int(time.time() * 1000) - 19 * 3600 * 1000), "order_bridge_spyglass": '{"done":true,"choice":"hide"}',
             "order_cairn4_awake": "true", "order_cairn4_cine_intro": "seen", "order_cairn4_howto": "seen", "order_last_seen_at": str(int(time.time() * 1000))})
state = "(() => { const b = document.getElementById('pillars-tape-box'); return [b.classList.contains('is-open'), Math.round(b.getBoundingClientRect().height)]; })()"
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    for vw, vh, tag in ((1440, 900, "mac"), (1180, 820, "ipad")):
        ctx, page, errors = W.new_page(b, save)
        page.set_viewport_size({"width": vw, "height": vh})
        page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
        page.evaluate("window.openCairnFourModal()"); page.wait_for_timeout(4000)
        print(tag, "folded", page.evaluate(state)); page.screenshot(path=os.path.join(OUT, f"{tag}_t0_folded.png"))
        page.click("#btn-pillars-play"); page.wait_for_timeout(3000)
        print(tag, "playing", page.evaluate(state)); page.screenshot(path=os.path.join(OUT, f"{tag}_t1_playing.png"))
        page.wait_for_timeout(12000)
        print(tag, "after", page.evaluate(state)); page.screenshot(path=os.path.join(OUT, f"{tag}_t2_after.png"))
        page.click("#btn-pillars-tape"); page.wait_for_timeout(500)
        print(tag, "pinned", page.evaluate(state)); page.screenshot(path=os.path.join(OUT, f"{tag}_t3_pinned.png"))
        page.click("#btn-pillars-tape"); page.wait_for_timeout(500)
        print(tag, "folded by hand", page.evaluate(state), "errors", errors)
        ctx.close()
    b.close()
