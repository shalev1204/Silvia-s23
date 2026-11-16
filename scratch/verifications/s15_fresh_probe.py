"""Probe: Silvia's S15 state (intro seen, how-to seen, sigil hint secs) is cleared once. Usage: python3 scratch/verifications/s15_fresh_probe.py"""
import os, sys, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "audit"))
import web_smoke as W
from playwright.sync_api import sync_playwright
server = W.start_server()
seed = dict(W.DESERT_BASE, **W.DESERT_DONE, order_sun_monolith_completed="true", order_sun_monolith_awake="true", order_seal_cairn_2="true",
            order_monolith_gate_seal1="true", order_field_wire_step="14", order_field_wire_choices="[2,0,1,0,0,0,1,0,0,0,0,0,0,0]",
            order_labyrinth_march_start="1794866865449", order_labyrinth_fresh_v1="", order_labyrinth_howto="seen", order_labyrinth_cine_intro="seen", **{"order_hint_s15-sigil_secs": "35"}, **W.WIRE_PASSED)
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, seed)
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
    js = page.evaluate
    page.add_init_script("1")
    print("seeded now:", js("sessionStorage.getItem('__seeded')"))
    print(js("['order_labyrinth_howto','order_labyrinth_cine_intro','order_hint_s15-sigil_secs','order_labyrinth_march_start','order_labyrinth_fresh_v1'].map(k => localStorage.getItem(k))"))
    js("window.openLabyrinthModal()"); page.wait_for_timeout(1500)
    print("cinema active:", js("!!document.querySelector('#modal-sandstone-labyrinth .cine-skip, #modal-sandstone-labyrinth [class*=cine]')"), js("document.getElementById('modal-sandstone-labyrinth').innerText.slice(0,160)"))
    page.screenshot(path=os.path.join(os.environ.get('TMPDIR','/tmp'), 'fresh.png'))
    page.reload(); page.wait_for_timeout(2000)
    print("after reload, fresh flag kept and no wipe of new progress:", js("localStorage.getItem('order_labyrinth_fresh_v1')"))
    print(errors); b.close()
server.shutdown()
