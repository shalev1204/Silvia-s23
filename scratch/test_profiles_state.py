import os
import sys
from playwright.sync_api import sync_playwright

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        context = browser.new_context(viewport={'width': 1400, 'height': 900})
        page = context.new_page()

        print("--- TEST 1: SILVIA'S PROFILE (GAME 8 COMPLETED, GAME 9 INCÓGNITA) ---")
        page.goto("http://localhost:8080/index.html")

        # Clear any preexisting storage for clean test
        page.evaluate("""() => {
            localStorage.clear();
            sessionStorage.clear();
        }""")
        page.reload()

        # Login as Silvia
        page.fill("#gate-username", "Silvia")
        page.fill("#gate-password", "Silvia")
        page.click("#gate-submit-btn")
        page.wait_for_timeout(500)

        # Verify Header
        seeker_pill = page.text_content("#seeker-name-display")
        print(f"Active Seeker Display: {seeker_pill}")
        assert "Silvia" in seeker_pill, "Expected Silvia active"

        # 1. Verify Route Map Node 8 & 9
        n8_tag = page.text_content("#node-8-tag")
        n8_title = page.text_content("#node-8-title")
        n9_tag = page.text_content("#node-9-tag")
        n9_title = page.text_content("#node-9-title")
        n9_icon = page.text_content("#node-9-icon")
        node9_display = page.evaluate("() => document.getElementById('map-node-9').style.display")
        print(f"Map Node 8: Tag='{n8_tag}', Title='{n8_title}'")
        print(f"Map Node 9: Tag='{n9_tag}', Title='{n9_title}', Icon='{n9_icon}', Display='{node9_display}'")
        assert "SECURED ✓" in n8_tag, "Node 8 should be secured for Silvia"
        assert node9_display != "none", "Node 9 must be visible as Incógnita"
        assert "???" in n9_tag
        assert "Incógnita" in n9_title
        assert n9_icon == "?"

        # 2. Verify Inspector Panel (Default active selection on Station 09)
        insp_badge = page.text_content("#insp-badge")
        insp_title = page.text_content("#insp-title")
        insp_btn = page.text_content("#insp-btn-primary")
        print(f"Inspector: Badge='{insp_badge}', Title='{insp_title}', Button='{insp_btn.strip()}'")
        assert "UNKNOWN HORIZON" in insp_badge
        assert "Incógnita" in insp_title
        assert "Station Veiled" in insp_btn or "Incógnita" in insp_btn

        # Test clicking inspector locked button triggers alert and does NOT navigate
        alert_triggered = []
        page.on("dialog", lambda dialog: (alert_triggered.append(dialog.message), dialog.accept()))
        page.click("#insp-btn-primary")
        page.wait_for_timeout(300)
        print(f"Alert triggered on Inspector button click: {alert_triggered}")
        assert len(alert_triggered) > 0 and "veiled" in alert_triggered[0].lower()

        # 3. Verify Transmission Logs (Station 08 unlocked -> 5 recordings)
        tx_btn = page.locator("button[data-view='view-transmissions']")
        tx_btn.click()
        page.wait_for_timeout(300)
        tx_count = page.text_content("#tx-archive-count")
        midnight_cards_visible = page.evaluate("() => Array.from(document.querySelectorAll('.tx-log-card-midnight')).every(c => !c.hidden)")
        print(f"Transmissions Count: '{tx_count}', Station 8 cards visible: {midnight_cards_visible}")
        assert "5 RECORDINGS READY" in tx_count
        assert midnight_cards_visible

        # 4. Verify Order Archives (Optical logs visible)
        archives_btn = page.locator("button[data-view='view-archives']")
        archives_btn.click()
        page.wait_for_timeout(300)
        optical_hidden = page.evaluate("() => document.getElementById('archive-optical-logs').hidden")
        print(f"Archives Optical Logs hidden: {optical_hidden}")
        assert not optical_hidden

        # 5. Verify Chronicles of the Raid (Card 8 secured, Card 9 Incógnita)
        chron_btn = page.locator("button[data-view='view-chronicles']")
        chron_btn.click()
        page.wait_for_timeout(300)
        chron8_tag = page.text_content("#chronicle-8-tag")
        chron8_title = page.text_content("#chronicle-8-title")
        chron8_btn = page.text_content("#chron-btn-locked")
        chron9_display = page.evaluate("() => document.getElementById('chronicle-card-9').style.display")
        chron9_tag = page.text_content("#chronicle-9-tag")
        chron9_title = page.text_content("#chronicle-9-title")
        chron9_btn = page.text_content("#chronicle-9-btn")
        print(f"Chronicles Card 8: Tag='{chron8_tag}', Title='{chron8_title}', Button='{chron8_btn.strip()}'")
        print(f"Chronicles Card 9: Tag='{chron9_tag}', Title='{chron9_title}', Button='{chron9_btn.strip()}', Display='{chron9_display}'")
        assert "Secured ✓" in chron8_tag
        assert "Revisit" in chron8_btn
        assert chron9_display != "none"
        assert "Unknown Horizon" in chron9_tag
        assert "Incógnita" in chron9_title
        assert "Sealed" in chron9_btn or "Incógnita" in chron9_btn

        # Test clicking Card 9 button
        alert_triggered.clear()
        page.click("#chronicle-9-btn")
        page.wait_for_timeout(300)
        print(f"Alert triggered on Card 9 button click: {alert_triggered}")
        assert len(alert_triggered) > 0 and "veiled" in alert_triggered[0].lower()

        # 6. Verify direct URL access protection for Game 9
        alert_triggered.clear()
        page.goto("http://localhost:8080/constellation/celestial-cipher/index.html")
        page.wait_for_timeout(500)
        current_url = page.url
        print(f"Direct access result url: {current_url}, Alert triggered: {alert_triggered}")
        assert len(alert_triggered) > 0 and "veiled" in alert_triggered[0].lower()
        assert "index.html#view-trail" in current_url or "index.html" in current_url

        page.screenshot(path="scratch/silvia_new_profile_verified.png")

        print("\n--- TEST 2: TESTER (CARLES) PROFILE (GAME 9 ACTIVE) ---")
        # Login as Carles
        page.goto("http://localhost:8080/index.html")
        page.wait_for_timeout(300)
        page.click("#btn-seeker-switch")
        page.wait_for_timeout(300)
        page.fill("#gate-username", "Carles")
        page.fill("#gate-password", "Carles")
        page.click("#gate-submit-btn")
        page.wait_for_timeout(500)

        seeker_pill = page.text_content("#seeker-name-display")
        print(f"Active Seeker Display: {seeker_pill}")
        assert "Carles" in seeker_pill

        # Route Map: Node 9 is ACTIVE OBJECTIVE
        n8_tag = page.text_content("#node-8-tag")
        n9_tag = page.text_content("#node-9-tag")
        n9_title = page.text_content("#node-9-title")
        n9_beacon_disp = page.evaluate("() => document.getElementById('node-9-beacon').style.display")
        insp_badge = page.text_content("#insp-badge")
        insp_title = page.text_content("#insp-title")
        insp_btn = page.text_content("#insp-btn-primary")
        print(f"Map Node 8: '{n8_tag}'")
        print(f"Map Node 9: Tag='{n9_tag}', Title='{n9_title}', Beacon Display='{n9_beacon_disp}'")
        print(f"Inspector: Badge='{insp_badge}', Title='{insp_title}', Button='{insp_btn.strip()}'")
        assert "SECURED ✓" in n8_tag
        assert "ACTIVE OBJECTIVE" in n9_tag
        assert "The Celestial Cipher" in n9_title
        assert n9_beacon_disp == "block"
        assert "The Celestial Cipher" in insp_title
        assert "ENTER CELESTIAL CIPHER" in insp_btn

        # Chronicles: Card 9 is Active Objective
        chron_btn = page.locator("button[data-view='view-chronicles']")
        chron_btn.click()
        page.wait_for_timeout(300)
        chron9_tag = page.text_content("#chronicle-9-tag")
        chron9_title = page.text_content("#chronicle-9-title")
        chron9_btn = page.text_content("#chronicle-9-btn")
        print(f"Chronicles Card 9 for Carles: Tag='{chron9_tag}', Title='{chron9_title}', Button='{chron9_btn.strip()}'")
        assert "Active Objective" in chron9_tag
        assert "The Celestial Cipher" in chron9_title
        assert "ENTER CELESTIAL CIPHER" in chron9_btn

        # Test Carles CAN open Game 9
        page.goto("http://localhost:8080/constellation/celestial-cipher/index.html")
        page.wait_for_timeout(500)
        cipher_title = page.text_content(".cipher-main-title")
        print(f"Carles inside Game 9: '{cipher_title}', URL: {page.url}")
        assert "The Celestial Cipher" in cipher_title

        page.screenshot(path="scratch/carles_game9_verified.png")

        browser.close()
        print("\nALL REVISED VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
