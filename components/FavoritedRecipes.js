"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

export default function FavoritedRecipes() {
    const { isAuthenticated, userId } = useAuth();
    const [recipes, setRecipes] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthenticated && userId) {
            fetch(`/api/favorites`, {
                method: 'GET',
                credentials: 'include'
            })
                .then(response => response.json())
                .then(data => setRecipes(data))
                .catch(error => console.error("Failed to fetch recipes", error));
        }
    }, [isAuthenticated, userId]);

    const toogleFavorites = async (recipeId) => {
        try {
            const response = await fetch("/api/favorites", {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ recipeId }) 
            });
            if (!response.ok) throw new Error(`Error deleting from favorites`);

            setRecipes((prevRecipes) => prevRecipes.filter(recipe => recipe.recipe_id !== recipeId));
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <div className="p-2 sm:p-4 w-full max-w-4xl mx-auto">
            {recipes.length > 0 ? (
                <ul>
                    {recipes.map((recipe) => (
                        <li key={recipe.recipe_id} className="flex flex-col sm:flex-row items-center p-4 bg-gray-300 text-white rounded-lg shadow-lg mb-4 w-full max-w-md sm:max-w-full transform hover:scale-105 transition-transform duration-300 ease-in-out">
                            {/* <div className="w-32 h-32 sm:w-20 sm:h-20 mr-0 sm:mr-4 mb-4 sm:mb-0">
                                <img
                                    src={recipe.image_url}
                                    alt="Recipe"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div> */}
                            <div className="w-32 h-32 sm:w-20 sm:h-20 mr-0 sm:mr-4 mb-4 sm:mb-0 relative">
                                <Image
                                    src={recipe.image_url}
                                    alt="Recipe"
                                    layout="fill"
                                    objectFit="cover"
                                    className="rounded-lg"
                                />
                            </div>

                            <div className="flex-1 ml-5">
                                <h3 className="text-md sm:text-lg font-semibold text-gray-600">{recipe.title}</h3>
                            </div>
                            <div className="flex-1 ml-5">
                                <h3 className="text-sm sm:text-base text-gray-600">{recipe.category}</h3>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button onClick={() => toogleFavorites(recipe.recipe_id)} className="px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-600 w-full sm:w-auto">
                                    Remove from Favorites
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="p-4 sm:p-8 items-center justify-center w-full max-w-4xl mx-auto">
                    <p>You don&apos;t have any recipes</p>
                </div>
            )}
        </div>
    );
}
