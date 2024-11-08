"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { use } from "react";
import Image from "next/image";

export default function RecipeDetails({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        const response = await fetch(`/api/recipeDetails/${id}`);
        if (!response.ok) throw new Error("Error loading recipe details");
        const data = await response.json();
        setRecipe(data);
      } catch (error) {
        setError(error.message);
      }
    };

    const checkIfFavorited = async () => {
      if (!isAuthenticated) return; 
      try {
          const response = await fetch(`/api/favorites/check?recipeId=${id}`, {
              credentials: "include",
          });
          if (response.ok) {
              const data = await response.json();
              setIsFavorited(data.isFavorited); 
          }
      } catch (error) {
          console.error("Error checking favorite status:", error);
      }
  };
  

    fetchRecipeDetails();
    checkIfFavorited();
  }, [id, isAuthenticated]);

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
        body: JSON.stringify({ recipeId: id }),
      });

      if (!response.ok) throw new Error(`Error ${isFavorited ? "removing from" : "adding to"} favorites`);

      setIsFavorited(!isFavorited);
    } catch (error) {
      setError(error.message);
    }
  };

  if (error) return <p>Error: {error}</p>;
  if (!recipe) return <p>Loading...</p>;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto mt-16">
      <div className="flex">
        <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
        <button
          onClick={toggleFavorite}
          className={`px-4 py-2 mb-6 ml-6 text-sm ${isFavorited ? "text-red-600 bg-red-100 hover:bg-red-200" : "text-blue-600 bg-blue-100 hover:bg-blue-200"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          {isFavorited ? "Remove from Favorites" : "Add to Favorites"}
        </button>
      </div>
      {/* <img
        src={recipe.image_url}
        alt={recipe.title}
        className="w-full h-80 object-cover rounded-lg mb-4"
      /> */}
      <div className="w-full h-80 relative mb-4">
          <Image
              src={recipe.image_url}
              alt={recipe.title}
              layout="fill"         
              objectFit="cover"     
              className="rounded-lg"
          />
      </div>

      <p><strong>Category:</strong> {recipe.category}</p>
      <p><strong>Servings:</strong> {recipe.servings}</p>
      <p className="mt-4"><strong>Description:</strong> {recipe.description}</p>

      <h2 className="text-2xl font-semibold mt-8">Ingredients</h2>
      <ul className="list-disc list-inside">
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index}>
            {ingredient.quantity} {ingredient.unit} of {ingredient.name}
          </li>
        ))}
      </ul>

      <h2 className="text-2xl font-semibold mt-8">Instructions</h2>
      <ol className="list-decimal list-inside">
        {recipe.instructions.map((instruction, index) => (
          <li key={index}>
            {instruction.instruction}
          </li>
        ))}
      </ol>
    </div>
  );
}
