"use client";

import EditRecipeForm from "@/components/EditRecipeForm";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function EditRecipePage(): JSX.Element {
  return (
    <ProtectedRoute>
      <div className="mt-24">
        <EditRecipeForm />
      </div>
    </ProtectedRoute>
  );
}
