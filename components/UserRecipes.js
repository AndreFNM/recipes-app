import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function UserRecipes() {
    const { isAuthenticated, userId } = useAuth();
    const [recipes, setRecipes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [recipeToDelete, setRecipeToDelete] = useState(null);
    const [error, setError] = useState(null);
    const router = useRouter();

    const fetchRecipes = async () => {
        try {
            const response = await fetch(`/api/myRecipes`, { method: 'GET', credentials: 'include' });
            if (!response.ok) throw new Error("Failed to fetch recipes");
            const data = await response.json();
            setRecipes(data);
        } catch (error) {
            console.error(error);
            setError("Failed to fetch recipes");
        }
    };

    const deleteRecipe = async (recipeId) => {
        try {
            const response = await fetch(`/api/myRecipes?id=${recipeId}`, { method: 'DELETE', credentials: 'include' });
            if (!response.ok) throw new Error("Failed to delete recipe");
            setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== recipeId));
            closeDeleteModal();
        } catch (error) {
            console.error(error);
            setError("Failed to delete recipe");
        }
    };

    useEffect(() => {
        if (isAuthenticated && userId) {
            fetchRecipes();
        }
    }, [isAuthenticated, userId]);

    const openDeleteModal = (id) => {
        setRecipeToDelete(id);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsModalOpen(false);
        setRecipeToDelete(null);
    };

    const confirmDelete = () => {
        if (recipeToDelete) deleteRecipe(recipeToDelete);
    };

    const handleEdit = (recipeId) => {
        router.push(`/myRecipes/editRecipe/${recipeId}`);
    };

    return (
        <div className="p-2 sm:p-4 w-full max-w-4xl mx-auto">
            {error && <p className="text-red-500">{error}</p>}
            {recipes.length > 0 ? (
                <ul>
                    {recipes.map((recipe) => (
                        <li
                            key={recipe.id}
                            className="flex flex-col sm:flex-row items-center p-4 bg-gray-300 text-white rounded-lg shadow-lg mb-4 w-full max-w-md sm:max-w-full transform hover:scale-105 transition-transform duration-300 ease-in-out"
                        >
                            <div className="w-32 h-32 sm:w-20 sm:h-20 mb-4 sm:mb-0 relative">
                                <Image
                                    src={recipe.image_url}
                                    alt="Recipe"
                                    layout="fill"
                                    objectFit="cover"
                                    className="rounded-lg"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-1 text-center sm:text-left items-center sm:items-start">
                                <h3 className="text-md sm:text-lg font-semibold text-gray-600">{recipe.title}</h3>
                                <h3 className="text-sm sm:text-base text-gray-600">{recipe.category}</h3>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0 items-center">
                                <button
                                    onClick={() => handleEdit(recipe.id)}
                                    className="px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-600 w-full sm:w-auto"
                                >
                                    Edit Recipe
                                </button>
                                <button
                                    onClick={() => openDeleteModal(recipe.id)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 w-full sm:w-auto"
                                >
                                    Delete Recipe
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

            <DeleteConfirmationModal 
                isOpen={isModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
            />
        </div>
    );
}