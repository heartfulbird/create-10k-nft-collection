require('dotenv').config();

// FIX of "ALERT about incoming connection":
// https://github.com/puppeteer/puppeteer/issues/4752
// NOTE:
// Maybe you don't need the Certificate and anyway it requires "login" or "admin" pass and session owner pass didn't work even if it is Admin...
// try simplified version WITHOUT Certificate:
// sudo codesign --force --sign - ./node_modules/puppeteer/.local-chromium/mac-961656/chrome-mac/Chromium.app --deep

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const CHAIN = process.env.CHAIN;

async function txnCheck(url) {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    const session = await page.target().createCDPSession();
    const {windowId} = await session.send('Browser.getWindowForTarget');
    await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'minimized'}});

    try {
      await page.goto(url);

      // console.log('CHAIN: ', CHAIN)
      console.log('Waiting when the selector loaded to a page body...')

      await page.waitForSelector("#ContentPlaceHolder1_maintable");

      let cardText = '';

      if (CHAIN === 'polygon') {
        cardText = await page.$eval("#ContentPlaceHolder1_maintable .row:nth-child(3) div:nth-child(2)", (text) => text.textContent);
      } else if (CHAIN === 'goerli') {
        // finds "Status:Success"
        // cardText = await page.$eval("#ContentPlaceHolder1_maintable .row:nth-child(4)", (text) => text.textContent);

        // finds "Success"
        cardText = await page.$eval("#ContentPlaceHolder1_maintable .row:nth-child(4) div:nth-child(2)", (text) => text.textContent);
      } else {
        console.log("Unknown CHAIN!");
      }

      await browser.close();

      // console.log('Data found on a page:')
      console.log(cardText)
      // console.log('Check if Data posted above')

      resolve(cardText);
    } catch (error) {
      await browser.close();
      resolve("Unknown");
    }
  });
}

module.exports = { txnCheck };

// TODO:
// Edition #1000: Transaction success!
//   All transactions checked.
//   Unknown Txn Count: 31
// Unknown Txns:
// 225,226,227,228,229,230,
// 235,236,237,238,239,240,
// 625,626,627,628,629,630,
// 820,821,822,823,824,825,826,827,828,829,830,831,832
// There are some unknown transaction statuses'.
