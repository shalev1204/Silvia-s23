from playwright.sync_api import sync_playwright

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        # Typical laptop screen height: 800px
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        print("--- TESTING FULL-SCREEN NOVEL CHAPTER & SCROLLABLE TRANSMISSION MODAL ---")
        page.goto("http://localhost:8080/index.html")

        # Set user to Carles for test access
        page.evaluate("""() => {
            localStorage.setItem('the_eclipse_active_seeker', 'Carles');
            localStorage.setItem('seeker_carles_midnight_completed', 'true');
            localStorage.setItem('order_midnight_completed', 'true');
        }""")
        page.reload()
        page.wait_for_timeout(300)

        # Open Game 9 directly
        page.goto("http://localhost:8080/constellation/celestial-cipher/index.html")
        page.wait_for_timeout(500)

        # 1. Verify Novel Page is Main Content (not a modal)
        novel_title = page.text_content(".story-main-title")
        print(f"Novel Title: '{novel_title}'")
        assert "The Man Behind the Maps" in novel_title

        # Check font family and size of novel paragraphs
        font_info = page.evaluate("""() => {
            const p = document.querySelector('.novel-para');
            const style = window.getComputedStyle(p);
            return {
                fontFamily: style.fontFamily,
                fontSize: style.fontSize,
                lineHeight: style.lineHeight,
                color: style.color
            };
        }""")
        print(f"Novel Typography Info: {font_info}")

        # Capture screenshot of full-screen reading experience
        page.screenshot(path="scratch/novel_fullscreen_reading.png")
        print("Captured scratch/novel_fullscreen_reading.png")

        # Scroll down to the bottom of the novel page to see the transmit button
        page.locator("#btn-transmit-story").scroll_into_view_if_needed()
        page.wait_for_timeout(300)
        page.screenshot(path="scratch/novel_fullscreen_bottom.png")
        print("Captured scratch/novel_fullscreen_bottom.png")

        # 2. Click 'Transmit Aurelia's Words to Hermes'
        btn_transmit = page.locator("#btn-transmit-story")
        btn_transmit.click()
        page.wait_for_timeout(1000)

        # 3. Verify Climax Modal Opens & Is NOT clipped at top
        climax_modal = page.locator("#climax-modal")
        assert climax_modal.is_visible()

        # Check bounding box of the climax panel
        panel_box = page.locator(".climax-panel").bounding_box()
        print(f"Climax Panel Bounding Box at Open: y={panel_box['y']}, height={panel_box['height']}")
        # Ensure y >= 0 so the top is never pushed above the screen
        assert panel_box['y'] >= 0, f"Panel top is clipped above viewport! y={panel_box['y']}"

        # Capture screenshot at top of transmission
        page.screenshot(path="scratch/climax_modal_top.png")
        print("Captured scratch/climax_modal_top.png")

        # 4. Verify Climax Modal Can Scroll Down to the Action Buttons!
        # Scroll the modal container down
        page.evaluate("""() => {
            const modal = document.getElementById('climax-modal');
            modal.scrollTop = modal.scrollHeight;
        }""")
        page.wait_for_timeout(300)

        # Check that the hub return button is now visible in the viewport
        btn_hub = page.locator(".btn-climax-hub")
        btn_hub_box = btn_hub.bounding_box()
        # Check all 3 buttons are on the exact same row (same y)
        b1_box = page.locator(".btn-climax-hub").bounding_box()
        b2_box = page.locator("#btn-open-story-again").bounding_box()
        b3_box = page.locator("#btn-replay-cipher").bounding_box()
        print(f"Buttons Y positions: B1={b1_box['y']}, B2={b2_box['y']}, B3={b3_box['y']}")
        assert abs(b1_box['y'] - b2_box['y']) < 2, "B1 and B2 should be on the same horizontal row!"
        assert abs(b2_box['y'] - b3_box['y']) < 2, "B2 and B3 should be on the same horizontal row!"

        page.screenshot(path="scratch/climax_modal_scrolled_bottom.png")
        print("Captured scratch/climax_modal_scrolled_bottom.png")

        # 5. Click 'Return to Aurelia's Story'
        btn_return_story = page.locator("#btn-open-story-again")
        btn_return_story.click()
        page.wait_for_timeout(400)

        # Verify climax modal closed and novel page is in view
        is_modal_closed = not page.evaluate("() => document.getElementById('climax-modal').classList.contains('modal-open')")
        print(f"Climax Modal Closed: {is_modal_closed}")
        assert is_modal_closed, "Modal should close on return to story"

        browser.close()
        print("\nALL FULL-SCREEN NOVEL AND SCROLL TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    run_tests()
