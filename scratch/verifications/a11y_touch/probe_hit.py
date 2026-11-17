"""For one station window on the iPad viewport, reports what a finger 21 px from the centre of a control actually hits.
Usage: python3 probe_hit.py OPEN_FN MODAL_ID SELECTOR [PORT]"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.abspath(os.path.join(HERE, "..", "..", "..", "scripts", "audit")))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
fn, mid, sel = sys.argv[1:4]
PORT = int(sys.argv[4]) if len(sys.argv) > 4 else 8882
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx = b.new_context(viewport={"width": 1180, "height": 820}, has_touch=True)
    page = ctx.new_page(); page.add_init_script(W.SEED_JS % json.dumps(W.A11Y_SEED))
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
    page.evaluate(f"window.{fn}()"); page.wait_for_timeout(1200)
    print(json.dumps(page.evaluate("""([mid, sel]) => { const el = document.querySelector('#' + mid + ' ' + sel); const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2, nm = e => e ? e.tagName + '#' + e.id + '.' + (e.className || '') : null;
      const pb = getComputedStyle(el, '::before');
      return { rect: [r.left, r.top, r.width, r.height], parent: nm(el.parentElement), pos: getComputedStyle(el).position, before: [pb.content, pb.position, pb.width, pb.height],
        hits: [[-21,0],[21,0],[0,-21],[0,21]].map(([dx,dy]) => nm(document.elementFromPoint(cx+dx, cy+dy))) }; }""", [mid, sel]), indent=1))
    b.close()
