"use server";

import db from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function createResponse(
  body: Record<string, unknown>,
  status: number,
  headers: Record<string, string> = { "Content-Type": "application/json" }
): Response {
  return new Response(JSON.stringify(body), { status, headers });
}

export async function POST(req: Request): Promise<Response> {
  try {
    const { token, newPassword }: { token: string; newPassword: string } = await req.json();

    if (
      !newPassword ||
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      return createResponse(
        {
          error:
            "Password must include uppercase, lowercase, number, and be at least 8 characters long.",
        },
        422
      );
    }

    let decoded: { id: number };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    } catch {
      return createResponse({ error: "Invalid or expired token" }, 400);
    }

    const [userRows] = await db.query("SELECT * FROM users WHERE id = ? AND reset_token = ?", [
      decoded.id,
      token,
    ]);

    if ((userRows as []).length === 0) {
      return createResponse({ error: "Invalid token or user not found" }, 404);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.query("UPDATE users SET password = ?, reset_token = NULL WHERE id = ?", [
      hashedPassword,
      decoded.id,
    ]);

    return createResponse({ message: "Password has been reset successfully" }, 200);
  } catch (error) {
    console.error("Error in reset password route:", error);
    return createResponse({ error: "Internal Server Error" }, 500);
  }
}
