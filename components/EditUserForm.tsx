"use client";

import { useState, useEffect, FormEvent } from "react";

interface User{
    name: string;
    email: string;
}

export default function EditUserForm(): JSX.Element {
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [passwordUpdateMessage, setPasswordUpdateMessage] = useState<string>('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch("/api/profile", { credentials: 'include' });
                if (!response.ok) throw new Error("Error fetching user data");

                const data: User = await response.json();
                setUser(data);
                setName(data.name);
                setError(null);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setError((error as Error).message);
            }
        };
        fetchUserData();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData();
        formData.append("name", name);

        try {
            const response = await fetch("/api/profile", {
                method: 'PATCH',
                body: formData,
                credentials: "include",
            });

            if (response.ok) {
                const updatedUser: User = await response.json();
                setUser(updatedUser);
                setError(null);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to update user data');
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setError((error as Error).message);
        }
    };

    const handlePasswordUpdate = async (e: FormEvent) => {
        e.preventDefault();
        setPasswordUpdateMessage('');

        try {
            const res = await fetch("/api/auth/update-password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
                credentials: "include",
            });

            if (res.ok) {
                setPasswordUpdateMessage("Password updated successfully");
                setCurrentPassword('');
                setNewPassword('');
            } else {
                const errorData = await res.json();
                setPasswordUpdateMessage(errorData.error || "Failed to update password");
            }
        } catch (error) {
            console.error("Error updating password:", error);
            setPasswordUpdateMessage("An error occurred while updating the password.");
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700">Edit User Details</h2>
          <div className="bg-gray-200 p-8 rounded-lg shadow-lg">
            {error && <p className="text-red-500">Error: {error}</p>}
    
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <h1 className="text-gray-600 text-lg">Your Email: {user?.email}</h1>
              </div>
    
              <div className="space-y-2">
                <label htmlFor="name" className="block text-gray-600">
                  User Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Submit
              </button>
            </form>
          </div>
    
          <div className="bg-gray-200 p-8 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Change Password</h3>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2 border rounded-md border-gray-300"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded-md border-gray-300"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Update Password
              </button>
            </form>
            {passwordUpdateMessage && (
              <p
                className={`mt-2 ${
                  passwordUpdateMessage.includes("successfully") ? "text-green-500" : "text-red-500"
                }`}
              >
                {passwordUpdateMessage}
              </p>
            )}
          </div>
        </div>
      );
    }