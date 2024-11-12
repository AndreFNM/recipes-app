import db from '@/lib/db';

async function fetchRecipes() {
  const [recipes] = await db.query('SELECT id, title, image_url, favorite_count FROM recipes');
  return recipes;
}

function createResponse(body, status, headers = { 'Content-Type': 'application/json' }) {
  return new Response(JSON.stringify(body), { status, headers });
}

export async function GET() {
  try {
    const recipes = await fetchRecipes();
    return createResponse(recipes, 200);
  } catch (error) {
    console.error("Error searching for recipes", error);
    return createResponse({ error: "Error searching for recipes" }, 500);
  }
}
