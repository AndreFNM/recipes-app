export default function InstructionsField({ instructions, addInstruction, updateInstruction, removeInstruction }) {
    return (
        <div>
            <label className="block text-gray-600">Instructions</label>
            {instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-2 mb-2">
                    <textarea placeholder={`Step ${index + 1}`} value={instruction} onChange={(e) => updateInstruction(index, e.target.value)} required className="flex-1 p-2 border rounded-md" rows="2" />
                    <button type="button" onClick={() => removeInstruction(index)} className="px-4 py-2 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200">Remove</button>
                </div>
            ))}
            <button type="button" onClick={addInstruction} className="px-4 py-2 mt-2 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200">Add Step</button>
        </div>
    );
}