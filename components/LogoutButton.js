"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

function LogoutButton() {
    const {logout} = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push("/auth/login");
    }
    
    return(
        <button
        onClick={handleLogout}
        className="bg-sky-500 text-white px-3 rounded-lg hover:bg-sky-600"
    >
        Logout
    </button>
    );
    
}

export default LogoutButton;