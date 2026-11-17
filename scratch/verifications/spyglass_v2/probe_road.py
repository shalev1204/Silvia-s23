"""Screenshots of the cart road down the eastern bay: wide shots from several places, then the glass on the wagons.
Usage: python3 probe_road.py OUT_DIR [PORT] [only-wide]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8871
W.BASE = f"http://127.0.0.1:{PORT}"; server = W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save.update({"the_eclipse_active_seeker": "Silvia", "order_story_dream_v3": "done", "order_cairn4_march_start": str(int(time.time() * 1000) - 18 * 3600 * 1000 - 300000)})
WIDE = {
    "bay_west": ([60, 30, 180], [235, -110, 185], 50),
    "bay_south": ([120, 40, 420], [210, -120, 170], 50),
    "aerial": ([150, 330, 182], [195, -150, 183], 50),
    "landing1": ([200, -8, 315], [232, -26, 270], 44),
    "terraces_shot": ([36, 26, -46], [134, -44, 226], 30),
    "from_eye_wide": ([105, 0.95, 10.4], [200, -60, 200], 60),
}
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS); ctx, page, errors = W.new_page(b, save)
    page.set_viewport_size({"width": 1440, "height": 900}); page.route("**/*supabase.co/**", lambda r: r.abort())
    t0 = time.time()
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
    page.evaluate("document.querySelectorAll('.previously-overlay').forEach(o => o.remove()); window.__spyglass.fast(); window.openBridgeSpyglassModal()")
    for _ in range(300):
        st = page.evaluate("window.__spyglass.state()")
        if st["stage"] == "glass" and not st["busy"]: break
        page.wait_for_timeout(200)
    print("to glass s", round(time.time() - t0, 1))
    page.wait_for_timeout(1200)
    clip = {"x": 0, "y": 70, "width": 975, "height": 830}
    if len(sys.argv) <= 3:
        for nm, z in [("wagons", 1), ("oilcloth", 2), ("hairpin", 2)]:
            page.evaluate(f"window.__spyglass.aim('{nm}', false)"); page.evaluate(f"window.__spyglass.test().zoom({z})"); page.wait_for_timeout(900)
            page.screenshot(path=os.path.join(OUT, f"glass_{nm}.png"), clip=clip)
        for yaw, pitch in [(150, -18), (165, -10)]:
            page.evaluate("window.__spyglass.test().zoom(0)"); page.evaluate(f"window.__spyglass.test().look({yaw}, {pitch})"); page.wait_for_timeout(700)
            page.screenshot(path=os.path.join(OUT, f"glass0_{yaw}_{pitch}.png"), clip=clip)
    page.evaluate("window.__spyglass.lower()"); page.wait_for_timeout(1200)
    for nm, (pp, ll, fov) in WIDE.items():
        page.evaluate(f"window.__spyglass.test().shot({pp}, {ll}, {fov}, 1, true)"); page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(OUT, f"wide_{nm}.png"), clip=clip)
    for k in range(3):   # close to each wagon, to see the work on it
        x, y, z = page.evaluate(f"window.__spyglass.gfx().wagons[{k}].position.toArray()")
        page.evaluate(f"window.__spyglass.test().shot([{x - 8}, {y + 4}, {z + 7}], [{x}, {y + 1.2}, {z}], 40, 1, true)"); page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(OUT, f"wide_wagon{k}.png"), clip=clip)
    print("errors", errors); b.close()
