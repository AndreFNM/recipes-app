import db from "@/lib/db";
import jwt from 'jsonwebtoken';

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

            const [ingredients] = await db.query(`
                SELECT il.name, ri.quantity, ri.unit 
                FROM recipe_ingredients ri
                JOIN ingredient_list il ON ri.ingredient_id = il.id
                WHERE ri.recipe_id = ?
            `, [recipeId]);

            const [instructions] = await db.query(`
                SELECT step_number, instruction 
                FROM instructions
                WHERE recipe_id = ?
                ORDER BY step_number
            `, [recipeId]);

            return new Response(JSON.stringify({ 
                ...recipe, 
                ingredients, 
                instructions 
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
            const [recipes] = await db.query('SELECT * FROM recipes WHERE user_id=?', [userId]);
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

export async function DELETE(request) {
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

    if (!recipeId) {
        return new Response(JSON.stringify({ error: "Recipe ID is required" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const result = await db.query('DELETE FROM recipes WHERE id=? AND user_id=?', [recipeId, userId]);
        if (result.affectedRows === 0) {
            return new Response(JSON.stringify({ error: "Recipe not found or unauthorized" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ message: "Recipe deleted successfully" }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error("Error deleting recipe", error);
        return new Response(JSON.stringify({ error: "Error deleting recipe" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}


