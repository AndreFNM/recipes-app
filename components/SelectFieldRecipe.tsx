"use client";

interface SelectFieldRecipeProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}

export default function SelectFieldRecipe({
  label,
  id,
  value,
  onChange,
  options,
}: SelectFieldRecipeProps): JSX.Element {
  return (
    <div className="mt-5">
      <label 
      htmlFor={id}
       >{label}</label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select a Category</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
