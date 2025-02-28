"use server";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  console.log("ID recived in API", params.id); 

  const { id } = params;

  if (!id || isNaN(Number(id)) || Number(id) <= 0) {
    console.error("Invalid id recived:", id);
    return new Response(JSON.stringify({ error: "Invalid recipe ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const [commentsResult] = await db.query<RowDataPacket[]>(
      `SELECT c.id, c.user_id, c.comment, c.created_at, u.name AS username
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.recipe_id = ?
       ORDER BY c.created_at DESC`,
      [id]
    );

    console.log("Comments loades:", commentsResult.length);

    return new Response(JSON.stringify(commentsResult), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error searching for comments:", error);
    return new Response(JSON.stringify({ error: "Error fetching comments" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
