"""The end of the Desert Path (19 Nov): "Dawn at the gates" and "The Desert Path, walked", with Silvia's real save plus the flags
of a finished desert (Mac and iPad). Usage: python3 shot_farewell.py OUT_DIR [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8896
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save.update({"order_last_seen_at": str(int(time.time() * 1000))})
seals = {f"order_seal_cairn_{n}": "true" for n in range(1, 6)}
done = dict(save, **seals, order_cairn_iv_completed="true", order_arch_solstice_completed="true", order_five_seals_celebrated="true",
            order_polybius_stele_completed="true", order_oracle_horizon_completed="true", order_oracle_awake="true",
            order_gates_return='{"done":true,"ending":"humble","sealed":true}', order_desert_farewell_pending="true",
            order_stele_finds='["glasses"]', order_relics_spent='["seal_cairn_1","seal_cairn_2","seal_cairn_3","seal_cairn_4","seal_cairn_5","lamp_oil","water_skins","falcon_weight","servant_key","founders_lamp","tuning_pebble"]')
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    for vw, vh, tag in ((1440, 900, "mac"), (1180, 820, "ipad")):
        ctx, page, errors = W.new_page(b, done)
        page.set_viewport_size({"width": vw, "height": vh})
        page.goto(f"{W.BASE}/index.html?tester=1", wait_until="load"); page.wait_for_timeout(2500)
        js = page.evaluate
        js("window.__fwDone = false; window.DesertFarewell.open(() => { window.__fwDone = true; })"); page.wait_for_timeout(9000)
        page.screenshot(path=os.path.join(OUT, f"{tag}_farewell_1_intro.png"))
        def choice(cid):
            for _ in range(120):
                if js("(id => !!document.getElementById(id))", "choice-" + cid):
                    break
                js("window.__gates.fast()"); page.wait_for_timeout(300)
            js("(id => document.getElementById(id).click())", "choice-" + cid)
        print(tag, "menu:", js("[...document.querySelectorAll('#gates-choices button')].map(b => b.id)"))
        choice("fw_veil"); page.wait_for_timeout(9000)
        page.screenshot(path=os.path.join(OUT, f"{tag}_farewell_2_veil.png"))
        choice("fw_go"); page.wait_for_timeout(11000)
        page.screenshot(path=os.path.join(OUT, f"{tag}_farewell_3_seals.png"))
        for _ in range(120):
            if js("getComputedStyle(document.getElementById('gates-decree-card')).display") != "none":
                break
            js("window.__gates.fast()"); page.wait_for_timeout(300)
        page.wait_for_timeout(800)
        page.screenshot(path=os.path.join(OUT, f"{tag}_farewell_4_card.png"))
        js("document.getElementById('btn-gates-depart').click()"); page.wait_for_timeout(8500)
        page.screenshot(path=os.path.join(OUT, f"{tag}_farewell_5_recap.png"))
        print(tag, "state:", js("localStorage.getItem('order_desert_farewell')"), "errors", errors)
        ctx.close()
    b.close()
