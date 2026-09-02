// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import InterviewSetup from './pages/InterviewSetup';
import InterviewRoom from './pages/InterviewRoom';
import InterviewScorecard from './pages/InterviewScorecard';
import History from './pages/History';
import CoverLetterGenerator from './pages/CoverLetterGenerator';
import Layout from './components/Layout';


// A special component that checks if the user is authenticated.
// If they are NOT logged in, it redirects them to '/auth'
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { token } = useAuth();
    if (!token) {
        return <Navigate to="/auth" replace />;
    }
    return <Layout>{children}</Layout>;
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

            <Route 
                path="/interview/setup" 
                element={
                    <ProtectedRoute>
                        <InterviewSetup />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/interview/:id" 
                element={
                    <ProtectedRoute>
                        <InterviewRoom />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/interview/:id/scorecard" 
                element={
                    <ProtectedRoute>
                        <InterviewScorecard />
                    </ProtectedRoute>
                } 
            />

            <Route 
                path="/history" 
                element={
                    <ProtectedRoute>
                        <History />
                    </ProtectedRoute>
                } 
            />

            <Route 
                path="/cover-letter" 
                element={
                    <ProtectedRoute>
                        <CoverLetterGenerator />
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
