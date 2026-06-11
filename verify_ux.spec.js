const { test, expect } = require('@playwright/test');

test('UX Enhancements Verification', async ({ page }) => {
  await page.goto('file://' + process.cwd() + '/index.html');

  // 1. Check if btn-reset class exists in style
  const styleContent = await page.textContent('style');
  expect(styleContent).toContain('.btn-reset');

  // 2. Mock onAuthenticated and related globals to bypass auth
  await page.evaluate(() => {
    window.currentUser = { email: 'ahmetnasan1993@gmail.com', user_metadata: { full_name: 'Admin' } };
    window.isAdmin = true;
    window.isApproved = true;
    window.allData = [];
    window.onAuthenticated = async () => {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('main-nav').style.display = 'flex';
    };
    onAuthenticated();
  });

  // 3. Verify aria-current on nav tabs
  const dashboardTab = await page.locator('.nav-tab:has-text("Dashboard")');
  await dashboardTab.click();
  await expect(dashboardTab).toHaveAttribute('aria-current', 'page');
  await expect(dashboardTab).toHaveClass(/active/);

  const workOrdersTab = await page.locator('.nav-tab:has-text("Work Orders")');
  await workOrdersTab.click();
  await expect(workOrdersTab).toHaveAttribute('aria-current', 'page');
  await expect(dashboardTab).not.toHaveAttribute('aria-current', 'page');

  // 4. Verify ARIA labels on icon-only buttons
  const searchBtn = await page.locator('button.btn-reset[onclick*="searchCoordinates"]');
  await expect(searchBtn).toHaveAttribute('aria-label', 'Search coordinates');

  const layerOptionsBtn = await page.locator('button.btn-reset[onclick*="fas fa-ellipsis-v"]');
  // Since ellipsis-v is inside the button, we use a better selector
  const ellipsisBtn = await page.locator('.gis-layer-item .btn-reset');
  await expect(ellipsisBtn).toHaveAttribute('aria-label', 'Layer options');

  const forgotPwdBtn = await page.locator('button.btn-reset:has-text("Forgot?")');
  await expect(forgotPwdBtn).toHaveAttribute('aria-label', 'Forgot password?');
});
