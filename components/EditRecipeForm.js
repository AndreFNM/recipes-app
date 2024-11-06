"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ImageUpload from "./ImageUpload";
import SelectFieldRecipe from "./SelectFieldRecipe";

export default function EditRecipeForm() {
    const router = useRouter();
    const { id: recipeId } = useParams(); 
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [servings, setServings] = useState('');
    const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);
    const [instructions, setInstructions] = useState(['']);
    const [imageUrl, setImageUrl] = useState('');
    const categoryOptions = ["Main Course", "Dessert", "Appetizer", "Beverage"];

    useEffect(() => {
        const fetchRecipeData = async () => {
            try {
                const response = await fetch(`/api/myRecipes?id=${recipeId}`, { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    setTitle(data.title);
                    setDescription(data.description);
                    setCategory(data.category);
                    setServings(data.servings);
                    setIngredients(data.ingredients.map(i => ({ name: i.name, quantity: i.quantity, unit: i.unit })));
                    setInstructions(data.instructions.map(i => i.instruction));
                    setImageUrl(data.image_url);
                } else {
                    console.error('Failed to fetch recipe data');
                }
            } catch (error) {
                console.error("Error fetching recipe data", error);
            }
        };

        fetchRecipeData();
    }, [recipeId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const recipeData = { title, description, category, servings, ingredients, instructions, imageUrl };

        const response = await fetch(`/api/myRecipes/${recipeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(recipeData),
            credentials: 'include',
        });

        if (response.ok) {
            console.log('Recipe updated successfully');
            router.push("/myRecipes");
        } else {
            console.error('Failed to update recipe');
        }
    };

    const addIngredient = () => setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
    const removeIngredient = (index) => setIngredients(ingredients.filter((_, i) => i !== index));

    const addInstruction = () => setInstructions([...instructions, '']);
    const removeInstruction = (index) => setInstructions(instructions.filter((_, i) => i !== index));

    return (
        <div onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700">Edit Recipe</h2>

            <div className="space-y-2">
                <label htmlFor="title" className="block text-gray-600">Recipe Title</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="description" className="block text-gray-600">Description</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                />
            </div>
            <div className="space-y-2">
                <SelectFieldRecipe
                    label="Category:"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    options={categoryOptions}
                />
            </div>
            <div className="space-y-2">
                <label className="block text-gray-600">Servings</label>
                <input
                    type="number"
                    id="servings"
                    value={servings}
                    onChange={(e) => setServings(e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="block text-gray-600">Ingredients</label>
                {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                        <input type="text" placeholder="Name" value={ingredient.name} onChange={(e) => {
                            const newIngredients = [...ingredients];
                            newIngredients[index].name = e.target.value;
                            setIngredients(newIngredients);
                        }} required className="flex-1 p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="text" placeholder="Quantity" value={ingredient.quantity} onChange={(e) => {
                            const newIngredients = [...ingredients];
                            newIngredients[index].quantity = e.target.value;
                            setIngredients(newIngredients);
                        }} required className="w-1/4 p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="text" placeholder="Unit" value={ingredient.unit} onChange={(e) => {
                            const newIngredients = [...ingredients];
                            newIngredients[index].unit = e.target.value;
                            setIngredients(newIngredients);
                        }} required className="w-1/4 p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button type="button" onClick={() => removeIngredient(index)} className="px-4 py-2 text-sm text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500">Remove</button>
                    </div>
                ))}
                <button type="button" onClick={addIngredient} className="px-4 py-2 mt-2 text-sm text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500">Add Ingredient</button>
            </div>
            <div className="space-y-2">
                <label className="block text-gray-600">Instructions</label>
                {instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start space-x-2 mb-2">
                        <textarea placeholder={`Step ${index + 1}`} value={instruction} onChange={(e) => {
                            const newInstructions = [...instructions];
                            newInstructions[index] = e.target.value;
                            setInstructions(newInstructions);
                        }} required className="flex-1 p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" rows="2" />
                        <button type="button" onClick={() => removeInstruction(index)} className="px-4 py-2 mt-3 text-sm text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500">Remove</button>
                    </div>
                ))}
                <button type="button" onClick={addInstruction} className="px-4 py-2 mt-2 text-sm text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500">Add Step</button>
            </div>
            <div className="space-y-2">
                <ImageUpload imageUrl={imageUrl} setImageUrl={setImageUrl} />
            </div>
            <button onClick={handleSubmit} className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">Update Recipe</button>
        </div>
    );
}
