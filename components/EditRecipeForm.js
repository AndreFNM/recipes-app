"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ImageUpload from "./ImageUpload";
import SelectFieldRecipe from "./SelectFieldRecipe";
import FormField from "./AddRecipeFormField";
import IngredientsField from "./AddRecipeIngredientsField";
import InstructionsField from "./AddRecipeInstructionsField";

export default function EditRecipeForm() {
    const router = useRouter();
    const { id: recipeId } = useParams();
    const categoryOptions = ["Main Course", "Dessert", "Appetizer", "Beverage"];
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [servings, setServings] = useState('');
    const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);
    const [instructions, setInstructions] = useState(['']);
    const [imageUrl, setImageUrl] = useState('');
    const [error, setError] = useState(null);

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

    const getRecipeById = async (id) => {
        const response = await fetch(`/api/myRecipes?id=${id}`, { credentials: 'include' });
        if (!response.ok) throw new Error("Failed to fetch recipe data");
        return response.json();
    };

    const loadRecipeData = (data) => {
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category);
        setServings(data.servings);
        setIngredients(data.ingredients.map(i => ({ name: i.name, quantity: i.quantity, unit: i.unit })));
        setInstructions(data.instructions.map(i => i.instruction));
        setImageUrl(data.image_url);
    };

    const handleSubmit = async (e) => {
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

    const createRecipeData = () => ({
        title,
        description,
        category,
        servings,
        ingredients,
        instructions,
        imageUrl,
    });

    const updateRecipe = async (recipeData) => {
        const response = await fetch(`/api/myRecipes/${recipeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recipeData),
            credentials: 'include',
        });
        if (!response.ok) throw new Error("Failed to update recipe");
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
            <h2 className="text-2xl font-semibold text-gray-700">Edit Recipe</h2>

            {error && <p className="text-red-500">{error}</p>}
            <FormField label="Recipe Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <FormField label="Description" type="textarea" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" />
            <SelectFieldRecipe label="Category:" value={category} onChange={(e) => setCategory(e.target.value)} options={categoryOptions} />
            <FormField label="Servings" type="number" value={servings} onChange={(e) => setServings(e.target.value ? parseInt(e.target.value) : '')} />

            <IngredientsField ingredients={ingredients} addIngredient={addIngredient} updateIngredient={updateIngredient} removeIngredient={removeIngredient} />
            <InstructionsField instructions={instructions} addInstruction={addInstruction} updateInstruction={updateInstruction} removeInstruction={removeInstruction} />
            <ImageUpload imageUrl={imageUrl} setImageUrl={setImageUrl} />

            <button onClick={handleSubmit} className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">Update Recipe</button>
        </div>
    );
}