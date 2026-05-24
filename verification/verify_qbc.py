import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        file_path = "file://" + os.path.abspath("index.html")
        await page.goto(file_path)

        # Bypass Auth
        await page.click("button:has-text('Sign In')")
        await page.wait_for_selector("nav", state="visible")

        # Screenshot Dashboard
        await page.screenshot(path="verification/dashboard.png")

        # Screenshot GIS Page (Verify right-side controls and info card)
        await page.click("button:has-text('GIS Mapping')")
        await page.wait_for_selector("#map", state="visible")
        # Click on map to show info panel
        await page.mouse.click(400, 300)
        await asyncio.sleep(0.5)
        await page.screenshot(path="verification/gis_mapping.png")

        # Screenshot Settings (Verify CSV tools)
        await page.click("button:has-text('Settings')")
        await page.wait_for_selector(".upload-card", state="visible")
        await page.screenshot(path="verification/settings.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
