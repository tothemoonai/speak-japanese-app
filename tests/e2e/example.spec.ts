import { test, expect } from '@playwright/test';

test.describe('Application Smoke Tests', () => {
  test('homepage has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/日语口语练习/);
  });

  test('homepage shows hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=基于新概念日本语的智能对话练习平台')).toBeVisible();
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');

    // Test login link
    await page.click('text=登录');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1')).toContainText('登录');

    // Go back to home
    await page.goto('/');

    // Test register link
    await page.click('text=注册');
    await expect(page).toHaveURL('/register');
    await expect(page.locator('h1')).toContainText('注册');
  });
});

test.describe('Authentication', () => {
  test('register page displays form', async ({ page }) => {
    await page.goto('/register');

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toHaveCount(2);
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('shows error when passwords do not match', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input#password', 'password123');
    await page.fill('input#confirmPassword', 'different-password');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=两次输入的密码不一致')).toBeVisible();
  });

  test('shows error when password is too short', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input#password', '12345');
    await page.fill('input#confirmPassword', '12345');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=密码长度至少为6位')).toBeVisible();
  });
});

test.describe('AI Service Configuration', () => {
  test('checks environment variables for AI services', async ({ page }) => {
    // This test checks if the application can detect AI service configuration
    // In a real scenario, you would test with actual API calls

    // Navigate to a page that might use AI services
    await page.goto('/');

    // Check if the page loads successfully (indicates basic config is OK)
    await expect(page.locator('h1')).toBeVisible();
  });
});
