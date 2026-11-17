"""Probe: how long a Test call stays on the tape, with and without a recorded verse. Usage: python3 probe_testcall.py"""
import os, sys, json, time
sys.path.insert(0, "/Users/carlespujol/Documents/Silvia's23/scripts/audit")
import web_smoke as W
from playwright.sync_api import sync_playwright
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read(); i = src.index("var SAVE = {")
save = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
save.update(order_cairn4_march_start=str(int(time.time()*1000) - 19*3600*1000), order_bridge_spyglass='{"done":true,"choice":"hide"}', order_cairn4_awake="true")
W.BASE = "http://127.0.0.1:8843"; server = W.start_server(port=8843)
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, save); page.set_viewport_size({"width": 1440, "height": 900})
    js = page.evaluate
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500); page.mouse.click(700, 450)
    js("window.openCairnFourModal()"); page.wait_for_timeout(1500)
    for label in ["no record yet", "after a verse"]:
        if label == "after a verse":
            page.click("#btn-pillars-play"); page.wait_for_timeout(16500)
        page.click("#btn-pillars-mode-call")
        a = js("window.__cairn4.aimAt('L50')"); page.mouse.click(a["x"], a["y"])
        t0 = time.time(); seen = []
        while time.time() - t0 < 12:
            s = js("document.getElementById('pillars-tape-status').textContent")
            if not seen or seen[-1][1] != s: seen.append((round(time.time() - t0, 2), s))
            page.wait_for_timeout(150)
        print(label, seen)
    # mute ambience mid-verse: do the pillar voices stop?
    page.click("#btn-pillars-play"); page.wait_for_timeout(1500)
    js("document.getElementById('ambience-toggle').click()"); page.wait_for_timeout(300)
    print("global speaker muted mid-verse; pillar sfx ctx state:", js("window.sfx && window.sfx.ctx && window.sfx.ctx.state"), "| station sound button:", js("document.getElementById('btn-pillars-sound').textContent"))
    print("errors", errors[:4]); b.close()
server.shutdown()
