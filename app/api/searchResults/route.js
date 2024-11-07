import db from '@/lib/db';

export async function GET(request) {
    try {
      const {searchParams} = new URL(request.url);
      const searchTerm = searchParams.get("searchTerm");

      if(!searchTerm) {
        return new Response(JSON.stringify({error: "Search tearm required"}),{
          status:400
        });
      }

      const [recipes] = await db.query('SELECT id, title, image_url FROM recipes WHERE title LIKE ?', [`%${searchTerm}%`]);
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