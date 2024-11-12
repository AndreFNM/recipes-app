function createResponse(body, status, headers = { "Content-Type": "text/plain" }) {
    return new Response(body, { status, headers });
}

function clearAuthToken() {
    return "token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0";
}

export async function GET(req) {
    return createResponse("Logout successful", 200, {
        "Set-Cookie": clearAuthToken(),
    });
}
