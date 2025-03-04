"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

interface RecipeCardProps {
  title: string;
  image: string;
  path: number;
  index?: number; 
}

export default function RecipeCard({ title, image, path, index }: RecipeCardProps): JSX.Element {
  const router = useRouter();

  const handleBtn = (): void => {
    router.push(`/recipeDetails/${path}`);
  };

  return (
    <motion.div
      className="w-full sm:w-1/4 md:w-1/5 lg:w-1/6 p-2"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index ? index * 0.1 : 0 }} 
    >
      <div className="rounded overflow-hidden shadow-lg bg-[var(--card-bg)] h-full flex flex-col transform hover:scale-105 transition-transform duration-300 ease-in-out">
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
          <div className="font-bold text-xl sm:text-base md:text-lg lg:text-xl mb-2 line-clamp-1 text-[var(--card-text-dark)]">
            <button onClick={handleBtn}>{title}</button>
          </div>
          <button onClick={handleBtn}>
            <div className="px-4 py-2 bg-[var(--button-bg)] text-[var(--button-text)] rounded hover:bg-[var(--button-hover-bg)] mt-auto">
              View Recipe
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
