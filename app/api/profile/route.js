import db from '@/lib/db';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

function getUserIdFromToken(request) {
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

async function getUserById(userId) {
  const [rows] = await db.query(`SELECT name, email, image FROM users WHERE id = ?`, [userId]);
  if (!rows.length) throw new Error("User not found");
  return rows[0];
}

async function updateUser(userId, updates) {
  const fields = Object.keys(updates).map((field) => `${field} = ?`).join(", ");
  const values = Object.values(updates);
  await db.query(`UPDATE users SET ${fields} WHERE id = ?`, [...values, userId]);
}

async function parseFormData(request) {
  const buffers = [];
  for await (const chunk of request.body) {
    buffers.push(chunk);
  }
  const data = Buffer.concat(buffers);
  
  const boundary = request.headers.get("content-type").split("boundary=")[1];
  const parts = data.toString().split(`--${boundary}`);

  const updates = {};
  for (const part of parts) {
    if (part.includes('Content-Disposition: form-data; name="name"')) {
      updates.name = part.split("\r\n\r\n")[1].replace("\r\n", "");
    }
  }
  return updates;
}

export async function GET(request) {
  try {
    const userId = getUserIdFromToken(request);
    const user = await getUserById(userId);
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error finding user:", error.message);
    const status = error.message === "Unauthorized - No token provided" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function PATCH(request) {
  try {
    const userId = getUserIdFromToken(request);
    const updates = await parseFormData(request);

    await updateUser(userId, updates);
    const updatedUser = await getUserById(userId);

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
