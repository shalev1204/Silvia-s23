"""Station 19 as Silvia will meet it (her save, after Station 18 and the return through the bronze doors), with the paths that go wrong:
the film and How to play, the inner stair (key and lamp, and without the lamp), wrong sigils, the disc turned by hand and the misses,
the three riddles with wrong and near words, a wrong weight, the light lost and the moon, closing mid-weighing and reopening,
the pebble, wrong vows, the veil, the film, the reward and the station reopened; Mac, small laptop and phone.
Usage: python3 deep_s19.py OUT_DIR [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8886
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save.update(W.DESERT_DONE); save.update(W.ORACLE_SEED_EXTRA)
save.update({"order_last_seen_at": str(int(time.time() * 1000)), "order_field_wire_step": "30",
             "order_gates_return": json.dumps({"done": True, "sealed": True, "ending": "welcome"}),
             "order_oracle_howto": "", "order_oracle_cine_intro": "", "order_oracle_cine_outro": "", "order_oracle_key": "", "order_oracle_lamp": ""})
inv = json.loads(save.get("order_inventory_relics", "[]"))
for r in ("servant_key", "founders_lamp", "tuning_pebble", "signal_mirror"):
    if r not in inv: inv.append(r)
inv = [r for r in inv if not r.startswith("seal_cairn_") and r not in ("falcon_weight", "servant_coin")]
save["order_inventory_relics"] = json.dumps(inv)
LOG = []
def log(*a):
    s = " ".join(str(x) for x in a); LOG.append(s); print(s)

with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    for vw, vh, tag in ((1440, 900, "mac"), (1280, 720, "small"), (390, 844, "phone")):
        ctx, page, errors = W.new_page(b, save, cine_seen=False)
        page.set_viewport_size({"width": vw, "height": vh})
        page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(3000)
        js = page.evaluate
        shot = lambda n: page.screenshot(path=os.path.join(OUT, f"{tag}_{n}.png"))
        fb = lambda id_: js(f"(document.getElementById('{id_}')||{{}}).innerText") or ""
        tray = lambda: js("!!(window.RelicUse && window.RelicUse.isOpen())")
        hand = lambda rid: js("(id => { const b = document.querySelector('#relic-tray [data-relic=\"' + id + '\"]'); if (b) b.click(); return !!b; })", rid)
        js("window.openOracleModal()"); page.wait_for_timeout(2500)
        log(tag, "modal open:", js("getComputedStyle(document.getElementById('modal-oracle-horizon')).display"), "| gates:", js("getComputedStyle(document.getElementById('modal-gates-tower-ii')).display"))
        shot("01_film")
        for _ in range(8):
            if js("window.__oracle.cine()"): js("window.__oracle.skipCine()"); page.wait_for_timeout(400)
        page.wait_for_timeout(700)
        shot("02_howto")
        js("document.getElementById('btn-oracle-howto-skip') && document.getElementById('btn-oracle-howto-skip').click()"); page.wait_for_timeout(1200)
        log(tag, "stair tray:", tray(), fb("relic-tray-ask")[:140])
        shot("03_stair_key")
        hand("tuning_pebble"); page.wait_for_timeout(300); log(tag, "wrong for key:", js("(document.querySelector('#relic-tray .rt-reply')||{}).textContent"))
        hand("servant_key"); page.wait_for_timeout(3200)
        log(tag, "lamp tray:", tray(), fb("relic-tray-ask")[:140])
        shot("04_stair_lamp")
        hand("founders_lamp"); page.wait_for_timeout(1200)
        js("document.getElementById('ir-btn-continue') && getComputedStyle(document.getElementById('modal-item-relinquished')).display !== 'none' && document.getElementById('ir-btn-continue').click()"); page.wait_for_timeout(800)
        log(tag, "after stair:", js("window.__oracle.relics()"), "| dispatch:", fb("oracle-dispatch-text")[:200])
        shot("05_door")
        page.fill("#oracle-key-input", "OVERTURN"); page.click("#btn-oracle-speak"); page.wait_for_timeout(300)
        log(tag, "wrong sigil:", fb("oracle-key-feedback"))
        shot("06_wrong_sigil")
        page.fill("#oracle-key-input", "overture"); page.click("#btn-oracle-speak"); page.wait_for_timeout(9000)
        for _ in range(20):
            if js("window.__oracle.world()").get("phase") == "disc": break
            page.wait_for_timeout(500)
        shot("07_disc")
        log(tag, "disc:", js("window.__oracle.rot()"), "| feedback:", fb("oracle-disc-feedback"), "| status:", fb("oracle3d-status"))
        # she turns the rings with the buttons, wrongly at first (misses every 15 turns)
        for _ in range(16): js("document.getElementById('btn-oracle-r0-r').click()")
        page.wait_for_timeout(300)
        log(tag, "after 16 turns:", js("window.__oracle.rot()"), "| feedback:", fb("oracle-disc-feedback"), "| turns key:", js("localStorage.getItem('order_oracle_disc_turns')"))
        shot("08_turning")
        sky = {"Aldebaran": 6, "Capella": 7, "Polaris": 0}
        for ring, star in enumerate(js("window.__oracle.stars")):
            while (star["spoke"] + js("window.__oracle.rot()")[ring]) % 8 != sky[star["name"]]:
                js(f"document.getElementById('btn-oracle-r{ring}-r').click()")
        page.wait_for_timeout(2500)
        shot("09_true")
        log(tag, "true; verse:", fb("oracle-verse")[:160], "| dispatch:", fb("oracle-dispatch-text")[:160])
        js("window.__oracle.word('ear')"); log(tag, "EAR:", fb("oracle-disc-feedback"))
        js("window.__oracle.word('banana')"); log(tag, "banana:", fb("oracle-disc-feedback"))
        js("window.__oracle.word('fear')"); page.wait_for_timeout(500)
        shot("10_fear_on_pan")
        log(tag, "balance:", fb("oracle-balance")[:200], "| light:", fb("oracle-light-label"))
        js("window.__oracle.weigh(17)"); page.wait_for_timeout(300); log(tag, "17:", fb("oracle-disc-feedback"))
        shot("11_wrong_weight")
        js("window.__oracle.weigh(18)"); page.wait_for_timeout(1500)
        shot("12_first_day")
        log(tag, "date:", fb("oracle-date"), "| dispatch:", fb("oracle-dispatch-text")[:160])
        js("window.__oracle.word('lux')"); page.wait_for_timeout(200)
        js("window.__oracle.expireLight()"); page.wait_for_timeout(400)
        shot("13_light_gone")
        log(tag, "light gone:", fb("oracle-light-label"), "| feedback:", fb("oracle-disc-feedback"), "| moon btn:", js("!document.getElementById('btn-oracle-moon').hidden"))
        # close in the middle of the weighing, and come back
        js("window.closeOracleModal()"); page.wait_for_timeout(700)
        js("window.openOracleModal()"); page.wait_for_timeout(2500)
        log(tag, "reopened mid-weigh:", js("window.__oracle.weighState()"), "| dispatch:", fb("oracle-dispatch-text")[:160], "| moon btn:", js("!document.getElementById('btn-oracle-moon').hidden"))
        shot("14_reopened_weigh")
        if not js("document.getElementById('btn-oracle-moon').hidden"): js("document.getElementById('btn-oracle-moon').click()"); page.wait_for_timeout(300)
        if not js("window.__oracle.weighState()")["word"]: js("window.__oracle.word('lux')")
        js("window.__oracle.weigh(20)"); page.wait_for_timeout(800)
        js("window.__oracle.word('era')"); js("window.__oracle.weigh(12)"); page.wait_for_timeout(3000)
        shot("15_when")
        log(tag, "when:", fb("oracle-when")[:120], "| pebble btn:", js("!document.getElementById('btn-oracle-pebble').hidden"))
        if js("!document.getElementById('btn-oracle-pebble').hidden"):
            js("document.getElementById('btn-oracle-pebble').click()"); page.wait_for_timeout(500)
            shot("16_pebble_tray")
            hand("tuning_pebble"); page.wait_for_timeout(800)
        tiles = js("window.__oracle.tiles")
        for w in ["YOU", "WERE", "NEVER", "ONLY", "THE", "SEEKER"]: js(f"window.__oracle.say({tiles.index(w)})")
        shot("17_vow_wrong_typed")
        js("window.__oracle.vow()"); page.wait_for_timeout(300); log(tag, "wrong vow:", fb("oracle-vow-feedback"))
        for w in ["THE", "TREASURE", "YOU", "WERE", "ALWAYS"]: js(f"window.__oracle.say({tiles.index(w)})")
        js("window.__oracle.vow()"); page.wait_for_timeout(300); log(tag, "turned vow:", fb("oracle-vow-feedback"))
        shot("18_vow_wrong")
        for w in ["YOU", "WERE", "ALWAYS", "THE", "TREASURE"]: js(f"window.__oracle.say({tiles.index(w)})")
        shot("19_vow_typed")
        js("window.__oracle.vow()"); page.wait_for_timeout(3000)
        shot("20_veil")
        for _ in range(60):
            if js("window.__oracle.cine()"): page.wait_for_timeout(1500); shot("21_film"); js("window.__oracle.skipCine()")
            if js("window.__oracle.rewardOpen()"): break
            page.wait_for_timeout(500)
        page.wait_for_timeout(5000)
        shot("22_reward")
        log(tag, "reward open:", js("window.__oracle.rewardOpen()"))
        page.keyboard.press("Escape"); page.wait_for_timeout(500)
        shot("23_victory")
        js("window.closeOracleModal()"); page.wait_for_timeout(700)
        js("window.openOracleModal()"); page.wait_for_timeout(2500)
        shot("24_reopened_done")
        log(tag, "reopened done:", fb("oracle-dispatch-text")[:160], "| subtitle on:", js("document.getElementById('oracle3d-subtitle').classList.contains('is-on')"), js("document.getElementById('oracle3d-subtitle').textContent")[:80])
        log(tag, "errors", errors[:5])
        ctx.close()
    b.close()
open(os.path.join(OUT, "log.txt"), "w").write("\n".join(LOG))
