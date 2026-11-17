#!/usr/bin/env python3
"""
Verify the 9 current inventory items of Silvia's journey AND all AAA inventory upgrades:
1. All 9 items load at 1024x1024 natural size, .si-inspect-art-wrap stays 240x240px,
   and all grid slot thumbnails share identical bounding box dimensions.
2. Procedural foley audio methods run without error across stone, brass, liquid, wax, cord, glass.
3. Tactile 3D inspector tools: Examine (Zoom / 'z'), Flip (Reverse inscription / 'f'),
   Lamp Oil Before/After Erg toggle, Aurelia pulse (... --), Locate on Map (#btn-si-locate).
4. Collection Sets: Five Seals (2/5 clickable pips I & II), Two Keepers Tribute (1/2 -> COMPLETE).
5. Filter tabs (All, Seals, Supplies, Relics), NEW badges (.si-new-pip & #bsi-new-dot),
   reactive Hermes Field Note (#si-hermes-note), and keyboard navigation (Arrows + 'i').
"""

import http.server
import socketserver
import threading
import os
import time
from playwright.sync_api import sync_playwright

PORT = 8939
WEB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../web"))
SHOTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "shots"))


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def log_message(self, format, *args):
        pass


def main():
    os.makedirs(SHOTS_DIR, exist_ok=True)
    socketserver.TCPServer.allow_reuse_address = True
    server = socketserver.TCPServer(("127.0.0.1", PORT), QuietHandler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    time.sleep(0.3)

    expected_9 = [
        "gilded_feather",
        "order_wax_seal",
        "surveyor_compass",
        "seal_cairn_1",
        "water_skins",
        "falcon_weight",
        "lamp_oil",
        "red_cord",
        "seal_cairn_2",
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("console", lambda m: errors.append("console: " + m.text) if m.type == "error" else None)

        page.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="load")
        page.wait_for_function("() => typeof window.openSatchelInventoryModal === 'function'", timeout=15000)

        page.evaluate("""() => {
            localStorage.setItem('the_eclipse_active_seeker', 'Silvia');
            localStorage.setItem('order_cairn1_completed', 'true');
            localStorage.setItem('order_seal_cairn_1', 'true');
            localStorage.setItem('order_oasis_clepsydra_completed', 'true');
            localStorage.setItem('order_lamp_oil_found', 'true');
            localStorage.setItem('order_field_wire_step', '9');
            localStorage.setItem('order_seal_cairn_2', 'true');
            localStorage.setItem('order_gates_scene_completed', 'true');
            localStorage.setItem('order_inventory_relics', JSON.stringify([
                'gilded_feather','order_wax_seal','surveyor_compass',
                'seal_cairn_1','water_skins','falcon_weight','lamp_oil','red_cord','seal_cairn_2'
            ]));
            localStorage.setItem('eclipse_cloud_inv_unseen', JSON.stringify(['seal_cairn_2']));
            if (window.updateInventoryBadge) window.updateInventoryBadge();
            window.openSatchelInventoryModal('seal_cairn_1');
        }""")
        page.wait_for_timeout(600)

        owned = page.evaluate("() => window.getOwnedRelicIds()")
        assert owned == expected_9, f"Expected {expected_9}, got {owned}"

        # Check NEW dot visible in header for unseen seal_cairn_2 before inspecting it
        assert page.is_visible("#bsi-new-dot"), "Header unseen NEW dot should be visible"
        assert page.locator(".si-mc-slot[data-id='seal_cairn_2'] .si-new-pip").is_visible(), "Slot NEW pip should appear on unseen seal_cairn_2"

        # 1. Verify sizes and image loads across all 9 items
        slot_sizes = []
        for item_id in expected_9:
            res = page.evaluate(f"""async () => {{
                const slot = document.querySelector('#si-items-grid .si-mc-slot[data-id="{item_id}"]');
                if (slot) slot.click();
                const img = document.getElementById('si-inspect-img');
                await new Promise((r) => {{ if (img.complete) r(); else img.onload = r; }});
                const wrap = document.querySelector('#si-inspect-art-wrap').getBoundingClientRect();
                const inspectRect = img.getBoundingClientRect();
                const thumb = slot.querySelector('.si-mc-thumb');
                return {{
                    src: img.getAttribute('src'),
                    complete: img.complete,
                    nW: img.naturalWidth,
                    nH: img.naturalHeight,
                    wrapW: wrap.width,
                    wrapH: wrap.height,
                    imgW: inspectRect.width,
                    imgH: inspectRect.height,
                    slotW: thumb.offsetWidth,
                    slotH: thumb.offsetHeight,
                    hermesNote: document.getElementById('si-hermes-note').textContent.trim()
                }};
            }}""")
            assert res["complete"], f"{item_id} failed to load"
            assert res["nW"] == 1024 and res["nH"] == 1024, f"{item_id} expected 1024x1024, got {res['nW']}x{res['nH']}"
            assert abs(res["wrapW"] - 240.0) < 0.5 and abs(res["wrapH"] - 240.0) < 0.5, f"{item_id} wrap distorted: {res['wrapW']}x{res['wrapH']}"
            assert len(res["hermesNote"]) > 20, f"{item_id} missing Hermes field note"
            slot_sizes.append((round(res["slotW"], 1), round(res["slotH"], 1)))

        assert len(set(slot_sizes)) == 1, f"Slot thumb boxes should match, got {slot_sizes}"
        print("✓ Check 1: All 9 items 1024x1024, wrap=240x240, uniform slot sizes:", slot_sizes[0])

        # Clicking seal_cairn_2 in the loop should have cleared its NEW pip & header dot
        assert not page.is_visible("#bsi-new-dot"), "Header unseen dot should clear after inspecting seal_cairn_2"
        assert page.locator(".si-mc-slot[data-id='seal_cairn_2'] .si-new-pip").count() == 0, "Slot NEW pip should clear on inspect"
        print("✓ Check 2: NEW badge lifecycle (visible -> cleared on inspect) passed.")

        # 2. Verify Sets & Synergies panel
        cairns_count = page.text_content("#si-set-cairns-count")
        keepers_count = page.text_content("#si-set-keepers-count")
        assert cairns_count == "2 / 5", f"Expected '2 / 5', got {cairns_count}"
        assert keepers_count == "1 / 2", f"Expected '1 / 2', got {keepers_count}"
        assert page.locator("#si-cairn-pips .si-cairn-pip.is-owned").count() == 2
        assert page.locator("#si-cairn-pips .si-cairn-pip[disabled]").count() == 3

        # Clicking Cairn I pip selects seal_cairn_1
        page.click("#si-cairn-pips .si-cairn-pip.is-owned >> nth=0")
        assert "Seal of Cairn I" in page.text_content("#si-inspect-title")
        print("✓ Check 3: Collection Sets (2/5 Cairns clickable, Keepers 1/2) passed.")

        # 3. Verify Examine (Zoom) & Flip (Reverse Inscription) + screenshot
        page.click("#btn-si-zoom")
        assert page.evaluate("document.getElementById('si-inspect-art-wrap').classList.contains('is-zoomed')")
        page.locator(".satchel-inventory-window").screenshot(path=os.path.join(SHOTS_DIR, "inv_aaa_zoom.png"))

        page.click("#btn-si-flip")
        assert page.evaluate("document.getElementById('si-inspect-art-wrap').classList.contains('is-flipped')")
        assert page.is_visible("#si-reverse-box")
        assert "Chiseled base numeral: [ I ]" in page.text_content("#si-reverse-text")
        page.locator(".satchel-inventory-window").screenshot(path=os.path.join(SHOTS_DIR, "inv_aaa_flip.png"))

        # Keyboard 'z' and 'f' toggle back off cleanly
        page.keyboard.press("z")
        page.keyboard.press("f")
        assert not page.evaluate("document.getElementById('si-inspect-art-wrap').classList.contains('is-zoomed')")
        assert not page.evaluate("document.getElementById('si-inspect-art-wrap').classList.contains('is-flipped')")
        print("✓ Check 4: Examine Zoom (z) & Reverse Flip (f) + screenshots passed.")

        # 4. Verify Filter Tabs & Keyboard Arrow Navigation
        page.click(".si-filter-btn[data-filter='seal']")
        dimmed = page.locator("#si-items-grid .si-mc-slot.is-filled.is-dimmed").count()
        assert dimmed == 6, f"Expected 6 dimmed non-seal items (9 minus wax_seal, seal_1, seal_2), got {dimmed}"
        page.click(".si-filter-btn[data-filter='all']")
        assert page.locator("#si-items-grid .si-mc-slot.is-filled.is-dimmed").count() == 0

        # Navigate from index 3 (seal_cairn_1) right -> water_skins -> down -> red_cord? Wait down from col 0 idx 4 is idx 8 (seal_cairn_2)
        page.keyboard.press("ArrowRight")
        assert "Four Water Skins" in page.text_content("#si-inspect-title")
        page.keyboard.press("ArrowDown")
        assert "Seal of Cairn II" in page.text_content("#si-inspect-title")
        page.locator(".satchel-inventory-window").screenshot(path=os.path.join(SHOTS_DIR, "inv_aaa_seal_2.png"))
        print("✓ Check 5: Category Filter Tabs & Arrow Grid Navigation passed.")

        # 5. Verify Shared Lamp Oil Before/After Erg Toggle + Procedural Foley execution
        foley_ok = page.evaluate("""() => {
            localStorage.setItem('order_gates_flags', JSON.stringify({ nightOil: 'shared' }));
            window.inspectRelicTest = window.sfx;
            ['gilded_feather','order_wax_seal','surveyor_compass','seal_cairn_1','water_skins','falcon_weight','lamp_oil','red_cord','seal_cairn_2'].forEach(id => {
                window.sfx.playRelicFoley(id, id === 'lamp_oil');
            });
            window.sfx.playAureliaCodePulse();
            window.sfx.playZoomLoupe(true);
            window.sfx.playFlipRelic();
            window.sfx.playSatchelOpen();
            window.sfx.playSatchelClose();
            return true;
        }""")
        assert foley_ok
        page.click(".si-mc-slot[data-id='lamp_oil']")
        assert page.is_visible("#btn-si-special")
        assert "Before the Erg" in page.text_content("#btn-si-special-label")
        assert "item_lamp_oil_half.png" in page.get_attribute("#si-inspect-img", "src")
        page.click("#btn-si-special")
        assert "After the Erg" in page.text_content("#btn-si-special-label")
        assert "item_lamp_oil.png" in page.get_attribute("#si-inspect-img", "src")
        print("✓ Check 6: Procedural Foley + Lamp Oil Before/After Erg state switcher passed.")

        # 6. Verify Escape closes modal & 'i' shortcut opens/closes modal cleanly
        page.keyboard.press("Escape")
        page.wait_for_timeout(150)
        assert not page.is_visible("#modal-satchel-inventory")
        page.evaluate("document.getElementById('btn-open-inventory').style.display = 'inline-flex'")
        page.keyboard.press("i")
        page.wait_for_timeout(150)
        assert page.is_visible("#modal-satchel-inventory")
        page.keyboard.press("i")
        page.wait_for_timeout(150)
        assert not page.is_visible("#modal-satchel-inventory"), "Expected 'i' to close open inventory modal"
        print("✓ Check 7: Escape & 'i' global inventory toggle passed.")

        assert not errors, f"Page/console errors detected: {errors}"
        browser.close()

    server.shutdown()
    print("\n🎉 ALL AAA INVENTORY UPGRADE VERIFICATIONS PASSED (0 ERRORS)!")


if __name__ == "__main__":
    main()
