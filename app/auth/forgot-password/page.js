"use client";
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage('Check your email for reset instructions.');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 space-y-5'>
      <h1 className="text-3xl font-bold">Forgot Password</h1>
      <div className="bg-gray-300 p-8 rounded-lg shadow-lg max-w-md space-y-5">
        {message ? <p>{message}</p> : (
            <form onSubmit={handleForgotPassword}>
            <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-b border-gray-900 p-2 w-full text-lg bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none  focus:ring-sky-500 rounded-md"
            />
            <div className="flex flex-col space-y-5 mt-4">
            <div className="flex items-center justify-between space-x-5">
            <button 
            type="submit"
            className="bg-sky-600 text-white px-4 rounded-lg hover:bg-sky-700 transition-colors"
            >Send Reset Link</button>
                </div>
            </div>
            {error && <p>{error}</p>}
            </form>
        )}
        
      </div>
    </div>
  );
}
