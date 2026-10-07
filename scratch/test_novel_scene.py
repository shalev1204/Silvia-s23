import os
import sys
from playwright.sync_api import sync_playwright

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        context = browser.new_context(viewport={'width': 1400, 'height': 900})
        page = context.new_page()

        print("--- TEST: THE MAN BEHIND THE MAPS (GAME 9 NOVEL SCENE & CLIMAX) ---")
        page.goto("http://localhost:8080/index.html")

        # Set user to Carles for test access
        page.evaluate("""() => {
            localStorage.setItem('the_eclipse_active_seeker', 'Carles');
            localStorage.setItem('seeker_carles_midnight_completed', 'true');
            localStorage.setItem('order_midnight_completed', 'true');
        }""")
        page.reload()
        page.wait_for_timeout(300)

        # Navigate to Game 9
        page.goto("http://localhost:8080/constellation/celestial-cipher/index.html")
        page.wait_for_timeout(500)

        # 1. Verify Top Banner
        title = page.text_content(".cipher-main-title")
        subtitle = page.text_content(".cipher-sub-title")
        print(f"Game 9 Title: '{title}', Subtitle: '{subtitle}'")
        assert "The Celestial Cipher" in title
        assert "THE MAN BEHIND THE MAPS" in subtitle

        # 2. Click Verify Journal Words (Auto-Attune)
        btn_verify = page.locator("#btn-quick-solve")
        btn_verify.click()
        page.wait_for_timeout(400)

        # 3. Verify Story Reader Modal Opened
        story_modal_open = page.evaluate("() => document.getElementById('story-reader-modal').classList.contains('modal-open')")
        print(f"Story Reader Modal Open: {story_modal_open}")
        assert story_modal_open, "Story reader modal should be open"

        story_title = page.text_content(".story-main-title")
        story_content = page.text_content(".story-reader-body")
        print(f"Story Title: '{story_title}'")
        assert "The Man Behind the Maps" in story_title
        assert "Icarus" in story_content, "Expected Icarus in story"
        assert "Aurelia" in story_content, "Expected Aurelia in story"
        assert "CARTOGRAPHER OF DISTANT LIGHT" in story_content.upper(), "Expected signature evolution"
        assert "you were always the treasure" in story_content.lower()

        page.screenshot(path="scratch/story_reader_modal_verified.png")
        print("Captured scratch/story_reader_modal_verified.png")

        # 4. Click 'Transmit Aurelia's Words to Icarus'
        btn_transmit = page.locator("#btn-transmit-story")
        btn_transmit.click()
        page.wait_for_timeout(1500)

        # 5. Verify Climax Modal & Red Sandstorm
        is_storm_active = page.evaluate("() => document.body.classList.contains('sandstorm-active')")
        climax_modal_open = page.evaluate("() => document.getElementById('climax-modal').classList.contains('modal-open')")
        sender_name = page.text_content(".sender-name")
        dispatch_text = page.text_content("#dispatch-clean-text")
        print(f"Storm Active: {is_storm_active}, Climax Modal Open: {climax_modal_open}")
        print(f"Sender: '{sender_name}'")
        assert is_storm_active, "Body should have sandstorm-active class"
        assert climax_modal_open, "Climax modal should be open"
        assert "Icarus" in sender_name
        assert "Desert Oracle" in dispatch_text
        assert "follow the distant light" in dispatch_text

        page.screenshot(path="scratch/climax_modal_verified.png")
        print("Captured scratch/climax_modal_verified.png")

        # 6. Test 'Re-read Aurelia's Story' button inside climax modal
        btn_reread = page.locator("#btn-open-story-again")
        btn_reread.click()
        page.wait_for_timeout(300)
        reopened_story = page.evaluate("() => document.getElementById('story-reader-modal').classList.contains('modal-open')")
        print(f"Story Modal Re-opened from Climax: {reopened_story}")
        assert reopened_story, "Story modal should reopen"

        # Transmit again to return to climax modal
        btn_transmit.click()
        page.wait_for_timeout(1000)

        # 7. Click 'Enter The Desert Path (Return to Star Map)'
        btn_hub = page.locator(".btn-climax-hub")
        btn_hub.click()
        page.wait_for_timeout(500)
        hub_url = page.url
        print(f"Returned to Hub: {hub_url}")
        assert "index.html#view-trail" in hub_url or "index.html" in hub_url

        # Check that station 9 is marked completed in storage
        order_cipher_done = page.evaluate("() => localStorage.getItem('order_cipher_completed')")
        print(f"Order Cipher Completed in Storage: {order_cipher_done}")
        assert order_cipher_done == "true"

        page.screenshot(path="scratch/hub_post_cipher_verified.png")
        print("Captured scratch/hub_post_cipher_verified.png")

        browser.close()
        print("\nALL NOVEL SCENE & CLIMAX TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    run_tests()
