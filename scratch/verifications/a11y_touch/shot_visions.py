"""Screenshot of the Oasis Clepsydra window on the iPad viewport with every station played. Usage: python3 shot_visions.py OUT.png [PORT]"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.abspath(os.path.join(HERE, "..", "..", "..", "scripts", "audit")))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8885
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx = b.new_context(viewport={"width": 1180, "height": 820}, has_touch=True)
    page = ctx.new_page(); page.add_init_script(W.SEED_JS % json.dumps(W.A11Y_SEED))
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
    page.evaluate("window.openOasisClepsydraModal()"); page.wait_for_timeout(1500)
    page.screenshot(path=sys.argv[1])
    print(page.evaluate("""() => { const s = document.querySelector('#modal-oasis-visions .rw-loot'); const r = s && s.getBoundingClientRect();
      let e = s; const chain = []; while (e && e.id !== 'modal-oasis-visions') { chain.push(e.tagName + '.' + e.className); e = e.parentElement; } return { r: r && [r.left, r.top, r.width, r.height], chain }; }"""))
    b.close()
