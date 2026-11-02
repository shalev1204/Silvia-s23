from playwright.sync_api import sync_playwright

def test_cipher_password_gate():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel='chrome')
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()

        print("Navigating to http://localhost:8080/constellation/celestial-cipher/index.html?lock=1...")
        page.goto("http://localhost:8080/constellation/celestial-cipher/index.html?lock=1")
        page.wait_for_timeout(600)

        # Set Silvia profile and ensure lock state
        page.evaluate("""() => {
            sessionStorage.setItem('the_eclipse_session_authenticated', 'true');
            localStorage.setItem('the_eclipse_active_seeker', 'Silvia');
            localStorage.setItem('seeker_silvia_midnight_completed', 'true');
            localStorage.removeItem('order_cipher_unlocked');
            localStorage.removeItem('seeker_silvia_cipher_unlocked');
        }""")
        page.goto("http://localhost:8080/constellation/celestial-cipher/index.html?lock=1")
        page.wait_for_timeout(800)

        # 1. Check Password Gate is visible
        overlay = page.locator("#cipher-gate-overlay")
        assert overlay.is_visible(), "Password gate overlay must be visible"
        print("✓ Celestial Cipher Password Gate is active and visible")

        title = page.locator(".cipher-gate-title").inner_text()
        print("Gate Title:", title)
        assert "The Celestial Cipher" in title

        desc = page.locator(".cipher-gate-instruction").inner_text()
        print("Instruction:", desc)
        assert "Sheet 7 · Side A" in desc

        page.screenshot(path="scratch/cipher_gate_locked.png")
        print("Saved scratch/cipher_gate_locked.png")

        # 2. Test Invalid Password
        input_el = page.locator("#cipher-password-input")
        btn_unlock = page.locator("#btn-cipher-unlock")

        print("\nTesting wrong password: 'WRONG CIPHER PHRASE'...")
        input_el.fill("WRONG CIPHER PHRASE")
        btn_unlock.click(force=True)
        page.wait_for_timeout(600)

        feedback = page.locator("#cipher-feedback-msg").inner_text()
        print("Feedback after wrong password:", feedback)
        assert "gears do not mesh" in feedback
        assert overlay.is_visible(), "Overlay must still be visible after wrong password"
        print("✓ Wrong password correctly rejected with feedback!")

        page.screenshot(path="scratch/cipher_gate_error.png")
        print("Saved scratch/cipher_gate_error.png")

        # 3. Test Correct Password (case-insensitive: 'you were always the treasure')
        print("\nTesting correct password: 'you were always the treasure'...")
        input_el.fill("you were always the treasure")
        btn_unlock.click(force=True)
        page.wait_for_timeout(800)

        feedback = page.locator("#cipher-feedback-msg").inner_text()
        print("Feedback after correct password:", feedback)
        assert "Meridian unlocked" in feedback

        # Wait for overlay animation to complete
        page.wait_for_timeout(1000)
        assert not overlay.is_visible(), "Overlay should be gone after correct unlock"
        print("✓ Meridian seal broken! Manuscript unlocked.")

        # Verify Chapter 1 of the novel is visible and readable
        chapter1_title = page.locator("#chapter-1 .novel-part-heading").inner_text()
        print("Chapter 1 Title:", chapter1_title)
        assert "CALIPER" in chapter1_title.upper() or "CHAPTER" in chapter1_title.upper()

        page.screenshot(path="scratch/cipher_novel_unlocked.png")
        print("Saved scratch/cipher_novel_unlocked.png")

        # 4. Verify persistence across reload (without ?lock=1)
        print("\nTesting persistence on reload...")
        page.goto("http://localhost:8080/constellation/celestial-cipher/index.html")
        page.wait_for_timeout(800)

        assert not overlay.is_visible(), "Overlay should remain unlocked after reloading"
        print("✓ Persistent unlock confirmed on page reload!")

        browser.close()
        print("\nALL CIPHER PASSWORD GATE TESTS PASSED!")

if __name__ == "__main__":
    test_cipher_password_gate()
