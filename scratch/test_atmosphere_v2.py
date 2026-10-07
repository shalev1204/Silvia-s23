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
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text}") if msg.type == "error" else None)

        print(f"Loading {url}...")
        await page.goto(url)
        await page.wait_for_timeout(1500)

        # Capture Chapter 1
        print("Capturing Chapter 1 screenshot...")
        await page.screenshot(path="scratch/v2_ch1.png")

        # Click Chapter 2
        print("Jumping to Chapter 2...")
        await page.locator("#step-2").click()
        await page.wait_for_timeout(1800)
        await page.screenshot(path="scratch/v2_ch2.png")

        # Click Chapter 3
        print("Jumping to Chapter 3...")
        await page.locator("#step-3").click()
        await page.wait_for_timeout(1800)
        await page.screenshot(path="scratch/v2_ch3.png")

        # Click Chapter 4
        print("Jumping to Chapter 4...")
        await page.locator("#step-4").click()
        await page.wait_for_timeout(1800)
        await page.screenshot(path="scratch/v2_ch4.png")

        print("Screenshots taken successfully!")
        print("Errors encountered:", errors)
        assert len(errors) == 0, f"Errors: {errors}"
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
