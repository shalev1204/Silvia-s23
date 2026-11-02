import time
from playwright.sync_api import sync_playwright

def test_cliffside_workshop():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel='chrome')
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("Navigating to Hub...")
        page.goto("http://localhost:8080/index.html")
        page.wait_for_timeout(800)

        # Dismiss gate overlay if present
        page.evaluate("() => document.getElementById('sanctuary-gate-overlay')?.remove()")
        page.wait_for_timeout(300)

        # 1. Click the top header button to open The Cliffside Workshop
        btn_messenger = page.locator("#btn-header-messenger")
        assert btn_messenger.is_visible(), "Header messenger button must be visible"
        print("Header button title:", btn_messenger.get_attribute("title"))
        assert "The Cliffside Workshop" in btn_messenger.get_attribute("title")

        btn_messenger.click(force=True)
        page.wait_for_timeout(600)

        # 2. Check active view
        active_view = page.evaluate("() => document.body.getAttribute('data-active-view')")
        print("Active view attribute:", active_view)
        assert active_view == "view-field-wire", "Active view should be view-field-wire"

        # 3. Check section title and elements
        title = page.locator("#view-field-wire .view-title").inner_text()
        tagline = page.locator("#view-field-wire .view-tagline").inner_text()
        print("Section Title:", title)
        print("Section Tagline:", tagline)
        assert "THE CLIFFSIDE WORKSHOP" in title.upper()

        # 4. Check messenger window
        messenger_window = page.locator(".messenger-app-window")
        assert messenger_window.is_visible(), "Messenger window must be visible"

        # 5. Take screenshot of Expedition Mode
        page.screenshot(path="scratch/cliffside_workshop_expedition.png")
        print("Screenshot saved to scratch/cliffside_workshop_expedition.png")

        # 6. Switch to Workshop Inquiries
        btn_inquiries = page.locator("#tab-wire-inquiries")
        btn_inquiries.click()
        page.wait_for_timeout(400)

        inquiries_visible = page.locator("#wire-inquiries-panel").is_visible()
        print("Inquiries panel visible:", inquiries_visible)
        assert inquiries_visible, "Inquiries panel should be visible"

        page.locator("#wire-inquiries-panel").scroll_into_view_if_needed()
        page.wait_for_timeout(300)
        page.screenshot(path="scratch/cliffside_workshop_inquiries.png")
        print("Screenshot saved to scratch/cliffside_workshop_inquiries.png")

        browser.close()
        print("All Cliffside Workshop tests passed with 100% success!")

if __name__ == "__main__":
    test_cliffside_workshop()
