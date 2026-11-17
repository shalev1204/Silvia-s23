"""After the fixes: the Cairn IV reward comes into view by itself, leaving shows the Tuning Pebble card, then the Field Wire.
Usage: python3 probe_leave.py OUT_DIR [PORT]"""
import os, sys, json, time
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8876
W.BASE = f"http://127.0.0.1:{PORT}"; server = W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read()
i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
seed = dict(save, **W.SILVIA)
seed["order_cairn4_march_start"] = str(int(time.time() * 1000) - int(18.3 * 3600 * 1000))
seed["order_bridge_spyglass"] = json.dumps({"done": True, "choice": "hide"})
seed["order_cairn4_cine_intro"] = "seen"; seed["order_cairn4_howto"] = "seen"
L = {}
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, seed)
    page.set_viewport_size({"width": 1440, "height": 900})
    js = page.evaluate
    page.goto(f"{W.BASE}/index.html?cloud=0", wait_until="load"); page.wait_for_timeout(3000)
    js("window.openCairnFourModal()"); page.wait_for_timeout(1500)
    page.fill("#pillars-key-input", "RESOUND"); page.click("#btn-pillars-speak"); page.wait_for_timeout(1200)
    for k, v in enumerate(js("window.__cairn4.verses")):
        for c in v["calls"]:
            js(f"window.__cairn4.mark('{c['side']}{c['d']}')")
        js("window.__cairn4.sing()"); page.wait_for_timeout(400 if k < 2 else 50)
    page.wait_for_timeout(3500)
    L["victory_in_view"] = js("(() => { const r = document.getElementById('pillars-victory').getBoundingClientRect(), f = document.getElementById('btn-pillars-finish').getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), finishBottom: Math.round(f.bottom), finishVisible: f.bottom <= innerHeight && f.top >= 0 }; })()")
    page.screenshot(path=f"{OUT}/1_reward.png")
    L["victory_text"] = js("document.getElementById('pillars-victory').innerText.slice(0, 600)")
    page.click("#btn-pillars-finish"); page.wait_for_timeout(1200)
    L["item_modal"] = js("getComputedStyle(document.getElementById('modal-item-acquired')).display")
    L["item_title"] = js("(document.getElementById('iac-title') || {}).textContent")
    page.screenshot(path=f"{OUT}/2_pebble_card.png")
    js("(() => { const m = document.getElementById('modal-item-acquired'); const b = m.querySelector('.iac-collect, button.btn-primary, button'); b && b.click(); })()"); page.wait_for_timeout(2500)
    L["view"] = js("document.body.getAttribute('data-active-view')")
    L["toast"] = js("(document.getElementById('desert-toast-banner') || {}).textContent || ''")
    L["new_dot"] = js("getComputedStyle(document.getElementById('bsi-new-dot')).display")
    page.screenshot(path=f"{OUT}/3_wire.png")
    L["errors"] = errors
    print(json.dumps(L, indent=1, ensure_ascii=False))
    b.close()
