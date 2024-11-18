"use server";

import { NextRequest } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

function validateInput(name: string, email: string, password: string): { valid: boolean; error?: string } {
  if (!email || !email.includes("@") || !password) {
    return { valid: false, error: "Invalid input" };
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || password.length < 8) {
    return {
      valid: false,
      error: "Password must include uppercase, lowercase, number, and be at least 8 characters long.",
    };
  }

  return { valid: true };
}

async function userExists(email: string): Promise<boolean> {
  const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM users WHERE email = ?", [email]);
  return rows.length > 0;
}

async function createUser(name: string, email: string, password: string): Promise<void> {
  const hashedPassword = await bcrypt.hash(password, 12);
  await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
    name,
    email,
    hashedPassword,
  ]);
}

function createResponse<T extends Record<string, unknown>>(
  body: T,
  status: number,
  headers: Record<string, string> = { "Content-Type": "application/json" }
): Response {
  return new Response(JSON.stringify(body), { status, headers });
}


export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { name, email, password } = (await req.json()) as RegisterInput;

    const { valid, error } = validateInput(name, email, password);
    if (!valid) {
      return createResponse({ error }, 422);
    }

    if (await userExists(email)) {
      return createResponse({ error: "User exists already!" }, 422);
    }

    await createUser(name, email, password);

    return createResponse({ message: "User created" }, 201);
  } catch (error) {
    console.error("Error in register route:", error);
    return createResponse({ error: "Internal Server Error" }, 500);
  }
}
