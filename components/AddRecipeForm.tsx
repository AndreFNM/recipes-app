"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";
import SelectFieldRecipe from "./SelectFieldRecipe";
import IngredientsField from "./AddRecipeIngredientsField";
import InstructionsField from "./AddRecipeInstructionsField";
import FormField from "./AddRecipeFormField";

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
  image_url: string;
}

export default function AddRecipeForm(): JSX.Element {
  const router = useRouter();
  const categoryOptions = ["Main Course", "Dessert", "Appetizer", "Beverage"];

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [servings, setServings] = useState<number | "">("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: "", quantity: "", unit: "" }]);
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateRecipeData = (): string[] => {
    const errors: string[] = [];

    const ingredientNames = ingredients.map((ingredient) => ingredient.name.trim().toLowerCase());
    const hasDuplicates = new Set(ingredientNames).size !== ingredientNames.length;
    if (hasDuplicates) errors.push("Each ingredient must be different.");

    if (!category) errors.push("Please select a category.");
    if (!imageUrl) errors.push("Please upload an image.");

    const maxServings = 9999;
    if (typeof servings === "number" && servings > maxServings) {
      errors.push(`Servings cannot exceed ${maxServings}.`);
    }

    return errors;
  };

  const submitRecipe = async (recipeData: RecipeData): Promise<void> => {
    const response = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recipeData),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to add recipe");
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    const errors = validateRecipeData();
    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    try {
      const recipeData: RecipeData = {
        title,
        description,
        category,
        servings: servings as number,
        ingredients,
        instructions,
        image_url: imageUrl || "",
      };
      await submitRecipe(recipeData);
      resetForm();
      router.push("/myRecipes");
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const resetForm = (): void => {
    setTitle("");
    setDescription("");
    setCategory("");
    setServings("");
    setIngredients([{ name: "", quantity: "", unit: "" }]);
    setInstructions([""]);
    setImageUrl(null);
    setError(null);
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
      <h2 className="text-2xl font-semibold text-gray-700">Add a New Recipe</h2>

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
      <ImageUpload setImageUrl={setImageUrl} />

      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={handleSubmit}
        className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Add Recipe
      </button>
    </div>
  );
}
