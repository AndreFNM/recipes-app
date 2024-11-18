"use server";

import db from '@/lib/db';

interface Recipe {
  id: number;
  title: string;
  image_url: string;
  favorite_count: number;
}

async function fetchRecipes(): Promise<Recipe[]> {
  const [recipes] = await db.query('SELECT id, title, image_url, favorite_count FROM recipes');
  return recipes as Recipe[];
}

function createResponse(
  body: unknown, 
  status: number, 
  headers: Record<string, string> = { 'Content-Type': 'application/json' }
): Response {
  return new Response(JSON.stringify(body), { status, headers });
}

export async function GET(): Promise<Response> {
  try {
    const recipes = await fetchRecipes();
    return createResponse(recipes, 200);
  } catch (error) {
    console.error("Error searching for recipes", error);
    return createResponse({ error: "Error searching for recipes" }, 500);
  }
}
