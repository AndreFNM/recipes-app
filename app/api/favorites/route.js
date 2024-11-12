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

async function addFavorite(userId, recipeId) {
    await db.query('INSERT IGNORE INTO favorites (user_id, recipe_id) VALUES (?, ?)', [userId, recipeId]);
    await db.query('UPDATE recipes SET favorite_count = favorite_count + 1 WHERE id = ?', [recipeId]);
}

async function removeFavorite(userId, recipeId) {
    await db.query('DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?', [userId, recipeId]);
    await db.query('UPDATE recipes SET favorite_count = GREATEST(favorite_count - 1, 0) WHERE id = ?', [recipeId]);
}

async function fetchFavorites(userId) {
    const [recipes] = await db.query(`SELECT 
                                        r.id AS recipe_id,
                                        r.title,
                                        r.description,
                                        r.category,
                                        r.image_url
                                    FROM 
                                        favorites f
                                    JOIN 
                                        recipes r ON f.recipe_id = r.id
                                    WHERE 
                                        f.user_id = ?`, [userId]);
    return recipes;
}

async function fetchFavoriteRecipe(userId, recipeId) {
    const [recipeResult] = await db.query('SELECT * FROM recipes WHERE id=? AND user_id=?', [recipeId, userId]);
    return recipeResult.length > 0 ? recipeResult[0] : null;
}

export async function POST(request) {
    try {
        const cookieHeader = request.headers.get("cookie");
        const token = extractTokenFromCookie(cookieHeader);

        if (!token) {
            return createResponse({ error: "Unauthorized - Token not found" }, 401);
        }

        const decoded = verifyToken(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const { recipeId } = await request.json();
        await addFavorite(userId, recipeId);

        return createResponse({ message: "Recipe added to favorites" }, 200);

    } catch (error) {
        console.error("Error in adding recipe to favorites:", error);
        return createResponse({ error: "Internal Server Error" }, 500);
    }
}

export async function DELETE(request) {
    try {
        const cookieHeader = request.headers.get("cookie");
        const token = extractTokenFromCookie(cookieHeader);

        if (!token) {
            return createResponse({ error: "Unauthorized - Token not found" }, 401);
        }

        const decoded = verifyToken(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const { recipeId } = await request.json();
        await removeFavorite(userId, recipeId);

        return createResponse({ message: "Recipe removed from favorites" }, 200);

    } catch (error) {
        console.error("Error in removing recipe from favorites:", error);
        return createResponse({ error: "Internal Server Error" }, 500);
    }
}

export async function GET(request) {
    const cookieHeader = request.headers.get("cookie");
    const token = extractTokenFromCookie(cookieHeader);

    if (!token) {
        return createResponse({ error: "Unauthorized - No token provided" }, 401);
    }

    let userId;
    try {
        const decoded = verifyToken(token, process.env.JWT_SECRET);
        userId = decoded.id;
    } catch (error) {
        return createResponse({ error: "Invalid or expired token" }, 403);
    }

    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get("id");

    try {
        if (recipeId) {
            const recipe = await fetchFavoriteRecipe(userId, recipeId);
            if (!recipe) {
                return createResponse({ error: "Recipe not found" }, 404);
            }
            return createResponse(recipe, 200);
        } else {
            const recipes = await fetchFavorites(userId);
            return createResponse(recipes, 200);
        }
    } catch (error) {
        console.error("Error fetching recipes", error);
        return createResponse({ error: "Error fetching recipes" }, 500);
    }
}
