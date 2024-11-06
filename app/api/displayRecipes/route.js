import db from '@/lib/db';

export async function GET() {
  try {
    const [recipes] = await db.query('SELECT id, title, image_url FROM recipes');
    return new Response(JSON.stringify(recipes), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error searching for recipes", error);
    return new Response(JSON.stringify({ error: "Error searching for recipes" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
