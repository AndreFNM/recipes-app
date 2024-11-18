"use server";

import db from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2/promise";

function getUserIdFromToken(request: Request): number {
  const cookieHeader = request.headers.get("cookie");
  const token = cookieHeader
    ? cookieHeader.split("; ").find((c) => c.startsWith("token="))?.split("=")[1]
    : null;

  if (!token) {
    throw new Error("Unauthorized - No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    return decoded.id;
  } catch {
    throw new Error("Invalid or expired token");
  }
}

export async function GET(request: Request): Promise<Response> {
  try {
    const userId = getUserIdFromToken(request);

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT name, email FROM users WHERE id = ?", [userId]
    );

    if (rows.length === 0) throw new Error("User not found");

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error finding user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request): Promise<Response> {
  try {
    const userId = getUserIdFromToken(request);

    const formData = await request.formData();
    const updates = Object.fromEntries(formData.entries());

    const fields = Object.keys(updates).map((field) => `${field} = ?`).join(", ");
    const values = Object.values(updates);

    await db.query(`UPDATE users SET ${fields} WHERE id = ?`, [...values, userId]);

    const [updatedUser] = await db.query<RowDataPacket[]>(
      "SELECT name, email FROM users WHERE id = ?", [userId]
    );

    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
