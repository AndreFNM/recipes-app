import jwt from "jsonwebtoken";

export async function GET(req) {
  const authHeader = req.headers.get("Authorization") || "";

  const token = authHeader.split(" ")[1]; 

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 

    return new Response(JSON.stringify({ favorites: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Invalid Token", { status: 401 });
  }
}
