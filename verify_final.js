const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const filePath = 'file://' + path.resolve('index.html');
  await page.goto(filePath);

  // Wait for auth or bypass it if needed. 
  // Based on the code, it might show auth container.
  // We can mock authenticated state.
  await page.evaluate(() => {
    localStorage.setItem('theme', 'light');
    window.userRole = 'Administrator';
    window.isAdmin = true;
    window.isApproved = true;
    window.currentUser = { email: 'ahmetnasan1993@gmail.com', user_metadata: { full_name: 'Test Admin' } };
    if (typeof onAuthenticated === 'function') {
      onAuthenticated();
    }
  });

  await page.waitForTimeout(2000);

  // 1. Verify Light Mode
  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  console.log('Body background (should be light):', bodyBg);

  // 2. Take screenshots of different pages
  await page.screenshot({ path: 'final_dashboard.png', fullPage: true });

  const navIcons = await page.$$('.sidebar-icon');
  if (navIcons.length >= 3) {
    // Click Work Orders (index 1)
    await navIcons[1].click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'final_workorders.png', fullPage: true });

    // Click Manufacturing (index 2)
    await navIcons[2].click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'final_manufacturing.png', fullPage: true });
    
    // Click GIS (index 3)
    await navIcons[3].click();
    await page.waitForTimeout(1000); // Map takes time
    await page.screenshot({ path: 'final_gis.png', fullPage: true });
  }

  await browser.close();
})();
