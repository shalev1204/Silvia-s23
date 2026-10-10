import time
from playwright.sync_api import sync_playwright

def test_seeker_game9_access():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel='chrome')
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("=== SCENARIO 1: SILVIA INITIAL STATE (Game 8 Done, Game 9 Ready to Play) ===")
        page.goto("http://localhost:8080/index.html")
        page.wait_for_timeout(600)
        page.evaluate("""() => {
            sessionStorage.setItem('the_eclipse_session_authenticated', 'true');
            localStorage.setItem('the_eclipse_active_seeker', 'Silvia');
            localStorage.setItem('seeker_silvia_midnight_completed', 'true');
            localStorage.removeItem('seeker_silvia_cipher_completed');
            localStorage.removeItem('order_cipher_completed');
            document.getElementById('sanctuary-gate-overlay')?.remove();
        }""")
        page.goto("http://localhost:8080/index.html")
        page.wait_for_timeout(600)
        page.evaluate("() => document.getElementById('sanctuary-gate-overlay')?.remove()")
        page.wait_for_timeout(300)

        # 1. Verify Seeker Header says Silvia
        seeker_pill = page.locator("#seeker-active-pill").inner_text()
        print("Active Seeker Pill:", seeker_pill)
        assert "Silvia" in seeker_pill

        # 2. Verify The Brass Astrolabe is HIDDEN for Silvia
        nav_astrolabe = page.locator("#nav-btn-astrolabe")
        assert not nav_astrolabe.is_visible(), "The Brass Astrolabe must be HIDDEN for Silvia"
        print("✓ The Brass Astrolabe is hidden for Silvia")

        # 3. Verify Cliffside Workshop Chat is HIDDEN for Silvia before Game 9
        btn_messenger = page.locator("#btn-header-messenger")
        assert not btn_messenger.is_visible(), "Cliffside Workshop Chat button must be HIDDEN for Silvia before Game 9"
        print("✓ Cliffside Workshop Chat is hidden for Silvia before Game 9")

        # 4. Verify Game 9 is AVAILABLE on Star Map
        node9 = page.locator("#map-node-9")
        assert node9.is_visible(), "Node 9 must be visible on the Star Map"
        n9_tag = page.locator("#node-9-tag").text_content()
        n9_title = page.locator("#node-9-title").text_content()
        print(f"Node 9 Tag: '{n9_tag}', Title: '{n9_title}'")
        assert "ACTIVE OBJECTIVE" in n9_tag
        assert "Celestial Cipher" in n9_title

        # Click Node 9 to inspect
        node9.click(force=True)
        page.wait_for_timeout(300)
        insp_badge = page.locator("#insp-badge").inner_text()
        insp_title = page.locator("#insp-title").inner_text()
        insp_btn = page.locator("#insp-btn-primary")
        print(f"Inspector Badge: '{insp_badge}', Title: '{insp_title}', Btn Text: '{insp_btn.inner_text()}'")
        assert "STATION 09" in insp_badge
        assert "ACTIVE OBJECTIVE" in insp_badge
        assert "The Celestial Cipher" in insp_title
        assert "ENTER CELESTIAL CIPHER" in insp_btn.inner_text()
        assert "./constellation/celestial-cipher/index.html" in insp_btn.get_attribute("href")

        # Capture Star Map screenshot
        page.screenshot(path="scratch/silvia_game9_active_starmap.png")
        print("Saved scratch/silvia_game9_active_starmap.png")

        # 5. Verify Chronicles of the Raid: Card 9 is UNLOCKED
        page.locator('[data-view="view-chronicles"]').click()
        page.wait_for_timeout(300)
        chron9_card = page.locator("#chronicle-card-9")
        assert chron9_card.is_visible(), "Chronicle Card 9 must be visible"
        assert "chronicle-locked-card" not in chron9_card.get_attribute("class")
        chron9_btn = page.locator("#chronicle-9-btn")
        print(f"Chronicle Card 9 Button: '{chron9_btn.inner_text()}', href: '{chron9_btn.get_attribute('href')}'")
        assert "ENTER CELESTIAL CIPHER" in chron9_btn.inner_text()
        assert "./constellation/celestial-cipher/index.html" in chron9_btn.get_attribute("href")

        page.screenshot(path="scratch/silvia_game9_active_chronicles.png")
        print("Saved scratch/silvia_game9_active_chronicles.png")

        # 6. Verify URL route guards (Silvia cannot access view-astrolabe or view-field-wire)
        page.evaluate("() => { window.location.hash = '#view-astrolabe'; }")
        page.wait_for_timeout(300)
        active_view = page.evaluate("() => document.body.getAttribute('data-active-view')")
        assert active_view == "view-trail", f"Expected view-trail guard, got {active_view}"

        page.evaluate("() => { window.location.hash = '#view-field-wire'; }")
        page.wait_for_timeout(300)
        active_view = page.evaluate("() => document.body.getAttribute('data-active-view')")
        assert active_view == "view-trail", f"Expected view-trail guard, got {active_view}"
        print("✓ Route guards correctly prevent Silvia from accessing astrolabe and workshop before Game 9")

        print("\n=== SCENARIO 2: SILVIA POST-GAME 9 (Completed Game 9) ===")
        page.evaluate("""() => {
            sessionStorage.setItem('the_eclipse_session_authenticated', 'true');
            localStorage.setItem('the_eclipse_active_seeker', 'Silvia');
            localStorage.setItem('seeker_silvia_midnight_completed', 'true');
            localStorage.setItem('seeker_silvia_cipher_completed', 'true');
            localStorage.setItem('order_cipher_completed', 'true');
        }""")
        page.goto("http://localhost:8080/index.html")
        page.wait_for_timeout(600)
        page.evaluate("() => document.getElementById('sanctuary-gate-overlay')?.remove()")
        page.wait_for_timeout(300)

        # Verify Astrolabe is STILL hidden for Silvia
        nav_astrolabe = page.locator("#nav-btn-astrolabe")
        assert not nav_astrolabe.is_visible(), "The Brass Astrolabe must STILL be hidden for Silvia"
        print("✓ The Brass Astrolabe remains hidden for Silvia after Game 9")

        # Verify Cliffside Workshop Chat is now VISIBLE for Silvia
        btn_messenger = page.locator("#btn-header-messenger")
        assert btn_messenger.is_visible(), "Cliffside Workshop Chat MUST be visible for Silvia after Game 9"
        print("✓ Cliffside Workshop Chat is now VISIBLE for Silvia after Game 9!")

        # Click Cliffside Workshop Chat button
        btn_messenger.click(force=True)
        page.wait_for_timeout(500)
        active_view = page.evaluate("() => document.body.getAttribute('data-active-view')")
        assert active_view == "view-field-wire", f"Expected view-field-wire, got {active_view}"
        print("✓ Silvia can now enter Cliffside Workshop!")

        page.screenshot(path="scratch/silvia_post_game9_chat_visible.png")
        print("Saved scratch/silvia_post_game9_chat_visible.png")

        print("\n=== SCENARIO 3: CARLES (Sandbox / Developer Profile) ===")
        page.evaluate("""() => {
            sessionStorage.setItem('the_eclipse_session_authenticated', 'true');
            localStorage.setItem('the_eclipse_active_seeker', 'Carles');
            localStorage.setItem('seeker_carles_midnight_completed', 'true');
            localStorage.setItem('seeker_carles_cipher_completed', 'true');
        }""")
        page.goto("http://localhost:8080/index.html")
        page.wait_for_timeout(600)
        page.evaluate("() => document.getElementById('sanctuary-gate-overlay')?.remove()")
        page.wait_for_timeout(300)

        seeker_pill = page.locator("#seeker-active-pill").inner_text()
        print("Active Seeker Pill:", seeker_pill)
        assert "Carles" in seeker_pill

        # Verify BOTH Astrolabe AND Cliffside Workshop are visible for Carles
        nav_astrolabe = page.locator("#nav-btn-astrolabe")
        btn_messenger = page.locator("#btn-header-messenger")
        assert nav_astrolabe.is_visible(), "The Brass Astrolabe must be VISIBLE for Carles"
        assert btn_messenger.is_visible(), "Cliffside Workshop Chat must be VISIBLE for Carles"
        print("✓ Both The Brass Astrolabe AND Cliffside Workshop Chat are visible for Carles")

        # Verify Carles can access The Brass Astrolabe
        nav_astrolabe.click(force=True)
        page.wait_for_timeout(400)
        active_view = page.evaluate("() => document.body.getAttribute('data-active-view')")
        assert active_view == "view-astrolabe", f"Expected view-astrolabe for Carles, got {active_view}"

        page.screenshot(path="scratch/carles_sandbox_full_access.png")
        print("Saved scratch/carles_sandbox_full_access.png")

        browser.close()
        print("\nALL SCENARIOS TESTED AND FULLY VERIFIED!")

if __name__ == "__main__":
    test_seeker_game9_access()
