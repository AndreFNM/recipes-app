import { test, expect } from "@playwright/test";
import path from "path";

test("Creating a new recipe with image upload", async ({ page }) => {
  await page.goto("/auth/login");
  await page.fill('[name="email"]', "testuser@example.com");
  await page.fill('[name="password"]', "Password.123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/");

  await page.goto("/myRecipes");
  await page.waitForSelector('[data-testid="newRecipeBtn"]', { state: "visible" });
  await page.click('[data-testid="newRecipeBtn"]');
  await expect(page).toHaveURL("/myRecipes/newRecipe");

  await page.fill("#recipe-title", "Recipe tests");
  await page.fill("#recipe-description", "Recipes test description.");
  await page.selectOption("#recipe-category", { label: "Main Course" });
  await page.fill("#recipe-servings", "4");

  await page.fill("#ingredient-name-0", "Ingred 1");
  await page.fill("#ingredient-quantity-0", "2");
  await page.fill("#ingredient-unit-0", "kg");

  await page.fill("#instruction-step-0", "Mix the ingredients.");
  await page.click('button:text("Add Step")');
  await page.fill("#instruction-step-1", "Cook for 10 minutes.");

  const filePath = path.resolve(__dirname, "donkeykong.jpg");
  await page.setInputFiles("#recipe-image", filePath);

  await page.waitForSelector('text=Successful upload');

  await page.click('button:text("Add Recipe")');

  await expect(page).toHaveURL("/myRecipes");
  await page.waitForSelector("text=Recipe tests");
});
