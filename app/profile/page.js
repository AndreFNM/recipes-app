import ProtectedRoute from "@/components/ProtectedRoute";

function Profile() {
    return(
      <ProtectedRoute>
        <div className="flex items-center justify-center h-screen">
        <div className="bg-gray-200 p-8 rounded-lg shadow-lg">
          Profile Page
        </div>
      </div>
      </ProtectedRoute>
    );
}

export default Profile;