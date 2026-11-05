#!/usr/bin/env python3
"""
Verification of the 3 Lamp Oil scenarios in the Erg crossing (Station 13c):
1. 'refuse': oil kept, full bottle image and original description unchanged.
2. 'share': half oil given, bottle image updates to half-full (unstoppered, depleted),
   inventory description updates dynamically to half-measure lore.
3. 'all': all oil given, cinematic Item Relinquished popup appears with dissolve animation,
   lamp oil is completely purged from inventory and satchel badge updates.
"""

import http.server
import socketserver
import threading
import sys
import os
import time
from playwright.sync_api import sync_playwright

PORT = 8923
WEB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../web'))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)
    def log_message(self, format, *args):
        pass  # quiet

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(('127.0.0.1', PORT), Handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd

def main():
    print("✦ Starting local web server on port", PORT, "serving", WEB_DIR)
    server = start_server()
    time.sleep(0.5)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # ------------------------------------------------------------------
        # TEST 1: REFUSE SCENARIO
        # ------------------------------------------------------------------
        print("\n--- TEST 1: Refuse Scenario ---")
        page.goto(f'http://127.0.0.1:{PORT}/index.html')
        page.wait_for_function('() => typeof window.getOwnedRelicIds === "function" && typeof window.openNightErgModal === "function"', timeout=15000)

        page.evaluate('''() => {
            localStorage.setItem('the_eclipse_active_seeker', 'Silvia');
            localStorage.setItem('order_oasis_clepsydra_completed', 'true');
            localStorage.setItem('order_desert_lexicon_completed', 'true');
            localStorage.setItem('order_whispering_chasm_completed', 'true');
            localStorage.setItem('order_salt_playa_completed', 'true');
            localStorage.setItem('order_cairn1_completed', 'true');
            localStorage.setItem('order_lamp_oil_found', 'true');
            localStorage.setItem('order_field_wire_step', '8');
            localStorage.setItem('order_gates_path', 'humble');
            localStorage.setItem('order_gates_flags', JSON.stringify({}));
            if (window.addRelicToInventory) window.addRelicToInventory('lamp_oil');
            if (window.syncLampOil) window.syncLampOil();
            if (window.openNightErgModal) window.openNightErgModal();
            if (window.__nightErg && window.__nightErg.fast) window.__nightErg.fast();
        }''')

        # Wait for choice button
        page.wait_for_selector('#night-choice-refuse', state='visible', timeout=15000)
        page.evaluate('() => { if (window.__nightErg && window.__nightErg.fast) window.__nightErg.fast(); }')
        page.click('#night-choice-refuse')
        page.wait_for_function("() => window.GatesRoad && window.GatesRoad.flags().nightOil === 'kept'", timeout=15000)
        page.wait_for_timeout(1000)

        t1_flags = page.evaluate('() => window.GatesRoad.flags()')
        t1_relics = page.evaluate('() => window.getOwnedRelicIds()')
        t1_item = page.evaluate('() => window.SATCHEL_RELICS.lamp_oil')
        print("DEBUG t1_flags:", t1_flags)
        print("DEBUG t1_relics:", t1_relics)
        print("DEBUG hasLantern:", page.evaluate('() => window.GatesRoad.hasLantern()'))
        print("DEBUG localStorage relics:", page.evaluate('() => localStorage.getItem("order_inventory_relics")'))
        print("DEBUG LAMP_OIL_KEY:", page.evaluate('() => localStorage.getItem("order_lamp_oil_found")'))
        print("DEBUG wire_step:", page.evaluate('() => localStorage.getItem("order_field_wire_step")'))

        assert t1_flags.get('nightOil') == 'kept', f"Expected nightOil 'kept', got {t1_flags.get('nightOil')}"
        assert 'lamp_oil' in t1_relics, "Expected lamp_oil to remain in relics"
        assert 'item_lamp_oil.png' in t1_item.get('image'), f"Expected full bottle image, got {t1_item.get('image')}"
        assert 'sealed with dripping wax' in t1_item.get('summary'), "Expected full bottle summary"
        print("✅ TEST 1 PASSED: 'refuse' leaves full bottle intact with original image and lore.")

        # ------------------------------------------------------------------
        # TEST 2: SHARE SCENARIO
        # ------------------------------------------------------------------
        print("\n--- TEST 2: Share Scenario ---")
        page.evaluate('''() => {
            localStorage.setItem('the_eclipse_active_seeker', 'Silvia');
            localStorage.setItem('order_oasis_clepsydra_completed', 'true');
            localStorage.setItem('order_desert_lexicon_completed', 'true');
            localStorage.setItem('order_whispering_chasm_completed', 'true');
            localStorage.setItem('order_salt_playa_completed', 'true');
            localStorage.setItem('order_cairn1_completed', 'true');
            localStorage.setItem('order_lamp_oil_found', 'true');
            localStorage.setItem('order_field_wire_step', '8');
            localStorage.setItem('order_gates_path', 'humble');
            localStorage.setItem('order_gates_flags', JSON.stringify({}));
            if (window.addRelicToInventory) window.addRelicToInventory('lamp_oil');
            if (window.syncLampOil) window.syncLampOil();
            if (window.openNightErgModal) window.openNightErgModal();
            if (window.__nightErg && window.__nightErg.fast) window.__nightErg.fast();
        }''')

        page.wait_for_selector('#night-choice-share', state='visible', timeout=15000)
        page.evaluate('() => { if (window.__nightErg && window.__nightErg.fast) window.__nightErg.fast(); }')
        page.click('#night-choice-share')
        page.wait_for_function("() => window.GatesRoad && window.GatesRoad.flags().nightOil === 'shared'", timeout=15000)
        page.wait_for_timeout(1000)

        t2_flags = page.evaluate('() => window.GatesRoad.flags()')
        t2_relics = page.evaluate('() => window.getOwnedRelicIds()')
        t2_item = page.evaluate('() => window.SATCHEL_RELICS.lamp_oil')

        assert t2_flags.get('nightOil') == 'shared', f"Expected nightOil 'shared', got {t2_flags.get('nightOil')}"
        assert 'lamp_oil' in t2_relics, "Expected lamp_oil to remain in relics"
        assert 'item_lamp_oil_half.png' in t2_item.get('image'), f"Expected half bottle image, got {t2_item.get('image')}"
        assert 'half its measure' in t2_item.get('summary'), f"Expected half bottle summary, got {t2_item.get('summary')}"
        assert 'shared with the night traveller' in t2_item.get('origin'), f"Expected half bottle origin, got {t2_item.get('origin')}"
        print("✅ TEST 2 PASSED: 'share' updates bottle to item_lamp_oil_half.png and dynamic half-full lore.")

        # ------------------------------------------------------------------
        # TEST 3: ALL SCENARIO
        # ------------------------------------------------------------------
        print("\n--- TEST 3: Give All Scenario ---")
        page.evaluate('''() => {
            localStorage.setItem('the_eclipse_active_seeker', 'Silvia');
            localStorage.setItem('order_oasis_clepsydra_completed', 'true');
            localStorage.setItem('order_desert_lexicon_completed', 'true');
            localStorage.setItem('order_whispering_chasm_completed', 'true');
            localStorage.setItem('order_salt_playa_completed', 'true');
            localStorage.setItem('order_cairn1_completed', 'true');
            localStorage.setItem('order_lamp_oil_found', 'true');
            localStorage.setItem('order_field_wire_step', '8');
            localStorage.setItem('order_gates_path', 'humble');
            localStorage.setItem('order_gates_flags', JSON.stringify({}));
            if (window.addRelicToInventory) window.addRelicToInventory('lamp_oil');
            if (window.syncLampOil) window.syncLampOil();
            if (window.openNightErgModal) window.openNightErgModal();
            if (window.__nightErg && window.__nightErg.fast) window.__nightErg.fast();
        }''')

        page.wait_for_selector('#night-choice-all', state='visible', timeout=15000)
        page.evaluate('() => { if (window.__nightErg && window.__nightErg.fast) window.__nightErg.fast(); }')
        page.click('#night-choice-all')
        
        # In 'all', modal should appear when Hermes empties the flask
        page.wait_for_selector('#modal-item-relinquished', state='visible', timeout=15000)
        modal_visible = page.is_visible('#modal-item-relinquished')
        assert modal_visible, "Expected #modal-item-relinquished to be visible"
        
        ir_title = page.text_content('#ir-title')
        assert 'The Lamp Oil' in ir_title, f"Expected 'The Lamp Oil' in title, got {ir_title}"

        # Capture screenshot of the relinquished modal
        screenshot_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../verifications/item_relinquished_modal.png'))
        page.screenshot(path=screenshot_path)
        print("📸 Captured relinquished modal screenshot to:", screenshot_path)

        # Click continue button on the modal
        page.click('#ir-btn-continue')
        page.wait_for_function("() => window.GatesRoad && window.GatesRoad.flags().nightOil === 'all'", timeout=15000)
        page.wait_for_timeout(1000)

        t3_flags = page.evaluate('() => window.GatesRoad.flags()')
        t3_relics = page.evaluate('() => window.getOwnedRelicIds()')

        assert t3_flags.get('nightOil') == 'all', f"Expected nightOil 'all', got {t3_flags.get('nightOil')}"
        assert 'lamp_oil' not in t3_relics, f"Expected lamp_oil to be REMOVED from relics, got {t3_relics}"
        print("✅ TEST 3 PASSED: 'all' triggered cinematic modal and completely purged lamp_oil from inventory.")

        browser.close()

    print("\n🎉 ALL 3 LAMP OIL SCENARIOS VERIFIED SUCCESSFULLY!")

if __name__ == '__main__':
    main()
