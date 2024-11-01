"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LogoutButton from "@/components/LogoutButton";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();
  const {isAuthenticated} = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      router.push("/auth/login");
    } else {
      console.log("Registration Failed");
    }
  };

  function handleSendLogin() {
    router.push("/auth/login");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 space-y-5">
      <h1 className="text-3xl font-bold">Welcome!</h1>

      <div className="bg-gray-300 p-8 rounded-lg shadow-lg max-w-md w-full space-y-5">
      <h1 className="text-3xl font-semibold text-center mb-6">Register</h1>

    { isAuthenticated ? 
    <div className="flex flex-col items-center justify-between space-y-5"> 
      <LogoutButton />
    </div>
    :
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col items-center justify-between space-y-5">
          <input 
          type="text" 
          placeholder="Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          className="border-b border-gray-900 p-2 w-full text-lg bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none  focus:ring-sky-500 rounded-md"
          />
          <input 
          type="email" 
          placeholder="Email" 
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="border-b border-gray-900 p-2 w-full text-lg bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none  focus:ring-sky-500 rounded-md"
          />
          <input 
          type="password" 
          placeholder="Password" 
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="border-b border-gray-900 p-2 w-full text-lg bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none  focus:ring-sky-500 rounded-md"
          />
          <button 
          type="submit"
          className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700"
          >
          Register</button>
        </div>
    </form>
    
    <div className="flex flex-col space-y-5 mt-4">
            <div className="flex items-center justify-between space-x-5">
                <p>Do you hava an account?</p> 
                <button onClick={handleSendLogin} className="bg-sky-600 text-white px-4 rounded-lg hover:bg-sky-700 transition-colors"
                >Login</button>
            </div>
            </div>
            </>
      }
    </div>
    </div>
  );
}
