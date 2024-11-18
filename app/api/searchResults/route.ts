"use server";

import db from "@/lib/db";
import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("searchTerm");

    if (!searchTerm) {
      return NextResponse.json({ error: "Search term required" }, { status: 400 });
    }

    const [recipes] = await db.query<RowDataPacket[]>(
      "SELECT id, title, image_url FROM recipes WHERE title LIKE ?",
      [`%${searchTerm}%`]
    );

    const formattedRecipes = recipes.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      image_url: recipe.image_url,
    }));

    return NextResponse.json(formattedRecipes, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error searching for recipes", error);
    return NextResponse.json({ error: "Error searching for recipes" }, { status: 500 });
  }
}
