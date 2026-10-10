import os
import time
from playwright.sync_api import sync_playwright

def run_verification():
    html_path = os.path.abspath('web/index.html')
    file_url = f'file://{html_path}?bypass=1'

    print(f"Loading {file_url}...")

    with sync_playwright() as p:
        chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        browser = p.chromium.launch(executable_path=chrome_path, headless=True)
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()

        console_errors = []
        page.on('console', lambda msg: console_errors.append(msg.text) if msg.type == 'error' else None)
        page.on('pageerror', lambda exc: console_errors.append(str(exc)))

        page.goto(file_url, wait_until='networkidle')
        time.sleep(1)

        print("1. Checking page load & console errors...")
        if console_errors:
            print(f"⚠️ Console errors detected: {console_errors}")
        else:
            print("✅ Zero console errors on boot!")

        # Switch to Trail View if not already
        print("2. Navigating to view-trail...")
        page.evaluate("window.activateHubView && window.activateHubView('view-trail')")
        time.sleep(0.5)

        # Switch to Grand Desert Map
        print("3. Switching to Grand Desert Map tab...")
        page.click('#btn-tab-path-desert')
        time.sleep(0.5)

        desert_wrap_display = page.evaluate("document.getElementById('desert-map-canvas-wrap').style.display")
        constellation_wrap_display = page.evaluate("document.querySelector('.constellation-map-frame .map-canvas-wrap').style.display")
        print(f"   Desert map display: {desert_wrap_display}, Constellation display: {constellation_wrap_display}")
        assert desert_wrap_display == 'block', "Desert map wrap should be display: block"
        assert constellation_wrap_display == 'none', "Constellation map wrap should be display: none"
        print("✅ Grand Desert Map tab switched successfully!")

        page.screenshot(path='/path/to/Silvia\'s23/scratch/screenshot_desert_map.png')

        # Check Hermes marker at Watchtower VI
        hermes_transform = page.evaluate("document.getElementById('hermes-map-token').getAttribute('transform')")
        print(f"   Hermes initial position: {hermes_transform}")
        assert '241, 752' in hermes_transform, "Hermes should start at Watchtower VI (241, 752)"

        # Check Station 10 Node in inspector
        page.evaluate("window.selectMapNode(10, false)")
        time.sleep(0.3)
        insp_title = page.evaluate("document.getElementById('insp-title').innerText")
        print(f"   Inspector title for Station 10: {insp_title}")
        assert "The Whispering Chasm" in insp_title

        # Open Tactical Expedition Modal (Clicking canyon node or trigger)
        print("4. Opening Tactical Expedition Modal for Station 10...")
        page.click('#node-chasm-trigger')
        time.sleep(0.5)

        modal_display = page.evaluate("document.getElementById('modal-whispering-chasm').style.display")
        assert modal_display == 'flex', "Whispering Chasm modal should be display: flex"
        print("✅ Whispering Chasm modal opened!")

        page.screenshot(path='/path/to/Silvia\'s23/scratch/screenshot_chasm_modal_initial.png')

        # Test Decoy Cairn 'T' (Blind Chasm)
        print("5. Testing decoy cairn 'T'...")
        page.evaluate("window.handleChasmCairnClick('T')")
        time.sleep(0.4)
        dispatch_text = page.evaluate("document.getElementById('chasm-dispatch-text').innerText")
        print(f"   Dispatch after decoy T: {dispatch_text}")
        assert "Blind Chasm" in dispatch_text
        print("✅ Decoy cairn correctly handled with atmospheric warning!")

        # Test Out-of-order Cairn 'R'
        print("6. Testing out-of-order cairn 'R'...")
        page.evaluate("window.handleChasmCairnClick('R')")
        time.sleep(0.4)
        dispatch_text_ooo = page.evaluate("document.getElementById('chasm-dispatch-text').innerText")
        print(f"   Dispatch after out-of-order R: {dispatch_text_ooo}")
        assert "Law of the Canyon Walkers" in dispatch_text_ooo
        print("✅ Out-of-order cairn rejected with guidance!")

        # Step through MIRAGE sequence: M, I, R, A, G, E
        print("7. Stepping through MIRAGE sequence...")
        for letter in ['M', 'I', 'R', 'A', 'G', 'E']:
            print(f"   Clicking cairn '{letter}'...")
            page.evaluate(f"window.handleChasmCairnClick('{letter}')")
            # Wait for walking animation to complete (approx 35ms * segment length + buffer)
            time.sleep(2.0)
            cur_slots = page.evaluate("""
                Array.from(document.querySelectorAll('.chasm-slot-box .slot-letter')).map(el => el.innerText).join('')
            """)
            print(f"   Slots after '{letter}': [{cur_slots}]")
            assert letter in cur_slots, f"Slot should include letter {letter}"

        # Wait for E_exit walk to finish and victory card
        print("8. Waiting for exit walk to Sunken Oasis and victory sequence...")
        time.sleep(3.0)

        victory_display = page.evaluate("document.getElementById('chasm-victory-card').style.display")
        print(f"   Victory card display: {victory_display}")
        assert victory_display == 'block', "Victory card should be display: block"

        is_completed = page.evaluate("localStorage.getItem('order_whispering_chasm_completed')")
        print(f"   order_whispering_chasm_completed in localStorage: {is_completed}")
        assert is_completed == 'true', "localStorage order_whispering_chasm_completed should be true"

        page.screenshot(path='/path/to/Silvia\'s23/scratch/screenshot_chasm_modal_victory.png')
        print("✅ Victory card displayed and progress saved to localStorage!")

        # Click return to Grand Desert Map
        print("9. Returning to Grand Desert Map...")
        page.click('#btn-chasm-finish')
        time.sleep(0.5)

        modal_after = page.evaluate("document.getElementById('modal-whispering-chasm').style.display")
        assert modal_after == 'none', "Modal should be closed"

        # Verify Hermes moved to Camp VII beside Sunken Oasis on map
        hermes_new_transform = page.evaluate("document.getElementById('hermes-map-token').getAttribute('transform')")
        print(f"   Hermes final position on map: {hermes_new_transform}")
        assert '1330, 1140' in hermes_new_transform, "Hermes should be at Camp VII (1330, 1140)"

        trail_oasis_display = page.evaluate("document.getElementById('desert-trail-to-oasis').style.display")
        print(f"   Trail to oasis display: {trail_oasis_display}")
        assert trail_oasis_display == 'block', "Trail to oasis should be visible"

        page.screenshot(path='/path/to/Silvia\'s23/scratch/screenshot_desert_map_completed.png')
        print("✅ Grand Desert Map updated with Hermes at Sunken Oasis Camp VII!")

        # 10. Test Inspect Canyon Route from Station 10 inspector
        print("10. Testing Inspect Canyon Route from inspector...")
        page.evaluate("window.selectMapNode(10, false)")
        time.sleep(0.3)
        insp_btn_text = page.evaluate("document.getElementById('insp-btn-primary').innerText")
        print(f"   Inspector button text after completion: {insp_btn_text}")
        assert "inspect canyon route" in insp_btn_text.lower()

        page.click('#insp-btn-primary')
        time.sleep(0.5)
        modal_reopened = page.evaluate("document.getElementById('modal-whispering-chasm').style.display")
        assert modal_reopened == 'flex', "Modal should reopen in inspection mode"
        print("✅ Modal successfully re-opened via inspector primary action button!")

        print("\n🎉 ALL TESTS PASSED WITH 100% SUCCESS!")
        browser.close()

if __name__ == '__main__':
    run_verification()
