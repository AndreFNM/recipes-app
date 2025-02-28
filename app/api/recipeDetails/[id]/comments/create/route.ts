"use server";

import db from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ResultSetHeader } from "mysql2/promise";

export async function POST(req: Request): Promise<Response> {
    const cookieHeader = req.headers.get("cookie");
    const token = cookieHeader
        ? cookieHeader.split("; ").find((c) => c.startsWith("token="))?.split("=")[1]
        : null;

    if (!token) {
        console.warn("Unauthorized request: No token provided");
        return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
    }

    let userId: number;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
        userId = decoded.id;
        console.log("Authenticated User ID:", userId);
    } catch {
        console.warn("Invalid or expired token");
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
    }

    const { recipe_id, comment } = await req.json();
    console.log("Received Data - recipe_id:", recipe_id, "comment:", comment);

    const recipeIdNumber = Number(recipe_id);
    if (!recipeIdNumber || isNaN(recipeIdNumber) || recipeIdNumber <= 0) {
        console.warn("Invalid recipe ID:", recipe_id);
        return NextResponse.json({ error: "Invalid recipe ID" }, { status: 400 });
    }
    if (!comment || comment.trim().length < 3) {
        console.warn("Comment is too short");
        return NextResponse.json({ error: "Comment must be at least 3 characters long" }, { status: 400 });
    }

    let conn;
    try {
        conn = await db.getConnection();
        console.log("Database connection established");

        const [commentsResult] = await conn.execute(
            "INSERT INTO comments (user_id, recipe_id, comment) VALUES (?, ?, ?)",
            [userId, recipeIdNumber, comment.trim()]
        ) as [ResultSetHeader, unknown];

        if (commentsResult.affectedRows === 0) {
            console.error("Failed to add comment in the database");
            return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
        }

        console.log("Comment added successfully");
        return NextResponse.json({ message: "Comment added successfully" }, { status: 201 });

    } catch (error) {
        console.error("Error adding the comment:", error.message);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });

    } finally {
        if (conn) {
            conn.release();
            console.log("Database connection released");
        }
    }
}
