"use client";
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage('Password reset successfully.');
        router.push('/auth/login');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div className='mt-24'>
      <h1>Reset Password</h1>
      {message ? <p>{message}</p> : (
        <form onSubmit={handleResetPassword}>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button type="submit">Reset Password</button>
          {error && <p>{error}</p>}
        </form>
      )}
    </div>
  );
}
