import time
from playwright.sync_api import sync_playwright

def test_inquiries_chat_separation():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel='chrome')
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("1. Opening Hub...")
        page.goto("http://localhost:8080/index.html")
        page.wait_for_timeout(600)
        page.evaluate("() => document.getElementById('sanctuary-gate-overlay')?.remove()")

        # Open Cliffside Workshop
        btn_messenger = page.locator("#btn-header-messenger")
        btn_messenger.click(force=True)
        page.wait_for_timeout(500)

        # 2. Verify Expedition tab initially
        expedition_stream = page.locator("#wire-messages-stream")
        inquiries_stream = page.locator("#wire-inquiries-stream")

        assert expedition_stream.is_visible(), "Expedition stream must be visible in Expedition tab"
        assert not inquiries_stream.is_visible(), "Inquiries stream must be hidden in Expedition tab"

        expedition_text = expedition_stream.inner_text()
        print("Expedition stream text preview:", expedition_text[:80])
        assert "sandstorm" in expedition_text.lower(), "Expedition story must be in expedition stream"

        # 3. Switch to 'Ask Hermes'
        print("2. Switching to Ask Hermes tab...")
        page.locator("#tab-wire-inquiries").click()
        page.wait_for_timeout(400)

        assert not expedition_stream.is_visible(), "Expedition stream must be HIDDEN in Ask Hermes tab"
        assert inquiries_stream.is_visible(), "Inquiries stream must be VISIBLE in Ask Hermes tab"

        # Verify inquiries stream is EMPTY of expedition messages
        inquiries_text = inquiries_stream.inner_text()
        print("Inquiries stream text before tapping question:", repr(inquiries_text))
        assert "sandstorm" not in inquiries_text.lower(), "Expedition chat must NEVER appear in Ask Hermes!"
        assert inquiries_stream.locator(".chat-bubble-wrap").count() == 0, "Inquiries stream must have 0 chat bubbles initially"

        # Take screenshot of Ask Hermes empty standby
        page.evaluate("() => window.scrollTo(0, 0)")
        page.screenshot(path="scratch/ask_hermes_empty_standby.png")
        print("Saved scratch/ask_hermes_empty_standby.png")

        # 4. Tap an inquiry question (Desert Oracle)
        print("3. Tapping 'Who is the Desert Oracle?'...")
        desert_filter = page.locator(".inquiry-filter-pill[data-filter='desert']")
        desert_filter.click()
        page.wait_for_timeout(200)

        oracle_card = page.locator("#inq-card-inq-desert-oracle")
        assert oracle_card.is_visible(), "Desert Oracle card must be visible"
        oracle_card.click()
        page.wait_for_timeout(300)

        # Wait for typewriter effect to complete
        page.wait_for_timeout(2000)

        # Verify bubble count in inquiries stream
        assert inquiries_stream.locator(".chat-bubble-wrap").count() == 2, "Inquiries stream should have 2 bubbles (Silvia Q + Hermes A)"
        inq_text_after = inquiries_stream.inner_text()
        assert "Who is the Desert Oracle?" in inq_text_after
        assert "second guardian" in inq_text_after.lower()
        assert "sandstorm" not in inq_text_after.lower()

        # Take screenshot of answered inquiry in Ask Hermes
        page.screenshot(path="scratch/ask_hermes_answered_oracle.png")
        print("Saved scratch/ask_hermes_answered_oracle.png")

        # 5. Switch back to Expedition tab
        print("4. Switching back to Expedition tab...")
        page.locator("#tab-wire-expedition").click()
        page.wait_for_timeout(400)

        assert expedition_stream.is_visible(), "Expedition stream must be visible again"
        assert not inquiries_stream.is_visible(), "Inquiries stream must be hidden again"

        exp_text_after = expedition_stream.inner_text()
        assert "sandstorm" in exp_text_after.lower(), "Expedition thread remains intact"
        assert "Who is the Desert Oracle?" not in exp_text_after, "Inquiry question must NOT pollute Expedition thread!"

        # Take screenshot of restored Expedition tab
        page.screenshot(path="scratch/expedition_tab_clean.png")
        print("Saved scratch/expedition_tab_clean.png")

        browser.close()
        print("TEST PASSED: CHAT SEPARATION AND EMPTY STATE IN ASK HERMES VERIFIED PERFECTLY!")

if __name__ == "__main__":
    test_inquiries_chat_separation()
