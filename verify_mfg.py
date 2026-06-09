
import asyncio
from playwright.async_api import async_playwright
import os

async def verify_mfg_alignment():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        # Load the app
        await page.goto(f'file://{os.getcwd()}/index.html')

        # Setup mock data and auth state
        await page.evaluate("""() => {
            window.currentUser = { email: 'ahmetnasan1993@gmail.com' };
            window.isAdmin = true;
            window.allData = [
                {
                    WorkOrder: 'WO-MFG-001',
                    Description: 'Test Alignment',
                    Status: 'INPRG',
                    PWA_ENG: 'Eng. John',
                    Location: 'Doha',
                    TargetStart: '2024-01-01',
                    TargetFinish: '2024-01-31',
                    RoadCatg: 'R1',
                    SignMaterial: 'Alum',
                    SignType: 'Warning',
                    SignRef: 'W1',
                    SignShape: 'Triangle',
                    SignSize: '600',
                    SignQty: '5',
                    PostType: 'Steel',
                    PostHeight: '3000',
                    PostQty: '2',
                    FoundSize: '400x400',
                    FoundQty: '2',
                    FabStatus: 'Ongoing',
                    InstallationDate: '2024-01-15',
                    FabDetails: 'Perfect',
                    Lat: 25, Lng: 51
                }
            ];
            // Mocking these to prevent errors
            window.photos = {};
            window.currentTheme = 'light';

            // Bypass filter logic and force render
            window.filteredFabData = window.allData;
            showPage('manufacturing');
            renderManufacturingTable();
        }""")

        await page.wait_for_selector('#mfgBody tr:not(.loading-row)')

        # Count columns in thead and tbody
        thead_cols = await page.evaluate("""() => {
            // This is tricky because of rowspans and colspans.
            // Let's just count the leaf headers in the visual order.
            // Actually, let's just check the tbody row.
            const row = document.querySelector('#mfgBody tr');
            return row.cells.length;
        }""")

        row_content = await page.evaluate("""() => {
            const row = document.querySelector('#mfgBody tr');
            return Array.from(row.cells).map(c => c.innerText.trim());
        }""")

        print(f"Tbody Column Count: {thead_cols}")
        for i, val in enumerate(row_content):
            print(f"Col {i+1}: {val}")

        await page.screenshot(path='mfg_debug.png')
        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_mfg_alignment())
