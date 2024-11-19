"use server";

import db from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2/promise";

type User = {
  name: string;
  email: string;
};

const allowedFields = ["name", "email"];

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

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = rows[0] as User;

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error finding user:", error.message);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function PATCH(request: Request): Promise<Response> {
  try {
    const userId = getUserIdFromToken(request);

    const formData = await request.formData();
    const updates: Record<string, string> = {};

    formData.forEach((value, key) => {
      if (typeof value === "string") {
        updates[key] = value;
      }
    });

    const fieldsToUpdate = Object.keys(updates).filter((key) =>
      allowedFields.includes(key)
    );

    if (fieldsToUpdate.length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    for (const field of fieldsToUpdate) {
      if (!updates[field] || typeof updates[field] !== "string") {
        return NextResponse.json(
          { error: `Invalid value for field: ${field}` },
          { status: 400 }
        );
      }
    }

    const fieldsSQL = fieldsToUpdate.map((field) => `${field} = ?`).join(", ");
    const values = fieldsToUpdate.map((field) => updates[field]);

    await db.query(
      `UPDATE users SET ${fieldsSQL} WHERE id = ?`, [...values, userId]
    );

    const [updatedUser] = await db.query<RowDataPacket[]>(
      "SELECT name, email FROM users WHERE id = ?", [userId]
    );

    if (updatedUser.length === 0) {
      return NextResponse.json(
        { error: "User not found after update" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    console.error("Error updating user:", error.message);
    return NextResponse.json(
      { error: "An error occurred while updating the user" },
      { status: 500 }
    );
  }
}