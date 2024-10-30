import db from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req, res) {
  const { name, email, password } = await req.json();

  if (!email || !email.includes("@") || !password || password.length < 7) {
    return new Response("Invalid input", { status: 422 });
  }

  const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  if (existingUser.length > 0) {
    return new Response("User exists already!", { status: 422 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
    name,
    email,
    hashedPassword,
  ]);

  return new Response("User created", { status: 201 });
}
