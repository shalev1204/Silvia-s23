"""Stations 18 and 19 after the 18 Nov work: the tray at the hatch, the two reward screens, the inner stair, with Silvia's real save
plus only the flags that open each station (Mac and iPad). Usage: python3 shot_s18_s19.py OUT_DIR [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8895
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save.update({"order_last_seen_at": str(int(time.time() * 1000))})
seals = {f"order_seal_cairn_{n}": "true" for n in range(1, 6)}
s18 = dict(save, **seals, order_cairn_iv_completed="true", order_arch_solstice_completed="true", order_five_seals_celebrated="true",
           order_stele_march_bypassed="true", order_stele_march_start="1", order_stele_awake="true", order_stele_knocks="4",
           order_stele_howto="seen", order_stele_cine_intro="seen", order_stele_sound="off")
s19 = dict(s18, order_polybius_stele_completed="true", order_oracle_stair_start="1", order_oracle_stair_bypassed="true",
           order_gates_return='{"done":true,"ending":"humble","sealed":true}', order_oracle_howto="seen", order_oracle_cine_intro="seen", order_oracle_key="", order_oracle_lamp="")
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    for vw, vh, tag in ((1440, 900, "mac"), (1180, 820, "ipad")):
        ctx, page, errors = W.new_page(b, s18)
        page.set_viewport_size({"width": vw, "height": vh})
        page.goto(f"{W.BASE}/index.html?tester=1", wait_until="load"); page.wait_for_timeout(2500)
        js = page.evaluate
        js("window.openSteleModal()"); page.wait_for_timeout(1500)
        atrium = js("window.__stele.atrium")
        moves, _ = W.atrium_search(atrium)
        for dx, dy in moves:
            js(f"window.__stele.move({dx}, {dy})")
        page.wait_for_timeout(900)
        page.screenshot(path=os.path.join(OUT, f"{tag}_s18_hatch_tray.png"))
        js("document.querySelector('#relic-tray [data-relic=\"falcon_weight\"]').click()"); page.wait_for_timeout(600)
        js("window.__stele.showReward()"); page.wait_for_timeout(6500)
        page.screenshot(path=os.path.join(OUT, f"{tag}_s18_reward.png"))
        print(tag, "s18 errors", errors); ctx.close()

        ctx, page, errors = W.new_page(b, s19)
        page.set_viewport_size({"width": vw, "height": vh})
        page.goto(f"{W.BASE}/index.html?tester=1", wait_until="load"); page.wait_for_timeout(2500)
        js = page.evaluate
        js("window.openOracleModal()"); page.wait_for_timeout(2600)
        page.screenshot(path=os.path.join(OUT, f"{tag}_s19_stair_key.png"))
        print(tag, "stair tray:", js("(document.getElementById('relic-tray-ask')||{}).textContent"), js("window.__oracle.relics()"))
        js("document.querySelector('#relic-tray [data-relic=\"servant_key\"]').click()"); page.wait_for_timeout(3200)
        if js("!!document.querySelector('#relic-tray [data-relic=\"founders_lamp\"]') && !document.getElementById('relic-tray').hidden"):
            js("document.querySelector('#relic-tray [data-relic=\"founders_lamp\"]').click()"); page.wait_for_timeout(700)
        page.fill("#oracle-key-input", "OVERTURE"); page.click("#btn-oracle-speak"); page.wait_for_timeout(600)
        for ring in range(3):
            while js("window.__oracle.rot()")[ring] != 0:
                js(f"window.__oracle.turn({ring}, 1)")
        page.wait_for_timeout(4500)
        page.screenshot(path=os.path.join(OUT, f"{tag}_s19_weigh_1_riddle.png"))
        js("window.__oracle.word('FEAR')"); page.wait_for_timeout(2500)
        page.screenshot(path=os.path.join(OUT, f"{tag}_s19_weigh_2_word.png"))
        js("window.__oracle.weigh(17)"); page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(OUT, f"{tag}_s19_weigh_3_swing.png"))
        js("window.__oracle.weigh(18)"); page.wait_for_timeout(2500)
        page.screenshot(path=os.path.join(OUT, f"{tag}_s19_weigh_4_settled.png"))
        js("window.__oracle.word('LUX')"); js("window.__oracle.expireLight()"); page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUT, f"{tag}_s19_weigh_5_dark.png"))
        js("window.__oracle.moon()"); js("window.__oracle.weigh(20)"); page.wait_for_timeout(800)
        js("window.__oracle.word('ERA')"); js("window.__oracle.weigh(12)"); page.wait_for_timeout(1200)
        page.screenshot(path=os.path.join(OUT, f"{tag}_s19_vow_pebble.png"))
        if js("!document.getElementById('btn-oracle-pebble').hidden"):
            js("document.getElementById('btn-oracle-pebble').click()"); page.wait_for_timeout(400)
            js("document.querySelector('#relic-tray [data-relic=\"tuning_pebble\"]').click()"); page.wait_for_timeout(500)
        tiles = js("window.__oracle.tiles")
        for w in ["YOU", "WERE", "ALWAYS", "THE", "TREASURE"]:
            js(f"window.__oracle.say({tiles.index(w)})")
        js("window.__oracle.vow()"); page.wait_for_timeout(600)
        js("window.__oracle.showReward()"); page.wait_for_timeout(6500)
        page.screenshot(path=os.path.join(OUT, f"{tag}_s19_reward.png"))
        print(tag, "s19", js("window.__oracle.relics()"), "errors", errors); ctx.close()
    b.close()
