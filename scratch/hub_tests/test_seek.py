from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, channel='chrome')
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    
    page.goto('http://localhost:8080/constellation/celestial-cipher/index.html')
    page.wait_for_timeout(400)
    
    # Scroll and click transmit
    page.locator('#btn-transmit-story').scroll_into_view_if_needed()
    page.click('#btn-transmit-story')
    page.wait_for_selector('#climax-modal.modal-open')
    page.wait_for_timeout(1000)
    
    # Check subtitle text
    text1 = page.locator('#sandstorm-transcript-text').inner_text()
    print("Initial subtitle:", text1)
    
    # Let's test calling updateSubtitles directly
    page.evaluate('updateSubtitles(25.0)')
    page.wait_for_timeout(300)
    text2 = page.locator('#sandstorm-transcript-text').inner_text()
    print("Subtitle at 25s:", text2)
    
    page.evaluate('updateSubtitles(52.0)')
    page.wait_for_timeout(300)
    text3 = page.locator('#sandstorm-transcript-text').inner_text()
    print("Subtitle at 52s:", text3)
    
    page.screenshot(path='scratch/test_subtitles_transition.png')
    browser.close()
