// frontend/src/pages/Auth.tsx
import React, { useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
    // State to toggle between the 'Login' and 'Register' views
    const [isLogin, setIsLogin] = useState(true);
    
    // State to store what the user types into the form
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    // We grab the global 'login' function we created in AuthContext!
    const { login } = useAuth(); 

    // This runs when the user clicks 'Log In' or 'Sign Up'
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Stop the page from refreshing
        setError(''); // Clear any previous error messages

        try {
            // Determine which backend route to hit
            const endpoint = isLogin ? 'auth/login' : 'auth/register';
            // Determine what data to send (we don't need 'name' for login)
            const body = isLogin ? { email, password } : { email, password, name };
            
            // Send the request using our custom api.ts helper
            const data = await apiFetch(endpoint, {
                method: 'POST',
                body: JSON.stringify(body)
            });

            // On success, we update the global React state and save the token!
            login(data.user, data.accessToken);
            
            // Usually we would redirect to the dashboard here, but we will add routing in Step 3!

        } catch (err: any) {
            // Display any error sent by the backend (e.g. "Email already in use")
            setError(err.message);
        }
    }

    return (
        // A full-screen container with a sleek, dark gradient background
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-indigo-950 to-black text-white">
            
            {/* The Glassmorphism card container */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-md">
                
                {/* Dynamic Title */}
                <h1 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-indigo-400">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                
                {/* Error message display */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}
                
                {/* The Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    
                    {/* Show Name field ONLY if the user is registering */}
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">Name</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                placeholder="John Doe"
                                required 
                            />
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            placeholder="you@example.com"
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            placeholder="••••••••"
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl mt-2 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)]">
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                </form>

                {/* The Toggle Button */}
                <p className="text-center text-sm text-gray-400 mt-6">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        type="button"
                        onClick={() => setIsLogin(!isLogin)} 
                        className="text-purple-400 hover:text-purple-300 font-medium hover:underline underline-offset-4 transition-all"
                    >
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </p>
            </div>
        </div>
    );
}
