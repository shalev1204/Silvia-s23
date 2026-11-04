import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "audit"))
import web_smoke as W
from playwright.sync_api import sync_playwright
OUT = os.path.join(os.path.dirname(__file__), "shots")
seed = dict(W.DESERT_BASE, the_eclipse_active_seeker="Carles", order_desert_lexicon_completed="true", order_oasis_clepsydra_completed="true", order_field_wire_step="7")
server = W.start_server()
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx, page, errors = W.new_page(b, seed)
    page.set_viewport_size({"width": 1300, "height": 850})
    page.goto(f"{W.BASE}/index.html", wait_until="load"); page.wait_for_timeout(2000)
    page.evaluate("window.openItemAcquiredModal({id:'water_skins'})"); page.wait_for_timeout(1500)
    page.screenshot(path=os.path.join(OUT, "item_skins.png"))
    page.evaluate("window.closeItemAcquiredModal()"); page.evaluate("window.openItemAcquiredModal({id:'falcon_weight'})"); page.wait_for_timeout(1500)
    page.screenshot(path=os.path.join(OUT, "item_weight.png"))
    print(errors[:3]); b.close()
server.shutdown()
