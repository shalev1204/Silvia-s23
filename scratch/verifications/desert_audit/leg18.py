"""Leg 2 of Silvia's road: the 6-hour walk to Tower II (its march events), Station 18 played as she would (one wrong
proverb, the knocks, the burning atrium, the falcon on the chain), the film, the reward, the Wire debrief 27-28
and the reply at the inner stair (29).
Usage: python3 leg18.py STATE.json OUT_DIR [PORT]  -> OUT_DIR/log.txt, screenshots, OUT_DIR/state_after_18.json"""
import json, os, sys, time
from playwright.sync_api import sync_playwright
from walk_common import Walk, W

state, OUT = json.load(open(sys.argv[1])), sys.argv[2]
PORT = int(sys.argv[3]) if len(sys.argv) > 3 else 8902
W.start_server(port=PORT)
# three hours into the walk: the march events of this leg come in on the Field Wire
state["order_stele_march_start"] = str(int(time.time() * 1000) - 3 * 3600 * 1000)

with sync_playwright() as p:
    w = Walk(p, OUT, state, PORT)
    js, get = w.js, w.get
    w.open(); w.wire(); w.note("halfway to Tower II (3 h of 6)")
    w.shot("wire_march_half")
    w.note("choices: %s" % w.choices())
    for k in range(4):   # answer the march events that wait for her
        ch = w.choices()
        if not ch: break
        w.answer(k % 2, 6000); w.note("march event answered: %s" % ch); w.shot(f"wire_march_event_{k}")
    w.note("bar: " + js("document.querySelector('.messenger-waypoint-title')?.innerText || ''"))
    js("localStorage.setItem('order_stele_march_start', String(Date.now() - 7 * 3600 * 1000))")
    w.page.reload(); w.wait(3000); w.recap("recap_arrival"); w.wire(); w.note("after 6 h: Hermes at Tower II")
    w.shot("wire_arrived"); w.note("choices: %s; bar: %s" % (w.choices(), js("document.querySelector('.messenger-waypoint-title')?.innerText || ''")))

    js("window.selectDesertStation(13)"); w.wait(1500)
    if js("getComputedStyle(document.getElementById('modal-polybius-stele')).display") == "none":
        w.note("the map did not open S18; opening directly"); js("window.openSteleModal()"); w.wait(1500)
    w.note("S18 opened")
    k = 0
    while js("window.__stele.cine()") and k < 120:
        if k % 10 == 0: w.shot(f"s18_intro_{k//10}")
        w.wait(500); k += 1
    w.note("intro film over after ~%ds" % (k // 2))
    for i in range(5):
        if js("(h => h && !h.hidden)(document.getElementById('stele3d-howto'))"):
            w.shot(f"s18_howto_{i}"); js("document.getElementById('btn-stele-howto-next').click()"); w.wait(500)
    w.shot("s18_proverb")
    for words in ["STARS GUIDE THOSE WHO SEEK", "Stars guide those who seek truth"]:
        w.page.fill("#stele-key-input", words); w.page.click("#btn-stele-speak"); w.wait(1500)
    w.note("proverb: awake=%s" % get("order_stele_awake"))
    w.wait(2500); w.shot("s18_stele_turned")
    grid = js("window.__stele.grid")
    def knocks(word, moon):
        out = []
        for ch in word:
            k2 = grid.index(ch); row, col = k2 // 5 + 1, k2 % 5 + 1
            out += [col, row] if moon else [row, col]
        return out
    for _ in range(40):
        if not js("window.__stele.state().playing"): break
        w.wait(500)
    w.shot("s18_who_knocked")
    js("window.__stele.read('WHO')"); w.wait(1500); w.shot("s18_your_stanza")
    js("window.__stele.stop()")
    for count in knocks("SEEK", True):
        for _ in range(count): w.page.click("#btn-stele-knock")
        w.page.click("#btn-stele-pause")
    w.page.click("#btn-stele-send")
    for _ in range(40):
        if js("window.__stele.state().knocks") == 2: break
        w.wait(500)
    w.note("SEEK sent: knocks=%s" % js("window.__stele.state().knocks"))
    for _ in range(60):
        if not js("window.__stele.state().playing") and js("document.querySelectorAll('#stele-tape .stele-group').length") > 0: break
        w.wait(500)
    js("window.__stele.read('WELL')"); w.wait(2000)
    for _ in range(60):
        if not js("window.__stele.state().playing"): break
        w.wait(500)
    w.shot("s18_ash_knocked")
    js("window.__stele.read('SAH')"); w.wait(1200); w.shot("s18_ash_wrong")
    js("window.__stele.read('ASH')"); w.wait(3000); w.shot("s18_atrium")
    w.note("atrium open: %s" % js("window.__stele.state()"))
    atrium = js("window.__stele.atrium")
    moves, _ = W.atrium_search(atrium)
    for i, (dx, dy) in enumerate(moves):
        js(f"window.__stele.move({dx}, {dy})"); w.wait(450)
        if i in (3, 8): w.shot(f"s18_crossing_{i}")
    w.wait(800); w.shot("s18_hatch_tray")
    w.note("tray at the hatch: %s" % js("[...document.querySelectorAll('#relic-tray [data-relic]')].map(b => b.dataset.relic)"))
    if js("!!document.querySelector('#relic-tray [data-relic=\"falcon_weight\"]')"):
        js("document.querySelector('#relic-tray [data-relic=\"falcon_weight\"]').click()"); w.wait(800)
    for i in range(6):
        w.wait(2000); w.shot(f"s18_servant_{i}")
    filmed = 0
    for i in range(60):
        if js("window.__stele.rewardOpen()"): break
        if js("window.__stele.cine()") and i % 6 == 0: w.shot(f"s18_outro_{filmed}"); filmed += 1
        w.wait(800)
    w.wait(3500); w.shot("s18_reward")
    js("document.querySelector('#modal-polybius-stele .chasm3d-reward').scrollTop = 99999"); w.wait(500); w.shot("s18_reward_bottom")
    w.note("reward: " + (js("(r => r && !r.hidden ? r.innerText : '')(document.querySelector('#modal-polybius-stele .chasm3d-reward'))") or "").replace("\n", " | ")[:1500])
    js("document.querySelector('#modal-polybius-stele .chasm3d-reward-wire').click()"); w.wait(1500)
    if js("(document.getElementById('modal-item-acquired')||{style:{}}).style.display") == "flex":
        w.shot("s18_item_card"); js("window.closeItemAcquiredModal()"); w.wait(1500)
    w.wait(4000); w.shot("wire_27")
    w.note("step %s choices %s" % (get("order_field_wire_step"), w.choices()))
    w.answer(0); w.shot("wire_28")
    w.note("step %s choices %s; bar %s" % (get("order_field_wire_step"), w.choices(), js("document.querySelector('.messenger-waypoint-title')?.innerText || ''")))
    if w.choices():
        w.answer(1); w.shot("wire_30")
    w.note("step %s; bar %s" % (get("order_field_wire_step"), js("document.querySelector('.messenger-waypoint-title')?.innerText || ''")))
    w.save_state(os.path.join(OUT, "state_after_18.json"))
    w.close()
    print("errors:", w.errors[:5])
