import os
import time
from playwright.sync_api import sync_playwright

def run_verification():
    filepath = "file://" + os.path.abspath("index.html")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # Log console errors
        page.on("console", lambda msg: print(f"CONSOLE: {msg.type}: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

        print(f"Loading {filepath}...")
        page.goto(filepath)

        # Bypass Auth
        print("Bypassing Auth...")
        page.fill("#auth-email", "admin@qbc.qa")
        page.fill("#auth-password", "qbc2025")
        page.click("button:has-text('Sign In')")

        # Wait for Navigation to appear
        page.wait_for_selector("nav", state="visible", timeout=15000)
        print("Navigated successfully.")

        # Check GIS Mapping Page
        print("Checking GIS Mapping...")
        page.click("button.nav-tab:has-text('GIS Mapping')")
        page.wait_for_selector("#map", state="visible", timeout=15000)

        # Verify GPX text
        import_btn = page.query_selector("label:has-text('Import KML/KMZ/GPX')")
        if import_btn:
            print("Verified: GPX support text found.")
        else:
            print("ERROR: GPX support text NOT found.")

        # Check for search box
        search_box = page.query_selector("#map-search-input")
        if search_box:
            print("Verified: Coordinate Search Box found.")

        # Check for Satellite button
        sat_btn = page.query_selector("button:has-text('Satellite')")
        if sat_btn:
            print("Verified: Satellite View button found.")

        # Check Settings Page for Admin Panel
        print("Checking Settings...")
        page.click("button.nav-tab:has-text('Settings')")
        time.sleep(1) # Wait for page switch animation

        admin_panel = page.query_selector("#admin-panel")
        if admin_panel and admin_panel.is_visible():
            print("Verified: Admin Panel is visible for admin user.")
        else:
            # Maybe it needs a moment
            page.wait_for_selector("#admin-panel", state="visible", timeout=5000)
            print("Verified: Admin Panel is visible after wait.")

        page.screenshot(path="verification/final_verify.png", full_page=True)
        print("Screenshot saved to verification/final_verify.png")

        browser.close()

if __name__ == "__main__":
    run_verification()
