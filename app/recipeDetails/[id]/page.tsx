"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { use } from "react";
import CommentsList from "@/components/CommentsList"; 
import AddComment from "@/components/AddComment";

type Recipe = {
  id: number;
  title: string;
  description: string;
  category: string;
  servings: number;
  image_url: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
  instructions: Array<{
    step_number: number;
    instruction: string;
  }>;
};

type RecipeDetailsProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function RecipeDetails({ params }: RecipeDetailsProps) {
  const resolvedParams = use(params);
  const recipeId = Number(resolvedParams.id); 

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [refreshComments, setRefreshComments] = useState<boolean>(false);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        const response = await fetch(`/api/recipeDetails/${recipeId}`);
        if (!response.ok) throw new Error("Error loading recipe details");
        const data: Recipe = await response.json();
        setRecipe(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      }
    };

    const checkIfFavorited = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await fetch(`/api/favorites/check?recipeId=${recipeId}`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setIsFavorited(data.isFavorited);
        }
      } catch (err) {
        console.error("Error checking favorite status:", err);
      }
    };

    fetchRecipeDetails();
    checkIfFavorited();
  }, [recipeId, isAuthenticated]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    try {
      const method = isFavorited ? "DELETE" : "POST";
      const response = await fetch("/api/favorites", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipeId }),
      });

      if (!response.ok)
        throw new Error(
          `Error ${isFavorited ? "removing from" : "adding to"} favorites`
        );

      setIsFavorited(!isFavorited);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  if (error) return <p>Error: {error}</p>;
  if (!recipe) return <p>Loading...</p>;

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto mt-16 bg-white rounded-lg shadow-lg space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{recipe.title}</h1>
        <button
          onClick={toggleFavorite}
          className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
            isFavorited
              ? "text-red-600 bg-red-100 hover:bg-red-200"
              : "text-blue-600 bg-blue-100 hover:bg-blue-200"
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          {isFavorited ? "❤️ Favorited" : "♡ Add to Favorites"}
        </button>
      </div>

      <div className="w-full h-80 relative mb-6 rounded-lg overflow-hidden shadow-md">
        <Image
          src={recipe.image_url}
          alt={recipe.title}
          fill
          className="rounded-lg"
        />
      </div>

      <div className="bg-gray-100 p-6 rounded-lg shadow-md text-gray-700 space-y-2">
        <p className="text-lg">
          <strong className="text-gray-800">Category:</strong> {recipe.category}
        </p>
        <p className="text-lg">
          <strong className="text-gray-800">Servings:</strong> {recipe.servings}
        </p>
        <p className="text-lg">
          <strong className="text-gray-800">Description:</strong> {recipe.description}
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ingredients</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="pl-1 text-lg">
              <span className="font-medium">
                {ingredient.quantity} {ingredient.unit}
              </span>{" "}
              of {ingredient.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-700">
          {recipe.instructions.map((instruction, index) => (
            <li key={index} className="pl-1 text-lg">
              {instruction.instruction}
            </li>
          ))}
        </ol>
      </div>
      {
        isAuthenticated ? <AddComment recipeId={recipeId} onCommentAdded={() => setRefreshComments(!refreshComments)} /> :
        <></>
      }

      <CommentsList recipeId={recipeId} />
    </div>
  );
}
