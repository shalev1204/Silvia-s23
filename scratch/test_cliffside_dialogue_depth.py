import sys
from playwright.sync_api import sync_playwright

def test_cliffside_dialogue_depth():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel='chrome')
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()

        print("Navigating to http://localhost:8080/index.html...")
        page.goto("http://localhost:8080/index.html")
        page.wait_for_timeout(500)

        # Set Silvia authenticated and Game 9 completed so Cliffside Workshop is open
        page.evaluate("""() => {
            sessionStorage.setItem('the_eclipse_session_authenticated', 'true');
            localStorage.setItem('the_eclipse_active_seeker', 'Silvia');
            localStorage.setItem('seeker_silvia_midnight_completed', 'true');
            localStorage.setItem('seeker_silvia_cipher_completed', 'true');
            localStorage.setItem('order_cipher_completed', 'true');
            // Reset wire state for fresh test
            localStorage.removeItem('order_field_wire_step');
            localStorage.removeItem('order_field_wire_choices');
            localStorage.removeItem('order_field_wire_completed');
        }""")
        page.goto("http://localhost:8080/index.html")
        page.wait_for_timeout(600)
        page.evaluate("() => document.getElementById('sanctuary-gate-overlay')?.remove()")
        page.wait_for_timeout(300)

        # 1. Open Cliffside Workshop
        btn_messenger = page.locator("#btn-header-messenger")
        assert btn_messenger.is_visible(), "Cliffside Workshop button must be visible for Silvia"
        btn_messenger.click(force=True)
        page.wait_for_timeout(500)

        active_view = page.evaluate("() => document.body.getAttribute('data-active-view')")
        assert active_view == "view-field-wire", f"Expected view-field-wire, got {active_view}"
        print("✓ Successfully entered Cliffside Workshop")

        # 2. Check Opening Dispatch from Hermes
        incoming_msgs = page.locator(".chat-bubble-wrap.incoming")
        assert incoming_msgs.count() >= 1, "Expected at least 1 incoming message"
        first_msg = incoming_msgs.first.inner_text()
        print("\n--- Hermes First Message ---")
        print(first_msg[:120] + "...")
        assert "Silvia, I hope this message gets to you" in first_msg, "Must start with written telegraph greeting"
        assert "can you hear me" not in first_msg, "Should NOT contain 'can you hear me'"
        print("✓ Hermes opening message matches telegraph lore perfectly (no 'can you hear me')")

        # 3. Check 3 Choices in Beat 0
        choices = page.locator(".messenger-choice-pill")
        assert choices.count() == 3, f"Expected 3 choices, found {choices.count()}"
        choice_texts = [choices.nth(i).inner_text() for i in range(3)]
        print("\nBeat 0 Choices:")
        for t in choice_texts:
            print(" -", t.replace('\n', ' '))
        
        page.screenshot(path="scratch/dialogue_beat0_3choices.png")
        print("Saved scratch/dialogue_beat0_3choices.png")

        # 4. Click Choice 02: Protective
        print("\nSelecting Option 02 (Protective)...")
        choices.nth(1).click(force=True)
        # Wait for Hermes response to arrive and typewriter to complete
        page.locator(".chat-bubble-wrap.incoming").nth(1).wait_for(state="visible", timeout=10000)
        page.locator(".messenger-choice-pill:not(:disabled)").first.wait_for(state="visible", timeout=10000)
        page.wait_for_timeout(400)

        # Verify Hermes's specific reactive reply
        all_incoming = page.locator(".chat-bubble-wrap.incoming")
        assert all_incoming.count() >= 2, "Expected 2 incoming messages"
        second_msg = all_incoming.nth(1).inner_text()
        print("\n--- Hermes Reply to Option 02 ---")
        print(second_msg[:140] + "...")
        assert "shelf of solid granite" in second_msg or "ancient and sturdy" in second_msg
        print("✓ Hermes acknowledged Silvia's protective concern specifically!")

        # 5. Check Beat 1 Choices (3 options)
        choices = page.locator(".messenger-choice-pill:not(:disabled)")
        assert choices.count() == 3, f"Expected 3 choices in Beat 1, found {choices.count()}"
        print("\nBeat 1 Choices:")
        for i in range(3):
            print(" -", choices.nth(i).inner_text().replace('\n', ' '))

        # 6. Click Choice 01: Tactical
        print("\nSelecting Option 01 (Tactical)...")
        choices.nth(0).click(force=True)
        page.locator(".chat-bubble-wrap.incoming").nth(2).wait_for(state="visible", timeout=10000)
        page.locator(".messenger-choice-pill:not(:disabled)").first.wait_for(state="visible", timeout=10000)
        page.wait_for_timeout(400)

        all_incoming = page.locator(".chat-bubble-wrap.incoming")
        third_msg = all_incoming.nth(2).inner_text()
        print("\n--- Hermes Reply to Option 01 ---")
        print(third_msg[:140] + "...")
        assert "strategist" in third_msg or "Sheet 7B" in third_msg
        print("✓ Hermes praised Silvia's strategist mind and asked about Sheet 7B!")

        # 7. Check Beat 2 Choices (Sheet 7B options)
        choices = page.locator(".messenger-choice-pill:not(:disabled)")
        assert choices.count() == 3, f"Expected 3 choices in Beat 2, found {choices.count()}"
        print("\nBeat 2 Choices (Sheet 7B):")
        for i in range(3):
            print(" -", choices.nth(i).inner_text().replace('\n', ' '))

        # 8. Click Choice 02: Cairns
        print("\nSelecting Option 02 (Three Cairns)...")
        choices.nth(1).click(force=True)
        page.locator(".chat-bubble-wrap.incoming").nth(3).wait_for(state="visible", timeout=10000)
        page.locator(".messenger-choice-pill:not(:disabled)").first.wait_for(state="visible", timeout=10000)
        page.wait_for_timeout(400)

        all_incoming = page.locator(".chat-bubble-wrap.incoming")
        fourth_msg = all_incoming.nth(3).inner_text()
        print("\n--- Hermes Reply to Option 02 ---")
        print(fourth_msg[:140] + "...")
        assert "Three Cairns" in fourth_msg or "blistered hands" in fourth_msg
        print("✓ Hermes recalled building the cairns in 1998!")

        # 9. Check Beat 3 Choices (112° E bearing)
        choices = page.locator(".messenger-choice-pill:not(:disabled)")
        assert choices.count() == 3, f"Expected 3 choices in Beat 3, found {choices.count()}"
        print("\nBeat 3 Choices (Compass Bearing):")
        for i in range(3):
            print(" -", choices.nth(i).inner_text().replace('\n', ' '))

        page.screenshot(path="scratch/dialogue_beat3_choices.png")

        # 10. Click Choice 02: Encouraging 112° E
        print("\nSelecting Option 02 (Encouraging 112° E)...")
        choices.nth(1).click(force=True)

        # Wait for completion banner
        completed_bar = page.locator("#wire-completed-bar")
        completed_bar.wait_for(state="visible", timeout=15000)
        print("✓ Waypoint completed bar is visible!")

        system_telemetry = page.locator(".chat-bubble-wrap.system-event")
        assert system_telemetry.count() >= 1, "Expected system telemetry event"
        print("✓ System telemetry dispatch displayed:", system_telemetry.last.inner_text().strip())

        page.screenshot(path="scratch/dialogue_completed_hearth.png")
        print("Saved scratch/dialogue_completed_hearth.png")

        # 11. Test Replay button
        print("\nTesting Replay button...")
        btn_replay = page.locator("#btn-wire-replay")
        btn_replay.click(force=True)
        page.wait_for_timeout(500)

        choices = page.locator(".messenger-choice-pill")
        assert choices.count() == 3, "Choices should be reset to Beat 0"
        first_choice = choices.first.inner_text()
        assert "I'm here, Hermes" in first_choice
        print("✓ Replay successfully resets conversation to Beat 0!")

        browser.close()
        print("\nALL DIALOGUE DEPTH TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_cliffside_dialogue_depth()
