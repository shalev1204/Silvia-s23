"""The Night on the Erg, three kinds. Run: python3 scratch/verifications/shoot_night.py [traveller ghost dark]"""
import os, sys, json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "audit"))
import web_smoke as W
from playwright.sync_api import sync_playwright

OUT = os.path.join(os.path.dirname(__file__), "shots")
FLAGS = {"traveller": {}, "ghost": {"seen": {"tracks": True}}, "dark": {"gaveOil": True}}
ONLY = sys.argv[1:] or list(FLAGS)
server = W.start_server()
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    for kind in ONLY:
        seed = dict(W.DESERT_BASE, the_eclipse_active_seeker="Carles", order_gates_flags=json.dumps(FLAGS[kind]), order_gates_scene_completed="true")
        ctx, page, errors = W.new_page(b, seed)
        page.set_viewport_size({"width": 1500, "height": 900})
        page.on("pageerror", lambda e: print("PAGEERROR", e))
        page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(1200)
        page.evaluate("window.openNightErgModal(function(){window.__done=1})")
        page.wait_for_timeout(2500)
        page.evaluate("document.getAnimations().forEach(a=>{try{a.finish()}catch(e){}})")
        print(kind, "title", page.inner_text("#night-title-kind"))
        step = 0
        for _ in range(14):
            if page.is_visible("#night-finish-card"): break
            page.evaluate("window.__nightErg && window.__nightErg.fast()")
            page.wait_for_timeout(900)
            if page.is_visible("#night-choices button"):
                if step == 1: page.screenshot(path=os.path.join(OUT, f"n_{kind}_mid.png"))
                ids = page.eval_on_selector_all("#night-choices button", "b=>b.map(x=>x.id)")
                print(kind, "choices", ids)
                page.click("#night-choices button"); step += 1
                page.wait_for_timeout(600)
        page.wait_for_selector("#night-finish-card", state="visible", timeout=30000)
        page.wait_for_timeout(700)
        page.screenshot(path=os.path.join(OUT, f"n_{kind}_end.png"))
        page.click("#btn-night-finish"); page.wait_for_timeout(500)
        print(kind, "saved", page.evaluate("[localStorage.order_night_erg, localStorage.order_gates_flags, window.__done]"))
        print(kind, "errors", sorted(set(errors))[:6])
        ctx.close()
    b.close()
server.shutdown()
