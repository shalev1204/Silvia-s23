"""Raycasts down onto the Natural Bridge near Hermes's place to find the edge of the deck. Usage: python3 probe_deck.py [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8862
W.BASE = f"http://127.0.0.1:{PORT}"; server = W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save.update({"the_eclipse_active_seeker": "Silvia", "order_story_dream_v3": "done", "order_cairn4_march_start": str(int(time.time() * 1000) - 18 * 3600 * 1000 - 300000)})
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS); ctx, page, errors = W.new_page(b, save)
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
    page.evaluate("document.querySelectorAll('.previously-overlay').forEach(o => o.remove()); window.__spyglass.fast(); window.openBridgeSpyglassModal()"); page.wait_for_timeout(2500)
    print(page.evaluate("""() => { const g = window.__spyglass.gfx(), T = g.T, rc = new T.Raycaster(), out = [];
      const hide = new Set(); g.hermes.traverse(o => hide.add(o)); const ms = []; g.scene.traverse(o => { if (o.isMesh && !o.isInstancedMesh && !hide.has(o) && o.visible) ms.push(o); });
      for (const x of [103, 105.6, 108]) for (let z = 3; z <= 11; z += 0.5) { rc.set(new T.Vector3(x, 6, z), new T.Vector3(0, -1, 0));
        const h = rc.intersectObjects(ms, false)[0];
        out.push([x, z, h ? +h.point.y.toFixed(2) : null, h ? (h.object.name || h.object.geometry.type) : null]); }
      return JSON.stringify(out); }"""))
    b.close()
