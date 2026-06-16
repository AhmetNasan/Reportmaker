import asyncio
from playwright.async_api import async_playwright
import os

async def run_verification():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Load the file
        filepath = "file://" + os.path.abspath("index.html")
        await page.goto(filepath)

        # Bypass Auth
        await page.evaluate("""() => {
            currentUser = { id: 'test-user', email: 'ahmetnasan1993@gmail.com', user_metadata: { full_name: 'Test Admin' } };
            isAdmin = true;
            isApproved = true;
            userRole = 'Administrator';
            allData = [
                { WorkOrder: 'WO1', Status: 'COMP', Lat: 25.3, Lng: 51.5, Description: 'Test 1', isSentToFab: true, FabStatus: 'Fabricating' },
                { WorkOrder: 'WO2', Status: 'INPRG', Lat: 25.4, Lng: 51.6, Description: 'Test 2', isSentToFab: true, FabStatus: 'Done' }
            ];
            onAuthenticated();
        }""")

        await page.wait_for_timeout(2000)

        # Verify Dashboard Map
        is_dash_map_visible = await page.is_visible('#dashMap')
        print(f"Dashboard Map visible: {is_dash_map_visible}")
        await page.screenshot(path="dashboard_map.png")

        # Navigate to Work Orders
        await page.click("text=Work Orders")
        await page.wait_for_timeout(1000)

        # Check for Filter Search Input
        await page.wait_for_selector('.th-search-input')
        search_inputs = await page.query_selector_all('.th-search-input')
        print(f"Number of search inputs: {len(search_inputs)}")

        # Test focus persistence
        first_search = search_inputs[0]
        await first_search.focus()
        await first_search.type("WO1")
        is_focused = await page.evaluate("() => document.activeElement.className === 'th-search-input'")
        print(f"Focus preserved after typing: {is_focused}")

        # Test Multi-select filter
        # Open first filter dropdown
        await page.click('.th-filter-dropdown-btn')
        await page.wait_for_selector('.th-filter-dropdown-content.show')
        print("Filter dropdown opened")

        # Verify Manufacturing
        await page.click("text=Manufacturing")
        await page.wait_for_timeout(1000)
        await page.screenshot(path="manufacturing_page.png")

        # Check sub-tabs
        active_tab_text = await page.inner_text('#mfg-tab-active')
        print(f"Active Tab label: {active_tab_text}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_verification())
