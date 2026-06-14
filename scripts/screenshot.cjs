const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  const outputDir = path.resolve(process.cwd(), 'output', 'screenshots');
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  const page = await context.newPage();
  
  // 1. Desktop Screenshot
  console.log('Capturing desktop layout...');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  // Wait a bit for animations and lazy loading
  await page.waitForTimeout(2000);
  const desktopPath = path.join(outputDir, 'desktop.png');
  await page.screenshot({ path: desktopPath });
  console.log('Saved desktop screenshot to:', desktopPath);
  
  // 2. Mobile Screenshot
  console.log('Capturing mobile layout...');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const mobilePath = path.join(outputDir, 'mobile.png');
  await page.screenshot({ path: mobilePath });
  console.log('Saved mobile screenshot to:', mobilePath);
  
  await browser.close();
  console.log('Done!');
}

run().catch(err => {
  console.error('Error running screenshot script:', err);
  process.exit(1);
});
