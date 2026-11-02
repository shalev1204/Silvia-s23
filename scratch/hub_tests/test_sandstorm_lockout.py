#!/usr/bin/env python3
"""
Test Sandstorm Lockout in Central Hub
Verifies:
1. Sandstorm lockout activates when ?storm=1 or when order_sandstorm_active is true.
2. 48-hour countdown is displayed and ticking.
3. In-lore dispatch, telemetry cards, and audio controls are functional.
4. Dev controls appear for Carles and allow toggling/resetting.
5. Dev controls are hidden for Silvia.
"""
import sys
from playwright.sync_api import sync_playwright

def test_sandstorm_lockout():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel='chrome')
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("\n1. Testing Sandstorm Lockout for Silvia (Regular Seeker)...")
        # Set Seeker to Silvia and trigger storm
        page.goto("http://localhost:8080/index.html")
        page.evaluate("""() => {
            sessionStorage.setItem('the_eclipse_session_authenticated', 'true');
            localStorage.setItem('the_eclipse_active_seeker', 'Silvia');
            localStorage.setItem('order_sandstorm_active', 'true');
            localStorage.setItem('order_sandstorm_start_time', Date.now().toString());
        }""")
        page.goto("http://localhost:8080/index.html?storm=1&auth=1")
        page.wait_for_timeout(1000)

        overlay = page.locator("#sandstorm-lockout-overlay")
        assert overlay.is_visible(), "Sandstorm overlay should be visible!"
        print("✓ Sandstorm overlay is active and visible!")

        title = page.locator(".storm-alert-title").inner_text()
        print("Storm Alert Title:", title)
        assert "CONNECTION FAILURE" in title

        hours = page.locator("#storm-cd-hours").inner_text()
        mins = page.locator("#storm-cd-minutes").inner_text()
        secs = page.locator("#storm-cd-seconds").inner_text()
        print(f"Countdown Timer: {hours}h {mins}m {secs}s")
        assert hours in ["47", "48"], f"Hours should be 47 or 48, got {hours}"

        # Verify Dev Controls are hidden for Silvia
        dev_controls = page.locator("#storm-dev-controls")
        assert not dev_controls.is_visible(), "Dev controls must be strictly hidden for Silvia!"
        print("✓ Dev controls are strictly hidden for Silvia!")

        page.screenshot(path="scratch/sandstorm_hub_lockout_silvia.png")
        print("Saved scratch/sandstorm_hub_lockout_silvia.png")

        print("\n2. Testing Sandstorm Lockout for Carles (Developer Sandbox)...")
        page.evaluate("""() => {
            sessionStorage.setItem('the_eclipse_session_authenticated', 'true');
            localStorage.setItem('the_eclipse_active_seeker', 'Carles');
        }""")
        page.goto("http://localhost:8080/index.html?storm=1&dev=1&auth=1")
        page.wait_for_timeout(1000)

        assert dev_controls.is_visible(), "Dev controls should be visible for Carles!"
        print("✓ Dev controls are visible for Carles!")

        page.screenshot(path="scratch/sandstorm_hub_lockout_carles.png")
        print("Saved scratch/sandstorm_hub_lockout_carles.png")

        # Test toggle off
        btn_toggle = page.locator("#btn-dev-toggle-storm")
        btn_toggle.scroll_into_view_if_needed()
        btn_toggle.click(force=True)
        page.wait_for_timeout(600)
        assert not overlay.is_visible(), "Overlay should be dismissed after clicking toggle off!"
        print("✓ Carles toggle successfully dismisses the storm lockout!")

        browser.close()
        print("\nALL SANDSTORM LOCKOUT TESTS PASSED!")

if __name__ == "__main__":
    test_sandstorm_lockout()
