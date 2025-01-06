"use client";

import { useRouter } from "next/navigation";

export default function CreateNewRecipeBtn(): JSX.Element {
  const router = useRouter();

  const handleBtn = (): void => {
    router.push("/myRecipes/newRecipe");
  };

  return (
    <button
      data-testid="newRecipeBtn"
      onClick={handleBtn}
      className="bg-blue-400 hover:bg-blue-600 text-white font-bold py-2 px-6 sm:px-8 rounded inline-flex items-center transform hover:scale-105 transition-transform duration-300 ease-in-out mt-8"
    >
      <span>Create New Recipe</span>
    </button>
  );
}
