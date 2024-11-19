"use server";

import db from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

async function getUserIdFromToken(request: Request): Promise<number> {
  const cookieHeader = request.headers.get("cookie");
  const token = cookieHeader
    ? cookieHeader.split("; ").find((c) => c.startsWith("token="))?.split("=")[1]
    : null;

  if (!token) {
    throw new Error("Unauthorized - No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    if(!decoded.id) {
      throw new Error("Invalid token payload");
    }
    return decoded.id;
  } catch(error) {
    if(error.name === "TokenExpiredError") {
      throw new Error("Token expired");
    } else if(error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    throw new Error("Token verification failed");
  }
}

export async function PATCH(request: Request): Promise<Response> {
  try {
    const userId = await getUserIdFromToken(request);
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return new Response(JSON.stringify({ error: "Both current and new passwords are required" }), { status: 422 });
    }

    if(!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || newPassword.length < 8) {
      return new Response(JSON.stringify({error: "Password must include uppercase, lowercase, number, and special character",}),
      {status: 422}
    );
    }

    const [userRows] = await db.query<RowDataPacket[]>("SELECT * FROM users WHERE id = ?", [userId]);

    if(userRows.length === 0) {
      return new Response(JSON.stringify({error: "User not found"}), {status: 404});
    }
    const user = userRows[0];

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return new Response(JSON.stringify({ error: "Current password is incorrect" }), { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);

    return new Response(JSON.stringify({ message: "Password updated successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error updating password:", error);
    if(error.message === "Unauthorized - No token provided") {
      return new Response(JSON.stringify({error: "Unauthorized" }), {status: 401});
    }else if(error.message === "Token expired" || error.message === "Invalid token") {
      return new Response(JSON.stringify({error: error.message}), {status: 401});
    }
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
