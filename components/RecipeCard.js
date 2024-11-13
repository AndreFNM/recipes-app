"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function RecipeCard({title, image, path}) {
    const router = useRouter();

    const handleBtn = () => {
        router.push(`/recipeDetails/${path}`);
    }
    return(
        
        <div className="w-full sm:w-1/4 md:w-1/5 lg:w-1/6 p-2 transform hover:scale-105 transition-transform duration-300 ease-in-out">
            <div className="rounded overflow-hidden shadow-lg bg-gray-300 h-full flex flex-col ">
                 <div className="w-full h-40 relative"> 
                    <Image
                        src={image} 
                        alt={title}
                        layout="fill"  
                        objectFit="cover"
                        className="object-cover"
                        onClick={handleBtn}
                    />
                </div>

                <div className="px-6 py-4 flex flex-col flex-grow justify-between h-full">
                    <div className="font-bold text-xl sm:text-base md:text-lg lg:text-xl mb-2 line-clamp-1">
                    <button onClick={handleBtn}>
                    {title}
                    </button>
                    </div>
                    <button onClick={handleBtn}>
                    <div className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-600 mt-auto">
                            View Recipe
                    </div>
                    </button>
                </div>
            </div>
        </div>
    );
}