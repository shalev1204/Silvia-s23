#!/usr/bin/env python3
"""
Verify that Tower II Gates map marker displays a green tick '✓' when completed:
- Before completion: icon is '🏛️', marker is active (not .is-done).
- After completion: icon is '✓', marker has .is-done (green border, mint tick), label has '✓'.
"""

import http.server
import socketserver
import threading
import os
import time
from playwright.sync_api import sync_playwright

PORT = 8930
WEB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../web'))

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)
    def log_message(self, *args): pass

def main():
    socketserver.TCPServer.allow_reuse_address = True
    server = socketserver.TCPServer(('127.0.0.1', PORT), H)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    time.sleep(0.4)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        # 1. TEST PENDING (NOT COMPLETED): Temple icon
        print("--- Testing Gates marker before completion ---")
        page.goto(f'http://127.0.0.1:{PORT}/index.html')
        page.wait_for_function('() => typeof window.getNextDesertNodeId === "function"', timeout=10000)

        page.evaluate('''() => {
            localStorage.setItem('the_eclipse_active_seeker', 'Silvia');
            localStorage.setItem('order_oasis_clepsydra_completed', 'true');
            localStorage.setItem('order_desert_lexicon_completed', 'true');
            localStorage.setItem('order_whispering_chasm_completed', 'true');
            localStorage.setItem('order_salt_playa_completed', 'true');
            localStorage.setItem('order_cairn1_completed', 'true');
            localStorage.removeItem('order_gates_scene_completed');
            if (window.Desert3D && window.Desert3D.refresh) window.Desert3D.refresh();
        }''')
        page.wait_for_timeout(1500)

        marker_pending = page.evaluate('''() => {
            const el = [...document.querySelectorAll('.d3-marker')].find(m => {
                const label = m.querySelector('.d3-label');
                return label && label.textContent.includes('TOWER II · THE GATES');
            });
            if (!el) return null;
            const pin = el.querySelector('.d3-pin');
            return {
                isDone: el.classList.contains('is-done'),
                pinText: pin ? pin.textContent.trim() : null,
                labelText: el.querySelector('.d3-label').textContent.trim()
            };
        }''')
        print("Marker pending state:", marker_pending)
        assert marker_pending is not None, "Gates marker should exist"
        assert not marker_pending['isDone'], "Marker should not be .is-done when incomplete"
        assert marker_pending['pinText'] == '🏛️', f"Expected '🏛️', got {marker_pending['pinText']}"
        print("✅ Pending marker verified: displays 🏛️ with gold border.")

        # 2. TEST COMPLETED: Green tick '✓'
        print("\n--- Testing Gates marker AFTER completion ---")
        page.evaluate('''() => {
            localStorage.setItem('order_gates_scene_completed', 'true');
            if (window.Desert3D && window.Desert3D.refresh) window.Desert3D.refresh();
        }''')
        page.wait_for_timeout(1500)

        marker_done = page.evaluate('''() => {
            const el = [...document.querySelectorAll('.d3-marker')].find(m => {
                const label = m.querySelector('.d3-label');
                return label && label.textContent.includes('TOWER II · THE GATES');
            });
            if (!el) return null;
            const pin = el.querySelector('.d3-pin');
            return {
                isDone: el.classList.contains('is-done'),
                pinText: pin ? pin.textContent.trim() : null,
                labelText: el.querySelector('.d3-label').textContent.trim()
            };
        }''')
        print("Marker done state:", marker_done)
        assert marker_done is not None, "Gates marker should exist"
        assert marker_done['isDone'], "Marker MUST have .is-done when completed"
        assert marker_done['pinText'] == '✓', f"Expected '✓', got {marker_done['pinText']}"
        assert '✓' in marker_done['labelText'], "Label MUST start with '✓'"

        # Take screenshot of the map centered on Tower II Gates
        screenshot_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'tower2_gates_map_tick.png'))
        page.screenshot(path=screenshot_path)
        print("📸 Screenshot captured to:", screenshot_path)
        print("✅ Completed marker verified: displays '✓' with green border like all other stations!")

        browser.close()
    server.shutdown()
    print("\n🎉 ALL CHECKS PASSED!")

if __name__ == '__main__':
    main()

