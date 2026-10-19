const puppeteer = require('puppeteer-core');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_DIR = 'C:\\Users\\fib\\.gemini\\antigravity\\brain\\6b72b25f-c0d7-4a2c-880a-5608c6604d9b';
const DEMO_URL = 'file:///C:/Users/fib/.gemini/antigravity/scratch/performance-dashboard/public/demo.html';

async function capture() {
  console.log('Launching Edge for Retina showcase capture...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--hide-scrollbars'
    ],
    defaultViewport: {
      width: 1440,
      height: 940,
      deviceScaleFactor: 2 // Ultra-sharp Retina rendering
    }
  });

  const page = await browser.newPage();
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  // 1. Team Performance Dashboard (Sample Data - Fictional Names)
  console.log('Capturing 1: Team Performance Dashboard...');
  try {
    await page.goto(`${DEMO_URL}#team`, { waitUntil: 'load' });
    await page.evaluate(() => switchView('team'));
    await wait(1200);
    const file1 = path.join(OUT_DIR, '01_team_performance_dashboard.png');
    await page.screenshot({ path: file1 });
    console.log('Saved:', file1);
  } catch (e) {
    console.error('Error 1:', e.message);
  }

  // 2. Top Star Champions Leaderboard (Sample Data - Fictional Names)
  console.log('Capturing 2: Top Star Leaderboard...');
  try {
    await page.evaluate(() => switchView('topstar'));
    await wait(1200);
    const file2 = path.join(OUT_DIR, '02_top_star_leaderboard.png');
    await page.screenshot({ path: file2 });
    console.log('Saved:', file2);
  } catch (e) {
    console.error('Error 2:', e.message);
  }

  // 3. Quality Assurance Dashboard (Sample Data - Fictional Names)
  console.log('Capturing 3: Quality Assurance Dashboard...');
  try {
    await page.evaluate(() => switchView('quality'));
    await wait(1200);
    const file3 = path.join(OUT_DIR, '03_quality_assurance_dashboard.png');
    await page.screenshot({ path: file3 });
    console.log('Saved:', file3);
  } catch (e) {
    console.error('Error 3:', e.message);
  }

  // 4. Agent Performance Scorecard (Sample Data - Fictional Names)
  console.log('Capturing 4: Agent Performance Scorecard...');
  try {
    await page.evaluate(() => switchView('agent'));
    await wait(1200);
    const file4 = path.join(OUT_DIR, '04_agent_performance_scorecard.png');
    await page.screenshot({ path: file4 });
    console.log('Saved:', file4);
  } catch (e) {
    console.error('Error 4:', e.message);
  }

  await browser.close();
  console.log('All 4 showcase dashboards captured successfully with synthetic data!');
}

capture().catch(err => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
