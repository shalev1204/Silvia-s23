"""For every sight of the Spyglass: a ray from the eye to it (what stands in the way, if anything) and a screenshot through
the lens at its own draw. Usage: python3 probe_sights.py OUT_DIR [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8866
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
    print(page.evaluate("""() => { const S = window.__spyglass, g = S.gfx(), T = g.T, out = {};
      const ms = []; g.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh) && o.visible && !o.material.transparent) ms.push(o); });
      const eye = g.camera.position.clone(), rc = new T.Raycaster();
      for (const id of S.sights) { const t = S.test().sightPos ? null : null; }
      return ''; }"""))
    res = {}
    for sid in page.evaluate("window.__spyglass.sights"):
        page.evaluate(f"window.__spyglass.aim('{sid}', true)"); page.wait_for_timeout(700)
        r = page.evaluate("""() => { const g = window.__spyglass.gfx(), T = g.T, cam = g.camera; cam.updateMatrixWorld();
          const ms = []; g.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh) && o.visible) ms.push(o); });
          const rc = new T.Raycaster(); rc.setFromCamera(new T.Vector2(0, 0), cam);
          const h = rc.intersectObjects(ms, false).slice(0, 3);
          return h.map(x => [+x.distance.toFixed(1), x.object.geometry.type, x.object.isInstancedMesh ? 'inst' : '', x.object.name || '', x.object.parent && x.object.parent.type]); }""")
        st = page.evaluate("window.__spyglass.state()")
        res[sid] = {"zoom": st["zoom"], "hits": r}
        page.screenshot(path=os.path.join(OUT, f"sight_{sid}.png"), clip={"x": 0, "y": 70, "width": 975, "height": 830})
    print(json.dumps(res, indent=1))
    print("errors", errors); b.close()
