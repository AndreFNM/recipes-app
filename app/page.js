"use client";
import { useEffect, useState } from "react";
import RecipeCard from "@/components/RecipeCard";

export default function Home() {
  const [error, setError] = useState(null);
  const [mostPopularRecipes, setMostPopularRecipes] = useState([]);
  const [otherRecipes, setOtherRecipes] = useState([]);

  const fetchRecipes = async () => {
    try {
      const recipes = await getRecipes();
      const { popular, others } = categorizeRecipes(recipes);
      setMostPopularRecipes(popular);
      setOtherRecipes(others);
    } catch (error) {
      setError(error.message);
    }
  };

  const getRecipes = async () => {
    const response = await fetch('/api/displayRecipes');
    if (!response.ok) throw new Error("Error loading recipes");
    return response.json();
  };

  const categorizeRecipes = (recipes) => {
    const sortedRecipes = recipes.sort((a, b) => b.favorite_count - a.favorite_count);
    return {
      popular: sortedRecipes.slice(0, 5),
      others: sortedRecipes.slice(5)
    };
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  if (error) return <p>Error: {error}</p>;

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
