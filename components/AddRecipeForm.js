"use client";
import { useState } from "react";

export default function AddRecipeForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [servings, setServings] = useState('');
    const [ingredients, setIngredients] = useState([{name:'', quantity:'', unit:''}]);
    const [instructions, setInstructions] = useState(['']);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const recipeData = {title, description, category, servings, ingredients, instructions};
        console.log("Sending Recipe:", recipeData);

        const response = await fetch('/api/recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(recipeData),
            credentials: 'include',
        });

        if(response.ok) {
            console.log('Recipe added successfully');
            setTitle('');
            setDescription('');
            setCategory('');
            setServings('');
            setIngredients([{name:'', quantity:'', unit:''}]);
            setInstructions(['']);
        }else {
            console.error('Failed to add recipe');
        }
    };

    const addIngredient = () => setIngredients([...ingredients, {name:'', quantity:'', unit:''}]);
    const addInstruction = () => setInstructions([...instructions, '']);

    return(
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title">Recipe Title</label>
                <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
                <label htmlFor="description">Description</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
                <label htmlFor="category">Category</label>
                <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div>
                <label>Servings</label>
                <input type="number" id="servings" value={servings} onChange={(e) => setServings(e.target.value)} />
            </div>
            <div>
                <label>Ingredients</label>
                {ingredients.map((ingredient, index) => (
                    <div key={index}>
                        <input type="text" placeholder="Name" value={ingredient.name} onChange={(e) => {
                            const newIngredients = [...ingredients];
                            newIngredients[index].name = e.target.value;
                            setIngredients(newIngredients);
                        }} required />
                        <input type="text" placeholder="Quantity" value={ingredient.quantity} onChange={(e) => {
                            const newIngredients = [...ingredients];
                            newIngredients[index].quantity = e.target.value;
                            setIngredients(newIngredients);
                        }} required />
                        <input type="text" placeholder="Unit" value={ingredient.unit} onChange={(e) => {
                            const newIngredients = [...ingredients];
                            newIngredients[index].unit = e.target.value;
                            setIngredients(newIngredients);
                        }} required />
                    </div>
                ))}
                <button type="button" onClick={addIngredient}>Add Ingredient</button>
            </div>
            <div>
                <label>Instruction</label>
                {instructions.map((instruction, index) => (
                    <div key={index}>
                        <textarea placeholder={`Step ${index + 1}`} value={instruction} onChange={(e) => {
                            const newInstructions = [...instructions];
                            newInstructions[index] = e.target.value;
                            setInstructions(newInstructions);
                        }} required />
                    </div>
                ))}
                <button type="button" onClick={addInstruction}>Add Step</button>
            </div>
            <button type="submit">Add Recipe</button>
        </form>
    );
}