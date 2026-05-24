import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Load the local index.html
        file_path = "file://" + os.path.abspath("index.html")
        await page.goto(file_path)

        # Bypass Auth (clicking Sign In with default creds)
        await page.click("button:has-text('Sign In')")
        await page.wait_for_selector("nav", state="visible")

        # Check GIS Mapping Page
        await page.click("button:has-text('GIS Mapping')")
        await page.wait_for_selector("#map", state="visible")

        # Verify Map Overlay Position (right: 60px)
        overlay = await page.query_selector(".map-overlay")
        style = await overlay.evaluate("el => window.getComputedStyle(el).right")
        print(f"Map Overlay Right: {style}")

        # Check Settings Page for CSV and Template
        await page.click("button:has-text('Settings')")
        await page.wait_for_selector(".upload-card", state="visible")

        template_btn = await page.query_selector("button:has-text('Template')")
        if template_btn:
            print("CSV Template button found.")

        csv_input = await page.query_selector("input[accept='.csv']")
        if csv_input:
            print("CSV file input found.")

        # Screenshot
        await page.screenshot(path="verification.png")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
