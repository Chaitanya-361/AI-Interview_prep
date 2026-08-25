import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
    id: string;
    email: string;
    name: string;
    role: string;
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is the Provider component that will wrap our entire app
export function AuthProvider({ children }: { children: React.ReactNode }) {
    // State to hold the current user and their token
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    // useEffect runs once when the app first loads. 
    // It checks localStorage to see if the user was already logged in from a previous visit!
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);
    // Function to call when a user successfully logs in or registers
    const login = (userData: User, jwtToken: string) => {
        setUser(userData);
        setToken(jwtToken);
        // We save the token and user to localStorage so they stay logged in even if they refresh the page
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };
    // Function to call when a user clicks 'Log out'
    const logout = () => {
        setUser(null);
        setToken(null);
        // We wipe their data from localStorage for security
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };
    // We provide the state and functions to any child component that asks for them
    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
// A custom hook so components can easily say: const { user, logout } = useAuth();
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}