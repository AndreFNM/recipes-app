import db from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function validateInput(email, password) {
  if (!email || !email.includes("@") || !password) {
    return { valid: false, error: "Invalid input" };
  }
  return { valid: true };
}

async function findUserByEmail(email) {
  const [userRows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  if (!userRows || userRows.length === 0) {
    return null;
  }
  return userRows[0];
}

async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
}

function createResponse(body, status, headers = { "Content-Type": "application/json" }) {
  return new Response(JSON.stringify(body), { status, headers });
}

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const { valid, error } = validateInput(email, password);
    if (!valid) {
      return createResponse({ error }, 422);
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return createResponse({ error: "No user found with the provided email" }, 404);
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return createResponse({ error: "Password is incorrect" }, 401);
    }

    const token = generateToken(user);

    return createResponse(
      { message: "Login Successful" },
      200,
      { "Set-Cookie": `token=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600` }
    );

  } catch (error) {
    console.error("Error in login route:", error);
    return createResponse({ error: "Internal Server Error" }, 500);
  }
}
