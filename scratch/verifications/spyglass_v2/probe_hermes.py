"""Screenshots of Hermes on the Natural Bridge from several angles (the kneel with the glass, the hide), serving this checkout's web/.
Usage: python3 probe_hermes.py OUT_DIR [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8861
W.BASE = f"http://127.0.0.1:{PORT}"; server = W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save.update({"the_eclipse_active_seeker": "Silvia", "order_story_dream_v3": "done", "order_cairn4_march_start": str(int(time.time() * 1000) - 18 * 3600 * 1000 - 300000)})
SHOTS = [("front", [99.8, 2.1, 15.4], [106.0, 0.7, 8.4], 34), ("side_w", [96, 1.2, 8.5], [105.6, 0.6, 8.5], 30), ("side_e", [115, 1.2, 9], [105.6, 0.6, 8.5], 30),
         ("below", [104, -6, 22], [105.6, 0.2, 8.5], 34), ("behind", [106.5, 2.4, 1.0], [105.6, 0.8, 9.5], 40), ("close", [103.6, 1.1, 10.6], [105.6, 0.9, 8.5], 30)]
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, save)
    page.set_viewport_size({"width": 1440, "height": 900})
    page.route("**/*supabase.co/**", lambda r: r.abort())
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
    page.evaluate("document.querySelectorAll('.previously-overlay').forEach(o => o.remove())")
    page.evaluate("window.__spyglass.fast(); window.openBridgeSpyglassModal()"); page.wait_for_timeout(2500)
    page.evaluate("window.__spyglass.fx('shotHermes')"); page.evaluate("window.__spyglass.frames(150, 1/30)"); page.wait_for_timeout(600)
    print("state", page.evaluate("window.__spyglass.state()"))
    for name, cp, cl, fov in SHOTS:
        page.evaluate(f"window.__spyglass.test().shot({cp}, {cl}, {fov}, 1, true)"); page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(OUT, f"kneel_{name}.png"), clip={"x": 0, "y": 70, "width": 975, "height": 830})
    print("errors", errors); b.close()
