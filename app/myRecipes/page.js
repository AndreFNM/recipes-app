import AddRecipeForm from "@/components/AddRecipeForm";
import ProtectedRoute from "@/components/ProtectedRoute";

function MyRecipes() {
    return(
      <ProtectedRoute>
        <div className="flex items-center justify-center h-screen">
        <div className="bg-gray-200 p-8 rounded-lg shadow-lg">
          My Recipes Page
          <AddRecipeForm />
        </div>
      </div>
      </ProtectedRoute>
    );
}

export default MyRecipes;