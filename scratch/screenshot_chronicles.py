from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, channel="chrome")
    context = browser.new_context(viewport={'width': 1400, 'height': 900})
    page = context.new_page()

    page.goto("http://localhost:8080/index.html")
    # Login as Silvia
    page.fill("#gate-username", "Silvia")
    page.fill("#gate-password", "Silvia")
    page.click("#gate-submit-btn")
    page.wait_for_timeout(400)

    # View Chronicles
    page.click("button[data-view='view-chronicles']")
    page.wait_for_timeout(300)
    page.evaluate("() => document.getElementById('chronicle-card-8').scrollIntoView({block: 'center'})")
    page.wait_for_timeout(300)
    page.screenshot(path="scratch/silvia_chronicles_cards8_9.png")

    # Complete Station 8 for Silvia
    page.evaluate("() => window.debugCompleteStation8()")
    page.wait_for_timeout(300)
    page.evaluate("() => document.getElementById('chronicle-card-9').scrollIntoView({block: 'center'})")
    page.wait_for_timeout(300)
    page.screenshot(path="scratch/silvia_post8_chronicles_cards8_9.png")

    # Switch to Carles
    page.click("#btn-seeker-switch")
    page.wait_for_timeout(300)
    page.fill("#gate-username", "Carles")
    page.fill("#gate-password", "Carles")
    page.click("#gate-submit-btn")
    page.wait_for_timeout(400)

    page.click("button[data-view='view-chronicles']")
    page.wait_for_timeout(300)
    page.evaluate("() => document.getElementById('chronicle-card-9').scrollIntoView({block: 'center'})")
    page.wait_for_timeout(300)
    page.screenshot(path="scratch/carles_chronicles_cards8_9.png")

    browser.close()
