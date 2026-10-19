const puppeteer = require('puppeteer-core');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_PATH = 'C:\\Users\\fib\\.gemini\\antigravity\\brain\\6b72b25f-c0d7-4a2c-880a-5608c6604d9b\\test_qa_light_verify.png';

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: EDGE_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 2 });
    
    await page.goto('http://localhost:3000/?preview=true&view=quality&theme=light&quarter=Q4&week=1&section=mohammed_dlshad', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await new Promise(r => setTimeout(r, 4000));

    await page.evaluate(() => {
      window.scrollTo(0, 450);
    });

    await new Promise(r => setTimeout(r, 1000));

    await page.screenshot({ path: OUT_PATH });
    console.log('Light verify saved to:', OUT_PATH);
    await browser.close();
  } catch (err) {
    console.error('Error during capture:', err);
    process.exit(1);
  }
})();
