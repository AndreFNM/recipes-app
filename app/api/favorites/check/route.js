import db from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request) {
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

    const url = new URL(request.url);
    const recipeId = url.searchParams.get("recipeId");

    const [favorites] = await db.query('SELECT * FROM favorites WHERE user_id = ? AND recipe_id = ?', [userId, recipeId]);

    return new Response(JSON.stringify({ isFavorited: favorites.length > 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}
