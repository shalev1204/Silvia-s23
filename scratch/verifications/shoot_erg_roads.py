"""Three Erg roads: seed hours 9/12/14 at a given progress, screenshot the 3D map, print Hermes position over time."""
import os, sys, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "audit"))
import web_smoke as W
from playwright.sync_api import sync_playwright
OUT = os.path.join(os.path.dirname(__file__), "shots")
frac = float(sys.argv[1]) if len(sys.argv) > 1 else 0.5
server = W.start_server()
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    for hours, name in ((9, "fast"), (12, "mid"), (14, "long")):
        now = int(time.time() * 1000)
        seed = dict(W.DESERT_BASE, order_desert_lexicon_completed="true", order_oasis_clepsydra_completed="true", order_gates_scene_completed="true",
                    order_cairn1_completed="true", order_salt_playa_completed="true",
                    order_monolith_march_hours=str(hours), order_monolith_march_start=str(int(now - frac * hours * 3600 * 1000)),
                    order_active_map_path="desert", order_field_wire_step="10")
        ctx, page, errors = W.new_page(b, seed)
        page.set_viewport_size({"width": 1100, "height": 900})
        page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(1500)
        page.evaluate("document.querySelector('[data-view=\"view-trail\"]').click()"); page.wait_for_timeout(500)
        page.evaluate("window.showDesertMap && window.showDesertMap(false)"); page.wait_for_timeout(45000)
        d = page.evaluate("(() => { const q = window.Desert3D.debug(); return [q.shownD, q.targetD, q.hermes.x, q.hermes.y]; })()")
        print(name, hours, "shownD/targetD/pos", [round(v) for v in d], "legend", page.evaluate("document.querySelector('.d3-hud, #desert3d-hud') && document.querySelector('.d3-hud, #desert3d-hud').textContent"))
        print(" landmarks", page.evaluate("[...document.querySelectorAll('.d3-marker.is-landmark .d3-label')].map(e => e.textContent)"))
        page.locator("#desert3d-stage").screenshot(path=os.path.join(OUT, "erg_%s.png" % name))
        print(" errors", errors[:3]); ctx.close()
    b.close()
server.shutdown()
