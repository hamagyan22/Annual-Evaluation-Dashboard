const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\fib\\.gemini\\antigravity\\brain\\6b72b25f-c0d7-4a2c-880a-5608c6604d9b';
const OUTPUT_PDF = path.join(ARTIFACT_DIR, 'Contact_Center_Performance_Platform_Carousel.pdf');

function getBase64Image(filename) {
  const filePath = path.join(ARTIFACT_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return '';
  }
  const data = fs.readFileSync(filePath);
  return `data:image/png;base64,${data.toString('base64')}`;
}

const img1 = getBase64Image('01_real_team_performance_dashboard_light.png');
const img2 = getBase64Image('02_real_top_star_leaderboard_dark.png');
const img3 = getBase64Image('03_real_quality_assurance_dashboard_light.png');
const img4 = getBase64Image('04_real_agent_performance_scorecard_light.png');
const img5 = getBase64Image('05_real_agent_performance_scorecard_bottom_light.png');

console.log('Images loaded. Compiling HTML template...');

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Contact Center Performance & Quality Platform</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #000;
      color: #111827;
      -webkit-font-smoothing: antialiased;
    }
    @page {
      size: 1920px 1080px;
      margin: 0;
    }
    .slide {
      width: 1920px;
      height: 1080px;
      page-break-after: always;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      padding: 55px 75px;
    }

    /* SLIDE 1 & 7: Dark Theme */
    .slide-dark {
      background: linear-gradient(135deg, #061712 0%, #0c231d 35%, #0a1726 100%);
      color: #f8fafc;
    }
    .slide-dark .glow-bg-1 {
      position: absolute;
      top: -150px;
      right: -150px;
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 70%);
      pointer-events: none;
    }
    .slide-dark .glow-bg-2 {
      position: absolute;
      bottom: -150px;
      left: -150px;
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, rgba(20, 184, 166, 0.14) 0%, transparent 70%);
      pointer-events: none;
    }

    /* SLIDE 4: Top Star Dark */
    .slide-topstar {
      background: #0B1320;
      color: #f8fafc;
    }

    /* SLIDE 2, 3, 5, 6: Warm Off-White Light */
    .slide-light {
      background: #F9F8F4;
      color: #0f172a;
    }

    /* Header component */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 25px;
      position: relative;
      z-index: 10;
    }
    .category-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .slide-light .category-badge {
      background: rgba(16, 102, 79, 0.08);
      color: #10664F;
      border: 1px solid rgba(16, 102, 79, 0.2);
    }
    .slide-dark .category-badge {
      background: rgba(16, 185, 129, 0.12);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }
    .slide-topstar .category-badge {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .slide-title {
      font-family: 'Outfit', sans-serif;
      font-size: 42px;
      font-weight: 900;
      letter-spacing: -0.8px;
      line-height: 1.15;
    }
    .slide-desc {
      font-size: 18px;
      font-weight: 500;
      margin-top: 8px;
      max-width: 1200px;
      line-height: 1.45;
    }
    .slide-light .slide-desc {
      color: #475569;
    }
    .slide-dark .slide-desc, .slide-topstar .slide-desc {
      color: #94a3b8;
    }
    .brand-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 18px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 800;
    }
    .slide-light .brand-pill {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      color: #1e293b;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .slide-dark .brand-pill, .slide-topstar .brand-pill {
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #f1f5f9;
    }

    /* Mockup Frame */
    .mock-frame {
      flex: 1;
      width: 100%;
      border-radius: 20px;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.18);
      background: #fff;
      margin-bottom: 25px;
    }
    .slide-dark .mock-frame, .slide-topstar .mock-frame {
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .slide-light .mock-frame {
      border: 1px solid #e2e8f0;
    }
    .mock-header {
      height: 38px;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    .slide-dark .mock-header, .slide-topstar .mock-header {
      background: #1e293b;
      border-bottom: 1px solid #334155;
    }
    .mock-dot {
      width: 11px;
      height: 11px;
      border-radius: 50%;
    }
    .dot-red { background: #ef4444; }
    .dot-yellow { background: #f59e0b; }
    .dot-green { background: #10b981; }
    .mock-address {
      margin-left: 14px;
      background: #ffffff;
      border-radius: 6px;
      padding: 3px 14px;
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      border: 1px solid #e2e8f0;
      width: 320px;
      text-align: center;
    }
    .slide-dark .mock-address, .slide-topstar .mock-address {
      background: #0f172a;
      color: #94a3b8;
      border: 1px solid #334155;
    }
    .mock-body {
      flex: 1;
      width: 100%;
      height: 100%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
    }
    .slide-dark .mock-body, .slide-topstar .mock-body {
      background: #0B1320;
    }
    .mock-body img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top;
      display: block;
    }

    /* Bottom Features Strip */
    .features-strip {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      z-index: 10;
    }
    .feature-card {
      padding: 16px 22px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .slide-light .feature-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }
    .slide-dark .feature-card, .slide-topstar .feature-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-blur: 10px;
    }
    .feature-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }
    .slide-light .feature-icon {
      background: rgba(16, 102, 79, 0.1);
      color: #10664F;
    }
    .slide-dark .feature-icon {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
    }
    .slide-topstar .feature-icon {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
    }
    .feature-text h4 {
      font-size: 16px;
      font-weight: 800;
      line-height: 1.25;
    }
    .slide-light .feature-text h4 { color: #0f172a; }
    .slide-dark .feature-text h4, .slide-topstar .feature-text h4 { color: #f8fafc; }
    .feature-text p {
      font-size: 13px;
      font-weight: 500;
      margin-top: 3px;
    }
    .slide-light .feature-text p { color: #64748b; }
    .slide-dark .feature-text p, .slide-topstar .feature-text p { color: #94a3b8; }

    /* Footer / Page Indicator */
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 18px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    .slide-light .slide-footer { color: #94a3b8; }
    .slide-dark .slide-footer, .slide-topstar .slide-footer { color: #64748b; }
    .page-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      margin-right: 8px;
    }

    /* COVER SLIDE SPECIAL STYLING */
    .cover-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      z-index: 10;
      max-width: 1450px;
    }
    .cover-title {
      font-family: 'Outfit', sans-serif;
      font-size: 72px;
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -1.5px;
      color: #ffffff;
      margin-bottom: 24px;
    }
    .cover-title span {
      background: linear-gradient(135deg, #34d399 0%, #10b981 60%, #059669 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .cover-lead {
      font-size: 24px;
      font-weight: 500;
      color: #cbd5e1;
      line-height: 1.5;
      max-width: 1100px;
      margin-bottom: 45px;
    }
    .cover-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-bottom: 50px;
    }
    .cover-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 30px;
      backdrop-filter: blur(12px);
    }
    .cover-card-icon {
      font-size: 32px;
      margin-bottom: 16px;
    }
    .cover-card h3 {
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 8px;
    }
    .cover-card p {
      font-size: 15px;
      font-weight: 500;
      color: #94a3b8;
      line-height: 1.5;
    }
    .tech-stack-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .tech-pill {
      padding: 8px 18px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #e2e8f0;
    }

    /* OUTRO SLIDE SPECIAL STYLING */
    .outro-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 28px;
      margin: 40px 0;
    }
    .outro-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 32px;
    }
    .outro-card h3 {
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .outro-card p {
      font-size: 16px;
      font-weight: 500;
      color: #94a3b8;
      line-height: 1.55;
    }
    .cta-banner {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(20, 184, 166, 0.1) 100%);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 22px;
      padding: 35px 45px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cta-text h2 {
      font-size: 26px;
      font-weight: 900;
      color: #ffffff;
    }
    .cta-text p {
      font-size: 16px;
      font-weight: 500;
      color: #a7f3d0;
      margin-top: 4px;
    }
    .cta-badge {
      padding: 14px 28px;
      border-radius: 14px;
      background: #10b981;
      color: #064e3b;
      font-weight: 900;
      font-size: 16px;
      box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
    }
  </style>
</head>
<body>

  <!-- ==================== SLIDE 1: COVER SLIDE ==================== -->
  <div class="slide slide-dark">
    <div class="glow-bg-1"></div>
    <div class="glow-bg-2"></div>
    
    <div class="header-bar">
      <div class="category-badge">⚡ Full-Stack Production Case Study</div>
      <div class="brand-pill">Architecture Showcase • 2026</div>
    </div>

    <div class="cover-content">
      <h1 class="cover-title">
        Contact Center Performance &amp;<br>
        <span>Quality Intelligence Platform</span>
      </h1>
      <p class="cover-lead">
        A real-time operational dashboard suite designed for high-velocity support centers — integrating live KPI monitoring, 8-chat quality assurance matrices, and automated gamified recognition.
      </p>

      <div class="cover-grid">
        <div class="cover-card">
          <div class="cover-card-icon">📊</div>
          <h3>Centralized KPI Oversight</h3>
          <p>Real-time productivity, AHT, ART, wrap-up &amp; trend deltas comparing current performance against prior baselines.</p>
        </div>
        <div class="cover-card">
          <div class="cover-card-icon">🎯</div>
          <h3>8-Chat QA Matrix Engine</h3>
          <p>Auditing system across 8 weekly evaluation cycles per agent with automated bonus formulas and audit compliance reports.</p>
        </div>
        <div class="cover-card">
          <div class="cover-card-icon">🏆</div>
          <h3>Top Star Champions Podium</h3>
          <p>5-star benchmark scoring algorithm recognizing top performers across Chat &amp; Call teams with celebration rankings.</p>
        </div>
      </div>

      <div class="tech-stack-row">
        <span class="tech-pill">Next.js 14</span>
        <span class="tech-pill">TypeScript</span>
        <span class="tech-pill">Firebase Firestore</span>
        <span class="tech-pill">Tailwind CSS</span>
        <span class="tech-pill">High-DPI Responsive</span>
      </div>
    </div>

    <div class="slide-footer">
      <div><span class="page-dot"></span>Slide 1 of 7 • Swipe to explore architecture</div>
      <div>Designed &amp; Engineered for High Performance Teams</div>
    </div>
  </div>

  <!-- ==================== SLIDE 2: TEAM OPERATIONS ==================== -->
  <div class="slide slide-light">
    <div class="header-bar">
      <div>
        <div class="category-badge">01 / Operations &amp; Team Leadership</div>
        <h2 class="slide-title">Team Performance Operations Dashboard</h2>
        <p class="slide-desc">Command center for Team Leaders &amp; Admins to monitor real-time monthly KPIs, trend deltas, and cross-team benchmarks.</p>
      </div>
      <div class="brand-pill">Light Mode • #F9F8F4</div>
    </div>

    <div class="mock-frame">
      <div class="mock-header">
        <div class="mock-dot dot-red"></div>
        <div class="mock-dot dot-yellow"></div>
        <div class="mock-dot dot-green"></div>
        <div class="mock-address">platform.internal/operations/team-performance</div>
      </div>
      <div class="mock-body">
        <img src="${img1}" alt="Team Performance Dashboard">
      </div>
    </div>

    <div class="features-strip">
      <div class="feature-card">
        <div class="feature-icon">📈</div>
        <div class="feature-text">
          <h4>Month-over-Month Deltas</h4>
          <p>Automated delta badges tracking shifts in productivity, handle times &amp; exam scores.</p>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <div class="feature-text">
          <h4>Spreadsheet Cell Navigation</h4>
          <p>Inline cell editing with keyboard arrows, real-time calculation &amp; auto-save.</p>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">👥</div>
        <div class="feature-text">
          <h4>Multi-Team CC Aggregation</h4>
          <p>One-click consolidation of multiple teams (Chat + Voice) into unified executive metrics.</p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div><span class="page-dot"></span>Slide 2 of 7</div>
      <div>Contact Center Performance Platform</div>
    </div>
  </div>

  <!-- ==================== SLIDE 3: QUALITY ASSURANCE ==================== -->
  <div class="slide slide-light">
    <div class="header-bar">
      <div>
        <div class="category-badge">02 / Quality Assurance (QA) Matrix</div>
        <h2 class="slide-title">8-Chat Multi-Month Quality Audit Engine</h2>
        <p class="slide-desc">Structured evaluation suite for QA managers to audit customer interactions across quarterly cycles with automated bonus rules.</p>
      </div>
      <div class="brand-pill">Light Mode • #F9F8F4</div>
    </div>

    <div class="mock-frame">
      <div class="mock-header">
        <div class="mock-dot dot-red"></div>
        <div class="mock-dot dot-yellow"></div>
        <div class="mock-dot dot-green"></div>
        <div class="mock-address">platform.internal/qa/multi-month-matrix</div>
      </div>
      <div class="mock-body">
        <img src="${img3}" alt="Quality Assurance Dashboard">
      </div>
    </div>

    <div class="features-strip">
      <div class="feature-card">
        <div class="feature-icon">🎯</div>
        <div class="feature-text">
          <h4>8 Interaction Audits / Quarter</h4>
          <p>Structured audit workflow ensuring comprehensive agent evaluation across months.</p>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🧮</div>
        <div class="feature-text">
          <h4>Automated Bonus Formulas</h4>
          <p>Live calculated overall bonus score based on weighted performance thresholds.</p>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📑</div>
        <div class="feature-text">
          <h4>One-Click PDF Export</h4>
          <p>Instant generation of signed audit certificates and executive QA reports.</p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div><span class="page-dot"></span>Slide 3 of 7</div>
      <div>Contact Center Performance Platform</div>
    </div>
  </div>

  <!-- ==================== SLIDE 4: TOP STAR LEADERBOARD ==================== -->
  <div class="slide slide-topstar">
    <div class="header-bar">
      <div>
        <div class="category-badge">03 / Morale &amp; Gamification</div>
        <h2 class="slide-title">Top Star Champions Leaderboard</h2>
        <p class="slide-desc">Automated 5-star benchmark scoring system that recognizes top performers, boosts team morale, and drives friendly competition.</p>
      </div>
      <div class="brand-pill">Dark Mode • Eye-Comfort</div>
    </div>

    <div class="mock-frame">
      <div class="mock-header">
        <div class="mock-dot dot-red"></div>
        <div class="mock-dot dot-yellow"></div>
        <div class="mock-dot dot-green"></div>
        <div class="mock-address">platform.internal/leaderboard/top-star</div>
      </div>
      <div class="mock-body">
        <img src="${img2}" alt="Top Star Leaderboard">
      </div>
    </div>

    <div class="features-strip">
      <div class="feature-card">
        <div class="feature-icon">🏆</div>
        <div class="feature-text">
          <h4>Weighted Benchmark Matrix</h4>
          <p>Holistic score blending Quality (30%), Productivity (25%), AHT &amp; Wrap-up targets.</p>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⭐</div>
        <div class="feature-text">
          <h4>5-Star Target Standards</h4>
          <p>Clear transparent benchmarks so agents know exactly what it takes to reach 5 stars.</p>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🎬</div>
        <div class="feature-text">
          <h4>Celebration Video Modal</h4>
          <p>Dynamic celebratory animations &amp; badges for 1st, 2nd, and 3rd place champions.</p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div><span class="page-dot"></span>Slide 4 of 7</div>
      <div>Contact Center Performance Platform</div>
    </div>
  </div>

  <!-- ==================== SLIDE 5: AGENT SCORECARD TOP ==================== -->
  <div class="slide slide-light">
    <div class="header-bar">
      <div>
        <div class="category-badge">04 / Individual Growth &amp; Transparency</div>
        <h2 class="slide-title">Agent Performance Scorecard (Overview)</h2>
        <p class="slide-desc">Personalized transparency portal giving agents instant visibility into their monthly metrics, team rank, and skill progress.</p>
      </div>
      <div class="brand-pill">Light Mode • #F9F8F4</div>
    </div>

    <div class="mock-frame">
      <div class="mock-header">
        <div class="mock-dot dot-red"></div>
        <div class="mock-dot dot-yellow"></div>
        <div class="mock-dot dot-green"></div>
        <div class="mock-address">platform.internal/portal/agent-scorecard</div>
      </div>
      <div class="mock-body">
        <img src="${img4}" alt="Agent Scorecard Overview">
      </div>
    </div>

    <div class="features-strip">
      <div class="feature-card">
        <div class="feature-icon">👤</div>
        <div class="feature-text">
          <h4>Confidential Self-Review</h4>
          <p>Clean individual portal empowering team members to monitor their progress independently.</p>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <div class="feature-text">
          <h4>Monthly Trajectory Trends</h4>
          <p>Immediate feedback loops on whether metrics are accelerating or need coaching attention.</p>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🎯</div>
        <div class="feature-text">
          <h4>Quality vs Speed Balance</h4>
          <p>Multi-dimensional metric balance to avoid sacrificing accuracy for volume.</p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div><span class="page-dot"></span>Slide 5 of 7</div>
      <div>Contact Center Performance Platform</div>
    </div>
  </div>

  <!-- ==================== SLIDE 6: PODIUM & KPI CARDS ==================== -->
  <div class="slide slide-light">
    <div class="header-bar">
      <div>
        <div class="category-badge">05 / Channel Diagnostics &amp; Recognition</div>
        <h2 class="slide-title">Channel Podiums &amp; Granular KPI Diagnostics</h2>
        <p class="slide-desc">Detailed channel rankings (Chat vs Call teams) paired with granular metric cards for deep performance diagnostics.</p>
      </div>
      <div class="brand-pill">Light Mode • #F9F8F4</div>
    </div>

    <div class="mock-frame">
      <div class="mock-header">
        <div class="mock-dot dot-red"></div>
        <div class="mock-dot dot-yellow"></div>
        <div class="mock-dot dot-green"></div>
        <div class="mock-address">platform.internal/portal/podium-and-kpis</div>
      </div>
      <div class="mock-body">
        <img src="${img5}" alt="Channel Podium and KPI Diagnostics">
      </div>
    </div>

    <div class="features-strip">
      <div class="feature-card">
        <div class="feature-icon">🥇</div>
        <div class="feature-text">
          <h4>Channel-Specific Podiums</h4>
          <p>Fair evaluation honoring top specialists in Chat operations and Voice support separately.</p>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🚥</div>
        <div class="feature-text">
          <h4>Threshold Color Badging</h4>
          <p>Green / Amber / Red indicators alerting supervisors to anomalies in real-time.</p>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">☁️</div>
        <div class="feature-text">
          <h4>Zero Latency Cloud Sync</h4>
          <p>Backed by Firebase Firestore with offline cache &amp; sub-50ms data updates.</p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div><span class="page-dot"></span>Slide 6 of 7</div>
      <div>Contact Center Performance Platform</div>
    </div>
  </div>

  <!-- ==================== SLIDE 7: ARCHITECTURE & CTA ==================== -->
  <div class="slide slide-dark">
    <div class="glow-bg-1"></div>
    <div class="glow-bg-2"></div>

    <div class="header-bar">
      <div class="category-badge">06 / Technical Architecture &amp; Governance</div>
      <div class="brand-pill">Engineering Highlights</div>
    </div>

    <div class="cover-content" style="max-width: 100%;">
      <h2 class="slide-title" style="font-size: 50px;">Engineering for Speed, Reliability &amp; Scale</h2>
      <p class="slide-desc" style="font-size: 20px;">
        Designed with a focus on instantaneous UI feedback, strict data governance, and delightful developer/operator experience.
      </p>

      <div class="outro-grid">
        <div class="outro-card">
          <h3>⚡ Next.js 14 &amp; React Architecture</h3>
          <p>Optimized component trees, zero-hydration layout shifts, and responsive touch-first layouts for both desktop workstations and mobile executives.</p>
        </div>
        <div class="outro-card">
          <h3>🔥 Firebase Firestore Real-Time Backbone</h3>
          <p>Bi-directional real-time listeners synchronizing spreadsheet inputs, evaluation scores, and leaderboard recalculations instantly across all active sessions.</p>
        </div>
        <div class="outro-card">
          <h3>🎨 Unified Adaptive Design System</h3>
          <p>Custom-engineered color architecture offering both a calming warm off-white (<code>#F9F8F4</code>) and an eye-strain-free dark mode for night shifts.</p>
        </div>
        <div class="outro-card">
          <h3>🛡️ Multi-Tier Role Governance</h3>
          <p>Granular access control enforcing strict privileges between System Administrators, Department Managers, Team Leaders, and Support Agents.</p>
        </div>
      </div>

      <div class="cta-banner">
        <div class="cta-text">
          <h2>What metrics drive your team's operational excellence?</h2>
          <p>Let's connect and discuss building data-driven contact center systems!</p>
        </div>
        <div class="cta-badge">Let's Connect on LinkedIn 🚀</div>
      </div>
    </div>

    <div class="slide-footer">
      <div><span class="page-dot"></span>Slide 7 of 7 • End of Case Study</div>
      <div>Developed with Next.js, TypeScript &amp; Firebase • 2026</div>
    </div>
  </div>

</body>
</html>
`;

async function buildPdf() {
  console.log('Launching Edge for High-DPI PDF generation...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Wait for Google Fonts to settle
  await new Promise(r => setTimeout(r, 2500));

  console.log('Printing PDF...');
  await page.pdf({
    path: OUTPUT_PDF,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
    preferCSSPageSize: true
  });

  await browser.close();
  console.log('PDF Generated Successfully at:', OUTPUT_PDF);
  const sizeMb = (fs.statSync(OUTPUT_PDF).size / (1024 * 1024)).toFixed(2);
  console.log('PDF File Size:', sizeMb, 'MB');
}

buildPdf().catch(err => {
  console.error('PDF Generation Failed:', err);
  process.exit(1);
});
