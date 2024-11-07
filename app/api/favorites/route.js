import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        const cookieHeader = request.headers.get("cookie");
        const token = cookieHeader
            ? cookieHeader.split("; ").find((c) => c.startsWith("token="))?.split("=")[1]
            : null;

        if (!token) {
            return new Response(JSON.stringify({ error: "Unauthorized - Token not found" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const { recipeId } = await request.json();

        await db.query('INSERT IGNORE INTO favorites (user_id, recipe_id) VALUES (?, ?)', [userId, recipeId]);

        await db.query('UPDATE recipes SET favorite_count = favorite_count + 1 WHERE id = ?', [recipeId]);

        return new Response(JSON.stringify({ message: "Recipe added to favorites" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error in adding recipe to favorites:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function DELETE(request) {
    try {
        const cookieHeader = request.headers.get("cookie");
        const token = cookieHeader
            ? cookieHeader.split("; ").find((c) => c.startsWith("token="))?.split("=")[1]
            : null;

        if (!token) {
            return new Response(JSON.stringify({ error: "Unauthorized - Token not found" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const { recipeId } = await request.json();

        await db.query('DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?', [userId, recipeId]);

        await db.query('UPDATE recipes SET favorite_count = GREATEST(favorite_count - 1, 0) WHERE id = ?', [recipeId]);

        return new Response(JSON.stringify({ message: "Recipe removed from favorites" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error in removing recipe from favorites:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
