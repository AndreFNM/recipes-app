"use client";

import EditUserForm from "@/components/EditUserForm";
import ProtectedRoute from "@/components/ProtectedRoute";

function Profile(): JSX.Element {

    return(
      <ProtectedRoute>
      <div className="mt-24">
        <EditUserForm />
        </div>
      </ProtectedRoute>
    );
}

export default Profile;