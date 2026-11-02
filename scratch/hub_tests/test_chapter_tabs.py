import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            headless=True
        )
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        
        await page.add_init_script("""
            localStorage.setItem('the_eclipse_active_seeker', 'Carles');
            localStorage.setItem('seeker_carles_midnight_completed', 'true');
        """)
        
        await page.goto("http://localhost:8080/constellation/celestial-cipher/index.html")
        await page.wait_for_selector("#novel-page")
        
        # 1. Chapter I default state
        assert await page.is_visible("#chapter-1"), "Chapter 1 should be visible"
        assert not await page.is_visible("#chapter-2"), "Chapter 2 should be hidden"
        assert not await page.is_visible("#chapter-3"), "Chapter 3 should be hidden"
        assert not await page.is_visible("#chapter-4"), "Chapter 4 should be hidden"
        
        step1_active = await page.evaluate("() => document.getElementById('step-1').classList.contains('active')")
        body_theme_1 = await page.evaluate("() => document.body.classList.contains('theme-chapter-1')")
        assert step1_active, "Tab 1 should be active"
        assert body_theme_1, "Body should have theme-chapter-1"
        print("✓ Chapter 1 default state verified")
        await page.screenshot(path="scratch/chapter_1_view.png", full_page=False)

        # 2. Click Tab 2 (The Cataclysm)
        await page.click("#step-2")
        await asyncio.sleep(0.5)
        assert not await page.is_visible("#chapter-1"), "Chapter 1 should now be hidden"
        assert await page.is_visible("#chapter-2"), "Chapter 2 should now be visible"
        step2_active = await page.evaluate("() => document.getElementById('step-2').classList.contains('active')")
        body_theme_2 = await page.evaluate("() => document.body.classList.contains('theme-chapter-2')")
        assert step2_active, "Tab 2 should be active"
        assert body_theme_2, "Body should have theme-chapter-2"
        print("✓ Tab 2 click and Chapter 2 view verified")
        await page.screenshot(path="scratch/chapter_2_view.png", full_page=False)

        # 3. Click Next button inside Chapter 2 -> Chapter 3
        next_btn_2 = await page.query_selector("#chapter-2 .btn-chapter-next")
        await next_btn_2.click()
        await asyncio.sleep(0.5)
        assert await page.is_visible("#chapter-3"), "Chapter 3 should now be visible"
        assert not await page.is_visible("#chapter-2"), "Chapter 2 should now be hidden"
        step3_active = await page.evaluate("() => document.getElementById('step-3').classList.contains('active')")
        body_theme_3 = await page.evaluate("() => document.body.classList.contains('theme-chapter-3')")
        assert step3_active, "Tab 3 should be active"
        assert body_theme_3, "Body should have theme-chapter-3"
        print("✓ Next button to Chapter 3 verified")
        await page.screenshot(path="scratch/chapter_3_view.png", full_page=False)

        # 4. Click Next button inside Chapter 3 -> Chapter 4
        next_btn_3 = await page.query_selector("#chapter-3 .btn-chapter-next")
        await next_btn_3.click()
        await asyncio.sleep(0.5)
        assert await page.is_visible("#chapter-4"), "Chapter 4 should now be visible"
        assert not await page.is_visible("#chapter-3"), "Chapter 3 should now be hidden"
        step4_active = await page.evaluate("() => document.getElementById('step-4').classList.contains('active')")
        body_theme_4 = await page.evaluate("() => document.body.classList.contains('theme-chapter-4')")
        beacon_revealed = await page.evaluate("() => document.getElementById('distant-beacon-emitter').classList.contains('beacon-revealed')")
        transmit_btn_visible = await page.is_visible("#btn-transmit-story")
        assert step4_active, "Tab 4 should be active"
        assert body_theme_4, "Body should have theme-chapter-4"
        assert beacon_revealed, "Distant beacon should be revealed in Chapter 4"
        assert transmit_btn_visible, "Transmit radio button should be visible in Chapter 4"
        print("✓ Next button to Chapter 4 & beacon & transmit button verified")
        await page.screenshot(path="scratch/chapter_4_view.png", full_page=False)

        # 5. Click Previous button inside Chapter 4 -> Chapter 3
        prev_btn_4 = await page.query_selector("#chapter-4 .btn-chapter-prev")
        await prev_btn_4.click()
        await asyncio.sleep(0.5)
        assert await page.is_visible("#chapter-3"), "Chapter 3 should be visible again"
        print("✓ Prev button back to Chapter 3 verified")

        # 6. Click Tab 1 back
        await page.click("#step-1")
        await asyncio.sleep(0.5)
        assert await page.is_visible("#chapter-1"), "Chapter 1 should be visible again"
        print("✓ Tab 1 jump back verified")

        await browser.close()
        print("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(main())
