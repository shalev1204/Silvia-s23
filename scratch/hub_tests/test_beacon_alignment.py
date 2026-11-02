import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            headless=True
        )
        page = await browser.new_page(viewport={"width": 1400, "height": 900})
        
        await page.add_init_script("""
            localStorage.setItem('the_eclipse_active_seeker', 'Carles');
            localStorage.setItem('seeker_carles_midnight_completed', 'true');
        """)

        await page.goto("http://localhost:8080/constellation/celestial-cipher/index.html")
        await page.wait_for_selector("#novel-page", timeout=5000)

        # Click Tab 4 (#step-4)
        await page.click("#step-4")
        await asyncio.sleep(1.0)

        # Check beacon element
        beacon = page.locator('#distant-beacon-emitter')
        box = await beacon.bounding_box()
        print(f"Beacon bounding box: {box}")

        if box:
            clip_box = {
                "x": max(0, box["x"] - 60),
                "y": max(0, box["y"] - 220),
                "width": box["width"] + 120,
                "height": box["height"] + 240
            }
            await page.screenshot(path="scratch/beacon_closeup.png", clip=clip_box)
            print("Captured closeup successfully!")

        await page.screenshot(path="scratch/beacon_chapter4_viewport.png")
        print("Captured viewport successfully!")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
