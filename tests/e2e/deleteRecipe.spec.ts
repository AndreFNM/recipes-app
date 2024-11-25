import { test, expect } from "@playwright/test";

test("Delete a recipe", async ({ page }) => {
  await page.goto("/auth/login");
  await page.fill('[name="email"]', "testuser@example.com");
  await page.fill('[name="password"]', "Password.123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/");

  await page.goto("/myRecipes");
  await page.waitForSelector('[data-testid="newRecipeBtn"]', { state: "visible" });
  await expect(page).toHaveURL("/myRecipes");

  await page.click('button:text("Delete Recipe")');
  
  await page.waitForSelector('text=Are you sure you want to delete this recipe?', { state: "visible" });

  await page.click('button:text("Confirm")');

  await expect(page.locator('text=Recipe tests')).toHaveCount(0); 
});
