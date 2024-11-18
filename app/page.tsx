"use client";
import { useEffect, useState } from "react";
import RecipeCard from "@/components/RecipeCard";

interface Recipe {
  id: number;
  title: string;
  image_url: string;
  favorite_count: number;
}

export default function Home(): JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const [mostPopularRecipes, setMostPopularRecipes] = useState<Recipe[]>([]);
  const [otherRecipes, setOtherRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchRecipes = async (): Promise<void> => {
    try {
      const recipes = await getRecipes();
      const { popular, others } = categorizeRecipes(recipes);
      setMostPopularRecipes(popular);
      setOtherRecipes(others);
    } catch (error: unknown) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const getRecipes = async (): Promise<Recipe[]> => {
    const response = await fetch('/api/displayRecipes');
    if (!response.ok) throw new Error("Error loading recipes");
    return response.json();
  };

  const categorizeRecipes = (recipes: Recipe[]): { popular: Recipe[]; others: Recipe[] } => {
    const sortedRecipes = recipes.sort((a, b) => b.favorite_count - a.favorite_count);
    return {
      popular: sortedRecipes.slice(0, 5),
      others: sortedRecipes.slice(5),
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
      {isLoading ? (
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 lg:gap-8 mt-8">
          <p>Loading Recipes...</p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 lg:gap-8 mt-8">
          {mostPopularRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} title={recipe.title} image={recipe.image_url} path={recipe.id} />
          ))}
        </div>
      )}
      <div className="flex items-center justify-center mt-24">
        <h1 className="text-4xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">Other Recipes</h1>
      </div>
      {isLoading ? (
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 lg:gap-8 mt-8">
          <p>Loading Recipes...</p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 lg:gap-8 mt-8">
          {otherRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} title={recipe.title} image={recipe.image_url} path={recipe.id} />
          ))}
        </div>
      )}
    </>
  );
}
