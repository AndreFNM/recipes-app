import { test, expect } from '@playwright/test';

test.describe('Authentication and Registration', () => {
  test('User can register successfully', async ({ page }) => {
    await page.goto('/auth/register');

    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'testuser@example.com');
    await page.fill('[name="password"]', 'Password.123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/auth/login');
  });

  test('Shows error when fields are empty', async ({ page }) => {
    await page.goto('/auth/register');
    await page.click('button[type="submit"]');
    
    await page.screenshot({ path: 'empty-fields-error.png' });
  
    await page.waitForSelector('text="Please fill all fields."', { timeout: 5000 });
  
    await expect(page.locator('text="Please fill all fields."')).toBeVisible();
  });
  

  test('Shows error for existing user', async ({ page }) => {
    await page.goto('/auth/register');

    await page.fill('[name="name"]', 'Andreeee');
    await page.fill('[name="email"]', '2002andrefilipe@gmail.com');
    await page.fill('[name="password"]', 'Password.123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text="User already exists."')).toBeVisible();
  });

  test('Shows error for invalid password', async ({ page }) => {
    await page.goto('/auth/register');

    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'testuser@example.com');
    await page.fill('[name="password"]', 'weak');
    await page.click('button[type="submit"]');

    await expect(
      page.locator(
        'text="Password must include uppercase, lowercase, number, and be at least 8 characters long."'
      )
    ).toBeVisible();
  });

  test('User can login successfully', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('[name="email"]', 'testuser@example.com');
    await page.fill('[name="password"]', 'Password.123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');

    await expect(page.locator('button:text("Logout")')).toBeVisible();
  });

  test('User cannot login with invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('[name="email"]', 'invalid@example.com');
    await page.fill('[name="password"]', 'WrongPassword!');
    await page.click('button[type="submit"]');

    await expect(
      page.locator(
        'text="Login Failed. Please check your credentials and try again."'
      )
    ).toBeVisible();
  });
});
