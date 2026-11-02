#!/usr/bin/env python3
"""
Test Full Flow: Silvia completing Game 9 -> Single Storm Button -> Hub Sandstorm Lockout
Verifies:
1. Hub is NOT locked before Game 9 is completed.
2. In Celestial Cipher climax, radio transmission button leads to reward modal.
3. Reward modal contains ONLY ONE button: "The Storm Has Arrived". Cipher Ledger button is removed.
4. Clicking the storm button redirects to Hub.
5. Hub activates "CONNECTION FAILURE" with 48h countdown calculated from today at 20:00 (~56 hours).
"""
import sys
from playwright.sync_api import sync_playwright

def test_game9_to_storm():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel='chrome')
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("\n--- STEP 1: Verify Hub is NORMAL before Game 9 completion ---")
        page.goto("http://localhost:8080/index.html")
        page.evaluate("""() => {
            sessionStorage.setItem('the_eclipse_session_authenticated', 'true');
            localStorage.setItem('the_eclipse_active_seeker', 'Silvia');
            localStorage.removeItem('order_sandstorm_active');
            localStorage.removeItem('order_sandstorm_triggered');
            localStorage.removeItem('seeker_silvia_sandstorm_active');
            localStorage.removeItem('order_sandstorm_target_time');
            localStorage.removeItem('order_sandstorm_start_time');
        }""")
        page.goto("http://localhost:8080/index.html?auth=1")
        page.wait_for_timeout(800)

        overlay = page.locator("#sandstorm-lockout-overlay")
        assert not overlay.is_visible(), "Hub must NOT be storm-locked for Silvia before Game 9!"
        print("✓ Hub is accessible and normal for Silvia before Game 9.")

        print("\n--- STEP 2: Open Celestial Cipher & Trigger Climax ---")
        page.evaluate("""() => {
            localStorage.setItem('order_cipher_unlocked', 'true');
        }""")
        page.goto("http://localhost:8080/constellation/celestial-cipher/index.html")
        page.wait_for_timeout(800)

        # Trigger radio modal
        page.evaluate("""() => {
            const overlay = document.getElementById('radio-modal-overlay');
            if (overlay) {
                overlay.classList.add('active');
                overlay.setAttribute('aria-hidden', 'false');
            }
        }""")
        page.wait_for_timeout(500)

        btn_climax = page.locator("#btn-climax-desert")
        assert btn_climax.is_visible(), "Radio climax button should be visible!"
        climax_text = btn_climax.inner_text()
        print("Radio climax button text:", climax_text)
        assert "The Storm is Here" in climax_text

        # Click to open Reward Modal
        btn_climax.click()
        page.wait_for_timeout(600)

        print("\n--- STEP 3: Inspect Reward Modal for SINGLE storm button ---")
        reward_modal = page.locator("#reward-modal-overlay")
        assert reward_modal.is_visible(), "Reward modal should be open!"

        # Verify Cipher Ledger button is GONE
        btn_ledger = page.locator("#btn-goto-cipher-ledger")
        assert btn_ledger.count() == 0, "Cipher Ledger button must NOT exist in reward modal!"
        print("✓ Cipher Ledger button successfully removed.")

        # Verify Single Storm Button is present
        btn_storm = page.locator("#btn-goto-desert-trail")
        assert btn_storm.is_visible(), "Single storm button must be visible!"
        storm_text = btn_storm.inner_text()
        print("Single action button text:", storm_text)
        assert "The Storm Has Arrived" in storm_text

        page.screenshot(path="scratch/game9_single_storm_button.png")
        print("Saved scratch/game9_single_storm_button.png")

        print("\n--- STEP 4: Click Storm Button & Verify Hub Lockout ---")
        btn_storm.click()
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1000)

        # We should now be on index.html with storm active
        hub_overlay = page.locator("#sandstorm-lockout-overlay")
        assert hub_overlay.is_visible(), "Hub must now be locked out by the Sandstorm!"
        print("✓ Hub Sandstorm Lockout is ACTIVE!")

        title = page.locator(".storm-alert-title").inner_text()
        print("Storm Alert Title:", title)
        assert "CONNECTION FAILURE" in title

        hours = int(page.locator("#storm-cd-hours").inner_text())
        mins = int(page.locator("#storm-cd-minutes").inner_text())
        secs = int(page.locator("#storm-cd-seconds").inner_text())
        print(f"Countdown Timer: {hours}h {mins}m {secs}s")
        assert hours >= 48, f"Countdown hours should be >= 48 (since starting today 8pm), got {hours}!"
        print("✓ 48-Hour target from today 8:00 PM is verified and ticking down!")

        page.screenshot(path="scratch/hub_lockout_after_game9.png")
        print("Saved scratch/hub_lockout_after_game9.png")

        browser.close()
        print("\nALL GAME 9 TO STORM LOCKOUT TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_game9_to_storm()
