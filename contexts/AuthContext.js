"use client";

import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = async (email, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include', 
        });
        if (res.ok) {
            setIsAuthenticated(true);
            return true; 
        } else {
            return false; 
        }
    };
    

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'GET', credentials: 'include' });
        setIsAuthenticated(false);
    };
    

    useEffect(() => {
        const checkAuth = async () => {
            const res = await fetch('/api/auth/check', { credentials: 'include' });
            console.log("Auth check:", res.ok); 
            setIsAuthenticated(res.ok);
        };
        checkAuth();
    }, []);
    

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
