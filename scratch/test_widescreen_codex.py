import os
from playwright.sync_api import sync_playwright

def test_widescreen_codex():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        # Test on widescreen desktop (1440x900)
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()

        page.on("dialog", lambda d: d.accept())

        # Visit main index first to set seeker Carles
        page.goto("http://localhost:8080/index.html")
        page.evaluate("""() => {
            localStorage.setItem('the_eclipse_active_seeker', 'Carles');
            localStorage.setItem('seeker_carles_midnight_completed', 'true');
            localStorage.setItem('order_midnight_completed', 'true');
        }""")
        page.wait_for_timeout(300)

        page.goto("http://localhost:8080/constellation/celestial-cipher/index.html")
        page.wait_for_timeout(1000)

        # 1. Verify Widescreen Grid
        grid = page.locator(".codex-widescreen-grid")
        assert grid.is_visible(), "Codex widescreen grid should be visible!"
        grid_box = grid.bounding_box()
        print(f"Codex Grid width: {grid_box['width']}px (Widescreen check passed: > 1000px)")
        assert grid_box['width'] > 1000

        # 2. Verify 4 Plates (Aurelia, Bridge, Young Cartographer, Distant Light)
        plates = page.locator(".illuminated-plate-figure")
        plate_count = plates.count()
        print(f"Illuminated Plates Count: {plate_count}")
        assert plate_count == 4, f"Expected 4 illuminated plates, got {plate_count}"

        # 3. Test Interactive Dial Word Chips
        chip_treasure = page.locator(".dial-word-chip[data-word='TREASURE']")
        chip_treasure.click()
        page.wait_for_timeout(300)
        coords_text = page.locator("#coords-val").inner_text()
        print(f"Active Coords for TREASURE: '{coords_text}'")
        assert "T · R · E · A · S · U · R · E" in coords_text

        # 4. Test Soundscape Toggle
        btn_sound = page.locator("#btn-toggle-soundscape")
        btn_sound.click()
        page.wait_for_timeout(300)
        assert "active" in btn_sound.get_attribute("class")
        print("Soundscape toggle activated successfully!")

        # 5. Capture Chapter III with the Young Cartographer
        page.locator(".optical-archive-figure").scroll_into_view_if_needed()
        page.wait_for_timeout(400)
        page.screenshot(path="scratch/young_cartographer_chapter.png")
        print("Captured scratch/young_cartographer_chapter.png")

        # 6. Click 'Transmit the Vow of Icarus' and verify the modal with Cartographer Avatar
        btn_transmit = page.locator("#btn-transmit-story")
        btn_transmit.scroll_into_view_if_needed()
        btn_transmit.click()
        page.wait_for_timeout(1000)

        sender_avatar = page.locator(".sender-avatar-portrait")
        assert sender_avatar.is_visible(), "Sender portrait avatar should be visible in modal!"
        page.screenshot(path="scratch/young_cartographer_modal.png")
        print("Captured scratch/young_cartographer_modal.png")

        browser.close()
        print("\nALL WIDESCREEN & YOUNG CARTOGRAPHER TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_widescreen_codex()
