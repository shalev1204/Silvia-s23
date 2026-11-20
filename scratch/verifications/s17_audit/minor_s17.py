"""Station 17: the round shown once on a phone, and How to play telling the seconds each ray waits now.
Usage: python3 minor_s17.py OUT_DIR [PORT]"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8891
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
base = dict(W.SILVIA, order_cairn_iv_completed="true", order_cairn5_awake="true")
cases = [("night", dict(base, order_cairn5_dawn_done="true", order_cairn5_lamp="lit"), None),
         ("dark", dict(base, order_cairn5_lamp="dark"), "30 seconds (45 for the first, set without a light)"),
         ("hinted", dict(base, order_cairn5_dawn_hint="true"), "45 seconds"),
         ("plain", dict(base, order_cairn5_lamp="lit"), "30 seconds")]
ok = True
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    for tag, seed, want in cases:
        ctx, page, errors = W.new_page(b, seed)
        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(f"{W.BASE}/index.html?tester=1", wait_until="load"); page.wait_for_timeout(2500)
        js = page.evaluate
        js("window.openSolsticeModal()"); page.wait_for_timeout(1500)
        if want is None:
            vis = js("[...document.querySelectorAll('#modal-solstice-arch *')].filter(e => e.children.length === 0 && /Signal 1 of 4/.test(e.textContent) && e.getBoundingClientRect().width > 2).length")
            page.screenshot(path=os.path.join(OUT, "phone_night.png"))
            r = vis == 1; print(("PASS" if r else "FAIL"), "'Signal 1 of 4' shown once on a phone:", vis)
        else:
            js("document.getElementById('btn-solstice-howto').click()"); page.wait_for_timeout(300)
            got = js("document.getElementById('solstice-howto-secs').textContent")
            r = got == want; print(("PASS" if r else "FAIL"), tag, "How to play says:", got)
        r = r and not errors; ok &= r
        if errors: print("  errors", errors[:3])
        ctx.close()
    b.close()
sys.exit(0 if ok else 1)
