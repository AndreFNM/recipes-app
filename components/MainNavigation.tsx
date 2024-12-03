"use client";

import Link from "next/link";
import { useState, ChangeEvent, KeyboardEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LogoutButton from "./LogoutButton";
import { useRouter } from "next/navigation";

function MainNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmedSearchTerm = searchTerm.trim();

      if (trimmedSearchTerm === "") {
        router.push("/");
      } else {
        router.push(
          `/searchResults?searchTerm=${encodeURIComponent(trimmedSearchTerm)}`
        );
      }
      setSearchTerm("");
    }
  };

  return (
    <header className="bg-white bg-opacity-70 backdrop-blur-md shadow-md fixed w-full top-0 z-10">
      <nav className="max-w-7xl mx-auto p-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-gray-800">
          <Link href="/">CookSpace</Link>
        </div>
        <ul className="hidden md:flex space-x-8 text-lg">
          <li>
            <Link
              href="/"
              className="text-gray-800 hover:text-blue-500 transition duration-300"
            >
              Home
            </Link>
          </li>
          {isAuthenticated ? (
            <>
              <li>
                <Link
                  href="/favorites"
                  className="text-gray-800 hover:text-blue-500 transition duration-300"
                >
                  Favorites
                </Link>
              </li>
              <li>
                <Link
                  href="/myRecipes"
                  className="text-gray-800 hover:text-blue-500 transition duration-300"
                >
                  My Recipes
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-gray-800 hover:text-blue-500 transition duration-300"
                >
                  Profile
                </Link>
              </li>
            </>
          ) : null}
          <li>
            <input
              type="text"
              placeholder="Search..."
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              onKeyDown={handleSearch}
              className="w-[150px] borderless border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </li>
          {!isAuthenticated ? (
            <li>
              <Link href="/auth/login">Authentication</Link>
            </li>
          ) : (
            <li>
              <LogoutButton />
            </li>
          )}
        </ul>
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-gray-800 focus:outline-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <ul className="space-y-4 p-4 text-lg">
            <li>
              <Link
                href="/"
                className="text-gray-800 hover:text-blue-500 transition duration-300"
              >
                Home
              </Link>
            </li>
            {isAuthenticated ? (
              <>
                <li>
                  <Link
                    href="/favorites"
                    className="text-gray-800 hover:text-blue-500 transition duration-300"
                  >
                    Favorites
                  </Link>
                </li>
                <li>
                  <Link
                    href="/myRecipes"
                    className="text-gray-800 hover:text-blue-500 transition duration-300"
                  >
                    My Recipes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="text-gray-800 hover:text-blue-500 transition duration-300"
                  >
                    Profile
                  </Link>
                </li>
              </>
            ) : null}
            <li>
              <input
                type="text"
                placeholder="Search..."
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                onKeyDown={handleSearch}
                className="w-[150px] borderless border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </li>
            {!isAuthenticated ? (
              <li>
                <Link href="/auth/login">Authentication</Link>
              </li>
            ) : (
              <li>
                <LogoutButton />
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}

export default MainNavigation;
