"use client";
import { useEffect, useState } from "react";
import { use } from "react";

export default function RecipeDetails({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);

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

    fetchRecipeDetails();
  }, [id]);

  if (error) return <p>Error: {error}</p>;
  if (!recipe) return <p>Loading...</p>;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto mt-16">
      <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
      <img
        src={recipe.image_url}
        alt={recipe.title}
        className="w-full h-80 object-cover rounded-lg mb-4"
      />
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
