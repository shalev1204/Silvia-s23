import time
from playwright.sync_api import sync_playwright

def test_workshop_enhancements():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel='chrome')
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("1. Navigating to Hub...")
        page.goto("http://localhost:8080/index.html")
        page.wait_for_timeout(800)

        # Dismiss sanctuary gate overlay if present
        page.evaluate("() => document.getElementById('sanctuary-gate-overlay')?.remove()")
        page.wait_for_timeout(300)

        # 2. Click Cliffside Workshop button
        btn_messenger = page.locator("#btn-header-messenger")
        assert btn_messenger.is_visible(), "Header messenger button must be visible"
        btn_messenger.click(force=True)
        page.wait_for_timeout(600)

        active_view = page.evaluate("() => document.body.getAttribute('data-active-view')")
        assert active_view == "view-field-wire", f"Expected view-field-wire, got {active_view}"

        # 3. Verify Analog Signal Meter
        meter = page.locator(".telegraph-signal-meter")
        assert meter.is_visible(), "Telegraph signal meter must be visible"
        meter_text = meter.inner_text()
        print("Signal Meter Text:", meter_text)
        assert "SIGNAL" in meter_text
        assert "94%" in meter_text
        assert "112° E" in meter_text
        assert "CARRIER LOCK" in meter_text

        # 4. Verify Interactive Physical Journal Callout Pill in Hermes message
        journal_pill = page.locator(".messenger-chat-body .journal-ref-pill").first
        assert journal_pill.is_visible(), "Journal reference pill must be visible in chat"
        pill_text = journal_pill.inner_text()
        print("Journal Reference Pill Text:", pill_text)
        assert "Sheet 7B" in pill_text or "SHEET 7B" in pill_text

        # 5. Select a Choice & Verify Silvia's Avatar Stamp
        choice_btn = page.locator(".messenger-choice-pill").first
        print("Clicking choice:", choice_btn.inner_text())
        choice_btn.click()
        page.wait_for_timeout(100)

        silvia_stamp = page.locator(".silvia-avatar-stamp").first
        assert silvia_stamp.is_visible(), "Silvia navigator stamp avatar must be visible on outgoing messages"
        stamp_glyph = page.locator(".silvia-seal-glyph").first.inner_text()
        print("Silvia Stamp Glyph:", stamp_glyph)
        assert "🧭" in stamp_glyph

        # Wait for Hermes to type and finish dispatch
        page.wait_for_timeout(2000)

        # Capture Expedition screenshot
        page.screenshot(path="scratch/workshop_expedition_enhanced.png")
        print("Saved scratch/workshop_expedition_enhanced.png")

        # 6. Switch to 'Ask Hermes' Inquiries tab
        btn_inquiries = page.locator("#tab-wire-inquiries")
        btn_inquiries.click()
        page.wait_for_timeout(500)

        # 7. Verify Filter Bar
        filter_bar = page.locator("#inquiry-filter-bar")
        assert filter_bar.is_visible(), "Inquiry filter bar must be visible"
        all_cards = page.locator("#inquiries-questions-grid .messenger-faq-chip")
        assert all_cards.count() == 9, f"Expected 9 cards for All, found {all_cards.count()}"

        # Click 'The Desert (4)' filter
        filter_desert = page.locator(".inquiry-filter-pill[data-filter='desert']")
        filter_desert.click()
        page.wait_for_timeout(300)
        desert_cards = page.locator("#inquiries-questions-grid .messenger-faq-chip")
        print("Desert filter cards count:", desert_cards.count())
        assert desert_cards.count() == 4, f"Expected 4 desert cards, got {desert_cards.count()}"

        # Click 'The Astrolabe (2)' filter
        filter_astrolabe = page.locator(".inquiry-filter-pill[data-filter='astrolabe']")
        filter_astrolabe.click()
        page.wait_for_timeout(300)
        astrolabe_cards = page.locator("#inquiries-questions-grid .messenger-faq-chip")
        print("Astrolabe filter cards count:", astrolabe_cards.count())
        assert astrolabe_cards.count() == 2, f"Expected 2 astrolabe cards, got {astrolabe_cards.count()}"

        # Click 'The Workshop (3)' filter
        filter_workshop = page.locator(".inquiry-filter-pill[data-filter='workshop']")
        filter_workshop.click()
        page.wait_for_timeout(300)
        workshop_cards = page.locator("#inquiries-questions-grid .messenger-faq-chip")
        print("Workshop filter cards count:", workshop_cards.count())
        assert workshop_cards.count() == 3, f"Expected 3 workshop cards, got {workshop_cards.count()}"

        # 8. Click an Inquiry Card and verify '✓ Answered' badge & response
        first_card = page.locator("#inquiries-questions-grid .messenger-faq-chip").first
        card_title = first_card.locator(".messenger-faq-chip-title").inner_text()
        print("Clicking inquiry card:", card_title)
        first_card.click()
        page.wait_for_timeout(300)

        # Check badge on the card
        badge = first_card.locator(".inquiry-read-badge")
        assert badge.is_visible(), "Answered badge must appear on the clicked card"
        print("Badge text:", badge.inner_text())
        assert "Answered" in badge.inner_text()

        # Wait for Hermes answer to be typed out
        page.wait_for_timeout(2000)

        # Capture Inquiries screenshot
        page.screenshot(path="scratch/workshop_inquiries_enhanced.png")
        print("Saved scratch/workshop_inquiries_enhanced.png")

        browser.close()
        print("ALL 7 CLIFFSIDE WORKSHOP ENHANCEMENTS TESTED AND VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_workshop_enhancements()
