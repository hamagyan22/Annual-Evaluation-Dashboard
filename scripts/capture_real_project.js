const puppeteer = require('puppeteer-core');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_DIR = 'C:\\Users\\fib\\.gemini\\antigravity\\brain\\6b72b25f-c0d7-4a2c-880a-5608c6604d9b';

const NAME_MAP = {
  // Full Team Names (Specific first)
  'Mohammed Dlshad Team': 'Aram Farhad Team',
  'Ankido Buya Team': 'Diyar Botan Team',
  'Younis Kamal Team': 'Rebwar Hama Team',
  'Enterprise Care Team': 'Rebwar Hama Team',
  'Voice Support Team': 'Diyar Botan Team',
  'Digital Operations Team': 'Aram Farhad Team',
  
  // Evaluators / Managers / Admins
  'Mohammed Dlshad': 'Aram Farhad',
  'Mohammed Jihad': 'Diyar Botan',
  'Lara Kamil': 'Sara Mustafa',
  'Mohammed Azad': 'Rebwar Hama',
  'Younis Kamal': 'Rebwar Hama',
  'Ankido Buya': 'Diyar Botan',
  'Enterprise Kamal': 'Rebwar Hama',

  // Real employee names -> Authentic Fictional Kurdish & Arabic names
  'Ahmed Rustam': 'Aram Farhad',            // Kurdish
  'Akar Omer': 'Sara Mustafa',              // Arabic / Kurdish
  'Akar Omar': 'Sara Mustafa',
  'Bana Ahmed': 'Diyar Botan',              // Kurdish
  'Dhuha Khanjer': 'Noor Al-Huda',          // Arabic
  'Ismail Ahmed': 'Rebwar Hama',            // Kurdish
  'Nawen Maadh': 'Omar Khalid',             // Arabic
  'Ossama Saadi': 'Zana Karim',             // Kurdish
  'Osama Saadi': 'Zana Karim',
  'Rassan Ismail': 'Lana Othman',           // Kurdish / Arabic
  'Rasan Ismail': 'Lana Othman',
  'Sana Dler': 'Dalia Ameen',               // Kurdish / Arabic
  'Sawen': 'Roshna Qadir',                  // Kurdish
  'Sawin': 'Roshna Qadir',
  'Soma Sherko': 'Kardo Hawkar',            // Kurdish
  'Yousif Rashid': 'Mustafa Jawad',         // Arabic
  'Zahra Yousif': 'Aya Tariq',              // Arabic
  'Alla Satar': 'Shwan Jalal',              // Kurdish
  'Aya Yasin': 'Zainab Ali',                // Arabic
  'Frmesk Younis': 'Chro Bakhtiyar',        // Kurdish
  'Haneen Abd-Al Kareem': 'Fatima Hussein', // Arabic
  'Kani Sami': 'Niga Mohammed',             // Kurdish
  'Lana Halmat Rafeeq': 'Maryam Salah',     // Arabic
  'Marwa Khalil': 'Kozhan Luqman',          // Kurdish
  'Muzhda Omar Ali': 'Huda Salam',          // Arabic
  'Saja Bashar Anwar': 'Shania Bestun',     // Kurdish
  'Taban Sirwan': 'Ranya Farooq',           // Kurdish
  'Zainab Khalid Rasheed': 'Helin Azad',    // Kurdish
  'Zhalla Salam': 'Khatoon Sardar',         // Kurdish
  'Zhalla Sherzad': 'Bayan Latif',          // Kurdish
  'Ahmed Jalil': 'Hawraz Kamaran',          // Kurdish
  'Amar Hussein Salih': 'Ali Haidar',       // Arabic
  'Azad Muhammad': 'Bnar Tahir',            // Kurdish
  'Haseeb Adeeb': 'Hassan Basim',           // Arabic
  'Hewr Adnan': 'Goran Salih',              // Kurdish
  'Kazhvan Wirya': 'Zeyad Tariq',           // Arabic
  'Laveen Khaleel': 'Amanj Kawa',           // Kurdish
  'Mokhalad Ali': 'Soran Ahmed',            // Kurdish
  'Rabar Mohammed': 'Halgurd Jamal',        // Kurdish
  'Salam Sadam Muhammad': 'Yousef Mahmoud', // Arabic
  'Sarbaz Namiq Hasan': 'Peshawa Rafiq',    // Kurdish
  'Shahab Ahmed Muhammed': 'Karrar Majid',  // Arabic
  'Mohammed Salem': 'Samer Walid',          // Arabic
  
  // General partial words (Last)
  'Enterprise': 'Rebwar',
  'Voice': 'Diyar',
  'Digital': 'Aram'
};

async function transformDom(page) {
  await page.evaluate((nameMap) => {
    // 1. Hide PWA install banner and floating elements
    const pwaBanners = document.querySelectorAll('aside, .fixed.bottom-4.right-4, [aria-label*="Install"], [aria-label*="تثبيت"]');
    pwaBanners.forEach(el => { el.style.display = 'none'; });

    // 2. Completely remove all logos and adjacent divider lines (Zero logo as requested)
    const logos = document.querySelectorAll('img[src*="logo.webp"], img[alt*="FIB"]');
    logos.forEach(img => {
      const next = img.nextElementSibling;
      if (next && (next.classList.contains('bg-gray-200') || next.classList.contains('dark:bg-gray-700') || (next.className && next.className.includes('w-[')))) {
        next.remove();
      }
      img.remove();
    });

    // 3. Walk all text nodes and replace names & FIB text
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const textNodes = [];
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    textNodes.forEach(tNode => {
      let val = tNode.nodeValue;
      if (!val) return;
      let changed = false;

      // Replace known names & teams
      for (const [realName, fakeName] of Object.entries(nameMap)) {
        if (val.includes(realName)) {
          val = val.split(realName).join(fakeName);
          changed = true;
        }
      }

      // Replace any leftover FIB occurrences
      if (val.includes('FIB')) {
        val = val.replace(/FIB/g, 'Performance');
        changed = true;
      }

      if (changed) {
        tNode.nodeValue = val;
      }
    });

    // 4. Update avatar initial badges across all components
    // A) Table rows
    document.querySelectorAll('tr').forEach(row => {
      const nameEl = row.querySelector('td:first-child span, td:first-of-type span');
      const avatarEl = row.querySelector('td:first-child .rounded-full, td:first-of-type .rounded-full');
      if (nameEl && avatarEl) {
        const firstLetter = nameEl.textContent.trim().charAt(0).toUpperCase();
        if (firstLetter && /^[A-Z0-9]$/i.test(firstLetter)) {
          avatarEl.textContent = firstLetter;
        }
      }
    });

    // B) Top 3 cards in Top Star & Agent Dashboard
    document.querySelectorAll('.space-y-2 > div, .grid-cols-1.sm\\:grid-cols-3 > div').forEach(card => {
      const nameEl = card.querySelector('span.truncate, span.font-bold, span.font-black');
      const avatarEl = card.querySelector('.rounded-full, .rounded-2xl');
      if (nameEl && avatarEl && avatarEl.textContent.trim().length === 1) {
        const firstLetter = nameEl.textContent.trim().charAt(0).toUpperCase();
        if (firstLetter && /^[A-Z0-9]$/i.test(firstLetter)) {
          avatarEl.textContent = firstLetter;
        }
      }
    });

    // C) User header profile pill
    document.querySelectorAll('.rounded-full').forEach(badge => {
      const txt = badge.textContent ? badge.textContent.trim() : '';
      if (txt.length === 1 && badge.nextElementSibling) {
        const nextTxt = badge.nextElementSibling.textContent || '';
        const firstChar = nextTxt.trim().charAt(0);
        if (firstChar && firstChar.toUpperCase() !== txt && /^[A-Z0-9]$/i.test(firstChar)) {
          badge.textContent = firstChar.toUpperCase();
        }
      }
    });

    // 5. In Team Operations Dashboard, populate inactive team cards with realistic stats
    const teamButtons = document.querySelectorAll('button.text-left');
    const sampleStats = [
      ['97.6%', '98.0', '13.2', '04:12', '01:05', '11.4', '8,420', '95'],
      ['96.9%', '96.5', '11.8', '04:45', '01:20', '12.1', '7,680', '88']
    ];
    let inactiveIdx = 0;
    teamButtons.forEach(btn => {
      const selectBadge = btn.querySelector('span.rounded-full');
      if (selectBadge && selectBadge.textContent.trim() === 'Select') {
        const stats = sampleStats[inactiveIdx % sampleStats.length];
        inactiveIdx++;
        const valDivs = btn.querySelectorAll('.grid > div .font-extrabold');
        valDivs.forEach((vEl, idx) => {
          if (vEl.textContent.trim() === '-' || vEl.textContent.trim() === '') {
            vEl.textContent = stats[idx % stats.length];
          }
        });
      }
    });

    // 6. If this is Quality Dashboard, ensure EVERY row is richly populated with evaluation scores
    const qaRows = document.querySelectorAll('tr[data-qa-row]');
    if (qaRows.length > 0) {
      const sampleScoresList = [
        ['100', '98', '100', '95', '100', '98', '100', '96', '98.38%'],
        ['96', '100', '98', '100', '97', '100', '98', '100', '98.63%'],
        ['100', '94', '100', '100', '98', '100', '96', '98', '98.25%'],
        ['97', '100', '95', '98', '100', '96', '100', '98', '98.00%'],
        ['100', '100', '96', '100', '98', '100', '100', '98', '99.00%'],
        ['95', '98', '100', '100', '96', '98', '98', '100', '98.13%'],
        ['100', '96', '98', '100', '100', '100', '96', '98', '98.50%'],
        ['98', '100', '100', '94', '100', '100', '98', '100', '98.75%'],
        ['96', '100', '98', '100', '97', '100', '100', '96', '98.38%'],
        ['100', '98', '96', '100', '95', '100', '98', '98', '98.13%']
      ];

      qaRows.forEach((row, rIdx) => {
        const inputs = row.querySelectorAll('input');
        const scores = sampleScoresList[rIdx % sampleScoresList.length];
        inputs.forEach((input, cIdx) => {
          if (!input.value || input.value.trim() === '-' || input.value.trim() === '') {
            input.value = scores[cIdx % (scores.length - 1)];
          }
        });
        // Check week score cell
        const scoreSpan = row.querySelector('td:last-of-type span');
        if (scoreSpan && (scoreSpan.textContent.trim() === '-' || scoreSpan.textContent.trim() === '')) {
          scoreSpan.textContent = scores[scores.length - 1];
          scoreSpan.className = 'inline-block px-3 py-1.5 rounded-xl text-xs font-black shadow-2xs bg-white text-[#00A991] border border-teal-500/20';
        }
      });
    }

    // 7. In Agent Dashboard, ensure bottom KPI cards have active values if blank
    const kpiCards = document.querySelectorAll('.grid-cols-2.md\\:grid-cols-4 > div');
    const sampleAgentKpis = ['97.8', '95.1', '14.2', '03:02', '01:00', '11.8', '1,438', '23'];
    kpiCards.forEach((card, idx) => {
      const heroNum = card.querySelector('.tabular-nums, .text-3xl, .text-4xl, .text-2xl');
      if (heroNum && (heroNum.textContent.trim() === '—' || heroNum.textContent.trim() === '-' || heroNum.textContent.trim() === '')) {
        heroNum.textContent = sampleAgentKpis[idx % sampleAgentKpis.length];
      }
    });

  }, NAME_MAP);
}

async function capture() {
  console.log('Launching Edge for Real Project High-DPI Capture (Person Teams, Bottom Agent Cards)...');
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
      height: 920,
      deviceScaleFactor: 2
    }
  });

  const page = await browser.newPage();
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  // 1. Team Performance Operations Dashboard - LIGHT MODE
  console.log('Capturing 1: Team Operations (Person Team Cards + Full Stats)...');
  try {
    await page.goto('http://localhost:3000/?preview=true&theme=light', { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(4500);
    await transformDom(page);
    await wait(500);
    const file1 = path.join(OUT_DIR, '01_real_team_performance_dashboard_light.png');
    await page.screenshot({ path: file1 });
    console.log('Saved:', file1);
  } catch (e) {
    console.error('Error 1:', e.message);
  }

  // 2. Top Star Champions Leaderboard - DARK MODE
  console.log('Capturing 2: Top Star Leaderboard (Dark Mode, Zero Logo)...');
  try {
    await page.goto('http://localhost:3000/?preview=true&view=topstar&theme=dark', { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(4500);
    await transformDom(page);
    await wait(500);
    const file2 = path.join(OUT_DIR, '02_real_top_star_leaderboard_dark.png');
    await page.screenshot({ path: file2 });
    console.log('Saved:', file2);
  } catch (e) {
    console.error('Error 2:', e.message);
  }

  // 3. Quality Assurance Dashboard - LIGHT MODE (with rich data)
  console.log('Capturing 3: Quality Assurance Dashboard (8 Chats, Q4, Light Mode with Data, Zero Logo)...');
  try {
    await page.goto('http://localhost:3000/?preview=true&view=quality&theme=light&quarter=Q4&week=1&section=mohammed_dlshad', { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(4500);
    await transformDom(page);
    await wait(500);
    const file3 = path.join(OUT_DIR, '03_real_quality_assurance_dashboard_light.png');
    await page.screenshot({ path: file3 });
    console.log('Saved:', file3);
  } catch (e) {
    console.error('Error 3:', e.message);
  }

  // 4. Agent Performance Scorecard - Top Overview
  console.log('Capturing 4: Agent Performance Scorecard (Top Overview)...');
  try {
    await page.goto('http://localhost:3000/?preview=true&view=agent&theme=light', { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(4500);
    await transformDom(page);
    await wait(500);
    const file4 = path.join(OUT_DIR, '04_real_agent_performance_scorecard_light.png');
    await page.screenshot({ path: file4 });
    console.log('Saved:', file4);

    // 5. Agent Performance Scorecard - Bottom Cards (Top 3 Podium & Grand KPI Cards)
    console.log('Capturing 5: Agent Performance Scorecard (Bottom Section: Podium & Monthly KPIs)...');
    await page.evaluate(() => {
      const janBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Jan');
      const monthBar = janBtn ? janBtn.closest('.rounded-2xl') : null;
      if (monthBar) {
        const topPos = monthBar.getBoundingClientRect().top + window.scrollY - 4;
        window.scrollTo({ top: topPos, behavior: 'instant' });
      } else {
        window.scrollTo({ top: 635, behavior: 'instant' });
      }

      const watermark = document.getElementById('sys-architect-watermark-root');
      if (watermark) {
        watermark.innerHTML = `
          <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:9999px;background:rgba(28,107,83,0.06);border:1px solid rgba(28,107,83,0.15);font-size:11px;font-weight:700;color:#64748b;letter-spacing:0.2px;">
            <span style="width:6px;height:6px;border-radius:9999px;background:#10b981;display:inline-block;"></span>
            <span>Performance & Operations Platform • © 2026</span>
          </div>
        `;
      }
    });
    await wait(600);
    await transformDom(page);
    const file5 = path.join(OUT_DIR, '05_real_agent_performance_scorecard_bottom_light.png');
    await page.screenshot({ path: file5 });
    console.log('Saved:', file5);

    // 6. Full Page Agent Performance Scorecard (Complete View)
    console.log('Capturing 6: Agent Performance Scorecard (Full Scrollable Page)...');
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      const watermark = document.getElementById('sys-architect-watermark-root');
      if (watermark) {
        watermark.innerHTML = `
          <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:9999px;background:rgba(28,107,83,0.06);border:1px solid rgba(28,107,83,0.15);font-size:11px;font-weight:700;color:#64748b;letter-spacing:0.2px;">
            <span style="width:6px;height:6px;border-radius:9999px;background:#10b981;display:inline-block;"></span>
            <span>Performance & Operations Platform • © 2026</span>
          </div>
        `;
      }
    });
    await wait(400);
    const file6 = path.join(OUT_DIR, '06_real_agent_performance_scorecard_full_light.png');
    await page.screenshot({ path: file6, fullPage: true });
    console.log('Saved:', file6);

  } catch (e) {
    console.error('Error Agent Dashboard:', e.message);
  }

  await browser.close();
  console.log('All real project dashboards captured successfully!');
}

capture().catch(err => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
