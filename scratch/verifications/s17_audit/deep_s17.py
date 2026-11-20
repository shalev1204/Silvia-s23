"""Station 17, the paths Silvia may take when things go wrong (her save of 20 Nov 2026).
Wrong sigil, no light by night, moonlight rehearsal, a spent dawn, closing mid-dawn, the scene at night before
the mirror is raised, wrong signals, the reward and the station reopened; Mac, small laptop and phone.
Usage: python3 deep_s17.py OUT_DIR [PORT]"""
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8897
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
now = int(time.time() * 1000)
save.update({"order_last_seen_at": str(now), "order_cairn_iv_completed": "true", "order_seal_cairn_4": "true", "order_cairn4_verses": "3",
             "order_field_wire_step": "22", "order_cairn5_march_start": str(now - 19 * 3600 * 1000),
             "order_hint_s17-dawn_level": "1", "order_cairn5_howto": "seen", "order_cairn5_cine_intro": "seen"})
inv = json.loads(save.get("order_inventory_relics", "[]"))
for r in ("tuning_pebble", "seal_cairn_4"):
    if r not in inv: inv.append(r)
save["order_inventory_relics"] = json.dumps(inv)
save["order_relics_spent"] = '["water_skins"]'
LOG = []
def log(*a):
    s = " ".join(str(x) for x in a); LOG.append(s); print(s)

with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    for vw, vh, tag in ((1440, 900, "mac"), (1280, 720, "small"), (390, 844, "phone")):
        ctx, page, errors = W.new_page(b, save)
        page.set_viewport_size({"width": vw, "height": vh})
        page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(3000)
        js = page.evaluate
        shot = lambda n: page.screenshot(path=os.path.join(OUT, f"{tag}_{n}.png"))
        fb = lambda id_: js(f"(document.getElementById('{id_}')||{{}}).textContent")
        js("window.openSolsticeModal()"); page.wait_for_timeout(1500)
        shot("01_open")
        # a wrong sigil, then an empty one, then the right one
        page.fill("#solstice-key-input", "DAYBRAKE"); page.click("#btn-solstice-speak"); page.wait_for_timeout(500)
        log(tag, "wrong sigil:", fb("solstice-key-feedback"))
        shot("02_wrong_sigil")
        page.fill("#solstice-key-input", "day break"); page.click("#btn-solstice-speak"); page.wait_for_timeout(1500)
        log(tag, "spaced sigil accepted:", js("window.__cairn5.state()"))
        # the lamp: she says we have no light
        js("window.__cairn5.turn(0)"); page.wait_for_timeout(900)
        shot("03_lamp_ask")
        js("(document.querySelector('.rt-cancel')).click()"); page.wait_for_timeout(700)
        log(tag, "tray buttons:", js("[...document.querySelectorAll('#relic-tray button')].map(b=>b.className+':'+b.textContent.trim()).join(' | ')"))
        log(tag, "after cancel:", js("window.__cairn5.state()"), fb("solstice-dawn-feedback"), "|", fb("solstice-dispatch-text")[:160])
        shot("04_no_light")
        js("window.__cairn5.turn(0)"); page.wait_for_timeout(500)
        log(tag, "turn in the dark:", js("window.__cairn5.mirrors()"), fb("solstice-dawn-feedback"), "tray again?", js("window.RelicUse.isOpen()"))
        shot("04b_tray_again")
        if js("window.RelicUse.isOpen()"): js("document.querySelector('.rt-cancel').click()"); page.wait_for_timeout(600)
        # moonlight rehearsal
        page.click("#solstice-moon-row button[data-k='1']"); page.wait_for_timeout(600); js("window.__cairn5.frames(40)")
        log(tag, "moon:", fb("solstice-dawn-feedback"), js("window.__cairn5.world()")["beam"])
        shot("05_moon")
        # the dawn, spent
        js("window.__cairn5.startDawn()"); page.wait_for_timeout(300)
        log(tag, "dawn stepMs (dark, ray 1):", js("window.__cairn5.state()")["stepMs"])
        js("window.__cairn5.expireStep()"); page.wait_for_timeout(500)
        log(tag, "spent:", fb("solstice-dawn-feedback"), "|", fb("solstice-dispatch-text")[:200])
        shot("06_spent")
        # closing in the middle of a dawn, and coming back
        js("window.__cairn5.startDawn()"); page.wait_for_timeout(300)
        js("window.closeSolsticeModal()"); page.wait_for_timeout(600)
        js("window.openSolsticeModal()"); page.wait_for_timeout(1200)
        log(tag, "reopened:", js("window.__cairn5.state()"), fb("solstice-dawn-feedback"), "|", fb("solstice-dispatch-text")[:140])
        shot("07_reopened")
        # win the dawn properly
        court = js("window.__cairn5.court"); routes = [W.dawn_routes(court, c)[0] for c in court["entries"]]
        js("window.__cairn5.startDawn()")
        for r in routes:
            for k, m in r.items():
                if js("window.__cairn5.mirrors()")[k] != m: js(f"window.__cairn5.turn({k})")
            page.wait_for_timeout(250)
        js("window.__cairn5.toNight()"); page.wait_for_timeout(1500); js("window.__cairn5.frames(5)")
        # the scene at night, clicked before the mirror is raised
        box = page.locator("#solstice3d-canvas").bounding_box()
        if box and box["width"] > 50:
            page.mouse.click(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2); page.wait_for_timeout(700)
        log(tag, "click scene, no mirror: tray open?", js("!!(window.RelicUse && window.RelicUse.isOpen())"), "aim:", fb("solstice3d-aim"))
        shot("08_night_click")
        if not js("window.RelicUse.isOpen()"): page.click("#btn-solstice-raise"); page.wait_for_timeout(700)
        js("document.querySelector('#relic-tray [data-relic=\"signal_mirror\"]').click()"); page.wait_for_timeout(5000)
        # a wrong answer, typed with the button
        fl = page.locator("#btn-solstice-flash")
        fl.scroll_into_view_if_needed()
        fl.dispatch_event("pointerdown", {"pointerId": 1}); page.wait_for_timeout(100); fl.dispatch_event("pointerup", {"pointerId": 1})
        page.wait_for_timeout(200)
        fl.dispatch_event("pointerdown", {"pointerId": 1}); page.wait_for_timeout(600); fl.dispatch_event("pointerup", {"pointerId": 1})
        page.wait_for_timeout(200)
        log(tag, "pulses typed:", fb("solstice-pulses"))
        shot("09_typed")
        page.click("#btn-solstice-send"); page.wait_for_timeout(400)
        log(tag, "wrong signal:", fb("solstice-signal-feedback"))
        shot("10_wrong")
        page.wait_for_timeout(4500)
        log(tag, "trace after replay:", fb("solstice-tower-trace"))
        for pat in js("window.__cairn5.rounds"):
            for ch in pat: js(f"window.__cairn5.flash('{ch}')")
            js("window.__cairn5.send()"); page.wait_for_timeout(300)
        page.wait_for_timeout(9000)
        shot("11_message")
        log(tag, "message:", fb("solstice-message"))
        page.wait_for_timeout(13000)
        if js("(document.getElementById('five-seals-overlay')||{style:{}}).style.display") == "flex":
            shot("12_ceremony"); page.click("#btn-five-seals-close"); page.wait_for_timeout(9000)
        shot("13_reward")
        log(tag, "reward open:", js("window.__cairn5.rewardOpen()"))
        page.keyboard.press("Escape"); page.wait_for_timeout(500)
        log(tag, "after Esc reward open:", js("window.__cairn5.rewardOpen()"), "modal:", js("document.getElementById('modal-solstice-arch').style.display"))
        shot("14_victory_panel")
        js("window.closeSolsticeModal()"); page.wait_for_timeout(600)
        js("window.openSolsticeModal()"); page.wait_for_timeout(2500); js("window.__cairn5.frames(5)")
        shot("15_reopened_done")
        log(tag, "errors", errors[:5])
        ctx.close()
    b.close()
open(os.path.join(OUT, "log.txt"), "w").write("\n".join(LOG))
