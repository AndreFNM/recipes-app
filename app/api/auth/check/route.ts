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
    const cookieHeader = req.headers.get("cookie");
    const token = extractTokenFromCookie(cookieHeader);

    if (!token || typeof token !== "string" || token.trim() === "") {
      return createResponse(
        { error: "Unauthorized - Token not found or invalid" },
        401
      );
    }

    let decoded: JwtPayload;
    try{
      decoded = verifyToken(token, process.env.JWT_SECRET);
    }catch (error){
      if(error.name === "TokenExpiredError") {
        return createResponse({error: "Token Expired"}, 401);
      } else if(error.name === "JsonWebTokenError") {
        return createResponse({error: "Invalid Token"}, 401);
      }
      console.log("Error during token verification: ", error);
      return createResponse({error: "Interal Server error"},500);
    }

    if(!decoded || !decoded.id) {
      return createResponse({error: "Invalid token structure"}, 401);
    }

    return createResponse(
      { authenticated: true, userId: decoded.id },
      200
    );
  } catch (error) {
    console.error("Error in /api/auth/check:", error);
    return createResponse({ error: "Internal Server Error" }, 500);
  }
}
