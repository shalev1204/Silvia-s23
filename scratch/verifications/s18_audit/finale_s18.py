"""Station 18, the end as Silvia will meet it: the crossing to the hatch, the falcon on the chain, the Servant out of the well,
the closing film, the reward rising by itself, no green button on the side panel, the focus on See your reward once it is put
away, and the film played on return when the station was closed before it; Mac, small laptop and phone.
Usage: python3 finale_s18.py OUT_DIR [PORT]"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8893
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
seed = dict(W.DESERT_BASE, **W.DESERT_DONE, order_sun_monolith_completed="true", order_seal_cairn_2="true",
            order_sandstone_labyrinth_completed="true", order_seal_cairn_3="true", order_monolith_gate_seal1="true",
            order_cairn_iv_completed="true", order_seal_cairn_4="true", order_cairn4_sound="off",
            order_arch_solstice_completed="true", order_seal_cairn_5="true", order_five_seals_celebrated="true",
            order_field_wire_step="26", order_stele_march_start="1", order_stele_sound="off", order_stele_howto="seen",
            order_stele_cine_intro="seen", order_stele_cine_outro="", order_stele_awake="true", order_stele_knocks="4")
ok = True
def check(cond, msg):
    global ok
    print(("PASS " if cond else "FAIL ") + msg); ok = ok and bool(cond)

with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    for vw, vh, tag, leave in ((1440, 900, "mac", False), (1280, 720, "small", False), (390, 844, "phone", False), (1440, 900, "mac_closed", True)):
        ctx, page, errors = W.new_page(b, seed)
        page.set_viewport_size({"width": vw, "height": vh})
        page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
        js = page.evaluate
        shot = lambda n: page.screenshot(path=os.path.join(OUT, f"{tag}_{n}.png"))
        js("window.openSteleModal()"); page.wait_for_timeout(1500)
        check(not js("document.getElementById('btn-stele-finish')"), f"{tag}: no green Field Wire button on the side panel")
        shot("01_atrium")
        print(tag, "dispatch:", js("document.getElementById('stele-dispatch-text').textContent"))
        moves, _ = W.atrium_search(js("window.__stele.atrium"))
        for dx, dy in moves:
            js(f"window.__stele.move({dx}, {dy})"); page.wait_for_timeout(60)
        page.wait_for_timeout(500)
        if js("!!document.querySelector('#relic-tray [data-relic=\"falcon_weight\"]')"):
            js("document.querySelector('#relic-tray [data-relic=\"falcon_weight\"]').click()")
        page.wait_for_timeout(400)
        check(js("localStorage.getItem('order_polybius_stele_completed')") == "true", f"{tag}: the Servant is out of the well")
        page.wait_for_timeout(3500); shot("02_servant")
        if leave:
            js("window.closeSteleModal()"); page.wait_for_timeout(800)
            check(js("localStorage.getItem('order_stele_cine_outro')") != "seen", f"{tag}: closed before the film, it is still owed")
            js("window.openSteleModal()"); page.wait_for_timeout(600)
            check(js("window.__stele.cine()"), f"{tag}: on return the closing film plays at once")
        film, shots = False, 0
        for k in range(70):
            if js("window.__stele.cine()"):
                film = True
                if shots < 3 and k % 5 == 0: page.wait_for_timeout(700); shot(f"03_film_{shots}"); shots += 1
            if js("window.__stele.rewardOpen()"): break
            page.wait_for_timeout(400)
        check(film and js("localStorage.getItem('order_stele_cine_outro')") == "seen", f"{tag}: the closing film plays")
        check(js("window.__stele.rewardOpen()"), f"{tag}: the reward rises by itself, nothing to click")
        page.wait_for_timeout(3000); shot("04_reward")
        check(js("document.activeElement && document.activeElement.classList.contains('chasm3d-reward-wire')"), f"{tag}: the focus is on the Field Wire button of the reward")
        page.keyboard.press("Escape"); page.wait_for_timeout(500); shot("05_victory")
        check(js("document.activeElement && document.activeElement.id") == "btn-stele-reward", f"{tag}: with the reward put away, the focus is on See your reward")
        print(tag, "after:", js("document.getElementById('stele-dispatch-text').textContent"))
        js("window.closeSteleModal()"); page.wait_for_timeout(500); js("window.openSteleModal()"); page.wait_for_timeout(1200)
        check(not js("window.__stele.cine()") and not js("window.__stele.rewardOpen()"), f"{tag}: reopened when done: no film again, the atrium is calm")
        check(js("document.activeElement && document.activeElement.id") == "btn-stele-reward", f"{tag}: reopened, the focus is on See your reward")
        shot("06_reopened")
        # the reward's Field Wire button: the key's card, then the wire
        js("document.getElementById('btn-stele-reward').click()"); page.wait_for_timeout(600)
        js("document.querySelector('#modal-polybius-stele .chasm3d-reward-wire').click()"); page.wait_for_timeout(1200)
        if js("(document.getElementById('modal-item-acquired')||{style:{}}).style.display") not in ("none", ""):
            js("document.getElementById('btn-item-acquired-close') && document.getElementById('btn-item-acquired-close').click()"); page.wait_for_timeout(1200)
        check(js("getComputedStyle(document.getElementById('modal-polybius-stele')).display") == "none", f"{tag}: the Field Wire button leaves the atrium")
        check(not errors, f"{tag}: no page errors {errors[:2]}")
        ctx.close()
    b.close()
print("ALL PASS" if ok else "SOME FAILED"); sys.exit(0 if ok else 1)
