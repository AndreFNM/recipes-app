"use server";

import db from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function POST(req: Request): Promise<Response> {
  const cookieHeader = req.headers.get("cookie");
  const token = cookieHeader
    ? cookieHeader.split("; ").find((c) => c.startsWith("token="))?.split("=")[1]
    : null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
  }

  let userId: number;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    userId = decoded.id;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
  }

  const { title, description, category, servings, ingredients, instructions, image_url } = await req.json();

  let conn: PoolConnection | undefined;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const [recipeResult] = await conn.query<ResultSetHeader>(
      "INSERT INTO recipes (user_id, title, description, category, servings, image_url) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, title, description, category, servings, image_url]
    );
    const recipeId = recipeResult.insertId;

    for (const ingredient of ingredients) {
      const [existingIngredient] = await conn.query<RowDataPacket[]>(
        "SELECT id FROM ingredient_list WHERE name=?",
        [ingredient.name]
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
      await conn.query(
        "INSERT INTO instructions (recipe_id, step_number, instruction) VALUES (?, ?, ?)",
        [recipeId, i + 1, instructions[i]]
      );
    }

    await conn.commit();
    conn.release();

    return NextResponse.json({ message: "Recipe added successfully", recipeId }, { status: 200 });
  } catch (error) {
    console.error("Failed to insert recipe:", error);
    if (conn) {
      await conn.rollback();
      conn.release();
    }
    return NextResponse.json({ error: "Failed to insert recipe" }, { status: 500 });
  }
}
