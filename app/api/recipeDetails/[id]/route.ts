"use server";

import db from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

type Recipe = {
  id: number;
  title: string;
  description: string;
  category: string;
  servings: number;
  image_url: string | null;
};

type Ingredient = {
  name: string;
  quantity: number;
  unit: string | null;
};

type Instruction = {
  step_number: number;
  instruction: string;
};

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const { id } = params;

  if (isNaN(Number(id)) || Number(id) <= 0) {
    return new Response(JSON.stringify({ error: "Invalid recipe ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const [recipeResult] = await db.query<RowDataPacket[]>(
      "SELECT id, title, description, category, servings, image_url FROM recipes WHERE id = ?",
      [id]
    );
    const recipe = recipeResult[0] as Recipe | undefined;

    if (!recipe) {
      return new Response(JSON.stringify({ error: "Recipe not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const [ingredientsResult] = await db.query<RowDataPacket[]>(
      `SELECT il.name, ri.quantity, ri.unit
       FROM recipe_ingredients ri
       JOIN ingredient_list il ON ri.ingredient_id = il.id
       WHERE ri.recipe_id = ?`,
      [id]
    );
    const ingredients = ingredientsResult as Ingredient[];

    const [instructionsResult] = await db.query<RowDataPacket[]>(
      `SELECT step_number, instruction
       FROM instructions
       WHERE recipe_id = ?
       ORDER BY step_number ASC`,
      [id]
    );
    const instructions = instructionsResult as Instruction[];

    return new Response(
      JSON.stringify({
        ...recipe,
        ingredients,
        instructions,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching recipe details:", error.message);
    return new Response(JSON.stringify({ error: "Error fetching recipe details" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
