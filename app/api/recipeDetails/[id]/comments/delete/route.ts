"use server";

import db from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function DELETE(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const commentId = Number(url.searchParams.get("commentId")); 

    if (!commentId || isNaN(commentId) || commentId <= 0) {
        console.warn("Invalid comment ID:", commentId);
        return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 });
    }

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

    let conn;
    try {
        conn = await db.getConnection();
        console.log("Database connection established");

        const [comment] = await conn.execute(
            "SELECT user_id FROM comments WHERE id = ?",
            [commentId]
        ) as [{ user_id: number }[], unknown];

        if (!comment.length) {
            console.warn("Comment not found");
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        if (comment[0].user_id !== userId) {
            console.warn("Unauthorized: User is not the comment owner");
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await conn.execute("DELETE FROM comments WHERE id = ?", [commentId]);

        console.log("Comment deleted successfully");
        return NextResponse.json({ message: "Comment deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error deleting the comment:", (error as Error).message || error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });

    } finally {
        if (conn) {
            conn.release();
            console.log("Database connection released");
        }
    }
}
