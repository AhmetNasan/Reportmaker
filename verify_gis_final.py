import os
import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        path = os.path.abspath("index.html")
        page.goto(f"file://{path}")

        page.evaluate("""
            currentUser = { email: 'admin@qbc.qa', id: '123' };
            isAdmin = true;
            isApproved = true;
            onAuthenticated();
            showPage('map');
            initMap();
            // Ensure the page is active and visible
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById('page-map').classList.add('active');
            document.getElementById('page-map').style.display = 'block';
        """)

        time.sleep(3) # Wait for Leaflet to render tiles

        page.screenshot(path="verification/gis_final_layout.png")
        print("Captured: verification/gis_final_layout.png")

        sidebar = page.query_selector(".gis-sidebar")
        if sidebar:
            sidebar.screenshot(path="verification/gis_final_sidebar.png")
            print("Captured: verification/gis_final_sidebar.png")

        browser.close()

if __name__ == "__main__":
    if not os.path.exists("verification"):
        os.makedirs("verification")
    run()
