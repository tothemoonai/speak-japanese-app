import { test, expect } from '@playwright/test';

test.describe('Report Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to reports page
    await page.goto('/reports');
  });

  test('should display report page title', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if page has content
    const title = await page.textContent('h1, h2, h3');
    expect(title).toBeTruthy();
  });

  test('should load without console errors', async ({ page }) => {
    // Collect console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForLoadState('networkidle');

    // Wait a bit more to catch any delayed errors
    await page.waitForTimeout(2000);

    // Check for errors
    expect(errors.filter(e =>
      !e.includes('404') &&  // Ignore 404s for missing assets
      !e.includes('Failed to load resource')
    )).toHaveLength(0);
  });

  test('should render report components', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if any cards or content are rendered
    const content = await page.textContent('body');
    expect(content?.length).toBeGreaterThan(0);
  });
});
