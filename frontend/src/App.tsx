// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';

// A special component that checks if the user is authenticated.
// If they are NOT logged in, it redirects them to '/auth'
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { token } = useAuth();
    if (!token) {
        return <Navigate to="/auth" replace />;
    }
    return <>{children}</>;
}

// A special component that prevents logged-in users from seeing the Auth page again.
// If they are logged in, it redirects them to the '/dashboard'
function PublicRoute({ children }: { children: React.ReactNode }) {
    const { token } = useAuth();
    if (token) {
        return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public route for Auth Page */}
            <Route 
                path="/auth" 
                element={
                    <PublicRoute>
                        <AuthPage />
                    </PublicRoute>
                } 
            />

            {/* Protected route for Dashboard */}
            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } 
            />

            {/* Protected route for Analysis Results */}
            <Route 
                path="/analysis/:id" 
                element={
                    <ProtectedRoute>
                        <Analysis />
                    </ProtectedRoute>
                } 
            />

            {/* Fallback route: redirects anything else to /dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        // 1. Wrap the entire application in the Auth state provider
        <AuthProvider>
            {/* 2. Enable browser routing capabilities */}
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}
