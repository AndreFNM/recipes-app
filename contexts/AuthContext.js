"use client";

import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);

    const login = async (email, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include', 
        });
        if (res.ok) {
            await checkAuth();
            return true; 
        } else {
            return false; 
        }
    };
    

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'GET', credentials: 'include' });
        setIsAuthenticated(false);
        setUserId(null);
    };

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/check', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setIsAuthenticated(true);
                setUserId(data.userId);
            } else {
                setIsAuthenticated(false);
                setUserId(null);
            }
        } catch (error) {
            console.error("Error checking auth status:", error);
            setIsAuthenticated(false);
            setUserId(null);
        }
    };
    

    useEffect(() => {
        checkAuth();
    }, []);
    

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, userId }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
