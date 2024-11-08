"use client";

import { useState, useEffect } from "react";
import ImageUpload from "./ImageUpload";
import Image from 'next/image';


export default function EditUserForm() {
    const [user, setUser] = useState({});
    const [name, setName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [error, setError] = useState(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordUpdateMessage, setPasswordUpdateMessage] = useState('');

    useEffect(() => {
        fetch("/api/profile")
            .then((response) => {
                if (!response.ok) throw new Error("Error searching for user");
                return response.json();
            })
            .then((data) => {
                setUser(data);
                setName(data.name);
                setImageUrl(data.image);
            })
            .catch((error) => {
                console.error("Error searching for user:", error);
                setError(error.message);
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append("name", name);
        if (imageUrl) formData.append("image", imageUrl); 
    
        try {
            const response = await fetch("/api/profile", {
                method: 'PATCH',
                body: formData,
                credentials: "include",
            });
    
            if (response.ok) {
                console.log('User updated successfully');
                const updatedUser = await response.json();
                setUser(updatedUser);
                setError(null);
            } else {
                const errorData = await response.json();
                console.error('Failed to update user data:', errorData);
                setError(errorData.error || 'Failed to update user data');
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setError(error.message);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        const res = await fetch("/api/auth/update-password", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        if (res.ok) {
            setPasswordUpdateMessage("Password updated successfully");
            setCurrentPassword('');
            setNewPassword('');
        } else {
            const errorData = await res.json();
            setPasswordUpdateMessage(errorData.error || "Failed to update password");
        }
    };
    

    return (
        <div className="max-w-3xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700">Edit User Details</h2>
            <div className="bg-gray-200 p-8 rounded-lg shadow-lg">
                {error && <p className="text-red-500">Error: {error}</p>}
                {user && (
                    <>
                        <h1>Your Email: {user.email}</h1>
                        {user.image && (
                            <Image
                             src={user.image}
                              alt={user.name}
                              width={64} 
                              height={64}
                               className="rounded-full mt-4"
                                />
                        )}

                        <div className="space-y-2">
                            <label htmlFor="title" className="block text-gray-600">User Name</label>
                            <input
                                type="text"
                                id="title"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <ImageUpload setImageUrl={setImageUrl} /> 
                        <button
                            onClick={handleSubmit}
                            className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Submit
                        </button>
                    </>
                )}
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
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
                        Update Password
                    </button>
                </form>
                {passwordUpdateMessage && (
                    <p className="mt-2 text-red-500">{passwordUpdateMessage}</p>
                )}
            </div>
        </div>
    );
}
