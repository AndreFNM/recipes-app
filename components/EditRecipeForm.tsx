"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import ImageUpload from "./ImageUpload";
import SelectFieldRecipe from "./SelectFieldRecipe";
import FormField from "./AddRecipeFormField";
import IngredientsField from "./AddRecipeIngredientsField";
import InstructionsField from "./AddRecipeInstructionsField";
import Image from "next/image";

interface Ingredient {
  name: string;
  quantity: string; 
  unit: string;
}

interface RecipeData {
  title: string;
  description: string;
  category: string;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  image_url: string | null;
}

export default function EditRecipeForm(): JSX.Element {
  const router = useRouter();
  const { id: recipeId } = useParams<{ id: string }>();
  const categoryOptions = ["Main Course", "Dessert", "Appetizer", "Beverage"];

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [servings, setServings] = useState<number | "">("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: "", quantity: "", unit: "" }]);
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        const recipeData = await getRecipeById(recipeId);
        loadRecipeData(recipeData);
      } catch (error) {
        setError("Error fetching recipe data");
        console.error(error);
      }
    };
    fetchRecipeData();
  }, [recipeId]);

  const getRecipeById = async (id: string): Promise<RecipeData> => {
    const response = await fetch(`/api/myRecipes?id=${id}`, { credentials: "include" });
    if (!response.ok) throw new Error("Failed to fetch recipe data");
    return response.json();
  };

  const loadRecipeData = (data: RecipeData): void => {
    setTitle(data.title);
    setDescription(data.description);
    setCategory(data.category);
    setServings(data.servings);
    setIngredients(data.ingredients);
    setInstructions(data.instructions || []);
    setImageUrl(data.image_url || null);
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    try {
      const recipeData = createRecipeData();
      await updateRecipe(recipeData);
      router.push("/myRecipes");
    } catch (error) {
      setError("Failed to update recipe");
      console.error(error);
    }
  };

  const createRecipeData = (): RecipeData => ({
    title: title.trim(),
    description: description.trim(),
    category: category.trim(),
    servings: Number(servings),
    ingredients: ingredients.map((ingredient) => ({
      name: ingredient.name.trim(),
      quantity: ingredient.quantity.trim(),
      unit: ingredient.unit.trim(),
    })),
    instructions: instructions.map((instruction) => instruction.trim()),
    image_url: imageUrl || null,
  });

  const updateRecipe = async (recipeData: RecipeData): Promise<void> => {
    const response = await fetch(`/api/myRecipes/${recipeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...recipeData,
        ingredients: recipeData.ingredients.map((ingredient) => ({
          ...ingredient,
          quantity: parseFloat(ingredient.quantity), 
        })),
      }),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to update recipe");
  };

  const addIngredient = (): void => setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
  const updateIngredient = (index: number, field: keyof Ingredient, value: string): void => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index][field] = value;
    setIngredients(updatedIngredients);
  };
  const removeIngredient = (index: number): void => setIngredients(ingredients.filter((_, i) => i !== index));

  const addInstruction = (): void => setInstructions([...instructions, ""]);
  const updateInstruction = (index: number, value: string): void => {
    const updatedInstructions = [...instructions];
    updatedInstructions[index] = value;
    setInstructions(updatedInstructions);
  };
  const removeInstruction = (index: number): void => setInstructions(instructions.filter((_, i) => i !== index));

  return (
    <div onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-semibold text-gray-700">Edit Recipe</h2>

      {error && <p className="text-red-500">{error}</p>}
      <FormField id="recipe-title" label="Recipe Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <FormField id="recipe-description" label="Description" type="textarea" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      <SelectFieldRecipe id="recipe-category" label="Category:" value={category} onChange={(e) => setCategory(e.target.value)} options={categoryOptions} />
      <FormField
        id="recipe-servings"
        label="Servings"
        type="number"
        value={servings.toString()}
        onChange={(e) => setServings(e.target.value ? parseInt(e.target.value, 10) : "")}
      />

      <IngredientsField
        ingredients={ingredients}
        addIngredient={addIngredient}
        updateIngredient={updateIngredient}
        removeIngredient={removeIngredient}
      />
      <InstructionsField
        instructions={instructions}
        addInstruction={addInstruction}
        updateInstruction={updateInstruction}
        removeInstruction={removeInstruction}
      />

      {imageUrl && <Image src={imageUrl} width={100} height={110} alt="Recipe Image" className="rounded-lg" />}
      <ImageUpload setImageUrl={setImageUrl} />

      <button
        onClick={handleSubmit}
        className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Update Recipe
      </button>
    </div>
  );
}
