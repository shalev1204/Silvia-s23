"""Probe: the Station 15 card after the walk ends. Usage: python3 scratch/verifications/s15_card_probe.py"""
import os, sys, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "audit"))
import web_smoke as W
from playwright.sync_api import sync_playwright
server = W.start_server()
seed = dict(W.DESERT_BASE, **W.DESERT_DONE, order_sun_monolith_completed="true", order_sun_monolith_awake="true", order_seal_cairn_2="true",
            order_monolith_gate_seal1="true", order_field_wire_step="14", order_field_wire_choices="[2,0,1,0,0,0,1,0,0,0,0,0,0,0]",
            order_labyrinth_march_start=str(int(time.time()*1000)), **W.WIRE_PASSED)
with sync_playwright() as p:
    b = p.chromium.launch(args=W.CHROMIUM_ARGS)
    ctx, page, errors = W.new_page(b, seed)
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2500)
    js = page.evaluate
    info = lambda: js("[document.getElementById('insp-title').innerText, document.getElementById('insp-btn-primary').disabled, document.getElementById('insp-btn-primary').innerText, document.body.dataset.activeView, window.__inspNodeId]")
    js("window.selectMapNode(24, false)"); page.wait_for_timeout(300); print(info())
    js("document.querySelector('[data-view=\"view-field-wire\"]').click()"); page.wait_for_timeout(400)
    js("localStorage.setItem('order_labyrinth_march_start', String(Date.now() - 7*3600*1000))")
    js("document.querySelector('[data-view=\"view-trail\"]').click()"); page.wait_for_timeout(800); print(info())
    print(errors); b.close()
server.shutdown()
