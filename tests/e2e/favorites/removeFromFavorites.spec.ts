import { test, expect } from "@playwright/test";

test("Remove a recipe from favorites and verify count", async ({ page }) => {
  await page.goto("/auth/login");
  await page.fill('[name="email"]', "testuser@example.com");
  await page.fill('[name="password"]', "Password.123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/");

  await page.goto("/favorites");
  await expect(page).toHaveURL("/favorites");

  await page.waitForSelector('button:has-text("Remove from Favorites")');

  const removeButtons = page.locator('button:has-text("Remove from Favorites")');
  const initialCount = await removeButtons.count();
  console.log(`Initial count of favorites: ${initialCount}`);
  expect(initialCount).toBeGreaterThan(0);

  await removeButtons.first().click();

  await expect(removeButtons).toHaveCount(initialCount - 1);
});
