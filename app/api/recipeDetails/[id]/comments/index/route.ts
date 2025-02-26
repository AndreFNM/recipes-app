"use server";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";


export async function GET(
    req: Request,
    {params} : {params : {recipe_id: string}}
) : Promise<Response> {
    const { recipe_id } = params;

    if (isNaN(Number(recipe_id)) || Number(recipe_id) <= 0) {
        return new Response(JSON.stringify({error : "Invalid recipe ID"}), {
            status: 400,
            headers: {"Content-Type": "application/json"},
        });
    }

    try {
        const [commentsResult] = await db.query<RowDataPacket[]>(
            `SELECT c.id, c.user_id, c.comment, c.created_at, u.name AS username
            From comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.recipe_id = ?
            ORDER BY c.created_at DESC`,
            [recipe_id] 
        );

        if(commentsResult.length === 0) {
            return new Response(JSON.stringify([]), {
                status: 200,
                headers: {"Content-Type":"application/json"}
            });
        }

        return new Response(JSON.stringify(commentsResult), {
            status: 200,
            headers: {"Content-Type": "application/json"},
        });
    } catch(error) {
        console.error("Error fetching comments:", error.message);
        return new Response(JSON.stringify({error: "Error fetching comments"}), {
            status:500,
            headers: {"Content-Type": "application/json"},
        });
    }
    
}