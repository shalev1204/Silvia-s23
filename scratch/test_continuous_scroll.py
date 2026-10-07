import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    file_path = os.path.abspath("web/constellation/celestial-cipher/index.html")
    url = f"file://{file_path}?preview=1"

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            headless=True
        )
        page = await browser.new_page(viewport={"width": 1280, "height": 900})
        
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text}") if msg.type == "error" else None)

        print(f"Loading {url}...")
        await page.goto(url)
        await page.wait_for_timeout(1000)

        # 1. Verify all 4 chapters are displayed (not display:none)
        for i in range(1, 5):
            chap = page.locator(f"#chapter-{i}")
            is_visible = await chap.is_visible()
            print(f"Chapter {i} visible: {is_visible}")
            assert is_visible, f"Chapter {i} should be visible in continuous scroll"

        # 2. Check initial active step
        step1_class = await page.locator("#step-1").get_attribute("class")
        print(f"Step 1 initial class: {step1_class}")
        assert "active" in step1_class

        # 3. Test clicking Step 3
        print("Clicking Step 3 button...")
        await page.locator("#step-3").click()
        await page.wait_for_timeout(1000)

        step3_class = await page.locator("#step-3").get_attribute("class")
        print(f"Step 3 class after click: {step3_class}")
        assert "active" in step3_class

        # 4. Scroll down to chapter 4
        print("Scrolling down to Chapter 4...")
        await page.locator("#chapter-4").scroll_into_view_if_needed()
        await page.wait_for_timeout(800)

        step4_class = await page.locator("#step-4").get_attribute("class")
        print(f"Step 4 class after scrolling to ch4: {step4_class}")
        assert "active" in step4_class

        # 5. Check beacon revealed when on chapter 4
        beacon = page.locator("#distant-beacon-emitter")
        beacon_class = await beacon.get_attribute("class")
        print(f"Beacon class in Chapter 4: {beacon_class}")
        assert "beacon-revealed" in beacon_class

        # 6. Test transmit button at end of Chapter 4
        print("Clicking Transmit Vow button...")
        await page.locator("#btn-transmit-story").click()
        await page.wait_for_timeout(1200)

        climax_modal = page.locator("#climax-modal")
        modal_class = await climax_modal.get_attribute("class")
        print(f"Climax modal class after transmit: {modal_class}")
        assert "modal-open" in modal_class

        print("Testing complete! Errors:", errors)
        assert len(errors) == 0, f"Encountered page errors: {errors}"
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
