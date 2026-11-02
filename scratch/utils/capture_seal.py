from playwright.sync_api import sync_playwright

def capture_seal():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()

        page.goto("http://localhost:8080/index.html")
        page.evaluate("""() => {
            localStorage.setItem('the_eclipse_active_seeker', 'Carles');
            localStorage.setItem('seeker_carles_midnight_completed', 'true');
            localStorage.setItem('order_midnight_completed', 'true');
        }""")
        page.wait_for_timeout(200)

        page.goto("http://localhost:8080/constellation/celestial-cipher/index.html")
        page.wait_for_timeout(600)

        # Scroll to Chapter 3 / Charred facsimile
        facsimile = page.locator(".charred-relic-facsimile")
        facsimile.scroll_into_view_if_needed()
        page.wait_for_timeout(400)

        # Take screenshot of the dossier element specifically
        facsimile.screenshot(path="scratch/polished_seal_closeup.png")
        print("PASS: Saved scratch/polished_seal_closeup.png")

        # Also full viewport screenshot
        page.screenshot(path="scratch/chapter3_polished_view.png")
        print("PASS: Saved scratch/chapter3_polished_view.png")

        browser.close()

if __name__ == "__main__":
    capture_seal()
