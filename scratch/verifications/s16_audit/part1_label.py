"""S16 audit, part 1: is the Cairn IV label on the Grand Desert Map clipped or overlapping other pins (1440x900)?
Usage: python3 scratch/verifications/s16_audit/part1_label.py OUT_DIR [shift_hours_back] [tag]"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts", "audit")); sys.path.insert(0, HERE)
import web_smoke as W  # noqa: E402
from load_save import save  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; SHIFT = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0; TAG = sys.argv[3] if len(sys.argv) > 3 else "now"
s = dict(save)
if SHIFT: s["order_cairn4_march_start"] = str(int(s["order_cairn4_march_start"]) - int(SHIFT * 3600 * 1000))
W.BASE = "http://127.0.0.1:8841"; server = W.start_server(port=8841)
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, s)
    page.set_viewport_size({"width": 1440, "height": 900})
    js = page.evaluate
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(5000)
    js("document.querySelector('.desert3d-hud-status').parentElement.scrollIntoView({block:'center'})"); page.wait_for_timeout(2500)
    print(json.dumps(js("""(() => { const stage = document.querySelector('.desert3d-hud-status').parentElement.getBoundingClientRect();
      const out = { stage: [Math.round(stage.left), Math.round(stage.top), Math.round(stage.right), Math.round(stage.bottom)] };
      out.items = [...document.querySelectorAll('.d3-marker')].filter(m => m.style.display !== 'none').map(m => { const pin = m.querySelector('.d3-pin, .d3-orb'); const lab = m.querySelector('.d3-label');
        const r = el => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)]; };
        return { text: (m.innerText||'hermes').replace(/\\s+/g,' ').slice(0,60), cls: m.className, pin: r(pin), label: r(lab), labelVisible: lab ? getComputedStyle(lab).opacity + '/' + getComputedStyle(lab).display : null }; }).filter(x => x.pin && x.pin[0] < 900 && x.pin[1] > 500);
      return out; })()"""), indent=0))
    page.screenshot(path=f"{OUT}/c_{TAG}_label_zoom.png", clip={"x": 350, "y": 600, "width": 500, "height": 300})
    b.close()
server.shutdown()
