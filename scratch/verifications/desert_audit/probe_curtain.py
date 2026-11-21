"""The end of the Desert Path at real speed (no __wireFast): Dawn at the gates, the recap fully drawn, the curtain, what follows.
Usage: python3 probe_curtain.py STATE_AFTER_19.json OUT_DIR [PORT] [W H]"""
import json, sys
from playwright.sync_api import sync_playwright
from walk_common import Walk, W
st, OUT = json.load(open(sys.argv[1])), sys.argv[2]
PORT = int(sys.argv[3]) if len(sys.argv) > 3 else 8912
vw, vh = (int(sys.argv[4]), int(sys.argv[5])) if len(sys.argv) > 5 else (1440, 900)
st.pop("order_desert_farewell", None); st["order_desert_farewell_pending"] = "true"
st["order_wire_chapters_closed"] = "[25]"; st["order_field_wire_step"] = "32"
W.start_server(port=PORT)
with sync_playwright() as p:
    w = Walk(p, OUT, st, PORT, vw, vh, fast=False)
    js = w.js
    w.open(); w.wire(); w.wait(4000); w.shot("wire_32")
    js("document.getElementById('btn-wire-ceremony').click()"); w.wait(3000)
    for i in range(300):
        if js("getComputedStyle(document.getElementById('gates-decree-card')).display") != "none": break
        b = js("[...document.querySelectorAll('#gates-choices button')].map(b => b.id)")
        if b:
            nxt = next((x for x in b if not x.startswith('choice-fw_go')), b[0]); js("(id => document.getElementById(id).click())", nxt); w.wait(800); continue
        js("window.__gates.fast()"); w.wait(400)
    w.wait(3000); w.shot("decree")
    js("document.getElementById('btn-gates-depart').click()")
    for t in (1, 3, 7): w.wait(1000 if t == 1 else (2000 if t == 3 else 4000)); w.shot(f"walked_{t}s")
    js("(b => b && (b.scrollTop = 99999))(document.getElementById('desert-farewell'))"); w.wait(800); w.shot("walked_bottom")
    js("document.querySelector('#desert-farewell .dfw-go').click()")
    for i in range(10): w.wait(700); w.shot(f"curtain_{i}")
    for i in range(6): w.wait(2500); w.shot(f"after_{i}")
    w.note("view %s step %s" % (js("document.body.dataset.activeView"), w.get("order_field_wire_step")))
    w.close(); print("errors", w.errors[:6])
