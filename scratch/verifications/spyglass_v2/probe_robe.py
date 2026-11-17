"""Numbers of Hermes's robe while he kneels at the lip: the body's drop, the world height of the hem, the legs and the ground.
Usage: python3 probe_robe.py [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8863
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save.update({"the_eclipse_active_seeker": "Silvia", "order_story_dream_v3": "done", "order_cairn4_march_start": str(int(time.time() * 1000) - 18 * 3600 * 1000 - 300000)})
JS = """() => { const g = window.__spyglass.gfx(), T = g.T, h = g.hermes; h.updateMatrixWorld(true);
  const box = o => { const b = new T.Box3().setFromObject(o); return [+b.min.y.toFixed(3), +b.max.y.toFixed(3)]; };
  const body = h.children.find(c => c.isGroup && c.children.length > 5);
  const robe = body && body.children.find(c => c.isGroup && c.children[0] && c.children[0].geometry && c.children[0].geometry.type === 'LatheGeometry' || (c.isGroup && c.children[0] && c.children[0].isMesh && c.children[0].geometry.attributes.position.count > 400));
  const ray = new T.Raycaster(new T.Vector3(h.position.x, 5, h.position.z), new T.Vector3(0, -1, 0)); ray.camera = g.camera; h.visible = false;
  const hits = []; for (const [dx, dz] of [[0,0],[0.3,0],[-0.3,0],[0,0.3],[0,-0.3],[0,0.9]]) { ray.set(new T.Vector3(h.position.x + dx, 5, h.position.z + dz), new T.Vector3(0, -1, 0)); hits.push(ray.intersectObjects(g.scene.children, true).filter(x => x.object.visible && x.object.geometry.attributes.position.count > 50).slice(0, 2).map(x => [+x.point.y.toFixed(3), x.object.geometry.attributes.position.count])); } const hit = null; h.visible = true;
  return { pos: h.position.toArray().map(v => +v.toFixed(2)), scale: h.scale.x, bodyY: body && +body.position.y.toFixed(3), bodyRx: body && +body.rotation.x.toFixed(3),
    hermes: box(h), big: (() => { const o = []; h.traverse(m => { if (m.isMesh && m.geometry.attributes.position.count > 300) o.push([m.geometry.attributes.position.count, box(m)]); }); return o; })(), legs: h.children.filter(c => c !== body).map(box), ground: hits }; }"""
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, save)
    page.route("**/*supabase.co/**", lambda r: r.abort())
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
    page.evaluate("document.querySelectorAll('.previously-overlay').forEach(o => o.remove())")
    page.evaluate("window.__spyglass.fast(); window.openBridgeSpyglassModal()"); page.wait_for_timeout(2500)
    print("standing", json.dumps(page.evaluate(JS)))
    page.evaluate("window.__spyglass.fx('shotHermes')"); page.evaluate("window.__spyglass.frames(150, 1/30)"); page.wait_for_timeout(400)
    print("kneel", json.dumps(page.evaluate(JS)))
    print("errors", errors); b.close()
