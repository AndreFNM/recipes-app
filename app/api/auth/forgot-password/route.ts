"use server";

import db from "@/lib/db";
import { sendResetPasswordEmail } from "@/lib/mail";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2/promise";

function createResponse(
  body: Record<string, unknown>,
  status: number,
  headers: Record<string, string> = { "Content-Type": "application/json" }
): Response {
  return new Response(JSON.stringify(body), { status, headers });
}

export async function POST(req: Request): Promise<Response> {
  try {
    const { email }: { email: string } = await req.json();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return createResponse({ error: "Invalid email format" }, 400);
    }

    const [userRows] = await db.query<RowDataPacket[]>("SELECT id FROM users WHERE email = ?", [email.trim()]);
    if (userRows.length === 0) {
      return createResponse({ message: "Check your email for reset instructions." }, 200);
    }

    const user = userRows[0];

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    const hashedToken = await bcrypt.hash(resetToken, 12);

    const resetTokenExpires = new Date(Date.now() + 3600000);

    await db.query(
      "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?",
      [hashedToken, resetTokenExpires, user.id]
    );

    await sendResetPasswordEmail(email.trim(), resetToken);

    return createResponse({ message: "Check your email for reset instructions." }, 200);
  } catch (error) {
    console.error("Error in forgot password route:", error);
    return createResponse({ error: "Internal Server Error" }, 500);
  }
}
