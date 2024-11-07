"use client";
import ProtectedRoute from "@/components/ProtectedRoute";

import FavoritedRecipes from "@/components/FavoritedRecipes";

function Favorites() {
    return(
      <ProtectedRoute>
       <div className="flex flex-col items-center justify-center min-h-screen gap-y-4 sm:gap-y-8 md:gap-y-12 w-full px-4 sm:px-8 max-w-4xl mx-auto overflow-x-hidden pt-24 sm:pt-0">
        <FavoritedRecipes />
        </div>
      </ProtectedRoute>
    );
}

export default Favorites;