"""Station 19, the end as Silvia will meet it: the vow said, the veil lifted, the closing film, the reward rising by itself,
no green button on the side panel, the focus on See your reward once it is put away, the film played on return when the
station was closed before it, and the reward's own button leading to the Gilded Star and the Field Wire; Mac, small laptop
and phone. Screenshots of every beat go to OUT_DIR.
Usage: python3 finale_s19.py OUT_DIR [PORT]"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8894
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
base = dict(W.DESERT_BASE, **W.DESERT_DONE, order_sun_monolith_completed="true", order_seal_cairn_2="true",
            order_sandstone_labyrinth_completed="true", order_seal_cairn_3="true", order_monolith_gate_seal1="true",
            order_cairn_iv_completed="true", order_seal_cairn_4="true", order_cairn4_sound="off")
seed = dict(base, **W.ORACLE_SEED_EXTRA)
seed.update({"order_field_wire_step": "30", "order_gates_return": json.dumps({"done": True, "sealed": True}),
             "order_oracle_howto": "seen", "order_oracle_cine_intro": "seen", "order_oracle_cine_outro": "",
             "order_oracle_key": "turned", "order_oracle_lamp": "lit", "order_oracle_awake": "true", "order_oracle_disc": "true",
             "order_oracle_weigh_step": "3", "order_oracle_when_read": "true"})
VOW = ["YOU", "WERE", "ALWAYS", "THE", "TREASURE"]
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
        js("window.openOracleModal()"); page.wait_for_timeout(1500)
        check(not js("document.getElementById('btn-oracle-finish')"), f"{tag}: no green Field Wire button on the side panel")
        shot("01_vow")
        print(tag, "dispatch:", js("document.getElementById('oracle-dispatch-text').textContent"))
        tiles = js("window.__oracle.tiles")
        used = set()
        for w in VOW:
            i = next(k for k, t in enumerate(tiles) if t == w and k not in used); used.add(i)
            js(f"window.__oracle.say({i})"); page.wait_for_timeout(120)
        js("window.__oracle.vow()"); page.wait_for_timeout(600)
        check(js("localStorage.getItem('order_oracle_horizon_completed')") == "true", f"{tag}: the vow is said, the veil comes off")
        print(tag, "veil:", js("document.getElementById('oracle-dispatch-text').textContent"))
        page.wait_for_timeout(4000); shot("02_veil")
        if leave:
            js("window.closeOracleModal()"); page.wait_for_timeout(800)
            check(js("localStorage.getItem('order_oracle_cine_outro')") != "seen", f"{tag}: closed before the film, it is still owed")
            js("window.openOracleModal()"); page.wait_for_timeout(600)
            check(js("window.__oracle.cine()"), f"{tag}: on return the closing film plays at once")
        film, shots = False, 0
        for k in range(80):
            if js("window.__oracle.cine()"):
                film = True
                if shots < 3 and k % 5 == 0: page.wait_for_timeout(700); shot(f"03_film_{shots}"); shots += 1
            if js("window.__oracle.rewardOpen()"): break
            page.wait_for_timeout(400)
        check(film and js("localStorage.getItem('order_oracle_cine_outro')") == "seen", f"{tag}: the closing film plays")
        check(js("window.__oracle.rewardOpen()"), f"{tag}: the reward rises by itself, nothing to click")
        page.wait_for_timeout(3500); shot("04_reward")
        check(js("document.activeElement && document.activeElement.classList.contains('chasm3d-reward-wire')"), f"{tag}: the focus is on the Field Wire button of the reward")
        page.keyboard.press("Escape"); page.wait_for_timeout(500); shot("05_victory")
        check(js("document.activeElement && document.activeElement.id") == "btn-oracle-reward", f"{tag}: with the reward put away, the focus is on See your reward")
        js("window.closeOracleModal()"); page.wait_for_timeout(500); js("window.openOracleModal()"); page.wait_for_timeout(1200)
        check(not js("window.__oracle.cine()") and not js("window.__oracle.rewardOpen()"), f"{tag}: reopened when done: no film again")
        check(js("document.activeElement && document.activeElement.id") == "btn-oracle-reward", f"{tag}: reopened, the focus is on See your reward")
        shot("06_reopened")
        js("document.getElementById('btn-oracle-reward').click()"); page.wait_for_timeout(600)
        js("document.querySelector('#modal-oracle-horizon .chasm3d-reward-wire').click()"); page.wait_for_timeout(1000)
        check(js("document.getElementById('modal-item-acquired').style.display") == "flex", f"{tag}: the reward's button shows the Gilded Star's card first")
        js("window.closeItemAcquiredModal()"); page.wait_for_timeout(1500)
        check(js("getComputedStyle(document.getElementById('modal-oracle-horizon')).display") == "none"
              and js("document.getElementById('view-field-wire').classList.contains('active')"), f"{tag}: then to Hermes on the Field Wire")
        shot("07_wire")
        check(not errors, f"{tag}: no page errors {errors[:2]}")
        ctx.close()
    b.close()
print("ALL PASS" if ok else "SOME FAILED"); sys.exit(0 if ok else 1)
