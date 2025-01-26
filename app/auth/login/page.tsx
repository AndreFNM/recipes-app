"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LogoutButton from "@/components/LogoutButton";
import LoginRegisterInput from "@/components/LoginRegisterInput";

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        router.push("/");
      } else {
        setError("Login Failed. Please check your credentials and try again.");
      }
    } catch (error) {
      console.error("Login error", error);
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setError("");
  };

  const handleSendRegister = () => {
    router.push("/auth/register");
  };

  const handleForgotPassword = () => {
    router.push("/auth/forgot-password");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900 dark:bg-[var(--background)] dark:text-[var(--foreground)]">
      <h1 className="text-3xl font-bold">Welcome Back!</h1>

      {/* Mantém o cinzento no light mode e usa dark mode apenas no contexto adequado */}
      <div className="login-container p-8 rounded-lg shadow-lg max-w-md w-full space-y-5">
        <h1 className="text-3xl font-semibold text-center mb-6">Login</h1>

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
                  Login
                </button>
              </div>
            </form>
            <div className="flex flex-col space-y-5 mt-4">
              <div className="flex items-center justify-between space-x-5">
                <p>Do you have an account?</p>
                <button
                  onClick={handleSendRegister}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-[var(--button-bg)] dark:text-[var(--button-text)] dark:hover:bg-[var(--button-hover-bg)] transition-colors"
                >
                  Register
                </button>
              </div>
              <div>
                <button onClick={handleForgotPassword}>
                  <p className="text-blue-600 hover:text-blue-700 dark:text-[var(--foreground)] dark:hover:text-[var(--button-hover-bg)]">
                    Forgot your password?
                  </p>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
