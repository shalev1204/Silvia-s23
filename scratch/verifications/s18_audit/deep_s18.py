"""Station 18 as Silvia will meet it (her save after Station 17), with the paths that go wrong:
the film and How to play, a wrong proverb, the knocks (a wrong word, the mirage reading, a wrong answer knocked by hand),
the fire (caught by the flames, out of breath), the hint numbers, the hatch and the satchel, the reward, a second crossing,
closing mid-way and reopening; Mac, small laptop and phone.
Usage: python3 deep_s18.py OUT_DIR [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8889
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
now = int(time.time() * 1000)
save.update({"order_last_seen_at": str(now), "order_cairn_iv_completed": "true", "order_seal_cairn_4": "true", "order_cairn4_verses": "3",
             "order_arch_solstice_completed": "true", "order_seal_cairn_5": "true", "order_cairn5_awake": "true", "order_cairn5_dawn_done": "true",
             "order_cairn5_lamp": "lit", "order_cairn5_signal_round": "4", "order_field_wire_step": "26",
             "order_stele_howto": "", "order_stele_cine_intro": "", "order_stele_cine_outro": ""})
inv = json.loads(save.get("order_inventory_relics", "[]"))
for r in ("tuning_pebble", "seal_cairn_4", "seal_cairn_5", "signal_mirror"):
    if r not in inv: inv.append(r)
save["order_inventory_relics"] = json.dumps(inv)
save["order_relics_spent"] = '["water_skins","lamp_oil"]'
LOG = []
def log(*a):
    s = " ".join(str(x) for x in a); LOG.append(s); print(s)

with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    for vw, vh, tag in ((1440, 900, "mac"), (1280, 720, "small"), (390, 844, "phone")):
        ctx, page, errors = W.new_page(b, save, cine_seen=False)
        page.set_viewport_size({"width": vw, "height": vh})
        page.goto(f"{W.BASE}/index.html?tester=1", wait_until="load"); page.wait_for_timeout(3000)
        js = page.evaluate
        shot = lambda n: page.screenshot(path=os.path.join(OUT, f"{tag}_{n}.png"))
        fb = lambda id_: js(f"(document.getElementById('{id_}')||{{}}).textContent") or ""
        js("window.openSteleModal()"); page.wait_for_timeout(2500)
        shot("01_film")
        for _ in range(6):
            if js("window.__stele.cine()"): js("window.__stele.skipCine()"); page.wait_for_timeout(400)
        page.wait_for_timeout(700)
        shot("02_howto")
        for _ in range(4): js("document.getElementById('btn-stele-howto-next').click()"); page.wait_for_timeout(150)
        log(tag, "coin button hidden?", js("document.getElementById('btn-stele-coin') ? document.getElementById('btn-stele-coin').hidden : 'none'"), "| dispatch:", fb("stele-dispatch-text")[:200])
        shot("03_proverb")
        page.fill("#stele-key-input", "STARS GUIDE THOSE WHO SEE TRUTH"); page.click("#btn-stele-speak"); page.wait_for_timeout(400)
        log(tag, "wrong proverb:", fb("stele-key-feedback"))
        page.fill("#stele-key-input", "stars guide those who seek truth"); page.click("#btn-stele-speak"); page.wait_for_timeout(4200)
        shot("04_knocking")
        page.wait_for_timeout(7000)
        log(tag, "tape after WHO:", js("document.querySelectorAll('#stele-tape .stele-group').length"), "groups")
        shot("05_heard")
        page.fill("#stele-word-input", "WHY"); page.click("#btn-stele-read"); page.wait_for_timeout(300)
        log(tag, "wrong word:", fb("stele-knock-feedback"))
        page.fill("#stele-word-input", "WHO"); page.click("#btn-stele-read"); page.wait_for_timeout(800)
        log(tag, "after WHO:", fb("stele-knock-feedback"), "| label:", fb("stele-stanza-label"))
        # her answer knocked by hand: the sun reading of SEEK (wrong: stanza II is lunar)
        sun = js("window.__stele.knocksOf('SEEK', false)")
        page.locator("#btn-stele-knock").scroll_into_view_if_needed()
        for gi, n in enumerate(sun[:4]):
            for _ in range(n): page.click("#btn-stele-knock")
            page.click("#btn-stele-pause")
        shot("06_reply_typed")
        page.click("#btn-stele-send"); page.wait_for_timeout(9000)
        log(tag, "half answer sent:", fb("stele-knock-feedback"))
        js("window.__stele.stop()"); js(f"window.__stele.answer({json.dumps(sun)})"); page.wait_for_timeout(300)
        log(tag, "sun reading:", fb("stele-knock-feedback"))
        moon = js("window.__stele.knocksOf('SEEK', true)")
        js("window.__stele.stop()"); js(f"window.__stele.answer({json.dumps(moon)})"); page.wait_for_timeout(600)
        log(tag, "after SEEK:", fb("stele-knock-feedback"))
        js("window.__stele.stop()"); js("window.__stele.read('WELL')"); page.wait_for_timeout(300)
        js("window.__stele.stop()"); js("window.__stele.read('ASH')"); page.wait_for_timeout(1500)
        shot("07_fire_start")
        log(tag, "fire:", fb("stele-move-feedback"), "|", fb("stele-breath"), "|", fb("stele-turn-label"))
        # into a burning flagstone, then out of breath
        js("window.__stele.move(0, -1)"); js("window.__stele.move(-1, 0)"); page.wait_for_timeout(200)
        log(tag, "blocked/step:", fb("stele-move-feedback"), js("window.__stele.state()"))
        for _ in range(16):
            r = js("window.__stele.state()")["run"]
            if not r or (r["t"] == 0 and _ > 0): break
            js("window.__stele.move(0, 0)")
        page.wait_for_timeout(300)
        shot("08_lost")
        log(tag, "lost:", fb("stele-move-feedback"), "|", fb("stele-dispatch-text")[:160])
        page.wait_for_timeout(1500); js("window.__stele.settle()")
        # the shortest crossing
        best, _ = W.atrium_search(js("window.__stele.atrium"))
        js("window.__stele.restart()")
        for dx, dy in best[:6]: js(f"window.__stele.move({dx}, {dy})")
        js("window.__stele.frames(20)"); page.wait_for_timeout(400)
        shot("09_crossing")
        for dx, dy in best[6:]: js(f"window.__stele.move({dx}, {dy})")
        page.wait_for_timeout(800)
        log(tag, "at hatch, tray open:", js("!!(window.RelicUse && window.RelicUse.isOpen())"), "state:", js("window.__stele.state()"))
        shot("10_hatch")
        if js("window.RelicUse.isOpen()"):
            js("document.querySelector('#relic-tray [data-relic=\"falcon_weight\"]') ? document.querySelector('#relic-tray [data-relic=\"falcon_weight\"]').click() : document.querySelector('.rt-cancel').click()")
        page.wait_for_timeout(4000)
        shot("11_servant")
        for _ in range(40):
            if js("window.__stele.cine()"): break
            page.wait_for_timeout(500)
        shot("12_outro")
        for _ in range(40):
            if js("window.__stele.rewardOpen()"): break
            page.wait_for_timeout(500)
        page.wait_for_timeout(6000)
        shot("13_reward")
        log(tag, "reward open:", js("window.__stele.rewardOpen()"), "finds:", js("window.__stele.found()"))
        # back through the fire for what is missing, then close mid-way and reopen
        if js("!!document.querySelector('.drw-again')"):
            js("document.querySelector('.drw-again').click()"); page.wait_for_timeout(1200)
            js("window.__stele.move(0, -1)"); page.wait_for_timeout(300)
            shot("14_replay")
            log(tag, "replay:", fb("stele-breath"), "|", fb("stele-turn-label"))
        js("window.closeSteleModal()"); page.wait_for_timeout(600)
        js("window.openSteleModal()"); page.wait_for_timeout(2500); js("window.__stele.frames(5)")
        shot("15_reopened")
        log(tag, "reopened: dispatch:", fb("stele-dispatch-text")[:160], "| replaying:", js("window.__stele.replaying()"))
        log(tag, "errors", errors[:5])
        ctx.close()
    b.close()
open(os.path.join(OUT, "log.txt"), "w").write("\n".join(LOG))
