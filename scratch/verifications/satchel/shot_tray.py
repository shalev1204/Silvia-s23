"""The 'Hermes asks' tray and the satchel's Use button, with Silvia's real save (Mac and iPad).
The S17 shots add only the flags that open the Arch. Usage: python3 shot_tray.py OUT_DIR [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8894
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save.update({"order_last_seen_at": str(int(time.time() * 1000))})
arch = dict(save, order_cairn_iv_completed="true", order_seal_cairn_4="true", order_cairn5_march_bypassed="true",
            order_cairn5_awake="true", order_cairn5_howto="1", order_cairn5_cine_intro="1")
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    for vw, vh, tag in ((1440, 900, "mac"), (1180, 820, "ipad")):
        ctx, page, errors = W.new_page(b, save)
        page.set_viewport_size({"width": vw, "height": vh})
        page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
        print(tag, "owned", page.evaluate("window.getOwnedRelicIds()"))
        page.evaluate("window.openSatchelInventoryModal('order_wax_seal')"); page.wait_for_timeout(1000)
        page.click("#btn-si-use"); page.wait_for_timeout(700)
        print(tag, "use note:", page.evaluate("document.getElementById('si-hermes-note').textContent"))
        page.screenshot(path=os.path.join(OUT, f"{tag}_use_not_yet.png"))
        ctx.close()
        ctx, page, errors2 = W.new_page(b, arch)
        page.set_viewport_size({"width": vw, "height": vh})
        page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
        page.evaluate("window.openSolsticeModal()"); page.wait_for_timeout(1500)
        page.evaluate("window.__cairn5.turn(4)"); page.wait_for_timeout(800)
        page.evaluate("document.querySelector('#relic-tray .rt-item').click()"); page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(OUT, f"{tag}_tray_lamp.png"))
        print(tag, "tray:", page.evaluate("[...document.querySelectorAll('#relic-tray .rt-item')].map(b => b.dataset.relic)"),
              page.evaluate("document.querySelector('#relic-tray .rt-reply').textContent"))
        print(tag, "errors", errors + errors2)
        ctx.close()
    b.close()
