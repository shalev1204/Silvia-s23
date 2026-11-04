"""Screenshots of Station 13's 3D scene (scenery check). Run: python3 scratch/verifications/shoot_clepsydra.py"""
import json, os, sys, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "audit"))
import web_smoke as W
from playwright.sync_api import sync_playwright

OUT = os.path.join(os.path.dirname(__file__), "shots")
gate = json.dumps({"seen0": True, "reply0": 0, "seen1": True, "reply1": 0, "seen2": True, "reply2": 0, "seen3": True, "reply3": 0, "seen4": True, "reply4": 0})
seed = dict(W.DESERT_BASE, the_eclipse_active_seeker="Carles", order_desert_lexicon_completed="true",
            order_field_wire_step="6", order_clepsydra_march_start="1", order_clepsydra_march_bypassed="true",
            order_clepsydra_howto="seen", order_chasm_wire=gate)
server = W.start_server()
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    ctx, page, errors = W.new_page(b, seed)
    page.set_viewport_size({"width": 1400, "height": 900})
    t0 = time.time()
    page.goto(f"{W.BASE}/index.html", wait_until="load")
    page.wait_for_timeout(2000)
    page.evaluate("window.__visions.open && window.__visions.open()")
    page.wait_for_timeout(5000)
    print("open+render s", round(time.time() - t0, 1))
    page.screenshot(path=os.path.join(OUT, "01_well0.png"))
    page.mouse.move(300, 300); page.mouse.down(); page.mouse.move(520, 250, steps=8); page.mouse.up()
    page.wait_for_timeout(1500)
    page.screenshot(path=os.path.join(OUT, "04_orbit.png"))
    page.evaluate("window.__visions.transmit(window.__visions.state().ok)")
    page.wait_for_timeout(3500)
    page.screenshot(path=os.path.join(OUT, "02_well1.png"))
    for _ in range(3):
        page.evaluate("window.__visions.transmit(window.__visions.state().ok)")
        page.wait_for_timeout(2500)
    page.wait_for_timeout(2000)
    page.screenshot(path=os.path.join(OUT, "03_key.png"))
    print("state", page.evaluate("window.__visions.state().phase"))
    print("errors", sorted(set(errors))[:6])
    b.close()
server.shutdown()
