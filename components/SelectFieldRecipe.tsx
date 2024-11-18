"use client";

interface SelectFieldRecipeProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}

export default function SelectFieldRecipe({
  label,
  value,
  onChange,
  options,
}: SelectFieldRecipeProps): JSX.Element {
  return (
    <div className="mt-5">
      <label>{label}</label>
      <select
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
