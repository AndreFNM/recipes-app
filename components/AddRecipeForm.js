"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";
import SelectFieldRecipe from "./SelectFieldRecipe";
import IngredientsField from "./AddRecipeIngredientsField";
import InstructionsField from "./AddRecipeInstructionsField";
import FormField from "./AddRecipeFormField";

export default function AddRecipeForm() {
    const router = useRouter();
    const categoryOptions = ["Main Course", "Dessert", "Appetizer", "Beverage"];

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [servings, setServings] = useState('');
    const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);
    const [instructions, setInstructions] = useState(['']);
    const [imageUrl, setImageUrl] = useState('');
    const [error, setError] = useState(null);

    const validateRecipeData = () => {
        const errors = [];

        const ingredientNames = ingredients.map((ingredient) => ingredient.name.trim().toLowerCase());
        const hasDuplicates = new Set(ingredientNames).size !== ingredientNames.length;
        if (hasDuplicates) errors.push("Each ingredient must be different.");

        if (!category) errors.push("Please select a category.");

        const maxServings = 9999;
        if (servings > maxServings) errors.push(`Servings cannot exceed ${maxServings}.`);

        return errors;
    };

    const submitRecipe = async (recipeData) => {
        const response = await fetch('/api/recipes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recipeData),
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to add recipe');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateRecipeData();
        if (errors.length > 0) {
            setError(errors[0]); 
            return;
        }

        try {
            const recipeData = {
                title,
                description,
                category,
                servings,
                ingredients,
                instructions,
                imageUrl,
            };
            await submitRecipe(recipeData);
            resetForm();
            router.push("/myRecipes");
        } catch (error) {
            setError(error.message);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setCategory('');
        setServings('');
        setIngredients([{ name: '', quantity: '', unit: '' }]);
        setInstructions(['']);
        setImageUrl('');
        setError(null);
    };

    const addIngredient = () => setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
    const updateIngredient = (index, field, value) => {
        const updatedIngredients = [...ingredients];
        updatedIngredients[index][field] = value;
        setIngredients(updatedIngredients);
    };
    const removeIngredient = (index) => setIngredients(ingredients.filter((_, i) => i !== index));

    const addInstruction = () => setInstructions([...instructions, '']);
    const updateInstruction = (index, value) => {
        const updatedInstructions = [...instructions];
        updatedInstructions[index] = value;
        setInstructions(updatedInstructions);
    };
    const removeInstruction = (index) => setInstructions(instructions.filter((_, i) => i !== index));

    return (
        <div onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700">Add a New Recipe</h2>

            <FormField label="Recipe Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <FormField label="Description" type="textarea" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" />
            <SelectFieldRecipe label="Category:" value={category} onChange={(e) => setCategory(e.target.value)} options={categoryOptions} />
            <FormField label="Servings" type="number" value={servings} onChange={(e) => setServings(e.target.value)} />

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
            >Add Recipe</button>
        </div>
    );
}
