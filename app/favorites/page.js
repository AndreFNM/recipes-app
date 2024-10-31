"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

function Favorites(){
    return(
      <ProtectedRoute>
        <div className="flex items-center justify-center h-screen">
        <div className="bg-gray-200 p-8 rounded-lg shadow-lg">
          Favorites Page
        </div>
      </div>
      </ProtectedRoute>
    );
}

export default Favorites;