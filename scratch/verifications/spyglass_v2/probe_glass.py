"""The eye at the glass: one screenshot per draw of the tube, and a drag from right to left must turn the glass to the right
(bearing grows), with a short glide after a flick. Usage: python3 probe_glass.py OUT_DIR [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8864
W.BASE = f"http://127.0.0.1:{PORT}"; server = W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save.update({"the_eclipse_active_seeker": "Silvia", "order_story_dream_v3": "done", "order_cairn4_march_start": str(int(time.time() * 1000) - 18 * 3600 * 1000 - 300000)})
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS); ctx, page, errors = W.new_page(b, save)
    page.set_viewport_size({"width": 1440, "height": 900}); page.route("**/*supabase.co/**", lambda r: r.abort())
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
    page.evaluate("document.querySelectorAll('.previously-overlay').forEach(o => o.remove()); window.__spyglass.fast(); window.openBridgeSpyglassModal()")
    for _ in range(300):
        st = page.evaluate("window.__spyglass.state()")
        if st["stage"] == "glass" and not st["busy"]: break
        page.wait_for_timeout(200)
    page.evaluate("window.__spyglass.slow()"); page.wait_for_timeout(1200)
    st = page.evaluate("window.__spyglass.state()"); print("start", st["zoom"], st["fov"], st["bearing"], st["pitch"])
    box = page.evaluate("(() => { const r = document.querySelector('#spy-stage canvas').getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })()")
    cx, cy = box[0] + box[2] / 2, box[1] + box[3] / 2
    # slow drag right -> left: the glass must turn right (bearing up)
    b0 = st["bearing"]; page.mouse.move(cx + 150, cy); page.mouse.down()
    for k in range(15): page.mouse.move(cx + 150 - k * 20, cy); page.wait_for_timeout(30)
    page.wait_for_timeout(200); page.mouse.up(); page.wait_for_timeout(500)
    st = page.evaluate("window.__spyglass.state()"); print("drag R->L bearing", b0, "->", st["bearing"])
    # drag down: the glass looks up
    p0 = st["pitch"]; page.mouse.move(cx, cy - 100); page.mouse.down()
    for k in range(10): page.mouse.move(cx, cy - 100 + k * 20); page.wait_for_timeout(30)
    page.wait_for_timeout(200); page.mouse.up(); page.wait_for_timeout(500)
    st = page.evaluate("window.__spyglass.state()"); print("drag down pitch", p0, "->", st["pitch"])
    # flick: fast move then release, it glides on
    b1 = st["bearing"]; page.mouse.move(cx + 100, cy); page.mouse.down()
    for k in range(5): page.mouse.move(cx + 100 - k * 40, cy); page.wait_for_timeout(16)
    page.mouse.up(); b2 = page.evaluate("window.__spyglass.state()")["bearing"]; page.wait_for_timeout(900)
    b3 = page.evaluate("window.__spyglass.state()")["bearing"]; print("flick", b1, "at release", b2, "after glide", b3)
    page.evaluate("window.__spyglass.aim('wagons', false)")
    for z in range(4):
        page.evaluate(f"window.__spyglass.test().zoom({z})"); page.wait_for_timeout(900)
        page.screenshot(path=os.path.join(OUT, f"zoom{z}.png"))
    print("errors", errors); b.close()
