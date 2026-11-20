"""Station 17, the night signal: the hint over the scene steps aside while the tower speaks, a held press turns long, ⌫ takes back one flash.
Usage: python3 signal_ux.py [PORT]"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8895
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
seed = dict(W.SILVIA, **{"order_cairn_iv_completed": "true", "order_cairn5_awake": "true", "order_cairn5_dawn_done": "true", "order_cairn5_lamp": "lit",
        "order_inventory_relics": json.dumps(["signal_mirror"])})
ok = True
def check(c, name):
    global ok; ok &= bool(c); print(("PASS " if c else "FAIL ") + name)
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, seed)
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(f"{W.BASE}/index.html?tester=1", wait_until="load"); page.wait_for_timeout(2500)
    js = page.evaluate
    js("window.openSolsticeModal()"); page.wait_for_timeout(1200)
    js("window.__cairn5.raiseMirror()"); page.wait_for_timeout(1300)
    aim = "document.getElementById('solstice3d-aim').classList.contains('is-on')"
    check(not js(aim), "the hint over the scene steps aside while the tower speaks")
    check(js("document.querySelectorAll('#solstice-tower-trace .sp-s, #solstice-tower-trace .sp-l').length") >= 1, "the tower's flashes are drawn as pips")
    page.wait_for_timeout(2500)
    check(js(aim), "the hint comes back when the tower is silent")
    fl = page.locator("#btn-solstice-flash")
    fl.dispatch_event("pointerdown", {"pointerId": 1}); page.wait_for_timeout(150)
    check(not js("document.getElementById('btn-solstice-flash').classList.contains('is-long')"), "a short press is not yet long")
    page.wait_for_timeout(400)
    check(js("document.getElementById('btn-solstice-flash').classList.contains('is-long')"), "a held press turns long")
    fl.dispatch_event("pointerup", {"pointerId": 1}); page.wait_for_timeout(100)
    fl.dispatch_event("pointerdown", {"pointerId": 1}); page.wait_for_timeout(80); fl.dispatch_event("pointerup", {"pointerId": 1})
    check(js("document.querySelectorAll('#solstice-pulses .sp-l').length") == 1 and js("document.querySelectorAll('#solstice-pulses .sp-s').length") == 1, "her flashes: one long, one short")
    page.click("#btn-solstice-clear"); page.wait_for_timeout(100)
    check(js("document.querySelectorAll('#solstice-pulses i').length") == 1, "⌫ takes back the last flash")
    page.click("#btn-solstice-clear"); page.wait_for_timeout(100)
    check(js("document.querySelectorAll('#solstice-pulses i').length") == 0 and "your flashes" in js("document.getElementById('solstice-pulses').textContent"), "a second ⌫ clears them all")
    check(not errors, "no errors " + "; ".join(errors[:3]))
    b.close()
sys.exit(0 if ok else 1)
