"""The challenge: three reasons, no message sent. Run: python3 scratch/verifications/shoot_challenge.py [wrong right back]"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "audit"))
import web_smoke as W
from playwright.sync_api import sync_playwright
OUT = os.path.join(os.path.dirname(__file__), "shots")
PICK = {"wrong": "lc_oracle", "wrong2": "lc_servant", "right": "lc_dusk", "back": "lc_back"}
MODE = sys.argv[1:] or list(PICK)
server = W.start_server()
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    for mode in MODE:
        ctx, page, errors = W.new_page(b, dict(W.DESERT_BASE, the_eclipse_active_seeker="Carles"))
        page.set_viewport_size({"width": 1500, "height": 900})
        page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(1200)
        page.evaluate("window.openGatesTowerIIModal()"); page.wait_for_timeout(1500)
        # jump to the 'after' stage the way a played scene would leave it
        page.evaluate("""() => { const d = window.__gates.dlg(); d.token++; d.knows = true; d.stage = 'after'; d.tone = 'humble';
            d.regard = 2; d.flags = { lieHeard: true }; d.seen = { arch: true }; d.asked = { where: true }; d.busy = false; window.__gates.render(); }""")
        page.wait_for_timeout(400)
        ids = lambda: page.eval_on_selector_all("#gates-choices button", "b=>b.map(x=>x.id.replace('choice-',''))")
        logn = lambda: page.evaluate("document.querySelectorAll('#gates-log .gl-row').length")
        print(mode, "menu", ids())
        before = logn()
        page.click("#choice-lie_catch"); page.wait_for_timeout(400)
        print(mode, "after clicking Challenge:", ids(), "| messages sent:", logn() - before)
        page.screenshot(path=os.path.join(OUT, f"challenge_{mode}_menu.png"))
        page.click("#choice-" + PICK[mode])
        for _ in range(100):
            page.wait_for_timeout(400)
            if page.is_visible("#iac-btn-collect"): page.click("#iac-btn-collect"); continue
            if not page.is_visible("#modal-item-acquired"): page.evaluate("window.__gates && window.__gates.fast()")
            if page.evaluate("!window.__gates.dlg().busy"): break
        page.wait_for_timeout(600)
        print(mode, "state", page.evaluate("(() => { const d = window.__gates.dlg(); return [d.stage, d.regard, JSON.stringify(d.flags)]; })()"), "| menu now", ids())
        page.screenshot(path=os.path.join(OUT, f"challenge_{mode}_end.png"))
        print(mode, "errors", errors[:3])
        ctx.close()
    b.close()
server.shutdown()
