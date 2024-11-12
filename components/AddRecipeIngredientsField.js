export default function IngredientsField({ ingredients, addIngredient, updateIngredient, removeIngredient }) {
    return (
        <div>
            <label className="block text-gray-600">Ingredients</label>
            {ingredients.map((ingredient, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                    <input type="text" placeholder="Name" value={ingredient.name} onChange={(e) => updateIngredient(index, 'name', e.target.value)} required className="flex-1 p-2 border rounded-md" />
                    <input type="text" placeholder="Quantity" value={ingredient.quantity} onChange={(e) => updateIngredient(index, 'quantity', e.target.value)} required className="w-1/4 p-2 border rounded-md" />
                    <input type="text" placeholder="Unit" value={ingredient.unit} onChange={(e) => updateIngredient(index, 'unit', e.target.value)} required className="w-1/4 p-2 border rounded-md" />
                    <button type="button" onClick={() => removeIngredient(index)} className="px-4 py-2 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200">Remove</button>
                </div>
            ))}
            <button type="button" onClick={addIngredient} className="px-4 py-2 mt-2 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200">Add Ingredient</button>
        </div>
    );
}