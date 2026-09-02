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
            
        } catch (err: any) {
            // Display any error sent by the backend (e.g. "Email already in use")
            setError(err.message);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] text-gray-900">
            
            {/* The form container */}
            <div className="bg-white border border-gray-100 p-10 rounded-3xl shadow-sm w-full max-w-md">
                
                {/* Logo / Icon Area */}
                <div className="flex justify-center mb-6">
                    <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-sm">
                        I
                    </div>
                </div>

                {/* Dynamic Title */}
                <h1 className="text-3xl font-extrabold text-center mb-2 text-gray-900">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-center text-gray-500 mb-8 font-medium">
                    {isLogin ? 'Enter your details to access your dashboard.' : 'Sign up to start practicing.'}
                </p>
                
                {/* Error message display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm text-center font-medium">
                        {error}
                    </div>
                )}
                
                {/* The Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    
                    {/* Show Name field ONLY if the user is registering */}
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Name</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all font-medium"
                                placeholder="John Doe"
                                required 
                            />
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all font-medium"
                            placeholder="you@example.com"
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all font-medium"
                            placeholder="••••••••"
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl mt-4 transition-all shadow-sm hover:-translate-y-0.5">
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                </form>

                {/* The Toggle Button */}
                <p className="text-center text-sm text-gray-500 mt-8 font-medium">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        type="button"
                        onClick={() => setIsLogin(!isLogin)} 
                        className="text-gray-900 hover:text-gray-900 font-bold hover:underline underline-offset-4 transition-all"
                    >
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </p>
            </div>
        </div>
    );
}
