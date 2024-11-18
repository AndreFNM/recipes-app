"use server";

function createResponse(
    body: string,
    status: number,
    headers: Record<string, string> = { "Content-Type": "text/plain" }
  ): Response {
    return new Response(body, { status, headers });
  }
  
  function clearAuthToken(): string {
    return "token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0";
  }
  
  export async function GET(): Promise<Response> {
    return createResponse("Logout successful", 200, {
      "Set-Cookie": clearAuthToken(),
    });
  }
  