"""Leg 3 of Silvia's road: down to the Oracle with HER satchel (no ibis, no coin, the falcon already on the well chain):
the return through the bronze doors, the inner stair, Station 19 (sigil, disc, the weighing, the pebble, the vow), the
film and the reward, the Wire 31-32, Dawn at the gates, The Desert Path walked, the curtain, step 33.
Usage: python3 leg19.py STATE.json OUT_DIR [PORT]  -> OUT_DIR/log.txt, screenshots, OUT_DIR/state_after_19.json"""
import json, os, sys
from playwright.sync_api import sync_playwright
from walk_common import Walk, W

state, OUT = json.load(open(sys.argv[1])), sys.argv[2]
PORT = int(sys.argv[3]) if len(sys.argv) > 3 else 8903
W.start_server(port=PORT)
LEDGER = dict(O=23, A=7, K=26, G=22, P=21, B=17, V=12, E=2, T=16, F=6, X=15, Q=14, Z=5, R=3, D=18, C=24, W=19, N=11, S=13, U=4, Y=25, L=1, H=20, M=9)

with sync_playwright() as p:
    w = Walk(p, OUT, state, PORT)
    js, get = w.js, w.get
    tray = lambda: js("!!document.getElementById('relic-tray') && !document.getElementById('relic-tray').hidden")
    offered = lambda: js("[...document.querySelectorAll('#relic-tray [data-relic]')].map(b => b.dataset.relic)")
    hand = lambda rid: js("(id => document.querySelector('#relic-tray [data-relic=\"' + id + '\"]').click())", rid)
    gates_open = lambda: js("getComputedStyle(document.getElementById('modal-gates-tower-ii')).display") != "none"
    w.open()
    # she fills in the Ledger as she goes (the weighing reads her own numbers)
    for ch, n in LEDGER.items(): js(f"window.EclipseLedger && window.EclipseLedger.set('{ch}', {n})")
    js("window.selectDesertStation(14)"); w.wait(2000)
    if not gates_open() and js("getComputedStyle(document.getElementById('modal-oracle-horizon')).display") == "none":
        w.note("map did not open; openOracleModal"); js("window.openOracleModal()"); w.wait(2000)
    w.note("gates open first: %s" % gates_open())

    def drive_gates(tag, limit=140):
        seen_choice = 0
        for i in range(limit):
            if js("getComputedStyle(document.getElementById('gates-decree-card')).display") != "none":
                w.shot(f"{tag}_decree"); return True
            if js("(m => m && getComputedStyle(m).display !== 'none')(document.getElementById('modal-item-relinquished'))"):
                w.shot(f"{tag}_relinquished"); js("document.getElementById('ir-btn-continue').click()"); w.wait(600); continue
            if js("(m => m && m.style.display === 'flex')(document.getElementById('modal-item-acquired'))"):
                w.shot(f"{tag}_acquired"); js("window.closeItemAcquiredModal()"); w.wait(600); continue
            if tray():
                ask = js("document.getElementById('relic-tray-ask').textContent"); offer = offered()
                w.note(f"{tag} tray asks: {ask} | offers {offer}"); w.shot(f"{tag}_tray_{i}")
                pick = next((r for r in offer if r.startswith("seal_cairn_")), None) or next((r for r in ("raiders_survey", "falcon_weight", "ibis_figure") if r in offer), None)
                if pick: hand(pick); w.wait(900)
                else: js("document.querySelector('#relic-tray .rt-cancel').click()"); w.wait(600)
                continue
            btns = js("[...document.querySelectorAll('#gates-choices button')].map(b => b.id + '|' + b.innerText.replace(/\\s+/g,' '))")
            if btns:
                w.note(f"{tag} choices: {btns}"); w.shot(f"{tag}_choice_{seen_choice}"); seen_choice += 1
                js("document.querySelector('#gates-choices button').click()"); w.wait(700); continue
            js("window.__gates.fast()"); w.wait(400)
        w.note(f"{tag}: gave up after {limit} turns"); w.shot(f"{tag}_stuck"); return False

    if gates_open():
        drive_gates("return")
        w.note("gates log:\n" + js("document.getElementById('gates-log').innerText")[-4000:])
        js("document.getElementById('btn-gates-depart').click()"); w.wait(1500)
    w.note("S19 open: %s" % (js("getComputedStyle(document.getElementById('modal-oracle-horizon')).display") != "none"))
    k = 0
    while js("window.__oracle.cine()") and k < 120:
        if k % 10 == 0: w.shot(f"s19_intro_{k//10}")
        w.wait(500); k += 1
    for i in range(5):
        if js("(h => h && !h.hidden)(document.getElementById('oracle3d-howto'))"):
            w.shot(f"s19_howto_{i}"); js("document.getElementById('btn-oracle-howto-next').click()"); w.wait(600)
    w.wait(1200)
    for i in range(4):
        if not tray(): break
        ask, offer = js("document.getElementById('relic-tray-ask').textContent"), offered()
        w.note(f"stair tray asks: {ask} | offers {offer}"); w.shot(f"s19_stair_tray_{i}")
        pick = next((r for r in ("servant_key", "founders_lamp") if r in offer), None)
        if pick: hand(pick); w.wait(3200)
        else: js("document.querySelector('#relic-tray .rt-cancel').click()"); w.wait(800)
    w.shot("s19_door")
    w.note("coin slot shown: %s" % js("!document.getElementById('btn-oracle-coin').hidden"))
    for word in ["ORACLE", "OVERTURE"]:
        w.page.fill("#oracle-key-input", word); w.page.click("#btn-oracle-speak"); w.wait(1500)
    w.note("sigil: awake=%s" % get("order_oracle_awake"))
    for i in range(6): w.wait(2000); w.shot(f"s19_door_sinks_{i}")
    sky_spoke = {"Aldebaran": 6, "Capella": 7, "Polaris": 0}
    for ring, star in enumerate(js("window.__oracle.stars")):
        while (star["spoke"] + js("window.__oracle.rot()")[ring]) % 8 != sky_spoke[star["name"]]:
            js(f"window.__oracle.turn({ring}, 1)"); w.wait(150)
    w.wait(2500); w.shot("s19_disc_true")
    for word, wt in (("fear", 18), ("lux", 20), ("era", 12)):
        js(f"window.__oracle.word('{word}')"); w.wait(1500); w.shot(f"s19_word_{word}")
        if word == "lux" and js("window.__oracle.weighState().gone"):
            js("document.getElementById('btn-oracle-moon').click()"); w.wait(600)
        js(f"window.__oracle.weigh({wt})"); w.wait(2500); w.shot(f"s19_weighed_{word}")
    w.note("WHEN read: %s" % get("order_oracle_when_read"))
    w.wait(2500); w.shot("s19_vow")
    if js("!document.getElementById('btn-oracle-pebble').hidden"):
        js("document.getElementById('btn-oracle-pebble').click()"); w.wait(500); w.note("pebble tray offers %s" % offered())
        if "tuning_pebble" in offered(): hand("tuning_pebble"); w.wait(1500)
    tiles = js("window.__oracle.tiles"); used = set()
    for word in ["YOU", "WERE", "ALWAYS", "THE", "TREASURE"]:
        i = next(k2 for k2, t in enumerate(tiles) if t == word and k2 not in used); used.add(i)
        js(f"window.__oracle.say({i})"); w.wait(250)
    w.shot("s19_vow_said"); js("window.__oracle.vow()"); w.wait(800)
    w.note("vow: completed=%s" % get("order_oracle_horizon_completed"))
    for i in range(8): w.wait(2000); w.shot(f"s19_veil_{i}")
    f = 0
    for i in range(80):
        if js("window.__oracle.rewardOpen()"): break
        if js("window.__oracle.cine()") and i % 6 == 0: w.shot(f"s19_outro_{f}"); f += 1
        w.wait(700)
    w.wait(3500); w.shot("s19_reward")
    js("document.querySelector('#modal-oracle-horizon .chasm3d-reward').scrollTop = 99999"); w.wait(500); w.shot("s19_reward_bottom")
    w.note("reward: " + (js("(r => r && !r.hidden ? r.innerText : '')(document.querySelector('#modal-oracle-horizon .chasm3d-reward'))") or "").replace("\n", " | ")[:1800])
    js("document.querySelector('#modal-oracle-horizon .chasm3d-reward-wire').click()"); w.wait(1500)
    if js("(document.getElementById('modal-item-acquired')||{style:{}}).style.display") == "flex":
        w.shot("s19_item_card"); js("window.closeItemAcquiredModal()"); w.wait(1500)
    for i in range(4):
        if js("!!document.getElementById('ledger-complete-overlay')"):
            w.wait(9000); w.shot("ledger_complete"); js("document.getElementById('btn-ledger-complete-close').click()"); w.wait(800)
        w.wait(1000)
    w.wire(); w.wait(3000); w.shot("wire_31")
    w.note("step %s choices %s" % (get("order_field_wire_step"), w.choices()))
    w.answer(2); w.shot("wire_32")
    w.note("step %s; bar %s" % (get("order_field_wire_step"), js("document.querySelector('.messenger-waypoint-title')?.innerText || ''")))
    js("document.getElementById('btn-wire-ceremony').click()"); w.wait(3000)
    w.note("farewell gates open: %s, mode %s" % (gates_open(), js("window.__gates.dlg().mode")))
    for i in range(160):
        if js("getComputedStyle(document.getElementById('gates-decree-card')).display") != "none": break
        btns = js("[...document.querySelectorAll('#gates-choices button')].map(b => b.id + '|' + b.innerText.replace(/\\s+/g,' '))")
        if btns:
            w.note(f"farewell choices: {btns}"); w.shot(f"farewell_choice_{i}")
            nxt = next((b.split('|')[0] for b in btns if not b.startswith('choice-fw_go')), btns[0].split('|')[0])
            js("(id => document.getElementById(id).click())", nxt); w.wait(800); continue
        if tray():
            w.note("farewell tray: %s | %s" % (js("document.getElementById('relic-tray-ask').textContent"), offered())); w.shot(f"farewell_tray_{i}")
            js("document.querySelector('#relic-tray .rt-cancel').click()"); w.wait(600); continue
        js("window.__gates.fast()"); w.wait(400)
    w.shot("farewell_decree")
    w.note("farewell log:\n" + js("document.getElementById('gates-log').innerText")[-5000:])
    w.note("decree: " + js("document.getElementById('gates-decree-card').innerText").replace("\n", " | "))
    js("document.getElementById('btn-gates-depart').click()"); w.wait(2500); w.shot("walked")
    js("(b => b && (b.scrollTop = 99999))(document.querySelector('#desert-farewell .dfw-scroll') || document.getElementById('desert-farewell'))"); w.wait(600); w.shot("walked_bottom")
    w.note("walked: " + js("(b => b && !b.hidden ? b.innerText : '')(document.getElementById('desert-farewell'))").replace("\n", " | ")[:2500])
    js("document.querySelector('#desert-farewell .dfw-go').click()")
    for i in range(6): w.wait(1500); w.shot(f"curtain_{i}")
    w.wait(4000); w.shot("wire_33")
    w.note("step %s choices %s; stage tab %s" % (get("order_field_wire_step"), w.choices(),
           js("getComputedStyle(document.getElementById('btn-tab-path-stage')).display")))
    w.save_state(os.path.join(OUT, "state_after_19.json"))
    w.close()
    print("errors:", w.errors[:8])
