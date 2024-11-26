import { test, expect } from "@playwright/test";
import path from "path";

test("Edit recipe image", async ({ page }) => {
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

  const filePath = path.resolve(__dirname, "caldo-verde-imagem.jpg");
  await page.setInputFiles("#recipe-image", filePath);

  await page.click('button:text("Update Recipe")');

  await expect(page).toHaveURL("/myRecipes");

  await page.waitForSelector('img[src*="caldo-verde-imagem.jpg"]'); 
});
