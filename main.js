#!/usr/bin/env node
const puppeteer = require('puppeteer-core');
require('dotenv').config();

const ROUTER_URL = process.env.ROUTER_URL;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
const FIREFOX_PATH = process.env.FIREFOX_PATH;
const PROFILE_PATH = process.env.PROFILE_PATH;

async function main() {
    console.log("[*] Starting browser...");

    const browser = await puppeteer.launch({
        executablePath: FIREFOX_PATH,
        product: 'firefox',
        protocol: 'webDriverBiDi',
        headless: true,
        userDataDir: PROFILE_PATH,
        args: [
            '--no-sandbox',
            '--disable-gpu',
            '--disable-setuid-sandbox',
        ],
    // This is where the real optimization happens for Firefox
    extraPrefsFirefox: {
      // Limit content processes to save RAM (Ideal for 4GB RAM)
      'dom.ipc.processCount': 1,
      // Disable heavy UI features
      'browser.shell.checkDefaultBrowser': false,
      'datareporting.policy.dataSubmissionEnabled': false,
      'browser.bookmarks.restore_default_bookmarks': false,
      'network.http.speculative-parallel-limit': 0,
      // Security/Certificates
      'browser.xul.error_pages.expert_bad_cert': true,
      'security.cert_pinning.enforcement_level': 0,
      'security.ssl.enable_ocsp_stapling': false,
    },
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(10000);

    await page.setViewport({ width: 640, height: 480 });

    console.log("[*] Navigating to router...");
    await page.goto(ROUTER_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });

    console.log("[*] Logging in...");
    try {
        await page.focus('input[name="username"]').catch(async () => {
            await page.focus('input[type="text"]').catch(async () => {
                await page.focus('input[id="username"]');
            });
        });
        await page.keyboard.type(USERNAME);
    } catch (e) { }

    try {
        await page.focus('input[name="password"]').catch(async () => {
            await page.focus('input[type="password"]').catch(async () => {
                await page.focus('input[id="password"]');
            });
        });
        await page.keyboard.type(PASSWORD);
    } catch (e) { }

    try {
        await page.click('button[type="submit"]').catch(async () => {
            await page.click('input[type="submit"]').catch(async () => {
                await page.evaluate(() => {
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Login'));
                    if (btn) btn.click();
                });
            });
        });
    } catch (e) { }

    await new Promise(r => setTimeout(r, 10000));
    console.log("[*] Logged in");

    await new Promise(r => setTimeout(r, 10000));
    console.log("[*] Clicking Local Network...");
    try {
        await page.click('#mmLocalnet', { timeout: 4000 });
    } catch (e) { }

    await new Promise(r => setTimeout(r, 5000));

    console.log("[*] Clicking WLAN...");
    try {
        await page.click('#smLocalWLAN', { timeout: 2000 });
    } catch (e) { }

    await new Promise(r => setTimeout(r, 1000));

    console.log("[*] Turning OFF WLAN...");
    try {
        await page.click('#RadioStatus1_0', { timeout: 2000 });
    } catch (e) {
        await page.evaluate(() => document.querySelector('#RadioStatus1_0')?.click());
    }

    await new Promise(r => setTimeout(r, 500));

    try {
        await page.click('button:has-text("Apply")', { timeout: 2000 });
    } catch (e) {
        try {
            await page.click('input[value="Apply"]', { timeout: 2000 });
        } catch (e2) { }
    }

    console.log("[*] Waiting 2 seconds...");
    await new Promise(r => setTimeout(r, 2000));

       console.log("[*] Turning ON WLAN...");
    try {
        await page.click('#RadioStatus0_0', { timeout: 2000 });
    } catch (e) {
        await page.evaluate(() => document.querySelector('#RadioStatus0_0')?.click());
    }

    await new Promise(r => setTimeout(r, 500));

    try {
        await page.click('button:has-text("Apply")', { timeout: 2000 });
    } catch (e) {
        try {
            await page.click('input[value="Apply"]', { timeout: 2000 });
        } catch (e2) { }
    }

    await new Promise(r => setTimeout(r, 2000));
    console.log("[*] Done!");

    await browser.close();
}

main().catch(console.error);
