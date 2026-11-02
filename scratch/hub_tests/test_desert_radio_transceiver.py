import time
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, channel='chrome')
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    
    page.goto('http://localhost:8080/index.html')
    page.evaluate('''() => {
        localStorage.setItem('the_eclipse_active_seeker', 'Carles');
        localStorage.setItem('seeker_carles_midnight_completed', 'true');
        localStorage.setItem('order_midnight_completed', 'true');
    }''')
    
    page.goto('http://localhost:8080/constellation/celestial-cipher/index.html')
    page.wait_for_timeout(500)
    
    # Scroll to bottom transmit button
    page.locator('#btn-transmit-story').scroll_into_view_if_needed()
    page.wait_for_timeout(300)
    
    # Click transmit button
    page.click('#btn-transmit-story')
    
    # Wait for modal to open and start playback
    page.wait_for_selector('#climax-modal.modal-open', timeout=5000)
    page.wait_for_timeout(1500)
    
    # Capture initial transmission screenshot
    page.screenshot(path='scratch/desert_transceiver_active_1.png')
    print("Screenshot 1 captured: initial radio state")
    
    # Fast-forward audio to 25s (where Cartographer talks about the sky and storm)
    page.evaluate('''() => {
        const audio = document.getElementById('radio-audio-element');
        if (audio) {
            audio.currentTime = 22.0;
            audio.dispatchEvent(new Event('timeupdate'));
        }
    }''')
    page.wait_for_timeout(800)
    page.screenshot(path='scratch/desert_transceiver_active_2.png')
    print("Screenshot 2 captured: mid-transmission state with active subtitle")
    
    # Fast-forward audio to 76s (concluded state)
    page.evaluate('''() => {
        const audio = document.getElementById('radio-audio-element');
        if (audio) {
            audio.currentTime = 75.5;
            audio.dispatchEvent(new Event('ended'));
        }
    }''')
    page.wait_for_timeout(500)
    page.screenshot(path='scratch/desert_transceiver_ended.png')
    print("Screenshot 3 captured: concluded state")
    
    browser.close()
