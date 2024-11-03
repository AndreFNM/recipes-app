import AddRecipeForm from "@/components/AddRecipeForm";
import ProtectedRoute from "@/components/ProtectedRoute";

function NewRecipe(){
    return(
        <ProtectedRoute>
        <div className="mt-24">
            <AddRecipeForm />
        </div>
        </ProtectedRoute>
    );
}

export default NewRecipe;
