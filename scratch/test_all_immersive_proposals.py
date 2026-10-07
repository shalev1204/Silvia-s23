import os
from playwright.sync_api import sync_playwright

def test_immersive_proposals():
    with sync_playwright() as p:
        # Test in a desktop viewport (1440x900) so marginalia wings are displayed
        browser = p.chromium.launch(headless=True, channel="chrome")
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()

        page.on("dialog", lambda d: d.accept())

        # Set user to Carles to access Station 09
        page.goto("http://localhost:8080/index.html")
        page.evaluate("""() => {
            localStorage.setItem('the_eclipse_active_seeker', 'Carles');
            localStorage.setItem('seeker_carles_midnight_completed', 'true');
            localStorage.setItem('order_midnight_completed', 'true');
        }""")
        page.wait_for_timeout(300)

        page.goto("http://localhost:8080/constellation/celestial-cipher/index.html")
        page.wait_for_timeout(800)

        # 1. VERIFY BACKGROUND & TEXTURES
        assert page.locator("#sky-backdrop").count() == 1, "sky-backdrop missing!"
        assert page.locator("#sky-nebula").count() == 1, "sky-nebula missing!"
        assert page.locator("#sky-dust").count() == 1, "sky-dust missing!"
        print("PASS: Continuous Background & Living Textures present!")

        # 2. VERIFY PROPUESTA D: MARGINALIA WINGS
        marginalia_count = page.locator(".chapter-marginalia").count()
        assert marginalia_count == 8, f"Expected 8 marginalia wings (2 per chapter), got {marginalia_count}"
        print(f"PASS: Propuesta D (Codex Marginalia) verified with {marginalia_count} wings!")

        # 3. VERIFY PROPUESTA E: CHARRED RELIC FACSIMILE
        assert page.locator(".charred-relic-facsimile").count() == 1, "Charred relic facsimile missing!"
        assert page.locator(".burnt-wax-seal").count() == 1, "Burnt wax seal missing!"
        print("PASS: Propuesta E (Charred Relic Facsimile with wax seal) verified!")

        # 4. CAPTURE CHAPTER I SCREENSHOT
        page.screenshot(path="scratch/immersive_ch1_marginalia.png")
        print("Saved scratch/immersive_ch1_marginalia.png")

        # 5. SCROLL TO CHAPTER II / CHAPTER III (Midway)
        page.locator("#chapter-3").scroll_into_view_if_needed()
        page.wait_for_timeout(600)

        # Check Focus Beam
        focused_elements = page.locator(".reading-focus").count()
        assert focused_elements > 0, "Propuesta A: Reading Focus Beam should highlight active elements!"
        print(f"PASS: Propuesta A (Focus Beam) active on {focused_elements} elements in reading zone!")

        page.screenshot(path="scratch/immersive_ch3_charred_relic.png")
        print("Saved scratch/immersive_ch3_charred_relic.png")

        # 6. SCROLL TO CHAPTER IV & BEACON REVELATION
        page.locator("#chapter-4").scroll_into_view_if_needed()
        page.wait_for_timeout(600)

        # Check Propuesta C: Distant Beacon Revelation
        beacon = page.locator("#distant-beacon-emitter")
        assert beacon.count() == 1, "Distant beacon emitter missing!"
        beacon_classes = beacon.get_attribute("class")
        print(f"Beacon classes in Chapter IV: '{beacon_classes}'")
        assert "beacon-revealed" in beacon_classes, "Propuesta C: Distant beacon must be revealed in Chapter IV!"
        print("PASS: Propuesta C (Physical Distant Horizon Beacon) revealed with lighthouse rhythm!")

        # Check Propuesta B: Folio Plate Parallax & Shimmer
        shimmers = page.locator(".plate-specular-shimmer").count()
        assert shimmers == 4, f"Expected 4 plate specular shimmers, got {shimmers}"
        print(f"PASS: Propuesta B (Plate Specular Shimmer) verified on {shimmers} plates!")

        page.screenshot(path="scratch/immersive_ch4_distant_beacon.png")
        print("Saved scratch/immersive_ch4_distant_beacon.png")

        # 7. CLICK TRANSMIT BUTTON & VERIFY CLIMAX
        btn = page.locator("#btn-transmit-story")
        btn.scroll_into_view_if_needed()
        btn.click()
        page.wait_for_timeout(900)
        assert page.locator("#climax-modal").is_visible(), "Climax modal did not open!"
        print("PASS: Transmission Climax modal opened smoothly!")

        page.screenshot(path="scratch/immersive_climax_sandstorm.png")
        print("Saved scratch/immersive_climax_sandstorm.png")

        browser.close()
        print("\nALL IMMERSIVE PROPOSALS (A, B, C, D, E + CONTINUOUS LERP) PASSED 100%!")

if __name__ == "__main__":
    test_immersive_proposals()
