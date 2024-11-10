"use client";
import { useEffect, useState } from "react";
import RecipeCard from "@/components/RecipeCard";

export default function Home() {
  const [error, setError] = useState(null);
  const [mostPopularRecipes, setMostPopularRecipes] = useState([]);
  const [otherRecipes, setOtherRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try{
        const response = await fetch('/api/displayRecipes');
        if(!response.ok) throw new Error("Error loading recipes");
        const data = await response.json();
        
        
        const sortedRecipes = data.sort((a, b) => b.favorite_count - a.favorite_count);

          const popular = sortedRecipes.slice(0, 5);
          const others = sortedRecipes.slice(5); 

          setMostPopularRecipes(popular);
          setOtherRecipes(others);
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
    {mostPopularRecipes.map((recipe) => (
      <RecipeCard key={recipe.id} title={recipe.title} image={recipe.image_url} path={recipe.id} />
    ))}
    </div>

    <div className="flex items-center justify-center mt-24">
    <h1 className="text-4xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">Other Recipes</h1>
    </div>

    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 lg:gap-8 mt-8">
    {otherRecipes.map((recipe) => (
      <RecipeCard key={recipe.id} title={recipe.title} image={recipe.image_url} path={recipe.id} />
    ))}
    </div>
    </>
  );
}
