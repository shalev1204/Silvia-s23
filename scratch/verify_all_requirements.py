import time
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, channel='chrome')
    
    # -------------------------------------------------------------
    # TEST 1: Silvia's Profile
    # -------------------------------------------------------------
    print("--- 1. Testing Silvia Profile ---")
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://localhost:8080/index.html')
    
    page.evaluate('''() => {
        localStorage.clear();
        localStorage.setItem('the_eclipse_active_seeker', 'Silvia');
        localStorage.setItem('seeker_silvia_midnight_completed', 'false');
        localStorage.setItem('order_midnight_completed', 'false');
    }''')
    page.reload()
    page.wait_for_timeout(1000)
    
    # Check Chronicles Card 8 (veiled)
    card8_title = page.locator('#chronicle-8-title').inner_text()
    card8_desc = page.locator('#chronicle-8-text').inner_text()
    print("Silvia Card 8 Title:", card8_title)
    print("Silvia Card 8 Desc:", card8_desc[:60], "...")
    assert "2090" not in card8_desc, "Spoiler found in Silvia Card 8!"
    assert "Achernar" not in card8_desc, "Spoiler found in Silvia Card 8!"
    
    # Check Transmissions Card for Station 08 is hidden for Silvia
    tx8_visible = page.locator('.tx-log-card-midnight').first.is_visible()
    print("Silvia Station 08 Transmissions visible:", tx8_visible)
    assert not tx8_visible, "Station 08 transmissions should be hidden for Silvia!"
    
    # Check Optical Logs in Archives is hidden for Silvia
    opt_visible = page.locator('#archive-optical-logs').is_visible()
    print("Silvia Optical Logs visible:", opt_visible)
    assert not opt_visible, "Optical logs should be hidden for Silvia!"
    
    # Check Map Node 9 is hidden for Silvia prior to Game 8
    node9_display = page.evaluate('document.getElementById("map-node-9").style.display')
    print("Silvia Map Node 9 display:", node9_display)
    assert node9_display == "none", "Node 9 should be hidden before Game 8!"
    
    # -------------------------------------------------------------
    # TEST 2: Silvia completes Game 8 -> reveals Game 9 as INCÓGNITA
    # -------------------------------------------------------------
    print("\n--- 2. Testing Silvia Completing Game 8 ---")
    page.evaluate('''() => {
        localStorage.setItem('seeker_silvia_midnight_completed', 'true');
        localStorage.setItem('order_midnight_completed', 'true');
    }''')
    page.reload()
    page.wait_for_timeout(1000)
    
    # Now Card 8 is completed
    card8_badge = page.locator('#chronicle-8-tag').inner_text()
    print("Silvia Card 8 Tag:", card8_badge)
    
    # Map Node 9 is now VISIBLE but as an INCÓGNITA
    node9_display = page.evaluate('document.getElementById("map-node-9").style.display')
    node9_tag = page.evaluate('document.getElementById("node-9-tag").textContent')
    node9_title = page.evaluate('document.getElementById("node-9-title").textContent')
    print("Silvia Map Node 9 display:", node9_display)
    print("Silvia Map Node 9 tag:", node9_tag, "title:", node9_title)
    assert node9_display != "none", "Node 9 should be visible after Game 8!"
    assert "?" in node9_tag or "Incógnita" in node9_title, "Node 9 should be incógnita for Silvia!"
    
    # Chronicles Card 9 is visible as an INCÓGNITA
    card9_title = page.locator('#chronicle-9-title').inner_text()
    print("Silvia Chronicles Card 9 Title:", card9_title)
    assert "Incógnita" in card9_title or "Sealed" in card9_title, "Card 9 should be incógnita for Silvia!"
    
    # -------------------------------------------------------------
    # TEST 3: Carles Profile (Tester / Latest Version)
    # -------------------------------------------------------------
    print("\n--- 3. Testing Carles Profile ---")
    page.evaluate('''() => {
        localStorage.setItem('the_eclipse_active_seeker', 'Carles');
        localStorage.setItem('seeker_carles_midnight_completed', 'true');
        localStorage.setItem('order_midnight_completed', 'true');
    }''')
    page.reload()
    page.wait_for_timeout(1000)
    
    # For Carles: Game 9 is ACTIVE OBJECTIVE in Chronicles
    c9_badge = page.locator('#chronicle-9-tag').inner_text()
    c9_title = page.locator('#chronicle-9-title').inner_text()
    c9_href = page.locator('#chronicle-9-btn').get_attribute('href')
    print("Carles Card 9 Tag:", c9_badge)
    print("Carles Card 9 Title:", c9_title)
    print("Carles Card 9 Action Href:", c9_href)
    assert "Active Objective" in c9_badge, "Card 9 must be active objective for Carles!"
    assert "The Celestial Cipher" in c9_title, "Card 9 title must be The Celestial Cipher for Carles!"
    
    # For Carles: Node 9 is ACTIVE OBJECTIVE on Map
    node9_tag = page.evaluate('document.getElementById("node-9-tag").textContent')
    node9_title = page.evaluate('document.getElementById("node-9-title").textContent')
    print("Carles Map Node 9 tag:", node9_tag, "title:", node9_title)
    assert "The Celestial Cipher" in node9_title, "Node 9 title must be The Celestial Cipher for Carles!"
    
    # -------------------------------------------------------------
    # TEST 4: Game 09 Telemetry Radio Transceiver
    # -------------------------------------------------------------
    print("\n--- 4. Testing Game 09 Desert Telemetry ---")
    page.goto('http://localhost:8080/constellation/celestial-cipher/index.html')
    page.wait_for_timeout(600)
    
    # Trigger Climax Transceiver via transmit button
    page.locator('#btn-transmit-story').scroll_into_view_if_needed()
    page.click('#btn-transmit-story')
    page.wait_for_selector('#climax-modal.modal-open', timeout=5000)
    page.wait_for_timeout(1000)
    
    modal_title = page.locator('#radio-current-title').inner_text()
    sender_name = page.locator('.sender-name').inner_text()
    sub_text = page.locator('#sandstorm-transcript-text').inner_text()
    audio_src = page.evaluate('document.getElementById("radio-audio-element").src')
    
    print("Telemetry Title:", modal_title)
    print("Sender Name:", sender_name)
    print("Subtitles Initial:", sub_text)
    print("Audio Source:", audio_src)
    
    assert "THE SANDSTORM ENGULFS ICARUS" in modal_title
    assert "Icarus" in sender_name
    assert "cartographer_sandstorm_emergency.mp3" in audio_src
    
    print("\n✓ ALL TESTS PASSED WITH 100% SUCCESS!")
    browser.close()
