"use server";

import db from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

interface User {
  id: number;
  email: string;
  password: string;
}

function validateInput(
  email: string,
  password: string
): { valid: boolean; error?: string } {
  if (!email || !email.includes("@") || !password) {
    return { valid: false, error: "Invalid input" };
  }
  return { valid: true };
}

async function findUserByEmail(email: string): Promise<User | null> {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0] as User;
}

async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

function generateToken(user: { id: number; email: string }): string {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
}

function createResponse(
  body: Record<string, unknown>,
  status: number,
  headers: Record<string, string> = { "Content-Type": "application/json" }
): Response {
  return new Response(JSON.stringify(body), { status, headers });
}


export async function POST(req: Request): Promise<Response> {
  try {
    const { email, password } = (await req.json()) as {
      email: string;
      password: string;
    };

    const { valid, error } = validateInput(email, password);
    if (!valid) {
      return createResponse({ error }, 422);
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return createResponse(
        { error: "No user found with the provided email" },
        404
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return createResponse({ error: "Password is incorrect" }, 401);
    }

    const token = generateToken(user);

    return createResponse(
      { message: "Login Successful" },
      200,
      {
        "Set-Cookie": `token=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600`,
      }
    );
  } catch (error) {
    console.error("Error in login route:", error);
    return createResponse({ error: "Internal Server Error" }, 500);
  }
}
