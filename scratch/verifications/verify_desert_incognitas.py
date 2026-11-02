import asyncio
import os
import sys
from playwright.async_api import async_playwright

async def verify_incognitas():
    file_path = os.path.abspath("web/index.html")
    file_url = f"file://{file_path}"
    print(f"Loading URL: {file_url}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="chrome")
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        # Step 1: Clean state (No completions)
        await page.goto(file_url)
        await page.evaluate("""() => {
            localStorage.clear();
            localStorage.setItem('order_active_map_path', 'desert');
        }""")
        await page.reload()
        await page.wait_for_selector("#desert-map-canvas-wrap", state="visible", timeout=10000)

        # Switch to desert map if not already visible
        await page.evaluate("() => window.switchMapPath('desert', true)")

        print("--- PHASE 1: Verify Initial Incógnitas (Only Station 10 Active) ---")
        st10_text = await page.locator("#chasm-node-banner-text").text_content()
        print(f"Station 10 Banner: {st10_text}")
        assert "THE WHISPERING CHASM" in st10_text, "Station 10 should be Whispering Chasm"

        st11_banner = await page.locator("#lexicon-node-banner-text").text_content()
        st11_icon = await page.locator("#lexicon-node-icon").text_content()
        st11_sub = await page.locator("#lexicon-node-subtext").text_content()
        print(f"Station 11 Banner: {st11_banner} | Icon: {st11_icon} | Subtext: {st11_sub}")
        assert "TERRA INCOGNITA" in st11_banner, "Station 11 must be TERRA INCOGNITA initially"
        assert st11_icon == "?", "Station 11 icon must be '?'"
        assert "LOCKED" in st11_sub, "Station 11 subtext must say LOCKED"

        st12_banner = await page.locator("#clepsydra-node-banner-text").text_content()
        st12_icon = await page.locator("#clepsydra-node-icon").text_content()
        print(f"Station 12 Banner: {st12_banner} | Icon: {st12_icon}")
        assert "TERRA INCOGNITA" in st12_banner, "Station 12 must be TERRA INCOGNITA"
        assert st12_icon == "?", "Station 12 icon must be '?'"

        st13_banner = await page.locator("#polybius-node-banner-text").text_content()
        st14_banner = await page.locator("#oracle-node-banner-text").text_content()
        print(f"Station 13 Banner: {st13_banner}")
        print(f"Station 14 Banner: {st14_banner}")
        assert "TERRA INCOGNITA" in st13_banner, "Station 13 must be TERRA INCOGNITA"
        assert "TERRA INCOGNITA" in st14_banner, "Station 14 must be TERRA INCOGNITA"

        # Click Station 11 when locked: modal must NOT open, toast must show
        await page.locator("#node-lexicon-trigger").click()
        await page.wait_for_timeout(300)
        is_modal_visible = await page.locator("#modal-desert-lexicon").is_visible()
        print(f"Station 11 Modal Open Attempt: is_visible = {is_modal_visible}")
        assert not is_modal_visible, "Modal must NOT open when Station 11 is locked"

        toast_text = await page.locator("#desert-toast-banner").text_content()
        print(f"Toast Feedback: {toast_text}")
        assert "TERRA INCOGNITA" in toast_text, "Toast must display TERRA INCOGNITA warning"

        insp_badge = await page.locator("#insp-badge").text_content()
        print(f"Inspector Badge: {insp_badge}")
        assert "TERRA INCOGNITA" in insp_badge, "Inspector badge must show TERRA INCOGNITA"

        print("--- PHASE 2: Complete Station 10 (Whispering Chasm) -> Unlocks Station 11 ---")
        await page.evaluate("""() => {
            localStorage.setItem('order_whispering_chasm_completed', 'true');
            window.updateDesertMapMarkers();
            window.selectMapNode(11, false);
        }""")
        await page.wait_for_timeout(300)

        st11_banner_unlocked = await page.locator("#lexicon-node-banner-text").text_content()
        st11_icon_unlocked = await page.locator("#lexicon-node-icon").text_content()
        print(f"Unlocked Station 11 Banner: {st11_banner_unlocked} | Icon: {st11_icon_unlocked}")
        assert "THE DESERT LEXICON & AL-QIBLA" in st11_banner_unlocked, "Station 11 title must be revealed"
        assert st11_icon_unlocked == "🌴", "Station 11 icon must be palm tree"

        # Station 12 must STILL be TERRA INCOGNITA
        st12_banner_still_locked = await page.locator("#clepsydra-node-banner-text").text_content()
        print(f"Station 12 still locked: {st12_banner_still_locked}")
        assert "TERRA INCOGNITA" in st12_banner_still_locked, "Station 12 must remain TERRA INCOGNITA"

        # Clicking Station 11 now opens the modal
        await page.locator("#node-lexicon-trigger").click()
        await page.wait_for_timeout(400)
        is_modal_open_now = await page.locator("#modal-desert-lexicon").is_visible()
        print(f"Station 11 Modal after unlock: is_visible = {is_modal_open_now}")
        assert is_modal_open_now, "Modal MUST open now that Station 11 is unlocked"

        # Close modal
        await page.locator("#btn-close-lexicon").click()
        await page.wait_for_timeout(300)

        print("--- PHASE 3: Complete Station 11 (Desert Lexicon) -> Unlocks Station 12 ---")
        await page.evaluate("""() => {
            localStorage.setItem('order_desert_lexicon_completed', 'true');
            window.updateDesertMapMarkers();
            window.selectMapNode(12, false);
        }""")
        await page.wait_for_timeout(300)

        st12_banner_unlocked = await page.locator("#clepsydra-node-banner-text").text_content()
        st12_icon_unlocked = await page.locator("#clepsydra-node-icon").text_content()
        print(f"Unlocked Station 12 Banner: {st12_banner_unlocked} | Icon: {st12_icon_unlocked}")
        assert "THE OASIS CLEPSYDRA (4 WELLS)" in st12_banner_unlocked, "Station 12 title must be revealed"
        assert st12_icon_unlocked == "⏳", "Station 12 icon must be hourglass"

        # Station 13 must STILL be TERRA INCOGNITA
        st13_banner_still_locked = await page.locator("#polybius-node-banner-text").text_content()
        print(f"Station 13 still locked: {st13_banner_still_locked}")
        assert "TERRA INCOGNITA" in st13_banner_still_locked, "Station 13 must remain TERRA INCOGNITA"

        print("ALL INCOGNITA VERIFICATION TESTS PASSED SUCCESSFULLY! ✦")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_incognitas())
