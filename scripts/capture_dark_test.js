const puppeteer = require('puppeteer-core');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_PATH = 'C:\\Users\\fib\\.gemini\\antigravity\\brain\\6b72b25f-c0d7-4a2c-880a-5608c6604d9b\\test_qa_dark_fixed.png';

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: EDGE_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 950, deviceScaleFactor: 2 });
    
    console.log('Navigating to QA Dark Mode...');
    await page.goto('http://localhost:3000/?preview=true&view=quality&theme=dark&quarter=Q4&week=1&section=mohammed_dlshad', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await new Promise(r => setTimeout(r, 4000));

    // Fill sample scores to see the table fully alive
    await page.evaluate(() => {
      const rows = document.querySelectorAll('tbody tr');
      rows.forEach((tr, rIdx) => {
        const inputs = tr.querySelectorAll('input[type="text"]');
        const scores = [98, 100, 100, 95, 100, 100, 100, 100];
        inputs.forEach((inp, cIdx) => {
          const val = scores[cIdx % scores.length];
          inp.value = String(val);
          inp.dispatchEvent(new Event('input', { bubbles: true }));
        });
      });
    });

    await new Promise(r => setTimeout(r, 1000));

    await page.screenshot({ path: OUT_PATH });
    console.log('Screenshot saved to:', OUT_PATH);
    await browser.close();
  } catch (err) {
    console.error('Error during capture:', err);
    process.exit(1);
  }
})();
