"use server";

import db from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }): Promise<Response> {
  const { id } = params;

  try {
    const [recipeResult] = await db.query(
      "SELECT id, title, description, category, servings, image_url FROM recipes WHERE id = ?", [id]
    );
    const recipe = recipeResult[0];

    if (!recipe) {
      return new Response(JSON.stringify({ error: "Recipe not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const [ingredientsResult] = await db.query(
      `SELECT il.name, ri.quantity, ri.unit
       FROM recipe_ingredients ri
       JOIN ingredient_list il ON ri.ingredient_id = il.id
       WHERE ri.recipe_id = ?`,
      [id]
    );

    const [instructionsResult] = await db.query(
      `SELECT step_number, instruction
       FROM instructions
       WHERE recipe_id = ?
       ORDER BY step_number ASC`,
      [id]
    );

    return new Response(
      JSON.stringify({
        ...recipe,
        ingredients: ingredientsResult,
        instructions: instructionsResult,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching recipe details:", error);
    return new Response(JSON.stringify({ error: "Error fetching recipe details" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
