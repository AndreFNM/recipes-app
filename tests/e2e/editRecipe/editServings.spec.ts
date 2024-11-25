import { test, expect } from "@playwright/test";

test("Edit recipe servings", async ({ page }) => {
  await page.goto("/auth/login");
  await page.fill('[name="email"]', "testuser@example.com");
  await page.fill('[name="password"]', "Password.123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/");

  await page.goto("/myRecipes");
  await page.waitForSelector('[data-testid="newRecipeBtn"]');
  await expect(page).toHaveURL("/myRecipes");

  await page.click('button:text("Edit Recipe")');
  await expect(page).toHaveURL(/\/myRecipes\/editRecipe\/\d+/);

  await page.fill("#recipe-servings", "6"); 
  await page.click('button:text("Update Recipe")');

  await expect(page).toHaveURL("/myRecipes");
});
