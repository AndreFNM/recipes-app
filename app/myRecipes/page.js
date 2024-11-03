import CreateNewRecipeBtn from "@/components/CreateNewRecipeBtn";
import ProtectedRoute from "@/components/ProtectedRoute";

function MyRecipes() {
    return(
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center min-h-screen gap-y-4 sm:gap-y-8 md:gap-y-12 w-full px-4 sm:px-8 max-w-4xl mx-auto overflow-x-hidden pt-24 sm:pt-0">
        <CreateNewRecipeBtn />
        </div>
      </ProtectedRoute>
    );
}

export default MyRecipes;