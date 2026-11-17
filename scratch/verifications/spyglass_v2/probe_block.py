"""Reads the colours baked into the meshes next to the wedged wagon (to find what renders white). Usage: python3 probe_block.py [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8872
W.BASE = f"http://127.0.0.1:{PORT}"; server = W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save.update({"the_eclipse_active_seeker": "Silvia", "order_story_dream_v3": "done", "order_cairn4_march_start": str(int(time.time() * 1000) - 18 * 3600 * 1000 - 300000)})
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS); ctx, page, errors = W.new_page(b, save)
    page.route("**/*supabase.co/**", lambda r: r.abort())
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
    page.evaluate("document.querySelectorAll('.previously-overlay').forEach(o => o.remove()); window.__spyglass.fast(); window.openBridgeSpyglassModal()")
    page.wait_for_timeout(6000)
    print(page.evaluate("""(() => { const g = window.__spyglass.gfx(), w = g.wagons[0].position, out = [];
      g.scene.traverse(o => { if (!o.isMesh && !o.isSprite) return; const p = new g.T.Vector3(); o.getWorldPosition(p); const d = p.distanceTo(w);
        if (d < 12 && o.geometry && /Icosa/.test(o.geometry.type) && !g.wagons.some(x => { let q = o; while (q) { if (q === x) return true; q = q.parent; } return false; })) {
          const c = o.geometry && o.geometry.attributes.color; out.push({ type: o.type, geo: o.geometry && o.geometry.type, d: +d.toFixed(1), scale: o.scale.toArray().map(v => +v.toFixed(2)), mat: o.material && o.material.type, col: o.material && o.material.color && o.material.color.getHexString(), pos: p.toArray().map(v => +v.toFixed(1)), vc: c ? Array.from(c.array.slice(0, 12)).map(v => +v.toFixed(2)) : null, vis: o.visible }); } });
      return JSON.stringify(out, null, 0); })()"""))
    print("errors", errors); b.close()
