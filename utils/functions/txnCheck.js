// TODO: better alternative? without pages parsing?
//       layout can be changed any time

// ALERT about incomming connections fix:
// https://github.com/puppeteer/puppeteer/issues/4752

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
      let cardText = await page.$eval("#ContentPlaceHolder1_maintable .row:nth-child(3) div:nth-child(2)", (text) => text.textContent);
      await browser.close();

      console.log('Data found on a page:')
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
