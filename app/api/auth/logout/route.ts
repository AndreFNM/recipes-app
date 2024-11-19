"use server";

function createResponse(
    body: Record<string, unknown>,
    status: number,
    headers: Record<string, string> = { "Content-Type": "text/plain" }
  ): Response {
    return new Response(JSON.stringify(body), { status, headers });
  }
  
  function clearAuthToken(): string {
    const isSecure = process.env.NODE_ENV === "production";
    return `token=; HttpOnly; SameSite=Lax; ${isSecure ? "Secure; " : ""} Path=/; Max-Age=0`;
  }
  
  export async function GET(): Promise<Response> {
    return createResponse({message: "Logout successful"}, 200, {
      "Set-Cookie": clearAuthToken(),
    });
  }
  