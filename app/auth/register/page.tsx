"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import LoginRegisterInput from "@/components/LoginRegisterInput";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill all fields.");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/auth/login");
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setError("");
  };

  const handleSendLogin = () => {
    router.push("/auth/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900 dark:bg-[var(--background)] dark:text-[var(--foreground)]">
      <h1 className="text-3xl font-bold">Welcome!</h1>

      {/* Container with light and dark mode styling */}
      <div className="register-container p-8 rounded-lg shadow-lg max-w-md w-full space-y-5">
        <h1 className="text-3xl font-semibold text-center mb-6">Register</h1>

        {isAuthenticated ? (
          <div className="flex flex-col items-center justify-between space-y-5">
            <LogoutButton />
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col items-center justify-between space-y-5">
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <LoginRegisterInput
                  name="name"
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={handleInputChange(setName)}
                />

                <LoginRegisterInput
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={handleInputChange(setEmail)}
                />

                <LoginRegisterInput
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={handleInputChange(setPassword)}
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-[var(--button-bg)] dark:text-[var(--button-text)] dark:hover:bg-[var(--button-hover-bg)] transition-colors"
                >
                  Register
                </button>
              </div>
            </form>

            <div className="flex flex-col space-y-5 mt-4">
              <div className="flex items-center justify-between space-x-5">
                <p>Do you have an account?</p>
                <button
                  onClick={handleSendLogin}
                  className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-[var(--button-bg)] dark:text-[var(--button-text)] dark:hover:bg-[var(--button-hover-bg)] transition-colors"
                >
                  Login
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
