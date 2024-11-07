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

export async function GET(request) {
    const cookieHeader = request.headers.get("cookie");
    const token = cookieHeader
        ? cookieHeader.split("; ").find((c) => c.startsWith("token="))?.split("=")[1]
        : null;

    if (!token) {
        return new Response(JSON.stringify({ error: "Unauthorized - No token provided" }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let userId;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
    } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get("id");

    try {
        if (recipeId) {
            
            const [recipeResult] = await db.query('SELECT * FROM recipes WHERE id=? AND user_id=?', [recipeId, userId]);
            if (recipeResult.length === 0) {
                return new Response(JSON.stringify({ error: "Recipe not found" }), { status: 404 });
            }

            const recipe = recipeResult[0];

            return new Response(JSON.stringify({ 
                ...recipe, 
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
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
            return new Response(JSON.stringify(recipes), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    } catch (error) {
        console.error("Error fetching recipes", error);
        return new Response(JSON.stringify({ error: "Error fetching recipes" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}