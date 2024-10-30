"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        localStorage.setItem("token", data.token); 
        console.log("Token stored in localStorage:", data.token);
        router.push("/");
      } else {
        console.error("Login failed:", data.error);
      }
    } catch (error) {
      console.error("An error happened:", error);
    }
  };
  

  return (
    <div className="flex items-center justify-center h-screen">
        <div className="bg-gray-200 p-8 rounded-lg shadow-lg">
    <form onSubmit={handleSubmit}>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
    </div>
    </div>
  );
}
