import os
from playwright.sync_api import sync_playwright

def test_pure_reading():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        context = browser.new_context(viewport={'width': 1280, 'height': 850})
        page = context.new_page()

        page.on("dialog", lambda d: d.accept())

        # Set user to Carles
        page.goto("http://localhost:8080/index.html")
        page.evaluate("""() => {
            localStorage.setItem('the_eclipse_active_seeker', 'Carles');
            localStorage.setItem('seeker_carles_midnight_completed', 'true');
            localStorage.setItem('order_midnight_completed', 'true');
        }""")
        page.wait_for_timeout(300)

        page.goto("http://localhost:8080/constellation/celestial-cipher/index.html")
        page.wait_for_timeout(1000)

        # 1. VERIFY AUDIO AND DIAL ARE COMPLETELY GONE
        assert page.locator("#btn-toggle-soundscape").count() == 0, "Audio button should be completely removed!"
        assert page.locator("#dial-rotatable-layer").count() == 0, "Coordinate dial should be completely removed!"
        assert page.locator(".sidebar-relic-card").count() == 0, "Sidebar relic cards should be completely removed!"
        print("PASS: Audio toggle and Coordinate dial are 100% removed!")

        # 2. VERIFY 4 ILLUMINATED PLATES EXIST
        plates = page.locator(".illuminated-plate-figure")
        assert plates.count() == 4, f"Expected 4 plates, found {plates.count()}"
        print("PASS: All 4 illuminated plates are present!")

        # 3. VERIFY SCROLLYTELLING ATMOSPHERE
        # Top: Chapter 1 (Alpine)
        page.locator("#chapter-1").scroll_into_view_if_needed()
        page.wait_for_timeout(400)
        body_class = page.evaluate("() => document.body.className")
        print(f"Chapter 1 Body class: '{body_class}'")
        assert "theme-alpine" in body_class

        page.screenshot(path="scratch/reading_ch1_alpine.png")

        # Chapter 2 (Cataclysm)
        page.locator("#chapter-2").scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        body_class = page.evaluate("() => document.body.className")
        print(f"Chapter 2 Body class: '{body_class}'")
        assert "theme-cataclysm" in body_class

        page.screenshot(path="scratch/reading_ch2_cataclysm.png")

        # Chapter 3 (Ashen Waste)
        page.locator("#chapter-3").scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        body_class = page.evaluate("() => document.body.className")
        print(f"Chapter 3 Body class: '{body_class}'")
        assert "theme-ashen" in body_class

        page.screenshot(path="scratch/reading_ch3_ashen.png")

        # Chapter 4 (Beacon)
        page.locator("#chapter-4").scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        body_class = page.evaluate("() => document.body.className")
        print(f"Chapter 4 Body class: '{body_class}'")
        assert "theme-beacon" in body_class

        page.screenshot(path="scratch/reading_ch4_beacon.png")

        # 4. TEST TRANSMIT BUTTON
        btn = page.locator("#btn-transmit-story")
        btn.scroll_into_view_if_needed()
        btn.click()
        page.wait_for_timeout(800)
        assert page.locator("#climax-modal").is_visible()
        print("PASS: Climax modal opened smoothly!")

        browser.close()
        print("\nALL PURE READING EXPERIENCE TESTS PASSED 100%!")

if __name__ == "__main__":
    test_pure_reading()
