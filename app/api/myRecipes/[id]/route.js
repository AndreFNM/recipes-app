import db from "@/lib/db";
import jwt from 'jsonwebtoken';

export async function PUT(request, { params }) {
    const { id: recipeId } = params;
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

    if (!recipeId) {
        return new Response(JSON.stringify({ error: "Recipe ID is required" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { title, description, category, servings, ingredients, instructions, imageUrl } = await request.json();

    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        await conn.query(
            'UPDATE recipes SET title=?, description=?, category=?, servings=?, image_url=?, updated_at=NOW() WHERE id=? AND user_id=?',
            [title, description, category, servings, imageUrl, recipeId, userId]
        );

        await conn.query('DELETE FROM recipe_ingredients WHERE recipe_id=?', [recipeId]);
        await conn.query('DELETE FROM instructions WHERE recipe_id=?', [recipeId]);

        for (let ingredient of ingredients) {
            const [existingIngredient] = await conn.query(
                'SELECT id FROM ingredient_list WHERE name = ?',
                [ingredient.name]
            );
            let ingredientId;
            if (existingIngredient.length > 0) {
                ingredientId = existingIngredient[0].id;
            } else {
                const [ingredientResult] = await conn.query(
                    'INSERT INTO ingredient_list (name) VALUES (?)',
                    [ingredient.name]
                );
                ingredientId = ingredientResult.insertId;
            }
            await conn.query(
                'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)',
                [recipeId, ingredientId, ingredient.quantity, ingredient.unit]
            );
        }

        for (let i = 0; i < instructions.length; i++) {
            await conn.query(
                'INSERT INTO instructions (recipe_id, step_number, instruction) VALUES (?, ?, ?)',
                [recipeId, i + 1, instructions[i]]
            );
        }

        await conn.commit();
        conn.release();

        return new Response(JSON.stringify({ message: "Recipe updated successfully" }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error("Error updating recipe", error);
        if (conn) {
            await conn.rollback();
            conn.release();
        }
        return new Response(JSON.stringify({ error: "Error updating recipe" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
