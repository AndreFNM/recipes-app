import db from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req, res) {
  const { name, email, password } = await req.json();

  if (!email || !email.includes("@") || !password || password.length < 8) {
    return new Response(JSON.stringify({ error: "Invalid input" }), { status: 422 });
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || password.length < 8) {
    return new Response(
      JSON.stringify({
        error: "Password must include uppercase, lowercase, number, and be at least 8 characters long.",
      }),
      { status: 422 }
    );
  }

  const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  if (existingUser.length > 0) {
    return new Response(JSON.stringify({ error: "User exists already!" }), { status: 422 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
    name,
    email,
    hashedPassword,
  ]);

  return new Response(JSON.stringify({ message: "User created" }), { status: 201 });
}
