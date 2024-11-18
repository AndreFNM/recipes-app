"use server";

import db from "@/lib/db";
import jwt, { JwtPayload } from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

function extractTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const tokenCookie = cookieHeader
    .split("; ")
    .find((c) => c.startsWith("token="));

  return tokenCookie ? tokenCookie.split("=")[1] : null;
}

function createResponse(
  body: unknown,
  status: number,
  headers: Record<string, string> = { "Content-Type": "application/json" }
): Response {
  return new Response(JSON.stringify(body), { status, headers });
}

function verifyToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}

async function isRecipeFavorited(userId: number, recipeId: number): Promise<boolean> {
  const [favorites] = await db.query<RowDataPacket[]>(
    "SELECT * FROM favorites WHERE user_id = ? AND recipe_id = ?", [userId, recipeId]
  );

  return favorites.length > 0;
}

export async function GET(request: Request): Promise<Response> {
  const cookieHeader = request.headers.get("cookie");
  const token = extractTokenFromCookie(cookieHeader);

  if (!token) {
    return createResponse({ error: "Unauthorized - Token not found" }, 401);
  }

  let userId: number;
  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET!);
    userId = decoded.id;
  } catch (error) {
    console.error("Error verifying token:", error);
    return createResponse({ error: "Invalid or expired token" }, 403);
  }

  const url = new URL(request.url);
  const recipeId = url.searchParams.get("recipeId");

  if (!recipeId) {
    return createResponse({ error: "Recipe ID is required" }, 400);
  }

  try {
    const isFavorited = await isRecipeFavorited(userId, Number(recipeId));
    return createResponse({ isFavorited }, 200);
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return createResponse({ error: "Internal Server Error" }, 500);
  }
}
