"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import RecipeCard from "@/components/RecipeCard";

interface Recipe {
  id: number;
  title: string;
  image_url: string;
}

function SearchResultsPage(): JSX.Element {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("searchTerm");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!searchTerm) return;

      try {
        const response = await fetch(`/api/searchResults?searchTerm=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error("Error loading recipes");
        const data: Recipe[] = await response.json();
        setRecipes(data);
      } catch (error) {
        setError((error as Error).message);
      }
    };

    fetchRecipes();
  }, [searchTerm]);

  if (error) return <p>Error: {error}</p>;

  return (
    <>
      {recipes.length > 0 ? (
        <>
          <div className="flex items-center justify-center mt-24">
            <h1 className="text-3xl sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Results for: &quot;{searchTerm}&quot;
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 lg:gap-8 mt-8">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} title={recipe.title} image={recipe.image_url} path={recipe.id} />
            ))}
          </div>
        </>
      ) : (
        <p>No recipes found for &quot;{searchTerm}&quot;.</p>
      )}
    </>
  );
}

export default SearchResultsPage;
