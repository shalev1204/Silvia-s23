"""Station 17 as Silvia meets it (her save of 20 Nov 2026: Cairn IV done, the 18 h march over): every phase, Mac and iPad.
Usage: python3 walk_s17.py OUT_DIR [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8898
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
now = int(time.time() * 1000)
save.update({"order_last_seen_at": str(now), "order_cairn_iv_completed": "true", "order_seal_cairn_4": "true", "order_cairn4_verses": "3",
             "order_field_wire_step": "22", "order_cairn5_march_start": str(now - 19 * 3600 * 1000),
             "order_hint_s17-dawn_level": "1", "order_stele_howto": "", "order_cairn5_howto": "", "order_cairn5_cine_intro": ""})
inv = json.loads(save.get("order_inventory_relics", "[]"))
for r in ("tuning_pebble", "seal_cairn_4"):
    if r not in inv: inv.append(r)
save["order_inventory_relics"] = json.dumps(inv)
save["order_relics_spent"] = '["water_skins"]'
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    for vw, vh, tag in ((1440, 900, "mac"), (1180, 820, "ipad")):
        ctx, page, errors = W.new_page(b, save, cine_seen=False)
        page.set_viewport_size({"width": vw, "height": vh})
        page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(3000)
        js = page.evaluate
        shot = lambda n: page.screenshot(path=os.path.join(OUT, f"{tag}_{n}.png"))
        js("window.openSolsticeModal()"); page.wait_for_timeout(1500)
        shot("01_film")
        for _ in range(6):
            if js("window.__cairn5.cine()"): js("window.__cairn5.skipCine()"); page.wait_for_timeout(400)
        page.wait_for_timeout(800)
        shot("02_howto")
        js("document.getElementById('btn-solstice-howto-skip') && document.getElementById('btn-solstice-howto-skip').click()"); page.wait_for_timeout(600)
        shot("03_sigil")
        page.fill("#solstice-key-input", "DAYBREAK"); page.click("#btn-solstice-speak"); page.wait_for_timeout(2500)
        shot("04_awake")
        print(tag, "dispatch:", js("document.getElementById('solstice-dispatch-text').textContent")[:300])
        js("window.__cairn5.turn(4)"); page.wait_for_timeout(900)
        shot("05_lamp_tray")
        print(tag, "tray:", js("(document.getElementById('relic-tray-ask')||{}).textContent"))
        js("document.querySelector('#relic-tray [data-relic=\"lamp_oil\"]').click()"); page.wait_for_timeout(900)
        js("document.getElementById('ir-btn-continue') && document.getElementById('ir-btn-continue').click()"); page.wait_for_timeout(1200)
        shot("06_lit")
        print(tag, "after lamp:", js("document.getElementById('solstice-dispatch-text').textContent")[:300], js("window.__cairn5.state()"))
        # the four rays, the night, the mirror, the signal, the finale and the reward
        court = js("window.__cairn5.court"); routes = [W.dawn_routes(court, c)[0] for c in court["entries"]]
        for i, m in routes[0].items():
            if js("window.__cairn5.mirrors()")[i] != m: js(f"window.__cairn5.turn({i})")
        shot("07_first_ray_set")
        js("window.__cairn5.startDawn()"); js("window.__cairn5.frames(30)"); page.wait_for_timeout(600)
        shot("08_dawn_running")
        for r in routes:
            for i, m in r.items():
                if js("window.__cairn5.mirrors()")[i] != m: js(f"window.__cairn5.turn({i})")
            page.wait_for_timeout(300)
        js("window.__cairn5.frames(90)"); page.wait_for_timeout(800)
        shot("09_altar_open")
        js("window.__cairn5.toNight()"); page.wait_for_timeout(1500); js("window.__cairn5.frames(5)")
        shot("10_night")
        js("document.getElementById('btn-solstice-raise').click()"); page.wait_for_timeout(700)
        shot("11_mirror_tray")
        js("document.querySelector('#relic-tray [data-relic=\"signal_mirror\"]').click()"); page.wait_for_timeout(1500)
        shot("12_watching")
        for pat in js("window.__cairn5.rounds"):
            for ch in pat: js(f"window.__cairn5.flash('{ch}')")
            js("window.__cairn5.send()"); page.wait_for_timeout(300)
        shot("13_finale")
        page.wait_for_timeout(22000)
        shot("14_ceremony_or_reward")
        page.click("#btn-five-seals-close"); page.wait_for_timeout(9500)
        shot("15_reward")
        print(tag, "errors", errors[:3])
        ctx.close()
    b.close()
