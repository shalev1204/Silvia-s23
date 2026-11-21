"""Leg 1 of Silvia's road: from her real save (Wire step 22, the 18-hour walk to the Arch over) through Station 17,
the five seals, the Wire debrief and Chapter II's close, to the noon reply that starts the walk to Tower II.
Usage: python3 leg17.py SAVE.json OUT_DIR [PORT]  -> OUT_DIR/log.txt, screenshots, OUT_DIR/state_after_17.json"""
import json, os, sys
from playwright.sync_api import sync_playwright
from walk_common import Walk, W

save, OUT = json.load(open(sys.argv[1])), sys.argv[2]
PORT = int(sys.argv[3]) if len(sys.argv) > 3 else 8901
W.start_server(port=PORT)

with sync_playwright() as p:
    w = Walk(p, OUT, save, PORT)
    js, get = w.js, w.get
    w.open(); w.note("Hub opened with Silvia's save")
    w.shot("hub_home")
    w.wire(); w.note("Field Wire as she finds it (step %s)" % get("order_field_wire_step"))
    w.shot("wire_now")
    print("choices:", w.choices())
    w.note("choices at the Wire: %s" % w.choices())
    bar = js("document.querySelector('.messenger-waypoint-title')?.innerText || ''")
    w.note("bar: " + bar.replace("\n", " "))

    # Station 17, as she would open it from the map
    js("window.selectDesertStation(26)"); w.wait(1500)
    if js("getComputedStyle(document.getElementById('modal-solstice-arch')).display") == "none":
        w.note("the map did not open S17; opening directly"); js("window.openSolsticeModal()"); w.wait(1500)
    w.note("S17 opened")
    k = 0
    while js("window.__cairn5.cine()") and k < 120:
        if k % 10 == 0: w.shot(f"s17_intro_{k//10}")
        w.wait(500); k += 1
    w.note("intro film over after ~%ds" % (k // 2))
    if js("!document.getElementById('solstice3d-howto').hidden"):
        for i in range(4):
            w.shot(f"s17_howto_{i}"); js("document.getElementById('btn-solstice-howto-next').click()"); w.wait(500)
    w.shot("s17_sigil")
    for word in ["SUNRISE", "DAYBREAK"]:
        w.page.fill("#solstice-key-input", word); w.page.click("#btn-solstice-speak"); w.wait(1500)
    w.note("sigil spoken: awake=%s" % get("order_cairn5_awake"))
    w.wait(3000); w.shot("s17_courtyard_night")
    js("window.__cairn5.turn(4)"); w.wait(800); w.shot("s17_tray_light")
    tray = js("[...document.querySelectorAll('#relic-tray [data-relic]')].map(b => b.dataset.relic)")
    w.note("tray offers: %s" % tray)
    if "lamp_oil" in tray:
        js("document.querySelector('#relic-tray [data-relic=\"lamp_oil\"]').click()"); w.wait(900)
        w.shot("s17_oil_card")
        js("document.getElementById('ir-btn-continue') && document.getElementById('ir-btn-continue').click()"); w.wait(800)
    js("window.__cairn5.turn(4)"); w.wait(300)
    court = js("window.__cairn5.court")
    routes = [W.dawn_routes(court, col) for col in court["entries"]]
    js("window.__cairn5.startDawn()"); w.wait(2500); w.shot("s17_dawn_start")
    for r in routes:
        cur = js("window.__cairn5.mirrors()")
        for i, m in r[0].items():
            if cur[i] != m: js(f"window.__cairn5.turn({i})")
        w.wait(2500); w.shot("s17_ray")
    w.note("dawn done=%s" % js("window.__cairn5.state()"))
    for i in range(6):
        w.wait(2500); w.shot(f"s17_after_dawn_{i}")
    w.note("after the dawn")
    for _ in range(30):
        if js("!document.getElementById('btn-solstice-raise').hidden"): break
        w.wait(1000)
    w.shot("s17_night")
    js("document.getElementById('btn-solstice-raise').click()"); w.wait(600)
    w.note("tray at night: %s" % js("[...document.querySelectorAll('#relic-tray [data-relic]')].map(b => b.dataset.relic)"))
    js("document.querySelector('#relic-tray [data-relic=\"signal_mirror\"]') && document.querySelector('#relic-tray [data-relic=\"signal_mirror\"]').click()"); w.wait(800)
    rounds = js("window.__cairn5.rounds")
    js("window.__cairn5.flash('L')"); js("window.__cairn5.send()"); w.wait(1500)
    for pat in rounds:
        w.wait(4000)
        for c in pat: js(f"window.__cairn5.flash('{c}')")
        js("window.__cairn5.send()"); w.wait(2500); w.shot("s17_signal")
    w.note("signals answered")
    for i in range(12):
        w.wait(2500); w.shot(f"s17_finale_{i}")
        if js("getComputedStyle(document.getElementById('five-seals-overlay')).display") != "none": break
    w.note("five seals overlay: %s" % (js("getComputedStyle(document.getElementById('five-seals-overlay')).display") != "none"))
    w.wait(6000); w.shot("s17_ceremony")
    w.wait(6000); w.shot("s17_ceremony_2")
    js("document.getElementById('btn-five-seals-close').click()"); w.wait(1500)
    for i in range(20):
        if js("window.__cairn5.rewardOpen()"): break
        if js("window.__cairn5.cine()"):
            w.shot(f"s17_outro_{i}")
        w.wait(1500)
    w.wait(3000); w.shot("s17_reward")
    js("document.querySelector('#modal-solstice-arch .chasm3d-reward').scrollTop = 99999"); w.wait(500); w.shot("s17_reward_bottom")
    w.note("reward: " + (js("(r => r && !r.hidden ? r.innerText : '')(document.querySelector('#modal-solstice-arch .chasm3d-reward'))") or "").replace("\n", " | ")[:1500])
    js("document.querySelector('#modal-solstice-arch .chasm3d-reward-wire').click()"); w.wait(1500)
    if js("(document.getElementById('modal-item-acquired')||{style:{}}).style.display") == "flex":
        w.shot("s17_item_card"); js("window.closeItemAcquiredModal()"); w.wait(1500)
    w.note("left S17 -> wire active=%s" % js("document.getElementById('view-field-wire').classList.contains('active')"))
    w.wait(4000); w.shot("wire_23")
    w.note("step %s choices %s" % (get("order_field_wire_step"), w.choices()))
    w.answer(1); w.shot("wire_24")
    w.note("step %s; ceremony button shown=%s" % (get("order_field_wire_step"), js("!document.getElementById('btn-wire-ceremony').hidden")))
    if js("!document.getElementById('btn-wire-ceremony').hidden"):
        js("document.getElementById('btn-wire-ceremony').click()"); w.wait(2500); w.shot("chapter_ceremony"); w.wait(6000)
        w.shot("chapter_ceremony_2")
        for _ in range(6):   # a ceremony card may need closing
            btn = js("(() => { const b = [...document.querySelectorAll('.wire-ceremony button, #wire-ceremony button, [id*=ceremony] button')].find(x => x.offsetParent); if (b) { b.click(); return b.innerText; } return ''; })()")
            if not btn: break
            w.note("ceremony button: " + btn); w.wait(2500)
    w.wait(3000); w.shot("wire_25")
    w.note("step %s choices %s" % (get("order_field_wire_step"), w.choices()))
    w.answer(2); w.shot("wire_26")
    w.note("step %s; stele march start %s; bar %s" % (get("order_field_wire_step"), get("order_stele_march_start"),
                                                  js("document.querySelector('.messenger-waypoint-title')?.innerText || ''")))
    w.note("full wire text tail:\n" + w.wire_text()[-6000:])
    w.save_state(os.path.join(OUT, "state_after_17.json"))
    w.close()
    print("errors:", w.errors[:5])
