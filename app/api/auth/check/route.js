import jwt from "jsonwebtoken";

export async function GET(req) {
    try {
        console.log("JWT_SECRET in /api/auth/check:", process.env.JWT_SECRET);

        const cookieHeader = req.headers.get("cookie");
        console.log("Cookie header received in /api/auth/check:", cookieHeader);

        const token = cookieHeader
            ? cookieHeader.split("; ").find((c) => c.startsWith("token="))?.split("=")[1]
            : null;

        console.log("Token extracted from cookie:", token);

        if (!token) {
            return new Response(JSON.stringify({ error: "Unauthorized - Token not found" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token decoded successfully:", decoded);

        return new Response(JSON.stringify({ authenticated: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error in /api/auth/check:", error); 
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
