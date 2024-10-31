export async function GET(req) {
    return new Response("Logout successful", {
        status: 200,
        headers: {
            "Set-Cookie": `token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
        },
    });
}
