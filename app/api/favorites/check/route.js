import db from '@/lib/db';
import jwt from 'jsonwebtoken';

function extractTokenFromCookie(cookieHeader) {
    return cookieHeader
        ? cookieHeader.split("; ").find((c) => c.startsWith("token="))?.split("=")[1]
        : null;
}

function createResponse(body, status, headers = { "Content-Type": "application/json" }) {
    return new Response(JSON.stringify(body), { status, headers });
}

function verifyToken(token, secret) {
    return jwt.verify(token, secret);
}

async function isRecipeFavorited(userId, recipeId) {
    const [favorites] = await db.query('SELECT * FROM favorites WHERE user_id = ? AND recipe_id = ?', [userId, recipeId]);
    return favorites.length > 0;
}

export async function GET(request) {
    const cookieHeader = request.headers.get("cookie");
    const token = extractTokenFromCookie(cookieHeader);

    if (!token) {
        return createResponse({ error: "Unauthorized - Token not found" }, 401);
    }

    let userId;
    try {
        const decoded = verifyToken(token, process.env.JWT_SECRET);
        userId = decoded.id;
    } catch (error) {
        return createResponse({ error: "Invalid or expired token" }, 403);
    }

    const url = new URL(request.url);
    const recipeId = url.searchParams.get("recipeId");

    try {
        const isFavorited = await isRecipeFavorited(userId, recipeId);
        return createResponse({ isFavorited }, 200);
    } catch (error) {
        console.error("Error checking favorite status", error);
        return createResponse({ error: "Internal Server Error" }, 500);
    }
}
