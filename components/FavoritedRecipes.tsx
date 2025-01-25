"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Recipe {
  recipe_id: number;
  title: string;
  category: string;
  image_url: string;
  path: number;
}

export default function FavoritedRecipes(): JSX.Element {
  const { isAuthenticated, userId } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchFavoriteRecipes = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/favorites`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch recipes");
      const data: Recipe[] = await response.json();
      setRecipes(data);
    } catch (error: unknown) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavoriteRecipe = async (recipeId: number): Promise<void> => {
    try {
      const response = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      if (!response.ok) throw new Error("Error deleting from favorites");

      setRecipes((prevRecipes) =>
        prevRecipes.filter((recipe) => recipe.recipe_id !== recipeId)
      );
    } catch (error: unknown) {
      setError((error as Error).message);
    }
  };

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchFavoriteRecipes();
    }
  }, [isAuthenticated, userId]);

  return (
    <>
      {isLoading ? (
        <div>
          <p>Loading...</p>
        </div>
      ) : (
        <div className="p-2 sm:p-4 w-full max-w-4xl mx-auto">
          {error && <p className="text-red-500">{error}</p>}
          {recipes.length > 0 ? (
            <ul>
              {recipes.map((recipe) => (
                <li
                  key={recipe.recipe_id}
                  className="flex flex-col sm:flex-row items-center p-4 bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-300 rounded-lg shadow-lg mb-4 w-full max-w-md sm:max-w-full transform hover:scale-105 transition-transform duration-300 ease-in-out"
                >
                  <button onClick={() => router.push(`/recipeDetails/${recipe.recipe_id}`)}>
                    <div className="w-32 h-32 sm:w-20 sm:h-20 mb-4 sm:mb-0 relative">
                      <Image
                        src={recipe.image_url}
                        alt="Recipe"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                    </div>
                  </button>
                  <div className="flex flex-col sm:flex-1 text-center sm:text-left sm:ml-5 items-center sm:items-start">
                    <button onClick={() => router.push(`/recipeDetails/${recipe.recipe_id}`)}>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {recipe.title}
                    </h3>
                    </button>
                    <h3 className="text-sm text-gray-600 dark:text-gray-200">
                      {recipe.category}
                    </h3>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0 items-center">
                    <button
                      onClick={() => removeFavoriteRecipe(recipe.recipe_id)}
                      className="px-4 py-2 bg-blue-500 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-md"
                    >
                      Remove from Favorites
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 sm:p-8 items-center justify-center w-full max-w-4xl mx-auto text-center">
              <p>You don&apos;t have any recipes</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
