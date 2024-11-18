"use server";

import db from "@/lib/db";
import jwt from "jsonwebtoken";
import { RowDataPacket, ResultSetHeader } from "mysql2";

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

export async function GET(request: Request): Promise<Response> {
  const { userId, error } = verifyToken(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const recipeId = searchParams.get("id");

  try {
    if (recipeId) {
      const [recipeResult] = await db.query<RowDataPacket[]>(
        "SELECT * FROM recipes WHERE id=? AND user_id=?", [recipeId, userId]
      );
      if (recipeResult.length === 0) {
        return new Response(JSON.stringify({ error: "Recipe not found" }), { status: 404 });
      }

      const recipe = recipeResult[0];
      const [ingredients] = await db.query<RowDataPacket[]>(
        `
          SELECT il.name, ri.quantity, ri.unit 
          FROM recipe_ingredients ri
          JOIN ingredient_list il ON ri.ingredient_id = il.id
          WHERE ri.recipe_id = ?
        `,
        [recipeId]
      );
      const [instructions] = await db.query<RowDataPacket[]>(
        `
          SELECT instruction 
          FROM instructions
          WHERE recipe_id = ?
          ORDER BY step_number
        `,
        [recipeId]
      );

      const formattedInstructions = instructions.map((row) => row.instruction);

      return new Response(
        JSON.stringify({ ...recipe, ingredients, instructions: formattedInstructions }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      const [recipes] = await db.query<RowDataPacket[]>("SELECT * FROM recipes WHERE user_id=?", [userId]);
      return new Response(JSON.stringify(recipes), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error fetching recipes", error);
    return new Response(JSON.stringify({ error: "Error fetching recipes" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(request: Request): Promise<Response> {
  const { userId, error } = verifyToken(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const recipeId = searchParams.get("id");

  if (!recipeId) {
    return new Response(JSON.stringify({ error: "Recipe ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const [result] = await db.query<ResultSetHeader>("DELETE FROM recipes WHERE id=? AND user_id=?", [recipeId, userId]);
    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: "Recipe not found or unauthorized" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Recipe deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting recipe", error);
    return new Response(JSON.stringify({ error: "Error deleting recipe" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
