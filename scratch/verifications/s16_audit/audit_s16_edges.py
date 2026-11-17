"""Edge cases of Station 16 with Silvia's save (spyglass lived): closing during the film, reduced motion, the global mute, Escape order.
Usage: python3 scratch/verifications/s16_audit/audit_s16_edges.py OUT_DIR"""
import os, sys, json, time
MAIN = "/Users/carlespujol/Documents/Silvia's23"
sys.path.insert(0, os.path.join(MAIN, "scripts", "audit"))
import web_smoke as W  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
src = open(os.path.join(W.WEB, "hub/js/story-point.js")).read()
i = src.index("var SAVE = {")
base = {k: v for k, v in json.loads(src[i + 11: src.index("\n        };", i) + 10].strip().rstrip(";")).items() if not k.startswith("__")}
base["order_cairn4_march_start"] = str(int(time.time() * 1000) - int(18.2 * 3600 * 1000))
base["order_bridge_spyglass"] = '{"done":true,"choice":"hide","seen":["wagons","pillars"]}'
base["order_cairn4_cine_intro"] = ""; base["order_cairn4_howto"] = ""
W.BASE = "http://127.0.0.1:8843"
server = W.start_server(port=8843)

with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)

    def page_for(seed, reduced=False):
        ctx, page, errors = W.new_page(b, seed, reduced_motion=reduced)
        page.set_viewport_size({"width": 1440, "height": 900})
        page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2800)
        page.mouse.click(700, 450); page.wait_for_timeout(200)
        return ctx, page, errors

    # 1. closing during the opening film
    ctx, page, errors = page_for(base)
    js = page.evaluate
    js("window.openCairnFourModal()"); page.wait_for_timeout(1200)
    print("1. film running:", js("window.__cairn4.cine()"))
    page.click("#btn-close-pillars"); page.wait_for_timeout(120)
    print("   focus 120 ms after close:", js("document.activeElement && (document.activeElement.id || document.activeElement.className)"))
    page.wait_for_timeout(500)
    print("   focus 620 ms after close:", js("document.activeElement && (document.activeElement.id || document.activeElement.tagName)"), "| cine key:", js("localStorage.getItem('order_cairn4_cine_intro')"))
    js("window.openCairnFourModal()"); page.wait_for_timeout(1200)
    print("   reopened: film again?", js("window.__cairn4.cine()"), "| how to play shown?", not js("document.getElementById('pillars3d-howto').hidden"))
    page.screenshot(path=f"{OUT}/edge_01_reopen_after_close_in_film.png")
    # Escape order: how to play first, then the modal
    page.keyboard.press("Escape"); page.wait_for_timeout(300)
    print("   Escape #1: howto hidden", js("document.getElementById('pillars3d-howto').hidden"), "| modal open", js("getComputedStyle(document.getElementById('modal-cairn-four')).display") != "none")
    print("   errors:", errors[:4])
    ctx.close()

    # 2. reduced motion
    ctx, page, errors = page_for(base, reduced=True)
    js = page.evaluate
    js("window.openCairnFourModal()"); page.wait_for_timeout(1000)
    print("2. reduced: film?", js("window.__cairn4.cine()"), "| howto?", not js("document.getElementById('pillars3d-howto').hidden"))
    js("document.getElementById('btn-pillars-howto-skip').click()")
    page.fill("#pillars-key-input", "RESOUND"); page.click("#btn-pillars-speak"); page.wait_for_timeout(800)
    page.screenshot(path=f"{OUT}/edge_02_reduced_awake.png")
    for fid in ["L30", "L45", "R25"]:
        js(f"window.__cairn4.mark('{fid}')")
    page.wait_for_timeout(100)
    print("   markers placed at once:", js("window.__cairn4.world().markers"))
    page.click("#btn-pillars-sing"); page.wait_for_timeout(600)
    page.screenshot(path=f"{OUT}/edge_03_reduced_verse1.png")
    print("   verse I:", js("localStorage.getItem('order_cairn4_verses')"), "| errors:", errors[:4])
    ctx.close()

    # 3. the global speaker muted: the station's Sound button
    ctx, page, errors = page_for(dict(base, order_ambience_muted="true", order_cairn4_howto="seen", order_cairn4_cine_intro="seen", order_cairn4_awake="true"))
    js = page.evaluate
    js("window.openCairnFourModal()"); page.wait_for_timeout(1000)
    before = js("document.getElementById('btn-pillars-sound').textContent")
    page.click("#btn-pillars-sound"); page.wait_for_timeout(200)
    after1 = js("document.getElementById('btn-pillars-sound').textContent")
    page.click("#btn-pillars-sound"); page.wait_for_timeout(200)
    after2 = js("document.getElementById('btn-pillars-sound').textContent")
    print("3. global mute: Sound button", repr(before), "-> click ->", repr(after1), "-> click ->", repr(after2), "| key", js("localStorage.getItem('order_cairn4_sound')"))
    page.screenshot(path=f"{OUT}/edge_04_global_mute_sound_button.png")
    # turning the station sound off mid-verse
    js("localStorage.setItem('order_ambience_muted','false'); window.EclipseAmbience && window.EclipseAmbience.setMuted(false)")
    page.click("#btn-pillars-sound"); page.wait_for_timeout(100)   # turns it on
    print("   after unmute + click:", js("document.getElementById('btn-pillars-sound').textContent"))
    print("   errors:", errors[:4])
    ctx.close()
    b.close()
server.shutdown()
