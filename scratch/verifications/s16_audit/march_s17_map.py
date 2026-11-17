"""Audit (part 4): Silvia's save after Station 16 and Wire 21, two hours into the walk to the Arch of the Solstice:
the 3D desert map with Hermes on the route, the notebook page of Cairn IV, and the satchel's "new" marker.
Usage: python3 scratch/verifications/s16_audit/march_s17_map.py OUT_DIR"""
import os, sys, json, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read()
i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
now = int(time.time() * 1000)
journal = json.loads(save["order_journal"]); journal["s16"] = {"at": now - 3 * 3600e3, "fails": 2, "notes": 1, "restarts": 0, "arrived": now - 4 * 3600e3}
seed = dict(save, **W.SILVIA, order_story_dream_v3="done",
            order_cairn4_march_start=str(now - 26 * 3600 * 1000), order_bridge_spyglass=json.dumps({"done": True, "choice": "trail"}),
            order_cairn_iv_completed="true", order_seal_cairn_4="true", order_cairn4_awake="true", order_cairn4_verses="3",
            order_field_wire_step="22", order_field_wire_choices=json.dumps(json.loads(save["order_field_wire_choices"]) + [None, 1, None, 2]),
            order_wire_rests="[20]", order_cairn5_march_start=str(now - 2 * 3600 * 1000), order_journal=json.dumps(journal))
LOG = {}
W.BASE = "http://127.0.0.1:8884"; server = W.start_server(port=8884)
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, seed)
    page.set_viewport_size({"width": 1440, "height": 900})
    js = page.evaluate
    page.goto(f"{W.BASE}/index.html?cloud=0", wait_until="load"); page.wait_for_timeout(4000)
    js("(() => { const c = document.querySelector('#view-trail canvas'); if (c) c.scrollIntoView({block:'center'}); })()"); page.wait_for_timeout(2500)
    page.screenshot(path=f"{OUT}/m1_map3d_marching.png")
    LOG["hud"] = js("[...document.querySelectorAll('#view-trail [class*=hud], #view-trail [class*=eta], #view-trail [class*=status]')].map(e => e.innerText).filter(Boolean).slice(0, 6)")
    LOG["desert_state"] = js("(() => { try { return { lvl: localStorage.getItem('order_desert3d_shown_lvl'), solsticeProgress: window.getSolsticeMarchProgress(), eta: window.getSolsticeMarchEta() } } catch (e) { return String(e) } })()")
    js("document.querySelector('[data-view=\"view-chronicles\"]').click()"); page.wait_for_timeout(3000)
    LOG["s16_page"] = js("(() => { const all = [...document.querySelectorAll('.notebook-page, [class*=notebook] article, [class*=nb-page]')]; const p = all.find(e => /Cairn IV/.test(e.innerText)); if (p) { p.scrollIntoView({block:'center'}); return p.innerText; } return null })()")
    page.wait_for_timeout(800)
    page.screenshot(path=f"{OUT}/m2_notebook_s16.png")
    LOG["errors"] = errors
    b.close()
server.shutdown()
print(json.dumps(LOG, indent=1, ensure_ascii=False))
