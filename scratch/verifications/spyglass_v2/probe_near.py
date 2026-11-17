"""Lists every object drawn within 9 varas of the eye while the glass is up (anything of Hermes should be hidden).
Usage: python3 probe_near.py [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8870
W.BASE = f"http://127.0.0.1:{PORT}"; server = W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save.update({"the_eclipse_active_seeker": "Silvia", "order_story_dream_v3": "done", "order_cairn4_march_start": str(int(time.time() * 1000) - 18 * 3600 * 1000 - 300000)})
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS); ctx, page, errors = W.new_page(b, save)
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
    page.evaluate("document.querySelectorAll('.previously-overlay').forEach(o => o.remove()); window.__spyglass.fast(); window.openBridgeSpyglassModal()")
    for _ in range(300):
        st = page.evaluate("window.__spyglass.state()")
        if st["stage"] == "glass" and not st["busy"]: break
        page.wait_for_timeout(200)
    page.wait_for_timeout(1500)
    print(json.dumps(page.evaluate("""() => { const g = window.__spyglass.gfx(), T = g.T, E = window.__spyglass.test().eye, eye = new T.Vector3(E.x, E.y, E.z), out = [];
      g.scene.traverseVisible(o => { if (!(o.isMesh || o.isSprite || o.isPoints || o.isLine)) return; const b = new T.Box3().setFromObject(o); if (b.isEmpty()) return;
        const d = b.distanceToPoint(eye); if (d < 9) out.push([o.type, o.geometry && o.geometry.type, +d.toFixed(2), b.min.toArray().map(v => +v.toFixed(1)), b.max.toArray().map(v => +v.toFixed(1)), o.parent && o.parent.type]); });
      return out; }"""), indent=0))
    b.close()
