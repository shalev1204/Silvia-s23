import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            headless=True
        )
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        
        page.on("console", lambda msg: print(f"PAGE CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))
        
        await page.goto("http://localhost:8080/constellation/celestial-cipher/index.html")
        await asyncio.sleep(2)
        
        title = await page.title()
        print(f"Title: {title}")
        
        el_count = await page.evaluate("() => document.querySelectorAll('#novel-page').length")
        print(f"#novel-page count: {el_count}")
        
        box = await page.evaluate("() => { const el = document.getElementById('novel-page'); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }")
        print(f"Bounding rect: {box}")

        await page.screenshot(path="scratch/page_debug.png")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
