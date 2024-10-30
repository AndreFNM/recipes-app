"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function Favorites(){
  const router = useRouter();

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("token");
  
      if (token) {
        const res = await fetch("/api/favorites", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
  
        if (res.ok) {
          const data = await res.json();
          console.log("Favorites data:", data);
        } else {
          console.log("Error searching for favorites:", res.status);
          if (res.status === 401) {
            router.push("/auth/login");
          }
        }
      } else {
        router.push("/auth/login");
      }
    };
  
    fetchFavorites();
  }, [router]);
  

    return(
        <div className="flex items-center justify-center h-screen">
        <div className="bg-gray-200 p-8 rounded-lg shadow-lg">
          Favorites Page
        </div>
      </div>
    );
}

export default Favorites;