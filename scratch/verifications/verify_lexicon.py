import os
import time
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def run_test():
    url = "file://" + os.path.join(ROOT, "web/index.html") + "?bypass=1"
    os.makedirs(os.path.join(ROOT, "scratch/screenshots"), exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("1. Loading page with bypass...")
        page.goto(url)
        page.wait_for_timeout(1000)

        # Pre-seed state: Station 10 (Whispering Chasm) completed
        print("2. Setting Chasm completed in localStorage and reloading...")
        page.evaluate("""() => {
            localStorage.setItem('order_whispering_chasm_completed', 'true');
            localStorage.setItem('order_desert_station_active', '11');
            localStorage.setItem('the_eclipse_active_seeker', 'Silvia');
        }""")
        page.reload()
        page.wait_for_timeout(1500)

        # Switch to view-trail and desert map
        print("3. Switching to Desert Map...")
        page.evaluate("""() => {
            if (typeof activateHubView === 'function') activateHubView('view-trail');
            if (typeof switchMapPath === 'function') switchMapPath('desert', true);
        }""")
        page.wait_for_timeout(1000)

        page.screenshot(path=os.path.join(ROOT, "scratch/screenshots/01_desert_map_with_station11.png"))
        print("Saved screenshot 01")

        # Verify Station 11 exists on map
        station11_node = page.locator("#node-lexicon-trigger")
        assert station11_node.is_visible(), "Station 11 node should be visible on desert map"
        print("Station 11 node verified on map!")

        # Click Station 11 node to open modal
        print("4. Clicking Station 11 node...")
        station11_node.click(force=True)
        page.wait_for_timeout(1000)

        lexicon_modal = page.locator("#modal-desert-lexicon")
        assert lexicon_modal.is_visible(), "Desert Lexicon modal should be visible"
        print("Desert Lexicon modal opened successfully!")

        page.screenshot(path=os.path.join(ROOT, "scratch/screenshots/02_desert_lexicon_modal_opened.png"))
        print("Saved screenshot 02")

        # Select clue ac-2
        print("5. Selecting clue 2 Across (SIROCCO)...")
        page.locator('.lexicon-clue-item[data-word-id="ac-2"]').click()
        page.wait_for_timeout(300)

        # Enter SIROCCO into input
        print("6. Entering SIROCCO and carving...")
        page.fill("#lexicon-word-input", "SIROCCO")
        page.click("#btn-carve-word")
        page.wait_for_timeout(500)

        words_count = page.locator("#lexicon-words-count").text_content()
        print(f"Words count after SIROCCO: {words_count}")
        assert "1 / 10 WORDS SOLVED" in words_count, f"Expected 1 / 10 words solved, got: {words_count}"

        # Verify letter 'O' in slot 3 of sigil rack (Circle 3 is at SIROCCO r2, c4)
        slot3_letter = page.locator("#lex-sigil-2 .slot-letter").text_content()
        print(f"Slot 3 (index 2) letter in Desert Sigil rack: {slot3_letter}")
        assert slot3_letter == "O", f"Expected 'O' in slot 3, got: {slot3_letter}"

        page.screenshot(path=os.path.join(ROOT, "scratch/screenshots/03_sirocco_carved.png"))
        print("Saved screenshot 03")

        # Solve all words via Transcribe Complete Journal Notes button
        print("7. Clicking 'Transcribe Complete Journal Notes'...")
        page.click("#btn-lexicon-solve-all")
        page.wait_for_timeout(1500)

        words_count_all = page.locator("#lexicon-words-count").text_content()
        print(f"Words count after solve all: {words_count_all}")
        assert "10 / 10 WORDS SOLVED" in words_count_all, f"Expected 10 / 10 words solved, got: {words_count_all}"

        # Verify all 7 letters in sigil rack
        expected_sigil = ["P", "H", "O", "E", "N", "I", "X"]
        actual_sigil = []
        for i in range(7):
            ltr = page.locator(f"#lex-sigil-{i} .slot-letter").text_content()
            actual_sigil.append(ltr)
        print(f"Assembled Desert Sigil rack: {''.join(actual_sigil)}")
        assert actual_sigil == expected_sigil, f"Expected PHOENIX, got: {''.join(actual_sigil)}"

        # Verify victory card is visible
        victory_card = page.locator("#lexicon-victory-card")
        assert victory_card.is_visible(), "Victory card should be visible"
        print("Victory card is visible!")

        # Verify telemetry azimuth and compass label
        azimuth_text = page.locator("#lexicon-telem-azimuth").text_content()
        print(f"Telemetry azimuth: {azimuth_text}")
        assert "194° SSW" in azimuth_text, "Azimuth should be 194° SSW"

        page.screenshot(path=os.path.join(ROOT, "scratch/screenshots/04_lexicon_victory_state.png"))
        print("Saved screenshot 04")

        # Click return to map button
        print("8. Returning to Grand Desert Map...")
        page.click("#btn-lexicon-finish")
        page.wait_for_timeout(1000)

        # Check trail to Clepsydra and Clepsydra destination node
        trail_clepsydra = page.locator("#desert-trail-to-clepsydra")
        assert trail_clepsydra.is_visible(), "Trail to Clepsydra should be visible"

        clepsydra_node = page.locator("#node-clepsydra-trigger")
        assert clepsydra_node.is_visible(), "Clepsydra destination node should be visible"
        clepsydra_text = page.locator("#clepsydra-node-banner-text").text_content()
        assert "THE OASIS CLEPSYDRA" in clepsydra_text, "Clepsydra title should be revealed"
        print(f"Trail to Clepsydra and Station 12 node are visible on map: {clepsydra_text}")

        page.screenshot(path=os.path.join(ROOT, "scratch/screenshots/05_desert_map_clepsydra_unlocked.png"))
        print("Saved screenshot 05")

        # Now test Cliffside Workshop (view-field-wire)
        print("9. Navigating to Cliffside Workshop (view-field-wire)...")
        page.evaluate("""() => {
            if (typeof activateHubView === 'function') activateHubView('view-field-wire');
        }""")
        page.wait_for_timeout(1500)

        page.screenshot(path=os.path.join(ROOT, "scratch/screenshots/06_field_wire_expedition.png"))
        print("Saved screenshot 06")

        # Test Inquiries tab
        print("10. Testing Inquiries tab...")
        page.locator("#tab-wire-inquiries").click()
        page.wait_for_timeout(500)

        # Filter by desert
        page.locator('.inquiry-filter-pill[data-filter="desert"]').click()
        page.wait_for_timeout(500)

        steles_card = page.locator("#inq-card-inq-oasis-steles")
        assert steles_card.is_visible(), "Oasis steles inquiry card should be visible"

        al_qibla_card = page.locator("#inq-card-inq-al-qibla")
        assert al_qibla_card.is_visible(), "Al-Qibla inquiry card should be visible"

        phoenix_card = page.locator("#inq-card-inq-phoenix-sigil")
        assert phoenix_card.is_visible(), "Phoenix sigil inquiry card should be visible"
        print("All new desert inquiries are visible!")

        # Click Al-Qibla card to ask Hermes
        print("11. Asking Hermes about Al-Qibla heading...")
        al_qibla_card.click()
        page.wait_for_timeout(2000)

        page.screenshot(path=os.path.join(ROOT, "scratch/screenshots/07_field_wire_inquiry_answered.png"))
        print("Saved screenshot 07")

        print("ALL PLAYWRIGHT TESTS PASSED WITH 100% SUCCESS!")
        browser.close()

if __name__ == "__main__":
    run_test()
