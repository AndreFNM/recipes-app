import db from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !email.includes("@") || !password) {
      return new Response(JSON.stringify({ error: "Invalid input" }), { status: 422 });
    }

    const [userRows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!userRows || userRows.length === 0) {
      return new Response(JSON.stringify({ error: "No user found with the provided email" }), { status: 404 });
    }

    const user = userRows[0];

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Password is incorrect" }), { status: 401 });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return new Response(JSON.stringify({ message: "Login Successful" }), {
      status: 200,
      headers: {
        "Set-Cookie": `token=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600`,
      },
  });
  
  } catch (error) {
    console.error("Error in login route:", error);
    return new Response("Internal Server Error", {status:500});
  }
}
