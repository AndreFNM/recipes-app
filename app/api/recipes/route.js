import db from '@/lib/db';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req) {
    const cookieHeader = req.headers.get("cookie");
    const token = cookieHeader
        ? cookieHeader.split("; ").find((c) => c.startsWith("token="))?.split("=")[1]
        : null;
        
    if(!token) {
        return NextResponse.json({error: 'Unauthorized - No token provided'}, {status:401});
    }

    let userId;
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
    } catch(error){
        return NextResponse.json({error: 'Invalid or expired token'}, {status:403});
    }


    const { title, description, category, servings, ingredients, instructions, imageUrl } = await req.json();
    
    let conn;

    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        const [recipeResult] = await conn.query(
            'INSERT INTO recipes (user_id, title, description, category, servings, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, title, description, category, servings, imageUrl]
        );
        const recipeId = recipeResult.insertId;
        //console.log(`Recipe inserted with success with ID: ${recipeId}`);

        for (let ingredient of ingredients) {
            console.log(`Processing Ingredients: ${ingredient.name}`);
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
            console.log(`Inserting instruction ${i + 1}: ${instructions[i]}`);
            await conn.query(
                'INSERT INTO instructions (recipe_id, step_number, instruction) VALUES (?, ?, ?)',
                [recipeId, i + 1, instructions[i]]
            );
        }

        await conn.commit();
        conn.release();

        return NextResponse.json({ message: 'Recipe added successfully', recipeId }, { status: 200 });
    } catch (error) {
        console.error('Failed to insert recipe:', error);

        if (conn) {
            await conn.rollback();
            conn.release();
        }

        return NextResponse.json({ error: 'Failed to insert recipe' }, { status: 500 });
    }
}
