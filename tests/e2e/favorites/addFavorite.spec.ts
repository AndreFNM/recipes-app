import { test, expect } from "@playwright/test";

test("Add a recipe to favorites", async ({ page }) => {
  await page.goto("/auth/login");
  await page.fill('[name="email"]', "testuser@example.com");
  await page.fill('[name="password"]', "Password.123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/");

  const viewRecipeButtons = page.locator('button:has-text("View Recipe")');
  await viewRecipeButtons.first().waitFor({ state: 'visible', timeout: 60000 });

  const buttonCount = await viewRecipeButtons.count();

  if (buttonCount === 0) {
    await page.screenshot({ path: 'error-no-buttons-found.png' });
    throw new Error("No 'View Recipe' button found.");
  }

  await viewRecipeButtons.first().click();

  await expect(page).toHaveURL(/\/recipeDetails\/\d+/);

  const favoriteButton = page.locator('button:text("♡ Add to Favorites")');
  await expect(favoriteButton).toBeVisible();

  await favoriteButton.click();

  const unfavoriteButton = page.locator('button:text("❤️ Favorited")');
  await expect(unfavoriteButton).toBeVisible();

});
