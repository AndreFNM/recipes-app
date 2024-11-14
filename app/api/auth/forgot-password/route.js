import db from '@/lib/db';
import jwt from 'jsonwebtoken';
import { sendResetPasswordEmail } from '@/lib/mail';

function createResponse(body, status, headers = { "Content-Type": "application/json" }) {
  return new Response(JSON.stringify(body), { status, headers });
}

export async function POST(req) {
  try {
    const { email } = await req.json();
    

    const [userRows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (userRows.length === 0) {
      console.log("Email not found in database.");
      return createResponse({ error: "Email not found" }, 404);
    }

    const user = userRows[0];
    

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    

    const resetTokenExpires = new Date(Date.now() + 3600000);
    await db.query("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?", [resetToken, resetTokenExpires, user.id]);
    

    
    await sendResetPasswordEmail(email, resetToken);

    return createResponse({ message: "Check your email for reset instructions." }, 200);
  } catch (error) {
    console.error("Detailed error in forgot password route:", error.message, error.stack);
    return createResponse({ error: "Internal Server Error" }, 500);
  }
}
