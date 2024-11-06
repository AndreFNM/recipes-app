"use client";
import { useEffect, useState } from "react";
import RecipeCard from "@/components/RecipeCard";

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try{
        const response = await fetch('/api/displayRecipes');
        if(!response.ok) throw new Error("Error loading recipes");
        const data = await response.json();
        setRecipes(data);
      } catch(error) {
        setError(error.message);
      }
    };

    fetchRecipes();
  },[]);

  if(error) return <p>Error: {error}</p>;
  return (
  <>
    <div className="flex items-center justify-center mt-24">
    <h1 className="text-4xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">Most Popular</h1>
    </div>

    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 lg:gap-8 mt-8">
    {recipes.map((recipe) => (
      <RecipeCard key={recipe.id} title={recipe.title} image={recipe.image_url} path={recipe.id} />
    ))}

    </div>
    </>
  );
}
