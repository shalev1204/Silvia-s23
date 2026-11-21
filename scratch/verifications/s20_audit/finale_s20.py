"""Station 20, the end as Silvia will meet it: the third mask made whole, the niche and the Mirror Speaker, the closing film,
the reward rising by itself, no green button on the side panel, the focus on See your reward once it is put away, the film
played on return when the station was closed before it, and the reward's own button leading to Fragment I's card and the
Field Wire; Mac, small laptop and phone. Screenshots of every beat go to OUT_DIR.
Usage: python3 finale_s20.py OUT_DIR [PORT]"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8892
W.BASE = f"http://127.0.0.1:{PORT}"; W.start_server(port=PORT)
seed = {**W.DESERT_BASE, **W.DESERT_DONE, **W.ORACLE_SEED_EXTRA, "order_oracle_horizon_completed": "true",
        "order_field_wire_step": "34", "order_field_wire_choices": json.dumps([2, 0, 1, 0] + [0] * 30), **W.WIRE_PASSED,
        "order_masks_march_start": "1", "order_masks_march_bypassed": "true", "order_masks_howto": "seen", "order_masks_cine_intro": "seen",
        "order_masks_cine_outro": "", "order_masks_gate_awake": "true", "order_masks_carved": "2", "order_masks_draw_misses": "1"}
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
        js("window.openMasksModal()"); page.wait_for_timeout(1500)
        print(tag, "dispatch:", js("document.getElementById('masks-dispatch-text').textContent"))
        shot("01_third_mask")
        js("window.__masks.drawTrue()"); js("document.getElementById('btn-masks-hold').click()"); page.wait_for_timeout(600)
        check(js("localStorage.getItem('order_masks_gate_completed')") == "true", f"{tag}: the third mask closes the gate's trial")
        check(not js("document.getElementById('btn-masks-finish-station')"), f"{tag}: no green button on the side panel")
        page.wait_for_timeout(5000); shot("02_niche")
        page.wait_for_timeout(5000); shot("03_speaker")
        if leave:
            js("window.closeMasksModal()"); page.wait_for_timeout(1000)
            check(js("localStorage.getItem('order_masks_cine_outro')") != "seen", f"{tag}: closed before the film, it is still owed")
            js("window.openMasksModal()"); page.wait_for_timeout(600)
            check(js("window.__masks.cine()"), f"{tag}: on return the closing film plays at once")
        film, shots = False, 0
        for k in range(80):
            if js("window.__masks.cine()"):
                film = True
                if shots < 3 and k % 5 == 0: page.wait_for_timeout(700); shot(f"04_film_{shots}"); shots += 1
            if js("window.__masks.rewardOpen()"): break
            page.wait_for_timeout(400)
        check(film and js("localStorage.getItem('order_masks_cine_outro')") == "seen", f"{tag}: the closing film plays")
        check(js("window.__masks.rewardOpen()"), f"{tag}: the reward rises by itself, nothing to click")
        page.wait_for_timeout(1500); shot("05_reward_rising")
        page.wait_for_timeout(5000); shot("06_reward")
        check(js("document.activeElement && document.activeElement.classList.contains('chasm3d-reward-wire')"), f"{tag}: the focus is on the Field Wire button of the reward")
        sc = js("(() => { const r = document.querySelector('#modal-masks-gate .chasm3d-reward'); return [r.scrollHeight, r.clientHeight, document.documentElement.scrollWidth, document.documentElement.clientWidth]; })()")
        print(tag, "reward scroll h/ch, page sw/cw:", sc)
        check(sc[2] <= sc[3], f"{tag}: nothing spills sideways")
        js("document.querySelector('#modal-masks-gate .chasm3d-reward').scrollTop = 99999"); page.wait_for_timeout(400); shot("07_reward_bottom")
        page.keyboard.press("Escape"); page.wait_for_timeout(500); shot("08_victory")
        check(js("document.activeElement && document.activeElement.id") == "btn-masks-reward", f"{tag}: with the reward put away, the focus is on See your reward")
        js("window.closeMasksModal()"); page.wait_for_timeout(600); js("window.openMasksModal()"); page.wait_for_timeout(1200)
        check(not js("window.__masks.cine()") and not js("window.__masks.rewardOpen()"), f"{tag}: reopened when done: no film again")
        check(js("document.activeElement && document.activeElement.id") == "btn-masks-reward", f"{tag}: reopened, the focus is on See your reward")
        js("document.getElementById('btn-masks-reward').click()"); page.wait_for_timeout(600)
        js("document.querySelector('#modal-masks-gate .chasm3d-reward-wire').click()"); page.wait_for_timeout(1000)
        check(js("document.getElementById('modal-item-acquired').style.display") == "flex", f"{tag}: the reward's button shows Fragment I's card first")
        js("window.closeItemAcquiredModal()"); page.wait_for_timeout(1800)
        check(js("getComputedStyle(document.getElementById('modal-masks-gate')).display") == "none"
              and js("document.getElementById('view-field-wire').classList.contains('active')"), f"{tag}: then to Hermes on the Field Wire")
        shot("09_wire")
        print(tag, "wire:", js("document.getElementById('view-field-wire').innerText")[:300].replace("\n", " | "))
        check(not errors, f"{tag}: no page errors {errors[:2]}")
        ctx.close()
    b.close()
print("ALL PASS" if ok else "SOME FAILED"); sys.exit(0 if ok else 1)
