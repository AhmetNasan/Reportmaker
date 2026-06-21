import os
import time
from playwright.sync_api import sync_playwright

def verify_installation():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        file_path = "file://" + os.path.abspath("index.html")
        page.goto(file_path)

        # Give more time for the script block to be parsed completely
        time.sleep(10)

        # Log any console errors
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

        # Verify page functions exist on window object
        page.evaluate("() => { console.log('showPage type:', typeof window.showPage); }")

        page.evaluate("document.getElementById('main-nav').style.display = 'flex'")

        try:
            page.evaluate("window.showPage('installation')")
            time.sleep(1)
            page.screenshot(path="verify_final_inst_hub.png")

            page.evaluate("window.switchInstTab('map')")
            time.sleep(2)
            page.screenshot(path="verify_final_inst_map.png")

            page.evaluate("window.openCompletionModal('12345')")
            time.sleep(1)
            page.screenshot(path="verify_final_comp_modal.png")
        except Exception as e:
            print(f"Evaluation failed: {e}")
            # Take a screenshot of the state where it failed
            page.screenshot(path="verify_failed_state.png")

        browser.close()

if __name__ == "__main__":
    verify_installation()
