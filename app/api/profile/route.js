import db from '@/lib/db';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

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


async function updateData(table, updates, whereClause) {
  const fields = Object.keys(updates).map((field) => `${field} = ?`).join(", ");
  const values = Object.values(updates);
  const whereFields = Object.keys(whereClause).map((field) => `${field} = ?`).join(" AND ");
  const whereValues = Object.values(whereClause);

  const query = `UPDATE ${table} SET ${fields} WHERE ${whereFields}`;
  return db.query(query, [...values, ...whereValues]);
}


async function uploadImageToDocker(imageFile) {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await fetch('http://docker-service-url/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  const data = await response.json();
  return data.url;
}

export async function GET(request) {
  try {
    const userId = await getUserIdFromToken(request);

    const [rows] = await db.query(`SELECT name, email, image FROM users WHERE id = ?`, [userId]);

    if (!rows.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = rows[0];
    return NextResponse.json(user);

  } catch (error) {
    console.error("Error finding user:", error.message);
    
    const status = error.message === "Unauthorized - No token provided" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function PATCH(request) {
    try {
      const userId = await getUserIdFromToken(request);
  
      const buffers = [];
      for await (const chunk of request.body) {
        buffers.push(chunk);
      }
      const data = Buffer.concat(buffers);
  
      const boundary = request.headers.get("content-type").split("boundary=")[1];
      const parts = data.toString().split(`--${boundary}`);
  
      const updates = {};
      let imageUrl = null;
  
      for (const part of parts) {
        if (part.includes('Content-Disposition: form-data; name="name"')) {
          updates.name = part.split("\r\n\r\n")[1].replace("\r\n", "");
        }
        if (part.includes('Content-Disposition: form-data; name="image"')) {
          imageUrl = part.split("\r\n\r\n")[1].replace("\r\n", "");
          updates.image = imageUrl; 
        }
      }
  
      if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: "No fields to update" }, { status: 400 });
      }
  
      const fields = Object.keys(updates).map((field) => `${field} = ?`).join(", ");
      const values = Object.values(updates);
      await db.query(`UPDATE users SET ${fields} WHERE id = ?`, [...values, userId]);
  
      const [updatedUser] = await db.query(`SELECT name, email, image FROM users WHERE id = ?`, [userId]);
      return NextResponse.json(updatedUser[0], { status: 200 });
  
    } catch (error) {
      console.error("Error updating user:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  