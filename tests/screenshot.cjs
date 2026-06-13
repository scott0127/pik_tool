const { chromium } = require('playwright');
const path = require('path');

async function run() {
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
  const desktopPath = 'C:/Users/scott/.gemini/antigravity/brain/5cc363fc-024a-477c-8f37-32bb11b97f48/desktop.png';
  await page.screenshot({ path: desktopPath });
  console.log('Saved desktop screenshot to:', desktopPath);
  
  // 2. Mobile Screenshot
  console.log('Capturing mobile layout...');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const mobilePath = 'C:/Users/scott/.gemini/antigravity/brain/5cc363fc-024a-477c-8f37-32bb11b97f48/mobile.png';
  await page.screenshot({ path: mobilePath });
  console.log('Saved mobile screenshot to:', mobilePath);
  
  await browser.close();
  console.log('Done!');
}

run().catch(err => {
  console.error('Error running screenshot script:', err);
  process.exit(1);
});
