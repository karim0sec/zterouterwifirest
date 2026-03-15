#!/usr/bin/env python3
import asyncio
import os
from dotenv import load_dotenv
from playwright.async_api import async_playwright

load_dotenv()

ROUTER_URL = os.getenv("ROUTER_URL")
USERNAME = os.getenv("USERNAME")
PASSWORD = os.getenv("PASSWORD")


async def main():
    print("[*] Starting browser...")

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            slow_mo=0,
            args=[
                "--disable-gpu",
                "--ignore-certificate-errors",
                "--disable-background-networking",
                "--disable-default-apps",
                "--disable-sync",
                "--disable-translate",
                "--no-first-run",
                "--single-process",
                "--no-zygote",
                "--disable-features=TranslateUI",
                "--disable-ipc-flooding-protection",
                "--disable-renderer-backgrounding",
                "--disable-background-timer-throttling",
                "--disable-backgrounding-occluded-windows",
                "--disable-client-side-phishing-detection",
                "--disable-crash-reporter",
                "--disable-oopr-debug-crash-dump",
                "--no-crash-upload",
                "--disable-low-res-tiling",
                "--log-level=3",
                "--silent",
            ],
        )
        context = await browser.new_context(
            ignore_https_errors=True,
            viewport={"width": 640, "height": 480},
        )

        page = await context.new_page()
        page.set_default_timeout(10000)

        print("[*] Navigating to router...")
        await page.goto(ROUTER_URL, wait_until="domcontentloaded", timeout=15000)

        print("[*] Logging in...")
        try:
            await page.fill(
                'input[type="text"], input[name="username"], input[id="username"]',
                USERNAME,
                timeout=3000,
            )
        except:
            pass

        try:
            await page.fill(
                'input[type="password"], input[name="password"], input[id="password"]',
                PASSWORD,
                timeout=3000,
            )
        except:
            pass

        try:
            await page.click(
                'button[type="submit"], input[type="submit"], button:has-text("Login")',
                timeout=3000,
            )
        except:
            pass

        await page.wait_for_timeout(2000)
        print("[*] Logged in")

        print("[*] Clicking Local Network...")
        for selector in [
            'a:has-text("Local Network")',
            'span:has-text("Local Network")',
            'div:has-text("Local Network")',
            "text=Local Network",
        ]:
            try:
                await page.click(selector, timeout=2000)
                break
            except:
                continue

        await page.wait_for_timeout(500)

        print("[*] Clicking WLAN...")
        for selector in [
            'a:has-text("WLAN")',
            'span:has-text("WLAN")',
            'div:has-text("WLAN")',
            "text=WLAN",
        ]:
            try:
                await page.click(selector, timeout=2000)
                break
            except:
                continue

        await page.wait_for_timeout(1000)

        print("[*] Turning OFF WLAN...")
        try:
            await page.click("#RadioStatus1_0", timeout=2000)
        except:
            await page.evaluate('document.querySelector("#RadioStatus1_0")?.click()')

        await page.wait_for_timeout(500)

        try:
            await page.click('button:has-text("Apply")', timeout=2000)
        except:
            try:
                await page.click('input[value="Apply"]', timeout=2000)
            except:
                pass

        print("[*] Waiting 2 seconds...")
        await page.wait_for_timeout(2000)

        print("[*] Refreshing...")
        await page.reload(wait_until="domcontentloaded", timeout=10000)
        await page.wait_for_timeout(1500)

        print("[*] Turning ON WLAN...")
        try:
            await page.click("#RadioStatus0_0", timeout=2000)
        except:
            await page.evaluate('document.querySelector("#RadioStatus0_0")?.click()')

        await page.wait_for_timeout(500)

        try:
            await page.click('button:has-text("Apply")', timeout=2000)
        except:
            try:
                await page.click('input[value="Apply"]', timeout=2000)
            except:
                pass

        await page.wait_for_timeout(1000)
        print("[*] Done!")

        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
