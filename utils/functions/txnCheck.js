// TODO: better alternative? without pages parsing?
//       layout can be changed any time

// ALERT about incomming connections fix:
// https://github.com/puppeteer/puppeteer/issues/4752
// Maybe you dont need the Certificate and anyway it requires login or admin pass and my own pass doesn't work even ifI'm an Admin...
// try:
// sudo codesign --force --sign - ./node_modules/puppeteer/.local-chromium/mac-961656/chrome-mac/Chromium.app --deep

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

async function txnCheck(url) {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    const session = await page.target().createCDPSession();
    const {windowId} = await session.send('Browser.getWindowForTarget');
    await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'minimized'}});
    await page.goto(url);

    console.log('Waiting when the selector loaded to a page body...')

    await page.waitForSelector("#ContentPlaceHolder1_maintable");

    try {
      // stopped working
      // let cardText = await page.$eval("#ContentPlaceHolder1_maintable .row:nth-child(3) div:nth-child(2)", (text) => text.textContent);

      // finds "Status:Success"
      // let cardText = await page.$eval("#ContentPlaceHolder1_maintable .row:nth-child(4)", (text) => text.textContent);

      // finds "Success"
      let cardText = await page.$eval("#ContentPlaceHolder1_maintable .row:nth-child(4) div:nth-child(2)", (text) => text.textContent);

      await browser.close();

      console.log('Data found on a page:')
      console.log(cardText)
      console.log(cardText)
      console.log(cardText)
      console.log('check if it posted the data above')

      resolve(cardText);
    } catch (error) {
      await browser.close();
      resolve("Unknown");
    }
  });
}

module.exports = { txnCheck };
