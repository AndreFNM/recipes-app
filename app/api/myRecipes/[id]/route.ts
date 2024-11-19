"use server";

import db from "@/lib/db";
import jwt from "jsonwebtoken";
import { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";

type Ingredient = {
  name: string;
  quantity: number;
  unit?: string;
};

type RecipeData = {
  title: string;
  description: string;
  category: string;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  image_url?: string | null;
};

function verifyToken(request: Request): { userId: number; error: Response | null } {
  const cookieHeader = request.headers.get("cookie");
  const token = cookieHeader
    ? cookieHeader.split("; ").find((c) => c.startsWith("token="))?.split("=")[1]
    : null;

  if (!token) {
    return {
      userId: 0,
      error: new Response(JSON.stringify({ error: "Unauthorized - No token provided" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    return { userId: decoded.id, error: null };
  } catch {
    return {
      userId: 0,
      error: new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
}

function validateRecipe(data: RecipeData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title || typeof data.title !== "string" || data.title.trim() === "") {
    errors.push("Invalid title: must be a non-empty string.");
  }

  if (!data.description || typeof data.description !== "string") {
    errors.push("Invalid description: must be a string.");
  }

  if (!data.category || typeof data.category !== "string") {
    errors.push("Invalid category: must be a string.");
  }

  if (typeof data.servings !== "number" || data.servings <= 0) {
    errors.push("Invalid servings: must be a positive number.");
  }

  if (!Array.isArray(data.ingredients)) {
    errors.push("Invalid ingredients: must be an array.");
  } else {
    data.ingredients.forEach((ingredient, index) => {
      if (!ingredient.name || typeof ingredient.name !== "string") {
        errors.push(`Invalid ingredient at index ${index}: 'name' must be a string.`);
      }
      if (typeof ingredient.quantity !== "number" || ingredient.quantity < 0) {
        errors.push(`Invalid ingredient at index ${index}: 'quantity' must be a non-negative number.`);
      }
      if (ingredient.unit && typeof ingredient.unit !== "string") {
        errors.push(`Invalid ingredient at index ${index}: 'unit' must be a string.`);
      }
    });
  }

  if (!Array.isArray(data.instructions)) {
    errors.push("Invalid instructions: must be an array.");
  } else {
    data.instructions.forEach((instruction, index) => {
      if (!instruction || typeof instruction !== "string") {
        errors.push(`Invalid instruction at index ${index}: must be a non-empty string.`);
      }
    });
  }

  if (data.image_url && typeof data.image_url !== "string") {
    errors.push("Invalid image_url: must be a string.");
  }

  return { isValid: errors.length === 0, errors };
}

export async function PUT(request: Request, context: { params: { id: string } }): Promise<Response> {
  const { params } = context;
  const recipeId = params.id;
  const { userId, error } = verifyToken(request);
  if (error) return error;

  const body = (await request.json()) as RecipeData;

  const { isValid, errors } = validateRecipe(body);
  if (!isValid) {
    return new Response(JSON.stringify({ error: errors.join(", ") }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { title, description, category, servings, ingredients, instructions, image_url } = body;

  let conn: PoolConnection | undefined;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const [exists] = await conn.query<RowDataPacket[]>(
      "SELECT id FROM recipes WHERE id=? AND user_id=?", [recipeId, userId]
    );
    if (exists.length === 0) {
      return new Response(JSON.stringify({ error: "Recipe not found or unauthorized" }), {
        status: 404,
      });
    }

    await conn.query(
      `
        UPDATE recipes 
        SET title=?, description=?, category=?, servings=?, image_url=?, updated_at=NOW() 
        WHERE id=? AND user_id=?
      `,
      [title, description, category, servings, image_url || null, recipeId, userId]
    );

    await conn.query("DELETE FROM recipe_ingredients WHERE recipe_id=?", [recipeId]);
    await conn.query("DELETE FROM instructions WHERE recipe_id=?", [recipeId]);

    for (const ingredient of ingredients) {
      const [existingIngredient] = await conn.query<RowDataPacket[]>(
        "SELECT id FROM ingredient_list WHERE name=?", [ingredient.name]
      );
      const ingredientId =
        existingIngredient.length > 0
          ? existingIngredient[0].id
          : (
              await conn.query<ResultSetHeader>("INSERT INTO ingredient_list (name) VALUES (?)", [
                ingredient.name,
              ])
            )[0].insertId;

      await conn.query(
        "INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)",
        [recipeId, ingredientId, ingredient.quantity, ingredient.unit]
      );
    }

    for (let i = 0; i < instructions.length; i++) {
      const instruction = instructions[i];
      await conn.query(
        "INSERT INTO instructions (recipe_id, step_number, instruction) VALUES (?, ?, ?)",
        [recipeId, i + 1, instruction]
      );
    }

    await conn.commit();
    conn.release();

    return new Response(JSON.stringify({ message: "Recipe updated successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating recipe", error);
    if (conn) {
      await conn.rollback();
      conn.release();
    }
    return new Response(JSON.stringify({ error: "Error updating recipe" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
