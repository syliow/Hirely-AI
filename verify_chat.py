from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        print("Navigating to http://localhost:3000")
        page.goto("http://localhost:3000", timeout=60000)

        # Click the chat FAB button
        print("Clicking chat FAB")
        page.click('#hirely-fab')

        # Wait for chat window
        print("Waiting for chat window")
        page.wait_for_selector('h3:has-text("Hirely AI Advisor")')

        # Type in input
        print("Typing in input")
        page.fill('input[placeholder="Ask for career prep advice..."]', "Hello world")

        # Take screenshot
        print("Taking screenshot")
        page.screenshot(path="verification_chat.png")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
