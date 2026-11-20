"""Station 17, the end as Silvia will meet it: the last signal, the light going out, the film of the end, the five seals,
the reward rising by itself (and again when the ceremony was already seen), no green button on the side panel, the station
reopened when done; Mac, small laptop and phone. Screenshots of every beat go to OUT_DIR.
Usage: python3 finale_s17.py OUT_DIR [PORT]"""
import os, sys, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8889
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
seed = dict(W.DESERT_BASE, **W.DESERT_DONE, order_sun_monolith_completed="true", order_seal_cairn_2="true",
            order_sandstone_labyrinth_completed="true", order_seal_cairn_3="true", order_monolith_gate_seal1="true",
            order_cairn_iv_completed="true", order_seal_cairn_4="true", order_cairn4_sound="off", order_field_wire_step="22",
            order_cairn5_march_start=str(int(time.time() * 1000) - 19 * 3600 * 1000), order_cairn5_awake="true", order_cairn5_cine_outro="")
ok = True
def check(cond, msg):
    global ok
    print(("PASS " if cond else "FAIL ") + msg); ok = ok and bool(cond)

with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    runs = ((1440, 900, "mac", False), (1280, 720, "small", False), (390, 844, "phone", False), (1440, 900, "mac_seen", True))
    for vw, vh, tag, celebrated in runs:
        s = dict(seed)
        if celebrated: s.update(order_five_seals_celebrated="true", order_cairn5_cine_outro="seen")
        ctx, page, errors = W.new_page(b, s)
        page.set_viewport_size({"width": vw, "height": vh})
        page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
        js = page.evaluate
        shot = lambda n: page.screenshot(path=os.path.join(OUT, f"{tag}_{n}.png"))
        js("window.openSolsticeModal()"); page.wait_for_timeout(1500)
        check(not js("document.getElementById('btn-solstice-finish')"), f"{tag}: no green Field Wire button on the side panel")
        # by night Hermes needs the oil to turn the mirrors
        js("window.__cairn5.turn(4)"); page.wait_for_timeout(300)
        if js("!!document.querySelector('#relic-tray [data-relic=\"lamp_oil\"]')"):
            js("document.querySelector('#relic-tray [data-relic=\"lamp_oil\"]').click()"); page.wait_for_timeout(600)
            js("document.getElementById('ir-btn-continue') && document.getElementById('ir-btn-continue').click()"); page.wait_for_timeout(500)
        court = js("window.__cairn5.court")
        routes = [W.dawn_routes(court, col) for col in court["entries"]]
        js("window.__cairn5.startDawn()"); page.wait_for_timeout(400)
        for r in routes:
            cur = js("window.__cairn5.mirrors()")
            for i, m in r[0].items():
                if cur[i] != m: js(f"window.__cairn5.turn({i})")
            page.wait_for_timeout(200)
        page.wait_for_timeout(1500); shot("01_altar_open")
        print(tag, "dispatch:", js("document.getElementById('solstice-dispatch-text').textContent"))
        js("window.__cairn5.toNight()"); page.wait_for_timeout(1200)
        js("document.getElementById('btn-solstice-raise').click()"); page.wait_for_timeout(300)
        js("document.querySelector('#relic-tray [data-relic=\"signal_mirror\"]') && document.querySelector('#relic-tray [data-relic=\"signal_mirror\"]').click()"); page.wait_for_timeout(300)
        for pattern in js("window.__cairn5.rounds"):
            for c in pattern: js(f"window.__cairn5.flash('{c}')")
            js("window.__cairn5.send()"); page.wait_for_timeout(250)
        check(js("window.__cairn5.state().finale"), f"{tag}: the last signal starts the finale")
        page.wait_for_timeout(9000); shot("02_light_speaks")
        film_seen = False; shots = 0
        for k in range(60):
            if js("window.__cairn5.cine()"):
                film_seen = True
                if shots < 3 and k % 4 == 0: page.wait_for_timeout(900); shot(f"03_film_{shots}"); shots += 1
            if js("getComputedStyle(document.getElementById('five-seals-overlay')).display") != "none" or js("window.__cairn5.rewardOpen()"): break
            page.wait_for_timeout(500)
        done = js("localStorage.getItem('order_arch_solstice_completed')")
        if celebrated:
            check(not film_seen and done == "true", f"{tag}: the film already seen does not play again; the station is done")
        else:
            check(film_seen and done == "true", f"{tag}: the film of the end plays before the seals ({shots} frames shot)")
            page.wait_for_timeout(1200); shot("04_ceremony")
            check(js("getComputedStyle(document.getElementById('five-seals-overlay')).display") != "none", f"{tag}: after the film, the five seals come home")
            page.wait_for_timeout(3500); js("document.getElementById('btn-five-seals-close').click()")
        for _ in range(20):
            if js("window.__cairn5.rewardOpen()"): break
            page.wait_for_timeout(250)
        check(js("window.__cairn5.rewardOpen()"), f"{tag}: the reward rises by itself, nothing to click")
        page.wait_for_timeout(2500); shot("05_reward")
        check(js("document.activeElement && document.activeElement.classList.contains('chasm3d-reward-wire')"), f"{tag}: the focus is on the Field Wire button of the reward")
        page.keyboard.press("Escape"); page.wait_for_timeout(500); shot("06_victory")
        check(js("document.activeElement && document.activeElement.id") == "btn-solstice-reward", f"{tag}: with the reward put away, the focus is on See your reward")
        js("window.closeSolsticeModal()"); page.wait_for_timeout(500)
        js("window.openSolsticeModal()"); page.wait_for_timeout(1500); shot("07_reopened")
        print(tag, "reopened:", js("document.getElementById('solstice-dispatch-text').textContent"))
        js("document.getElementById('btn-solstice-reward').click()"); page.wait_for_timeout(400)
        js("document.querySelector('#modal-solstice-arch .chasm3d-reward-wire').click()"); page.wait_for_timeout(1200)
        check(js("getComputedStyle(document.getElementById('modal-solstice-arch')).display") == "none", f"{tag}: the reward's button takes her to the Field Wire")
        check(not errors, f"{tag}: no page errors {errors[:3]}")
        ctx.close()
    b.close()
print("ALL PASS" if ok else "SOME FAILED"); sys.exit(0 if ok else 1)
