import { test, expect } from "@playwright/test";

test("Add a recipe to favorites", async ({ page }) => {
  await page.goto("/auth/login");
  await page.fill('[name="email"]', "testuser@example.com");
  await page.fill('[name="password"]', "Password.123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/");

  console.log("Aguardando botões 'View Recipe'...");
  const viewRecipeButtons = page.locator('button:has-text("View Recipe")');
  await viewRecipeButtons.first().waitFor({ state: 'visible', timeout: 60000 });

  const buttonCount = await viewRecipeButtons.count();
  console.log(`Número de botões encontrados: ${buttonCount}`);

  if (buttonCount === 0) {
    await page.screenshot({ path: 'error-no-buttons-found.png' });
    throw new Error("Nenhum botão 'View Recipe' encontrado.");
  }

  console.log("Clicando no primeiro botão...");
  await viewRecipeButtons.first().click();

  console.log("Verificando a navegação...");
  await expect(page).toHaveURL(/\/recipeDetails\/\d+/);

  const favoriteButton = page.locator('button:text("♡ Add to Favorites")');
  await expect(favoriteButton).toBeVisible();

  console.log("Adicionando aos favoritos...");
  await favoriteButton.click();

  const unfavoriteButton = page.locator('button:text("❤️ Favorited")');
  await expect(unfavoriteButton).toBeVisible();


//   console.log("Removendo dos favoritos...");
//   await unfavoriteButton.click();
});
