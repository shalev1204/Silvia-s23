"""S16 audit, part 1: the Grand Desert Map with Silvia's save (march to Cairn IV): stage, Hermes, HUD, route.
Usage: python3 scratch/verifications/s16_audit/part1_map.py OUT_DIR [shift_hours_back] [tag]"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts", "audit")); sys.path.insert(0, HERE)
import web_smoke as W  # noqa: E402
from load_save import save  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
SHIFT = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0
TAG = sys.argv[3] if len(sys.argv) > 3 else "now"
s = dict(save)
if SHIFT: s["order_cairn4_march_start"] = str(int(s["order_cairn4_march_start"]) - int(SHIFT * 3600 * 1000))
W.BASE = "http://127.0.0.1:8841"; server = W.start_server(port=8841)
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, s)
    page.add_init_script("window.__wireFast = false; delete window.__wireAllChapters;")
    page.set_viewport_size({"width": 1440, "height": 900})
    js = page.evaluate
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(5000)
    print("progress", js("window.getCairnFourMarchProgress && window.getCairnFourMarchProgress()"), "over", js("window.isCairnFourMarchOver()"))
    st = page.query_selector(".desert3d-stage, #desert3d-stage, .desert-3d-stage")
    print("stage", js("(() => { const s = document.querySelector('.desert3d-hud-status'); const st = s && s.parentElement; const r = st && st.getBoundingClientRect(); return st ? [st.className, r.top + scrollY, r.height] : null })()"))
    js("(() => { const s = document.querySelector('.desert3d-hud-status').parentElement; s.scrollIntoView({block:'center'}); })()"); page.wait_for_timeout(2500)
    page.screenshot(path=f"{OUT}/c_{TAG}_map_stage.png")
    print("HUD", js("document.querySelector('.desert3d-hud-text').textContent"))
    print("hermes", js("(() => { const h = document.querySelector('.d3-hermes'); const r = h.getBoundingClientRect(); return [h.style.display, Math.round(r.x), Math.round(r.y)] })()"))
    print("cairn4 pin", js("(() => { const m = [...document.querySelectorAll('.d3-marker')].find(m => /CAIRN IV/.test(m.innerText)); if (!m) return null; const r = m.getBoundingClientRect(); return [m.className, m.innerText.replace(/\\s+/g,' '), Math.round(r.x), Math.round(r.y)] })()"))
    print("errors:", errors[:8])
    b.close()
server.shutdown()
