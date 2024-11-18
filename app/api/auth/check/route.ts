"use server";

import jwt, { JwtPayload } from "jsonwebtoken";

function extractTokenFromCookie(cookieHeader: string | null): string | null {
  return cookieHeader
    ? cookieHeader.split("; ").find((c) => c.startsWith("token="))?.split("=")[1]
    : null;
}

function createResponse(
  body: Record<string, unknown>,
  status: number,
  headers: Record<string, string> = { "Content-Type": "application/json" }
): Response {
  return new Response(JSON.stringify(body), { status, headers });
}

function verifyToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}

export async function GET(req: Request): Promise<Response> {
  try {
    console.log("JWT_SECRET in /api/auth/check:", process.env.JWT_SECRET);

    const cookieHeader = req.headers.get("cookie");
    console.log("Cookie header received in /api/auth/check:", cookieHeader);

    const token = extractTokenFromCookie(cookieHeader);
    console.log("Token extracted from cookie:", token);

    if (!token) {
      return createResponse(
        { error: "Unauthorized - Token not found" },
        401
      );
    }

    const decoded = verifyToken(token, process.env.JWT_SECRET!);
    console.log("Token decoded successfully:", decoded);

    return createResponse(
      { authenticated: true, userId: decoded.id },
      200
    );
  } catch (error) {
    console.error("Error in /api/auth/check:", error);
    return createResponse({ error: "Internal Server Error" }, 500);
  }
}
