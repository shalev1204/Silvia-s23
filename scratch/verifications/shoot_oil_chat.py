"""Step 7 of the Field Wire: Silvia answers, Hermes finds the flask, the item card opens, the satchel holds it."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "audit"))
import web_smoke as W
from playwright.sync_api import sync_playwright
OUT = os.path.join(os.path.dirname(__file__), "shots")
server = W.start_server()
with sync_playwright() as p:
    b = p.chromium.launch()
    seed = dict(W.DESERT_BASE, order_field_wire_step="7", order_oasis_clepsydra_completed="true", order_desert_lexicon_completed="true", order_salt_playa_completed="true")
    ctx, page, errors = W.new_page(b, seed)
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(1500)
    js = page.evaluate
    js("document.querySelector('[data-view=\"view-field-wire\"]').click()"); page.wait_for_timeout(1500)
    own = lambda: js("JSON.parse(localStorage.getItem('order_inventory_relics')||'[]').includes('lamp_oil')")
    print("flask before answering:", own())
    print("initial mentions flask:", "flask" in js("document.getElementById('wire-messages-stream').innerText"))
    js("document.querySelector('#wire-choices-grid button').click()")
    for _ in range(40):
        page.wait_for_timeout(500)
        if js("getComputedStyle(document.getElementById('modal-item-acquired')).display") != "none": break
    print("item card:", js("getComputedStyle(document.getElementById('modal-item-acquired')).display"), "|", js("document.getElementById('iac-title').innerText"))
    page.screenshot(path=os.path.join(OUT, "oil_card.png"))
    print("flask owned at the card:", own())
    js("document.getElementById('iac-btn-collect') && document.getElementById('iac-btn-collect').click()"); page.wait_for_timeout(5000)
    print("step now:", js("localStorage.getItem('order_field_wire_step')"), "| errors:", errors[:3])
    print("last lines:", js("document.getElementById('wire-messages-stream').innerText").strip()[-260:].replace("\n", " "))
    b.close()
server.shutdown()
