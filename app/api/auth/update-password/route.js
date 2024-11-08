import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

async function getUserIdFromToken(request) {
  const cookieHeader = request.headers.get("cookie");
  const token = cookieHeader
    ? cookieHeader.split("; ").find((c) => c.startsWith("token="))?.split("=")[1]
    : null;

  if (!token) {
    throw new Error("Unauthorized - No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

export async function PATCH(request) {
  try {
    const userId = await getUserIdFromToken(request);
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return new Response(JSON.stringify({ error: "Invalid input" }), { status: 422 });
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || newPassword.length < 8) {
      return new Response(
        JSON.stringify({
          error: "Password must include uppercase, lowercase, number, and be at least 8 characters long.",
        }),
        { status: 422 }
      );
    }

    const [userRows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
    const user = userRows[0];


    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return new Response(JSON.stringify({ error: "Current password is incorrect" }), { status: 401 });
    }


    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);

    return new Response(JSON.stringify({ message: "Password updated successfully" }), { status: 200 });

  } catch (error) {
    console.error("Error updating password:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
