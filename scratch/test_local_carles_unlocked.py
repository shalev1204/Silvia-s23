#!/usr/bin/env python3
"""
Test Local Environment for Carles:
1. When loading on local (localhost or file://), auto-authenticates as Carles.
2. Carles is NOT blocked by the Sandstorm by default.
3. Header displays "Carles (Test Sandbox)" and "🌪️ Toggle Storm".
4. Carles can enter and exit the storm at will using the toggle and bypass buttons.
5. All Hub features remain fully accessible.
"""
import sys
from playwright.sync_api import sync_playwright

def test_local_carles():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel='chrome')
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("\n--- TEST 1: Load Hub via file:// URL (Local Environment) ---")
        # Load local file path directly
        file_url = "file:///path/to/Silvia's23/web/index.html"
        page.goto(file_url)
        page.wait_for_timeout(800)

        # 1. Gate must be hidden
        gate = page.locator("#sanctuary-gate-overlay")
        assert not gate.is_visible() or "gate-hidden" in gate.get_attribute("class"), "Sanctuary gate must be hidden in local!"
        print("✓ Sanctuary gate is bypassed automatically.")

        # 2. Seeker must be Carles
        seeker_text = page.locator("#seeker-name-display").inner_text()
        print("Active Seeker:", seeker_text)
        assert "Carles" in seeker_text, f"Seeker should be Carles in local, got {seeker_text}!"
        print("✓ Active seeker defaulted to Carles in local.")

        # 3. Storm overlay must NOT be visible
        overlay = page.locator("#sandstorm-lockout-overlay")
        assert not overlay.is_visible(), "Carles must NOT be storm-locked by default!"
        print("✓ Carles is NOT locked out by the storm. Hub is fully accessible!")

        # 4. Header must have Toggle Storm button
        btn_header_toggle = page.locator("#btn-dev-storm-toggle-header")
        assert btn_header_toggle.is_visible(), "Header 'Toggle Storm' button must be visible for Carles!"
        print("✓ Header 'Toggle Storm' button is present.")

        # 5. Verify Hub features work (e.g. click tabs or inspect view-trail)
        trail_view = page.locator("#view-trail")
        assert trail_view.is_visible(), "The Constellation Trail must be visible and interactive!"
        print("✓ The Constellation Trail is active and interactive.")

        page.screenshot(path="scratch/carles_local_unlocked_hub.png")
        print("Saved scratch/carles_local_unlocked_hub.png")

        print("\n--- TEST 2: Toggle Storm ON at will ---")
        btn_header_toggle.click()
        page.wait_for_timeout(600)

        assert overlay.is_visible(), "Storm overlay should now be visible after toggling ON!"
        print("✓ Storm overlay activated on demand!")

        title = page.locator(".storm-alert-title").inner_text()
        print("Storm Alert Title:", title)
        assert "CONNECTION FAILURE" in title

        hours = page.locator("#storm-cd-hours").inner_text()
        print(f"Countdown Hours: {hours}h")

        page.screenshot(path="scratch/carles_storm_toggled_on.png")
        print("Saved scratch/carles_storm_toggled_on.png")

        print("\n--- TEST 3: Toggle Storm OFF (Bypass Storm) ---")
        btn_dev_toggle = page.locator("#btn-dev-toggle-storm")
        assert btn_dev_toggle.is_visible(), "Bypass Storm button must be visible for Carles!"
        btn_dev_toggle.click()
        page.wait_for_timeout(600)

        assert not overlay.is_visible(), "Storm overlay must be dismissed after clicking Bypass Storm!"
        print("✓ Storm overlay successfully dismissed! Carles is back in the Hub.")

        page.screenshot(path="scratch/carles_returned_to_hub.png")
        print("Saved scratch/carles_returned_to_hub.png")

        browser.close()
        print("\nALL LOCAL CARLES UNLOCKED TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_local_carles()
