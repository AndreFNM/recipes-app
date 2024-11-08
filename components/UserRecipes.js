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
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated && userId) {
            fetch(`/api/myRecipes`, {
                method: 'GET',
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => setRecipes(data))
            .catch(error => console.error("Failed to fetch recipes", error));
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

    const confirmDelete = async () => {
        if (!recipeToDelete) return;
        
        try {
            const response = await fetch(`/api/myRecipes?id=${recipeToDelete}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            
            if (response.ok) {
                setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== recipeToDelete));
                closeDeleteModal();
            } else {
                const errorData = await response.json();
                console.error("Failed to delete recipe:", errorData.error);
            }
        } catch (error) {
            console.error("An error occurred:", error);
        }
    };

    const handleEdit = (recipeId) => {
        router.push(`/myRecipes/editRecipe/${recipeId}`);
    };

    return (
        <div className="p-2 sm:p-4 w-full max-w-4xl mx-auto">
            {recipes.length > 0 ? (
                <ul>
                    {recipes.map((recipe) => (
                        <li key={recipe.id} className="flex flex-col sm:flex-row items-center p-4 bg-gray-300 text-white rounded-lg shadow-lg mb-4 w-full max-w-md sm:max-w-full transform hover:scale-105 transition-transform duration-300 ease-in-out">
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
                                <button onClick={() => handleEdit(recipe.id)} className="px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-600 w-full sm:w-auto">
                                    Edit Recipe
                                </button>
                                <button onClick={() => openDeleteModal(recipe.id)} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 w-full sm:w-auto">
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
