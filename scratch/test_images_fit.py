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
        
        print(f"Loading {url}...")
        await page.goto(url)
        await page.wait_for_timeout(1500)

        # 1. Plate I (Aurelia at Work)
        plate1 = page.locator(".illuminated-plate-figure").nth(0)
        await plate1.scroll_into_view_if_needed()
        await page.wait_for_timeout(600)
        await page.screenshot(path="scratch/fit_plate1.png")
        box1 = await plate1.bounding_box()
        img1 = plate1.locator("img")
        img_box1 = await img1.bounding_box()
        print(f"Plate 1 Box: {box1}, Img Box: {img_box1}")

        # 2. Plate II (Cataclysm Bridge)
        plate2 = page.locator(".illuminated-plate-figure").nth(1)
        await plate2.scroll_into_view_if_needed()
        await page.wait_for_timeout(600)
        await page.screenshot(path="scratch/fit_plate2.png")
        box2 = await plate2.bounding_box()
        img2 = plate2.locator("img")
        img_box2 = await img2.bounding_box()
        print(f"Plate 2 Box: {box2}, Img Box: {img_box2}")

        # 3. Plate III (Cartographer young expedition)
        plate3 = page.locator(".illuminated-plate-figure").nth(2)
        await plate3.scroll_into_view_if_needed()
        await page.wait_for_timeout(600)
        await page.screenshot(path="scratch/fit_plate3.png")
        box3 = await plate3.bounding_box()
        img3 = plate3.locator("img")
        img_box3 = await img3.bounding_box()
        print(f"Plate 3 Box: {box3}, Img Box: {img_box3}")

        # 4. Plate IV (Distant Light Precipice)
        plate4 = page.locator(".illuminated-plate-figure").nth(3)
        await plate4.scroll_into_view_if_needed()
        await page.wait_for_timeout(600)
        await page.screenshot(path="scratch/fit_plate4.png")
        box4 = await plate4.bounding_box()
        img4 = plate4.locator("img")
        img_box4 = await img4.bounding_box()
        print(f"Plate 4 Box: {box4}, Img Box: {img_box4}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
