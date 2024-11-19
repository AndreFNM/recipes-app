"use server";

import db from "@/lib/db";
import jwt, { JwtPayload } from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

type Recipe = {
  recipe_id: number;
  title: string;
  description: string;
  category: string;
  image_url: string;
};

function extractTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const tokenCookie = cookieHeader
    .split("; ")
    .find((c) => c.startsWith("token="));

  return tokenCookie ? tokenCookie.split("=")[1] : null;
}

function createResponse(
  body: unknown,
  status: number,
  headers: Record<string, string> = { "Content-Type": "application/json" }
): Response {
  return new Response(JSON.stringify(body), { status, headers });
}

function verifyToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}

async function addFavorite(userId: number, recipeId: number): Promise<void> {
  await db.query(
    "INSERT IGNORE INTO favorites (user_id, recipe_id) VALUES (?, ?)", [userId, recipeId]
  );
  await db.query(
    "UPDATE recipes SET favorite_count = favorite_count + 1 WHERE id = ?", [recipeId]
  );
}

async function removeFavorite(userId: number, recipeId: number): Promise<void> {
  await db.query(
    "DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?",
    [userId, recipeId]
  );
  await db.query(
    "UPDATE recipes SET favorite_count = GREATEST(favorite_count - 1, 0) WHERE id = ?",
    [recipeId]
  );
}

async function fetchFavorites(userId: number): Promise<Recipe[]> {
  const [recipes] = await db.query<RowDataPacket[]>(
    `SELECT 
      r.id AS recipe_id,
      r.title,
      r.description,
      r.category,
      r.image_url
    FROM 
      favorites f
    JOIN 
      recipes r ON f.recipe_id = r.id
    WHERE 
      f.user_id = ?`,
    [userId]
  );

  return recipes.map((row) => ({
    recipe_id: row.recipe_id,
    title: row.title,
    description: row.description,
    category: row.category,
    image_url: row.image_url,
  }));
}

async function fetchFavoriteRecipe(
  userId: number,
  recipeId: number
): Promise<Recipe | null> {
  const [recipeResult] = await db.query<RowDataPacket[]>(
    "SELECT * FROM recipes WHERE id = ? AND user_id = ?", [recipeId, userId]
  );

  if (recipeResult.length > 0) {
    const row = recipeResult[0];
    return {
      recipe_id: row.recipe_id,
      title: row.title,
      description: row.description,
      category: row.category,
      image_url: row.image_url,
    } as Recipe;
  }

  return null;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = extractTokenFromCookie(cookieHeader);

    if (!token) {
      return createResponse({ error: "Unauthorized - Token not found" }, 401);
    }

    const decoded = verifyToken(token, process.env.JWT_SECRET!);
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      throw new Error("Token expired");
    }
    const userId = decoded.id;

    const { recipeId }: { recipeId: number } = await request.json();
    await addFavorite(userId, recipeId);

    return createResponse({ message: "Recipe added to favorites" }, 200);
  } catch (error) {
    console.error("Error in adding recipe to favorites:", error);
    return createResponse({ error: "Internal Server Error" }, 500);
  }
}



export async function DELETE(request: Request): Promise<Response> {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = extractTokenFromCookie(cookieHeader);

    if (!token) {
      return createResponse({ error: "Unauthorized - Token not found" }, 401);
    }

    const decoded = verifyToken(token, process.env.JWT_SECRET!);
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      throw new Error("Token expired");
    }
    const userId = decoded.id;

    const { recipeId }: { recipeId: number } = await request.json();
    await removeFavorite(userId, recipeId);

    return createResponse({ message: "Recipe removed from favorites" }, 200);
  } catch (error) {
    console.error("Error in removing recipe from favorites:", error);
    return createResponse({ error: "Internal Server Error" }, 500);
  }
}

export async function GET(request: Request): Promise<Response> {
  const cookieHeader = request.headers.get("cookie");
  const token = extractTokenFromCookie(cookieHeader);

  if (!token) {
    return createResponse({ error: "Unauthorized - No token provided" }, 401);
  }

  let userId: number;
try {
  const decoded = verifyToken(token, process.env.JWT_SECRET!);
  if (decoded.exp && Date.now() >= decoded.exp * 1000) {
    throw new Error("Token expired");
  }
  userId = decoded.id;
} catch (error) {
  console.error("Error verifying token:", error);
  return createResponse({ error: "Invalid or expired token" }, 403);
}


  const { searchParams } = new URL(request.url);
  const recipeId = Number(searchParams.get("id"));
  if(isNaN(recipeId)) {
    return createResponse({error: "Invalid Recipe ID"}, 400);
  }

  try {
    if (recipeId) {
      const recipe = await fetchFavoriteRecipe(userId, Number(recipeId));
      if (!recipe) {
        return createResponse({ error: "Recipe not found" }, 404);
      }
      return createResponse(recipe, 200);
    } else {
      const recipes = await fetchFavorites(userId);
      return createResponse(recipes, 200);
    }
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return createResponse({ error: "Error fetching recipes" }, 500);
  }
}
