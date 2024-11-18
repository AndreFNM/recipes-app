"use client";

import AddRecipeForm from "@/components/AddRecipeForm";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function NewRecipePage(): JSX.Element {
  return (
    <ProtectedRoute>
      <div className="mt-24">
        <AddRecipeForm />
      </div>
    </ProtectedRoute>
  );
}
