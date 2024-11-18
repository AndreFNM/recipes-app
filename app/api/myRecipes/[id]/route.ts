"use server";

import db from "@/lib/db";
import jwt from "jsonwebtoken";
import { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";

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

export async function PUT(request: Request, context: { params: { id: string } }): Promise<Response> {
  const { params } = context;
  const recipeId = params.id;
  const { userId, error } = verifyToken(request);
  if (error) return error;

  const { title, description, category, servings, ingredients, instructions, image_url } = await request.json();

  let conn: PoolConnection | undefined;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

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
      if (instruction) {
        await conn.query(
          "INSERT INTO instructions (recipe_id, step_number, instruction) VALUES (?, ?, ?)",
          [recipeId, i + 1, instruction]
        );
      }
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
