"""Is anything solid between the eye and each sight? Rays to the sight's point and to a small cross around it.
Usage: python3 probe_occlusion.py [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8867
W.BASE = f"http://127.0.0.1:{PORT}"; server = W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save.update({"the_eclipse_active_seeker": "Silvia", "order_story_dream_v3": "done", "order_cairn4_march_start": str(int(time.time() * 1000) - 18 * 3600 * 1000 - 300000)})
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS); ctx, page, errors = W.new_page(b, save)
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
    page.evaluate("document.querySelectorAll('.previously-overlay').forEach(o => o.remove()); window.__spyglass.fast(); window.openBridgeSpyglassModal()"); page.wait_for_timeout(3000)
    print(json.dumps(page.evaluate("""() => { const S = window.__spyglass, g = S.gfx(), T = g.T, E = S.test().eye, out = {};
      const ms = []; g.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh) && !(o.material && (o.material.transparent || o.material.depthWrite === false))) ms.push(o); });
      const hide = new Set(); g.hermes.traverse(o => hide.add(o));
      const eye = new T.Vector3(E.x, E.y, E.z), rc = new T.Raycaster();
      for (const id of S.sights) { const t = new T.Vector3().fromArray(S.test().sight(id)), d = t.distanceTo(eye), row = [];
        for (const off of [[0,0],[0,1.5],[0,-1.5],[1.5,0],[-1.5,0]]) { const tt = t.clone().add(new T.Vector3(off[0], off[1], 0)), dir = tt.clone().sub(eye).normalize();
          rc.set(eye, dir); rc.far = d - 3;
          const h = rc.intersectObjects(ms.filter(m => !hide.has(m)), false)[0];
          row.push(h ? [+h.distance.toFixed(1), h.object.geometry.type + (h.object.isInstancedMesh ? '*' : ''), h.point.toArray().map(v => +v.toFixed(1))] : 'clear'); }
        out[id] = { dist: +d.toFixed(1), at: t.toArray().map(v => +v.toFixed(1)), rays: row }; }
      return out; }"""), indent=0))
    b.close()
